import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { EmbassyAgentFormProps, NICDetails } from "./types";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { useLazyGetNICDetailsForEmbasyQuery } from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";
import { isHijriDateInFuture } from "@/shared/lib/helpers";
import { useNICServiceErrorContext } from "@/shared/context/NICServiceErrorContext";

export function useEmbassyAgentFormLogic({
  control,
  setValue,
  watch,
  setError,
  clearErrors,
  isEmbassyPrefillProcessing = false,
  isEmbassyPrefillFetched = false,
}: EmbassyAgentFormProps) {
  const { t, i18n } = useTranslation("hearingdetails");
  const [getCookie] = useCookieState();
  const embasyUserData = getCookie("storeAllUserTypeData");
  const claimType = watch("claimantStatus");
  const PlaintiffId = watch("embassyAgent_workerAgentIdNumber");
  const PlaintifDOB = watch("embassyAgent_workerAgentDateOfBirthHijri");
  const [validNationality, setValidNationality] = useState<boolean>(false);
  const [agentData, setAgentData] = useState<NICDetails | null>(null);
  const { handleNICResponse } = useNICServiceErrorContext();

  const clearingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const memoizedSetValue = useCallback(
    (name: string, value: any) => {
      setValue(name, value);
    },
    [setValue],
  );
  const memoizedSetError = useCallback(setError, [setError]);
  const memoizedClearErrors = useCallback(clearErrors, [clearErrors]);

  const debouncedClearFields = useCallback(
    (clearFunction: () => void) => {
      if (clearingTimeoutRef.current) {
        clearTimeout(clearingTimeoutRef.current);
      }

      const delay = isEmbassyPrefillProcessing ? 1000 : 500;

      clearingTimeoutRef.current = setTimeout(() => {
        if (!isEmbassyPrefillProcessing && !isEmbassyPrefillFetched) {
          clearFunction();
        }
      }, delay);
    },
    [isEmbassyPrefillProcessing, isEmbassyPrefillFetched],
  );

  const embassyInfo = useMemo(() => {
    return embasyUserData?.EmbassyInfo?.[0] || null;
  }, [embasyUserData]);

  useEffect(() => {
    if (typeof control?.register === "function") {
      control.register("embassyAgent_workerAgentDateOfBirthHijri");
      control.register("embassyAgent_workerAgentIdNumber");
      control.register("embassyAgent_userName");
      control.register("embassyAgent_region");
      control.register("embassyAgent_city");
      control.register("embassyAgent_phoneNumber");
      control.register("embassyAgent_occupation");
      control.register("embassyAgent_gender");
      control.register("embassyAgent_nationality");
      control.register("embassyAgent_gregorianDate");
      control.register("embassyAgent_Agent_EmbassyName");
      control.register("embassyAgent_Agent_EmbassyNationality");
      control.register("embassyAgent_Agent_EmbassyPhone");
      control.register("embassyAgent_Agent_EmbassyEmailAddress");
      control.register("embassyAgent_Agent_EmbassyFirstLanguage");
      control.register("embassyAgent_Nationality_Code");
    }
  }, [control]);

  useEffect(() => {
    if (claimType === "representative" && embassyInfo) {
      const currentValues = {
        embassyName: watch("embassyAgent_Agent_EmbassyName"),
        embassyNationality: watch("embassyAgent_Agent_EmbassyNationality"),
        embassyPhone: watch("embassyAgent_Agent_EmbassyPhone"),
        embassyFirstLanguage: watch("embassyAgent_Agent_EmbassyFirstLanguage"),
        embassyEmail: watch("embassyAgent_Agent_EmbassyEmailAddress"),
        nationalityCode: watch("embassyAgent_Nationality_Code"),
      };

      if (currentValues.embassyName !== embassyInfo.EmbassyName)
        memoizedSetValue(
          "embassyAgent_Agent_EmbassyName",
          embassyInfo.EmbassyName,
        );
      if (currentValues.embassyNationality !== embassyInfo.EmbassyNationality)
        memoizedSetValue(
          "embassyAgent_Agent_EmbassyNationality",
          embassyInfo.EmbassyNationality,
        );
      if (currentValues.embassyPhone !== embassyInfo.EmbassyPhone)
        memoizedSetValue(
          "embassyAgent_Agent_EmbassyPhone",
          embassyInfo.EmbassyPhone,
        );
      if (
        currentValues.embassyFirstLanguage !== embassyInfo.EmbassyFirstLanguage
      )
        memoizedSetValue(
          "embassyAgent_Agent_EmbassyFirstLanguage",
          embassyInfo.EmbassyFirstLanguage,
        );
      if (currentValues.embassyEmail !== embassyInfo.EmabassyEmail)
        memoizedSetValue(
          "embassyAgent_Agent_EmbassyEmailAddress",
          embassyInfo.EmabassyEmail,
        );
      if (currentValues.nationalityCode !== embassyInfo.Nationality_Code)
        memoizedSetValue(
          "embassyAgent_Nationality_Code",
          embassyInfo.Nationality_Code,
        );
    } else if (claimType === "representative" && !embassyInfo) {
      const storedCaseDetails = localStorage.getItem("EmbassyCaseDetails");
      const hasCaseDetails =
        storedCaseDetails &&
        (() => {
          try {
            const parsed = JSON.parse(storedCaseDetails);
            const caseId = getCookie("caseId");

            const isAgentCase =
              parsed.PlaintiffType === "Agent" ||
              parsed.PlaintiffType_Code === "Agent";
            const hasMatchingCaseId = parsed.CaseID === caseId;
            const result = isAgentCase && (hasMatchingCaseId || !parsed.CaseID);
            return result;
          } catch {
            return false;
          }
        })();

      const phoneNumber = watch("embassyAgent_phoneNumber");
      const userName = watch("embassyAgent_userName");
      const gregorianDate = watch("embassyAgent_gregorianDate");
      const hasPrefilledData = phoneNumber || userName || gregorianDate;

      const isPrefillingInProgress =
        storedCaseDetails && !hasPrefilledData && hasCaseDetails;

      const shouldPreserveFields =
        isEmbassyPrefillProcessing ||
        isEmbassyPrefillFetched ||
        hasCaseDetails ||
        hasPrefilledData ||
        isPrefillingInProgress;

      if (shouldPreserveFields) {
        return;
      }

      const embassyFieldsToClear = [
        "embassyAgent_Agent_EmbassyName",
        "embassyAgent_Agent_EmbassyNationality",
        "embassyAgent_Agent_EmbassyPhone",
        "embassyAgent_Agent_EmbassyFirstLanguage",
        "embassyAgent_Agent_EmbassyEmailAddress",
        "embassyAgent_Nationality_Code",
      ];

      embassyFieldsToClear.forEach((field) => {
        if (watch(field)) memoizedSetValue(field, "");
      });
    }
  }, [
    claimType,
    embassyInfo?.EmbassyName,
    embassyInfo?.EmbassyNationality,
    embassyInfo?.EmbassyPhone,
    embassyInfo?.EmbassyFirstLanguage,
    embassyInfo?.EmabassyEmail,
    embassyInfo?.Nationality_Code,
    memoizedSetValue,
    watch,
    isEmbassyPrefillProcessing,
    isEmbassyPrefillFetched,
  ]);

  const formattedPlaintifDOB = useMemo(() => {
    return PlaintifDOB ? PlaintifDOB.replaceAll("/", "") : "";
  }, [PlaintifDOB]);

  const shouldFetchNic = useMemo(() => {
    const storedCaseDetails = localStorage.getItem("EmbassyCaseDetails");
    const hasCaseDetails =
      storedCaseDetails &&
      (() => {
        try {
          const parsed = JSON.parse(storedCaseDetails);
          const caseId = getCookie("caseId");

          const isAgentCase =
            parsed.PlaintiffType === "Agent" ||
            parsed.PlaintiffType_Code === "Agent";
          const hasMatchingCaseId = parsed.CaseID === caseId;
          const result = isAgentCase && (hasMatchingCaseId || !parsed.CaseID);
          return result;
        } catch {
          return false;
        }
      })();

    if (hasCaseDetails) {
      return false;
    }

    return (
      claimType === "representative" &&
      PlaintiffId?.length === 10 &&
      formattedPlaintifDOB?.length === 8 &&
      !isHijriDateInFuture(formattedPlaintifDOB)
    );
  }, [claimType, PlaintiffId, formattedPlaintifDOB, getCookie]);

  const [
    triggerNicAgent,
    { data: nicAgent, isFetching: nicAgentLoading, isError: nicAgentError },
  ] = useLazyGetNICDetailsForEmbasyQuery();

  const previousCallRef = useRef<{ id: string; dob: string } | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const storedCaseDetails = localStorage.getItem("EmbassyCaseDetails");
    const hasCaseDetails =
      storedCaseDetails &&
      (() => {
        try {
          const parsed = JSON.parse(storedCaseDetails);
          const caseId = getCookie("caseId");

          const isAgentCase =
            parsed.PlaintiffType === "Agent" ||
            parsed.PlaintiffType_Code === "Agent";
          const hasMatchingCaseId = parsed.CaseID === caseId;
          const result = isAgentCase && (hasMatchingCaseId || !parsed.CaseID);

          return result;
        } catch (error) {
          return false;
        }
      })();

    if (hasCaseDetails) {
      return;
    }

    const currentCall = { id: PlaintiffId, dob: formattedPlaintifDOB };

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (
      claimType === "representative" &&
      PlaintiffId?.length === 10 &&
      formattedPlaintifDOB?.length === 8 &&
      !isHijriDateInFuture(formattedPlaintifDOB) &&
      !nicAgentLoading &&
      (!previousCallRef.current ||
        previousCallRef.current.id !== currentCall.id ||
        previousCallRef.current.dob !== currentCall.dob)
    ) {
      debounceTimeoutRef.current = setTimeout(() => {
        previousCallRef.current = currentCall;

        triggerNicAgent({
          IDNumber: PlaintiffId,
          DateOfBirth: formattedPlaintifDOB,
          AcceptedLanguage: i18n.language.toUpperCase(),
          SourceSystem: "E-Services",
        });
      }, 500);
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [
    PlaintiffId,
    formattedPlaintifDOB,
    nicAgentLoading,
    triggerNicAgent,
    i18n.language,
    getCookie,
    claimType,
  ]);

  const previousNicDataRef = useRef<any>(null);

  useEffect(() => {
    const storedCaseDetails = localStorage.getItem("EmbassyCaseDetails");
    const hasCaseDetails =
      storedCaseDetails &&
      (() => {
        try {
          const parsed = JSON.parse(storedCaseDetails);
          const caseId = getCookie("caseId");

          const isAgentCase =
            parsed.PlaintiffType === "Agent" ||
            parsed.PlaintiffType_Code === "Agent";
          const hasMatchingCaseId = parsed.CaseID === caseId;
          const result = isAgentCase && (hasMatchingCaseId || !parsed.CaseID);

          return result;
        } catch (error) {
          return false;
        }
      })();

    if (hasCaseDetails) {
      return;
    }

    if (!shouldFetchNic || nicAgentLoading || !nicAgent) return;
    handleNICResponse(nicAgent);

    if (previousNicDataRef.current === nicAgent) return;

    previousNicDataRef.current = nicAgent;

    if (nicAgentError || (nicAgent && !nicAgent.NICDetails)) {
      let errorMessage = t("error.noNicData");
      if (
        nicAgent &&
        nicAgent.ErrorDetails &&
        Array.isArray(nicAgent.ErrorDetails)
      ) {
        const errorDetail = nicAgent.ErrorDetails.find(
          (detail: any) => detail.ErrorDesc,
        );
        if (errorDetail && errorDetail.ErrorDesc) {
          errorMessage = errorDetail.ErrorDesc;
        }
      }
      memoizedSetError("embassyAgent_workerAgentIdNumber", {
        type: "validate",
        message: errorMessage,
      });

      const storedCaseDetails = localStorage.getItem("EmbassyCaseDetails");
      const hasCaseDetails =
        storedCaseDetails &&
        (() => {
          try {
            const parsed = JSON.parse(storedCaseDetails);

            const caseId = getCookie("caseId");
            return (
              (parsed.PlaintiffType === "Agent" ||
                parsed.PlaintiffType_Code === "Agent") &&
              parsed.CaseID === caseId
            );
          } catch {
            return false;
          }
        })();

      const phoneNumber = watch("embassyAgent_phoneNumber");
      const userName = watch("embassyAgent_userName");
      const gregorianDate = watch("embassyAgent_gregorianDate");
      const hasPrefilledData = phoneNumber || userName || gregorianDate;

      const isPrefillingInProgress =
        storedCaseDetails && !hasPrefilledData && hasCaseDetails;

      const shouldPreserveFields =
        isEmbassyPrefillProcessing ||
        isEmbassyPrefillFetched ||
        hasCaseDetails ||
        hasPrefilledData ||
        isPrefillingInProgress;

      if (shouldPreserveFields) {
        setAgentData(null);
        return;
      }

      const fieldsToConditionallyClear = [
        "embassyAgent_userName",
        "embassyAgent_region",
        "embassyAgent_city",
        "embassyAgent_occupation",
        "embassyAgent_gender",
        "embassyAgent_nationality",
        "embassyAgent_applicant",
      ];

      fieldsToConditionallyClear.forEach((field) => {
        const currentValue = watch(field);

        if (
          currentValue === null ||
          currentValue === undefined ||
          currentValue === ""
        ) {
          memoizedSetValue(field, "");
        } else {
        }
      });

      const nullFieldsToConditionallyClear = [
        "embassyAgent_region",
        "embassyAgent_city",
        "embassyAgent_occupation",
        "embassyAgent_gender",
        "embassyAgent_nationality",
      ];

      nullFieldsToConditionallyClear.forEach((field) => {
        const currentValue = watch(field);

        if (currentValue !== null) {
          memoizedSetValue(field, null);
        } else {
        }
      });
      setAgentData(null);
    } else if (nicAgent && nicAgent.NICDetails) {
      if (
        nicAgent.NICDetails.Nationality_Code !== embassyInfo?.Nationality_Code
      ) {
        setValidNationality(false);
        memoizedSetError("embassyAgent_nationality", {
          message: t("nationality_error"),
        });
        memoizedSetValue("embassyAgent_workerAgentIdNumber", "");
        toast.error(t("nationality_error"));
        setAgentData(null);
        return;
      } else {
        setValidNationality(true);
        memoizedClearErrors("embassyAgent_nationality");
      }

      memoizedClearErrors("embassyAgent_workerAgentIdNumber");
      const d = nicAgent.NICDetails;

      const currentValues = {
        userName: watch("embassyAgent_userName"),
        region: watch("embassyAgent_region"),
        city: watch("embassyAgent_city"),
        occupation: watch("embassyAgent_occupation"),
        gender: watch("embassyAgent_gender"),
        nationality: watch("embassyAgent_nationality"),
        applicant: watch("embassyAgent_applicant"),
        phoneNumber: watch("embassyAgent_phoneNumber"),
      };

      if (currentValues.userName !== d.PlaintiffName) {
        memoizedSetValue("embassyAgent_userName", d.PlaintiffName || "");
      }

      if (
        d.Region_Code &&
        (!currentValues.region || currentValues.region?.value !== d.Region_Code)
      ) {
        memoizedSetValue("embassyAgent_region", {
          value: d.Region_Code,
          label: d.Region || "",
        });
      }

      if (
        d.City_Code &&
        (!currentValues.city || currentValues.city?.value !== d.City_Code)
      ) {
        memoizedSetValue("embassyAgent_city", {
          value: d.City_Code,
          label: d.City || "",
        });
      }

      if (
        d.Occupation_Code &&
        (!currentValues.occupation ||
          currentValues.occupation?.value !== d.Occupation_Code)
      ) {
        memoizedSetValue("embassyAgent_occupation", {
          value: d.Occupation_Code,
          label: d.Occupation || "",
        });
      }

      if (
        d.Gender_Code &&
        (!currentValues.gender || currentValues.gender?.value !== d.Gender_Code)
      ) {
        memoizedSetValue("embassyAgent_gender", {
          value: d.Gender_Code,
          label: d.Gender || "",
        });
      }

      if (
        d.Nationality_Code &&
        (!currentValues.nationality ||
          currentValues.nationality?.value !== d.Nationality_Code)
      ) {
        memoizedSetValue("embassyAgent_nationality", {
          value: d.Nationality_Code,
          label: d.Nationality || "",
        });
      }

      if (currentValues.applicant !== d.Applicant) {
        memoizedSetValue("embassyAgent_applicant", d.Applicant || "");
      }

      if (
        d.PhoneNumber &&
        currentValues.phoneNumber !== d.PhoneNumber.toString()
      ) {
        memoizedSetValue("embassyAgent_phoneNumber", d.PhoneNumber.toString());
      }
    }
  }, [
    shouldFetchNic,
    nicAgentLoading,
    nicAgent?.NICDetails,
    nicAgentError,
    embassyInfo?.Nationality_Code,
    memoizedSetValue,
    memoizedSetError,
    memoizedClearErrors,
    watch,
    t,
    agentData,
    getCookie,
  ]);

  const embassyCode = useMemo(
    () => embassyInfo?.Nationality_Code,
    [embassyInfo],
  );

  const handleNationalityChange = useCallback(
    (value: any) => {
      memoizedSetValue("embassyAgent_nationality", value);

      if (value?.value && embassyCode && value.value !== embassyCode) {
        setValidNationality(false);
        memoizedSetError("embassyAgent_nationality", {
          message: t("nationality_error"),
        });
        toast.error(t("nationality_error"));
      } else {
        setValidNationality(true);
        memoizedClearErrors("embassyAgent_nationality");
      }
    },
    [
      memoizedSetValue,
      embassyCode,
      setValidNationality,
      memoizedSetError,
      memoizedClearErrors,
      t,
    ],
  );

  useEffect(() => {
    const storedCaseDetails = localStorage.getItem("EmbassyCaseDetails");
    const hasCaseDetails =
      storedCaseDetails &&
      (() => {
        try {
          const parsed = JSON.parse(storedCaseDetails);
          const caseId = getCookie("caseId");

          const isAgentCase =
            parsed.PlaintiffType === "Agent" ||
            parsed.PlaintiffType_Code === "Agent";
          const hasMatchingCaseId = parsed.CaseID === caseId;
          const result = isAgentCase && (hasMatchingCaseId || !parsed.CaseID);

          return result;
        } catch (error) {
          return false;
        }
      })();

    if (hasCaseDetails) {
      setAgentData(null);
      return;
    }

    if (
      !nicAgentLoading &&
      nicAgent &&
      nicAgent.NICDetails &&
      validNationality
    ) {
      setAgentData(nicAgent.NICDetails);
    } else {
      setAgentData(null);
    }
  }, [nicAgent, nicAgentLoading, validNationality, getCookie]);

  useEffect(() => {
    const storedCaseDetails = localStorage.getItem("EmbassyCaseDetails");
    const hasCaseDetails =
      storedCaseDetails &&
      (() => {
        try {
          const parsed = JSON.parse(storedCaseDetails);
          const caseId = getCookie("caseId");
          return (
            (parsed.PlaintiffType === "Agent" ||
              parsed.PlaintiffType_Code === "Agent") &&
            parsed.CaseID === caseId
          );
        } catch {
          return false;
        }
      })();

    if (hasCaseDetails) {
      return;
    }

    if (agentData) {
      if (agentData.PlaintiffName) {
        memoizedSetValue(
          "embassyAgent_userName",
          agentData.PlaintiffName || "",
        );
      }

      if (agentData.Region_Code && agentData.Region) {
        memoizedSetValue("embassyAgent_region", {
          value: agentData.Region_Code,
          label: agentData.Region || "",
        });
      }

      if (agentData.City_Code && agentData.City) {
        memoizedSetValue("embassyAgent_city", {
          value: agentData.City_Code,
          label: agentData.City || "",
        });
      }

      if (agentData.Occupation_Code && agentData.Occupation_Code) {
        memoizedSetValue("embassyAgent_occupation", {
          value: agentData.Occupation_Code,
          label: agentData.Occupation || "",
        });
      }

      if (agentData.Gender_Code && agentData.Gender_Code) {
        memoizedSetValue("embassyAgent_gender", {
          value: agentData.Gender_Code,
          label: agentData.Gender || "",
        });
      }

      if (agentData.Nationality_Code && agentData.Nationality_Code) {
        memoizedSetValue("embassyAgent_nationality", {
          value: agentData.Nationality_Code,
          label: agentData.Nationality || "",
        });
      }

      if (agentData.Applicant) {
        memoizedSetValue("embassyAgent_applicant", agentData.Applicant || "");
      }

      if (agentData.PhoneNumber) {
        memoizedSetValue(
          "embassyAgent_phoneNumber",
          agentData.PhoneNumber.toString(),
        );
      } else {
      }
    } else {
      const storedCaseDetails = localStorage.getItem("EmbassyCaseDetails");
      const hasCaseDetails =
        storedCaseDetails &&
        (() => {
          try {
            const parsed = JSON.parse(storedCaseDetails);

            const caseId = getCookie("caseId");
            return (
              (parsed.PlaintiffType === "Agent" ||
                parsed.PlaintiffType_Code === "Agent") &&
              parsed.CaseID === caseId
            );
          } catch {
            return false;
          }
        })();

      const phoneNumber = watch("embassyAgent_phoneNumber");
      const userName = watch("embassyAgent_userName");
      const gregorianDate = watch("embassyAgent_gregorianDate");
      const hasPrefilledData = phoneNumber || userName || gregorianDate;

      const isPrefillingInProgress =
        storedCaseDetails && !hasPrefilledData && hasCaseDetails;

      const shouldPreserveFields =
        isEmbassyPrefillProcessing ||
        isEmbassyPrefillFetched ||
        hasCaseDetails ||
        hasPrefilledData ||
        isPrefillingInProgress;

      if (shouldPreserveFields) {
        return;
      }

      debouncedClearFields(() => {
        const fieldsToConditionallyClear = [
          "embassyAgent_region",
          "embassyAgent_city",
          "embassyAgent_occupation",
          "embassyAgent_gender",
          "embassyAgent_nationality",
          "embassyAgent_applicant",
        ];

        fieldsToConditionallyClear.forEach((field) => {
          const currentValue = watch(field);

          if (
            currentValue === null ||
            currentValue === undefined ||
            currentValue === ""
          ) {
            memoizedSetValue(field, null);
          } else {
          }
        });
      });
    }
  }, [agentData, isEmbassyPrefillProcessing, isEmbassyPrefillFetched]);

  useEffect(() => {
    return () => {
      if (clearingTimeoutRef.current) {
        clearTimeout(clearingTimeoutRef.current);
      }
    };
  }, []);

  return {
    nicAgentLoading,
    validNationality,
    nicAgent: agentData,
    handleNationalityChange,
  };
}
