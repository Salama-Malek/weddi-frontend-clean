import {
  UseFormSetValue,
  UseFormWatch,
  Control,
  UseFormTrigger,
} from "react-hook-form";
import { useTranslation } from "react-i18next";

import { HijriDatePickerInput } from "@/shared/components/calanders/HijriDatePickerInput";
import { GregorianDateDisplayInput } from "@/shared/components/calanders/GregorianDateDisplayInput";

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
import { useCookieState } from "@/features/hearings/initiate/hooks/useCookieState";
import {
  useGetLaborOfficeLookupDataQuery,
  useGetWorkerCityLookupDataQuery,
  useGetWorkerRegionLookupDataQuery,
} from "@/features/hearings/initiate/api/create-case/plaintiffDetailsApis";
import {
  useGetSalaryTypeLookupQuery,
  useLazyGetContractTypeLookupQuery,
  useLazyGetExtractEstablishmentDataQuery,
} from "@/features/hearings/initiate/api/create-case/workDetailApis";
import { DateObject } from "react-multi-date-picker";
import { formatDateString } from "@/utils/helpers";
import hijriLocale from "react-date-object/locales/arabic_ar";
import { GregorianDatePickerInput } from "@/shared/components/calanders/GregorianDatePickerInput";
import { validateDateRange } from "@/utils/dateValidationUtils";

function toWesternDigits(str: string): string {
  return str.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());
}

