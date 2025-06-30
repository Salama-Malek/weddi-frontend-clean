import { UseFormSetValue, UseFormWatch, Control, UseFormTrigger, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
// import HijriDateField from "@/shared/components/calanders/NewDatePicker";
import { HijriDatePickerInput } from "@/shared/components/calanders/HijriDatePickerInput";
import { GregorianDateDisplayInput } from "@/shared/components/calanders/GregorianDateDisplayInput";
// import DatePicker, { DateObject } from "react-multi-date-picker";
import hijriCalendar from "react-date-object/calendars/arabic";
import gregorianCalendar from "react-date-object/calendars/gregorian";
import hijriLocale from "react-date-object/locales/arabic_en";
import gregorianLocale from "react-date-object/locales/gregorian_en";
import { FieldWrapper } from "@/shared/components/form";
import { Calculator01Icon } from "hugeicons-react";

import {
  Option,
  SectionLayout,
  FormData,
} from "@/shared/components/form/form.types";
import React, { useEffect, useState } from "react";
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
  useLazyGetExtractEstablishmentDataQuery,
} from "@/features/initiate-hearing/api/create-case/workDetailApis";
import { DateObject } from "react-multi-date-picker";
import { useFormResetContext } from '@/providers/FormResetProvider';
import { useAPIFormsData } from "@/providers/FormContext";
import { formatDateString, formatDateToYYYYMMDD } from "@/shared/lib/helpers";

