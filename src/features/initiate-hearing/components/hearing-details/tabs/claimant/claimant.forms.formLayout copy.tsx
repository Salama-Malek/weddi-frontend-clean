// // // // // import {
// // // // //   Control,
// // // // //   UseFormSetValue,
// // // // //   UseFormWatch,
// // // // //   useForm,
// // // // // } from "react-hook-form";
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
// // // // // import { useNICTrigger } from "@/features/initiate-hearing/hooks/useNICTrigger";
// // // // // import { DateOfBirthField } from "@/shared/components/calanders";





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
// // // // // }

// // // // // interface DataElement {
// // // // //   ElementKey: string;
// // // // //   ElementValue: string;
// // // // // }

// // // // // interface FormLayoutProps {
// // // // //   setValue: UseFormSetValue<FormData>;
// // // // //   watch: UseFormWatch<FormData>;
// // // // //   control: Control<FormData>;
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
// // // // //   // onIdNumberChange: (id: string, hijriDate: string) => void;

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
// // // // //   control,
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
// // // // //   setError,
// // // // //   clearErrors,
// // // // //   verifyOtp,
// // // // //   principalNICResponse,
// // // // //   representativeNICResponse,
// // // // // }: FormLayoutProps): SectionLayout[] => {
// // // // //   const { register } = useForm<FormData>();

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
// // // // //     register("workerAgentDateOfBirthHijri");
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
// // // // //   // /******************* new  ************ */
// // // // //   // --- Field watchers for NIC trigger ---
  


// // // // //  // --- 1) form watches for rep‐only fields ---
// // // // // const applicantType        = watch("applicant");
// // // // // const workerAgentIdNumber  = watch("workerAgentIdNumber")        || "";
// // // // // const workerAgentHijriDob  = watch("workerAgentDateOfBirthHijri")|| "";
// // // // // // Only when both are valid:
// // // // // const shouldFetchNicAgent = 
// // // // //   applicantType === "representative" &&
// // // // //   workerAgentIdNumber.length === 10 &&
// // // // //   workerAgentHijriDob.length === 8;

// // // // // // --- 2) straight NIC query, skipped until we want it ---
// // // // // const {
// // // // //   data: nicAgent,
// // // // //   isFetching: nicAgentLoading,
// // // // //   isError: nicAgentError,
// // // // // } = useGetNICDetailsQuery(
// // // // //   {
// // // // //     IDNumber:         workerAgentIdNumber,
// // // // //     DateOfBirth:      workerAgentHijriDob,
// // // // //     AcceptedLanguage: "EN",
// // // // //     SourceSystem:     "E-Services",
// // // // //   },
// // // // //   { skip: !shouldFetchNicAgent }
// // // // // );

// // // // // // --- 3) effect that runs exactly once per fetch cycle ---
// // // // // useEffect(() => {
// // // // //   if (!shouldFetchNicAgent) return;
// // // // //   if (nicAgentError || !nicAgent?.NICDetails) {
// // // // //     setError("workerAgentIdNumber", {
// // // // //       type: "validate",
// // // // //       message: t("error.noNicData"),
// // // // //     });
// // // // //   } else {
// // // // //     const d = nicAgent.NICDetails;
// // // // //     setValue("userName",        d.PlaintiffName        || "");
// // // // //     setValue("region",          d.Region               || "");
// // // // //     setValue("city",            d.City                 || "");
// // // // //     setValue("occupation",      d.Occupation           || "");
// // // // //     setValue("gender",          d.Gender               || "");
// // // // //     setValue("nationality",     d.Nationality          || "");
// // // // //     setValue("gregorianDate",   d.DateOfBirthGregorian || "");
// // // // //     if (d.PhoneNumber) {
// // // // //       setValue("phoneNumber", Number(d.PhoneNumber));
// // // // //     }
// // // // //   }
// // // // // }, [
// // // // //   shouldFetchNicAgent,
// // // // //   nicAgent,
// // // // //   nicAgentError,
// // // // //   setValue,
// // // // //   setError,
// // // // //   t,
// // // // // ]);


// // // // //   // testtttttttttttttttttt
// // // // //   // --- NIC trigger integration ---
// // // // //   const { isFetching: nicLoading } = useNICTrigger(
// // // // //     workerAgentIdNumber,
// // // // //     workerAgentHijriDob,
// // // // //     (nic) => {
// // // // //       setValue("userName", nic.PlaintiffName || "");
// // // // //       setValue("region", nic.Region || "");
// // // // //       setValue("city", nic.City || "");
// // // // //       setValue("occupation", nic.Occupation || "");
// // // // //       setValue("gender", nic.Gender || "");
// // // // //       setValue("nationality", nic.Nationality || "");
// // // // //       setValue("gregorianDate", nic.DateOfBirthGregorian || "");
// // // // //       if (nic.PhoneNumber) setValue("phoneNumber", Number(nic.PhoneNumber));
// // // // //     },
// // // // //     () => {
// // // // //       setError("workerAgentIdNumber", {
// // // // //         type: "validate",
// // // // //         message: t("error.noNicData"),
// // // // //       });
// // // // //     }
// // // // //   );

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

