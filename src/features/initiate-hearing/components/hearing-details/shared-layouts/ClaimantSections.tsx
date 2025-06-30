import { SectionLayout, Option } from "@/shared/components/form/form.types";
import { UseFormWatch, UseFormSetValue } from "react-hook-form";
import { TFunction } from "i18next";

export interface ClaimantOptions {
  RegionOptions: Option[];
  CityOptions: Option[];
  OccupationOptions: Option[];
  GenderOptions: Option[];
  NationalityOptions: Option[];
}

export const buildClaimantBasicInfoSection = (
  watch: UseFormWatch<any>,
  setValue: UseFormSetValue<any>,
  t: TFunction,
  options: ClaimantOptions
): SectionLayout => ({
  title: t("plaintiffInformation"),
  className: "claimant-basic-info",
  gridCols: 3,
  children: [
    {
      type: "input" as const,
      name: "userName",
      label: t("name"),
      inputType: "text",
      value: watch("userName"),
      onChange: (v: string) => setValue("userName", v)
    },
    {
      type: "autocomplete" as const,
      name: "plaintiffRegion",
      label: t("region"),
      options: options.RegionOptions,
      value: watch("plaintiffRegion"),
      onChange: (v: any) => setValue("plaintiffRegion", v)
    },
    {
      type: "autocomplete" as const,
      name: "plaintiffCity",
      label: t("city"),
      options: options.CityOptions,
      value: watch("plaintiffCity"),
      onChange: (v: any) => setValue("plaintiffCity", v)
    },
    {
      type: "autocomplete" as const,
      name: "occupation",
      label: t("occupation"),
      options: options.OccupationOptions,
      value: watch("occupation"),
      onChange: (v: any) => setValue("occupation", v)
    },
    {
      type: "autocomplete" as const,
      name: "gender",
      label: t("gender"),
      options: options.GenderOptions,
      value: watch("gender"),
      onChange: (v: any) => setValue("gender", v)
    },
    {
      type: "autocomplete" as const,
      name: "nationality",
      label: t("nationality"),
      options: options.NationalityOptions,
      value: watch("nationality"),
      onChange: (v: any) => setValue("nationality", v)
    }
  ]
});
