import { TokenClaims } from "@/features/login/components/AuthProvider";
import {
  claimantDetailsPayload,
  defendantDetailsPayload,
  defendantWorkerPayload,
  workDetailsPayload,
  hearingTopicsPayload,
  reviewPayload,
} from "../api/create-case/payloads";
interface usePayloadServiceInterface {
  isDomestic?: any;
  userType?: any;
  GetCookieEstablishmentData?: any;
  getNicDetailObject?: any;
  defendantStatus?: any;
  defendantDetails?: any;
}

export const usePayloadService = ({
  getNicDetailObject,
  defendantDetails,
}: usePayloadServiceInterface) => {
  const getPayload = (
    currentStep: number,
    currentTab: number,
    buttonName: "Next" | "Save",
    formData: any,
    userClaims: TokenClaims,
    userType: string,
    language: string = "EN",
    getCaseId?: string,
    _unused1?: any,
    _unused2?: any,
    caseTopics?: any,
    _unused3?: any,
  ) => {
    if (!formData) return null;

    const lowUserType = userType?.toLowerCase();
    const isLegalOrEstablishment =
      lowUserType === "legal representative" || lowUserType === "establishment";

    const nicDetails =
      formData?.NICDetails ||
      getNicDetailObject?.NICDetails ||
      getNicDetailObject ||
      defendantDetails?.NICDetails ||
      formData?.defendantDetails?.NICDetails;

    try {
      if (currentStep === 0) {
        switch (currentTab) {
          case 0:
            return claimantDetailsPayload(
              buttonName,
              formData,
              userClaims,
              nicDetails,
              userType,
              getCaseId,
              language,
            );

          case 1:
            if (isLegalOrEstablishment) {
              return defendantWorkerPayload(
                buttonName,
                formData,
                getCaseId,
                language,
              );
            }
            return defendantDetailsPayload(
              buttonName,
              formData,
              getCaseId,
              language,
              userType,
              userClaims,
            );

          case 2:
            return workDetailsPayload(
              buttonName,
              formData,
              getCaseId,
              userClaims,
              userType,
              language,
            );

          default:
            throw new Error("Invalid tab");
        }
      }

      if (currentStep === 1) {
        return hearingTopicsPayload(
          buttonName,
          getCaseId,
          caseTopics,
          userClaims,
          language,
          userType,
        );
      }

      if (currentStep === 2) {
        return reviewPayload(
          buttonName,
          formData,
          getCaseId,
          userClaims,
          userType,
          language,
        );
      }

      throw new Error("Invalid step");
    } catch (error) {
      return null;
    }
  };

  return { getPayload };
};
