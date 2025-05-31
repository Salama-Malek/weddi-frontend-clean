// // // // // import { UseFormSetValue, UseFormWatch, useForm } from "react-hook-form";
// // // // // import {
// // // // //   SectionLayout,
// // // // //   FormData,
// // // // //   Option,
// // // // // } from "@/shared/components/form/form.types";
// // // // // import { useFormOptions } from "./claimant.forms.formOptions";
// // // // // import React, {
// // // // //   lazy,
// // // // //   Suspense,
// // // // //   useState,
// // // // //   useMemo,
// // // // //   useEffect,
// // // // //   KeyboardEvent,
// // // // //   ChangeEvent,
// // // // //   FocusEvent,
// // // // // } from "react";
// // // // // import TableLoader from "@/shared/components/loader/TableLoader";
// // // // // import { useTranslation } from "react-i18next";
// // // // // import Button from "@/shared/components/button";
// // // // // import { useLegalRepFormOptions } from "../../establishment-tabs/legal-representative/claimant.forms.formOptions";
// // // // // import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
// // // // // import { PHONE_PATTERNS } from "@/config/general";
// // // // // import { TokenClaims } from "@/features/login/components/AuthProvider";
// // // // // import {
// // // // //   useGetNICDetailsQuery,
// // // // //   NICDetailsResponse,
// // // // // } from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";
// // // // // import { NICDetailsParams } from "../../hearing.details.types";
// // // // // import { formatHijriDate } from "@/shared/lib/helpers";
// // // // // import AddAttachment from "../../../add-attachments";

// // // // // interface AgentInfo {
// // // // //   Agent?: {
// // // // //     MandateNumber?: string;
// // // // //     AgentName?: string;
// // // // //     MandateStatus?: string;
// // // // //     MandateSource?: string;
// // // // //     AgentDetails?: Array<{
// // // // //       IdentityNumber: string;
// // // // //     }>;
// // // // //   };
// // // // //   // PlaintiffName?: string;
// // // // //   // Region?: string;
// // // // //   // City?: string;
// // // // //   // Occupation?: string;
// // // // //   // Gender?: string;
// // // // //   // Nationality?: string;
// // // // // }

// // // // // interface DataElement {
// // // // //   ElementKey: string;
// // // // //   ElementValue: string;
// // // // // }

// // // // // interface FormLayoutProps {
// // // // //   setValue: UseFormSetValue<FormData>;
// // // // //   watch: UseFormWatch<FormData>;

// // // // //   // lookups
// // // // //   regionData: any;
// // // // //   cityData: any;
// // // // //   occupationData: any;
// // // // //   genderData: any;
// // // // //   nationalityData: any;
// // // // //   countryData: any;

// // // // //   // OTP
// // // // //   sendOtpHandler: () => void;
// // // // //   lastSentOtp: string;
// // // // //   isVerified: boolean;
// // // // //   isNotVerified: boolean;
// // // // //   setIsNotVerified: (value: boolean) => void;

// // // // //   // agent lookup
// // // // //   agentInfoData: AgentInfo;
// // // // //   apiLoadingStates: {
// // // // //     agent: boolean;
// // // // //     nic: boolean;
// // // // //     estab: boolean;
// // // // //     incomplete: boolean;
// // // // //   };

// // // // //   // legal-rep metadata
// // // // //   userTypeLegalRepData: any;

// // // // //   // callbacks
// // // // //   onAgencyNumberChange: (value: string) => void;
// // // // //   onIdNumberChange: (value: string) => void;

// // // // //   // form error handlers
// // // // //   setError: (name: string, error: any) => void;
// // // // //   clearErrors: (name: string) => void;

// // // // //   // OTP verify
// // // // //   verifyOtp: () => void;
// // // // //   isVerify: boolean;

// // // // //   // **NEW NIC responses**
// // // // //   principalNICResponse?: NICDetailsResponse;
// // // // //   representativeNICResponse?: NICDetailsResponse;
// // // // // }

// // // // // export const useFormLayout = ({
// // // // //   setValue,
// // // // //   watch,
// // // // //   regionData,
// // // // //   cityData,
// // // // //   occupationData,
// // // // //   genderData,
// // // // //   nationalityData,
// // // // //   countryData,
// // // // //   sendOtpHandler,
// // // // //   isVerified,
// // // // //   isNotVerified,
// // // // //   setIsNotVerified,
// // // // //   agentInfoData,
// // // // //   apiLoadingStates,
// // // // //   userTypeLegalRepData,
// // // // //   onAgencyNumberChange,
// // // // //   onIdNumberChange,
// // // // //   setError,
// // // // //   clearErrors,
// // // // //   verifyOtp,
// // // // //   principalNICResponse,
// // // // //   representativeNICResponse,
// // // // // }: FormLayoutProps): SectionLayout[] => {
// // // // //   const { register } = useForm<FormData>();

// // // // //   // const { register, handleSubmit } = useForm<FormData>();

// // // // //   // useEffect(() => {
// // // // //   //   if (nicIsSuccess && NICDetails) {
// // // // //   //     const nicData = NICDetails.NICDetails || {};
// // // // //   //     setValue("userName", nicData.PlaintiffName || "");
// // // // //   //     setValue("region", nicData.Region || "");
// // // // //   //     setValue("city", nicData.City || "");
// // // // //   //     setValue("occupation", nicData.Occupation || "");
// // // // //   //     setValue("gender", nicData.Gender || "");
// // // // //   //     setValue("nationality", nicData.Nationality || "");
// // // // //   //     setValue("hijriDate", nicData.DateOfBirthHijri || "");
// // // // //   //     setValue("gregorianDate", nicData.DateOfBirthGregorian || "");
// // // // //   //     setValue("applicant", nicData.Applicant || "");
// // // // //   //   }
// // // // //   // }, [nicIsSuccess, NICDetails, setValue]);

// // // // //   useEffect(() => {
// // // // //     register("userName");
// // // // //     register("region");
// // // // //     register("city");
// // // // //     register("occupation");
// // // // //     register("gender");
// // // // //     register("nationality");
// // // // //     register("hijriDate");
// // // // //     register("gregorianDate");
// // // // //     register("applicant");
// // // // //   }, [register]);

// // // // //   const [getCookie] = useCookieState();
// // // // //   const userClaims = getCookie("userClaims") as TokenClaims;
// // // // //   const idNumber = userClaims?.UserID || "";
// // // // //   const dobirth = userClaims?.UserDOB || "";
// // // // //   const userType = getCookie("userType");
// // // // //   const { ClaimantStatusRadioOptions, CodeOptions, IsDomesticRadioOptions } =
// // // // //     useFormOptions();
// // // // //   const { plaintiffTypeOptions, AgentTypeOptions } = useLegalRepFormOptions();

// // // // //   const { t } = useTranslation("hearingdetails");
// // // // //   const { t: LegalRep } = useTranslation("legal_rep");
// // // // //   // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
// // // // //   // **NEW**: default claimantStatus to "principal" on mount
// // // // //   useEffect(() => {
// // // // //     setValue("claimantStatus", "principal");
// // // // //   }, [setValue]);
// // // // //   // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
// // // // //   const claimantStatus = watch("claimantStatus");
// // // // //   const plaintiffStatus = watch("plaintiffStatus");
// // // // //   const isPhone = watch("isPhone");
// // // // //   const phoneCode = watch("phoneCode");
// // // // //   const phoneNumber = watch("interPhoneNumber");
// // // // //   const enteredOtp = watch("otp");

// // // // //   const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
// // // // //   const [otpSent, setOtpSent] = useState(false);
// // // // //   const [timeLeft, setTimeLeft] = useState(60);
// // // // //   const [showResend, setShowResend] = useState(false);

// // // // //   const applicantType = watch("applicant");
// // // // //   const selectedMainCategory = getCookie("mainCategory");
// // // // //   const selectedSubCategory = getCookie("subCategory");
// // // // //   const agentType = watch("agentType");

// // // // //   const govRepDetail = userTypeLegalRepData?.GovRepDetails?.find(
// // // // //     (item: any) => item.GOVTID === selectedMainCategory?.value
// // // // //   );

// // // // //   // // Define NIC parameters for the worker user
// // // // //   // const nicParams: NICDetailsParams = {
// // // // //   //   IDNumber: idNumber,
// // // // //   //   DateOfBirth: dobirth,
// // // // //   //   AcceptedLanguage: "EN",
// // // // //   //   SourceSystem: "E-Services",
// // // // //   // };

// // // // //   // // Fetch NIC details for the worker
// // // // //   // const { data: nicData, isFetching: nicIsLoading } = useGetNICDetailsQuery(
// // // // //   //   nicParams,
// // // // //   //   {
// // // // //   //     skip: !nicParams.IDNumber || !nicParams.DateOfBirth,
// // // // //   //   }
// // // // //   // ) as { data: NICDetailsResponse | undefined; isFetching: boolean };

// // // // //   const [attachment, setAttachment] = useState<FormData["attachment"] | null>(
// // // // //     null
// // // // //   );

