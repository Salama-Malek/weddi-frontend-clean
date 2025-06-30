import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { SectionLayout, FormData } from "@/shared/components/form/form.types";
import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { genderData } from "@/mock/genderData";
import { options } from "@/features/initiate-hearing/config/Options";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { useGetGenderLookupDataQuery, useGetNationalityLookupDataQuery, useGetNICDetailsQuery, useGetOccupationLookupDataQuery, useGetWorkerCityLookupDataQuery, useGetWorkerRegionLookupDataQuery } from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";
import { setFormatDate } from "@/utils/formatters";
import { formatDateToYYYYMMDD } from "@/shared/utils/dateUtils";

interface EstablishmentDefendantFormLayoutProps {
  setValue?: UseFormSetValue<FormData>;
  watch?: UseFormWatch<FormData>;
  applicantType?: string;
  data?: any;
  nationalIdNumber?: any
}

export const useEstablishmentDefendantFormLayout = ({

  setValue,
  selectedWorkerRegion2,
  watch
}: any): SectionLayout[] => {

  const { t, i18n } = useTranslation("hearingdetails");
  const [, setCookie] = useCookieState();

  //#region Hassan Work Here

  const [isValidCallNic, setIsValidCallNic] = useState<boolean>(false);
  const watchNationalId = watch?.("nationalIdNumber");
  const watchDateOfBirth = watch?.("def_date_hijri");






  // Lookups Apis Calls  
  //<=============================API CALLS Gender,Occupation,Nationality,Region,City===================================>

  const { data: regionData, isLoading: isRegionLoading } = useGetWorkerRegionLookupDataQuery({
    AcceptedLanguage: i18n.language === "ar" ? "AR" : "EN",
    SourceSystem: "E-Services",
    ModuleKey: "WorkerRegion",
    ModuleName: "WorkerRegion",
  });
  //<=============================API CALLS===================================>
  const { data: cityData, isLoading: isCityLoading } = useGetWorkerCityLookupDataQuery(
    {
      AcceptedLanguage: i18n.language === "ar" ? "AR" : "EN",
      SourceSystem: "E-Services",
      selectedWorkerRegion: typeof selectedWorkerRegion2 === 'object' ? selectedWorkerRegion2?.value : selectedWorkerRegion2 || "",
      ModuleName: "WorkerCity",
    },
    { skip: !(typeof selectedWorkerRegion2 === 'object' ? selectedWorkerRegion2?.value : selectedWorkerRegion2) }
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






  const {
    data: nicData,
    isSuccess: nicIsSuccess,
    isFetching: nicIsLoading,
    isError,
  } = useGetNICDetailsQuery(
    {
      IDNumber: watchNationalId || "",
      DateOfBirth: formatDateToYYYYMMDD(watchDateOfBirth) || "",
      AcceptedLanguage: i18n.language === "ar" ? "AR" : "EN",
      SourceSystem: "E-Services",
    },
    {
      skip: (!isValidCallNic)

    }
  );


  useEffect(() => {

    const isValid = watchNationalId?.length === 10;
    //console.log(watchNationalId, watchDateOfBirth);

    if (isValid && watchDateOfBirth) {
      setIsValidCallNic(isValid);
      setCookie("nationalIdNumber", watchNationalId);
    }

  }, [watchNationalId, watchDateOfBirth])




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


  useEffect(() => {
    if (nicData?.NICDetails) {
      // Set values with proper codes
      setValue("DefendantsEstablishmentPrisonerName", nicData?.NICDetails?.PlaintiffName, {
        shouldValidate: nicData?.NICDetails?.PlaintiffName,
      });
      setValue("DefendantsEstablishmentRegion", nicData?.NICDetails?.Region_Code || nicData?.NICDetails?.Region, {
        shouldValidate: nicData?.NICDetails?.Region,
      });
      setValue("DefendantsEstablishmentCity", nicData?.NICDetails?.City_Code || nicData?.NICDetails?.City, {
        shouldValidate: nicData?.NICDetails?.City,
      });
      setValue("DefendantsEstablishOccupation", nicData?.NICDetails?.Occupation_Code || nicData?.NICDetails?.Occupation, {
        shouldValidate: nicData?.NICDetails?.Occupation,
      });
      setValue("DefendantsEstablishmentGender", nicData?.NICDetails?.Gender_Code || nicData?.NICDetails?.Gender, {
        shouldValidate: nicData?.NICDetails?.Gender,
      });
      setValue("DefendantsEstablishmentNationality", nicData?.NICDetails?.Nationality_Code || nicData?.NICDetails?.Nationality, {
        shouldValidate: nicData?.NICDetails?.Nationality,
      });
      setValue("DefendantsEstablishmentPrisonerId", watchNationalId);
    }
  }, [nicData]);



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
        },
        {
          type: "input",
          name: "mobileNumber",
          label: t("establishment_tab2.mobileNumber"),
          inputType: "text",
          placeholder: "05xxxxxxxx",
          validation: {
            required: t("phoneNumberValidation"),
            pattern: {
              value: /^05\d{8}$/,
              message: t("phoneValidationMessage"),
            },
          },
        },
        {
          type: nicData?.NICDetails?.Region ? "readonly" : "autocomplete",
          name: "DefendantsEstablishmentRegion",
          isLoading: isRegionLoading,
          label: t("region"),

          value: nicData?.NICDetails?.Region || "",
          ...(nicData?.NICDetails?.Region ? {} : {
            options: RegionOptions || [],
            validation: { required: t("regionValidation") },
          }),
        },
        {
          type: nicData?.NICDetails?.City ? "readonly" : "autocomplete",
          name: "DefendantsEstablishmentCity",
          isLoading: isCityLoading,
          label: t("city"),
          value: nicData?.NICDetails?.City || "",
          ...(nicData?.NICDetails?.City ? {} : {
            options: CityOptions || [],
            validation: { required: t("cityValidation") },
          }),
        },
        {
          isLoading: nicIsLoading,
          type: nicData?.NICDetails?.Occupation ? "readonly" : "autocomplete",
          name: "DefendantsEstablishOccupation",
          label: t("occupation"),
          value: nicData?.NICDetails?.Occupation || "",
          ...(nicData?.NICDetails?.Occupation ? {} : {
            options: occupationOptions || [],
            validation: { required: t("occupationValidation") },
          }),
        },
        {
          isLoading: nicIsLoading,
          type: nicData?.NICDetails?.Gender ? "readonly" : "autocomplete",
          name: "DefendantsEstablishmentGender",
          label: t("gender"),
          value: nicData?.NICDetails?.Gender || "",
          ...(nicData?.NICDetails?.Gender ? {} : {
            options: genderOptions || [],
            validation: { required: t("genderValidation") },
          }),

        },
        {
          isLoading: nicIsLoading,
          type: nicData?.NICDetails?.Nationality ? "readonly" : "autocomplete",
          name: "DefendantsEstablishmentNationality",
          label: t("nationality"),
          value: nicData?.NICDetails?.Nationality || "",
          ...(nicData?.NICDetails?.Nationality ? {} : {
            options: nationalityOptions || [],
            validation: { required: t("nationalityValidation") },
          }),
        },


      ],
    },
  ] as SectionLayout[];
};
