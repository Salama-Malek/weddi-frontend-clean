// import { NICDetailsResponse, useLazyGetNICDetailsQuery, useGetNICDetailsQuery, useLazyGetNICDetailsForEmbasyQuery } from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";
// import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
// import { TokenClaims } from "@/features/login/components/AuthProvider";
// import { SectionLayout } from "@/shared/components/form/form.types";
// import { formatDateString } from "@/shared/lib/helpers";
// import { useEffect, useMemo, useState } from "react";
// import {
//     Control,
// } from "react-hook-form";
// import { useTranslation } from "react-i18next";
// import { toast } from "react-toastify";
// interface FormLayoutProps {
//     control: any;
//     watch?: any;
//     setValue?: any;
//     RegionOptions: any;
//     CityOptions: any;
//     OccupationOptions: any;
//     GenderOptions: any;
//     NationalityOptions: any;
//     setError: (name: string, error: any) => void;
//     clearErrors: (name: string) => void;
// }

// interface EmbassyUserInfo {
//     EmbassyUserId: string;
//     EmbassyFirstLanguage: string;
//     EmbassyID: string;
//     EmbassyName: string;
//     EmbassyNationality: string;
//     EmabassyEmail: string;
//     EmbassyPhone: string;
//     Nationality_Code: string;
// }
// interface NICDetails {
//     PlaintiffName?: string;
//     Region?: string;
//     City?: string;
//     DateOfBirthHijri?: string;
//     DateOfBirthGregorian?: string;
//     Occupation?: string;
//     Gender?: string;
//     Nationality?: string;
//     Applicant_Code?: string;
//     Applicant?: string;
//     PhoneNumber?: string;
//     Occupation_Code?: string
//     City_Code?: string
//     Gender_Code?: string
//     Region_Code?: string
//     Nationality_Code?: string
// }


// const EmbasyUserAsAgentFormLayout = ({
//     control,
//     setValue,
//     watch,
//     RegionOptions,
//     CityOptions,
//     OccupationOptions,
//     GenderOptions,
//     NationalityOptions,
//     setError,
//     clearErrors,
// }: FormLayoutProps) => {

//     const { t, i18n } = useTranslation("hearingdetails");
//     const [getCookie] = useCookieState();

//     const userClaims: TokenClaims = getCookie("userClaims");
//     const embasyUserData = getCookie("storeAllUserTypeData");
//     const idNumber = userClaims.UserID;
//     const claimStatus = watch("claimantStatus");
//     const PlaintiffId = watch("workerAgentIdNumber");
//     const PlaintifDOB = watch("workerAgentDateOfBirthHijri");
//     const nationality = watch("nationality");
//     const [isValid, setIsValid] = useState<boolean>(false);
//     const [validNationality, setValidNationality] = useState<boolean>(false);
//     let rd: NICDetails = {
//         PlaintiffName: "",
//         Region: "",
//         City: "",
//         DateOfBirthHijri: "",
//         DateOfBirthGregorian: "",
//         Occupation: "",
//         Gender: "",
//         Nationality: "",
//         Applicant_Code: "",
//         Applicant: "",
//         PhoneNumber: "",
//         Occupation_Code: "",
//         City_Code: "",
//         Gender_Code: "",
//         Region_Code: "",
//         Nationality_Code: "",
//     };
//     const claimType = watch("claimantStatus");

//     // Register fields for React Hook Form tracking (match claimant form)
//     useEffect(() => {
//         if (typeof control?.register === "function") {
//             control.register("workerAgentDateOfBirthHijri");
//             control.register("workerAgentIdNumber");
//         }
//     }, [control]);

//     useEffect(() => {
//         if (claimType === "representative") {
//             // console.log("ented here to get the embasy data");

