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

  // WR-1 (Worker Rights - Salary Payment) specific fields
  WR1_wageAmount?: string | number;
  WR1_forAllowance?: { value: string; label: string } | null;
  WR1_otherAllowance?: string;
  WR1_fromDateHijri?: string;
  WR1_fromDateGregorian?: string;
  WR1_toDateHijri?: string;
  WR1_toDateGregorian?: string;

  // WR-2 (Worker Rights - End of Service) specific fields
  WR2_wageAmount?: string | number;
  WR2_fromDateHijri?: string;
  WR2_fromDateGregorian?: string;
  WR2_toDateHijri?: string;
  WR2_toDateGregorian?: string;

  // BR-1 (Bonus Request) specific fields
  BR1_accordingToAgreement?: { value: string; label: string } | null;
  BR1_bonusAmount?: string | number;
  BR1_dateHijri?: string;
  BR1_dateGregorian?: string;

  // BPSR-1 (Bonus and Profit Share Request) specific fields
  BPSR1_bonusProfitShareAmount?: string | number;
  BPSR1_amountRatio?: string | number;
  BPSR1_commissionType?: { value: string; label: string } | null;
  BPSR1_otherCommission?: string;
  BPSR1_accordingToAgreement?: { value: string; label: string } | null;
  BPSR1_fromDateHijri?: string;
  BPSR1_fromDateGregorian?: string;
  BPSR1_toDateHijri?: string;
  BPSR1_toDateGregorian?: string;

  // MIR-1 (Medical Insurance Request) specific fields
  MIR1_typeOfRequest?: { value: string; label: string } | null;
  MIR1_requiredDegreeOfInsurance?: string | number;
  MIR1_theReason?: string;
  MIR1_currentInsuranceLevel?: string | number;

  // EDO-1 (Cancellation of Location Transfer Decision) specific fields
  EDO1_fromLocation?: { value: string; label: string } | null;
  EDO1_toLocation?: { value: string; label: string } | null;
  EDO1_managerialDecisionDateHijri?: string;
  EDO1_managerialDecisionDateGregorian?: string;
  EDO1_managerialDecisionNumber?: string;

  // EDO-2 (Cancellation of Job Transfer Decision) specific fields
  EDO2_fromJob?: string;
  EDO2_toJob?: string;
  EDO2_managerialDecisionDateHijri?: string;
  EDO2_managerialDecisionDateGregorian?: string;
  EDO2_managerialDecisionNumber?: string;

  // EDO-3 (Cancellation of Wage Reduction Decision) specific fields
  EDO3_amountOfReduction?: string | number;
  EDO3_managerialDecisionDateHijri?: string;
  EDO3_managerialDecisionDateGregorian?: string;
  EDO3_managerialDecisionNumber?: string;

  // EDO-4 (Cancellation of Disciplinary Penalty Decision) specific fields
  EDO4_typesOfPenalties?: { value: string; label: string } | null;
  EDO4_managerialDecisionDateHijri?: string;
  EDO4_managerialDecisionDateGregorian?: string;
  EDO4_managerialDecisionNumber?: string;

  // CMR-1 (Compensation Request - Amounts Paid For) specific fields
  CMR1_amountsPaidFor?: { value: string; label: string } | null;
  CMR1_theAmountRequired?: string | number;

  // CMR-3 (Compensation Request - Work Injury) specific fields
  CMR3_compensationAmount?: string | number;
  CMR3_injuryDateHijri?: string;
  CMR3_injuryDateGregorian?: string;
  CMR3_injuryType?: string;

  // CMR-4 (Compensation Request - General) specific fields
  CMR4_compensationAmount?: string | number;

  // CMR-5 (Compensation Request - Leave) specific fields
  CMR5_kindOfHoliday?: { value: string; label: string } | null;
  CMR5_totalAmount?: string | number;
  CMR5_workingHours?: string | number;
  CMR5_additionalDetails?: string;

  // CMR-6 (Compensation Request - Wage Difference/Increase) specific fields
  CMR6_newPayAmount?: string | number;
  CMR6_payIncreaseType?: { value: string; label: string } | null;
  CMR6_wageDifference?: string;
  CMR6_fromDateHijri?: string;
  CMR6_fromDateGregorian?: string;
  CMR6_toDateHijri?: string;
  CMR6_toDateGregorian?: string;

  // CMR-7 (Compensation Request - Overtime) specific fields
  CMR7_durationOfLeaveDue?: string;
  CMR7_payDue?: string | number;
  CMR7_fromDateHijri?: string;
  CMR7_fromDateGregorian?: string;
  CMR7_toDateHijri?: string;
  CMR7_toDateGregorian?: string;

  // CMR-8 (Compensation Request - Pay Stop Time) specific fields
  CMR8_wagesAmount?: string | number;
  CMR8_fromDateHijri?: string;
  CMR8_fromDateGregorian?: string;
  CMR8_toDateHijri?: string;
  CMR8_toDateGregorian?: string;

  // LCUT-1 (Labor Contract Termination - Unilateral termination) specific fields
  LCUT1_amountOfCompensation?: string | number;

  // TTR-1 (Travel Tickets Request) specific fields
  TTR1_travelingWay?: { value: string; label: string } | null;

  // RR-1 (Request For Reward) specific fields
  RR1_Amount?: string | number;
  RR1_Type?: string;
  
  // JAR-2 (Request to change job title) specific fields
  JAR2_currentJobTitle?: string;
  JAR2_requiredJobTitle?: string;
  
  // JAR-3 (Promotion request) specific fields
  JAR3_promotionMechanism?: string;
  JAR3_additionalUpgrade?: string;
  
  // JAR-4 (Request on job) specific fields
  JAR4_CurrentPosition?: string;
  JAR4_WantedJob?: string;
  
  // HIR-1 (Request for housing insurance) specific fields
  HIR1_IsBylawsIncludeAddingAccomodation?: string;
  HIR1_IsContractIncludeAddingAccommodation?: string;
  HIR1_HousingSpecificationsInContract?: string;
  HIR1_HousingSpecificationsInBylaws?: string;
  HIR1_HousingSpecifications?: string;
  
  // RFR-1 (Request Money Spent In Favor Of The Work) specific fields
  RFR1_Amount?: string | number;
  RFR1_Consideration?: string;
  RFR1_dateHijri?: string;
  RFR1_dateGregorian?: string;
  
  // LRESR-1 (Request for the end of service reward) specific fields
  LRESR1_Amount?: string | number;
};