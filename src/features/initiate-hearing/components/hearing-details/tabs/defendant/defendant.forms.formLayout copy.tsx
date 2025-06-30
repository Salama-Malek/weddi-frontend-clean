// import { UseFormSetValue, UseFormWatch } from "react-hook-form";
// import {
//   Option,
//   SectionLayout,
//   FormData,
// } from "@/shared/components/form/form.types";
// import { useFormOptions } from "./defendant.forms.formOptions";
// import { useTranslation } from "react-i18next";
// import { isArray } from "@/shared/lib/helpers";
// import React, { useEffect, useState, useMemo } from "react";
// import { options } from "@/features/initiate-hearing/config/Options";
// import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
// import EstablishmentSelectionSkeleton from "@/shared/components/loader/EstablishmentLoader";
// import {
//   useGetEstablishmentDetailsQuery,
//   useGetExtractedEstablishmentDataQuery,
//   useLazyGetEstablishmentDetailsQuery,
// } from "@/features/initiate-hearing/api/create-case/defendantDetailsApis";
// import { TokenClaims } from "@/features/login/components/AuthProvider";
// import { toast } from "react-toastify";
// import {
//   useGetWorkerCityLookupDataQuery,
//   useGetWorkerRegionLookupDataQuery,
// } from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";
// import { skipToken } from "@reduxjs/toolkit/query";
// import { UserTypesEnum } from "@/shared/types/userTypes.enum";

// export const useFormLayout = (
//   setValue: UseFormSetValue<FormData>,
//   watch: UseFormWatch<FormData>,
//   EstablishmentData?: any[],
//   governmentData?: any,
//   subGovernmentData?: any,
//   nicData?: any
// ): SectionLayout[] => {
//   const { IsGovernmentRadioOptions } = useFormOptions({ EstablishmentData });
//   const [getCookie, setCookie] = useCookieState({ caseId: "" });
//   const { t, i18n } = useTranslation("hearingdetails");
//   const defendantStatus = watch("defendantStatus");
//   const defendantDetails = watch("defendantDetails");

//   // Get incomplete case type from cookie
//   const incompleteCaseType = getCookie("incompleteCase");
//   const defendantTypeInfoFromCookie = getCookie("defendantTypeInfo");
//   const caseDetails = getCookie("caseDetails"); // Read caseDetails cookie

//   console.log("Initial: incompleteCaseType", incompleteCaseType);
//   console.log("Initial: defendantTypeInfoFromCookie", defendantTypeInfoFromCookie);
//   console.log("Initial: caseDetails", caseDetails);

//   // Determine enforced defendant type based on incomplete case type
//   const enforcedType = useMemo(() => {
//     if (!incompleteCaseType) return null;
//     if (incompleteCaseType.DefendantType === "Government") return "Government";
//     if (incompleteCaseType.DefendantType === "Establishment") return "Establishment";
//     return null;
//   }, [incompleteCaseType]);

//   console.log("Derived: enforcedType", enforcedType);

//   // Current defendant status from form state with sensible default, prioritizing caseDetails
//   const currentDefendantStatus = caseDetails?.CaseDetails?.DefendantType || enforcedType || defendantStatus || defendantTypeInfoFromCookie || "Establishment";

//   console.log("Calculated: currentDefendantStatus", currentDefendantStatus);

//   // Ensure form state matches enforced type or default
//   useEffect(() => {
//     const currentStatus = watch("defendantStatus");
//     const currentDetails = watch("defendantDetails");
    
//     if (caseDetails?.CaseDetails?.DefendantType && caseDetails.CaseDetails.DefendantType !== currentStatus) {
//       setValue("defendantStatus", caseDetails.CaseDetails.DefendantType);
//       setValue("defendantDetails", caseDetails.CaseDetails.DefendantType === "Government" ? "Government" : "Others");
//     } else if (enforcedType && enforcedType !== currentStatus) {
//       setValue("defendantStatus", enforcedType);
//       setValue("defendantDetails", enforcedType === "Government" ? "Government" : "Others");
//     } else if (!currentStatus) {
//       setValue("defendantStatus", "Establishment");
//       setValue("defendantDetails", "Others");
//     }
//   }, [enforcedType, caseDetails?.CaseDetails?.DefendantType]); // Minimal dependencies

//   // Determine if we should show the defendant status selection
//   const shouldShowDefendantStatus = !enforcedType && !caseDetails?.CaseDetails?.DefendantType;