export const legRepVsWorkerUseFormLayout = (
  setValue: UseFormSetValue<FormData>,
  control: Control<FormData>,
  watch: UseFormWatch<FormData>,
  trigger: UseFormTrigger<FormData>,
  caseDetailsLoading?: boolean,
  workData?: any,
): SectionLayout[] => {
  const isStillEmployed: any = watch("isStillEmployed" as any);
  const { t, i18n } = useTranslation("hearingdetails");
  const { t: tPlaceholder } = useTranslation("placeholder");
  const { t: stellworking } = useTranslation("common");
  const selectedWorkerRegion = watch("jobLocation");
  const selectedWorkerCity = watch("jobLocationCity");

  const currentLanguage = i18n.language.toUpperCase();
  const contractType: any = watch("contractType");

  const [prevSelectedWorkerRegion, setPrevSelectedWorkerRegion] =
    useState(selectedWorkerRegion);
  const [hasManuallySelectedCity, setHasManuallySelectedCity] = useState(false);
  const [idNumberPlainteff, setIdNumberPlainteff] = useState<string>("");
  const [fileNumberEst, setFileNumberEst] = useState<string>("");
  const [deffendentTypCode, setDeffendentTypCode] = useState<string>("");

  const [isPreFill, setIsPreFill] = useState<boolean>(false);

  function setFormFieldsFromWorkData(
    setValue: UseFormSetValue<FormData>,
    workData: any,
  ) {
    if (!workData) return;

    if (workData?.salary)
      setValue("salary", workData?.salary, { shouldValidate: true });
    if (workData?.contractNumber)
      setValue("contractNumber", workData?.contractNumber, {
        shouldValidate: true,
      });

    if (workData?.typeOfWage && workData?.typeOfWage !== null)
      setValue("typeOfWage", workData?.typeOfWage, { shouldValidate: true });
    if (workData?.contractType && workData?.contractType !== null)
      setValue("contractType", workData?.contractType, {
        shouldValidate: true,
      });

    if (workData?.jobLocation && workData?.jobLocation !== null)
      setValue("jobLocation", workData?.jobLocation, { shouldValidate: true });
    if (workData?.jobCity && workData?.jobCity !== null)
      setValue("jobLocationCity", workData?.jobCity, { shouldValidate: true });
    if (workData?.laborOffice && workData?.laborOffice !== null)
      setValue("laborOffice", workData?.laborOffice, { shouldValidate: true });

    if (
      workData?.contractStart &&
      workData?.contractStart?.hijri &&
      workData?.contractStart?.hijri !== "" &&
      workData?.contractStart?.gregorian &&
      workData?.contractStart?.gregorian !== ""
    ) {
      setValue("contractDateHijri", workData?.contractStart?.hijri, {
        shouldValidate: true,
      });
      setValue("contractDateGregorian", workData?.contractStart?.gregorian, {
        shouldValidate: true,
      });
    }

    if (
      workData?.contractEnd &&
      workData?.contractEnd?.hijri &&
      workData?.contractEnd?.hijri !== "" &&
      workData?.contractEnd?.gregorian &&
      workData?.contractEnd?.gregorian !== ""
    ) {
      setValue("contractExpiryDateHijri", workData?.contractEnd?.hijri, {
        shouldValidate: true,
      });
      setValue(
        "contractExpiryDateGregorian",
        workData?.contractEnd?.gregorian,
        { shouldValidate: true },
      );
    }

    if (
      workData?.stillWorking &&
      workData?.stillWorking?.value &&
      workData?.stillWorking?.value !== "" &&
      workData?.stillWorking?.label &&
      workData?.stillWorking?.label !== ""
    ) {
      setValue("isStillEmployed", workData?.stillWorking?.value === "SW1", {
        shouldValidate: true,
      });
    }

    if (
      workData?.jobStart &&
      workData?.jobStart?.gregorian &&
      workData?.jobStart?.gregorian !== ""
    ) {
      setValue(
        "dateOfFirstWorkingDayGregorian",
        workData?.jobStart?.gregorian,
        { shouldValidate: true },
      );
    }

    if (
      workData?.jobEnd &&
      workData?.jobEnd?.gregorian &&
      workData?.jobEnd?.gregorian !== ""
    ) {
      setValue("dateOfLastWorkingDayGregorian", workData?.jobEnd?.gregorian, {
        shouldValidate: true,
      });
    }

    setIsPreFill(true);
  }

  useEffect(() => {
    if (workData) {
      setFormFieldsFromWorkData(setValue, workData);
    }
  }, [workData]);

  const { data: salaryTypeData } = useGetSalaryTypeLookupQuery({
    AcceptedLanguage: i18n.language.toUpperCase(),
  });

  const [getCookie] = useCookieState({ caseId: "" });
  const userType = getCookie("userType") || "";
  const legalRepType = getCookie("legalRepType");

  const [triggerContractType, { data: contractTypeData }] =
    useLazyGetContractTypeLookupQuery();

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
    if (
      selectedWorkerRegion &&
      typeof selectedWorkerRegion === "object" &&
      "value" in selectedWorkerRegion &&
      !hasManuallySelectedCity
    ) {
      if (selectedWorkerRegion !== prevSelectedWorkerRegion) {
        setValue("jobLocationCity", null);
        setValue("laborOffice", null);

        setPrevSelectedWorkerRegion(selectedWorkerRegion);
      }
    } else if (selectedWorkerRegion !== prevSelectedWorkerRegion) {
      setPrevSelectedWorkerRegion(selectedWorkerRegion);
    }
  }, [selectedWorkerRegion, hasManuallySelectedCity, prevSelectedWorkerRegion]);

  useEffect(() => {
    if (!selectedWorkerRegion) {
      setValue("jobLocationCity", null);
      setValue("laborOffice", null);

      setHasManuallySelectedCity(false);
    }
  }, [selectedWorkerRegion]);

  const { data: regionData, isFetching: isRegionLoading } =
    useGetWorkerRegionLookupDataQuery(
      {
        AcceptedLanguage: i18n.language.toUpperCase(),
        SourceSystem: "E-Services",
        ModuleKey: "JobLocation",
        ModuleName: "JobLocation",
      },
      {
        refetchOnMountOrArgChange: false,
        refetchOnFocus: false,
        refetchOnReconnect: false,
      },
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

        refetchOnMountOrArgChange: false,
        refetchOnFocus: false,
        refetchOnReconnect: false,
      },
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

        refetchOnMountOrArgChange: false,
        refetchOnFocus: false,
        refetchOnReconnect: false,
      },
    );

  useEffect(() => {
    if (selectedWorkerRegion == null || selectedWorkerCity == null) {
      setValue("laborOffice", null);
      return;
    }

    if (
      !isLaborLoading &&
      laborOfficeData &&
      laborOfficeData?.DataElements &&
      laborOfficeData?.DataElements?.length !== 0
    ) {
      setValue("laborOffice", {
        value: laborOfficeData?.DataElements?.[0]?.ElementKey || "",
        label: laborOfficeData?.DataElements?.[0]?.ElementValue || "",
      });
    }
  }, [
    laborOfficeData,
    isLaborLoading,
    selectedWorkerRegion,
    selectedWorkerCity,
  ]);

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
    if (!cityData?.DataElements) return [];
    return cityData.DataElements.map((item: any) => ({
      value: item.ElementKey,
      label: item.ElementValue,
    }));
  }, [cityData]);

  const contractDateHijri = watch("contractDateHijri");

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
  ): true | string => {
    value = toWesternDigits(value);
    if (!value || typeof value !== "string") {
      return t("fieldRequired");
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

  useEffect(() => {
    if (caseDetailsLoading) {
      const id = JSON.parse(
        localStorage.getItem("CaseDetails") || "",
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
          ?.DefendantType_Code,
      );
    }
  }, [caseDetailsLoading]);
  const [triggerExtractData, { data: extractedData }] =
    useLazyGetExtractEstablishmentDataQuery();
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
        extractedData?.EstablishmentData?.[0]?.ServiceStartDate.substring(0, 8),
      );
      setValue(
        "dateOfLastWorkingDayGregorian",
        extractedData?.EstablishmentData?.[0]?.ServiceEndDate.substring(0, 8),
      );
      setValue(
        "isStillEmployed",
        extractedData?.EstablishmentData?.[0]?.StillWorking === "Y"
          ? true
          : false,
      );
    }
  }, [extractedData]);

  useEffect(() => {
    if (
      isPreFill &&
      workData?.jobCity &&
      workData?.jobCity.value &&
      CityOptions.length > 0
    ) {
      const found = CityOptions.find(
        (opt: any) => opt?.value === workData?.jobCity?.value,
      );
      if (found) {
        setValue("jobLocationCity", found, { shouldValidate: true });
      }
    }
  }, [CityOptions, workData, isPreFill, setValue]);
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
          value: watch("typeOfWage"),
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
          inputType: "text",
          numericType: "integer",
          placeholder: tPlaceholder("salary"),
          validation: {
            required: t("currentSalaryValidation"),
            maxLength: { value: 6, message: t("max6ValidationDig") },
            pattern: { value: /^\d{0,6}$/, message: t("max6ValidationDesc") },
          },
        },
        {
          type: "autocomplete",
          name: "contractType",
          label: t("contractType"),
          options: ContractTypeOptions,
          value: watch("contractType"),

          onChange: (value: Option) => setValue("contractType", value),
          notRequired: true,

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
          inputType: "text",
          numericType: "integer",
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
                required: t("fieldRequired"),
                validate: (value: string) =>
                  validateDate(value, "contract-start", contractDateHijri),
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

                const endDateValue = watch("contractExpiryDateHijri");
                if (endDateValue && typeof trigger === "function") {
                  setTimeout(() => trigger("contractExpiryDateHijri"), 100);
                }

                setTimeout(() => trigger("contractDateHijri"), 100);
              }}
              isDateOfBirth={true}
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
                      required: t("fieldRequired"),
                      validate: {
                        dateRange: (value: string, formValues: any) => {
                          const fromDate = formValues.contractDateHijri;
                          const toDate = value;

                          if (fromDate && toDate) {
                            const result = validateDateRange(
                              fromDate,
                              toDate,
                              "hijri",
                              "hijri",
                            );

                            if (result !== true) {
                              return t("contractDateValidation.endBeforeStart");
                            }
                            return true;
                          }
                          return true;
                        },
                      },
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
                    ? stellworking("incomplete_case.yes")
                    : stellworking("incomplete_case.no"),
              },
              {
                type: "readonly",
                label: t("dateofFirstworkingdayGregorian"),
                value: formatDateString(
                  extractedData?.EstablishmentData?.[0]?.ServiceStartDate?.slice(
                    0,
                    8,
                  ),
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
                          8,
                        ),
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
                name: "dateOfFirstWorkingDayGregorian",
                component: (
                  <GregorianDatePickerInput
                    control={control}
                    name={"dateOfFirstWorkingDayGregorian" as keyof FormData}
                    label={t("dateofFirstworkingdayGregorian")}
                    isDateOfBirth={true}
                    rules={{
                      required: t("fieldRequired"),
                      validate: {
                        notInFuture: (value: string) => {
                          if (!value) return true;

                          const year = parseInt(value.substring(0, 4));
                          const month = parseInt(value.substring(4, 6)) - 1;
                          const day = parseInt(value.substring(6, 8));

                          const selectedDate = new Date(year, month, day);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);

                          if (selectedDate > today) {
                            return t("workDateValidation.startDateFuture");
                          }
                          return true;
                        },

                        testValidation: (value: string) => {
                          if (value && value.length > 0) {
                            return true;
                          }
                          return "Test validation failed";
                        },
                      },
                    }}
                    onChangeHandler={(date, onChange) => {
                      if (!date || Array.isArray(date)) {
                        onChange("");
                        return;
                      }
                      const formattedDate = date.format("YYYYMMDD");

                      onChange(formattedDate);

                      if (typeof trigger === "function") {
                        setTimeout(
                          () => trigger("dateOfFirstWorkingDayGregorian"),
                          100,
                        );
                      }

                      const endDateValue = watch(
                        "dateOfLastWorkingDayGregorian",
                      );
                      if (endDateValue && typeof trigger === "function") {
                        setTimeout(
                          () => trigger("dateOfLastWorkingDayGregorian"),
                          100,
                        );
                      }
                    }}
                  />
                ),
              },

              ...(!isStillEmployed
                ? [
                    {
                      type: "custom",
                      name: "dateOfLastWorkingDayGregorian",
                      component: (
                        <GregorianDatePickerInput
                          control={control}
                          name={
                            "dateOfLastWorkingDayGregorian" as keyof FormData
                          }
                          label={t("dateofLastworkingdayGregorian")}
                          rules={{
                            required: t("fieldRequired"),
                            validate: {
                              dateRange: (value: string, formValues: any) => {
                                const fromDate =
                                  formValues.dateOfFirstWorkingDayGregorian;
                                const toDate = value;

                                if (fromDate && toDate) {
                                  const fromYear = parseInt(
                                    fromDate.substring(0, 4),
                                  );
                                  const fromMonth =
                                    parseInt(fromDate.substring(4, 6)) - 1;
                                  const fromDay = parseInt(
                                    fromDate.substring(6, 8),
                                  );
                                  const fromDateObj = new Date(
                                    fromYear,
                                    fromMonth,
                                    fromDay,
                                  );

                                  const toYear = parseInt(
                                    toDate.substring(0, 4),
                                  );
                                  const toMonth =
                                    parseInt(toDate.substring(4, 6)) - 1;
                                  const toDay = parseInt(
                                    toDate.substring(6, 8),
                                  );
                                  const toDateObj = new Date(
                                    toYear,
                                    toMonth,
                                    toDay,
                                  );

                                  if (toDateObj < fromDateObj) {
                                    return t(
                                      "workDateValidation.endBeforeStart",
                                    );
                                  }

                                  return true;
                                }
                                return true;
                              },

                              testValidation: (value: string) => {
                                if (value && value.length > 0) {
                                  return true;
                                }
                                return "Test validation failed for last working day";
                              },
                            },
                          }}
                          onChangeHandler={(date, onChange) => {
                            if (!date || Array.isArray(date)) {
                              onChange("");
                              return;
                            }
                            const formattedDate = date.format("YYYYMMDD");
                            onChange(formattedDate);

                            if (typeof trigger === "function") {
                              setTimeout(
                                () => trigger("dateOfLastWorkingDayGregorian"),
                                100,
                              );
                            }
                          }}
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
          name: "jobLocation",
          isLoading: isRegionLoading,
          label: t("region"),
          options: RegionOptions,
          value: watch("jobLocation"),
          onChange: (value: Option) => {
            setValue("jobLocation", value);
            setValue("jobLocationCity", null);
            setValue("laborOffice", null);
            setPrevSelectedWorkerRegion(value);
            setHasManuallySelectedCity(false);
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
          name: "jobLocationCity",
          isLoading: isCityLoading,
          label: t("city"),
          options: CityOptions,
          disabled: !watch("jobLocation"),
          value: watch("jobLocationCity"),

          onChange: (value: Option) => {
            setValue("jobLocationCity", value);
            if (!value) {
              setValue("laborOffice", null);
            }
            setHasManuallySelectedCity(!!value);
          },
          validation: { required: t("cityValidation") },
          ...(!isCityLoading &&
            isPreFill &&
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
            watch("laborOffice") &&
            laborOfficeData?.DataElements &&
            laborOfficeData.DataElements.length > 0
              ? laborOfficeData.DataElements[0].ElementValue
              : "",
        },
      ],
    },
  ] as SectionLayout[];
};
