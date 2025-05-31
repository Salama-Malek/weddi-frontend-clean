import { Option } from "@/shared/components/form/form.types";

export function getPayloadBySubTopicID(
  caseTopics: any[],
  subCategory?: Option,
  lastAction: "Save" | "Next" | null = "Next",
  caseId: string = "default caseId"
) {
  const structuredTopics: any[] = [];

  try {
    caseTopics.forEach((topic) => {
      const basePayload = {
        MainTopicID: topic?.MainTopicID,
        SubTopicID: topic?.SubTopicID,
      };

      let topicPayload: any = null;

      switch (topic?.SubTopicID) {

        /***************************Establishment Topics***************************/
        case "CR-2":
          topicPayload = {
            ...basePayload,
            CompensationAmount: topic?.CompensationAmount ?? "0",
            CompensationReason: topic?.CompensationReason ?? "",
          };
          break;

        case "LCUTE-1":
          topicPayload = {
            ...basePayload,
            LoanAmount: topic?.LoanAmount ?? "0",
            ItemsToHandover: topic?.ItemsToHandover ?? [],
          };
          break;

        case "LCUT-1":
          topicPayload = {
            ...basePayload,
            AmountOfCompensation: topic?.AmountOfCompensation ?? 0,
          };
          break;

        case "DPVR-1":
          topicPayload = {
            ...basePayload,
            PropertyDescription: topic?.PropertyDescription ?? "",
            EstimatedValue: topic?.EstimatedValue ?? "0",
          };
          break;

        case "AWRW-1":
          topicPayload = {
            ...basePayload,
            AllowanceAmount: topic?.AllowanceAmount ?? "0",
            ResignationDate: topic?.ResignationDate ?? "",
          }
          break;
        
        case "AWRW-2":
          topicPayload = {
            ...basePayload,
            AllowanceAmount: topic?.AllowanceAmount ?? "0",
            ResignationDate: topic?.ResignationDate ?? "",
          };
          break;

        case "RLRAHI-1":
          topicPayload = {
            ...basePayload,
            HijriReEntryDate: topic?.HijriReEntryDate ?? "",
            ReEntryReason: topic?.ReEntryReason ?? "",
          };
          break;

        /***************************Worker Topics***************************/
        case "CMR-1": //done
          topicPayload = {
            ...basePayload,
            AmountsPaidFor: topic?.amountsPaidFor.value,
            AmountRequired: topic?.theAmountRequired,
          };
          break;

        case "CMR-3": //done
          topicPayload = {
            ...basePayload,
            Amount: topic?.compensationAmount ?? "0",
            pyTempText: topic?.injury_date_hijri ?? "",
            InjuryDate_New: topic?.injury_date_gregorian ?? "",
            TypeOfWorkInjury: topic?.injuryType ?? "",
          };
          break;

        case "CMR-4": //done
          topicPayload = {
            ...basePayload,
            Amount: topic?.amount ?? "0",
          };
          break;

        case "CMR-5": //done
          topicPayload = {
            ...basePayload,
            LeaveType: topic?.kindOfHoliday.value ?? "",
            TotalAmountRequired: topic?.totalAmount ?? "0",
            WorkingHoursCount: topic?.workingHours ?? "0",
            AdditionalDetails: topic.workingHours,
          };
          break;

        case "CMR-6": //done
          topicPayload = {
            ...basePayload,
            pyTempDate: topic?.from_date_hijri ?? "",
            FromDate_New: topic?.from_date_gregorian ?? "",
            Date_New: topic?.to_date_hijri ?? "",
            ToDate_New: topic?.to_date_gregorian ?? "",
            NewPayAmount: topic?.newPayAmount ?? "0",
            PayIncreaseType: topic?.payIncreaseType ?? "",
            WageDifference: topic?.wageDifference ?? "0",
          };
          break;
        case "CMR-7": //done
          topicPayload = {
            ...basePayload,
            pyTempDate: topic?.from_date_hijri ?? "",
            ToDate_New: topic?.from_date_gregorian ?? "",
            Date_New: topic?.to_date_hijri ?? "",
            FromDate_New: topic?.to_date_gregorian ?? "",
            DurationOfLeaveDue: topic?.durationOfLeaveDue ?? "0",
            PayDue: topic?.payDue ?? "0",
          };
          break;

        case "CMR-8": //done
          topicPayload = {
            ...basePayload,
            pyTempDate: topic?.from_date_hijri ?? "",
            ToDate_New: topic?.from_date_gregorian ?? "",
            Date_New: topic?.to_date_hijri ?? "",
            FromDate_New: topic?.to_date_gregorian ?? "",
            WagesAmount: topic?.wagesAmount ?? "0",
          };
          break;

        case "EDO-1": //done
          topicPayload = {
            ...basePayload,
            FromLocation: topic?.fromLocation,
            ToLocation: topic?.toLocation,
            Date_New: topic?.managerial_decision_date_hijri,
            ManDecsDate: topic?.managerial_decision_date_gregorian,
            ManagerialDecisionNumber: topic?.managerialDecisionNumber,
          };
          break;

        case "EDO-2": //done
          topicPayload = {
            ...basePayload,
            FromJob: topic?.fromJob,
            ToJob: topic?.toJob,
            Date_New: topic?.managerial_decision_date_hijri,
            ManDecsDate: topic?.managerial_decision_date_gregorian,
            ManagerialDecisionNumber: topic?.managerialDecisionNumber,
          };
          break;

        case "EDO-3": //done
          topicPayload = {
            ...basePayload,
            AmountOfReduction: topic?.amountOfReduction,
            pyTempDate: topic?.managerial_decision_date_hijri,
            ManagerialDecisionDate_New: topic?.managerial_decision_date_gregorian,
            ManagerialDecisionNumber: topic?.managerialDecisionNumber,
          };
          break;

        case "EDO-4": //done
          topicPayload = {
            ...basePayload,
            PenalityType: topic?.typesOfPenalties ?? "ddd",
            Date_New: topic?.managerial_decision_date_hijri,
            ManDecsDate: topic?.managerial_decision_date_gregorian,
            ManagerialDecisionNumber: topic?.managerialDecisionNumber,
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
          break;
        }

        case "JAR-2": //done
          topicPayload = {
            ...basePayload,
            CurrentJobTitle: topic?.currentJobTitle,
            RequiredJobTitle: topic?.requiredJobTitle,
          };
          break;

        case "JAR-3": //done
          topicPayload = {
            ...basePayload,
            PromotionMechanism:
              topic?.doesTheInternalRegulationIncludePromotionMechanism,
            AdditionalUpgrade: topic?.doesContractIncludeAdditionalUpgrade,
          };
          break;

        case "JAR-4": //done
          topicPayload = {
            ...basePayload,
            CurrentPosition: topic?.currentPosition,
            WantedJob: topic?.theWantedJob,
          };
          break;

        case "RR-1": //done

          topicPayload = {
            ...basePayload,
            Amount: topic?.amount,
            Type: topic?.rewardType,
          };
          break;

        case "WR-1": //done
          topicPayload = {
            ...basePayload,
            Amount: topic?.amount,
            pyTempDate: topic?.from_date_hijri,
            FromDate_New: topic?.from_date_gregorian,
            Date_New: topic?.to_date_hijri,
            ToDate_New: topic?.to_date_gregorian,
            ForAllowance: topic?.forAllowance?.value,
            OtherAllowance: topic?.otherAllowance,
          };
          break;

        case "WR-2": //done
          topicPayload = {
            ...basePayload,
            OverdueWagesAmount: topic?.amount,
            pyTempDate: topic?.from_date_hijri,
            FromDate_New: topic?.from_date_gregorian,
            Date_New: topic?.to_date_hijri,
            ToDate_New: topic?.to_date_gregorian,
          };
          break;

        case "TTR-1": //done
          topicPayload = {
            ...basePayload,
            TravelingWay: topic?.travelingWay.value,
          };
          break;
        case "MIR-1": //done
          topicPayload = {
            ...basePayload,
            RequestType: topic?.typeOfRequest?.value,
            Reason: topic?.theReason,
            CurrentInsuranceLevel: topic?.currentInsuranceLevel,
            RequiredDegreeInsurance: topic?.requiredDegreeOfInsurance,
          };
          break;

        case "LRESR-1"://done
          topicPayload = {
            ...basePayload,
            Amount: topic?.amount,
          };
          break;

        case "RFR-1": //done
          topicPayload = {
            ...basePayload,
            Amount: topic?.amount,
            Consideration: topic?.consideration,
            Date_New: topic?.date_gregorian,
            pyTempDate: topic?.date_hijri,
          };
          break;

        case "BPSR-1": //done
          topicPayload = {
            ...basePayload,
            Amount: topic?.amount,
            AmountRatio: topic?.amountRatio,
            pyTempDate: topic?.from_date_hijri,
            ToDate_New: topic?.to_date_gregorian,
            Date_New: topic?.to_date_hijri,
            FromDate_New: topic?.from_date_gregorian,
            CommissionType: topic?.commissionType?.value,
            AccordingToAgreement: topic?.accordingToAgreement?.value,
            OtherCommission: topic?.otherCommission,
          };
          break;

        case "BR-1": //done
          topicPayload = {
            ...basePayload,
            AccordingToAgreement: topic?.accordingToAgreement?.value,
            Premium: topic?.bonusAmount,
            pyTempDate: topic?.date_hijri,
            Date_New: topic?.date_gregorian,
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
