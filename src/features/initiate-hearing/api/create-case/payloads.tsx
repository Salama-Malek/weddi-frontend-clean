import { extractValue } from "@/shared/lib/api/utils";
import { formatDateToYYYYMMDD } from "@/shared/lib/helpers";
import type { TokenClaims } from "@/features/login/components/AuthProvider";

const nicField = (nicData: any, key: string) =>
  nicData?.[key] ?? nicData?.NICDetails?.[key];
import { log } from "console";

export type CaseAttachment = {
  FileType: string;
  AttachmentRequired: string;
  FileName: string;
  FileData: string | undefined;
  Attachmentdescription: string;
};

export type CasePayload = {
  [key: string]: string | number | boolean | string[] | CaseAttachment[] | undefined;
};

const getBasePayload = (
  userClaims: TokenClaims,
  language: string,
  userType?: string
): CasePayload => {
  const lowUserType = userType?.toLowerCase();
  return {
    CreatedBy: userClaims?.UserID,
    SourceSystem: "E-Services",
    Flow_CurrentScreen: "PlaintiffDetails",
    AcceptedLanguage: language,
    ...(lowUserType === "worker" || lowUserType === "agent"
      ? { PlaintiffId: userClaims?.UserID }
      : {})
  };
};

export const claimantDetailsPayload = (
  buttonName: "Next" | "Save",
  formData: any,
  userClaims: TokenClaims,
  isDomestic?: string,
  nicDetailObj?: any,
  attorneyData?: any,
  userType?: string,
  caseId?: string,
  language: string = "EN"
): CasePayload => {
  const lowUserType = userType?.toLowerCase();
  const isAgent = formData.claimantStatus === "representative";
  const isLegalRep = lowUserType === "legal representative";

  if (isLegalRep) {
    return {
      ...getBasePayload(userClaims, language, userType),
      Flow_ButtonName: buttonName,
      CaseID: caseId,
      Language: language,
      RepresentativeType: "Legal representative",
      PlaintiffType: "",
      ApplicantType: "",
      MainGovtDefendant: formData.MainGovtDefendant || "",
      SubGovtDefendant: formData.SubGovtDefendant || "",
      MainGovtDefendant_Code: formData.MainGovtDefendant_Code || "",
      SubGovtDefendant_Code: formData.SubGovtDefendant_Code || "",
      LegalRepName: formData.LegalRepName || "",
      LegalRepID: formData.LegalRepID || "",
      LegalRepMobileNumber: formData.LegalRepMobileNumber || "",
      LegalRepEmail: formData.LegalRepEmail || ""
    };
  }

  const payload: CasePayload = {
    ...getBasePayload(userClaims, language, userType),
    Flow_ButtonName: buttonName,
    CaseID: caseId,
    Language: language,
    PlaintiffId: isAgent ? formData.workerAgentIdNumber : userClaims?.UserID,
    PlaintiffType: isAgent ? "Agent" : "Self(Worker)",
    ApplicantType: isAgent ? "Agent" : "Worker",
    PlaintiffName: formData.userName,
    PlaintiffHijiriDOB: formData.hijriDate,
    Plaintiff_ApplicantBirthDate: formData.gregorianDate,
    Plaintiff_PhoneNumber: formData.phoneNumber,
    Plaintiff_Region: formData.region?.value,
    Plaintiff_City: formData.city?.value,
    Plaintiff_Occupation: formData.occupation?.value,
    Plaintiff_Gender: formData.gender?.value,
    Plaintiff_Nationality: formData.nationality?.value,
    Plaintiff_JobLocation: formData.region?.value,
    IsGNRequired: formData.isPhone || false,
    CountryCode: formData.phoneCode?.value || "",
    GlobalPhoneNumber: formData.interPhoneNumber || "",
    IsGNOtpVerified: formData.isVerified || false,
    DomesticWorker: formData.isDomestic ? "true" : "false",
    IDNumber: isAgent ? formData.workerAgentIdNumber : userClaims?.UserID,
  };

  if (isAgent) {
    Object.assign(payload, {
      CertifiedBy: formData.agentType === "external_agency" ? "CB2" : "CB1",
      Agent_AgentID: userClaims?.UserID,
      Agent_MandateNumber: formData.agencyNumber,
      Agent_Name: formData.agentName,
      Agent_MandateStatus: formData.agencyStatus,
      Agent_MandateSource: formData.agencySource,
      Agent_ResidencyAddress: formData.Agent_ResidencyAddress,
      Agent_CurrentPlaceOfWork: formData.Agent_CurrentPlaceOfWork,
      ...(formData.agentType === "external_agency"
        ? {
            Agent_PhoneNumber: formData.phoneNumber,
            Agent_Mobilenumber: formData.phoneNumber,
          }
        : {})
    });
  }

  return payload;
};

