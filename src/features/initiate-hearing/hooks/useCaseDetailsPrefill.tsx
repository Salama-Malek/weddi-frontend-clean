import { useEffect, useMemo } from "react";
import { useCookieState } from "./useCookieState";
import { useLazyGetCaseDetailsQuery } from "@/features/manage-hearings/api/myCasesApis";

export const useCaseDetailsPrefill = (
  setValue: (field: string, value: any) => void
) => {
  const [getCookie] = useCookieState();

  // Memoize the cookie values once to prevent infinite loop
  const cookieData = useMemo(() => {
    return {
      caseId: getCookie("caseId"),
      userType: getCookie("userType"),
      userClaims: getCookie("userClaims") || {},
      mainCategory: getCookie("mainCategory")?.value,
      subCategory: getCookie("subCategory")?.value,
    };
  }, []);

  const [triggerCaseDetailsQuery, { data: caseDetailsData }] =
    useLazyGetCaseDetailsQuery();

  // Initial fetch only once with stable cookie values
  useEffect(() => {
    const { caseId, userType, userClaims, mainCategory, subCategory } =
      cookieData;

    if (!caseId) return;

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
  }, [cookieData, triggerCaseDetailsQuery]);

  // Populate form values from fetched data
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
