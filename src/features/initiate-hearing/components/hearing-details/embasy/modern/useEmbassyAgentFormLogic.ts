import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { EmbassyAgentFormProps, EmbassyUserInfo, NICDetails } from "./types";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { useLazyGetNICDetailsForEmbasyQuery } from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";

export function useEmbassyAgentFormLogic({
  control,
  setValue,
  watch,
  setError,
  clearErrors,
}: EmbassyAgentFormProps) {
  const { t, i18n } = useTranslation("hearingdetails");
  const [getCookie] = useCookieState();
  const embasyUserData = getCookie("storeAllUserTypeData");
  const claimType = watch("claimantStatus");
  const PlaintiffId = watch("embassyAgent_workerAgentIdNumber");
  const PlaintifDOB = watch("embassyAgent_workerAgentDateOfBirthHijri");
  const nationality = watch("embassyAgent_nationality");
  const [validNationality, setValidNationality] = useState<boolean>(false);

  // Register fields for React Hook Form tracking
  useEffect(() => {
    if (typeof control?.register === "function") {
      control.register("embassyAgent_workerAgentDateOfBirthHijri");
      control.register("embassyAgent_workerAgentIdNumber");
    }
  }, [control]);

  // Embassy info population (safe, no infinite loop)
  useEffect(() => {
    if (claimType === "representative") {
      if (embasyUserData && embasyUserData?.EmbassyInfo?.length > 0) {
        const info = embasyUserData.EmbassyInfo[0];
        if (watch("embassyAgent_Agent_EmbassyName") !== info.EmbassyName)
          setValue("embassyAgent_Agent_EmbassyName", info.EmbassyName);
        if (watch("embassyAgent_Agent_EmbassyNationality") !== info.EmbassyNationality)
          setValue("embassyAgent_Agent_EmbassyNationality", info.EmbassyNationality);
        if (watch("embassyAgent_Agent_EmbassyPhone") !== info.EmbassyPhone)
          setValue("embassyAgent_Agent_EmbassyPhone", info.EmbassyPhone);
        if (watch("embassyAgent_Agent_EmbassyFirstLanguage") !== info.EmbassyFirstLanguage)
          setValue("embassyAgent_Agent_EmbassyFirstLanguage", info.EmbassyFirstLanguage);
        if (watch("embassyAgent_Agent_EmbassyEmailAddress") !== info.EmabassyEmail)
          setValue("embassyAgent_Agent_EmbassyEmailAddress", info.EmabassyEmail);
        if (watch("embassyAgent_Nationality_Code") !== info.Nationality_Code)
          setValue("embassyAgent_Nationality_Code", info.Nationality_Code);
      } else {
        [
          "embassyAgent_Agent_EmbassyName",
          "embassyAgent_Agent_EmbassyNationality",
          "embassyAgent_Agent_EmbassyPhone",
          "embassyAgent_Agent_EmbassyFirstLanguage",
          "embassyAgent_Agent_EmbassyEmailAddress",
          "embassyAgent_Nationality_Code",
        ].forEach((f) => {
          if (watch(f)) setValue(f, "");
        });
      }
      // Only clear non-ID, non-DOB fields if not already empty/null
      [
        "embassyAgent_userName",
        "embassyAgent_region",
        "embassyAgent_city",
        "embassyAgent_occupation",
        "embassyAgent_gender",
        "embassyAgent_nationality",
        "embassyAgent_applicant",
      ].forEach((f) => {
        if (watch(f)) setValue(f, "");
      });
      [
        "embassyAgent_region",
        "embassyAgent_city",
        "embassyAgent_occupation",
        "embassyAgent_gender",
        "embassyAgent_nationality",
      ].forEach((f) => {
        if (watch(f) !== null) setValue(f, null);
      });
    }
    // Do NOT clear or set claimantStatus here!
  }, [claimType, embasyUserData, setValue, watch]);

  // NIC fetch logic
  const formattedPlaintifDOB = PlaintifDOB ? PlaintifDOB.replaceAll("/", "") : "";
  const shouldFetchNic =
    claimType === "representative" &&
    PlaintiffId?.length === 10 &&
    formattedPlaintifDOB?.length === 8;

  const [triggerNicAgent, { data: nicAgent, isFetching: nicAgentLoading, isError: nicAgentError }] = useLazyGetNICDetailsForEmbasyQuery();

  useEffect(() => {
    if (shouldFetchNic) {
      triggerNicAgent({
        IDNumber: PlaintiffId,
        DateOfBirth: formattedPlaintifDOB || "",
        AcceptedLanguage: i18n.language.toUpperCase(),
        SourceSystem: "E-Services",
      });
    }
  }, [shouldFetchNic, PlaintiffId, formattedPlaintifDOB, i18n.language, triggerNicAgent]);

  // Only clear errors when shouldFetchNic becomes false
  useEffect(() => {
    if (!shouldFetchNic) {
      clearErrors("embassyAgent_workerAgentIdNumber");
    }
  }, [shouldFetchNic, clearErrors]);

  // Handle NIC response
  const nationalityErrorToastShownRef = useRef(false);
  
  useEffect(() => {
    if (!shouldFetchNic || nicAgentLoading) return;
    if (nicAgentError || (nicAgent && !nicAgent.NICDetails)) {
      let errorMessage = t("error.noNicData");
      if (nicAgent && nicAgent.ErrorDetails && Array.isArray(nicAgent.ErrorDetails)) {
        const errorDetail = nicAgent.ErrorDetails.find((detail: any) => detail.ErrorDesc);
        if (errorDetail && errorDetail.ErrorDesc) {
          errorMessage = errorDetail.ErrorDesc;
        }
      }
      toast.error(errorMessage);
      setError("embassyAgent_workerAgentIdNumber", { type: "validate", message: errorMessage });
      // Only clear non-ID, non-DOB fields
      [
        "embassyAgent_userName",
        "embassyAgent_region",
        "embassyAgent_city",
        "embassyAgent_occupation",
        "embassyAgent_gender",
        "embassyAgent_nationality",
        "embassyAgent_applicant",
      ].forEach((f) => {
        setValue(f, "");
      });
      [
        "embassyAgent_region",
        "embassyAgent_city",
        "embassyAgent_occupation",
        "embassyAgent_gender",
        "embassyAgent_nationality",
      ].forEach((f) => {
        setValue(f, null);
      });
    } else if (nicAgent && nicAgent.NICDetails) {
      // Embassy-specific nationality validation
      if (
        nicAgent.NICDetails.Nationality_Code !==
        embasyUserData?.EmbassyInfo?.[0]?.Nationality_Code
      ) {
        setValidNationality(false);
        setError("embassyAgent_nationality", { message: t("nationality_error") });
        setValue("embassyAgent_workerAgentIdNumber", "");
        toast.error(t("nationality_error"));
        return;
      } else {
        setValidNationality(true);
        clearErrors("embassyAgent_nationality");
      }
      clearErrors("embassyAgent_workerAgentIdNumber");
      const d = nicAgent.NICDetails;
      if (watch("embassyAgent_userName") !== d.PlaintiffName)
        setValue("embassyAgent_userName", d.PlaintiffName || "");
      if (d.Region_Code && (!watch("embassyAgent_region") || watch("embassyAgent_region")?.value !== d.Region_Code))
        setValue("embassyAgent_region", { value: d.Region_Code, label: d.Region || "" });
      if (d.City_Code && (!watch("embassyAgent_city") || watch("embassyAgent_city")?.value !== d.City_Code))
        setValue("embassyAgent_city", { value: d.City_Code, label: d.City || "" });
      if (d.Occupation_Code && (!watch("embassyAgent_occupation") || watch("embassyAgent_occupation")?.value !== d.Occupation_Code))
        setValue("embassyAgent_occupation", { value: d.Occupation_Code, label: d.Occupation || "" });
      if (d.Gender_Code && (!watch("embassyAgent_gender") || watch("embassyAgent_gender")?.value !== d.Gender_Code))
        setValue("embassyAgent_gender", { value: d.Gender_Code, label: d.Gender || "" });
      if (d.Nationality_Code && (!watch("embassyAgent_nationality") || watch("embassyAgent_nationality")?.value !== d.Nationality_Code))
        setValue("embassyAgent_nationality", { value: d.Nationality_Code, label: d.Nationality || "" });
      if (watch("embassyAgent_applicant") !== d.Applicant)
        setValue("embassyAgent_applicant", d.Applicant || "");
      if (d.PhoneNumber && watch("embassyAgent_phoneNumber") !== d.PhoneNumber.toString())
        setValue("embassyAgent_phoneNumber", d.PhoneNumber.toString());
    }
  }, [shouldFetchNic, nicAgentLoading, nicAgent, nicAgentError, setValue, setError, t, embasyUserData, clearErrors]);

  const embassyCode = embasyUserData?.EmbassyInfo?.[0]?.Nationality_Code;

  const handleNationalityChange = (selected: any) => {
    if (selected?.value !== embassyCode) {
      setError("embassyAgent_nationality", { message: t("nationality_error") });
      if (!nationalityErrorToastShownRef.current) {
        toast.error(t("nationality_error"));
        nationalityErrorToastShownRef.current = true;
      }
    } else {
      clearErrors("embassyAgent_nationality");
      setValue("embassyAgent_nationality", selected);
      nationalityErrorToastShownRef.current = false;
    }
  };

  return {
    nicAgentLoading,
    validNationality,
    nicAgent,
    handleNationalityChange,
  };
} 