// // // // //   // const applicantType = watch("applicant");
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
// // // // //             isLoading: nicLoading,
// // // // //           },

// // // // //           // Name
// // // // //           ...(pd?.PlaintiffName
// // // // //             ? [
// // // // //                 {
// // // // //                   type: "readonly" as const,
// // // // //                   label: t("nicDetails.name"),
// // // // //                   value: pd.PlaintiffName,
// // // // //                   isLoading: nicLoading,
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
// // // // //                   isLoading: nicLoading,
// // // // //                 },
// // // // //               ]),

// // // // //           // Region
// // // // //           ...(pd?.Region
// // // // //             ? [
// // // // //                 {
// // // // //                   type: "readonly" as const,
// // // // //                   label: t("nicDetails.region"),
// // // // //                   value: pd.Region,
// // // // //                   isLoading: nicLoading,
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
// // // // //                   isLoading: nicLoading,
// // // // //                 },
// // // // //               ]),

// // // // //           // City
// // // // //           ...(pd?.City
// // // // //             ? [
// // // // //                 {
// // // // //                   type: "readonly" as const,
// // // // //                   label: t("nicDetails.city"),
// // // // //                   value: pd.City,
// // // // //                   onChange: (v: string) => setValue("city", v),
// // // // //                   validation: { required: t("cityValidation") },
// // // // //                   isLoading: nicLoading,
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
// // // // //                   isLoading: nicLoading,
// // // // //                 },
// // // // //               ]),

// // // // //           // Date of Birth (Hijri)
// // // // //           {
// // // // //             type: "readonly" as const,
// // // // //             label: t("nicDetails.dobHijri"),
// // // // //             value: pd?.DateOfBirthHijri || "",
// // // // //             isLoading: nicLoading,
// // // // //           },
// // // // //           // Date of Birth (Gregorian)
// // // // //           {
// // // // //             type: "readonly" as const,
// // // // //             label: t("nicDetails.dobGrog"),
// // // // //             value: pd?.DateOfBirthGregorian || "",
// // // // //             isLoading: nicLoading,
// // // // //           },

// // // // //           // Phone Number
// // // // //           ...(pd?.PhoneNumber
// // // // //             ? [
// // // // //                 {
// // // // //                   type: "readonly" as const,
// // // // //                   label: t("nicDetails.phoneNumber"),
// // // // //                   value: pd.PhoneNumber,
// // // // //                   isLoading: nicLoading,
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
// // // // //                   isLoading: nicLoading,
// // // // //                 },
// // // // //               ]),

// // // // //           // Occupation
// // // // //           ...(pd?.Occupation
// // // // //             ? [
// // // // //                 {
// // // // //                   type: "readonly" as const,
// // // // //                   label: t("nicDetails.occupation"),
// // // // //                   value: pd.Occupation,
// // // // //                   isLoading: nicLoading,
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
// // // // //                   isLoading: nicLoading,
// // // // //                 },
// // // // //               ]),

// // // // //           // Gender
// // // // //           ...(pd?.Gender
// // // // //             ? [
// // // // //                 {
// // // // //                   type: "readonly" as const,
// // // // //                   label: t("nicDetails.gender"),
// // // // //                   value: pd.Gender,
// // // // //                   isLoading: nicLoading,
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
// // // // //                   isLoading: nicLoading,
// // // // //                 },
// // // // //               ]),

// // // // //           // Nationality
// // // // //           ...(pd?.Nationality
// // // // //             ? [
// // // // //                 {
// // // // //                   type: "readonly" as const,
// // // // //                   label: t("nicDetails.nationality"),
// // // // //                   value: pd.Nationality,
// // // // //                   isLoading: nicLoading,
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
// // // // //                   isLoading: nicLoading,
// // // // //                 },
// // // // //               ]),

// // // // //           // Applicant (if present)
// // // // //           ...(pd?.Applicant
// // // // //             ? [
// // // // //                 {
// // // // //                   type: "readonly" as const,
// // // // //                   label: t("nicDetails.applicant"),
// // // // //                   value: pd.Applicant,
// // // // //                   isLoading: nicLoading,
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

// // // // //           {
// // // // //             type: "input" as const,
// // // // //             name: "agencyNumber",
// // // // //             inputType: "number",
// // // // //             label: t("nicDetails.agencyNumber"),
// // // // //             placeholder: "10xxxxxxxx",
// // // // //             value: watch("agencyNumber"),
// // // // //             onChange: (v: string) => {
// // // // //               // always keep form state up to date
// // // // //               setValue("agencyNumber", v);
// // // // //               // only fetch when it’s exactly 9 digits and a local agency
// // // // //               if (agentType === "local_agency" && v.length === 9) {
// // // // //                 onAgencyNumberChange(v);
// // // // //               } else {
// // // // //                 // clear any previous result if invalid
// // // // //                 onAgencyNumberChange("");
// // // // //               }
// // // // //             },
// // // // //             validation: {
// // // // //               required: t("agencyNumberValidation"),
// // // // //               maxLength: { value: 9, message: t("max9Validation") },
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
// // // // //           // 1) Plaintiff ID

