// import { TokenClaims } from "@/features/login/components/AuthProvider";
// import {
//   claimantDetailsPayload,
//   defendantDetailsPayload,
//   defendantWorkerPayload, // ✅ import
//   workDetailsPayload,
//   hearingTopicsPayload,
//   reviewPayload,
// } from "../api/create-case/payloads";
// import { useCookieState } from "./useCookieState";

// export const usePayloadService = ({
//   isDomestic,
//   userType,
//   GetCookieEstablishmentData,
//   getNicDetailObject,
//   defendantStatus,
//   defendantDetails,
// }: any) => {
//   const getPayload = (
//     currentStep: number,
//     currentTab: number,
//     buttonName: "Next" | "Save",
//     formData: any,
//     userClaims: TokenClaims,
//     userType: string,
//     language?: string,
//     getCaseId?: any,
//     getUserClaims?: any,
//     extractEstablishmentObject?: any,
//     caseTopics?: any,
//     attorneyData?: any,
//     watch?: any
//   ) => {
//     if (!formData) return null;

//     try {
//       if (currentStep === 0) {
//         switch (currentTab) {
//           case 0:
//             return claimantDetailsPayload(
//               buttonName,
//               formData,
//               userClaims,
//               isDomestic,
//               getNicDetailObject,
//               attorneyData,
//               userType,
//               getCaseId,
//               language
//             );

//           case 1: {
//             const nicDetails =
//               formData?.NICDetails ||
//               getNicDetailObject?.NICDetails ||
//               getNicDetailObject ||
//               defendantDetails?.NICDetails ||
//               formData?.defendantDetails?.NICDetails;

//             const lowerUserType = userType?.toLowerCase();
//             const isLegalOrEstablishment =
//               lowerUserType === "legal representative" ||
//               lowerUserType === "establishment";

//             if (isLegalOrEstablishment) {
//               return defendantWorkerPayload(
//                 buttonName,
//                 formData,
//                 getCaseId,
//                 language
//               );
//             }

//             return defendantDetailsPayload(
//               buttonName,
//               formData,
//               nicDetails,
//               getCaseId,
//               language
//             );
//           }

//           case 2:
//             return workDetailsPayload(
//               buttonName,
//               formData,
//               getCaseId,
//               userClaims,
//               userType,
//               language
//             );

//           default:
//             throw new Error("Invalid tab");
//         }
//       }

//       if (currentStep === 1) {
//         return hearingTopicsPayload(
//           buttonName,
//           formData,
//           getCaseId,
//           caseTopics
//         );
//       }

//       if (currentStep === 2) {
//         return {
//           CaseID: getCaseId,
//           Flow_CurrentScreen: "FinalReviewScreen",
//           Language: formData.selectedLanguage || "EN",
//           AckAggrements:
//             formData.acknowlodgement?.DataElements?.map((item: any) => ({
//               ElementKey: formData.selectedLanguage || "EN",
//               ElementValue: item.ElementValue,
//               Selected: "true",
//             })) || [],
//         };
//       }

//       throw new Error("Invalid step");
//     } catch (error) {
//       console.error("Error generating payload:", error);
//       return null;
//     }
//   };

//   return { getPayload };
// };
