import { EmbassyAgentFormProps } from "./types";
import { useEmbassyAgentFormLogic } from "./useEmbassyAgentFormLogic";
import { SectionLayout } from "@/shared/components/form/form.types";
import { useTranslation } from "react-i18next";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { Controller } from "react-hook-form";
import { AutoCompleteField } from "@/shared/components/form/AutoComplete";

export function EmbassyAgentFormLayout(props: EmbassyAgentFormProps): SectionLayout[] {
  const { t } = useTranslation("hearingdetails");
  const { nicAgentLoading, validNationality, nicAgent, handleNationalityChange } = useEmbassyAgentFormLogic(props);
  const { setValue, watch, RegionOptions, CityOptions, OccupationOptions, GenderOptions, NationalityOptions } = props;
  const [getCookie] = useCookieState();
  const userClaims = getCookie("userClaims");
  const idNumber = userClaims?.UserID || "";
  const nic = nicAgent?.NICDetails;

  return [
    {
      title: t("nicDetails.agentData"),
      className: "agent-data-section",
      gridCols: 3,
      children: [
        { type: "readonly", label: t("nicDetails.idNumber"), value: idNumber },
        { type: "readonly", label: t("embassyUser.name"), value: watch("embassyAgent_Agent_EmbassyName") },
        { type: "readonly", label: t("embassyUser.phoneNumber"), value: watch("embassyAgent_Agent_EmbassyPhone") },
        { type: "readonly", label: t("embassyUser.nationality"), value: watch("embassyAgent_Agent_EmbassyNationality") },
        { type: "readonly", label: t("embassyUser.emailAddress"), value: watch("embassyAgent_Agent_EmbassyEmailAddress") },
        { type: "readonly", label: t("embassyUser.firstLanguage"), value: watch("embassyAgent_Agent_EmbassyFirstLanguage") },
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
          onChange: (v: string) => setValue("embassyAgent_workerAgentIdNumber", v),
          validation: {
            required: t("idNumberValidation"),
            validate: (value: string) => value?.length === 10 || t("max10ValidationDesc"),
          },
          // disabled: nicAgentLoading,
          // isLoading: nicAgentLoading,
        },
        {
          name: "embassyAgent_dateOfBirth",
          type: "dateOfBirth",
          hijriLabel: t("nicDetails.dobHijri"),
          gregorianLabel: t("nicDetails.dobGrog"),
          hijriFieldName: "embassyAgent_workerAgentDateOfBirthHijri",
          gregorianFieldName: "embassyAgent_gregorianDate",
          validation: { required: t("dateValidation") },
          value: watch("embassyAgent_workerAgentDateOfBirthHijri"),
        },
        // Name
        ...(nic?.PlaintiffName && validNationality
          ? [{ type: "readonly" as const, label: t("nicDetails.name"), value: nic.PlaintiffName, isLoading: nicAgentLoading }]
          : [{ type: "input" as const, name: "embassyAgent_userName", inputType: "text", label: t("nicDetails.name"), value: watch("embassyAgent_userName"), onChange: (v: string) => setValue("embassyAgent_userName", v), validation: { required: t("nameValidation") }, isLoading: nicAgentLoading }]),
        // Region
        ...(nic?.Region && validNationality
          ? [{ type: "readonly" as const, label: t("nicDetails.region"), value: nic.Region, isLoading: nicAgentLoading }]
          : [{ type: "autocomplete" as const, name: "embassyAgent_region", label: t("nicDetails.region"), options: RegionOptions, value: watch("embassyAgent_region"), onChange: (v: any) => setValue("embassyAgent_region", v), validation: { required: t("regionValidation") }, isLoading: nicAgentLoading }]),
        // City
        ...(nic?.City && validNationality
          ? [{ type: "readonly" as const, label: t("nicDetails.city"), value: nic.City, isLoading: nicAgentLoading }]
          : [{ type: "autocomplete" as const, name: "embassyAgent_city", label: t("nicDetails.city"), options: CityOptions, value: watch("embassyAgent_city"), onChange: (v: any) => setValue("embassyAgent_city", v), validation: { required: t("cityValidation") }, isLoading: nicAgentLoading }]),
        // Phone Number
        ...(nic?.PhoneNumber && validNationality
          ? [{ type: "readonly" as const, label: t("nicDetails.phoneNumber"), value: nic.PhoneNumber, isLoading: nicAgentLoading }]
          : [{ type: "input" as const, name: "embassyAgent_phoneNumber", inputType: "text", placeholder: "05xxxxxxxx", label: t("nicDetails.phoneNumber"), value: watch("embassyAgent_phoneNumber"), onChange: (v: string) => setValue("embassyAgent_phoneNumber", v), validation: { required: t("phoneNumberValidation"), pattern: { value: /^05\d{8}$/, message: t("phoneValidationMessage") } }, isLoading: nicAgentLoading }]),
        // Occupation
        ...(nic?.Occupation && validNationality
          ? [{ type: "readonly" as const, label: t("nicDetails.occupation"), value: nic.Occupation, isLoading: nicAgentLoading }]
          : [{ type: "autocomplete" as const, name: "embassyAgent_occupation", label: t("nicDetails.occupation"), options: OccupationOptions, value: watch("embassyAgent_occupation"), onChange: (v: any) => setValue("embassyAgent_occupation", v), validation: { required: t("occupationValidation") }, isLoading: nicAgentLoading }]),
        // Gender
        ...(nic?.Gender && validNationality
          ? [{ type: "readonly" as const, label: t("nicDetails.gender"), value: nic.Gender, isLoading: nicAgentLoading }]
          : [{ type: "autocomplete" as const, name: "embassyAgent_gender", label: t("nicDetails.gender"), options: GenderOptions, value: watch("embassyAgent_gender"), onChange: (v: any) => setValue("embassyAgent_gender", v), validation: { required: t("genderValidation") }, isLoading: nicAgentLoading }]),
        // Nationality
        ...(nic?.Nationality && validNationality
          ? [{ type: "readonly" as const, label: t("nicDetails.nationality"), value: nic.Nationality, isLoading: nicAgentLoading }]
          : [{ type: "autocomplete" as const, name: "embassyAgent_nationality", label: t("nicDetails.nationality"), options: NationalityOptions, value: watch("embassyAgent_nationality"), onChange: handleNationalityChange, validation: { required: t("nationalityValidation") }, isLoading: nicAgentLoading }]),
      ],
    },
  ];
} 