//   // Determine which fields to show based on status
//   const showGovernmentFields = currentDefendantStatus === "Government";
//   const showEstablishmentFields = currentDefendantStatus === "Establishment";

//   console.log("Rendering: showGovernmentFields", showGovernmentFields);
//   console.log("Rendering: showEstablishmentFields", showEstablishmentFields);
//   console.log("Rendering: currentDefendantStatus for sections", currentDefendantStatus);

//   //#region hassan
//   const userClaims: TokenClaims = getCookie("userClaims");
//   const userType = getCookie("userType");

//   const [wrorkedEstablishmetUsers, setWrorkedEstablishmetUsers] = useState<Array<{ label: string; value: string }>>([]);
//   const [establishmentDetailsByFileNumber, setEstablishmentDetailsByFileNumber] = useState<any>({});
//   const [selectedDataEstablishment, setSelectedDataEstablishment] = useState<boolean>(false);

//   const { data: getEstablismentWorkingData, isLoading: ExtractEstDataLoading } =
//     useGetExtractedEstablishmentDataQuery(
//       {
//         WorkerId: watch("claimantStatus") === "representative"
//           ? watch("workerAgentIdNumber")
//           : userClaims?.UserID,
//         AcceptedLanguage: i18n.language.toUpperCase(),
//         SourceSystem: "E-Services",
//         UserType: userType,
//       }
//     );

//   useEffect(() => {
//     if (getEstablismentWorkingData?.EstablishmentInfo) {
//       const newOptions = getEstablismentWorkingData.EstablishmentInfo.map((est: any) => ({
//         label: est.EstablishmentName,
//         value: est.EstablishID,
//       })).concat({
//         label: t("others"),
//         value: "Others",
//       });
      
//       if (JSON.stringify(newOptions) !== JSON.stringify(wrorkedEstablishmetUsers)) {
//         setWrorkedEstablishmetUsers(newOptions);
//       }
//     } else {
//       const currentDetails = watch("defendantDetails");
//       if (currentDetails !== "Others") {
//         setValue("defendantDetails", "Others");
//       }
//       setWrorkedEstablishmetUsers([
//         {
//           label: t("others"),
//           value: "Others",
//         },
//       ]);
//     }
//   }, [getEstablismentWorkingData]); // Minimal dependency

//   const hasEstablishments = isArray(wrorkedEstablishmetUsers) && wrorkedEstablishmetUsers.length > 0;

//   // Show Non-Governmental and Governmental entities only if no establishments or user chooses "Others"
//   const showGovNonGovRadios = !hasEstablishments || defendantDetails === "Others";

//   // Simplify section visibility based on currentDefendantStatus
//   const showGovSectionFields = currentDefendantStatus === "Government";
//   const showNonGovSection = currentDefendantStatus === "Establishment";

//   const GovernmentOptions = React.useMemo(() => {
//     return (
//       governmentData?.map((item: any) => ({
//         value: item.ElementKey,
//         label: item.ElementValue,
//       })) || []
//     );
//   }, [governmentData]);

//   const SubGovernmentOptions = React.useMemo(() => {
//     return (
//       subGovernmentData?.map((item: any) => ({
//         value: item.ElementKey,
//         label: item.ElementValue,
//       })) || []
//     );
//   }, [subGovernmentData]);

//   // to get establishment data from field input
//   const [
//     triggerGetStablishmentData,
//     { data: establishmentData, isLoading: isEstablishmentLoading },
//   ] = useLazyGetEstablishmentDetailsQuery();

//   useEffect(() => {
//     if (establishmentData?.EstablishmentInfo?.[0]) {
//       const currentData = watch("Defendant_Establishment_data_NON_SELECTED");
//       const newData = establishmentData.EstablishmentInfo[0];
      
//       if (JSON.stringify(currentData) !== JSON.stringify(newData)) {
//         setEstablishmentDetailsByFileNumber(newData);
//         setCookie("getDefendEstablishmentData", newData);
//         setCookie("defendantDetails", newData);
//         setValue("Defendant_Establishment_data_NON_SELECTED", newData);
//       }
//     }
//   }, [establishmentData]); // Minimal dependency

//   useEffect(() => {
//     if (establishmentData?.EstablishmentInfo?.[0]) {
//       const currentData = watch("Defendant_Establishment_data_NON_SELECTED");
//       const newData = establishmentData.EstablishmentInfo[0];
      
