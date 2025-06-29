import React, { useEffect, useMemo, useState, useRef } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useTranslation } from "react-i18next";
import withStepNavigation, {
  WithStepNavigationProps,
} from "@/shared/HOC/withStepNavigation";
import Modal from "@/shared/components/modal/Modal";
import Button from "@/shared/components/button";
import { DynamicForm } from "@/shared/components/form/DynamicForm";
import { FormData } from "@/shared/components/form/form.types";
import { toast } from "react-toastify";
import Loader from "@/shared/components/loader";
import { formatDateToYYYYMMDD } from "@/shared/lib/helpers";

import {
  useGetNICDetailsQuery,
  useGetWorkerRegionLookupDataQuery,
  useGetWorkerCityLookupDataQuery,
  useGetOccupationLookupDataQuery,
  useGetGenderLookupDataQuery,
  useGetNationalityLookupDataQuery,
  useGetCountryCodeLookupDataQuery,
  useGetAttorneyDetailsQuery,
  useSendOtpMutation,
} from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";

import { useGetEstablishmentDetailsQuery } from "@/features/initiate-hearing/api/create-case/defendantDetailsApis";
import { useGetIncompleteCaseQuery } from "@/features/dashboard/api/api";
import { useGetUserTypeLegalRepQuery } from "@/features/login/api/loginApis";
import { useOtpVerification } from "@/features/initiate-hearing/hooks/useOtpVerification";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import useCaseDetailsPrefill from "@/features/initiate-hearing/hooks/useCaseDetailsPrefill";
import { useSaveClaimantDetailsMutation } from "@/features/initiate-hearing/api/create-case/apis";
import { useAPIFormsData } from "@/providers/FormContext";
import { useIncompleteCaseHandler } from '@/features/initiate-hearing/hooks/useIncompleteCaseHandler';

import { useFormLayout } from "./claimant.forms.formLayout";
import { useEstablishmentPlaintiffFormLayout } from "../../establishment-tabs/plaintiff/plaintiff.forms.formLayout";
import { useLegalRepPlaintiffFormLayout } from "../../establishment-tabs/legal-representative/plaintiff.forms.formLayout";
import { embasyUserFormLayout } from "../../embasy/plaintiff/embasyCalimnt.forms.formLayout";

interface NICDetailsResponse {
  DataElements: Array<{
    ElementKey: string;
    ElementValue: string;
  }>;
  NICDetails: {
    PlaintiffName?: string;
    Region?: string;
    City?: string;
    DateOfBirthHijri?: string;
    DateOfBirthGregorian?: string;
    Occupation?: string;
    Gender?: string;
    Nationality?: string;
    Applicant_Code?: string;
    Applicant?: string;
    PhoneNumber?: string;
  };
}

interface AttorneyDetailsResponse {
  Agent: {
    ErrorDescription?: string;
    pyErrorMessage?: string;
    MandateStatus?: string;
    AgentDetails?: Array<{ IdentityNumber: string }>;
    Error?: string;
    GregorianDate?: string;
    AgentName?: string;
    MandateSource?: string;
    MandateDate?: string;
  };
  ErrorDetails?: {
    ErrorCode?: string;
    ErrorDesc?: string;
  }[];
  AttorneyService?: string;
  SourceSystem?: string;
  PartyList?: any[];
}

interface AgentInfo {
  Agent: {
    ErrorDescription?: string;
    pyErrorMessage?: string;
    MandateStatus?: string;
    AgentDetails?: Array<{ IdentityNumber: string }>;
    Error?: string;
    GregorianDate?: string;
    AgentName?: string;
    MandateSource?: string;
    MandateDate?: string;
  };
  ErrorDetails?: {
    ErrorCode?: string;
    ErrorDesc?: string;
  }[];
  AttorneyService?: string;
  SourceSystem?: string;
  PartyList?: any[];
}

const PureClaimantDetails = React.memo((props: any) => (
  <DynamicForm {...props} />
));

const ClaimantDetailsContainer: React.FC<
  WithStepNavigationProps & {
    setError: (name: string, error: any) => void;
    clearErrors: (name: string) => void;
    trigger: (name: string) => void;
    isValid: boolean;
  }
