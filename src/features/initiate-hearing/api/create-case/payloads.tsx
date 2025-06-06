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

  // Only add PlaintiffId for Worker and Agent user types
  const lowUserType = userType?.toLowerCase();
  if (lowUserType === 'worker' || lowUserType === 'agent') {
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
  const payload: CasePayload = {
    ...getBasePayload(userClaims, language, userType),
    Flow_ButtonName: buttonName,
    CaseID: caseId,
  };

  payload.PlaintiffName = nicDetailObj?.PlaintiffName || userClaims?.UserName;
  payload.PlaintiffHijiriDOB =
    nicDetailObj?.DateOfBirthHijri || userClaims?.UserDOB || "";
  payload.Plaintiff_ApplicantBirthDate = nicDetailObj?.DateOfBirthGregorian || formData?.gregorianDate;
  payload.Plaintiff_PhoneNumber = formData?.phoneNumber || "";
  payload.Plaintiff_Region = nicDetailObj?.Region_Code || formData?.region?.value;
  payload.Plaintiff_City = nicDetailObj?.City_Code || formData?.city?.value;
  payload.JobPracticing = nicDetailObj?.Occupation_Code || formData?.occupation?.value;
  payload.Gender = nicDetailObj?.Gender_Code || formData?.gender?.value;
  payload.Worker_Nationality = nicDetailObj?.Nationality_Code || formData?.nationality?.value;
  payload.Plaintiff_JobLocation = nicDetailObj?.Region_Code || formData?.region?.value;
  // payload.PlaintiffJobCity = formData?.city?.value; // check again
  payload.Plaintiff_ClosestLaborOffice = formData?.laborOffice?.value;

  const applicantType = formData?.applicantType;
  const isAgent = applicantType === "Agent";

  payload.ApplicantType = "Worker";
  payload.PlaintiffType = isAgent ? "Agent" : "Self(Worker)";


  if (isAgent) {
    payload.Agent_AgentID = attorneyData?.agentId || userClaims?.UserID;
    payload.CertifiedBy =
      formData?.certifiedAgency === "localAgency"
        ? "CB1"
        : formData?.certifiedAgency === "externalAgency"
          ? "CB2"
          : "";
    payload.Agent_Name = attorneyData?.agentName || formData?.agentName;
    payload.Agent_MandateNumber = formData?.agentMandateNumber;
    payload.Agent_PhoneNumber = formData?.phoneNumber;
    payload.Agent_MandateStatus =
      attorneyData?.mandateStatus || formData?.agentMandateStatus;
    payload.Agent_MandateSource =
      attorneyData?.mandateSource || formData?.agentMandateSource;
    payload.Agent_ResidencyAddress = formData?.agentResidence || "";
    payload.Agent_CurrentPlaceOfWork = formData?.agentWorkplace || "";
    payload.Agent_Mobilenumber = formData?.phoneNumber;
  }

  const lowUserType = userType?.toLocaleLowerCase();
  console.log("old payload", payload);
  console.log("Form Data", formData);



  switch (lowUserType) {
    case "legal representative":
      console.log("jhdfjh", payload);

      return {
        ...getBasePayload(userClaims, language || "EN", userType),
        RepresentativeType: "Legal representative",
        MainGovtDefendant: formData?.MainGovtDefendant,
        SubGovtDefendant: formData?.SubGovtDefendant,
        MainGovtDefendant_Code: formData?.MainGovtDefendant_Code,
        SubGovtDefendant_Code: formData?.SubGovtDefendant_Code,
        LegalRepName: formData?.LegalRepName || userClaims?.UserName,
        LegalRepID: formData?.LegalRepID || userClaims?.UserID,
        LegalRepMobileNumber: formData?.LegalRepMobileNumber || "",
        LegalRepEmail: formData?.LegalRepEmail || "",
        Flow_CurrentScreen: "PlaintiffDetails",
        CaseID: caseId,
      };

    case "establishment":
      return {
        ...getBasePayload(userClaims, language || "EN", userType),
        ApplicantType: "Establishment",
        PlaintiffType: "",
        EstId: extractValue(formData?.PlaintiffsEstablishmentID),
        Plaintiff_CRNumber: extractValue(formData?.PlaintiffsCRNumber),
        PlaintiffEstFileNumber: extractValue(formData?.PlaintiffsFileNumber),
        EstablishmentFullName: extractValue(
          formData?.PlaintiffsEstablishmentName
        ),
        Activity: formData?.Activity || "",
        EstablishmentName: extractValue(formData?.PlaintiffsEstablishmentName),
        Plaintiff_PhoneNumber: extractValue(formData?.Plaintiff_PhoneNumber) || extractValue(formData?.phoneNumber),
        Plaintiff_Region: extractValue(formData?.region?.value),
        Plaintiff_City: extractValue(formData?.city?.value), //the value is being sent empty in create
        EstablishmentType: "Establishment",
        CaseID: caseId,
      };

    default: {
      const isAgentApplicant = formData?.claimantStatus === "agent";
      console.log("ffffffffffsadas2dasd2asd", formData);

      const payload: CasePayload = {
        ...getBasePayload(userClaims, language || "EN", userType),
        Flow_ButtonName: buttonName,
        CaseID: caseId,
        PlaintiffType: formData?.applicantType === "Agent" ? "Agent" : "Self(Worker)",
        PlaintiffName: formData?.userName || nicDetailObj?.PlaintiffName || userClaims?.UserName,
        PlaintiffHijiriDOB: formData?.hijriDate || nicDetailObj?.DateOfBirthHijri || userClaims?.UserDOB || "",
        Plaintiff_ApplicantBirthDate: nicDetailObj?.DateOfBirthGregorian || formData?.gregorianDate,
        Plaintiff_PhoneNumber: formData?.phoneNumber?.toString() || "",
        Plaintiff_Region: nicDetailObj?.Region_Code || formData?.region?.value,
        Plaintiff_City: nicDetailObj?.City_Code || formData?.city?.value,
        JobPracticing: nicDetailObj?.Occupation_Code || formData?.occupation?.value,
        Gender: nicDetailObj?.Gender_Code || formData?.gender?.value,
        Worker_Nationality: nicDetailObj?.Nationality_Code || formData?.nationality?.value,
        Plaintiff_JobLocation: nicDetailObj?.Region_Code || formData?.region?.value,
        Plaintiff_ClosestLaborOffice: formData?.laborOffice?.value,

        IsGNRequired: formData?.isPhone || false,
        CountryCode: formData?.phoneCode?.value || "",
        GlobalPhoneNumber: formData?.interPhoneNumber || "",
        IsGNOtpVerified: formData?.isVerified || false,

      };

      if (isAgentApplicant) {
        Object.assign(payload, {
          Agent_AgentID: attorneyData?.agentId,
          CertifiedBy:
            formData?.agentType === "local_agency"
              ? "CB1"
              : formData?.agentType === "external_agency"
                ? "CB2"
                : "",
          Agent_Name: attorneyData?.agentName,
          Agent_MandateNumber: formData?.agencyNumber,
          Agent_PhoneNumber: formData?.mobileNumber,
          Agent_MandateStatus: attorneyData?.mandateStatus,
          Agent_MandateSource: attorneyData?.mandateSource,
          Agent_ResidencyAddress: formData?.residenceAddress,
          Agent_CurrentPlaceOfWork: formData?.currentWorkingPlace,
          Agent_Mobilenumber: formData?.mobileNumber,
        });
      }

      if (formData?.claimantStatus === "principal") {
        payload.ApplicantType = "Worker";
        payload.PlaintiffType = "Self(Worker)";
      }

      if (isDomestic === "Domestic Worker") {
        payload.DomesticWorker = "true";
        payload.CaseAttachments = formData?.attachment
          ? [
            {
              FileType: formData?.attachment.fileType,
              AttachmentRequired: "true",
              FileName: formData?.attachment.fileName,
              FileData: formData?.base64,
              Attachmentdescription: "Unprofessional Letter",
            },
          ]
          : [];
      } else if (isDomestic !== undefined) {
        payload.DomesticWorker = "false";
      }

      console.log("this is payload", payload);
      console.log("this is form data ", formData);

      return payload;
    }
  }
};

