import { useState } from "react";
import {
  useSaveClaimantDetailsMutation,
  useSaveDefendantDetailsMutation,
  useSaveWorkDetailsMutation,
  useSaveHearingTopicsMutation,
  useSubmitReviewMutation,
  useSubmitFinalReviewMutation,
} from "../api/create-case/apis";
import { useCookieState } from "./useCookieState";
import { toast } from "react-toastify";

export const useCaseApiService = () => {
  const [saveClaimantDetails] = useSaveClaimantDetailsMutation();
  const [saveDefendantDetails] = useSaveDefendantDetailsMutation();
  const [saveWorkDetails] = useSaveWorkDetailsMutation();
  const [saveHearingTopics] = useSaveHearingTopicsMutation();
  const [submitReview] = useSubmitReviewMutation();
  const [submitFinalReview] = useSubmitFinalReviewMutation();
  const [getCookie, setCookie, removeCookie] = useCookieState({ caseId: "" });
  const [isCaseCreated, setIsCaseCreated] = useState(getCookie("caseId"));



  const handleSaveOrSubmit = async (
    currentStep: number,
    currentTab: number,
    payload?: any
  ) => {
    try {
      let response;

      if (currentStep === 0) {
        switch (currentTab) {
          case 0:

            let payloadPoint = isCaseCreated ? {
              ...payload,
              "CaseID": isCaseCreated
            } : { ...payload };

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
        if (payload?.AckAggrements?.length !== 0) {
          response = await submitFinalReview(payload).unwrap();
        }
      } else {
        throw new Error("Invalid step");
      }

      if (response && response?.ErrorCodeList?.[0]?.ErrorDesc !== "" &&
        response?.ErrorCodeList?.[0]?.ErrorCode !== "" &&
        response?.ErrorCodeList &&
        response?.ErrorCodeList.length !== 0) {
        response?.ErrorCodeList.forEach((element: any) => {
          toast.error(`${element.ErrorDesc}`);
        });
        //toast.error(`${response?.ErrorCodeList?.[0].ErrorDesc}`);
        throw new Error("Validation errors found in response.");
      }

      // if (
      //   response?.ErrorCodeList?.[0]?.ErrorDesc !== "" &&
      //   response?.ErrorCodeList?.[0]?.ErrorCode !== ""
      // ) {
      //   throw new Error("Validation errors found in response.");
      // }

      return response;
    } catch (error) {
      throw error;
    }
  };

  return { handleSaveOrSubmit };
};
