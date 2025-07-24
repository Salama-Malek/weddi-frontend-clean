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
import { claimantDetailsPayload } from "@/features/initiate-hearing/api/create-case/payloads";

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
  ErrorDetails?: Array<{
    ErrorCode?: string;
    ErrorDesc?: string;
  }>;
  SourceSystem?: string;
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

    const watchedClaimantStatus = useWatch({ name: "claimantStatus", control });

    useEffect(() => {
      // Set default claimant status on mount to avoid race conditions
      if (!watchedClaimantStatus) {
        setValue("claimantStatus", "principal");
      }
    }, [watchedClaimantStatus, setValue]);

    const principalId = userId;
    const principalDob = formatDateToYYYYMMDD(userClaims?.UserDOB);

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

    // --- Agent info ---
    const agentType = watch("agentType");
    const mandateNumber = agentType === "local_agency"
      ? watch("localAgent_agencyNumber") || watch("agencyNumber")
      : agentType === "external_agency"
        ? watch("externalAgent_agencyNumber") || watch("externalAgencyNumber")
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
        skip: agentType !== "local_agency" || !isAgencyValidating,
        refetchOnMountOrArgChange: true, 
      }
    );

    const allowedIds = (() => {
      try {
        if (!agentInfo?.Agent?.AgentDetails || !Array.isArray(agentInfo.Agent.AgentDetails)) {
          return [];
        }
        return agentInfo.Agent.AgentDetails
          .map((d) => d?.IdentityNumber || "")
          .filter(Boolean);
      } catch (error) {
        console.error('Error processing allowed IDs:', error);
        return [];
      }
    })();
    const safeAllowedIds = allowedIds || [];
    const hasValidAgency = agentType === "local_agency" && agentInfo?.Agent?.ErrorDescription === "Success";

    // --- Lookup data queries ---
    const isEmbassyUser = userType?.toLowerCase().includes("embassy user");
    const isEstablishmentUser = userType?.toLowerCase().includes("establishment");
    let selectedRegionForCity: any = null;
    let cityFieldName: string = "plaintiffCity";
    // Determine correct region/city fields for lookup and assignment
    if (isEstablishmentUser) {
      selectedRegionForCity = typeof watch("establishment_region") === "object"
        ? watch("establishment_region")?.value
        : watch("establishment_region") || "";
      cityFieldName = "establishment_city";
    } else if (isEmbassyUser) {
      if (claimantStatus === "representative") {
        selectedRegionForCity = typeof watch("embassyAgent_region") === "object"
          ? watch("embassyAgent_region")?.value
          : watch("embassyAgent_region") || "";
        cityFieldName = "embassyAgent_city";
      } else {
        selectedRegionForCity = typeof watch("region") === "object"
          ? watch("region")?.value
          : watch("region") || "";
        cityFieldName = "city";
      }
    } else if (claimantStatus === "principal") {
      selectedRegionForCity = typeof watch("principal_region") === "object"
        ? watch("principal_region")?.value
        : watch("principal_region") || "";
      cityFieldName = "principal_city";
    } else if (claimantStatus === "representative" && agentType === "local_agency") {
      selectedRegionForCity = typeof watch("localAgent_region") === "object"
        ? watch("localAgent_region")?.value
        : watch("localAgent_region") || "";
      cityFieldName = "localAgent_city";
    } else if (claimantStatus === "representative" && agentType === "external_agency") {
      selectedRegionForCity = typeof watch("externalAgent_region") === "object"
        ? watch("externalAgent_region")?.value
        : watch("externalAgent_region") || "";
      cityFieldName = "externalAgent_city";
    } else {
      selectedRegionForCity = typeof watch("plaintiffRegion") === "object"
        ? watch("plaintiffRegion")?.value
        : watch("plaintiffRegion") || "";
      cityFieldName = "plaintiffCity";
    }
    const { data: regionData } = useGetWorkerRegionLookupDataQuery({
      AcceptedLanguage: lang,
      SourceSystem: "E-Services",
      ModuleKey: isEstablishmentUser ? "EstablishmentRegion" : "WorkerRegion",
      ModuleName: isEstablishmentUser ? "EstablishmentRegion" : "WorkerRegion",
    });
    const { data: cityData } = useGetWorkerCityLookupDataQuery(
      {
        AcceptedLanguage: lang,
        SourceSystem: "E-Services",
        selectedWorkerRegion: selectedRegionForCity,
        ModuleName: isEstablishmentUser ? "EstablishmentCity" : "WorkerCity",
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

    const externalAgentId = watch("externalAgent_workerAgentIdNumber") || "";
    const externalAgentDob = toWesternDigits(watch("externalAgent_workerAgentDateOfBirthHijri") || "");
    const {
      data: externalAgentNICResponse,
      isFetching: externalAgentNICLoading,
      refetch: refetchExternalAgentNIC,
    } = useGetNICDetailsQuery(
      {
        IDNumber: externalAgentId,
        DateOfBirth: externalAgentDob,
        AcceptedLanguage: lang,
        SourceSystem: "E-Services",
      },
      {
        skip:
          agentType !== "external_agency" ||
          externalAgentId.length !== 10 ||
          externalAgentDob.length !== 8,
      }
    );

    const localAgentId = watch("localAgent_workerAgentIdNumber") || "";
    const localAgentDob = toWesternDigits(watch("localAgent_workerAgentDateOfBirthHijri") || "");
    const {
      data: localAgentNICResponse,
      isFetching: localAgentNICLoading,
      refetch: refetchLocalAgentNIC,
    } = useGetNICDetailsQuery(
      {
        IDNumber: localAgentId,
        DateOfBirth: localAgentDob,
        AcceptedLanguage: lang,
        SourceSystem: "E-Services",
      },
      {
        skip:
          agentType !== "local_agency" ||
          !hasValidAgency ||
          localAgentId.length !== 10 ||
          !safeAllowedIds.includes(localAgentId) ||
          localAgentDob.length !== 8,
      }
    );

    const errorToastShownRef = useRef(false);

    useEffect(() => {
      try {
        if (!agentInfo && !isAgentFetching) return;

        if (isAgentFetching) {
          setIsAgencyValidating(true);
          errorToastShownRef.current = false; // Reset when starting new fetch
          return;
        }

        setIsAgencyValidating(false);

      // Defensive check: ensure agentInfo has the expected structure
      if (!agentInfo || typeof agentInfo !== 'object') {
        console.warn('Agent info is missing or invalid:', agentInfo);
        setError("agencyNumber", {
          type: "validate",
          message: t("error.invalidAgencyNumber"),
        });
        return;
      }

      // Check if Agent object exists
      if (!agentInfo.Agent || typeof agentInfo.Agent !== 'object') {
        console.warn('Agent data is missing or invalid:', agentInfo);
        setError("agencyNumber", {
          type: "validate",
          message: t("error.invalidAgencyNumber"),
        });
        return;
      }

      // ERROR branch: no data or explicit error details
      const hasNoData =
        agentInfo.Agent.ErrorDescription === "SuccessNoData" ||
        (Array.isArray(agentInfo.ErrorDetails) &&
          agentInfo.ErrorDetails.length > 0);

      if (hasNoData) {
        // pull out an actual array
        const errorDetailsArr = Array.isArray(agentInfo?.ErrorDetails)
          ? agentInfo!.ErrorDetails!
          : [];

        const errorDesc = errorDetailsArr.find(
          (d) => d.ErrorDesc !== undefined
        )?.ErrorDesc;

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

      if (agentInfo?.Agent?.ErrorDescription === "Success") {
        setValue("agentName", agentInfo?.Agent.AgentName || "");
        setValue("agencyStatus", agentInfo?.Agent.MandateStatus || "");
        setValue("agencySource", agentInfo?.Agent.MandateSource || "");
        toast.success(t("agencyFound"));
        clearErrors("agencyNumber");
        errorToastShownRef.current = false; 
      }
    } catch (error) {
      console.error('Error processing agent info:', error);
      // Fallback error handling
      setError("agencyNumber", {
        type: "validate",
        message: t("error.invalidAgencyNumber"),
      });
      setIsAgencyValidating(false);
    }
    }, [agentInfo, isAgentFetching, setValue, setError, clearErrors, t]);

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
          // Always validate and show error for invalid ID
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

    // Additional validation effect to ensure validation runs on every ID change
    useEffect(() => {
      if (
        claimantStatus === "representative" &&
        agentType === "local_agency" &&
        representativeId &&
        representativeId.length === 10 &&
        allowedIds.length > 0
      ) {
        // Always validate the current ID against allowed IDs
        const isValidId = allowedIds.includes(representativeId);
        
        if (!isValidId) {
          setError("idNumber", {
            type: "validate",
            message: t("error.idNotUnderAgency"),
          });
        } else {
          clearErrors("idNumber");
        }
      }
    }, [representativeId, allowedIds, claimantStatus, agentType, setError, clearErrors, t]);

    const embasyUserData = getCookie("storeAllUserTypeData");
    const embassyUserNationalityCode =
      embasyUserData?.EmbassyInfo?.[0]?.Nationality_Code;
    const watchedNationality = useWatch({ control, name: "nationality" });

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
      // console.log('[DEBUG formData]', formData);
      // Use the shared payload builder
      const payload = claimantDetailsPayload(
        "Next",
        formData,
        userClaims,
        formData?.isDomestic,
        null, // pass nicDetailObj if available
        null, // pass attorneyData if available
        userType,
        getCookie("caseId") || "",
        lang
      );
      const isCaseCreated = !!getCookie("caseId");
      await saveClaimantDetails({ data: payload, isCaseCreated });
    };

    // --- Establishment & Legal-Rep ---
    const { data: est } = useGetEstablishmentDetailsQuery(
      {
        AcceptedLanguage: lang,
        SourceSystem: "E-Services",
        FileNumber: userClaims?.File_Number || skipToken,
      },
      { skip: !userClaims?.File_Number }
    );
    const { data: legalRep } = useGetUserTypeLegalRepQuery(
      {
        IDNumber: userId,
        UserType: userClaims?.UserType,
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
        localAgentNICResponse, // pass localAgentNICResponse
        externalAgentNICResponse, // pass externalAgentNICResponse
        register,
        errors,
        trigger,
        isValid,
        // addthion
        allowedIds,
      });
    };

    const rightLayout = loadFormLayoutFunction();

    useEffect(() => {
      if (externalAgentNICResponse?.NICDetails && agentType === "external_agency") {
        const d = externalAgentNICResponse.NICDetails;
        setValue("externalAgent_userName", d.PlaintiffName || "");
        setValue("externalAgent_region", d.Region_Code ? { value: d.Region_Code, label: d.Region } : null);
        setValue("externalAgent_city", d.City_Code ? { value: d.City_Code, label: d.City } : null);
        setValue("externalAgent_occupation", d.Occupation_Code ? { value: d.Occupation_Code, label: d.Occupation } : null);
        setValue("externalAgent_gender", d.Gender_Code ? { value: d.Gender_Code, label: d.Gender } : null);
        setValue("externalAgent_nationality", d.Nationality_Code ? { value: d.Nationality_Code, label: d.Nationality } : null);
        setValue("externalAgent_phoneNumber", d.PhoneNumber ? d.PhoneNumber.toString() : "");
      }
    }, [externalAgentNICResponse, agentType, setValue]);

    // Auto-fill city field from NIC/lookup response for all user types
    useEffect(() => {
      // Embassy agent
      if (isEmbassyUser && claimantStatus === "representative" && externalAgentNICResponse?.NICDetails) {
        const d = externalAgentNICResponse.NICDetails;
        setValue("embassyAgent_city", d.City_Code ? { value: d.City_Code, label: d.City } : null);
      }
      // Embassy principal
      if (isEmbassyUser && claimantStatus === "principal" && externalAgentNICResponse?.NICDetails) {
        const d = externalAgentNICResponse.NICDetails;
        setValue("city", d.City_Code ? { value: d.City_Code, label: d.City } : null);
      }
      // Establishment
      if (isEstablishmentUser && externalAgentNICResponse?.NICDetails) {
        const d = externalAgentNICResponse.NICDetails;
        setValue("establishment_city", d.City_Code ? { value: d.City_Code, label: d.City } : null);
      }
      // Worker principal
      if (!isEmbassyUser && !isEstablishmentUser && claimantStatus === "principal" && externalAgentNICResponse?.NICDetails) {
        const d = externalAgentNICResponse.NICDetails;
        setValue("principal_city", d.City_Code ? { value: d.City_Code, label: d.City } : null);
      }
      // Worker agent (local)
      if (!isEmbassyUser && !isEstablishmentUser && claimantStatus === "representative" && agentType === "local_agency" && externalAgentNICResponse?.NICDetails) {
        const d = externalAgentNICResponse.NICDetails;
        setValue("localAgent_city", d.City_Code ? { value: d.City_Code, label: d.City } : null);
      }
      // Worker agent (external)
      if (!isEmbassyUser && !isEstablishmentUser && claimantStatus === "representative" && agentType === "external_agency" && externalAgentNICResponse?.NICDetails) {
        const d = externalAgentNICResponse.NICDetails;
        setValue("externalAgent_city", d.City_Code ? { value: d.City_Code, label: d.City } : null);
      }
      // Worker default
      if (!isEmbassyUser && !isEstablishmentUser && claimantStatus !== "principal" && claimantStatus !== "representative" && externalAgentNICResponse?.NICDetails) {
        const d = externalAgentNICResponse.NICDetails;
        setValue("plaintiffCity", d.City_Code ? { value: d.City_Code, label: d.City } : null);
      }
    }, [externalAgentNICResponse, agentType, setValue, isEmbassyUser, isEstablishmentUser, claimantStatus]);

    // Double-check local agent NIC call and effect
    useEffect(() => {
      if (localAgentNICResponse?.NICDetails && agentType === "local_agency") {
        const d = localAgentNICResponse.NICDetails;
        setValue("localAgent_city", d.City_Code ? { value: d.City_Code, label: d.City } : null);
      }
      if (isEstablishmentUser && localAgentNICResponse?.NICDetails) {
        const d = localAgentNICResponse.NICDetails;
        setValue("establishment_city", d.City_Code ? { value: d.City_Code, label: d.City } : null);
      }
      if (!isEmbassyUser && !isEstablishmentUser && claimantStatus === "principal" && localAgentNICResponse?.NICDetails) {
        const d = localAgentNICResponse.NICDetails;
        setValue("principal_city", d.City_Code ? { value: d.City_Code, label: d.City } : null);
      }
      if (!isEmbassyUser && !isEstablishmentUser && claimantStatus !== "principal" && claimantStatus !== "representative" && localAgentNICResponse?.NICDetails) {
        const d = localAgentNICResponse.NICDetails;
        setValue("plaintiffCity", d.City_Code ? { value: d.City_Code, label: d.City } : null);
      }
    }, [localAgentNICResponse, agentType, setValue, isEmbassyUser, isEstablishmentUser, claimantStatus]);

    // Add debug logs for isValid and errors
    // console.log('[DEBUG Next Button] isValid:', isValid, 'errors:', errors);

    // --- Clear fields when switching agent types ---
    const previousAgentTypeRef = useRef<string | undefined>();
    useEffect(() => {
      const currentAgentType = watch("agentType");
      
      if (previousAgentTypeRef.current && previousAgentTypeRef.current !== currentAgentType) {
        // Clear local agent fields when switching away from local_agency
        if (previousAgentTypeRef.current === "local_agency") {
          setValue("localAgent_workerAgentIdNumber", "");
          setValue("localAgent_workerAgentDateOfBirthHijri", "");
          setValue("localAgent_gregorianDate", "");
          setValue("localAgent_userName", "");
          setValue("localAgent_phoneNumber", "");
          setValue("localAgent_region", null);
          setValue("localAgent_city", null);
          setValue("localAgent_occupation", null);
          setValue("localAgent_gender", null);
          setValue("localAgent_nationality", null);
          clearErrors("localAgent_workerAgentIdNumber");
        }
        
        // Clear external agent fields when switching away from external_agency
        if (previousAgentTypeRef.current === "external_agency") {
          setValue("externalAgent_workerAgentIdNumber", "");
          setValue("externalAgent_workerAgentDateOfBirthHijri", "");
          setValue("externalAgent_gregorianDate", "");
          setValue("externalAgent_userName", "");
          setValue("externalAgent_phoneNumber", "");
          setValue("externalAgent_region", null);
          setValue("externalAgent_city", null);
          setValue("externalAgent_occupation", null);
          setValue("externalAgent_gender", null);
          setValue("externalAgent_nationality", null);
          clearErrors("externalAgent_workerAgentIdNumber");
        }
      }
      
      previousAgentTypeRef.current = currentAgentType;
    }, [watch("agentType"), setValue, clearErrors]);

    // --- Clear fields when switching claimant status ---
    const previousClaimantStatusRef = useRef<string | undefined>();
    useEffect(() => {
      const currentClaimantStatus = watch("claimantStatus");
      
      if (previousClaimantStatusRef.current && previousClaimantStatusRef.current !== currentClaimantStatus) {
        // Clear principal fields when switching away from principal
        if (previousClaimantStatusRef.current === "principal") {
          setValue("principal_hijriDate", "");
          setValue("principal_gregorianDate", "");
          setValue("principal_userName", "");
          setValue("principal_phoneNumber", "");
          setValue("principal_region", null);
          setValue("principal_city", null);
          setValue("principal_occupation", null);
          setValue("principal_gender", null);
          setValue("principal_nationality", null);
        }
        
        // Clear representative fields when switching away from representative
        if (previousClaimantStatusRef.current === "representative") {
          setValue("workerAgentIdNumber", "");
          setValue("workerAgentDateOfBirthHijri", "");
          setValue("gregorianDate", "");
          setValue("userName", "");
          setValue("phoneNumber", "");
          setValue("region", null);
          setValue("city", null);
          setValue("occupation", null);
          setValue("gender", null);
          setValue("nationality", null);
        }
      }
      
      previousClaimantStatusRef.current = currentClaimantStatus;
    }, [watch("claimantStatus"), setValue]);

    // --- NIC Error Handling Effects ---
    useEffect(() => {
      // Handle external agent NIC errors
      if (externalAgentNICResponse?.ErrorDetails && agentType === "external_agency") {
        const errorDesc = externalAgentNICResponse.ErrorDetails[0]?.ErrorDesc;
        if (errorDesc) {
          toast.error(errorDesc);
          // Clear date fields
          setValue("externalAgent_workerAgentDateOfBirthHijri", "");
          setValue("externalAgent_gregorianDate", "");
          // Clear other fields that depend on NIC
          setValue("externalAgent_userName", "");
          setValue("externalAgent_region", null);
          setValue("externalAgent_city", null);
          setValue("externalAgent_occupation", null);
          setValue("externalAgent_gender", null);
          setValue("externalAgent_nationality", null);
          setValue("externalAgent_phoneNumber", "");
        }
      }
    }, [externalAgentNICResponse, agentType, setValue]);

    useEffect(() => {
      // Handle local agent NIC errors
      if (localAgentNICResponse?.ErrorDetails && agentType === "local_agency") {
        const errorDesc = localAgentNICResponse.ErrorDetails[0]?.ErrorDesc;
        if (errorDesc) {
          toast.error(errorDesc);
          // Clear date fields
          setValue("localAgent_workerAgentDateOfBirthHijri", "");
          setValue("localAgent_gregorianDate", "");
          // Clear other fields that depend on NIC
          setValue("localAgent_userName", "");
          setValue("localAgent_region", null);
          setValue("localAgent_city", null);
          setValue("localAgent_occupation", null);
          setValue("localAgent_gender", null);
          setValue("localAgent_nationality", null);
          setValue("localAgent_phoneNumber", "");
        }
      }
    }, [localAgentNICResponse, agentType, setValue]);

    useEffect(() => {
      // Handle principal NIC errors
      if (principalNICResponse?.ErrorDetails && claimantStatus === "principal") {
        const errorDesc = principalNICResponse.ErrorDetails[0]?.ErrorDesc;
        if (errorDesc) {
          toast.error(errorDesc);
          // Clear date fields
          setValue("principal_hijriDate", "");
          setValue("principal_gregorianDate", "");
          // Clear other fields that depend on NIC
          setValue("principal_userName", "");
          setValue("principal_region", null);
          setValue("principal_city", null);
          setValue("principal_occupation", null);
          setValue("principal_gender", null);
          setValue("principal_nationality", null);
          setValue("principal_phoneNumber", "");
        }
      }
    }, [principalNICResponse, claimantStatus, setValue]);

    useEffect(() => {
      // Handle representative NIC errors
      if (representativeNICResponse?.ErrorDetails && claimantStatus === "representative") {
        const errorDesc = representativeNICResponse.ErrorDetails[0]?.ErrorDesc;
        if (errorDesc) {
          toast.error(errorDesc);
          // Clear date fields
          setValue("workerAgentDateOfBirthHijri", "");
          setValue("gregorianDate", "");
          // Clear other fields that depend on NIC
          setValue("userName", "");
          setValue("region", null);
          setValue("city", null);
          setValue("occupation", null);
          setValue("gender", null);
          setValue("nationality", null);
          setValue("phoneNumber", "");
        }
      }
    }, [representativeNICResponse, claimantStatus, setValue]);

    // Principal NIC error handling (city field)
    useEffect(() => {
      if (principalNICResponse?.ErrorDetails && claimantStatus === "principal") {
        setValue("principal_city", null);
      }
      if (isEstablishmentUser && principalNICResponse?.ErrorDetails) {
        setValue("establishment_city", null);
      }
      if (isEmbassyUser && claimantStatus === "principal" && principalNICResponse?.ErrorDetails) {
        setValue("city", null);
      }
    }, [principalNICResponse, claimantStatus, setValue, isEmbassyUser, isEstablishmentUser]);

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
