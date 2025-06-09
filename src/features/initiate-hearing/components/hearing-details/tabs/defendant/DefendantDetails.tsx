// D:/Work/Weddi/Final-Team/WediFE/src/features/initiate-hearing/components/hearing-details/tabs/defendant/DefendantDetails.tsx
import React, { useEffect, useMemo, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useTranslation } from "react-i18next";
import withStepNavigation from "@/shared/HOC/withStepNavigation";
import { DynamicForm } from "@/shared/components/form/DynamicForm";
import {
  useGetEstablishmentDetailsQuery,
  useGetGovernmentLookupDataQuery,
  useGetSubGovernmentLookupDataQuery,
} from "@/features/initiate-hearing/api/create-case/defendantDetailsApis";
import {
  useGetWorkerRegionLookupDataQuery,
  useGetWorkerCityLookupDataQuery,
  useGetOccupationLookupDataQuery,
  useGetGenderLookupDataQuery,
  useGetNationalityLookupDataQuery,
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
  const { register, clearFormData, setValue, watch, control, formState } = useAPIFormsData();
  const errors = formState.errors;
  // Cleare The Form Data Before The Componet load 
  useEffect(() => {
    setValue("region", null);
    setValue("city", null);
    [
      "phoneNumber",
    ].forEach((f) => setValue(f as any, ""));
  }, [])

  // Prefill form fields when continuing an incomplete case for Legal representative
  useCaseDetailsPrefill(setValue as any);

  // Watch fields
  const defendantStatus = watch("defendantStatus");
  const defendantDetails = watch("defendantDetails");
  const fileNumber = "";//| watch("DefendantFileNumber");
  const region = watch("region");
  const nationalIdNumber = watch("nationalIdNumber");
  const defHijriDOB = watch("defendantHijriDOB");
  const mainCategory = watch("main_category_of_the_government_entity");
  const selectedWorkerRegion2 = watch("region");
  const [isVa, setIdNumberValid] = useState<boolean>()

  // Lookup establishment details
  const {
    data: establishmentDetails,
    isFetching: isEstablishmentLoading,
    isSuccess: estabSuccess,
    isLoading
  } = useGetEstablishmentDetailsQuery(
    fileNumber
      ? {
        AcceptedLanguage: lang,
        SourceSystem: "E-Services",
        FileNumber: fileNumber,
      }
      : skipToken
  );

  // Persist selection in cookies
  useEffect(() => {
    if (establishmentDetails) setCookie("defendantDetails", establishmentDetails);
    if (defendantStatus) setCookie("defendantStatus", defendantStatus);
  }, [establishmentDetails, defendantStatus, setCookie]);

  // Government lookups
  const { data: governmentData } = useGetGovernmentLookupDataQuery({
    AcceptedLanguage: lang,
    SourceSystem: "E-Services",
  });

  const { data: subGovernmentData } = useGetSubGovernmentLookupDataQuery(
    mainCategory
      ? {
        AcceptedLanguage: lang,
        SourceSystem: "E-Services",
        mainGovernmentSelected: mainCategory,
      }
      : skipToken
  );

  // NIC lookup for establishment or individual defendant
  const isIndividual = userType.toLowerCase().includes("individual");
  const { data: nicData, isFetching: nicLoading } = useGetNICDetailsQuery(
    isIndividual
      ? {
        IDNumber: userClaims.UserID,
        DateOfBirth: userClaims.UserDOB,
        AcceptedLanguage: lang,
        SourceSystem: "E-Services",
      }
      : nationalIdNumber && defHijriDOB && nationalIdNumber.length === 10
        ? {
          IDNumber: nationalIdNumber,
          DateOfBirth: defHijriDOB,
          AcceptedLanguage: lang,
          SourceSystem: "E-Services",
        }
        : skipToken
  );

  // Region/City/Occupation/Nationality lookups
  const { data: regionData } = useGetWorkerRegionLookupDataQuery({
    AcceptedLanguage: lang,
    SourceSystem: "E-Services",
    ModuleKey: userType.toLowerCase().includes("establishment") ? "WorkerRegion" : "EstablishmentRegion",
    ModuleName: userType.toLowerCase().includes("establishment") ? "WorkerRegion" : "EstablishmentRegion",
  });
  const { data: cityData } = useGetWorkerCityLookupDataQuery(
    region && typeof region === "object" && "value" in region
      ? {
        AcceptedLanguage: lang,
        SourceSystem: "E-Services",
        selectedWorkerRegion: { value: (region as { value: string }).value },
        ModuleName: userType.toLowerCase().includes("establishment") ? "WorkerCity" : "EstablishmentCity",
      }
      : skipToken
  );

  const { data: occupationData } = useGetOccupationLookupDataQuery({
    AcceptedLanguage: lang,
    SourceSystem: "E-Services",
  });

  const { data: genderData } = useGetGenderLookupDataQuery({
    AcceptedLanguage: lang,
    SourceSystem: "E-Services",
  });

  const { data: nationalityData } = useGetNationalityLookupDataQuery({
    AcceptedLanguage: lang,
    SourceSystem: "E-Services",
  });

  // Call useFormLayout hook at the top level directly (not inside useMemo)
  const formLayout = useFormLayout(
    setValue,
    watch,
    establishmentDetails,
    governmentData?.DataElements,
    subGovernmentData?.DataElements,
    // establishmentDetails?.EstablishmentInfo?.[0],
    // establishmentDetails?.ErrorDetails,
    // estabSuccess,
    // isEstablishmentLoading,
    // isLoading
  );

  const establishmentDefendantFormLayout = useEstablishmentDefendantFormLayout({
    setValue,
    selectedWorkerRegion2,
    watch,
  });

  // hassan add this 
  const legelDefendantFormLayout = useLegelDefendantFormLayout({
    setValue,
    watch,
  });

  // Memoize form layouts
  const memoizedIndividualFormLayout = useMemo(() => formLayout, [formLayout]);
  const memoizedEstablishmentFormLayout = useMemo(
    () => establishmentDefendantFormLayout,
    [establishmentDefendantFormLayout]
  );

  // hassan add this 
  const memoizedLegleFormLayout = useMemo(
    () => legelDefendantFormLayout,
    [legelDefendantFormLayout]
  );

  // Determine which form layout to use based on userType
  const getFormLayout = (getUserType: string) => {
    // hassan edit this 
    getUserType = getUserType?.toLocaleLowerCase();
    // console.log("defii", getUserType);

    switch (getUserType) {
      case "legal representative":
        return memoizedLegleFormLayout;
      case "establishment":
        return memoizedEstablishmentFormLayout;
      case "establishment":
        //console.log("hereh2");

        return memoizedLegleFormLayout;
      case "individual":
      default:
        //console.log("hereh3");

        return memoizedIndividualFormLayout;
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
    const isValid = nationalIdNumber?.length === 10;
    if (isValid) {
      setIdNumberValid(isValid);
      setCookie("nationalIdNumber", nationalIdNumber);
    }

  }, [nationalIdNumber]);



  /*
      establishmentDetails?.EstablishmentInfo || null,
      governmentData?.DataElements || [],
      subGovernmentData?.DataElements || [],
      estabSuccess,
      estabSuccess,
      isEstablishmentLoading
    );
  */
  return (
    <>
      {nicLoading && <Loader />}
      <div className={`relative ${nicLoading ? "pointer-events-none" : ""}`}>
        <div className={nicLoading ? "blur-sm" : ""}>
          <DynamicForm
            formLayout={getFormLayout(userType)}
            register={register}
            errors={errors}
            setValue={setValue}
            watch={watch}
            control={control}
            isLoading={isEstablishmentLoading || nicLoading}
          />
        </div>
      </div>
    </>
  );
};

export default withStepNavigation(DefendantDetailsContainer);
