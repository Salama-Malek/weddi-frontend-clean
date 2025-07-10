import { extractValue } from "@/shared/lib/api/utils";
import { formatDateToYYYYMMDD } from "@/shared/lib/helpers";
import type { TokenClaims } from "@/features/login/components/AuthProvider";

export type CaseAttachment = {
  FileType: string;
  AttachmentRequired: string;
  FileName: string;
  FileData: string | undefined;
  Attachmentdescription: string;
};

export type CasePayload = {
  [key: string]:
  | string
  | number
  | boolean
  | string[]
  | CaseAttachment[]
  | undefined;
};

// Base payload for all Create/Update calls
const getBasePayload = (
  userClaims: TokenClaims,
  language: string,
  userType?: string
): CasePayload => {
  const basePayload: CasePayload = {
    CreatedBy: userClaims?.UserID,
    SourceSystem: "E-Services",
    Flow_CurrentScreen: "PlaintiffDetails",
    AcceptedLanguage: language,
  };

  const lowUserType = userType?.toLowerCase();
  if (
    lowUserType === "worker" ||
    lowUserType === "agent" ||
    lowUserType === "embassy user"
  ) {
    basePayload.PlaintiffId = userClaims?.UserID;
  }

  return basePayload;
};

/**
 * Build payload for the PlaintiffDetails step, including Agent flow.
 */
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
  // Log formData for debugging
  let payload: CasePayload = {
    ...getBasePayload(userClaims, language, userType),
    Flow_ButtonName: buttonName,
    CaseID: caseId,
  };




  // Set DomesticWorker based on NIC details
  payload.DomesticWorker = nicDetailObj?.Applicant_Code === "DW1" ? "true" : "false";

  // Always use NIC details if available, otherwise fall back to form data
  payload.PlaintiffName = nicDetailObj?.PlaintiffName || formData?.userName || userClaims?.UserName;
  payload.PlaintiffHijiriDOB = formData?.hijriDate || nicDetailObj?.DateOfBirthHijri || userClaims?.UserDOB || "";
  payload.Plaintiff_ApplicantBirthDate = formData?.gregorianDate || nicDetailObj?.DateOfBirthGregorian;
  payload.Plaintiff_PhoneNumber = formData?.phoneNumber || "";

  // For dropdown fields, use the value property if it exists
  payload.Plaintiff_Region = formData?.plaintiffRegion?.value
    || nicDetailObj?.Region_Code
    || formData?.region?.value
    || formData?.plaintiffRegion
    || formData?.region
    || "";
  payload.Plaintiff_City = formData?.plaintiffCity?.value
    || nicDetailObj?.City_Code
    || formData?.city?.value
    || formData?.plaintiffCity
    || formData?.city
    || "";
  payload.JobPracticing = formData?.occupation?.value
    || nicDetailObj?.Occupation_Code
    || formData?.occupation
    || "";
  payload.Gender = formData?.gender?.value
    || nicDetailObj?.Gender_Code
    || formData?.gender
    || "";
  payload.Worker_Nationality = formData?.nationality?.value
    || nicDetailObj?.Nationality_Code
    || formData?.nationality
    || "";
  // payload.Plaintiff_JobLocation = nicDetailObj?.Region_Code
  //   || formData?.region?.value
  //   || formData?.region
  //   || "";
  // payload.Plaintiff_ClosestLaborOffice = formData?.laborOffice?.value || formData?.laborOffice;

  // Ensure city is not null
  if (!payload.Plaintiff_City) {
    payload.Plaintiff_City = nicDetailObj?.City_Code || formData?.city?.value || "";
  }

  const claimantStatus = formData?.claimantStatus;
  const isAgent = claimantStatus === "representative";

  payload.ApplicantType = "Worker";
  payload.PlaintiffType = isAgent ? "Agent" : "Self(Worker)";

  if (isAgent) {
    payload = {
      ...payload,
      ...AgentClaimantPayload(
        buttonName,
        formData,
        caseId,
        userClaims,
        language,
        userType,
        nicDetailObj,
        attorneyData)
    }
  }


  switch (userType?.toLowerCase()) {
    case "legal representative":
      return {
        ...getBasePayload(userClaims, language, userType),
        RepresentativeType: "Legal representative",
        MainGovtDefendant: formData?.MainGovtDefendant,
        SubGovtDefendant: formData?.SubGovtDefendant,
        MainGovtDefendant_Code: formData?.MainGovtDefendant_Code,
        SubGovtDefendant_Code: formData?.SubGovtDefendant_Code,
        LegalRepName:
          formData?.LegalRepName || userClaims?.UserName,
        LegalRepID:
          formData?.LegalRepID || userClaims?.UserID,
        LegalRepMobileNumber:
          formData?.LegalRepMobileNumber || "",
        LegalRepEmail: formData?.LegalRepEmail || "",
        Flow_CurrentScreen: "PlaintiffDetails",
        CaseID: caseId,
      };

    case "establishment":

      console.log("this is payload from establishments", formData);

      return {
        ...getBasePayload(userClaims, language, userType),
        ApplicantType: "Establishment",
        PlaintiffType: "",
        EstId: extractValue(
          formData?.PlaintiffsEstablishmentID
        ),
        Plaintiff_CRNumber: extractValue(
          formData?.PlaintiffsCRNumber
        ),
        PlaintiffEstFileNumber: extractValue(
          formData?.PlaintiffsFileNumber
        ),
        EstablishmentFullName: extractValue(
          formData?.PlaintiffsEstablishmentName
        ),
        Activity: formData?.Activity || "",
        EstablishmentName: extractValue(
          formData?.PlaintiffsEstablishmentName
        ),
        Plaintiff_PhoneNumber:
          extractValue(formData?.Plaintiff_PhoneNumber) ||
          extractValue(formData?.phoneNumber),
        Plaintiff_Region: extractValue(
          formData?.region?.value
        ),
        Plaintiff_City: extractValue(
          formData?.PlaintiffsCity?.value
        ),
        //hassan code 700
        Plaintiff_Number700: extractValue(
          formData?.PlaintiffsNumber700
        ),
        //hassan code 700
        EstablishmentType: "Establishment",
        CaseID: caseId,
      };

    case "embassy user":
      return emabsyClaimantPayload(
        buttonName,
        formData,
        caseId,
        userClaims,
        language,
        userType,
        nicDetailObj
      );

    default:
      return payload;
  }
};



