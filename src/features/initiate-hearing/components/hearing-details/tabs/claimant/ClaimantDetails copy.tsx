// import React, { useEffect, useMemo, useState } from "react";
// import { skipToken } from "@reduxjs/toolkit/query";
// import { useTranslation } from "react-i18next";
// import withStepNavigation, {
//   WithStepNavigationProps,
// } from "@/shared/HOC/withStepNavigation";
// import Modal from "@/shared/components/modal/Modal";
// import Button from "@/shared/components/button";
// import { DynamicForm } from "@/shared/components/form/DynamicForm";
// import { FormData } from "@/shared/components/form/form.types";
// import { toast } from "react-toastify";
// import Loader from "@/shared/components/loader";

// import {
//   useGetNICDetailsQuery,
//   useGetWorkerRegionLookupDataQuery,
//   useGetWorkerCityLookupDataQuery,
//   useGetOccupationLookupDataQuery,
//   useGetGenderLookupDataQuery,
//   useGetNationalityLookupDataQuery,
//   useGetCountryCodeLookupDataQuery,
//   useGetAttorneyDetailsQuery,
//   useSendOtpMutation,
// } from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";

// import { useGetEstablishmentDetailsQuery } from "@/features/initiate-hearing/api/create-case/defendantDetailsApis";
// import { useGetIncompleteCaseQuery } from "@/features/dashboard/api/api";
// import { useGetUserTypeLegalRepQuery } from "@/features/login/api/loginApis";
// import { useOtpVerification } from "@/features/initiate-hearing/hooks/useOtpVerification";
// import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
// import useCaseDetailsPrefill from "@/features/initiate-hearing/hooks/useCaseDetailsPrefill";
// import { useSaveClaimantDetailsMutation } from "@/features/initiate-hearing/api/create-case/apis";
// import { useAPIFormsData } from "@/providers/FormContext";
// import { useIncompleteCaseHandler } from '@/features/initiate-hearing/hooks/useIncompleteCaseHandler';

// import { useFormLayout } from "./claimant.forms.formLayout";
// import { useEstablishmentPlaintiffFormLayout } from "../../establishment-tabs/plaintiff/plaintiff.forms.formLayout";
// import { useLegalRepPlaintiffFormLayout } from "../../establishment-tabs/legal-representative/plaintiff.forms.formLayout";
// import { embasyUserFormLayout } from "../../embasy/plaintiff/embasyCalimnt.forms.formLayout";

// interface NICDetailsResponse {
//   DataElements: Array<{
//     ElementKey: string;
//     ElementValue: string;
//   }>;
//   NICDetails: {
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
//   };
// }

// interface AttorneyDetailsResponse {
//   Agent: {
//     ErrorDescription?: string;
//     pyErrorMessage?: string;
//     MandateStatus?: string;
//     AgentDetails?: Array<{ IdentityNumber: string }>;
//     Error?: string;
//     GregorianDate?: string;
//     AgentName?: string;
//     MandateSource?: string;
//     MandateDate?: string;
//   };
//   ErrorDetails?: {
//     ErrorCode?: string;
//     ErrorDesc?: string;
//   }[];
//   AttorneyService?: string;
//   SourceSystem?: string;
//   PartyList?: any[];
// }

// interface AgentInfo {
//   Agent: {
//     ErrorDescription?: string;
//     pyErrorMessage?: string;
//     MandateStatus?: string;
//     AgentDetails?: Array<{ IdentityNumber: string }>;
//     Error?: string;
//     GregorianDate?: string;
//     AgentName?: string;
//     MandateSource?: string;
//     MandateDate?: string;
//   };
//   ErrorDetails?: {
//     ErrorCode?: string;
//     ErrorDesc?: string;
//   }[];
//   AttorneyService?: string;
//   SourceSystem?: string;
//   PartyList?: any[];
// }

// const PureClaimantDetails = React.memo((props: any) => (
//   <DynamicForm {...props} />
// ));

