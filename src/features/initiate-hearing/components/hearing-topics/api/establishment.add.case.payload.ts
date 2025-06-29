import { Option } from "@/shared/components/form/form.types";
import { formatDateToYYYYMMDD } from "@/shared/utils/dateUtils";

export function getPayloadBySubTopicID(
  caseTopics: any[],
  subCategory?: Option,
  lastAction: "Save" | "Next" | null = "Next",
  caseId: string = "default caseId"
) {
  console.log("[getPayloadBySubTopicID] called with", { caseTopics, subCategory, lastAction, caseId });
  const structuredTopics: any[] = [];

  try {
    caseTopics.forEach((topic) => {
      const basePayload = {
        ...topic,
        MainTopicID: topic?.MainTopicID,
        SubTopicID: topic?.SubTopicID,
      };

      let topicPayload: any = null;

      switch (topic?.SubTopicID) {

        /***************************Establishment Topics***************************/
        case "CR-1": //done
          topicPayload = {
            ...basePayload,
            Amount: topic?.amount || topic.Amount,
            CompensationReason: topic?.CompensationReason ?? "",
          };
          break;

        case "LCUTE-1": //done
          console.log("ttt", topic);
          topicPayload = {
            ...basePayload,
            AmountOfCompensation: topic?.amountOfCompensation || topic?.AmountOfCompensation,
          };
          break;

        case "LCUT-1":
          topicPayload = {
            ...basePayload,
            AmountOfCompensation: topic?.amountOfCompensation || topic?.AmountOfCompensation,
          };
          break;

        case "DPVR-1": //done
          topicPayload = {
            ...basePayload,
            SpoilerType: topic?.damagedType || topic?.SpoilerType,
            DamagedValue: topic?.damagedValue || topic?.DamagedValue,
          };
          break;

        case "AWRW-1": //done
          topicPayload = {
            ...basePayload,
          }
          break;
        
        case "AWRW-2": //done
          topicPayload = {
            ...basePayload,
          };
          break;

        case "RLRAHI-1":
          if(topic?.typeOfRequest?.value === "RLRAHI2"){
            topicPayload = {
              ...basePayload,
              RequestType: topic?.typeOfRequest?.value || topic.RequestType,
              LoanAmount: topic?.loanAmount || topic?.LoanAmount
            };
          break;

          } else {
            topicPayload = {
              ...basePayload,
              TypeOfCustody: topic?.typeOfCustody || topic?.TypeOfCustody,
              Date_New: topic?.request_date_hijri || topic?.Date_New,
              RequestDate_New: topic?.request_date_gregorian || topic?.RequestDate_New,
              RequestType: topic?.typeOfRequest?.value || topic.RequestType
            };
            break;
          }

        case "RUF-1":
          topicPayload = {
            ...basePayload,
            RefundType: topic?.RefundType ?? "",
            Amount: topic?.amount || topic?.Amount,
          };
          break;

        /***************************Worker Topics***************************/
        case "CMR-1": //done
          topicPayload = {
            ...basePayload,
            AmountsPaidFor: topic?.amountsPaidFor.value || topic.AmountsPaidFor,
            AmountRequired: topic?.theAmountRequired || topic?.AmountRequired,
          };
          break;

        case "CMR-3": //done
        console.log(topic);
          topicPayload = {
            ...basePayload,
            Amount: topic?.compensationAmount || topic?.Amount,
            pyTempText: formatDateToYYYYMMDD(topic?.injury_date_hijri || topic?.pyTempText),
            InjuryDate_New: formatDateToYYYYMMDD(topic?.injury_date_gregorian || topic?.InjuryDate_New),
            TypeOfWorkInjury: topic?.injuryType || topic?.TypeOfWorkInjury,
          };
          break;

        case "CMR-4": //done
          topicPayload = {
            ...basePayload,
            Amount: topic?.amount || topic?.Amount,
          };
          break;

        case "CMR-5": //done
          topicPayload = {
            ...basePayload,
            LeaveType: topic?.kindOfHoliday || topic?.LeaveType,
            TotalAmountRequired: topic?.totalAmount || topic?.TotalAmountRequired,
            WorkingHoursCount: topic?.workingHours || topic?.WorkingHoursCount,
            AdditionalDetails: topic.workingHours || topic?.AdditionalDetails,
          };
          break;

        case "CMR-6": //done
          topicPayload = {
            ...basePayload,
            pyTempDate: formatDateToYYYYMMDD(topic?.from_date_hijri || topic?.pyTempDate),
            FromDate_New: formatDateToYYYYMMDD(topic?.from_date_gregorian || topic?.FromDate_New),
            Date_New: formatDateToYYYYMMDD(topic?.to_date_hijri || topic?.Date_New),
            ToDate_New: formatDateToYYYYMMDD(topic?.to_date_gregorian || topic?.ToDate_New),
            NewPayAmount: topic?.newPayAmount || topic?.NewPayAmount,
            PayIncreaseType: topic?.payIncreaseType || topic?.PayIncreaseType,
            WageDifference: topic?.wageDifference || topic?.WageDifference,
          };
          break;
        case "CMR-7": //done
          topicPayload = {
            ...basePayload,
            pyTempDate: formatDateToYYYYMMDD(topic?.from_date_hijri || topic?.pyTempDate),
            ToDate_New: formatDateToYYYYMMDD(topic?.from_date_gregorian || topic?.ToDate_New),
            Date_New: formatDateToYYYYMMDD(topic?.to_date_hijri || topic?.Date_New),
            FromDate_New: formatDateToYYYYMMDD(topic?.to_date_gregorian || topic?.FromDate_New),
            DurationOfLeaveDue: topic?.durationOfLeaveDue || topic?.DurationOfLeaveDue,
            PayDue: topic?.payDue || topic?.PayDue,
          };
          break;

        case "CMR-8": //done
          topicPayload = {
            ...basePayload,
            pyTempDate: formatDateToYYYYMMDD(topic?.from_date_hijri || topic?.pyTempDate),
            ToDate_New: formatDateToYYYYMMDD(topic?.from_date_gregorian || topic?.ToDate_New),
            Date_New: formatDateToYYYYMMDD(topic?.to_date_hijri || topic?.Date_New),
            FromDate_New: formatDateToYYYYMMDD(topic?.to_date_gregorian || topic?.FromDate_New),
            WagesAmount: topic?.wagesAmount || topic?.WagesAmount,
          };
          break;

        case "EDO-1": //done
          topicPayload = {
            ...basePayload,
            FromLocation: topic?.fromLocation?.value || topic?.FromLocation,
            ToLocation: topic?.toLocation?.value || topic?.ToLocation,
            Date_New: formatDateToYYYYMMDD(topic?.managerial_decision_date_hijri || topic?.Date_New),
            ManDecsDate: formatDateToYYYYMMDD(topic?.managerial_decision_date_gregorian || topic?.ManDecsDate),
            ManagerialDecisionNumber: topic?.managerialDecisionNumber || topic?.ManagerialDecisionNumber,
          };
          break;

        case "EDO-2": //done
          topicPayload = {
            ...basePayload,
            FromJob: topic?.fromJob || topic?.FromJob,
            ToJob: topic?.toJob || topic?.ToJob,
            Date_New: formatDateToYYYYMMDD(topic?.managerial_decision_date_hijri || topic?.Date_New),
            ManDecsDate: formatDateToYYYYMMDD(topic?.managerial_decision_date_gregorian || topic?.ManDecsDate),
            ManagerialDecisionNumber: topic?.managerialDecisionNumber || topic?.ManagerialDecisionNumber,
          };
          break;

        case "EDO-3": //done
          topicPayload = {
            ...basePayload,
            AmountOfReduction: topic?.amountOfReduction || topic?.AmountOfReduction,
            pyTempDate: formatDateToYYYYMMDD(topic?.managerial_decision_date_hijri || topic?.pyTempDate),
            ManagerialDecisionDate_New: formatDateToYYYYMMDD(topic?.managerial_decision_date_gregorian || topic?.ManagerialDecisionDate_New),
            ManagerialDecisionNumber: topic?.managerialDecisionNumber || topic?.ManagerialDecisionNumber,
          };
          break;

        case "EDO-4": //done
          topicPayload = {
            ...basePayload,
            PenalityType: topic?.typesOfPenalties?.value || topic?.TypesOfPenalties || topic?.PenalityType,
            PenalityTypeLabel: topic?.typesOfPenalties?.label || topic?.TypesOfPenaltiesLabel || topic?.PenalityTypeLabel,
            Date_New: formatDateToYYYYMMDD(topic?.managerial_decision_date_hijri || topic?.Date_New),
            ManDecsDate: formatDateToYYYYMMDD(topic?.managerial_decision_date_gregorian || topic?.ManDecsDate),
            ManagerialDecisionNumber: topic?.managerialDecisionNumber || topic?.ManagerialDecisionNumber,
          };
          break;

        case "HIR-1": {  //done
          const {
            doesBylawsIncludeAddingAccommodations,
            doesContractIncludeAddingAccommodations,
            housingSpecificationsInContract,
            housingSpecificationInByLaws,
            actualHousingSpecifications,
          } = topic || {};

          topicPayload = {
            ...basePayload,
            ...(doesBylawsIncludeAddingAccommodations && {
              IsBylawsIncludeAddingAccommodiation: "Yes",
              IsContractIncludeAddingAccommodiation: "No",
              HousingSpecificationsInBylaws: housingSpecificationInByLaws || topic?.HousingSpecificationsInBylaws,
            }),
            ...(doesContractIncludeAddingAccommodations && {
              IsContractIncludeAddingAccommodiation: "Yes",
              IsBylawsIncludeAddingAccommodiation: "No",
              HousingSpecificationsInContract: housingSpecificationsInContract || topic?.HousingSpecificationsInContract,
              HousingSpecifications: actualHousingSpecifications || topic?.HousingSpecifications,
            }),
          };
          break;
        }

        case "JAR-2": //done
          topicPayload = {
            ...basePayload,
            CurrentJobTitle: topic?.currentJobTitle || topic?.CurrentJobTitle,
            RequiredJobTitle: topic?.requiredJobTitle || topic?.RequiredJobTitle,
          };
          break;

        case "JAR-3": //done
          topicPayload = {
            ...basePayload,
            PromotionMechanism:
              topic?.doesTheInternalRegulationIncludePromotionMechanism || topic?.PromotionMechanism,
            AdditionalUpgrade: topic?.doesContractIncludeAdditionalUpgrade || topic?.AdditionalUpgrade,
          };
          break;

        case "JAR-4": //done
          topicPayload = {
            ...basePayload,
            CurrentPosition: topic?.currentPosition || topic?.CurrentPosition,
            WantedJob: topic?.theWantedJob || topic?.WantedJob,
          };
          break;

        case "RR-1": //done

          topicPayload = {
            ...basePayload,
            Amount: topic?.Amount || topic?.amount,
            Type: topic?.RewardType || topic?.Type,
          };
          break;

        case "WR-1": //done
          topicPayload = {
            ...basePayload,
            Amount: topic?.amount || topic?.Amount,
            pyTempDate: formatDateToYYYYMMDD(topic?.from_date_hijri || topic?.pyTempDate),
            FromDate_New: formatDateToYYYYMMDD(topic?.from_date_gregorian || topic?.FromDate_New),
            Date_New: formatDateToYYYYMMDD(topic?.to_date_hijri || topic?.Date_New),
            ToDate_New: formatDateToYYYYMMDD(topic?.to_date_gregorian || topic?.ToDate_New),
            ForAllowance: topic?.forAllowance?.value || topic?.ForAllowance,
            OtherAllowance: topic?.otherAllowance || topic?.OtherAllowance,
          };
          break;

        case "WR-2": //done
          topicPayload = {
            ...basePayload,
            OverdueWagesAmount: topic?.amount || topic?.OverdueWagesAmount,
            pyTempDate: formatDateToYYYYMMDD(topic?.from_date_hijri || topic?.pyTempDate),
            FromDate_New: formatDateToYYYYMMDD(topic?.from_date_gregorian || topic?.FromDate_New),
            Date_New: formatDateToYYYYMMDD(topic?.to_date_hijri || topic?.Date_New),
            ToDate_New: formatDateToYYYYMMDD(topic?.to_date_gregorian || topic?.ToDate_New),
          };
          break;

        case "TTR-1": //done
          topicPayload = {
            ...basePayload,
            TravelingWay: topic?.travelingWay.value || topic?.TravelingWay,
          };
          break;
        case "MIR-1": //done
          topicPayload = {
            ...basePayload,
            RequestType: topic?.typeOfRequest?.value || topic?.RequestType,
            Reason: topic?.theReason || topic?.Reason,
            CurrentInsuranceLevel: topic?.currentInsuranceLevel || topic?.CurrentInsuranceLevel,
            RequiredDegreeInsurance: topic?.requiredDegreeOfInsurance || topic?.RequiredDegreeInsurance,
          };
          break;

        case "LRESR-1"://done
          topicPayload = {
            ...basePayload,
            Amount: topic?.amount || topic?.Amount,
          };
          break;

        case "RFR-1": //done
          topicPayload = {
            ...basePayload,
            Amount: topic?.amount || topic?.Amount,
            Consideration: topic?.consideration || topic?.Consideration,
            pyTempDate: formatDateToYYYYMMDD(topic?.date_hijri || topic?.pyTempDate),
            Date_New: formatDateToYYYYMMDD(topic?.date_gregorian || topic?.Date_New),
          };
          break;

        case "BPSR-1": //done
          topicPayload = {
            ...basePayload,
            Amount: topic?.amount || topic?.Amount,
            AmountRatio: topic?.amountRatio || topic?.AmountRatio,
            pyTempDate: formatDateToYYYYMMDD(topic?.from_date_hijri || topic?.pyTempDate),
            ToDate_New: formatDateToYYYYMMDD(topic?.to_date_gregorian || topic?.ToDate_New),
            Date_New: formatDateToYYYYMMDD(topic?.to_date_hijri || topic?.Date_New),
            FromDate_New: formatDateToYYYYMMDD(topic?.from_date_gregorian || topic?.FromDate_New),
            CommissionType: topic?.commissionType?.value || topic?.CommissionType,
            AccordingToAgreement: topic?.accordingToAgreement?.value || topic?.AccordingToAgreement,
            OtherCommission: topic?.otherCommission || topic?.OtherCommission,
          };
          break;

        case "BR-1": //done
          topicPayload = {
            ...basePayload,
            AccordingToAgreement: topic?.accordingToAgreement?.value || topic?.AccordingToAgreement,
            Premium: topic?.bonusAmount || topic?.Premium,
            pyTempDate: formatDateToYYYYMMDD(topic?.date_hijri || topic?.pyTempDate),
            Date_New: formatDateToYYYYMMDD(topic?.date_gregorian || topic?.Date_New),
          };
          break;

        default:
          // Fall back to sending the topic as-is
          topicPayload = { ...topic };
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

  if (structuredTopics.length === 0) {
    return { message: "No specific payload structure defined" };
  }

  return payload;
}
