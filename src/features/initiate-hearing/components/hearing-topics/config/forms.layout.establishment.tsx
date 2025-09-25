import React, { useEffect } from "react";
import {
  SectionLayout,
  Option,
  FormElement,
  UseFormLayoutParams,
} from "@/shared/components/form/form.types";
import {
  buildForm,
  getCommonElements,
  initFormConfig,
} from "@/config/formConfig";
import { mapToOptions } from "@/shared/lib/helpers";
import { getStep1FormFields } from "./Step1From";
import { getStep2FormFields } from "./Step2From";
import { useTranslation } from "react-i18next";
import { HijriDatePickerInput } from "@/shared/components/calanders/HijriDatePickerInput";
import { GregorianDateDisplayInput } from "@/shared/components/calanders/GregorianDateDisplayInput";
import { DateObject } from "react-multi-date-picker";
import hijriCalendar from "react-date-object/calendars/arabic";
import gregorianCalendar from "react-date-object/calendars/gregorian";
import hijriLocale from "react-date-object/locales/arabic_en";
import gregorianLocale from "react-date-object/locales/gregorian_en";
import { useGetRegionLookupDataQuery } from "@/features/initiate-hearing/api/create-case/workDetailApis";
import {
  createNumberOnlyValidation,
  handleNumberOnlyChange,
} from "@/shared/lib/formUtils";

interface UseFormLayoutParamsWithEstablishment extends UseFormLayoutParams {
  payIncreaseTypeData: any;
  PayIncreaseTypeOptions: any;
  control: any;
  trigger: (field: string | string[]) => void;
}

