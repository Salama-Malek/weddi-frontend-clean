import { useAPIFormsData } from "@/providers/FormContext";
import Button from "@/shared/components/button";
import { ReactNode, useState } from "react";
import { FieldValues, UseFormHandleSubmit } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { useResolveCaseMutation } from "@/features/manage-hearings/services/hearingActionsService";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { toast } from "react-toastify";
import Modal from "@/shared/components/modal/Modal";
import { useApiErrorHandler } from "@/shared/hooks/useApiErrorHandler";

export interface ApiResponse {
  ServiceStatus: string;
  SuccessCode: string;
  CaseNumber?: string;
  S2Cservicelink?: string;
  ErrorDescription?: string;
  ErrorCodeList: Array<{ ErrorCode: string; ErrorDesc: string }>;
}

interface StepNavigationProps<T extends FieldValues> {
  isFirstStep?: boolean;
  isLastStep?: boolean;
  goToNextStep?: () => void;
  goToPrevStep?: () => void;
  resetSteps?: () => void;
  handleSave?: () => Promise<ApiResponse>;
  isButtonDisabled?: (direction: "prev" | "next") => boolean;
  onSubmit?: ReturnType<UseFormHandleSubmit<T>>;
  children?: ReactNode;
  isValid?: boolean;
  currentStep?: number;
  currentTab?: number;
  isLoading?: boolean;
  lastAction?: "Save" | "Next" | null;
  isVerifiedInput?: boolean | Record<string, boolean>;
  isFormSubmitting?: boolean;
  actionButtonName?: string;
  showFooterBtn?: boolean;
  canProceed?: boolean;
  isSubmitButtonDisabled?: boolean;
}

