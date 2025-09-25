import { useEffect, useState, useRef } from "react";
import { useLazyGetCaseDetailsQuery } from "@/features/hearings/manage/api/myCasesApis";
import { useCookieState } from "./useCookieState";

const isValidValue = (value: any): boolean => {
  return value !== undefined && value !== null && value !== "";
};

const createValueLabel = (value: string, label: string) => {
  if (!isValidValue(value) && !isValidValue(label)) return null;
  return {
    value: value || "",
    label: label || "",
  };
};

const nullifyIfEmpty = (obj: any) => {
  if (!obj || (obj.value === undefined && obj.label === undefined)) {
    return null;
  }
  return obj;
};

interface PrefillOptions {
  setValue: (field: string, value: any) => void;
  trigger?: (name?: string | string[]) => Promise<boolean>;
  prefillType?: "claimant" | "defendant" | "embassy" | "all";
  userType?: string;
}

const useCaseDetailsPrefill = ({
  setValue,
  trigger,
  prefillType = "all",
  userType: overrideUserType,
}: PrefillOptions) => {
  const [getCookie] = useCookieState();
  const [triggerCaseDetailsQuery, { isLoading }] = useLazyGetCaseDetailsQuery();
  const [isFetched, setIsFetched] = useState<boolean>(false);
  const [caseData, setCaseData] = useState<any | null>(null);
  const [defendantData, setDefendantData] = useState<any | null>(null);
  const [hasDefendantPrefill, setHasDefendantPrefill] =
    useState<boolean>(false);
  const previousCaseIdRef = useRef<string | null>(null);

  useEffect(() => {
    const caseId = getCookie("caseId");
    const userClaims = getCookie("userClaims");
    const userType = overrideUserType || getCookie("userType");
    const lang = userClaims?.AcceptedLanguage?.toUpperCase() || "EN";

    if (!caseId || !userType) {
      return;
    }

    if (
      caseId &&
      previousCaseIdRef.current &&
      caseId !== previousCaseIdRef.current
    ) {
      setCaseData(null);
      setDefendantData(null);
      setHasDefendantPrefill(false);
      setIsFetched(false);
    }

    previousCaseIdRef.current = caseId;

    const payload = {
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

    triggerCaseDetailsQuery(payload)
      .then((result) => {
        const details = result?.data?.CaseDetails;
        setIsFetched(true);

        if (!details) {
          return;
        }

        setCaseData(details);

        if (prefillType === "defendant" || prefillType === "all") {
          const extractedDefendantData = extractDefendantData(details);
          setDefendantData(extractedDefendantData);

          applyDefendantPrefilling(details, userType);
        }

        if (prefillType === "claimant" || prefillType === "all") {
          applyClaimantPrefilling(details, userType);
        }

        if (trigger) {
          setTimeout(() => trigger(), 100);
        }
      })
      .catch((_error) => {
        setIsFetched(true);
      });
  }, [
    prefillType,
    overrideUserType,
    getCookie,
    triggerCaseDetailsQuery,
    setValue,
    trigger,
  ]);

  const extractDefendantData = (caseDetails: any) => {
    const isEstablishment = caseDetails?.DefendantType_Code === "Establishment";

    const isWorker = caseDetails?.ApplicantType_Code === "Worker";

    const hasDefendantData = !!(
      caseDetails?.DefendantName ||
      caseDetails?.Defendant_Region_Code ||
      caseDetails?.Defendant_City_Code ||
      caseDetails?.DefendantEstFileNumber ||
      caseDetails?.Defendant_CRNumber ||
      caseDetails?.Defendant_Number700 ||
      caseDetails?.EstablishmentFullName ||
      caseDetails?.Defendant_MainGovtDefend_Code ||
      caseDetails?.DefendantSubGovtDefend_Code
    );

    setHasDefendantPrefill(hasDefendantData);

    const extractedData = {
      defendantStatus:
        caseDetails?.DefendantType_Code === "Government"
          ? "Government"
          : caseDetails?.DefendantType_Code === "Establishment"
            ? "Establishment"
            : undefined,

      defendantDetails: "Others",

      ...(isEstablishment
        ? {}
        : {
            nationalIdNumber: caseDetails?.DefendantId || "",
            def_date_hijri: caseDetails?.DefendantHijiriDOB || "",
            def_date_gregorian: caseDetails?.Defendant_ApplicantBirthDate || "",
            DefendantsEstablishmentPrisonerName:
              caseDetails?.DefendantName || "",
          }),

      establishment_phoneNumber:
        caseDetails?.Defendant_PhoneNumber ||
        caseDetails?.Defendant_MobileNumber ||
        "",

      defendantRegion: nullifyIfEmpty(
        createValueLabel(
          caseDetails?.Defendant_Region_Code,
          caseDetails?.Defendant_Region,
        ),
      ),
      defendantCity: nullifyIfEmpty(
        createValueLabel(
          caseDetails?.Defendant_City_Code,
          caseDetails?.Defendant_City,
        ),
      ),

      ...(isEstablishment
        ? {}
        : {
            occupation: nullifyIfEmpty(
              createValueLabel(
                caseDetails?.Defendant_Occupation_Code,
                caseDetails?.Defendant_Occupation,
              ),
            ),
            gender: nullifyIfEmpty(
              createValueLabel(
                caseDetails?.Defendant_Gender_Code,
                caseDetails?.Defendant_Gender,
              ),
            ),
            nationality: nullifyIfEmpty(
              createValueLabel(
                caseDetails?.Defendant_Nationality_Code,
                caseDetails?.Defendant_Nationality,
              ),
            ),
          }),

      DefendantFileNumber: caseDetails?.DefendantEstFileNumber || "",
      DefendantCRNumber: caseDetails?.Defendant_CRNumber || "",
      DefendantNumber700: caseDetails?.Defendant_Number700 || "",
      DefendantEstablishmentName:
        caseDetails?.EstablishmentFullName || caseDetails?.DefendantName || "",

      ...(isEstablishment
        ? {
            DefendantsEstablishmentPrisonerName:
              caseDetails?.EstablishmentFullName ||
              caseDetails?.DefendantName ||
              "",
          }
        : {}),

      ...(isEstablishment
        ? {
            Defendant_Establishment_data_NON_SELECTED: {
              EstablishmentName:
                caseDetails?.EstablishmentFullName ||
                caseDetails?.DefendantName ||
                "",
              FileNumber: caseDetails?.DefendantEstFileNumber || "",
              CRNumber: caseDetails?.Defendant_CRNumber || "",
              Number700: caseDetails?.Defendant_Number700 || "",
              Region: caseDetails?.Defendant_Region || "",
              Region_Code: caseDetails?.Defendant_Region_Code || "",
              City: caseDetails?.Defendant_City || "",
              City_Code: caseDetails?.Defendant_City_Code || "",
              ContactNumber:
                caseDetails?.Defendant_PhoneNumber ||
                caseDetails?.Defendant_MobileNumber ||
                "",
            },
          }
        : {}),

      Defendant_MainGovtDefend: nullifyIfEmpty(
        createValueLabel(
          caseDetails?.Defendant_MainGovtDefend_Code,
          caseDetails?.Defendant_MainGovtDefend,
        ),
      ),
      DefendantSubGovtDefend: nullifyIfEmpty(
        createValueLabel(
          caseDetails?.DefendantSubGovtDefend_Code,
          caseDetails?.DefendantSubGovtDefend,
        ),
      ),
      main_category_of_the_government_entity: nullifyIfEmpty(
        createValueLabel(
          caseDetails?.Defendant_MainGovtDefend_Code,
          caseDetails?.Defendant_MainGovtDefend,
        ),
      ),
      subcategory_of_the_government_entity: nullifyIfEmpty(
        createValueLabel(
          caseDetails?.DefendantSubGovtDefend_Code,
          caseDetails?.DefendantSubGovtDefend,
        ),
      ),

      ...(isWorker
        ? {
            PlaintiffId: caseDetails.PlaintiffId,
          }
        : {}),
    };

    return extractedData;
  };

  const applyDefendantPrefilling = (details: any, _userType: string) => {
    const defendantData = extractDefendantData(details);

    Object.entries(defendantData).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        setValue(key, value);
      }
    });
  };

  const applyClaimantPrefilling = (details: any, userType: string) => {
    const isEstablishmentUser = userType
      ?.toLowerCase()
      .includes("establishment");

    if (isEstablishmentUser) {
      applyEstablishmentPrefilling(details);
      return;
    }

    if (isValidValue(details.PlaintiffId)) {
      setValue("idNumber", details.PlaintiffId);
    }

    if (isValidValue(details.PlaintiffHijiriDOB)) {
      setValue("hijriDate", details.PlaintiffHijiriDOB);
    }

    if (isValidValue(details.PlaintiffName)) {
      setValue("userName", details.PlaintiffName);
    }

    if (isValidValue(details.Plaintiff_PhoneNumber)) {
      setValue("phoneNumber", details.Plaintiff_PhoneNumber);
    }

    if (isValidValue(details.Plaintiff_ApplicantBirthDate)) {
      setValue("gregorianDate", details.Plaintiff_ApplicantBirthDate);
    }

    if (isValidValue(details.Plaintiff_FirstLanguage)) {
      setValue("firstLanguage", details.Plaintiff_FirstLanguage);
    }

    if (isValidValue(details.Plaintiff_EmailAddress)) {
      setValue("emailAddress", details.Plaintiff_EmailAddress);
    }

    if (isValidValue(details.Plaintiff_MobileNumber)) {
      setValue("mobileNumber", details.Plaintiff_MobileNumber);
    }

    if (details.PlaintiffType_Code === "Self(Worker)") {
      setValue("claimantStatus", "principal");
      setValue("applicantType", "principal");
    } else if (details.PlaintiffType_Code === "Agent") {
      setValue("claimantStatus", "representative");
      setValue("applicantType", "representative");
    }

    const regionValue = createValueLabel(
      details.Plaintiff_Region_Code,
      details.Plaintiff_Region,
    );
    if (regionValue) {
      setValue("plaintiffRegion", regionValue);
    }

    const cityValue = createValueLabel(
      details.Plaintiff_City_Code,
      details.Plaintiff_City,
    );
    if (cityValue) {
      setValue("plaintiffCity", cityValue);
    }

    const occupationValue = createValueLabel(
      details.Plaintiff_Occupation_Code,
      details.Plaintiff_Occupation,
    );
    if (occupationValue) {
      setValue("occupation", occupationValue);
    }

    const genderValue = createValueLabel(
      details.Plaintiff_Gender_Code,
      details.Plaintiff_Gender,
    );
    if (genderValue) {
      setValue("gender", genderValue);
    }

    const nationalityValue = createValueLabel(
      details.Plaintiff_Nationality_Code,
      details.Plaintiff_Nationality,
    );
    if (nationalityValue) {
      setValue("nationality", nationalityValue);
    }
  };

  const applyEstablishmentPrefilling = (details: any) => {
    const establishmentData = {
      CaseID: getCookie("caseId"),
      ApplicantType: "Establishment",
      ApplicantType_Code: "Establishment",
      PlaintiffName: details.PlaintiffName || "",
      Plaintiff_CRNumber: details.Plaintiff_CRNumber || "",
      Plaintiff_Number700: details.Plaintiff_Number700 || "",
      Plaintiff_StatusID: details.Plaintiff_StatusID || "",
      Plaintiff_PhoneNumber: details.Plaintiff_PhoneNumber || "",
      PlaintiffEstFileNumber: details.PlaintiffEstFileNumber || "",
      Plaintiff_Region: details.Plaintiff_Region || "",
      Plaintiff_Region_Code: details.Plaintiff_Region_Code || "",
      Plaintiff_City: details.Plaintiff_City || "",
      Plaintiff_City_Code: details.Plaintiff_City_Code || "",
    };

    localStorage.setItem("CaseDetails", JSON.stringify(establishmentData));

    setValue("claimantStatus", "establishment");
    setValue("applicantType", "establishment");
  };

  return {
    isFetched,
    isLoading,
    caseData,
    defendantData,
    hasDefendantPrefill,
  };
};

export default useCaseDetailsPrefill;
