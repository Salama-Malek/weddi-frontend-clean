import { UseFormSetValue, UseFormWatch, Control, UseFormTrigger } from "react-hook-form";
import { useTranslation } from "react-i18next";
import HijriDateField from "@/shared/components/calanders/NewDatePicker";

import {
  Option,
  SectionLayout,
  FormData,
} from "@/shared/components/form/form.types";
import React, { useEffect } from "react";
import { options } from "@/features/initiate-hearing/config/Options";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
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
  control: Control<FormData>,
  watch: UseFormWatch<FormData>,
  // trigger: UseFormTrigger<FormData>
): SectionLayout[] => {
  const isStillEmployed: any = watch("isStillEmployed" as any);
  const { t, i18n } = useTranslation("hearingdetails");
  const selectedWorkerRegion = watch("region");
  const selectedWorkerCity = watch("city");
  const currentLanguage = i18n.language.toUpperCase();

  const { data: salaryTypeData } = useGetSalaryTypeLookupQuery({
    AcceptedLanguage: i18n.language.toUpperCase(),
  });

  const [getCookie] = useCookieState({ caseId: "" });
  const userType = getCookie("userType") || "";
  const defendantStatus = getCookie("defendantStatus") || "";
  const legalRepType = getCookie("legalRepType");

  const [
    triggerContractType,
    { data: contractTypeData, isFetching: isContractTypeLoading },
  ] = useLazyGetContractTypeLookupQuery();

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

  const { data: laborOfficeData, isFetching: isLaborLoading } =
    useGetLaborOfficeLookupDataQuery(
      {
        AcceptedLanguage: i18n.language.toUpperCase(),
        SourceSystem: "E-Services",
        selectedWorkerCity,
      },
      { skip: !selectedWorkerCity }
    );

  const TypeOfWageOptions = React.useMemo(() => {
    if (!salaryTypeData?.DataElements) return options;
    return salaryTypeData.DataElements.map((item: any) => ({
      value: item.ElementKey,
      label: item.ElementValue,
    }));
  }, [salaryTypeData]);

  const ContractTypeOptions = React.useMemo(() => {
    if (!contractTypeData?.DataElements) return options;
    return contractTypeData.DataElements.map((item: any) => ({
      value: item.ElementKey,
      label: item.ElementValue,
    }));
  }, [contractTypeData]);

  const RegionOptions = React.useMemo(() => {
    if (!regionData?.DataElements) return [];
    return regionData.DataElements.map((item: any) => ({
      value: item.ElementKey,
      label: item.ElementValue,
    }));
  }, [regionData]);

  const CityOptions = React.useMemo(() => {
    if (!cityData?.DataElements) return [];
    return cityData.DataElements.map((item: any) => ({
      value: item.ElementKey,
      label: item.ElementValue,
    }));
  }, [cityData]);

  // Add watchers for dependent fields
  const contractEndDate = watch("contractExpiryDateHijri");
  const workStartDate = watch("dateofFirstworkingdayHijri");
  const workEndDate = watch("dateoflastworkingdayHijri");

  // // Trigger validation when contract end date changes
  // useEffect(() => {
  //   if (workEndDate) {
  //     trigger("dateoflastworkingdayHijri");
  //   }
  // }, [contractEndDate, trigger]);

  // // Trigger validation when work start date changes
  // useEffect(() => {
  //   if (workEndDate) {
  //     trigger("dateoflastworkingdayHijri");
  //   }
  // }, [workStartDate, trigger]);

  return [
    {
      title: t("tab3_title"),
      children: [
        {
          type: "autocomplete",
          name: "typeOfWage",
          label: t("typeOfWage"),
          options: TypeOfWageOptions,
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
          onChange: (value: Option) => setValue("contractType", value),
          validation: { required: t("contractTypeValidation") },
        },
        {
          type: "input",
          name: "contractNumber",
          label: t("contractNumber"),
          inputType: "number",
          placeholder: "123457543",
          notRequired: true,
          validation: {
            maxLength: { value: 10, message: t("max10Validation") },
            pattern: { value: /^\d{0,10}$/, message: t("max10ValidationDesc") },
          },
        },
        {
          type: "custom",
          name: "contractStartDate",
          component: (
            <HijriDateField
              control={control}
              setValue={setValue}
              hijriFieldName="contractDateHijri"
              gregorianFieldName="contractDateGregorian"
              hijriLabel={t("contractDateHijri")}
              gregorianLabel={t("contractDateGregorian")}
              type="contract-start"
              relatedEndDate={watch("contractExpiryDateHijri") as string}
            />
          ),
        },
        {
          type: "custom",
          name: "contractEndDate",
          component: (
            <HijriDateField
              control={control}
              setValue={setValue}
              hijriFieldName="contractExpiryDateHijri"
              gregorianFieldName="contractExpiryDateGregorian"
              hijriLabel={t("contractExpiryDateHijri")}
              gregorianLabel={t("contractExpiryDateGregorian")}
              type="contract-end"
              relatedStartDate={watch("contractDateHijri") as string}
            />
          ),
        },
        {
          type: "checkbox",
          name: "isStillEmployed",
          label: t("stillEmployed"),
          checked: isStillEmployed,
          onChange: (checked) => setValue("isStillEmployed" as any, checked),
        },
        {
          type: "custom",
          name: "firstWorkingDate",
          component: (
            <HijriDateField
              control={control}
              setValue={setValue}
              hijriFieldName="dateofFirstworkingdayHijri"
              gregorianFieldName="dateOfFirstWorkingDayGregorian"
              hijriLabel={t("dateofFirstworkingdayHijri")}
              gregorianLabel={t("dateofFirstworkingdayGregorian")}
              type="work-start"
              relatedEndDate={watch("contractExpiryDateHijri")}
            />
          ),
        },
        ...(!isStillEmployed
          ? [
              {
                type: "custom",
                name: "lastWorkingDate",
                component: (
                  <HijriDateField
                    control={control}
                    setValue={setValue}
                    hijriFieldName="dateoflastworkingdayHijri"
                    gregorianFieldName="dateofLastworkingdayGregorian"
                    hijriLabel={t("dateoflastworkingdayHijri")}
                    gregorianLabel={t("dateofLastworkingdayGregorian")}
                    type="work-end"
                    relatedStartDate={watch("dateofFirstworkingdayHijri")}
                    relatedEndDate={watch("contractExpiryDateHijri")}
                  />
                ),
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
