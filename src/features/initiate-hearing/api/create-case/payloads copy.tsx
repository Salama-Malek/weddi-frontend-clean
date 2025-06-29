// import { extractValue } from "@/shared/lib/api/utils";
// import { formatDateToYYYYMMDD } from "@/shared/lib/helpers";
// import type { TokenClaims } from "@/features/login/components/AuthProvider";

// export type CaseAttachment = {
//   FileType: string;
//   AttachmentRequired: string;
//   FileName: string;
//   FileData: string | undefined;
//   Attachmentdescription: string;
// };

// export type CasePayload = {
//   [key: string]:
//     | string
//     | number
//     | boolean
//     | string[]
//     | CaseAttachment[]
//     | undefined;
// };

// // Base payload for all Create/Update calls
// const getBasePayload = (
//   userClaims: TokenClaims,
//   language: string,
//   userType?: string
// ): CasePayload => {
//   const basePayload: CasePayload = {
//     CreatedBy: userClaims?.UserID,
//     SourceSystem: "E-Services",
//     Flow_CurrentScreen: "PlaintiffDetails",
//     AcceptedLanguage: language,
//   };

//   // Only add PlaintiffId for Worker and Agent user types
//   const lowUserType = userType?.toLowerCase();
//   if (lowUserType === "worker" || lowUserType === "agent") {
//     basePayload.PlaintiffId = userClaims?.UserID;
//   }

//   return basePayload;
// };

// /**
//  * Build payload for the PlaintiffDetails step, including Agent flow.
//  */
// export const claimantDetailsPayload = (
//   buttonName: "Next" | "Save",
//   formData: any,
//   userClaims: TokenClaims,
//   isDomestic?: string,
//   nicDetailObj?: any,
//   attorneyData?: any,
//   userType?: string,
//   caseId?: string,
//   language: string = "EN"
// ): CasePayload => {
//   const payload: CasePayload = {
//     ...getBasePayload(userClaims, language, userType),
//     Flow_ButtonName: buttonName,
//     CaseID: caseId,
//     UserType: "Worker",
//     ApplicantType: "Worker",
//     // Language: language,
//     CreatedBy: userClaims?.UserID,
//     // SourceSystem: "E-Services",
//     Flow_CurrentScreen: "PlaintiffDetails",
//     PlaintiffId: formData.claimantStatus === "principal" ? userClaims?.UserID : formData.workerAgentIdNumber,
//     PlaintiffType: formData.claimantStatus === "principal" ? "Self(Worker)" : "Agent",
//     PlaintiffName: formData.userName,
//     PlaintiffHijiriDOB: formData.hijriDate,
//     Plaintiff_ApplicantBirthDate: formData.gregorianDate,
//     Plaintiff_PhoneNumber: formData.phoneNumber,
//     Plaintiff_Region: formData.region?.value,
//     Plaintiff_City: formData.city?.value,
//     JobPracticing: formData.occupation?.value,
//     Gender: formData.gender?.value,
//     Worker_Nationality: formData.nationality?.value,
//     Plaintiff_JobLocation: formData.region?.value,
//     IsGNRequired: formData.isPhone || false,
//     CountryCode: formData.phoneCode?.value || "",
//     GlobalPhoneNumber: formData.interPhoneNumber || "",
//     IsGNOtpVerified: formData.isVerified || false,
//     DomesticWorker: formData.isDomestic ? "true" : "false",
//     IDNumber: formData.claimantStatus === "principal" ? userClaims?.UserID : formData.workerAgentIdNumber,
//     // Initialize agent fields as empty strings
//     CertifiedBy: "",
//     Agent_AgentID: "",
//     Agent_MandateNumber: "",
//     Agent_PhoneNumber: "",
//     Agent_Name: "",
//     Agent_MandateStatus: "",
//     Agent_MandateSource: "",
//     Agent_ResidencyAddress: "",
//     Agent_CurrentPlaceOfWork: "",
//   };