const AgentClaimantPayload = (
  buttonName: "Next" | "Save",
  formData: any,
  getCaseId?: any,
  userClaims?: any,
  language: string = "EN",
  userType?: string,
  nicDetailObj?: any,
  attorneyData?: any
): CasePayload => {



  return {
    Agent_AgentID:
      userClaims?.UserID || attorneyData?.agentId,
    CertifiedBy:
      formData?.agentType === "local_agency"
        ? "CB1"
        : formData?.agentType === "external_agency"
          ? "CB2"
          : "",
    Agent_Name:
      formData?.agentName || attorneyData?.agentName || "",
    Agent_MandateNumber:
      formData?.agentType === "local_agency"
        ? formData?.agencyNumber || attorneyData?.mandateNumber || ""
        : formData?.externalAgencyNumber || "",
    ...(formData?.agentType === "external_agency" &&
      { Agent_PhoneNumber: formData?.agentPhoneNumber }

    ),
    Agent_MandateStatus:
      formData?.agencyStatus || attorneyData?.mandateStatus ||
      "",
    Agent_MandateSource:
      formData?.agencySource || attorneyData?.mandateSource ||
      "",
    Agent_ResidencyAddress: formData?.Agent_ResidencyAddress || "",
    Agent_CurrentPlaceOfWork:
      formData?.Agent_CurrentPlaceOfWork || "",
    // Agent_Mobilenumber: formData?.phoneNumber,
    PlaintiffId: formData?.workerAgentIdNumber || "",
    PlaintiffName: formData?.userName || "",


  }
}






