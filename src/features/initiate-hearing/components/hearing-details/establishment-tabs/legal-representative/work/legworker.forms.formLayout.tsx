import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import {
  Option,
  SectionLayout,
  FormData,
} from "@/shared/components/form/form.types";
import React, { useEffect } from "react";
import { options } from "@/features/initiate-hearing/config/Options";
import { formatDateGMT, formatHijriDate } from "@/shared/lib/helpers";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { placeholderCSS } from "react-select/dist/declarations/src/components/Placeholder";
import {
  useGetLaborOfficeLookupDataQuery,
  useGetWorkerCityLookupDataQuery,
  useGetWorkerRegionLookupDataQuery,
} from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";
import {
  useGetContractTypeLookupQuery,
  useGetSalaryTypeLookupQuery,
  useLazyGetContractTypeLookupQuery,
} from "@/features/initiate-hearing/api/create-case/workDetailApis";

export const legRepVsWorkerUseFormLayout = (
  setValue: UseFormSetValue<FormData>,
  watch: UseFormWatch<FormData>
): SectionLayout[] => {
  const isStillEmployed: any = watch("isStillEmployed" as any);
  const { t, i18n } = useTranslation("hearingdetails");
  const selectedWorkerRegion = watch("region");
  const selectedWorkerCity = watch("city");
  // const [getCookie] = useCookieState({ caseId: "" });
  // const userType = getCookie("userType") || "";
  // const defendantStatus = getCookie("defendantStatus") || "";
  const currentLanguage = i18n.language.toUpperCase();

  //#region Calling Apis

  const { data: salaryTypeData } = useGetSalaryTypeLookupQuery({
    AcceptedLanguage: i18n.language.toUpperCase(),
  });


const [getCookie] = useCookieState({ caseId: "" });
const userType = getCookie("userType") || "";
// const rawUserType = getCookie("userType") || "";
// const userType = decodeURIComponent(rawUserType).toLowerCase();

const defendantStatus = getCookie("defendantStatus") || "";
  const legalRepType = getCookie("legalRepType");

const [
  triggerContractType,
  { data: contractTypeData, isFetching: isContractTypeLoading }
] = useLazyGetContractTypeLookupQuery();

// 2. Fire it once our cookies are decoded
useEffect(() => {
  if (userType || legalRepType || defendantStatus) {
    triggerContractType({
      userType,
      legalRepType,
      defendantStatus,
      AcceptedLanguage: currentLanguage,
    });
  }
}, [
  userType,
  legalRepType,
  defendantStatus,
  currentLanguage,
  triggerContractType,
]);


  // —————— Fixed “Gov’t / Legal rep” call ——————
  // const { data: contractTypeData, refetch } = useGetContractTypeLookupQuery(
  //   {
  //     AcceptedLanguage: i18n.language.toUpperCase(),
  //     SourceSystem: "E-Services",
  //     userType: "Legal representative",
  //     defendantStatus: "Government"
  //   },
  //   {
  //     // always run
  //     skip: false
  //   }
  // );

  const { data: regionData, isFetching: isRegionLoading } =
    useGetWorkerRegionLookupDataQuery({
      AcceptedLanguage: i18n.language.toUpperCase(),
      SourceSystem: "E-Services",
      ModuleKey: "JobLocation",
      ModuleName: "JobLocation",
    });

  const { data: cityData, isFetching: isCityLoading } =
    useGetWorkerCityLookupDataQuery(
      {
        AcceptedLanguage: i18n.language.toUpperCase(),
        SourceSystem: "E-Services",
        selectedWorkerRegion,
        ModuleName: "JobLocationCity",
      },
      { skip: !selectedWorkerRegion }
    );

  //<=============================API CALLS===================================>
  const { data: laborOfficeData, isFetching: isLaborLoading } =
    useGetLaborOfficeLookupDataQuery(
      {
        AcceptedLanguage: i18n.language.toUpperCase(),
        SourceSystem: "E-Services",
        selectedWorkerCity,
      },
      { skip: !selectedWorkerCity }
    );

  //#endregion Calling Apis

  const TypeOfWageOptions = React.useMemo(() => {
    return (
      (salaryTypeData &&
        salaryTypeData?.DataElements?.map((item: any) => ({
          value: item.ElementKey,
          label: item.ElementValue,
        }))) ||
      options
    );
  }, [salaryTypeData]);

  const ContractTypeOptions = React.useMemo(() => {
    return (
      (contractTypeData &&
        contractTypeData?.DataElements?.map((item: any) => ({
          value: item.ElementKey,
          label: item.ElementValue,
        }))) ||
      options
    );
  }, [contractTypeData]);

  const LaborOfficeTypeOptions = React.useMemo(() => {
    return (
      (laborOfficeData &&
        laborOfficeData?.DataElements?.map((item: any) => ({
          value: item.ElementKey,
          label: item.ElementValue,
        }))) ||
      []
    );
  }, [laborOfficeData]);

  const RegionOptions = React.useMemo(() => {
    return (
      (regionData &&
        regionData?.DataElements?.map((item: any) => ({
          value: item.ElementKey,
          label: item.ElementValue,
        }))) ||
      []
    );
  }, [regionData]);

  const CityOptions = React.useMemo(() => {
    return (
      (cityData &&
        cityData?.DataElements?.map((item: any) => ({
          value: item.ElementKey,
          label: item.ElementValue,
        }))) ||
      []
    );
  }, [cityData]);

  return [
    {
      title: t("tab3_title"),
      children: [
        {
          type: "autocomplete",
          name: "typeOfWage",
          label: t("typeOfWage"),
          options: TypeOfWageOptions,
          //@ts-ignore
          onChange: (value: Option) => {
            setValue("typeOfWage", value);
          },
          validation: { required: t("salaryTypeValidation") },
        },
        {
          type: "input",
          name: "salary",
          label: t("currentSalary"),
          inputType: "number",
          placeholder: "10000 SAR",
          min: 0,
          validation: { required: t("currentSalaryValidation") },
        },

        {
          type: "autocomplete",
          name: "contractType",
          label: t("contractType"),
          options: ContractTypeOptions,
          //@ts-ignore
          onChange: (value: Option) => setValue("contractType", value),
          validation: {
            required: t("contractTypeValidation"),
          },
        },

        {
          type: "input",
          name: "contractNumber",
          label: t("contractNumber"),
          inputType: "number",
          placeholder: "123457543",
          notRequired: true,
          validation: {
            maxLength: {
              value: 10,
              message: t("max10Validation"),
            },
            pattern: {
              value: /^\d{0,10}$/,
              message: t("max10ValidationDesc"),
            },
          },
        },
        // {
        //   type: "input",
        //   name: "contractNumber",
        //   label: t("contractNumber"),
        //   inputType: "number",
        //   placeholder: "123457543",
        //   validation: {
        //     // required: t("contractNumberValidation"),
        //     maxLength: {
        //       value: 10,
        //       message: t("max10Validation"),
        //     },
        //     pattern: {
        //       value: /^\d{0,10}$/,
        //       message: t("max10ValidationDesc"),
        //     },
        //   },

        // },

        {
          name: "contractDateHijri",
          type: "dateOfBirth",
          hijriLabel: t("contractDateHijri"),
          gregorianLabel: t("contractDateGregorian"),
          hijriFieldName: "contractDateHijri",
          gregorianFieldName: "contractDateGregorian",
          validation: { required: t("contractDateValidation") },
        },

        {
          name: "contractExpiryDateHijri",
          type: "dateOfBirth",
          hijriLabel: t("contractExpiryDateHijri"),
          gregorianLabel: t("contractExpiryDateGregorian"),
          hijriFieldName: "contractExpiryDateHijri",
          gregorianFieldName: "contractExpiryDateGregorian",
          validation: { required: "Contract Expiry Date is required" },
        },

        {
          type: "checkbox",
          name: "isStillEmployed",
          label: t("stillEmployed"),
          checked: isStillEmployed,
          onChange: (checked) => setValue("isStillEmployed" as any, checked),
        },

        {
          name: "dateofFirstworkingdayHijri",
          type: "dateOfBirth",
          hijriLabel: t("dateofFirstworkingdayHijri"),
          gregorianLabel: t("dateofFirstworkingdayGregorian"),
          hijriFieldName: "dateofFirstworkingdayHijri",
          gregorianFieldName: "dateOfFirstWorkingDayGregorian",
          validation: {
            required: t("firstWorkingDateValidation"),
          },
        },

        ,
        ...(!isStillEmployed
          ? [
              {
                name: "dateoflastworkingdayHijri",
                type: "dateOfBirth",
                hijriLabel: t("dateoflastworkingdayHijri"),
                gregorianLabel: t("dateofLastworkingdayGregorian"),
                hijriFieldName: "dateoflastworkingdayHijri",
                gregorianFieldName: "dateofLastworkingdayGregorian",
                validation: {
                  required: t("lastWorkingDateValidation"),
                },
              },
            ]
          : []),
      ],
    },

    {
      title: t("workLocationDetails"),
      children: [
        {
          type: "autocomplete",
          name: "region",
          isLoading: isRegionLoading,
          label: t("region"),
          options: RegionOptions,
          onChange: (value: Option) => setValue("region", value),
          validation: { required: t("regionValidation") },
        },

        {
          type: "autocomplete",
          name: "city",
          isLoading: isCityLoading,
          label: t("city"),
          options: CityOptions,
          onChange: (value: Option) => setValue("city", value),
          validation: { required: t("cityValidation") },
        },
        {
          title: t(""),
          isLoading: isLaborLoading,
          type: "readonly",
          name: "laborOffice",
          label: t("nicDetails.nearestOffice"),
          value:
            laborOfficeData?.DataElements &&
            laborOfficeData.DataElements.length > 0
              ? laborOfficeData.DataElements[0].ElementValue
              : "",
        },
      ],
    },
  ] as SectionLayout[];
};