// const ClaimantDetailsContainer: React.FC<
//   WithStepNavigationProps & {
//     setError: (name: string, error: any) => void;
//     clearErrors: (name: string) => void;
//     trigger: (name: string) => void;
//   }
// > = ({ register, errors, setValue, watch, control, setError, clearErrors, trigger }) => {
//   const { t, i18n } = useTranslation("hearingdetails");
//   const lang = i18n.language.toUpperCase();
//   const [showSelfIdErrorModal, setShowSelfIdErrorModal] = useState(false);
//   const [isAgencyValidating, setIsAgencyValidating] = useState(false);

//   const [getCookie, setCookie] = useCookieState();
//   const userClaims = getCookie("userClaims");
//   const userId = userClaims.UserID;
//   const userName = userClaims.FullName;
//   const userType = getCookie("userType");

//   // Clean The Form Data On load The Component
//   const { clearFormData } = useAPIFormsData();
//   useEffect(() => {
//     setValue("region", { value: "", label: "" });
//     setValue("city", { value: "", label: "" });
//   }, []);

//   // Handle incomplete case navigation and data population
//   useIncompleteCaseHandler(setValue, trigger);

//   // Prefill form when continuing an incomplete case for Legal representative
//   useCaseDetailsPrefill(setValue, trigger);

//   // --- Form-state watchers ---
//   const applicantType = watch("applicantType") as
//     | "principal"
//     | "representative";
//   const plaintiffId =
//     applicantType === "representative"
//       ? (watch("idNumber") as string)
//       : undefined;
//   const plaintiffHijriDOB =
//     applicantType === "representative" ? (watch("hijriDate") as string) : "";

//   // Set local_agency as default when agent type is selected
//   useEffect(() => {
//     if (applicantType === "representative") {
//       setValue("agentType", "local_agency");
//     }
//   }, [applicantType, setValue]);

//   // --- OTP setup ---
//   const [sendOtp] = useSendOtpMutation();
//   const {
//     sendOtpHandler,
//     isVerified,
//     isNotVerified,
//     setIsNotVerified,
//     lastSentOtp,
//   } = useOtpVerification({
//     phoneCode: { value: (watch("phoneCode") as string) || "" },
//     phoneNumber: (watch("phoneNumber") as string) || "",
//     plaintiffId: applicantType === "principal" ? userId : plaintiffId,
//     plaintiffName: applicantType === "principal" ? userName : "",
//     setValue: setValue as any,
//   });

//   // --- Lookup data queries ---
//   const { data: regionData } = useGetWorkerRegionLookupDataQuery({
//     AcceptedLanguage: lang,
//     SourceSystem: "E-Services",
//     ModuleKey: userType.toLowerCase().includes("establishment")
//       ? "EstablishmentRegion"
//       : "WorkerRegion",
//     ModuleName: userType.toLowerCase().includes("establishment")
//       ? "EstablishmentRegion"
//       : "WorkerRegion",
//   });
//   const { data: cityData } = useGetWorkerCityLookupDataQuery(
//     {
//       AcceptedLanguage: lang,
//       SourceSystem: "E-Services",
//       selectedWorkerRegion: { value: watch("region")?.value || "" },
//       ModuleName: userType.toLowerCase().includes("establishment")
//         ? "EstablishmentCity"
//         : "WorkerCity",
//     },
//     { skip: !watch("region") }
//   );
//   const { data: occupationData } = useGetOccupationLookupDataQuery({
//     AcceptedLanguage: lang,
//     SourceSystem: "E-Services",
//   });
//   const { data: genderData } = useGetGenderLookupDataQuery({
//     AcceptedLanguage: lang,
//     SourceSystem: "E-Services",
//   });
//   const { data: nationalityData } = useGetNationalityLookupDataQuery({
//     AcceptedLanguage: lang,
//     SourceSystem: "E-Services",
//   });
//   const { data: countryData } = useGetCountryCodeLookupDataQuery({
//     AcceptedLanguage: lang,
//     SourceSystem: "E-Services",
//   });

