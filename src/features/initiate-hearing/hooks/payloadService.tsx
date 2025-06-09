import { TokenClaims } from "@/features/login/components/AuthProvider";
import {
  claimantDetailsPayload,
  defendantDetailsPayload,
  workDetailsPayload,
  hearingTopicsPayload,
  reviewPayload,
} from "../api/create-case/payloads";
import { useCookieState } from "./useCookieState";
import { useTransition } from "react";
import { useTranslation } from "react-i18next";

export const usePayloadService = ({
  isDomestic,
  userType,
  GetCookieEstablishmentData,
  getNicDetailObject,
  defendantStatus,
  defendantDetails,
}: any) => {
  const getPayload = (
    currentStep: number,
    currentTab: number,
    buttonName: "Next" | "Save",
    formData: any,
    userClaims: TokenClaims,
    userType: string,
    language?: string,
    getCaseId?: any,
    getUserClaims?: any,
    extractEstablishmentObject?: any,
    caseTopics?: any,
    attorneyData?: any,
    watch?: any
  ) => {
    if (!formData) {
      return null;
    }

    try {
      if (currentStep === 0) {
        switch (currentTab) {
          case 0:
            return claimantDetailsPayload(
              buttonName,
              formData,
              userClaims,
              isDomestic,
              getNicDetailObject,
              attorneyData,
              userType,
              getCaseId,
              language
            );

          case 1:
            // Debug what data we have
            console.log('Form Data:', formData);
            console.log('NIC Details from form:', formData?.NICDetails);
            console.log('NIC Details from function:', getNicDetailObject?.());
            console.log('Defendant Details:', defendantDetails);

            // Try to get NIC details from all possible sources
            const nicDetails = formData?.NICDetails || 
                             getNicDetailObject?.() || 
                             defendantDetails?.NICDetails || 
                             formData?.defendantDetails?.NICDetails;

            console.log('Final NIC Details:', nicDetails);

            return defendantDetailsPayload(
              buttonName,
              formData,
              getCaseId,
              userClaims,
              userType,
              language,
              nicDetails
            );
          case 2:
            return workDetailsPayload(
              buttonName,
              formData,
              getCaseId,
              userClaims,
              language,
              userType
            );
          default:
            throw new Error("Invalid tab");
        }
      } else if (currentStep === 1) {
        return hearingTopicsPayload(
          buttonName,
          formData,
          getCaseId,
          caseTopics
        );
      } else if (currentStep === 2) {
        //console.log("tthisish",formData);

        return {
          CaseID: getCaseId,
          Flow_CurrentScreen: "FinalReviewScreen",
          Language: formData.selectedLanguage || "EN",
          AckAggrements:
            formData.acknowlodgement?.DataElements?.map((item: any) => ({
              ElementKey: formData.selectedLanguage || "EN",
              ElementValue: item.ElementValue,
              Selected: "true",
            })) || [],
        };
      }
      throw new Error("Invalid step");
    } catch (error) {
      console.error("Error generating payload:", error);
      return null;
    }
  };

  return { getPayload };
};