//   // Add agent-specific fields if it's an agent case
//   if (formData.claimantStatus === "representative") {
//     payload.Agent_AgentID = userClaims?.UserID;
//     payload.Agent_MandateNumber = formData.agencyNumber;
//     payload.Agent_Name = formData.agentName;
//     payload.Agent_MandateStatus = formData.agencyStatus;
//     payload.Agent_MandateSource = formData.agencySource;
//     payload.Agent_ResidencyAddress = formData.Agent_ResidencyAddress;
//     payload.Agent_CurrentPlaceOfWork = formData.Agent_CurrentPlaceOfWork;
//     payload.CertifiedBy = formData.agentType === "external_agency" ? "CB2" : "CB1";

//     // Only add phone number fields for external agency (CB2)
//     if (formData.agentType === "external_agency") {
//       payload.Agent_PhoneNumber = formData.phoneNumber;
//       payload.Agent_Mobilenumber = formData.phoneNumber;
//     }
//   }

//   return payload;
// };

// export const defendantDetailsPayload = (
//   buttonName: "Next" | "Save",
//   formData: any,
//   // EstablishmentData?: any,
//   getCaseId?: any,
//   extractEstablishmentObject?: any,
//   GetCookieEstablishmentData?: any,
//   userType?: any,
//   defendantStatus?: any,
//   defendantDetails?: any,
//   userClaims?: any,
//   language: string = "EN"
// ): CasePayload => {
//   const lowUserType = userType?.toLocaleLowerCase();

//   console.log("this is deff", formData);

//   const builders: Record<string, () => CasePayload> = {
//     "legal representative": () => ({
//       ...getBasePayload(userClaims, language, userType),
//       Flow_ButtonName: buttonName,
//       CaseID: getCaseId,
//       Flow_CurrentScreen: "DefendantDetails",
//       DefendantID: extractValue(formData?.DefendantsEstablishmentPrisonerId),
//       Defendant_HijiriDOB: extractValue(
//         formatDateToYYYYMMDD(formData?.def_date_hijri)
//       ),
//       DefendantType: "",
//       DefendantName: extractValue(
//         formData?.DefendantsEstablishmentPrisonerName
//       ),
//       Defendant_PhoneNumber: extractValue(formData?.mobileNumber),
//       Defendant_Region: extractValue(formData?.region?.value),
//       Defendant_City: extractValue(formData?.city?.value),
//       Defendant_MobileNumber: extractValue(formData?.mobileNumber),
//     }),
//     establishment: () => ({
//       ...getBasePayload(userClaims, language, userType),
//       Flow_CurrentScreen: "DefendantDetails",
//       CaseID: getCaseId,
//       DefendantType: "",
//       DefendantID: extractValue(formData?.DefendantsEstablishmentPrisonerId),
//       Defendant_HijiriDOB: extractValue(
//         formatDateToYYYYMMDD(formData?.def_date_hijri)
//       ),
//       DefendantName: extractValue(
//         formData?.DefendantsEstablishmentPrisonerName
//       ),
//       Defendant_PhoneNumber: extractValue(formData?.mobileNumber),
//       Defendant_Region: extractValue(formData?.region?.value),
//       Defendant_City: extractValue(formData?.city?.value),
//       Worker_Nationality: extractValue(formData?.nationality?.value),
//       Gender: extractValue(formData?.gender?.value),
//       JobPracticing: extractValue(formData?.occupation.value),
//       Defendant_MobileNumber: extractValue(formData?.mobileNumber),
//     }),
//   };

//   const defaultBuilder = () => {
//     const isOthersDefendant = defendantDetails === "Others";
//     if (formData?.defendantStatus === "Government") {
//       return {
//         ...getBasePayload(userClaims, language, userType),
//         Flow_ButtonName: buttonName,
//         CaseID: getCaseId,
//         Flow_CurrentScreen: "DefendantDetails",
//         DefendantType: "Government",
//         Defendant_MainGovtDefend:
//           formData?.main_category_of_the_government_entity?.value,
//         DefendantSubGovtDefend:
//           formData?.subcategory_of_the_government_entity?.value,
//       };
//     }

