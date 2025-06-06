import { Option } from "@/shared/components/form/form.types";

// Builder function type for sub topic payloads
type TopicBuilder = (topic: any, base: any) => Record<string, any>;

const topicPayloadBuilders: Record<string, TopicBuilder> = {
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
    OverdueWagesAmount: topic?.overdueWagesAmount,
    pyTempDate: topic?.from_date_hijri,
    FromDate_New: topic?.from_date_gregorian,
    Date_New: topic?.to_date_hijri,
    ToDate_New: topic?.to_date_gregorian,
  }),
  "MIR-1": (topic, base) => ({
    ...base,
    RequestType: topic?.typeOfRequest?.value,
    Reason: topic?.theReason,
    CurrentInsuranceLevel: topic?.currentInsuranceLevel,
    RequiredDegreeInsurance: topic?.requiredDegreeOfInsurance,
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
  "CMR-4": (topic, base) => ({
    ...base,
    Amount: topic?.amount,
  }),
  "CMR-3": (topic, base) => ({
    ...base,
    Amount: topic?.amount,
    pyTempText: topic?.injury_date_hijri,
    InjuryDate_New: topic?.injury_date_gregorian,
    TypeOfWorkInjury: topic?.injuryType,
  }),
  "CMR-1": (topic, base) => ({
    ...base,
    AmountsPaidFor: topic?.amountsPaidFor?.value,
    AmountRequired: topic?.theAmountRequired,
  }),
  "CMR-5": (topic, base) => ({
    ...base,
    LeaveType: topic?.kindOfHoliday?.value,
    TotalAmountRequired: topic?.totalAmount,
    WorkingHoursCount: topic?.workingHours,
    AdditionalDetails: topic?.additionalDetails,
  }),
  "CMR-8": (topic, base) => ({
    ...base,
    WagesAmount: topic?.newPayAmount,
    pyTempDate: topic?.from_date_hijri,
    ToDate_New: topic?.to_date_gregorian,
    Date_New: topic?.to_date_hijri,
    FromDate_New: topic?.from_date_gregorian,
  }),
  "CMR-6": (topic, base) => ({
    ...base,
    NewPayAmount: topic?.wagesAmount,
    PayIncreaseType: topic?.payIncreaseType,
    pyTempDate: topic?.from_date_hijri,
    ToDate_New: topic?.to_date_gregorian,
    Date_New: topic?.to_date_hijri,
    FromDate_New: topic?.from_date_gregorian,
    WageDifference: topic?.wageDifference,
  }),
  "CMR-7": (topic, base) => ({
    ...base,
    PayDue: topic?.payDue,
    pyTempDate: topic?.from_date_hijri,
    ToDate_New: topic?.to_date_gregorian,
    Date_New: topic?.to_date_hijri,
    FromDate_New: topic?.from_date_gregorian,
    DurationOfLeaveDue: topic?.durationOfLeaveDue,
  }),
  "LCUT-1": (topic, base) => ({
    ...base,
    AmountOfCompensation: topic?.amountOfCompensation,
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
  "EDO-4": (topic, base) => ({
    ...base,
    PenalityType: topic?.typesOfPenalties,
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
        HousingSpecificationsInBylaws: housingSpecificationInByLaws,
      }),
      ...(doesContractIncludeAddingAccommodations && {
        IsContractIncludeAddingAccommodiation: true,
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
  "LRESR-1": (topic, base) => ({
    ...base,
    Amount: topic?.amount,
  }),
  "TTR-1": (topic, base) => ({
    ...base,
    TravelingWay: topic?.travelingWay?.value,
  }),
  "RFR-1": (topic, base) => ({
    ...base,
    Amount: topic?.amount,
    Consideration: topic?.consideration,
    pyTempDate: topic?.date_hijri,
    Date_New: topic?.date_gregorian,
  }),
  "DR-1": (topic, base) => ({
    ...base,
    pyTempDate: topic?.from_date_hijri,
    Date_New: topic?.to_date_hijri,
    FromDate_New: topic?.from_date_gregorian,
    ToDate_New: topic?.to_date_gregorian,
  }),
};

export function getPayloadBySubTopicID(
  caseTopics: any[],
  _subCategory?: Option,
  lastAction?: "Save" | "Next" | null,
  caseId?: string,
) {
  const payload = {
    CaseID: caseId ?? "default caseId",
    Flow_CurrentScreen: "CaseTopics",
    Flow_ButtonName: lastAction,
    CaseTopics: [] as any[],
  };

  caseTopics.forEach((topic) => {
    const basePayload = {
      MainTopicID: topic?.mainCategory,
      SubTopicID: topic?.subCategory,
    };
    const builder = topicPayloadBuilders[topic?.subCategory];
    if (builder) {
      payload.CaseTopics.push(builder(topic, basePayload));
    }
  });

  if (payload.CaseTopics.length === 0) {
    return { message: "No specific payload structure defined" };
  }

  return payload;
}