// // // // //   // Autofill principal-claimant fields when we have that response
// // // // //   useEffect(() => {
// // // // //     if (
// // // // //       watch("claimantStatus") === "principal" &&
// // // // //       principalNICResponse?.NICDetails
// // // // //     ) {
// // // // //       const nic = principalNICResponse.NICDetails;
// // // // //       setValue("userName", nic.PlaintiffName || "");
// // // // //       setValue("region", nic.Region || "");
// // // // //       setValue("city", nic.City || "");
// // // // //       setValue("occupation", nic.Occupation || "");
// // // // //       setValue("gender", nic.Gender || "");
// // // // //       setValue("nationality", nic.Nationality || "");
// // // // //       setValue("hijriDate", nic.DateOfBirthHijri || "");
// // // // //       setValue("gregorianDate", nic.DateOfBirthGregorian || "");
// // // // //       setValue("applicant", nic.Applicant || "");
// // // // //       if (nic.PhoneNumber) {
// // // // //         setValue("phoneNumber", Number(nic.PhoneNumber));
// // // // //       }
// // // // //     }
// // // // //   }, [principalNICResponse, setValue, watch]);

// // // // //   // Autofill or clear rep-plaintiff fields based on the representative response
// // // // //   useEffect(() => {
// // // // //     if (watch("claimantStatus") !== "representative") return;

// // // // //     if (representativeNICResponse?.NICDetails) {
// // // // //       const nic = representativeNICResponse.NICDetails;
// // // // //       setValue("userName", nic.PlaintiffName || "");
// // // // //       setValue("region", nic.Region || "");
// // // // //       setValue("city", nic.City || "");
// // // // //       setValue("occupation", nic.Occupation || "");
// // // // //       setValue("gender", nic.Gender || "");
// // // // //       setValue("nationality", nic.Nationality || "");
// // // // //       setValue("hijriDate", nic.DateOfBirthHijri || "");
// // // // //       setValue("gregorianDate", nic.DateOfBirthGregorian || "");
// // // // //       setValue("applicant", nic.Applicant || "");
// // // // //       if (nic.PhoneNumber) {
// // // // //         setValue("phoneNumber", Number(nic.PhoneNumber));
// // // // //       }
// // // // //     } else {
// // // // //       // cleared or invalid ID => clear all
// // // // //       [
// // // // //         "userName",
// // // // //         "region",
// // // // //         "city",
// // // // //         "occupation",
// // // // //         "gender",
// // // // //         "nationality",
// // // // //         "hijriDate",
// // // // //         "gregorianDate",
// // // // //         "applicant",
// // // // //         "phoneNumber",
// // // // //       ].forEach((f) => setValue(f as any, ""));
// // // // //     }
// // // // //   }, [representativeNICResponse, setValue, watch]);

// // // // //   const RegionOptions = useMemo(
// // // // //     () =>
// // // // //       regionData?.map((item: DataElement) => ({
// // // // //         value: item.ElementKey,
// // // // //         label: item.ElementValue,
// // // // //       })) || [],
// // // // //     [regionData]
// // // // //   );

// // // // //   const CityOptions = useMemo(
// // // // //     () =>
// // // // //       cityData?.map((item: DataElement) => ({
// // // // //         value: item.ElementKey,
// // // // //         label: item.ElementValue,
// // // // //       })) || [],
// // // // //     [cityData]
// // // // //   );

// // // // //   const OccupationOptions = useMemo(
// // // // //     () =>
// // // // //       occupationData?.map((item: DataElement) => ({
// // // // //         value: item.ElementKey,
// // // // //         label: item.ElementValue,
// // // // //       })) || [],
// // // // //     [occupationData]
// // // // //   );

// // // // //   const GenderOptions = useMemo(
// // // // //     () =>
// // // // //       genderData?.map((item: DataElement) => ({
// // // // //         value: item.ElementKey,
// // // // //         label: item.ElementValue,
// // // // //       })) || [],
// // // // //     [genderData]
// // // // //   );

// // // // //   const NationalityOptions = useMemo(
// // // // //     () =>
// // // // //       nationalityData?.map((item: DataElement) => ({
// // // // //         value: item.ElementKey,
// // // // //         label: item.ElementValue,
// // // // //       })) || [],
// // // // //     [nationalityData]
// // // // //   );

// // // // //   const CountryCodeOptions = useMemo(
// // // // //     () =>
// // // // //       countryData?.map((item: DataElement) => ({
// // // // //         value: item.ElementKey,
// // // // //         label: item.ElementValue,
// // // // //       })) || [],
// // // // //     [countryData]
// // // // //   );

// // // // //   const getPhoneConfig = (code: string) =>
// // // // //     PHONE_PATTERNS[code] || PHONE_PATTERNS.DEFAULT;

// // // // //   const phoneConfig = getPhoneConfig(phoneCode);
// // // // //   const isPhoneValid =
// // // // //     phoneCode && phoneNumber ? phoneConfig.pattern.test(phoneNumber) : false;
// // // // //   const isSendOtpDisabled = !phoneCode || !phoneNumber || !isPhoneValid;
// // // // //   const isVerifyOtpDisabled =
// // // // //     !enteredOtp || enteredOtp.length < 6 || !isPhoneValid;
// // // // //   const progress = ((60 - timeLeft) / 60) * 100;

// // // // //   useEffect(() => {
// // // // //     if (!otpSent || isVerified || timeLeft <= 0) return;
// // // // //     const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
// // // // //     return () => clearInterval(timerId);
// // // // //   }, [otpSent, timeLeft, isVerified]);

// // // // //   useEffect(() => {
// // // // //     if (timeLeft === 0 && !isVerified) setShowResend(true);
// // // // //   }, [timeLeft, isVerified]);

// // // // //   // useEffect(() => {
// // // // //   //   if (nicIsSuccess && NICDetails) {
// // // // //   //     const nicData = NICDetails.NICDetails || {};
// // // // //   //     setValue("userName", nicData.PlaintiffName || "");
// // // // //   //     setValue("region", nicData.Region || "");
// // // // //   //     setValue("city", nicData.City || "");
// // // // //   //     setValue("occupation", nicData.Occupation || "");
// // // // //   //     setValue("gender", nicData.Gender || "");
// // // // //   //     setValue("nationality", nicData.Nationality || "");
// // // // //   //     setValue("hijriDate", nicData.DateOfBirthHijri || "");
// // // // //   //     setValue("gregorianDate", nicData.DateOfBirthGregorian || "");
// // // // //   //     setValue("applicant", nicData.Applicant || "");
// // // // //   //   }
// // // // //   // }, [nicIsSuccess, NICDetails, setValue]);

// // // // //   const handleOtpChange = (index: number, value: string) => {
// // // // //     if (!/^\d*$/.test(value)) return;
// // // // //     const newOtp = [...otp];
// // // // //     newOtp[index] = value;
// // // // //     setOtp(newOtp);
// // // // //     if (value && index < 5) {
// // // // //       const nextInput = document.getElementById(`otp-input-${index + 1}`);
// // // // //       if (nextInput) nextInput.focus();
// // // // //     }
// // // // //     setValue("otp", newOtp.join(""));
// // // // //   };

// // // // //   const handleSendOtp = () => {
// // // // //     if (isSendOtpDisabled || !sendOtpHandler) return;
// // // // //     setOtpSent(true);
// // // // //     setTimeLeft(60);
// // // // //     setShowResend(false);
// // // // //     setOtp(Array(6).fill(""));
// // // // //     sendOtpHandler();
// // // // //   };

// // // // //   const handleResendOtp = () => {
// // // // //     handleSendOtp();
// // // // //     if (setIsNotVerified) setIsNotVerified(false);
// // // // //   };

// // // // //   const handleFileSelect = (fileData: FormData["attachment"]) => {
// // // // //     if (!fileData) return;
// // // // //     setAttachment(fileData);
// // // // //     setValue("attachment.classification", fileData.classification || "");
// // // // //     setValue("attachment.file", fileData.file || null);
// // // // //     setValue("attachment.base64", fileData.base64 || null);
// // // // //     setValue("attachment.fileName", fileData.fileName || "");
// // // // //     setValue("attachment.fileType", fileData.fileType || "");
// // // // //   };

// // // // //   const baseSections =
// // // // //     userType === "legal_representative"
// // // // //       ? [
// // // // //           {
// // // // //             isHidden: true,
// // // // //             title: LegalRep("claimantStatus"),
// // // // //             isRadio: true,
// // // // //             children: [
// // // // //               {
// // // // //                 type: "radio",
// // // // //                 name: "plaintiffStatus",
// // // // //                 label: LegalRep("claimantStatus"),
// // // // //                 options: plaintiffTypeOptions,
// // // // //                 value: "",
// // // // //                 onChange: (value: string) => setValue("plaintiffStatus", value),
// // // // //                 validation: { required: "Region is required" },
// // // // //               },
// // // // //             ],
// // // // //           },
// // // // //         ]
// // // // //       : [];

// // // // //   const getWorkerSections = () => {
// // // // //     const sections: any[] = [];

// // // // //     // Set default claimant status to "principal" on mount
// // // // //     useEffect(() => {
// // // // //       setValue("claimantStatus", "principal");
// // // // //     }, []); // Empty dependency array means this runs once on mount

// // // // //     // Set default agent type to "local_agency" when representative is selected
// // // // //     useEffect(() => {
// // // // //       if (claimantStatus === "representative") {
// // // // //         setValue("agentType", "local_agency");
// // // // //       }
// // // // //     }, [claimantStatus, setValue]);

// // // // //     // Set ID number when principal is selected
// // // // //     useEffect(() => {
// // // // //       if (claimantStatus === "principal" && idNumber) {
// // // // //         setValue("idNumber", idNumber);
// // // // //       }
// // // // //     }, [claimantStatus, idNumber, setValue]);