//             if (embasyUserData && embasyUserData?.EmbassyInfo
//                 && embasyUserData?.EmbassyInfo?.length > 0
//             ) {
//                 setValue("Agent_EmbassyName", embasyUserData?.EmbassyInfo?.[0]?.EmbassyName);
//                 setValue("Agent_EmbassyNationality", embasyUserData?.EmbassyInfo?.[0]?.EmbassyNationality);
//                 setValue("Agent_EmbassyPhone", embasyUserData?.EmbassyInfo?.[0]?.EmbassyPhone);
//                 setValue("Agent_EmbassyFirstLanguage", embasyUserData?.EmbassyInfo?.[0]?.EmbassyFirstLanguage);
//                 setValue("Agent_EmbassyEmailAddress", embasyUserData?.EmbassyInfo?.[0]?.EmabassyEmail);
//                 setValue("Nationality_Code", embasyUserData?.EmbassyInfo?.[0]?.Nationality_Code);
//             } else {
//                 setValue("Agent_EmbassyName", "");
//                 setValue("Agent_EmbassyNationality", "");
//                 setValue("Agent_EmbassyPhone", "");
//                 setValue("Agent_EmbassyFirstLanguage", "");
//                 setValue("Agent_EmbassyEmailAddress", "");
//                 setValue("Nationality_Code", "");
//             }

//             [
//                 // 'workerAgentDateOfBirthHijri',
//                 // 'workerAgentIdNumber',
//                 "userName",
//                 "region",
//                 "city",
//                 "occupation",
//                 "gender",
//                 "nationality",
//                 "hijriDate",
//                 "gregorianDate",
//                 "applicant",
//                 "phoneNumber",
//             ].forEach((f) => {
//                 // console.log("this is the field", f);
//                 setValue(f as any, "");

//             });
//         }
//     }, [claimType])

//     // Add shouldFetchNic logic (match claimant form)
//     const formattedPlaintifDOB = PlaintifDOB ? PlaintifDOB.replaceAll("/", "") : "";
//     const shouldFetchNic =
//         claimType === "representative" &&
//         PlaintiffId?.length === 10 &&
//         formattedPlaintifDOB?.length === 8;

//     // Use the lazy query hook
//     const [triggerNicAgent, { data: nicAgent, isFetching: nicAgentLoading, isError: nicAgentError }] = useLazyGetNICDetailsForEmbasyQuery();

//     // Disable fields only while NIC is loading (match claimant form)
//     const disableNicFields = nicAgentLoading;

//     // Trigger the NIC fetch only when shouldFetchNic becomes true
//     useEffect(() => {
//         if (shouldFetchNic) {
//             triggerNicAgent({
//                 IDNumber: PlaintiffId,
//                 DateOfBirth: formattedPlaintifDOB || "",
//                 AcceptedLanguage: i18n.language.toUpperCase(),
//                 SourceSystem: "E-Services",
//             });
//         }
//     }, [shouldFetchNic, PlaintiffId, formattedPlaintifDOB, i18n.language, triggerNicAgent]);

//     // Effect 1: Only clear errors when shouldFetchNic becomes false
//     useEffect(() => {
//         if (!shouldFetchNic) {
//             clearErrors("workerAgentIdNumber");
//         }
//     }, [shouldFetchNic, clearErrors]);

//     // Effect 2: Handle NIC response only when shouldFetchNic is true and not loading
//     useEffect(() => {
//         // Only run if NIC fetch was attempted and is not loading
//         if (!shouldFetchNic || nicAgentLoading) return;

