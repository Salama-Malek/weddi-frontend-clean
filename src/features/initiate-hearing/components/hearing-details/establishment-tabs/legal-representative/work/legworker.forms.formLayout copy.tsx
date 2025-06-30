// import { UseFormSetValue, UseFormWatch, Control, UseFormTrigger } from "react-hook-form";
// import { useTranslation } from "react-i18next";
// import HijriDateField from "@/shared/components/calanders/NewDatePicker";
// import { formatDateString } from "@/shared/lib/helpers";
// import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";

// import {
//   Option,
//   SectionLayout,
//   FormData,
// } from "@/shared/components/form/form.types";
// import React, { useEffect } from "react";
// import { options } from "@/features/initiate-hearing/config/Options";
// import {
//   useGetLaborOfficeLookupDataQuery,
//   useGetWorkerCityLookupDataQuery,
//   useGetWorkerRegionLookupDataQuery,
// } from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";
// import {
//   useGetContractTypeLookupQuery,
//   useGetSalaryTypeLookupQuery,
//   useLazyGetContractTypeLookupQuery,
// } from "@/features/initiate-hearing/api/create-case/workDetailApis";

// // Add case details retrieval hook
// const useCaseDetailsPrefill = (setValue: UseFormSetValue<FormData>) => {
//   const [getCookie] = useCookieState({ caseId: "" });
//   const caseDetails = getCookie("caseDetails");

//   // Add effect to handle labor office changes based on region and city
//   useEffect(() => {
//     const region = getCookie("region");
//     const city = getCookie("city");
    
//     if (region?.value && city?.value) {
//       // Reset labor office when region or city changes
//       setValue("laborOffice", null);
//     }
//   }, [getCookie, setValue]);

//   useEffect(() => {
//     if (!caseDetails?.CaseDetails) return;
    
//     const details = caseDetails.CaseDetails;
//     const currentValues = {
//       typeOfWage: getCookie("typeOfWage"),
//       salary: getCookie("salary"),
//       contractType: getCookie("contractType"),
//       contractNumber: getCookie("contractNumber"),
//       contractDateGregorian: getCookie("contractDateGregorian"),
//       contractDateHijri: getCookie("contractDateHijri"),
//       contractExpiryDateGregorian: getCookie("contractExpiryDateGregorian"),
//       contractExpiryDateHijri: getCookie("contractExpiryDateHijri"),
//       isStillEmployed: getCookie("isStillEmployed"),
//       dateOfFirstWorkingDayGregorian: getCookie("dateOfFirstWorkingDayGregorian"),
//       dateofFirstworkingdayHijri: getCookie("dateofFirstworkingdayHijri"),
//       dateOfLastWorkingDayGregorian: getCookie("dateOfLastWorkingDayGregorian"),
//       dateoflastworkingdayHijri: getCookie("dateoflastworkingdayHijri"),
//       region: getCookie("region"),
//       city: getCookie("city"),
//       laborOffice: getCookie("laborOffice")
//     };

//     // Get values based on whether they're plaintiff or defendant fields
//     const salaryType = details.Plaintiff_SalaryType || details.Defendant_SalaryType;
//     const salary = details.Plaintiff_Salary || details.Defendant_Salary;
//     const contractType = details.Plaintiff_ContractType || details.Defendant_ContractType;
//     const contractNumber = details.Plaintiff_ContractNumber || details.Defendant_ContractNumber;
//     const contractStartDate = details.Plaintiff_ContractStartDate || details.Defendant_ContractStartDate;
//     const contractStartDateHijri = details.Plaintiff_ContractStartDateHijri || details.Defendant_ContractStartDateHijri;
//     const contractEndDate = details.Plaintiff_ContractEndDate || details.Defendant_ContractEndDate;
//     const contractEndDateHijri = details.Plaintiff_ContractEndDateHijri || details.Defendant_ContractEndDateHijri;
//     const stillWorking = details.Plaintiff_StillWorking || details.Defendant_StillWorking;
//     const jobStartDate = details.Plaintiff_JobStartDate || details.Defendant_JobStartDate;
//     const jobEndDate = details.Plaintiff_JobEndDate || details.Defendant_JobEndDate;
//     const jobLocation = details.Plaintiff_JobLocation || details.Defendant_JobLocation;
//     const jobLocationCode = details.Plaintiff_JobLocation_Code || details.Defendant_JobLocation_Code;
//     const jobCity = details.PlaintiffJobCity || details.DefendantJobCity;
//     const jobCityCode = details.PlaintiffJobCity_Code || details.DefendantJobCity_Code;
//     const laborOfficeCode = details.OfficeName_Code;
//     const laborOfficeName = details.OfficeName;
    
