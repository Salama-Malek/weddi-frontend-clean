import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCookieState } from "./useCookieState";
import { useLazyGetCaseDetailsQuery, GetCaseDetailsRequest } from "@/features/manage-hearings/api/myCasesApis"; 

export const useIncompleteCaseHandler = (setValue: (field: string, value: any) => void) => {
  const [getCookie, setCookie] = useCookieState();
  const navigate = useNavigate();
  const [triggerCaseDetailsQuery] = useLazyGetCaseDetailsQuery();

  useEffect(() => {
    const incompleteCase = getCookie("incompleteCase"); // contains: { PlaintiffType, CaseNumber, UserType }
    const userClaims = getCookie("userClaims");
    const userType = incompleteCase?.UserType;
    const caseId = incompleteCase?.CaseNumber;
    const plaintiffType = incompleteCase?.PlaintiffType;
    const lang = userClaims?.AcceptedLanguage?.toUpperCase() || "EN";

    if (!incompleteCase || !caseId || !userType || !plaintiffType) return;

    // Always keep caseId stored for API use
    setCookie("caseId", caseId);

    // Construct API payload based on user type
    const basePayload: GetCaseDetailsRequest = {
      CaseID: caseId,
      UserType: userType,
      IDNumber: userClaims?.UserID || "",
      AcceptedLanguage: lang,
      SourceSystem: "E-Services",
      FileNumber: userType === "Establishment" ? userClaims?.File_Number || "" : "",
      MainGovernment: userType === "Legal representative" ? getCookie("mainCategory")?.value || "" : "",
      SubGovernment: userType === "Legal representative" ? getCookie("subCategory")?.value || "" : ""
    };

    triggerCaseDetailsQuery(basePayload).then((result) => {
      const details = result?.data?.CaseDetails;
      if (!details) return;

      navigate("/initiate-hearing/case-creation");

      // Set form state based on PlaintiffType
      if (userType === "Worker" && plaintiffType === "Self(Worker)") {
        setValue("claimantStatus", "principal");
        setValue("applicantType", "principal");
        setValue("showOnlyPrincipal", true);
      } else if (
        (userType === "Worker" || userType === "Embassy User") &&
        plaintiffType === "Agent"
      ) {
        setValue("claimantStatus", "representative");
        setValue("applicantType", "representative");
        setValue("showOnlyRepresentative", true);
      }

      // Pre-fill core fields
      setValue("idNumber", details.PlaintiffId || "");
      setValue("hijriDate", details.PlaintiffHijiriDOB || "");
      setValue("userName", details.PlaintiffName || "");

      setValue("region", {
        value: details.Plaintiff_Region_Code || "",
        label: details.Plaintiff_Region || "",
      });

      setValue("city", {
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

      setValue("phoneNumber", details.Plaintiff_PhoneNumber || "");
    });
  }, []);
};
