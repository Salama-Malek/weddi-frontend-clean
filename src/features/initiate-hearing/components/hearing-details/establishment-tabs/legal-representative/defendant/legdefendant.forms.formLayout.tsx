import { SectionLayout } from "@/shared/components/form/form.types";
import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { options } from "@/features/initiate-hearing/config/Options";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  useGetGenderLookupDataQuery,
  useGetNationalityLookupDataQuery,
  useGetNICDetailsQuery,
  useGetOccupationLookupDataQuery,
  useGetWorkerCityLookupDataQuery,
  useGetWorkerRegionLookupDataQuery,
} from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";
import { useNICServiceErrorContext } from "@/shared/context/NICServiceErrorContext";
import { useLazyGetCaseDetailsQuery } from "@/features/manage-hearings/api/myCasesApis";
import { toast } from "react-toastify";
import { formatDateToYYYYMMDD } from "@/shared/utils/dateUtils";
import { toWesternDigits, isHijriDateInFuture } from "@/shared/lib/helpers";
import { HijriDatePickerInput } from "@/shared/components/calanders/HijriDatePickerInput";
import { GregorianDateDisplayInput } from "@/shared/components/calanders/GregorianDateDisplayInput";
import gregorianCalendar from "react-date-object/calendars/gregorian";
import gregorianLocaleEn from "react-date-object/locales/gregorian_en";
import { handleApiErrors } from "@/shared/lib/api/errorHandler";

