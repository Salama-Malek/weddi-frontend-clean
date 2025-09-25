import React, { useEffect, useState, useRef, useCallback } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useTranslation } from "react-i18next";
import withStepNavigation, {
  WithStepNavigationProps,
} from "@/shared/HOC/withStepNavigation";
import { DynamicForm } from "@/shared/components/form/DynamicForm";
import { useNavigationService } from "@/shared/hooks/useNavigationService";
import { toast } from "react-toastify";
import Loader from "@/shared/components/loader";
import {
  formatDateToYYYYMMDD,
  toWesternDigits,
  isHijriDateInFuture,
} from "@/shared/lib/helpers";
import { useWatch } from "react-hook-form";
import { useNICServiceErrorContext } from "@/shared/context/NICServiceErrorContext";

import {
  useGetNICDetailsQuery,
  useGetWorkerRegionLookupDataQuery,
  useGetWorkerCityLookupDataQuery,
  useGetOccupationLookupDataQuery,
  useGetGenderLookupDataQuery,
  useGetNationalityLookupDataQuery,
  useGetAttorneyDetailsQuery,
} from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";

import { useGetEstablishmentDetailsQuery } from "@/features/initiate-hearing/api/create-case/defendantDetailsApis";
import { useGetUserTypeLegalRepQuery } from "@/features/login/api/loginApis";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import useCaseDetailsPrefill from "@/features/initiate-hearing/hooks/useCaseDetailsPrefill";
import useEmbassyCaseDetailsPrefill from "@/features/initiate-hearing/hooks/useEmbassyCaseDetailsPrefill";
import { useAPIFormsData } from "@/providers/FormContext";

