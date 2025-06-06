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
import { formatHijriDate, mapToOptions } from "@/shared/lib/helpers";
import { getStep1FormFields } from "./Step1From";
import { getStep2FormFields } from "./Step2From";
import { subCategoryValue } from "@/mock/genderData";
import { DateOfBirthField } from "@/shared/components/calanders";
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
  typesOfPenaltiesData: typesOfPenaltiesData,
  amountPaidData: amountPaidData,
  leaveTypeData: leaveTypeData,
  travelingWayData: travelingWayData,
  isValid: isValid,
  isMainCategoryLoading: isMainCategoryLoading,
  isSubCategoryLoading: isSubCategoryLoading,
  editTopic: editTopic,
  caseTopics: caseTopics,
}: UseFormLayoutParams): SectionLayout[] => {
  const { t: tHearingTopics } = useTranslation("hearingtopics");

  // //console.log('matchedSubCategory', matchedSubCategory)
  const amount = watch("amount");
  const loanAmount = watch("loanAmount");
  const typeOfCustody = watch("typeOfCustody");
  const damagedValue = watch("damagedValue");
  const damagedType = watch("damagedType");
  const sploilerType = watch("sploilerType");
  const amountOfCompensation = watch("amountOfCompensation");
  const subCategoryValue = watch("subCategory");
  const request_date_hijri = watch("request_date_hijri");
  const typeOfRequest = watch("typeOfRequest");
  const date_hijri = watch("date_hijri");
  const request_date_gregorian = watch("request_date_gregorian");
  const requestDate = watch("requestDate");
  const requestDateGregorian = watch("requestDateGregorian");
  const fromLocation = watch("fromLocation");
  const toLocation = watch("toLocation");
  const fromJob = watch("fromJob");
  const toJob = watch("toJob");
  const penalityType = watch("penalityType");
  const amountOfReduction = watch("amountOfReduction");
  const date_new = watch("date_new");
  const manDecsDate = watch("manDecsDate");
  const RefundType = watch("RefundType");
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
    className: "step1-class", // Add a valid className here
    children: [
      ...getStep1FormFields({
        t,
        setValue,
        MainCategoryOptions,
        mainCategory,
        SubCategoryOptions,
        subCategory,
        handleAdd,
        isMainCategoryLoading,
        isSubCategoryLoading,
      }),
    ].filter(Boolean) as FormElement[],
  };
  const step2: SectionLayout = {
    gridCols: 2,
    className: "step2-class", // Add a valid className here
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

  useEffect(() => {
    if (editTopic) {
      setValue("amount", editTopic.amount);
      setValue("amountOfCompensation", editTopic.amountOfCompensation);
      setValue("damagedType", editTopic.damagedType);
      setValue("damagedValue", editTopic.damagedValue);
      setValue("loanAmount", editTopic.loanAmount);
      setValue("typeOfCustody", editTopic.typeOfCustody);
      setValue("request_date_hijri", editTopic.request_date_hijri);
      setValue("request_date_gregorian", editTopic.request_date_gregorian);
      setValue("date_hijri", editTopic.date_hijri);
      setValue("manDecsDate", editTopic.manDecsDate);
      setValue("typeOfRequest", editTopic.typeOfRequest);
      setValue("fromLocation", editTopic.fromLocation);
      setValue("toLocation", editTopic.toLocation);
      setValue("fromJob", editTopic.fromJob);
      setValue("toJob", editTopic.toJob);
      setValue("penalityType", editTopic.penalityType);
      setValue("amountOfReduction", editTopic.amountOfReduction);
      setValue("date_new", editTopic.date_new);
      setValue("requestDate", editTopic.requestDate);
      setValue("requestDateGregorian", editTopic.requestDateGregorian);
      setValue("wagesAmount", editTopic.wagesAmount);
      setValue("compensationAmount", editTopic.compensationAmount);
      setValue("injuryType", editTopic.injuryType);
      setValue("bonusAmount", editTopic.bonusAmount);
      setValue("otherCommission", editTopic.otherCommission);
      setValue("requiredJobTitle", editTopic.requiredJobTitle);
      setValue("currentJobTitle", editTopic.currentJobTitle);
      setValue("currentInsuranceLevel", editTopic.currentInsuranceLevel);
      setValue("theReason", editTopic.theReason);
      setValue("theWantedJob", editTopic.theWantedJob);
      setValue("currentPosition", editTopic.currentPosition);
      setValue("amountRatio", editTopic.amountRatio);
      setValue(
        "requiredDegreeOfInsurance",
        editTopic.requiredDegreeOfInsurance
      );
      setValue("amountsPaidFor", editTopic.amountsPaidFor);
      setValue("decisionNumber", editTopic.decisionNumber);
      setValue(
        "DefendantsEstablishmentRegion",
        editTopic.DefendantsEstablishmentRegion
      );
      setValue(
        "DefendantsEstablishmentCity",
        editTopic.DefendantsEstablishmentCity
      );
      setValue(
        "DefendantsEstablishOccupation",
        editTopic.DefendantsEstablishOccupation
      );
      setValue(
        "DefendantsEstablishmentGender",
        editTopic.DefendantsEstablishmentGender
      );
      setValue(
        "DefendantsEstablishmentNationality",
        editTopic.DefendantsEstablishmentNationality
      );
      setValue(
        "DefendantsEstablishmentPrisonerId",
        editTopic.DefendantsEstablishmentPrisonerId
      );
      setValue("from_date_hijri", editTopic.from_date_hijri);
      setValue("to_date_hijri", editTopic.to_date_hijri);
      setValue("forAllowance", editTopic.forAllowance);
      setValue("rewardType", editTopic.rewardType);
      setValue("consideration", editTopic.consideration);
      setValue("travelingWay", editTopic.travelingWay);
      setValue("kindOfHoliday", editTopic.kindOfHoliday);
      setValue("commissionType", editTopic.commissionType);
      setValue("accordingToAgreement", editTopic.accordingToAgreement);
      setValue("totalAmount", editTopic.totalAmount);
      setValue("workingHours", editTopic.workingHours);
      setValue("additionalDetails", editTopic.additionalDetails);
      setValue("newPayAmount", editTopic.newPayAmount);
      setValue("payIncreaseType", editTopic.payIncreaseType);
      setValue("wageDifference", editTopic.wageDifference);
      setValue("durationOfLeaveDue", editTopic.durationOfLeaveDue);
      setValue("typesOfPenalties", editTopic.typesOfPenalties);
      setValue("payDue", editTopic.payDue);
      setValue(
        "doesContractIncludeAddingAccommodations",
        editTopic.doesBylawsIncludeAddingAccommodations
      );
      setValue(
        "doesContractIncludeAddingAccommodations",
        editTopic.doesContractIncludeAddingAccommodations
      );
      setValue(
        "housingSpecificationInByLaws",
        editTopic.housingSpecificationInByLaws
      );
      setValue(
        "housingSpecificationsInContract",
        editTopic.housingSpecificationsInContract
      );
      setValue(
        "actualHousingSpecifications",
        editTopic.actualHousingSpecifications
      );
      setValue(
        "doesTheInternalRegulationIncludePromotionMechanism",
        editTopic.doesTheInternalRegulationIncludePromotionMechanism
      );
      setValue(
        "doesContractIncludeAdditionalUpgrade",
        editTopic.doesContractIncludeAdditionalUpgrade
      );
      setValue(
        "sploilerType",
        editTopic.sploilerType
      );
      setValue(
        "RefundType",
        editTopic.RefundType
      );
    }
  }, [editTopic, setValue]);

  const getFormBySubCategory = (): (FormElement | false)[] => {
    switch (isEditing ? subCategory : subCategoryValue?.value) {
      case "AWRW-1":
        return buildForm([]);
      case "AWRW-2":
        return buildForm([]);
      case "LCUTE-1":
        return buildForm([
          {
            type: "input",
            name: "amountOfCompensation",
            label: tHearingTopics("amountOfCompensation"),
            inputType: "text",
            value: isEditing
              ? editTopic?.amountOfCompensation
              : amountOfCompensation,
            onChange: (value) => setValue("amountOfCompensation", value),
            validation: { required: tHearingTopics("amountOfCompensation") },
          },
        ]);
      case "CR-1":
        return buildForm([
          {
            type: "input",
            name: "amount",
            label: tHearingTopics("amount"),
            inputType: "number",
            value: isEditing ? editTopic?.amount : amount,
            onChange: (value) => setValue("amount", value),
            validation: { required: tHearingTopics("amount") },
          },
        ]);
      case "DPVR-1":
        return buildForm([
          {
            type: "input",
            name: "damagedType",
            label: tHearingTopics("damagedType"),
            inputType: "text",
            value: isEditing ? editTopic?.damagedType : damagedType,
            onChange: (value) => setValue("damagedType", value),
            validation: { required: tHearingTopics("damagedType") },
          },
          {
            type: "input",
            name: "damagedValue",
            label: tHearingTopics("damagedValue"),
            inputType: "number",
            value: isEditing ? editTopic?.damagedValue : damagedValue,
            onChange: (value) => setValue("damagedValue", value),
            validation: { required: tHearingTopics("damagedValue") },
          },
        ]);
      case "RLRAHI-1":
        const fields: any = [
          {
            type: "autocomplete" as const,
            name: "typeOfRequest",
            label: tHearingTopics("typeOfRequest"),
            options: TypeOfRequestLookUpOptions,
            value: editTopic?.typeOfRequest?.value,
            onChange: (option: Option | null) =>
              setValue("typeOfRequest", option),
            validation: { required: tHearingTopics("typeOfRequest") },
          },
        ];

        if (typeOfRequest?.value === "RLRAHI1") {
          fields.push(
            {
              name: "requestDate",
              type: "dateOfBirth",
              value: isEditing && formatHijriDate(request_date_hijri),
              hijriLabel: tHearingTopics("hijriLabel"),
              gregorianLabel: tHearingTopics("gregorianLabel"),
              hijriFieldName: "request_date_hijri",
              gregorianFieldName: "request_date_gregorian",
              showWhen: "RLRAHI1",
            },
            {
              type: "input",
              name: "typeOfCustody",
              label: tHearingTopics("typeOfCustody"),
              inputType: "text",
              value: isEditing ? editTopic?.typeOfCustody : typeOfCustody,
              onChange: (value: string) => setValue("typeOfCustody", value),
              validation: { required: tHearingTopics("typeOfCustody") },
              showWhen: "RLRAHI1",
            }
          );
        } else if (typeOfRequest?.value === "RLRAHI2") {
          fields.push({
            type: "input",
            name: "loanAmount",
            label: tHearingTopics("loanAmount"),
            inputType: "number",
            value: isEditing ? editTopic?.loanAmount : loanAmount,
            onChange: (value: string) => setValue("loanAmount", value),
            validation: { required: tHearingTopics("loanAmount") },
          });
        }

        return buildForm(fields);
    
      case "RUF-1":
        return buildForm([
          {
            type: "input",
            name: "sploilerType",
            label: tHearingTopics("sploilerType"),
            inputType: "text",
            value: isEditing ? editTopic?.sploilerType : sploilerType,
            onChange: (value) => setValue("sploilerType", value),
            validation: { required: tHearingTopics("sploilerType") },
          },
          {
            type: "input",
            name: "RefundType",
            label: tHearingTopics("RefundType"),
            inputType: "text",
            value: isEditing ? editTopic?.RefundType : RefundType,
            onChange: (value) => setValue("RefundType", value),
            validation: { required: tHearingTopics("RefundType") },
          },
          {
            type: "input",
            name: "amount",
            label: tHearingTopics("amount"),
            inputType: "number",
            value: isEditing ? editTopic?.amount : amount,
            onChange: (value) => setValue("amount", value),
            validation: { required: tHearingTopics("amount") },
          },
        ]);

        default:
        return [];
    }
  };

  const step3: any = {
    gridCols: 2,
    ...(getFormBySubCategory().filter(Boolean).length > 0
      ? {
          title: tHearingTopics("topics_data"),
          children: [
            ...(getFormBySubCategory().filter(Boolean) as FormElement[]),
            ...getCommonElements(isValid), // Only show when there's content
          ],
        }
      : {
          children: [
            {
              type: "custom",
              component: (
                <div className="p-4 bg-green-50 text-green-700 rounded-md">
                  {tHearingTopics("no_content_found")}
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
