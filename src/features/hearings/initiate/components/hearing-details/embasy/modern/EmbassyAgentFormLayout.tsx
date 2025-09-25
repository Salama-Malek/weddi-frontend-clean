import { EmbassyAgentFormProps } from "./types";
import { useEmbassyAgentFormLogic } from "./useEmbassyAgentFormLogic";
import { SectionLayout } from "@/shared/components/form/form.types";
import { useTranslation } from "react-i18next";
import { useCookieState } from "@/features/hearings/initiate/hooks/useCookieState";
import { HijriDatePickerInput } from "@/shared/components/calanders/HijriDatePickerInput";
import { GregorianDateDisplayInput } from "@/shared/components/calanders/GregorianDateDisplayInput";

import gregorianCalendar from "react-date-object/calendars/gregorian";
import gregorianLocaleEn from "react-date-object/locales/gregorian_en";
import { useCallback } from "react";

export function EmbassyAgentFormLayout(
  props: EmbassyAgentFormProps,
): SectionLayout[] {
  const { t } = useTranslation("hearingdetails");
  const {
    nicAgentLoading,
    validNationality,
    nicAgent,
    handleNationalityChange,
  } = useEmbassyAgentFormLogic(props);
  const {
    setValue,
    watch,
    RegionOptions,
    CityOptions,
    OccupationOptions,
    GenderOptions,
    NationalityOptions,
  } = props;
  const [getCookie] = useCookieState();
  const userClaims = getCookie("userClaims");
  const idNumber = userClaims?.UserID || "";
  const nic = nicAgent;

  const handleDateChange = useCallback(
    (date: any) => {
      if (date && !Array.isArray(date)) {
        const gregorianDate = date.convert(
          gregorianCalendar,
          gregorianLocaleEn,
        );
        const gregorian = gregorianDate.format("YYYYMMDD");

        const currentGregorian = watch("embassyAgent_gregorianDate");

        if (currentGregorian !== gregorian) {
          setValue("embassyAgent_gregorianDate" as any, gregorian);
        } else {
        }
      } else {
        const currentGregorian = watch("embassyAgent_gregorianDate");
        if (currentGregorian) {
          setValue("embassyAgent_gregorianDate" as any, "");
        }
      }
    },
    [setValue, watch],
  );

  return [
    {
      title: t("nicDetails.agentData"),
      className: "agent-data-section",
      gridCols: 3,
      children: [
        { type: "readonly", label: t("nicDetails.idNumber"), value: idNumber },
        {
          type: "readonly",
          label: t("embassyUser.name"),
          value: watch("embassyAgent_Agent_EmbassyName"),
        },
        {
          type: "readonly",
          label: t("embassyUser.phoneNumber"),
          value: watch("embassyAgent_Agent_EmbassyPhone"),
        },
        {
          type: "readonly",
          label: t("embassyUser.nationality"),
          value: watch("embassyAgent_Agent_EmbassyNationality"),
        },
        {
          type: "readonly",
          label: t("embassyUser.emailAddress"),
          value: watch("embassyAgent_Agent_EmbassyEmailAddress"),
        },
        {
          type: "readonly",
          label: t("embassyUser.firstLanguage"),
          value: watch("embassyAgent_Agent_EmbassyFirstLanguage"),
        },
      ],
    },
    {
      title: t("nicDetails.plaintiffData"),
      className: "plaintiff-data-section",
      gridCols: 3,
      children: [
        {
          type: "input",
          name: "embassyAgent_workerAgentIdNumber",
          label: t("nicDetails.idNumber"),
          inputType: "text",
          placeholder: "10xxxxxxxx",
          maxLength: 10,
          value: watch("embassyAgent_workerAgentIdNumber"),
          onChange: (v: string) =>
            setValue("embassyAgent_workerAgentIdNumber", v),
          validation: {
            required: t("idNumberValidation"),
            validate: (value: string) =>
              value?.length === 10 || t("max10ValidationDesc"),
          },
        },
        {
          type: "custom" as const,
          name: "embassyAgent_dateOfBirth",
          component: (
            <div className="flex flex-col gap-2">
              <HijriDatePickerInput
                control={props.control}
                name={"embassyAgent_workerAgentDateOfBirthHijri" as any}
                label={t("nicDetails.dobHijri")}
                rules={{ required: t("dateValidation") }}
                notRequired={false}
                isDateOfBirth={true}
                onChangeHandler={handleDateChange}
              />
              <GregorianDateDisplayInput
                control={props.control}
                name={"embassyAgent_gregorianDate" as any}
                label={t("nicDetails.dobGrog")}
              />
            </div>
          ),
        },

        ...((nic?.PlaintiffName && validNationality) ||
        watch("embassyAgent_userName")
          ? [
              {
                type: "readonly" as const,
                label: t("nicDetails.name"),
                value: watch("embassyAgent_userName") || nic?.PlaintiffName,
                isLoading: nicAgentLoading,
              },
            ]
          : [
              {
                type: "input" as const,
                name: "embassyAgent_userName",
                inputType: "text",
                label: t("nicDetails.name"),
                value: watch("embassyAgent_userName"),
                onChange: (v: string) => setValue("embassyAgent_userName", v),
                validation: { required: t("nameValidation") },
                isLoading: nicAgentLoading,
              },
            ]),

        ...(nic?.Region && validNationality
          ? [
              {
                type: "readonly" as const,
                label: t("nicDetails.region"),
                value: nic.Region,
                isLoading: nicAgentLoading,
              },
            ]
          : [
              {
                type: "autocomplete" as const,
                name: "embassyAgent_region",
                label: t("nicDetails.region"),
                options: RegionOptions,
                value: watch("embassyAgent_region"),
                onChange: (v: any) => {
                  setValue("embassyAgent_region", v);
                  setValue("embassyAgent_city", null);
                },
                validation: { required: t("regionValidation") },
                isLoading: nicAgentLoading,
              },
            ]),

        ...(nic?.City && validNationality
          ? [
              {
                type: "readonly" as const,
                label: t("nicDetails.city"),
                value: nic.City,
                isLoading: nicAgentLoading,
              },
            ]
          : [
              {
                type: "autocomplete" as const,
                name: "embassyAgent_city",
                label: t("nicDetails.city"),
                options: CityOptions,
                value: watch("embassyAgent_city"),
                onChange: (v: any) => setValue("embassyAgent_city", v),
                validation: { required: t("cityValidation") },
                isLoading: nicAgentLoading,
              },
            ]),

        ...(nic?.PhoneNumber && validNationality
          ? [
              {
                type: "readonly" as const,
                label: t("nicDetails.phoneNumber"),
                value: nic.PhoneNumber,
                isLoading: nicAgentLoading,
              },
            ]
          : [
              {
                type: "input" as const,
                name: "embassyAgent_phoneNumber",
                inputType: "text",
                placeholder: "05xxxxxxxx",
                label: t("nicDetails.phoneNumber"),
                value: watch("embassyAgent_phoneNumber"),
                onChange: (v: string) =>
                  setValue("embassyAgent_phoneNumber", v),
                validation: {
                  required: t("phoneNumberValidation"),
                  pattern: {
                    value: /^05\d{8}$/,
                    message: t("phoneNumberValidationٍstartWith"),
                  },
                },
                isLoading: nicAgentLoading,
              },
            ]),

        ...(nic?.Occupation && validNationality
          ? [
              {
                type: "readonly" as const,
                label: t("nicDetails.occupation"),
                value: nic.Occupation,
                isLoading: nicAgentLoading,
              },
            ]
          : [
              {
                type: "autocomplete" as const,
                name: "embassyAgent_occupation",
                label: t("nicDetails.occupation"),
                options: OccupationOptions,
                value: watch("embassyAgent_occupation"),
                onChange: (v: any) => setValue("embassyAgent_occupation", v),
                validation: { required: t("occupationValidation") },
                isLoading: nicAgentLoading,
              },
            ]),

        ...(nic?.Gender && validNationality
          ? [
              {
                type: "readonly" as const,
                label: t("nicDetails.gender"),
                value: nic.Gender,
                isLoading: nicAgentLoading,
              },
            ]
          : [
              {
                type: "autocomplete" as const,
                name: "embassyAgent_gender",
                label: t("nicDetails.gender"),
                options: GenderOptions,
                value: watch("embassyAgent_gender"),
                onChange: (v: any) => setValue("embassyAgent_gender", v),
                validation: { required: t("genderValidation") },
                isLoading: nicAgentLoading,
              },
            ]),

        ...(nic?.Nationality && validNationality
          ? [
              {
                type: "readonly" as const,
                label: t("nicDetails.nationality"),
                value: nic.Nationality,
                isLoading: nicAgentLoading,
              },
            ]
          : [
              {
                type: "autocomplete" as const,
                name: "embassyAgent_nationality",
                label: t("nicDetails.nationality"),
                options: NationalityOptions,
                value: watch("embassyAgent_nationality"),
                onChange: handleNationalityChange,
                validation: { required: t("nationalityValidation") },
                isLoading: nicAgentLoading,
              },
            ]),
      ],
    },
  ];
}