export const defendantDetailsPayload = (
  buttonName: "Next" | "Save",
  formData: any,
  caseId?: string,
  userClaims?: TokenClaims,
  userType?: string,
  language: string = "EN",
  nicData?: any
): CasePayload => {
  console.log("nic", nicData);
  console.log("form dataa", formData);
  const payload: CasePayload = {
    ...getBasePayload(userClaims!, language, userType),
    Flow_ButtonName: buttonName,
    CaseID: caseId,
    Flow_CurrentScreen: "DefendantDetails",
    DefendantType: formData?.DefendantType || "",
    DefendantID: formData?.nationalIdNumber || formData?.DefendantsEstablishmentPrisonerId || "",
    DefendantName: formData?.DefendantsEstablishmentPrisonerName || formData?.Defendant_Establishment_data?.EstablishmentName || "",
    Defendant_ApplicantBirthDate: nicField(nicData, 'DateOfBirthGregorian') ||
      formatDateToYYYYMMDD(formData?.def_date_gregorian),
    Defendant_HijiriDOB: nicField(nicData, 'DateOfBirthHijri') ||
      formatDateToYYYYMMDD(formData?.DefendantHijiriDOB),
    Defendant_PhoneNumber: formData?.phoneNumber || formData?.mobileNumber,
    Defendant_MobileNumber: formData?.mobileNumber,
    Defendant_Region: nicField(nicData, 'Region_Code') || formData?.Defendant_Region_Code || "",
    Defendant_City: nicField(nicData, 'City_Code') || formData?.Defendant_City_Code || "",
    Defendant_Occupation: nicField(nicData, 'Occupation_Code') || formData?.occupation?.value || "",
    Defendant_Gender: nicField(nicData, 'Gender_Code') || formData?.gender?.value || "",
    Defendant_Nationality: nicField(nicData, 'Nationality_Code') || formData?.nationality?.value || "",
    Defendant_EmailAddress: formData?.emailAddress || "",
    Defendant_MainGovtDefend: formData?.main_category_of_the_government_entity?.value,
    DefendantSubGovtDefend: formData?.subcategory_of_the_government_entity?.value,
    Defendant_EstablishmentNameDetails: formData?.Defendant_Establishment_data?.EstablishmentName,
    DefendantEstFileNumber: formData?.Defendant_Establishment_data?.FileNumber,
    Defendant_CRNumber: formData?.Defendant_Establishment_data?.CRNumber
  };

  return payload;
};


export const workDetailsPayload = (
  buttonName: "Next" | "Save",
  formData: any,
  caseId?: string,
  userClaims?: TokenClaims,
  userType?: string,
  language: string = "EN"
): CasePayload => {
  const lowUserType = userType?.toLowerCase();
  const isPlaintiff = lowUserType === "worker" || lowUserType === "agent";
  const prefix = isPlaintiff ? "Plaintiff" : "Defendant";

  return {
    ...getBasePayload(userClaims!, language, userType),
    Flow_ButtonName: buttonName,
    CaseID: caseId,
    Flow_CurrentScreen: "LastJobDetails",
    [`${prefix}_SalaryType`]: extractValue(formData?.typeOfWage?.value),
    [`${prefix}_Salary`]: extractValue(formData?.salary),
    [`${prefix}_ContractType`]: extractValue(formData?.contractType?.value),
    [`${prefix}_ContractNumber`]: extractValue(formData?.contractNumber),
    [`${prefix}_ContractStartDate`]: formatDateToYYYYMMDD(formData?.contractDateGregorian),
    [`${prefix}_ContractStartDateHijjari`]: formatDateToYYYYMMDD(formData?.contractDateHijri),
    [`${prefix}_ContractEndDate`]: formatDateToYYYYMMDD(formData?.contractExpiryDateGregorian),
    [`${prefix}_ContractEndDateHijjari`]: formatDateToYYYYMMDD(formData?.contractExpiryDateHijri),
    [`${prefix}_StillWorking`]: formData?.isStillEmployed ? "SW1" : "SW2",
    [`${prefix}_JobLocation`]: formData?.region?.value,
    [`${prefix}JobCity`]: formData?.city?.value,
    [`${prefix}_ClosestLaborOffice`]: formData?.laborOffice?.value,
    [`${prefix}_JobStartDate`]: formatDateToYYYYMMDD(formData?.dateOfFirstWorkingDayGregorian),
    [`${prefix}_JobStartDateHijjari`]: formatDateToYYYYMMDD(formData?.dateofFirstworkingdayHijri),
    [`${prefix}_JobEndDate`]: formatDateToYYYYMMDD(formData?.dateofLastworkingdayGregorian),
    [`${prefix}_JobEndDateHijjari`]: formatDateToYYYYMMDD(formData?.dateoflastworkingdayHijri),
  };
};

export const hearingTopicsPayload = (
  buttonName: "Next" | "Save",
  formData: any,
  caseId?: string,
  caseTopics?: any,
  userClaims?: TokenClaims,
  userType?: string,
  language: string = "EN"
): CasePayload => {
  return {
    ...getBasePayload(userClaims!, language, userType),
    Flow_ButtonName: buttonName,
    CaseID: caseId,
    Flow_CurrentScreen: "HearingTopics",
    HearingTopics: caseTopics || [],
  };
};

export const reviewPayload = (
  buttonName: "Next" | "Save",
  formData: any,
  caseId?: string,
  userClaims?: TokenClaims,
  userType?: string,
  language: string = "EN"
): CasePayload => {
  return {
    ...getBasePayload(userClaims!, language, userType),
    Flow_ButtonName: buttonName,
    CaseID: caseId,
    Flow_CurrentScreen: "Review",
    ReviewComments: formData?.reviewComments || "All details reviewed and confirmed.",
  };
};