export const legRepVsWorkerUseFormLayout = (
  setValue: UseFormSetValue<FormData>,
  control: Control<FormData>,
  watch: UseFormWatch<FormData>,
  // trigger: UseFormTrigger<FormData>
): SectionLayout[] => {
  const { resetField } = useFormResetContext();
  const isStillEmployed: any = watch("isStillEmployed" as any);
  const { t, i18n } = useTranslation("hearingdetails");
  const selectedWorkerRegion = watch("region");
  const selectedWorkerCity = watch("city");
  const currentLanguage = i18n.language.toUpperCase();
  const contractType: any = watch("contractType");
  
  // Add state tracking for manual selections
  const [prevSelectedWorkerRegion, setPrevSelectedWorkerRegion] = useState(selectedWorkerRegion);
  const [hasManuallySelectedCity, setHasManuallySelectedCity] = useState(false);
  
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


  useEffect(() => {
    // Guard: only clear if region has changed to a valid new value
    // AND the user hasn't manually selected a city
    if (selectedWorkerRegion && typeof selectedWorkerRegion === 'object' && 'value' in selectedWorkerRegion && !hasManuallySelectedCity) {
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
  }, [selectedWorkerRegion, hasManuallySelectedCity, prevSelectedWorkerRegion, setValue, resetField]);

  const { data: regionData, isFetching: isRegionLoading } =
    useGetWorkerRegionLookupDataQuery({
      AcceptedLanguage: i18n.language.toUpperCase(),
      SourceSystem: "E-Services",
      ModuleKey: "JobLocation",
      ModuleName: "JobLocation",
    }, {
      // Prevent refetching during save operations
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
      refetchOnReconnect: false
    });

  const { data: cityData, isFetching: isCityLoading } =
    useGetWorkerCityLookupDataQuery(
      {
        AcceptedLanguage: i18n.language.toUpperCase(),
        SourceSystem: "E-Services",
        selectedWorkerRegion: typeof selectedWorkerRegion === 'object' ? selectedWorkerRegion?.value : selectedWorkerRegion || "",
        ModuleName: "JobLocationCity",
      },
      { 
        skip: !(typeof selectedWorkerRegion === 'object' ? selectedWorkerRegion?.value : selectedWorkerRegion),
        // Prevent refetching during save operations
        refetchOnMountOrArgChange: false,
        refetchOnFocus: false,
        refetchOnReconnect: false
      }
    );

  const { data: laborOfficeData, isFetching: isLaborLoading } =
    useGetLaborOfficeLookupDataQuery(
      {
        AcceptedLanguage: i18n.language.toUpperCase(),
        SourceSystem: "E-Services",
        selectedWorkerCity: typeof selectedWorkerCity === 'object' ? selectedWorkerCity?.value : selectedWorkerCity || "",
      },
      { 
        skip: !(typeof selectedWorkerCity === 'object' ? selectedWorkerCity?.value : selectedWorkerCity),
        // Prevent refetching during save operations
        refetchOnMountOrArgChange: false,
        refetchOnFocus: false,
        refetchOnReconnect: false
      }
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
  const contractExpiryDateHijri = watch("contractExpiryDateHijri");
  const contractDateHijri = watch("contractDateHijri");
  const dateofFirstworkingdayHijri = watch("dateofFirstworkingdayHijri");
  const dateoflastworkingdayHijri = watch("dateoflastworkingdayHijri");

  const handleHijriDateChange = (
    date: DateObject | DateObject[] | null,
    setHijriValue: (value: string) => void,
    gregorianFieldName: keyof FormData,
  ) => {
    if (!date || Array.isArray(date)) {
      setHijriValue("");
      setValue(gregorianFieldName, "");
      return;
    }

    const hijri = date.convert(hijriCalendar, hijriLocale).format("YYYY/MM/DD");
    const gregorian = date.convert(gregorianCalendar, gregorianLocale).format("YYYY/MM/DD");

    setHijriValue(hijri);
    setValue(gregorianFieldName, gregorian);
  };

  const getGregorianFromHijri = (dateStr: string | undefined): Date => {
    if (!dateStr) return new Date(0);
    return new DateObject({
      date: dateStr,
      calendar: hijriCalendar,
      locale: hijriLocale,
      format: "YYYY/MM/DD",
    }).convert(gregorianCalendar, gregorianLocale).toDate();
  };

  const validateDate = (value: string, type: string, relatedStartDate?: string | undefined, relatedEndDate?: string | undefined): true | string => {
    if (!value || typeof value !== "string") {
      return t("This field is required");
    }

    const isValidPattern = /^\d{4}\/\d{2}\/\d{2}$/.test(value);
    if (!isValidPattern) return t("dateValidationDesc");

    const hijriDate = new DateObject({
      date: value,
      calendar: hijriCalendar,
      locale: hijriLocale,
      format: "YYYY/MM/DD",
    });

    const selected = hijriDate.convert(gregorianCalendar, gregorianLocale).toDate();
    selected.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (type) {
      case "contract-start":
        if (selected > today) return t("contractDateValidation.startDateFuture");
        break;

      case "contract-end":
        if (relatedStartDate) {
          const startDate = getGregorianFromHijri(relatedStartDate);
          startDate.setHours(0, 0, 0, 0);
          if (selected < startDate) return t("contractDateValidation.endBeforeStart");
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
          if (selected < startDate) return t("workDateValidation.endBeforeStart");
        }
        break;
    }

    return true;
  };


  // hassan add this 
  //#region hassan add this here 
  const { formData } = useAPIFormsData();
  // const [isWorkedData, setIsWorkedData] = useState<boolean>(false);
  const [triggerExtractData, { data: extractedData,
    isLoading: isExtractDataLoading }] = useLazyGetExtractEstablishmentDataQuery();

  useEffect(() => {
    if (userType?.toLowerCase() !== "legal representative") {
      const extractedData = (formData: any) => {
        // هو الي يحط الرقم القومي 
        const workerId = userType?.toLowerCase() === "establishment" ?
          formData?.nationalIdNumber
          : formData?.applicantType === "representative"
            ? formData?.workerAgentIdNumber
            : formData?.idNumber;

        let fileNumber = null;
        if (userType.toLowerCase() === "establishment") {
          fileNumber = formData?.PlaintiffsFileNumber;
        } else {
          // في حالة هو الي كتب اسم الملف 
          if (
            formData?.defendantDetails === "Others" &&
            formData?.defendantStatus === "Establishment"
          ) {
            fileNumber = formData?.Defendant_Establishment_data_NON_SELECTED?.FileNumber || null;
          }
          // في حالة اختار من الي اشتغل فيهم قبل كدة 
          if (
            formData?.defendantDetails === formData?.defendantStatus &&
            formData?.Defendant_Establishment_data
          ) {
            fileNumber = formData?.Defendant_Establishment_data?.FileNumber || null;
          }
        }
        return {
          workerId,
          fileNumber,
        };
      }
      const { workerId, fileNumber } = extractedData(formData);
      if (workerId && fileNumber) {
        // console.log("workerId", workerId);
        // console.log("fileNumber", fileNumber);
        triggerExtractData({
          WorkerID: workerId,
          AcceptedLanguage: i18n.language.toUpperCase(),
          FileNumber: fileNumber,
          CaseID: getCookie("caseId"),
        });
      } else {
      }
    }
  }, [formData]);

  useEffect(() => {
    if (extractedData &&
      extractedData?.EstablishmentData
      && extractedData?.EstablishmentData?.length > 0
    ) {

      // console.log("extractedData", extractedData?.EstablishmentData?.[0]);
      // console.log("date formate", {
      //   startDate: formatDateToYYYYMMDD(extractedData?.EstablishmentData?.[0]?.ServiceStartDate),
      //   endDate: formatDateToYYYYMMDD(extractedData?.EstablishmentData?.[0]?.ServiceEndDate),
      // });
      setValue("dateOfFirstWorkingDayGregorian", formatDateToYYYYMMDD(extractedData?.EstablishmentData?.[0]?.ServiceStartDate));
      setValue("dateOfLastWorkingDayGregorian", formatDateToYYYYMMDD(extractedData?.EstablishmentData?.[0]?.ServiceEndDate));
      setValue("isStillEmployed", extractedData?.EstablishmentData?.[0]?.StillWorking === "Y" ? true : false);

      // console.log("formData", formData);

    }
  }, [extractedData]);

  //#endregion hassan add this here 




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
          notRequired: true,
          // validation: { required: t("contractTypeValidation") },
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
          name: "contractDateHijri",
          component: (
            <HijriDatePickerInput
              control={control}
              name={"contractDateHijri" as keyof FormData}
              label={t("contractDateHijri")}
              rules={{
                required: t("This field is required"),
                pattern: {
                  value: /^\d{4}\/\d{2}\/\d{2}$/,
                  message: t("dateValidationDesc"),
                },
                validate: (value: string) =>
                  validateDate(value, "contract-start", contractDateHijri, contractExpiryDateHijri),
              }}
              onChangeHandler={(date, onChange) =>
                handleHijriDateChange(date, onChange, "contractDateGregorian")
              }
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


        // {
        //   type: "custom",
        //   name: "contractExpiryDateHijri",
        //   component: (
        //     <HijriDatePickerInput
        //       control={control}
        //       name={"contractExpiryDateHijri" as keyof FormData}
        //       label={t("contractExpiryDateHijri")}
        //       rules={{
        //         required: t("This field is required"),
        //         pattern: {
        //           value: /^\d{4}\/\d{2}\/\d{2}$/,
        //           message: t("dateValidationDesc"),
        //         },
        //         validate: (value: string) =>
        //           validateDate(value, "contract-end", contractDateHijri, contractExpiryDateHijri),
        //       }}
        //       onChangeHandler={(date, onChange) =>
        //         handleHijriDateChange(date, onChange, "contractExpiryDateGregorian")
        //       }
        //     />
        //   ),
        // },
        // {
        //   type: "custom",
        //   name: "contractExpiryDateGregorian",
        //   component: (
        //     <GregorianDateDisplayInput
        //       control={control}
        //       name={"contractExpiryDateGregorian" as keyof FormData}
        //       label={t("contractExpiryDateGregorian")}
        //     />
        //   ),
        // },

        ...(!(ContractTypeOptions?.length === 2 && contractType
          && contractType?.value === "CT2")
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
                    pattern: {
                      value: /^\d{4}\/\d{2}\/\d{2}$/,
                      message: t("dateValidationDesc"),
                    },
                    validate: (value: string) =>
                      validateDate(value, "contract-end", contractDateHijri, contractExpiryDateHijri),
                  }}
                  onChangeHandler={(date, onChange) =>
                    handleHijriDateChange(date, onChange, "contractExpiryDateGregorian")
                  }
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

          ] : []),

        ...(extractedData &&
          extractedData?.EstablishmentData
          && extractedData?.EstablishmentData?.length > 0 ? [
          {
            type: "readonly",
            label: t("stillEmployed"),
            value: extractedData?.EstablishmentData?.[0]?.StillWorking === "Y" ? t("yes") : t("no"),
          },
          {
            type: "readonly",
            label: t("dateofFirstworkingdayGregorian"),
            value: formatDateString(extractedData?.EstablishmentData?.[0]?.ServiceStartDate?.slice(0, 8)),
          },

          ...(!isStillEmployed
            ? [
              {
                type: "readonly",
                label: t("dateofLastworkingdayGregorian"),
                value: formatDateString(extractedData?.EstablishmentData?.[0]?.ServiceEndDate?.slice(0, 8)),
              },
            ]
            : []),
        ] : [

          {
            type: "checkbox",
            name: "isStillEmployed",
            label: t("stillEmployed"),
            checked: isStillEmployed,
            onChange: (checked: boolean) => setValue("isStillEmployed" as any, checked),
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
                  pattern: {
                    value: /^\d{4}\/\d{2}\/\d{2}$/,
                    message: t("dateValidationDesc"),
                  },
                  validate: (value: string) =>
                    validateDate(value, "work-start", dateofFirstworkingdayHijri, contractExpiryDateHijri),
                }}
                onChangeHandler={(date, onChange) =>
                  handleHijriDateChange(date, onChange, "dateOfFirstWorkingDayGregorian")
                }
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
                      pattern: {
                        value: /^\d{4}\/\d{2}\/\d{2}$/,
                        message: t("dateValidationDesc"),
                      },
                      validate: (value: string) =>
                        validateDate(value, "work-end", dateofFirstworkingdayHijri, contractExpiryDateHijri),
                    }}
                    onChangeHandler={(date, onChange) =>
                      handleHijriDateChange(date, onChange, "dateOfLastWorkingDayGregorian")
                    }
                  />
                ),
              },
              {
                type: "custom",
                name: "dateOfLastWorkingDayGregorian",
                component: (
                  <GregorianDateDisplayInput
                    control={control}
                    name={"dateOfLastWorkingDayGregorian" as keyof FormData}
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
        },
        {
          type: "autocomplete",
          name: "city",
          isLoading: isCityLoading,
          label: t("city"),
          options: CityOptions,
          disabled: !watch("region"),
          // value: watch("region") ? watch("city") : null,
          value: watch("city") ?? null,

          onChange: (value: Option) => {
            setValue("city", value);
            // Track that user has manually selected a city
            if (value) {
              setHasManuallySelectedCity(true);
            }
          },
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