/**
 * When claimant is Legal Rep or Establishment, defendant must be a Worker
 */
export const defendantWorkerPayload = (
  buttonName: "Next" | "Save",
  formData: any,
  caseId?: string,
  language: string = "EN",
  nicDetailObj?: any
): CasePayload => {
  // console.log("this is from worker def", formData);

  const payload: CasePayload = {
    DefendantType: "",
    IDNumber: formData?.idNumber || "",
    CaseID: caseId,
    DefendantID: formData?.DefendantsEstablishmentPrisonerId || formData?.nationalIdNumber || "",
    DefendantName: formData?.DefendantsEstablishmentPrisonerName || "",
    Defendant_ApplicantBirthDate:
      formatDateToYYYYMMDD(formData?.def_date_gregorian) || "",
    Defendant_HijiriDOB: formatDateToYYYYMMDD(formData?.def_date_hijri) || "",
    Defendant_PhoneNumber: formData?.mobileNumber || formData?.phoneNumber || "",
    Defendant_Region: formData?.DefendantsEstablishmentRegion || formData?.region?.value || "",
    Defendant_City: formData?.DefendantsEstablishmentCity || formData?.city?.value || "",
    Defendant_Occupation: formData?.DefendantsEstablishOccupation?.value || formData?.occupation?.value || "",
    Defendant_Gender: formData?.DefendantsEstablishmentGender || formData?.gender?.value || "",
    Defendant_Nationality: formData?.DefendantsEstablishmentNationality || formData?.nationality?.value || "",
    Flow_CurrentScreen: "DefendantDetails",
    Flow_ButtonName: buttonName,

    AcceptedLanguage: language,
    JobPracticing: formData?.DefendantsEstablishOccupation?.value || formData?.occupation?.value || "",
    Gender: formData?.DefendantsEstablishmentGender || formData?.gender?.value || "",
    Worker_Nationality: formData?.DefendantsEstablishmentNationality || formData?.nationality?.value || "",
    Defendant_MobileNumber: formData?.mobileNumber || formData?.phoneNumber || "",

  };

  // Set DomesticWorker based on NIC details
  payload.DomesticWorker = nicDetailObj?.Applicant_Code === "DW1" ? "true" : "false";

  return payload;
};

/**
 * Original Government/Establishment/Other logic
 */
