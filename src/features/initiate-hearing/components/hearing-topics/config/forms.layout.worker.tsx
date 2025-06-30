import React, { useEffect } from "react";
import {
  SectionLayout,
  Option,
  FormElement,
  UseFormLayoutParams,
} from "@/shared/components/form/form.types";
import {
  buildForm,
  dateFieldConfigs,
  getCommonElements,
  initFormConfig,
  managerialDateConfigs,
} from "@/config/formConfig";
import { formatHijriDate, mapToOptions, toHijri_YYYYMMDD, formatDateString, formatDateToYYYYMMDD } from "@/shared/lib/helpers";
import { getMIR1FormFields } from "./MIR1Form";
import { getBPSR1FormFields } from "./BPSR1Form";
import { getBR1FormFields } from "./BR1Form";
import { getStep1FormFields } from "./Step1From";
import { getStep2FormFields } from "./Step2From";
import { HijriDatePickerInput } from "@/shared/components/calanders/HijriDatePickerInput";
import { GregorianDateDisplayInput } from "@/shared/components/calanders/GregorianDateDisplayInput";
import { DateObject } from "react-multi-date-picker";
import hijriCalendar from "react-date-object/calendars/arabic";
import gregorianCalendar from "react-date-object/calendars/gregorian";
import hijriLocale from "react-date-object/locales/arabic_en";
import gregorianLocale from "react-date-object/locales/gregorian_en";
import { useGetRegionLookupDataQuery } from "@/features/initiate-hearing/api/create-case/workDetailApis";
import { useTranslation } from "react-i18next";

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
  isValid: isValid,
  control: control
}: UseFormLayoutParams): SectionLayout[] => {
  const { t: tHearingTopics, i18n } = useTranslation("hearingtopics");

  const { data: regionData, isFetching: isRegionLoading } = useGetRegionLookupDataQuery({
    AcceptedLanguage: i18n.language.toUpperCase(),
    context: "default",
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
  const managerial_decision_date_hijri = watch("managerial_decision_date_hijri");
  const managerial_decision_date_gregorian = watch("managerial_decision_date_gregorian");

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
    const gregorian = date.convert(gregorianCalendar, gregorianLocale).format("YYYY/MM/DD");

    const hijriCompact = hijri ? (formatDateToYYYYMMDD(hijri) || "") : "";
    const gregorianCompact = gregorian ? (formatDateToYYYYMMDD(gregorian) || "") : "";

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

  const getFormBySubCategory = (): (FormElement | false)[] => {
    const currentSubCategory = isEditing ? subCategory?.value : subCategoryValue?.value;
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
      case "WR-1":
        const baseFields = [
          {
            type: "input" as const,
            name: "amount",
            label: t("amount"),
            inputType: "number" as const,
            min: 0,
            value: watch("amount") || "",
            onChange: (value: string) => setValue("amount", value),
            validation: { required: "Amount is required" },
          },
          dateFieldConfigs(t, isEditing, from_date_hijri, to_date_hijri, setValue, control, handleHijriDateChange)
            .fromDate,
          dateFieldConfigs(t, isEditing, to_date_hijri, to_date_hijri, setValue, control, handleHijriDateChange).toDate,
        ];
        const shouldShowAllowanceFields =
          watch("subCategory")?.value === "WR-1" || subCategory?.value === "WR-1";

        const allowanceFields = shouldShowAllowanceFields
          ? [
            {
              type: "autocomplete" as const,
              name: "forAllowance",
              label: t("forAllowance"),
              options: ForAllowanceOptions,
              value: watch("forAllowance")?.value,
              onChange: (option: Option | null) =>
                setValue("forAllowance", option),
            },
            ...((watch("forAllowance")?.label === "Other" || (isEditing && editTopic?.ForAllowance === "Other"))
              ? [
                {
                  type: "input" as const,
                  name: "otherAllowance",
                  label: t("otherAllowance"),
                  inputType: "text" as const,
                  value: isEditing ? editTopic?.OtherAllowance || editTopic?.otherAllowance : watch("otherAllowance") || "",
                  onChange: (value: string) =>
                    setValue("otherAllowance", value),
                },
              ]
              : []),
          ]
          : [];

        return buildForm([...baseFields, ...allowanceFields]);
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
          })
        );
      case "CMR-4":
        return buildForm([
          {
            type: "input",
            name: "amount",
            label: t("amount"),
            inputType: "number",
            min: 0,
            value: watch("amount") || "",
            onChange: (value) => setValue("amount", value),
          },
        ]);
      case "CMR-3":
        return buildForm([
          {
            type: "input",
            name: "compensationAmount",
            label: t("compensationAmount"),
            inputType: "number",
            min: 0,
            value: watch("compensationAmount") || "",
            onChange: (value) => setValue("compensationAmount", value),
          },
          {
            type: "custom",
            component: (
              <div className="flex flex-col gap-2">
                <HijriDatePickerInput
                  control={control}
                  name="injury_date_hijri"
                  label={t("injuryDateHijri")}
                  rules={{}}
                  onChangeHandler={(date, onChange) =>
                    handleHijriDateChange(
                      date,
                      onChange,
                      "injury_date_gregorian"
                    )
                  }
                />
                <GregorianDateDisplayInput
                  control={control}
                  name="injury_date_gregorian"
                  label={t("injuryDateGregorian")}
                />
              </div>
            ),
          },
          {
            type: "input",
            name: "injuryType",
            label: t("injuryType"),
            inputType: "text",
            value: watch("injuryType") || "",
            onChange: (value) => setValue("injuryType", value),
          },
        ]);
      case "CMR-1":
        return buildForm([
          {
            type: "autocomplete",
            name: "amountsPaidFor",
            label: t("amountsPaidFor"),
            options: AmountPaidLookupLookUpOptions,
            value: watch("amountsPaidFor")?.value,
            onChange: (option: Option | null) =>
              setValue("amountsPaidFor", option),
          },
          {
            type: "input",
            name: "theAmountRequired",
            label: t("theAmountRequired"),
            inputType: "number",
            min: 0,
            value: watch("theAmountRequired") || "",
            onChange: (value) => setValue("theAmountRequired", value),
          },
        ]);
      case "CMR-5":
        return buildForm([
          {
            type: "autocomplete",
            name: "kindOfHoliday",
            label: t("kindOfHoliday"),
            options: LeaveTypeLookUpOptions,
            value: watch("kindOfHoliday")?.value,
            onChange: (option: Option | null) =>
              setValue("kindOfHoliday", option),
          },
          {
            type: "input",
            name: "totalAmount",
            label: t("totalAmount"),
            inputType: "number",
            min: 0,
            value: watch("totalAmount") || "",
            onChange: (value) => setValue("totalAmount", value),
          },
          {
            type: "input",
            name: "workingHours",
            label: t("workingHours"),
            inputType: "number",
            min: 0,
            value: watch("workingHours") || "",
            onChange: (value) => setValue("workingHours", value),
          },
          {
            type: "input",
            name: "additionalDetails",
            label: t("additionalDetails"),
            inputType: "textarea",
            value: watch("additionalDetails") || "",
            notRequired: true,
            onChange: (value) => setValue("additionalDetails", value),
          },
        ]);
      case "CMR-8":
        return buildForm([
          {
            type: "input",
            name: "wagesAmount",
            label: t("wagesAmount"),
            inputType: "number",
            min: 0,
            value: watch("wagesAmount") || "",
            onChange: (value) => setValue("wagesAmount", value),
          },
          {
            type: "custom",
            component: (
              <div className="flex flex-col gap-2">
                <HijriDatePickerInput
                  control={control}
                  name="from_date_hijri"
                  label={t("fromDateHijri")}
                  rules={{}}
                  onChangeHandler={(date, onChange) =>
                    handleHijriDateChange(
                      date,
                      onChange,
                      "from_date_gregorian"
                    )
                  }
                />
                <GregorianDateDisplayInput
                  control={control}
                  name="from_date_gregorian"
                  label={t("fromDateGregorian")}
                />
              </div>
            ),
          },
          {
            type: "custom",
            component: (
              <div className="flex flex-col gap-2">
                <HijriDatePickerInput
                  control={control}
                  name="to_date_hijri"
                  label={t("toDateHijri")}
                  rules={{}}
                  onChangeHandler={(date, onChange) =>
                    handleHijriDateChange(
                      date,
                      onChange,
                      "to_date_gregorian"
                    )
                  }
                />
                <GregorianDateDisplayInput
                  control={control}
                  name="to_date_gregorian"
                  label={t("toDateGregorian")}
                />
              </div>
            ),
          },
        ]);
      case "CMR-6":
        return buildForm([
          {
            type: "input",
            name: "newPayAmount",
            label: t("newPayAmount"),
            inputType: "number",
            min: 0,
            value: watch("newPayAmount") || "",
            onChange: (value) => setValue("newPayAmount", value),
          },
          {
            type: "input",
            name: "payIncreaseType",
            label: t("payIncreaseType"),
            inputType: "text",
            value: watch("payIncreaseType") || "",
            onChange: (value) => setValue("payIncreaseType", value),
          },
          {
            type: "custom",
            component: (
              <div className="flex flex-col gap-2">
                <HijriDatePickerInput
                  control={control}
                  name="from_date_hijri"
                  label={t("fromDateHijri")}
                  rules={{}}
                  onChangeHandler={(date, onChange) =>
                    handleHijriDateChange(
                      date,
                      onChange,
                      "from_date_gregorian"
                    )
                  }
                />
                <GregorianDateDisplayInput
                  control={control}
                  name="from_date_gregorian"
                  label={t("fromDateGregorian")}
                />
              </div>
            ),
          },
          {
            type: "custom",
            component: (
              <div className="flex flex-col gap-2">
                <HijriDatePickerInput
                  control={control}
                  name="to_date_hijri"
                  label={t("toDateHijri")}
                  rules={{}}
                  onChangeHandler={(date, onChange) =>
                    handleHijriDateChange(
                      date,
                      onChange,
                      "to_date_gregorian"
                    )
                  }
                />
                <GregorianDateDisplayInput
                  control={control}
                  name="to_date_gregorian"
                  label={t("toDateGregorian")}
                />
              </div>
            ),
          },
          {
            type: "input",
            name: "wageDifference",
            label: t("wageDifference"),
            inputType: "text",
            value: watch("wageDifference") || "",
            onChange: (value) => setValue("wageDifference", value),
          },
        ]);
      case "CMR-7":
        return buildForm([
          {
            type: "custom",
            component: (
              <div className="flex flex-col gap-2">
                <HijriDatePickerInput
                  control={control}
                  name="from_date_hijri"
                  label={t("fromDateHijri")}
                  rules={{}}
                  onChangeHandler={(date, onChange) =>
                    handleHijriDateChange(
                      date,
                      onChange,
                      "from_date_gregorian"
                    )
                  }
                />
                <GregorianDateDisplayInput
                  control={control}
                  name="from_date_gregorian"
                  label={t("fromDateGregorian")}
                />
              </div>
            ),
          },
          {
            type: "custom",
            component: (
              <div className="flex flex-col gap-2">
                <HijriDatePickerInput
                  control={control}
                  name="to_date_hijri"
                  label={t("toDateHijri")}
                  rules={{}}
                  onChangeHandler={(date, onChange) =>
                    handleHijriDateChange(
                      date,
                      onChange,
                      "to_date_gregorian"
                    )
                  }
                />
                <GregorianDateDisplayInput
                  control={control}
                  name="to_date_gregorian"
                  label={t("toDateGregorian")}
                />
              </div>
            ),
          },
          {
            type: "input",
            name: "durationOfLeaveDue",
            label: t("durationOfLeaveDue"),
            inputType: "text",
            value: watch("durationOfLeaveDue") || "",
            onChange: (value) => setValue("durationOfLeaveDue", value),
          },
          {
            type: "input",
            name: "payDue",
            label: t("payDue"),
            inputType: "number",
            min: 0,
            value: watch("payDue") || "",
            onChange: (value) => setValue("payDue", value),
          },
        ]);
      case "LCUT-1":
        return buildForm([
          {
            type: "input",
            name: "amountOfCompensation",
            label: t("amountOfCompensation"),
            inputType: "number",
            min: 0,
            value: watch("amountOfCompensation") || "",
            onChange: (value) => setValue("amountOfCompensation", value),
          },
        ]);
      case "EDO-1":
        return buildForm([
          {
            type: "autocomplete",
            name: "fromLocation",
            label: t("fromLocation"),
            options: RegionOptions,
            isLoading: isRegionLoading,
            value: watch("fromLocation")?.value || editTopic?.fromLocation?.value,
            onChange: (option: Option | null) => setValue("fromLocation", option),
          },
          {
            type: "autocomplete",
            name: "toLocation",
            label: t("toLocation"),
            options: RegionOptions,
            isLoading: isRegionLoading,
            value: watch("toLocation")?.value || editTopic?.toLocation?.value,
            onChange: (option: Option | null) => setValue("toLocation", option),
          },
          {
            type: "custom",
            component: (
              <div className="flex flex-col gap-2">
                <HijriDatePickerInput
                  control={control}
                  name="managerial_decision_date_hijri"
                  label={t("managerialDecisionDateHijri")}
                  rules={{}}
                  onChangeHandler={(date, onChange) =>
                    handleHijriDateChange(
                      date,
                      onChange,
                      "managerial_decision_date_gregorian"
                    )
                  }
                />
                <GregorianDateDisplayInput
                  control={control}
                  name="managerial_decision_date_gregorian"
                  label={t("managerialDecisionDateGregorian")}
                />
              </div>
            ),
          },
          {
            type: "input",
            name: "managerialDecisionNumber",
            label: t("managerialDecisionNumber"),
            inputType: "number",
            notRequired: true,
            value: watch("managerialDecisionNumber") || "",
            onChange: (value: string) => setValue("managerialDecisionNumber", value),
          },
        ]);
      case "EDO-2":
        return buildForm([
          {
            type: "input",
            name: "fromJob",
            label: t("fromJob"),
            inputType: "text",
            value: "",
            onChange: (value) => setValue("fromJob", value),
          },
          {
            type: "input",
            name: "toJob",
            label: t("toJob"),
            inputType: "text",
            value: "",
            onChange: (value) => setValue("toJob", value),
          },
          managerialDateConfigs(t, setValue, watch, control, handleHijriDateChange).managerialDate,
          managerialDateConfigs(t, setValue, watch, control, handleHijriDateChange).managerialNumber,
        ]);
      case "EDO-4":
        return buildForm([
          {
            type: "autocomplete",
            name: "typesOfPenalties",
            label: t("typesOfPenalties"),
            options: TypesOfPenaltiesOptions,
            value: watch("typesOfPenalties")?.value,
            onChange: (option: Option | null) =>
              setValue("typesOfPenalties", option),
          },
          managerialDateConfigs(t, setValue, watch, control, handleHijriDateChange).managerialDate,
          managerialDateConfigs(t, setValue, watch, control, handleHijriDateChange).managerialNumber,
        ]);
      case "EDO-3":
        return buildForm([
          {
            type: "input",
            name: "amountOfReduction",
            label: t("amountOfReduction"),
            inputType: "number",
            min: 0,
            value: watch("amountOfReduction") || "",
            onChange: (value) => setValue("amountOfReduction", value),
          },
          managerialDateConfigs(t, setValue, watch, control, handleHijriDateChange).managerialDate,
          managerialDateConfigs(t, setValue, watch, control, handleHijriDateChange).managerialNumber,
        ]);
      case "HIR-1":
        return buildForm([
          {
            type: "checkbox",
            name: "doesBylawsIncludeAddingAccommodations",
            label: t("doesBylawsIncludeAddingAccommodations"),
            checked: watch("doesBylawsIncludeAddingAccommodations") || false,
            onChange: (checked: boolean) => {
              if (checked) {
                setValue("doesContractIncludeAddingAccommodations", false);
                setValue("housingSpecificationsInContract", "");
                setValue("actualHousingSpecifications", "");
              }
              setValue("doesBylawsIncludeAddingAccommodations", checked);
            },
            validation: { required: "Please select at least one option" },
          },
          {
            type: "checkbox",
            name: "doesContractIncludeAddingAccommodations",
            label: t("doesContractIncludeAddingAccommodations"),
            checked: watch("doesContractIncludeAddingAccommodations") || false,
            onChange: (checked: boolean) => {
              if (checked) {
                setValue("doesBylawsIncludeAddingAccommodations", false);
                setValue("housingSpecificationInByLaws", "");
              }
              setValue("doesContractIncludeAddingAccommodations", checked);
            },
            validation: { required: "Please select at least one option" },
          },
        ]);
      case "JAR-2":
        return buildForm([
          {
            type: "input",
            name: "currentJobTitle",
            label: t("currentJobTitle"),
            inputType: "text",
            value: watch("currentJobTitle") || "",
            onChange: (value) => setValue("currentJobTitle", value),
            validation: { required: "Please select at least one option" },
          },
          {
            type: "input",
            name: "requiredJobTitle",
            label: t("requiredJobTitle"),
            inputType: "text",
            value: watch("requiredJobTitle") || "",
            onChange: (value) => setValue("requiredJobTitle", value),
            validation: { required: "Please select at least one option" },
          },
        ]);
      case "JAR-3":
        return buildForm([
          {
            type: "checkbox",
            name: "doesTheInternalRegulationIncludePromotionMechanism",
            label: t("doesTheInternalRegulationIncludePromotionMechanism"),
            checked: watch("doesTheInternalRegulationIncludePromotionMechanism") || false,
            onChange: (checked: boolean) => {
              if (checked) {
                setValue("doesContractIncludeAdditionalUpgrade", false);
              }
              setValue(
                "doesTheInternalRegulationIncludePromotionMechanism",
                checked
              );
            },
          },
          {
            type: "checkbox",
            name: "doesContractIncludeAdditionalUpgrade",
            label: t("doesContractIncludeAdditionalUpgrade"),
            checked: watch("doesContractIncludeAdditionalUpgrade") || false,
            onChange: (checked: boolean) => {
              if (checked) {
                setValue(
                  "doesTheInternalRegulationIncludePromotionMechanism",
                  false
                );
              }
              setValue("doesContractIncludeAdditionalUpgrade", checked);
            },
          },
        ]);
      case "JAR-4":
        return buildForm([
          {
            type: "input",
            name: "currentPosition",
            label: t("currentPosition"),
            inputType: "text",
            value: watch("currentPosition") || "",
            onChange: (value) => setValue("currentPosition", value),
            validation: { required: "Please select at least one option" },
          },
          {
            type: "input",
            name: "theWantedJob",
            label: t("theWantedJob"),
            inputType: "text",
            value: watch("theWantedJob") || "",
            onChange: (value) => setValue("theWantedJob", value),
            validation: { required: "Please select at least one option" },
          },
        ]);
      case "LRESR-1":
        return buildForm([
          {
            type: "input",
            name: "amount",
            label: t("amount"),
            inputType: "number",
            min: 0,
            value: watch("amount") || "",
            onChange: (value) => setValue("amount", value),
            validation: { required: t("amount") },
          },
        ]);
      case "LRESR-2":
        return buildForm([
          {
            type: "input",
            name: "amount",
            label: t("amount"),
            inputType: "number",
            min: 0,
            value: watch("amount") || "",
            onChange: (value) => setValue("amount", value),
            validation: { required: t("amount") },
          },
          {
            type: "input",
            name: "consideration",
            label: t("consideration"),
            inputType: "text",
            value: watch("consideration") || "",
            onChange: (value) => setValue("consideration", value),
            validation: { required: t("consideration") },
          },
        ]);
      case "LRESR-3":
        return buildForm([
          {
            type: "input",
            name: "amount",
            label: t("amount"),
            inputType: "number",
            min: 0,
            value: watch("amount") || "",
            onChange: (value) => setValue("amount", value),
            validation: { required: t("amount") },
          },
          {
            type: "input",
            name: "rewardType",
            label: t("rewardType"),
            inputType: "text",
            value: watch("rewardType") || "",
            onChange: (value) => setValue("rewardType", value),
            validation: { required: t("rewardType") },
          },
        ]);
      case "TTR-1":
        return buildForm([
          {
            type: "autocomplete" as const,
            name: "travelingWay",
            label: t("travelingWay"),
            options: TravelingWayOptions,
            value: travelingWay,
            onChange: (option: Option | null) =>
              setValue("travelingWay", option),
          },
        ]);
      case "RFR-1":
        return buildForm([
          {
            type: "input",
            name: "amount",
            label: t("amount"),
            inputType: "number",
            min: 0,
            value: watch("amount") || "",
            onChange: (value) => setValue("amount", value),
            validation: { required: "Please select at least one option" },
          },
          {
            type: "input",
            name: "consideration",
            label: t("consideration"),
            inputType: "text",
            value: watch("consideration") || "",
            onChange: (value) => setValue("consideration", value),
            validation: { required: "Please select at least one option" },
          },
          {
            type: "custom",
            component: (
              <div className="flex flex-col gap-2">
                <HijriDatePickerInput
                  control={control}
                  name="date_hijri"
                  label={t("dateHijri")}
                  rules={{
                    required: true,
                  }}

                  onChangeHandler={(date, onChange) =>
                    handleHijriDateChange(
                      date,
                      onChange,
                      "date_gregorian"
                    )

                  }
                />
                <GregorianDateDisplayInput
                  control={control}
                  name="date_gregorian"
                  label={t("gregorianDate")}
                />
              </div>
            ),
          },
        ]);
      case "RR-1":
        return buildForm([
          {
            type: "input",
            name: "amount",
            label: t("amount"),
            inputType: "number",
            min: 0,
            value: watch("amount") || "",
            onChange: (value) => setValue("amount", value),
            validation: { required: "Please select at least one option" },
          },
          {
            type: "input",
            name: "rewardType",
            label: t("rewardType"),
            inputType: "text",
            value: watch("rewardType") || "",
            onChange: (value) => setValue("rewardType", value),
            validation: { required: "Please select at least one option" },
          },
        ]);
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
          {
            type: "custom",
            component: (
              <></>
            ),
          },
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