//     if (formData.defendantDetails === "Others") {
//       return {
//         ...getBasePayload(userClaims, language, userType),
//         Flow_ButtonName: buttonName,
//         CaseID: getCaseId,
//         Flow_CurrentScreen: "DefendantDetails",
//         DefendantType: "Establishment",
//         Defendant_EstablishmentNameDetails:
//           formData?.Defendant_Establishment_data_NON_SELECTED
//             ?.EstablishmentName,
//         DefendantEstFileNumber:
//           formData?.Defendant_Establishment_data_NON_SELECTED?.FileNumber,
//         Defendant_CRNumber:
//           formData?.Defendant_Establishment_data_NON_SELECTED?.CRNumber,
//         Defendant_PhoneNumber: formData?.phoneNumber,
//         Defendant_Region: formData?.region?.value,
//         Defendant_City: formData?.city?.value,
//         Defendant_MobileNumber: formData?.phoneNumber,
//       };
//     }

//     return {
//       ...getBasePayload(userClaims, language, userType),
//       Flow_ButtonName: buttonName,
//       CaseID: getCaseId,
//       Flow_CurrentScreen: "DefendantDetails",
//       DefendantType: "Establishment",
//       Defendant_EstablishmentNameDetails:
//         formData?.Defendant_Establishment_data?.EstablishmentName ||
//         formData?.Defendant_Establishment_data_NON_SELECTED?.EstablishmentName,
//       DefendantEstFileNumber:
//         formData?.Defendant_Establishment_data?.FileNumber ||
//         formData?.Defendant_Establishment_data_NON_SELECTED?.FileNumber,
//       Defendant_CRNumber:
//         formData?.Defendant_Establishment_data?.CRNumber ||
//         formData?.Defendant_Establishment_data_NON_SELECTED?.CRNumber,
//       Defendant_Region:
//         formData?.Defendant_Establishment_data?.Region_Code || "1",
//       Defendant_City: formData?.Defendant_Establishment_data?.City_Code || "1",
//       Defendant_PhoneNumber: formData?.phoneNumber,
//       Defendant_MobileNumber: formData?.phoneNumber,
//     };
//   };

//   const builder = builders[lowUserType ?? ""] || defaultBuilder;
//   return builder();
// };