//     // Only update if values are different
//     if (salaryType && JSON.stringify(currentValues.typeOfWage) !== JSON.stringify({
//       value: salaryType,
//       label: salaryType,
//     })) {
//       setValue("typeOfWage", {
//         value: salaryType,
//         label: salaryType,
//       });
//     }
    
//     if (salary && currentValues.salary !== salary) {
//       setValue("salary", salary);
//     }
    
//     if (contractType && JSON.stringify(currentValues.contractType) !== JSON.stringify({
//       value: contractType,
//       label: contractType,
//     })) {
//       setValue("contractType", {
//         value: contractType,
//         label: contractType,
//       });
//     }
    
//     if (contractNumber && currentValues.contractNumber !== contractNumber) {
//       setValue("contractNumber", contractNumber);
//     }
    
//     if (contractStartDate) {
//       const formattedDate = formatDateString(contractStartDate);
//       if (currentValues.contractDateGregorian !== formattedDate) {
//         setValue("contractDateGregorian", formattedDate);
//       }
//     }
    
//     if (contractStartDateHijri) {
//       // Convert YYYYMMDD to YYYY/MM/DD format
//       const y = contractStartDateHijri.slice(0, 4);
//       const m = contractStartDateHijri.slice(4, 6);
//       const d = contractStartDateHijri.slice(6);
//       const formattedDate = `${y}/${m}/${d}`;
//       if (currentValues.contractDateHijri !== formattedDate) {
//         setValue("contractDateHijri", formattedDate);
//       }
//     }
    
//     if (contractEndDate) {
//       const formattedDate = formatDateString(contractEndDate);
//       if (currentValues.contractExpiryDateGregorian !== formattedDate) {
//         setValue("contractExpiryDateGregorian", formattedDate);
//       }
//     }
    
//     if (contractEndDateHijri) {
//       // Convert YYYYMMDD to YYYY/MM/DD format
//       const y = contractEndDateHijri.slice(0, 4);
//       const m = contractEndDateHijri.slice(4, 6);
//       const d = contractEndDateHijri.slice(6);
//       const formattedDate = `${y}/${m}/${d}`;
//       if (currentValues.contractExpiryDateHijri !== formattedDate) {
//         setValue("contractExpiryDateHijri", formattedDate);
//       }
//     }
    
//     if (stillWorking && currentValues.isStillEmployed !== (stillWorking === "Y" || stillWorking === "نعم")) {
//       setValue("isStillEmployed", stillWorking === "Y" || stillWorking === "نعم");
//     }
    
//     if (jobStartDate) {
//       const formattedDate = formatDateString(jobStartDate);
//       if (currentValues.dateOfFirstWorkingDayGregorian !== formattedDate) {
//         setValue("dateOfFirstWorkingDayGregorian", formattedDate);
//       }
//     }
    
//     if (jobEndDate) {
//       const formattedDate = formatDateString(jobEndDate);
//       if (currentValues.dateOfLastWorkingDayGregorian !== formattedDate) {
//         setValue("dateOfLastWorkingDayGregorian", formattedDate);
//       }
//     }
    
//     if (jobLocation && jobLocationCode && JSON.stringify(currentValues.region) !== JSON.stringify({
//       value: jobLocationCode,
//       label: jobLocation,
//     })) {
//       setValue("region", {
//         value: jobLocationCode,
//         label: jobLocation,
//       });
//     }
    
//     if (jobCity && jobCityCode && JSON.stringify(currentValues.city) !== JSON.stringify({
//       value: jobCityCode,
//       label: jobCity,
//     })) {
//       setValue("city", {
//         value: jobCityCode,
//         label: jobCity,
//       });
//     }

//     if (laborOfficeCode && JSON.stringify(currentValues.laborOffice) !== JSON.stringify({
//       value: laborOfficeCode,
//       label: laborOfficeName,
//     })) {
//       setValue("laborOffice", {
//         value: laborOfficeCode,
//         label: laborOfficeName,
//       });
//     }
//   }, [caseDetails?.CaseDetails, getCookie, setValue]);
// };

// export const legRepVsWorkerUseFormLayout = (
//   setValue: UseFormSetValue<FormData>,
//   control: Control<FormData>,
//   watch: UseFormWatch<FormData>,
//   trigger: UseFormTrigger<FormData>
// ): SectionLayout[] => {
//   const isStillEmployed: any = watch("isStillEmployed" as any);
//   const { t, i18n } = useTranslation("hearingdetails");
//   const selectedWorkerRegion = watch("region");
//   const selectedWorkerCity = watch("city");
//   const currentLanguage = i18n.language.toUpperCase();

