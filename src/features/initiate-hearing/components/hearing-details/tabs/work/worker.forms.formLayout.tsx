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

export const useFormLayout = (
  setValue: UseFormSetValue<FormData>,
  watch: UseFormWatch<FormData>,
  salaryTypeData: any,
  contractTypeData: any,
  ExtractEstbAData: any,
  regionData: any,
  cityData: any,
  laborOfficeData?: any,
  selectedWorkerCity?: any,
  isRegionLoading?: boolean,
  isCityLoading?: boolean,
  isLaborLoading?: boolean,
  DefendantType?: any
): SectionLayout[] => {
  const [getCookie, setCookie] = useCookieState({ caseId: "" });
  const isStillEmployed: any = watch("isStillEmployed" as any);
  const { t } = useTranslation("hearingdetails");
  const contractType: any = watch("contractType");
  const TypeOfWageOptions = React.useMemo(() => {
    return (
      salaryTypeData?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || options
    );
  }, [salaryTypeData]);

  const ContractTypeOptions = React.useMemo(() => {
    return (
      contractTypeData?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || options
    );
  }, [contractTypeData]);

  const LaborOfficeTypeOptions = React.useMemo(() => {
    return (
      laborOfficeData?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || []
    );
  }, [laborOfficeData]);

  const RegionOptions = React.useMemo(() => {
    return (
      regionData?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || []
    );
  }, [regionData]);

  const CityOptions = React.useMemo(() => {
    return (
      cityData?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || []
    );
  }, [cityData]);
  const isNonGovrnEstab =
    getCookie("defendantDetails") === "Others" &&
    (getCookie("defendantTypeInfo") === "Establishment" ||
      getCookie("defendantTypeInfo") === "Government");

  // //console.log("isNonGovrnEstab", isNonGovrnEstab);

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
          min: 0,
          inputType: "number",
          placeholder: "10000 SAR",
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


        {
          name: "contractDateHijri",
          type: "dateOfBirth",
          hijriLabel: t("contractDateHijri"),
          gregorianLabel: t("contractDateGregorian"),
          hijriFieldName: "contractDateHijri",
          gregorianFieldName: "contractDateGregorian",
          validation: { required: t("contractDateValidation") },
        },

        ...((ContractTypeOptions.length === 2 &&
          contractType?.value !== "CT2") ||
          ContractTypeOptions.length > 2
          ? [
            {
              name: "contractExpiryDateHijri",
              type: "dateOfBirth",
              hijriLabel: t("contractExpiryDateHijri"),
              gregorianLabel: t("contractExpiryDateGregorian"),
              hijriFieldName: "contractExpiryDateHijri",
              gregorianFieldName: "contractExpiryDateGregorian",
            },
          ]
          : []),

        ...(contractType?.value === "CT4"
          ? [
            {
              type: "input",
              name: "salaryOtherType",
              label: t("contractType"),
              inputType: "text",
              placeholder: t("otherSalaryPlaceholder"),
              validation: { required: t("contractOtherTypeValidation") },
            },
          ]
          : []),



        /*
        حسن شغال هنا ولسة ما خصلتش
        المقروض اني اعرف بينات العامل لو كان اشتغل قبل كدة واعرض التاريخ بداية ونهاية 
        */



        !!isNonGovrnEstab
          ? {
            type: "checkbox",
            name: "isStillEmployed",
            label: t("stillEmployed"),
            checked: isStillEmployed,
            onChange: (checked) =>
              setValue("isStillEmployed" as any, checked),
          }
          : {
            title: t(""),
            type: "readonly",
            label: t("stillEmployed"),
            value: ExtractEstbAData?.StillWorking === "Y" ? "YES" : "NO",
          },
        ...(ExtractEstbAData?.StillWorking === "N" || !isStillEmployed
          ? [
            !!isNonGovrnEstab
              ? {
                name: "dateofFirstworkingdayHijri",
                type: "dateOfBirth",
                hijriLabel: t("dateofFirstworkingdayHijri"),
                gregorianLabel: t("dateofFirstworkingdayGregorian"),
                hijriFieldName: "dateofFirstworkingdayHijri",
                gregorianFieldName: "dateOfFirstWorkingDayGregorian",
                onChange: (value: Option) =>
                  setValue(
                    "contractType",
                    ExtractEstbAData?.ServiceEndDate
                  ),
                ...(((ExtractEstbAData &&
                  ExtractEstbAData?.ServiceEndDate) ||
                  ExtractEstbAData?.StillWorking !== "Y") && {
                  validation: {
                    required: t("firstWorkingDateValidation"),
                  },
                }),
              }
              : {
                title: t(""),
                type: "readonly",
                label: t("firstWorkingDayGregorian"),
                value: formatDateGMT(ExtractEstbAData?.ServiceEndDate),
              },
            ExtractEstbAData?.StillWorking == "N" && {
              title: t(""),
              type: "readonly",
              label: t("lastWorkingDayGregorian"),
              value: formatDateGMT(ExtractEstbAData?.ServiceEndDate),
            },

            ,
            ...(ExtractEstbAData?.StillWorking === "N" || !isStillEmployed
              ? [
                !!isNonGovrnEstab
                  ? {
                    name: "dateoflastworkingdayHijri",
                    type: "dateOfBirth",
                    hijriLabel: t("dateoflastworkingdayHijri"),
                    gregorianLabel: t("dateoflastworkingdayGregorian"),
                    hijriFieldName: "dateoflastworkingdayHijri",
                    gregorianFieldName: "dateOfLastWorkingDayGregorian",
                    onChange: (value: Option) =>
                      setValue(
                        "contractType",
                        ExtractEstbAData?.ServiceEndDate
                      ),
                    ...(((ExtractEstbAData &&
                      ExtractEstbAData?.ServiceEndDate) ||
                      ExtractEstbAData?.StillWorking !== "Y") && {
                      validation: {
                        required: t("lastWorkingDateValidation"),
                      },
                    }),
                  }
                  : null,
              ].filter(Boolean) // This will remove any null values from the array
              : ExtractEstbAData?.StillWorking === "Y"
                ? []
                : [
                  {
                    title: t(""),
                    type: "readonly",
                    label: t("lastWorkingDayGregorian"),
                    value: formatDateGMT(ExtractEstbAData?.ServiceEndDate),
                  },
                ]),
          ]
          : [
            !!isNonGovrnEstab
              ? {
                name: "dateofFirstworkingdayHijri",
                type: "dateOfBirth",
                hijriLabel: t("dateofFirstworkingdayHijri"),
                gregorianLabel: t("dateofFirstworkingdayGregorian"),
                hijriFieldName: "dateofFirstworkingdayHijri",
                gregorianFieldName: "dateofFirstWorkingDayGregorian",
                onChange: (value: Option) =>
                  setValue(
                    "contractType",
                    ExtractEstbAData?.ServiceEndDate
                  ),
                ...(((ExtractEstbAData &&
                  ExtractEstbAData?.ServiceEndDate) ||
                  ExtractEstbAData?.StillWorking !== "Y") && {
                  validation: {
                    required: t("firstWorkingDateValidation"),
                  },
                }),
              }
              : {
                title: t(""),
                type: "readonly",
                label: t("firstWorkingDayGregorian"),
                value: formatDateGMT(ExtractEstbAData?.ServiceEndDate),
              },
          ]),





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
          name: "laborOffice",
          type: "readonly",
          label: t("nicDetails.nearestOffice"),
          value: laborOfficeData?.[0]?.ElementValue,
        },
      ],
    },
  ] as SectionLayout[];
};
