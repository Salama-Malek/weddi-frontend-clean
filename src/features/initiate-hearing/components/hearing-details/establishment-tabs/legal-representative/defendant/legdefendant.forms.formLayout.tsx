import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { SectionLayout, FormData } from "@/shared/components/form/form.types";
import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { genderData } from "@/mock/genderData";
import { options } from "@/features/initiate-hearing/config/Options";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetGenderLookupDataQuery, useGetNationalityLookupDataQuery, useGetNICDetailsQuery, useGetOccupationLookupDataQuery, useGetWorkerCityLookupDataQuery, useGetWorkerRegionLookupDataQuery } from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";
import { useLazyGetCaseDetailsQuery } from "@/features/manage-hearings/api/myCasesApis";
import { toast } from "react-toastify";

interface EstablishmentDefendantFormLayoutProps {
  setValue?: UseFormSetValue<FormData>;
  watch?: UseFormWatch<FormData>;
  applicantType?: string;
  data?: any;
  nationalIdNumber?: any
}

export const useLegelDefendantFormLayout = ({
  setValue,
  watch
}: any): SectionLayout[] => {
  const { t, i18n } = useTranslation("hearingdetails");
  const [getCookie, setCookie] = useCookieState();

  //#region Hassan Work Here
  const selectedWorkerRegion2 = watch("region");
  const [isValidCallNic, setIsValidCallNic] = useState<boolean>(false);
  const watchNationalId = watch?.("nationalIdNumber");
  const watchDateOfBirth = watch?.("def_date_hijri");
  const caseId = getCookie("caseId");
  const userType = getCookie("userType");
  const userClaims = getCookie("userClaims");
  const mainCategory = getCookie("mainCategory")?.value;
  const subCategory = getCookie("subCategory")?.value;

  // Add state to track if form has been initialized
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  // Lookups Apis Calls  
  const { data: regionData, isLoading: isRegionLoading } = useGetWorkerRegionLookupDataQuery({
    AcceptedLanguage: i18n.language === "ar" ? "AR" : "EN",
    SourceSystem: "E-Services",
    ModuleKey: "EstablishmentRegion",
    ModuleName: "EstablishmentRegion",
  });

  const { data: cityData, isLoading: isCityLoading } = useGetWorkerCityLookupDataQuery(
    {
      AcceptedLanguage: i18n.language === "ar" ? "AR" : "EN",
      SourceSystem: "E-Services",
      selectedWorkerRegion: selectedWorkerRegion2,
      ModuleName: "EstablishmentCity",
    },
    { skip: !selectedWorkerRegion2 }
  );

  const { data: occupationData } = useGetOccupationLookupDataQuery({
    AcceptedLanguage: i18n.language === "ar" ? "AR" : "EN",
    SourceSystem: "E-Services",
  });

  const { data: notGettingResWithQaUrl } = useGetGenderLookupDataQuery({
    AcceptedLanguage: i18n.language === "ar" ? "AR" : "EN",
    SourceSystem: "E-Services",
  });

  const { data: nationalityData } = useGetNationalityLookupDataQuery({
    AcceptedLanguage: i18n.language === "ar" ? "AR" : "EN",
    SourceSystem: "E-Services",
  });

  // Case Details API call
  const [triggerCaseDetailsQuery, { data: caseDetailsData, error: caseDetailsError }] = useLazyGetCaseDetailsQuery();

  // NIC Details API call
  const {
    data: nicData,
    isSuccess: nicIsSuccess,
    isFetching: nicIsLoading,
    isError,
  } = useGetNICDetailsQuery(
    watchNationalId && watchDateOfBirth
      ? {
          IDNumber: watchNationalId,
          DateOfBirth: watchDateOfBirth,
          AcceptedLanguage: i18n.language === "ar" ? "AR" : "EN",
          SourceSystem: "E-Services",
        }
      : skipToken,
    {
      skip: !isValidCallNic
    }
  );

  const disableNicFields = !isValidCallNic || nicIsLoading;

  // Fetch case details if caseId exists - only once when component mounts
  useEffect(() => {
    if (caseId && userType === "Legal representative" && !isFormInitialized && !hasAttemptedFetch) {
      const userConfigs: any = {
        Worker: {
          UserType: userType,
          IDNumber: userClaims?.UserID,
        },
        Establishment: {
          UserType: userType,
          IDNumber: userClaims?.UserID,
          FileNumber: userClaims?.File_Number,
        },
        "Legal representative": {
          UserType: userType,
          IDNumber: userClaims?.UserID,
          MainGovernment: mainCategory || "",
          SubGovernment: subCategory || "",
        },
      };

      triggerCaseDetailsQuery({
        ...userConfigs[userType],
        CaseID: caseId,
        AcceptedLanguage: userClaims?.AcceptedLanguage?.toUpperCase() || "EN",
        SourceSystem: "E-Services",
      });
      setHasAttemptedFetch(true);
    }
  }, [caseId, userType, userClaims, mainCategory, subCategory, triggerCaseDetailsQuery, isFormInitialized, hasAttemptedFetch]);

  // Show error toast if case details fetch fails
  useEffect(() => {
    if (caseDetailsError) {
      toast.error(t("error_loading_hearing"));
    }
  }, [caseDetailsError, t]);

  // Set form values from case details if available, otherwise from NIC details
  useEffect(() => {
    if (isFormInitialized) return; // Skip if form is already initialized

    if (caseDetailsData?.CaseDetails) {
      const details = caseDetailsData.CaseDetails;
      // Set values from case details using exact field names from API response
      setValue("DefendantsEstablishmentPrisonerName", details.DefendantName);
      setValue("DefendantsEstablishmentRegion", details.Defendant_Region_Code);
      setValue("DefendantsEstablishmentCity", details.Defendant_City_Code);
      setValue("DefendantsEstablishOccupation", details.Defendant_Occupation_Code);
      setValue("DefendantsEstablishmentGender", details.Defendant_Gender_Code);
      setValue("DefendantsEstablishmentNationality", details.Defendant_Nationality_Code);
      setValue("DefendantsEstablishmentPrisonerId", details.DefendantId);
      setValue("mobileNumber", details.Defendant_PhoneNumber);

      // Handle date fields
      if (details.DefendantHijiriDOB) {
        setValue("def_date_hijri", details.DefendantHijiriDOB);
      }
      if (details.Defendant_ApplicantBirthDate) {
        // Convert YYYYMMDD to YYYY-MM-DD format if needed
        const birthDate = details.Defendant_ApplicantBirthDate;
        const formattedDate = `${birthDate.substring(0, 4)}-${birthDate.substring(4, 6)}-${birthDate.substring(6, 8)}`;
        setValue("def_date_gregorian", formattedDate);
      }

      // Set national ID if available
      if (details.DefendantId) {
        setValue("nationalIdNumber", details.DefendantId);
        setCookie("nationalIdNumber", details.DefendantId);
      }

      // Set dropdown values with proper labels
      setValue("region", { 
        value: details.Defendant_Region_Code || "", 
        label: details.Defendant_Region || "" 
      });
      setValue("city", { 
        value: details.Defendant_City_Code || "", 
        label: details.Defendant_City || "" 
      });
      setValue("occupation", { 
        value: details.Defendant_Occupation_Code || "", 
        label: details.Defendant_Occupation || "" 
      });
      setValue("gender", { 
        value: details.Defendant_Gender_Code || "", 
        label: details.Defendant_Gender || "" 
      });
      setValue("nationality", { 
        value: details.Defendant_Nationality_Code || "", 
        label: details.Defendant_Nationality || "" 
      });
      setIsFormInitialized(true);
    } else if (nicData?.NICDetails && !isFormInitialized) {
      // Fall back to NIC details if case details not available
      setValue("DefendantsEstablishmentPrisonerName", nicData?.NICDetails?.PlaintiffName);
      setValue("DefendantsEstablishmentRegion", nicData?.NICDetails?.Region_Code);
      setValue("DefendantsEstablishmentCity", nicData?.NICDetails?.City_Code);
      setValue("DefendantsEstablishOccupation", nicData?.NICDetails?.Occupation_Code);
      setValue("DefendantsEstablishmentGender", nicData?.NICDetails?.Gender_Code);
      setValue("DefendantsEstablishmentNationality", nicData?.NICDetails?.Nationality_Code);
      setValue("DefendantsEstablishmentPrisonerId", watchNationalId);

      setValue("region", { value: nicData?.NICDetails?.Region_Code || "", label: nicData?.NICDetails?.Region || "" });
      setValue("city", { value: nicData?.NICDetails?.City_Code || "", label: nicData?.NICDetails?.City || "" });
      setValue("occupation", { value: nicData?.NICDetails?.Occupation_Code || "", label: nicData?.NICDetails?.Occupation || "" });
      setValue("gender", { value: nicData?.NICDetails?.Gender_Code || "", label: nicData?.NICDetails?.Gender || "" });
      setValue("nationality", { value: nicData?.NICDetails?.Nationality_Code || "", label: nicData?.NICDetails?.Nationality || "" });
      setIsFormInitialized(true);
    }
  }, [caseDetailsData, nicData, setValue, watchNationalId, isFormInitialized, setCookie]);

  // Clear form fields when NIC validation changes
  useEffect(() => {
    if (!isValidCallNic && !isFormInitialized) {
      [
        "DefendantsEstablishmentPrisonerName",
        "mobileNumber",
        "region",
        "city",
        "occupation",
        "gender",
        "nationality",
        "DefendantsEstablishmentPrisonerId",
      ].forEach((f) => setValue(f as any, ""));
    }
  }, [isValidCallNic, setValue, isFormInitialized]);

  // Update NIC validation state
  useEffect(() => {
    const isValid = watchNationalId?.length === 10;
    const hasDateOfBirth = !!watchDateOfBirth;
    setIsValidCallNic(isValid && hasDateOfBirth);
    
    if (isValid && hasDateOfBirth) {
      setCookie("nationalIdNumber", watchNationalId);
    }
  }, [watchNationalId, watchDateOfBirth, setCookie]);

  //#endregion Hassan Work Here 

  const RegionOptions = React.useMemo(() => {
    return (
      regionData && regionData?.DataElements?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || []
    );
  }, [regionData]);

  const CityOptions = React.useMemo(() => {
    return (
      cityData && cityData?.DataElements?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || []
    );
  }, [cityData]);

  const occupationOptions = React.useMemo(() => {
    return (
      occupationData && occupationData?.DataElements?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || options
    );
  }, [occupationData]);

  const genderOptions = React.useMemo(() => {
    return (
      genderData && genderData?.DataElements?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || options
    );
  }, [genderData]);

  const nationalityOptions = React.useMemo(() => {
    return (
      nationalityData && nationalityData?.DataElements?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || options
    );
  }, [nationalityData]);

  return [
    {
      title: t("tab2_title"),
      children: [
        {
          type: "input",
          name: "nationalIdNumber",
          label: t("nicDetails.national_id_number"),
          inputType: "text",
          placeholder: "10xxxxxxxx",
          maxLength: 10,
          validation: {
            required: t("nationalIdValidation"),
            validate: (value) =>
              value?.length === 10 || "National ID must be exactly 10 digits",
          },
        },
        {
          name: "establishmentDefendantDateBirth",
          type: "dateOfBirth" as const,
          hijriLabel: t("establishment_tab2.dobHijri"),
          gregorianLabel: t("establishment_tab2.dobGrog"),
          hijriFieldName: "def_date_hijri",
          gregorianFieldName: "def_date_gregorian",
          validation: { required: t("dateOfBirthValidation") },
          value: {
            hijri: caseDetailsData?.CaseDetails?.DefendantHijiriDOB || "",
            gregorian: caseDetailsData?.CaseDetails?.Defendant_ApplicantBirthDate ? 
              `${caseDetailsData.CaseDetails.Defendant_ApplicantBirthDate.substring(0, 4)}-${caseDetailsData.CaseDetails.Defendant_ApplicantBirthDate.substring(4, 6)}-${caseDetailsData.CaseDetails.Defendant_ApplicantBirthDate.substring(6, 8)}` : ""
          },
          disabled: disableNicFields,
        },
        {
          type: !nicData?.NICDetails?.PlaintiffName ? "input" : "readonly",
          label: t("establishment_tab2.name"),
          value: nicData?.NICDetails?.PlaintiffName,
          isLoading: nicIsLoading,
          name: "DefendantsEstablishmentPrisonerName",
          ...(nicData?.NICDetails?.PlaintiffName && {
            inputType: "text",
          }),
          ...(!nicData?.NICDetails?.PlaintiffName && {
            validation: { required: t("defendantNameValidation") },
          }),
          disabled: disableNicFields,
        },
        {
          type: "input",
          name: "mobileNumber",
          label: t("establishment_tab2.mobileNumber"),
          inputType: "number",
          placeholder: "05xxxxxxxx",
          validation: {
            required: t("phoneNumberValidation"),
            pattern: {
              value: /^05\d{8}$/,
              message: t("phoneValidationMessage"),
            },
          },
          disabled: disableNicFields,
        },
        {
          type: nicData?.NICDetails?.Region ? "readonly" : "autocomplete",
          name: "region",
          isLoading: isRegionLoading,
          label: t("region"),
          value: nicData?.NICDetails?.Region || "",
          ...(nicData?.NICDetails?.Region ? {} : {
            options: RegionOptions || [],
            validation: { required: t("regionValidation") },
          }),
          disabled: disableNicFields,
        },
        {
          type: nicData?.NICDetails?.City ? "readonly" : "autocomplete",
          name: "city",
          isLoading: isCityLoading,
          label: t("city"),
          value: nicData?.NICDetails?.City || "",
          ...(nicData?.NICDetails?.City ? {} : {
            options: CityOptions || [],
            validation: { required: t("cityValidation") },
          }),
          disabled: disableNicFields,
        },
        {
          isLoading: nicIsLoading,
          type: nicData?.NICDetails?.Occupation ? "readonly" : "autocomplete",
          name: "occupation",
          label: t("occupation"),
          value: nicData?.NICDetails?.Occupation || "", // Fallback empty string
          ...(nicData?.NICDetails?.Occupation ? {} : {
            options: occupationOptions || [], // Fallback empty array
            validation: { required: t("occupationValidation") },
          }),
          disabled: disableNicFields,
        },
        {
          isLoading: nicIsLoading,
          type: nicData?.NICDetails?.Gender ? "readonly" : "autocomplete",
          name: "gender",
          label: t("gender"),
          value: nicData?.NICDetails?.Gender || "", // Fallback empty string
          ...(nicData?.NICDetails?.Gender ? {} : {
            options: genderOptions || [], // Fallback empty array
            validation: { required: t("genderValidation") },
          }),
          disabled: disableNicFields,
        },
        {
          isLoading: nicIsLoading,
          type: nicData?.NICDetails?.Nationality ? "readonly" : "autocomplete",
          name: "nationality",
          label: t("nationality"),
          value: nicData?.NICDetails?.Nationality || "", // Fallback empty string
          ...(nicData?.NICDetails?.Nationality ? {} : {
            options: nationalityOptions || [], // Fallback empty array
            validation: { required: t("nationalityValidation") },
          }),
          disabled: disableNicFields,
        },
      ],
    },
  ] as SectionLayout[];
};