//       if (JSON.stringify(currentData) !== JSON.stringify(newData)) {
//         setValue("Defendant_Establishment_data_NON_SELECTED", newData);

//         const currentRegion = watch("region");
//         const newRegion = {
//           label: newData.Region,
//           value: newData.Region_Code,
//         };
        
//         if (JSON.stringify(currentRegion) !== JSON.stringify(newRegion)) {
//           setValue("region", newRegion);
//         }

//         const currentCity = watch("city");
//         const newCity = {
//           label: newData.City,
//           value: newData.City_Code,
//         };
        
//         if (JSON.stringify(currentCity) !== JSON.stringify(newCity)) {
//           setValue("city", newCity);
//         }

//         setValue("Defendant_Establishment_data_NON_SELECTED.region.value", newData.Region_Code);
//         setValue("Defendant_Establishment_data_NON_SELECTED.region.label", newData.Region);
//         setValue("Defendant_Establishment_data_NON_SELECTED.city.value", newData.City_Code);
//         setValue("Defendant_Establishment_data_NON_SELECTED.city.label", newData.City);
//       }
//     }
//   }, [establishmentData]); // Minimal dependency

//   // treger the function on loase focuse
//   const getEstablishmentDataByFileNumber = async () => {
//     const fNumber = watch("DefendantFileNumber");
//     if (!fNumber) return;
//     await triggerGetStablishmentData({
//       AcceptedLanguage: i18n.language.toUpperCase(),
//       SourceSystem: "E-Services",
//       FileNumber: fNumber,
//     });
//   };

//   // to get estrablishment data from redio selection
//   const [
//     triggerMyEstablishmentData,
//     { data: myEstablishment, isLoading: isMyEstablishmentLoading },
//   ] = useLazyGetEstablishmentDetailsQuery();

//   useEffect(() => {
//     if (myEstablishment?.EstablishmentInfo?.[0]) {
//       const currentData = watch("Defendant_Establishment_data");
//       const newData = myEstablishment.EstablishmentInfo[0];
      
//       if (JSON.stringify(currentData) !== JSON.stringify(newData)) {
//         setCookie("getDefendEstablishmentData", newData);
//         setCookie("defendantDetails", newData);
//         setValue("Defendant_Establishment_data", newData, {
//           shouldValidate: true,
//         });

//         setValue("Defendant_Establishment_data.region.value", newData.Region_Code);
//         setValue("Defendant_Establishment_data.region.label", newData.Region);
//         setValue("Defendant_Establishment_data.city.value", newData.City_Code);
//         setValue("Defendant_Establishment_data.city.label", newData.City);
//       }
//     } else if (myEstablishment?.ErrorList) {
//       toast.warning("Feild To Fetch");
//       setValue("Defendant_Establishment_data", {
//         region: null,
//         city: null,
//       }, {
//         shouldValidate: false,
//       });
//     }
//   }, [myEstablishment]); // Minimal dependency

//   const getSelectedEstablishmentData = async (value: string) => {
//     if (value === "Others") {
//       setValue("DefendantFileNumber", "", {
//         shouldValidate: false,
//       });
//       setSelectedDataEstablishment(false);
//       return;
//     }
//     const selectedEstFileNumber = extracFileNumberFromWorkingEstData(value);
//     const res = await triggerMyEstablishmentData({
//       AcceptedLanguage: i18n.language.toUpperCase(),
//       SourceSystem: "E-Services",
//       FileNumber: selectedEstFileNumber,
//     });
//     // console.log("resjdshj", res);

//     res && setSelectedDataEstablishment(true);
//   };

//   const extracFileNumberFromWorkingEstData = (estId: string) => {
//     const establishment: any = getEstablismentWorkingData?.EstablishmentInfo?.find(
//       (val: any) => val.EstablishID === estId
//     );
//     return establishment ? establishment.FileNumber : null;
//   };

//   const region = watch("region");

//   // Region/City/Occupation/Nationality lookups
//   const { data: regionData } = useGetWorkerRegionLookupDataQuery({
//     AcceptedLanguage: i18n.language.toUpperCase(),
//     SourceSystem: "E-Services",
//     ModuleKey: "EstablishmentRegion",
//     ModuleName: "EstablishmentRegion",
//   });
//   const { data: cityData } = useGetWorkerCityLookupDataQuery(
//     region && typeof region === "object" && "value" in region
//       ? {
//           AcceptedLanguage: i18n.language.toUpperCase(),
//           SourceSystem: "E-Services",
//           selectedWorkerRegion: { value: (region as { value: string }).value },
//           ModuleName: "EstablishmentCity",
//         }
//       : skipToken
//   );

