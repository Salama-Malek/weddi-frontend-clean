// D:/Work/Weddi/Final-Team/WediFE/src/features/initiate-hearing/components/hearing-details/tabs/defendant/DefendantDetails.tsx
import React, { useEffect, useMemo, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useTranslation } from "react-i18next";
import withStepNavigation from "@/shared/HOC/withStepNavigation";
import { DynamicForm } from "@/shared/components/form/DynamicForm";
import { FormData } from "@/shared/components/form/form.types";
import {
  useGetEstablishmentDetailsQuery,
  useGetGovernmentLookupDataQuery,
  useGetSubGovernmentLookupDataQuery,
} from "@/features/initiate-hearing/api/create-case/defendantDetailsApis";
import {
  useGetNICDetailsQuery,
} from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import useCaseDetailsPrefill from "@/features/initiate-hearing/hooks/useCaseDetailsPrefill";
import { useAPIFormsData } from "@/providers/FormContext";
import { useFormLayout } from "./defendant.forms.formLayout";
import { FieldErrors } from "react-hook-form";
import { useEstablishmentDefendantFormLayout } from "../../establishment-tabs/defendant/defendant.forms.formLayout";
import { useLegelDefendantFormLayout } from "../../establishment-tabs/legal-representative/defendant/legdefendant.forms.formLayout";
import Loader from "@/shared/components/loader";

const DefendantDetailsContainer: React.FC = () => {
  const { t, i18n } = useTranslation("hearingdetails");
  const [getCookie, setCookie] = useCookieState();
  const userClaims = getCookie("userClaims") || {};
  const userType = getCookie("userType") || "";
  const lang = i18n.language.toUpperCase();

  // Form context including errors
  const { register, clearFormData, setValue, watch, control, formState, trigger } = useAPIFormsData();
  const errors = formState.errors;
  
  // Preserve form data when component remounts
  useEffect(() => {
    const savedFormData = localStorage.getItem("defendantFormData");
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        // Only restore if we don't already have form data
        const currentFormData = watch();
        if (!currentFormData.defendantRegion && !currentFormData.defendantCity) {
          console.log("Restoring saved defendant form data:", parsedData);
          Object.entries(parsedData).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              setValue(key as any, value, { shouldValidate: false });
            }
          });
        }
      } catch (error) {
        console.error("Error restoring form data:", error);
      }
    }
  }, [setValue, watch]);
  
  // Save form data when it changes
  useEffect(() => {
    const currentFormData = watch();
    const formDataToSave = {
      defendantRegion: currentFormData.defendantRegion,
      defendantCity: currentFormData.defendantCity,
      phoneNumber: currentFormData.phoneNumber,
      DefendantFileNumber: currentFormData.DefendantFileNumber,
      Defendant_Establishment_data_NON_SELECTED: currentFormData.Defendant_Establishment_data_NON_SELECTED,
      Defendant_Establishment_data: currentFormData.Defendant_Establishment_data,
    };
    
    // Only save if we have meaningful data
    if (formDataToSave.defendantRegion || formDataToSave.defendantCity || formDataToSave.phoneNumber) {
      localStorage.setItem("defendantFormData", JSON.stringify(formDataToSave));
    }
  }, [watch("defendantRegion"), watch("defendantCity"), watch("phoneNumber"), watch("DefendantFileNumber")]);
  
  // Only clear form data when switching between defendant types, not on every mount
  useEffect(() => {
    const currentDefendantStatus = watch("defendantStatus");
    const currentDefendantDetails = watch("defendantDetails");
    
    // Only clear if switching from establishment to government or vice versa
    if (currentDefendantStatus === "Establishment" && currentDefendantDetails === "Others") {
      // Clear only when switching to "Others" establishment type
      setValue("defendantRegion", null);
      setValue("defendantCity", null);
      setValue("phoneNumber", "");
      // Clear saved form data
      localStorage.removeItem("defendantFormData");
    }
  }, [watch("defendantStatus"), watch("defendantDetails"), setValue]);

  // Prefill form fields when continuing an incomplete case for Legal representative
  useCaseDetailsPrefill(setValue as any);

  // Cleanup saved form data when component unmounts or case is completed
  useEffect(() => {
    return () => {
      // Only clear if we're moving to the next step (not just unmounting)
      const currentStep = parseInt(localStorage.getItem("step") || "0");
      const currentTab = parseInt(localStorage.getItem("tab") || "0");
      
      if (currentStep > 0 || currentTab > 1) {
        localStorage.removeItem("defendantFormData");
      }
    };
  }, []);

  // Watch fields
  const defendantStatus = watch("defendantStatus");
  const defendantDetails = watch("defendantDetails");
  const mainCategory = watch("main_category_of_the_government_entity");





 

  // Government lookups
  const { data: governmentData, isLoading: isGovernmentLoading } = useGetGovernmentLookupDataQuery({
    AcceptedLanguage: lang,
    SourceSystem: "E-Services",
  }, {
    // Don't skip the query
    skip: false
  });

  const { data: subGovernmentData, isLoading: isSubGovernmentLoading } = useGetSubGovernmentLookupDataQuery(
    mainCategory
      ? {
        AcceptedLanguage: lang,
        SourceSystem: "E-Services",
        mainGovernmentSelected: mainCategory,
      }
      : skipToken
  );

  // Determine which form layout to use based on userType
  const getFormLayout = (getUserType: string) => {
    getUserType = getUserType?.toLocaleLowerCase();
    switch (getUserType) {
      case "legal representative":
        return useLegelDefendantFormLayout({
          setValue,
          watch,
        });

      case "establishment":
        return useLegelDefendantFormLayout({
          setValue,
          watch,
        })
      case "individual":
      default:
        return useFormLayout(
          setValue,
          watch,
          trigger,
          governmentData,
          subGovernmentData
        );
    }
  };
  const isNotOthersDefendant = defendantDetails !== "Others";
  const DefendantType = isNotOthersDefendant
    ? "Establishment"
    : defendantStatus;

  console.log("this is new data ",{isNotOthersDefendant, DefendantType});

  useEffect(() => {
    setCookie("defendantTypeInfo", DefendantType);
  }, [DefendantType]);



  // Reset fields when defendantStatus changes
  useEffect(() => {
    if (defendantStatus === "Establishment") {
      // Clear government fields
      setValue("main_category_of_the_government_entity", "", { shouldValidate: false });
      setValue("subcategory_of_the_government_entity", "", { shouldValidate: false });
      // Clear establishment data
      setValue("EstablishmentData", null, { shouldValidate: false });
    } else if (defendantStatus === "Government") {
      // Clear establishment data
      setValue("EstablishmentData", null, { shouldValidate: false });
    }
  }, [defendantStatus, setValue]);


  return (
    <>
      <div className={`relative`}>
        <div>
          <DynamicForm
            formLayout={getFormLayout(userType)}
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
