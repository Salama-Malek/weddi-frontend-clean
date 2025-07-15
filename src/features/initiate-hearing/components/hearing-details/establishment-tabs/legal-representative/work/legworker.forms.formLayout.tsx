import {
  UseFormSetValue,
  UseFormWatch,
  Control,
  UseFormTrigger,
  Controller,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
// import HijriDateField from "@/shared/components/calanders/NewDatePicker";
import { HijriDatePickerInput } from "@/shared/components/calanders/HijriDatePickerInput";
import { GregorianDateDisplayInput } from "@/shared/components/calanders/GregorianDateDisplayInput";
// import DatePicker, { DateObject } from "react-multi-date-picker";
import hijriCalendar from "react-date-object/calendars/arabic";
import gregorianCalendar from "react-date-object/calendars/gregorian";
import gregorianLocaleAr from "react-date-object/locales/gregorian_ar";
import gregorianLocaleEn from "react-date-object/locales/gregorian_en";

import {
  Option,
  SectionLayout,
  FormData,
} from "@/shared/components/form/form.types";
import React, { useEffect, useState } from "react";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import {
  useGetLaborOfficeLookupDataQuery,
  useGetWorkerCityLookupDataQuery,
  useGetWorkerRegionLookupDataQuery,
} from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";
import {
  useGetSalaryTypeLookupQuery,
  useLazyGetContractTypeLookupQuery,
  useLazyGetExtractEstablishmentDataQuery,
} from "@/features/initiate-hearing/api/create-case/workDetailApis";
import { DateObject } from "react-multi-date-picker";
import { useFormResetContext } from "@/providers/FormResetProvider";
import { formatDateString, formatDateToYYYYMMDD } from "@/shared/lib/helpers";
import hijriLocale from "react-date-object/locales/arabic_ar";

// Utility to convert Arabic-Indic numerals to Western numerals
function toWesternDigits(str: string): string {
  return str.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());
}