// // // // //     // if (claimantStatus === "principal") {
// // // // //     //   // --- PRINCIPAL WORKER DATA ---
// // // // //     //   // Use nicData (current logged-in user's NIC details)
// // // // //     //   sections.push({
// // // // //     //     title: t("nicDetails.personalInfo"),
// // // // //     //     className: "personal-info-section",
// // // // //     //     gridCols: 3,
// // // // //     //     children: [
// // // // //     //       {
// // // // //     //         isLoading: apiLoadingStates?.nic,
// // // // //     //         type: "readonly",
// // // // //     //         label: t("nicDetails.idNumber"),
// // // // //     //         value: idNumber,
// // // // //     //       },
// // // // //     //       {
// // // // //     //         type: nicData?.NICDetails?.PlaintiffName ? "readonly" : "input",
// // // // //     //         name: "userName",
// // // // //     //         isLoading: apiLoadingStates?.nic,
// // // // //     //         label: t("nicDetails.name"),
// // // // //     //         value: nicData?.NICDetails?.PlaintiffName || "",
// // // // //     //         ...(!nicData?.NICDetails?.PlaintiffName && {
// // // // //     //           inputType: "text",
// // // // //     //           onChange: (value: string) => setValue("userName", value),
// // // // //     //           validation: { required: t("nameValidation") },
// // // // //     //         }),
// // // // //     //       },
// // // // //     //       {
// // // // //     //         type: nicData?.NICDetails?.Region ? "readonly" : "autocomplete",
// // // // //     //         name: "worker_region",
// // // // //     //         ...(nicData?.NICDetails?.Region && {
// // // // //     //           isLoading: apiLoadingStates?.nic,
// // // // //     //         }),
// // // // //     //         title: "",
// // // // //     //         label: t("nicDetails.region"),
// // // // //     //         value: nicData?.NICDetails?.Region || "",
// // // // //     //         ...(!nicData?.NICDetails?.Region && {
// // // // //     //           options: RegionOptions || [],
// // // // //     //           onChange: (value: any) => setValue("region", value),
// // // // //     //           validation: { required: t("regionValidation") },
// // // // //     //         }),
// // // // //     //       },
// // // // //     //       {
// // // // //     //         type: nicData?.NICDetails?.City ? "readonly" : "autocomplete",
// // // // //     //         name: "city",
// // // // //     //         ...(nicData?.NICDetails?.City && {
// // // // //     //           isLoading: apiLoadingStates?.nic,
// // // // //     //         }),
// // // // //     //         title: "",
// // // // //     //         label: t("nicDetails.city"),
// // // // //     //         value: nicData?.NICDetails?.City || "",
// // // // //     //         ...(!nicData?.NICDetails?.City && {
// // // // //     //           options: CityOptions || [],
// // // // //     //           onChange: (value: any) => setValue("city", value),
// // // // //     //           validation: { required: t("cityValidation") },
// // // // //     //         }),
// // // // //     //       },
// // // // //     //       {
// // // // //     //         type: "readonly",
// // // // //     //         title: "",
// // // // //     //         isLoading: apiLoadingStates?.nic,
// // // // //     //         label: t("nicDetails.dobHijri"),
// // // // //     //         value: nicData?.NICDetails?.DateOfBirthHijri,
// // // // //     //       },
// // // // //     //       {
// // // // //     //         type: "readonly",
// // // // //     //         title: "",
// // // // //     //         isLoading: apiLoadingStates?.nic,
// // // // //     //         label: t("nicDetails.dobGrog"),
// // // // //     //         value: nicData?.NICDetails?.DateOfBirthGregorian,
// // // // //     //       },
// // // // //     //       {
// // // // //     //         type: nicData?.NICDetails?.PhoneNumber ? "readonly" : "input",
// // // // //     //         name: "phoneNumber",
// // // // //     //         label: t("nicDetails.phoneNumber"),
// // // // //     //         value: nicData?.NICDetails?.PhoneNumber || "",
// // // // //     //         ...(!nicData?.NICDetails?.PhoneNumber && {
// // // // //     //           inputType: "number",
// // // // //     //           placeholder: "05xxxxxxxx",
// // // // //     //           onChange: (value: string) =>
// // // // //     //             setValue("phoneNumber", Number(value)),
// // // // //     //           validation: {
// // // // //     //             required: t("phoneNumberValidation"),
// // // // //     //             pattern: {
// // // // //     //               value: /^05\d{8}$/,
// // // // //     //               message: t("phoneValidationMessage"),
// // // // //     //             },
// // // // //     //           },
// // // // //     //         }),
// // // // //     //       },
// // // // //     //       {
// // // // //     //         type: nicData?.NICDetails?.Occupation ? "readonly" : "autocomplete",
// // // // //     //         name: "occupation",
// // // // //     //         ...(nicData?.NICDetails?.Occupation && {
// // // // //     //           isLoading: apiLoadingStates?.nic,
// // // // //     //         }),
// // // // //     //         title: "",
// // // // //     //         label: t("nicDetails.occupation"),
// // // // //     //         value: nicData?.NICDetails?.Occupation || "",
// // // // //     //         ...(!nicData?.NICDetails?.Occupation && {
// // // // //     //           options: OccupationOptions || [],
// // // // //     //           onChange: (value: any) => setValue("occupation", value),
// // // // //     //           validation: { required: t("occupationValidation") },
// // // // //     //         }),
// // // // //     //       },
// // // // //     //       {
// // // // //     //         type: nicData?.NICDetails?.Gender ? "readonly" : "autocomplete",
// // // // //     //         name: "gender",
// // // // //     //         ...(nicData?.NICDetails?.Gender && {
// // // // //     //           isLoading: apiLoadingStates?.nic,
// // // // //     //         }),
// // // // //     //         title: "",
// // // // //     //         label: t("nicDetails.gender"),
// // // // //     //         value: nicData?.NICDetails?.Gender || "",
// // // // //     //         ...(!nicData?.NICDetails?.Gender && {
// // // // //     //           options: GenderOptions || [],
// // // // //     //           onChange: (value: any) => setValue("gender", value),
// // // // //     //           validation: { required: t("genderValidation") },
// // // // //     //         }),
// // // // //     //       },
// // // // //     //       {
// // // // //     //         type: nicData?.NICDetails?.Nationality
// // // // //     //           ? "readonly"
// // // // //     //           : "autocomplete",
// // // // //     //         name: "nationality",
// // // // //     //         ...(nicData?.NICDetails?.Nationality && {
// // // // //     //           isLoading: apiLoadingStates?.nic,
// // // // //     //         }),
// // // // //     //         title: "",
// // // // //     //         label: t("nicDetails.nationality"),
// // // // //     //         value: nicData?.NICDetails?.Nationality || "",
// // // // //     //         ...(!nicData?.NICDetails?.Nationality && {
// // // // //     //           options: NationalityOptions || [],
// // // // //     //           onChange: (value: any) => setValue("nationality", value),
// // // // //     //           validation: { required: t("nationalityValidation") },
// // // // //     //         }),
// // // // //     //       },

// // // // //     //       ...(nicData?.NICDetails?.Applicant
// // // // //     //         ? [
// // // // //     //             {
// // // // //     //               type: "readonly",
// // // // //     //               title: "",
// // // // //     //               ...(nicData?.NICDetails?.Applicant && {
// // // // //     //                 isLoading: apiLoadingStates?.nic,
// // // // //     //               }),
// // // // //     //               label: t("nicDetails.applicant"),
// // // // //     //               value: nicData?.NICDetails?.Applicant || "",
// // // // //     //             },
// // // // //     //           ]
// // // // //     //         : []),
// // // // //     //     ],
// // // // //     //   });

// // // // //     //   // Add attachment section if Applicant_Code is "DW1"
// // // // //     //   if (nicData?.NICDetails?.Applicant_Code === "DW1") {
// // // // //     //     sections.push({
// // // // //     //       condition: true,
// // // // //     //       children: [
// // // // //     //         {
// // // // //     //           type: "custom",
// // // // //     //           validation: { required: "attachment is required" },
// // // // //     //           component: (
// // // // //     //             <Suspense fallback={<TableLoader />}>
// // // // //     //               <AddAttachment
// // // // //     //                 onFileSelect={handleFileSelect}
// // // // //     //                 selectedFile={attachment}
// // // // //     //               />
// // // // //     //             </Suspense>
// // // // //     //           ),
// // // // //     //         },
// // // // //     //       ],
// // // // //     //     });
// // // // //     //   }

// // // // //     if (claimantStatus === "principal") {
// // // // //       const pd = principalNICResponse?.NICDetails;
// // // // //       sections.push({
// // // // //         title: t("nicDetails.personalInfo"),
// // // // //         className: "personal-info-section",
// // // // //         gridCols: 3,
// // // // //         children: [
// // // // //           // ID Number (readonly)
// // // // //           {
// // // // //             type: "readonly" as const,
// // // // //             label: t("nicDetails.idNumber"),
// // // // //             value: idNumber,
// // // // //             isLoading: apiLoadingStates.nic,
// // // // //           },

// // // // //           // Name
// // // // //           ...(pd?.PlaintiffName
// // // // //             ? [
// // // // //                 {
// // // // //                   type: "readonly" as const,
// // // // //                   label: t("nicDetails.name"),
// // // // //                   value: pd.PlaintiffName,
// // // // //                   isLoading: apiLoadingStates.nic,
// // // // //                 },
// // // // //               ]
// // // // //             : [
// // // // //                 {
// // // // //                   type: "input" as const,
// // // // //                   name: "userName",
// // // // //                   inputType: "text",
// // // // //                   label: t("nicDetails.name"),
// // // // //                   value: watch("userName"),
// // // // //                   onChange: (v: string) => setValue("userName", v),
// // // // //                   validation: { required: t("nameValidation") },
// // // // //                   isLoading: apiLoadingStates.nic,
// // // // //                 },
// // // // //               ]),

