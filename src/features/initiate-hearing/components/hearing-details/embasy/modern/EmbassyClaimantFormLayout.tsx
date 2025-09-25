import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useFormOptions } from "../../tabs/claimant/claimant.forms.formOptions";
import { SectionLayout } from "@/shared/components/form/form.types";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { TokenClaims } from "@/features/login/components/AuthProvider";
import OTPFormLayout from "../../tabs/claimant/OTP.froms.formlayout";
import { EmbassyAgentFormLayout } from "./EmbassyAgentFormLayout";

import { useGetNICDetailsQuery } from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";
import { formatDateToYYYYMMDD } from "@/shared/lib/helpers";
import { HijriDatePickerInput } from "@/shared/components/calanders/HijriDatePickerInput";
import { GregorianDateDisplayInput } from "@/shared/components/calanders/GregorianDateDisplayInput";
import gregorianCalendar from "react-date-object/calendars/gregorian";
import gregorianLocaleEn from "react-date-object/locales/gregorian_en";

interface EmbassyClaimantFormProps {
  control: any;
  setValue: any;
  watch: any;
  RegionOptions: any;
  CityOptions: any;
  OccupationOptions: any;
  GenderOptions: any;
  NationalityOptions: any;
  setError: (name: string, error: any) => void;
  clearErrors: (name: string) => void;
}