//   // --- NIC details ---
//   const {
//     data: nicDetails,
//     isFetching: nicLoading,
//     isSuccess: nicSuccess,
//     refetch: refetchNicDetails,
//   } = useGetNICDetailsQuery(
//     applicantType === "principal"
//       ? {
//         IDNumber: userId,
//         DateOfBirth: userClaims.UserDOB,
//         AcceptedLanguage: lang,
//         SourceSystem: "E-Services",
//       }
//       : {
//         IDNumber: plaintiffId || "",
//         DateOfBirth: plaintiffHijriDOB,
//         AcceptedLanguage: lang,
//         SourceSystem: "E-Services",
//       },
//     {
//       skip:
//         (applicantType === "principal" && (!userId || userId.length !== 10 || !userClaims.UserDOB)) ||
//         (applicantType === "representative" && (!plaintiffId || plaintiffId.length !== 10 || !plaintiffHijriDOB))
//     }
//   );

//   // --- Agent info ---
//   const {
//     data: agentInfo,
//     error: agentError,
//     isError: isAgentError,
//     isFetching: isAgentFetching,
//     refetch: refetchAttorneyDetails,
//   } = useGetAttorneyDetailsQuery(
//     {
//       AgentID: userId,
//       MandateNumber: watch("agencyNumber") as string,
//       AcceptedLanguage: lang,
//       SourceSystem: "E-Services",
//     },
//     {
//       skip:
//         !watch("agencyNumber") ||
//         watch("agencyNumber").length !== 9 ||
//         watch("agentType") !== "local_agency",
//       refetchOnMountOrArgChange: true, // ← ensure a fresh fetch even if the same number is entered again
//     }
//   );

//   useEffect(() => {
//     if (!agentInfo && !isAgentFetching) return;

//     if (isAgentFetching) {
//       setIsAgencyValidating(true);
//       return;
//     }

//     setIsAgencyValidating(false);

//     // ERROR branch: no data or explicit error details
//     const hasNoData =
//       agentInfo?.Agent?.ErrorDescription === "SuccessNoData" ||
//       (Array.isArray(agentInfo?.ErrorDetails) &&
//         agentInfo.ErrorDetails.length > 0);

//     if (hasNoData) {
//       // pull out an actual array
//       const errorDetailsArr = Array.isArray(agentInfo?.ErrorDetails)
//         ? agentInfo!.ErrorDetails!
//         : [];

//       const errorDesc = errorDetailsArr.find(
//         (d) => d.ErrorDesc !== undefined
//       )?.ErrorDesc;

//       toast.error(errorDesc || t("error.invalidAgencyNumber"));
//       setError("agencyNumber", {
//         type: "validate",
//         message: errorDesc || t("error.invalidAgencyNumber"),
//       });

//       // clear agency fields
//       [
//         "agencyNumber",
//         "agentName",
//         "agencyStatus",
//         "agencySource",
//         "Agent_CurrentPlaceOfWork",
//         "Agent_ResidencyAddress",
//       ].forEach((f) => {
//         setValue(f as any, "");
//         clearErrors(f);
//       });

//       [
//         "workerAgentIdNumber",
//         "workerAgentDateOfBirthHijri",
//         "gregorianDate",
//         "userName",
//         "region",
//         "city",
//         "occupation",
//         "gender",
//         "nationality",
//         "hijriDate",
//         "phoneNumber",
//       ].forEach((f) => {
//         setValue(f as any, "");
//         clearErrors(f);
//       });

//       return;
//     }

//     // SUCCESS branch
//     if (agentInfo?.Agent.ErrorDescription === "Success") {
//       setValue("agentName", agentInfo?.Agent.AgentName || "");
//       setValue("agencyStatus", agentInfo?.Agent.MandateStatus || "");
//       setValue("agencySource", agentInfo?.Agent.MandateSource || "");
//       toast.success(t("agencyFound"));
//       clearErrors("agencyNumber");
//     }
//   }, [agentInfo, isAgentFetching, setValue, setError, clearErrors, t]);

//   const allowedIds =
//     agentInfo?.Agent?.AgentDetails?.map((d) => d.IdentityNumber) || [];

//   // --- Validate agent-entered ID ---
//   useEffect(() => {
//     if (applicantType === "representative" && plaintiffId) {
//       if (plaintiffId === userId) {
//         setShowSelfIdErrorModal(true);
//         setValue("idNumber", "");
//       } else if (!allowedIds.includes(plaintiffId)) {
//         setError("idNumber", {
//           type: "validate",
//           message: t("error.idNotUnderAgency"),
//         });
//       } else {
//         clearErrors("idNumber");
//       }
//     }
//   }, [applicantType, plaintiffId, allowedIds, userId, setValue]);