// // // // //           // Region
// // // // //           ...(pd?.Region
// // // // //             ? [
// // // // //                 {
// // // // //                   type: "readonly" as const,
// // // // //                   label: t("nicDetails.region"),
// // // // //                   value: pd.Region,
// // // // //                   isLoading: apiLoadingStates.nic,
// // // // //                 },
// // // // //               ]
// // // // //             : [
// // // // //                 {
// // // // //                   type: "autocomplete" as const,
// // // // //                   name: "region",
// // // // //                   label: t("nicDetails.region"),
// // // // //                   options: RegionOptions,
// // // // //                   value: watch("region"),
// // // // //                   onChange: (v: string) => setValue("region", v),
// // // // //                   validation: { required: t("regionValidation") },
// // // // //                   isLoading: apiLoadingStates.nic,
// // // // //                 },
// // // // //               ]),

// // // // //           // City
// // // // //           ...(pd?.City
// // // // //             ? [
// // // // //                 {
// // // // //                   type: "readonly" as const,
// // // // //                   label: t("nicDetails.city"),
// // // // //                   value: pd.City,
// // // // //                   isLoading: apiLoadingStates.nic,
// // // // //                 },
// // // // //               ]
// // // // //             : [
// // // // //                 {
// // // // //                   type: "autocomplete" as const,
// // // // //                   name: "city",
// // // // //                   label: t("nicDetails.city"),
// // // // //                   options: CityOptions,
// // // // //                   value: watch("city"),
// // // // //                   onChange: (v: string) => setValue("city", v),
// // // // //                   validation: { required: t("cityValidation") },
// // // // //                   isLoading: apiLoadingStates.nic,
// // // // //                 },
// // // // //               ]),

// // // // //           // Date of Birth (Hijri)
// // // // //           {
// // // // //             type: "readonly" as const,
// // // // //             label: t("nicDetails.dobHijri"),
// // // // //             value: pd?.DateOfBirthHijri || "",
// // // // //             isLoading: apiLoadingStates.nic,
// // // // //           },
// // // // //           // Date of Birth (Gregorian)
// // // // //           {
// // // // //             type: "readonly" as const,
// // // // //             label: t("nicDetails.dobGrog"),
// // // // //             value: pd?.DateOfBirthGregorian || "",
// // // // //             isLoading: apiLoadingStates.nic,
// // // // //           },

// // // // //           // Phone Number
// // // // //           ...(pd?.PhoneNumber
// // // // //             ? [
// // // // //                 {
// // // // //                   type: "readonly" as const,
// // // // //                   label: t("nicDetails.phoneNumber"),
// // // // //                   value: pd.PhoneNumber,
// // // // //                   isLoading: apiLoadingStates.nic,
// // // // //                 },
// // // // //               ]
// // // // //             : [
// // // // //                 {
// // // // //                   type: "input" as const,
// // // // //                   name: "phoneNumber",
// // // // //                   inputType: "number",
// // // // //                   placeholder: "05xxxxxxxx",
// // // // //                   label: t("nicDetails.phoneNumber"),
// // // // //                   value: watch("phoneNumber"),
// // // // //                   onChange: (v: string) => setValue("phoneNumber", Number(v)),
// // // // //                   validation: {
// // // // //                     required: t("phoneNumberValidation"),
// // // // //                     pattern: {
// // // // //                       value: /^05\d{8}$/,
// // // // //                       message: t("phoneValidationMessage"),
// // // // //                     },
// // // // //                   },
// // // // //                   isLoading: apiLoadingStates.nic,
// // // // //                 },
// // // // //               ]),

// // // // //           // Occupation
// // // // //           ...(pd?.Occupation
// // // // //             ? [
// // // // //                 {
// // // // //                   type: "readonly" as const,
// // // // //                   label: t("nicDetails.occupation"),
// // // // //                   value: pd.Occupation,
// // // // //                   isLoading: apiLoadingStates.nic,
// // // // //                 },
// // // // //               ]
// // // // //             : [
// // // // //                 {
// // // // //                   type: "autocomplete" as const,
// // // // //                   name: "occupation",
// // // // //                   label: t("nicDetails.occupation"),
// // // // //                   options: OccupationOptions,
// // // // //                   value: watch("occupation"),
// // // // //                   onChange: (v: string) => setValue("occupation", v),
// // // // //                   validation: { required: t("occupationValidation") },
// // // // //                   isLoading: apiLoadingStates.nic,
// // // // //                 },
// // // // //               ]),

// // // // //           // Gender
// // // // //           ...(pd?.Gender
// // // // //             ? [
// // // // //                 {
// // // // //                   type: "readonly" as const,
// // // // //                   label: t("nicDetails.gender"),
// // // // //                   value: pd.Gender,
// // // // //                   isLoading: apiLoadingStates.nic,
// // // // //                 },
// // // // //               ]
// // // // //             : [
// // // // //                 {
// // // // //                   type: "autocomplete" as const,
// // // // //                   name: "gender",
// // // // //                   label: t("nicDetails.gender"),
// // // // //                   options: GenderOptions,
// // // // //                   value: watch("gender"),
// // // // //                   onChange: (v: string) => setValue("gender", v),
// // // // //                   validation: { required: t("genderValidation") },
// // // // //                   isLoading: apiLoadingStates.nic,
// // // // //                 },
// // // // //               ]),

// // // // //           // Nationality
// // // // //           ...(pd?.Nationality
// // // // //             ? [
// // // // //                 {
// // // // //                   type: "readonly" as const,
// // // // //                   label: t("nicDetails.nationality"),
// // // // //                   value: pd.Nationality,
// // // // //                   isLoading: apiLoadingStates.nic,
// // // // //                 },
// // // // //               ]
// // // // //             : [
// // // // //                 {
// // // // //                   type: "autocomplete" as const,
// // // // //                   name: "nationality",
// // // // //                   label: t("nicDetails.nationality"),
// // // // //                   options: NationalityOptions,
// // // // //                   value: watch("nationality"),
// // // // //                   onChange: (v: string) => setValue("nationality", v),
// // // // //                   validation: { required: t("nationalityValidation") },
// // // // //                   isLoading: apiLoadingStates.nic,
// // // // //                 },
// // // // //               ]),

// // // // //           // Applicant (if present)
// // // // //           ...(pd?.Applicant
// // // // //             ? [
// // // // //                 {
// // // // //                   type: "readonly" as const,
// // // // //                   label: t("nicDetails.applicant"),
// // // // //                   value: pd.Applicant,
// // // // //                   isLoading: apiLoadingStates.nic,
// // // // //                 },
// // // // //               ]
// // // // //             : []),
// // // // //         ],
// // // // //       });
// // // // //     }
// // // // //     if (claimantStatus === "representative") {
// // // // //       // 1) Agent-Type radio
// // // // //       sections.push({
// // // // //         title: t("nicDetails.agentType"),
// // // // //         isRadio: true,
// // // // //         children: [
// // // // //           {
// // // // //             type: "radio" as const,
// // // // //             name: "agentType",
// // // // //             label: t("plaintiff_type"),
// // // // //             options: AgentTypeOptions,
// // // // //             value: agentType,
// // // // //             onChange: (v: string) => setValue("agentType", v),
// // // // //             validation: { required: t("agentTypeValidation") },
// // // // //           },
// // // // //         ],
// // // // //       });

// // // // //       // 2) Agent Data
// // // // //       sections.push({
// // // // //         title: t("nicDetails.agentData"),
// // // // //         className: "agent-data-section",
// // // // //         gridCols: 3,
// // // // //         children: [
// // // // //           // Agent’s own ID (readonly)
// // // // //           {
// // // // //             type: "readonly" as const,
// // // // //             label: t("nicDetails.idNumber"),
// // // // //             value: idNumber,
// // // // //           },

// // // // //           // Agent Name: readonly for local_agency, input otherwise
// // // // //           {
// // // // //             type: agentType === "local_agency" ? "readonly" : "input",
// // // // //             name: "agentName",
// // // // //             label: t("nicDetails.agentName"),
// // // // //             value:
// // // // //               agentType === "local_agency"
// // // // //                 ? agentInfoData.Agent?.AgentName || ""
// // // // //                 : watch("agentName"),
// // // // //             onChange: (v: string) => setValue("agentName", v),
// // // // //             validation: { required: t("agentNameValidation") },
// // // // //             isLoading: agentType === "local_agency" && apiLoadingStates.agent,
// // // // //           },

// // // // //           // Agency Number
// // // // //           {
// // // // //             type: "input" as const,
// // // // //             name: "agencyNumber",
// // // // //             inputType: "number",
// // // // //             label: t("nicDetails.agencyNumber"),
// // // // //             placeholder: "10xxxxxxxx",
// // // // //             value: watch("agencyNumber"),
// // // // //             onChange: (v: string) => onAgencyNumberChange(v),
// // // // //             validation: {
// // // // //               required: t("agencyNumberValidation"),
// // // // //               pattern: {
// // // // //                 value: /^\d{9}$/,
// // // // //                 message: t("max9ValidationDesc"),
// // // // //               },
// // // // //             },
// // // // //           },

