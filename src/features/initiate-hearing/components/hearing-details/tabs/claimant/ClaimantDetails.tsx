import React, { useEffect, useMemo, useState, useRef } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useTranslation } from "react-i18next";
import withStepNavigation, {
  WithStepNavigationProps,
} from "@/shared/HOC/withStepNavigation";
import { DynamicForm } from "@/shared/components/form/DynamicForm";
import { FormData } from "@/shared/components/form/form.types";
import { toast } from "react-toastify";
import Loader from "@/shared/components/loader";
import { formatDateToYYYYMMDD, toWesternDigits } from "@/shared/lib/helpers";
import { useWatch } from "react-hook-form";

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
import { useIncompleteCaseHandler } from "@/features/initiate-hearing/hooks/useIncompleteCaseHandler";

import { useFormLayout } from "./claimant.forms.formLayout";
import { useEstablishmentPlaintiffFormLayout } from "../../establishment-tabs/plaintiff/plaintiff.forms.formLayout";
import { useLegalRepPlaintiffFormLayout } from "../../establishment-tabs/legal-representative/plaintiff.forms.formLayout";
import { EmbassyClaimantFormLayout } from "../../embasy/modern/EmbassyClaimantFormLayout";

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
> = ({
  register,
  errors,
  setValue,
  watch,
  control,
  setError,
  clearErrors,
  trigger,
  isValid,
}) => {
    const { t, i18n } = useTranslation("hearingdetails");
    const lang = i18n.language.toUpperCase();
    const [isAgencyValidating, setIsAgencyValidating] = useState(false);

    const [getCookie, setCookie] = useCookieState();
    const userClaims = getCookie("userClaims");
    const userId = userClaims?.UserID || "";
    const userName = userClaims?.FullName || "";
    const userType = getCookie("userType");
    const { clearFormData } = useAPIFormsData();
    useEffect(() => {
      // Keep this for initial setup, but individual fields are managed
      // by useIncompleteCaseHandler and other hooks.
    }, [clearFormData]);

    useIncompleteCaseHandler(setValue, trigger);
    useCaseDetailsPrefill(setValue, trigger);

    const claimantStatus = watch("claimantStatus") as
      | "principal"
      | "representative";

    useEffect(() => {
      // Set default claimant status on mount to avoid race conditions
      if (!claimantStatus) {
        setValue("claimantStatus", "principal");
      }
    }, [claimantStatus, setValue]);

    const principalId = userId;
    const principalDob = formatDateToYYYYMMDD(userClaims.UserDOB);

    const representativeId = watch("workerAgentIdNumber") as string;
    const representativeDob = formatDateToYYYYMMDD(
      watch("workerAgentDateOfBirthHijri")
    );

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
    const isEmbassyUser = userType?.toLowerCase().includes("embassy user");
    // Determine which region field to watch for city lookup
    let selectedRegionForCity: any = null;
    if (isEmbassyUser) {
      // For embassy user, check both possible region fields
      selectedRegionForCity =
        (typeof watch("embassyAgent_region") === "object" && watch("embassyAgent_region")?.value)
          ? watch("embassyAgent_region")?.value
          : (typeof watch("region") === "object" && watch("region")?.value)
            ? watch("region")?.value
            : watch("embassyAgent_region") || watch("region") || "";
    } else {
      selectedRegionForCity =
        typeof watch("plaintiffRegion") === "object"
          ? watch("plaintiffRegion")?.value
          : watch("plaintiffRegion") || "";
    }
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
        selectedWorkerRegion: selectedRegionForCity,
        ModuleName: userType.toLowerCase().includes("establishment")
          ? "EstablishmentCity"
          : "WorkerCity",
      },
      {
        skip: !selectedRegionForCity
      }
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
        DateOfBirth: toWesternDigits(principalDob || ""),
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
        DateOfBirth: toWesternDigits(representativeDob || ""),
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
    const agentType = watch("agentType");
    const mandateNumber = agentType === "local_agency"
      ? watch("agencyNumber")
      : agentType === "external_agency"
        ? watch("externalAgencyNumber")
        : "";
    const {
      data: agentInfo,
      error: agentError,
      isError: isAgentError,
      isFetching: isAgentFetching,
      refetch: refetchAttorneyDetails,
      isUninitialized,
    } = useGetAttorneyDetailsQuery(
      {
        AgentID: userId,
        MandateNumber: mandateNumber,
        AcceptedLanguage: lang,
        SourceSystem: "E-Services",
      },
      {
        skip:
        !isAgencyValidating ||
          watch("agentType") !== "local_agency",
        refetchOnMountOrArgChange: true, 
      }
    );

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
        // if (!errorToastShownRef.current) {
        //   toast.error(errorDesc || t("error.invalidAgencyNumber"));
        //   errorToastShownRef.current = true;
        // }

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

        // [
        //   "workerAgentIdNumber",
        //   "workerAgentDateOfBirthHijri",
        //   "gregorianDate",
        //   "userName",
        //   "region",
        //   "city",
        //   "occupation",
        //   "gender",
        //   "nationality",
        //   "hijriDate",
        //   "phoneNumber",
        // ].forEach((f) => {
        //   setValue(f as any, "");
        //   clearErrors(f);
        // });

        return;
      }

      if (agentInfo?.Agent.ErrorDescription === "Success") {
        setValue("agentName", agentInfo?.Agent.AgentName || "");
        setValue("agencyStatus", agentInfo?.Agent.MandateStatus || "");
        setValue("agencySource", agentInfo?.Agent.MandateSource || "");
        toast.success(t("agencyFound"));
        clearErrors("agencyNumber");
        errorToastShownRef.current = false; 
      }
    }, [agentInfo, isAgentFetching, setValue, setError, clearErrors, t]);

    const allowedIds =
      agentInfo?.Agent?.AgentDetails?.map((d) => d.IdentityNumber) || [];

    const idNumber = watch("idNumber");

    useEffect(() => {
      if (
        claimantStatus === "representative" &&
        representativeId &&
        representativeId.length === 10 
      ) {
        if (representativeId === userId) {
          toast.error(t("error.cannotUseOwnId"));
          setValue("workerAgentIdNumber", "");
          clearErrors("workerAgentIdNumber");
          [
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
        } else if (
          agentType === "local_agency" &&
          !allowedIds.includes(representativeId)
        ) {
          if (
            !errors.idNumber ||
            errors.idNumber.message !== t("error.idNotUnderAgency")
          ) {
            setError("idNumber", {
              type: "validate",
              message: t("error.idNotUnderAgency"),
            });
            toast.error(t("error.idNotUnderAgency"));
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
          }
        } else {
          if (errors.idNumber) {
            clearErrors("idNumber");
          }
        }
      }
    }, [
      claimantStatus,
      representativeId,
      allowedIds,
      userId,
      setValue,
      setError,
      clearErrors,
      t,
      idNumber,
      errors,
      agentType,
      agentInfo,
    ]);

    const embasyUserData = getCookie("storeAllUserTypeData");
    const embassyUserNationalityCode =
      embasyUserData?.EmbassyInfo?.[0]?.Nationality_Code;
    const watchedNationality = useWatch({ control, name: "nationality" });
    const watchedClaimantStatus = useWatch({ control, name: "claimantStatus" });

    const nationalityToastShownOnceRef = useRef(false);

    useEffect(() => {
      const isPrincipal = claimantStatus === "principal";
      const nicResponse = isPrincipal ? principalNICResponse : representativeNICResponse;
      const id = isPrincipal ? principalId : representativeId;
      const dob = isPrincipal ? principalDob : representativeDob;

      if (
        !nicLoading &&
        id?.length === 10 &&
        dob?.length === 8 &&
        nicResponse?.NICDetails
      ) {
        const nicNationality = nicResponse.NICDetails.Nationality_Code || "";
        const formNationality =
          typeof watchedNationality === "object"
            ? watchedNationality?.value
            : watchedNationality || "";

        const isMismatch =
          embassyUserNationalityCode &&
          nicNationality &&
          embassyUserNationalityCode.trim().toUpperCase() !== formNationality.trim().toUpperCase();

        // Show toast ONCE only — forever, regardless of future changes
        if (isMismatch && !nationalityToastShownOnceRef.current) {
          nationalityToastShownOnceRef.current = true;
          toast.error(t("error.nationalityMismatch"));
        }
      }
    }, [
      nicLoading,
      principalNICResponse,
      representativeNICResponse,
      principalId,
      representativeId,
      principalDob,
      representativeDob,
      claimantStatus,
      t,
      embassyUserNationalityCode,
      watchedNationality,
    ]);

    // --- Save mutation ---
    const [saveClaimantDetails] = useSaveClaimantDetailsMutation();
    const handleSubmitStep = async () => {
      const formData = watch();
      // Debug: log form data before payload construction
      const isEmbassyUser = userType?.toLowerCase().includes("embassy user");
      const payload: any = {
        CreatedBy: userId,
        SourceSystem: "E-Services",
        Flow_CurrentScreen: "PlaintiffDetails",
        AcceptedLanguage: lang,
        Flow_ButtonName: "Next",
        CaseID: getCookie("caseId") || "",
        UserType: isEmbassyUser ? "Embassy User" : "Worker",
        ApplicantType: "Worker",
        PlaintiffId: isEmbassyUser
          ? formData?.embassyAgent_workerAgentIdNumber
          : formData?.applicantType === "principal"
            ? userId
            : formData?.workerAgentIdNumber,
        PlaintiffType: isEmbassyUser
          ? "Agent"
          : formData?.applicantType === "principal"
            ? "Self(Worker)"
            : "Agent",
        // Embassy-specific fields
        Agent_EmbassyName: isEmbassyUser ? formData?.embassyAgent_Agent_EmbassyName : undefined,
        Agent_EmbassyNationality: isEmbassyUser ? formData?.embassyAgent_Agent_EmbassyNationality : undefined,
        Agent_EmbassyPhone: isEmbassyUser ? formData?.embassyAgent_Agent_EmbassyPhone : undefined,
        Agent_EmbassyEmailAddress: isEmbassyUser ? formData?.embassyAgent_Agent_EmbassyEmailAddress : undefined,
        Agent_EmbassyFirstLanguage: isEmbassyUser ? formData?.embassyAgent_Agent_EmbassyFirstLanguage : undefined,
        PlaintiffName: isEmbassyUser ? formData?.embassyAgent_userName : formData?.userName,
        Plaintiff_PhoneNumber: isEmbassyUser ? formData?.embassyAgent_phoneNumber : formData?.phoneNumber,
        Plaintiff_Region: isEmbassyUser
          ? formData?.embassyAgent_region?.value || formData?.embassyAgent_region || ""
          : formData?.plaintiffRegion?.value || formData?.region?.value || formData?.plaintiffRegion || formData?.region || "",
        Plaintiff_City: isEmbassyUser
          ? formData?.embassyAgent_city?.value || formData?.embassyAgent_city || ""
          : formData?.plaintiffCity?.value || formData?.city?.value || formData?.plaintiffCity || formData?.city || "",
        JobPracticing: isEmbassyUser
          ? formData?.embassyAgent_occupation?.value || formData?.embassyAgent_occupation || ""
          : formData?.occupation?.value || formData?.occupation || "",
        Gender: isEmbassyUser
          ? formData?.embassyAgent_gender?.value || formData?.embassyAgent_gender || ""
          : formData?.gender?.value || formData?.gender || "",
        Worker_Nationality: isEmbassyUser
          ? formData?.embassyAgent_nationality?.value || formData?.embassyAgent_nationality || ""
          : formData?.nationality?.value || formData?.nationality || "",
        IsGNRequired: formData?.isPhone || false,
        CountryCode: formData?.phoneCode?.value || "",
        GlobalPhoneNumber: formData?.interPhoneNumber || "",
        IsGNOtpVerified: formData?.isVerified || false,
        DomesticWorker: formData?.isDomestic ? "true" : "false",
        IDNumber: isEmbassyUser
          ? formData?.embassyAgent_workerAgentIdNumber
          : formData?.applicantType === "principal"
            ? userId
            : formData?.workerAgentIdNumber,
      };
      // Remove undefined embassy fields for non-embassy users
      if (!isEmbassyUser) {
        delete payload.Agent_EmbassyName;
        delete payload.Agent_EmbassyNationality;
        delete payload.Agent_EmbassyPhone;
        delete payload.Agent_EmbassyEmailAddress;
        delete payload.Agent_EmbassyFirstLanguage;
      }
      if (!payload.Plaintiff_City) {
        payload.Plaintiff_City = "1";
      }
      if (formData?.applicantType === "representative") {
        payload.Agent_AgentID = userId;
        payload.Agent_MandateNumber = formData?.agentType === "local_agency"
          ? formData?.agencyNumber
          : formData?.externalAgencyNumber;
        payload.Agent_PhoneNumber = formData?.agentPhoneNumber;
        payload.Agent_Name = formData?.agentName;
        payload.Agent_MandateStatus = formData?.agencyStatus;
        payload.Agent_MandateSource = formData?.agencySource;
        payload.Agent_ResidencyAddress = formData?.Agent_ResidencyAddress;
        payload.Agent_CurrentPlaceOfWork = formData?.Agent_CurrentPlaceOfWork;
        payload.Agent_Mobilenumber = formData?.agentPhoneNumber;
        payload.CertifiedBy =
          formData?.agentType === "local_agency" ? "CB1" : "CB2";
      }
      // Add attachment for domestic worker (principal, DW1)
      const isDomesticWorker = formData?.isDomestic === true || formData?.isDomestic === 'true';
      if (isDomesticWorker && formData?.attachment && formData?.attachment.base64) {
        payload.Attachment = {
          classification: formData.attachment.classification || '',
          base64: formData.attachment.base64,
          fileName: formData.attachment.fileName,
          fileType: formData.attachment.fileType,
        };
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
        // Map lookup data to { value, label } format for embassy forms
        const mapOptions = (data: {
          DataElements?: { ElementKey: string; ElementValue: string }[];
        }) =>
          data?.DataElements?.map(
            (item: { ElementKey: string; ElementValue: string }) => ({
              value: item.ElementKey,
              label: item.ElementValue,
            })
          ) || [];
        return EmbassyClaimantFormLayout({
          control,
          setValue: setValue as any,
          watch: watch as any,
          RegionOptions: mapOptions(regionData),
          CityOptions: mapOptions(cityData),
          OccupationOptions: mapOptions(occupationData),
          GenderOptions: mapOptions(genderData),
          NationalityOptions: mapOptions(nationalityData),
          setError,
          clearErrors,
          isVerified,
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
          if (
            value.length >= 1 &&
            value.length <= 10 &&
            watch("agentType") === "local_agency"
          ) {
            setIsAgencyValidating(true);
            setError("agencyNumber", {
              type: "validate",
              message: t("validatingAgencyNumber"),
            });
            if (!isUninitialized && refetchAttorneyDetails) {
              refetchAttorneyDetails();
            }
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
        // addthion
        allowedIds,
      });
    };

    const rightLayout = loadFormLayoutFunction();

    return (
      <>
        {nicLoading && <Loader />}
        {isAgencyValidating && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-25 backdrop-blur-sm z-[9999]">
            <Loader />
          </div>
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
