import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { useResolveCaseMutation } from "@/features/manage-hearings/services/hearingActionsService";
import { useAPIFormsData } from "@/providers/FormContext";
import Button from "@/shared/components/button";
import Modal from "@/shared/components/modal/Modal";
import { useHomeNavigator } from "@/shared/components/navigation/HomeNavigator";
import { useApiErrorHandler } from "@/shared/hooks/useApiErrorHandler";
import { useClearCaseData } from "@/shared/hooks/useClearCaseData";
import { handleApiErrors } from "@/shared/lib/api/errorHandler";
import { ReactNode, useState } from "react";
import { FieldValues, UseFormHandleSubmit } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

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
  lastAction?: "Save" | "Next" | "Previous" | "MyCases" | null;
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
  goToPrevStep,
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
}: StepNavigationProps<T>) => {
  const { t: tStepper, i18n } = useTranslation("stepper");
  const { t: tManageHearing } = useTranslation("manageHearingDetails");
  const navigate = useNavigate();
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const caseId = query.get("caseId");
  const [resolveCase] = useResolveCaseMutation();
  const [getCookie] = useCookieState();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const { hasErrors } = useApiErrorHandler();
  const navigateToHome = useHomeNavigator();

  const { clearErrors: handleRemoveValidation, formState } = useAPIFormsData();

  const isPassedVerifiedInput =
    typeof isVerifiedInput === "object"
      ? Object.values(isVerifiedInput).every(Boolean)
      : isVerifiedInput;

  const isNextEnabled = isLastStep
    ? canProceed && isValid
    : isValid &&
      isPassedVerifiedInput &&
      !isButtonDisabled?.("next") &&
      !isFormSubmitting;

  const isSaveLoading =
    actionButtonName === "Save" && isFormSubmitting && (isLoading ?? true);
  const isNextLoading =
    actionButtonName === "Next" && isFormSubmitting && (isLoading ?? true);

  const handleSaveClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!handleSave || isFormSubmitting) return;

    try {
      const response = (await handleSave()) as ApiResponse;

      const hasSuccessCode = response?.SuccessCode === "200";
      const hasSuccessStatus = response?.ServiceStatus === "Success";
      const hasNoErrors =
        !response?.ErrorCodeList ||
        response.ErrorCodeList.every(
          (error) => !error.ErrorCode && !error.ErrorDesc
        );
      const isSuccessful = (hasSuccessStatus || hasSuccessCode) && hasNoErrors;

      if (isSuccessful) {
        formState.errors && handleRemoveValidation?.();
        const caseNumber = response?.CaseNumber || caseId;
        toast.success(tStepper("case_update_success", { caseNumber }));
      } else if (response?.SuccessCode === "IN_PROGRESS") {
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.ErrorDetails?.[0]?.ErrorDesc ||
        error?.data?.ErrorDescription ||
        error?.message ||
        tStepper("save_error");
      toast.error(errorMessage);
    }
  };

  const handleMyCases = () => {
    navigate(`/manage-hearings/${caseId}`);
  };

  const handleCancel = async () => {
    const caseIdToCancel = caseId || getCookie("caseId");

    if (!caseIdToCancel) {
      navigateToHome();
      return;
    }

    if (currentStep === 0 && currentTab === 0) {
      handleConfirmCancel();
      return;
    }

    setShowCancelModal(true);
  };

  const { clearCaseData } = useClearCaseData();

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    try {
      const caseIdToCancel = caseId || getCookie("caseId");

      if (!caseIdToCancel) {
        navigateToHome();
        return;
      }

      const response = (await resolveCase({
        CaseID: caseIdToCancel,
        AcceptedLanguage: i18n.language.toUpperCase(),
        SourceSystem: "E-services",
        ResolveStatus: "Resolved-Request Cancelled",
      }).unwrap()) as ApiResponse;

      const isSuccessful =
        !hasErrors(response) &&
        (response?.SuccessCode === "200" ||
          response?.ServiceStatus === "Success");

      if (isSuccessful) {
        clearCaseData();

        toast.success(tManageHearing("cancel_success"));

        setTimeout(() => {
          navigateToHome();
        }, 100);
      } else {
        handleApiErrors(response);
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
          {showFooterBtn && <span>{tStepper("formWrapper.description")} </span>}

          {!showFooterBtn && (
            <span className="text-primary-700">({caseId})</span>
          )}
        </p>
      )}

      {children}

      {}
      {showFooterBtn && currentStep !== 2 && (
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
                isLoading={isFormSubmitting && lastAction === "Previous"}
              >
                {isFormSubmitting && lastAction === "Previous"
                  ? tStepper("loading_previous")
                  : tStepper("previous")}
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
              isLoading={
                isNextLoading || (isFormSubmitting && lastAction === "Next")
              }
              variant={isNextEnabled ? "primary" : "disabled"}
              typeVariant={isNextEnabled ? "solid" : "freeze"}
              disabled={!isNextEnabled || isFormSubmitting}
            >
              {isFormSubmitting && lastAction === "Next"
                ? tStepper("loading_next")
                : isLastStep
                ? tStepper("submit")
                : tStepper("next")}
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
            disabled={isFormSubmitting}
            isLoading={isFormSubmitting && lastAction === "MyCases"}
          >
            {isFormSubmitting && lastAction === "MyCases"
              ? tStepper("loading_my_cases")
              : tStepper("go_to_my_case")}
          </Button>

          <Button
            type="button"
            isLoading={isSaveLoading}
            variant={isNextEnabled ? "primary" : "disabled"}
            typeVariant={isNextEnabled ? "outline" : "freeze"}
            onClick={handleSaveClick}
            disabled={!isNextEnabled || isFormSubmitting}
          >
            {tStepper("save")}
          </Button>
        </div>
      )}

      {}
      {showCancelModal && (
        <Modal
          close={() => setShowCancelModal(false)}
          header={tManageHearing("cancel_the_case")}
          modalWidth={500}
        >
          <p className="text-sm text-gray-700">
            {tManageHearing("confirm_cancel_desc")}
          </p>
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
              {isCancelling
                ? tManageHearing("loading_spinner")
                : tManageHearing("yes")}
            </Button>
          </div>
        </Modal>
      )}

      {!showFooterBtn && currentStep !== 2 && (
        <div className="flex justify-between mt-4 border-t pb-6 pt-4 border-t-gray-300 w-full">
          <Button
            variant="secondary"
            typeVariant="outline"
            onClick={handleMyCases}
            disabled={isFormSubmitting}
            isLoading={isFormSubmitting && lastAction === "MyCases"}
          >
            {isFormSubmitting && lastAction === "MyCases"
              ? tStepper("loading_my_cases")
              : tStepper("go_to_my_case")}
          </Button>

          <Button
            type="button"
            isLoading={isSaveLoading}
            variant={isNextEnabled ? "primary" : "disabled"}
            typeVariant={isNextEnabled ? "outline" : "freeze"}
            onClick={handleSaveClick}
            disabled={!isNextEnabled || isFormSubmitting}
          >
            {tStepper("save")}
          </Button>
        </div>
      )}
    </form>
  );
};

export default StepNavigation;