// // // // //           // Agency Status
// // // // //           {
// // // // //             type: agentType === "local_agency" ? "readonly" : "input",
// // // // //             name: "agencyStatus",
// // // // //             label: t("nicDetails.agencyStatus"),
// // // // //             value:
// // // // //               agentType === "local_agency"
// // // // //                 ? agentInfoData.Agent?.MandateStatus || ""
// // // // //                 : watch("agencyStatus"),
// // // // //             onChange: (v: string) => setValue("agencyStatus", v),
// // // // //             validation: { required: t("agencyStatusValidation") },
// // // // //             isLoading: agentType === "local_agency" && apiLoadingStates.agent,
// // // // //           },

// // // // //           // Agency Source
// // // // //           {
// // // // //             type: agentType === "local_agency" ? "readonly" : "input",
// // // // //             name: "agencySource",
// // // // //             label: t("nicDetails.agencySource"),
// // // // //             value:
// // // // //               agentType === "local_agency"
// // // // //                 ? agentInfoData.Agent?.MandateSource || ""
// // // // //                 : watch("agencySource"),
// // // // //             onChange: (v: string) => setValue("agencySource", v),
// // // // //             validation: { required: t("agencySourceValidation") },
// // // // //             isLoading: agentType === "local_agency" && apiLoadingStates.agent,
// // // // //           },

// // // // //           // Current Place of Work
// // // // //           {
// // // // //             type: "input" as const,
// // // // //             name: "Agent_CurrentPlaceOfWork",
// // // // //             inputType: "text",
// // // // //             label: t("nicDetails.currentWorkingPlace"),
// // // // //             value: watch("Agent_CurrentPlaceOfWork"),
// // // // //             onChange: (v: string) => setValue("Agent_CurrentPlaceOfWork", v),
// // // // //             validation: { required: t("workplaceValidation") },
// // // // //           },

// // // // //           // Residency Address
// // // // //           {
// // // // //             type: "input" as const,
// // // // //             name: "Agent_ResidencyAddress",
// // // // //             inputType: "text",
// // // // //             label: t("nicDetails.residenceAddress"),
// // // // //             value: watch("Agent_ResidencyAddress"),
// // // // //             onChange: (v: string) => setValue("Agent_ResidencyAddress", v),
// // // // //             validation: { required: t("residenceAddressValidation") },
// // // // //           },

// // // // //           // External-agency only: Occupation dropdown
// // // // //           ...(agentType === "external_agency"
// // // // //             ? [
// // // // //                 {
// // // // //                   type: "autocomplete" as const,
// // // // //                   name: "occupation",
// // // // //                   label: t("nicDetails.occupation"),
// // // // //                   options: OccupationOptions,
// // // // //                   value: watch("occupation"),
// // // // //                   onChange: (v: string) => setValue("occupation", v),
// // // // //                   validation: { required: t("occupationValidation") },
// // // // //                 },
// // // // //               ]
// // // // //             : []),
// // // // //         ],
// // // // //       });
// // // // //     }

// // // // //     // — Inside getWorkerSections(), after the agentData section:
// // // // //     if (claimantStatus === "representative") {
// // // // //       const rd = representativeNICResponse?.NICDetails;
// // // // //       sections.push({
// // // // //         title: t("nicDetails.plaintiffData"),
// // // // //         className: "plaintiff-data-section",
// // // // //         gridCols: 3,
// // // // //         children: [
// // // // //           // Plaintiff ID input
// // // // //           // {
// // // // //           //   type: "input" as const,
// // // // //           //   name: "workerAgentIdNumber",
// // // // //           //   inputType: "number",
// // // // //           //   label: t("nicDetails.idNumber"),
// // // // //           //   value: watch("workerAgentIdNumber"),
// // // // //           //   onChange: (v: string) => {
// // // // //           //     // same validation & onIdNumberChange logic you already have
// // // // //           //   },
// // // // //           //   validation: {
// // // // //           //     required: t("idNumberValidation"),
// // // // //           //     pattern: { value: /^\d{10}$/, message: t("max10ValidationDesc") },
// // // // //           //   },
// // // // //           // },

// // // // //           {
// // // // //             type: "input" as const,
// // // // //             name: "workerAgentIdNumber",
// // // // //             inputType: "number",
// // // // //             label: t("nicDetails.idNumber"),
// // // // //             value: watch("workerAgentIdNumber"),
// // // // //             onChange: (v: string) => {
// // // // //               setValue("workerAgentIdNumber", v);

// // // // //               // only proceed if exactly 10 digits
// // // // //               if (v.length === 10) {
// // // // //                 // 1) cannot match your own ID
// // // // //                 if (v === idNumber) {
// // // // //                   setError("workerAgentIdNumber", {
// // // // //                     type: "manual",
// // // // //                     message:
// // // // //                       "Plaintiff ID cannot be the same as logged in user ID",
// // // // //                   });
// // // // //                   onIdNumberChange(""); // clear any prior fetch
// // // // //                   return;
// // // // //                 }
// // // // //                 // 2) must be in authorized list
// // // // //                 const ok = agentInfoData.Agent?.AgentDetails?.some(
// // // // //                   (d) => d.IdentityNumber === v
// // // // //                 );
// // // // //                 if (!ok) {
// // // // //                   setError("workerAgentIdNumber", {
// // // // //                     type: "manual",
// // // // //                     message: "Plaintiff ID not found in attorney's list",
// // // // //                   });
// // // // //                   onIdNumberChange("");
// // // // //                   return;
// // // // //                 }
// // // // //                 // passed both checks
// // // // //                 clearErrors("workerAgentIdNumber");
// // // // //                 onIdNumberChange(v); // trigger fetch upstream
// // // // //               } else {
// // // // //                 // too short => clear any prior fetch/response
// // // // //                 onIdNumberChange("");
// // // // //               }
// // // // //             },
// // // // //             validation: {
// // // // //               required: t("idNumberValidation"),
// // // // //               pattern: {
// // // // //                 value: /^\d{10}$/,
// // // // //                 message: t("max10ValidationDesc"),
// // // // //               },
// // // // //             },
// // // // //           },

// // // // //           // Name
// // // // //           ...(rd?.PlaintiffName
// // // // //             ? [
// // // // //                 {
// // // // //                   type: "readonly" as const,
// // // // //                   label: t("nicDetails.name"),
// // // // //                   value: rd.PlaintiffName,
// // // // //                   isLoading: apiLoadingStates.nic,
// // // // //                 },
// // // // //               ]
// // // // //             : [
// // // // //                 {
// // // // //                   type: "input" as const,
// // // // //                   name: "userName",
// // // // //                   inputType: "text",
// // // // //                   label: t("nicDetails.name"),
// // // // //                   value: watch("userName"),
// // // // //                   onChange: (v: string) => setValue("userName", v),
// // // // //                   validation: { required: t("nameValidation") },
// // // // //                 },
// // // // //               ]),

// // // // //           // Region
// // // // //           ...(rd?.Region
// // // // //             ? [
// // // // //                 {
// // // // //                   type: "readonly" as const,
// // // // //                   label: t("nicDetails.region"),
// // // // //                   value: rd.Region,
// // // // //                   isLoading: apiLoadingStates.nic,
// // // // //                 },
// // // // //               ]
// // // // //             : [
// // // // //                 {
// // // // //                   type: "autocomplete" as const,
// // // // //                   name: "region",
// // // // //                   label: t("nicDetails.region"),
// // // // //                   options: RegionOptions,
// // // // //                   value: watch("region"),
// // // // //                   onChange: (v: string) => setValue("region", v),
// // // // //                   validation: { required: t("regionValidation") },
// // // // //                 },
// // // // //               ]),

// // // // //           // City
// // // // //           ...(rd?.City
// // // // //             ? [
// // // // //                 {
// // // // //                   type: "readonly" as const,
// // // // //                   label: t("nicDetails.city"),
// // // // //                   value: rd.City,
// // // // //                   isLoading: apiLoadingStates.nic,
// // // // //                 },
// // // // //               ]
// // // // //             : [
// // // // //                 {
// // // // //                   type: "autocomplete" as const,
// // // // //                   name: "city",
// // // // //                   label: t("nicDetails.city"),
// // // // //                   options: CityOptions,
// // // // //                   value: watch("city"),
// // // // //                   onChange: (v: string) => setValue("city", v),
// // // // //                   validation: { required: t("cityValidation") },
// // // // //                 },
// // // // //               ]),

// // // // //           // DOB Hijri
// // // // //           {
// // // // //             type: "readonly" as const,
// // // // //             label: t("nicDetails.dobHijri"),
// // // // //             value: rd?.DateOfBirthHijri || "",
// // // // //             isLoading: apiLoadingStates.nic,
// // // // //           },
// // // // //           // DOB Gregorian
// // // // //           {
// // // // //             type: "readonly" as const,
// // // // //             label: t("nicDetails.dobGrog"),
// // // // //             value: rd?.DateOfBirthGregorian || "",
// // // // //             isLoading: apiLoadingStates.nic,
// // // // //           },

