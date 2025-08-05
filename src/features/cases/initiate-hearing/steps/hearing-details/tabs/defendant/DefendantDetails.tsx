import React, { useEffect, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useTranslation } from "react-i18next";
import withStepNavigation from "@shared/HOC/withStepNavigation";
import { DynamicForm } from "@shared/components/form/DynamicForm";
import {
  useGetEstablishmentDetailsQuery,
  useGetGovernmentLookupDataQuery,
  useGetSubGovernmentLookupDataQuery,
  useGetExtractedEstablishmentDataQuery,
} from "@features/cases/initiate-hearing/api/create-case/defendantDetailsApis";
import { useGetNICDetailsQuery } from "@features/cases/initiate-hearing/api/create-case/plaintiffDetailsApis";
import { useCookieState } from "@features/cases/initiate-hearing/hooks/useCookieState";
import { useAPIFormsData } from "@app/providers/FormContext";
import { useFormLayout } from "./defendant.forms.formLayout";
import { useLegelDefendantFormLayout } from "../../establishment-tabs/legal-representative/defendant/legdefendant.forms.formLayout";
import { useDefendantDetailsPrefill } from "@features/cases/initiate-hearing/steps/hearing-details";
import { Option } from "@shared/components/form/form.types";

const DefendantDetailsContainer: React.FC = () => {
  console.log("[🔍 DEFENDANT DETAILS] Component rendered at:", new Date().toISOString());
  
  const { t, i18n } = useTranslation("hearingdetails");
  const [getCookie, setCookie] = useCookieState();
  // جلب بيانات المؤسسات (ExtractEstData)
  const userClaims = getCookie("userClaims") || {};
  const userType = getCookie("userType") || "";
  const caseId = getCookie("caseId");
  const lang = i18n.language.toUpperCase();
  const plaintiffId = (() => {
    try {
      const storedData = localStorage.getItem("CaseDetails");
      if (!storedData || storedData === "null" || storedData === "") {
        return "";
      }
      const caseDetails = JSON.parse(storedData);
      return caseDetails?.PlaintiffId || "";
    } catch {
      return "";
    }
  })();
  // const { data: extractedEstData, isLoading: isExtractEstLoading } =
  //   useGetExtractedEstablishmentDataQuery(
  //     {
  //       WorkerId: plaintiffId,
  //       AcceptedLanguage: lang,
  //       SourceSystem: "E-Services",
  //       UserType: userType,
  //       CaseID: caseId,
  //     },
  //     {
  //       skip: userType?.toLocaleLowerCase() === "legal representative" ||
  //         userType?.toLocaleLowerCase() === "establishment" ||
  //         !plaintiffId || !caseId || !userType,
  //     }
  //   );

  // Form context including errors
  const {
    register,
    clearFormData,
    setValue,
    watch,
    control,
    formState,
    trigger,
  } = useAPIFormsData();
  const errors = formState.errors;

  // Debug form submission state
  useEffect(() => {
    console.log("[🔍 DEFENDANT DETAILS] Form state changed:", {
      isSubmitting: formState.isSubmitting,
      isValidating: formState.isValidating,
      isDirty: formState.isDirty,
      timestamp: new Date().toISOString()
    });
  }, [formState.isSubmitting, formState.isValidating, formState.isDirty]);

  // استخدم hook الجديد لجلب بيانات المدعى عليه
  const { isFeatched: caseDetailsLoading, defendantData } =
    useDefendantDetailsPrefill(setValue as any);

  // تعبئة الحقول تلقائيًا عند توفر بيانات المدعى عليه
  useEffect(() => {
    console.log("[🔍 DEFENDANT] defendantData useEffect triggered:", {
      hasDefendantData: !!defendantData,
      defendantData,
      timestamp: new Date().toISOString()
    });
    
    if (defendantData) {
      console.log("[🔍 DEFENDANT] Applying defendant data to form:", defendantData);
      // Apply prefill data based on defendant type
      const allowedFields = [
        "defendantStatus",
        "defendantDetails",
        "nationalIdNumber",
        "def_date_hijri",
        "DefendantsEstablishmentPrisonerName",
        "mobileNumber",
        "defendantRegion",
        "defendantCity",
        "occupation",
        "gender",
        "nationality",
        "DefendantFileNumber",
        "Defendant_Establishment_data_NON_SELECTED",
        "main_category_of_the_government_entity",
        "subcategory_of_the_government_entity",
      ];

      // Set defendant status and details first
      if (defendantData.defendantStatus) {
        setValue("defendantStatus", defendantData.defendantStatus);
      }

      if (defendantData.defendantDetails) {
        setValue("defendantDetails", defendantData.defendantDetails);
      }

      // Apply other fields
      Object.entries(defendantData).forEach(([key, value]) => {
        if (allowedFields.includes(key) && value !== null && value !== undefined) {
          setValue(key as any, value);
        }
      });

      // Handle establishment data specifically
      if (defendantData.Defendant_Establishment_data_NON_SELECTED) {
        const estData = defendantData.Defendant_Establishment_data_NON_SELECTED;
        if (estData.EstablishmentName) {
          setValue("Defendant_Establishment_data_NON_SELECTED", estData);
        }
      }

      // Handle government entity data
      if (defendantData.main_category_of_the_government_entity) {
        setValue("main_category_of_the_government_entity", defendantData.main_category_of_the_government_entity);
      }

      if (defendantData.subcategory_of_the_government_entity) {
        setValue("subcategory_of_the_government_entity", defendantData.subcategory_of_the_government_entity);
      }
    }
  }, [defendantData, setValue]);

  // إعادة تعيين الحقول عند أول تحميل - only run once and don't clear if values exist
  useEffect(() => {
    console.log("[🔍 DEFENDANT DETAILS] Component mount useEffect triggered - checking form fields");
    
    // Don't run this effect during form submission to prevent data clearing
    if (formState.isSubmitting) {
      console.log("[🔍 DEFENDANT DETAILS] Skipping component mount effect - form is submitting");
      return;
    }
    
    const currentFormData = watch();
    
    // Only clear fields if they don't already have values
    const fieldsToCheck = [
      "nationalIdNumber",
      "def_date_hijri", 
      "DefendantsEstablishmentPrisonerName",
      "mobileNumber",
      "defendantRegion",
      "defendantCity",
    ];
    
    fieldsToCheck.forEach((field: any) => {
      const currentValue = (currentFormData as any)[field];
      if (!currentValue || currentValue === "" || currentValue === null) {
        console.log(`[🔍 DEFENDANT DETAILS] Setting ${field} to null (was already empty)`);
        setValue(field, null);
      } else {
        console.log(`[🔍 DEFENDANT DETAILS] Skipping ${field} - already has value:`, currentValue);
      }
    });
  }, [formState.isSubmitting]); // Add formState.isSubmitting to dependencies to prevent running during submission

  // حفظ واسترجاع بيانات النموذج من localStorage
  useEffect(() => {
    // Don't run this effect during form submission to prevent data clearing
    if (formState.isSubmitting) {
      console.log("[🔍 DEFENDANT] Skipping localStorage restore - form is submitting");
      return;
    }
    
    const savedFormData = localStorage.getItem("defendantFormData");
    console.log("[🔍 DEFENDANT] Checking localStorage for saved form data:", savedFormData);
    
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        const currentFormData = watch();
        console.log("[🔍 DEFENDANT] Restoring form data from localStorage:", parsedData);
        console.log("[🔍 DEFENDANT] Current form data:", currentFormData);
        
        // Always restore establishment data if it exists in localStorage and is missing from current form
        if (parsedData.Defendant_Establishment_data_NON_SELECTED && 
            (!currentFormData.Defendant_Establishment_data_NON_SELECTED || 
             !currentFormData.Defendant_Establishment_data_NON_SELECTED.EstablishmentName)) {
          console.log("[🔍 DEFENDANT] Restoring establishment data first");
          setValue("Defendant_Establishment_data_NON_SELECTED", parsedData.Defendant_Establishment_data_NON_SELECTED, { shouldValidate: false });
        }
        
        // Restore other fields if they're missing from current form
        Object.entries(parsedData).forEach(([key, value]) => {
          if (value !== null && value !== undefined && 
              key !== "Defendant_Establishment_data_NON_SELECTED" &&
              (!(currentFormData as any)[key] || (currentFormData as any)[key] === "" || (currentFormData as any)[key] === null)) {
            console.log(`[🔍 DEFENDANT] Setting ${key} to:`, value);
            setValue(key as any, value, { shouldValidate: false });
          }
        });
      } catch (error) { 
        console.error("[🔍 DEFENDANT] Error parsing saved form data:", error);
      }
    } else {
      console.log("[🔍 DEFENDANT] No saved form data found in localStorage");
    }
  }, [setValue, watch, formState.isSubmitting]);

  useEffect(() => {
    const currentFormData = watch();
    const formDataToSave = {
      defendantRegion: currentFormData.defendantRegion,
      defendantCity: currentFormData.defendantCity,
      phoneNumber: currentFormData.phoneNumber,
      DefendantFileNumber: currentFormData.DefendantFileNumber,
      Defendant_Establishment_data_NON_SELECTED:
        currentFormData.Defendant_Establishment_data_NON_SELECTED,
      Defendant_Establishment_data:
        currentFormData.Defendant_Establishment_data,
    };
    if (
      formDataToSave.defendantRegion ||
      formDataToSave.defendantCity ||
      formDataToSave.phoneNumber ||
      formDataToSave.DefendantFileNumber ||
      formDataToSave.Defendant_Establishment_data_NON_SELECTED
    ) {
      console.log("[🔍 DEFENDANT] Saving form data to localStorage:", formDataToSave);
      localStorage.setItem("defendantFormData", JSON.stringify(formDataToSave));
    } else {
      console.log("[🔍 DEFENDANT] No form data to save - all fields are empty/null");
    }
  }, [
    watch("defendantRegion"),
    watch("defendantCity"),
    watch("phoneNumber"),
    watch("DefendantFileNumber"),
    watch("Defendant_Establishment_data_NON_SELECTED"),
  ]);

  // Track previous values to detect actual user changes
  const [previousDefendantStatus, setPreviousDefendantStatus] = useState<string | undefined>(undefined);
  const [previousDefendantDetails, setPreviousDefendantDetails] = useState<string | undefined>(undefined);

  useEffect(() => {
    const currentDefendantStatus = watch("defendantStatus");
    const currentDefendantDetails = watch("defendantDetails");
    const establishmentData = watch("Defendant_Establishment_data_NON_SELECTED");
    
    console.log("[🔍 DEFENDANT DETAILS] useEffect triggered:", {
      currentDefendantStatus,
      currentDefendantDetails,
      previousDefendantStatus,
      previousDefendantDetails,
      establishmentData,
      hasEstablishmentData: establishmentData && establishmentData.EstablishmentName,
      isSubmitting: formState.isSubmitting,
      timestamp: new Date().toISOString()
    });
    
    // Don't run this effect during form submission to prevent data clearing
    if (formState.isSubmitting) {
      console.log("[🔍 DEFENDANT DETAILS] Skipping clear - form is submitting");
      return;
    }
    
    // Only clear form data when user actually changes from a different defendant type to "Others"
    // Don't clear if we're just initializing or if the values haven't actually changed
    const isUserChange = previousDefendantStatus !== undefined && 
                        previousDefendantDetails !== undefined &&
                        (previousDefendantStatus !== currentDefendantStatus || 
                         previousDefendantDetails !== currentDefendantDetails);
    
    if (
      currentDefendantStatus === "Establishment" &&
      currentDefendantDetails === "Others" &&
      isUserChange
    ) {
      // Don't clear if we already have valid establishment data
      if (!establishmentData || !establishmentData.EstablishmentName) {
        console.log("[🔍 DEFENDANT DETAILS] Clearing form data - user changed to Others with no valid establishment data");
        setValue("defendantRegion", null);
        setValue("defendantCity", null);
        setValue("phoneNumber", "");
        console.log("[🔍 DEFENDANT DETAILS] Removing defendantFormData from localStorage");
        localStorage.removeItem("defendantFormData");
      } else {
        console.log("[🔍 DEFENDANT DETAILS] Skipping clear - valid establishment data exists:", establishmentData);
      }
    } else if (!isUserChange) {
      console.log("[🔍 DEFENDANT DETAILS] Skipping clear - no actual user change detected");
    } else {
      console.log("[🔍 DEFENDANT DETAILS] Conditions not met for clearing - status:", currentDefendantStatus, "details:", currentDefendantDetails);
    }
    
    // Update previous values for next comparison
    setPreviousDefendantStatus(currentDefendantStatus);
    setPreviousDefendantDetails(currentDefendantDetails);
  }, [watch("defendantStatus"), watch("defendantDetails"), setValue, watch, previousDefendantStatus, previousDefendantDetails, formState.isSubmitting]);

  // Removed cleanup effect that was clearing defendantFormData on component unmount
  // This was causing form data to be lost after successful saves
  // useEffect(() => {
  //   return () => {
  //     const currentStep = parseInt(localStorage.getItem("step") || "0");
  //     const currentTab = parseInt(localStorage.getItem("tab") || "0");
  //     if (currentStep > 0 || currentTab > 1) {
  //       localStorage.removeItem("defendantFormData");
  //     }
  //   };
  // }, []);

  const defendantStatus = watch("defendantStatus");
  const defendantDetails = watch("defendantDetails");
  const mainCategory = watch("main_category_of_the_government_entity") as any;

  const { data: governmentData, isLoading: isGovernmentLoading } =
    useGetGovernmentLookupDataQuery(
      {
        AcceptedLanguage: lang,
        SourceSystem: "E-Services",
      },
      {
        skip:
          userType?.toLocaleLowerCase() === "legal representative" ||
          userType?.toLocaleLowerCase() === "establishment",
      }
    );

  const { data: subGovernmentData, isLoading: isSubGovernmentLoading } =
    useGetSubGovernmentLookupDataQuery(
      mainCategory && mainCategory.value
        ? {
          AcceptedLanguage: lang,
          SourceSystem: "E-Services",
          mainGovernmentSelected: mainCategory,
        }
        : skipToken
    );




  // تحديد الـ formLayout المناسب
  const getFormLayout = (getUserType: string) => {
    console.log("[🔍 DEFENDANT] getFormLayout called with userType:", getUserType);
    const currentFormValues = watch();
    console.log("[🔍 DEFENDANT] Current form values in getFormLayout:", {
      defendantStatus: currentFormValues.defendantStatus,
      defendantDetails: currentFormValues.defendantDetails,
      DefendantFileNumber: currentFormValues.DefendantFileNumber,
      Defendant_Establishment_data_NON_SELECTED: currentFormValues.Defendant_Establishment_data_NON_SELECTED,
      defendantRegion: currentFormValues.defendantRegion,
      defendantCity: currentFormValues.defendantCity,
      phoneNumber: currentFormValues.phoneNumber
    });
    
    getUserType = getUserType?.toLocaleLowerCase();

    switch (getUserType) {
      case "legal representative":
      case "establishment":
        return useLegelDefendantFormLayout({
          setValue,
          watch,
          control,
          caseDetailsLoading,
          defendantData,
        });
      case "individual":
      case "worker":
      default:
        return useFormLayout(
          setValue,
          watch,
          trigger,
          governmentData,
          subGovernmentData,
          caseDetailsLoading,
          defendantData
        );
    }
  };

  const isNotOthersDefendant = defendantDetails !== "Others";
  const DefendantType = isNotOthersDefendant
    ? "Establishment"
    : defendantStatus;

  useEffect(() => {
    setCookie("defendantTypeInfo", DefendantType);
  }, [DefendantType]);

  useEffect(() => {
    if (defendantStatus === "Establishment") {
      setValue("main_category_of_the_government_entity", "", {
        shouldValidate: false,
      });
      setValue("subcategory_of_the_government_entity", "", {
        shouldValidate: false,
      });
      setCookie("defendantStatus", "Establishment");
      setValue("EstablishmentData", null, { shouldValidate: false });
    } else if (defendantStatus === "Government") {
      setCookie("defendantStatus", "Government");
      setValue("EstablishmentData", null, { shouldValidate: false });
    }
  }, [defendantStatus, setValue]);

  // // مقارنة رقم الملف بين بيانات القضية وبيانات المؤسسات المستخرجة
  // const caseFileNumber = defendantData?.DefendantFileNumber || "";
  // let isFileNumberMatch = false;
  // if (
  //   extractedEstData &&
  //   extractedEstData.EstablishmentData &&
  //   Array.isArray(extractedEstData.EstablishmentData)
  // ) {
  //   isFileNumberMatch = extractedEstData.EstablishmentData.some(
  //     (est: any) => est.FileNumber === caseFileNumber
  //   );
  // }

  const formLayoutResult = getFormLayout(userType);
  const formLayout = 'layout' in formLayoutResult ? formLayoutResult.layout : formLayoutResult;
  const isOnlyFileNumberFilled = 'isOnlyFileNumberFilled' in formLayoutResult ? formLayoutResult.isOnlyFileNumberFilled : () => false;

  return (
    <>
      <div className={`relative`}>
        <div>
          <DynamicForm
            formLayout={formLayout}
            register={register}
            errors={errors}
            setValue={setValue}
            watch={watch}
            control={control}
          />
        </div>
      </div>
    </>
  );
};

export default withStepNavigation(DefendantDetailsContainer);
