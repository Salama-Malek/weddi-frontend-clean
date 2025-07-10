import { useEffect, useState } from "react";
import { useLazyGetCaseDetailsQuery } from "@/features/manage-hearings/api/myCasesApis";
import { useCookieState } from "./useCookieState";
import { formatDateString, formatHijriDate } from "@/shared/lib/helpers";
import { json } from "stream/consumers";

const useWorkDetailsPrefill = (setValue: (field: string, value: any) => void, trigger?: (name?: string | string[]) => Promise<boolean>) => {
  const [getCookie, setCookie] = useCookieState();
  const [triggerCaseDetailsQuery, { isLoading }] = useLazyGetCaseDetailsQuery();
  const [isFeatched, setIsfetched] = useState<boolean>(false);
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
      setIsfetched(true);
      if (!details) return;
      localStorage.setItem("CaseDetails", JSON.stringify(details));

    });
  }, []);

  return isFeatched
};

export default useWorkDetailsPrefill;