export const defendantDetailsPayload = (
  buttonName: "Next" | "Save",
  formData: any,
  // EstablishmentData?: any,
  getCaseId?: any,
  extractEstablishmentObject?: any,
  GetCookieEstablishmentData?: any,
  userType?: any,
  defendantStatus?: any,
  defendantDetails?: any,
  userClaims?: any,
  language: string = "EN"
): CasePayload => {
  const lowUserType = userType?.toLocaleLowerCase();



  console.log("this is deff", formData);


  switch (lowUserType) {
    case "legal representative": {
      return {
        ...getBasePayload(userClaims, language, userType),
        Flow_ButtonName: buttonName,
        CaseID: getCaseId,
        Flow_CurrentScreen: "DefendantDetails",
        // DefendantType: "",
        DefendantID: extractValue(formData?.DefendantsEstablishmentPrisonerId),
        Defendant_HijiriDOB: extractValue(
          formatDateToYYYYMMDD(formData?.def_date_hijri)
        ),
        // should be pass as empity string 
        DefendantType: "",
        DefendantName: extractValue(
          formData?.DefendantsEstablishmentPrisonerName
        ),
        Defendant_PhoneNumber: extractValue(formData?.mobileNumber),
        // Defendant_Region: extractValue(formData?.DefendantsEstablishmentRegion),
        // Defendant_City: extractValue(formData?.DefendantsEstablishmentCity),
        Defendant_Region: extractValue(formData?.region?.value),
        Defendant_City: extractValue(formData?.city?.value),
        Defendant_MobileNumber: extractValue(formData?.mobileNumber),
      };
    }

    case "establishment": {
      return {
        ...getBasePayload(userClaims, language, userType),
        Flow_CurrentScreen: "DefendantDetails",
        CaseID: getCaseId,
        DefendantType: "",
        DefendantID: extractValue(formData?.DefendantsEstablishmentPrisonerId),
        Defendant_HijiriDOB: extractValue(
          formatDateToYYYYMMDD(formData?.def_date_hijri)
        ),
        DefendantName: extractValue(
          formData?.DefendantsEstablishmentPrisonerName
        ),
        Defendant_PhoneNumber: extractValue(formData?.mobileNumber),

        Defendant_Region: extractValue(formData?.region?.value),
        Defendant_City: extractValue(formData?.city?.value),
        Worker_Nationality: extractValue(formData?.nationality?.value),
        Gender: extractValue(formData?.gender?.value),
        JobPracticing: extractValue(formData?.occupation.value),

        Defendant_MobileNumber: extractValue(formData?.mobileNumber),
        /*
          Defendant_PhoneNumber: formData?.phoneNumber,
            Defendant_Region: formData?.region?.value,
            Defendant_City: formData?.city?.value,
            Defendant_MobileNumber: formData?.phoneNumber,
  
        */
      };
    }

    default: {
      const isOthersDefendant = defendantDetails === "Others";
      const isNotOthersDefendant = defendantDetails !== "Others";

      console.log("def Form Data ", formData);

      /// if def is cov *(maincat and subcat)
      if (formData?.defendantStatus === "Government") {

        return {
          ...getBasePayload(userClaims, language, userType),
          Flow_ButtonName: buttonName,
          CaseID: getCaseId,
          Flow_CurrentScreen: "DefendantDetails",
          DefendantType: "Government",
          Defendant_MainGovtDefend: formData?.main_category_of_the_government_entity?.value,
          DefendantSubGovtDefend: formData?.subcategory_of_the_government_entity?.value,
        }
      }

      /// if def is Est *(enter file number)
      if (formData.defendantDetails === "Others") {

        return {
          ...getBasePayload(userClaims, language, userType),
          Flow_ButtonName: buttonName,
          CaseID: getCaseId,
          Flow_CurrentScreen: "DefendantDetails",
          DefendantType: "Establishment",

          // for the establishment that user enter file number 
          Defendant_EstablishmentNameDetails:
            formData?.Defendant_Establishment_data_NON_SELECTED?.EstablishmentName,
          DefendantEstFileNumber: formData?.Defendant_Establishment_data_NON_SELECTED?.FileNumber,
          Defendant_CRNumber: formData?.Defendant_Establishment_data_NON_SELECTED?.CRNumber,

          Defendant_PhoneNumber: formData?.phoneNumber,
          Defendant_Region: formData?.region?.value,
          Defendant_City: formData?.city?.value,
          Defendant_MobileNumber: formData?.phoneNumber,

        }
      }
      /// if def is Est *(worked in it)
      return {
        ...getBasePayload(userClaims, language, userType),
        Flow_ButtonName: buttonName,
        CaseID: getCaseId,
        Flow_CurrentScreen: "DefendantDetails",
        DefendantType: "Establishment",

        Defendant_EstablishmentNameDetails:
          formData?.Defendant_Establishment_data?.EstablishmentName ||
          formData?.Defendant_Establishment_data_NON_SELECTED?.EstablishmentName,

        DefendantEstFileNumber:
          formData?.Defendant_Establishment_data?.FileNumber ||
          formData?.Defendant_Establishment_data_NON_SELECTED?.FileNumber,

        Defendant_CRNumber:
          formData?.Defendant_Establishment_data?.CRNumber ||
          formData?.Defendant_Establishment_data_NON_SELECTED?.CRNumber,

        Defendant_Region: formData?.Defendant_Establishment_data?.Region_Code || "1",
        Defendant_City: formData?.Defendant_Establishment_data?.City_Code || "1",


        Defendant_PhoneNumber: formData?.phoneNumber,
        Defendant_MobileNumber: formData?.phoneNumber,


      };

    }
  }
};