// // // // //           // Phone Number
// // // // //           ...(rd?.PhoneNumber
// // // // //             ? [
// // // // //                 {
// // // // //                   type: "readonly" as const,
// // // // //                   label: t("nicDetails.phoneNumber"),
// // // // //                   value: rd.PhoneNumber,
// // // // //                   isLoading: apiLoadingStates.nic,
// // // // //                 },
// // // // //               ]
// // // // //             : [
// // // // //                 {
// // // // //                   type: "input" as const,
// // // // //                   name: "phoneNumber",
// // // // //                   inputType: "number",
// // // // //                   placeholder: "05xxxxxxxx",
// // // // //                   label: t("nicDetails.phoneNumber"),
// // // // //                   value: watch("phoneNumber"),
// // // // //                   onChange: (v: string) => setValue("phoneNumber", Number(v)),
// // // // //                   validation: {
// // // // //                     required: t("phoneNumberValidation"),
// // // // //                     pattern: {
// // // // //                       value: /^05\d{8}$/,
// // // // //                       message: t("phoneValidationMessage"),
// // // // //                     },
// // // // //                   },
// // // // //                 },
// // // // //               ]),

// // // // //           // Occupation
// // // // //           ...(rd?.Occupation
// // // // //             ? [
// // // // //                 {
// // // // //                   type: "readonly" as const,
// // // // //                   label: t("nicDetails.occupation"),
// // // // //                   value: rd.Occupation,
// // // // //                   isLoading: apiLoadingStates.nic,
// // // // //                 },
// // // // //               ]
// // // // //             : [
// // // // //                 {
// // // // //                   type: "autocomplete" as const,
// // // // //                   name: "occupation",
// // // // //                   label: t("nicDetails.occupation"),
// // // // //                   options: OccupationOptions,
// // // // //                   value: watch("occupation"),
// // // // //                   onChange: (v: string) => setValue("occupation", v),
// // // // //                   validation: { required: t("occupationValidation") },
// // // // //                 },
// // // // //               ]),

// // // // //           // Gender
// // // // //           ...(rd?.Gender
// // // // //             ? [
// // // // //                 {
// // // // //                   type: "readonly" as const,
// // // // //                   label: t("nicDetails.gender"),
// // // // //                   value: rd.Gender,
// // // // //                   isLoading: apiLoadingStates.nic,
// // // // //                 },
// // // // //               ]
// // // // //             : [
// // // // //                 {
// // // // //                   type: "autocomplete" as const,
// // // // //                   name: "gender",
// // // // //                   label: t("nicDetails.gender"),
// // // // //                   options: GenderOptions,
// // // // //                   value: watch("gender"),
// // // // //                   onChange: (v: string) => setValue("gender", v),
// // // // //                   validation: { required: t("genderValidation") },
// // // // //                 },
// // // // //               ]),

// // // // //           // Nationality
// // // // //           ...(rd?.Nationality
// // // // //             ? [
// // // // //                 {
// // // // //                   type: "readonly" as const,
// // // // //                   label: t("nicDetails.nationality"),
// // // // //                   value: rd.Nationality,
// // // // //                   isLoading: apiLoadingStates.nic,
// // // // //                 },
// // // // //               ]
// // // // //             : [
// // // // //                 {
// // // // //                   type: "autocomplete" as const,
// // // // //                   name: "nationality",
// // // // //                   label: t("nicDetails.nationality"),
// // // // //                   options: NationalityOptions,
// // // // //                   value: watch("nationality"),
// // // // //                   onChange: (v: string) => setValue("nationality", v),
// // // // //                   validation: { required: t("nationalityValidation") },
// // // // //                 },
// // // // //               ]),
// // // // //         ],
// // // // //       });
// // // // //     }

// // // // //     //  else if (claimantStatus === "representative") {
// // // // //     //   sections.push({
// // // // //     //     title: t("nicDetails.agentType"),
// // // // //     //     isRadio: true,
// // // // //     //     children: [
// // // // //     //       {
// // // // //     //         type: "radio",
// // // // //     //         name: "agentType",
// // // // //     //         label: t("plaintiff_type"),
// // // // //     //         options: AgentTypeOptions,
// // // // //     //         value: agentType,
// // // // //     //         onChange: (value: string) => setValue("agentType", value),
// // // // //     //         validation: { required: t("agentTypeValidation") },
// // // // //     //       },
// // // // //     //     ],
// // // // //     //   });

// // // // //     //   // Agent info from attorney API data (agentInfoData)
// // // // //     //   sections.push({
// // // // //     //     title: t("nicDetails.agentData"),
// // // // //     //     className: "agent-data-section",
// // // // //     //     gridCols: 3,
// // // // //     //     children: [
// // // // //     //       {
// // // // //     //         type: "readonly",
// // // // //     //         label: t("nicDetails.idNumber"),
// // // // //     //         value: idNumber, // agent's own id
// // // // //     //       },
// // // // //     //       {
// // // // //     //         type: agentType === "local_agency" ? "readonly" : "input",
// // // // //     //         name: "agentName",
// // // // //     //         label: t("nicDetails.agentName"),
// // // // //     //         value:
// // // // //     //           agentType === "local_agency"
// // // // //     //             ? agentInfoData?.Agent?.AgentName || ""
// // // // //     //             : nicData?.NICDetails?.PlaintiffName || "", // agent nic name fallback
// // // // //     //         onChange: (value: string) => setValue("agentName", value),
// // // // //     //         validation: { required: t("agentNameValidation") },
// // // // //     //         isLoading: agentType === "local_agency" && apiLoadingStates?.agent,
// // // // //     //       },
// // // // //     //       {
// // // // //     //         type: "input" as const,
// // // // //     //         name: "agencyNumber",
// // // // //     //         label: t("nicDetails.agencyNumber"),
// // // // //     //         inputType: "number",
// // // // //     //         placeholder: "10xxxxxxxx",
// // // // //     //         value: String(watch("agencyNumber") || ""),
// // // // //     //         onChange: (value: string) => {
// // // // //     //           setValue("agencyNumber", Number(value));
// // // // //     //           if (agentType === "local_agency" && value.length === 9) {
// // // // //     //             onAgencyNumberChange?.(value);
// // // // //     //           }
// // // // //     //         },
// // // // //     //         validation: {
// // // // //     //           required: t("agencyNumberValidation"),
// // // // //     //           maxLength: { value: 9, message: t("max9Validation") },
// // // // //     //           pattern: { value: /^\d{9}$/, message: t("max9ValidationDesc") },
// // // // //     //         },
// // // // //     //       },
// // // // //     //       {
// // // // //     //         type: agentType === "local_agency" ? "readonly" : "input",
// // // // //     //         name: "agencyStatus",
// // // // //     //         label: t("nicDetails.agencyStatus"),
// // // // //     //         value:
// // // // //     //           agentType === "local_agency"
// // // // //     //             ? agentInfoData?.Agent?.MandateStatus || ""
// // // // //     //             : "",
// // // // //     //         onChange: (value: string) => setValue("agencyStatus", value),
// // // // //     //         validation: { required: t("agencyStatusValidation") },
// // // // //     //         isLoading: agentType === "local_agency" && apiLoadingStates?.agent,
// // // // //     //       },
// // // // //     //       {
// // // // //     //         type: agentType === "local_agency" ? "readonly" : "input",
// // // // //     //         name: "agencySource",
// // // // //     //         label: t("nicDetails.agencySource"),
// // // // //     //         value:
// // // // //     //           agentType === "local_agency"
// // // // //     //             ? agentInfoData?.Agent?.MandateSource || ""
// // // // //     //             : "",
// // // // //     //         onChange: (value: string) => setValue("agencySource", value),
// // // // //     //         validation: { required: t("agencySourceValidation") },
// // // // //     //         isLoading: agentType === "local_agency" && apiLoadingStates?.agent,
// // // // //     //       },
// // // // //     //       {
// // // // //     //         type: "input" as const,
// // // // //     //         name: "Agent_CurrentPlaceOfWork",
// // // // //     //         label: t("nicDetails.currentWorkingPlace"),
// // // // //     //         inputType: "text",
// // // // //     //         value: String(watch("Agent_CurrentPlaceOfWork") || ""),
// // // // //     //         onChange: (value: string) =>
// // // // //     //           setValue("Agent_CurrentPlaceOfWork", value),
// // // // //     //         validation: { required: t("workplaceValidation") },
// // // // //     //       },
// // // // //     //       {
// // // // //     //         type: "input" as const,
// // // // //     //         name: "Agent_ResidencyAddress",
// // // // //     //         label: t("nicDetails.residenceAddress"),
// // // // //     //         inputType: "text",
// // // // //     //         value: String(watch("Agent_ResidencyAddress") || ""),
// // // // //     //         onChange: (value: string) =>
// // // // //     //           setValue("Agent_ResidencyAddress", value),
// // // // //     //         validation: { required: t("residenceAddressValidation") },
// // // // //     //       },
// // // // //     //       ...(agentType === "external_agency"
// // // // //     //         ? [
// // // // //     //             {
// // // // //     //               type: "autocomplete" as const,
// // // // //     //               name: "occupation",
// // // // //     //               label: t("nicDetails.occupation"),
// // // // //     //               options: OccupationOptions || [],
// // // // //     //               value:
// // // // //     //                 nicData?.NICDetails?.Occupation ||
// // // // //     //                 watch("occupation") ||
// // // // //     //                 "",
// // // // //     //               onChange: (value: any) => setValue("occupation", value),
// // // // //     //               validation: { required: t("occupationValidation") },
// // // // //     //             },
// // // // //     //           ]
// // // // //     //         : []),
// // // // //     //     ],
// // // // //     //   });

