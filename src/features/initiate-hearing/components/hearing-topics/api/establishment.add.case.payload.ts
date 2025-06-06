import { Option } from "@/shared/components/form/form.types";

type TopicBuilder = (topic: any, base: any) => Record<string, any>;

const topicPayloadBuilders: Record<string, TopicBuilder> = {
  // Establishment Topics
  "CR-1": (topic, base) => ({
    ...base,
    Amount: topic?.amount ?? "0",
    CompensationReason: topic?.CompensationReason ?? "",
  }),
  "LCUTE-1": (topic, base) => ({
    ...base,
    AmountOfCompensation: topic?.amountOfCompensation ?? "0",
    ItemsToHandover: topic?.ItemsToHandover ?? [],
  }),
  "LCUT-1": (topic, base) => ({
    ...base,
    AmountOfCompensation: topic?.AmountOfCompensation ?? 0,
  }),
  "DPVR-1": (topic, base) => ({
    ...base,
    SpoilerType: topic?.damagedType ?? "",
    DamagedValue: topic?.damagedValue ?? "0",
  }),
  "AWRW-1": (topic, base) => ({
    ...base,
    AllowanceAmount: topic?.AllowanceAmount ?? "0",
    ResignationDate: topic?.ResignationDate ?? "",
  }),
  "AWRW-2": (topic, base) => ({
    ...base,
    AllowanceAmount: topic?.AllowanceAmount ?? "0",
    ResignationDate: topic?.ResignationDate ?? "",
  }),
  "RLRAHI-1": (topic, base) => ({
    ...base,
    TypeOfCustody: topic?.typeOfCustody ?? "",
    SpoilerType: topic?.typeOfRequest?.label ?? "",
    Date_New: topic?.request_date_hijri ?? "",
    RequestDate_New: topic?.ReEntryReason ?? "",
  }),
  "RLRAHI-2": (topic, base) => ({
    ...base,
    TypeOfCustody: topic?.typeOfCustody ?? "",
    SpoilerType: topic?.typeOfRequest?.label ?? "",
    Date_New: topic?.HijriReEntryDate ?? "",
    RequestDate_New: topic?.ReEntryReason ?? "",
  }),
  "RUF-1": (topic, base) => ({
    ...base,
    RefundType: topic?.RefundType ?? "",
    SpoilerType: topic?.sploilerType ?? "",
    Amount: topic?.amount ?? "",
  }),
  // Worker Topics
  "CMR-1": (topic, base) => ({
    ...base,
    AmountsPaidFor: topic?.amountsPaidFor.value,
    AmountRequired: topic?.theAmountRequired,
  }),
  "CMR-3": (topic, base) => ({
    ...base,
    Amount: topic?.compensationAmount ?? "0",
    pyTempText: topic?.injury_date_hijri ?? "",
    InjuryDate_New: topic?.injury_date_gregorian ?? "",
    TypeOfWorkInjury: topic?.injuryType ?? "",
  }),
  "CMR-4": (topic, base) => ({
    ...base,
    Amount: topic?.amount ?? "0",
  }),
  "CMR-5": (topic, base) => ({
    ...base,
    LeaveType: topic?.kindOfHoliday.value ?? "",
    TotalAmountRequired: topic?.totalAmount ?? "0",
    WorkingHoursCount: topic?.workingHours ?? "0",
    AdditionalDetails: topic.workingHours,
  }),
  "CMR-6": (topic, base) => ({
    ...base,
    pyTempDate: topic?.from_date_hijri ?? "",
    FromDate_New: topic?.from_date_gregorian ?? "",
    Date_New: topic?.to_date_hijri ?? "",
    ToDate_New: topic?.to_date_gregorian ?? "",
    NewPayAmount: topic?.newPayAmount ?? "0",
    PayIncreaseType: topic?.payIncreaseType ?? "",
    WageDifference: topic?.wageDifference ?? "0",
  }),
  "CMR-7": (topic, base) => ({
    ...base,
    pyTempDate: topic?.from_date_hijri ?? "",
    ToDate_New: topic?.from_date_gregorian ?? "",
    Date_New: topic?.to_date_hijri ?? "",
    FromDate_New: topic?.to_date_gregorian ?? "",
    DurationOfLeaveDue: topic?.durationOfLeaveDue ?? "0",
    PayDue: topic?.payDue ?? "0",
  }),
  "CMR-8": (topic, base) => ({
    ...base,
    pyTempDate: topic?.from_date_hijri ?? "",
    ToDate_New: topic?.from_date_gregorian ?? "",
    Date_New: topic?.to_date_hijri ?? "",
    FromDate_New: topic?.to_date_gregorian ?? "",
    WagesAmount: topic?.wagesAmount ?? "0",
  }),
  "EDO-1": (topic, base) => ({
    ...base,
    FromLocation: topic?.fromLocation,
    ToLocation: topic?.toLocation,
    Date_New: topic?.managerial_decision_date_hijri,
    ManDecsDate: topic?.managerial_decision_date_gregorian,
    ManagerialDecisionNumber: topic?.managerialDecisionNumber,
  }),
  "EDO-2": (topic, base) => ({
    ...base,
    FromJob: topic?.fromJob,
    ToJob: topic?.toJob,
    Date_New: topic?.managerial_decision_date_hijri,
    ManDecsDate: topic?.managerial_decision_date_gregorian,
    ManagerialDecisionNumber: topic?.managerialDecisionNumber,
  }),
  "EDO-3": (topic, base) => ({
    ...base,
    AmountOfReduction: topic?.amountOfReduction,
    pyTempDate: topic?.managerial_decision_date_hijri,
    ManagerialDecisionDate_New: topic?.managerial_decision_date_gregorian,
    ManagerialDecisionNumber: topic?.managerialDecisionNumber,
  }),
  "EDO-4": (topic, base) => ({
    ...base,
    PenalityType: topic?.typesOfPenalties ?? "ddd",
    Date_New: topic?.managerial_decision_date_hijri,
    ManDecsDate: topic?.managerial_decision_date_gregorian,
    ManagerialDecisionNumber: topic?.managerialDecisionNumber,
  }),
  "HIR-1": (topic, base) => {
    const {
      doesBylawsIncludeAddingAccommodations,
      doesContractIncludeAddingAccommodations,
      housingSpecificationsInContract,
      housingSpecificationInByLaws,
      actualHousingSpecifications,
    } = topic || {};
    return {
      ...base,
      ...(doesBylawsIncludeAddingAccommodations && {
        IsBylawsIncludeAddingAccommodiation: true,
        IsContractIncludeAddingAccommodiation: false,
        HousingSpecificationsInBylaws: housingSpecificationInByLaws,
      }),
      ...(doesContractIncludeAddingAccommodations && {
        IsContractIncludeAddingAccommodiation: true,
        IsBylawsIncludeAddingAccommodiation: false,
        HousingSpecificationsInContract: housingSpecificationsInContract,
        HousingSpecifications: actualHousingSpecifications,
      }),
    };
  },
  "JAR-2": (topic, base) => ({
    ...base,
    CurrentJobTitle: topic?.currentJobTitle,
    RequiredJobTitle: topic?.requiredJobTitle,
  }),
  "JAR-3": (topic, base) => ({
    ...base,
    PromotionMechanism: topic?.doesTheInternalRegulationIncludePromotionMechanism,
    AdditionalUpgrade: topic?.doesContractIncludeAdditionalUpgrade,
  }),
  "JAR-4": (topic, base) => ({
    ...base,
    CurrentPosition: topic?.currentPosition,
    WantedJob: topic?.theWantedJob,
  }),
  "RR-1": (topic, base) => ({
    ...base,
    Amount: topic?.amount,
    Type: topic?.rewardType,
  }),
  "WR-1": (topic, base) => ({
    ...base,
    Amount: topic?.amount,
    pyTempDate: topic?.from_date_hijri,
    FromDate_New: topic?.from_date_gregorian,
    Date_New: topic?.to_date_hijri,
    ToDate_New: topic?.to_date_gregorian,
    ForAllowance: topic?.forAllowance?.value,
    OtherAllowance: topic?.otherAllowance,
  }),
  "WR-2": (topic, base) => ({
    ...base,
    OverdueWagesAmount: topic?.amount,
    pyTempDate: topic?.from_date_hijri,
    FromDate_New: topic?.from_date_gregorian,
    Date_New: topic?.to_date_hijri,
    ToDate_New: topic?.to_date_gregorian,
  }),
  "TTR-1": (topic, base) => ({
    ...base,
    TravelingWay: topic?.travelingWay.value,
  }),
  "MIR-1": (topic, base) => ({
    ...base,
    RequestType: topic?.typeOfRequest?.value,
    Reason: topic?.theReason,
    CurrentInsuranceLevel: topic?.currentInsuranceLevel,
    RequiredDegreeInsurance: topic?.requiredDegreeOfInsurance,
  }),
  "LRESR-1": (topic, base) => ({
    ...base,
    Amount: topic?.amount,
  }),
  "RFR-1": (topic, base) => ({
    ...base,
    Amount: topic?.amount,
    Consideration: topic?.consideration,
    Date_New: topic?.date_gregorian,
    pyTempDate: topic?.date_hijri,
  }),
  "BPSR-1": (topic, base) => ({
    ...base,
    Amount: topic?.amount,
    AmountRatio: topic?.amountRatio,
    pyTempDate: topic?.from_date_hijri,
    ToDate_New: topic?.to_date_gregorian,
    Date_New: topic?.to_date_hijri,
    FromDate_New: topic?.from_date_gregorian,
    CommissionType: topic?.commissionType?.value,
    AccordingToAgreement: topic?.accordingToAgreement?.value,
    OtherCommission: topic?.otherCommission,
  }),
  "BR-1": (topic, base) => ({
    ...base,
    AccordingToAgreement: topic?.accordingToAgreement?.value,
    Premium: topic?.bonusAmount,
    pyTempDate: topic?.date_hijri,
    Date_New: topic?.date_gregorian,
  }),
};

export function getPayloadBySubTopicID(
  caseTopics: any[],
  _subCategory?: Option,
  lastAction: "Save" | "Next" | null = "Next",
  caseId: string = "default caseId",
) {
  const structuredTopics: any[] = [];

  try {
    caseTopics.forEach((topic) => {
      const basePayload = {
        MainTopicID: topic?.MainTopicID,
        SubTopicID: topic?.SubTopicID,
      };
      const builder = topicPayloadBuilders[topic?.SubTopicID];
      const topicPayload = builder ? builder(topic, basePayload) : { ...topic };
      structuredTopics.push(topicPayload);
    });
  } catch (err) {
    console.error("Loop failed:", err);
  }

  const payload = {
    CaseID: caseId,
    Flow_CurrentScreen: "CaseTopics",
    Flow_ButtonName: lastAction,
    CaseTopics: structuredTopics,
    AcceptedLanguage: "EN",
  };

  if (structuredTopics.length === 0) {
    return { message: "No specific payload structure defined" };
  }

  return payload;
}