//   // --- Save mutation ---
//   const [saveClaimantDetails] = useSaveClaimantDetailsMutation();
//   const handleSubmitStep = async () => {
//     const formData = watch();
//     const payload: any = {
//       CreatedBy: userId,
//       SourceSystem: "E-Services",
//       Flow_CurrentScreen: "PlaintiffDetails",
//       AcceptedLanguage: "EN",
//       Flow_ButtonName: "Next",
//       CaseID: getCookie("caseId") || "",
//       UserType: "Worker",
//       ApplicantType: "Worker",
//       PlaintiffId: formData.claimantStatus === "principal" ? userId : formData.workerAgentIdNumber,
//       PlaintiffType: formData.claimantStatus === "principal" ? "Self(Worker)" : "Agent",
//       PlaintiffName: formData.userName,
//       PlaintiffHijiriDOB: formData.hijriDate,
//       Plaintiff_ApplicantBirthDate: formData.gregorianDate,
//       Plaintiff_PhoneNumber: formData.phoneNumber,
//       Plaintiff_Region: formData.region?.value,
//       Plaintiff_City: formData.city?.value,
//       JobPracticing: formData.occupation?.value,
//       Gender: formData.gender?.value,
//       Worker_Nationality: formData.nationality?.value,
//       Plaintiff_JobLocation: formData.region?.value,
//       IsGNRequired: formData.isPhone || false,
//       CountryCode: formData.phoneCode?.value || "",
//       GlobalPhoneNumber: formData.interPhoneNumber || "",
//       IsGNOtpVerified: formData.isVerified || false,
//       DomesticWorker: formData.isDomestic ? "true" : "false",
//       IDNumber: formData.claimantStatus === "principal" ? userId : formData.workerAgentIdNumber,
//     };

//     // Add agent-specific fields if it's an agent case
//     if (formData.claimantStatus === "representative") {
//       payload.Agent_AgentID = userId;
//       payload.Agent_MandateNumber = formData.agencyNumber;
//       payload.Agent_PhoneNumber = formData.mobileNumber;
//       payload.Agent_Name = formData.agentName;
//       payload.Agent_MandateStatus = formData.agencyStatus;
//       payload.Agent_MandateSource = formData.agencySource;
//       payload.Agent_ResidencyAddress = formData.Agent_ResidencyAddress;
//       payload.Agent_CurrentPlaceOfWork = formData.Agent_CurrentPlaceOfWork;
//       payload.Agent_Mobilenumber = formData.mobileNumber;
//       payload.CertifiedBy = formData.agentType === "local_agency" ? "CB1" : "CB2";
//     }

//     const isCaseCreated = !!getCookie("caseId");
//     await saveClaimantDetails({ data: payload, isCaseCreated });
//   };

//   // --- Establishment & Legal-Rep ---
//   const { data: est } = useGetEstablishmentDetailsQuery(
//     {
//       AcceptedLanguage: lang,
//       SourceSystem: "E-Services",
//       FileNumber: userClaims.File_Number || skipToken,
//     },
//     { skip: !userClaims.File_Number }
//   );
//   const { data: legalRep } = useGetUserTypeLegalRepQuery(
//     {
//       IDNumber: userId,
//       UserType: userClaims.UserType,
//       AcceptedLanguage: lang,
//       SourceSystem: "E-Services",
//     },
//     { skip: watch("plaintiffStatus") !== "legal_representative" }
//   );

//   const apiLoadingStates = {
//     agent: isAgencyValidating,
//     nic: applicantType === "principal" ? nicLoading : nicLoading,
//     estab: false,
//     incomplete: false,
//   };

//   // --- Build form layouts ---
//   const formLayoutSelf = useFormLayout({
//     control,
//     // react-hook-form API
//     setValue: setValue as any,
//     watch: watch as any,

//     // lookup data
//     regionData: regionData?.DataElements,
//     cityData: cityData?.DataElements,
//     occupationData: occupationData?.DataElements,
//     genderData: genderData?.DataElements,
//     nationalityData: nationalityData?.DataElements,
//     countryData: countryData?.DataElements,