export const defendantDetailsPayload = (
  buttonName: "Next" | "Save",
  formData: any,
  nicData: any,
  caseId?: string,
  extractEstablishmentObject?: any,
  GetCookieEstablishmentData?: any,
  userType?: any,
  defendantStatus?: any,
  defendantDetails?: any,
  userClaims?: any,
  language: string = "EN"
): CasePayload => {
  const lowUserType = userType?.toLowerCase();
  // console.log("defendantDetailsPayload: lowUserType", lowUserType);
  // console.log("defendantDetailsPayload: formData", formData);
  // console.log("defendantDetailsPayload: defendantRegion", formData?.defendantRegion);
  // console.log("defendantDetailsPayload: defendantCity", formData?.defendantCity);
  // console.log("defendantDetailsPayload: region", formData?.region);
  // console.log("defendantDetailsPayload: city", formData?.city);

  switch (lowUserType) {
    case "legal representative":
      return {
        ...getBasePayload(userClaims, language, userType),
        Flow_ButtonName: buttonName,
        CaseID: caseId,
        Flow_CurrentScreen: "DefendantDetails",
        DefendantID: extractValue(
          formData?.DefendantsEstablishmentPrisonerId
        ),
        Defendant_HijiriDOB: extractValue(
          formatDateToYYYYMMDD(formData?.def_date_hijri)
        ),
        DefendantType: "",
        DefendantName: extractValue(
          formData?.DefendantsEstablishmentPrisonerName
        ),
        Defendant_PhoneNumber: extractValue(
          formData?.mobileNumber
        ),
        Defendant_Region: extractValue(
          formData?.defendantRegion?.value || formData?.region?.value
        ),
        Defendant_City: extractValue(
          formData?.defendantCity?.value || formData?.city?.value
        ),
        Defendant_MobileNumber: extractValue(
          formData?.mobileNumber
        ),
      };

    case "establishment":
      return {
        ...getBasePayload(userClaims, language, userType),
        Flow_CurrentScreen: "DefendantDetails",
        CaseID: caseId,
        DefendantType: "",
        DefendantID: extractValue(
          formData?.DefendantsEstablishmentPrisonerId
        ),
        Defendant_HijiriDOB: extractValue(
          formatDateToYYYYMMDD(formData?.def_date_hijri)
        ),
        DefendantName: extractValue(
          formData?.DefendantsEstablishmentPrisonerName
        ),
        Defendant_PhoneNumber: extractValue(
          formData?.mobileNumber
        ),
        Defendant_Region: extractValue(
          formData?.defendantRegion?.value || formData?.region?.value
        ),
        Defendant_City: extractValue(
          formData?.defendantCity?.value || formData?.city?.value
        ),
        Worker_Nationality: extractValue(
          formData?.nationality?.value
        ),
        Gender: extractValue(formData?.gender?.value),
        JobPracticing: extractValue(
          formData?.occupation.value
        ),
        Defendant_MobileNumber: extractValue(
          formData?.mobileNumber
        ),
      };

    default:
      // Government
      if (formData?.defendantStatus === "Government") {
        // console.log("defendantDetailsPayload: Generating Government payload");
        return {
          ...getBasePayload(userClaims, language, userType),
          Flow_ButtonName: buttonName,
          CaseID: caseId,
          Flow_CurrentScreen: "DefendantDetails",
          DefendantType: "Government",
          Defendant_MainGovtDefend:
            formData?.main_category_of_the_government_entity
              ?.value,
          DefendantSubGovtDefend:
            formData?.subcategory_of_the_government_entity
              ?.value,
        };
      }
      // Establishment Others
      if (formData.defendantDetails === "Others") {
        // console.log("defendantDetailsPayload: Generating Establishment Others payload");
        const payload = {
          ...getBasePayload(userClaims, language, userType),
          Flow_ButtonName: buttonName,
          CaseID: caseId,
          Flow_CurrentScreen: "DefendantDetails",
          DefendantType: "Establishment",
          Defendant_EstablishmentNameDetails:
            formData?.Defendant_Establishment_data_NON_SELECTED
              ?.EstablishmentName,
          DefendantEstFileNumber:
            formData?.Defendant_Establishment_data_NON_SELECTED
              ?.FileNumber,
          Defendant_CRNumber:
            formData?.Defendant_Establishment_data_NON_SELECTED
              ?.CRNumber,
          //hassan code 700
          Defendant_Number700: formData?.Defendant_Establishment_data_NON_SELECTED?.Number700,
          Defendant_PhoneNumber: formData?.phoneNumber,
          Defendant_Region: formData?.defendantRegion?.value || formData?.region?.value || "",
          Defendant_City: formData?.defendantCity?.value || formData?.city?.value,
          Defendant_MobileNumber: formData?.phoneNumber,
        };
        // console.log("defendantDetailsPayload: Establishment Others payload", payload);
        return payload;
      }
      // Establishment Worked
      // console.log("defendantDetailsPayload: Generating Establishment Worked payload");
      const payload = {
        ...getBasePayload(userClaims, language, userType),
        Flow_ButtonName: buttonName,
        CaseID: caseId,
        Flow_CurrentScreen: "DefendantDetails",
        DefendantType: "Establishment",
        Defendant_EstablishmentNameDetails:
          formData?.Defendant_Establishment_data
            ?.EstablishmentName ||
          formData?.Defendant_Establishment_data_NON_SELECTED
            ?.EstablishmentName,
        DefendantEstFileNumber:
          formData?.Defendant_Establishment_data
            ?.FileNumber ||
          formData?.Defendant_Establishment_data_NON_SELECTED
            ?.FileNumber,
        Defendant_CRNumber:
          formData?.Defendant_Establishment_data
            ?.CRNumber ||
          formData?.Defendant_Establishment_data_NON_SELECTED
            ?.CRNumber,
        //hassan code 700
        Defendant_Number700: formData?.Defendant_Establishment_data
          ?.Number700,
        Defendant_Region: formData?.Defendant_Establishment_data
          ?.Region_Code || formData?.defendantRegion?.value || formData?.region?.value || "",
        Defendant_City:
          formData?.Defendant_Establishment_data
            ?.City_Code || formData?.defendantCity?.value || formData?.city?.value || "1",
        Defendant_PhoneNumber: formData?.phoneNumber,
        Defendant_MobileNumber: formData?.phoneNumber,
      };
      // console.log("defendantDetailsPayload: Establishment Worked payload", payload);
      return payload;
  }
};

