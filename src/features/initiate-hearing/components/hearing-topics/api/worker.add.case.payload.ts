import { Option } from "@/shared/components/form/form.types";

export function getPayloadBySubTopicID(
  caseTopics: any[],
  subCategory?: Option,
  lastAction?: "Save" | "Next" | null,
  caseId?: string
) {
  const payload = {
    CaseID: caseId ?? "default caseId",
    Flow_CurrentScreen: "CaseTopics",
    Flow_ButtonName: lastAction,
    CaseTopics: [] as any[],
  };

  console.log("caseTopics", caseTopics);
  caseTopics.forEach((topic) => {

    const basePayload = {
      MainTopicID: topic?.mainCategory,
      SubTopicID: topic?.subCategory,
    };

    switch (topic?.subCategory) {
      case "WR-1": //done
        const WR1Payload = {
          ...basePayload,
          Amount: topic?.amount,
          pyTempDate: topic?.from_date_hijri,
          FromDate_New: topic?.from_date_gregorian,
          Date_New: topic?.to_date_hijri,
          ToDate_New: topic?.to_date_gregorian,
          ForAllowance: topic?.forAllowance?.value,
          OtherAllowance: topic?.otherAllowance,
        };
        payload.CaseTopics.push(WR1Payload);
        break;
      case "WR-2": //done
        const WR2Payload = {
          ...basePayload,
          OverdueWagesAmount: topic?.overdueWagesAmount,
          pyTempDate: topic?.from_date_hijri,
          FromDate_New: topic?.from_date_gregorian,
          Date_New: topic?.to_date_hijri,
          ToDate_New: topic?.to_date_gregorian,
        };
        payload.CaseTopics.push(WR2Payload);
        break;
      
      case "MIR-1": //done
        const MIRPayload = {
          ...basePayload,
          RequestType: topic?.typeOfRequest?.value,
          Reason: topic?.theReason,
          CurrentInsuranceLevel: topic?.currentInsuranceLevel,
          RequiredDegreeInsurance: topic?.requiredDegreeOfInsurance,
        };
        payload.CaseTopics.push(MIRPayload);
        break;
      case "BPSR-1": //done
        const BPSR1Payload = {
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

        payload.CaseTopics.push(BPSR1Payload);
        break;
      case "BR-1": //done
        const BR1Payload = {
          ...basePayload,
          AccordingToAgreement: topic?.accordingToAgreement?.value,
          Premium: topic?.bonusAmount,
          pyTempDate: topic?.date_hijri,
          Date_New: topic?.date_gregorian,
        };
        payload.CaseTopics.push(BR1Payload);
        break;
    
      case "CMR-4":
        const CMR4Payload = {
          ...basePayload,
          Amount: topic?.amount,
        };
        payload.CaseTopics.push(CMR4Payload);
        break;
      case "CMR-3":
        const CMR3Payload = {
          ...basePayload,
          Amount: topic?.amount,
          pyTempText: topic?.injury_date_hijri,
          InjuryDate_New: topic?.injury_date_gregorian,
          TypeOfWorkInjury: topic?.injuryType,
        };

        payload.CaseTopics.push(CMR3Payload);
        break;

      case "CMR-1":
        const CMR1Payload = {
          ...basePayload,
          AmountsPaidFor: topic?.amountsPaidFor?.value,
          AmountRequired: topic?.theAmountRequired,
        };

        payload.CaseTopics.push(CMR1Payload);
        break;
      case "CMR-5":
        const CMR5Payload = {
          ...basePayload,
          LeaveType: topic?.kindOfHoliday?.value,
          TotalAmountRequired: topic?.totalAmount,
          WorkingHoursCount: topic?.workingHours,
          AdditionalDetails: topic?.additionalDetails,
        };

        payload.CaseTopics.push(CMR5Payload);
        break;

      case "CMR-8":
        const CMR8Payload = {
          ...basePayload,
          WagesAmount: topic?.newPayAmount,
          pyTempDate: topic?.from_date_hijri,
          ToDate_New: topic?.to_date_gregorian,
          Date_New: topic?.to_date_hijri,
          FromDate_New: topic?.from_date_gregorian,
        };

        payload.CaseTopics.push(CMR8Payload);
        break;
      case "CMR-6":
        const CMR6Payload = {
          ...basePayload,
          NewPayAmount: topic?.wagesAmount,
          PayIncreaseType: topic?.payIncreaseType,
          pyTempDate: topic?.from_date_hijri,
          ToDate_New: topic?.to_date_gregorian,
          Date_New: topic?.to_date_hijri,
          FromDate_New: topic?.from_date_gregorian,
          WageDifference: topic?.wageDifference,
        };
        payload.CaseTopics.push(CMR6Payload);
        break;
      case "CMR-7":
        const CMR7Payload = {
          ...basePayload,
          PayDue: topic?.payDue,
          pyTempDate: topic?.from_date_hijri,
          ToDate_New: topic?.to_date_gregorian,
          Date_New: topic?.to_date_hijri,
          FromDate_New: topic?.from_date_gregorian,
          DurationOfLeaveDue: topic?.durationOfLeaveDue,
        };

        payload.CaseTopics.push(CMR7Payload);
        break;

      case "LCUT-1": //done
        const LCUT1Payload = {
          ...basePayload,
          AmountOfCompensation: topic?.amountOfCompensation,
        };

        payload.CaseTopics.push(LCUT1Payload);
        break;
      case "EDO-1": //done
        const EDO1Payload = {
          ...basePayload,
          FromLocation: topic?.fromLocation,
          ToLocation: topic?.toLocation,
          Date_New: topic?.managerial_decision_date_hijri,
          ManDecsDate: topic?.managerial_decision_date_gregorian,
          ManagerialDecisionNumber: topic?.managerialDecisionNumber,
        };

        payload.CaseTopics.push(EDO1Payload);
        break;
      case "EDO-2": //done
        const EDO2Payload = {
          ...basePayload,
          FromJob: topic?.fromJob,
          ToJob: topic?.toJob,
          Date_New: topic?.managerial_decision_date_hijri,
          ManDecsDate: topic?.managerial_decision_date_gregorian,
          ManagerialDecisionNumber: topic?.managerialDecisionNumber,
        };

        payload.CaseTopics.push(EDO2Payload);
        break;
      case "EDO-4"://done
        const EDO4Payload = {
          ...basePayload,
          PenalityType: topic?.typesOfPenalties,
          Date_New: topic?.managerial_decision_date_hijri,
          ManDecsDate: topic?.managerial_decision_date_gregorian,
          ManagerialDecisionNumber: topic?.managerialDecisionNumber,
        };

        payload.CaseTopics.push(EDO4Payload);
        break;

      case "EDO-3"://done
        const EDO3Payload = {
          ...basePayload,
          AmountOfReduction: topic?.amountOfReduction,
          pyTempDate: topic?.managerial_decision_date_hijri,
          ManagerialDecisionDate_New: topic?.managerial_decision_date_gregorian,
          ManagerialDecisionNumber: topic?.managerialDecisionNumber,
        };

        payload.CaseTopics.push(EDO3Payload);
        break;

      case "HIR-1": {
        const {
          doesBylawsIncludeAddingAccommodations,
          doesContractIncludeAddingAccommodations,
          housingSpecificationsInContract,
          housingSpecificationInByLaws,
          actualHousingSpecifications,
        } = topic || {};

        payload.CaseTopics.push({
          ...basePayload,
          ...(doesBylawsIncludeAddingAccommodations && {
            IsBylawsIncludeAddingAccommodiation: true,
            HousingSpecificationsInBylaws: housingSpecificationInByLaws,
          }),
          ...(doesContractIncludeAddingAccommodations && {
            IsContractIncludeAddingAccommodiation: true,
            HousingSpecificationsInContract: housingSpecificationsInContract,
            HousingSpecifications: actualHousingSpecifications,
          }),
        });
        break;
      }

      case "JAR-2":
        const JAR2Payload = {
          ...basePayload,
          CurrentJobTitle: topic?.currentJobTitle,
          RequiredJobTitle: topic?.requiredJobTitle,
        };

        payload.CaseTopics.push(JAR2Payload);
        break;

      case "JAR-3":
        const JAR3Payload = {
          ...basePayload,
          PromotionMechanism:
            topic?.doesTheInternalRegulationIncludePromotionMechanism,
          AdditionalUpgrade: topic?.doesContractIncludeAdditionalUpgrade,
        };

        payload.CaseTopics.push(JAR3Payload);
        break;

      case "JAR-4":
        const JAR4Payload = {
          ...basePayload,
          CurrentPosition: topic?.currentPosition,
          WantedJob: topic?.theWantedJob,
        };

        payload.CaseTopics.push(JAR4Payload);
        break;

      case "RR-1"://done
        const RR1Payload = {
          ...basePayload,
          Amount: topic?.amount,
          Type: topic?.rewardType,
        };

        payload.CaseTopics.push(RR1Payload);
        break;

      case "LRESR-1"://done
        const LRESR1Payload = {
          ...basePayload,
          Amount: topic?.amount,
        };

        payload.CaseTopics.push(LRESR1Payload);
        break;

      case "TTR-1"://done
        const TTR1Payload = {
          ...basePayload,
          TravelingWay: topic?.travelingWay?.value,
        };

        payload.CaseTopics.push(TTR1Payload);
        break;
      case "RFR-1"://done
        const RFR1Payload = {
          ...basePayload,
          Amount: topic?.amount,
          Consideration: topic?.consideration,
          pyTempDate: topic?.date_hijri,
          Date_New: topic?.date_gregorian,
        };

        payload.CaseTopics.push(RFR1Payload);
        break;
      case "DR-1": //done
        const DR1Payload = {
          ...basePayload,
          pyTempDate: topic?.from_date_hijri,
          Date_New: topic?.to_date_hijri,
          FromDate_New: topic?.from_date_gregorian,
          ToDate_New: topic?.to_date_gregorian,
        };

        payload.CaseTopics.push(DR1Payload);
        break;

      default:
        break;
    }
  });

  if (payload.CaseTopics.length === 0) {
    return { message: "No specific payload structure defined" };
  }

  return payload;
}