export const legRepVsWorkerUseFormLayout = (
  setValue: UseFormSetValue<FormData>,
  control: Control<FormData>,
  watch: UseFormWatch<FormData>,
  caseDetailsLoading?: boolean,
  workData?: any
): SectionLayout[] => {
  const { resetField } = useFormResetContext();
  const isStillEmployed: any = watch("isStillEmployed" as any);
  const { t, i18n } = useTranslation("hearingdetails");
  const { t: tPlaceholder } = useTranslation("placeholder");
  const selectedWorkerRegion = watch("region");
  const selectedWorkerCity = watch("city");
  const currentLanguage = i18n.language.toUpperCase();
  const contractType: any = watch("contractType");

  // Add state tracking for manual selections
  const [prevSelectedWorkerRegion, setPrevSelectedWorkerRegion] =
    useState(selectedWorkerRegion);
  const [hasManuallySelectedCity, setHasManuallySelectedCity] = useState(false);
  const [idNumberPlainteff, setIdNumberPlainteff] = useState<string>("");
  const [fileNumberEst, setFileNumberEst] = useState<string>("");
  const [deffendentTypCode, setDeffendentTypCode] = useState<string>("");

  //#region PreFillData If Exist
  const [isPreFill, setIsPreFill] = useState<boolean>(false);

  function setFormFieldsFromWorkData(
    setValue: UseFormSetValue<FormData>,
    workData: any
  ) {
    if (!workData) return;

    console.log("the prefill Data ", workData);

    setValue("salary", workData?.salary ?? "");
    setValue("contractNumber", workData?.contractNumber ?? "");
    setValue("typeOfWage", workData?.typeOfWage ?? null);
    setValue("contractType", workData?.contractType ?? null);
    setValue("region", workData?.jobLocation ?? null);
    setValue("city", workData?.jobCity ?? null);
    setValue("laborOffice", workData?.laborOffice ?? null);

    // Defensive: Only set if non-empty, and use string for date pickers
    setValue("contractDateHijri", workData?.contractStart?.hijri ?? "");
    setValue("contractDateGregorian", workData?.contractStart?.gregorian ?? "");
    setValue("contractExpiryDateHijri", workData?.contractEnd?.hijri ?? "");
    setValue(
      "contractExpiryDateGregorian",
      workData?.contractEnd?.gregorian ?? ""
    );

    setIsPreFill(true);
  }
  useEffect(() => {
    if (workData) {
      // console.log("this is work details object affter filltriantion Called from layout ", workData);
      setFormFieldsFromWorkData(setValue, workData);
    }
  }, [workData]);

  //#endregion PreFillData If Exist

  //#region Calling The Required Lockups

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
    triggerContractType({
      userType,
      legalRepType,
      defendantStatus: deffendentTypCode,
      AcceptedLanguage: currentLanguage,
    });
  }, [
    deffendentTypCode,
    userType,
    legalRepType,
    currentLanguage,
    triggerContractType,
  ]);

  useEffect(() => {
    // Guard: only clear if region has changed to a valid new value
    // AND the user hasn't manually selected a city
    if (
      selectedWorkerRegion &&
      typeof selectedWorkerRegion === "object" &&
      "value" in selectedWorkerRegion &&
      !hasManuallySelectedCity
    ) {
      // Only clear if the region actually changed
      if (selectedWorkerRegion !== prevSelectedWorkerRegion) {
        setValue("city", null);
        setValue("laborOffice", null);
        resetField("city");
        resetField("laborOffice");
        setPrevSelectedWorkerRegion(selectedWorkerRegion);
      }
    } else if (selectedWorkerRegion !== prevSelectedWorkerRegion) {
      // If region changed but user has manually selected city, just update the previous region
      setPrevSelectedWorkerRegion(selectedWorkerRegion);
    }
  }, [
    selectedWorkerRegion,
    hasManuallySelectedCity,
    prevSelectedWorkerRegion,
    setValue,
    resetField,
  ]);

  const { data: regionData, isFetching: isRegionLoading } =
    useGetWorkerRegionLookupDataQuery(
      {
        AcceptedLanguage: i18n.language.toUpperCase(),
        SourceSystem: "E-Services",
        ModuleKey: "JobLocation",
        ModuleName: "JobLocation",
      },
      {
        // Prevent refetching during save operations
        refetchOnMountOrArgChange: false,
        refetchOnFocus: false,
        refetchOnReconnect: false,
      }
    );

  const { data: cityData, isFetching: isCityLoading } =
    useGetWorkerCityLookupDataQuery(
      {
        AcceptedLanguage: i18n.language.toUpperCase(),
        SourceSystem: "E-Services",
        selectedWorkerRegion:
          typeof selectedWorkerRegion === "object"
            ? selectedWorkerRegion?.value
            : selectedWorkerRegion || "",
        ModuleName: "JobLocationCity",
      },
      {
        skip: !(typeof selectedWorkerRegion === "object"
          ? selectedWorkerRegion?.value
          : selectedWorkerRegion),
        // Prevent refetching during save operations
        refetchOnMountOrArgChange: false,
        refetchOnFocus: false,
        refetchOnReconnect: false,
      }
    );

  const { data: laborOfficeData, isFetching: isLaborLoading } =
    useGetLaborOfficeLookupDataQuery(
      {
        AcceptedLanguage: i18n.language.toUpperCase(),
        SourceSystem: "E-Services",
        selectedWorkerCity:
          typeof selectedWorkerCity === "object"
            ? selectedWorkerCity?.value
            : selectedWorkerCity || "",
      },
      {
        skip: !(typeof selectedWorkerCity === "object"
          ? selectedWorkerCity?.value
          : selectedWorkerCity),
        // Prevent refetching during save operations
        refetchOnMountOrArgChange: false,
        refetchOnFocus: false,
        refetchOnReconnect: false,
      }
    );

  // Set Tel Office NameAffter Select The City
  useEffect(() => {
    if (
      laborOfficeData &&
      laborOfficeData?.DataElements &&
      laborOfficeData?.DataElements?.length !== 0
    ) {
      setValue("laborOffice", {
        value: laborOfficeData?.DataElements?.[0]?.ElementKey || "",
        label: laborOfficeData?.DataElements?.[0]?.ElementValue || "",
      });
    }
  }, [laborOfficeData]);

  const TypeOfWageOptions = React.useMemo(() => {
    if (!salaryTypeData?.DataElements) return [];
    return salaryTypeData.DataElements.map((item: any) => ({
      value: item.ElementKey,
      label: item.ElementValue,
    }));
  }, [salaryTypeData]);

  const ContractTypeOptions = React.useMemo(() => {
    if (!contractTypeData?.DataElements) return [];
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
    console.log("the city apis loockups ", cityData);

    if (!cityData?.DataElements) return [];
    return cityData.DataElements.map((item: any) => ({
      value: item.ElementKey,
      label: item.ElementValue,
    }));
  }, [cityData]);

  //#endregion Calling The Required Lockups

  //#region Dates Validations

  // Add watchers for dependent fields
  const contractExpiryDateHijri = watch("contractExpiryDateHijri");
  const contractDateHijri = watch("contractDateHijri");
  const dateofFirstworkingdayHijri = watch("dateofFirstworkingdayHijri");
  const dateoflastworkingdayHijri = watch("dateoflastworkingdayHijri");

  // Add debug logs to all setValue calls for date fields outside prefill as well
  const handleHijriDateChange = (
    date: DateObject | DateObject[] | null,
    setHijriValue: (value: string) => void,
    gregorianFieldName: keyof FormData
  ) => {
    if (!date || Array.isArray(date)) {
      setHijriValue("");
      setValue(gregorianFieldName, "");
      console.log(
        `setValue ${gregorianFieldName} (handleHijriDateChange cleared)`,
        "",
        new Error().stack
      );
      return;
    }

    const hijri = date.convert(hijriCalendar, hijriLocale).format("YYYY/MM/DD");
    const hijriStorage = hijri.replace(/\//g, ""); // Store as YYYYMMDD
    const gregorian = date
      .convert(gregorianCalendar, gregorianLocale)
      .format("YYYY/MM/DD");

    setHijriValue(hijriStorage);
    setValue(gregorianFieldName, gregorian);
    console.log(
      `setValue ${gregorianFieldName} (handleHijriDateChange set)`,
      gregorian,
      new Error().stack
    );
  };

  const getGregorianFromHijri = (dateStr: string | undefined): Date => {
    if (!dateStr) return new Date(0);
    return new DateObject({
      date: dateStr,
      calendar: hijriCalendar,
      locale: hijriLocale,
      format: "YYYY/MM/DD",
    })
      .convert(gregorianCalendar, gregorianLocale)
      .toDate();
  };

  const validateDate = (
    value: string,
    type: string,
    relatedStartDate?: string | undefined,
    relatedEndDate?: string | undefined
  ): true | string => {
    value = toWesternDigits(value); // Always normalize to Western numerals
    if (!value || typeof value !== "string") {
      return t("This field is required");
    }

    const isValidPattern = /^\d{8}$/.test(value);
    if (!isValidPattern) return t("dateValidationDesc");

    const hijriDate = new DateObject({
      date: value,
      calendar: hijriCalendar,
      locale: hijriLocale,
      format: "YYYY/MM/DD",
    });

    const selected = hijriDate
      .convert(gregorianCalendar, gregorianLocale)
      .toDate();
    selected.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (type) {
      case "contract-start":
        if (selected > today)
          return t("contractDateValidation.startDateFuture");
        break;

      case "contract-end":
        if (relatedStartDate) {
          const startDate = getGregorianFromHijri(relatedStartDate);
          startDate.setHours(0, 0, 0, 0);
          if (selected < startDate)
            return t("contractDateValidation.endBeforeStart");
        }
        break;

      case "work-start":
        if (selected > today) return t("workDateValidation.startDateFuture");
        break;

      case "work-end":
        if (selected > today) return t("workDateValidation.endDateFuture");
        if (relatedStartDate) {
          const startDate = getGregorianFromHijri(relatedStartDate);
          startDate.setHours(0, 0, 0, 0);
          if (selected < startDate)
            return t("workDateValidation.endBeforeStart");
        }
        break;
    }

    const result = true;
    return result;
  };
  //#endregion Dates Validations

  //#region Get Job Datails From APIS

  useEffect(() => {
    if (caseDetailsLoading) {
      const id = JSON.parse(
        localStorage.getItem("CaseDetails") || ""
      )?.PlaintiffId;
      const fileNumberEstData =
        JSON.parse(localStorage.getItem("CaseDetails") || "")
          ?.DefendantType_Code === "Establishment"
          ? JSON.parse(localStorage.getItem("CaseDetails") || "")
              ?.DefendantEstFileNumber
          : "";
      setIdNumberPlainteff(id);
      setFileNumberEst(fileNumberEstData);
      setDeffendentTypCode(
        JSON.parse(localStorage.getItem("CaseDetails") || "")
          ?.DefendantType_Code
      );
    }
  }, [caseDetailsLoading]);
  const [
    triggerExtractData,
    { data: extractedData, isLoading: isExtractDataLoading },
  ] = useLazyGetExtractEstablishmentDataQuery();
  useEffect(() => {
    if (idNumberPlainteff !== "" && fileNumberEst !== "") {
      triggerExtractData({
        WorkerID: idNumberPlainteff,
        AcceptedLanguage: i18n.language.toUpperCase(),
        FileNumber: fileNumberEst,
        CaseID: getCookie("caseId"),
      });
    }
  }, [idNumberPlainteff, fileNumberEst]);

  useEffect(() => {
    if (
      extractedData &&
      extractedData?.EstablishmentData &&
      extractedData?.EstablishmentData?.length > 0
    ) {
      setValue(
        "dateOfFirstWorkingDayGregorian",
        formatDateToYYYYMMDD(
          extractedData?.EstablishmentData?.[0]?.ServiceStartDate
        )
      );
      setValue(
        "dateOfLastWorkingDayGregorian",
        formatDateToYYYYMMDD(
          extractedData?.EstablishmentData?.[0]?.ServiceEndDate
        )
      );
      setValue(
        "isStillEmployed",
        extractedData?.EstablishmentData?.[0]?.StillWorking === "Y"
          ? true
          : false
      );
    }
  }, [extractedData]);

  //#endregion Get Job Datails From APIS

  const isArabic = i18n.language === "ar";
  const gregorianLocale = isArabic ? gregorianLocaleAr : gregorianLocaleEn;

  return [
    {
      title: t("tab3_title"),
      className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
      gridCols: 3,
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
          ...(workData &&
            workData?.typeOfWage &&
            workData?.typeOfWage.label !== "" &&
            workData?.typeOfWage.value !== "" && {
              autoSelectValue: workData.typeOfWage,
            }),
        },
        {
          type: "input",
          name: "salary",
          label: t("currentSalary"),
          inputType: "number",
          placeholder: tPlaceholder("salary"),
          min: 0,
          validation: { required: t("currentSalaryValidation") },
        },
        {
          type: "autocomplete",
          name: "contractType",
          label: t("contractType"),
          options: ContractTypeOptions,
          onChange: (value: Option) => setValue("contractType", value),
          notRequired: true,
          // validation: { required: t("contractTypeValidation") },
          ...(workData &&
            workData?.contractType &&
            workData?.contractType.label !== "" &&
            workData?.contractType.value !== "" && {
              autoSelectValue: workData.contractType,
            }),
        },
        {
          type: "input",
          name: "contractNumber",
          label: t("contractNumber"),
          inputType: "number",
          placeholder: tPlaceholder("id"),
          notRequired: true,
          validation: {
            maxLength: { value: 10, message: t("max10Validation") },
            pattern: { value: /^\d{0,10}$/, message: t("max10ValidationDesc") },
          },
        },
        {
          type: "custom",
          name: "contractDateHijri",
          component: (
            <HijriDatePickerInput
              control={control}
              name={"contractDateHijri" as keyof FormData}
              label={t("contractDateHijri")}
              rules={{
                required: t("This field is required"),
                validate: (value: string) =>
                  validateDate(
                    value,
                    "contract-start",
                    contractDateHijri,
                    contractExpiryDateHijri
                  ),
              }}
              onChangeHandler={(date, onChange) => {
                if (!date || Array.isArray(date)) {
                  setValue("contractDateGregorian", "");
                  onChange("");
                  return;
                }
                onChange(date.format("YYYYMMDD"));
                const gregorian = date
                  .convert(gregorianCalendar, gregorianLocaleEn)
                  .format("YYYYMMDD");
                setValue("contractDateGregorian", gregorian);
              }}
            />
          ),
        },
        {
          type: "custom",
          name: "contractDateGregorian",
          component: (
            <GregorianDateDisplayInput
              control={control}
              name={"contractDateGregorian" as keyof FormData}
              label={t("contractDateGregorian")}
            />
          ),
        },

        ...(!(
          ContractTypeOptions?.length === 2 &&
          contractType &&
          contractType?.value === "CT2"
        )
          ? [
              {
                type: "custom",
                name: "contractExpiryDateHijri",
                component: (
                  <HijriDatePickerInput
                    control={control}
                    name={"contractExpiryDateHijri" as keyof FormData}
                    label={t("contractExpiryDateHijri")}
                    rules={{
                      required: t("This field is required"),
                      validate: (value: string) =>
                        validateDate(
                          value,
                          "contract-end",
                          contractDateHijri,
                          contractExpiryDateHijri
                        ),
                    }}
                    onChangeHandler={(date, onChange) => {
                      if (!date || Array.isArray(date)) {
                        setValue("contractExpiryDateGregorian", "");
                        onChange("");
                        return;
                      }
                      onChange(date.format("YYYYMMDD"));
                      const gregorian = date
                        .convert(gregorianCalendar, gregorianLocaleEn)
                        .format("YYYYMMDD");
                      setValue("contractExpiryDateGregorian", gregorian);
                    }}
                  />
                ),
              },
              {
                type: "custom",
                name: "contractExpiryDateGregorian",
                component: (
                  <GregorianDateDisplayInput
                    control={control}
                    name={"contractExpiryDateGregorian" as keyof FormData}
                    label={t("contractExpiryDateGregorian")}
                  />
                ),
              },
            ]
          : []),

        ...(extractedData &&
        extractedData?.EstablishmentData &&
        extractedData?.EstablishmentData?.length > 0
          ? [
              {
                type: "readonly",
                label: t("stillEmployed"),
                value:
                  extractedData?.EstablishmentData?.[0]?.StillWorking === "Y"
                    ? t("yes")
                    : t("no"),
              },
              {
                type: "readonly",
                label: t("dateofFirstworkingdayGregorian"),
                value: formatDateString(
                  extractedData?.EstablishmentData?.[0]?.ServiceStartDate?.slice(
                    0,
                    8
                  )
                ),
              },

              ...(!isStillEmployed
                ? [
                    {
                      type: "readonly",
                      label: t("dateofLastworkingdayGregorian"),
                      value: formatDateString(
                        extractedData?.EstablishmentData?.[0]?.ServiceEndDate?.slice(
                          0,
                          8
                        )
                      ),
                    },
                  ]
                : []),
            ]
          : [
              {
                type: "checkbox",
                name: "isStillEmployed",
                label: t("stillEmployed"),
                checked: isStillEmployed,
                onChange: (checked: boolean) =>
                  setValue("isStillEmployed" as any, checked),
              },
              {
                type: "custom",
                name: "dateofFirstworkingdayHijri",
                component: (
                  <HijriDatePickerInput
                    control={control}
                    name={"dateofFirstworkingdayHijri" as keyof FormData}
                    label={t("dateofFirstworkingdayHijri")}
                    rules={{
                      required: t("This field is required"),
                      validate: (value: string) =>
                        validateDate(
                          value,
                          "work-start",
                          dateofFirstworkingdayHijri,
                          contractExpiryDateHijri
                        ),
                    }}
                    onChangeHandler={(date, onChange) => {
                      if (!date || Array.isArray(date)) {
                        setValue("dateOfFirstWorkingDayGregorian", "");
                        onChange("");
                        return;
                      }
                      onChange(date.format("YYYYMMDD"));
                      const gregorian = date
                        .convert(gregorianCalendar, gregorianLocaleEn)
                        .format("YYYYMMDD");
                      setValue("dateOfFirstWorkingDayGregorian", gregorian);
                    }}
                  />
                ),
              },
              {
                type: "custom",
                name: "dateOfFirstWorkingDayGregorian",
                component: (
                  <GregorianDateDisplayInput
                    control={control}
                    name={"dateOfFirstWorkingDayGregorian" as keyof FormData}
                    label={t("dateofFirstworkingdayGregorian")}
                  />
                ),
              },
              ...(!isStillEmployed
                ? [
                    {
                      type: "custom",
                      name: "dateoflastworkingdayHijri",
                      component: (
                        <HijriDatePickerInput
                          control={control}
                          name={"dateoflastworkingdayHijri" as keyof FormData}
                          label={t("dateoflastworkingdayHijri")}
                          rules={{
                            required: t("This field is required"),
                            validate: (value: string) =>
                              validateDate(
                                value,
                                "work-end",
                                dateofFirstworkingdayHijri,
                                contractExpiryDateHijri
                              ),
                          }}
                          onChangeHandler={(date, onChange) => {
                            if (!date || Array.isArray(date)) {
                              setValue("dateOfLastWorkingDayGregorian", "");
                              onChange("");
                              return;
                            }
                            onChange(date.format("YYYYMMDD"));
                            const gregorian = date
                              .convert(gregorianCalendar, gregorianLocaleEn)
                              .format("YYYYMMDD");
                            setValue(
                              "dateOfLastWorkingDayGregorian",
                              gregorian
                            );
                          }}
                        />
                      ),
                    },
                    {
                      type: "custom",
                      name: "dateOfLastWorkingDayGregorian",
                      component: (
                        <GregorianDateDisplayInput
                          control={control}
                          name={
                            "dateOfLastWorkingDayGregorian" as keyof FormData
                          }
                          label={t("dateofLastworkingdayGregorian")}
                        />
                      ),
                    },
                  ]
                : []),
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
          onChange: (value: Option) => {
            setValue("region", value);
            // Only clear city and laborOffice if user hasn't manually selected a city
            if (!hasManuallySelectedCity) {
              setValue("city", null);
              setValue("laborOffice", null);
              resetField("city");
              resetField("laborOffice");
            }
            setPrevSelectedWorkerRegion(value);
          },
          validation: { required: t("regionValidation") },
          ...(workData &&
            workData?.jobLocation &&
            workData?.jobLocation.label !== "" &&
            workData?.jobLocation.value !== "" && {
              autoSelectValue: workData.jobLocation,
            }),
        },
        {
          type: "autocomplete",
          name: "city",
          isLoading: isCityLoading,
          label: t("city"),
          options: CityOptions,
          disabled: !watch("region"),
          value: watch("region") ? watch("city") : null,
          // value: watch("city") ?? null,

          onChange: (value: Option) => {
            setValue("city", value);
            // Track that user has manually selected a city
            if (value) {
              setHasManuallySelectedCity(true);
            }
          },
          validation: { required: t("cityValidation") },
          ...(!isCityLoading &&
            workData &&
            workData?.jobCity &&
            workData?.jobCity.label !== "" &&
            workData?.jobCity.value !== "" && {
              autoSelectValue: workData.jobCity,
            }),
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