export const workDetailsPayload = (

  buttonName: "Next" | "Save",
  formData: any,
  caseId?: string,
  userClaims?: any,
  userType?: string,
  language: string = "EN",
): CasePayload => {
  const lowUserType = userType?.toLowerCase();
  // console.log("formData form worker details  ", formData);

  switch (lowUserType) {
    case "legal representative":
      return {
        ...getBasePayload(userClaims, language, userType),
        Flow_ButtonName: buttonName,
        CaseID: caseId,
        Flow_CurrentScreen: "LastJobDetails",
        Defendant_StillWorking: formData?.isStillEmployed
          ? "SW1"
          : "SW2",
        Defendant_SalaryType: extractValue(
          formData?.typeOfWage?.value
        ),
        Defendant_Salary: extractValue(formData?.salary),
        Defendant_ContractType: extractValue(
          formData?.contractType?.value
        ),
        Defendant_ContractNumber: extractValue(
          formData?.contractNumber
        ),
        Defendant_ContractStartDate: extractValue(
          formatDateToYYYYMMDD(
            formData?.contractDateGregorian
          )
        ),
        Defendant_ContractStartDateHijjari: extractValue(
          formatDateToYYYYMMDD(
            formData?.contractDateHijri
          )
        ),
        Defendant_ContractEndDate: extractValue(
          formatDateToYYYYMMDD(
            formData?.contractExpiryDateGregorian
          )
        ),
        Defendant_ContractEndDateHijjari: extractValue(
          formatDateToYYYYMMDD(
            formData?.contractExpiryDateHijri
          )
        ),
        Defendant_JobLocation: extractValue(
          formData?.region?.value
        ),
        DefendantJobCity: extractValue(
          formData?.city?.value
        ),
        Defendant_JobStartDate: formatDateToYYYYMMDD(
          formData?.dateOfFirstWorkingDayGregorian
        ),
        Defendant_JobStartDateHijjari: formatDateToYYYYMMDD(
          formData?.dateofFirstworkingdayHijri
        ),
        Defendant_JobEndDate: formatDateToYYYYMMDD(
          formData?.dateOfLastWorkingDayGregorian
        ),
        Defendant_JobEndDateHijjari: formatDateToYYYYMMDD(
          formData?.dateoflastworkingdayHijri
        ),
        Defendant_ClosestLaborOffice:
          formData?.laborOffice?.value,
      };

    case "establishment":
      return {
        ...getBasePayload(userClaims, language, userType),
        DefendantType: "Worker",
        Flow_ButtonName: buttonName,
        CaseID: caseId,
        Flow_CurrentScreen: "LastJobDetails",
        Defendant_SalaryType: extractValue(
          formData?.typeOfWage?.value
        ),
        Defendant_Salary: extractValue(formData?.salary),
        Defendant_ContractType: extractValue(
          formData?.contractType?.value
        ),
        Defendant_ContractNumber: extractValue(
          formData?.contractNumber
        ),
        Defendant_ContractStartDate: extractValue(
          formatDateToYYYYMMDD(
            formData?.contractDateGregorian
          )
        ),
        Defendant_ContractStartDateHijjari: extractValue(
          formatDateToYYYYMMDD(
            formData?.contractDateHijri
          )
        ),
        Defendant_ContractEndDate: extractValue(
          formatDateToYYYYMMDD(
            formData?.contractExpiryDateGregorian
          )
        ),
        Defendant_ContractEndDateHijjari: extractValue(
          formatDateToYYYYMMDD(
            formData?.contractExpiryDateHijri
          )
        ),
        Defendant_JobStartDate: formatDateToYYYYMMDD(
          formData?.dateOfFirstWorkingDayGregorian
        ),
        Defendant_JobStartDateHijjari: formatDateToYYYYMMDD(
          formData?.dateofFirstworkingdayHijri
        ),
        Defendant_JobEndDate: formatDateToYYYYMMDD(
          formData?.dateOfLastWorkingDayGregorian
        ),
        Defendant_JobEndDateHijjari: formatDateToYYYYMMDD(
          formData?.dateoflastworkingdayHijri
        ),
        Defendant_ClosestLaborOffice:
          formData?.laborOffice?.value,
        Defendant_JobLocation: extractValue(
          formData?.region?.value
        ),
        DefendantJobCity: extractValue(
          formData?.city?.value
        ),
        Defendant_StillWorking: formData?.isStillEmployed
          ? "SW1"
          : "SW2",
      };

    default:
      // default same as legal case
      return {
        ...getBasePayload(userClaims, language, userType),
        Flow_ButtonName: buttonName,
        CaseID: caseId,
        Flow_CurrentScreen: "LastJobDetails",
        Plaintiff_SalaryType: extractValue(
          formData?.typeOfWage?.value
        ),
        Plaintiff_Salary: formData?.salary,
        Plaintiff_ContractType: formData?.contractType?.value,
        Plaintiff_ContractNumber: formData?.contractNumber,
        Plaintiff_ContractStartDate: formatDateToYYYYMMDD(
          formData?.contractDateGregorian
        ),
        Plaintiff_ContractStartDateHijjari: formatDateToYYYYMMDD(
          formData?.contractDateHijri
        ),
        Plaintiff_ContractEndDate: formatDateToYYYYMMDD(
          formData?.contractExpiryDateGregorian
        ),
        Plaintiff_ContractEndDateHijjari: formatDateToYYYYMMDD(
          formData?.contractExpiryDateHijri
        ),
        Plaintiff_StillWorking: formData?.isStillEmployed
          ? "SW1"
          : "SW2",
        Plaintiff_JobLocation: formData?.region?.value,
        PlaintiffJobCity: formData?.city?.value,
        Plaintiff_ClosestLaborOffice:
          formData?.laborOffice?.value,
        Plaintiff_JobStartDate: formatDateToYYYYMMDD(
          formData?.dateOfFirstWorkingDayGregorian
        ),
        Plaintiff_JobStartDateHijjari: formatDateToYYYYMMDD(
          formData?.dateofFirstworkingdayHijri
        ),
        Plaintiff_JobEndDate: formatDateToYYYYMMDD(
          formData?.dateOfLastWorkingDayGregorian
        ),
        Plaintiff_JobEndDateHijjari: formatDateToYYYYMMDD(
          formData?.dateoflastworkingdayHijri
        ),
      };
  }
};