//   const RegionOptions = React.useMemo(() => {
//     return (
//       (regionData &&
//         regionData?.DataElements?.map((item: any) => ({
//           value: item.ElementKey,
//           label: item.ElementValue,
//         }))) ||
//       []
//     );
//   }, [regionData]);

//   const CityOptions = React.useMemo(() => {
//     return (
//       (cityData &&
//         cityData?.DataElements?.map((item: any) => ({
//           value: item.ElementKey,
//           label: item.ElementValue,
//         }))) ||
//       []
//     );
//   }, [cityData]);

//   useEffect(() => {
//     if (nicData?.NICDetails) {
//       const currentName = watch("DefendantsPrisonerName");
//       const currentRegion = watch("DefendantsRegion");
//       const currentCity = watch("DefendantsCity");
//       const currentOccupation = watch("DefendantsOccupation");
//       const currentGender = watch("DefendantsGender");
//       const currentNationality = watch("DefendantsNationality");
      
//       if (currentName !== nicData.NICDetails.PlaintiffName) {
//         setValue("DefendantsPrisonerName", nicData.NICDetails.PlaintiffName, {
//           shouldValidate: true,
//         });
//       }
      
//       if (currentRegion !== (nicData.NICDetails.Region_Code || nicData.NICDetails.Region)) {
//         setValue("DefendantsRegion", nicData.NICDetails.Region_Code || nicData.NICDetails.Region, {
//           shouldValidate: true,
//         });
//       }
      
//       if (currentCity !== (nicData.NICDetails.City_Code || nicData.NICDetails.City)) {
//         setValue("DefendantsCity", nicData.NICDetails.City_Code || nicData.NICDetails.City, {
//           shouldValidate: true,
//         });
//       }
      
//       if (currentOccupation !== (nicData.NICDetails.Occupation_Code || nicData.NICDetails.Occupation)) {
//         setValue("DefendantsOccupation", nicData.NICDetails.Occupation_Code || nicData.NICDetails.Occupation, {
//           shouldValidate: true,
//         });
//       }
      
//       if (currentGender !== (nicData.NICDetails.Gender_Code || nicData.NICDetails.Gender)) {
//         setValue("DefendantsGender", nicData.NICDetails.Gender_Code || nicData.NICDetails.Gender, {
//           shouldValidate: true,
//         });
//       }
      
//       if (currentNationality !== (nicData.NICDetails.Nationality_Code || nicData.NICDetails.Nationality)) {
//         setValue("DefendantsNationality", nicData.NICDetails.Nationality_Code || nicData.NICDetails.Nationality, {
//           shouldValidate: true,
//         });
//       }
      
//       setValue("DefendantsPrisonerId", watch("nationalIdNumber"));
//     }
//   }, [nicData]); // Minimal dependency

//   return [
//     // Establishment Selection Section
//     ...(currentDefendantStatus === "Establishment"
//       ? ExtractEstDataLoading
//         ? [
//             {
//               title: t("tab2_title"),
//               isRadio: true,
//               children: [
//                 {
//                   type: "custom",
//                   component: <EstablishmentSelectionSkeleton />,
//                 },
//               ],
//             },
//           ]
//         : wrorkedEstablishmetUsers && wrorkedEstablishmetUsers.length > 0
//         ? [
//             {
//               title: t("tab2_title"),
//               isRadio: true,
//               children: [
//                 {
//                   type: "radio",
//                   name: "defendantDetails",
//                   label: t("estab_name"),
//                   options: wrorkedEstablishmetUsers,
//                   value: defendantDetails,
//                   hasIcon: true,
//                   onChange: (value: string) => {
//                     getSelectedEstablishmentData(value);
//                     setValue("defendantDetails", value);
//                     setValue("defendantStatus", value);
//                   },
//                 },
//               ],
//             },
//           ]
//         : [
//             {
//               title: t("tab2_title"),
//               isRadio: true,
//               children: [
//                 {
//                   type: "radio",
//                   name: "defendantDetails",
//                   label: t("estab_name"),
//                   options: [
//                     {
//                       label: t("others"),
//                       value: "Others",
//                     },
//                   ],
//                   value: defendantDetails,
//                   hasIcon: true,
//                 },
//               ],
//             },
//           ]
//       : []), // This ensures an empty array when not Establishment