//         // Only show error and clear fields if the fetch completed and NICDetails is missing or error
//         if (nicAgentError || (nicAgent && !nicAgent.NICDetails)) {
//             let errorMessage = t("error.noNicData");
//             if (
//                 nicAgent &&
//                 nicAgent.ErrorDetails &&
//                 Array.isArray(nicAgent.ErrorDetails)
//             ) {
//                 const errorDetail = nicAgent.ErrorDetails.find(
//                     (detail: any) => detail.ErrorDesc
//                 );
//                 if (errorDetail && errorDetail.ErrorDesc) {
//                     errorMessage = errorDetail.ErrorDesc;
//                 }
//             }
//             toast.error(errorMessage);
//             if (typeof setError === "function") {
//                 setError("workerAgentIdNumber", {
//                     type: "validate",
//                     message: errorMessage,
//                 });
//             }
//             // Clear only the relevant fields, not the ID or DOB
//             [
//                 "userName",
//                 "region",
//                 "city",
//                 "occupation",
//                 "gender",
//                 "nationality",
//                 "hijriDate",
//                 "gregorianDate",
//                 "applicant",
//                 "phoneNumber",
//             ].forEach((f) => setValue(f as any, ""));
//             setValue("region", null);
//             setValue("city", null);
//             setValue("occupation", null);
//             setValue("gender", null);
//             setValue("nationality", null);
//         } else if (nicAgent && nicAgent.NICDetails) {
//             // Embassy-specific nationality validation
//             if (
//                 nicAgent.NICDetails.Nationality_Code !==
//                 embasyUserData?.EmbassyInfo?.[0]?.Nationality_Code
//             ) {
//                 setValidNationality(false);
//                 toast.error(t("nationality_error"));
//                 setError("nationality", { message: t("nationality_error") });
//                 // Clear only the relevant fields, not the ID or DOB
//                 [
//                     "userName",
//                     "region",
//                     "city",
//                     "occupation",
//                     "gender",
//                     "nationality",
//                     "hijriDate",
//                     "gregorianDate",
//                     "applicant",
//                     "phoneNumber",
//                 ].forEach((f) => setValue(f as any, ""));
//                 setValue("region", null);
//                 setValue("city", null);
//                 setValue("occupation", null);
//                 setValue("gender", null);
//                 setValue("nationality", null);
//                 return;
//             } else {
//                 setValidNationality(true);
//             }
//             // Success branch: clear error and populate fields
//             clearErrors("workerAgentIdNumber");
//             const d = nicAgent.NICDetails;
//             setValue("userName", d.PlaintiffName || "", {
//                 shouldValidate: d.PlaintiffName !== "",
//             });
//             if (d.Region_Code) {
//                 setValue(
//                     "region",
//                     {
//                         value: d.Region_Code,
//                         label: d.Region || "",
//                     },
//                     {
//                         shouldValidate: d.Region_Code !== "",
//                     }
//                 );
//             }
//             if (d.City_Code) {
//                 setValue(
//                     "city",
//                     {
//                         value: d.City_Code,
//                         label: d.City || "",
//                     },
//                     {
//                         shouldValidate: d.City_Code !== "",
//                     }
//                 );
//             }
//             if (d.Occupation_Code) {
//                 setValue(
//                     "occupation",
//                     {
//                         value: d.Occupation_Code,
//                         label: d.Occupation || "",
//                     },
//                     {
//                         shouldValidate: d.Occupation_Code !== "",
//                     }
//                 );
//             }
//             if (d.Gender_Code) {
//                 setValue(
//                     "gender",
//                     {
//                         value: d.Gender_Code,
//                         label: d.Gender || "",
//                     },
//                     {
//                         shouldValidate: d.Gender_Code !== "",
//                     }
//                 );
//             }
//             if (d.Nationality_Code) {
//                 setValue(
//                     "nationality",
//                     {
//                         value: d.Nationality_Code,
//                         label: d.Nationality || "",
//                     },
//                     {
//                         shouldValidate: d.Nationality_Code !== "",
//                     }
//                 );
//             }
//             setValue("hijriDate", d.DateOfBirthHijri || "", {
//                 shouldValidate: d.DateOfBirthHijri !== "",
//             });
//             setValue("gregorianDate", d.DateOfBirthGregorian || "", {
//                 shouldValidate: d.DateOfBirthGregorian !== "",
//             });
//             setValue("applicant", d.Applicant || "", {
//                 shouldValidate: d.Applicant !== "",
//             });
//             if (d.PhoneNumber) {
//                 setValue("phoneNumber", d.PhoneNumber.toString(), {
//                     shouldValidate: d.PhoneNumber !== "",
//                 });
//             }
//         }
//     }, [shouldFetchNic, nicAgentLoading, nicAgent, nicAgentError, setValue, setError, t, embasyUserData, clearErrors]);

//     useEffect(() => {
//         // console.log("this is the nationality and claimantStatus ", nationality, watch("claimantStatus"));
//         if (watch("claimantStatus") !== "representative") return;

//         if (nationality && nationality.value !== embasyUserData.EmbassyInfo[0].Nationality_Code) {
//             // console.log("Entered Here");
//             toast.error(t("nationality_error"));
//             [
//                 "userName",
//                 "region",
//                 "city",
//                 "occupation",
//                 "gender",
//                 "nationality",
//                 "hijriDate",
//                 "gregorianDate",
//                 "applicant",
//                 "phoneNumber",
//             ].forEach((f) => setValue(f as any, undefined));
//             setError("nationality", { message: t("nationality_error") });
//         }