//   // Use the case details prefill hook
//   useCaseDetailsPrefill(setValue);

//   const { data: salaryTypeData } = useGetSalaryTypeLookupQuery({
//     AcceptedLanguage: i18n.language.toUpperCase(),
//   });

//   const [getCookie] = useCookieState({ caseId: "" });
//   const userType = getCookie("userType") || "";
//   const defendantStatus = getCookie("defendantStatus") || "";
//   const legalRepType = getCookie("legalRepType");

//   const [
//     triggerContractType,
//     { data: contractTypeData, isFetching: isContractTypeLoading },
//   ] = useLazyGetContractTypeLookupQuery();

//   useEffect(() => {
//     if (userType || legalRepType || defendantStatus) {
//       triggerContractType({
//         userType,
//         legalRepType,
//         defendantStatus,
//         AcceptedLanguage: currentLanguage,
//       });
//     }
//   }, [
//     userType,
//     legalRepType,
//     defendantStatus,
//     currentLanguage,
//     triggerContractType,
//   ]);

//   const { data: regionData, isFetching: isRegionLoading } =
//     useGetWorkerRegionLookupDataQuery({
//       AcceptedLanguage: i18n.language.toUpperCase(),
//       SourceSystem: "E-Services",
//       ModuleKey: "JobLocation",
//       ModuleName: "JobLocation",
//     });

//   const { data: cityData, isFetching: isCityLoading } =
//     useGetWorkerCityLookupDataQuery(
//       {
//         AcceptedLanguage: i18n.language.toUpperCase(),
//         SourceSystem: "E-Services",
//         selectedWorkerRegion,
//         ModuleName: "JobLocationCity",
//       },
//       { skip: !selectedWorkerRegion }
//     );

//   const { data: laborOfficeData, isFetching: isLaborLoading } =
//     useGetLaborOfficeLookupDataQuery(
//       {
//         AcceptedLanguage: i18n.language.toUpperCase(),
//         SourceSystem: "E-Services",
//         selectedWorkerCity,
//       },
//       { skip: !selectedWorkerCity }
//     );

//   const TypeOfWageOptions = React.useMemo(() => {
//     if (!salaryTypeData?.DataElements) return options;
//     return salaryTypeData.DataElements.map((item: any) => ({
//       value: item.ElementKey,
//       label: item.ElementValue,
//     }));
//   }, [salaryTypeData]);

//   const ContractTypeOptions = React.useMemo(() => {
//     if (!contractTypeData?.DataElements) return options;
//     return contractTypeData.DataElements.map((item: any) => ({
//       value: item.ElementKey,
//       label: item.ElementValue,
//     }));
//   }, [contractTypeData]);

//   const RegionOptions = React.useMemo(() => {
//     if (!regionData?.DataElements) return [];
//     return regionData.DataElements.map((item: any) => ({
//       value: item.ElementKey,
//       label: item.ElementValue,
//     }));
//   }, [regionData]);

//   const CityOptions = React.useMemo(() => {
//     if (!cityData?.DataElements) return [];
//     return cityData.DataElements.map((item: any) => ({
//       value: item.ElementKey,
//       label: item.ElementValue,
//     }));
//   }, [cityData]);

//   // Add watchers for dependent fields
//   const contractEndDate = watch("contractExpiryDateHijri");
//   const workStartDate = watch("dateofFirstworkingdayHijri");
//   const workEndDate = watch("dateoflastworkingdayHijri");

//   // Trigger validation when contract end date changes
//   useEffect(() => {
//     if (workStartDate) {
//       trigger("dateofFirstworkingdayHijri");
//     }
//     if (workEndDate) {
//       trigger("dateoflastworkingdayHijri");
//     }
//   }, [contractEndDate, trigger, workStartDate, workEndDate]);

//   // Trigger validation when work start date changes
//   useEffect(() => {
//     if (workEndDate) {
//       trigger("dateoflastworkingdayHijri");
//     }
//   }, [workStartDate, trigger, workEndDate]);

//   // Trigger validation when isStillEmployed changes
//   useEffect(() => {
//     if (!isStillEmployed && workEndDate) {
//       trigger("dateoflastworkingdayHijri");
//     }
//   }, [isStillEmployed, trigger, workEndDate]);

