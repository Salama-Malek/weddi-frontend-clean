import {
  Control,
  UseFormSetValue,
  UseFormWatch,
  useForm,
} from "react-hook-form";
import {
  SectionLayout,
  FormData,
  Option,
} from "@/shared/components/form/form.types";
import { useFormOptions } from "./claimant.forms.formOptions";
import React, {
  lazy,
  Suspense,
  useState,
  useMemo,
  useEffect,
  KeyboardEvent,
  ChangeEvent,
  FocusEvent,
} from "react";
import TableLoader from "@/shared/components/loader/TableLoader";
import { useTranslation } from "react-i18next";
import Button from "@/shared/components/button";
import { useLegalRepFormOptions } from "../../establishment-tabs/legal-representative/claimant.forms.formOptions";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { PHONE_PATTERNS } from "@/config/general";
import { TokenClaims } from "@/features/login/components/AuthProvider";
import {
  useGetNICDetailsQuery,
  NICDetailsResponse,
} from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";
import { NICDetailsParams } from "../../hearing.details.types";
import { formatHijriDate } from "@/shared/lib/helpers";
import AddAttachment from "../../../add-attachments";
// import { useNICTrigger } from "@/features/initiate-hearing/hooks/useNICTrigger";
import { DateOfBirthField } from "@/shared/components/calanders";
import { useAPIFormsData } from "@/providers/FormContext";
import OTPFormLayout from "./OTP.froms.formlayout";
import { boolean } from "ts-pattern/dist/patterns";
import { formatDateString } from "@/shared/lib/helpers";
interface AgentInfo {
  Agent?: {
    MandateNumber?: string;
    AgentName?: string;
    MandateStatus?: string;
    MandateSource?: string;
    AgentDetails?: Array<{
      IdentityNumber: string;
    }>;
  };
}

export interface DataElement {
  ElementKey: string;
  ElementValue: string;
}

interface FormLayoutProps {
  setValue: UseFormSetValue<FormData>;
  watch: UseFormWatch<FormData>;
  control: Control<FormData>;
  // lookups
  regionData: any;
  cityData: any;
  occupationData: any;
  genderData: any;
  nationalityData: any;
  countryData: any;

  // OTP
  sendOtpHandler: () => void;
  lastSentOtp: string;
  isVerified: boolean;
  isNotVerified: boolean;
  setIsNotVerified: (value: boolean) => void;

  // agent lookup
  agentInfoData: AgentInfo;
  apiLoadingStates: {
    agent: boolean;
    nic: boolean;
    estab: boolean;
    incomplete: boolean;
  };

  // legal-rep metadata
  userTypeLegalRepData: any;

  // callbacks
  onAgencyNumberChange: (value: string) => void;
  // onIdNumberChange: (id: string, hijriDate: string) => void;

  // form error handlers
  setError: (name: string, error: any) => void;
  clearErrors: (name: string) => void;

  // OTP verify
  verifyOtp: () => void;
  isVerify: boolean;

  // **NEW NIC responses**
  principalNICResponse?: NICDetailsResponse;
  principalNICRefetch: () => void;
  representativeNICResponse?: NICDetailsResponse;
}