export const useLegelDefendantFormLayout = ({
  setValue,
  watch,
  control,
}: any): SectionLayout[] => {
  const { t, i18n } = useTranslation("hearingdetails");
  const [getCookie, setCookie] = useCookieState();

  const selectedWorkerRegion2 = watch("region");
  const [isValidCallNic, setIsValidCallNic] = useState<boolean>(false);
  const [hasUserInteracted, setHasUserInteracted] = useState<boolean>(false);
  const watchNationalId = watch?.("nationalIdNumber");
  const watchDateOfBirth = watch?.("def_date_hijri");
  const caseId = getCookie("caseId");
  const userType = getCookie("userType");
  const userClaims = getCookie("userClaims");
  const mainCategory = getCookie("mainCategory")?.value;
  const subCategory = getCookie("subCategory")?.value;

  const [isFormInitialized, setIsFormInitialized] = useState(false);

  const [isPrefilling, setIsPrefilling] = useState(false);
  const [previousDefendantCity, setPreviousDefendantCity] = useState<any>(null);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  const handleTryAgain = React.useCallback(() => {
    setIsValidCallNic(false);
    setTimeout(() => setIsValidCallNic(true), 100);
  }, []);

  const { handleNICResponse, setTryAgainCallback } =
    useNICServiceErrorContext();

  React.useEffect(() => {
    setTryAgainCallback(handleTryAgain);
  }, [setTryAgainCallback, handleTryAgain]);

  const { data: regionData, isLoading: isRegionLoading } =
    useGetWorkerRegionLookupDataQuery({
      AcceptedLanguage: i18n.language === "ar" ? "AR" : "EN",
      SourceSystem: "E-Services",
      ModuleKey: "WorkerRegion",
      ModuleName: "WorkerRegion",
    });

  const { data: cityData, isLoading: isCityLoading } =
    useGetWorkerCityLookupDataQuery(
      {
        AcceptedLanguage: i18n.language === "ar" ? "AR" : "EN",
        SourceSystem: "E-Services",
        selectedWorkerRegion:
          typeof selectedWorkerRegion2 === "object"
            ? selectedWorkerRegion2?.value
            : selectedWorkerRegion2 || "",
        ModuleName: "WorkerCity",
      },
      {
        skip: !(typeof selectedWorkerRegion2 === "object"
          ? selectedWorkerRegion2?.value
          : selectedWorkerRegion2),
      }
    );

  const { data: occupationData } = useGetOccupationLookupDataQuery({
    AcceptedLanguage: i18n.language === "ar" ? "AR" : "EN",
    SourceSystem: "E-Services",
  });

  const { data: genderData } = useGetGenderLookupDataQuery({
    AcceptedLanguage: i18n.language === "ar" ? "AR" : "EN",
    SourceSystem: "E-Services",
  });

  const { data: nationalityData } = useGetNationalityLookupDataQuery({
    AcceptedLanguage: i18n.language === "ar" ? "AR" : "EN",
    SourceSystem: "E-Services",
  });

  const [
    triggerCaseDetailsQuery,
    { data: caseDetailsData, error: caseDetailsError },
  ] = useLazyGetCaseDetailsQuery();

  const {
    data: nicData,
    isFetching: nicIsLoading,
  } = useGetNICDetailsQuery(
    watchNationalId && watchDateOfBirth
      ? {
          IDNumber: watchNationalId,
          DateOfBirth: toWesternDigits(
            formatDateToYYYYMMDD(watchDateOfBirth) || ""
          ),
          AcceptedLanguage: i18n.language === "ar" ? "AR" : "EN",
          SourceSystem: "E-Services",
        }
      : skipToken,
    {
      skip:
        !isValidCallNic ||
        !hasUserInteracted ||
        isHijriDateInFuture(formatDateToYYYYMMDD(watchDateOfBirth) || ""),
    }
  );

 
  const disableNicFields = !isValidCallNic || nicIsLoading;

  useEffect(() => {
    if (
      caseId &&
      userType === "Legal representative" &&
      !isFormInitialized &&
      !hasAttemptedFetch
    ) {
      const userConfigs: any = {
        Worker: {
          UserType: userType,
          IDNumber: userClaims?.UserID,
        },
        Establishment: {
          UserType: userType,
          IDNumber: userClaims?.UserID,
          FileNumber: userClaims?.File_Number,
        },
        "Legal representative": {
          UserType: userType,
          IDNumber: userClaims?.UserID,
          MainGovernment: mainCategory || "",
          SubGovernment: subCategory || "",
        },
      };

      triggerCaseDetailsQuery({
        ...userConfigs[userType],
        CaseID: caseId,
        AcceptedLanguage: userClaims?.AcceptedLanguage?.toUpperCase() || "EN",
        SourceSystem: "E-Services",
      });
      setHasAttemptedFetch(true);
    }
  }, [
    caseId,
    userType,
    userClaims,
    mainCategory,
    subCategory,
    triggerCaseDetailsQuery,
    isFormInitialized,
    hasAttemptedFetch,
  ]);

  useEffect(() => {
    if (caseDetailsError) {
      toast.error(t("error_loading_hearing"));
    }
  }, [caseDetailsError, t]);

  useEffect(() => {
    if (isFormInitialized) return;

    if (caseDetailsData?.CaseDetails) {
      const details = caseDetailsData.CaseDetails;

      if (
        details.DefendantName !== undefined &&
        details.DefendantName !== null &&
        details.DefendantName !== ""
      ) {
        setValue("DefendantsEstablishmentPrisonerName", details.DefendantName);
      }
      if (
        details.Defendant_Region_Code !== undefined &&
        details.Defendant_Region_Code !== null &&
        details.Defendant_Region_Code !== ""
      ) {
        setValue(
          "DefendantsEstablishmentRegion",
          details.Defendant_Region_Code
        );
      }
      if (
        details.Defendant_City_Code !== undefined &&
        details.Defendant_City_Code !== null &&
        details.Defendant_City_Code !== ""
      ) {
        setValue("DefendantsEstablishmentCity", details.Defendant_City_Code);
      }
      if (
        details.Defendant_Occupation_Code !== undefined &&
        details.Defendant_Occupation_Code !== null &&
        details.Defendant_Occupation_Code !== ""
      ) {
        setValue(
          "DefendantsEstablishOccupation",
          details.Defendant_Occupation_Code
        );
      }
      if (
        details.Defendant_Gender_Code !== undefined &&
        details.Defendant_Gender_Code !== null &&
        details.Defendant_Gender_Code !== ""
      ) {
        setValue(
          "DefendantsEstablishmentGender",
          details.Defendant_Gender_Code
        );
      }
      if (
        details.Defendant_Nationality_Code !== undefined &&
        details.Defendant_Nationality_Code !== null &&
        details.Defendant_Nationality_Code !== ""
      ) {
        setValue(
          "DefendantsEstablishmentNationality",
          details.Defendant_Nationality_Code
        );
      }
      if (
        details.DefendantId !== undefined &&
        details.DefendantId !== null &&
        details.DefendantId !== ""
      ) {
        setValue("DefendantsEstablishmentPrisonerId", details.DefendantId);
      }

      const preferredPhone =
        details.Defendant_PhoneNumber && details.Defendant_PhoneNumber !== "0"
          ? details.Defendant_PhoneNumber
          : details.Defendant_MobileNumber &&
            details.Defendant_MobileNumber !== "0"
          ? details.Defendant_MobileNumber
          : "";
      if (preferredPhone) {
        setValue("mobileNumber", preferredPhone);
      }

      if (
        details.DefendantHijiriDOB !== undefined &&
        details.DefendantHijiriDOB !== null &&
        details.DefendantHijiriDOB !== ""
      ) {
        setValue("def_date_hijri", details.DefendantHijiriDOB);
      }
      if (
        details.Defendant_ApplicantBirthDate !== undefined &&
        details.Defendant_ApplicantBirthDate !== null &&
        details.Defendant_ApplicantBirthDate !== ""
      ) {
        const birthDate = details.Defendant_ApplicantBirthDate;
        const compact = `${birthDate.substring(0, 8)}`;
        setValue("def_date_gregorian", compact);
      }

      if (
        details.DefendantId !== undefined &&
        details.DefendantId !== null &&
        details.DefendantId !== ""
      ) {
        setValue("nationalIdNumber", details.DefendantId);
        setCookie("nationalIdNumber", details.DefendantId);
      }

      if (
        (details.Defendant_Region_Code !== undefined &&
          details.Defendant_Region_Code !== null &&
          details.Defendant_Region_Code !== "") ||
        (details.Defendant_Region !== undefined &&
          details.Defendant_Region !== null &&
          details.Defendant_Region !== "")
      ) {
        setValue("region", {
          value: details.Defendant_Region_Code || "",
          label: details.Defendant_Region || "",
        });
      }
      if (
        (details.Defendant_City_Code !== undefined &&
          details.Defendant_City_Code !== null &&
          details.Defendant_City_Code !== "") ||
        (details.Defendant_City !== undefined &&
          details.Defendant_City !== null &&
          details.Defendant_City !== "")
      ) {
        setValue("city", {
          value: details.Defendant_City_Code || "",
          label: details.Defendant_City || "",
        });
      }
      if (
        (details.Defendant_Occupation_Code !== undefined &&
          details.Defendant_Occupation_Code !== null &&
          details.Defendant_Occupation_Code !== "") ||
        (details.Defendant_Occupation !== undefined &&
          details.Defendant_Occupation !== null &&
          details.Defendant_Occupation !== "")
      ) {
        setValue("occupation", {
          value: details.Defendant_Occupation_Code || "",
          label: details.Defendant_Occupation || "",
        });
      }
      if (
        (details.Defendant_Gender_Code !== undefined &&
          details.Defendant_Gender_Code !== null &&
          details.Defendant_Gender_Code !== "") ||
        (details.Defendant_Gender !== undefined &&
          details.Defendant_Gender !== null &&
          details.Defendant_Gender !== "")
      ) {
        setValue("gender", {
          value: details.Defendant_Gender_Code || "",
          label: details.Defendant_Gender || "",
        });
      }
      if (
        (details.Defendant_Nationality_Code !== undefined &&
          details.Defendant_Nationality_Code !== null &&
          details.Defendant_Nationality_Code !== "") ||
        (details.Defendant_Nationality !== undefined &&
          details.Defendant_Nationality !== null &&
          details.Defendant_Nationality !== "")
      ) {
        setValue("nationality", {
          value: details.Defendant_Nationality_Code || "",
          label: details.Defendant_Nationality || "",
        });
      }
      setIsFormInitialized(true);
    }
  }, [
    caseDetailsData,
    nicData,
    setValue,
    watchNationalId,
    isFormInitialized,
    setCookie,
  ]);

  useEffect(() => {
    const hasPrefilledIdAndDob = !!watchNationalId && !!watchDateOfBirth;
    const notFutureDob = !isHijriDateInFuture(
      formatDateToYYYYMMDD(watchDateOfBirth) || ""
    );
    if (!hasUserInteracted && hasPrefilledIdAndDob && notFutureDob) {
      setHasUserInteracted(true);
    }
  }, [
    watchNationalId,
    watchDateOfBirth,
    hasUserInteracted,
    userClaims?.UserID,
  ]);

  useEffect(() => {
    if (nicData && handleNICResponse(nicData)) {
      return;
    }

    if (nicData?.NICDetails) {
      setValue("DefendantsEstablishmentPrisonerId", watchNationalId);

      if (
        nicData?.NICDetails?.PlaintiffName !== undefined &&
        nicData?.NICDetails?.PlaintiffName !== ""
      ) {
        setValue(
          "DefendantsEstablishmentPrisonerName",
          nicData?.NICDetails?.PlaintiffName
        );
      }
      if (
        nicData?.NICDetails?.Region_Code !== undefined &&
        nicData?.NICDetails?.Region_Code !== ""
      ) {
        setValue(
          "DefendantsEstablishmentRegion",
          nicData?.NICDetails?.Region_Code
        );
        setValue("region", {
          value: nicData?.NICDetails?.Region_Code,
          label: nicData?.NICDetails?.Region || "",
        });
      }
      if (
        nicData?.NICDetails?.City_Code !== undefined &&
        nicData?.NICDetails?.City_Code !== ""
      ) {
        setValue("DefendantsEstablishmentCity", nicData?.NICDetails?.City_Code);
        setValue("city", {
          value: nicData?.NICDetails?.City_Code,
          label: nicData?.NICDetails?.City || "",
        });
      }
      if (
        nicData?.NICDetails?.Occupation_Code !== undefined &&
        nicData?.NICDetails?.Occupation_Code !== ""
      ) {
        setValue(
          "DefendantsEstablishOccupation",
          nicData?.NICDetails?.Occupation_Code
        );
        setValue("occupation", {
          value: nicData?.NICDetails?.Occupation_Code,
          label: nicData?.NICDetails?.Occupation || "",
        });
      }
      if (
        nicData?.NICDetails?.Gender_Code !== undefined &&
        nicData?.NICDetails?.Gender_Code !== ""
      ) {
        setValue(
          "DefendantsEstablishmentGender",
          nicData?.NICDetails?.Gender_Code
        );
        setValue("gender", {
          value: nicData?.NICDetails?.Gender_Code,
          label: nicData?.NICDetails?.Gender || "",
        });
      }
      if (
        nicData?.NICDetails?.Nationality_Code !== undefined &&
        nicData?.NICDetails?.Nationality_Code !== ""
      ) {
        setValue(
          "DefendantsEstablishmentNationality",
          nicData?.NICDetails?.Nationality_Code
        );
        setValue("nationality", {
          value: nicData?.NICDetails?.Nationality_Code,
          label: nicData?.NICDetails?.Nationality || "",
        });
      }
      setIsFormInitialized(true);
    }
  }, [nicData, handleNICResponse, watchNationalId]);

  useEffect(() => {
    if (nicData?.ErrorDetails && nicData.ErrorDetails.length > 0) {
      handleApiErrors(nicData, { showToasts: true });
      setIsValidCallNic(false);
      return;
    }
  }, [nicData]);

  useEffect(() => {
    if (!isValidCallNic && !isFormInitialized) {
      [
        "DefendantsEstablishmentPrisonerName",
        "mobileNumber",
        "region",
        "city",
        "occupation",
        "gender",
        "nationality",
        "DefendantsEstablishmentPrisonerId",
      ].forEach((f) => setValue(f as any, ""));
    }
  }, [isValidCallNic, setValue, isFormInitialized]);

  useEffect(() => {
    const isValid = watchNationalId?.length === 10;
    const hasDateOfBirth = !!watchDateOfBirth;
    setIsValidCallNic(isValid && hasDateOfBirth && hasUserInteracted);

    if (isValid && hasDateOfBirth && hasUserInteracted) {
      setCookie("nationalIdNumber", watchNationalId);
    }
  }, [
    watchNationalId,
    watchDateOfBirth,
    hasUserInteracted,
    userClaims?.UserID,
    setCookie,
  ]);

  const RegionOptions = React.useMemo(() => {
    return (
      (regionData &&
        regionData?.DataElements?.map((item: any) => ({
          value: item.ElementKey,
          label: item.ElementValue,
        }))) ||
      []
    );
  }, [regionData]);

  const CityOptions = React.useMemo(() => {
    return (
      (cityData &&
        cityData?.DataElements?.map((item: any) => ({
          value: item.ElementKey,
          label: item.ElementValue,
        }))) ||
      []
    );
  }, [cityData]);

  const defendantCity = watch("city");

  useEffect(() => {
    const details = caseDetailsData?.CaseDetails;
    if (!details) return;

    if (nicData?.NICDetails?.Region || nicData?.NICDetails?.City) return;

    if (
      details.Defendant_Region_Code &&
      (!watch("region") || !watch("region")?.value)
    ) {
      const match = RegionOptions.find(
        (o: any) => `${o.value}` === `${details.Defendant_Region_Code}`
      );
      if (match) {
        setValue("region", match, { shouldValidate: true });
      } else if (details.Defendant_Region || details.Defendant_Region_Code) {
        setValue(
          "region",
          {
            value: details.Defendant_Region_Code || "",
            label: details.Defendant_Region || "",
          },
          { shouldValidate: true }
        );
      }
    }

    if (
      details.Defendant_City_Code &&
      (!watch("city") || !watch("city")?.value)
    ) {
      const matchCity = CityOptions.find(
        (o: any) => `${o.value}` === `${details.Defendant_City_Code}`
      );
      if (matchCity) {
        setValue("city", matchCity, { shouldValidate: true });
      } else if (details.Defendant_City || details.Defendant_City_Code) {
        setValue(
          "city",
          {
            value: details.Defendant_City_Code || "",
            label: details.Defendant_City || "",
          },
          { shouldValidate: true }
        );
      }
    }
  }, [
    caseDetailsData,
    RegionOptions,
    CityOptions,
    nicData?.NICDetails?.Region,
    nicData?.NICDetails?.City,
    setValue,
  ]);

  useEffect(() => {
    const details = caseDetailsData?.CaseDetails;
    const currentRegionValue =
      typeof selectedWorkerRegion2 === "object"
        ? selectedWorkerRegion2?.value
        : selectedWorkerRegion2;
    if (!details || !currentRegionValue) return;
    if (nicData?.NICDetails?.City) return;
    if (!details.Defendant_City_Code) return;
    const currentCity = watch("city");
    if (currentCity && currentCity.value) return;
    if (!CityOptions || CityOptions.length === 0) return;

    const matchCity = CityOptions.find(
      (o: any) => `${o.value}` === `${details.Defendant_City_Code}`
    );
    if (matchCity) {
      setValue("city", matchCity, { shouldValidate: true });
    } else if (details.Defendant_City || details.Defendant_City_Code) {
      setValue(
        "city",
        {
          value: details.Defendant_City_Code || "",
          label: details.Defendant_City || "",
        },
        { shouldValidate: true }
      );
    }
  }, [
    selectedWorkerRegion2,
    CityOptions,
    caseDetailsData,
    nicData?.NICDetails?.City,
    setValue,
  ]);

  useEffect(() => {
    if (isPrefilling || !previousDefendantCity) {
      setPreviousDefendantCity(defendantCity);
      return;
    }

    if (!defendantCity && !previousDefendantCity) {
      return;
    }

    if (
      JSON.stringify(defendantCity) === JSON.stringify(previousDefendantCity)
    ) {
      return;
    }

    if (nicData?.NICDetails?.City) {
      setPreviousDefendantCity(defendantCity);
      return;
    }

    if (defendantCity !== previousDefendantCity && isFormInitialized) {
    

      setValue("region", null, { shouldValidate: true });
    }

    setPreviousDefendantCity(defendantCity);
  }, [
    defendantCity,
    isPrefilling,
    nicData?.NICDetails?.City,
    isFormInitialized,
  ]);

  useEffect(() => {
    if (!isFormInitialized) {
      setIsPrefilling(true);
    } else {
      const timer = setTimeout(() => {
        setIsPrefilling(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isFormInitialized]);

  const occupationOptions = React.useMemo(() => {
    return (
      (occupationData &&
        occupationData?.DataElements?.map((item: any) => ({
          value: item.ElementKey,
          label: item.ElementValue,
        }))) ||
      options
    );
  }, [occupationData]);

  const genderOptions = React.useMemo(() => {
    return (
      (genderData &&
        genderData?.DataElements?.map((item: any) => ({
          value: item.ElementKey,
          label: item.ElementValue,
        }))) ||
      options
    );
  }, [genderData]);

  const nationalityOptions = React.useMemo(() => {
    return (
      (nationalityData &&
        nationalityData?.DataElements?.map((item: any) => ({
          value: item.ElementKey,
          label: item.ElementValue,
        }))) ||
      options
    );
  }, [nationalityData]);

  return [
    {
      title: t("tab2_title"),
      children: [
        {
          type: "input",
          name: "nationalIdNumber",
          label: t("nicDetails.national_id_number"),
          inputType: "text",
          placeholder: "10xxxxxxxx",
          maxLength: 10,
          validation: {
            required: hasUserInteracted ? t("nationalIdValidation") : false,
            validate: (value) =>
              !hasUserInteracted ||
              value?.length === 10 ||
              t("max10Validation"),
          },
          onFocus: () => setHasUserInteracted(true),
          onChange: () => setHasUserInteracted(true),
        },

        {
          type: "custom" as const,
          name: "establishmentDefendantDateBirth",
          component: (
            <div className="flex flex-col gap-2">
              <HijriDatePickerInput
                control={control}
                name={"def_date_hijri" as any}
                label={t("establishment_tab2.dobHijri")}
                rules={{
                  required: hasUserInteracted
                    ? t("dateOfBirthValidation")
                    : false,
                }}
                notRequired={false}
                isDateOfBirth={true}
                onChangeHandler={(
                  date: any,
                ) => {
                  setHasUserInteracted(true);
                  if (date && !Array.isArray(date)) {
                    const gregorianDate = date.convert(
                      gregorianCalendar,
                      gregorianLocaleEn
                    );
                    const gregorian = gregorianDate.format("YYYYMMDD");
                    setValue("def_date_gregorian" as any, gregorian);
                  } else {
                    setValue("def_date_gregorian" as any, "");
                  }
                }}
              />
              <GregorianDateDisplayInput
                control={control}
                name={"def_date_gregorian" as any}
                label={t("establishment_tab2.dobGrog")}
              />
            </div>
          ),
        },
        {
          type: !nicData?.NICDetails?.PlaintiffName ? "input" : "readonly",
          label: t("establishment_tab2.name"),
          value: nicData?.NICDetails?.PlaintiffName,
          isLoading: nicIsLoading,
          name: "DefendantsEstablishmentPrisonerName",
          ...(nicData?.NICDetails?.PlaintiffName && {
            inputType: "text",
          }),
          ...(!nicData?.NICDetails?.PlaintiffName && {
            validation: {
              required: hasUserInteracted
                ? t("defendantNameValidation")
                : false,
            },
          }),
          disabled: disableNicFields,
          onFocus: () => setHasUserInteracted(true),
          onChange: () => setHasUserInteracted(true),
        },
        {
          type: "input",
          name: "mobileNumber",
          label: t("establishment_tab2.mobileNumber"),
          inputType: "text",
          placeholder: "05xxxxxxxx",
          validation: {
            required: hasUserInteracted ? t("phoneNumberValidation") : false,
            pattern: hasUserInteracted
              ? {
                  value: /^05\d{8}$/,
                  message: t("phoneNumberValidationٍstartWith"),
                }
              : undefined,
          },
          disabled: disableNicFields,
          onFocus: () => setHasUserInteracted(true),
          onChange: () => setHasUserInteracted(true),
        },
        {
          type: nicData?.NICDetails?.Region ? "readonly" : "autocomplete",
          name: "region",
          isLoading: isRegionLoading,
          label: t("region"),
          value: nicData?.NICDetails?.Region || "",
          ...(nicData?.NICDetails?.Region
            ? {}
            : {
                options: RegionOptions || [],
                validation: {
                  required: hasUserInteracted ? t("regionValidation") : false,
                },
              }),
          disabled: disableNicFields,
          onChange: () => setHasUserInteracted(true),
        },
        {
          type: nicData?.NICDetails?.City ? "readonly" : "autocomplete",
          name: "city",
          isLoading: isCityLoading,
          label: t("city"),
          value: nicData?.NICDetails?.City || "",
          ...(nicData?.NICDetails?.City
            ? {}
            : {
                options: CityOptions || [],
                validation: {
                  required: hasUserInteracted ? t("cityValidation") : false,
                },
              }),
          disabled: disableNicFields,
          onChange: () => setHasUserInteracted(true),
        },
        {
          isLoading: nicIsLoading,
          type: nicData?.NICDetails?.Occupation ? "readonly" : "autocomplete",
          name: "occupation",
          label: t("occupation"),
          value: nicData?.NICDetails?.Occupation || "",
          ...(nicData?.NICDetails?.Occupation
            ? {}
            : {
                options: occupationOptions || [],
                validation: {
                  required: hasUserInteracted
                    ? t("occupationValidation")
                    : false,
                },
              }),
          disabled: disableNicFields,
          onChange: () => setHasUserInteracted(true),
        },
        {
          isLoading: nicIsLoading,
          type: nicData?.NICDetails?.Gender ? "readonly" : "autocomplete",
          name: "gender",
          label: t("gender"),
          value: nicData?.NICDetails?.Gender || "",
          ...(nicData?.NICDetails?.Gender
            ? {}
            : {
                options: genderOptions || [],
                validation: {
                  required: hasUserInteracted ? t("genderValidation") : false,
                },
              }),
          disabled: disableNicFields,
          onChange: () => setHasUserInteracted(true),
        },
        {
          isLoading: nicIsLoading,
          type: nicData?.NICDetails?.Nationality ? "readonly" : "autocomplete",
          name: "nationality",
          label: t("nationality"),
          value: nicData?.NICDetails?.Nationality || "",
          ...(nicData?.NICDetails?.Nationality
            ? {}
            : {
                options: nationalityOptions || [],
                validation: {
                  required: hasUserInteracted
                    ? t("nationalityValidation")
                    : false,
                },
              }),
          disabled: disableNicFields,
          onChange: () => setHasUserInteracted(true),
        },
      ],
    },
  ] as SectionLayout[];
};