//   return [
//     {
//       title: t("tab3_title"),
//       children: [
//         {
//           type: "autocomplete",
//           name: "typeOfWage",
//           label: t("typeOfWage"),
//           options: TypeOfWageOptions,
//           onChange: (value: Option) => {
//             setValue("typeOfWage", value);
//           },
//           validation: { required: t("salaryTypeValidation") },
//         },
//         {
//           type: "input",
//           name: "salary",
//           label: t("currentSalary"),
//           inputType: "number",
//           placeholder: "10000 SAR",
//           min: 0,
//           validation: { required: t("currentSalaryValidation") },
//         },
//         {
//           type: "autocomplete",
//           name: "contractType",
//           label: t("contractType"),
//           options: ContractTypeOptions,
//           onChange: (value: Option) => setValue("contractType", value),
//           notRequired: true,
//          // validation: { required: t("contractTypeValidation") },
//         },
//         {
//           type: "input",
//           name: "contractNumber",
//           label: t("contractNumber"),
//           inputType: "number",
//           placeholder: "123457543",
//           notRequired: true,
//           validation: {
//             maxLength: { value: 10, message: t("max10Validation") },
//             pattern: { value: /^\d{0,10}$/, message: t("max10ValidationDesc") },
//           },
//         },
//         {
//           type: "custom",
//           name: "contractStartDate",
//           component: (
//             <HijriDateField
//               control={control}
//               setValue={setValue}
//               hijriFieldName="contractDateHijri"
//               gregorianFieldName="contractDateGregorian"
//               hijriLabel={t("contractDateHijri")}
//               gregorianLabel={t("contractDateGregorian")}
//               type="contract-start"
//               relatedEndDate={watch("contractExpiryDateHijri") as string}
//             />
//           ),
//         },
//         {
//           type: "custom",
//           name: "contractEndDate",
//           component: (
//             <HijriDateField
//               control={control}
//               setValue={setValue}
//               hijriFieldName="contractExpiryDateHijri"
//               gregorianFieldName="contractExpiryDateGregorian"
//               hijriLabel={t("contractExpiryDateHijri")}
//               gregorianLabel={t("contractExpiryDateGregorian")}
//               type="contract-end"
//               relatedStartDate={watch("contractDateHijri") as string}
//             />
//           ),
//         },
//         {
//           type: "checkbox",
//           name: "isStillEmployed",
//           label: t("stillEmployed"),
//           checked: isStillEmployed,
//           onChange: (checked) => setValue("isStillEmployed" as any, checked),
//         },
//         {
//           type: "custom",
//           name: "firstWorkingDate",
//           component: (
//             <HijriDateField
//               control={control}
//               setValue={setValue}
//               hijriFieldName="dateofFirstworkingdayHijri"
//               gregorianFieldName="dateOfFirstWorkingDayGregorian"
//               hijriLabel={t("dateofFirstworkingdayHijri")}
//               gregorianLabel={t("dateofFirstworkingdayGregorian")}
//               type="work-start"
//               relatedEndDate={watch("contractExpiryDateHijri")}
//             />
//           ),
//         },
//         ...(!isStillEmployed
//           ? [
//               {
//                 type: "custom",
//                 name: "lastWorkingDate",
//                 component: (
//                   <HijriDateField
//                     control={control}
//                     setValue={setValue}
//                     hijriFieldName="dateoflastworkingdayHijri"
//                     gregorianFieldName="dateofLastworkingdayGregorian"
//                     hijriLabel={t("dateoflastworkingdayHijri")}
//                     gregorianLabel={t("dateofLastworkingdayGregorian")}
//                     type="work-end"
//                     relatedStartDate={watch("dateofFirstworkingdayHijri")}
//                     relatedEndDate={watch("contractExpiryDateHijri")}
//                   />
//                 ),
//               },
//             ]
//           : []),
//       ],
//     },
//     {
//       title: t("workLocationDetails"),
//       children: [
//         {
//           type: "autocomplete",
//           name: "region",
//           isLoading: isRegionLoading,
//           label: t("region"),
//           options: RegionOptions,
//           onChange: (value: Option) => setValue("region", value),
//           validation: { required: t("regionValidation") },
//         },
//         {
//           type: "autocomplete",
//           name: "city",
//           isLoading: isCityLoading,
//           label: t("city"),
//           options: CityOptions,
//           onChange: (value: Option) => setValue("city", value),
//           validation: { required: t("cityValidation") },
//         },
//         {
//           type: "readonly",
//           name: "laborOffice",
//           label: t("nearestLaborOffice"),
//           value: laborOfficeData?.DataElements && laborOfficeData.DataElements.length > 0
//             ? laborOfficeData.DataElements[0].ElementValue
//             : "",
//           isLoading: isLaborLoading,
//         },
//       ],
//     },
//   ] as SectionLayout[];
// };