//     }, [nationality]);

//     const formLayout: SectionLayout[] = [

//         ...[{
//             title: t("nicDetails.agentData"),
//             className: "agent-data-section",
//             gridCols: 3,
//             children: [
//                 {
//                     type: "readonly" as const,
//                     label: t("nicDetails.idNumber"),
//                     value: idNumber,
//                 },
//                 {

//                     type: "readonly" as const,
//                     label: t("embassyUser.name"),
//                     name: "Agent_EmbassyName",
//                     value: watch("Agent_EmbassyName"),
//                 },
//                 {
//                     type: "readonly" as const,
//                     label: t("embassyUser.phoneNumber"),
//                     name: "Agent_EmbassyPhone",
//                     value: watch("Agent_EmbassyPhone"),
//                 },
//                 {
//                     type: "readonly" as const,
//                     label: t("embassyUser.nationality"),
//                     name: "Agent_EmbassyNationality",
//                     value: watch("Agent_EmbassyNationality"),
//                 },
//                 {
//                     type: "readonly" as const,
//                     label: t("embassyUser.emailAddress"),
//                     name: "Agent_EmbassyEmailAddress",
//                     value: watch("Agent_EmbassyEmailAddress"),
//                 },
//                 {
//                     type: "readonly" as const,
//                     label: t("embassyUser.firstLanguage"),
//                     name: "Agent_EmbassyFirstLanguage",
//                     value: watch("Agent_EmbassyFirstLanguage"),
//                 },

//             ],
//         }],
//         ...[{
//             title: t("nicDetails.plaintiffData"),
//             className: "plaintiff-data-section",
//             gridCols: 3,
//             children: [
//                 // 1) Plaintiff ID

//                 {
//                     type: "input",
//                     name: "workerAgentIdNumber",
//                     label: t("nicDetails.idNumber"),
//                     inputType: "text",
//                     placeholder: "10xxxxxxxx",
//                     maxLength: 10,
//                     value: watch("workerAgentIdNumber"),
//                     onChange: (v: string) => setValue("workerAgentIdNumber", v),
//                     validation: {
//                         required: t("idNumberValidation"),
//                         validate: (value: string) =>
//                             value?.length === 10 || t("max10ValidationDesc"),
//                     },
//                     disabled: disableNicFields,
//                     isLoading: nicAgentLoading,
//                 },

//                 // 2) Hijri DOB
//                 {
//                     name: "dateOfBirth",
//                     type: "dateOfBirth",
//                     hijriLabel: t("nicDetails.dobHijri"),
//                     gregorianLabel: t("nicDetails.dobGrog"),
//                     hijriFieldName: "workerAgentDateOfBirthHijri",
//                     gregorianFieldName: "gregorianDate",
//                     validation: { required: t("dateValidation") },
//                     invalidFeedback: t("dateValidationDesc"),
//                     isLoading: disableNicFields,
//                     control, // ← wire up the RHF control
//                     value: watch("workerAgentDateOfBirthHijri"), // ← current hijri value
//                     disabled: disableNicFields,
//                 },



