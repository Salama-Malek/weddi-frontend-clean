import { FORM_DEFAULTS } from "@/mock/genderData";
import { FormProvider, useAPIFormsData } from "@/providers/FormContext";
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

  // Correctly extract needed form methods and helpers
  const { clearErrors: handleRemoveValidation, formState: { errors } } = useAPIFormsData();

  const isPassedVerifiedInput =
    typeof isVerifiedInput === "object"
      ? Object.values(isVerifiedInput).every(Boolean)
      : isVerifiedInput;

  // console.log("StepNavigation Debug:", {
  //   isLastStep,
  //   canProceed,
  //   isValid,
  //   isPassedVerifiedInput,
  //   isButtonDisabled: isButtonDisabled?.("next"),
  //   formErrors: errors
  // });

  const isNextEnabled =
    isLastStep
      ? canProceed
      : isValid && isPassedVerifiedInput && !isButtonDisabled?.("next") && !isFormSubmitting;

  const isSaveLoading =
    actionButtonName === "Save" && isFormSubmitting && (isLoading ?? true);
  const isNextLoading =
    actionButtonName === "Next" && isFormSubmitting && (isLoading ?? true);

  const handleSaveClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!handleSave || isFormSubmitting) return;

    try {
      const response = await handleSave() as ApiResponse;

      // Check for errors in response, filtering out empty error objects
      const validErrors = response?.ErrorCodeList?.filter(
        (element: any) => element.ErrorCode || element.ErrorDesc
      ) || [];

      if (validErrors.length > 0) {
        // Errors are now handled by the central handler, just prevent success toast.
        return;
      }

      // Only show success if no *valid* errors
      if (response?.SuccessCode === "200") {
        handleRemoveValidation?.();
        toast.success(tStepper("save_success"));
      }
    } catch (error: any) {
      toast.error(tStepper("save_error"));
    }
  };

  const handleMyCases = () => {
    navigate(`/manage-hearings/${caseId}`);
  };

  const handleCancel = async () => {
    // Get caseId from URL or cookie
    const caseIdToCancel = caseId || getCookie("caseId");
    
    // If no caseId exists or we're in the first step, navigate directly
    if (!caseIdToCancel || (currentStep === 0 && currentTab === 0)) {
      navigate("/");
      return;
    }

    // Show cancel confirmation modal only if we have a caseId and we're not in the first step
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

      // Use centralized error handling to check if response is successful
      const isSuccessful = !hasErrors(response) && (response?.SuccessCode === "200" || response?.ServiceStatus === "Success");

      if (isSuccessful) {
        // Clear case related cookies
        console.log("response", response);
        
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
      {showFooterBtn && (
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
                variant={isNextEnabled ? "secondary" : "disabled"}
                typeVariant={isNextEnabled ? "outline" : "freeze"}
                onClick={handleSaveClick}
                disabled={!isNextEnabled || isFormSubmitting}
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

      {currentStep === 2 && (
        <div className="flex justify-between mt-4 border-t pb-6 pt-4 border-t-gray-300 w-full">
          <Button
            type="button"
            variant="secondary"
            typeVariant="outline"
            onClick={handleMyCases}
          >
            {tStepper("go_to_my_case")}
          </Button>

          <Button
            type="button"
            isLoading={isSaveLoading}
            variant={isNextEnabled ? "primary" : "disabled"}
            typeVariant={isNextEnabled ? "outline" : "freeze"}
            onClick={handleSave}
            disabled={!isNextEnabled}
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


      {!showFooterBtn && (
        <div className="flex justify-between mt-4 border-t pb-6 pt-4 border-t-gray-300 w-full">
          <Button
            variant="secondary"
            typeVariant="outline"
            onClick={handleMyCases}
          >
            {tStepper("go_to_my_case")}
          </Button>


          <Button
            isLoading={isSaveLoading}
            variant={isNextEnabled ? "primary" : "disabled"}
            typeVariant={isNextEnabled ? "outline" : "freeze"}
            onClick={handleSave}
            disabled={!isNextEnabled}
          >
            {tStepper("save")}
          </Button>
        </div>
      )}
    </form>
  );
};

export default StepNavigation;
