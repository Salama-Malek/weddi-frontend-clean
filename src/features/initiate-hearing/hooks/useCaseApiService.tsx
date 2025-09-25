import { useState } from "react";
import {
  useSaveClaimantDetailsMutation,
  useSaveDefendantDetailsMutation,
  useSaveWorkDetailsMutation,
  useSaveHearingTopicsMutation,
  useSubmitReviewMutation,
} from "../api/create-case/apis";
import { useCookieState } from "./useCookieState";

import { emabsyClaimantPayload } from "../api/create-case/payloads";

export const useCaseApiService = () => {
  const [saveClaimantDetails] = useSaveClaimantDetailsMutation();
  const [saveDefendantDetails] = useSaveDefendantDetailsMutation();
  const [saveWorkDetails] = useSaveWorkDetailsMutation();
  const [saveHearingTopics] = useSaveHearingTopicsMutation();
  const [submitReview] = useSubmitReviewMutation();
  const [getCookie, setCookie] = useCookieState({ caseId: "" });
  const [isCaseCreated, _setIsCaseCreated] = useState(getCookie("caseId"));

  const handleSaveOrSubmit = async (
    currentStep: number,
    currentTab: number,
    payload?: any,
    formData?: any,
    userClaims?: any,
    userType?: string,
    lang?: string,
  ) => {
    let response;

    if (currentStep === 0) {
      switch (currentTab) {
        case 0:
          let finalPayload = payload;

          if (userType?.toLowerCase().includes("embassy user") && formData) {
            finalPayload = emabsyClaimantPayload(
              "Next",
              formData,
              getCookie("caseId") || "",
              userClaims,
              lang || "EN",
              userType,
              null,
            );
          }

          const payloadPoint = isCaseCreated
            ? {
                ...finalPayload,
                CaseID: isCaseCreated,
              }
            : { ...finalPayload };

          response = await saveClaimantDetails({
            data: payloadPoint,
            isCaseCreated,
          }).unwrap();

          if (response?.CaseNumber) {
            setCookie("caseId", response?.CaseNumber);
          }
          break;
        case 1:
          response = await saveDefendantDetails(payload).unwrap();
          break;
        case 2:
          response = await saveWorkDetails(payload).unwrap();
          break;
        default:
          throw new Error("Invalid tab");
      }
    } else if (currentStep === 1) {
      response = await saveHearingTopics(payload).unwrap();
    } else if (currentStep === 2) {
      response = await submitReview(payload).unwrap();
    } else {
      throw new Error("Invalid step");
    }

    return response;
  };

  return { handleSaveOrSubmit };
};
