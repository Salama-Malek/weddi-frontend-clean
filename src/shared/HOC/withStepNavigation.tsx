import React, { useState } from "react";
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
  isOnlyFileNumberFilled?: () => boolean;
}

const withStepNavigation = <P extends object>(
  WrappedComponent: React.ComponentType<P & WithStepNavigationProps>,
  p0?: {
    acknowledgements?: any;
    selectedLanguage?: any;
    isOnlyFileNumberFilled?: () => boolean;
  },
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
    } = useCasesLogic({ enableNICCalls: true });

    const [isVerifiedInput, setIsPhoneVerify] = useState<boolean | undefined>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [getCookie, , removeCookie] = useCookieState();
    const { t, i18n } = useTranslation("translation");
    const language = i18n.language === "ar" ? "AR" : "EN";
    const { hasErrors } = useApiErrorHandler();

    const navigate = useNavigate();

    const [acknowledgementsState, setAcknowledgementsState] = useState<any[]>(
      [],
    );
    const [selectedLanguageState, setSelectedLanguageState] =
      useState<string>(language);

    const {
      getValues,
      setFormData,
      register,
      handleSubmit,
      formState,
      setValue,
      watch,
      control,
      trigger,
      clearErrors,
      setError,
      clearFormData,
    } = useAPIFormsData();

    const { errors, isValid, isSubmitting: isFormSubmitting } = formState;
    const acknowledgeValue = useWatch({
      control,
      name: "acknowledge",
      defaultValue: false,
    });

    const [submitFinalReview] = useSubmitFinalReviewMutation();

    const onSubmit: SubmitHandler<FormData> = async (data) => {
      if (actionButtonName === "Next" || isFormSubmitting) {
        return;
      }

      try {
        setIsSubmitting(true);
        const caseId = getCookie("caseId");
        if (currentStep === 2) {
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

            const isSuccessful =
              !hasErrors(response) &&
              (response?.SuccessCode === "200" ||
                response?.ServiceStatus === "Success");

            if (isSuccessful) {
              localStorage.removeItem("step");
              localStorage.removeItem("tab");
              localStorage.removeItem("CaseDetails");
              clearFormData();
              toast.success(t("Submission successful!"));
              const serviceLink = response?.S2Cservicelink;
              if (serviceLink) {
                navigate(`/manage-hearings/${response?.CaseNumber}`);
                window.open(serviceLink, "_blank");
              } else {
                navigate(`/manage-hearings/${response?.CaseNumber}`);
              }

              removeCookie("caseId");
              removeCookie("incompleteCase");

              return;
            } else {
              throw new Error(
                response?.ErrorDescription || "Submission failed",
              );
            }
          }
        }

        setFormData(data);

        if (handleNext) {
          handleNext();
        }
      } catch (error: any) {
        if (actionButtonName === "Next") {
        }
        if (actionButtonName) {
        }
      } finally {
        setIsSubmitting(false);
      }
    };

    const onInvalid = (errs: any) => {
      let firstErrorMsg = "";
      if (errs && typeof errs === "object") {
        const firstKey = Object.keys(errs)[0];
        if (firstKey && errs[firstKey]?.message) {
          firstErrorMsg = errs[firstKey].message;
        }
      }
      if (firstErrorMsg) {
      } else {
        toast.error("Form validation failed. Please check your input.");
      }
    };

    return (
      <>
        {isSubmitting && <Loader force />}
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
          isButtonDisabled={(direction: "prev" | "next") => {
            if (direction === "prev") {
              return currentStep === 0 && currentTab === 0;
            } else {
              const isLastStep = currentStep === 2;
              const isOnlyFileNumberFilledResult = p0?.isOnlyFileNumberFilled
                ? p0.isOnlyFileNumberFilled()
                : false;

              let hasFormContent = true;
              if (currentStep === 0 && currentTab === 1) {
                const formValues: any = getValues();
                const defendantStatus = formValues.defendantStatus;
                const userTypeFromCookie = (
                  getCookie("userType") || ""
                ).toString();

                if (
                  ["Legal representative", "Establishment"].includes(
                    userTypeFromCookie,
                  )
                ) {
                  const hasNationalId =
                    !!formValues.nationalIdNumber &&
                    formValues.nationalIdNumber?.length === 10;
                  const hasDob =
                    !!formValues["def_date_hijri"] ||
                    !!formValues["def_date_gregorian"];
                  const hasName =
                    !!formValues["DefendantsEstablishmentPrisonerName"];
                  const hasPhone =
                    !!formValues.mobileNumber &&
                    /^05\d{8}$/.test(formValues.mobileNumber);
                  const hasRegion = !!(
                    formValues.region && formValues.region.value
                  );
                  const hasCity = !!(formValues.city && formValues.city.value);
                  const hasOccupation = !!(
                    formValues.occupation && formValues.occupation.value
                  );
                  const hasGender = !!(
                    formValues.gender && formValues.gender.value
                  );
                  const hasNationality = !!(
                    formValues.nationality && formValues.nationality.value
                  );

                  hasFormContent =
                    hasName &&
                    hasPhone &&
                    hasRegion &&
                    hasCity &&
                    hasOccupation &&
                    hasGender &&
                    hasNationality &&
                    hasDob &&
                    hasNationalId;
                } else if (defendantStatus === "Government") {
                  const mainCat =
                    formValues.main_category_of_the_government_entity;
                  const subCat =
                    formValues.subcategory_of_the_government_entity;
                  const mainCategoryValue =
                    mainCat && typeof mainCat === "object" && "value" in mainCat
                      ? (mainCat as any).value
                      : mainCat;
                  const subCategoryValue =
                    subCat && typeof subCat === "object" && "value" in subCat
                      ? (subCat as any).value
                      : subCat;
                  const hasMainCategory = !!mainCategoryValue;
                  const hasSubCategory = !!subCategoryValue;

                  hasFormContent = hasMainCategory && hasSubCategory;
                } else {
                  const hasSelectedEstablishment =
                    !!formValues.Defendant_Establishment_data;

                  if (hasSelectedEstablishment) {
                    hasFormContent = true;
                  } else {
                    const hasFileNumber = !!formValues.DefendantFileNumber;
                    const hasCRNumber = !!formValues.DefendantCRNumber;
                    const hasRegion = !!formValues.defendantRegion;
                    const hasCity = !!formValues.defendantCity;
                    const hasPhoneNumber =
                      !!formValues.establishment_phoneNumber;
                    const hasEstablishmentName =
                      !!formValues.DefendantEstablishmentName;

                    const hasRequiredFileInfo = hasFileNumber || hasCRNumber;
                    hasFormContent =
                      hasRequiredFileInfo &&
                      hasRegion &&
                      hasCity &&
                      hasPhoneNumber &&
                      hasEstablishmentName;
                  }
                }
              }

              const finalResult =
                isLastStep || isOnlyFileNumberFilledResult || !hasFormContent;
              try {
              } catch {}
              return finalResult;
            }
          }}
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