import { useFormLayout } from "./claimant.forms.formLayout";
import { useEstablishmentPlaintiffFormLayout } from "../../establishment-tabs/plaintiff/plaintiff.forms.formLayout";
import { useLegalRepPlaintiffFormLayout } from "../../establishment-tabs/legal-representative/plaintiff.forms.formLayout";
import { EmbassyClaimantFormLayout } from "../../embasy/modern/EmbassyClaimantFormLayout";

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
  const { currentTab } = useNavigationService();

  const { handleNICResponse, setTryAgainCallback } =
    useNICServiceErrorContext();

  const [getCookie] = useCookieState();
  const userClaims = getCookie("userClaims");
  const userId = userClaims?.UserID || "";
  const userType = getCookie("userType");
  const { clearFormData } = useAPIFormsData();

  const memoizedSetValue = useCallback(setValue, [setValue]);
  const memoizedSetError = useCallback(setError, [setError]);
  const memoizedClearErrors = useCallback(clearErrors, [clearErrors]);

  const isClearingFieldsRef = useRef(false);

  useEffect(() => {}, [clearFormData]);

  const { caseData } = useCaseDetailsPrefill({
    setValue: memoizedSetValue,
    trigger,
    prefillType: "claimant",
    userType,
  });

  const {
    isFetched: embassyCaseDetailsLoading,
    isLoading: embassyCaseDetailsIsLoading,
  } = useEmbassyCaseDetailsPrefill(memoizedSetValue, trigger);

  const isEmbassyPrefillProcessing = embassyCaseDetailsIsLoading;
  const isEmbassyPrefillFetched = embassyCaseDetailsLoading;

  const claimantStatus = watch("claimantStatus") as
    | "principal"
    | "representative";

  const watchedClaimantStatus = useWatch({ name: "claimantStatus", control });

  useEffect(() => {
    if (
      userType?.toLowerCase().includes("embassy user") &&
      embassyCaseDetailsLoading &&
      !embassyCaseDetailsIsLoading
    ) {
      const storedCaseDetails = localStorage.getItem("EmbassyCaseDetails");
      if (storedCaseDetails) {
        try {
          const caseDetails = JSON.parse(storedCaseDetails);

          if (
            caseDetails.PlaintiffType === "Agent" ||
            caseDetails.PlaintiffType_Code === "Agent"
          ) {
            memoizedSetValue("claimantStatus", "representative");

            memoizedSetValue("applicantType", "representative");

            setTimeout(() => {
              const embassyAgentFields = [
                "embassyAgent_workerAgentIdNumber",
                "embassyAgent_workerAgentDateOfBirthHijri",
                "embassyAgent_gregorianDate",
                "embassyAgent_userName",
                "embassyAgent_phoneNumber",
                "embassyAgent_city",
                "embassyAgent_region",
                "embassyAgent_occupation",
                "embassyAgent_gender",
                "embassyAgent_nationality",
                "embassyAgent_applicant",
              ];

              embassyAgentFields.forEach((field) => {
                const currentValue = watch(field);
                if (
                  currentValue !== undefined &&
                  currentValue !== null &&
                  currentValue !== ""
                ) {
                  memoizedSetValue(field, currentValue, {
                    shouldValidate: false,
                    shouldTouch: false,
                    shouldDirty: false,
                  });
                }
              });
            }, 150);
          }
        } catch (error) {}
      }
    }
  }, [
    userType,
    embassyCaseDetailsLoading,
    embassyCaseDetailsIsLoading,
    memoizedSetValue,
    watch,
  ]);

  useEffect(() => {
    if (
      userType?.toLowerCase().includes("embassy user") &&
      claimantStatus === "representative"
    ) {
      const embassyAgentFields = [
        "embassyAgent_workerAgentIdNumber",
        "embassyAgent_workerAgentDateOfBirthHijri",
        "embassyAgent_gregorianDate",
        "embassyAgent_userName",
        "embassyAgent_phoneNumber",
        "embassyAgent_region",
        "embassyAgent_city",
        "embassyAgent_occupation",
        "embassyAgent_gender",
        "embassyAgent_nationality",
        "embassyAgent_applicant",
      ];

      embassyAgentFields.forEach((field) => {
        const currentValue = watch(field);
        if (
          currentValue !== undefined &&
          currentValue !== null &&
          currentValue !== ""
        ) {
          memoizedSetValue(field, currentValue, {
            shouldValidate: false,
            shouldTouch: false,
            shouldDirty: false,
          });
        }
      });
    }
  }, [userType, claimantStatus, memoizedSetValue, watch]);

  useEffect(() => {
    if (!watchedClaimantStatus) {
      memoizedSetValue("claimantStatus", "principal");
    }
  }, []);

  const principalId = userId;
  const principalDob = formatDateToYYYYMMDD(userClaims?.UserDOB);

  const representativeId = watch("workerAgentIdNumber") as string;
  const representativeDob = formatDateToYYYYMMDD(
    watch("workerAgentDateOfBirthHijri"),
  );

  const agentType = watch("agentType");
  const mandateNumber =
    agentType === "local_agency"
      ? watch("localAgent_agencyNumber") || watch("agencyNumber")
      : agentType === "external_agency"
        ? watch("externalAgent_agencyNumber") || watch("externalAgencyNumber")
        : "";
  const {
    data: agentInfo,
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
    },
  );

  const allowedIds = (() => {
    try {
      if (
        !agentInfo?.Agent?.AgentDetails ||
        !Array.isArray(agentInfo.Agent.AgentDetails)
      ) {
        return [];
      }
      return agentInfo.Agent.AgentDetails.map(
        (d) => d?.IdentityNumber || "",
      ).filter(Boolean);
    } catch (error) {
      return [];
    }
  })();
  const safeAllowedIds = allowedIds || [];
  const hasValidAgency =
    agentType === "local_agency" &&
    agentInfo?.Agent?.ErrorDescription === "Success";

  const isEstablishmentUser = userType?.toLowerCase().includes("establishment");
  const isLegalRepresentativeUser = userType
    ?.toLowerCase()
    .includes("legal representative");
  let selectedRegionForCity: any = null;

  if (isEstablishmentUser) {
    selectedRegionForCity =
      typeof watch("establishment_region") === "object"
        ? watch("establishment_region")?.value
        : watch("establishment_region") || "";
  } else if (userType?.toLowerCase().includes("embassy user")) {
    if (claimantStatus === "representative") {
      selectedRegionForCity =
        typeof watch("embassyAgent_region") === "object"
          ? watch("embassyAgent_region")?.value
          : watch("embassyAgent_region") || "";
    } else {
      selectedRegionForCity =
        typeof watch("embassyPrincipal_region") === "object"
          ? watch("embassyPrincipal_region")?.value
          : watch("embassyPrincipal_region") || "";
    }
  } else if (claimantStatus === "principal") {
    selectedRegionForCity =
      typeof watch("principal_region") === "object"
        ? watch("principal_region")?.value
        : watch("principal_region") || "";
  } else if (
    claimantStatus === "representative" &&
    agentType === "local_agency"
  ) {
    selectedRegionForCity =
      typeof watch("localAgent_region") === "object"
        ? watch("localAgent_region")?.value
        : watch("localAgent_region") || "";
  } else if (
    claimantStatus === "representative" &&
    agentType === "external_agency"
  ) {
    selectedRegionForCity =
      typeof watch("externalAgent_region") === "object"
        ? watch("externalAgent_region")?.value
        : watch("externalAgent_region") || "";
  } else {
    selectedRegionForCity =
      typeof watch("plaintiffRegion") === "object"
        ? watch("plaintiffRegion")?.value
        : watch("plaintiffRegion") || "";
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
      skip: !selectedRegionForCity,
    },
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

  useEffect(() => {
    if (!isEstablishmentUser) return;
    const current = watch("establishment_city");
    const list = cityData?.DataElements as any[] | undefined;
    if (!list || !current || typeof current !== "string") return;
    const byCode = list.find((i) => String(i.ElementKey) === String(current));
    const byLabel = list.find(
      (i) =>
        String(i.ElementValue).toUpperCase() === String(current).toUpperCase(),
    );
    const hit = byCode || byLabel;
    if (hit) {
      setValue(
        "establishment_city",
        { value: String(hit.ElementKey), label: hit.ElementValue },
        { shouldValidate: true },
      );
    }
  }, [
    isEstablishmentUser,
    cityData?.DataElements,
    watch("establishment_city"),
    setValue,
  ]);

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
        !principalDob ||
        isHijriDateInFuture(principalDob) ||
        isLegalRepresentativeUser ||
        isEstablishmentUser ||
        currentTab !== 0 ||
        (!!caseData &&
          !!caseData.PlaintiffId &&
          principalId === caseData.PlaintiffId &&
          principalDob === caseData.PlaintiffHijiriDOB),
    },
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
        representativeDob.length !== 8 ||
        isHijriDateInFuture(representativeDob) ||
        isLegalRepresentativeUser ||
        isEstablishmentUser ||
        currentTab !== 0 ||
        (!!caseData &&
          !!caseData.Agent_AgentID &&
          representativeId === caseData.Agent_AgentID &&
          representativeDob ===
            toWesternDigits(caseData.PlaintiffHijiriDOB || "")),
    },
  );

  const nicLoading = principalNICLoading || representativeNICLoading;

  const embassyNicLoading = userType?.toLowerCase().includes("embassy user")
    ? embassyCaseDetailsIsLoading
    : false;

  const finalNicLoading = nicLoading || embassyNicLoading;

  const externalAgentId = watch("externalAgent_workerAgentIdNumber") || "";
  const externalAgentDob = toWesternDigits(
    watch("externalAgent_workerAgentDateOfBirthHijri") || "",
  );
  const {
    data: externalAgentNICResponse,

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
        externalAgentDob.length !== 8 ||
        isHijriDateInFuture(externalAgentDob) ||
        isLegalRepresentativeUser ||
        isEstablishmentUser ||
        currentTab !== 0 ||
        (!!caseData &&
          !!caseData.Agent_AgentID &&
          externalAgentId === caseData.Agent_AgentID &&
          externalAgentDob ===
            toWesternDigits(caseData.PlaintiffHijiriDOB || "")),
    },
  );

  const localAgentId = watch("localAgent_workerAgentIdNumber") || "";
  const localAgentDob = toWesternDigits(
    watch("localAgent_workerAgentDateOfBirthHijri") || "",
  );

  const {
    data: localAgentNICResponse,

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
        localAgentDob.length !== 8 ||
        isHijriDateInFuture(localAgentDob) ||
        isLegalRepresentativeUser ||
        isEstablishmentUser ||
        currentTab !== 0 ||
        (!!caseData &&
          !!caseData.Agent_AgentID &&
          localAgentId === caseData.Agent_AgentID &&
          localAgentDob === toWesternDigits(caseData.PlaintiffHijiriDOB || "")),
    },
  );

  const errorToastShownRef = useRef(false);

  const handleTryAgain = useCallback(() => {
    if (!isLegalRepresentativeUser) {
      if (principalNICRefetch) principalNICRefetch();
      if (representativeNICRefetch) representativeNICRefetch();
      if (refetchExternalAgentNIC) refetchExternalAgentNIC();
      if (refetchLocalAgentNIC) refetchLocalAgentNIC();
    }
  }, [
    principalNICRefetch,
    representativeNICRefetch,
    refetchExternalAgentNIC,
    refetchLocalAgentNIC,
    isLegalRepresentativeUser,
  ]);

  useEffect(() => {
    setTryAgainCallback(handleTryAgain);
  }, [setTryAgainCallback, handleTryAgain]);

  useEffect(() => {
    try {
      if (!agentInfo && !isAgentFetching) return;

      if (isAgentFetching) {
        setIsAgencyValidating(true);
        errorToastShownRef.current = false;
        return;
      }

      setIsAgencyValidating(false);

      if (!agentInfo || typeof agentInfo !== "object") {
        setError("agencyNumber", {
          type: "validate",
          message: t("error.invalidAgencyNumber"),
        });
        return;
      }

      if (!agentInfo.Agent || typeof agentInfo.Agent !== "object") {
        setError("localAgent_agencyNumber", {
          type: "validate",
          message: t("error.invalidAgencyNumber"),
        });
        return;
      }

      const hasNoData =
        agentInfo.Agent.ErrorDescription === "SuccessNoData" ||
        (Array.isArray(agentInfo.ErrorDetails) &&
          agentInfo.ErrorDetails.length > 0);

      if (hasNoData) {
        const errorDetailsArr = Array.isArray(agentInfo?.ErrorDetails)
          ? agentInfo!.ErrorDetails!
          : [];

        const errorDesc = errorDetailsArr.find(
          (d) => d.ErrorDesc !== undefined,
        )?.ErrorDesc;

        setError("localAgent_agencyNumber", {
          type: "validate",
          message: errorDesc || t("error.invalidAgencyNumber"),
        });

        [
          "agencyNumber",
          "agentName",
          "agencyStatus",
          "agencySource",
          "Agent_CurrentPlaceOfWork",
          "Agent_ResidencyAddress",
        ].forEach((f) => {
          memoizedSetValue(f as any, "");
          memoizedClearErrors(f);
        });

        return;
      }

      if (agentInfo?.Agent?.ErrorDescription === "Success") {
        memoizedSetValue("agentName", agentInfo?.Agent.AgentName || "");
        memoizedSetValue("agencyStatus", agentInfo?.Agent.MandateStatus || "");
        memoizedSetValue("agencySource", agentInfo?.Agent.MandateSource || "");
        toast.success(t("agencyFound"));

        memoizedClearErrors("localAgent_agencyNumber");
        memoizedClearErrors("agencyNumber");
        errorToastShownRef.current = false;
      }
    } catch (error) {
      setError("localAgent_agencyNumber", {
        type: "validate",
        message: t("error.invalidAgencyNumber"),
      });
      setIsAgencyValidating(false);
    }
  }, [
    agentInfo,
    isAgentFetching,
    memoizedSetValue,
    memoizedSetError,
    memoizedClearErrors,
    t,
  ]);

  useEffect(() => {
    if (
      claimantStatus === "representative" &&
      representativeId &&
      representativeId.length === 10
    ) {
      if (representativeId !== prevRepresentativeIdRef.current) {
        prevRepresentativeIdRef.current = representativeId;

        if (representativeId === userId) {
          toast.error(t("error.cannotUseOwnId"));
          memoizedSetValue("workerAgentIdNumber", "");
          memoizedClearErrors("workerAgentIdNumber");

          const fieldsToClear = [
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
          ];

          fieldsToClear.forEach((field) => {
            memoizedSetValue(field as any, "");
            memoizedClearErrors(field);
          });
        } else if (
          agentType === "local_agency" &&
          allowedIds.length > 0 &&
          !allowedIds.includes(representativeId)
        ) {
          memoizedSetError("idNumber", {
            type: "validate",
            message: t("error.idNotUnderAgency"),
          });
          toast.error(t("error.idNotUnderAgency"));

          const fieldsToClear = [
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
          ];

          fieldsToClear.forEach((field) => {
            memoizedSetValue(field as any, "");
            memoizedClearErrors(field);
          });
        } else {
          if (errors.idNumber) {
            memoizedClearErrors("idNumber");
          }
        }
      }
    }
  }, [
    claimantStatus,
    representativeId,
    allowedIds,
    userId,
    memoizedSetValue,
    memoizedSetError,
    memoizedClearErrors,
    t,
    errors,
    agentType,
  ]);

  const embasyUserData = getCookie("storeAllUserTypeData");
  const embassyUserNationalityCode =
    embasyUserData?.EmbassyInfo?.[0]?.Nationality_Code;
  const watchedNationality = useWatch({ control, name: "nationality" });

  const nationalityToastShownOnceRef = useRef(false);

  useEffect(() => {
    const isPrincipal = claimantStatus === "principal";
    const nicResponse = isPrincipal
      ? principalNICResponse
      : representativeNICResponse;
    const id = isPrincipal ? principalId : representativeId;
    const dob = isPrincipal ? principalDob : representativeDob;

    if (
      !finalNicLoading &&
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
        embassyUserNationalityCode.trim().toUpperCase() !==
          formNationality.trim().toUpperCase();

      if (isMismatch && !nationalityToastShownOnceRef.current) {
        nationalityToastShownOnceRef.current = true;
        toast.error(t("error.nationalityMismatch"));
      }
    }
  }, [
    finalNicLoading,
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

  const { data: est } = useGetEstablishmentDetailsQuery(
    {
      AcceptedLanguage: lang,
      SourceSystem: "E-Services",
      FileNumber: userClaims?.File_Number || skipToken,
    },
    { skip: !userClaims?.File_Number },
  );
  const { data: legalRep } = useGetUserTypeLegalRepQuery(
    {
      IDNumber: userId,
      UserType: userClaims?.UserType,
      AcceptedLanguage: lang,
      SourceSystem: "E-Services",
    },
    { skip: watch("plaintiffStatus") !== "legal_representative" },
  );

  const apiLoadingStates = {
    agent: isAgencyValidating,
    nic: userType?.toLowerCase().includes("embassy user")
      ? finalNicLoading
      : claimantStatus === "principal"
        ? nicLoading
        : nicLoading,
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
        setValue: setValue,
      });
    }
    if (userType?.toLowerCase().includes("legal representative")) {
      return useLegalRepPlaintiffFormLayout(setValue as any);
    }
    if (userType?.toLowerCase().includes("embassy user")) {
      const mapOptions = (data: {
        DataElements?: { ElementKey: string; ElementValue: string }[];
      }) =>
        data?.DataElements?.map(
          (item: { ElementKey: string; ElementValue: string }) => ({
            value: item.ElementKey,
            label: item.ElementValue,
          }),
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
        setError: setError,
        clearErrors: clearErrors,
        isEmbassyPrefillProcessing: isEmbassyPrefillProcessing,
        isEmbassyPrefillFetched: isEmbassyPrefillFetched,
      });
    }

    return useFormLayout({
      control,
      setValue: setValue as any,
      watch: watch as any,
      plaintiffRegionData: regionData?.DataElements,
      plaintiffCityData: cityData?.DataElements,
      occupationData: occupationData?.DataElements,
      genderData: genderData?.DataElements,
      nationalityData: nationalityData?.DataElements,
      agentInfoData: (agentInfo ?? {}) as AgentInfo,
      apiLoadingStates: {
        agent: isAgencyValidating,
        nic: userType?.toLowerCase().includes("embassy user")
          ? finalNicLoading
          : claimantStatus === "principal"
            ? nicLoading
            : nicLoading,
        estab: false,
        incomplete: false,
      },
      userTypeLegalRepData: legalRep,
      onAgencyNumberChange: (value: string) => {
        const clearPlaintiffData = () => {
          if (watch("agentType") === "local_agency") {
            memoizedSetValue("localAgent_userName", "");
            memoizedSetValue("localAgent_region", null);
            memoizedSetValue("localAgent_city", null);
            memoizedSetValue("localAgent_occupation", null);
            memoizedSetValue("localAgent_gender", null);
            memoizedSetValue("localAgent_nationality", null);
            memoizedSetValue("localAgent_applicant", "");
            memoizedSetValue("localAgent_phoneNumber", "");
            memoizedSetValue("localAgent_workerAgentIdNumber", "");
            memoizedSetValue("localAgent_workerAgentDateOfBirthHijri", "");
            memoizedSetValue("localAgent_gregorianDate", "");

            memoizedClearErrors("localAgent_workerAgentIdNumber");
            memoizedClearErrors("localAgent_userName");
            memoizedClearErrors("localAgent_region");
            memoizedClearErrors("localAgent_city");
            memoizedClearErrors("localAgent_occupation");
            memoizedClearErrors("localAgent_gender");
            memoizedClearErrors("localAgent_nationality");
            memoizedClearErrors("localAgent_phoneNumber");
          } else if (watch("agentType") === "external_agency") {
            memoizedSetValue("externalAgent_userName", "");
            memoizedSetValue("externalAgent_region", null);
            memoizedSetValue("externalAgent_city", null);
            memoizedSetValue("externalAgent_occupation", null);
            memoizedSetValue("externalAgent_gender", null);
            memoizedSetValue("externalAgent_nationality", null);
            memoizedSetValue("externalAgent_applicant", "");
            memoizedSetValue("externalAgent_phoneNumber", "");
            memoizedSetValue("externalAgent_workerAgentIdNumber", "");
            memoizedSetValue("externalAgent_workerAgentDateOfBirthHijri", "");
            memoizedSetValue("externalAgent_gregorianDate", "");

            memoizedClearErrors("externalAgent_workerAgentIdNumber");
            memoizedClearErrors("externalAgent_userName");
            memoizedClearErrors("externalAgent_region");
            memoizedClearErrors("externalAgent_city");
            memoizedClearErrors("externalAgent_occupation");
            memoizedClearErrors("externalAgent_gender");
            memoizedClearErrors("externalAgent_nationality");
            memoizedClearErrors("externalAgent_phoneNumber");
          }
        };

        if (
          value.length >= 1 &&
          value.length <= 10 &&
          watch("agentType") === "local_agency"
        ) {
          setIsAgencyValidating(true);

          setError("localAgent_agencyNumber", {
            type: "validate",
            message: t("validatingAgencyNumber"),
          });

          clearPlaintiffData();

          if (!isUninitialized && refetchAttorneyDetails) {
            refetchAttorneyDetails();
          }
        } else {
          setValue("agentName", "");
          setValue("agencyStatus", "");
          setValue("agencySource", "");
          setIsAgencyValidating(false);

          clearPlaintiffData();
        }
      },
      setError: setError,
      clearErrors: clearErrors,

      principalNICResponse,
      principalNICRefetch,
      representativeNICResponse,
      localAgentNICResponse,
      externalAgentNICResponse,
      register,
      errors,
      trigger,
      isValid,

      allowedIds,
      caseData,
    });
  };

  const rightLayout = loadFormLayoutFunction();

  useEffect(() => {
    if (caseData && caseData.PlaintiffType_Code === "Agent") {
      return;
    }

    if (
      externalAgentNICResponse?.NICDetails &&
      agentType === "external_agency"
    ) {
      const d = externalAgentNICResponse.NICDetails;
      memoizedSetValue("externalAgent_userName", d.PlaintiffName || "");
      memoizedSetValue(
        "externalAgent_region",
        d.Region_Code ? { value: d.Region_Code, label: d.Region } : null,
      );
      memoizedSetValue(
        "externalAgent_city",
        d.City_Code ? { value: d.City_Code, label: d.City } : null,
      );
      memoizedSetValue(
        "externalAgent_occupation",
        d.Occupation_Code
          ? { value: d.Occupation_Code, label: d.Occupation }
          : null,
      );
      memoizedSetValue(
        "externalAgent_gender",
        d.Gender_Code ? { value: d.Gender_Code, label: d.Gender } : null,
      );
      memoizedSetValue(
        "externalAgent_nationality",
        d.Nationality_Code
          ? { value: d.Nationality_Code, label: d.Nationality }
          : null,
      );
      memoizedSetValue(
        "externalAgent_phoneNumber",
        d.PhoneNumber ? d.PhoneNumber.toString() : "",
      );
    }
  }, [externalAgentNICResponse, agentType, memoizedSetValue, caseData]);

  useEffect(() => {
    if (
      userType?.toLowerCase().includes("embassy user") &&
      claimantStatus === "representative" &&
      externalAgentNICResponse?.NICDetails
    ) {
      const d = externalAgentNICResponse.NICDetails;
      memoizedSetValue(
        "embassyAgent_city",
        d.City_Code ? { value: d.City_Code, label: d.City } : null,
      );
    }

    if (
      userType?.toLowerCase().includes("embassy user") &&
      claimantStatus === "principal" &&
      externalAgentNICResponse?.NICDetails
    ) {
      const d = externalAgentNICResponse.NICDetails;
      memoizedSetValue(
        "city",
        d.City_Code ? { value: d.City_Code, label: d.City } : null,
      );
    }

    if (isEstablishmentUser && externalAgentNICResponse?.NICDetails) {
      const d = externalAgentNICResponse.NICDetails;
      memoizedSetValue(
        "establishment_city",
        d.City_Code ? { value: d.City_Code, label: d.City } : null,
      );
    }

    if (
      !userType?.toLowerCase().includes("embassy user") &&
      !isEstablishmentUser &&
      claimantStatus === "principal" &&
      externalAgentNICResponse?.NICDetails
    ) {
      const d = externalAgentNICResponse.NICDetails;
      memoizedSetValue(
        "principal_city",
        d.City_Code ? { value: d.City_Code, label: d.City } : null,
      );
    }

    if (
      !userType?.toLowerCase().includes("embassy user") &&
      !isEstablishmentUser &&
      claimantStatus === "representative" &&
      agentType === "local_agency" &&
      externalAgentNICResponse?.NICDetails
    ) {
      const d = externalAgentNICResponse.NICDetails;
      memoizedSetValue(
        "localAgent_city",
        d.City_Code ? { value: d.City_Code, label: d.City } : null,
      );
    }

    if (
      !userType?.toLowerCase().includes("embassy user") &&
      !isEstablishmentUser &&
      claimantStatus === "representative" &&
      agentType === "external_agency" &&
      externalAgentNICResponse?.NICDetails
    ) {
      if (caseData && caseData.PlaintiffType_Code === "Agent") {
        return;
      }
      const d = externalAgentNICResponse.NICDetails;
      memoizedSetValue(
        "externalAgent_city",
        d.City_Code ? { value: d.City_Code, label: d.City } : null,
      );
    }

    if (
      !userType?.toLowerCase().includes("embassy user") &&
      !isEstablishmentUser &&
      claimantStatus !== "principal" &&
      claimantStatus !== "representative" &&
      externalAgentNICResponse?.NICDetails
    ) {
      const d = externalAgentNICResponse.NICDetails;
      memoizedSetValue(
        "plaintiffCity",
        d.City_Code ? { value: d.City_Code, label: d.City } : null,
      );
    }
  }, [
    externalAgentNICResponse,
    agentType,
    memoizedSetValue,
    userType,
    isEstablishmentUser,
    claimantStatus,
    caseData,
  ]);

  useEffect(() => {
    if (localAgentNICResponse?.NICDetails && agentType === "local_agency") {
      const d = localAgentNICResponse.NICDetails;
      memoizedSetValue(
        "localAgent_city",
        d.City_Code ? { value: d.City_Code, label: d.City } : null,
      );
    }
    if (isEstablishmentUser && localAgentNICResponse?.NICDetails) {
      const d = localAgentNICResponse.NICDetails;
      memoizedSetValue(
        "establishment_city",
        d.City_Code ? { value: d.City_Code, label: d.City } : null,
      );
    }
    if (
      !userType?.toLowerCase().includes("embassy user") &&
      !isEstablishmentUser &&
      claimantStatus === "principal" &&
      localAgentNICResponse?.NICDetails
    ) {
      const d = localAgentNICResponse.NICDetails;
      memoizedSetValue(
        "principal_city",
        d.City_Code ? { value: d.City_Code, label: d.City } : null,
      );
    }
    if (
      !userType?.toLowerCase().includes("embassy user") &&
      !isEstablishmentUser &&
      claimantStatus !== "principal" &&
      claimantStatus !== "representative" &&
      localAgentNICResponse?.NICDetails
    ) {
      const d = localAgentNICResponse.NICDetails;
      memoizedSetValue(
        "plaintiffCity",
        d.City_Code ? { value: d.City_Code, label: d.City } : null,
      );
    }
  }, [
    localAgentNICResponse,
    agentType,
    memoizedSetValue,
    userType,
    isEstablishmentUser,
    claimantStatus,
  ]);

  const prevAgencyNumberRef = useRef<string>("");
  const prevExternalAgencyNumberRef = useRef<string>("");
  const prevRepresentativeIdRef = useRef<string>("");

  useEffect(() => {
    const currentAgencyNumber = watch("localAgent_agencyNumber") || "";
    const currentExternalAgencyNumber =
      watch("externalAgent_agencyNumber") || "";

    if (
      agentType === "local_agency" &&
      currentAgencyNumber !== prevAgencyNumberRef.current
    ) {
      prevAgencyNumberRef.current = currentAgencyNumber;

      if (!currentAgencyNumber || currentAgencyNumber.length === 0) {
        memoizedSetValue("localAgent_userName", "");
        memoizedSetValue("localAgent_region", null);
        memoizedSetValue("localAgent_city", null);
        memoizedSetValue("localAgent_occupation", null);
        memoizedSetValue("localAgent_gender", null);
        memoizedSetValue("localAgent_nationality", null);
        memoizedSetValue("localAgent_applicant", "");
        memoizedSetValue("localAgent_phoneNumber", "");
        memoizedSetValue("localAgent_workerAgentIdNumber", "");
        memoizedSetValue("localAgent_workerAgentDateOfBirthHijri", "");
        memoizedSetValue("localAgent_gregorianDate", "");

        memoizedClearErrors("localAgent_workerAgentIdNumber");
        memoizedClearErrors("localAgent_userName");
        memoizedClearErrors("localAgent_region");
        memoizedClearErrors("localAgent_city");
        memoizedClearErrors("localAgent_occupation");
        memoizedClearErrors("localAgent_gender");
        memoizedClearErrors("localAgent_nationality");
        memoizedClearErrors("localAgent_phoneNumber");
      }
    }

    if (
      agentType === "external_agency" &&
      currentExternalAgencyNumber !== prevExternalAgencyNumberRef.current
    ) {
      prevExternalAgencyNumberRef.current = currentExternalAgencyNumber;

      if (
        !currentExternalAgencyNumber ||
        currentExternalAgencyNumber.length === 0
      ) {
        memoizedSetValue("externalAgent_userName", "");
        memoizedSetValue("externalAgent_region", null);
        memoizedSetValue("externalAgent_city", null);
        memoizedSetValue("externalAgent_occupation", null);
        memoizedSetValue("externalAgent_gender", null);
        memoizedSetValue("externalAgent_nationality", null);
        memoizedSetValue("externalAgent_applicant", "");
        memoizedSetValue("externalAgent_phoneNumber", "");
        memoizedSetValue("externalAgent_workerAgentIdNumber", "");
        memoizedSetValue("externalAgent_workerAgentDateOfBirthHijri", "");
        memoizedSetValue("externalAgent_gregorianDate", "");

        memoizedClearErrors("externalAgent_workerAgentIdNumber");
        memoizedClearErrors("externalAgent_userName");
        memoizedClearErrors("externalAgent_region");
        memoizedClearErrors("externalAgent_city");
        memoizedClearErrors("externalAgent_occupation");
        memoizedClearErrors("externalAgent_gender");
        memoizedClearErrors("externalAgent_nationality");
        memoizedClearErrors("externalAgent_phoneNumber");
      }
    }
  }, [agentType, memoizedSetValue, memoizedClearErrors]);

  const previousAgentTypeRef = useRef<string | undefined>();
  useEffect(() => {
    const currentAgentType = watch("agentType");

    if (
      previousAgentTypeRef.current &&
      previousAgentTypeRef.current !== currentAgentType
    ) {
      isClearingFieldsRef.current = true;

      if (previousAgentTypeRef.current === "local_agency") {
        memoizedSetValue("localAgent_workerAgentIdNumber", "");
        memoizedSetValue("localAgent_workerAgentDateOfBirthHijri", "");
        memoizedSetValue("localAgent_gregorianDate", "");
        memoizedSetValue("localAgent_userName", "");
        memoizedSetValue("localAgent_phoneNumber", "");
        memoizedSetValue("localAgent_region", null);
        memoizedSetValue("localAgent_city", null);
        memoizedSetValue("localAgent_occupation", null);
        memoizedSetValue("localAgent_gender", null);
        memoizedSetValue("localAgent_nationality", null);
        memoizedSetValue("localAgent_applicant", "");
        memoizedSetValue("localAgent_agentName", "");
        memoizedSetValue("localAgent_agencyNumber", "");
        memoizedSetValue("localAgent_agencyStatus", "");
        memoizedSetValue("localAgent_agencySource", "");
        memoizedSetValue("localAgent_currentPlaceOfWork", "");
        memoizedSetValue("localAgent_residencyAddress", "");

        memoizedClearErrors("localAgent_workerAgentIdNumber");
        memoizedClearErrors("localAgent_userName");
        memoizedClearErrors("localAgent_region");
        memoizedClearErrors("localAgent_city");
        memoizedClearErrors("localAgent_occupation");
        memoizedClearErrors("localAgent_gender");
        memoizedClearErrors("localAgent_nationality");
        memoizedClearErrors("localAgent_phoneNumber");
        memoizedClearErrors("localAgent_agencyNumber");
      }

      if (previousAgentTypeRef.current === "external_agency") {
        memoizedSetValue("externalAgent_workerAgentIdNumber", "");
        memoizedSetValue("externalAgent_workerAgentDateOfBirthHijri", "");
        memoizedSetValue("externalAgent_gregorianDate", "");
        memoizedSetValue("externalAgent_userName", "");
        memoizedSetValue("externalAgent_phoneNumber", "");
        memoizedSetValue("externalAgent_region", null);
        memoizedSetValue("externalAgent_city", null);
        memoizedSetValue("externalAgent_occupation", null);
        memoizedSetValue("externalAgent_gender", null);
        memoizedSetValue("externalAgent_nationality", null);
        memoizedSetValue("externalAgent_applicant", "");
        memoizedSetValue("externalAgent_agentName", "");
        memoizedSetValue("externalAgent_agencyNumber", "");
        memoizedSetValue("externalAgent_agencyStatus", "");
        memoizedSetValue("externalAgent_agencySource", "");
        memoizedSetValue("externalAgent_currentPlaceOfWork", "");
        memoizedSetValue("externalAgent_residencyAddress", "");
        memoizedSetValue("externalAgent_agentPhoneNumber", "");

        memoizedClearErrors("externalAgent_workerAgentIdNumber");
        memoizedClearErrors("externalAgent_userName");
        memoizedClearErrors("externalAgent_region");
        memoizedClearErrors("externalAgent_city");
        memoizedClearErrors("externalAgent_occupation");
        memoizedClearErrors("externalAgent_gender");
        memoizedClearErrors("externalAgent_nationality");
        memoizedClearErrors("externalAgent_phoneNumber");
        memoizedClearErrors("externalAgent_agencyNumber");
      }
    }

    setTimeout(() => {
      isClearingFieldsRef.current = false;
    }, 100);

    previousAgentTypeRef.current = currentAgentType;
  }, [memoizedSetValue, memoizedClearErrors]);

  const previousClaimantStatusRef = useRef<string | undefined>();
  useEffect(() => {
    const currentClaimantStatus = watch("claimantStatus");

    if (
      previousClaimantStatusRef.current &&
      previousClaimantStatusRef.current !== currentClaimantStatus
    ) {
      if (previousClaimantStatusRef.current === "principal") {
        memoizedSetValue("principal_hijriDate", "");
        memoizedSetValue("principal_gregorianDate", "");
        memoizedSetValue("principal_userName", "");
        memoizedSetValue("principal_phoneNumber", "");
        memoizedSetValue("principal_region", null);
        memoizedSetValue("principal_city", null);
        memoizedSetValue("principal_occupation", null);
        memoizedSetValue("principal_gender", null);
        memoizedSetValue("principal_nationality", null);
      }

      if (previousClaimantStatusRef.current === "representative") {
        memoizedSetValue("workerAgentIdNumber", "");
        memoizedSetValue("workerAgentDateOfBirthHijri", "");
        memoizedSetValue("gregorianDate", "");
        memoizedSetValue("userName", "");
        memoizedSetValue("phoneNumber", "");
        memoizedSetValue("region", null);
        memoizedSetValue("city", null);
        memoizedSetValue("occupation", null);
        memoizedSetValue("gender", null);
        memoizedSetValue("nationality", null);
      }
    }

    previousClaimantStatusRef.current = currentClaimantStatus;
  }, [memoizedSetValue]);

  useEffect(() => {
    if (
      externalAgentNICResponse?.ErrorDetails &&
      agentType === "external_agency"
    ) {
      if (handleNICResponse(externalAgentNICResponse)) {
        return;
      }

      const errorDesc = externalAgentNICResponse.ErrorDetails[0]?.ErrorDesc;
      if (errorDesc) {
        toast.error(errorDesc);

        memoizedSetValue("externalAgent_workerAgentDateOfBirthHijri", "");
        memoizedSetValue("externalAgent_gregorianDate", "");

        memoizedSetValue("externalAgent_userName", "");
        memoizedSetValue("externalAgent_region", null);
        memoizedSetValue("externalAgent_city", null);
        memoizedSetValue("externalAgent_occupation", null);
        memoizedSetValue("externalAgent_gender", null);
        memoizedSetValue("externalAgent_nationality", null);
        memoizedSetValue("externalAgent_phoneNumber", "");
      }
    }
  }, [
    externalAgentNICResponse,
    agentType,
    handleNICResponse,
    memoizedSetValue,
  ]);

  useEffect(() => {
    if (localAgentNICResponse?.ErrorDetails && agentType === "local_agency") {
      if (handleNICResponse(localAgentNICResponse)) {
        return;
      }

      const errorDesc = localAgentNICResponse.ErrorDetails[0]?.ErrorDesc;
      if (errorDesc) {
        toast.error(errorDesc);

        memoizedSetValue("localAgent_workerAgentDateOfBirthHijri", "");
        memoizedSetValue("localAgent_gregorianDate", "");

        memoizedSetValue("localAgent_userName", "");
        memoizedSetValue("localAgent_region", null);
        memoizedSetValue("localAgent_city", null);
        memoizedSetValue("localAgent_occupation", null);
        memoizedSetValue("localAgent_gender", null);
        memoizedSetValue("localAgent_nationality", null);
        memoizedSetValue("localAgent_phoneNumber", "");
      }
    }
  }, [localAgentNICResponse, agentType, handleNICResponse, memoizedSetValue]);

  useEffect(() => {
    if (principalNICResponse?.ErrorDetails && claimantStatus === "principal") {
      if (handleNICResponse(principalNICResponse)) {
        return;
      }

      const errorDesc = principalNICResponse.ErrorDetails[0]?.ErrorDesc;
      if (errorDesc) {
        toast.error(errorDesc);

        memoizedSetValue("principal_hijriDate", "");
        memoizedSetValue("principal_gregorianDate", "");

        memoizedSetValue("principal_userName", "");
        memoizedSetValue("principal_region", null);
        memoizedSetValue("principal_city", null);
        memoizedSetValue("principal_occupation", null);
        memoizedSetValue("principal_gender", null);
        memoizedSetValue("principal_nationality", null);
        memoizedSetValue("principal_phoneNumber", "");
      }
    }
  }, [
    principalNICResponse,
    claimantStatus,
    handleNICResponse,
    memoizedSetValue,
  ]);

  useEffect(() => {
    if (
      representativeNICResponse?.ErrorDetails &&
      claimantStatus === "representative"
    ) {
      if (handleNICResponse(representativeNICResponse)) {
        return;
      }

      const errorDesc = representativeNICResponse.ErrorDetails[0]?.ErrorDesc;
      if (errorDesc) {
        toast.error(errorDesc);

        memoizedSetValue("workerAgentDateOfBirthHijri", "");
        memoizedSetValue("gregorianDate", "");

        memoizedSetValue("userName", "");
        memoizedSetValue("region", null);
        memoizedSetValue("city", null);
        memoizedSetValue("occupation", null);
        memoizedSetValue("gender", null);
        memoizedSetValue("nationality", null);
        memoizedSetValue("phoneNumber", "");
      }
    }
  }, [
    representativeNICResponse,
    claimantStatus,
    handleNICResponse,
    memoizedSetValue,
  ]);

  useEffect(() => {
    if (principalNICResponse?.ErrorDetails && claimantStatus === "principal") {
      memoizedSetValue("principal_city", null);
    }
    if (isEstablishmentUser && principalNICResponse?.ErrorDetails) {
      memoizedSetValue("establishment_city", null);
    }
    if (
      userType?.toLowerCase().includes("embassy user") &&
      claimantStatus === "principal" &&
      principalNICResponse?.ErrorDetails
    ) {
      memoizedSetValue("city", null);
    }
  }, [
    principalNICResponse,
    claimantStatus,
    memoizedSetValue,
    userType,
    isEstablishmentUser,
  ]);

  return (
    <>
      {finalNicLoading && <Loader />}
      {isAgencyValidating && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-25 backdrop-blur-sm z-[9999]">
          <Loader />
        </div>
      )}

      <div
        className={`relative ${
          isAgencyValidating || finalNicLoading ? "pointer-events-none" : ""
        }`}
      >
        <div className={isAgencyValidating || finalNicLoading ? "blur-sm" : ""}>
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
