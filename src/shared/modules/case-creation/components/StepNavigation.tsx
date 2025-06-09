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

interface ApiResponse {
  ServiceStatus: string;
  ErrorCodeList: Array<{ ErrorCode: string; ErrorDesc: string }>;
}

interface StepNavigationProps<T extends FieldValues> {
  isFirstStep?: boolean;
  isLastStep?: boolean;
  goToNextStep?: () => void;
  goToPrevStep?: () => void;
  resetSteps?: () => void;
  handleSave?: () => void;
  isButtonDisabled?: (direction: "prev" | "next") => boolean;
  onSubmit?: ReturnType<UseFormHandleSubmit<T>>;
  children?: ReactNode;
  isValid?: boolean;
  currentStep?: number;
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

  // Correctly extract needed form methods and helpers
  const { clearErrors: handleRemoveValidation } = useAPIFormsData();

  const isPassedVerifiedInput =
    typeof isVerifiedInput === "object"
      ? Object.values(isVerifiedInput).every(Boolean)
      : isVerifiedInput;

  const isNextEnabled =
     isLastStep
      ? canProceed
      : isValid && isPassedVerifiedInput && !isButtonDisabled?.("next");

      const isSaveLoading =
    actionButtonName === "Save" && isFormSubmitting && (isLoading ?? true);
  const isNextLoading =
    actionButtonName === "Next" && isFormSubmitting && (isLoading ?? true);

  const handleSaveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    handleSave?.();
    handleRemoveValidation?.();
  };

  const handleMyCases = () => {
    navigate(`/manage-hearings/${caseId}`);
  };

  const handleCancel = async () => {
    // Get caseId from URL or cookie
    const caseIdToCancel = caseId || getCookie("caseId");
    
    if (!caseIdToCancel) {
      // If no caseId exists, navigate directly without showing modal
      navigate("/");
      return;
    }

    // Show cancel confirmation modal only if we have a caseId
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    try {
      // Get caseId from URL or cookie
      const caseIdToCancel = caseId || getCookie("caseId");
      
      if (!caseIdToCancel) {
        // If no caseId exists, just navigate back without showing error
        navigate("/");
        return;
      }

      const response = await resolveCase({
        CaseID: caseIdToCancel,
        AcceptedLanguage: i18n.language.toUpperCase(),
        SourceSystem: "E-Services",
        ResolveStatus: "Resolved-Request Cancelled",
      }).unwrap() as ApiResponse;

      if (response.ServiceStatus === "Success" && response.ErrorCodeList.length === 0) {
        // Clear case related cookies
        removeCookie("caseId");
        removeCookie("incompleteCaseMessage");
        removeCookie("incompleteCaseNumber");
        removeCookie("incompleteCase");

        toast.success(tManageHearing("cancel_success"));
        navigate("/");
      } else {
        toast.error(tManageHearing("cancel_error"));
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
          {tStepper("formWrapper.description")}{" "}
          {!showFooterBtn && (
            <span className="text-primary-700">({caseId})</span>
          )}
        </p>
      )}

      {children}

      {/* Footer Buttons */}
      {showFooterBtn && (
        <div className="flex justify-between mt-4 border-t pb-6 pt-4 border-t-gray-300 w-full">
          <Button
            variant="secondary"
            typeVariant="outline"
            onClick={handleCancel}
            disabled={isCancelling}
          >
            {tStepper("cancel")}
          </Button>

          <div className="flex gap-4">
            {!isFirstStep && (
              <Button
                type="button"
                variant={isButtonDisabled?.("prev") ? "disabled" : "secondary"}
                typeVariant={isButtonDisabled?.("prev") ? "freeze" : "outline"}
                onClick={goToPrevStep}
                disabled={isButtonDisabled?.("prev")}
              >
                {tStepper("previous")}
              </Button>
            )}

            {!isFirstStep && (
              <Button
                type="button"
                isLoading={isSaveLoading}
                variant="secondary"
                typeVariant="outline"
                onClick={handleSaveClick}
              >
                {tStepper("save")}
              </Button>
            )}

            <Button
              type="submit"
              isLoading={isNextLoading}
              onClick={goToNextStep}
              variant={isNextEnabled ? "primary" : "disabled"}
              typeVariant={isNextEnabled ? "solid" : "freeze"}
              disabled={!isNextEnabled}
            >
              {isLastStep ? tStepper("submit") : tStepper("next")}
            </Button>
          </div>
        </div>
      )}

      {currentStep === 2 && (
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
            variant="primary"
            typeVariant="outline"
            onClick={handleSave}
            disabled={!canProceed}
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
            <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
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
    </form>
  );
};

export default StepNavigation;