// // // // //     //   // Plaintiff data (the person represented) - fields bound to NIC details fetched by plaintiff id
// // // // //     //   sections.push({
// // // // //     //     title: t("nicDetails.plaintiffData"),
// // // // //     //     className: "plaintiff-data-section",
// // // // //     //     gridCols: 3,
// // // // //     //     children: [
// // // // //     //       {
// // // // //     //         type: "input",
// // // // //     //         name: "workerAgentIdNumber",
// // // // //     //         label: t("nicDetails.idNumber"),
// // // // //     //         inputType: "number",
// // // // //     //         value: String(watch("workerAgentIdNumber") || ""),
// // // // //     //         onChange: (value: string) => {
// // // // //     //           // Validate plaintiff ID against agent's authorized list
// // // // //     //           if (value.length === 10) {
// // // // //     //             if (value === idNumber) {
// // // // //     //               setError("workerAgentIdNumber", {
// // // // //     //                 type: "manual",
// // // // //     //                 message:
// // // // //     //                   "Plaintiff ID cannot be the same as logged in user ID",
// // // // //     //               });
// // // // //     //               setValue("workerAgentIdNumber", "");
// // // // //     //               return;
// // // // //     //             }

// // // // //     //             const isValidId = agentInfoData?.Agent?.AgentDetails?.some(
// // // // //     //               (detail: any) => detail.IdentityNumber === value
// // // // //     //             );

// // // // //     //             if (!isValidId) {
// // // // //     //               setError("workerAgentIdNumber", {
// // // // //     //                 type: "manual",
// // // // //     //                 message: "Plaintiff ID not found in attorney's list",
// // // // //     //               });
// // // // //     //               setValue("workerAgentIdNumber", "");
// // // // //     //               return;
// // // // //     //             }

// // // // //     //             // Trigger fetching NIC details for plaintiff
// // // // //     //             onIdNumberChange(value);
// // // // //     //           }
// // // // //     //           setValue("workerAgentIdNumber", value);
// // // // //     //         },
// // // // //     //         validation: {
// // // // //     //           required: t("idNumberValidation"),
// // // // //     //           maxLength: { value: 10, message: t("max10Validation") },
// // // // //     //           pattern: { value: /^\d{10}$/, message: t("max10ValidationDesc") },
// // // // //     //         },
// // // // //     //       },
// // // // //     //       {
// // // // //     //         type: "readonly",
// // // // //     //         title: "hijridate",
// // // // //     //         isLoading: apiLoadingStates?.nic,
// // // // //     //         label: t("nicDetails.dobHijri"),
// // // // //     //         value: nicData?.NICDetails?.DateOfBirthHijri,
// // // // //     //       },

// // // // //     //       {
// // // // //     //         type: "readonly",
// // // // //     //         title: "",
// // // // //     //         isLoading: apiLoadingStates?.nic,
// // // // //     //         label: t("nicDetails.dobGrog"),
// // // // //     //         value: nicData?.NICDetails?.DateOfBirthGregorian,
// // // // //     //       },

// // // // //     //       {
// // // // //     //         // Other plaintiff fields like name, region, city, etc.
// // // // //     //         type: nicData?.NICDetails?.PlaintiffName ? "readonly" : "input",
// // // // //     //         name: "userName",
// // // // //     //         label: t("nicDetails.name"),
// // // // //     //         value:
// // // // //     //           nicData?.NICDetails?.PlaintiffName || watch("userName") || "",
// // // // //     //         onChange: (value: string) => setValue("userName", value),
// // // // //     //         validation: { required: t("nameValidation") },
// // // // //     //       },
// // // // //     //       {
// // // // //     //         type: nicData?.NICDetails?.Region ? "readonly" : "autocomplete",
// // // // //     //         name: "region",
// // // // //     //         label: t("nicDetails.region"),
// // // // //     //         options: RegionOptions || [],
// // // // //     //         value: nicData?.NICDetails?.Region || watch("region") || "",
// // // // //     //         onChange: (value: any) => setValue("region", value),
// // // // //     //         validation: { required: t("regionValidation") },
// // // // //     //       },
// // // // //     //       {
// // // // //     //         type: nicData?.NICDetails?.City ? "readonly" : "autocomplete",
// // // // //     //         name: "city",
// // // // //     //         label: t("nicDetails.city"),
// // // // //     //         options: CityOptions,
// // // // //     //         value: nicData?.NICDetails?.City || watch("city") || "",
// // // // //     //         onChange: (value: any) => setValue("city", value),
// // // // //     //         validation: { required: t("cityValidation") },
// // // // //     //       },
// // // // //     //       {
// // // // //     //         type: nicData?.NICDetails?.PhoneNumber ? "readonly" : "input",
// // // // //     //         name: "phoneNumber",
// // // // //     //         label: t("nicDetails.phoneNumber"),
// // // // //     //         inputType: "number",
// // // // //     //         placeholder: "05xxxxxxxx",
// // // // //     //         value:
// // // // //     //           nicData?.NICDetails?.PhoneNumber ||
// // // // //     //           String(watch("phoneNumber") || ""),
// // // // //     //         onChange: (value: string) => setValue("phoneNumber", Number(value)),
// // // // //     //         validation: {
// // // // //     //           required: t("phoneNumberValidation"),
// // // // //     //           pattern: {
// // // // //     //             value: /^05\d{8}$/,
// // // // //     //             message: t("phoneValidationMessage"),
// // // // //     //           },
// // // // //     //         },
// // // // //     //       },
// // // // //     //       {
// // // // //     //         type: nicData?.NICDetails?.Occupation ? "readonly" : "autocomplete",
// // // // //     //         name: "occupation",
// // // // //     //         label: t("nicDetails.occupation"),
// // // // //     //         options: OccupationOptions || [],
// // // // //     //         value: nicData?.NICDetails?.Occupation || watch("occupation") || "",
// // // // //     //         onChange: (value: any) => setValue("occupation", value),
// // // // //     //         validation: { required: t("occupationValidation") },
// // // // //     //       },
// // // // //     //       {
// // // // //     //         type: nicData?.NICDetails?.Gender ? "readonly" : "autocomplete",
// // // // //     //         name: "gender",
// // // // //     //         label: t("nicDetails.gender"),
// // // // //     //         options: GenderOptions,
// // // // //     //         value: nicData?.NICDetails?.Gender || watch("gender") || "",
// // // // //     //         onChange: (value: any) => setValue("gender", value),
// // // // //     //         validation: { required: t("genderValidation") },
// // // // //     //       },
// // // // //     //       {
// // // // //     //         type: nicData?.NICDetails?.Nationality
// // // // //     //           ? "readonly"
// // // // //     //           : "autocomplete",
// // // // //     //         name: "nationality",
// // // // //     //         label: t("nicDetails.nationality"),
// // // // //     //         options: NationalityOptions,
// // // // //     //         value:
// // // // //     //           nicData?.NICDetails?.Nationality || watch("nationality") || "",
// // // // //     //         onChange: (value: any) => setValue("nationality", value),
// // // // //     //         validation: { required: t("nationalityValidation") },
// // // // //     //       },
// // // // //     //     ],
// // // // //     //   });

// // // // //     //   sections.push({
// // // // //     //     title: t("addInternationalNumber"),
// // // // //     //     className: "international-phone-section",
// // // // //     //     gridCols: 3,
// // // // //     //     children: [
// // // // //     //       {
// // // // //     //         type: "checkbox",
// // // // //     //         name: "isPhone",
// // // // //     //         label: t("addInternationalNumber"),
// // // // //     //         checked: isPhone,
// // // // //     //         onChange: (checked: boolean) => {
// // // // //     //           setValue("isPhone", checked);
// // // // //     //           if (!checked) {
// // // // //     //             setOtpSent(false);
// // // // //     //             setOtp(Array(6).fill(""));
// // // // //     //             setTimeLeft(60);
// // // // //     //             setShowResend(false);
// // // // //     //           }
// // // // //     //         },
// // // // //     //       },
// // // // //     //       ...(isPhone && !otpSent
// // // // //     //         ? [
// // // // //     //             {
// // // // //     //               type: "autocomplete",
// // // // //     //               label: t("countryCode"),
// // // // //     //               name: "phoneCode",
// // // // //     //               options: CountryCodeOptions,
// // // // //     //               value: phoneCode,
// // // // //     //               onChange: (value: string) => setValue("phoneCode", value),
// // // // //     //               validation: {
// // // // //     //                 required: t("codeValidation"),
// // // // //     //               },
// // // // //     //             },
// // // // //     //             {
// // // // //     //               type: "input",
// // // // //     //               name: "interPhoneNumber",
// // // // //     //               label: t("nicDetails.phoneNumber"),
// // // // //     //               inputType: "tel",
// // // // //     //               maxLength: 10,
// // // // //     //               placeholder: phoneCode
// // // // //     //                 ? getPhoneConfig(phoneCode).placeholder
// // // // //     //                 : "Enter phone number",
// // // // //     //               validation: {
// // // // //     //                 required: t("interPhoneNumberValidation"),
// // // // //     //                 validate: (value: string) => {
// // // // //     //                   if (!phoneCode) return "Please select country code first";
// // // // //     //                   const pattern = getPhoneConfig(phoneCode).pattern;
// // // // //     //                   return pattern.test(value) || t("phoneNumberValidation");
// // // // //     //                 },
// // // // //     //               },
// // // // //     //             },
// // // // //     //             {
// // // // //     //               type: "custom",
// // // // //     //               component: (
// // // // //     //                 <Button
// // // // //     //                   size="sm"
// // // // //     //                   className="h-8 mt-[35px]"
// // // // //     //                   onClick={handleSendOtp}
// // // // //     //                   disabled={isSendOtpDisabled}
// // // // //     //                   variant={isSendOtpDisabled ? "disabled" : "primary"}
// // // // //     //                   typeVariant={isSendOtpDisabled ? "freeze" : "primary"}
// // // // //     //                 >
// // // // //     //                   {t("verifyOtp")}
// // // // //     //                 </Button>
// // // // //     //               ),
// // // // //     //             },
// // // // //     //           ]
// // // // //     //         : []),
// // // // //     //       ...(otpSent && !isVerified
// // // // //     //         ? [
// // // // //     //             {
// // // // //     //               type: "custom",
// // // // //     //               component: (
// // // // //     //                 <div className="space-y-4">
// // // // //     //                   <p className="text-sm text-gray-600">
// // // // //     //                     Enter the 6-digit verification OTP code sent to the
// // // // //     //                     mobile number linked to your account.
// // // // //     //                   </p>