export function EmbassyClaimantFormLayout({
  control,
  setValue,
  watch,
  RegionOptions,
  CityOptions,
  OccupationOptions,
  GenderOptions,
  NationalityOptions,
  setError,
  clearErrors,
  isEmbassyPrefillProcessing = false,
  isEmbassyPrefillFetched = false,
}: EmbassyClaimantFormProps & {
  isEmbassyPrefillProcessing?: boolean;
  isEmbassyPrefillFetched?: boolean;
}): SectionLayout[] {
  const { ClaimantStatusRadioOptions } = useFormOptions();
  const { t } = useTranslation("hearingdetails");
  const claimType = watch("claimantStatus");

  const memoizedSetValue = useCallback(setValue, [setValue]);

  useEffect(() => {
    const basicFieldsToClear = [
      "userName",
      "hijriDate",
      "gregorianDate",
      "applicant",
      "phoneNumber",
    ];

    basicFieldsToClear.forEach((f) => {
      memoizedSetValue(f, "");
    });

    const embassyFieldsToCheck = [
      "embassyPrincipal_userName",
      "embassyPrincipal_hijriDate",
      "embassyPrincipal_gregorianDate",
      "embassyPrincipal_phoneNumber",
      "embassyAgent_userName",
      "embassyAgent_phoneNumber",
      "embassyAgent_hijriDate",
      "embassyAgent_gregorianDate",
    ];

    embassyFieldsToCheck.forEach((f) => {
      const currentValue = watch(f);
      if (!currentValue || currentValue === "") {
        memoizedSetValue(f, "");
      }
    });

    const dropdownFieldsToCheck = [
      "region",
      "city",
      "occupation",
      "gender",
      "nationality",
      "embassyPrincipal_region",
      "embassyPrincipal_city",
      "embassyPrincipal_occupation",
      "embassyPrincipal_gender",
      "embassyPrincipal_nationality",
      "embassyAgent_region",
      "embassyAgent_city",
      "embassyAgent_occupation",
      "embassyAgent_gender",
      "embassyAgent_nationality",
    ];

    dropdownFieldsToCheck.forEach((f) => {
      const currentValue = watch(f);
      if (!currentValue || currentValue === "") {
        memoizedSetValue(f, null);
      }
    });
  }, [claimType, memoizedSetValue, watch]);

  useEffect(() => {
    if (claimType === "representative") {
      const storedCaseDetails = localStorage.getItem("EmbassyCaseDetails");
      if (storedCaseDetails) {
        try {
          const caseDetails = JSON.parse(storedCaseDetails);
          if (
            caseDetails.PlaintiffType === "Agent" ||
            caseDetails.PlaintiffType_Code === "Agent"
          ) {
            const agentFieldsToPreserve = [
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

            agentFieldsToPreserve.forEach((field) => {
              const currentValue = watch(field);
              if (
                currentValue &&
                currentValue !== "" &&
                currentValue !== null
              ) {
              }
            });
          }
        } catch (error) {}
      }
    }
  }, [claimType, watch]);

  const [getCookie] = useCookieState();
  const userClaims: TokenClaims = getCookie("userClaims");
  const idNumber = userClaims?.UserID;

  const createPrincipalLayout = (): SectionLayout[] => {
    const sections: SectionLayout[] = [];

    if (claimType === "principal") {
      const nic = principalNicData?.NICDetails;

      sections.push({
        title: t("nicDetails.plaintiffData"),
        className: "nic-details-section",
        gridCols: 3,
        children: [
          {
            type: "readonly" as const,
            label: t("nicDetails.idNumber"),
            value: idNumber || "",
          },

          ...(nic?.PlaintiffName
            ? [
                {
                  type: "readonly" as const,
                  label: t("nicDetails.name"),
                  value: nic.PlaintiffName,
                },
              ]
            : [
                {
                  type: "input" as const,
                  name: "embassyPrincipal_userName",
                  label: t("nicDetails.name"),
                  value: watch("embassyPrincipal_userName") || "",
                  onChange: (value: string) =>
                    setValue("embassyPrincipal_userName", value),
                  inputType: "text",
                  validation: { required: t("nameValidation") },
                },
              ]),

          ...(nic?.Region
            ? [
                {
                  type: "readonly" as const,
                  label: t("nicDetails.region"),
                  value: nic.Region,
                },
              ]
            : [
                {
                  type: "autocomplete" as const,
                  name: "embassyPrincipal_region",
                  label: t("nicDetails.region"),
                  value: watch("embassyPrincipal_region"),
                  options: RegionOptions,
                  onChange: (value: any) => {
                    setValue("embassyPrincipal_region", value);
                    setValue("embassyPrincipal_city", null);
                  },
                  validation: {
                    required: true,
                    validate: (value: any) => {
                      if (
                        !value ||
                        (typeof value === "object" && !value.value)
                      ) {
                        return t("regionValidation");
                      }
                      return true;
                    },
                  },
                },
              ]),

          ...(nic?.City
            ? [
                {
                  type: "readonly" as const,
                  label: t("nicDetails.city"),
                  value: nic.City,
                },
              ]
            : [
                {
                  type: "autocomplete" as const,
                  name: "embassyPrincipal_city",
                  label: t("nicDetails.city"),
                  value: watch("embassyPrincipal_city"),
                  options: CityOptions,
                  onChange: (value: any) =>
                    setValue("embassyPrincipal_city", value),
                  validation: {
                    required: true,
                    validate: (value: any) => {
                      if (
                        !value ||
                        (typeof value === "object" && !value.value)
                      ) {
                        return t("cityValidation");
                      }
                      return true;
                    },
                  },
                },
              ]),

          ...(nic?.DateOfBirthHijri
            ? [
                {
                  type: "readonly" as const,
                  label: t("nicDetails.dobHijri"),
                  value: nic.DateOfBirthHijri,
                },
              ]
            : [
                {
                  type: "custom" as const,
                  name: "embassyPrincipal_dateOfBirth",
                  component: (
                    <div className="flex flex-col gap-2">
                      <HijriDatePickerInput
                        control={control}
                        name={"embassyPrincipal_hijriDate" as any}
                        label={t("nicDetails.dobHijri")}
                        rules={{ required: t("dateValidation") }}
                        notRequired={false}
                        isDateOfBirth={true}
                        onChangeHandler={(date: any) => {
                          if (date && !Array.isArray(date)) {
                            const gregorianDate = date.convert(
                              gregorianCalendar,
                              gregorianLocaleEn,
                            );
                            const gregorian = gregorianDate.format("YYYYMMDD");
                            setValue(
                              "embassyPrincipal_gregorianDate",
                              gregorian,
                            );
                          }
                        }}
                      />
                      <GregorianDateDisplayInput
                        control={control}
                        name={"embassyPrincipal_gregorianDate" as any}
                        label={t("nicDetails.dobGrog")}
                      />
                    </div>
                  ),
                },
              ]),

          ...(nic?.PhoneNumber
            ? [
                {
                  type: "readonly" as const,
                  label: t("nicDetails.phoneNumber"),
                  value: nic.PhoneNumber,
                },
              ]
            : [
                {
                  type: "input" as const,
                  name: "embassyPrincipal_phoneNumber",
                  label: t("nicDetails.phoneNumber"),
                  value: watch("embassyPrincipal_phoneNumber") || "",
                  onChange: (value: string) =>
                    setValue("embassyPrincipal_phoneNumber", value),
                  inputType: "text",
                  placeholder: "05xxxxxxxx",
                  validation: {
                    required: t("phoneNumberValidation"),
                    pattern: {
                      value: /^05\d{8}$/,
                      message: t("phoneNumberValidationٍstartWith"),
                    },
                  },
                },
              ]),

          ...(nic?.Occupation
            ? [
                {
                  type: "readonly" as const,
                  label: t("nicDetails.occupation"),
                  value: nic.Occupation,
                },
              ]
            : [
                {
                  type: "autocomplete" as const,
                  name: "embassyPrincipal_occupation",
                  label: t("nicDetails.occupation"),
                  value: watch("embassyPrincipal_occupation"),
                  options: OccupationOptions,
                  onChange: (value: any) =>
                    setValue("embassyPrincipal_occupation", value),
                  validation: {
                    required: true,
                    validate: (value: any) => {
                      if (
                        !value ||
                        (typeof value === "object" && !value.value)
                      ) {
                        return t("occupationValidation");
                      }
                      return true;
                    },
                  },
                },
              ]),

          ...(nic?.Gender
            ? [
                {
                  type: "readonly" as const,
                  label: t("nicDetails.gender"),
                  value: nic.Gender,
                },
              ]
            : [
                {
                  type: "autocomplete" as const,
                  name: "embassyPrincipal_gender",
                  label: t("nicDetails.gender"),
                  value: watch("embassyPrincipal_gender"),
                  options: GenderOptions,
                  onChange: (value: any) =>
                    setValue("embassyPrincipal_gender", value),
                  validation: {
                    required: true,
                    validate: (value: any) => {
                      if (
                        !value ||
                        (typeof value === "object" && !value.value)
                      ) {
                        return t("genderValidation");
                      }
                      return true;
                    },
                  },
                },
              ]),

          ...(nic?.Nationality
            ? [
                {
                  type: "readonly" as const,
                  label: t("nicDetails.nationality"),
                  value: nic.Nationality,
                },
              ]
            : [
                {
                  type: "autocomplete" as const,
                  name: "embassyPrincipal_nationality",
                  label: t("nicDetails.nationality"),
                  value: watch("embassyPrincipal_nationality"),
                  options: NationalityOptions,
                  onChange: (value: any) =>
                    setValue("embassyPrincipal_nationality", value),
                  validation: {
                    required: true,
                    validate: (value: any) => {
                      if (
                        !value ||
                        (typeof value === "object" && !value.value)
                      ) {
                        return t("nationalityValidation");
                      }
                      return true;
                    },
                  },
                },
              ]),
        ].flat(),
      });
    }

    return sections;
  };

  const principalId = userClaims?.UserID || "";
  const principalDob = formatDateToYYYYMMDD(userClaims?.UserDOB);
  const { data: principalNicData } = useGetNICDetailsQuery(
    {
      IDNumber: principalId,
      DateOfBirth: principalDob || "",
      AcceptedLanguage: "EN",
      SourceSystem: "E-Services",
    },
    {
      skip: claimType !== "principal" || !principalId || !principalDob,
    },
  );

  useEffect(() => {
    if (claimType === "principal" && principalNicData?.NICDetails) {
      const nic = principalNicData.NICDetails;

      if (nic.PlaintiffName) {
        setValue("embassyPrincipal_userName", nic.PlaintiffName);
      }
      if (nic.Region && nic.Region_Code) {
        setValue("embassyPrincipal_region", {
          value: nic.Region_Code,
          label: nic.Region,
        });
      }
      if (nic.City && nic.City_Code) {
        setValue("embassyPrincipal_city", {
          value: nic.City_Code,
          label: nic.City,
        });
      }
      if (nic.DateOfBirthHijri) {
        setValue("embassyPrincipal_hijriDate", nic.DateOfBirthHijri);
      }
      if (nic.DateOfBirthGregorian) {
        setValue("embassyPrincipal_gregorianDate", nic.DateOfBirthGregorian);
      }
      if (nic.PhoneNumber) {
        setValue("embassyPrincipal_phoneNumber", nic.PhoneNumber);
      }
      if (nic.Occupation && nic.Occupation_Code) {
        setValue("embassyPrincipal_occupation", {
          value: nic.Occupation_Code,
          label: nic.Occupation,
        });
      }
      if (nic.Gender && nic.Gender_Code) {
        setValue("embassyPrincipal_gender", {
          value: nic.Gender_Code,
          label: nic.Gender,
        });
      }
      if (nic.Nationality && nic.Nationality_Code) {
        setValue("embassyPrincipal_nationality", {
          value: nic.Nationality_Code,
          label: nic.Nationality,
        });
      }
    }
  }, [claimType, principalNicData, setValue]);

  const agentLayout = EmbassyAgentFormLayout({
    control,
    setValue,
    watch,
    RegionOptions,
    CityOptions,
    OccupationOptions,
    GenderOptions,
    NationalityOptions,
    setError,
    clearErrors,
    isEmbassyPrefillProcessing,
    isEmbassyPrefillFetched,
  });

  const otpSection = OTPFormLayout({
    watch,
    setValue,
  });

  const formSections = useMemo(() => {
    if (claimType === "representative") {
      return [...agentLayout, ...otpSection];
    } else if (claimType === "principal") {
      return [...createPrincipalLayout(), ...otpSection];
    } else {
      return [];
    }
  }, [claimType, agentLayout, otpSection, createPrincipalLayout]);

  return [
    {
      isRadio: true,
      className: "claimant-status-section",
      gridCols: 1,
      children: [
        {
          type: "radio",
          name: "claimantStatus",
          label: t("claimantStatus"),
          options: ClaimantStatusRadioOptions,
          value: claimType,
          onChange: (value: string) => {
            setValue("claimantStatus", value);
          },
          validation: { required: t("claimantStatusValidation") },
        },
      ],
    },
    ...formSections,
  ];
}