//                 ...(nicAgent?.NICDetails?.PlaintiffName && validNationality
//                     ? [
//                         {
//                             type: "readonly" as const,
//                             label: t("nicDetails.name"),
//                             value: nicAgent?.NICDetails?.PlaintiffName,
//                             isLoading: nicAgentLoading,
//                         },
//                     ]
//                     : [
//                         {
//                             type: "input" as const,
//                             name: "userName",
//                             inputType: "text",
//                             label: t("nicDetails.name"),
//                             value: watch("userName"),
//                             onChange: (v: string) => setValue("userName", v),
//                             validation: { required: t("nameValidation") },
//                             isLoading: disableNicFields,
//                         },
//                     ]),
//                 ...(nicAgent?.NICDetails?.Region && validNationality
//                     ? [
//                         {
//                             type: "readonly" as const,
//                             label: t("nicDetails.region"),
//                             value: nicAgent?.NICDetails?.Region,
//                             isLoading: nicAgentLoading,
//                         },
//                     ]
//                     : [
//                         {
//                             type: "autocomplete" as const,
//                             name: "region",
//                             label: t("nicDetails.region"),
//                             options: RegionOptions,
//                             value: watch("region"),
//                             onChange: (v: string) => setValue("region", v),
//                             validation: { required: t("regionValidation") },
//                             isLoading: disableNicFields,
//                         },
//                     ]),
//                 ...(nicAgent?.NICDetails?.City && validNationality
//                     ? [
//                         {
//                             type: "readonly" as const,
//                             label: t("nicDetails.city"),
//                             value: nicAgent?.NICDetails?.City,
//                             isLoading: nicAgentLoading,
//                         },
//                     ]
//                     : [
//                         {
//                             type: "autocomplete" as const,
//                             name: "city",
//                             label: t("nicDetails.city"),
//                             options: CityOptions,
//                             value: watch("city"),
//                             onChange: (v: string) => setValue("city", v),
//                             validation: { required: t("cityValidation") },
//                             isLoading: disableNicFields,
//                         },
//                     ]),
//                 ...(nicAgent?.NICDetails?.PhoneNumber && validNationality
//                     ? [
//                         {
//                             type: "readonly" as const,
//                             label: t("nicDetails.phoneNumber"),
//                             value: nicAgent?.NICDetails?.PhoneNumber,
//                             isLoading: nicAgentLoading,
//                         },
//                     ]
//                     : [
//                         {
//                             type: "input" as const,
//                             name: "phoneNumber",
//                             inputType: "text",
//                             placeholder: "05xxxxxxxx",
//                             label: t("nicDetails.phoneNumber"),
//                             value: watch("phoneNumber"),
//                             onChange: (v: string) => setValue("phoneNumber", v),
//                             validation: {
//                                 required: t("phoneNumberValidation"),
//                                 pattern: {
//                                     value: /^05\d{8}$/,
//                                     message: t("phoneValidationMessage"),
//                                 },
//                             },
//                             isLoading: disableNicFields,
//                         },
//                     ]),
//                 ...(nicAgent?.NICDetails?.Occupation && validNationality
//                     ? [
//                         {
//                             type: "readonly" as const,
//                             label: t("nicDetails.occupation"),
//                             value: nicAgent?.NICDetails?.Occupation,
//                             isLoading: nicAgentLoading,
//                         },
//                     ]
//                     : [
//                         {
//                             type: "autocomplete" as const,
//                             name: "occupation",
//                             label: t("nicDetails.occupation"),
//                             options: OccupationOptions,
//                             value: watch("occupation"),
//                             onChange: (v: string) => setValue("occupation", v),
//                             validation: { required: t("occupationValidation") },
//                             isLoading: disableNicFields,
//                         },
//                     ]),
//                 ...(nicAgent?.NICDetails?.Gender && validNationality
//                     ? [
//                         {
//                             type: "readonly" as const,
//                             label: t("nicDetails.gender"),
//                             value: nicAgent?.NICDetails?.Gender,
//                             isLoading: nicAgentLoading,
//                         },
//                     ]
//                     : [
//                         {
//                             type: "autocomplete" as const,
//                             name: "gender",
//                             label: t("nicDetails.gender"),
//                             options: GenderOptions,
//                             value: watch("gender"),
//                             onChange: (v: string) => setValue("gender", v),
//                             validation: { required: t("genderValidation") },
//                             isLoading: disableNicFields,
//                         },
//                     ]),
//                 ...(nicAgent?.NICDetails?.Nationality && validNationality
//                     ? [
//                         {
//                             type: "readonly" as const,
//                             label: t("nicDetails.nationality"),
//                             value: nicAgent?.NICDetails?.Nationality,
//                             isLoading: nicAgentLoading,
//                         },
//                     ]
//                     : [
//                         {
//                             type: "autocomplete" as const,
//                             name: "nationality",
//                             label: t("nicDetails.nationality"),
//                             options: NationalityOptions,
//                             value: watch("nationality"),
//                             onChange: (v: string) => setValue("nationality", v),
//                             validation: { required: t("nationalityValidation") },
//                             isLoading: disableNicFields,
//                         },
//                     ]),

//             ],

//         }]
//     ].filter(Boolean) as SectionLayout[];

//     return formLayout;
// };

// export default EmbasyUserAsAgentFormLayout;