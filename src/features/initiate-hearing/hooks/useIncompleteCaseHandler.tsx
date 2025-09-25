import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCookieState } from "./useCookieState";
import {
  useLazyGetCaseDetailsQuery,
  GetCaseDetailsRequest,
} from "@/features/manage-hearings/api/myCasesApis";

export const useIncompleteCaseHandler = (
  setValue: (field: string, value: any) => void,
  trigger?: (name?: string | string[]) => Promise<boolean>,
) => {
  const [getCookie, setCookie] = useCookieState();
  const navigate = useNavigate();
  const [triggerCaseDetailsQuery] = useLazyGetCaseDetailsQuery();

  useEffect(() => {
    const incompleteCase = getCookie("incompleteCase");
    const userClaims = getCookie("userClaims");

    const userType = getCookie("userType");
    const caseId = incompleteCase?.CaseNumber;
    const plaintiffType = incompleteCase?.PlaintiffType;
    const lang = userClaims?.AcceptedLanguage?.toUpperCase() || "EN";

    if (!incompleteCase || !caseId || !userType || !plaintiffType) {
      return;
    }

    setCookie("caseId", caseId);

    const basePayload: GetCaseDetailsRequest = {
      CaseID: caseId,
      UserType: userType,
      IDNumber: userClaims?.UserID || "",
      AcceptedLanguage: lang,
      SourceSystem: "E-Services",
      FileNumber:
        userType === "Establishment" ? userClaims?.File_Number || "" : "",
      MainGovernment:
        userType === "Legal representative"
          ? getCookie("mainCategory")?.value || ""
          : "",
      SubGovernment:
        userType === "Legal representative"
          ? getCookie("subCategory")?.value || ""
          : "",
    };

    triggerCaseDetailsQuery(basePayload).then((result) => {
      const details = result?.data?.CaseDetails;
      if (!details) {
        return;
      }

      localStorage.setItem("CaseDetails", JSON.stringify(details));

      if (
        details.Plaintiff_ContractNumber ||
        details.Plaintiff_ContractStartDate ||
        details.Plaintiff_ContractEndDate ||
        details.Plaintiff_ContractType ||
        details.Plaintiff_Salary ||
        details.Plaintiff_SalaryType ||
        details.Plaintiff_JobLocation ||
        details.Plaintiff_JobStartDate ||
        details.Plaintiff_JobEndDate ||
        details.Plaintiff_StillWorking ||
        details.DomesticWorker
      ) {
        const employmentDetails = {
          contractNumber: details.Plaintiff_ContractNumber,
          contractStartDate: details.Plaintiff_ContractStartDate,
          contractEndDate: details.Plaintiff_ContractEndDate,
          contractType: details.Plaintiff_ContractType,
          salary: details.Plaintiff_Salary,
          salaryType: details.Plaintiff_SalaryType,
          jobLocation: details.Plaintiff_JobLocation,
          jobStartDate: details.Plaintiff_JobStartDate,
          jobEndDate: details.Plaintiff_JobEndDate,
          stillWorking: details.Plaintiff_StillWorking,
          isDomesticWorker: details.DomesticWorker === "true",
        };

        localStorage.setItem(
          "EmploymentDetails",
          JSON.stringify(employmentDetails),
        );
      } else {
      }

      navigate("/initiate-hearing/case-creation");

      if (
        (userType === "Worker" || userType === "Embassy User") &&
        plaintiffType === "Self(Worker)"
      ) {
        setValue("claimantStatus", "principal");
        setValue("applicantType", "principal");
      } else if (
        (userType === "Worker" || userType === "Embassy User") &&
        plaintiffType === "Agent"
      ) {
        setValue("claimantStatus", "representative");
        setValue("applicantType", "representative");
      }

      setValue("idNumber", details.PlaintiffId || "");
      setValue("hijriDate", details.PlaintiffHijiriDOB || "");
      setValue("userName", details.PlaintiffName || "");
      setValue("phoneNumber", details.Plaintiff_PhoneNumber || "");
      setValue("gregorianDate", details.Plaintiff_ApplicantBirthDate || "");
      setValue("firstLanguage", details.Plaintiff_FirstLanguage || "");

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

      if (details.PlaintiffType_Code === "Agent") {
        setValue(
          "agentType",
          details.CertifiedBy === "CB1" ? "local_agency" : "external_agency",
        );
        setValue("agencyNumber", details.Agent_MandateNumber || "");
        setValue("mobileNumber", details.Plaintiff_MobileNumber || "");
        setValue("agentName", details.PlaintiffName || "");
        setValue("agencyStatus", details.Agent_MandateStatus || "");
        setValue("agencySource", details.Agent_MandateSource || "");
        setValue(
          "Agent_ResidencyAddress",
          details.Agent_ResidencyAddress || "",
        );
        setValue(
          "Agent_CurrentPlaceOfWork",
          details.Agent_CurrentPlaceOfWork || "",
        );
      }

      setValue("contractNumber", details.Plaintiff_ContractNumber || "");
      setValue("contractStartDate", details.Plaintiff_ContractStartDate || "");
      setValue("contractEndDate", details.Plaintiff_ContractEndDate || "");
      setValue("contractType", {
        value: details.Plaintiff_ContractType_Code || "",
        label: details.Plaintiff_ContractType || "",
      });
      setValue("salary", details.Plaintiff_Salary || "");
      setValue("salaryType", {
        value: details.Plaintiff_SalaryType_Code || "",
        label: details.Plaintiff_SalaryType || "",
      });
      setValue("jobStartDate", details.Plaintiff_JobStartDate || "");
      setValue("jobEndDate", details.Plaintiff_JobEndDate || "");
      setValue("stillWorking", details.Plaintiff_StillWorking || "");

      if (trigger) {
        trigger();
      }
    });
  }, []);
};
