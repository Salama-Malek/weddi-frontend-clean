import { useEffect } from "react";
import { useCookieState } from "./useCookieState";
import { useLazyGetCaseDetailsQuery } from "@/features/manage-hearings/api/myCasesApis";

export const useCaseDetailsPrefill = (setValue: (field: string, value: any) => void) => {
  const [getCookie] = useCookieState();
  const caseId = getCookie("caseId");
  const userType = getCookie("userType");
  const userClaims = getCookie("userClaims") || {};
  const mainCategory = getCookie("mainCategory")?.value;
  const subCategory = getCookie("subCategory")?.value;

  const [triggerCaseDetailsQuery, { data: caseDetailsData }] = useLazyGetCaseDetailsQuery();

  useEffect(() => {
    if (!caseId || userType !== "Legal representative") return;

    const userConfigs: any = {
      Worker: {
        UserType: userType,
        IDNumber: userClaims?.UserID,
      },
      Establishment: {
        UserType: userType,
        IDNumber: userClaims?.UserID,
        FileNumber: userClaims?.File_Number,
      },
      "Legal representative": {
        UserType: userType,
        IDNumber: userClaims?.UserID,
        MainGovernment: mainCategory || "",
        SubGovernment: subCategory || "",
      },
    };

    triggerCaseDetailsQuery({
      ...userConfigs[userType],
      CaseID: caseId,
      AcceptedLanguage: userClaims?.AcceptedLanguage?.toUpperCase() || "EN",
      SourceSystem: "E-Services",
    });
  }, [caseId, userType, userClaims, mainCategory, subCategory, triggerCaseDetailsQuery]);

  useEffect(() => {
    if (caseDetailsData?.CaseDetails) {
      const details = caseDetailsData.CaseDetails as Record<string, any>;
      Object.entries(details).forEach(([key, val]) => {
        if (val !== null && val !== undefined && val !== "") {
          setValue(key, val);
        }
      });
    }
  }, [caseDetailsData, setValue]);
};

export default useCaseDetailsPrefill;
