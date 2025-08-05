import React, { useEffect } from "react";
import {
  SectionLayout,
  Option,
  FormElement,
  UseFormLayoutParams,
} from "@shared/components/form/form.types";
import {
  buildForm,
  getCommonElements,
  initFormConfig,
} from "@services/config/formConfig";
import {
  formatHijriDate,
  mapToOptions,
  toHijri_YYYYMMDD,
  formatDateString,
  formatDateToYYYYMMDD,
} from "@shared/lib/helpers";
import { getMIR1FormFields } from "./MIR1Form";
import { getBPSR1FormFields } from "./BPSR1Form";
import { getBR1FormFields } from "./BR1Form";
import { isOtherAllowance } from "../utils/isOtherAllowance";
import { getStep1FormFields } from "./Step1From";
import { getStep2FormFields } from "./Step2From";
import { HijriDatePickerInput } from "@shared/components/calanders/HijriDatePickerInput";
import { GregorianDateDisplayInput } from "@shared/components/calanders/GregorianDateDisplayInput";
import { DateObject } from "react-multi-date-picker";
import hijriCalendar from "react-date-object/calendars/arabic";
import gregorianCalendar from "react-date-object/calendars/gregorian";
import hijriLocale from "react-date-object/locales/arabic_en";
import gregorianLocale from "react-date-object/locales/gregorian_en";
import { useGetRegionLookupDataQuery } from "@features/cases/initiate-hearing/api/create-case/workDetailApis";
import { useTranslation } from "react-i18next";
import { createNumberOnlyValidation, handleNumberOnlyChange } from "@shared/lib/formUtils";

