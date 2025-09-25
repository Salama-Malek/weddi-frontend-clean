import { Option } from "@/shared/components/form/form.types";
import { RadioOption } from "@/shared/components/form/RadioGroup";
import { useTranslation } from "react-i18next";

import {
  useGetWorkerRegionLookupDataQuery,
  useGetWorkerCityLookupDataQuery,
  useGetOccupationLookupDataQuery,
  useGetGenderLookupDataQuery,
  useGetNationalityLookupDataQuery,
  useGetCountryCodeLookupDataQuery,
  useGetAgentInfoDataQuery,
} from "@/features/hearings/initiate/api/create-case/plaintiffDetailsApis";
import { useCookieState } from "@/features/hearings/initiate/hooks/useCookieState";

interface DataElement {
  ElementKey: string;
  ElementValue: string;
}

/**
 * Provides form option sets for claimant (plaintiff) details,
 * dynamically fetched via RTK Query hooks.
 */
export const useAgentFormOptions = () => {
  const { t, i18n } = useTranslation("hearingdetails");
  const lang = i18n.language === "ar" ? "AR" : "EN";
  const [getCookie] = useCookieState();

  const userType = getCookie("userType") || "";

  const { data: regionResponse } = useGetWorkerRegionLookupDataQuery({
    AcceptedLanguage: lang,
    SourceSystem: "E-Services",
    ModuleKey: userType.toLowerCase().includes("establishment")
      ? "EstablishmentRegion"
      : "WorkerRegion",
    ModuleName: userType.toLowerCase().includes("establishment")
      ? "EstablishmentRegion"
      : "WorkerRegion",
  });
  const regionOptions: Option[] =
    regionResponse?.DataElements?.map((item: DataElement) => ({
      value: item.ElementKey,
      label: item.ElementValue,
    })) || [];

  const selectedRegion: { value: string } | null = null;
  const { data: cityResponse } = useGetWorkerCityLookupDataQuery(
    {
      AcceptedLanguage: lang,
      SourceSystem: "E-Services",
      selectedWorkerRegion:
        (selectedRegion as { value: string } | null)?.value || "",
      ModuleName: userType.toLowerCase().includes("establishment")
        ? "EstablishmentCity"
        : "WorkerCity",
    },
    { skip: !(selectedRegion as { value: string } | null)?.value },
  );
  const cityOptions: Option[] =
    cityResponse?.DataElements?.map((item: DataElement) => ({
      value: item.ElementKey,
      label: item.ElementValue,
    })) || [];

  const { data: occupationResponse } = useGetOccupationLookupDataQuery({
    AcceptedLanguage: lang,
    SourceSystem: "E-Services",
  });
  const occupationOptions: Option[] =
    occupationResponse?.DataElements?.map((item: DataElement) => ({
      value: item.ElementKey,
      label: item.ElementValue,
    })) || [];

  const { data: genderResponse } = useGetGenderLookupDataQuery({
    AcceptedLanguage: lang,
    SourceSystem: "E-Services",
  });
  const genderOptions: Option[] =
    genderResponse?.DataElements?.map((item: DataElement) => ({
      value: item.ElementKey,
      label: item.ElementValue,
    })) || [];

  const { data: nationalityResponse } = useGetNationalityLookupDataQuery({
    AcceptedLanguage: lang,
    SourceSystem: "E-Services",
  });
  const nationalityOptions: Option[] =
    nationalityResponse?.DataElements?.map((item: DataElement) => ({
      value: item.ElementKey,
      label: item.ElementValue,
    })) || [];

  const { data: countryCodeResponse } = useGetCountryCodeLookupDataQuery({
    AcceptedLanguage: lang,
    SourceSystem: "E-Services",
  });
  const codeOptions: Option[] =
    countryCodeResponse?.DataElements?.map((item: DataElement) => ({
      value: item.ElementKey,
      label: item.ElementValue,
    })) || [];

  /**
   * Fetches attorney details for local agency flow.
   * Params: agentId + mandateNumber set in form state.
   */
  interface AgentParams {
    AgentID: string;
    MandateNumber: string;
    AcceptedLanguage: string;
    SourceSystem: string;
  }
  const agentParams: AgentParams | null = null;
  const { data: agentInfo } = useGetAgentInfoDataQuery(
    agentParams || ({} as AgentParams),
    { skip: !agentParams },
  );

  return {
    applicantTypeOptions: [
      { label: t("selfWorker"), value: "Self(Worker)" },
      { label: t("agent"), value: "Agent" },
    ] as RadioOption[],

    plaintiffCapacityOptions: [
      {
        label: t("agent"),
        value: "representative",
        description: t("agent_desc"),
      },
      {
        label: t("principal_title"),
        value: "principal",
        description: t("principle_description"),
      },
    ] as RadioOption[],
    certifiedRadioOptions: [
      { label: t("localAgency"), value: "localAgency" },
      { label: t("externalAgency"), value: "externalAgency" },
    ] as RadioOption[],

    RegionOptions: regionOptions,
    CityOptions: cityOptions,
    OccupationOptions: occupationOptions,
    GenderOptions: genderOptions,
    NationalityOptions: nationalityOptions,
    CodeOptions: codeOptions,

    agentInfo,
  };
};