const StepNavigation = <T extends FieldValues>({
  isFirstStep,
  isLastStep,
  goToNextStep,
  goToPrevStep,
  resetSteps,
  handleSave,
  isButtonDisabled,
  onSubmit,
  children,
  isValid,
  currentStep,
  currentTab,
  isLoading,
  lastAction,
  isVerifiedInput = true,
  isFormSubmitting,
  actionButtonName = "",
  showFooterBtn = true,
  canProceed,
  isSubmitButtonDisabled,
}: StepNavigationProps<T>) => {
  const { t: tStepper, i18n } = useTranslation("stepper");
  const { t: tManageHearing } = useTranslation("manageHearingDetails");
  const navigate = useNavigate();
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const caseId = query.get("caseId");
  const [resolveCase] = useResolveCaseMutation();
  const [getCookie, setCookie, removeCookie] = useCookieState();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const { hasErrors } = useApiErrorHandler();

  const { clearErrors: handleRemoveValidation, formState: { errors } } = useAPIFormsData();

  const isPassedVerifiedInput =
    typeof isVerifiedInput === "object"
      ? Object.values(isVerifiedInput).every(Boolean)
      : isVerifiedInput;

  const isNextEnabled =
    isLastStep
      ? canProceed && isValid
      : isValid && isPassedVerifiedInput && !isButtonDisabled?.("next") && !isFormSubmitting;

  // Save button should be disabled when there are no case topics (canProceed is false)
  // But only for edit cases (when showFooterBtn is false), not for case creation
  const isSaveEnabled = showFooterBtn 
    ? isNextEnabled // Case creation: use normal logic
    : (canProceed !== false ? isNextEnabled : false); // Edit case: check canProceed

  // console.log("[🔍 STEP NAVIGATION] Save button logic:", {
  //   showFooterBtn,
  //   canProceed,
  //   isNextEnabled,
  //   isSaveEnabled,
  //   isEditCase: !showFooterBtn,
  //   isValid,
  //   isPassedVerifiedInput,
  //   isFormSubmitting,
  //   isLastStep
  // });

  const isSaveLoading =
    actionButtonName === "Save" && isFormSubmitting && (isLoading ?? true);
  const isNextLoading =
    actionButtonName === "Next" && isFormSubmitting && (isLoading ?? true);

  const handleSaveClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // Prevent multiple rapid save calls
    if (!handleSave || isFormSubmitting) return;

    console.log("[🔍 STEP NAVIGATION] Save button clicked - starting save operation");
    
    try {
      const response = await handleSave() as ApiResponse;

      console.log("[🔍 STEP NAVIGATION] Save operation completed, response:", response);

      const validErrors = response?.ErrorCodeList?.filter(
        (element: any) => element.ErrorCode || element.ErrorDesc
      ) || [];

      if (validErrors.length > 0) {
        // Show validation error toasts based on API response
        validErrors.forEach((error: any) => {
          toast.error(error.ErrorDesc || "Validation error");
        });
        return;
      }

                     // More robust success condition - prioritize ServiceStatus when SuccessCode is not present
        const hasSuccessCode = response?.SuccessCode === "200";
        const hasSuccessStatus = response?.ServiceStatus === "Success";
        const hasNoErrors = !response?.ErrorCodeList || response.ErrorCodeList.length === 0;
        
        // Check if errors are just warnings (non-blocking)
        const hasOnlyWarnings = response?.ErrorCodeList?.every((error: any) => 
          error.ErrorCode?.startsWith('W') || error.ErrorDesc?.toLowerCase().includes('warning')
        );
        
        const isSuccessful = (hasSuccessStatus && (hasNoErrors || hasOnlyWarnings)) || (hasSuccessCode && (hasNoErrors || hasOnlyWarnings));
        
        if (isSuccessful) {
          console.log("[StepNavigation] API call confirmed successful, showing success toast");
          handleRemoveValidation?.();
          toast.success(tStepper("save_success"));
        } else if (response?.SuccessCode === "IN_PROGRESS") {
          console.log("[StepNavigation] Operation in progress, not showing any toast");
          // Don't show any toast when operation is in progress
        } else {
          console.log("[StepNavigation] API response not successful, not showing success toast:", {
            SuccessCode: response?.SuccessCode,
            ServiceStatus: response?.ServiceStatus,
            ErrorCodeList: response?.ErrorCodeList,
            isSuccessful,
            hasNoErrors,
            hasOnlyWarnings
          });
          
          // Log the actual error details for debugging
          if (response?.ErrorCodeList?.length > 0) {
            console.log("[StepNavigation] Error details:", response.ErrorCodeList);
          }
        }
    } catch (error: any) {
      console.error("[StepNavigation] Save error:", error);
      // Show error toast based on the actual error from API
      const errorMessage = error?.data?.ErrorDetails?.[0]?.ErrorDesc || 
                          error?.data?.ErrorDescription || 
                          error?.message || 
                          tStepper("save_error");
      toast.error(errorMessage);
    }
  };

  const handleMyCases = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("[🔍 GO TO MY CASES] Navigating to manage-hearings, caseId:", caseId);
    navigate(`/manage-hearings/${caseId}`);
  };

  const handleCancel = async () => {
    const caseIdToCancel = caseId || getCookie("caseId");
    
    if (!caseIdToCancel || (currentStep === 0 && currentTab === 0)) {
      navigate("/");
      return;
    }

    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    try {
      const caseIdToCancel = caseId || getCookie("caseId");

      if (!caseIdToCancel) {
        navigate("/");
        return;
      }

      const response = await resolveCase({
        CaseID: caseIdToCancel,
        AcceptedLanguage: i18n.language.toUpperCase(),
        SourceSystem: "E-services",
        ResolveStatus: "Resolved-Request Cancelled",
      }).unwrap() as ApiResponse;

      const isSuccessful = !hasErrors(response) && (response?.SuccessCode === "200" || response?.ServiceStatus === "Success");

      if (isSuccessful) {
        removeCookie("caseId");
        removeCookie("incompleteCaseMessage");
        removeCookie("incompleteCaseNumber");
        removeCookie("incompleteCase");

        toast.success(tManageHearing("cancel_success"));
        navigate("/");
      }
    } catch (error) {
      toast.error(tManageHearing("cancel_error"));
    } finally {
      setIsCancelling(false);
      setShowCancelModal(false);
    }
  };

  // console.log("[🔍 STEP NAVIGATION] Rendering with showFooterBtn:", showFooterBtn, "currentStep:", currentStep);
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {currentStep === 0 && (
        <p className="text-secondary-700 semibold">
          {showFooterBtn && (
            <span>{tStepper("formWrapper.description")}{" "}</span>
          )}

          {!showFooterBtn && (
            <span className="text-primary-700">({caseId})</span>
          )}
        </p>
      )}

      {children}

      {/* Footer Buttons */}
      {(() => {
        // console.log("[🔍 STEP NAVIGATION] Main footer condition:", { showFooterBtn, currentStep, shouldShow: showFooterBtn && currentStep !== 2 });
        return showFooterBtn && currentStep !== 2;
      })() && (
        <div className="flex flex-wrap justify-between gap-4 mt-4 border-t pb-6 pt-4 border-t-gray-300 w-full">
          <Button
            type="button"
            variant="secondary"
            typeVariant="outline"
            onClick={handleCancel}
            disabled={isCancelling || isFormSubmitting}
          >
            {tStepper("cancel")}
          </Button>

          <div className="flex gap-3">
            {!isFirstStep && (
              <Button
                type="button"
                variant={isButtonDisabled?.("prev") ? "disabled" : "secondary"}
                typeVariant={isButtonDisabled?.("prev") ? "freeze" : "outline"}
                onClick={goToPrevStep}
                disabled={isButtonDisabled?.("prev") || isFormSubmitting}
              >
                {tStepper("previous")}
              </Button>
            )}

            {!isFirstStep && (
              <Button
                type="button"
                isLoading={isSaveLoading}
                variant={isSaveEnabled ? "secondary" : "disabled"}
                typeVariant={isSaveEnabled ? "outline" : "freeze"}
                onClick={handleSaveClick}
                disabled={!isSaveEnabled || isFormSubmitting}
              >
                {tStepper("save")}
              </Button>
            )}

            <Button
              type="submit"
              isLoading={isNextLoading}
              variant={isNextEnabled ? "primary" : "disabled"}
              typeVariant={isNextEnabled ? "solid" : "freeze"}
              disabled={!isNextEnabled || isFormSubmitting}
            >
              {isLastStep ? tStepper("submit") : tStepper("next")}
            </Button>
          </div>
        </div>
      )}

      {(() => {
        // console.log("[🔍 STEP NAVIGATION] Step 2 footer condition:", { currentStep, shouldShow: currentStep === 2 });
        return currentStep === 2;
      })() && (
        <div className="flex justify-between mt-4 border-t pb-6 pt-4 border-t-gray-300 w-full">
          <Button
            type="button"
            variant="secondary"
            typeVariant="outline"
            onClick={(e) => handleMyCases(e)}
          >
            {tStepper("go_to_my_case")}
          </Button>

          <Button
            type="button"
            isLoading={isSaveLoading}
            variant={isSaveEnabled ? "primary" : "disabled"}
            typeVariant={isSaveEnabled ? "outline" : "freeze"}
            onClick={handleSaveClick}
            disabled={!isSaveEnabled || isFormSubmitting}
          >
            {tStepper("save")}
          </Button>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <Modal
          close={() => setShowCancelModal(false)}
          header={tManageHearing("cancel_the_case")}
          modalWidth={500}
        >
          <p className="text-sm text-gray-700">{tManageHearing("confirm_cancel_desc")}</p>
          <div className="flex justify-end gap-3 mt-6">
            <Button 
              variant="secondary" 
              onClick={() => setShowCancelModal(false)}
              disabled={isCancelling}
            >
              {tManageHearing("not")}
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmCancel}
              disabled={isCancelling}
            >
              {isCancelling ? tManageHearing("loading_spinner") : tManageHearing("yes")}
            </Button>
          </div>
        </Modal>
      )}


      {!showFooterBtn && currentStep !== 2 && (
        <div className="flex justify-between mt-4 border-t pb-6 pt-4 border-t-gray-300 w-full">
          <Button
            type="button"
            variant="secondary"
            typeVariant="outline"
            onClick={(e) => handleMyCases(e)}
          >
            {tStepper("go_to_my_case")}
          </Button>


          <Button
            type="button"
            isLoading={isSaveLoading}
            variant={isSaveEnabled ? "primary" : "disabled"}
            typeVariant={isSaveEnabled ? "outline" : "freeze"}
            onClick={handleSaveClick}
            disabled={!isSaveEnabled || isFormSubmitting}
          >
            {tStepper("save")}
          </Button>
        </div>
      )}
    </form>
  );
};

export default StepNavigation;
