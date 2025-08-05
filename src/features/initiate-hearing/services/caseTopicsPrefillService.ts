import { formatDateString, formatHijriDate } from "@/shared/lib/helpers";

export interface CaseTopicDateFields {
  from_date_hijri?: string;
  from_date_gregorian?: string;
  to_date_hijri?: string;
  to_date_gregorian?: string;
  date_hijri?: string;
  date_gregorian?: string;
  injury_date_hijri?: string;
  injury_date_gregorian?: string;
  managerial_decision_date_hijri?: string;
  managerial_decision_date_gregorian?: string;
  request_date_hijri?: string;
  request_date_gregorian?: string;
}

export interface CaseTopicData {
  MainTopicID?: string;
  SubTopicID?: string;
  MainSectionHeader?: string;
  CaseTopicName?: string;
  SubTopicName?: string;
  AcknowledgementTerms?: boolean;
  FromDateHijri?: string;
  FromDate_New?: string;
  ToDateHijri?: string;
  ToDate_New?: string;
  Date_New?: string;
  pyTempDate?: string;
  pyTempText?: string;
  InjuryDate_New?: string;
  ManDecsDate?: string;
  RequestDate_New?: string;
  ManagerialDecisionNumber?: string;
  Amount?: string | number;
  amount?: string | number;
  AmountOfCompensation?: string | number;
  amountOfCompensation?: string | number;
  CompensationAmount?: string | number;
  compensationAmount?: string | number;
  refundAmount?: string | number;
  wageAmount?: string | number;
  WagesAmount?: string | number;
  wagesAmount?: string | number;
  PayDue?: string | number;
  payDue?: string | number;
  DurationOfLeaveDue?: string;
  durationOfLeaveDue?: string;
  TypeOfWorkInjury?: string;
  injuryType?: string;
  Premium?: string | number;
  bonusAmount?: string | number;
  BonusAmount?: string | number;
  bonusProfitShareAmount?: string | number;
  OtherCommission?: string;
  otherCommission?: string;
  RewardType?: string;
  rewardType?: string;
  DamagedValue?: string | number;
  damagedValue?: string | number;
  RequiredJobTitle?: string;
  requiredJobTitle?: string;
  CurrentJobTitle?: string;
  currentJobTitle?: string;
  SpoilerType?: string;
  damagedType?: string;
  CurrentInsuranceLevel?: string;
  currentInsuranceLevel?: string;
  Reason?: string;
  theReason?: string;
  WantedJob?: string;
  theWantedJob?: string;
  CurrentPosition?: string;
  currentPosition?: string;
  LoanAmount?: string | number;
  loanAmount?: string | number;
  AmountRatio?: string | number;
  amountRatio?: string | number;
  RequestType?: string;
  RequestType_Code?: string;
  TypeOfRequest?: string;
  LeaveType?: string;
  KindOfHoliday?: string;
  CommissionType?: string;
  AccordingToAgreement?: string;
  AccordingToAgreement_Code?: string;
  ForAllowance?: string;
  ForAllowance_Code?: string;
  TravelingWay?: string;
  OtherAllowance?: string;
  otherAllowance?: string;
  TypeOfCustody?: string;
  typeOfCustody?: string;
  Consideration?: string;
  consideration?: string;
  FromLocation?: string;
  fromLocation?: string;
  ToLocation?: string;
  toLocation?: string;
  FromLocation_Code?: string;
  ToLocation_Code?: string;
  FromJob?: string;
  ToJob?: string;
  AmountOfReduction?: string | number;
  amountOfReduction?: string | number;
  ManagerialDecisionDate_New?: string;
  TypesOfPenalties?: string;
  TypesOfPenaltiesLabel?: string;
  PenalityType?: string;
  PenalityType_Code?: string;
  PenalityTypeLabel?: string;
  RequiredDegreeInsurance?: string;
  requiredDegreeOfInsurance?: string;
  doesBylawsIncludeAddingAccommodations?: boolean;
  IsBylawsIncludeAddingAccomodation?: string;
  IsBylawsIncludeAddingAccommodiation?: string;
  doesContractIncludeAddingAccommodations?: boolean;
  IsContractIncludeAddingAccommodation?: string;
  IsContractIncludeAddingAccommodiation?: string;
  housingSpecificationInByLaws?: string;
  HousingSpecificationsInBylaws?: string;
  housingSpecificationsInContract?: string;
  HousingSpecificationsInContract?: string;
  actualHousingSpecifications?: string;
  HousingSpecifications?: string;
  AmountsPaidFor?: string;
  AmountRequired?: string;
  InjuryDateHijri?: string;
  InjuryDateGregorian?: string;
  TotalAmountRequired?: string | number;
  totalAmount?: string | number;
  WorkingHoursCount?: string | number;
  workingHours?: string | number;
  AdditionalDetails?: string;
  additionalDetails?: string;
  NewPayAmount?: string | number;
  newPayAmount?: string | number;
  PayIncreaseType?: string;
  PayIncreaseType_Code?: string;
  WageDifference?: string;
  wageDifference?: string;
  from_date_hijri?: string;
  from_date_gregorian?: string;
  to_date_hijri?: string;
  to_date_gregorian?: string;
  Type?: string;
  PromotionMechanism?: string;
  promotionMechanism?: string;
  AdditionalUpgrade?: string;
  additionalUpgrade?: string;
}

