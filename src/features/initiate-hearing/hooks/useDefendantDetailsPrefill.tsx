import { useEffect } from "react";
import { UseFormSetValue, UseFormTrigger } from "react-hook-form";
import { useCookieState } from "./useCookieState";
import { useLazyGetCaseDetailsQuery } from "@/features/manage-hearings/api/myCasesApis";

const useDefendantDetailsPrefill = (
  setValue: UseFormSetValue<any>,
  trigger: UseFormTrigger<any>
) => {
  const [getCookie, setCookie] = useCookieState();
  const [triggerCaseDetailsQuery, { data: fetchedCaseDetails, isSuccess }] =
    useLazyGetCaseDetailsQuery();

  useEffect(() => {
    const caseId = getCookie("caseId");
    const userType = getCookie("userType");
    const userClaims = getCookie("userClaims");
    const mainCategory = getCookie("mainCategory")?.value;
    const subCategory = getCookie("subCategory")?.value;

    if (caseId && userType) {
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
    }
  }, [getCookie, triggerCaseDetailsQuery]);

  useEffect(() => {
    if (isSuccess && fetchedCaseDetails) {
      setCookie("caseDetails", fetchedCaseDetails);
    }
  }, [isSuccess, fetchedCaseDetails, setCookie]);

  useEffect(() => {
    const caseDetails = getCookie("caseDetails");
    if (caseDetails?.CaseDetails) {
      const details = caseDetails.CaseDetails;

      setValue("defendantStatus", details.DefendantType || "Establishment");
      setValue(
        "defendantDetails",
        details.DefendantType === "Government" ? "Government" : "Others"
      );

      setValue("nationalIdNumber", details.DefendantId || "");
      setValue("def_date_hijri", details.DefendantHijiriDOB || "");
      setValue(
        "DefendantsEstablishmentPrisonerName",
        details.DefendantName || ""
      );
      setValue("mobileNumber", details.Defendant_PhoneNumber || "");

      setValue("defendantRegion", {
        value: details.Defendant_Region_Code || "",
        label: details.Defendant_Region || "",
      });
      setValue("defendantCity", {
        value: details.Defendant_City_Code || "",
        label: details.Defendant_City || "",
      });
      setValue("occupation", {
        value: details.Defendant_Occupation_Code || "",
        label: details.Defendant_Occupation || "",
      });
      setValue("gender", {
        value: details.Defendant_Gender_Code || "",
        label: details.Defendant_Gender || "",
      });
      setValue("nationality", {
        value: details.Defendant_Nationality_Code || "",
        label: details.Defendant_Nationality || "",
      });

      if (details.DefendantType === "Establishment") {
        setValue(
          "DefendantFileNumber",
          details.DefendantEstFileNumber || ""
        );
        setValue("Defendant_Establishment_data_NON_SELECTED", {
          EstablishmentName:
            details.Defendant_EstablishmentNameDetails || "",
          FileNumber: details.DefendantEstFileNumber || "",
          CRNumber: details.Defendant_CRNumber || "",
        });
      }

      if (details.DefendantType === "Government") {
        if (
          details.Defendant_MainGovtDefend_Code &&
          details.Defendant_MainGovtDefend
        ) {
          setValue(
            "main_category_of_the_government_entity",
            {
              value: details.Defendant_MainGovtDefend_Code,
              label: details.Defendant_MainGovtDefend,
            },
            { shouldValidate: true }
          );
        }

        if (
          details.DefendantSubGovtDefend_Code &&
          details.DefendantSubGovtDefend
        ) {
          setValue(
            "subcategory_of_the_government_entity",
            {
              value: details.DefendantSubGovtDefend_Code,
              label: details.DefendantSubGovtDefend,
            },
            { shouldValidate: true }
          );
        }
      }

      trigger("defendantStatus");
      trigger("defendantDetails");
      trigger("nationalIdNumber");
      trigger("def_date_hijri");
      trigger("DefendantsEstablishmentPrisonerName");
      trigger("mobileNumber");
      trigger("defendantRegion");
      trigger("defendantCity");
      trigger("occupation");
      trigger("gender");
      trigger("nationality");

      if (details.DefendantType === "Government") {
        trigger("main_category_of_the_government_entity");
        trigger("subcategory_of_the_government_entity");
      }

      if (details.DefendantType === "Establishment") {
        trigger("DefendantFileNumber");
        trigger("Defendant_Establishment_data_NON_SELECTED");
      }
    }
  }, [getCookie, setValue, trigger]);
};

export default useDefendantDetailsPrefill; 