//     // OTP
//     sendOtpHandler,
//     lastSentOtp,
//     isVerified,
//     isNotVerified,
//     setIsNotVerified,

//     // agent info
//     agentInfoData: (agentInfo ?? {}) as AgentInfo,
//     apiLoadingStates: {
//       agent: isAgencyValidating,
//       nic: applicantType === "principal" ? nicLoading : nicLoading,
//       estab: false,
//       incomplete: false,
//     },

//     // legal-rep metadata
//     userTypeLegalRepData: legalRep,

//     // callbacks
//     onAgencyNumberChange: (value: string) => {
//       if (value.length === 9 && watch("agentType") === "local_agency") {
//         setIsAgencyValidating(true);
//         setError("agencyNumber", {
//           type: "validate",
//           message: t("validatingAgencyNumber"),
//         });
//         refetchAttorneyDetails();
//       } else {
//         setValue("agentName", "");
//         setValue("agencyStatus", "");
//         setValue("agencySource", "");
//         setIsAgencyValidating(false);
//       }
//     },

//     // validation
//     setError,
//     clearErrors,

//     // OTP verify
//     verifyOtp: sendOtpHandler,
//     isVerify: isVerified,

//     // ← NEW NIC data props →
//     principalNICResponse: nicDetails,
//     principalNICRefetch: refetchNicDetails,
//   });
//   // hassan add this for Emabasy Lyout user
//   const embasyUserFormsLayout = embasyUserFormLayout({
//     control,
//     setValue: setValue as any,
//     watch: watch as any,
//     regionData: regionData?.DataElements,
//     cityData: cityData?.DataElements,
//     occupationData: occupationData?.DataElements,
//     genderData: genderData?.DataElements,
//     nationalityData: nationalityData?.DataElements,
//     countryData: countryData?.DataElements,
//     isVerified,
//     // validation
//     setError,
//     clearErrors,

//   });

//   const formLayoutEst = useEstablishmentPlaintiffFormLayout({
//     establishmentDetails: est?.EstablishmentInfo?.[0] || null,
//     apiLoadingStates,
//     regionData: regionData?.DataElements,
//     cityData: cityData?.DataElements,
//     setValue,
//   });

//   const formLayoutLegal = useLegalRepPlaintiffFormLayout(
//     watch as any,
//     legalRep,
//     setValue as any
//   );

//   const layout = useMemo(() => {
//     if (userType?.toLowerCase().includes("establishment")) return formLayoutEst;
//     if (userType?.toLowerCase().includes("legal representative"))
//       return formLayoutLegal;
//     // hassan add this for Emabasy Lyout user
//     if (userType?.toLowerCase().includes("embassy user")) {
//       return embasyUserFormsLayout
//     };

//     return formLayoutSelf;
//   }, [userType, formLayoutSelf, formLayoutEst, formLayoutLegal, embasyUserFormsLayout]);


//   return (
//     <>
//       {(nicLoading) && <Loader />}
//       {isAgencyValidating && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-25 backdrop-blur-sm z-[9999]">
//           <Loader />
//         </div>
//       )}
//       {showSelfIdErrorModal && (
//         <Modal
//           close={() => setShowSelfIdErrorModal(false)}
//           header={t("error.invalidIdNumber")}
//           modalWidth={500}
//         >
//           <p className="text-sm text-gray-700">{t("error.cannotUseOwnId")}</p>
//           <div className="flex justify-end mt-6">
//             <Button
//               variant="primary"
//               onClick={() => setShowSelfIdErrorModal(false)}
//             >
//               {t("ok")}
//             </Button>
//           </div>
//         </Modal>
//       )}

//       <div
//         className={`relative ${isAgencyValidating || nicLoading ? "pointer-events-none" : ""
//           }`}
//       >
//         <div className={isAgencyValidating || nicLoading ? "blur-sm" : ""}>
//           <PureClaimantDetails
//             register={register}
//             errors={errors}
//             setValue={setValue}
//             watch={watch}
//             control={control}
//             formLayout={layout}
//             nicIsLoading={apiLoadingStates.nic}
//           />
//         </div>
//       </div>
//     </>
//   );
// };

// export default withStepNavigation(ClaimantDetailsContainer);