> = ({ register, errors, setValue, watch, control, setError, clearErrors, trigger, isValid }) => {
  const { t, i18n } = useTranslation("hearingdetails");
  const lang = i18n.language.toUpperCase();
  const [showSelfIdErrorModal, setShowSelfIdErrorModal] = useState(false);
  const [isAgencyValidating, setIsAgencyValidating] = useState(false);

  const [getCookie, setCookie] = useCookieState();
  const userClaims = getCookie("userClaims");
  const userId = userClaims?.UserID || '';
  const userName = userClaims?.FullName || '';
  const userType = getCookie("userType");

  const { clearFormData } = useAPIFormsData();
  useEffect(() => {
    // Keep this for initial setup, but individual fields are managed
    // by useIncompleteCaseHandler and other hooks.
  }, [clearFormData]);

  useIncompleteCaseHandler(setValue, trigger);
  useCaseDetailsPrefill(setValue, trigger);

  const claimantStatus = watch("claimantStatus") as "principal" | "representative";

  useEffect(() => {
    // Set default claimant status on mount to avoid race conditions
    if (!watch("claimantStatus")) {
      setValue("claimantStatus", "principal");
    }
  }, [watch, setValue]);
  
  const principalId = userId;
  const principalDob = formatDateToYYYYMMDD(userClaims.UserDOB);

  const representativeId = watch("workerAgentIdNumber") as string;
  const representativeDob = formatDateToYYYYMMDD(watch("workerAgentDateOfBirthHijri"));

  // Debug NIC query parameters
  // console.log("=== NIC QUERY DEBUG ===");
  // console.log("principalId:", principalId);
  // console.log("principalDob:", principalDob);
  // console.log("userClaims.UserDOB:", userClaims.UserDOB);
  // console.log("claimantStatus:", claimantStatus);
  // console.log("principalId.length:", principalId?.length);
  // console.log("principalDob.length:", principalDob?.length);

  // --- OTP setup ---
  const [sendOtp] = useSendOtpMutation();
  const {
    sendOtpHandler,
    isVerified,
    isNotVerified,
    setIsNotVerified,
    lastSentOtp,
  } = useOtpVerification({
    phoneCode: { value: (watch("phoneCode") as string) || "" },
    phoneNumber: (watch("phoneNumber") as string) || "",
    plaintiffId: claimantStatus === "principal" ? userId : representativeId,
    plaintiffName: claimantStatus === "principal" ? userName : "",
    setValue: setValue as any,
  });

  // --- Lookup data queries ---
  const { data: regionData } = useGetWorkerRegionLookupDataQuery({
    AcceptedLanguage: lang,
    SourceSystem: "E-Services",
    ModuleKey: userType.toLowerCase().includes("establishment")
      ? "EstablishmentRegion"
      : "WorkerRegion",
    ModuleName: userType.toLowerCase().includes("establishment")
      ? "EstablishmentRegion"
      : "WorkerRegion",
  });
  const { data: cityData } = useGetWorkerCityLookupDataQuery(
    {
      AcceptedLanguage: lang,
      SourceSystem: "E-Services",
      selectedWorkerRegion: typeof watch("plaintiffRegion") === 'object' ? watch("plaintiffRegion")?.value : watch("plaintiffRegion") || "",
      ModuleName: userType.toLowerCase().includes("establishment")
        ? "EstablishmentCity"
        : "WorkerCity",
    },
    { skip: !(typeof watch("plaintiffRegion") === 'object' ? watch("plaintiffRegion")?.value : watch("plaintiffRegion")) }
  );
  const { data: occupationData } = useGetOccupationLookupDataQuery({
    AcceptedLanguage: lang,
    SourceSystem: "E-Services",
  });
  const { data: genderData } = useGetGenderLookupDataQuery({
    AcceptedLanguage: lang,
    SourceSystem: "E-Services",
  });
  const { data: nationalityData } = useGetNationalityLookupDataQuery({
    AcceptedLanguage: lang,
    SourceSystem: "E-Services",
  });
  const { data: countryData } = useGetCountryCodeLookupDataQuery({
    AcceptedLanguage: lang,
    SourceSystem: "E-Services",
  });

  // --- NIC details hooks, one for each case ---
  const {
    data: principalNICResponse,
    isFetching: principalNICLoading,
    refetch: principalNICRefetch,
  } = useGetNICDetailsQuery(
    {
      IDNumber: principalId,
      DateOfBirth: principalDob || "",
      AcceptedLanguage: lang,
      SourceSystem: "E-Services",
    },
    {
      skip:
        claimantStatus !== "principal" ||
        !principalId ||
        principalId.length !== 10 ||
        !principalDob,
    }
  );

  const {
    data: representativeNICResponse,
    isFetching: representativeNICLoading,
    refetch: representativeNICRefetch,
  } = useGetNICDetailsQuery(
    {
      IDNumber: representativeId,
      DateOfBirth: representativeDob || "",
      AcceptedLanguage: lang,
      SourceSystem: "E-Services",
    },
    {
      skip:
        claimantStatus !== "representative" ||
        !representativeId ||
        representativeId.length !== 10 ||
        !representativeDob ||
        representativeDob.length !== 8,
    }
  );
  
  const nicLoading = principalNICLoading || representativeNICLoading;

  // --- Agent info ---
  const {
    data: agentInfo,
    error: agentError,
    isError: isAgentError,
    isFetching: isAgentFetching,
    refetch: refetchAttorneyDetails,
  } = useGetAttorneyDetailsQuery(
    {
      AgentID: userId,
      MandateNumber: watch("agencyNumber") as string,
      AcceptedLanguage: lang,
      SourceSystem: "E-Services",
    },
    {
      skip:
        !watch("agencyNumber") ||
        watch("agencyNumber").length !== 9 ||
        watch("agentType") !== "local_agency",
      refetchOnMountOrArgChange: true, // ← ensure a fresh fetch even if the same number is entered again
    }
  );

  // Track if error toast has been shown to prevent duplicates
  const errorToastShownRef = useRef(false);

  useEffect(() => {
    if (!agentInfo && !isAgentFetching) return;

    if (isAgentFetching) {
      setIsAgencyValidating(true);
      errorToastShownRef.current = false; // Reset when starting new fetch
      return;
    }

    setIsAgencyValidating(false);

    // ERROR branch: no data or explicit error details
    const hasNoData =
      agentInfo?.Agent?.ErrorDescription === "SuccessNoData" ||
      (Array.isArray(agentInfo?.ErrorDetails) &&
        agentInfo.ErrorDetails.length > 0);

    if (hasNoData) {
      // pull out an actual array
      const errorDetailsArr = Array.isArray(agentInfo?.ErrorDetails)
        ? agentInfo!.ErrorDetails!
        : [];

      const errorDesc = errorDetailsArr.find(
        (d) => d.ErrorDesc !== undefined
      )?.ErrorDesc;

      // Only show toast if not already shown
      if (!errorToastShownRef.current) {
        toast.error(errorDesc || t("error.invalidAgencyNumber"));
        errorToastShownRef.current = true;
      }

      setError("agencyNumber", {
        type: "validate",
        message: errorDesc || t("error.invalidAgencyNumber"),
      });

      // clear agency fields
      [
        "agencyNumber",
        "agentName",
        "agencyStatus",
        "agencySource",
        "Agent_CurrentPlaceOfWork",
        "Agent_ResidencyAddress",
      ].forEach((f) => {
        setValue(f as any, "");
        clearErrors(f);
      });

      [
        "workerAgentIdNumber",
        "workerAgentDateOfBirthHijri",
        "gregorianDate",
        "userName",
        "region",
        "city",
        "occupation",
        "gender",
        "nationality",
        "hijriDate",
        "phoneNumber",
      ].forEach((f) => {
        setValue(f as any, "");
        clearErrors(f);
      });

      return;
    }

    // SUCCESS branch
    if (agentInfo?.Agent.ErrorDescription === "Success") {
      setValue("agentName", agentInfo?.Agent.AgentName || "");
      setValue("agencyStatus", agentInfo?.Agent.MandateStatus || "");
      setValue("agencySource", agentInfo?.Agent.MandateSource || "");
      toast.success(t("agencyFound"));
      clearErrors("agencyNumber");
      errorToastShownRef.current = false; // Reset on success
    }
  }, [agentInfo, isAgentFetching, setValue, setError, clearErrors, t]);

  const allowedIds = useMemo(
    () => agentInfo?.Agent?.AgentDetails?.map((d) => d.IdentityNumber) || [],
    [agentInfo]
  );

  // --- Validate agent-entered ID ---
  useEffect(() => {
    if (claimantStatus === "representative" && representativeId) {
      if (representativeId === userId) {
        setShowSelfIdErrorModal(true);
        setValue("idNumber", "");
      } else if (!allowedIds.includes(representativeId)) {
        setError("idNumber", {
          type: "validate",
          message: t("error.idNotUnderAgency"),
        });
      } else {
        clearErrors("idNumber");
      }
    }
  }, [claimantStatus, representativeId, allowedIds, userId, setValue, setError, clearErrors, t]);

  // --- Save mutation ---
  const [saveClaimantDetails] = useSaveClaimantDetailsMutation();
  const handleSubmitStep = async () => {
    const formData = watch();
    // console.log("=== PAYLOAD DEBUG ===");
    // console.log("claimantStatus:", formData?.claimantStatus);
    // console.log("applicantType:", formData?.applicantType);
    // console.log("agentType:", formData?.agentType);
    // console.log("Full formData:", formData);
    // console.log("userName:", formData?.userName);
    // console.log("plaintiffRegion:", formData?.plaintiffRegion);
    // console.log("plaintiffCity:", formData?.plaintiffCity);
    // console.log("occupation:", formData?.occupation);
    // console.log("gender:", formData?.gender);
    // console.log("nationality:", formData?.nationality);
    // console.log("hijriDate:", formData?.hijriDate);
    // console.log("gregorianDate:", formData?.gregorianDate);
    // console.log("phoneNumber:", formData?.phoneNumber);
    
    const payload: any = {
      CreatedBy: userId,
      SourceSystem: "E-Services",
      Flow_CurrentScreen: "PlaintiffDetails",
      AcceptedLanguage: "EN",
      Flow_ButtonName: "Next",
      CaseID: getCookie("caseId") || "",
      UserType: "Worker",
      ApplicantType: "Worker",
      PlaintiffId: formData?.applicantType === "principal" ? userId : formData?.workerAgentIdNumber,
      PlaintiffType: formData?.applicantType === "principal" ? "Self(Worker)" : "Agent",
      PlaintiffName: formData?.userName,
      PlaintiffHijiriDOB: formData?.hijriDate,
      Plaintiff_ApplicantBirthDate: formData?.gregorianDate,
      Plaintiff_PhoneNumber: formData?.phoneNumber,
      Plaintiff_Region: formData?.plaintiffRegion?.value || formData?.region?.value || formData?.plaintiffRegion || formData?.region || "",
      Plaintiff_City: formData?.plaintiffCity?.value || formData?.city?.value || formData?.plaintiffCity || formData?.city || "",
      JobPracticing: formData?.occupation?.value || formData?.occupation || "",
      Gender: formData?.gender?.value || formData?.gender || "",
      Worker_Nationality: formData?.nationality?.value || formData?.nationality || "",
      Plaintiff_JobLocation: formData?.plaintiffRegion?.value || formData?.region?.value || formData?.plaintiffRegion || formData?.region || "",
      IsGNRequired: formData?.isPhone || false,
      CountryCode: formData?.phoneCode?.value || "",
      GlobalPhoneNumber: formData?.interPhoneNumber || "",
      IsGNOtpVerified: formData?.isVerified || false,
      DomesticWorker: formData?.isDomestic ? "true" : "false",
      IDNumber: formData?.applicantType === "principal" ? userId : formData?.workerAgentIdNumber,
    };
    // console.log("Final PlaintiffType in payload:", payload.PlaintiffType);
    // console.log("Full payload:", payload);
    
    if (!payload.Plaintiff_City) {
      payload.Plaintiff_City = "1";
    }

    if (formData?.applicantType === "representative") {
      payload.Agent_AgentID = userId;
      payload.Agent_MandateNumber = formData?.agencyNumber;
      payload.Agent_PhoneNumber = formData?.mobileNumber;
      payload.Agent_Name = formData?.agentName;
      payload.Agent_MandateStatus = formData?.agencyStatus;
      payload.Agent_MandateSource = formData?.agencySource;
      payload.Agent_ResidencyAddress = formData?.Agent_ResidencyAddress;
      payload.Agent_CurrentPlaceOfWork = formData?.Agent_CurrentPlaceOfWork;
      payload.Agent_Mobilenumber = formData?.mobileNumber;
      payload.CertifiedBy = formData?.agentType === "local_agency" ? "CB1" : "CB2";
    }

    const isCaseCreated = !!getCookie("caseId");
    await saveClaimantDetails({ data: payload, isCaseCreated });
  };

  // --- Establishment & Legal-Rep ---
  const { data: est } = useGetEstablishmentDetailsQuery(
    {
      AcceptedLanguage: lang,
      SourceSystem: "E-Services",
      FileNumber: userClaims.File_Number || skipToken,
    },
    { skip: !userClaims.File_Number }
  );
  const { data: legalRep } = useGetUserTypeLegalRepQuery(
    {
      IDNumber: userId,
      UserType: userClaims.UserType,
      AcceptedLanguage: lang,
      SourceSystem: "E-Services",
    },
    { skip: watch("plaintiffStatus") !== "legal_representative" }
  );

  const apiLoadingStates = {
    agent: isAgencyValidating,
    nic: claimantStatus === "principal" ? nicLoading : nicLoading,
    estab: false,
    incomplete: false,
  };

  const loadFormLayoutFunction = () => {
    if (userType?.toLowerCase().includes("establishment")) {
      return useEstablishmentPlaintiffFormLayout({
        establishmentDetails: est?.EstablishmentInfo?.[0] || null,
        apiLoadingStates,
        regionData: regionData?.DataElements,
        cityData: cityData?.DataElements,
        setValue,
      });
    }
    if (userType?.toLowerCase().includes("legal representative")) {
      return useLegalRepPlaintiffFormLayout(
        watch as any,
        legalRep,
        setValue as any
      );
    }
    if (userType?.toLowerCase().includes("embassy user")) {
      return embasyUserFormLayout({
        control,
        setValue: setValue as any,
        watch: watch as any,
        regionData: regionData?.DataElements,
        cityData: cityData?.DataElements,
        occupationData: occupationData?.DataElements,
        genderData: genderData?.DataElements,
        nationalityData: nationalityData?.DataElements,
        countryData: countryData?.DataElements,
        isVerified,
        setError,
        clearErrors,
      });
    }
    // Default return if no specific user type matches
    return useFormLayout({
      control,
      setValue: setValue as any,
      watch: watch as any,
      plaintiffRegionData: regionData?.DataElements,
      plaintiffCityData: cityData?.DataElements,
      occupationData: occupationData?.DataElements,
      genderData: genderData?.DataElements,
      nationalityData: nationalityData?.DataElements,
      countryData: countryData?.DataElements,
      sendOtpHandler,
      lastSentOtp,
      isVerified,
      isNotVerified,
      setIsNotVerified,
      agentInfoData: (agentInfo ?? {}) as AgentInfo,
      apiLoadingStates: {
        agent: isAgencyValidating,
        nic: claimantStatus === "principal" ? nicLoading : nicLoading,
        estab: false,
        incomplete: false,
      },
      userTypeLegalRepData: legalRep,
      onAgencyNumberChange: (value: string) => {
        if (value.length === 9 && watch("agentType") === "local_agency") {
          setIsAgencyValidating(true);
          setError("agencyNumber", {
            type: "validate",
            message: t("validatingAgencyNumber"),
          });
          refetchAttorneyDetails();
        } else {
          setValue("agentName", "");
          setValue("agencyStatus", "");
          setValue("agencySource", "");
          setIsAgencyValidating(false);
        }
      },
      setError,
      clearErrors,
      verifyOtp: sendOtpHandler,
      isVerify: isVerified,
      principalNICResponse,
      principalNICRefetch,
      representativeNICResponse,
      register,
      errors,
      trigger,
      isValid,
    });
  };

  const rightLayout = loadFormLayoutFunction();

  return (
    <>
      {(nicLoading) && <Loader />}
      {isAgencyValidating && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-25 backdrop-blur-sm z-[9999]">
          <Loader />
        </div>
      )}
      {showSelfIdErrorModal && (
        <Modal
          close={() => setShowSelfIdErrorModal(false)}
          header={t("error.invalidIdNumber")}
          modalWidth={500}
        >
          <p className="text-sm text-gray-700">{t("error.cannotUseOwnId")}</p>
          <div className="flex justify-end mt-6">
            <Button
              variant="primary"
              onClick={() => setShowSelfIdErrorModal(false)}
            >
              {t("ok")}
            </Button>
          </div>
        </Modal>
      )}

      <div
        className={`relative ${isAgencyValidating || nicLoading ? "pointer-events-none" : ""
          }`}
      >
        <div className={isAgencyValidating || nicLoading ? "blur-sm" : ""}>
          <PureClaimantDetails
            register={register}
            errors={errors}
            setValue={setValue}
            watch={watch}
            control={control}
            formLayout={rightLayout}
            nicIsLoading={apiLoadingStates.nic}
          />
        </div>
      </div>
    </>
  );
};

export default withStepNavigation(ClaimantDetailsContainer);