// // // // //     //                   <div className="flex justify-between gap-2">
// // // // //     //                     {otp.map((digit, index) => (
// // // // //     //                       <input
// // // // //     //                         key={index}
// // // // //     //                         id={`otp-input-${index}`}
// // // // //     //                         type="text"
// // // // //     //                         inputMode="numeric"
// // // // //     //                         maxLength={1}
// // // // //     //                         className={`w-12 h-12 border rounded text-center text-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
// // // // //     //                           isNotVerified &&
// // // // //     //                           "border-2 border-red-300 shadow-lg"
// // // // //     //                         }`}
// // // // //     //                         value={digit}
// // // // //     //                         onChange={(e) =>
// // // // //     //                           handleOtpChange(index, e.target.value)
// // // // //     //                         }
// // // // //     //                         onKeyDown={(e) => handleKeyDown(index, e, otp)}
// // // // //     //                         autoFocus={index === 0}
// // // // //     //                       />
// // // // //     //                     ))}
// // // // //     //                   </div>

// // // // //     //                   <div className="flex justify-end items-center gap-3">
// // // // //     //                     {showResend ? (
// // // // //     //                       <Button
// // // // //     //                         variant="secondary"
// // // // //     //                         typeVariant="outline"
// // // // //     //                         onClick={handleResendOtp}
// // // // //     //                         size="xs"
// // // // //     //                         disabled={isSendOtpDisabled}
// // // // //     //                       >
// // // // //     //                         {t("sendOtp")}
// // // // //     //                       </Button>
// // // // //     //                     ) : (
// // // // //     //                       <div className="flex items-center gap-2">
// // // // //     //                         <div className="relative w-5 h-5">
// // // // //     //                           <div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>
// // // // //     //                           <div
// // // // //     //                             className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent transition-all duration-300"
// // // // //     //                             style={{
// // // // //     //                               transform: `rotate(${progress * 3.6}deg)`,
// // // // //     //                               clipPath:
// // // // //     //                                 progress >= 50
// // // // //     //                                   ? "inset(0)"
// // // // //     //                                   : "inset(0 0 0 50%)",
// // // // //     //                             }}
// // // // //     //                           ></div>
// // // // //     //                           {progress < 50 && (
// // // // //     //                             <div
// // // // //     //                               className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent transition-all duration-300"
// // // // //     //                               style={{
// // // // //     //                                 transform: `rotate(180deg)`,
// // // // //     //                                 clipPath: `inset(0 ${
// // // // //     //                                   100 - progress * 2
// // // // //     //                                 }% 0 0)`,
// // // // //     //                               }}
// // // // //     //                             ></div>
// // // // //     //                           )}
// // // // //     //                         </div>
// // // // //     //                         <span className="text-sm text-gray-600">
// // // // //     //                           Resend OTP in {timeLeft}s
// // // // //     //                         </span>
// // // // //     //                       </div>
// // // // //     //                     )}
// // // // //     //                   </div>
// // // // //     //                 </div>
// // // // //     //               ),
// // // // //     //             },
// // // // //     //             {
// // // // //     //               type: "custom",
// // // // //     //               component: (
// // // // //     //                 <Button
// // // // //     //                   size="sm"
// // // // //     //                   onClick={verifyOtp}
// // // // //     //                   className="w-full"
// // // // //     //                   disabled={isVerifyOtpDisabled || isVerified}
// // // // //     //                   variant={
// // // // //     //                     isVerifyOtpDisabled || isVerified
// // // // //     //                       ? "disabled"
// // // // //     //                       : "primary"
// // // // //     //                   }
// // // // //     //                   typeVariant={
// // // // //     //                     isVerifyOtpDisabled || isVerified ? "freeze" : "primary"
// // // // //     //                   }
// // // // //     //                 >
// // // // //     //                   {t("verifyOtp")}
// // // // //     //                 </Button>
// // // // //     //               ),
// // // // //     //             },
// // // // //     //           ]
// // // // //     //         : []),
// // // // //     //       ...(isVerified
// // // // //     //         ? [
// // // // //     //             {
// // // // //     //               type: "custom",
// // // // //     //               component: (
// // // // //     //                 <div className="p-4 bg-green-50 text-green-700 rounded-md">
// // // // //     //                   <p className="font-medium">
// // // // //     //                     Phone number verified successfully!
// // // // //     //                   </p>
// // // // //     //                 </div>
// // // // //     //               ),
// // // // //     //             },
// // // // //     //           ]
// // // // //     //         : []),
// // // // //     //     ],
// // // // //     //   });
// // // // //     // }

// // // // //     return sections;
// // // // //   };

// // // // //   const ClaimantSelectSection = [];

// // // // //   if (userType === "Worker" || plaintiffStatus === "leg_rep_worker") {
// // // // //     ClaimantSelectSection.push({
// // // // //       isRadio: true,
// // // // //       children: [
// // // // //         {
// // // // //           type: "radio",
// // // // //           name: "claimantStatus",
// // // // //           label: t("claimantStatus"),
// // // // //           options: ClaimantStatusRadioOptions,
// // // // //           value: claimantStatus,
// // // // //           onChange: (value: string) => setValue("claimantStatus", value),
// // // // //           validation: { required: "Region is required" },
// // // // //         },
// // // // //       ],
// // // // //     });
// // // // //   }

// // // // //   const conditionalSections = [];

// // // // //   if (plaintiffStatus === "legal_representative") {
// // // // //     conditionalSections.push(
// // // // //       {
// // // // //         data: {
// // // // //           type: "readonly",
// // // // //           fields: [
// // // // //             {
// // // // //               label: LegalRep("plaintiffDetails.MainCategoryGovernmentEntity"),
// // // // //               value: selectedMainCategory?.label || "",
// // // // //             },
// // // // //             {
// // // // //               label: LegalRep("plaintiffDetails.SubcategoryGovernmentEntity"),
// // // // //               value: selectedSubCategory?.label,
// // // // //             },
// // // // //           ],
// // // // //         },
// // // // //       },
// // // // //       {
// // // // //         title: LegalRep("LegalRepresentative"),
// // // // //         data: {
// // // // //           type: "readonly",
// // // // //           fields: [
// // // // //             {
// // // // //               label: LegalRep(
// // // // //                 "LegalRepresentativeDetails.LegalRepresentativeName"
// // // // //               ),
// // // // //               value: govRepDetail?.RepName,
// // // // //             },
// // // // //             {
// // // // //               label: LegalRep(
// // // // //                 "LegalRepresentativeDetails.LegalRepresentativeID"
// // // // //               ),
// // // // //               value: govRepDetail?.RepNationalid,
// // // // //             },
// // // // //             {
// // // // //               label: LegalRep("LegalRepresentativeDetails.MobileNumber"),
// // // // //               value: govRepDetail?.RepMobileNumber,
// // // // //             },
// // // // //             {
// // // // //               label: LegalRep("LegalRepresentativeDetails.EmailAddress"),
// // // // //               value: govRepDetail?.EmailAddress,
// // // // //             },
// // // // //           ],
// // // // //         },
// // // // //       }
// // // // //     );
// // // // //   }

// // // // //   const formLayout: SectionLayout[] = [
// // // // //     ...baseSections,
// // // // //     ...ClaimantSelectSection,
// // // // //     ...conditionalSections,
// // // // //     ...getWorkerSections(),
// // // // //   ].filter(Boolean) as SectionLayout[];

// // // // //   return formLayout;
// // // // // };

// // // // // const handleKeyDown = (
// // // // //   index: number,
// // // // //   e: KeyboardEvent<HTMLInputElement>,
// // // // //   otp: string[]
// // // // // ): void => {
// // // // //   if (e.key === "Backspace" && !otp[index] && index > 0) {
// // // // //     const prev = document.getElementById(
// // // // //       `otp-input-${index - 1}`
// // // // //     ) as HTMLInputElement;
// // // // //     prev?.focus();
// // // // //   }
// // // // // };

// // // // // export const useClaimantFormLayout = () => {
// // // // //   const { i18n } = useTranslation();
// // // // //   const currentLanguage = i18n.language.toUpperCase();

// // // // //   return {
// // // // //     getNationalityLookup: () => ({
// // // // //       url: `/WeddiServices/V1/MainLookUp`,
// // // // //       params: {
// // // // //         LookupType: "DataElements",
// // // // //         ModuleKey: "MNT1",
// // // // //         ModuleName: "Nationality",
// // // // //         AcceptedLanguage: currentLanguage,
// // // // //         SourceSystem: "E-Services",
// // // // //       },
// // // // //     }),
// // // // //   };
// // // // // };
