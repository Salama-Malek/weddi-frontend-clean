import React, { useState } from "react";
import { SubmitHandler } from "react-hook-form";
import StepNavigation from "@/shared/modules/case-creation/components/StepNavigation";
import useCasesLogic from "@/features/initiate-hearing/hooks/useCasesLogic";
import { FormData } from "@/shared/components/form/form.types";
import { useAPIFormsData } from "@/providers/FormContext";
import { useSubmitFinalReviewMutation } from "@/features/initiate-hearing/api/create-case/apis";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import Modal from "@/shared/components/modal/Modal";
import Button from "@/shared/components/button";
import { useNavigate } from "react-router-dom";

export interface WithStepNavigationProps {
  register: any;
  errors: any;
  setValue: any;
  watch: any;
  control: any;
  trigger: any;
  isValid: boolean;
  setError: (name: string, error: any) => void;
  clearErrors: (name: string) => void;
  acknowledgements?: any[];
  selectedLanguage?: string;
  setAcknowledgements?: (acks: any[]) => void;
  setSelectedLanguage?: (lang: string) => void;
  setIsPhoneVerify?: React.Dispatch<React.SetStateAction<any>>;
}

const withStepNavigation = <P extends object>(
  WrappedComponent: React.ComponentType<P & WithStepNavigationProps>,
  p0?: { acknowledgements: any; selectedLanguage: any }
) => {
  const ComponentWithStepNavigation = (props: P & any) => {
    const {
      currentStep,
      currentTab,
      updateParams,
      handleNext,
      handlePrevious,
      handleSave,
      actionButtonName = "",
    } = useCasesLogic();

    const [isVerifiedInput, setIsPhoneVerify] = useState<boolean | undefined>();
    const [getCookie] = useCookieState();
    const { i18n } = useTranslation();
    const language = i18n.language === "ar" ? "AR" : "EN";

    const navigate = useNavigate();

    // Lifted state for acknowledgements & language selection
    const [acknowledgementsState, setAcknowledgementsState] = useState<any[]>([]);
    const [selectedLanguageState, setSelectedLanguageState] = useState<string>(language);

    // Extract form methods and states from FormContext
    const {
      formData,
      getValues,
      setFormData,
      register,
      handleSubmit,
      formState,
      setValue,
      watch,
      trigger,
      control,
      forceValidateForm,
      clearErrors,
      setError,
    } = useAPIFormsData();

    const { errors, isValid, isSubmitting: isFormSubmitting } = formState;

    const [submitFinalReview, { isLoading: isSubmitting }] = useSubmitFinalReviewMutation();

    const onSubmit: SubmitHandler<FormData> = async (data) => {
      try {
        const caseId = getCookie("caseId");
        if (currentStep === 2) {
          // Build acknowledgment list based on selected language
          const ackList = acknowledgementsState.map((item: any) => ({
            ElementKey: selectedLanguageState === "EN" ? "English" : "Arabic",
            ElementValue: item.ElementValue,
            Selected: "true",
          }));

          if (ackList.length !== 0) {
            const payload = {
              CaseID: caseId,
              Flow_CurrentScreen: "FinalReviewScreen",
              Language: selectedLanguageState,
              AckAggrements: ackList,
            };

            const response = await submitFinalReview(payload).unwrap();            
            if (response?.SuccessCode == "200") {
              // Show success toast
              toast.success("Submission successful!");

              // Open service link in new tab
              const serviceLink = response?.S2Cservicelink;
              if (serviceLink) {
                const caseSurveyLink = document.createElement("a");
                caseSurveyLink.href = serviceLink;
                caseSurveyLink.target = "_blank";
                caseSurveyLink.click();
              }
              
              // Navigate to case details after short delay
              setTimeout(() => {
                if (caseId) {
                  navigate(`/manage-hearings/${caseId}`);
                }
              }, 2000);

              return;
            }
          }
        }

        setFormData(data);
      } catch (error: any) {
        console.error("❌ Final Submit Failed:", error);

        // Use error message from API response if available
        const message =
          error?.data?.message ||
          error?.message ||
          "Submission failed! Please try again.";

        // Show error toast
        toast.error(message);
      }
    };

    const onInvalid = (errs: any) => {
      console.error("Form validation failed:", errs);
    };

    return (
      <StepNavigation<FormData>
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        isValid={isValid}
        actionButtonName={actionButtonName}
        isVerifiedInput={isVerifiedInput}
        isFirstStep={currentStep === 0 && currentTab === 0}
        isLastStep={currentStep === 2}
        currentStep={currentStep}
        goToNextStep={handleNext}
        isFormSubmitting={isFormSubmitting}
        goToPrevStep={handlePrevious}
        resetSteps={() => updateParams(0, 0)}
        handleSave={handleSave}
        isButtonDisabled={(direction: "prev" | "next") =>
          direction === "prev" ? currentStep === 0 && currentTab === 0 : false
        }
      >
        <WrappedComponent
          {...props}
          register={register}
          errors={errors}
          setValue={setValue}
          watch={watch}
          control={control}
          trigger={trigger}
          isValid={isValid}
          setError={setError}
          clearErrors={clearErrors}
          setIsPhoneVerify={setIsPhoneVerify}
          acknowledgements={acknowledgementsState}
          selectedLanguage={selectedLanguageState}
          setAcknowledgements={setAcknowledgementsState}
          setSelectedLanguage={setSelectedLanguageState}
        />
      </StepNavigation>
    );
  };

  ComponentWithStepNavigation.displayName = `withStepNavigation(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return ComponentWithStepNavigation;
};

export default withStepNavigation;
