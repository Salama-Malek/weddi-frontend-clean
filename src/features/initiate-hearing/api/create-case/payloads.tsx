import { extractValue } from "@/shared/lib/api/utils";
import { formatDateToYYYYMMDD } from "@/shared/lib/helpers";
import type { TokenClaims } from "@/features/login/components/AuthProvider";
import { toWesternDigits } from "@/shared/lib/helpers";

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

export const claimantDetailsPayload = (
  buttonName: "Next" | "Save",
  formData: any,
  userClaims: TokenClaims,
  nicDetailObj?: any,
  userType?: string,
  caseId?: string,
  language: string = "EN",
): CasePayload => {
  const payload: CasePayload = {
    ...getBasePayload(userClaims, language, userType),
    Flow_ButtonName: buttonName,
    CaseID: caseId,
  };

  payload.DomesticWorker =
    nicDetailObj?.Applicant_Code === "DW1" ? "true" : "false";

  const claimantStatus = formData?.claimantStatus;
  const agentType = formData?.agentType;
  const isAgent = claimantStatus === "representative";

  if (claimantStatus === "principal") {
    payload.PlaintiffName =
      formData?.principal_userName ||
      nicDetailObj?.PlaintiffName ||
      userClaims?.UserName;
    payload.PlaintiffHijiriDOB = toWesternDigits(
      formData?.principal_hijriDate ||
      nicDetailObj?.DateOfBirthHijri ||
      userClaims?.UserDOB ||
      ""
    );
    payload.Plaintiff_ApplicantBirthDate = toWesternDigits(
      (formData?.principal_gregorianDate ||
        nicDetailObj?.DateOfBirthGregorian) ??
      ""
    );
    payload.Plaintiff_PhoneNumber = formData?.principal_phoneNumber || "";
    payload.Plaintiff_Region =
      formData?.principal_region?.value ||
      formData?.principal_region ||
      nicDetailObj?.Region_Code ||
      "";
    payload.Plaintiff_City =
      formData?.principal_city?.value ||
      formData?.principal_city ||
      nicDetailObj?.City_Code ||
      formData?.principal_region?.value ||
      formData?.principal_region ||
      nicDetailObj?.Region_Code ||
      "";
    payload.JobPracticing =
      formData?.principal_occupation?.value ||
      formData?.principal_occupation ||
      nicDetailObj?.Occupation_Code ||
      "";
    payload.Gender =
      formData?.principal_gender?.value ||
      formData?.principal_gender ||
      nicDetailObj?.Gender_Code ||
      "";
    payload.Worker_Nationality =
      formData?.principal_nationality?.value ||
      formData?.principal_nationality ||
      nicDetailObj?.Nationality_Code ||
      "";
    payload.PlaintiffId = userClaims?.UserID;
    payload.PlaintiffType = "Self(Worker)";
    payload.ApplicantType = "Worker";
  }

  if (isAgent) {

    if (agentType === "local_agency") {
      payload.PlaintiffName =
        formData?.localAgent_userName || nicDetailObj?.PlaintiffName || "";
      payload.PlaintiffHijiriDOB = toWesternDigits(
        formData?.localAgent_workerAgentDateOfBirthHijri ||
        nicDetailObj?.DateOfBirthHijri ||
        ""
      );
      payload.Plaintiff_ApplicantBirthDate = toWesternDigits(
        (formData?.localAgent_gregorianDate ||
          nicDetailObj?.DateOfBirthGregorian) ??
        ""
      );
      payload.Plaintiff_PhoneNumber = formData?.localAgent_phoneNumber || "";
      payload.Plaintiff_Region =
        formData?.localAgent_region?.value ||
        formData?.localAgent_region ||
        nicDetailObj?.Region_Code ||
        "";
      payload.Plaintiff_City =
        formData?.localAgent_city?.value ||
        formData?.localAgent_city ||
        nicDetailObj?.City_Code ||
        formData?.localAgent_region?.value ||
        formData?.localAgent_region ||
        nicDetailObj?.Region_Code ||
        "";
      payload.JobPracticing =
        formData?.localAgent_occupation?.value ||
        formData?.localAgent_occupation ||
        nicDetailObj?.Occupation_Code ||
        "";
      payload.Gender =
        formData?.localAgent_gender?.value ||
        formData?.localAgent_gender ||
        nicDetailObj?.Gender_Code ||
        "";
      payload.Worker_Nationality =
        formData?.localAgent_nationality?.value ||
        formData?.localAgent_nationality ||
        nicDetailObj?.Nationality_Code ||
        "";
      payload.PlaintiffId = formData?.localAgent_workerAgentIdNumber || "";
      payload.PlaintiffType = "Agent";
      payload.ApplicantType = "Worker";

      payload.Agent_AgentID = userClaims?.UserID;
      payload.CertifiedBy = "CB1";
      payload.Agent_Name = formData?.agentName || "";
      payload.Agent_MandateNumber = formData?.localAgent_agencyNumber || "";
      payload.Agent_MandateStatus = formData?.agencyStatus || "";
      payload.Agent_MandateSource = formData?.agencySource || "";
      payload.Agent_ResidencyAddress =
        formData?.localAgent_residencyAddress || "";
      payload.Agent_CurrentPlaceOfWork =
        formData?.localAgent_currentPlaceOfWork || "";
    } else if (agentType === "external_agency") {
      payload.PlaintiffName =
        formData?.externalAgent_userName || nicDetailObj?.PlaintiffName || "";
      payload.PlaintiffHijiriDOB = toWesternDigits(
        formData?.externalAgent_workerAgentDateOfBirthHijri ||
        nicDetailObj?.DateOfBirthHijri ||
        ""
      );
      payload.Plaintiff_ApplicantBirthDate = toWesternDigits(
        (formData?.externalAgent_gregorianDate ||
          nicDetailObj?.DateOfBirthGregorian) ??
        ""
      );
      payload.Plaintiff_PhoneNumber = formData?.externalAgent_phoneNumber || "";
      payload.Plaintiff_Region =
        formData?.externalAgent_region?.value ||
        formData?.externalAgent_region ||
        nicDetailObj?.Region_Code ||
        "";
      payload.Plaintiff_City =
        formData?.externalAgent_city?.value ||
        formData?.externalAgent_city ||
        nicDetailObj?.City_Code ||
        formData?.externalAgent_region?.value ||
        formData?.externalAgent_region ||
        nicDetailObj?.Region_Code ||
        "";
      payload.JobPracticing =
        formData?.externalAgent_occupation?.value ||
        formData?.externalAgent_occupation ||
        nicDetailObj?.Occupation_Code ||
        "";
      payload.Gender =
        formData?.externalAgent_gender?.value ||
        formData?.externalAgent_gender ||
        nicDetailObj?.Gender_Code ||
        "";
      payload.Worker_Nationality =
        formData?.externalAgent_nationality?.value ||
        formData?.externalAgent_nationality ||
        nicDetailObj?.Nationality_Code ||
        "";
      payload.PlaintiffId = formData?.externalAgent_workerAgentIdNumber || "";
      payload.PlaintiffType = "Agent";
      payload.ApplicantType = "Worker";

      payload.Agent_AgentID = userClaims?.UserID;
      payload.CertifiedBy = "CB2";
      payload.Agent_Name = formData?.externalAgent_agentName || "";
      payload.Agent_MandateNumber = formData?.externalAgent_agencyNumber || "";
      payload.Agent_MandateStatus = formData?.externalAgent_agencyStatus || "";
      payload.Agent_MandateSource = formData?.externalAgent_agencySource || "";
      payload.Agent_ResidencyAddress =
        formData?.externalAgent_residencyAddress || "";
      payload.Agent_CurrentPlaceOfWork =
        formData?.externalAgent_currentPlaceOfWork || "";
      payload.Agent_PhoneNumber =
        formData?.externalAgent_agentPhoneNumber || "";
    }
  }

  const isDomesticWorker =
    claimantStatus === "principal" && payload.DomesticWorker === "true";
  if (isDomesticWorker && formData?.attachment && formData?.attachment.base64) {
    payload.CaseAttachments = [
      {
        FileType: formData.attachment.fileType,
        FileName: formData.attachment.fileName,
        AttachmentRequired: "true",
        FileData: formData.attachment.base64,
        Attachmentdescription: "Unprofessional Letter",
      },
    ];
  }
  console.log("Hassan DEBUG ", userType?.toLowerCase());

  switch (userType?.toLowerCase()) {
    case "legal representative":
      return {
        ...getBasePayload(userClaims, language, userType),
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
        CreatedBy: userClaims?.UserID,
        SourceSystem: "E-Services",
        ApplicantType: "Establishment",
        Plaintiff_CRNumber:
          formData?.establishment_crNumber ||

          "",
        Flow_CurrentScreen: "PlaintiffDetails",
        Language: language,
        PlaintiffEstFileNumber:
          formData?.establishment_fileNumber ||

          "",
        EstablishmentFullName:
          formData?.establishment_name ||

          "",
        Activity:
          formData?.Activity || "",
        EstablishmentType:
          formData?.establishment_type ||

          "",
        EstId:
          formData?.establishment_id ||

          "",

        EstablishmentName:
          formData?.establishment_fileNumber ||

          "",
        Plaintiff_PhoneNumber:
          formData?.establishment_phoneNumber ||

          "",
        Plaintiff_Region:
          formData?.establishment_region?.value ||

          "",
        Plaintiff_City:
          formData?.establishment_city?.value ||

          formData?.establishment_region?.value ||

          "",
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
      return {
        ...ADDInternationalNumber(formData),
        ...payload,
      };
  }
};

export const defendantWorkerPayload = (
  buttonName: "Next" | "Save",
  formData: any,
  caseId?: string,
  language: string = "EN",
): CasePayload => {
  const payload: CasePayload = {
    DefendantType: "",
    IDNumber: formData?.idNumber || "",
    CaseID: caseId,
    DefendantID:
      formData?.DefendantsEstablishmentPrisonerId ||
      formData?.nationalIdNumber ||
      "",
    DefendantName: formData?.DefendantsEstablishmentPrisonerName || "",
    Defendant_ApplicantBirthDate: toWesternDigits(
      (formatDateToYYYYMMDD(formData?.def_date_gregorian) || "") ?? ""
    ),
    Defendant_HijiriDOB: toWesternDigits(
      (formatDateToYYYYMMDD(formData?.def_date_hijri) || "") ?? ""
    ),
    Defendant_PhoneNumber:
      formData?.mobileNumber || formData?.phoneNumber || "",
    Defendant_Region:
      formData?.DefendantsEstablishmentRegion || formData?.region?.value || "",
    Defendant_City:
      formData?.DefendantsEstablishmentCity || formData?.city?.value || "",
    Defendant_Occupation:
      formData?.DefendantsEstablishOccupation?.value ||
      formData?.occupation?.value ||
      "",
    Defendant_Gender:
      formData?.DefendantsEstablishmentGender || formData?.gender?.value || "",
    Defendant_Nationality:
      formData?.DefendantsEstablishmentNationality ||
      formData?.nationality?.value ||
      "",
    Flow_CurrentScreen: "DefendantDetails",
    Flow_ButtonName: buttonName,

    AcceptedLanguage: language,
    JobPracticing:
      formData?.DefendantsEstablishOccupation?.value ||
      formData?.occupation?.value ||
      "",
    Gender:
      formData?.DefendantsEstablishmentGender || formData?.gender?.value || "",
    Worker_Nationality:
      formData?.DefendantsEstablishmentNationality ||
      formData?.nationality?.value ||
      "",
    Defendant_MobileNumber:
      formData?.mobileNumber || formData?.phoneNumber || "",
  };

  return payload;
};

export const defendantDetailsPayload = (
  buttonName: "Next" | "Save",
  formData: any,
  getCaseId?: string,
  language: string = "EN",
  userType?: any,
  userClaims?: any,
): CasePayload => {
  const lowUserType = userType?.toLowerCase();



  switch (lowUserType) {
    case "legal representative":
      return {
        ...getBasePayload(userClaims, language, userType),
        Flow_ButtonName: buttonName,
        CaseID: getCaseId,
        Flow_CurrentScreen: "DefendantDetails",
        DefendantID: extractValue(formData?.DefendantsEstablishmentPrisonerId),
        Defendant_HijiriDOB: toWesternDigits(
          extractValue(formatDateToYYYYMMDD(formData?.def_date_hijri)) ?? ""
        ),
        DefendantType: "",
        DefendantName: extractValue(
          formData?.DefendantsEstablishmentPrisonerName
        ),
        Defendant_PhoneNumber: extractValue(formData?.mobileNumber),
        Defendant_Region: extractValue(
          formData?.defendantRegion?.value || formData?.region?.value
        ),
        Defendant_City: extractValue(
          formData?.defendantCity?.value || formData?.city?.value
        ),
        Defendant_MobileNumber: extractValue(formData?.mobileNumber),
      };

    case "establishment":
      return {
        ...getBasePayload(userClaims, language, userType),
        Flow_CurrentScreen: "DefendantDetails",
        CaseID: getCaseId,
        DefendantType: "",
        DefendantID: extractValue(formData?.DefendantsEstablishmentPrisonerId),
        Defendant_HijiriDOB: toWesternDigits(
          extractValue(formatDateToYYYYMMDD(formData?.def_date_hijri)) ?? ""
        ),
        DefendantName: extractValue(
          formData?.DefendantsEstablishmentPrisonerName
        ),
        Defendant_PhoneNumber: extractValue(formData?.mobileNumber),
        Defendant_Region: extractValue(
          formData?.defendantRegion?.value || formData?.region?.value
        ),
        Defendant_City: extractValue(
          formData?.defendantCity?.value || formData?.city?.value
        ),
        Worker_Nationality: extractValue(formData?.nationality?.value),
        Gender: extractValue(formData?.gender?.value),
        JobPracticing: extractValue(formData?.occupation.value),
        Defendant_MobileNumber: extractValue(formData?.mobileNumber),
      };

    default:

      if (formData?.defendantStatus === "Government") {

        return {
          ...getBasePayload(userClaims, language, userType),
          Flow_ButtonName: buttonName,
          CaseID: getCaseId,
          Flow_CurrentScreen: "DefendantDetails",
          DefendantType: "Government",
          Defendant_MainGovtDefend:
            formData?.main_category_of_the_government_entity?.value,
          DefendantSubGovtDefend:
            formData?.subcategory_of_the_government_entity?.value,
        };
      }

      if (
        formData?.defendantDetails === "Others" &&
        formData?.defendantStatus === "Establishment"
      ) {
        const payload = {
          ...getBasePayload(userClaims, language, userType),
          Flow_ButtonName: buttonName,
          CaseID: getCaseId,
          Flow_CurrentScreen: "DefendantDetails",
          DefendantType: "Establishment",
          Defendant_EstablishmentNameDetails:
            formData?.Defendant_Establishment_data_NON_SELECTED
              ?.EstablishmentName,
          DefendantEstFileNumber:
            formData?.Defendant_Establishment_data_NON_SELECTED?.FileNumber,
          Defendant_CRNumber:
            formData?.Defendant_Establishment_data_NON_SELECTED?.CRNumber,
          Defendant_Number700:
            formData?.Defendant_Establishment_data_NON_SELECTED?.Number700,
          Defendant_PhoneNumber: formData?.establishment_phoneNumber,
          Defendant_Region:
            formData?.defendantRegion?.value || formData?.region?.value || "",
          Defendant_City:
            formData?.defendantCity?.value || formData?.city?.value,
          Defendant_MobileNumber: formData?.establishment_phoneNumber,
        };

        return payload;
      }
      const payload = {
        ...getBasePayload(userClaims, language, userType),
        Flow_ButtonName: buttonName,
        CaseID: getCaseId,
        Flow_CurrentScreen: "DefendantDetails",
        DefendantType: "Establishment",
        Defendant_EstablishmentNameDetails:
          formData?.Defendant_Establishment_data?.EstablishmentName ||
          formData?.Defendant_Establishment_data_NON_SELECTED
            ?.EstablishmentName,
        DefendantEstFileNumber:
          formData?.Defendant_Establishment_data?.FileNumber ||
          formData?.Defendant_Establishment_data_NON_SELECTED?.FileNumber,
        Defendant_CRNumber:
          formData?.Defendant_Establishment_data?.CRNumber ||
          formData?.Defendant_Establishment_data_NON_SELECTED?.CRNumber,

        Defendant_Number700: formData?.Defendant_Establishment_data?.Number700,
        Defendant_Region:
          formData?.Defendant_Establishment_data?.Region_Code ||
          formData?.defendantRegion?.value ||
          formData?.region?.value ||
          "",
        Defendant_City:
          formData?.Defendant_Establishment_data?.City_Code ||
          formData?.defendantCity?.value ||
          formData?.city?.value ||
          "1",
        Defendant_PhoneNumber: formData?.establishment_phoneNumber,
        Defendant_MobileNumber: formData?.establishment_phoneNumber,
      };
      return payload;
  }
};

export const workDetailsPayload = (
  buttonName: "Next" | "Save",
  formData: any,
  caseId?: string,
  userClaims?: any,
  userType?: string,
  language: string = "EN"
): CasePayload => {
  const lowUserType = userType?.toLowerCase();

  switch (lowUserType) {
    case "legal representative":
      return {
        ...getBasePayload(userClaims, language, userType),
        Flow_ButtonName: buttonName,
        CaseID: caseId,
        Flow_CurrentScreen: "LastJobDetails",
        Defendant_StillWorking: formData?.isStillEmployed ? "SW1" : "SW2",
        Defendant_SalaryType: extractValue(formData?.typeOfWage?.value),
        Defendant_Salary: extractValue(formData?.salary),
        Defendant_ContractType: extractValue(formData?.contractType?.value),
        Defendant_ContractNumber: extractValue(formData?.contractNumber),
        Defendant_ContractStartDate: toWesternDigits(
          extractValue(
            formatDateToYYYYMMDD(formData?.contractDateGregorian) || ""
          )
        ),
        Defendant_ContractStartDateHijjari: toWesternDigits(
          extractValue(formatDateToYYYYMMDD(formData?.contractDateHijri) || "")
        ),
        Defendant_ContractEndDate: toWesternDigits(
          extractValue(
            formatDateToYYYYMMDD(formData?.contractExpiryDateGregorian) || ""
          )
        ),
        Defendant_ContractEndDateHijjari: toWesternDigits(
          extractValue(
            formatDateToYYYYMMDD(formData?.contractExpiryDateHijri) || ""
          )
        ),
        Defendant_JobLocation: extractValue(formData?.jobLocation?.value),
        DefendantJobCity: extractValue(formData?.jobLocationCity?.value),
        Defendant_JobStartDate: toWesternDigits(
          formatDateToYYYYMMDD(formData?.dateOfFirstWorkingDayGregorian) || ""
        ),

        Defendant_JobEndDate: toWesternDigits(
          formatDateToYYYYMMDD(formData?.dateOfLastWorkingDayGregorian) || ""
        ),

        Defendant_ClosestLaborOffice: formData?.laborOffice?.value,
      };

    case "establishment":
      return {
        ...getBasePayload(userClaims, language, userType),
        DefendantType: "Worker",
        Flow_ButtonName: buttonName,
        CaseID: caseId,
        Flow_CurrentScreen: "LastJobDetails",
        Defendant_SalaryType: extractValue(formData?.typeOfWage?.value),
        Defendant_Salary: extractValue(formData?.salary),
        Defendant_ContractType: extractValue(formData?.contractType?.value),
        Defendant_ContractNumber: extractValue(formData?.contractNumber),
        Defendant_ContractStartDate: toWesternDigits(
          extractValue(
            formatDateToYYYYMMDD(formData?.contractDateGregorian) || ""
          )
        ),
        Defendant_ContractStartDateHijjari: toWesternDigits(
          extractValue(formatDateToYYYYMMDD(formData?.contractDateHijri) || "")
        ),
        Defendant_ContractEndDate: toWesternDigits(
          extractValue(
            formatDateToYYYYMMDD(formData?.contractExpiryDateGregorian) || ""
          )
        ),
        Defendant_ContractEndDateHijjari: toWesternDigits(
          extractValue(
            formatDateToYYYYMMDD(formData?.contractExpiryDateHijri) || ""
          )
        ),
        Defendant_JobStartDate: toWesternDigits(
          formatDateToYYYYMMDD(formData?.dateOfFirstWorkingDayGregorian) || ""
        ),

        Defendant_JobEndDate: toWesternDigits(
          formatDateToYYYYMMDD(formData?.dateOfLastWorkingDayGregorian) || ""
        ),

        Defendant_ClosestLaborOffice: formData?.laborOffice?.value,
        Defendant_JobLocation: extractValue(formData?.jobLocation?.value),
        DefendantJobCity: extractValue(formData?.jobLocationCity?.value),
        Defendant_StillWorking: formData?.isStillEmployed ? "SW1" : "SW2",
      };

    default:
      return {
        ...getBasePayload(userClaims, language, userType),
        Flow_ButtonName: buttonName,
        CaseID: caseId,
        Flow_CurrentScreen: "LastJobDetails",
        Plaintiff_SalaryType: extractValue(formData?.typeOfWage?.value),
        Plaintiff_Salary: formData?.salary,
        Plaintiff_ContractType: formData?.contractType?.value,
        Plaintiff_ContractNumber: formData?.contractNumber,
        Plaintiff_ContractStartDate: toWesternDigits(
          formatDateToYYYYMMDD(formData?.contractDateGregorian) || ""
        ),
        Plaintiff_ContractStartDateHijjari: toWesternDigits(
          formatDateToYYYYMMDD(formData?.contractDateHijri) || ""
        ),
        Plaintiff_ContractEndDate: toWesternDigits(
          formatDateToYYYYMMDD(formData?.contractExpiryDateGregorian) || ""
        ),
        Plaintiff_ContractEndDateHijjari: toWesternDigits(
          formatDateToYYYYMMDD(formData?.contractExpiryDateHijri) || ""
        ),
        Plaintiff_StillWorking: formData?.isStillEmployed ? "SW1" : "SW2",
        Plaintiff_JobLocation: formData?.jobLocation?.value,
        PlaintiffJobCity: formData?.jobLocationCity?.value,
        Plaintiff_ClosestLaborOffice: formData?.laborOffice?.value,
        Plaintiff_JobStartDate: toWesternDigits(
          formatDateToYYYYMMDD(formData?.dateOfFirstWorkingDayGregorian) || ""
        ),

        Plaintiff_JobEndDate: toWesternDigits(
          formatDateToYYYYMMDD(formData?.dateOfLastWorkingDayGregorian) || ""
        ),
      };
  }
};

export const hearingTopicsPayload = (
  buttonName: "Next" | "Save",
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

export const emabsyClaimantPayload = (
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
      PlaintiffName:
        formData?.embassyPrincipal_userName ||
        nicDetailObj?.PlaintiffName ||
        userClaims?.UserName ||
        "",
      PlaintiffHijiriDOB: toWesternDigits(
        formatDateToYYYYMMDD(formData?.embassyPrincipal_hijriDate) ??
        nicDetailObj?.DateOfBirthHijri ??
        userClaims?.UserDOB ??
        ""
      ),
      Plaintiff_ApplicantBirthDate: toWesternDigits(
        formatDateToYYYYMMDD(formData?.embassyPrincipal_gregorianDate) ??
        nicDetailObj?.DateOfBirthGregorian ??
        ""
      ),
      Plaintiff_PhoneNumber:
        formData?.embassyPrincipal_phoneNumber ||
        nicDetailObj?.PhoneNumber?.toString() ||
        "",
      Plaintiff_Region:
        formData?.embassyPrincipal_region?.value ||
        formData?.embassyPrincipal_region ||
        nicDetailObj?.Region_Code ||
        "",
      Plaintiff_City:
        formData?.embassyPrincipal_city?.value ||
        formData?.embassyPrincipal_city ||
        nicDetailObj?.City_Code ||
        formData?.embassyPrincipal_region?.value ||
        formData?.embassyPrincipal_region ||
        nicDetailObj?.Region_Code ||
        "",
      JobPracticing:
        formData?.embassyPrincipal_occupation?.value ||
        formData?.embassyPrincipal_occupation ||
        nicDetailObj?.Occupation_Code ||
        "",
      Gender:
        formData?.embassyPrincipal_gender?.value ||
        formData?.embassyPrincipal_gender ||
        nicDetailObj?.Gender_Code ||
        "",
      Worker_Nationality:
        formData?.embassyPrincipal_nationality?.value ||
        formData?.embassyPrincipal_nationality ||
        nicDetailObj?.Nationality_Code ||
        "",
      DomesticWorker: nicDetailObj?.Applicant_Code === "DW1" ? "true" : "false",
      ...ADDInternationalNumber(formData),
    };
  }

  return {
    ...getBasePayload(userClaims, language, userType),
    Flow_ButtonName: buttonName,
    CaseID: getCaseId,
    UserType: "Embassy User",
    ApplicantType: "Worker",
    PlaintiffType: "Agent",
    Agent_EmbassyName: formData?.embassyAgent_Agent_EmbassyName || "",
    Agent_EmbassyNationality: formData?.embassyAgent_Nationality_Code || "",
    Agent_EmbassyPhone: formData?.embassyAgent_Agent_EmbassyPhone || "",
    Agent_EmbassyEmailAddress:
      formData?.embassyAgent_Agent_EmbassyEmailAddress || "",
    Agent_EmbassyFirstLanguage:
      formData?.embassyAgent_Agent_EmbassyFirstLanguage || "",
    PlaintiffId: formData?.embassyAgent_workerAgentIdNumber || "",
    PlaintiffName:
      formData?.embassyAgent_userName || nicDetailObj?.PlaintiffName || "",
    PlaintiffHijiriDOB: toWesternDigits(
      formatDateToYYYYMMDD(
        formData?.embassyAgent_workerAgentDateOfBirthHijri
      ) ??
      nicDetailObj?.DateOfBirthHijri ??
      ""
    ),
    Plaintiff_ApplicantBirthDate: toWesternDigits(
      formatDateToYYYYMMDD(formData?.embassyAgent_gregorianDate) ??
      nicDetailObj?.DateOfBirthGregorian ??
      ""
    ),
    Plaintiff_PhoneNumber:
      formData?.embassyAgent_phoneNumber ||
      nicDetailObj?.PhoneNumber?.toString() ||
      "",
    Plaintiff_Region:
      formData?.embassyAgent_region?.value ||
      formData?.embassyAgent_region ||
      nicDetailObj?.Region_Code ||
      "",
    Plaintiff_City:
      formData?.embassyAgent_city?.value ||
      formData?.embassyAgent_city ||
      nicDetailObj?.City_Code ||
      formData?.embassyAgent_region?.value ||
      formData?.embassyAgent_region ||
      nicDetailObj?.Region_Code ||
      "",
    JobPracticing:
      formData?.embassyAgent_occupation?.value ||
      formData?.embassyAgent_occupation ||
      nicDetailObj?.Occupation_Code ||
      "",
    Gender:
      formData?.embassyAgent_gender?.value ||
      formData?.embassyAgent_gender ||
      nicDetailObj?.Gender_Code ||
      "",
    Worker_Nationality:
      formData?.embassyAgent_nationality?.value ||
      formData?.embassyAgent_nationality ||
      nicDetailObj?.Nationality_Code ||
      "",
    DomesticWorker: nicDetailObj?.Applicant_Code === "DW1" ? "true" : "false",
    IDNumber: userClaims?.UserID || "",
    ...ADDInternationalNumber(formData),
  };
};

const ADDInternationalNumber = (formData: any) => {
  if (
    formData?.isPhone &&
    formData?.phoneCode &&
    formData?.interPhoneNumber &&
    formData?.isVerified
  ) {
    return {
      IsGNRequired: formData?.isPhone || false,
      CountryCode: formData?.phoneCode || "",
      GlobalPhoneNumber: formData?.interPhoneNumber || "",
      IsGNOtpVerified: formData?.isVerified || false,
    };
  }
};
