import { useEffect } from "react";
import { useLazyGetCaseDetailsQuery } from "@/features/manage-hearings/api/myCasesApis";
import { useCookieState } from "./useCookieState";
import { formatDateString, formatHijriDate } from "@/shared/lib/helpers";

const useCaseDetailsPrefill = (setValue: (field: string, value: any) => void, trigger?: (name?: string | string[]) => Promise<boolean>) => {
  const [getCookie] = useCookieState();
  const [triggerCaseDetailsQuery] = useLazyGetCaseDetailsQuery();

  useEffect(() => {
    const caseId = getCookie("caseId");
    const userClaims = getCookie("userClaims");
    const userType = getCookie("userType");
    const lang = userClaims?.AcceptedLanguage?.toUpperCase() || "EN";

    if (!caseId || !userType) return;

    const payload = {
      CaseID: caseId,
      UserType: userType,
      IDNumber: userClaims?.UserID || "",
      AcceptedLanguage: lang,
      SourceSystem: "E-Services",
      FileNumber: userType === "Establishment" ? userClaims?.File_Number || "" : "",
      MainGovernment: userType === "Legal representative" ? getCookie("mainCategory")?.value || "" : "",
      SubGovernment: userType === "Legal representative" ? getCookie("subCategory")?.value || "" : ""
    };

    triggerCaseDetailsQuery(payload).then((result) => {
      const details = result?.data?.CaseDetails;
      if (!details) return;

      // Set form state based on PlaintiffType
      if (userType === "Worker" && details.PlaintiffType === "Self(Worker)") {
        setValue("claimantStatus", "principal");
        setValue("applicantType", "principal");
        setValue("showOnlyPrincipal", true);
      } else if (
        (userType === "Worker" || userType === "Embassy User") &&
        details.PlaintiffType === "Agent"
      ) {
        setValue("claimantStatus", "representative");
        setValue("applicantType", "representative");
        setValue("showOnlyRepresentative", true);
      }

      // Pre-fill core fields
      setValue("idNumber", details.PlaintiffId || "");
      setValue("hijriDate", details.PlaintiffHijiriDOB || "");
      setValue("userName", details.PlaintiffName || "");
      setValue("phoneNumber", details.Plaintiff_PhoneNumber || "");
      setValue("gregorianDate", details.Plaintiff_ApplicantBirthDate || "");
      setValue("firstLanguage", details.Plaintiff_FirstLanguage || "");
      
      // Map select fields with value/label pairs
      setValue("plaintiffRegion", {
        value: details.Plaintiff_Region_Code || "",
        label: details.Plaintiff_Region || "",
      });
      setValue("plaintiffCity", {
        value: details.Plaintiff_City_Code || "",
        label: details.Plaintiff_City || "",
      });
      setValue("occupation", {
        value: details.Plaintiff_Occupation_Code || "",
        label: details.Plaintiff_Occupation || "",
      });
      setValue("gender", {
        value: details.Plaintiff_Gender_Code || "",
        label: details.Plaintiff_Gender || "",
      });
      setValue("nationality", {
        value: details.Plaintiff_Nationality_Code || "",
        label: details.Plaintiff_Nationality || "",
      });

      // Map agent-specific fields if applicable
      if (details.PlaintiffType === "Agent") {
        setValue("agentType", details.CertifiedBy === "CB1" ? "local_agency" : "external_agency");
        setValue("agencyNumber", details.Agent_MandateNumber || "");
        setValue("mobileNumber", details.Plaintiff_MobileNumber || "");
        setValue("agentName", details.PlaintiffName || "");
        setValue("agencyStatus", details.Agent_MandateStatus || "");
        setValue("agencySource", details.Agent_MandateSource || "");
        setValue("Agent_ResidencyAddress", details.Agent_ResidencyAddress || "");
        setValue("Agent_CurrentPlaceOfWork", details.Agent_CurrentPlaceOfWork || "");
      }

      // Map work-related fields
      setValue("contractNumber", details.Plaintiff_ContractNumber || "");
      setValue("contractDateGregorian", details.Plaintiff_ContractStartDate ? formatDateString(details.Plaintiff_ContractStartDate) : "");
      setValue("contractDateHijri", details.Plaintiff_ContractStartDateHijri ? formatHijriDate(details.Plaintiff_ContractStartDateHijri) : "");
      setValue("contractExpiryDateGregorian", details.Plaintiff_ContractEndDate ? formatDateString(details.Plaintiff_ContractEndDate) : "");
      setValue("contractExpiryDateHijri", details.Plaintiff_ContractEndDateHijri ? formatHijriDate(details.Plaintiff_ContractEndDateHijri) : "");
      setValue("contractType", {
        value: details.Plaintiff_ContractType_Code || "",
        label: details.Plaintiff_ContractType || "",
      });
      setValue("salary", details.Plaintiff_Salary || "");
      setValue("salaryType", {
        value: details.Plaintiff_SalaryType_Code || "",
        label: details.Plaintiff_SalaryType || "",
      });
      setValue("dateOfFirstWorkingDayGregorian", details.Plaintiff_JobStartDate ? formatDateString(details.Plaintiff_JobStartDate) : "");
      setValue("dateofFirstworkingdayHijri", details.Plaintiff_JobStartDateHijri ? formatHijriDate(details.Plaintiff_JobStartDateHijri) : "");
      setValue("dateofLastworkingdayGregorian", details.Plaintiff_JobEndDate ? formatDateString(details.Plaintiff_JobEndDate) : "");
      setValue("dateoflastworkingdayHijri", details.Plaintiff_JobEndDateHijri ? formatHijriDate(details.Plaintiff_JobEndDateHijri) : "");
      setValue("stillWorking", details.Plaintiff_StillWorking || "");

      // Trigger validation after setting all values
      if (trigger) {
        trigger();
      }
    });
  }, []);
};

export default useCaseDetailsPrefill;
