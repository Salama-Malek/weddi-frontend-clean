import { useEffect, useState } from "react";
import { useLazyGetCaseDetailsQuery } from "@/features/hearings/manage/api/myCasesApis";
import { useCookieState } from "./useCookieState";

const isValidValue = (value: any): boolean => {
  return value !== undefined && value !== null && value !== "";
};

function nullifyIfEmpty(obj: any) {
  if (!obj || (obj.value === undefined && obj.label === undefined)) {
    return null;
  }
  return obj;
}
const createValueLabel = (value: string, label: string) => {
  if (!isValidValue(value) && !isValidValue(label)) return null;
  return {
    value: value || "",
    label: label || "",
  };
};
interface PrefillOptions {
  setValue: (field: string, value: any) => void;
  trigger?: (name?: string | string[]) => Promise<boolean>;
  prefillType?: "claimant" | "defendant" | "embassy" | "all";
  userType?: string;
}

const useDefendantDetailsPrefill = ({
  setValue,
  trigger,
  prefillType = "all",
}: PrefillOptions) => {
  const [getCookie] = useCookieState();
  const [triggerCaseDetailsQuery] = useLazyGetCaseDetailsQuery();
  const [isFeatched, setIsfetched] = useState(false);
  const [defendantData, setDefendantData] = useState<any | null>(null);
  const [hasDefendantPrefill, setHasDefendantPrefill] =
    useState<boolean>(false);

  useEffect(() => {}, [trigger, prefillType]);
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

    triggerCaseDetailsQuery(payload).then((result) => {
      const details = result?.data?.CaseDetails;
      setIsfetched(true);
      if (!details) return;
      localStorage.setItem("DefendantDetails", JSON.stringify(details));
      setDefendantData(EXtractDefendantDetailsData(details));
      applyDefendantPrefilling(details);
    });
  }, []);
  const extractDefendantData = (caseDetails: any) => {
    const isEstablishment = caseDetails?.DefendantType_Code === "Establishment";

    const phoneNumberCondition1 =
      caseDetails?.Defendant_PhoneNumber &&
      caseDetails?.Defendant_PhoneNumber !== "0";
    const phoneNumberCondition2 =
      caseDetails?.Defendant_MobileNumber &&
      caseDetails?.Defendant_MobileNumber !== "0";
    const finalPhoneNumber =
      (phoneNumberCondition1 ? caseDetails?.Defendant_PhoneNumber : "") ||
      (phoneNumberCondition2 ? caseDetails?.Defendant_MobileNumber : "") ||
      "";

    const isWorker = caseDetails?.ApplicantType_Code === "Worker";

    const hasDefendantData = !!(
      caseDetails?.DefendantName ||
      caseDetails?.Defendant_Region_Code ||
      caseDetails?.Defendant_City_Code ||
      caseDetails?.DefendantEstFileNumber ||
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

      ...(isEstablishment
        ? {}
        : {
            nationalIdNumber: caseDetails?.DefendantId || "",
            def_date_hijri: caseDetails?.DefendantHijiriDOB || "",
            def_date_gregorian: caseDetails?.Defendant_ApplicantBirthDate || "",
            DefendantsEstablishmentPrisonerName:
              caseDetails?.DefendantName || "",
          }),

      mobileNumber: finalPhoneNumber,
      establishment_phoneNumber: finalPhoneNumber,

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
              ContactNumber: finalPhoneNumber,
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

  const applyDefendantPrefilling = (details: any) => {
    const defendantData = extractDefendantData(details);

    Object.entries(defendantData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        setValue(key, value);
      }
    });
  };

  const EXtractDefendantDetailsData = (caseDetails: any) => {
    return {
      defendantStatus: caseDetails?.DefendantType,
      defendantDetails:
        caseDetails?.DefendantType_Code === "Government"
          ? "Government"
          : "Others",

      nationalIdNumber: caseDetails?.DefendantId || "",
      def_date_hijri: caseDetails?.DefendantHijiriDOB || "",
      def_date_gregorian: caseDetails?.Defendant_ApplicantBirthDate || "",
      DefendantsEstablishmentPrisonerName: caseDetails?.DefendantName || "",

      mobileNumber:
        caseDetails?.Defendant_PhoneNumber ||
        caseDetails?.Defendant_MobileNumber ||
        "",
      establishment_phoneNumber:
        caseDetails?.Defendant_PhoneNumber ||
        caseDetails?.Defendant_MobileNumber ||
        "",

      defendantRegion: nullifyIfEmpty({
        value: caseDetails?.Defendant_Region_Code,
        label: caseDetails?.Defendant_Region,
      }),
      defendantCity: nullifyIfEmpty({
        value: caseDetails?.Defendant_City_Code,
        label: caseDetails?.Defendant_City,
      }),

      occupation: nullifyIfEmpty({
        value: caseDetails?.Defendant_Occupation_Code,
        label: caseDetails?.Defendant_Occupation,
      }),
      gender: nullifyIfEmpty({
        value: caseDetails?.Defendant_Gender_Code,
        label: caseDetails?.Defendant_Gender,
      }),
      nationality: nullifyIfEmpty({
        value: caseDetails?.Defendant_Nationality_Code,
        label: caseDetails?.Defendant_Nationality,
      }),

      DefendantFileNumber: caseDetails?.DefendantEstFileNumber || "",
      Defendant_CRNumber: caseDetails?.Defendant_CRNumber || "",
      Defendant_Number700: caseDetails?.Defendant_Number700 || "",

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
        region: nullifyIfEmpty({
          value: caseDetails?.Defendant_Region_Code,
          label: caseDetails?.Defendant_Region,
        }),
        city: nullifyIfEmpty({
          value: caseDetails?.Defendant_City_Code,
          label: caseDetails?.Defendant_City,
        }),
      },

      main_category_of_the_government_entity: nullifyIfEmpty({
        value: caseDetails?.Defendant_MainGovtDefend_Code,
        label: caseDetails?.Defendant_MainGovtDefend,
      }),
      subcategory_of_the_government_entity: nullifyIfEmpty({
        value: caseDetails?.DefendantSubGovtDefend_Code,
        label: caseDetails?.DefendantSubGovtDefend,
      }),

      PlaintiffId: caseDetails?.PlaintiffId || "",

      DefendantType: caseDetails?.DefendantType || "",
      DefendantType_Code: caseDetails?.DefendantType_Code || "",
      Defendant_StatusID: caseDetails?.Defendant_StatusID || "",
    };
  };

  return {
    isFeatched,
    defendantData,
    hasDefendantPrefill,
  };
};

export default useDefendantDetailsPrefill;