export class CaseTopicsPrefillService {
  /**
   * Extract date fields from case topic data based on topic type
   */
  static extractDateFields(topic: CaseTopicData): CaseTopicDateFields {
    if (!topic) {
      return {};
    }

    const dateFields: CaseTopicDateFields = {};
    switch (topic.SubTopicID) {
      case "WR-1":
      case "WR-2":
      case "CMR-6":
      case "CMR-7":
      case "CMR-8":
      case "BPSR-1":
        // From/To date range topics
        if (topic.FromDateHijri) {
          dateFields.from_date_hijri = formatHijriDate(topic.FromDateHijri);
        }
        if (topic.FromDate_New) {
          dateFields.from_date_gregorian = formatDateString(topic.FromDate_New);
        }
        if (topic.ToDateHijri) {
          dateFields.to_date_hijri = formatHijriDate(topic.ToDateHijri);
        }
        if (topic.ToDate_New) {
          dateFields.to_date_gregorian = formatDateString(topic.ToDate_New);
        }
        break;

      case "CMR-3":
        // Injury date topic
        if (topic.pyTempText) {
          dateFields.injury_date_hijri = formatHijriDate(topic.pyTempText);
        } else if (topic.Date_New) {
          dateFields.injury_date_hijri = formatHijriDate(topic.Date_New);
        }
        if (topic.InjuryDate_New) {
          dateFields.injury_date_gregorian = formatDateString(topic.InjuryDate_New);
        } else if (topic.Date_New) {
          dateFields.injury_date_gregorian = formatDateString(topic.Date_New);
        }
        break;

      case "EDO-1":
      case "EDO-2":
      case "EDO-3":
      case "EDO-4":
        // Managerial decision date topics

        if (topic.Date_New) {
          dateFields.managerial_decision_date_hijri = formatHijriDate(topic.Date_New);
        }
        if (topic.ManDecsDate) {
          dateFields.managerial_decision_date_gregorian = formatDateString(topic.ManDecsDate);
        }

        // Try alternative field names for EDO topics
        if ((topic as any).ManagerialDecisionDateHijri) {
          dateFields.managerial_decision_date_hijri = formatHijriDate((topic as any).ManagerialDecisionDateHijri);
        }
        if ((topic as any).ManagerialDecisionDateGregorian) {
          dateFields.managerial_decision_date_gregorian = formatDateString((topic as any).ManagerialDecisionDateGregorian);
        }
        break;

      case "RLRAHI-1":
        // Request date topic
        if (topic.RequestType === "RLRAHI1") {
          if (topic.Date_New) {
            dateFields.request_date_hijri = formatHijriDate(topic.Date_New);
          }
          if (topic.RequestDate_New) {
            dateFields.request_date_gregorian = formatDateString(topic.RequestDate_New);
          }
        } else {

        }
        break;

      case "RFR-1":
      case "BR-1":
        // Single date topics
        if (topic.pyTempDate) {
          dateFields.date_hijri = formatHijriDate(topic.pyTempDate);
        }
        if (topic.Date_New) {
          dateFields.date_gregorian = formatDateString(topic.Date_New);
        }
        break;
    }

    return dateFields;
  }