export const useFormLayout = ({
  t: t,
  MainTopicID: mainCategory,
  SubTopicID: subCategory,
  FromLocation: fromPlace,
  ToLocation: toPlace,
  AcknowledgementTerms: acknowledged,
  showLegalSection: showLegalSection,
  showTopicData: showTopicData,
  setValue: setValue,
  handleAdd: handleAdd,
  handleAcknowledgeChange: handleAcknowledgeChange,
  handleAddTopic: handleAddTopic,
  handleSend: handleSend,
  regulatoryText: regulatoryText,
  decisionNumber: decisionNumber,
  isEditing: isEditing,
  mainCategoryData: mainCategoryData,
  subCategoryData: subCategoryData,
  watch: watch,
  forAllowanceData: forAllowanceData,
  typeOfRequestLookupData: typeOfRequestLookupData,
  commissionTypeLookupData: commissionTypeLookupData,
  accordingToAgreementLookupData: accordingToAgreementLookupData,
  matchedSubCategory: matchedSubCategory,
  subTopicsLoading: subTopicsLoading,
  amountPaidData: amountPaidData,
  leaveTypeData: leaveTypeData,
  travelingWayData: travelingWayData,
  editTopic: editTopic,
  caseTopics: caseTopics,
  typesOfPenaltiesData: typesOfPenaltiesData,
  setShowLegalSection: setShowLegalSection,
  setShowTopicData: setShowTopicData,
  payIncreaseTypeData,
  isValid: isValid,
  control: control,
  trigger,
  lockAccommodationSource = false,
  errors,
}: UseFormLayoutParams & { trigger: (fields: string | string[]) => void, lockAccommodationSource?: boolean, errors?: any, payIncreaseTypeData?: any }): SectionLayout[] => {
  const { t: tHearingTopics, i18n } = useTranslation("hearingtopics");

  const PayIncreaseTypeOptions = React.useMemo(() => {
    return payIncreaseTypeData?.DataElements?.map((item: any) => ({
      value: item.ElementKey,
      label: item.ElementValue,
    })) || [];
  }, [payIncreaseTypeData]);

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

  const from_date_hijri = watch("from_date_hijri");
  const travelingWay = watch("travelingWay");
  const to_date_hijri = watch("to_date_hijri");
  const date_hijri = watch("date_hijri");
  const subCategoryValue = watch("subCategory");
  const amount = watch("amount");
  const injury_date_hijri = watch("injury_date_hijri");
  const currentPosition = watch("currentPosition");
  const theWantedJob = watch("theWantedJob");
  const rewardType = watch("rewardType");
  const consideration = watch("consideration");
  const forAllowance = watch("forAllowance");
  const typeOfRequest = watch("typeOfRequest");
  const otherAllowance = watch("otherAllowance");
  const commissionType = watch("commissionType");
  const accordingToAgreement = watch("accordingToAgreement");
  const amountsPaidFor = watch("amountsPaidFor");
  const kindOfHoliday = watch("kindOfHoliday");
  const compensationAmount = watch("compensationAmount");
  const injuryType = watch("injuryType");
  const theAmountRequired = watch("theAmountRequired");
  const totalAmount = watch("totalAmount");
  const typesOfPenalties = watch("typesOfPenalties");
  const requiredJobTitle = watch("requiredJobTitle");
  const currentJobTitle = watch("currentJobTitle");
  const workingHours = watch("workingHours");
  const additionalDetails = watch("additionalDetails");
  const wagesAmount = watch("wagesAmount");
  const payIncreaseType = watch("payIncreaseType");
  const wageDifference = watch("wageDifference");
  const newPayAmount = watch("newPayAmount");
  const durationOfLeaveDue = watch("durationOfLeaveDue");
  const payDue = watch("payDue");
  const amountOfCompensation = watch("amountOfCompensation");
  const doesBylawsIncludeAddingAccommodations = watch(
    "doesBylawsIncludeAddingAccommodations"
  );
  const doesContractIncludeAddingAccommodations = watch(
    "doesContractIncludeAddingAccommodations"
  );
  const doesTheInternalRegulationIncludePromotionMechanism = watch(
    "doesTheInternalRegulationIncludePromotionMechanism"
  );
  const doesContractIncludeAdditionalUpgrade = watch(
    "doesContractIncludeAdditionalUpgrade"
  );
  const managerial_decision_date_hijri = watch(
    "managerial_decision_date_hijri"
  );
  const managerial_decision_date_gregorian = watch(
    "managerial_decision_date_gregorian"
  );

  const handleHijriDateChange = (
    date: DateObject | DateObject[] | null,
    setHijriValue: (value: string) => void,
    gregorianFieldName: string
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

    const hijriCompact = hijri ? formatDateToYYYYMMDD(hijri) || "" : "";
    const gregorianCompact = gregorian
      ? formatDateToYYYYMMDD(gregorian) || ""
      : "";

    setHijriValue(hijriCompact);
    setValue(gregorianFieldName, gregorianCompact);
  };

  initFormConfig({
    isEditing,
    handleAddTopic,
    t,
  });
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

  const ForAllowanceOptions = React.useMemo(() => {
    return mapToOptions({
      data: forAllowanceData?.DataElements,
    });
  }, [forAllowanceData]);

  const TypeOfRequestLookUpOptions = React.useMemo(() => {
    return mapToOptions({
      data: typeOfRequestLookupData?.DataElements,
    });
  }, [typeOfRequestLookupData]);

  const CommissionTypeLookUpOptions = React.useMemo(() => {
    return mapToOptions({
      data: commissionTypeLookupData?.DataElements,
    });
  }, [commissionTypeLookupData]);

  const AccordingToAgreementLookupLookUpOptions = React.useMemo(() => {
    return mapToOptions({
      data: accordingToAgreementLookupData?.DataElements,
    });
  }, [accordingToAgreementLookupData]);

  const AmountPaidLookupLookUpOptions = React.useMemo(() => {
    return mapToOptions({
      data: amountPaidData?.DataElements,
    });
  }, [amountPaidData]);

  const LeaveTypeLookUpOptions = React.useMemo(() => {
    return mapToOptions({
      data: leaveTypeData?.DataElements,
    });
  }, [leaveTypeData]);

  const TravelingWayOptions = React.useMemo(() => {
    return mapToOptions({
      data: travelingWayData?.DataElements,
    });
  }, [travelingWayData]);

  const TypesOfPenaltiesOptions = React.useMemo(() => {
    return mapToOptions({
      data: typesOfPenaltiesData?.DataElements,
    });
  }, [typesOfPenaltiesData]);

  const step1: SectionLayout = {
    gridCols: 2,
    className: "step1",
    children: getStep1FormFields({
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
        setValue("subCategoryData", []);
        setValue("subCategoryOptions", []);
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
    }),
  };

  const step2Children: (FormElement | false)[] = getStep2FormFields({
    t,
    isEditing,
    mainCategory,
    subCategory,
    subTopicsLoading,
    matchedSubCategory,
    acknowledged,
    showTopicData,
    handleAcknowledgeChange,
  });

  const step2: SectionLayout = {
    gridCols: 2,
    className: "step2",
    children: step2Children.filter(Boolean) as FormElement[],
  };

  // Helper function to add the validate rule to text inputs
  type FormElementType = any; // fallback for type
  function addNoSpacesValidationToTextInputs(fields: FormElementType[], t: any): FormElementType[] {
    return fields.map(field => {
      if (field && field.type === 'input' && (field.inputType === 'text' || field.inputType === 'textarea')) {
        return {
          ...field,
          validation: {
            ...(field.validation || {}),
            validate: (value: any) => {
              // Handle different value types safely
              if (value === null || value === undefined) {
                return tHearingTopics('fieldRequired');
              }
              if (typeof value === 'string') {
                return value.trim().length > 0 || tHearingTopics('fieldRequired');
              }
              if (typeof value === 'number') {
                return value.toString().trim().length > 0 || tHearingTopics('fieldRequired');
              }
              // For objects or other types, convert to string and check
              return String(value).trim().length > 0 || tHearingTopics('fieldRequired');
            },
          },
        };
      }
      return field;
    });
  }

  const getFormBySubCategory = (): (FormElement | false)[] => {
    const currentSubCategory = isEditing
      ? subCategory?.value
      : subCategoryValue?.value;
    if (!currentSubCategory) {
      return [];
    }

    const AmountPaidLookupLookUpOptions =
      amountPaidData?.DataElements?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [];

    const TravelingWayOptions =
      travelingWayData?.DataElements?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [];

    const LeaveTypeLookUpOptions =
      leaveTypeData?.DataElements?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [];

    const ForAllowanceLookUpOptions =
      forAllowanceData?.DataElements?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [];

    const TypeOfRequestLookUpOptions =
      typeOfRequestLookupData?.DataElements?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [];

    const CommissionTypeLookUpOptions =
      commissionTypeLookupData?.DataElements?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [];

    const AccordingToAgreementLookUpOptions =
      accordingToAgreementLookupData?.DataElements?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [];

    switch (currentSubCategory) {
      case "WR-2":
        // WR-2 uses new specific field names
        const wr2BaseFields = [
          {
            type: "input" as const,
            name: "WR2_wageAmount",
            label: t("amount"),
            inputType: "text" as const,
            value: watch("WR2_wageAmount") || "",
            onChange: (value: string) => handleNumberOnlyChange(value, setValue, "WR2_wageAmount"),
            validation: createNumberOnlyValidation(true, tHearingTopics('fieldRequired')),
            notRequired: false,
            numberOnly: true,
            invalidFeedback: errors?.WR2_wageAmount?.message,
            control,
          },
          {
            type: "custom",
            component: (
              <div className="flex flex-col gap-2">
                <HijriDatePickerInput
                  control={control as any}
                  name="WR2_fromDateHijri"
                  label={t("fromDateHijri")}
                  rules={{ required: tHearingTopics('fieldRequired') }}
                  notRequired={false}
                  onChangeHandler={(date, onChange) =>
                    handleHijriDateChange(
                      date,
                      onChange,
                      "WR2_fromDateGregorian"
                    )
                  }
                  isDateOfBirth={true}
                />
                <GregorianDateDisplayInput
                  control={control as any}
                  name="WR2_fromDateGregorian"
                  label={t("fromDateGregorian")}
                  notRequired={false}
                />
              </div>
            ),
          },
          {
            type: "custom",
            component: (
              <div className="flex flex-col gap-2">
                <HijriDatePickerInput
                  control={control as any}
                  name="WR2_toDateHijri"
                  label={t("toDateHijri")}
                  rules={{ required: tHearingTopics('fieldRequired') }}
                  notRequired={false}
                  onChangeHandler={(date, onChange) =>
                    handleHijriDateChange(
                      date,
                      onChange,
                      "WR2_toDateGregorian"
                    )
                  }
                  isDateOfBirth={true}
                />
                <GregorianDateDisplayInput
                  control={control as any}
                  name="WR2_toDateGregorian"
                  label={t("toDateGregorian")}
                  notRequired={false}
                />
              </div>
            ),
          },
        ];
        return buildForm(addNoSpacesValidationToTextInputs(wr2BaseFields, t));

      case "WR-1":
        // WR-1 uses new specific field names
        const wr1BaseFields = [
                                {
                        type: "input" as const,
                        name: "WR1_wageAmount",
                        label: t("amount"),
                        inputType: "text" as const,
                        value: watch("WR1_wageAmount") || "",
                        onChange: (value: string) => handleNumberOnlyChange(value, setValue, "WR1_wageAmount"),
                        validation: createNumberOnlyValidation(true, tHearingTopics('fieldRequired')),
                        notRequired: false,
                        numberOnly: true,
                        invalidFeedback: errors?.WR1_wageAmount?.message,
                        control,
                      },
          {
            type: "custom",
            component: (
              <div className="flex flex-col gap-2">
                <HijriDatePickerInput
                  control={control as any}
                  name="WR1_fromDateHijri"
                  label={t("fromDateHijri")}
                  rules={{ required: tHearingTopics('fieldRequired') }}
                  notRequired={false}
                  onChangeHandler={(date, onChange) =>
                    handleHijriDateChange(
                      date,
                      onChange,
                      "WR1_fromDateGregorian"
                    )
                  }
                  isDateOfBirth={true}
                />
                <GregorianDateDisplayInput
                  control={control as any}
                  name="WR1_fromDateGregorian"
                  label={t("fromDateGregorian")}
                  notRequired={false}
                />
              </div>
            ),
          },
          {
            type: "custom",
            component: (
              <div className="flex flex-col gap-2">
                <HijriDatePickerInput
                  control={control as any}
                  name="WR1_toDateHijri"
                  label={t("toDateHijri")}
                  rules={{ required: tHearingTopics('fieldRequired') }}
                  notRequired={false}
                  onChangeHandler={(date, onChange) =>
                    handleHijriDateChange(
                      date,
                      onChange,
                      "WR1_toDateGregorian"
                    )
                  }
                  isDateOfBirth={true}
                />
                <GregorianDateDisplayInput
                  control={control as any}
                  name="WR1_toDateGregorian"
                  label={t("toDateGregorian")}
                  notRequired={false}
                />
              </div>
            ),
          },
        ];

        const wr1AllowanceFields = [
          {
            type: "autocomplete" as const,
            name: "WR1_forAllowance",
            label: t("forAllowance"),
            options: ForAllowanceOptions,
            value: watch("WR1_forAllowance")?.value,
            onChange: (option: Option | null) => {
              setValue("WR1_forAllowance", option);
              // Clear otherAllowance when changing from "Other" to something else
              if (!isOtherAllowance(option)) {
                setValue("WR1_otherAllowance", "");
                // Force trigger to ensure field is unregistered
                setTimeout(() => {
                  if (typeof trigger === 'function') trigger(["WR1_otherAllowance"]);
                }, 100);
              } else {
                // Trigger validation for otherAllowance when option changes
                if (typeof trigger === 'function') trigger(["WR1_otherAllowance"]);
              }
            },
            validation: { required: tHearingTopics('fieldRequired') },
            notRequired: false,
          },
          ...(isOtherAllowance(watch("WR1_forAllowance"))
            ? [
              {
                type: "input" as const,
                name: "WR1_otherAllowance",
                label: t("otherAllowance"),
                inputType: "text" as const,
                value: watch("WR1_otherAllowance") || "",
                onChange: (value: string) => {
                  setValue("WR1_otherAllowance", value);
                  // Trigger validation immediately when user types
                  if (typeof trigger === 'function') trigger("WR1_otherAllowance");
                },
                validation: { required: tHearingTopics('fieldRequired') },
                notRequired: false,
              },
            ]
            : []),
        ];

        return buildForm(addNoSpacesValidationToTextInputs([...wr1BaseFields, ...wr1AllowanceFields], t));
      case "MIR-1":
        return buildForm(
          getMIR1FormFields({
            t,
            typeOfRequest,
            setValue,
            TypeOfRequestLookUpOptions,
            isEditing,
            watch,
            editTopic,
            trigger,
          })
        );
      case "BPSR-1":
        return buildForm(
          getBPSR1FormFields({
            t,
            commissionType,
            accordingToAgreement,
            setValue,
            CommissionTypeLookUpOptions,
            AccordingToAgreementLookupLookUpOptions,
            isEditing,
            watch,
            editTopic,
            control,
            handleHijriDateChange,
            trigger,
          })
        );
      case "BR-1":
        return buildForm(
          getBR1FormFields({
            t,
            accordingToAgreement,
            setValue,
            AccordingToAgreementLookupLookUpOptions,
            isEditing,
            watch,
            editTopic,
            control,
            handleHijriDateChange,
          })
        );

      case "CMR-1":
        return buildForm(addNoSpacesValidationToTextInputs([
          {
            type: "autocomplete",
            name: "CMR1_amountsPaidFor",
            label: t("amountsPaidFor"),
            options: AmountPaidLookupLookUpOptions,
            value: isEditing ? editTopic?.CMR1_amountsPaidFor : watch("CMR1_amountsPaidFor"),
            onChange: (option: Option | null) => setValue("CMR1_amountsPaidFor", option),
            validation: {
              required: tHearingTopics('fieldRequired'),
              validate: (val: any) =>
                (val && typeof val === 'object' && !!val.value) || tHearingTopics('fieldRequired')
            },
            notRequired: false,
            invalidFeedback: errors?.CMR1_amountsPaidFor?.message,
            control,
          },
          {
            type: "input",
            name: "CMR1_theAmountRequired",
            label: t("theAmountRequired"),
            inputType: "text",
            value: isEditing ? editTopic?.CMR1_theAmountRequired : watch("CMR1_theAmountRequired") || "",
            onChange: (value: string) => handleNumberOnlyChange(value, setValue, "CMR1_theAmountRequired"),
            validation: createNumberOnlyValidation(true, tHearingTopics('fieldRequired')),
            notRequired: false,
            invalidFeedback: errors?.CMR1_theAmountRequired?.message,
            control,
            numberOnly: true,
          },
        ], t));
      case "CMR-3":
        return buildForm(
          addNoSpacesValidationToTextInputs([
            {
              type: "input",
              name: "CMR3_compensationAmount",
              label: t("compensationAmount"),
              inputType: "text",
              value: isEditing ? editTopic?.CMR3_compensationAmount : watch("CMR3_compensationAmount") || "",
              onChange: (value: string) => handleNumberOnlyChange(value, setValue, "CMR3_compensationAmount"),
              validation: createNumberOnlyValidation(true, tHearingTopics('fieldRequired')),
              notRequired: false,
              invalidFeedback: errors?.CMR3_compensationAmount?.message,
              control,
              numberOnly: true,
            },
            {
              type: "custom",
              component: (
                <div className="flex flex-col gap-2">
                  <HijriDatePickerInput
                    control={control as any}
                    name="CMR3_injuryDateHijri"
                    label={t("injuryDateHijri")}
                    rules={{ required: tHearingTopics('fieldRequired') }}
                    notRequired={false}
                    onChangeHandler={(date, onChange) =>
                      handleHijriDateChange(date, onChange, "CMR3_injuryDateGregorian")
                    }
                    isDateOfBirth={true}
                  />
                  <GregorianDateDisplayInput
                    control={control as any}
                    name="CMR3_injuryDateGregorian"
                    label={t("injuryDateGregorian")}
                    notRequired={false}
                  />
                </div>
              ),
            },
            {
              type: "input",
              name: "CMR3_injuryType",
              label: t("injuryType"),
              inputType: "text",
              value: isEditing ? editTopic?.CMR3_injuryType : watch("CMR3_injuryType") || "",
              onChange: (value: string) => setValue("CMR3_injuryType", value),
              validation: { required: tHearingTopics('fieldRequired') },
              notRequired: false,
              invalidFeedback: errors?.CMR3_injuryType?.message,
              control,
            },
          ], t)
        );

      case "CMR-4":
        return buildForm(
          addNoSpacesValidationToTextInputs(
            [
              {
                type: "input",
                name: "CMR4_compensationAmount",
                label: t("amount"),
                inputType: "text",
                value: isEditing ? editTopic?.CMR4_compensationAmount : watch("CMR4_compensationAmount") || "",
                onChange: (value: string) => handleNumberOnlyChange(value, setValue, "CMR4_compensationAmount"),
                validation: createNumberOnlyValidation(true, tHearingTopics("fieldRequired")),
                notRequired: false,
                invalidFeedback: errors?.CMR4_compensationAmount?.message,
                control,
                numberOnly: true,
              },
            ],
            t
          )
        );


      case "CMR-5":
        return buildForm(
          addNoSpacesValidationToTextInputs(
            [
              {
                type: "autocomplete",
                name: "CMR5_kindOfHoliday",
                label: t("kindOfHoliday"),
                options: LeaveTypeLookUpOptions,
                value: isEditing ? editTopic?.CMR5_kindOfHoliday : watch("CMR5_kindOfHoliday"),
                onChange: (opt: Option | null) => setValue("CMR5_kindOfHoliday", opt),
                validation: {
                  required: tHearingTopics("fieldRequired"),
                  validate: (val: any) =>
                    (val && typeof val === "object" && !!val.value) ||
                    tHearingTopics("fieldRequired"),
                },
                notRequired: false,
                invalidFeedback: errors?.CMR5_kindOfHoliday?.message,
                control,
              },
              {
                type: "input",
                name: "CMR5_totalAmount",
                label: t("totalAmount"),
                inputType: "text",
                value: isEditing ? editTopic?.CMR5_totalAmount : watch("CMR5_totalAmount") || "",
                onChange: (v: string) => handleNumberOnlyChange(v, setValue, "CMR5_totalAmount"),
                validation: createNumberOnlyValidation(true, tHearingTopics("fieldRequired")),
                notRequired: false,
                invalidFeedback: errors?.CMR5_totalAmount?.message,
                control,
                numberOnly: true,
              },
              {
                type: "input",
                name: "CMR5_workingHours",
                label: t("workingHours"),
                inputType: "text",
                value: isEditing ? editTopic?.CMR5_workingHours : watch("CMR5_workingHours") || "",
                onChange: (v: string) => handleNumberOnlyChange(v, setValue, "CMR5_workingHours"),
                validation: createNumberOnlyValidation(true, tHearingTopics("fieldRequired")),
                notRequired: false,
                invalidFeedback: errors?.CMR5_workingHours?.message,
                control,
                numberOnly: true,
              },
              {
                type: "input",
                name: "CMR5_additionalDetails",
                label: t("additionalDetails"),
                inputType: "textarea",
                value: isEditing ? editTopic?.CMR5_additionalDetails : watch("CMR5_additionalDetails") || "",
                onChange: (v: string) => setValue("CMR5_additionalDetails", v),
                validation: { required: tHearingTopics("fieldRequired") },
                notRequired: false,
                invalidFeedback: errors?.CMR5_additionalDetails?.message,
                control,
                colSpan: 2, // give textarea full width
              },
            ],
            t
          )
        );

      case "CMR-8":
        return buildForm(addNoSpacesValidationToTextInputs([
          {
            type: "input",
            name: "CMR8_wagesAmount",
            label: t("wagesAmount"),
            inputType: "text",
            value: isEditing ? editTopic?.CMR8_wagesAmount : watch("CMR8_wagesAmount") || "",
            onChange: (value: string) => handleNumberOnlyChange(value, setValue, "CMR8_wagesAmount"),
            validation: createNumberOnlyValidation(true, tHearingTopics('fieldRequired')),
            notRequired: false,
            numberOnly: true,
            invalidFeedback: errors?.CMR8_wagesAmount?.message,
            control,
          },
          {
            type: "custom",
            component: (
              <div className="flex flex-col gap-2">
                <HijriDatePickerInput
                  control={control as any}
                  name="CMR8_fromDateHijri"
                  label={t("fromDateHijri")}
                  rules={{ required: tHearingTopics('fieldRequired') }}
                  notRequired={false}
                  onChangeHandler={(date, onChange) =>
                    handleHijriDateChange(date, onChange, "CMR8_fromDateGregorian")
                  }
                  isDateOfBirth={true}
                />
                <GregorianDateDisplayInput
                  control={control as any}
                  name="CMR8_fromDateGregorian"
                  label={t("fromDateGregorian")}
                  notRequired={false}
                />
              </div>
            ),
          },
          {
            type: "custom",
            component: (
              <div className="flex flex-col gap-2">
                <HijriDatePickerInput
                  control={control as any}
                  name="CMR8_toDateHijri"
                  label={t("toDateHijri")}
                  rules={{ required: tHearingTopics('fieldRequired') }}
                  notRequired={false}
                  onChangeHandler={(date, onChange) =>
                    handleHijriDateChange(date, onChange, "CMR8_toDateGregorian")
                  }
                  isDateOfBirth={true}
                />
                <GregorianDateDisplayInput
                  control={control as any}
                  name="CMR8_toDateGregorian"
                  label={t("toDateGregorian")}
                  notRequired={false}
                />
              </div>
            ),
          },
        ], t));
      case "CMR-6":
        return buildForm(addNoSpacesValidationToTextInputs([
          {
            type: "input",
            name: "CMR6_newPayAmount",
            label: t("newPayAmount"),
            inputType: "text",
            value: isEditing ? editTopic?.CMR6_newPayAmount : watch("CMR6_newPayAmount") || "",
            onChange: (v: string) => handleNumberOnlyChange(v, setValue, "CMR6_newPayAmount"),
            validation: createNumberOnlyValidation(true, tHearingTopics("fieldRequired")),
            notRequired: false,
            invalidFeedback: errors?.CMR6_newPayAmount?.message,
            control,
            numberOnly: true,
          },
          {
            type: "autocomplete",
            name: "CMR6_payIncreaseType",
            label: t("payIncreaseType"),
            options: PayIncreaseTypeOptions,
            value: isEditing ? editTopic?.CMR6_payIncreaseType : watch("CMR6_payIncreaseType"),
            onChange: (opt: Option | null) => setValue("CMR6_payIncreaseType", opt),
            validation: {
              required: tHearingTopics("fieldRequired"),
              validate: (val: any) =>
                (val && typeof val === "object" && !!val.value) || tHearingTopics("fieldRequired"),
            },
            notRequired: false,
            invalidFeedback: errors?.CMR6_payIncreaseType?.message,
            control,
          },
          {
            type: "custom",
            component: (
              <div className="flex flex-col gap-2">
                <HijriDatePickerInput
                  control={control as any}
                  name="CMR6_fromDateHijri"
                  label={t("fromDateHijri")}
                  rules={{ required: tHearingTopics("fieldRequired") }}
                  notRequired={false}
                  onChangeHandler={(date, onChange) =>
                    handleHijriDateChange(date, onChange, "CMR6_fromDateGregorian")
                  }
                />
                <GregorianDateDisplayInput
                  control={control as any}
                  name="CMR6_fromDateGregorian"
                  label={t("fromDateGregorian")}
                  notRequired={false}
                />
              </div>
            ),
          },
          {
            type: "custom",
            component: (
              <div className="flex flex-col gap-2">
                <HijriDatePickerInput
                  control={control as any}
                  name="CMR6_toDateHijri"
                  label={t("toDateHijri")}
                  rules={{ required: tHearingTopics("fieldRequired") }}
                  notRequired={false}
                  onChangeHandler={(date, onChange) =>
                    handleHijriDateChange(date, onChange, "CMR6_toDateGregorian")
                  }
                />
                <GregorianDateDisplayInput
                  control={control as any}
                  name="CMR6_toDateGregorian"
                  label={t("toDateGregorian")}
                  notRequired={false}
                />
              </div>
            ),
          },
          {
            type: "input",
            name: "CMR6_wageDifference",
            label: t("wageDifference"),
            inputType: "text",
            value: isEditing ? editTopic?.CMR6_wageDifference : watch("CMR6_wageDifference") || "",
            onChange: (v: string) => setValue("CMR6_wageDifference", v),
            validation: { required: tHearingTopics("fieldRequired") },
            notRequired: false,
            invalidFeedback: errors?.CMR6_wageDifference?.message,
            control,
          },
        ], t));

      case "CMR-7":
        return buildForm(addNoSpacesValidationToTextInputs([
          {
            type: "custom",
            component: (
              <div className="flex flex-col gap-2">
                <HijriDatePickerInput
                  control={control as any}
                  name="CMR7_fromDateHijri"
                  label={t("fromDateHijri")}
                  rules={{ required: tHearingTopics('fieldRequired') }}
                  notRequired={false}
                  onChangeHandler={(date, onChange) =>
                    handleHijriDateChange(date, onChange, "CMR7_fromDateGregorian")
                  }
                  isDateOfBirth={true}
                />
                <GregorianDateDisplayInput
                  control={control as any}
                  name="CMR7_fromDateGregorian"
                  label={t("fromDateGregorian")}
                  notRequired={false}
                />
              </div>
            ),
          },
          {
            type: "custom",
            component: (
              <div className="flex flex-col gap-2">
                <HijriDatePickerInput
                  control={control as any}
                  name="CMR7_toDateHijri"
                  label={t("toDateHijri")}
                  rules={{ required: tHearingTopics('fieldRequired') }}
                  notRequired={false}
                  onChangeHandler={(date, onChange) =>
                    handleHijriDateChange(date, onChange, "CMR7_toDateGregorian")
                  }
                  isDateOfBirth={true}
                />
                <GregorianDateDisplayInput
                  control={control as any}
                  name="CMR7_toDateGregorian"
                  label={t("toDateGregorian")}
                  notRequired={false}
                />
              </div>
            ),
          },
          {
            type: "input",
            name: "CMR7_durationOfLeaveDue",
            label: t("durationOfLeaveDue"),
            inputType: "text",
            value: isEditing ? editTopic?.CMR7_durationOfLeaveDue : watch("CMR7_durationOfLeaveDue") || "",
            onChange: (value: string) => setValue("CMR7_durationOfLeaveDue", value),
            validation: { required: tHearingTopics('fieldRequired') },
            notRequired: false,
            invalidFeedback: errors?.CMR7_durationOfLeaveDue?.message,
            control,
          },
          {
            type: "input",
            name: "CMR7_payDue",
            label: t("payDue"),
            inputType: "text",
            value: isEditing ? editTopic?.CMR7_payDue : watch("CMR7_payDue") || "",
            onChange: (value: string) => handleNumberOnlyChange(value, setValue, "CMR7_payDue"),
            validation: createNumberOnlyValidation(true, tHearingTopics('fieldRequired')),
            notRequired: false,
            numberOnly: true,
            invalidFeedback: errors?.CMR7_payDue?.message,
            control,
          },
        ], t));
      case "LCUT-1":
        return buildForm(addNoSpacesValidationToTextInputs([
          {
            type: "input",
            name: "LCUT1_amountOfCompensation",
            label: t("amountOfCompensation"),
            inputType: "text",
            value: watch("LCUT1_amountOfCompensation") || "",
            onChange: (value: string) => handleNumberOnlyChange(value, setValue, "LCUT1_amountOfCompensation"),
            validation: createNumberOnlyValidation(true, tHearingTopics('fieldRequired')),
            notRequired: false,
            numberOnly: true,
          },
        ], t));
      case "EDO-1":
        return buildForm(addNoSpacesValidationToTextInputs([
          {
            type: "autocomplete",
            name: "EDO1_fromLocation",
            label: t("fromLocation"),
            options: RegionOptions,
            isLoading: isRegionLoading,
            value:
              watch("EDO1_fromLocation")?.value || editTopic?.EDO1_fromLocation?.value || watch("fromLocation")?.value || editTopic?.fromLocation?.value,
            onChange: (option: Option | null) =>
              setValue("EDO1_fromLocation", option),
            validation: { required: tHearingTopics('fieldRequired') },
            notRequired: false,
          },
          {
            type: "autocomplete",
            name: "EDO1_toLocation",
            label: t("toLocation"),
            options: RegionOptions,
            isLoading: isRegionLoading,
            value: watch("EDO1_toLocation")?.value || editTopic?.EDO1_toLocation?.value || watch("toLocation")?.value || editTopic?.toLocation?.value,
            onChange: (option: Option | null) => setValue("EDO1_toLocation", option),
            validation: { required: tHearingTopics('fieldRequired') },
            notRequired: false,
          },
          {
            type: "custom",
            component: (
              <div className="flex flex-col gap-2">
                <HijriDatePickerInput
                  control={control as any}
                  name="EDO1_managerialDecisionDateHijri"
                  label={t("managerialDecisionDateHijri")}
                  rules={{ required: tHearingTopics('fieldRequired') }}
                  notRequired={false}
                  onChangeHandler={(date, onChange) =>
                    handleHijriDateChange(
                      date,
                      onChange,
                      "EDO1_managerialDecisionDateGregorian"
                    )
                  }
                />
                <GregorianDateDisplayInput
                  control={control as any}
                  name="EDO1_managerialDecisionDateGregorian"
                  label={t("managerialDecisionDateGregorian")}
                  notRequired={false}
                />
              </div>
            ),
          },
          {
            type: "input",
            name: "EDO1_managerialDecisionNumber",
            label: t("managerialDecisionNumber"),
            inputType: "text",
            value: watch("EDO1_managerialDecisionNumber") || watch("managerialDecisionNumber") || "",
            onChange: (value: string) =>
              handleNumberOnlyChange(value, setValue, "EDO1_managerialDecisionNumber"),
            validation: createNumberOnlyValidation(true, tHearingTopics('fieldRequired')),
            notRequired: false,
            numberOnly: true,
          },
        ], t));
      case "EDO-2":
        return buildForm(addNoSpacesValidationToTextInputs([
          {
            type: "input",
            name: "EDO2_fromJob",
            label: t("fromJob"),
            inputType: "text",
            value: watch("EDO2_fromJob") || watch("fromJob") || "",
            onChange: (value: string) => setValue("EDO2_fromJob", value),
            validation: { required: tHearingTopics('fieldRequired') },
            notRequired: false,
          },
          {
            type: "input",
            name: "EDO2_toJob",
            label: t("toJob"),
            inputType: "text",
            value: watch("EDO2_toJob") || watch("toJob") || "",
            onChange: (value: string) => setValue("EDO2_toJob", value),
            validation: { required: tHearingTopics('fieldRequired') },
            notRequired: false,
          },
          {
            type: "custom",
            component: (
              <div className="flex flex-col gap-2">
                <HijriDatePickerInput
                  control={control as any}
                  name="EDO2_managerialDecisionDateHijri"
                  label={t("managerialDecisionDateHijri")}
                  rules={{ required: tHearingTopics('fieldRequired') }}
                  notRequired={false}
                  onChangeHandler={(date, onChange) =>
                    handleHijriDateChange(
                      date,
                      onChange,
                      "EDO2_managerialDecisionDateGregorian"
                    )
                  }
                />
                <GregorianDateDisplayInput
                  control={control as any}
                  name="EDO2_managerialDecisionDateGregorian"
                  label={t("managerialDecisionDateGregorian")}
                  notRequired={false}
                />
              </div>
            ),
          },
          {
            type: "input",
            name: "EDO2_managerialDecisionNumber",
            label: t("managerialDecisionNumber"),
            inputType: "text",
            value: watch("EDO2_managerialDecisionNumber") || watch("managerialDecisionNumber") || "",
            onChange: (value: string) =>
              handleNumberOnlyChange(value, setValue, "EDO2_managerialDecisionNumber"),
            validation: createNumberOnlyValidation(true, tHearingTopics('fieldRequired')),
            notRequired: false,
            numberOnly: true,
          },
        ], t));
      case "EDO-4":
        return buildForm(addNoSpacesValidationToTextInputs([
          {
            type: "autocomplete",
            name: "EDO4_typesOfPenalties",
            label: t("typesOfPenalties"),
            options: TypesOfPenaltiesOptions,
            value: watch("EDO4_typesOfPenalties")?.value || watch("typesOfPenalties")?.value,
            onChange: (option: Option | null) =>
              setValue("EDO4_typesOfPenalties", option),
            validation: { required: tHearingTopics('fieldRequired') },
            notRequired: false,
          },
          {
            type: "custom",
            component: (
              <div className="flex flex-col gap-2">
                <HijriDatePickerInput
                  control={control as any}
                  name="EDO4_managerialDecisionDateHijri"
                  label={t("managerialDecisionDateHijri")}
                  rules={{ required: tHearingTopics('fieldRequired') }}
                  notRequired={false}
                  onChangeHandler={(date, onChange) =>
                    handleHijriDateChange(
                      date,
                      onChange,
                      "EDO4_managerialDecisionDateGregorian"
                    )
                  }
                />
                <GregorianDateDisplayInput
                  control={control as any}
                  name="EDO4_managerialDecisionDateGregorian"
                  label={t("managerialDecisionDateGregorian")}
                  notRequired={false}
                />
              </div>
            ),
          },
          {
            type: "input",
            name: "EDO4_managerialDecisionNumber",
            label: t("managerialDecisionNumber"),
            inputType: "text",
            value: watch("EDO4_managerialDecisionNumber") || watch("managerialDecisionNumber") || "",
            onChange: (value: string) =>
              handleNumberOnlyChange(value, setValue, "EDO4_managerialDecisionNumber"),
            validation: createNumberOnlyValidation(true, tHearingTopics('fieldRequired')),
            notRequired: false,
            numberOnly: true,
          },
        ], t));
      case "EDO-3":
        return buildForm(addNoSpacesValidationToTextInputs([
          {
            type: "input",
            name: "EDO3_amountOfReduction",
            label: t("amountOfReduction"),
            inputType: "text",
            value: watch("EDO3_amountOfReduction") || watch("amountOfReduction") || "",
            onChange: (value: string) => handleNumberOnlyChange(value, setValue, "EDO3_amountOfReduction"),
            validation: createNumberOnlyValidation(true, tHearingTopics('fieldRequired')),
            notRequired: false,
            numberOnly: true,
          },
          {
            type: "custom",
            component: (
              <div className="flex flex-col gap-2">
                <HijriDatePickerInput
                  control={control as any}
                  name="EDO3_managerialDecisionDateHijri"
                  label={t("managerialDecisionDateHijri")}
                  rules={{ required: tHearingTopics('fieldRequired') }}
                  notRequired={false}
                  onChangeHandler={(date, onChange) =>
                    handleHijriDateChange(
                      date,
                      onChange,
                      "EDO3_managerialDecisionDateGregorian"
                    )
                  }
                />
                <GregorianDateDisplayInput
                  control={control as any}
                  name="EDO3_managerialDecisionDateGregorian"
                  label={t("managerialDecisionDateGregorian")}
                  notRequired={false}
                />
              </div>
            ),
          },
          {
            type: "input",
            name: "EDO3_managerialDecisionNumber",
            label: t("managerialDecisionNumber"),
            inputType: "text",
            value: watch("EDO3_managerialDecisionNumber") || watch("managerialDecisionNumber") || "",
            onChange: (value: string) =>
              handleNumberOnlyChange(value, setValue, "EDO3_managerialDecisionNumber"),
            validation: createNumberOnlyValidation(true, tHearingTopics('fieldRequired')),
            notRequired: false,
            numberOnly: true,
          },
        ], t));
      case "HIR-1": {
        return buildForm(addNoSpacesValidationToTextInputs([
          {
            type: "radio",
            name: "HIR1_AccommodationSource",
            label: t("accommodationSource"),
            options: [
              { label: t("doesBylawsIncludeAddingAccommodations"), value: "bylaws" },
              { label: t("doesContractIncludeAddingAccommodations"), value: "contract" }
            ],
            value: watch("HIR1_AccommodationSource") || "",
            onChange: (value: string) => {
              setValue("HIR1_AccommodationSource", value);
              // Set the appropriate flags and clear other fields when switching between options
              if (value === "bylaws") {
                setValue("HIR1_IsContractIncludeAddingAccommodation", "No");
                setValue("HIR1_HousingSpecificationsInContract", "");
                setValue("HIR1_HousingSpecifications", "");
                setValue("HIR1_IsBylawsIncludeAddingAccomodation", "Yes");
              } else if (value === "contract") {
                setValue("HIR1_IsBylawsIncludeAddingAccomodation", "No");
                setValue("HIR1_HousingSpecificationsInBylaws", "");
                setValue("HIR1_IsContractIncludeAddingAccommodation", "Yes");
              }
            },
            validation: { required: tHearingTopics('fieldRequired') },
            notRequired: false,
            colSpan: 2,
          },
          (watch("HIR1_AccommodationSource") === "bylaws") && {
            type: "input",
            name: "HIR1_HousingSpecificationsInBylaws",
            label: t("housingSpecificationInByLaws"),
            inputType: "text",
            value: watch("HIR1_HousingSpecificationsInBylaws") || "",
            onChange: (value: string) => setValue("HIR1_HousingSpecificationsInBylaws", value),
            validation: { required: tHearingTopics('fieldRequired') },
            notRequired: false,
            colSpan: 1,
          },
          (watch("HIR1_AccommodationSource") === "contract") && {
            type: "input",
            name: "HIR1_HousingSpecificationsInContract",
            label: t("housingSpecificationsInContract"),
            inputType: "text",
            value: watch("HIR1_HousingSpecificationsInContract") || "",
            onChange: (value: string) => setValue("HIR1_HousingSpecificationsInContract", value),
            validation: { required: tHearingTopics('fieldRequired') },
            notRequired: false,
            colSpan: 1,
          },
          (watch("HIR1_AccommodationSource") === "contract") && {
            type: "input",
            name: "HIR1_HousingSpecifications",
            label: t("actualHousingSpecifications"),
            inputType: "text",
            value: watch("HIR1_HousingSpecifications") || "",
            onChange: (value: string) => setValue("HIR1_HousingSpecifications", value),
            validation: { required: tHearingTopics('fieldRequired') },
            notRequired: false,
            colSpan: 1,
          },
        ], t));
      }

      case "JAR-2":
        return buildForm(addNoSpacesValidationToTextInputs([
          {
            type: "input",
            name: "JAR2_currentJobTitle",
            label: t("currentJobTitle"),
            inputType: "text",
            value: watch("JAR2_currentJobTitle") || "",
            onChange: (value: string) => setValue("JAR2_currentJobTitle", value),
            validation: { required: tHearingTopics('fieldRequired') },
            notRequired: false,
          },
          {
            type: "input",
            name: "JAR2_requiredJobTitle",
            label: t("requiredJobTitle"),
            inputType: "text",
            value: watch("JAR2_requiredJobTitle") || "",
            onChange: (value: string) => setValue("JAR2_requiredJobTitle", value),
            validation: { required: tHearingTopics('fieldRequired') },
            notRequired: false,
          },
        ], t));
      case "JAR-3": {
        return buildForm(addNoSpacesValidationToTextInputs([
          {
            type: "radio",
            name: "JAR3_promotionMechanism",
            label: t("doesTheInternalRegulationIncludePromotionMechanism"),
            options: [
              { label: t("yes"), value: "Yes" },
              { label: t("no"), value: "No" },
            ],
            value: watch("JAR3_promotionMechanism") || "",
            onChange: (value: string) => setValue("JAR3_promotionMechanism", value),
            validation: { required: tHearingTopics('fieldRequired') },
            notRequired: false,
          },
          {
            type: "radio",
            name: "JAR3_additionalUpgrade",
            label: t("doesContractIncludeAdditionalUpgrade"),
            options: [
              { label: t("yes"), value: "Yes" },
              { label: t("no"), value: "No" },
            ],
            value: watch("JAR3_additionalUpgrade") || "",
            onChange: (value: string) => setValue("JAR3_additionalUpgrade", value),
            validation: { required: tHearingTopics('fieldRequired') },
            notRequired: false,
          },
        ], t));
      }
      case "JAR-4":
        return buildForm(addNoSpacesValidationToTextInputs([
          {
            type: "input",
            name: "JAR4_CurrentPosition",
            label: t("currentPosition"),
            inputType: "text",
            value: watch("JAR4_CurrentPosition") || "",
            onChange: (value: string) => setValue("JAR4_CurrentPosition", value),
            validation: { required: tHearingTopics('fieldRequired') },
            notRequired: false,
          },
          {
            type: "input",
            name: "JAR4_WantedJob",
            label: t("theWantedJob"),
            inputType: "text",
            value: watch("JAR4_WantedJob") || "",
            onChange: (value: string) => setValue("JAR4_WantedJob", value),
            validation: { required: tHearingTopics('fieldRequired') },
            notRequired: false,
          },
        ], t));
      case "LRESR-1":
        return buildForm(addNoSpacesValidationToTextInputs([
          {
            type: "input",
            name: "LRESR1_Amount",
            label: t("amount"),
            inputType: "text",
            value: watch("LRESR1_Amount") || "",
            onChange: (value: string) => handleNumberOnlyChange(value, setValue, "LRESR1_Amount"),
            validation: createNumberOnlyValidation(true, tHearingTopics('fieldRequired')),
            notRequired: false,
            numberOnly: true,
          },
        ], t));
      case "TTR-1":
        return buildForm(addNoSpacesValidationToTextInputs([
          {
            type: "autocomplete" as const,
            name: "TTR1_travelingWay",
            label: t("travelingWay"),
            options: TravelingWayOptions,
            value: watch("TTR1_travelingWay") || travelingWay,
            onChange: (option: Option | null) =>
              setValue("TTR1_travelingWay", option),
            validation: { required: tHearingTopics('fieldRequired') },
            notRequired: false,
          },
        ], t));
      case "RFR-1":
        return buildForm(addNoSpacesValidationToTextInputs([
          {
            type: "input",
            name: "RFR1_Amount",
            label: t("amount"),
            inputType: "text",
            value: watch("RFR1_Amount") || "",
            onChange: (value: string) => handleNumberOnlyChange(value, setValue, "RFR1_Amount"),
            validation: createNumberOnlyValidation(true, tHearingTopics('fieldRequired')),
            notRequired: false,
            numberOnly: true,
          },
          {
            type: "input",
            name: "RFR1_Consideration",
            label: t("consideration"),
            inputType: "text",
            value: watch("RFR1_Consideration") || "",
            onChange: (value: string) => setValue("RFR1_Consideration", value),
            validation: { required: tHearingTopics('fieldRequired') },
            notRequired: false,
          },
          {
            type: "custom",
            component: (
              <div className="flex flex-col gap-2">
                <HijriDatePickerInput
                  control={control}
                  name="RFR1_dateHijri"
                  label={t("dateHijri")}
                  rules={{
                    required: true,
                  }}
                  onChangeHandler={(date, onChange) =>
                    handleHijriDateChange(date, onChange, "RFR1_dateGregorian")
                  }
                  isDateOfBirth={true}

                />
                <GregorianDateDisplayInput
                  control={control}
                  name="RFR1_dateGregorian"
                  label={t("gregorianDate")}
                />
              </div>
            ),
          },
        ], t));
      case "RR-1":
        return buildForm(addNoSpacesValidationToTextInputs([
          {
            type: "input",
            name: "RR1_Amount",
            label: t("amount"),
            inputType: "text",
            value: watch("RR1_Amount") || "",
            onChange: (value: string) => handleNumberOnlyChange(value, setValue, "RR1_Amount"),
            validation: createNumberOnlyValidation(true, tHearingTopics('fieldRequired')),
            notRequired: false,
            numberOnly: true,
          },
          {
            type: "input",
            name: "RR1_Type",
            label: t("rewardType"),
            inputType: "text",
            value: watch("RR1_Type") || "",
            onChange: (value: string) => setValue("RR1_Type", value),
            validation: { required: tHearingTopics('fieldRequired') },
            notRequired: false,
          },
        ], t));
      default:
        return [];
    }
  };

  const step3: any = {
    gridCols: 2,
    className: "step3",
    ...(getFormBySubCategory().filter(Boolean).length > 0
      ? {
        title: t("topics_data"),
        children: [
          ...(getFormBySubCategory().filter(Boolean) as FormElement[]),
          ...getCommonElements(isValid),
        ],
      }
      : {
        children: [
          ...getCommonElements(true),
        ],
      }),
  };

  const layout: SectionLayout[] = [];
  if (!isEditing) layout.push(step1);
  if (showLegalSection || isEditing ? !isEditing : isEditing)
    layout.push(step2);
  if (showTopicData || isEditing) layout.push(step3);
  return layout;
};
