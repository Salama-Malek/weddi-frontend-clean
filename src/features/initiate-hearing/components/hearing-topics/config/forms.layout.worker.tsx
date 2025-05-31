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
  initFormConfig,
  managerialDateConfigs,
} from "@/config/formConfig";
import { formatHijriDate, mapToOptions } from "@/shared/lib/helpers";
import { getMIR1FormFields } from "./MIR1Form";
import { getBPSR1FormFields } from "./BPSR1Form";
import { getBR1FormFields } from "./BR1Form";
import { getStep1FormFields } from "./Step1From";
import { getStep2FormFields } from "./Step2From";

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
}: UseFormLayoutParams): SectionLayout[] => {
  // //console.log("subCategoryhai", subCategory);
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
  // //console.log("forAllowance", forAllowance);
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
  const payIncreaseType = watch("payIncreaseTypeAQ+aq ");
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

  useEffect(() => {
    setValue("amount", editTopic?.amount),
      setValue("rewardType", editTopic?.rewardType),
      setValue("consideration", editTopic?.consideration),
      setValue("from_date_hijri", editTopic?.from_date_hijri);
    setValue("to_date_hijri", editTopic?.to_date_hijri);
    setValue("date_hijri", editTopic?.date_hijri);
    setValue("wagesAmount", editTopic?.wagesAmount);
    setValue("newPayAmount", editTopic?.newPayAmount);
    setValue("compensationAmount", editTopic?.compensationAmount);
    setValue("injuryType", editTopic?.injuryType);
    setValue("additionalDetails", editTopic?.additionalDetails);
    setValue("wageDifference", editTopic?.wageDifference);
    setValue("workingHours", editTopic?.workingHours);
    setValue("to_date_hijri", editTopic?.to_date_hijri);
    setValue("to_date_gregorian", editTopic?.to_date_gregorian);
    setValue("date_hijri", editTopic?.date_hijri),
      setValue("injury_date_hijri", editTopic?.injury_date_hijri),
      setValue(
        "forAllowance",
        editTopic?.forAllowance
          ? {
              label: editTopic.forAllowance?.label,
              value: editTopic.forAllowance?.value,
            }
          : editTopic?.forAllowance
      ),
      setValue(
        "commissionType",
        editTopic?.commissionType
          ? {
              label: editTopic.commissionType?.label,
              value: editTopic.commissionType?.value,
            }
          : editTopic?.commissionType
      ),
      setValue(
        "accordingToAgreement",
        editTopic?.accordingToAgreement
          ? {
              label: editTopic.accordingToAgreement?.label,
              value: editTopic.accordingToAgreement?.value,
            }
          : editTopic?.accordingToAgreement
      ),
      setValue(
        "kindOfHoliday",
        editTopic?.kindOfHoliday
          ? {
              label: editTopic.kindOfHoliday?.label,
              value: editTopic.kindOfHoliday?.value,
            }
          : editTopic?.kindOfHoliday
      ),
      setValue("amountOfCompensation", editTopic?.amountOfCompensation),
      setValue("theAmountRequired", editTopic?.theAmountRequired),
      setValue("totalAmount", editTopic?.totalAmount),
      setValue("wagesAmount", editTopic?.wagesAmount),
      setValue("bonusAmount", editTopic?.bonusAmount),
      setValue("payDue", editTopic?.payDue),
      setValue("durationOfLeaveDue", editTopic?.durationOfLeaveDue),
      setValue("amountRatio", editTopic?.amountRatio),
      setValue("otherCommission", editTopic?.otherCommission),
      setValue("damagedType", editTopic?.damagedType),
      setValue("theReason", editTopic?.theReason),
      setValue("currentInsuranceLevel", editTopic?.currentInsuranceLevel),
      setValue(
        "requiredDegreeOfInsurance",
        editTopic?.requiredDegreeOfInsurance
      ),
      setValue("damagedValue", editTopic?.damagedValue),
      setValue("requiredJobTitle", editTopic?.requiredJobTitle),
      setValue("currentJobTitle", editTopic?.currentJobTitle),
      setValue(
        "typeOfRequest",
        editTopic?.typeOfRequest
          ? {
              label: editTopic.typeOfRequest?.label,
              value: editTopic.typeOfRequest?.value,
            }
          : null
      ),
      setValue(
        "amountsPaidFor",
        editTopic?.amountsPaidFor
          ? {
              label: editTopic.amountsPaidFor?.label,
              value: editTopic.amountsPaidFor?.value,
            }
          : null
      ),
      setValue("loanAmount", editTopic?.loanAmount),
      setValue("typeOfCustody", editTopic?.typeOfCustody),
      setValue(
        "travelingWay",
        editTopic?.travelingWay
          ? {
              label: editTopic.travelingWay?.label,
              value: editTopic.travelingWay?.value,
            }
          : editTopic?.travelingWay
      );
    setValue(
      "typesOfPenalties",
      editTopic?.typesOfPenalties
        ? {
            label: editTopic.typesOfPenalties?.label,
            value: editTopic.typesOfPenalties?.value,
          }
        : null
    );
  }, [editTopic, caseTopics]);

  const getFormBySubCategory = (): (FormElement | false)[] => {
    switch (isEditing ? subCategory : subCategoryValue?.value) {
      case "WR-2":
      case "WR-1":
        const baseFields = [
          {
            type: "input" as const,
            name: "amount",
            label: t("amount"),
            inputType: "number" as const,
            value: isEditing ? editTopic?.amount : amount,
            onChange: (value: string) => setValue("amount", value),
            validation: { required: "Amount is required" },
          },
          dateFieldConfigs(t, isEditing, from_date_hijri, to_date_hijri)
            .fromDate,
          dateFieldConfigs(t, isEditing, to_date_hijri, to_date_hijri).toDate,
        ];
        const shouldShowAllowanceFields =
          editTopic?.subCategory === "WR-1" || subCategory?.value === "WR-1";

        const allowanceFields = shouldShowAllowanceFields
          ? [
              {
                type: "autocomplete" as const,
                name: "forAllowance",
                label: t("forAllowance"),
                options: ForAllowanceOptions,
                value: editTopic
                  ? editTopic?.forAllowance
                  : forAllowance?.value,
                onChange: (option: Option | null) =>
                  setValue("forAllowance", option),
              },
              ...(forAllowance?.label === "Other"
                ? [
                    {
                      type: "input" as const,
                      name: "otherAllowance",
                      label: t("otherAllowance"),
                      inputType: "text" as const,
                      value: otherAllowance,
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
            value: isEditing ? editTopic?.amount : amount,
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
            value: isEditing
              ? editTopic?.compensationAmount
              : compensationAmount,
            onChange: (value) => setValue("compensationAmount", value),
          },
          {
            name: "injuryDate",
            type: "dateOfBirth" as const,
            hijriLabel: t("injuryDateHijri"),
            gregorianLabel: t("injuryDateGregorian"),
            hijriFieldName: "injury_date_hijri",
            value: isEditing && formatHijriDate(injury_date_hijri),
            gregorianFieldName: "injury_date_gregorian",
          },
          {
            type: "input",
            name: "injuryType",
            label: t("injuryType"),
            inputType: "text",
            value: isEditing ? editTopic?.injuryType : injuryType,
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
            value: editTopic
              ? editTopic?.amountsPaidFor
              : amountsPaidFor?.value,
            onChange: (option: Option | null) =>
              setValue("amountsPaidFor", option),
          },
          {
            type: "input",
            name: "theAmountRequired",
            label: t("theAmountRequired"),
            inputType: "number",
            value: isEditing ? editTopic?.theAmountRequired : theAmountRequired,
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
            value: editTopic ? editTopic?.kindOfHoliday : kindOfHoliday?.value,
            onChange: (option: Option | null) =>
              setValue("kindOfHoliday", option),
          },
          {
            type: "input",
            name: "totalAmount",
            label: t("totalAmount"),
            inputType: "number",
            value: isEditing ? editTopic?.totalAmount : totalAmount,
            onChange: (value) => setValue("totalAmount", value),
          },
          {
            type: "input",
            name: "workingHours",
            label: t("workingHours"),
            inputType: "number",
            value: isEditing ? editTopic?.workingHours : workingHours,
            onChange: (value) => setValue("workingHours", value),
          },
          {
            type: "input",
            name: "additionalDetails",
            label: t("additionalDetails"),
            inputType: "textarea",
            value: isEditing ? editTopic?.additionalDetails : additionalDetails,
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
            value: isEditing ? editTopic?.wagesAmount : wagesAmount,
            onChange: (value) => setValue("wagesAmount", value),
          },
          dateFieldConfigs(t, isEditing, from_date_hijri, to_date_hijri)
            .fromDate,
          dateFieldConfigs(t, isEditing, from_date_hijri, to_date_hijri).toDate,
        ]);
      case "CMR-6":
        return buildForm([
          {
            type: "input",
            name: "newPayAmount",
            label: t("newPayAmount"),
            inputType: "number",
            value: isEditing ? editTopic?.newPayAmount : newPayAmount,
            onChange: (value) => setValue("newPayAmount", value),
          },
          {
            type: "input",
            name: "payIncreaseType",
            label: t("payIncreaseType"),
            inputType: "text",
            value: isEditing ? editTopic?.payIncreaseType : payIncreaseType,
            onChange: (value) => setValue("payIncreaseType", value),
          },
          dateFieldConfigs(t, isEditing, from_date_hijri, to_date_hijri)
            .fromDate,
          dateFieldConfigs(t, isEditing, from_date_hijri, to_date_hijri).toDate,
          {
            type: "input",
            name: "wageDifference",
            label: t("wageDifference"),
            inputType: "text",
            value: isEditing ? editTopic?.wageDifference : wageDifference,
            onChange: (value) => setValue("wageDifference", value),
          },
        ]);
      case "CMR-7":
        return buildForm([
          dateFieldConfigs(t, isEditing, from_date_hijri, to_date_hijri)
            .fromDate,
          dateFieldConfigs(t, isEditing, from_date_hijri, to_date_hijri).toDate,
          {
            type: "input",
            name: "durationOfLeaveDue",
            label: t("durationOfLeaveDue"),
            inputType: "text",
            value: isEditing
              ? editTopic?.durationOfLeaveDue
              : durationOfLeaveDue,
            onChange: (value) => setValue("durationOfLeaveDue", value),
          },
          {
            type: "input",
            name: "payDue",
            label: t("payDue"),
            inputType: "number",
            value: isEditing ? editTopic?.payDue : payDue,
            onChange: (value) => setValue("payDue", value),
          },
        ]);
      case "LCUT-1":
        return buildForm([
          {
            type: "input",
            name: "amountOfCompensation",
            label: t("amountOfCompensation"),
            inputType: "text",
            value: isEditing
              ? editTopic?.amountOfCompensation
              : amountOfCompensation,
            onChange: (value) => setValue("amountOfCompensation", value),
          },
        ]);
      case "EDO-1":
        return buildForm([
          {
            type: "input",
            name: "fromLocation",
            label: t("fromLocation"),
            inputType: "text",
            value: "",
            onChange: (value) => setValue("fromLocation", value),
          },
          {
            type: "input",
            name: "toLocation",
            label: t("toLocation"),
            inputType: "text",
            value: "",
            onChange: (value) => setValue("toLocation", value),
          },
          managerialDateConfigs(t, setValue).managerialDate,
          managerialDateConfigs(t, setValue).managerialNumber,
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
          managerialDateConfigs(t, setValue).managerialDate,
          managerialDateConfigs(t, setValue).managerialNumber,
        ]);
      case "EDO-4":
        return buildForm([
          {
            type: "autocomplete",
            name: "typesOfPenalties",
            label: t("typesOfPenalties"),
            options: AmountPaidLookupLookUpOptions,
            value: typesOfPenalties,
            onChange: (option: Option | null) =>
              setValue("typesOfPenalties", option),
          },
          managerialDateConfigs(t, setValue).managerialDate,
          managerialDateConfigs(t, setValue).managerialNumber,
        ]);
      case "EDO-3":
        return buildForm([
          {
            type: "input",
            name: "amountOfReduction",
            label: t("amountOfReduction"),
            inputType: "number",
            value: "",
            onChange: (value) => setValue("amountOfReduction", value),
          },
          managerialDateConfigs(t, setValue).managerialDate,
          managerialDateConfigs(t, setValue).managerialNumber,
        ]);
      case "HIR-1":
        return buildForm([
          {
            type: "checkbox",
            name: "doesBylawsIncludeAddingAccommodations",
            label: t("doesBylawsIncludeAddingAccommodations"),
            checked: doesBylawsIncludeAddingAccommodations,
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
            checked: doesContractIncludeAddingAccommodations,
            onChange: (checked: boolean) => {
              if (checked) {
                setValue("doesBylawsIncludeAddingAccommodations", false);
                setValue("housingSpecificationInByLaws", "");
              }
              setValue("doesContractIncludeAddingAccommodations", checked);
            },
            validation: { required: "Please select at least one option" },
          },
          doesBylawsIncludeAddingAccommodations && {
            type: "input",
            name: "housingSpecificationInByLaws",
            label: t("housingSpecificationInByLaws"),
            inputType: "text",
            value: "",
            onChange: (value) =>
              setValue("housingSpecificationInByLaws", value),
            validation: { required: "Please select at least one option" },
          },
          doesContractIncludeAddingAccommodations && {
            type: "input",
            name: "housingSpecificationsInContract",
            label: t("housingSpecificationsInContract"),
            inputType: "text",
            value: "",
            onChange: (value) =>
              setValue("housingSpecificationsInContract", value),
            validation: { required: "Please select at least one option" },
          },
          doesContractIncludeAddingAccommodations && {
            type: "input",
            name: "actualHousingSpecifications",
            label: t("actualHousingSpecifications"),
            inputType: "text",
            value: "",
            onChange: (value) => setValue("actualHousingSpecifications", value),
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
            value: isEditing ? editTopic?.currentJobTitle : currentJobTitle,
            onChange: (value) => setValue("currentJobTitle", value),
            validation: { required: "Please select at least one option" },
          },
          {
            type: "input",
            name: "requiredJobTitle",
            label: t("requiredJobTitle"),
            inputType: "text",
            value: isEditing ? editTopic?.requiredJobTitle : requiredJobTitle,
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
            checked: doesTheInternalRegulationIncludePromotionMechanism,
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
            checked: doesContractIncludeAdditionalUpgrade,
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
            value: isEditing ? editTopic?.currentPosition : currentPosition,
            onChange: (value) => setValue("currentPosition", value),
            validation: { required: "Please select at least one option" },
          },
          {
            type: "input",
            name: "theWantedJob",
            label: t("theWantedJob"),
            inputType: "text",
            value: isEditing ? editTopic?.theWantedJob : theWantedJob,
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
            value: isEditing ? editTopic?.amount : amount,
            onChange: (value) => setValue("amount", value),
            validation: { required: "Please select at least one option" },
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
            value: isEditing ? editTopic?.amount : amount,
            onChange: (value) => setValue("amount", value),
            validation: { required: "Please select at least one option" },
          },
          {
            type: "input",
            name: "consideration",
            label: t("consideration"),
            inputType: "text",
            value: isEditing ? editTopic?.consideration : consideration,
            onChange: (value) => setValue("consideration", value),
            validation: { required: "Please select at least one option" },
          },
          {
            name: "date",
            type: "dateOfBirth",
            hijriLabel: t("dateHijri"),
            gregorianLabel: t("gregorianDate"),
            hijriFieldName: "date_hijri",
            value: isEditing && formatHijriDate(date_hijri),
            gregorianFieldName: "date_gregorian",
          },
        ]);
      case "RR-1":
        return buildForm([
          {
            type: "input",
            name: "amount",
            label: t("amount"),
            inputType: "number",
            value: isEditing ? editTopic?.amount : amount,
            onChange: (value) => setValue("amount", value),
            validation: { required: "Please select at least one option" },
          },
          {
            type: "input",
            name: "rewardType",
            label: t("rewardType"),
            inputType: "text",
            value: isEditing ? editTopic?.rewardType : rewardType,
            onChange: (value) => setValue("rewardType", value),
            validation: { required: "Please select at least one option" },
          },
        ]);
      default:
        return [];
    }
  };

  const step3: SectionLayout = {
    gridCols: 2,
    className: "step3",
    ...(getFormBySubCategory().filter(Boolean).length > 0
      ? {
          title: t("topics_data"),
          children: getFormBySubCategory().filter(Boolean) as FormElement[],
        }
      : {
          children: [
            {
              type: "custom",
              component: (
                <div className="p-4 bg-green-50 text-green-700 rounded-md">
                  No Content Found!
                </div>
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