  /**
   * Extract all form fields from case topic data
   */
  static extractFormFields(topic: CaseTopicData): Record<string, any> {
    if (!topic) {
      return {};
    }

    const dateFields = this.extractDateFields(topic);

    const formFields = {
      // Main category and sub category
      mainCategory: {
        value: topic.MainTopicID || "",
        label: topic.CaseTopicName || topic.MainSectionHeader || "",
      },
      subCategory: {
        value: topic.SubTopicID || "",
        label: topic.SubTopicName || "",
      },
      acknowledged: Boolean(topic.AcknowledgementTerms),

      // Date fields
      ...dateFields,

      // Amount fields - Updated to use specific field names
      amount: topic.Amount || topic.amount || "", // Generic fallback
      refundAmount: topic.refundAmount || topic.Amount || topic.amount || "", // RUF-1
      compensationAmount: topic.CompensationAmount || topic.compensationAmount || topic.Amount || topic.amount || "", // CR-1

      // WR-1 specific fields
      WR1_wageAmount: topic.wageAmount || topic.Amount || topic.amount || "", // WR-1
      WR1_forAllowance: topic.ForAllowance ? {
        value: topic.ForAllowance_Code || topic.ForAllowance,
        label: topic.ForAllowance,
      } : null,
      WR1_otherAllowance: topic.OtherAllowance || "",
      WR1_fromDateHijri: topic.pyTempDate || "",
      WR1_fromDateGregorian: topic.FromDate_New || "",
      WR1_toDateHijri: topic.Date_New || "",
      WR1_toDateGregorian: topic.ToDate_New || "",

      // WR-2 specific fields
      WR2_wageAmount: topic.wageAmount || topic.Amount || topic.amount || "", // WR-2
      WR2_fromDateHijri: topic.pyTempDate || "",
      WR2_fromDateGregorian: topic.FromDate_New || "",
      WR2_toDateHijri: topic.Date_New || "",
      WR2_toDateGregorian: topic.ToDate_New || "",

      // BR-1 specific fields
      BR1_accordingToAgreement: topic.AccordingToAgreement ? {
        value: topic.AccordingToAgreement_Code || topic.AccordingToAgreement,
        label: topic.AccordingToAgreement,
      } : null,
      BR1_bonusAmount: topic.Premium || topic.bonusAmount || topic.BonusAmount || topic.Amount || topic.amount || "", // BR-1
      BR1_dateHijri: topic.pyTempDate || "",
      BR1_dateGregorian: topic.Date_New || "",

      // BPSR-1 specific fields
      BPSR1_bonusProfitShareAmount: topic.bonusProfitShareAmount || topic.Amount || topic.amount || "", // BPSR-1
      BPSR1_amountRatio: topic.AmountRatio || topic.amountRatio || "",
      BPSR1_commissionType: topic.CommissionType ? {
        value: topic.CommissionType,
        label: topic.CommissionType,
      } : null,
      BPSR1_otherCommission: topic.OtherCommission || "",
      BPSR1_accordingToAgreement: topic.AccordingToAgreement ? {
        value: topic.AccordingToAgreement,
        label: topic.AccordingToAgreement,
      } : null,
      BPSR1_fromDateHijri: topic.pyTempDate || "",
      BPSR1_fromDateGregorian: topic.FromDate_New || "",
      BPSR1_toDateHijri: topic.Date_New || "",
      BPSR1_toDateGregorian: topic.ToDate_New || "",

      // MIR-1 specific fields
      MIR1_typeOfRequest: topic.RequestType ? {
        value: topic.RequestType_Code || topic.RequestType,
        label: topic.TypeOfRequest || topic.RequestType,
      } : null,
      MIR1_requiredDegreeOfInsurance: topic.RequiredDegreeInsurance || topic.requiredDegreeOfInsurance || "",
      MIR1_theReason: topic.Reason || topic.theReason || "",
      MIR1_currentInsuranceLevel: topic.CurrentInsuranceLevel || topic.currentInsuranceLevel || "",

      // EDO-1 specific fields
      EDO1_fromLocation: topic.FromLocation ? {
        value: topic.FromLocation_Code || topic.FromLocation,
        label: topic.FromLocation,
      } : null,
      EDO1_toLocation: topic.ToLocation ? {
        value: topic.ToLocation_Code || topic.ToLocation,
        label: topic.ToLocation,
      } : null,
      EDO1_managerialDecisionDateHijri: topic.Date_New || "",
      EDO1_managerialDecisionDateGregorian: topic.ManDecsDate || "",
      EDO1_managerialDecisionNumber: topic.ManagerialDecisionNumber || "",

      // EDO-2 specific fields
      EDO2_fromJob: topic.FromJob || "",
      EDO2_toJob: topic.ToJob || "",
      EDO2_managerialDecisionDateHijri: topic.Date_New || "",
      EDO2_managerialDecisionDateGregorian: topic.ManDecsDate || "",
      EDO2_managerialDecisionNumber: topic.ManagerialDecisionNumber || "",

      // EDO-3 specific fields
      EDO3_amountOfReduction: topic.AmountOfReduction || topic.amountOfReduction || "",
      EDO3_managerialDecisionDateHijri: topic.pyTempDate || "",
      EDO3_managerialDecisionDateGregorian: topic.ManagerialDecisionDate_New || "",
      EDO3_managerialDecisionNumber: topic.ManagerialDecisionNumber || "",

      // EDO-4 specific fields
      EDO4_typesOfPenalties: topic.PenalityType ? {
        value: topic.PenalityType_Code || topic.PenalityType,
        label: topic.PenalityTypeLabel || topic.PenalityType,
      } : null,
      EDO4_managerialDecisionDateHijri: topic.Date_New || "",
      EDO4_managerialDecisionDateGregorian: topic.ManDecsDate || "",
      EDO4_managerialDecisionNumber: topic.ManagerialDecisionNumber || "",

      // LCUT-1: Labor Contract Termination - Unilateral termination
      LCUT1_amountOfCompensation: topic.AmountOfCompensation || topic.amountOfCompensation || "",

      // TTR-1: Travel Tickets Request
      TTR1_travelingWay: topic.TravelingWay ? {
        value: topic.TravelingWay,
        label: topic.TravelingWay,
      } : null,

                  // RR-1: Request For Reward
            RR1_Amount: topic.Amount || "",
            RR1_Type: topic.Type || "",
            
            // JAR-2: Request to change job title
            JAR2_currentJobTitle: topic.CurrentJobTitle || topic.currentJobTitle || "",
            JAR2_requiredJobTitle: topic.RequiredJobTitle || topic.requiredJobTitle || "",
            
            // JAR-3: Promotion request
            JAR3_promotionMechanism: topic.PromotionMechanism || topic.promotionMechanism || "",
            JAR3_additionalUpgrade: topic.AdditionalUpgrade || topic.additionalUpgrade || "",
            
            // JAR-4: Request on job
            JAR4_CurrentPosition: topic.CurrentPosition || topic.currentPosition || "",
            JAR4_WantedJob: topic.WantedJob || topic.theWantedJob || "",
            
            // CMR-1 specific fields
      CMR1_amountsPaidFor: topic.AmountsPaidFor ? {
        value: topic.AmountsPaidFor,
        label: topic.AmountsPaidFor,
      } : null,
      CMR1_theAmountRequired: topic.AmountRequired || "",

      // CMR-3 specific fields
      CMR3_compensationAmount: topic.Amount || "",
      CMR3_injuryDateHijri: topic.InjuryDateHijri || topic.pyTempText || "",
      CMR3_injuryDateGregorian: topic.InjuryDateGregorian || topic.InjuryDate_New || "",
      CMR3_injuryType: topic.TypeOfWorkInjury || "",

      // Legacy fields for backward compatibility
      wageAmount: topic.wageAmount || topic.Amount || topic.amount || "", // WR-1/WR-2 (legacy)
      from_date_hijri: topic.pyTempDate || "",
      from_date_gregorian: topic.FromDate_New || "",
      to_date_hijri: topic.Date_New || "",
      to_date_gregorian: topic.ToDate_New || "",

      // CMR-4 specific fields
      CMR4_compensationAmount: topic.Amount || topic.amount || "", // CMR-4
      // Legacy fields for backward compatibility
      noticeCompensationAmount: topic.Amount || topic.amount || "", // CMR-4
      // LRESR-1 (Request for the end of service reward) specific fields
      LRESR1_Amount: topic.Amount || topic.amount || "",
      
      // Legacy fields for backward compatibility
      endOfServiceRewardAmount: topic.Amount || topic.amount || "", // LRESR-1/2/3 (legacy)
      rewardAmount: topic.Amount || topic.amount || "", // RR-1
      rewardType: topic.RewardType || topic.rewardType || "", // RR-1
      rewardRequestAmount: topic.Amount || topic.amount || "", // RFR-1 (legacy)
      bonusProfitShareAmount: topic.bonusProfitShareAmount || topic.Amount || topic.amount || "", // BPSR-1
      amountOfCompensation: topic.AmountOfCompensation || topic.amountOfCompensation || "",
      wagesAmount: topic.WagesAmount || topic.wagesAmount || "",
      payDue: topic.PayDue || topic.payDue || "",
      durationOfLeaveDue: topic.DurationOfLeaveDue || topic.durationOfLeaveDue || "",
      injuryType: topic.TypeOfWorkInjury || topic.injuryType || "",
      bonusAmount: topic.Premium || topic.bonusAmount || "",
      otherCommission: topic.OtherCommission || topic.otherCommission || "",
      damagedValue: topic.DamagedValue || topic.damagedValue || "",
      requiredJobTitle: topic.RequiredJobTitle || topic.requiredJobTitle || "",
      currentJobTitle: topic.CurrentJobTitle || topic.currentJobTitle || "",
      damagedType: topic.SpoilerType || topic.damagedType || "",
      currentInsuranceLevel: topic.CurrentInsuranceLevel || topic.currentInsuranceLevel || "",
      theReason: topic.Reason || topic.theReason || "",
      requiredDegreeOfInsurance: topic.RequiredDegreeInsurance || topic.requiredDegreeOfInsurance || "",
      theWantedJob: topic.WantedJob || topic.theWantedJob || "",
      currentPosition: topic.CurrentPosition || topic.currentPosition || "",
      loanAmount: topic.LoanAmount || topic.loanAmount || "",
      amountRatio: topic.AmountRatio || topic.amountRatio || "",

      // HIR-1 (Request for housing insurance) specific fields
      HIR1_IsBylawsIncludeAddingAccomodation: topic.IsBylawsIncludeAddingAccomodation || topic.IsBylawsIncludeAddingAccommodiation || "",
      HIR1_IsContractIncludeAddingAccommodation: topic.IsContractIncludeAddingAccommodation || topic.IsContractIncludeAddingAccommodiation || "",
      HIR1_HousingSpecificationsInContract: topic.HousingSpecificationsInContract || topic.housingSpecificationsInContract || "",
      HIR1_HousingSpecificationsInBylaws: topic.HousingSpecificationsInBylaws || topic.housingSpecificationInByLaws || "",
      HIR1_HousingSpecifications: topic.HousingSpecifications || topic.actualHousingSpecifications || "",
      
      // RFR-1 (Request Money Spent In Favor Of The Work) specific fields
      RFR1_Amount: topic.Amount || topic.amount || "",
      RFR1_Consideration: topic.Consideration || topic.consideration || "",
      RFR1_dateHijri: topic.pyTempDate || "",
      RFR1_dateGregorian: topic.Date_New || "",
      
      // Legacy fields for backward compatibility
      doesBylawsIncludeAddingAccommodations:
        topic.doesBylawsIncludeAddingAccommodations !== undefined
          ? topic.doesBylawsIncludeAddingAccommodations
          : ["Yes", true].includes(topic.IsBylawsIncludeAddingAccomodation ?? topic.IsBylawsIncludeAddingAccommodiation ?? ""),
      doesContractIncludeAddingAccommodations:
        topic.doesContractIncludeAddingAccommodations !== undefined
          ? topic.doesContractIncludeAddingAccommodations
          : ["Yes", true].includes(topic.IsContractIncludeAddingAccommodation ?? topic.IsContractIncludeAddingAccommodiation ?? ""),
      housingSpecificationInByLaws:
        topic.housingSpecificationInByLaws !== undefined
          ? topic.housingSpecificationInByLaws
          : topic.HousingSpecificationsInBylaws || "",
      housingSpecificationsInContract:
        topic.housingSpecificationsInContract !== undefined
          ? topic.housingSpecificationsInContract
          : topic.HousingSpecificationsInContract || "",
      actualHousingSpecifications:
        topic.actualHousingSpecifications !== undefined
          ? topic.actualHousingSpecifications
          : topic.HousingSpecifications || "",

      // Select fields
      typeOfRequest: (topic.RequestType || topic.RequestType_Code || topic.TypeOfRequest) ? {
        value: topic.RequestType_Code || topic.RequestType || topic.TypeOfRequest,
        label: topic.RequestType || topic.TypeOfRequest || topic.RequestType_Code,
      } : null,

      // CMR-5 specific fields
      CMR5_kindOfHoliday: topic.KindOfHoliday ? {
        value: topic.LeaveType || topic.KindOfHoliday,
        label: topic.KindOfHoliday,
      } : null,
      CMR5_totalAmount: topic.TotalAmountRequired || topic.totalAmount || "",
      CMR5_workingHours: topic.WorkingHoursCount || topic.workingHours || "",
      CMR5_additionalDetails: topic.AdditionalDetails || topic.additionalDetails || "",
      // Legacy fields for backward compatibility
      kindOfHoliday: topic.KindOfHoliday ? {
        value: topic.LeaveType || topic.KindOfHoliday,
        label: topic.KindOfHoliday,
      } : null,

      // CMR-6 specific fields
      CMR6_newPayAmount: topic.NewPayAmount || topic.newPayAmount || "",
      CMR6_payIncreaseType: topic.PayIncreaseType ? {
        value: topic.PayIncreaseType_Code || topic.PayIncreaseType,
        label: topic.PayIncreaseType,
      } : null,
      CMR6_wageDifference: topic.WageDifference || topic.wageDifference || "",
      CMR6_fromDateHijri: topic.FromDateHijri || topic.from_date_hijri || topic.pyTempDate || "",
      CMR6_fromDateGregorian: topic.FromDate_New || topic.from_date_gregorian || "",
      CMR6_toDateHijri: topic.ToDateHijri || topic.to_date_hijri || topic.Date_New || "",
      CMR6_toDateGregorian: topic.ToDate_New || topic.to_date_gregorian || "",
      // Legacy fields for backward compatibility
      newPayAmount: topic.NewPayAmount || topic.newPayAmount || "",
      payIncreaseType: topic.PayIncreaseType ? {
        value: topic.PayIncreaseType_Code || topic.PayIncreaseType,
        label: topic.PayIncreaseType,
      } : null,
      wageDifference: topic.WageDifference || topic.wageDifference || "",

      // CMR-7 specific fields
      CMR7_durationOfLeaveDue: topic.DurationOfLeaveDue || topic.durationOfLeaveDue || "",
      CMR7_payDue: topic.PayDue || topic.payDue || "",
      CMR7_fromDateHijri: topic.FromDateHijri || topic.from_date_hijri || topic.pyTempDate || "",
      CMR7_fromDateGregorian: topic.FromDate_New || topic.from_date_gregorian || "",
      CMR7_toDateHijri: topic.ToDateHijri || topic.to_date_hijri || topic.Date_New || "",
      CMR7_toDateGregorian: topic.ToDate_New || topic.to_date_gregorian || "",

      // CMR-8 specific fields
      CMR8_wagesAmount: topic.WagesAmount || topic.wagesAmount || "",
      CMR8_fromDateHijri: topic.FromDateHijri || topic.from_date_hijri || topic.pyTempDate || "",
      CMR8_fromDateGregorian: topic.FromDate_New || topic.from_date_gregorian || "",
      CMR8_toDateHijri: topic.ToDateHijri || topic.to_date_hijri || topic.Date_New || "",
      CMR8_toDateGregorian: topic.ToDate_New || topic.to_date_gregorian || "",

      commissionType: topic.CommissionType ? {
        value: topic.CommissionType,
        label: topic.CommissionType,
      } : null,

      accordingToAgreement: topic.AccordingToAgreement ? {
        value: topic.AccordingToAgreement,
        label: topic.AccordingToAgreement,
      } : null,

      forAllowance: topic.ForAllowance ? {
        value: topic.ForAllowance,
        label: topic.ForAllowance,
      } : null,

      travelingWay: topic.TravelingWay ? {
        value: topic.TravelingWay,
        label: topic.TravelingWay,
      } : null,

      typesOfPenalties: (topic.PenalityType || topic.PenalityType_Code || topic.TypesOfPenalties) ? {
        value: topic.PenalityType_Code || topic.PenalityType || topic.TypesOfPenalties,
        label: topic.PenalityTypeLabel || topic.TypesOfPenaltiesLabel || topic.PenalityType || topic.TypesOfPenalties,
      } : null,

      // Other fields
      otherAllowance: topic.OtherAllowance || topic.otherAllowance || "",
      typeOfCustody: topic.TypeOfCustody || topic.typeOfCustody || "",
      consideration: topic.Consideration || topic.consideration || "",
      managerialDecisionNumber: topic.ManagerialDecisionNumber || "",

      // Location fields
      fromLocation: (topic.FromLocation || topic.FromLocation_Code) ? {
        value: topic.FromLocation_Code || topic.FromLocation,
        label: topic.FromLocation || topic.FromLocation_Code,
      } : null,

      toLocation: (topic.ToLocation || topic.ToLocation_Code) ? {
        value: topic.ToLocation_Code || topic.ToLocation,
        label: topic.ToLocation || topic.ToLocation_Code,
      } : null,
    };

    return formFields;
  }

  /**
   * Prefill form with case topics data
   */
  static prefillForm(
    setValue: (name: string, value: any) => void,
    caseTopics: CaseTopicData[],
    isEditing: boolean = false
  ) {
    if (!isEditing || !caseTopics || caseTopics.length === 0) return;

    caseTopics.forEach((topic, index) => {
      const formFields = this.extractFormFields(topic);
      const topicPrefix = `topic_${index}`;

      // Set all form fields with topic prefix
      Object.entries(formFields).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          setValue(`${topicPrefix}_${key}`, value);
        }
      });
    });
  }
} 