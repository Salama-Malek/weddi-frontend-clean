export type Topic = {
  mainCategory: string;
  subCategory: string;
  acknowledged: boolean;
  fromPlace?: string;
  toPlace?: string;
  hijriDate?: string;
  gregorianDate?: string;
  decisionNumber?: string;
};

export type TopicFormValues = {
  mainCategory: { value: string; label: string } | null;
  subCategory: { value: string; label: string } | null;
  acknowledged: boolean;
  fromPlace?: { value: string; label: string } | null;
  toPlace?: { value: string; label: string } | null;
  hijriDate?: string;
  gregorianDate?: string;
  decisionNumber?: string;
  managerial_decision_date_hijri?: string;
  managerial_decision_date_gregorian?: string;
  managerialDecisionNumber?: string;
  commissionType?: { value: string; label: string } | null;

  WR1_wageAmount?: string | number;
  WR1_forAllowance?: { value: string; label: string } | null;
  WR1_otherAllowance?: string;
  WR1_fromDateHijri?: string;
  WR1_fromDateGregorian?: string;
  WR1_toDateHijri?: string;
  WR1_toDateGregorian?: string;

  WR2_wageAmount?: string | number;
  WR2_fromDateHijri?: string;
  WR2_fromDateGregorian?: string;
  WR2_toDateHijri?: string;
  WR2_toDateGregorian?: string;

  BR1_accordingToAgreement?: { value: string; label: string } | null;
  BR1_bonusAmount?: string | number;
  BR1_dateHijri?: string;
  BR1_dateGregorian?: string;

  BPSR1_bonusProfitShareAmount?: string | number;
  BPSR1_amountRatio?: string | number;
  BPSR1_commissionType?: { value: string; label: string } | null;
  BPSR1_otherCommission?: string;
  BPSR1_accordingToAgreement?: { value: string; label: string } | null;
  BPSR1_fromDateHijri?: string;
  BPSR1_fromDateGregorian?: string;
  BPSR1_toDateHijri?: string;
  BPSR1_toDateGregorian?: string;

  MIR1_typeOfRequest?: { value: string; label: string } | null;
  MIR1_requiredDegreeOfInsurance?: string | number;
  MIR1_theReason?: string;
  MIR1_currentInsuranceLevel?: string | number;

  EDO1_fromLocation?: { value: string; label: string } | null;
  EDO1_toLocation?: { value: string; label: string } | null;
  EDO1_managerialDecisionDateHijri?: string;
  EDO1_managerialDecisionDateGregorian?: string;
  EDO1_managerialDecisionNumber?: string;

  EDO2_fromJob?: string;
  EDO2_toJob?: string;
  EDO2_managerialDecisionDateHijri?: string;
  EDO2_managerialDecisionDateGregorian?: string;
  EDO2_managerialDecisionNumber?: string;

  EDO3_amountOfReduction?: string | number;
  EDO3_managerialDecisionDateHijri?: string;
  EDO3_managerialDecisionDateGregorian?: string;
  EDO3_managerialDecisionNumber?: string;

  EDO4_typesOfPenalties?: { value: string; label: string } | null;
  EDO4_managerialDecisionDateHijri?: string;
  EDO4_managerialDecisionDateGregorian?: string;
  EDO4_managerialDecisionNumber?: string;

  CMR1_amountsPaidFor?: { value: string; label: string } | null;
  CMR1_theAmountRequired?: string | number;

  CMR3_compensationAmount?: string | number;
  CMR3_injuryDateHijri?: string;
  CMR3_injuryDateGregorian?: string;
  CMR3_injuryType?: string;

  CMR4_compensationAmount?: string | number;

  CMR5_kindOfHoliday?: { value: string; label: string } | null;
  CMR5_totalAmount?: string | number;
  CMR5_workingHours?: string | number;
  CMR5_additionalDetails?: string;

  CMR6_newPayAmount?: string | number;
  CMR6_payIncreaseType?: { value: string; label: string } | null;
  CMR6_wageDifference?: string;
  CMR6_fromDateHijri?: string;
  CMR6_fromDateGregorian?: string;
  CMR6_toDateHijri?: string;
  CMR6_toDateGregorian?: string;

  CMR7_durationOfLeaveDue?: string;
  CMR7_payDue?: string | number;
  CMR7_fromDateHijri?: string;
  CMR7_fromDateGregorian?: string;
  CMR7_toDateHijri?: string;
  CMR7_toDateGregorian?: string;

  CMR8_wagesAmount?: string | number;
  CMR8_fromDateHijri?: string;
  CMR8_fromDateGregorian?: string;
  CMR8_toDateHijri?: string;
  CMR8_toDateGregorian?: string;

  LCUT1_amountOfCompensation?: string | number;

  TTR1_travelingWay?: { value: string; label: string } | null;

  RR1_Amount?: string | number;
  RR1_Type?: string;

  JAR2_currentJobTitle?: string;
  JAR2_requiredJobTitle?: string;

  JAR3_JobApplicationRequest?: string;
  JAR3_promotionMechanism?: string;
  JAR3_additionalUpgrade?: string;

  JAR4_CurrentPosition?: string;
  JAR4_WantedJob?: string;

  HIR1_AccommodationSource?: string;
  HIR1_IsBylawsIncludeAddingAccommodation?: string;
  HIR1_IsContractIncludeAddingAccommodation?: string;
  HIR1_HousingSpecificationsInContract?: string;
  HIR1_HousingSpecificationsInBylaws?: string;
  HIR1_HousingSpecifications?: string;

  RFR1_Amount?: string | number;
  RFR1_Consideration?: string;
  RFR1_dateHijri?: string;
  RFR1_dateGregorian?: string;

  LRESR1_Amount?: string | number;
};