// export const workDetailsPayload = (
//   buttonName: "Next" | "Save",
//   formData: any,
//   getCaseId?: any,
//   userClaims?: any,
//   language: string = "EN",
//   userType?: string
// ): CasePayload => {
//   console.log("this is from worker", formData);
//   const lowUserType = userType?.toLocaleLowerCase();
//   const builders: Record<string, () => CasePayload> = {
//     "legal representative": () => ({
//       ...getBasePayload(userClaims, language || "EN", userType),
//       Flow_ButtonName: buttonName,
//       CaseID: getCaseId,
//       Flow_CurrentScreen: "LastJobDetails",
//       Defendant_StillWorking: formData?.isStillEmployed ? "SW1" : "SW2",
//       Defendant_SalaryType: extractValue(formData?.typeOfWage?.value),
//       Defendant_Salary: extractValue(formData?.salary),
//       Defendant_ContractType: extractValue(formData?.contractType?.value),
//       Defendant_ContractNumber: extractValue(formData?.contractNumber),
//       Defendant_ContractStartDate: extractValue(
//         formatDateToYYYYMMDD(formData?.contractDateGregorian)
//       ),
//       Defendant_ContractStartDateHijjari: extractValue(
//         formatDateToYYYYMMDD(formData?.contractDateHijri)
//       ),
//       Defendant_ContractEndDate: extractValue(
//         formatDateToYYYYMMDD(formData?.contractExpiryDateGregorian)
//       ),
//       Defendant_ContractEndDateHijjari: extractValue(
//         formatDateToYYYYMMDD(formData?.contractExpiryDateHijri)
//       ),
//       Defendant_JobLocation: extractValue(formData?.region?.value),
//       DefendantJobCity: extractValue(formData?.city?.value),
//       Defendant_JobStartDate: formatDateToYYYYMMDD(
//         formData?.dateOfFirstWorkingDayGregorian
//       ),
//       Defendant_JobStartDateHijjari: formatDateToYYYYMMDD(
//         formData?.dateofFirstworkingdayHijri
//       ),
//       Defendant_JobEndDate: formatDateToYYYYMMDD(
//         formData?.dateofLastworkingdayGregorian
//       ),
//       Defendant_JobEndDateHijjari: formatDateToYYYYMMDD(
//         formData?.dateoflastworkingdayHijri
//       ),
//       Defendant_ClosestLaborOffice: formData?.laborOffice?.value,
//     }),
//     establishment: () => ({
//       ...getBasePayload(userClaims, language || "EN", userType),
//       DefendantType: "Worker",
//       Flow_ButtonName: buttonName,
//       Flow_CurrentScreen: "LastJobDetails",
//       CaseID: getCaseId,
//       Defendant_SalaryType: extractValue(formData?.typeOfWage?.value),
//       Defendant_Salary: extractValue(formData?.salary),
//       Defendant_ContractType: extractValue(formData?.contractType?.value),
//       Defendant_ContractNumber: extractValue(formData?.contractNumber),
//       Defendant_ContractStartDate: extractValue(
//         formatDateToYYYYMMDD(formData?.contractDateGregorian)
//       ),
//       Defendant_ContractStartDateHijjari: extractValue(
//         formatDateToYYYYMMDD(formData?.contractDateHijri)
//       ),
//       Defendant_ContractEndDate: extractValue(
//         formatDateToYYYYMMDD(formData?.contractExpiryDateGregorian)
//       ),
//       Defendant_ContractEndDateHijjari: extractValue(
//         formatDateToYYYYMMDD(formData?.contractExpiryDateHijri)
//       ),
//       Defendant_JobStartDate: formatDateToYYYYMMDD(
//         formData?.dateOfFirstWorkingDayGregorian
//       ),
//       Defendant_JobStartDateHijjari: formatDateToYYYYMMDD(
//         formData?.dateofFirstworkingdayHijri
//       ),
//       Defendant_JobEndDate: formatDateToYYYYMMDD(
//         formData?.dateofLastworkingdayGregorian
//       ),
//       Defendant_JobEndDateHijjari: formatDateToYYYYMMDD(
//         formData?.dateoflastworkingdayHijri
//       ),
//       Defendant_ClosestLaborOffice: formData?.laborOffice?.value,
//       Defendant_JobLocation: extractValue(formData?.region?.value),
//       DefendantJobCity: extractValue(formData?.city?.value),
//       Defendant_StillWorking: formData?.isStillEmployed ? "SW1" : "SW2",
//     }),
//   };

//   const defaultBuilder = () => {
//     if (lowUserType === "establishment") {
//       return {
//         ...getBasePayload(userClaims, language, userType),
//         Flow_ButtonName: buttonName,
//         CaseID: getCaseId,
//         Flow_CurrentScreen: "LastJobDetails",
//         Defendant_SalaryType: extractValue(formData?.typeOfWage?.value),
//         Defendant_Salary: extractValue(formData?.salary),
//         Defendant_ContractType: extractValue(formData?.contractType?.value),
//         Defendant_ContractNumber: extractValue(formData?.contractNumber),
//         Defendant_StillWorking: formData?.isStillEmployed ? "SW1" : "SW2",
//         Defendant_JobLocation: extractValue(formData?.region?.value),
//         DefendantJobCity: extractValue(formData?.city?.value),
//         Defendant_ClosestLaborOffice: formData?.laborOffice?.value,
//         Defendant_ContractStartDate: extractValue(
//           formatDateToYYYYMMDD(formData?.contractDateGregorian)
//         ),
//         Defendant_ContractStartDateHijjari: extractValue(
//           formatDateToYYYYMMDD(formData?.contractDateHijri)
//         ),
//         Defendant_ContractEndDate: extractValue(
//           formatDateToYYYYMMDD(formData?.contractExpiryDateGregorian)
//         ),
//         Defendant_ContractEndDateHijjari: extractValue(
//           formatDateToYYYYMMDD(formData?.contractExpiryDateHijri)
//         ),
//         Defendant_JobStartDate: formatDateToYYYYMMDD(
//           formData?.dateOfFirstWorkingDayGregorian
//         ),
//         Defendant_JobStartDateHijjari: formatDateToYYYYMMDD(
//           formData?.dateofFirstworkingdayHijri
//         ),
//         Defendant_JobEndDate: formatDateToYYYYMMDD(
//           formData?.dateofLastworkingdayGregorian
//         ),
//         Defendant_JobEndDateHijjari: formatDateToYYYYMMDD(
//           formData?.dateoflastworkingdayHijri
//         ),
//       };
//     }