export const workDetailsPayload = (
  buttonName: "Next" | "Save",
  formData: any,
  getCaseId?: any,
  userClaims?: any,
  language: string = "EN",
  userType?: string
): CasePayload => {
  console.log("this is from worker", formData);
  const lowUserType = userType?.toLocaleLowerCase();
  switch (lowUserType) {
    case "legal representative": {

      return {
        ...getBasePayload(userClaims, language || "EN", userType),
        Flow_ButtonName: buttonName,
        CaseID: getCaseId,
        Flow_CurrentScreen: "LastJobDetails",
        Defendant_StillWorking: formData?.isStillEmployed ? "SW1" : "SW2",
        Defendant_SalaryType: extractValue(formData?.typeOfWage?.value),
        Defendant_Salary: extractValue(formData?.salary),
        Defendant_ContractType: extractValue(formData?.contractType?.value),
        Defendant_ContractNumber: extractValue(formData?.contractNumber),
        Defendant_ContractStartDate: extractValue(
          formatDateToYYYYMMDD(formData?.contractDateGregorian)
        ),
        Defendant_ContractStartDateHijjari: extractValue(
          formatDateToYYYYMMDD(formData?.contractDateHijri)
        ),
        Defendant_ContractEndDate: extractValue(
          formatDateToYYYYMMDD(formData?.contractExpiryDateGregorian)
        ),
        Defendant_ContractEndDateHijjari: extractValue(
          formatDateToYYYYMMDD(formData?.contractExpiryDateHijri)
        ),
        Defendant_JobLocation: extractValue(formData?.region?.value),
        DefendantJobCity: extractValue(formData?.city?.value),
        Defendant_JobStartDate: formatDateToYYYYMMDD(
          formData?.dateOfFirstWorkingDayGregorian
        ),
        Defendant_JobStartDateHijjari: formatDateToYYYYMMDD(
          formData?.dateofFirstworkingdayHijri
        ),

        Defendant_JobEndDate: formatDateToYYYYMMDD(
          formData?.dateofLastworkingdayGregorian
        ),
        Defendant_JobEndDateHijjari: formatDateToYYYYMMDD(
          formData?.dateoflastworkingdayHijri
        ),
        Defendant_ClosestLaborOffice: formData?.laborOffice?.value,
      };
    }

    case "establishment": {

      return {
        ...getBasePayload(userClaims, language || "EN", userType),
        DefendantType: "Worker",
        Flow_ButtonName: buttonName,
        Flow_CurrentScreen: "LastJobDetails",
        CaseID: getCaseId,

        Defendant_SalaryType: extractValue(formData?.typeOfWage?.value),
        Defendant_Salary: extractValue(formData?.salary),
        Defendant_ContractType: extractValue(formData?.contractType?.value),
        Defendant_ContractNumber: extractValue(formData?.contractNumber),
        Defendant_ContractStartDate: extractValue(
          formatDateToYYYYMMDD(formData?.contractDateGregorian)
        ),
        Defendant_ContractStartDateHijjari: extractValue(
          formatDateToYYYYMMDD(formData?.contractDateHijri)
        ),
        Defendant_ContractEndDate: extractValue(
          formatDateToYYYYMMDD(formData?.contractExpiryDateGregorian
          )
        ),
        Defendant_ContractEndDateHijjari: extractValue(
          formatDateToYYYYMMDD(formData?.contractExpiryDateHijri)
        ),
        Defendant_JobStartDate: formatDateToYYYYMMDD(
          formData?.dateOfFirstWorkingDayGregorian
        ),
        Defendant_JobStartDateHijjari: formatDateToYYYYMMDD(
          formData?.dateofFirstworkingdayHijri
        ),

        Defendant_JobEndDate: formatDateToYYYYMMDD(
          formData?.dateofLastworkingdayGregorian
        ),
        Defendant_JobEndDateHijjari: formatDateToYYYYMMDD(
          formData?.dateoflastworkingdayHijri
        ),
        Defendant_ClosestLaborOffice: formData?.laborOffice?.value,
        Defendant_JobLocation: extractValue(formData?.region?.value),
        DefendantJobCity: extractValue(formData?.city?.value),
        Defendant_StillWorking: formData?.isStillEmployed ? "SW1" : "SW2",
      };
    }

    default: {
      if (lowUserType === "establishment") {
        return {
          ...getBasePayload(userClaims, language, userType),
          Flow_ButtonName: buttonName,
          CaseID: getCaseId,
          Flow_CurrentScreen: "LastJobDetails",
          Defendant_SalaryType: extractValue(formData?.typeOfWage?.value),
          Defendant_Salary: extractValue(formData?.salary),
          Defendant_ContractType: extractValue(formData?.contractType?.value),
          Defendant_ContractNumber: extractValue(formData?.contractNumber),
          Defendant_StillWorking: formData?.isStillEmployed ? "SW1" : "SW2",
          Defendant_JobLocation: extractValue(formData?.region?.value),
          DefendantJobCity: extractValue(formData?.city?.value),
          Defendant_ClosestLaborOffice: formData?.laborOffice?.value,

          Defendant_ContractStartDate: extractValue(
            formatDateToYYYYMMDD(formData?.contractDateGregorian)
          ),
          Defendant_ContractStartDateHijjari: extractValue(
            formatDateToYYYYMMDD(formData?.contractDateHijri)
          ),
          Defendant_ContractEndDate: extractValue(
            formatDateToYYYYMMDD(formData?.contractExpiryDateGregorian)
          ),
          Defendant_ContractEndDateHijjari: extractValue(
            formatDateToYYYYMMDD(formData?.contractExpiryDateHijri)
          ),
          Defendant_JobStartDate: formatDateToYYYYMMDD(
            formData?.dateOfFirstWorkingDayGregorian
          ),
          Defendant_JobStartDateHijjari: formatDateToYYYYMMDD(
            formData?.dateofFirstworkingdayHijri
          ),
          Defendant_JobEndDate: formatDateToYYYYMMDD(
            formData?.dateofLastworkingdayGregorian
          ),
          Defendant_JobEndDateHijjari: formatDateToYYYYMMDD(
            formData?.dateoflastworkingdayHijri
          ),

        };
      }

      // Default case for other user types
      return {
        ...getBasePayload(userClaims, language, userType),
        Flow_ButtonName: buttonName,
        CaseID: getCaseId,
        Flow_CurrentScreen: "LastJobDetails",
        Plaintiff_SalaryType: formData?.typeOfWage?.value,
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

        Plaintiff_StillWorking: formData?.isStillEmployed ? "SW1" : "SW2",
        Plaintiff_JobLocation: formData?.region?.value,
        PlaintiffJobCity: formData?.city?.value,
        Plaintiff_ClosestLaborOffice: formData?.laborOffice?.value,

        Plaintiff_JobStartDate: formatDateToYYYYMMDD(
          formData?.dateOfFirstWorkingDayGregorian
        ),
        Plaintiff_JobStartDateHijjari: formatDateToYYYYMMDD(
          formData?.dateofFirstworkingdayHijri
        ),

        Plaintiff_JobEndDate: formatDateToYYYYMMDD(
          formData?.dateofLastworkingdayGregorian
        ),
        Plaintiff_JobEndDateHijjari: formatDateToYYYYMMDD(
          formData?.dateoflastworkingdayHijri
        ),


      };
    }
  }
};

export const hearingTopicsPayload = (
  buttonName: "Next" | "Save",
  formData: any,
  getCaseId?: any,
  caseTopics?: any,
  userClaims?: any,
  language: string = "EN",
  userType?: string
): CasePayload => ({
  ...getBasePayload(userClaims, language, userType),
  Flow_ButtonName: buttonName,
  CaseID: getCaseId,
  Flow_CurrentScreen: "HearingTopics",
  HearingTopics: caseTopics,
});

export const reviewPayload = (
  buttonName: "Next" | "Save",
  formData: any,
  getCaseId?: any,
  userClaims?: any,
  language: string = "EN",
  userType?: string
): CasePayload => ({
  ...getBasePayload(userClaims, language, userType),
  Flow_ButtonName: buttonName,
  CaseID: getCaseId,
  Flow_CurrentScreen: "Review",
  ReviewComments:
    formData?.reviewComments || "All details reviewed and confirmed.",
});
