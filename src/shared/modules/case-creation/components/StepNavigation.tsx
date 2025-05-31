import { FORM_DEFAULTS } from "@/mock/genderData";
import { FormProvider, useAPIFormsData } from "@/providers/FormContext";
import Button from "@/shared/components/button";
import { ReactNode } from "react";
import { FieldValues, UseFormHandleSubmit } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";

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
}: StepNavigationProps<T>) => {
  const { t } = useTranslation("stepper");
  const navigate = useNavigate();
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const caseId = query.get("caseId");

  // Correctly extract needed form methods and helpers
  const {
    clearErrors: handleRemoveValidation,
  } = useAPIFormsData();

  const isPassedVerifiedInput =
    typeof isVerifiedInput === "object"
      ? Object.values(isVerifiedInput).every(Boolean)
      : isVerifiedInput;

  const isNextEnabled =
    isValid && isPassedVerifiedInput && !isButtonDisabled?.("next");

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

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {currentStep === 0 && (
        <p className="text-secondary-700 semibold">
          {t("formWrapper.description")}{" "}
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
            onClick={resetSteps}
        >
          {t("cancel")}
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
              {t("previous")}
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
              {t("save")}
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
            {isLastStep ? t("submit") : t("next")}
          </Button>
        </div>
        </div>
      )}

      {!showFooterBtn && (
        <div className="flex justify-between mt-4 border-t pb-6 pt-4 border-t-gray-300 w-full">
          <Button
            variant="secondary"
            typeVariant="outline"
            onClick={handleMyCases}
          >
            {t("go_to_my_case")}
          </Button>

          <Button
            isLoading={isSaveLoading}
            variant="primary"
            typeVariant="outline"
            onClick={handleSave}
            disabled={!canProceed}
          >
            {t("save")}
          </Button>
        </div>
      )}
    </form>
  );
};

export default StepNavigation;
