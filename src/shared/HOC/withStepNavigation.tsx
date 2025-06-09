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
    const [getCookie] = useCookieState();
    const { i18n } = useTranslation();
    const language = i18n.language === "ar" ? "AR" : "EN";

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
            if (response?.SuccessCode == "200") {
              // Log the response for debugging
              console.log("Final review response:", response);

              localStorage.removeItem("step");
              localStorage.removeItem("tab");

              toast.success("Submission successful!");

              // Handle survey link
              const serviceLink = response?.S2Cservicelink;
              if (serviceLink) {
                try {
                  // Navigate to manage-hearings first
                  navigate("/manage-hearings");

                  // Show persistent toast with survey link
                  toast.info(
                    <div>
                      <p>Please complete the survey:</p>
                      <a 
                        href={serviceLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {serviceLink}
                      </a>
                    </div>,
                    {
                      autoClose: false,
                      closeOnClick: false,
                      position: "top-center",
                      onClick: () => window.open(serviceLink, '_blank')
                    }
                  );

                  // Also try to open the survey directly
                  window.open(serviceLink, '_blank');
                } catch (error) {
                  console.error("Failed to open survey link:", error);
                  toast.error(
                    <div>
                      <p>Failed to open survey automatically. Please click the link below:</p>
                      <a 
                        href={serviceLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {serviceLink}
                      </a>
                    </div>,
                    {
                      autoClose: false,
                      closeOnClick: false
                    }
                  );
                }
              } else {
                console.warn("Survey link missing from successful response:", response);
                // Navigate to manage-hearings even if survey link is missing
                navigate("/manage-hearings");
              }
              
              return;
            }
          }
        }

        setFormData(data);
      } catch (error: any) {
        console.error("❌ Final Submit Failed:", error);
        const message =
          error?.data?.message ||
          error?.message ||
          "Submission failed! Please try again.";
        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
    };

    const onInvalid = (errs: any) => {
      console.error("Form validation failed:", errs);
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