//     return {
//       ...getBasePayload(userClaims, language, userType),
//       Flow_ButtonName: buttonName,
//       CaseID: getCaseId,
//       Flow_CurrentScreen: "LastJobDetails",
//       Plaintiff_SalaryType: formData?.typeOfWage?.value,
//       Plaintiff_Salary: formData?.salary,
//       Plaintiff_ContractType: formData?.contractType?.value,
//       Plaintiff_ContractNumber: formData?.contractNumber,
//       Plaintiff_ContractStartDate: formatDateToYYYYMMDD(
//         formData?.contractDateGregorian
//       ),
//       Plaintiff_ContractStartDateHijjari: formatDateToYYYYMMDD(
//         formData?.contractDateHijri
//       ),
//       Plaintiff_ContractEndDate: formatDateToYYYYMMDD(
//         formData?.contractExpiryDateGregorian
//       ),
//       Plaintiff_ContractEndDateHijjari: formatDateToYYYYMMDD(
//         formData?.contractExpiryDateHijri
//       ),
//       Plaintiff_StillWorking: formData?.isStillEmployed ? "SW1" : "SW2",
//       Plaintiff_JobLocation: formData?.region?.value,
//       PlaintiffJobCity: formData?.city?.value,
//       Plaintiff_ClosestLaborOffice: formData?.laborOffice?.value,
//       Plaintiff_JobStartDate: formatDateToYYYYMMDD(
//         formData?.dateOfFirstWorkingDayGregorian
//       ),
//       Plaintiff_JobStartDateHijjari: formatDateToYYYYMMDD(
//         formData?.dateofFirstworkingdayHijri
//       ),
//       Plaintiff_JobEndDate: formatDateToYYYYMMDD(
//         formData?.dateofLastworkingdayGregorian
//       ),
//       Plaintiff_JobEndDateHijjari: formatDateToYYYYMMDD(
//         formData?.dateoflastworkingdayHijri
//       ),
//     };
//   };

//   const builder = builders[lowUserType ?? ""] || defaultBuilder;
//   return builder();
// };

// export const hearingTopicsPayload = (
//   buttonName: "Next" | "Save",
//   formData: any,
//   getCaseId?: any,
//   caseTopics?: any,
//   userClaims?: any,
//   language: string = "EN",
//   userType?: string
// ): CasePayload => ({
//   ...getBasePayload(userClaims, language, userType),
//   Flow_ButtonName: buttonName,
//   CaseID: getCaseId,
//   Flow_CurrentScreen: "HearingTopics",
//   HearingTopics: caseTopics,
// });

// export const reviewPayload = (
//   buttonName: "Next" | "Save",
//   formData: any,
//   getCaseId?: any,
//   userClaims?: any,
//   language: string = "EN",
//   userType?: string
// ): CasePayload => ({
//   ...getBasePayload(userClaims, language, userType),
//   Flow_ButtonName: buttonName,
//   CaseID: getCaseId,
//   Flow_CurrentScreen: "Review",
//   ReviewComments:
//     formData?.reviewComments || "All details reviewed and confirmed.",
// });
