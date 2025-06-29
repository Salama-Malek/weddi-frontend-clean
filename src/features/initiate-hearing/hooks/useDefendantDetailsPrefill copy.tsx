// import { useEffect } from "react";
// import { UseFormSetValue } from "react-hook-form";
// import { useCookieState } from "./useCookieState";
// import { useLazyGetCaseDetailsQuery } from "@/features/manage-hearings/api/myCasesApis";

// const useDefendantDetailsPrefill = (setValue: UseFormSetValue<any>, trigger?: (name: string) => void) => {
//   const [getCookie, setCookie] = useCookieState();
//   const [triggerCaseDetailsQuery, { data: fetchedCaseDetails, isSuccess }] = useLazyGetCaseDetailsQuery();

//   useEffect(() => {
//     const caseId = getCookie("caseId");
//     const userType = getCookie("userType");
//     const userClaims = getCookie("userClaims");
//     const mainCategory = getCookie("mainCategory")?.value;
//     const subCategory = getCookie("subCategory")?.value;

//     if (caseId && userType) {
//       const userConfigs: any = {
//         Worker: {
//           UserType: userType,
//           IDNumber: userClaims?.UserID,
//         },
//         Establishment: {
//           UserType: userType,
//           IDNumber: userClaims?.UserID,
//           FileNumber: userClaims?.File_Number,
//         },
//         "Legal representative": {
//           UserType: userType,
//           IDNumber: userClaims?.UserID,
//           MainGovernment: mainCategory || "",
//           SubGovernment: subCategory || "",
//         },
//       };

//       triggerCaseDetailsQuery({
//         ...userConfigs[userType],
//         CaseID: caseId,
//         AcceptedLanguage: userClaims?.AcceptedLanguage?.toUpperCase() || "EN",
//         SourceSystem: "E-Services",
//       });
//     }
//   }, [getCookie, triggerCaseDetailsQuery]);

//   // New useEffect to set caseDetails cookie when data is fetched successfully
//   useEffect(() => {
//     if (isSuccess && fetchedCaseDetails) {
//       const currentCaseDetails = getCookie("caseDetails");
//       if (JSON.stringify(currentCaseDetails) !== JSON.stringify(fetchedCaseDetails)) {
//         setCookie("caseDetails", fetchedCaseDetails);
//         console.log("useDefendantDetailsPrefill: caseDetails cookie set", fetchedCaseDetails);
//       }
//     }
//   }, [isSuccess, fetchedCaseDetails, setCookie, getCookie]);

//   useEffect(() => {
//     const caseDetails = getCookie("caseDetails");
//     if (caseDetails?.CaseDetails) {
//       const details = caseDetails.CaseDetails;

//       // Set defendant type
//       setValue("defendantStatus", details.DefendantType || "Establishment");
//       setValue("defendantDetails", details.DefendantType === "Government" ? "Government" : "Others");

//       // Set core fields
//       setValue("nationalIdNumber", details.DefendantId || "");
//       setValue("def_date_hijri", details.DefendantHijiriDOB || "");
//       setValue("DefendantsEstablishmentPrisonerName", details.DefendantName || "");
//       setValue("mobileNumber", details.Defendant_PhoneNumber || "");

//       // Set select fields with value/label pairs
//       setValue("region", { 
//         value: details.Defendant_Region_Code || "", 
//         label: details.Defendant_Region || "" 
//       });
//       setValue("city", { 
//         value: details.Defendant_City_Code || "", 
//         label: details.Defendant_City || "" 
//       });
//       setValue("occupation", { 
//         value: details.Defendant_Occupation_Code || "", 
//         label: details.Defendant_Occupation || "" 
//       });
//       setValue("gender", { 
//         value: details.Defendant_Gender_Code || "", 
//         label: details.Defendant_Gender || "" 
//       });
//       setValue("nationality", { 
//         value: details.Defendant_Nationality_Code || "", 
//         label: details.Defendant_Nationality || "" 
//       });

//       // Set establishment specific fields if applicable
//       if (details.DefendantType === "Establishment") {
//         setValue("DefendantFileNumber", details.DefendantEstFileNumber || "");
//         setValue("Defendant_Establishment_data_NON_SELECTED", {
//           EstablishmentName: details.Defendant_EstablishmentNameDetails || "",
//           FileNumber: details.DefendantEstFileNumber || "",
//           CRNumber: details.Defendant_CRNumber || ""
//         });
//       }

//       // Set government specific fields if applicable
//       if (details.DefendantType === "Government") {
//         // Set main category with both code and label
//         if (details.Defendant_MainGovtDefend_Code && details.Defendant_MainGovtDefend) {
//           setValue("main_category_of_the_government_entity", {
//             value: details.Defendant_MainGovtDefend_Code,
//             label: details.Defendant_MainGovtDefend
//           }, { shouldValidate: true });
//         }

//         // Set subcategory with both code and label
//         if (details.DefendantSubGovtDefend_Code && details.DefendantSubGovtDefend) {
//           setValue("subcategory_of_the_government_entity", {
//             value: details.DefendantSubGovtDefend_Code,
//             label: details.DefendantSubGovtDefend
//           }, { shouldValidate: true });
//         }
//       }

//       // Trigger validation after setting all values
//       if (trigger) {
//         trigger("defendantStatus");
//         trigger("defendantDetails");
//         trigger("nationalIdNumber");
//         trigger("def_date_hijri");
//         trigger("DefendantsEstablishmentPrisonerName");
//         trigger("mobileNumber");
//         trigger("region");
//         trigger("city");
//         trigger("occupation");
//         trigger("gender");
//         trigger("nationality");

//         // Government specific fields
//         if (details.DefendantType === "Government") {
//           trigger("main_category_of_the_government_entity");
//           trigger("subcategory_of_the_government_entity");
//         }

//         // Establishment specific fields
//         if (details.DefendantType === "Establishment") {
//           trigger("DefendantFileNumber");
//           trigger("Defendant_Establishment_data_NON_SELECTED");
//         }
//       }
//     }
//   }, [getCookie, setValue, trigger, isSuccess, fetchedCaseDetails]);
// };

// export default useDefendantDetailsPrefill; 