export const useFormLayout = ({
  t: t,
  MainTopicID: mainCategory,
  SubTopicID: subCategory,

  AcknowledgementTerms: acknowledged,
  showLegalSection: showLegalSection,
  showTopicData: showTopicData,
  setValue: setValue,
  handleAdd: handleAdd,
  handleAcknowledgeChange: handleAcknowledgeChange,
  handleAddTopic: handleAddTopic,

  isEditing: isEditing,
  mainCategoryData: mainCategoryData,
  subCategoryData: subCategoryData,
  watch: watch,
  typeOfRequestLookupData: typeOfRequestLookupData,

  matchedSubCategory: matchedSubCategory,
  subTopicsLoading: subTopicsLoading,

  editTopic: editTopic,

  setShowLegalSection: setShowLegalSection,
  setShowTopicData: setShowTopicData,
  isValid: isValid,
  isMainCategoryLoading: isMainCategoryLoading,
  isSubCategoryLoading: isSubCategoryLoading,
  control,
}: UseFormLayoutParamsWithEstablishment): SectionLayout[] => {
  const { t: tHearingTopics, i18n } = useTranslation("hearingtopics");

  const { data: regionData, isFetching: isRegionLoading } =
    useGetRegionLookupDataQuery({
      AcceptedLanguage: i18n.language.toUpperCase(),
      context: "worker",
    });

  const RegionOptions = React.useMemo(() => {
    return mapToOptions({
      data: regionData?.DataElements,
    });
  }, [regionData]);

  const RLRAHI1_typeOfRequest = watch("RLRAHI1_typeOfRequest");
  const subCategoryValue = watch("subCategory");
  const typeOfRequest = watch("typeOfRequest");

  initFormConfig({
    isEditing,
    handleAddTopic,
    t,
  });

  useEffect(() => {
    if (RLRAHI1_typeOfRequest && typeof RLRAHI1_typeOfRequest === "object") {
      setValue("typeOfRequest", RLRAHI1_typeOfRequest);
    }
  }, [RLRAHI1_typeOfRequest, setValue]);
  const MainCategoryOptions = React.useMemo(() => {
    return mapToOptions({
      data: mainCategoryData?.DataElements,
    });
  }, [mainCategoryData]);

  const SubCategoryOptions = React.useMemo(() => {
    return mapToOptions({
      data: subCategoryData?.DataElements,
    });
  }, [subCategoryData]);

  const handleHijriDateChange = (
    date: DateObject | DateObject[] | null,
    setHijriValue: (value: string) => void,
    gregorianFieldName: string,
  ) => {
    if (!date || Array.isArray(date)) {
      setHijriValue("");
      setValue(gregorianFieldName, "");
      return;
    }

    const hijri = date.convert(hijriCalendar, hijriLocale).format("YYYY/MM/DD");
    const gregorian = date
      .convert(gregorianCalendar, gregorianLocale)
      .format("YYYY/MM/DD");

    const hijriStorage = hijri.replace(/\//g, "");
    const gregorianStorage = gregorian.replace(/\//g, "");

    setHijriValue(hijriStorage);
    setValue(gregorianFieldName, gregorianStorage);
  };

  type FormElementType = any;
  function addNoSpacesValidationToTextInputs(
    fields: FormElementType[],
    t: any,
  ): FormElementType[] {
    return fields.map((field) => {
      if (
        field &&
        field.type === "input" &&
        (field.inputType === "text" || field.inputType === "textarea")
      ) {
        return {
          ...field,
          validation: {
            ...(field.validation || {}),
            validate: (value: any) => {
              if (value === null || value === undefined) {
                return t("spacesOnlyNotAllowed");
              }
              if (typeof value === "string") {
                return value.trim().length > 0 || t("spacesOnlyNotAllowed");
              }
              if (typeof value === "number") {
                return (
                  value.toString().trim().length > 0 ||
                  t("spacesOnlyNotAllowed")
                );
              }
              return (
                String(value).trim().length > 0 || t("spacesOnlyNotAllowed")
              );
            },
          },
        };
      }
      return field;
    });
  }

  const step1: SectionLayout = {
    gridCols: 7,
    className: "step1-class",
    children: [
      ...getStep1FormFields({
        t,
        setValue,
        MainCategoryOptions,
        mainCategory,
        SubCategoryOptions,
        subCategory,
        handleAdd,
        onClearMainCategory: () => {
          setValue("mainCategory", null);
          setValue("subCategory", null);
          setValue("acknowledged", false);
          setValue("regulatoryText", "");
          setShowLegalSection(false);
          setShowTopicData(false);
        },
        onClearSubCategory: () => {
          setValue("subCategory", null);
          setValue("acknowledged", false);
          setValue("regulatoryText", "");
          setShowLegalSection(false);
          setShowTopicData(false);
        },
        isMainCategoryLoading,
        isSubCategoryLoading,
      }),
    ].filter(Boolean) as FormElement[],
  };
  const step2: SectionLayout = {
    gridCols: 1,
    className: "step2-class",
    children: [
      ...getStep2FormFields({
        t,
        isEditing,
        mainCategory,
        subCategory,
        subTopicsLoading,
        matchedSubCategory,
        acknowledged,
        showTopicData,
        handleAcknowledgeChange,
      }),
    ].filter(Boolean) as FormElement[],
  };

  const getFormBySubCategory = (): (FormElement | false)[] => {
    const currentSubCategory = isEditing
      ? subCategory?.value
      : subCategoryValue?.value;
    if (!currentSubCategory) {
      return [];
    }

    const TypeOfRequestLookUpOptions =
      typeOfRequestLookupData?.DataElements?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [];

    switch (currentSubCategory) {
      case "AWRW-1":
        return buildForm([]);
      case "AWRW-2":
        return buildForm([]);
      case "LCUTE-1":
        return buildForm(
          addNoSpacesValidationToTextInputs(
            [
              {
                type: "input",
                name: "LCUTE1_amountOfCompensation",
                label: tHearingTopics("amountOfCompensation"),
                inputType: "text",
                numericType: "decimal",
                maxFractionDigits: 2,
                decimalSeparators: [".", ","],
                value: watch("LCUTE1_amountOfCompensation") || "",
                onChange: (value: string) =>
                  setValue("LCUTE1_amountOfCompensation", value),
                validation: {
                  required: tHearingTopics("amountOfCompensation"),
                },
                notRequired: false,
                maxLength: 10,
              },
            ],
            tHearingTopics,
          ),
        );
      case "CR-1":
        return buildForm([
          {
            type: "input",
            name: "CR1_compensationAmount",
            label: tHearingTopics("amount"),
            inputType: "text",
            numericType: "decimal",
            maxFractionDigits: 2,
            decimalSeparators: [".", ","],
            min: 0,
            value:
              (watch("CR1_compensationAmount") ?? "") ||
              (isEditing
                ? editTopic?.CR1_compensationAmount ||
                  editTopic?.CompensationAmount ||
                  editTopic?.compensationAmount ||
                  editTopic?.Amount ||
                  editTopic?.amount ||
                  ""
                : ""),
            onChange: (value) => setValue("CR1_compensationAmount", value),
            validation: { required: tHearingTopics("amount") },
            notRequired: false,
            maxLength: 10,
          },
        ]);
      case "DPVR-1":
        return buildForm(
          addNoSpacesValidationToTextInputs(
            [
              {
                type: "input",
                name: "DPVR1_damagedType",
                label: tHearingTopics("damagedType"),
                inputType: "text",
                value: watch("DPVR1_damagedType") || "",
                onChange: (value: string) =>
                  setValue("DPVR1_damagedType", value),
                validation: { required: tHearingTopics("damagedType") },
                notRequired: false,
                maxLength: 100,
                colSpan: 1,
              },
              {
                type: "input",
                name: "DPVR1_damagedValue",
                label: tHearingTopics("damagedValue"),
                inputType: "text",
                numericType: "decimal",
                maxFractionDigits: 2,
                decimalSeparators: [".", ","],
                min: 0,
                value: watch("DPVR1_damagedValue") || "",
                onChange: (value: string) =>
                  setValue("DPVR1_damagedValue", value),
                validation: { required: tHearingTopics("damagedValue") },
                notRequired: false,
                maxLength: 10,
                colSpan: 1,
              },
            ],
            tHearingTopics,
          ),
        );
      case "RLRAHI-1":
        const fields: any = [
          {
            type: "autocomplete" as const,
            name: "RLRAHI1_typeOfRequest",
            label: tHearingTopics("typeOfRequest"),
            options: TypeOfRequestLookUpOptions,
            value:
              watch("RLRAHI1_typeOfRequest") ??
              (isEditing &&
              (editTopic?.RequestType_Code || editTopic?.RequestType)
                ? {
                    value: editTopic.RequestType_Code || editTopic.RequestType,
                    label: editTopic.TypeOfRequest || editTopic.RequestType,
                  }
                : null),
            onChange: (option: Option | null) =>
              setValue("RLRAHI1_typeOfRequest", option),
            validation: { required: tHearingTopics("typeOfRequest") },
            notRequired: false,
          },
        ];

        const effectiveTypeOfRequest =
          typeOfRequest ||
          (isEditing && (editTopic?.RequestType_Code || editTopic?.RequestType)
            ? {
                value: editTopic.RequestType_Code || editTopic.RequestType,
                label: editTopic.TypeOfRequest || editTopic.RequestType,
              }
            : null);

        if (effectiveTypeOfRequest?.value === "RLRAHI1") {
          fields.push(
            {
              type: "custom",
              component: (
                <div className="flex flex-col gap-2">
                  <HijriDatePickerInput
                    control={control as any}
                    name={"RLRAHI1_request_date_hijri" as any}
                    label={tHearingTopics("requestDateHijri")}
                    rules={{ required: tHearingTopics("requestDateHijri") }}
                    onChangeHandler={(date, onChange) =>
                      handleHijriDateChange(
                        date,
                        onChange,
                        "RLRAHI1_request_date_gregorian",
                      )
                    }
                    notRequired={false}
                    isDateOfBirth={true}
                  />
                  <GregorianDateDisplayInput
                    control={control as any}
                    name={"RLRAHI1_request_date_gregorian" as any}
                    label={tHearingTopics("requestDateGregorian")}
                    notRequired={false}
                  />
                </div>
              ),
              showWhen: "RLRAHI1",
              notRequired: false,
            },
            {
              type: "input",
              name: "RLRAHI1_typeOfCustody",
              label: tHearingTopics("typeOfCustody"),
              inputType: "text",
              value:
                (watch("RLRAHI1_typeOfCustody") ?? "") ||
                (isEditing
                  ? editTopic?.RLRAHI1_typeOfCustody ||
                    editTopic?.TypeOfCustody ||
                    editTopic?.typeOfCustody ||
                    ""
                  : ""),
              onChange: (value: string) =>
                setValue("RLRAHI1_typeOfCustody", value),
              validation: { required: tHearingTopics("typeOfCustody") },
              maxLength: 50,
              showWhen: "RLRAHI1",
            },
          );
        } else if (effectiveTypeOfRequest?.value === "RLRAHI2") {
          fields.push({
            type: "input",
            name: "RLRAHI1_loanAmount",
            label: tHearingTopics("loanAmount"),
            inputType: "text",
            numericType: "decimal",
            maxFractionDigits: 2,
            decimalSeparators: [".", ","],
            value:
              (watch("RLRAHI1_loanAmount") ?? "") ||
              (isEditing
                ? editTopic?.RLRAHI1_loanAmount ||
                  editTopic?.LoanAmount ||
                  editTopic?.loanAmount ||
                  ""
                : ""),
            onChange: (value: string) => setValue("RLRAHI1_loanAmount", value),
            validation: { required: tHearingTopics("loanAmount") },
            notRequired: false,
            maxLength: 6,
          });
        }

        return buildForm(
          addNoSpacesValidationToTextInputs(fields, tHearingTopics),
        );
      case "RUF-1":
        return buildForm(
          addNoSpacesValidationToTextInputs(
            [
              {
                type: "input",
                name: "RUF1_refundType",
                label: tHearingTopics("refundType"),
                inputType: "text",
                value:
                  (watch("RUF1_refundType") ?? "") ||
                  (isEditing
                    ? editTopic?.RUF1_refundType || editTopic?.RefundType || ""
                    : ""),
                onChange: (value: string) => setValue("RUF1_refundType", value),
                validation: { required: tHearingTopics("refundType") },
                notRequired: false,
                maxLength: 50,
              },
              {
                type: "input",
                name: "RUF1_refundAmount",
                label: tHearingTopics("amount"),
                inputType: "text",
                numericType: "decimal",
                maxFractionDigits: 2,
                decimalSeparators: [".", ","],
                value:
                  (watch("RUF1_refundAmount") ?? "") ||
                  (isEditing
                    ? editTopic?.RUF1_refundAmount ||
                      editTopic?.refundAmount ||
                      editTopic?.Amount ||
                      editTopic?.amount ||
                      ""
                    : ""),
                onChange: (value: string) =>
                  setValue("RUF1_refundAmount", value),
                validation: { required: tHearingTopics("amount") },
                notRequired: false,
                maxLength: 10,
              },
            ],
            tHearingTopics,
          ),
        );
      case "EDO-1":
        return buildForm([
          {
            type: "autocomplete",
            name: "EDO1_fromLocation",
            label: tHearingTopics("fromLocation"),
            options: RegionOptions,
            isLoading: isRegionLoading,
            value:
              (watch("EDO1_fromLocation") ?? null) ||
              (editTopic?.EDO1_fromLocation ?? editTopic?.fromLocation ?? null),
            onChange: (option: Option | null) =>
              setValue("EDO1_fromLocation", option),
            validation: { required: tHearingTopics("fromLocation") },
            notRequired: false,
          },
          {
            type: "autocomplete",
            name: "EDO1_toLocation",
            label: tHearingTopics("toLocation"),
            options: RegionOptions,
            isLoading: isRegionLoading,
            value:
              (watch("EDO1_toLocation") ?? null) ||
              (editTopic?.EDO1_toLocation ?? editTopic?.toLocation ?? null),
            onChange: (option: Option | null) =>
              setValue("EDO1_toLocation", option),
            validation: { required: tHearingTopics("toLocation") },
            notRequired: false,
          },
          {
            type: "custom",
            name: "EDO1_managerialDecisionDateHijri",
            component: (
              <HijriDatePickerInput
                control={control as any}
                name="EDO1_managerialDecisionDateHijri"
                label={tHearingTopics("managerialDecisionDateHijri")}
                rules={{
                  required: tHearingTopics("managerialDecisionDateHijri"),
                }}
                onChangeHandler={(date, onChange) =>
                  handleHijriDateChange(
                    date,
                    onChange,
                    "EDO1_managerialDecisionDateGregorian",
                  )
                }
                notRequired={false}
              />
            ),
          },
          {
            type: "custom",
            name: "EDO1_managerialDecisionDateGregorian",
            component: (
              <GregorianDateDisplayInput
                control={control as any}
                name="EDO1_managerialDecisionDateGregorian"
                label={tHearingTopics("managerialDecisionDateGregorian")}
                notRequired={false}
              />
            ),
          },
          {
            type: "input",
            name: "EDO1_managerialDecisionNumber",
            label: tHearingTopics("managerialDecisionNumber"),
            inputType: "text",
            numericType: "integer",
            value:
              watch("EDO1_managerialDecisionNumber") ||
              watch("managerialDecisionNumber") ||
              "",
            onChange: (value: string) =>
              handleNumberOnlyChange(
                value,
                setValue,
                "EDO1_managerialDecisionNumber",
              ),
            validation: createNumberOnlyValidation(false, t("fieldRequired")),
            notRequired: true,
            maxLength: 50,
          },
        ]);

      default:
        return [];
    }
  };

  const step3: any = {
    gridCols: 5,
    ...(getFormBySubCategory().filter(Boolean).length > 0
      ? {
          title: tHearingTopics("topics_data"),
          children: [
            ...(getFormBySubCategory().filter(Boolean) as FormElement[]),
            ...getCommonElements(isValid),
          ],
        }
      : {
          children: [...getCommonElements(true)],
        }),
  };

  const layout: SectionLayout[] = [];
  if (!isEditing) layout.push(step1);
  if (showLegalSection || isEditing ? !isEditing : isEditing)
    layout.push(step2);
  if (showTopicData || isEditing) layout.push(step3);
  return layout;
};
