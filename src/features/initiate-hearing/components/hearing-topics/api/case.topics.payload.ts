import { Option } from "@/shared/components/form/form.types";
import { formatDateToYYYYMMDD } from "@/shared/utils/dateUtils";
import { isOtherCommission } from "../utils/isOtherCommission";
import { isOtherAllowance } from "../utils/isOtherAllowance";

export function getPayloadBySubTopicID(
  caseTopics: any[],
  subCategory?: Option,
  lastAction: "Save" | "Next" | null = "Next",
  caseId: string = "default caseId"
) {
  const structuredTopics: any[] = [];

  try {
    caseTopics.forEach((topic) => {
      let topicPayload: any = null;
      const subTopicCode = typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID);
      // Debug log for subTopicCode
      console.log('DEBUG: subTopicCode in establishment payload builder:', subTopicCode);
      switch (subTopicCode) {

        /***************************Establishment Topics***************************/
        case "CR-1":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            Amount: topic?.compensationAmount || topic?.amount || topic.Amount, // Changed from "amount"
            CompensationReason: topic?.CompensationReason ?? "",
          };
          break;

        case "LCUTE-1":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            AmountOfCompensation: topic?.amountOfCompensation || topic?.AmountOfCompensation,
          };
          break;

        case "DPVR-1":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            SpoilerType: topic?.damagedType || topic?.SpoilerType,
            DamagedValue: topic?.damagedValue || topic?.DamagedValue,
          };
          break;

        case "AWRW-1":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
          }
          break;

        case "AWRW-2":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
          };
          break;

        case "RLRAHI-1":
          if (topic?.typeOfRequest?.value === "RLRAHI2") {
            topicPayload = {
              MainTopicID: topic?.MainTopicID,
              SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
              RequestType: topic?.typeOfRequest?.value || topic.RequestType,
              LoanAmount: topic?.loanAmount || topic?.LoanAmount
            };
            break;

          } else {
            topicPayload = {
              MainTopicID: topic?.MainTopicID,
              SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
              TypeOfCustody: topic?.typeOfCustody || topic?.TypeOfCustody,
              Date_New: topic?.request_date_hijri || topic?.Date_New,
              RequestDate_New: topic?.request_date_gregorian || topic?.RequestDate_New,
              RequestType: topic?.typeOfRequest?.value || topic.RequestType
            };
            break;
          }

        case "RUF-1":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            RefundType: topic?.RefundType ?? "",
            Amount: topic?.refundAmount || topic?.amount || topic?.Amount, // Changed from "amount"
          };
          break;

        /***************************Worker Topics***************************/
        /*************************** EDO Topics ***************************/

        case "EDO-1":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            MainSectionHeader: topic?.MainSectionHeader,
            SubTopicName: topic?.SubTopicName,
            CaseTopicName: topic?.CaseTopicName,
            AcknowledgementTerms: topic?.acknowledged ?? topic?.AcknowledgementTerms,
            RegulatoryText: topic?.regulatoryText ?? topic?.RegulatoryText,
            ManagerialDecisionNumber: topic?.EDO1_managerialDecisionNumber || topic?.managerialDecisionNumber || topic?.ManagerialDecisionNumber,
            FromLocation: topic?.EDO1_fromLocation?.value || topic?.fromLocation?.value || topic?.FromLocation,
            ToLocation: topic?.EDO1_toLocation?.value || topic?.toLocation?.value || topic?.ToLocation,
            Date_New: formatDateToYYYYMMDD(topic?.EDO1_managerialDecisionDateHijri || topic?.managerial_decision_date_hijri || topic?.Date_New),
            ManDecsDate: formatDateToYYYYMMDD(topic?.EDO1_managerialDecisionDateGregorian || topic?.managerial_decision_date_gregorian || topic?.ManDecsDate),
          };
          break;
        case "EDO-2":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            MainSectionHeader: topic?.MainSectionHeader,
            SubTopicName: topic?.SubTopicName,
            CaseTopicName: topic?.CaseTopicName,
            AcknowledgementTerms: topic?.acknowledged ?? topic?.AcknowledgementTerms,
            RegulatoryText: topic?.regulatoryText ?? topic?.RegulatoryText,
            ManagerialDecisionNumber: topic?.EDO2_managerialDecisionNumber || topic?.managerialDecisionNumber || topic?.ManagerialDecisionNumber,
            FromJob: topic?.EDO2_fromJob || topic?.fromJob || topic?.FromJob,
            ToJob: topic?.EDO2_toJob || topic?.toJob || topic?.ToJob,
            Date_New: formatDateToYYYYMMDD(topic?.EDO2_managerialDecisionDateHijri || topic?.managerial_decision_date_hijri || topic?.Date_New),
            ManDecsDate: formatDateToYYYYMMDD(topic?.EDO2_managerialDecisionDateGregorian || topic?.managerial_decision_date_gregorian || topic?.ManDecsDate),
          };
          break;
        case "EDO-3":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            MainSectionHeader: topic?.MainSectionHeader,
            SubTopicName: topic?.SubTopicName,
            CaseTopicName: topic?.CaseTopicName,
            AcknowledgementTerms: topic?.acknowledged ?? topic?.AcknowledgementTerms,
            RegulatoryText: topic?.regulatoryText ?? topic?.RegulatoryText,
            ManagerialDecisionNumber: topic?.EDO3_managerialDecisionNumber || topic?.managerialDecisionNumber || topic?.ManagerialDecisionNumber,
            AmountOfReduction: topic?.EDO3_amountOfReduction || topic?.amountOfReduction || topic?.AmountOfReduction,
            pyTempDate: formatDateToYYYYMMDD(topic?.EDO3_managerialDecisionDateHijri || topic?.managerial_decision_date_hijri || topic?.pyTempDate),
            ManagerialDecisionDate_New: formatDateToYYYYMMDD(topic?.EDO3_managerialDecisionDateGregorian || topic?.managerial_decision_date_gregorian || topic?.ManagerialDecisionDate_New),
          };
          break;
        case "EDO-4":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            MainSectionHeader: topic?.MainSectionHeader,
            SubTopicName: topic?.SubTopicName,
            CaseTopicName: topic?.CaseTopicName,
            AcknowledgementTerms: topic?.acknowledged ?? topic?.AcknowledgementTerms,
            RegulatoryText: topic?.regulatoryText ?? topic?.RegulatoryText,
            ManagerialDecisionNumber: topic?.EDO4_managerialDecisionNumber || topic?.managerialDecisionNumber || topic?.ManagerialDecisionNumber,
            PenalityType: topic?.EDO4_typesOfPenalties?.value || topic?.typesOfPenalties?.value || topic?.TypesOfPenalties || topic?.PenalityType,
            PenalityTypeLabel: topic?.EDO4_typesOfPenalties?.label || topic?.typesOfPenalties?.label || topic?.TypesOfPenaltiesLabel || topic?.PenalityTypeLabel,
            Date_New: formatDateToYYYYMMDD(topic?.EDO4_managerialDecisionDateHijri || topic?.managerial_decision_date_hijri || topic?.Date_New),
            ManDecsDate: formatDateToYYYYMMDD(topic?.EDO4_managerialDecisionDateGregorian || topic?.managerial_decision_date_gregorian || topic?.ManDecsDate),
          };
          break;
        /*************************** END EDO Topics ***************************/

        /*************************** LCUT Topics ***************************/
        case "LCUT-1":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            AmountOfCompensation: topic?.LCUT1_amountOfCompensation || topic?.amountOfCompensation || topic?.AmountOfCompensation,
          };
          break;
        /*************************** END LCUT Topics ***************************/

        /*************************** TTR Topics ***************************/
        case "TTR-1":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            TravelingWay: topic?.TTR1_travelingWay?.value || topic?.travelingWay?.value || topic?.TravelingWay,
            TravelingWay_Code: topic?.TTR1_travelingWay?.value || topic?.travelingWay?.value || topic?.TravelingWay_Code,
          };
          break;
                  /*************************** END TTR Topics ***************************/

          /*************************** RR Topics ***************************/
          case "RR-1":
            topicPayload = {
              MainTopicID: topic?.MainTopicID,
              SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
              Amount: topic?.RR1_Amount || topic?.Amount,
              Type: topic?.RR1_Type || topic?.Type,
            };
            break;
          /*************************** END RR Topics ***************************/

          /*************************** JAR Topics ***************************/
          case "JAR-2":
            topicPayload = {
              MainTopicID: topic?.MainTopicID,
              SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
              CurrentJobTitle: topic?.JAR2_currentJobTitle || topic?.currentJobTitle || "",
              RequiredJobTitle: topic?.JAR2_requiredJobTitle || topic?.requiredJobTitle || "",
            };
            break;
          case "JAR-3":
            topicPayload = {
              MainTopicID: topic?.MainTopicID,
              SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
              PromotionMechanism: topic?.JAR3_promotionMechanism || topic?.promotionMechanism || "",
              AdditionalUpgrade: topic?.JAR3_additionalUpgrade || topic?.additionalUpgrade || "",
            };
            break;
          /*************************** END JAR Topics ***************************/

          /*************************** WR Topics ***************************/
        case "WR-1":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            Amount: topic?.WR1_wageAmount || topic?.wageAmount || topic?.amount || topic?.Amount, // Updated to use new field name
            pyTempDate: formatDateToYYYYMMDD(topic?.WR1_fromDateHijri || topic?.from_date_hijri || topic?.pyTempDate),
            FromDate_New: formatDateToYYYYMMDD(topic?.WR1_fromDateGregorian || topic?.from_date_gregorian || topic?.FromDate_New),
            Date_New: formatDateToYYYYMMDD(topic?.WR1_toDateHijri || topic?.to_date_hijri || topic?.Date_New),
            ToDate_New: formatDateToYYYYMMDD(topic?.WR1_toDateGregorian || topic?.to_date_gregorian || topic?.ToDate_New),
            ForAllowance: topic?.WR1_forAllowance?.value || topic?.forAllowance?.value || topic?.ForAllowance,
            ForAllowance_Code: topic?.WR1_forAllowance?.value || topic?.forAllowance?.value || topic?.ForAllowance_Code,
            OtherAllowance: (() => {
              // Handle both form object and API string cases
              const forAllowance = topic?.WR1_forAllowance || topic?.forAllowance;
              const isOther = forAllowance && (
                // If it's an object (from form)
                (forAllowance.value && ["FA11", "OTHER", "3"].includes(String(forAllowance.value))) ||
                (forAllowance.label && forAllowance.label.toLowerCase().includes("other")) ||
                // If it's a string (from API response)
                (typeof forAllowance === "string" && forAllowance.toLowerCase().includes("other"))
              );

              console.log(`[🔍 API PAYLOAD] WR-1 Debug - forAllowance:`, forAllowance);
              console.log(`[🔍 API PAYLOAD] WR-1 Debug - isOther:`, isOther);
              console.log(`[🔍 API PAYLOAD] WR-1 Debug - topic.WR1_otherAllowance:`, topic?.WR1_otherAllowance);
              console.log(`[🔍 API PAYLOAD] WR-1 Debug - topic.otherAllowance:`, topic?.otherAllowance);
              console.log(`[🔍 API PAYLOAD] WR-1 Debug - topic.OtherAllowance:`, topic?.OtherAllowance);

              const result = isOther ? (topic?.WR1_otherAllowance || topic?.otherAllowance || topic?.OtherAllowance || "") : "";
              console.log(`[🔍 API PAYLOAD] WR-1 Debug - final OtherAllowance:`, result);
              return result;
            })(),
          };
          break;

        case "WR-2":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            OverdueWagesAmount: topic?.WR2_wageAmount || topic?.wageAmount || topic?.amount || topic?.OverdueWagesAmount,
            pyTempDate: formatDateToYYYYMMDD(topic?.WR2_fromDateHijri || topic?.from_date_hijri || topic?.pyTempDate),
            FromDate_New: formatDateToYYYYMMDD(topic?.WR2_fromDateGregorian || topic?.from_date_gregorian || topic?.FromDate_New),
            Date_New: formatDateToYYYYMMDD(topic?.WR2_toDateHijri || topic?.to_date_hijri || topic?.Date_New),
            ToDate_New: formatDateToYYYYMMDD(topic?.WR2_toDateGregorian || topic?.to_date_gregorian || topic?.ToDate_New),
          };
          break;

        /***************************END WR Topics ***************************/

        /*************************** BR Topics ***************************/
        case "BR-1":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            AccordingToAgreement: topic?.BR1_accordingToAgreement?.value || topic?.accordingToAgreement?.value || topic?.AccordingToAgreement,
            AccordingToAgreement_Code: topic?.BR1_accordingToAgreement?.value || topic?.accordingToAgreement?.value || topic?.AccordingToAgreement_Code,
            Premium: topic?.BR1_bonusAmount || topic?.bonusAmount || topic?.BonusAmount || topic?.Amount || topic?.Premium || "",
            pyTempDate: formatDateToYYYYMMDD(topic?.BR1_dateHijri || topic?.date_hijri || topic?.pyTempDate),
            Date_New: formatDateToYYYYMMDD(topic?.BR1_dateGregorian || topic?.date_gregorian || topic?.Date_New),
          };
          break;
        /***************************END BR Topics ***************************/

        /*************************** HIR Topics ***************************/

        case "HIR-1": {
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            IsBylawsIncludeAddingAccomodation: topic?.HIR1_IsBylawsIncludeAddingAccomodation || topic?.IsBylawsIncludeAddingAccomodation || "",
            IsContractIncludeAddingAccommodation: topic?.HIR1_IsContractIncludeAddingAccommodation || topic?.IsContractIncludeAddingAccommodation || "",
            HousingSpecificationsInContract: topic?.HIR1_HousingSpecificationsInContract || topic?.HousingSpecificationsInContract || "",
            HousingSpecificationsInBylaws: topic?.HIR1_HousingSpecificationsInBylaws || topic?.HousingSpecificationsInBylaws || "",
            HousingSpecifications: topic?.HIR1_HousingSpecifications || topic?.HousingSpecifications || "",
          };
          break;
        }

        /***************************END HIR Topics ***************************/

        /*************************** MIR Topics ***************************/

        case "MIR-1":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            RequestType: topic?.MIR1_typeOfRequest?.value || topic?.typeOfRequest?.value || topic?.RequestType,
            Reason: topic?.MIR1_theReason || topic?.theReason || topic?.Reason,
            CurrentInsuranceLevel: topic?.MIR1_currentInsuranceLevel || topic?.currentInsuranceLevel || topic?.CurrentInsuranceLevel,
            RequiredDegreeInsurance: topic?.MIR1_requiredDegreeOfInsurance || topic?.requiredDegreeOfInsurance || topic?.RequiredDegreeInsurance,
          };
          break;
        /***************************END MIR Topics ***************************/

        /*************************** TTR Topics ***************************/
        case "TTR-1":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            TravelingWay: topic?.travelingWay.value || topic?.TravelingWay,
          };
          break;


        /***************************END TTR Topics ***************************/

        /*************************** CMR Topics ***************************/
        case "CMR-1":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            AmountsPaidFor: topic?.CMR1_amountsPaidFor?.value || topic?.amountsPaidFor?.value || topic.AmountsPaidFor,
            AmountRequired: topic?.CMR1_theAmountRequired || topic?.theAmountRequired || topic?.AmountRequired,
          };
          break;

        case "CMR-3":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            Amount: topic?.CMR3_compensationAmount || topic?.compensationAmount || topic?.Amount,
            pyTempText: topic?.CMR3_injuryDateHijri || topic?.injury_date_hijri || topic?.pyTempText || "",
            InjuryDate_New: topic?.CMR3_injuryDateGregorian || topic?.injury_date_gregorian || topic?.InjuryDate_New || "",
            TypeOfWorkInjury: topic?.CMR3_injuryType || topic?.injuryType || topic?.TypeOfWorkInjury || "",
          };
          break;

        case "CMR-4":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            Amount: topic?.CMR4_compensationAmount || topic?.noticeCompensationAmount || topic?.amount || topic?.Amount,
          };
          break;

        case "CMR-5":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            LeaveType: topic?.CMR5_kindOfHoliday?.value || topic?.kindOfHoliday?.value || topic?.LeaveType_Code || "",
            TotalAmountRequired: topic?.CMR5_totalAmount || topic?.totalAmount || topic?.TotalAmountRequired,
            WorkingHoursCount: topic?.CMR5_workingHours || topic?.workingHours || topic?.WorkingHoursCount,
            AdditionalDetails: topic?.CMR5_additionalDetails || topic?.additionalDetails || topic?.AdditionalDetails,
          };
          break;

        case "CMR-6":
          console.log("[🔍 PAYLOAD DEBUG] CMR-6 topic data:", topic);
          console.log("[🔍 PAYLOAD DEBUG] CMR-6 date fields:", {
            CMR6_fromDateHijri: topic?.CMR6_fromDateHijri,
            CMR6_fromDateGregorian: topic?.CMR6_fromDateGregorian,
            CMR6_toDateHijri: topic?.CMR6_toDateHijri,
            CMR6_toDateGregorian: topic?.CMR6_toDateGregorian,
            from_date_hijri: topic?.from_date_hijri,
            from_date_gregorian: topic?.from_date_gregorian,
            to_date_hijri: topic?.to_date_hijri,
            to_date_gregorian: topic?.to_date_gregorian,
            pyTempDate: topic?.pyTempDate,
            FromDate_New: topic?.FromDate_New,
            Date_New: topic?.Date_New,
            ToDate_New: topic?.ToDate_New
          });

          const pyTempDate = formatDateToYYYYMMDD(topic?.CMR6_fromDateHijri || topic?.from_date_hijri || topic?.pyTempDate);
          const FromDate_New = formatDateToYYYYMMDD(topic?.CMR6_fromDateGregorian || topic?.from_date_gregorian || topic?.FromDate_New);
          const Date_New = formatDateToYYYYMMDD(topic?.CMR6_toDateHijri || topic?.to_date_hijri || topic?.Date_New);
          const ToDate_New = formatDateToYYYYMMDD(topic?.CMR6_toDateGregorian || topic?.to_date_gregorian || topic?.ToDate_New);

          console.log("[🔍 PAYLOAD DEBUG] CMR-6 formatted dates:", {
            pyTempDate,
            FromDate_New,
            Date_New,
            ToDate_New
          });

          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            pyTempDate,
            FromDate_New,
            Date_New,
            ToDate_New,
            NewPayAmount: topic?.CMR6_newPayAmount || topic?.newPayAmount || topic?.NewPayAmount,
            PayIncreaseType: topic?.CMR6_payIncreaseType?.value || topic?.payIncreaseType?.value || topic?.PayIncreaseType_Code || topic?.PayIncreaseType,
            WageDifference: topic?.CMR6_wageDifference || topic?.wageDifference || topic?.WageDifference,
          };
          break;
        case "CMR-7":
          console.log("[🔍 PAYLOAD DEBUG] CMR-7 topic data:", topic);
          console.log("[🔍 PAYLOAD DEBUG] CMR-7 date fields:", {
            CMR7_fromDateHijri: topic?.CMR7_fromDateHijri,
            CMR7_fromDateGregorian: topic?.CMR7_fromDateGregorian,
            CMR7_toDateHijri: topic?.CMR7_toDateHijri,
            CMR7_toDateGregorian: topic?.CMR7_toDateGregorian,
            from_date_hijri: topic?.from_date_hijri,
            from_date_gregorian: topic?.from_date_gregorian,
            to_date_hijri: topic?.to_date_hijri,
            to_date_gregorian: topic?.to_date_gregorian,
            pyTempDate: topic?.pyTempDate,
            FromDate_New: topic?.FromDate_New,
            Date_New: topic?.Date_New,
            ToDate_New: topic?.ToDate_New
          });

          const cmr7_pyTempDate = formatDateToYYYYMMDD(topic?.CMR7_fromDateHijri || topic?.from_date_hijri || topic?.pyTempDate);
          const cmr7_FromDate_New = formatDateToYYYYMMDD(topic?.CMR7_fromDateGregorian || topic?.from_date_gregorian || topic?.FromDate_New);
          const cmr7_Date_New = formatDateToYYYYMMDD(topic?.CMR7_toDateHijri || topic?.to_date_hijri || topic?.Date_New);
          const cmr7_ToDate_New = formatDateToYYYYMMDD(topic?.CMR7_toDateGregorian || topic?.to_date_gregorian || topic?.ToDate_New);

          console.log("[🔍 PAYLOAD DEBUG] CMR-7 formatted dates:", {
            cmr7_pyTempDate,
            cmr7_FromDate_New,
            cmr7_Date_New,
            cmr7_ToDate_New
          });

          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            pyTempDate: cmr7_pyTempDate,
            FromDate_New: cmr7_FromDate_New,
            Date_New: cmr7_Date_New,
            ToDate_New: cmr7_ToDate_New,
            DurationOfLeaveDue: topic?.CMR7_durationOfLeaveDue || topic?.durationOfLeaveDue || topic?.DurationOfLeaveDue,
            PayDue: topic?.CMR7_payDue || topic?.payDue || topic?.PayDue,
          };
          break;

        case "CMR-8":
          console.log("[🔍 PAYLOAD DEBUG] CMR-8 topic data:", topic);
          console.log("[🔍 PAYLOAD DEBUG] CMR-8 date fields:", {
            CMR8_fromDateHijri: topic?.CMR8_fromDateHijri,
            CMR8_fromDateGregorian: topic?.CMR8_fromDateGregorian,
            CMR8_toDateHijri: topic?.CMR8_toDateHijri,
            CMR8_toDateGregorian: topic?.CMR8_toDateGregorian,
            from_date_hijri: topic?.from_date_hijri,
            from_date_gregorian: topic?.from_date_gregorian,
            to_date_hijri: topic?.to_date_hijri,
            to_date_gregorian: topic?.to_date_gregorian,
            pyTempDate: topic?.pyTempDate,
            FromDate_New: topic?.FromDate_New,
            Date_New: topic?.Date_New,
            ToDate_New: topic?.ToDate_New
          });

          const cmr8_pyTempDate = formatDateToYYYYMMDD(topic?.CMR8_fromDateHijri || topic?.from_date_hijri || topic?.pyTempDate);
          const cmr8_FromDate_New = formatDateToYYYYMMDD(topic?.CMR8_fromDateGregorian || topic?.from_date_gregorian || topic?.FromDate_New);
          const cmr8_Date_New = formatDateToYYYYMMDD(topic?.CMR8_toDateHijri || topic?.to_date_hijri || topic?.Date_New);
          const cmr8_ToDate_New = formatDateToYYYYMMDD(topic?.CMR8_toDateGregorian || topic?.to_date_gregorian || topic?.ToDate_New);

          console.log("[🔍 PAYLOAD DEBUG] CMR-8 formatted dates:", {
            cmr8_pyTempDate,
            cmr8_FromDate_New,
            cmr8_Date_New,
            cmr8_ToDate_New
          });

          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            pyTempDate: cmr8_pyTempDate,
            FromDate_New: cmr8_FromDate_New,
            Date_New: cmr8_Date_New,
            ToDate_New: cmr8_ToDate_New,
            WagesAmount: topic?.CMR8_wagesAmount || topic?.wagesAmount || topic?.WagesAmount,
          };
          break;

        /***************************END CMR Topics ***************************/

        /*************************** BR Topics ***************************/
        case "BR-1":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            AccordingToAgreement: topic?.accordingToAgreement?.value || topic?.AccordingToAgreement,
            Premium: topic?.bonusAmount || topic?.Premium,
            pyTempDate: formatDateToYYYYMMDD(topic?.date_hijri || topic?.pyTempDate),
            Date_New: formatDateToYYYYMMDD(topic?.date_gregorian || topic?.Date_New),
          };
          break;

        /***************************END BR Topics ***************************/

        /*************************** BPSR Topics ***************************/
        case "BPSR-1":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            Amount: topic?.BPSR1_bonusProfitShareAmount || topic?.bonusProfitShareAmount || topic?.amount || topic?.Amount, // Updated to use new field name
            AmountRatio: topic?.BPSR1_amountRatio || topic?.amountRatio || topic?.AmountRatio,
            pyTempDate: formatDateToYYYYMMDD(topic?.BPSR1_fromDateHijri || topic?.from_date_hijri || topic?.pyTempDate),
            ToDate_New: formatDateToYYYYMMDD(topic?.BPSR1_toDateGregorian || topic?.to_date_gregorian || topic?.ToDate_New),
            Date_New: formatDateToYYYYMMDD(topic?.BPSR1_toDateHijri || topic?.to_date_hijri || topic?.Date_New),
            FromDate_New: formatDateToYYYYMMDD(topic?.BPSR1_fromDateGregorian || topic?.from_date_gregorian || topic?.FromDate_New),
            CommissionType: topic?.BPSR1_commissionType?.value || topic?.commissionType?.value || topic?.CommissionType,
            AccordingToAgreement: topic?.BPSR1_accordingToAgreement?.value || topic?.accordingToAgreement?.value || topic?.AccordingToAgreement,
            OtherCommission: (() => {
              // Handle both form object and API string cases
              const commissionType = topic?.BPSR1_commissionType || topic?.commissionType;
              const isOther = commissionType && (
                // If it's an object (from form)
                (commissionType.value && ["OTHER", "3"].includes(String(commissionType.value))) ||
                (commissionType.label && commissionType.label.toLowerCase().includes("other")) ||
                // If it's a string (from API response)
                (typeof commissionType === "string" && commissionType.toLowerCase().includes("other"))
              );

              console.log(`[🔍 API PAYLOAD] BPSR-1 Debug - commissionType:`, commissionType);
              console.log(`[🔍 API PAYLOAD] BPSR-1 Debug - isOther:`, isOther);
              console.log(`[🔍 API PAYLOAD] BPSR-1 Debug - topic.BPSR1_otherCommission:`, topic?.BPSR1_otherCommission);
              console.log(`[🔍 API PAYLOAD] BPSR-1 Debug - topic.otherCommission:`, topic?.otherCommission);
              console.log(`[🔍 API PAYLOAD] BPSR-1 Debug - topic.OtherCommission:`, topic?.OtherCommission);

              const result = isOther ? (topic?.BPSR1_otherCommission || topic?.otherCommission || topic?.OtherCommission || "") : "";
              console.log(`[🔍 API PAYLOAD] BPSR-1 Debug - final OtherCommission:`, result);
              return result;
            })(),
          };
          break;

        /***************************END BPSR Topics ***************************/

        /*************************** DR Topics ***************************/
        case "DR-1":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
          };
          break;

        /***************************END DR Topics ***************************/
        /*************************** RR Topics ***************************/
        case "RR-1":

          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            Amount: topic?.rewardAmount || topic?.amount || topic?.Amount, // Changed from "amount"
            Type: topic?.rewardType || topic?.RewardType || topic?.Type,
          };
          break;

        /***************************END RR Topics ***************************/

        /*************************** JAR Topics ***************************/
        case "JAR-2":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            CurrentJobTitle: topic?.currentJobTitle || topic?.CurrentJobTitle,
            RequiredJobTitle: topic?.requiredJobTitle || topic?.RequiredJobTitle,
          };
          break;

        case "JAR-3":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            PromotionMechanism:
              topic?.doesTheInternalRegulationIncludePromotionMechanism === true ? "Yes" : "No",
            AdditionalUpgrade:
              topic?.doesContractIncludeAdditionalUpgrade === true ? "Yes" : "No",
          };
          break;

        case "JAR-4":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            CurrentPosition: topic?.JAR4_CurrentPosition || topic?.currentPosition || topic?.CurrentPosition,
            WantedJob: topic?.JAR4_WantedJob || topic?.theWantedJob || topic?.WantedJob,
          };
          break;

        /***************************END JAR Topics ***************************/
        /*************************** RFR Topics ***************************/
        case "RFR-1":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            Amount: topic?.RFR1_Amount || topic?.rewardRequestAmount || topic?.amount || topic?.Amount,
            Consideration: topic?.RFR1_Consideration || topic?.consideration || topic?.Consideration,
            pyTempDate: formatDateToYYYYMMDD(topic?.RFR1_dateHijri || topic?.date_hijri || topic?.pyTempDate),
            Date_New: formatDateToYYYYMMDD(topic?.RFR1_dateGregorian || topic?.date_gregorian || topic?.Date_New),
          };
          break;

        /***************************END RFR Topics ***************************/

        /*************************** LRESR Topics ***************************/
              case "LRESR-1":
        topicPayload = {
          MainTopicID: topic?.MainTopicID,
          SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
          Amount: topic?.LRESR1_Amount || topic?.endOfServiceRewardAmount || topic?.amount || topic?.Amount,
        };
        break;

        /***************************END LRESR Topics ***************************/

        default:
          console.warn(`Unhandled subtopic code in payload builder: ${subTopicCode}`);
          break;
      }

      if (topicPayload) {
        structuredTopics.push(topicPayload);
      }
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

  return payload;
}
