import { useFormOptions } from "../../tabs/claimant/claimant.forms.formOptions";
import { EmbassyPrincipalFormLayout } from "./EmbassyPrincipalFormLayout";
import { EmbassyAgentFormLayout } from "./EmbassyAgentFormLayout";
import { useTranslation } from "react-i18next";
import { SectionLayout } from "@/shared/components/form/form.types";
import OTPFormLayout from "../../tabs/claimant/OTP.froms.formlayout";
import { useMemo, useEffect } from "react";

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
  isVerified: boolean;
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
  isVerified,
}: EmbassyClaimantFormProps): SectionLayout[] {
  const { ClaimantStatusRadioOptions } = useFormOptions();
  const { t } = useTranslation("hearingdetails");
  const claimType = watch("claimantStatus");

  useEffect(() => {
    // Clear form fields when switching claim type
    [
      "userName",
      "hijriDate",
      "gregorianDate",
      "applicant",
      "phoneNumber",
    ].forEach((f) => setValue(f, ""));
    setValue("region", null);
    setValue("city", null);
    setValue("occupation", null);
    setValue("gender", null);
    setValue("nationality", null);
  }, [claimType, setValue]);

  const principalLayout = EmbassyPrincipalFormLayout({
    setValue,
    watch,
    RegionOptions,
    CityOptions,
    OccupationOptions,
    GenderOptions,
    NationalityOptions,
  });
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
  });
  const otpSection = OTPFormLayout({
    watch,
    setValue,
    isVerify: isVerified,
  });

  const formSections = useMemo(() => {
    if (claimType === "representative") {
      return [...agentLayout, ...otpSection];
    } else if (claimType === "principal") {
      return [...principalLayout, ...otpSection];
    } else {
      return [];
    }
  }, [claimType, agentLayout, principalLayout, otpSection]);

  return [
    {
      isRadio: true,
      children: [
        {
          type: "radio" as const,
          name: "claimantStatus",
          label: t("claimantStatus"),
          options: ClaimantStatusRadioOptions,
          value: claimType,
          onChange: (value: string) => setValue("claimantStatus", value),
          validation: { required: t("claimantStatusRequired") },
        },
      ],
    },
    ...formSections,
  ].filter(Boolean) as SectionLayout[];
} 