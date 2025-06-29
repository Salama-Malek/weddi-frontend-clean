import {
  Control,
  UseFormSetValue,
  UseFormWatch,
  useForm,
} from "react-hook-form";
import {
  SectionLayout,
  FormData,
  Option,
} from "@/shared/components/form/form.types";
import { useFormOptions } from "../../tabs/claimant/claimant.forms.formOptions";
import React, {
  lazy,
  Suspense,
  useState,
  useMemo,
  useEffect,
  KeyboardEvent,
  ChangeEvent,
  FocusEvent,
} from "react";
import TableLoader from "@/shared/components/loader/TableLoader";
import { useTranslation } from "react-i18next";
import Button from "@/shared/components/button";
import { useLegalRepFormOptions } from "../../establishment-tabs/legal-representative/claimant.forms.formOptions";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { PHONE_PATTERNS } from "@/config/general";
import { TokenClaims } from "@/features/login/components/AuthProvider";
import {
  useGetNICDetailsQuery,
  NICDetailsResponse,
} from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";
import { NICDetailsParams } from "../../hearing.details.types";
import { formatHijriDate } from "@/shared/lib/helpers";
import AddAttachment from "../../../add-attachments";
// import { useNICTrigger } from "@/features/initiate-hearing/hooks/useNICTrigger";
import { DateOfBirthField } from "@/shared/components/calanders";
import { useAPIFormsData } from "@/providers/FormContext";
import OTPFormLayout from "../../tabs/claimant/OTP.froms.formlayout";
import { boolean } from "ts-pattern/dist/patterns";
import { formatDateString } from "@/shared/lib/helpers";
import EmbasyUserAsPlaintiffFormLayout from "./EmbasyAsPlaintaif";
import EmbasyUserAsAgentFormLayout from "./EmbasyAsAgent";


interface AgentInfo {
  Agent?: {
    MandateNumber?: string;
    AgentName?: string;
    MandateStatus?: string;
    MandateSource?: string;
    AgentDetails?: Array<{
      IdentityNumber: string;
    }>;
  };
}

export interface DataElement {
  ElementKey: string;
  ElementValue: string;
}

interface FormLayoutProps {
  setValue: UseFormSetValue<FormData>;
  watch: UseFormWatch<FormData>;
  control: Control<FormData>;
  regionData: any;
  cityData: any;
  occupationData: any;
  genderData: any;
  nationalityData: any;
  countryData: any;
  isVerified: boolean;
  // form error handlers
  setError: (name: string, error: any) => void;
  clearErrors: (name: string) => void;

}

export const embasyUserFormLayout = ({
  control,
  setValue,
  watch,
  regionData,
  cityData,
  occupationData,
  genderData,
  nationalityData,
  countryData,
  isVerified,
  setError,
  clearErrors,
}: FormLayoutProps): SectionLayout[] => {
  const { ClaimantStatusRadioOptions } =
    useFormOptions();
  const { clearFormData } = useAPIFormsData();
  const { t } = useTranslation("hearingdetails");
  const claimType = watch("claimantStatus");
  useEffect(() => {
    [
      "userName",
      "hijriDate",
      "gregorianDate",
      "applicant",
      "phoneNumber",
    ].forEach((f) => setValue(f as any, ""));

    // Set autocomplete fields to null
    setValue("region", null);
    setValue("city", null);
    setValue("occupation", null);
    setValue("gender", null);
    setValue("nationality", null);
    
    console.log("cleared");
  }, [claimType]);
 

  const RegionOptions = useMemo(
    () =>
      regionData?.map((item: DataElement) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [],
    [regionData]
  );

  const CityOptions = useMemo(
    () =>
      cityData?.map((item: DataElement) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [],
    [cityData]
  );

  const OccupationOptions = useMemo(
    () =>
      occupationData?.map((item: DataElement) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [],
    [occupationData]
  );

  const GenderOptions = useMemo(
    () =>
      genderData?.map((item: DataElement) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [],
    [genderData]
  );

  const NationalityOptions = useMemo(
    () =>
      nationalityData?.map((item: DataElement) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [],
    [nationalityData]
  );

  const embasyAsPlaintaif = EmbasyUserAsPlaintiffFormLayout({
    setValue,
    watch,
    RegionOptions,
    CityOptions,
    OccupationOptions,
    GenderOptions,
    NationalityOptions,

  })
  const embasyAsAgent = EmbasyUserAsAgentFormLayout({
    control: control as any,
    setValue,
    watch,
    RegionOptions,
    CityOptions,
    OccupationOptions,
    GenderOptions,
    NationalityOptions,
    setError,
    clearErrors,
  })

  // the OTP section 
  const OTPSection = OTPFormLayout({
    watch,
    setValue,
    isVerified,
  });

  const formSections = useMemo(() => {
    if (claimType === "representative") {
      return [
        ...embasyAsAgent,
        ...OTPSection
      ];
    } else if (claimType === "principal") {
      return [
        ...embasyAsPlaintaif,
        ...OTPSection
      ];
    } else {
      return []
    }
  }, [claimType, embasyAsAgent, embasyAsPlaintaif]);

  const formLayout: SectionLayout[] = [
    ...[{
      isRadio: true,
      children: [
        {
          type: "radio",
          name: "claimantStatus",
          label: t("claimantStatus"),
          options: ClaimantStatusRadioOptions,
          value: claimType,
          onChange: (value: string) => setValue("claimantStatus", value),
          validation: { required: "Region is required" },
        },
      ],
    }],
    ...formSections,

  ].filter(Boolean) as SectionLayout[];

  return formLayout;
};