// // // // //           {
// // // // //             type: "input",
// // // // //             name: "workerAgentIdNumber",
// // // // //             label: t("nicDetails.idNumber"),
// // // // //             value: watch("workerAgentIdNumber"),
// // // // //             onChange: (v: string) => {
// // // // //               setValue("workerAgentIdNumber", v);
// // // // //               clearErrors("workerAgentIdNumber");
// // // // //             },
// // // // //             validation: {
// // // // //               required: t("idNumberValidation"),
// // // // //               pattern: { value: /^\d{10}$/, message: t("max10ValidationDesc") },
// // // // //             },
// // // // //             isLoading: nicLoading,
// // // // //           },

// // // // //           // 2) Hijri DOB
// // // // //           {
// // // // //             name: "dateOfBirth",
// // // // //             type: "dateOfBirth",
// // // // //             hijriLabel: t("nicDetails.dobHijri"),
// // // // //             gregorianLabel: t("nicDetails.dobGrog"),
// // // // //             hijriFieldName: "workerAgentDateOfBirthHijri",
// // // // //             gregorianFieldName: "gregorianDate",
// // // // //             validation: { required: t("dateValidation") },
// // // // //             invalidFeedback: t("dateValidationDesc"),
// // // // //             isLoading: nicLoading,
// // // // //           },

// // // // //           // 3) Fetched or fallback fields:
// // // // //           ...(rd
// // // // //             ? [
// // // // //                 {
// // // // //                   type: "readonly" as const,
// // // // //                   label: t("nicDetails.name"),
// // // // //                   value: rd.PlaintiffName,
// // // // //                   isLoading: nicLoading,
// // // // //                 },
// // // // //                 {
// // // // //                   type: "readonly" as const,
// // // // //                   label: t("nicDetails.region"),
// // // // //                   value: rd.Region,
// // // // //                   isLoading: nicLoading,
// // // // //                 },
// // // // //                 {
// // // // //                   type: "readonly" as const,
// // // // //                   label: t("nicDetails.city"),
// // // // //                   value: rd.City,
// // // // //                   isLoading: nicLoading,
// // // // //                 },
// // // // //                 {
// // // // //                   type: "readonly" as const,
// // // // //                   label: t("nicDetails.dobGrog"),
// // // // //                   value: rd.DateOfBirthGregorian,
// // // // //                   isLoading: nicLoading,
// // // // //                 },
// // // // //                 {
// // // // //                   type: "readonly" as const,
// // // // //                   label: t("nicDetails.phoneNumber"),
// // // // //                   value: rd.PhoneNumber,
// // // // //                   isLoading: nicLoading,
// // // // //                 },
// // // // //                 {
// // // // //                   type: "readonly" as const,
// // // // //                   label: t("nicDetails.occupation"),
// // // // //                   value: rd.Occupation,
// // // // //                   isLoading: nicLoading,
// // // // //                 },
// // // // //                 {
// // // // //                   type: "readonly" as const,
// // // // //                   label: t("nicDetails.gender"),
// // // // //                   value: rd.Gender,
// // // // //                   isLoading: nicLoading,
// // // // //                 },
// // // // //                 {
// // // // //                   type: "readonly" as const,
// // // // //                   label: t("nicDetails.nationality"),
// // // // //                   value: rd.Nationality,
// // // // //                   isLoading: nicLoading,
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
// // // // //                 {
// // // // //                   type: "autocomplete" as const,
// // // // //                   name: "region",
// // // // //                   label: t("nicDetails.region"),
// // // // //                   options: RegionOptions,
// // // // //                   value: watch("region"),
// // // // //                   onChange: (v: string) => setValue("region", v),
// // // // //                   validation: { required: t("regionValidation") },
// // // // //                 },
// // // // //                 {
// // // // //                   type: "autocomplete" as const,
// // // // //                   name: "city",
// // // // //                   label: t("nicDetails.city"),
// // // // //                   options: CityOptions,
// // // // //                   value: watch("city"),
// // // // //                   onChange: (v: string) => setValue("city", v),
// // // // //                   validation: { required: t("cityValidation") },
// // // // //                 },
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
// // // // //                 {
// // // // //                   type: "autocomplete" as const,
// // // // //                   name: "occupation",
// // // // //                   label: t("nicDetails.occupation"),
// // // // //                   options: OccupationOptions,
// // // // //                   value: watch("occupation"),
// // // // //                   onChange: (v: string) => setValue("occupation", v),
// // // // //                   validation: { required: t("occupationValidation") },
// // // // //                 },
// // // // //                 {
// // // // //                   type: "autocomplete" as const,
// // // // //                   name: "gender",
// // // // //                   label: t("nicDetails.gender"),
// // // // //                   options: GenderOptions,
// // // // //                   value: watch("gender"),
// // // // //                   onChange: (v: string) => setValue("gender", v),
// // // // //                   validation: { required: t("genderValidation") },
// // // // //                 },
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