export const useFormLayout = ({
  control,
  setValue,
  watch,
  regionData,
  cityData,
  occupationData,
  genderData,
  nationalityData,
  countryData,
  sendOtpHandler,
  isVerified,
  isNotVerified,
  setIsNotVerified,
  agentInfoData,
  apiLoadingStates,
  userTypeLegalRepData,
  onAgencyNumberChange,
  setError,
  clearErrors,
  verifyOtp,
  principalNICResponse,
  principalNICRefetch,
  representativeNICResponse,
}: FormLayoutProps): SectionLayout[] => {
  const { register } = useForm<FormData>();
  const { t, i18n } = useTranslation("hearingdetails");
  const { t: LegalRep } = useTranslation("legal_rep");
  const [getCookie] = useCookieState();
  
  // Get incomplete case type from cookie
  const incompleteCaseType = getCookie('incompleteCaseType');
  const claimantStatus = watch('claimantStatus');

  // Determine if we should show the claimant status selection
  const shouldShowClaimantStatus = !incompleteCaseType;

  // Determine which fields to show based on case type
  const showPrincipalFields = claimantStatus === "principal" || incompleteCaseType?.PlaintiffType === "Self(Worker)";
  const showRepresentativeFields = claimantStatus === "representative" || incompleteCaseType?.PlaintiffType === "Agent";

  // If there's an incomplete case, set the appropriate status
  useEffect(() => {
    if (incompleteCaseType) {
      if (incompleteCaseType.PlaintiffType === "Self(Worker)") {
        setValue('claimantStatus', 'principal');
      } else if (incompleteCaseType.PlaintiffType === "Agent") {
        setValue('claimantStatus', 'representative');
      }
    }
  }, [incompleteCaseType, setValue]);

  useEffect(() => {
    register("userName");
    register("region");
    register("city");
    register("occupation");
    register("gender");
    register("nationality");
    register("hijriDate");
    register("gregorianDate");
    register("applicant");
    register("workerAgentDateOfBirthHijri");
  }, [register]);

  const userClaims = getCookie("userClaims") as TokenClaims;
  const idNumber = userClaims?.UserID || "";
  const dobirth = userClaims?.UserDOB || "";
  const userType = getCookie("userType");
  const { ClaimantStatusRadioOptions, CodeOptions, IsDomesticRadioOptions } =
    useFormOptions();
  const { plaintiffTypeOptions, AgentTypeOptions } = useLegalRepFormOptions();
  const { clearFormData } = useAPIFormsData();

  // Use incompleteCaseType directly
  const showOnlyPrincipal = incompleteCaseType?.PlaintiffType === "Self(Worker)";
  const showOnlyRepresentative = incompleteCaseType?.PlaintiffType === "Agent";

  // --- Field watchers for NIC trigger ---
  // const workerAgentIdNumber = watch("workerAgentIdNumber") || "";
  // const workerAgentHijriDob = watch("workerAgentDateOfBirthHijri") || "";

  // /******************* new  ************ */

  // inside your component or layout hook
  // const applicantType = watch("applicant");
  // const plaintiffId =
  //   applicantType === "representative"
  //     ? (watch("workerAgentIdNumber") as string)
  //     : undefined;
  // const plaintiffHijriDOB = watch("workerAgentDateOfBirthHijri") as string;

  // only fetch once both are exactly the right lengths
  // const shouldFetchNicAgent =
  //   applicantType === "representative" &&
  //   plaintiffId?.length === 10 &&
  //   plaintiffHijriDOB.length === 8;

  // /******************* new  ************ */

  // testtttttttttttttttttt

  // const {
  //   data: testNicData,
  //   isFetching: testLoading,
  //   error: testError,
  // } = useGetNICDetailsQuery(
  //   {
  //     IDNumber: workerAgentIdNumber,
  //     DateOfBirth: workerAgentHijriDob,
  //     AcceptedLanguage: "EN",
  //     SourceSystem: "E-Services",
  //   },
  //   { skip: false } // <— always call
  // );

  // useEffect(() => {
  //   if (testLoading) {
  //     //console.log("NIC lookup in flight…");
  //   } else if (testError) {
  //     console.error("NIC lookup error", testError);
  //   } else if (testNicData?.NICDetails) {
  //     //console.log("NIC result:", testNicData.NICDetails);

  //     // Auto-populate fields for testing:
  //     const nic = testNicData.NICDetails;
  //     setValue("userName", nic.PlaintiffName || "");
  //     setValue("region", nic.Region || "");
  //     setValue("city", nic.City || "");
  //     setValue("occupation", nic.Occupation || "");
  //     setValue("gender", nic.Gender || "");
  //     setValue("nationality", nic.Nationality || "");
  //     setValue("hijriDate", nic.DateOfBirthHijri || "");
  //     setValue("gregorianDate", nic.DateOfBirthGregorian || "");
  //     if (nic.PhoneNumber) {
  //       setValue("phoneNumber", Number(nic.PhoneNumber));
  //     }
  //   }
  // }, [testNicData, testLoading, testError, setValue]);

  // testtttttttttttttttttt
  // --- NIC trigger integration ---
  // const { isFetching: nicLoading } = useNICTrigger(
  //   workerAgentIdNumber,
  //   workerAgentHijriDob,
  //   (nic) => {
  //     setValue("userName", nic.PlaintiffName || "");
  //     setValue("region", nic.Region || "");
  //     setValue("city", nic.City || "");
  //     setValue("occupation", nic.Occupation || "");
  //     setValue("gender", nic.Gender || "");
  //     setValue("nationality", nic.Nationality || "");
  //     setValue("gregorianDate", nic.DateOfBirthGregorian || "");
  //     if (nic.PhoneNumber) setValue("phoneNumber", Number(nic.PhoneNumber));
  //   },
  //   () => {
  //     setError("workerAgentIdNumber", {
  //       type: "validate",
  //       message: t("error.noNicData"),
  //     });
  //   }
  // );
  // 2) straight NIC query, skipped until we want it
  // const {
  //   data: nicAgent,
  //   isFetching: nicAgentLoading,
  //   isError: nicAgentError,
  // } = useGetNICDetailsQuery(
  //   {
  //     IDNumber: workerAgentIdNumber,
  //     DateOfBirth: workerAgentHijriDob,
  //     AcceptedLanguage: "EN",
  //     SourceSystem: "E-Services",
  //   },
  //   { skip: !shouldFetchNicAgent }
  // );

  // // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
  // // **NEW**: default claimantStatus to "principal" on mount
  // useEffect(() => {
  //   setValue("claimantStatus", "principal");
  // }, [setValue]);

  // --- 1) form watches for rep‐only fields ---
  const applicantType = watch("applicant");
  const workerAgentIdNumber = watch("workerAgentIdNumber") || "";
  const workerAgentHijriDob = watch("workerAgentDateOfBirthHijri") || "";
  const claimType = watch("claimantStatus");
  const applicant = watch("applicant");
  // 1): Fetch All Nic Data From The Data

  useEffect(() => {
    clearFormData();
    [
      "userName",
      "region",
      "city",
      "occupation",
      "gender",
      "nationality",
      "hijriDate",
      "gregorianDate",
      "applicant",
      "phoneNumber",
    ].forEach((f) => setValue(f as any, ""));
  }, []);

  // 1) compute when we're ready to fire:
  const shouldFetchNic = claimantStatus === "representative" && workerAgentIdNumber.length === 10 && workerAgentHijriDob.replace(/\//g, '').length === 8;

  console.log("Claimant Status:", claimantStatus);
  console.log("Worker Agent ID Number:", workerAgentIdNumber);
  console.log("Worker Agent Hijri DOB:", workerAgentHijriDob);
  console.log("Should Fetch NIC:", shouldFetchNic);
  console.log("Claimant Status Check:", claimantStatus === "representative");
  console.log("ID Number Length Check:", workerAgentIdNumber.length === 10);
  console.log("Hijri DOB Length Check:", workerAgentHijriDob.replace(/\//g, '').length === 8);

  useEffect(() => {
    if (!shouldFetchNic) {
      [
        "userName",
        "region",
        "city",
        "occupation",
        "gender",
        "nationality",
        "hijriDate",
        "gregorianDate",
        "applicant",
        "phoneNumber",
      ].forEach((f) => setValue(f as any, ""));
    }
  }, [shouldFetchNic, setValue]);

  // 2) one NIC query, only when both inputs are valid:
  const {
    data: nicAgent,
    isFetching: nicAgentLoading,
    isError: nicAgentError,
  } = useGetNICDetailsQuery(
    {
      IDNumber: workerAgentIdNumber,
      DateOfBirth: workerAgentHijriDob,
      AcceptedLanguage: "EN",
      SourceSystem: "E-Services",
    },
    { skip: !shouldFetchNic }
  );

  console.log("NIC Agent Data:", nicAgent);
  console.log("NIC Agent Loading:", nicAgentLoading);
  console.log("NIC Agent Error:", nicAgentError);

  const disableNicFields = !shouldFetchNic || nicAgentLoading;

  // 3) effect to populate or error exactly once per fetch:
  useEffect(() => {
    if (!shouldFetchNic) return;

    if (nicAgentError || !nicAgent?.NICDetails) {
      if (typeof setError === "function") {
        setError("workerAgentIdNumber", {
          type: "validate",
          message: t("error.noNicData"),
        });
      }
    } else {
      const d = nicAgent.NICDetails;
      setValue("userName", d.PlaintiffName || "");
      setValue("region", { value: d.Region_Code || "", label: d.Region || "" });
      setValue("city", { value: d.City_Code || "", label: d.City || "" });
      setValue("occupation", {
        value: d.Occupation_Code || "",
        label: d.Occupation || "",
      });
      setValue("gender", { value: d.Gender_Code || "", label: d.Gender || "" });
      setValue("nationality", {
        value: d.Nationality_Code || "",
        label: d.Nationality || "",
      });
      setValue("hijriDate", d.DateOfBirthHijri || "");
      setValue("gregorianDate", d.DateOfBirthGregorian || "");
      if (d.PhoneNumber) {
        setValue("phoneNumber", d.PhoneNumber.toString());
      }
    }
  }, [shouldFetchNic, nicAgent, nicAgentError, setValue, setError, t]);

  // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
  const plaintiffStatus = watch("plaintiffStatus");
  const isPhone = watch("isPhone");
  const phoneCode = watch("phoneCode");
  const phoneNumber = watch("interPhoneNumber");
  const enteredOtp = watch("otp");

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [otpSent, setOtpSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showResend, setShowResend] = useState(false);

  // const applicantType = watch("applicant");
  const selectedMainCategory = getCookie("mainCategory");
  const selectedSubCategory = getCookie("subCategory");
  const agentType = watch("agentType");

  const govRepDetail = userTypeLegalRepData?.GovRepDetails?.find(
    (item: any) => item.GOVTID === selectedMainCategory?.value
  );

  // // Define NIC parameters for the worker user
  // const nicParams: NICDetailsParams = {
  //   IDNumber: idNumber,
  //   DateOfBirth: dobirth,
  //   AcceptedLanguage: "EN",
  //   SourceSystem: "E-Services",
  // };

  // // Fetch NIC details for the worker
  // const { data: nicData, isFetching: nicIsLoading } = useGetNICDetailsQuery(
  //   nicParams,
  //   {
  //     skip: !nicParams.IDNumber || !nicParams.DateOfBirth,
  //   }
  // ) as { data: NICDetailsResponse | undefined; isFetching: boolean };

  const [attachment, setAttachment] = useState<FormData["attachment"] | null>(
    null
  );

  // Autofill principal-claimant fields when we have that response
  useEffect(() => {
    console.log("old one");

    if (
      watch("claimantStatus") === "principal" &&
      principalNICResponse?.NICDetails
    ) {
      const nic = principalNICResponse.NICDetails;

      setValue("userName", nic.PlaintiffName || "");

      setValue("region", {
        value: nic.Region_Code || "",
        label: nic.Region || "",
      });
      setValue("city", { value: nic.City_Code || "", label: nic.City || "" });
      setValue("occupation", {
        value: nic.Occupation_Code || "",
        label: nic.Occupation || "",
      });
      setValue("gender", {
        value: nic.Gender_Code || "",
        label: nic.Gender || "",
      });
      setValue("nationality", {
        value: nic.Nationality_Code || "",
        label: nic.Nationality || "",
      });

      setValue("hijriDate", nic.DateOfBirthHijri || "");
      setValue("gregorianDate", nic?.DateOfBirthGregorian || "");
      setValue("applicant", nic.Applicant || "");
      if (nic.PhoneNumber) {
        setValue("phoneNumber", nic.PhoneNumber.toString());
      }
    }
  }, [principalNICResponse, setValue, watch, claimantStatus]);

  // Autofill or clear rep-plaintiff fields based on the representative response
  useEffect(() => {
    if (watch("claimantStatus") !== "representative") return;

    if (representativeNICResponse?.NICDetails) {
      const nic = representativeNICResponse.NICDetails;

      setValue("userName", nic.PlaintiffName || "");

      // setValue("region", nic.Region || "");
      // setValue("city", nic.City || "");
      // setValue("occupation", nic.Occupation || "");
      // setValue("gender", nic.Gender || "");
      // setValue("nationality", nic.Nationality || "");

      setValue("region", {
        value: nic.Region_Code || "",
        label: nic.Region || "",
      });
      setValue("city", { value: nic.City_Code || "", label: nic.City || "" });
      setValue("occupation", {
        value: nic.Occupation_Code || "",
        label: nic.Occupation || "",
      });
      setValue("gender", {
        value: nic.Gender_Code || "",
        label: nic.Gender || "",
      });
      setValue("nationality", {
        value: nic.Nationality_Code || "",
        label: nic.Nationality || "",
      });

      setValue("hijriDate", nic.DateOfBirthHijri || "");
      setValue("gregorianDate", nic.DateOfBirthGregorian || "");
      setValue("applicant", nic.Applicant || "");

      if (nic.PhoneNumber) {
        setValue("phoneNumber", nic.PhoneNumber.toString());
      }
    } else {
      // cleared or invalid ID => clear all
      [
        "userName",
        "region",
        "city",
        "occupation",
        "gender",
        "nationality",
        "hijriDate",
        "gregorianDate",
        "applicant",
        "phoneNumber",
      ].forEach((f) => setValue(f as any, ""));
    }
  }, [representativeNICResponse, setValue, watch]);

  const RegionOptions = useMemo(
    () =>
      regionData?.map((item: DataElement) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [],
    [regionData]
  );

  const CityOptions = useMemo(
    () =>
      cityData?.map((item: DataElement) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [],
    [cityData]
  );

  const OccupationOptions = useMemo(
    () =>
      occupationData?.map((item: DataElement) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [],
    [occupationData]
  );

  const GenderOptions = useMemo(
    () =>
      genderData?.map((item: DataElement) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [],
    [genderData]
  );

  const NationalityOptions = useMemo(
    () =>
      nationalityData?.map((item: DataElement) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [],
    [nationalityData]
  );

  //#region OTP
  const CountryCodeOptions = useMemo(
    () =>
      countryData?.map((item: DataElement) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [],
    [countryData]
  );

  const getPhoneConfig = (code: string) =>
    PHONE_PATTERNS[code] || PHONE_PATTERNS.DEFAULT;

  const phoneConfig = getPhoneConfig(phoneCode);
  const isPhoneValid =
    phoneCode && phoneNumber ? phoneConfig.pattern.test(phoneNumber) : false;
  const isSendOtpDisabled = !phoneCode || !phoneNumber || !isPhoneValid;
  const isVerifyOtpDisabled =
    !enteredOtp || enteredOtp.length < 6 || !isPhoneValid;
  const progress = ((60 - timeLeft) / 60) * 100;

  useEffect(() => {
    if (!otpSent || isVerified || timeLeft <= 0) return;
    const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [otpSent, timeLeft, isVerified]);

  useEffect(() => {
    if (timeLeft === 0 && !isVerified) setShowResend(true);
  }, [timeLeft, isVerified]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
    setValue("otp", newOtp.join(""));
  };

  const handleSendOtp = () => {
    if (isSendOtpDisabled || !sendOtpHandler) return;
    setOtpSent(true);
    setTimeLeft(60);
    setShowResend(false);
    setOtp(Array(6).fill(""));
    sendOtpHandler();
  };

  const handleResendOtp = () => {
    handleSendOtp();
    if (setIsNotVerified) setIsNotVerified(false);
  };

  const handleFileSelect = (fileData: FormData["attachment"]) => {
    if (!fileData) return;
    setAttachment(fileData);
    setValue("attachment.classification", fileData.classification || "");
    setValue("attachment.file", fileData.file || null);
    setValue("attachment.base64", fileData.base64 || null);
    setValue("attachment.fileName", fileData.fileName || "");
    setValue("attachment.fileType", fileData.fileType || "");
  };

  // International Phone Number Section (always included)
  // const InternationalPhoneNumberSection: SectionLayout[] = [
  //   {
  //     gridCols: 3,
  //     className: "international-phone-number-section",
  //     children: [
  //       {
  //         type: "checkbox",
  //         name: "isPhone",
  //         label: t("addInternationalNumber"),
  //         checked: isPhone,
  //         onChange: (checked: boolean) => {
  //           setValue("isPhone", checked);
  //           if (!checked) {
  //             setOtpSent(false);
  //             setOtp(Array(6).fill(""));
  //             setTimeLeft(60);
  //             setShowResend(false);
  //           }
  //         },
  //       },
  //     ],
  //   },
  //   {
  //     condition: isPhone && !otpSent,
  //     children: [
  //       {
  //         type: "autocomplete",
  //         label: t("countryCode"),
  //         name: "phoneCode",
  //         options: CountryCodeOptions,
  //         value: phoneCode,
  //         onChange: (value: string) => setValue("phoneCode", value),
  //         ...(isPhone
  //           ? {
  //             validation: {
  //               required: t("codeValidation"),
  //             },
  //           }
  //           : {}),
  //       },
  //       {
  //         type: "input",
  //         name: "interPhoneNumber",
  //         label: t("nicDetails.phoneNumber"),
  //         inputType: "tel",
  //         maxLength: 10,
  //         value: phoneNumber ?? "",
  //         onChange: (v: string) => setValue("interPhoneNumber", v),
  //         placeholder: phoneCode
  //           ? getPhoneConfig(phoneCode).placeholder
  //           : "Enter phone number",
  //         ...(isPhone
  //           ? {
  //             validation: {
  //               required: t("interPhoneNumberValidation"),
  //               validate: (value: string) => {
  //                 if (!phoneCode) return "Please select country code first";
  //                 const pattern = getPhoneConfig(phoneCode).pattern;
  //                 return pattern.test(value) || t("phoneNumberValidation");
  //               },
  //             },
  //           }
  //           : {}),
  //       },
  //       {
  //         type: "custom",
  //         component: (
  //           <Button
  //             size="sm"
  //             className="h-8 mt-[35px]"
  //             onClick={handleSendOtp}
  //             disabled={isSendOtpDisabled}
  //             variant={isSendOtpDisabled ? "disabled" : "primary"}
  //             typeVariant={isSendOtpDisabled ? "freeze" : "primary"}
  //           >
  //             {t("verifyOtp")}
  //           </Button>
  //         ),
  //       },
  //     ],
  //     className: "",
  //     gridCols: 3,
  //   },
  //   {
  //     title: "Enter OTP",
  //     condition: otpSent && !isVerified,
  //     children: [
  //       {
  //         type: "custom",
  //         component: (
  //           <div className="space-y-4">
  //             <p className="text-sm text-gray-600">
  //               Enter the 6-digit verification OTP code sent to the mobile
  //               number linked to your account.
  //             </p>
  //             <div className="flex justify-between gap-2">
  //               {otp.map((digit, index) => (
  //                 <input
  //                   key={index}
  //                   id={`otp-input-${index}`}
  //                   type="text"
  //                   inputMode="numeric"
  //                   maxLength={1}
  //                   className={`w-12 h-12 border rounded text-center text-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${isNotVerified && "border-2 border-red-300 shadow-lg"
  //                     }`}
  //                   value={digit}
  //                   onChange={(e) => handleOtpChange(index, e.target.value)}
  //                   onKeyDown={(e) => handleKeyDown(index, e, otp)}
  //                   autoFocus={index === 0}
  //                 />
  //               ))}
  //             </div>
  //             <div className="flex justify-end items-center gap-3">
  //               {showResend ? (
  //                 <Button
  //                   variant="secondary"
  //                   typeVariant="outline"
  //                   onClick={handleResendOtp}
  //                   size="xs"
  //                   disabled={isSendOtpDisabled}
  //                 >
  //                   {t("sendOtp")}
  //                 </Button>
  //               ) : (
  //                 <div className="flex items-center gap-2">
  //                   <div className="relative w-5 h-5">
  //                     <div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>
  //                     <div
  //                       className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent transition-all duration-300"
  //                       style={{
  //                         transform: `rotate(${progress * 3.6}deg)`,
  //                         clipPath:
  //                           progress >= 50 ? "inset(0)" : "inset(0 0 0 50%)",
  //                       }}
  //                     ></div>
  //                     {progress < 50 && (
  //                       <div
  //                         className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent transition-all duration-300"
  //                         style={{
  //                           transform: `rotate(180deg)`,
  //                           clipPath: `inset(0 ${100 - progress * 2}% 0 0)`,
  //                         }}
  //                       ></div>
  //                     )}
  //                   </div>
  //                   <span className="text-sm text-gray-600">
  //                     Resend OTP in {timeLeft}s
  //                   </span>
  //                 </div>
  //               )}
  //             </div>
  //           </div>
  //         ),
  //       },
  //     ],
  //     className: undefined,
  //     gridCols: 0,
  //   },
  //   {
  //     condition: otpSent && !isVerified,
  //     children: [
  //       {
  //         type: "custom",
  //         component: (
  //           <Button
  //             size="sm"
  //             onClick={verifyOtp}
  //             className="w-full"
  //             disabled={isVerifyOtpDisabled || isVerified}
  //             variant={
  //               isVerifyOtpDisabled || isVerified ? "disabled" : "primary"
  //             }
  //             typeVariant={
  //               isVerifyOtpDisabled || isVerified ? "freeze" : "primary"
  //             }
  //           >
  //             {t("verifyOtp")}
  //           </Button>
  //         ),
  //       },
  //     ],
  //     className: undefined,
  //     gridCols: 0,
  //   },
  //   {
  //     condition: isVerified,
  //     children: [
  //       {
  //         type: "custom",
  //         component: (
  //           <div className="p-4 bg-green-50 text-green-700 rounded-md">
  //             <p className="font-medium">Phone number verified successfully!</p>
  //           </div>
  //         ),
  //       },
  //     ],
  //     className: undefined,
  //     gridCols: 0,
  //   },
  // ];
  //#endregion OTP

  const baseSections =
    userType === "legal_representative"
      ? [
          {
            isHidden: true,
            title: LegalRep("claimantStatus"),
            isRadio: true,
            children: [
              {
                type: "radio",
                name: "plaintiffStatus",
                label: LegalRep("claimantStatus"),
                options: plaintiffTypeOptions,
                value: "",
                onChange: (value: string) => setValue("plaintiffStatus", value),
                validation: { required: "Region is required" },
              },
            ],
          },
        ]
      : [];

  const getWorkerSections = () => {
    const sections: any[] = [];

    // Set default claimant status to "principal" on mount
    useEffect(() => {
      if (!incompleteCaseType) {
        setValue("claimantStatus", "principal");
      }
    }, []); // Empty dependency array means this runs once on mount

    // Set default agent type to "local_agency" when representative is selected
    useEffect(() => {
      if (claimantStatus === "representative") {
        setValue("agentType", "local_agency");
      }
    }, [claimantStatus, setValue]);

    // Set ID number when principal is selected
    useEffect(() => {
      if (claimantStatus === "principal" && idNumber) {
        setValue("idNumber", idNumber);
      }
    }, [claimantStatus, idNumber, setValue]);

    if (showPrincipalFields) {
      const pd = principalNICResponse?.NICDetails;
      sections.push({
        title: t("nicDetails.personalInfo"),
        className: "personal-info-section",
        gridCols: 3,
        children: [
          // ID Number (readonly)
          {
            type: "readonly" as const,
            label: t("nicDetails.idNumber"),
            value: idNumber,
            isLoading: nicAgentLoading,
          },

          // Name field - readonly if from NIC, input if not
          {
            type: pd?.PlaintiffName ? "readonly" : "input",
            name: "userName",
            label: t("nicDetails.name"),
            value: pd?.PlaintiffName || "",
            isLoading: nicAgentLoading,
            ...(!pd?.PlaintiffName && {
              validation: { required: t("nameValidation") }
            })
          },

          // Region field - readonly if from NIC, autocomplete if not
          {
            type: pd?.Region ? "readonly" : "autocomplete",
            name: "region",
            label: t("nicDetails.region"),
            value: pd?.Region || "",
            options: RegionOptions,
            isLoading: nicAgentLoading,
            ...(!pd?.Region && {
              validation: { required: t("regionValidation") }
            })
          },

          // City field - readonly if from NIC, autocomplete if not
          {
            type: pd?.City ? "readonly" : "autocomplete",
            name: "city",
            label: t("nicDetails.city"),
            value: pd?.City || "",
            options: CityOptions,
            isLoading: nicAgentLoading,
            ...(!pd?.City && {
              validation: { required: t("cityValidation") }
            })
          },

          // Date of Birth (Hijri)
          {
            type: "readonly" as const,
            label: t("nicDetails.dobHijri"),
            value: formatDateString(pd?.DateOfBirthHijri) || "",
            isLoading: nicAgentLoading,
          },

          // Date of Birth (Gregorian)
          {
            type: "readonly" as const,
            label: t("nicDetails.dobGrog"),
            value: formatDateString(pd?.DateOfBirthGregorian) || "",
            isLoading: nicAgentLoading,
          },

          // Phone Number field - readonly if from NIC, input if not
          {
            type: pd?.PhoneNumber ? "readonly" : "input",
            name: "phoneNumber",
            label: t("nicDetails.phoneNumber"),
            value: pd?.PhoneNumber || "",
            isLoading: nicAgentLoading,
            ...(!pd?.PhoneNumber && {
              validation: {
                required: t("phoneNumberValidation"),
                pattern: {
                  value: /^05\d{8}$/,
                  message: t("phoneValidationMessage")
                }
              }
            })
          },

          // Occupation field - readonly if from NIC, autocomplete if not
          {
            type: pd?.Occupation ? "readonly" : "autocomplete",
            name: "occupation",
            label: t("nicDetails.occupation"),
            value: pd?.Occupation || "",
            options: OccupationOptions,
            isLoading: nicAgentLoading,
            ...(!pd?.Occupation && {
              validation: { required: t("occupationValidation") }
            })
          },

          // Gender field - readonly if from NIC, autocomplete if not
          {
            type: pd?.Gender ? "readonly" : "autocomplete",
            name: "gender",
            label: t("nicDetails.gender"),
            value: pd?.Gender || "",
            options: GenderOptions,
            isLoading: nicAgentLoading,
            ...(!pd?.Gender && {
              validation: { required: t("genderValidation") }
            })
          },

          // Nationality field - readonly if from NIC, autocomplete if not
          {
            type: pd?.Nationality ? "readonly" : "autocomplete",
            name: "nationality",
            label: t("nicDetails.nationality"),
            value: pd?.Nationality || "",
            options: NationalityOptions,
            isLoading: nicAgentLoading,
            ...(!pd?.Nationality && {
              validation: { required: t("nationalityValidation") }
            })
          }
        ],
      });
    }
    if (showRepresentativeFields) {
      // 1) Agent-Type radio
      sections.push({
        title: t("nicDetails.agentType"),
        isRadio: true,
        children: [
          {
            type: "radio" as const,
            name: "agentType",
            label: t("plaintiff_type"),
            options: AgentTypeOptions,
            value: agentType,
            onChange: (v: string) => setValue("agentType", v),
            validation: { required: t("agentTypeValidation") },
          },
        ],
      });

      // 2) Agent Data
      sections.push({
        title: t("nicDetails.agentData"),
        className: "agent-data-section",
        gridCols: 3,
        children: [
          // Agent's own ID (readonly)
          {
            type: "readonly" as const,
            label: t("nicDetails.idNumber"),
            value: idNumber,
          },

          // Agent Name: readonly for local_agency, input otherwise
          {
            type: agentType === "local_agency" ? "readonly" : "input",
            name: "agentName",
            label: t("nicDetails.agentName"),
            value:
              agentType === "local_agency"
                ? agentInfoData.Agent?.AgentName || ""
                : watch("agentName"),
            onChange: (v: string) => setValue("agentName", v),
            validation: { required: t("agentNameValidation") },
            isLoading: agentType === "local_agency" && apiLoadingStates.agent,
          },

          {
            type: "input" as const,
            name: "agencyNumber",
            inputType: "text",
            label: t("nicDetails.agencyNumber"),
            placeholder: "10xxxxxxxx",
            value: watch("agencyNumber"),
            onChange: (v: string) => {
              // always keep form state up to date
              setValue("agencyNumber", v);
              // only fetch when it's exactly 9 digits and a local agency
              if (agentType === "local_agency" && v.length === 9) {
                onAgencyNumberChange(v);
              } else {
                // clear any previous result if invalid
                onAgencyNumberChange("");
              }
            },
            validation: {
              required: t("agencyNumberValidation"),
              maxLength: { value: 9, message: t("max9Validation") },
              pattern: {
                value: /^\d{9}$/,
                message: t("max9ValidationDesc"),
              },
            },
          },
          // Agency Status
          {
            type: agentType === "local_agency" ? "readonly" : "input",
            name: "agencyStatus",
            label: t("nicDetails.agencyStatus"),
            value:
              agentType === "local_agency"
                ? agentInfoData.Agent?.MandateStatus || ""
                : watch("agencyStatus"),
            onChange: (v: string) => setValue("agencyStatus", v),
            validation: { required: t("agencyStatusValidation") },
            isLoading: agentType === "local_agency" && apiLoadingStates.agent,
          },

          // Agency Source
          {
            type: agentType === "local_agency" ? "readonly" : "input",
            name: "agencySource",
            label: t("nicDetails.agencySource"),
            value:
              agentType === "local_agency"
                ? agentInfoData.Agent?.MandateSource || ""
                : watch("agencySource"),
            onChange: (v: string) => setValue("agencySource", v),
            validation: { required: t("agencySourceValidation") },
            isLoading: agentType === "local_agency" && apiLoadingStates.agent,
          },

          // Current Place of Work
          {
            type: "input" as const,
            name: "Agent_CurrentPlaceOfWork",
            inputType: "text",
            label: t("nicDetails.currentWorkingPlace"),
            value: watch("Agent_CurrentPlaceOfWork"),
            onChange: (v: string) => setValue("Agent_CurrentPlaceOfWork", v),
            validation: { required: t("workplaceValidation") },
          },

          // Residency Address
          {
            type: "input" as const,
            name: "Agent_ResidencyAddress",
            inputType: "text",
            label: t("nicDetails.residenceAddress"),
            value: watch("Agent_ResidencyAddress"),
            onChange: (v: string) => setValue("Agent_ResidencyAddress", v),
            validation: { required: t("residenceAddressValidation") },
          },

          // External-agency only: Occupation dropdown
          ...(agentType === "external_agency"
            ? [
                {
                  type: "autocomplete" as const,
                  name: "occupation",
                  label: t("nicDetails.occupation"),
                  options: OccupationOptions,
                  value: watch("occupation"),
                  onChange: (v: string) => setValue("occupation", v),
                  validation: { required: t("occupationValidation") },
                },
              ]
            : []),
        ],
      });
    }

    // — Inside getWorkerSections(), after the agentData section:
    if (claimantStatus === "representative") {
      const rd = representativeNICResponse?.NICDetails;
      sections.push({
        title: t("nicDetails.plaintiffData"),
        className: "plaintiff-data-section",
        gridCols: 3,
        children: [
          // 1) Plaintiff ID

          {
            type: "input",
            name: "workerAgentIdNumber",
            label: t("nicDetails.idNumber"),
            value: watch("workerAgentIdNumber"),
            onChange: (v: string) => {
              setValue("workerAgentIdNumber", v);
              clearErrors("workerAgentIdNumber");
            },
            validation: {
              required: t("idNumberValidation"),
              pattern: { value: /^\d{10}$/, message: t("max10ValidationDesc") },
            },
            isLoading: nicAgentLoading,
          },

          // 2) Hijri DOB
          {
            name: "dateOfBirth",
            type: "dateOfBirth",
            hijriLabel: t("nicDetails.dobHijri"),
            gregorianLabel: t("nicDetails.dobGrog"),
            hijriFieldName: "workerAgentDateOfBirthHijri",
            gregorianFieldName: "gregorianDate",
            validation: { required: t("dateValidation") },
            invalidFeedback: t("dateValidationDesc"),
            isLoading: nicAgentLoading,
            control, // ← wire up the RHF control
            value: watch("workerAgentDateOfBirthHijri"), // ← current hijri value
          },

          // 3) Fetched or fallback fields:
          ...(rd
            ? [
                {
                  type: "readonly" as const,
                  label: t("nicDetails.name"),
                  value: rd.PlaintiffName,
                  isLoading: nicAgentLoading,
                },
                {
                  type: "readonly" as const,
                  label: t("nicDetails.region"),
                  value: rd.Region,
                  isLoading: nicAgentLoading,
                },
                {
                  type: "readonly" as const,
                  label: t("nicDetails.city"),
                  value: rd.City,
                  isLoading: nicAgentLoading,
                },
                {
                  type: "readonly" as const,
                  label: t("nicDetails.dobGrog"),
                  value: rd.DateOfBirthGregorian,
                  isLoading: nicAgentLoading,
                },
                {
                  type: "readonly" as const,
                  label: t("nicDetails.phoneNumber"),
                  value: rd.PhoneNumber,
                  isLoading: nicAgentLoading,
                },
                {
                  type: "readonly" as const,
                  label: t("nicDetails.occupation"),
                  value: rd.Occupation,
                  isLoading: nicAgentLoading,
                },
                {
                  type: "readonly" as const,
                  label: t("nicDetails.gender"),
                  value: rd.Gender,
                  isLoading: nicAgentLoading,
                },
                {
                  type: "readonly" as const,
                  label: t("nicDetails.nationality"),
                  value: rd.Nationality,
                  isLoading: nicAgentLoading,
                },
              ]
            : [
                {
                  type: "input" as const,
                  name: "userName",
                  inputType: "text",
                  label: t("nicDetails.name"),
                  value: watch("userName"),
                  onChange: (v: string) => setValue("userName", v),
                  validation: { required: t("nameValidation") },
                  disabled: disableNicFields,
                },
                {
                  type: "autocomplete" as const,
                  name: "region",
                  label: t("nicDetails.region"),
                  options: RegionOptions,
                  value: watch("region"),
                  onChange: (v: string) => setValue("region", v),
                  validation: { required: t("regionValidation") },
                  disabled: disableNicFields,
                },
                {
                  type: "autocomplete" as const,
                  name: "city",
                  label: t("nicDetails.city"),
                  options: CityOptions,
                  value: watch("city"),
                  onChange: (v: string) => setValue("city", v),
                  validation: { required: t("cityValidation") },
                  disabled: disableNicFields,
                },
                {
                  type: "input" as const,
                  name: "phoneNumber",
                  inputType: "text",
                  placeholder: "05xxxxxxxx",
                  label: t("nicDetails.phoneNumber"),
                  value: watch("phoneNumber"),
                  onChange: (v: string) => setValue("phoneNumber", v),
                  validation: {
                    required: t("phoneNumberValidation"),
                    pattern: {
                      value: /^05\d{8}$/,
                      message: t("phoneValidationMessage"),
                    },
                  },
                  disabled: disableNicFields,
                },
                {
                  type: "autocomplete" as const,
                  name: "occupation",
                  label: t("nicDetails.occupation"),
                  options: OccupationOptions,
                  value: watch("occupation"),
                  onChange: (v: string) => setValue("occupation", v),
                  validation: { required: t("occupationValidation") },
                  disabled: disableNicFields,
                },
                {
                  type: "autocomplete" as const,
                  name: "gender",
                  label: t("nicDetails.gender"),
                  options: GenderOptions,
                  value: watch("gender"),
                  onChange: (v: string) => setValue("gender", v),
                  validation: { required: t("genderValidation") },
                  disabled: disableNicFields,
                },
                {
                  type: "autocomplete" as const,
                  name: "nationality",
                  label: t("nicDetails.nationality"),
                  options: NationalityOptions,
                  value: watch("nationality"),
                  onChange: (v: string) => setValue("nationality", v),
                  validation: { required: t("nationalityValidation") },
                  disabled: disableNicFields,
                },
              ]),
        ],
      });
    }

    return sections;
  };

  const ClaimantSelectSection = [];

  if (
    shouldShowClaimantStatus &&
    (userType === "Worker" || plaintiffStatus === "leg_rep_worker")
  ) {
    ClaimantSelectSection.push({
      isRadio: true,
      children: [
        {
          type: "radio",
          name: "claimantStatus",
          label: t("claimantStatus"),
          options: ClaimantStatusRadioOptions,
          value: claimantStatus,
          onChange: (value: string) => setValue("claimantStatus", value),
          validation: { required: "Region is required" },
        },
      ],
    });
  }

  const conditionalSections = [];

  if (plaintiffStatus === "legal_representative") {
    conditionalSections.push(
      {
        data: {
          type: "readonly",
          fields: [
            {
              label: LegalRep("plaintiffDetails.MainCategoryGovernmentEntity"),
              value: selectedMainCategory?.label || "",
            },
            {
              label: LegalRep("plaintiffDetails.SubcategoryGovernmentEntity"),
              value: selectedSubCategory?.label,
            },
          ],
        },
      },
      {
        title: LegalRep("LegalRepresentative"),
        data: {
          type: "readonly",
          fields: [
            {
              label: LegalRep(
                "LegalRepresentativeDetails.LegalRepresentativeName"
              ),
              value: govRepDetail?.RepName,
            },
            {
              label: LegalRep(
                "LegalRepresentativeDetails.LegalRepresentativeID"
              ),
              value: govRepDetail?.RepNationalid,
            },
            {
              label: LegalRep("LegalRepresentativeDetails.MobileNumber"),
              value: govRepDetail?.RepMobileNumber,
            },
            {
              label: LegalRep("LegalRepresentativeDetails.EmailAddress"),
              value: govRepDetail?.EmailAddress,
            },
          ],
        },
      }
    );
  }
  const methods = useForm<FormData>();

  const OTPSection = OTPFormLayout({
    watch,
    setValue,
    countryData,
    sendOtpHandler,
    isVerified,
    isNotVerified,
    setIsNotVerified,
  });

  const formLayout: SectionLayout[] = [
    ...baseSections,
    ...ClaimantSelectSection,
    ...conditionalSections,
    ...getWorkerSections(),
    // ...InternationalPhoneNumberSection,
    ...OTPSection,
  ].filter(Boolean) as SectionLayout[];

  return formLayout;
};

const handleKeyDown = (
  index: number,
  e: KeyboardEvent<HTMLInputElement>,
  otp: string[]
): void => {
  if (e.key === "Backspace" && !otp[index] && index > 0) {
    const prev = document.getElementById(
      `otp-input-${index - 1}`
    ) as HTMLInputElement;
    prev?.focus();
  }
};

export const useClaimantFormLayout = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language.toUpperCase();

  return {
    getNationalityLookup: () => ({
      url: `/WeddiServices/V1/MainLookUp`,
      params: {
        LookupType: "DataElements",
        ModuleKey: "MNT1",
        ModuleName: "Nationality",
        AcceptedLanguage: currentLanguage,
        SourceSystem: "E-Services",
      },
    }),
  };
};