//     // Type of Defendant Radio Buttons Section
//     ...(shouldShowDefendantStatus
//       ? [
//           {
//             title: t("type_of_defendant"),
//             isRadio: true,
//             children: [
//               {
//                 type: "radio",
//                 name: "defendantStatus",
//                 label: t("type_of_defendant"),
//                 options: IsGovernmentRadioOptions,
//                 value: currentDefendantStatus,
//                 onChange: (value: string) => setValue("defendantStatus", value),
//                 notRequired: true,
//               },
//             ],
//           },
//         ]
//       : []), // This ensures an empty array when defendant type is pre-set

//     { // Government Fields Section
//       title: "",
//       children: [
//         showGovernmentFields && {
//           notRequired: false,
//           type: "autocomplete",
//           label: t("main_category_of_the_government_entity"),
//           name: "main_category_of_the_government_entity",
//           options: GovernmentOptions,
//           validation: { required: t("mainCategoryGovernValidation") },
//           value: "",
//         },
//         showGovernmentFields && {
//           type: "autocomplete",
//           label: t("subcategory_of_the_government_entity"),
//           name: "subcategory_of_the_government_entity",
//           options: SubGovernmentOptions,
//           validation: { required: t("subCategoryGovernValidation") },
//           value: "",
//         },
//       ].filter(Boolean) as Option[],
//     },

//     ...(showEstablishmentFields
//       ? [
//           { // Non-Government (Establishment-specific input) fields section
//             removeMargin: true,
//             children: [
//               {  // This is the file number field for establishment
//                 type: "input",
//                 label: t("fileNumber"),
//                 name: "DefendantFileNumber",
//                 inputType: "text",
//                 value: "",
//                 onBlur: () => getEstablishmentDataByFileNumber(),
//                 validation: {
//                   required: t("fileNumberValidation"),
//                 },
//               },
//               ...(establishmentDetailsByFileNumber
//                 ? [
//                     {
//                       isLoading: isEstablishmentLoading,
//                       type: "readonly",
//                       label: t("commercialRegistrationNumber"),
//                       value: establishmentDetailsByFileNumber?.CRNumber,
//                     },
//                     {
//                       isLoading: isEstablishmentLoading,
//                       type: "readonly",
//                       label: t("name"),
//                       value: establishmentDetailsByFileNumber?.EstablishmentName,
//                     },
//                     {
//                       isLoading: isEstablishmentLoading,
//                       label: t("region"),
//                       name: "region",
//                       validation: { required: t("regionValidation") },
//                       type: !establishmentDetailsByFileNumber?.Region
//                         ? "autocomplete"
//                         : "readonly",
//                       value: establishmentDetailsByFileNumber?.Region || "",
//                       ...(!establishmentDetailsByFileNumber?.Region && {
//                         options: RegionOptions || [],
//                         validation: { required: t("regionValidation") },
//                       }),
//                       onChange: (v: string) => setValue("region", v),
//                     },
//                     {
//                       isLoading: isEstablishmentLoading,
//                       type: !establishmentDetailsByFileNumber?.City
//                         ? "autocomplete"
//                         : "readonly",
//                       label: t("city"),
//                       name: "city",
//                       validation: { required: t("cityValidation") },
//                       value: watch(
//                         "Defendant_Establishment_data_NON_SELECTED.city.label"
//                       ),
//                       options: CityOptions,
//                       onChange: (v: string) => setValue("city", v),
//                     },
//                     { // This is the phone number field for establishment
//                       maxLength: 10,
//                       type: "input",
//                       name: "phoneNumber",
//                       label: t("phoneNumber"),
//                       inputType: "text",
//                       placeholder: "05xxxxxxxx",
//                       validation: {
//                         required: t("phoneNumberValidation"),
//                         pattern: {
//                           value: /^05\d{8}$/,
//                           message: t(
//                             "Please enter phone number must start with 05."
//                           ),
//                         },
//                       },
//                     },
//                   ]
//                 : []),
//             ],
//           },
//         ]
//       : []), // Ensure this always returns an array or an empty array
//   ].filter(Boolean) as SectionLayout[];
// };
