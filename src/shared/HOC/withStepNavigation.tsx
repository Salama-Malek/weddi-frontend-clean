import React, { useState, useEffect } from "react";
import { SubmitHandler, useWatch } from "react-hook-form";
import StepNavigation from "@/shared/modules/case-creation/components/StepNavigation";
import useCasesLogic from "@/features/initiate-hearing/hooks/useCasesLogic";
import { FormData } from "@/shared/components/form/form.types";
import { useAPIFormsData } from "@/providers/FormContext";
import { useSubmitFinalReviewMutation } from "@/features/initiate-hearing/api/create-case/apis";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Loader from "@/shared/components/loader";
import Modal from "@/shared/components/modal/Modal";
import Button from "@/shared/components/button";
import { useNavigate } from "react-router-dom";
import { useApiErrorHandler } from "@/shared/hooks/useApiErrorHandler";

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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [getCookie, setCookie, removeCookie, removeAll] = useCookieState();
    const { t, i18n } = useTranslation('translation');
    const language = i18n.language === "ar" ? "AR" : "EN";
    const { hasErrors } = useApiErrorHandler();

    const navigate = useNavigate();

    const [acknowledgementsState, setAcknowledgementsState] = useState<any[]>(
      []
    );
    const [selectedLanguageState, setSelectedLanguageState] =
      useState<string>(language);

    const {
      formData,
      getValues,
      setFormData,
      register,
      handleSubmit,
      formState,
      setValue,
      watch,
      control,
      trigger,
      forceValidateForm,
      clearErrors,
      setError,
    } = useAPIFormsData();

    const { errors, isValid, isSubmitting: isFormSubmitting } = formState;
    const acknowledgeValue = useWatch({
      control,
      name: "acknowledge",
      defaultValue: false,
    });
    // console.log("withStepNavigation - formState.isValid:", isValid);
    // console.log("Debug ack:", acknowledgeValue, "currentStep:", currentStep);

    const [submitFinalReview, { isLoading: isSubmittingFinalReview }] = useSubmitFinalReviewMutation();

    const onSubmit: SubmitHandler<FormData> = async (data) => {
      try {
        const caseId = getCookie("caseId");
        if (currentStep === 2) {
          setIsSubmitting(true);
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
            
            // Use centralized error handling to check if response is successful
            const isSuccessful = !hasErrors(response) && (response?.SuccessCode === "200" || response?.ServiceStatus === "Success");

            if (isSuccessful) {
              localStorage.removeItem("step");
              localStorage.removeItem("tab");

              toast.success(t("Submission successful!"));

              // Handle survey link
              const serviceLink = response?.S2Cservicelink;
              if (serviceLink) {
                // Navigate to manage-hearings first
                navigate(`/manage-hearings/${response?.CaseNumber}`);
                // Open survey in new tab
                window.open(serviceLink, '_blank');
              } else {
                console.warn("Survey link missing from successful response:", response);
                // Navigate to manage-hearings even if survey link is missing
                navigate(`/manage-hearings/${response?.CaseNumber}`);
              }
              
              // Clear caseId from cookie
              removeCookie("caseId");
              
              return;
            } else {
              // Handle error cases. ErrorCodeList is handled by the interceptor.
              if (response?.ErrorDescription) {
                toast.error(response.ErrorDescription);
              }
              throw new Error(response?.ErrorDescription || "Submission failed");
            }
          }
        }

        setFormData(data);
        
        // Call goToNextStep after successful form submission
        if (handleNext) {
          handleNext();
        }
      } catch (error: any) {
        console.error("❌ Final Submit Failed:", error);
        // The toast is now handled by the central error handler
      } finally {
        setIsSubmitting(false);
      }
    };

    const onInvalid = (errs: any) => {
      // Find the first error message in errs
      let firstErrorMsg = "";
      if (errs && typeof errs === "object") {
        const firstKey = Object.keys(errs)[0];
        if (firstKey && errs[firstKey]?.message) {
          firstErrorMsg = errs[firstKey].message;
        }
      }
      if (firstErrorMsg) {
        toast.error(firstErrorMsg);
      } else {
        toast.error("Form validation failed. Please check your input.");
      }
      // console.error("Form validation failed:", errs);
    };

    return (
      <>
      {isSubmitting && <Loader />}
      <StepNavigation<FormData>
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        isValid={isValid}
        actionButtonName={actionButtonName}
        isVerifiedInput={isVerifiedInput}
        isFirstStep={currentStep === 0 && currentTab === 0}
        isLastStep={currentStep === 2}
        goToNextStep={handleNext}
        isFormSubmitting={isFormSubmitting}
        goToPrevStep={handlePrevious}
        resetSteps={() => {
          localStorage.removeItem("step");
          localStorage.removeItem("tab");
          updateParams(0, 0);
        }}
        handleSave={handleSave}
        isButtonDisabled={(direction: "prev" | "next") =>
          direction === "prev"
            ? currentStep === 0 && currentTab === 0
            : currentStep === 2
        }
        canProceed={currentStep === 2 && acknowledgeValue}
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
      </>

    );
  };

  ComponentWithStepNavigation.displayName = `withStepNavigation(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return ComponentWithStepNavigation;
};

export default withStepNavigation;