export const hearingTopicsPayload = (
  buttonName: "Next" | "Save",
  formData: any,
  caseId?: string,
  caseTopics?: any,
  userClaims?: any,
  language: string = "EN",
  userType?: string
): CasePayload => ({
  ...getBasePayload(userClaims, language, userType),
  Flow_ButtonName: buttonName,
  CaseID: caseId,
  Flow_CurrentScreen: "HearingTopics",
  HearingTopics: caseTopics,
});

export const reviewPayload = (
  buttonName: "Next" | "Save",
  formData: any,
  caseId?: string,
  userClaims?: any,
  language: string = "EN",
  userType?: string
): CasePayload => ({
  ...getBasePayload(userClaims, language, userType),
  Flow_ButtonName: buttonName,
  CaseID: caseId,
  Flow_CurrentScreen: "Review",
  ReviewComments:
    formData?.reviewComments || "All details reviewed and confirmed.",
});

// hassan add this payload
const emabsyClaimantPayload = (
  buttonName: "Next" | "Save",
  formData: any,
  getCaseId?: any,
  userClaims?: any,
  language: string = "EN",
  userType?: string,
  nicDetailObj?: any
): CasePayload => {
  if (formData?.claimantStatus === "principal") {
    return {
      ...getBasePayload(userClaims, language, userType),
      Flow_ButtonName: buttonName,
      CaseID: getCaseId,
      UserType: "Embassy User",
      ApplicantType: "Worker",
      PlaintiffType: "Self(Worker)",
      PlaintiffId: userClaims?.UserID || "",
      PlaintiffName: formData?.userName || "",
      PlaintiffHijiriDOB: formatDateToYYYYMMDD(
        formData?.hijriDate
      ),
      Plaintiff_ApplicantBirthDate: formatDateToYYYYMMDD(
        formData?.gregorianDate
      ),
      Plaintiff_PhoneNumber: formData?.phoneNumber || "",
      Plaintiff_Region: formData?.region?.value || "",
      Plaintiff_City: formData?.city?.value || "",
      JobPracticing: formData?.occupation?.value || "",
      Gender: formData?.gender?.value || "",
      Worker_Nationality:
        formData?.nationality?.value || "",
      IsGNRequired: formData?.isPhone || false,
      CountryCode: formData?.phoneCode?.value || "",
      GlobalPhoneNumber: formData?.interPhoneNumber || "",
      IsGNOtpVerified: formData?.isVerified || false,
      DomesticWorker: nicDetailObj?.Applicant_Code === "DW1" ? "true" : "false",
    };
  }

  // Embassy agent/representative
  return {
    ...getBasePayload(userClaims, language, userType),
    Flow_ButtonName: buttonName,
    CaseID: getCaseId,
    UserType: "Embassy User",
    ApplicantType: "Worker",
    PlaintiffType: "Agent",
    Agent_EmbassyName: formData?.embassyAgent_Agent_EmbassyName || "",
    Agent_EmbassyNationality: formData?.embassyAgent_Agent_EmbassyNationality || "",
    Agent_EmbassyPhone: formData?.embassyAgent_Agent_EmbassyPhone || "",
    Agent_EmbassyEmailAddress: formData?.embassyAgent_Agent_EmbassyEmailAddress || "",
    Agent_EmbassyFirstLanguage: formData?.embassyAgent_Agent_EmbassyFirstLanguage || "",
    PlaintiffId: formData?.embassyAgent_workerAgentIdNumber || "",
    PlaintiffName: formData?.embassyAgent_userName || "",
    PlaintiffHijiriDOB: formatDateToYYYYMMDD(
      formData?.embassyAgent_workerAgentDateOfBirthHijri
    ),
    Plaintiff_ApplicantBirthDate: formatDateToYYYYMMDD(
      formData?.embassyAgent_gregorianDate
    ),
    Plaintiff_PhoneNumber: formData?.embassyAgent_phoneNumber || "",
    Plaintiff_Region: formData?.embassyAgent_region?.value || formData?.embassyAgent_region || "",
    Plaintiff_City: formData?.embassyAgent_city?.value || formData?.embassyAgent_city || "",
    JobPracticing: formData?.embassyAgent_occupation?.value || formData?.embassyAgent_occupation || "",
    Gender: formData?.embassyAgent_gender?.value || formData?.embassyAgent_gender || "",
    Worker_Nationality: formData?.embassyAgent_nationality?.value || formData?.embassyAgent_nationality || "",
    IsGNRequired: formData?.isPhone || false,
    CountryCode: formData?.phoneCode?.value || "",
    GlobalPhoneNumber: formData?.interPhoneNumber || "",
    IsGNOtpVerified: formData?.isVerified || false,
    DomesticWorker: nicDetailObj?.Applicant_Code === "DW1" ? "true" : "false",
  };
};
