import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SectionLayout } from "@/shared/components/form/form.types";
import { useFormOptions } from "./claimant.forms.formOptions";
import { buildAgentInformationSection } from "../../shared-layouts/AgentSection";
import { buildClaimantBasicInfoSection } from "../../shared-layouts/ClaimantSections";

/**
 * Returns a simplified claimant form layout with principal and representative branches.
 */
export const useFormLayout = (): SectionLayout[] => {
  const { t } = useTranslation("hearingdetails");
  const { watch, setValue } = useFormContext();

  const {
    ClaimantStatusRadioOptions,
    RegionOptions,
    CityOptions,
    OccupationOptions,
    GenderOptions,
    NationalityOptions,
  } = useFormOptions();

  const claimantStatus = watch("claimantStatus") || "principal";

  const statusSection: SectionLayout = {
    title: t("claimantType"),
    className: "claimant-type-section",
    gridCols: 3,
    children: [
      {
        type: "radio" as const,
        name: "claimantStatus",
        label: t("claimantType"),
        options: ClaimantStatusRadioOptions,
        value: claimantStatus,
        onChange: (v: string) => setValue("claimantStatus", v),
      },
    ],
  };

  const baseInfoSection = buildClaimantBasicInfoSection(watch, setValue, t, {
    RegionOptions,
    CityOptions,
    OccupationOptions,
    GenderOptions,
    NationalityOptions,
  });

  if (claimantStatus === "representative") {
    const agentFields = [
      { name: "agentName", label: t("agentName"), type: "text" },
      { name: "agencyNumber", label: t("mandateNumber"), type: "text" },
      { name: "agencyStatus", label: t("mandateStatus"), type: "text" },
      { name: "agencySource", label: t("mandateSource"), type: "text" },
    ];
    const agentSection = buildAgentInformationSection(agentFields, watch, setValue, t);
    return [statusSection, agentSection, baseInfoSection];
  }

  return [statusSection, baseInfoSection];
};
