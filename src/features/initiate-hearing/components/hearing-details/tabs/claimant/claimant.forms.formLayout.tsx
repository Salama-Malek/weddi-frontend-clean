import {
  Control,
  UseFormSetValue,
  UseFormWatch,
  useWatch,
} from "react-hook-form";
import { SectionLayout, FormData } from "@/shared/components/form/form.types";
import { useFormOptions } from "./claimant.forms.formOptions";
import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLegalRepFormOptions } from "../../establishment-tabs/legal-representative/claimant.forms.formOptions";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { TokenClaims } from "@/features/login/components/AuthProvider";
import { NICDetailsResponse } from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";
import AddAttachment from "../../../add-attachments";
import OTPFormLayout from "./OTP.froms.formlayout";
import { formatDateString, formatDateToYYYYMMDD } from "@/shared/lib/helpers";
import { toast } from "react-toastify";
import { DigitOnlyInput } from "@/shared/components/form/InputField";
import { FieldWrapper } from "@/shared/components/form/FieldWrapper";
import { HijriDatePickerInput } from "@/shared/components/calanders/HijriDatePickerInput";
import { GregorianDateDisplayInput } from "@/shared/components/calanders/GregorianDateDisplayInput";
import gregorian from "react-date-object/calendars/gregorian";
import gregorianLocaleEn from "react-date-object/locales/gregorian_en";
import FileAttachment from "@/shared/components/ui/file-attachment/FileAttachment";

interface AgentInfo {
  Agent?: {
    ErrorDescription?: string;
    MandateNumber?: string;
    AgentName?: string;
    MandateStatus?: string;
    MandateSource?: string;
    AgentDetails?: Array<{
      IdentityNumber: string;
    }>;
  };
  PartyList?: Array<{
    FullName: string;
    ID: string;
    Gender: string;
    IsValid: string;
  }>;
}

export interface DataElement {
  ElementKey: string;
  ElementValue: string;
}

interface FormLayoutProps {
  setValue: UseFormSetValue<FormData>;
  watch: UseFormWatch<FormData>;
  control: Control<FormData>;
  plaintiffRegionData: any;
  plaintiffCityData: any;
  occupationData: any;
  genderData: any;
  nationalityData: any;

  agentInfoData: AgentInfo;
  apiLoadingStates: {
    agent: boolean;
    nic: boolean;
    estab: boolean;
    incomplete: boolean;
  };
  userTypeLegalRepData: any;
  onAgencyNumberChange: (value: string) => void;
  setError: (name: string, error: any) => void;
  clearErrors: (name: string) => void;

  principalNICResponse?: NICDetailsResponse;
  principalNICRefetch: () => void;
  representativeNICResponse?: NICDetailsResponse;
  localAgentNICResponse?: any;
  externalAgentNICResponse?: any;
  register: any;
  errors: any;
  trigger: any;
  isValid: boolean;
  allowedIds?: string[];
  caseData?: any;
}

export const useFormLayout = ({
  control,
  setValue,
  watch,
  plaintiffRegionData,
  plaintiffCityData,
  occupationData,
  genderData,
  nationalityData,
  agentInfoData,
  apiLoadingStates,
  userTypeLegalRepData,
  onAgencyNumberChange,
  setError,
  clearErrors,
  principalNICResponse,

  representativeNICResponse,
  localAgentNICResponse,
  externalAgentNICResponse,
  register,
  errors,
  trigger,
  allowedIds,
  caseData,
}: FormLayoutProps): SectionLayout[] => {
  const safeAllowedIds = allowedIds || [];

  const [unprofessionalLetterAttachments] = useState<any[]>([]);

  const userPickedDateRef = React.useRef(false);

  const currentClaimantStatus = useWatch({ name: "claimantStatus", control });

  const { t } = useTranslation("hearingdetails");
  const { t: LegalRep } = useTranslation("legal_rep");
  const [getCookie] = useCookieState();

  const incompleteCaseType = getCookie("incompleteCase");

  const enforcedStatus = useMemo(() => {
    if (incompleteCaseType?.PlaintiffType === "Self(Worker)")
      return "principal";
    if (incompleteCaseType?.PlaintiffType === "Agent") return "representative";
    return null;
  }, [incompleteCaseType]);

  const claimantStatus =
    watch("claimantStatus") || enforcedStatus || "principal";

  const hasMountedRef = React.useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;

      const defaultStatus = enforcedStatus ?? "principal";

      if (!currentClaimantStatus) {
        setValue("claimantStatus", defaultStatus);
      }
    }
  }, [enforcedStatus, currentClaimantStatus, setValue]);

  useEffect(() => {
    register("userName");
    register("plaintiffRegion");
    register("plaintiffCity");
    register("occupation");
    register("gender");
    register("nationality");
    register("hijriDate");
    register("gregorianDate");
    register("applicant");
    register("workerAgentDateOfBirthHijri");
    register("phoneNumber");
    register("agentPhoneNumber");
    register("region");
    register("city");
    register("isDomestic");
    register("isPhone");
    register("phoneCode");
    register("interPhoneNumber");
    register("isVerified");
    register("workerAgentIdNumber");
    register("agencyNumber");
    register("mobileNumber");
    register("agentName");
    register("agencyStatus");
    register("agencySource");
    register("Agent_ResidencyAddress");
    register("Agent_CurrentPlaceOfWork");
    register("agentType");

    register("externalAgent_agentName");
    register("externalAgent_agencyNumber");
    register("externalAgent_agencyStatus");
    register("externalAgent_agencySource");
    register("externalAgent_currentPlaceOfWork");
    register("externalAgent_residencyAddress");
    register("externalAgent_agentPhoneNumber");
    register("externalAgent_workerAgentIdNumber");
    register("externalAgent_workerAgentDateOfBirthHijri");
    register("externalAgent_gregorianDate");
    register("externalAgent_userName");
    register("externalAgent_phoneNumber");
    register("externalAgent_region");
    register("externalAgent_city");
    register("externalAgent_occupation");
    register("externalAgent_gender");
    register("externalAgent_nationality");

    register("localAgent_agentName");
    register("localAgent_agencyNumber");
    register("localAgent_agencyStatus");
    register("localAgent_agencySource");
    register("localAgent_currentPlaceOfWork");
    register("localAgent_residencyAddress");
    register("localAgent_workerAgentIdNumber");
    register("localAgent_workerAgentDateOfBirthHijri");
    register("localAgent_gregorianDate");
    register("localAgent_userName");
    register("localAgent_phoneNumber");
    register("localAgent_region");
    register("localAgent_city");
    register("localAgent_occupation");
    register("localAgent_gender");
    register("localAgent_nationality");

    register("principal_userName");
    register("principal_region");
    register("principal_city");
    register("principal_occupation");
    register("principal_gender");
    register("principal_nationality");
    register("principal_hijriDate");
    register("principal_gregorianDate");
    register("principal_applicant");
    register("principal_phoneNumber");
  }, [register]);

  const userClaims = getCookie("userClaims") as TokenClaims;
  const idNumber = userClaims?.UserID || "";
  const userType = getCookie("userType");
  const { ClaimantStatusRadioOptions } = useFormOptions();
  const { plaintiffTypeOptions, AgentTypeOptions } = useLegalRepFormOptions();

  const workerAgentIdNumber = watch("workerAgentIdNumber") || "";
  const workerAgentHijriDob = watch("workerAgentDateOfBirthHijri") || "";
  const formattedWorkerAgentHijriDob =
    formatDateToYYYYMMDD(workerAgentHijriDob);

  const agentType = watch("agentType");

  const agencyNumber =
    agentType === "local_agency"
      ? watch("localAgent_agencyNumber") || ""
      : agentType === "external_agency"
        ? watch("externalAgent_agencyNumber") || ""
        : watch("agencyNumber") || "";

  const hasValidAgency = useMemo(() => {
    if (agentType === "local_agency") {
      return Boolean(
        agencyNumber && agentInfoData?.Agent?.ErrorDescription === "Success",
      );
    }
    if (agentType === "external_agency") {
      const externalAgencyNumber = watch("externalAgent_agencyNumber");
      return Boolean(
        externalAgencyNumber && String(externalAgencyNumber).length > 0,
      );
    }
    return false;
  }, [agentType, agencyNumber, agentInfoData?.Agent?.ErrorDescription, watch]);

  const hasMandateNumber = useMemo(() => {
    if (agentType === "local_agency") {
      return Boolean(agencyNumber && String(agencyNumber).length > 0);
    } else if (agentType === "external_agency") {
      const externalAgencyNumber = watch("externalAgent_agencyNumber");
      return Boolean(
        externalAgencyNumber && String(externalAgencyNumber).length > 0,
      );
    }
    return false;
  }, [agentType, agencyNumber, watch]);

  const isPlaintiffIdUnderAgency = useMemo(() => {
    try {
      if (
        agentType !== "local_agency" ||
        !workerAgentIdNumber ||
        !agentInfoData?.PartyList
      ) {
        return true;
      }
      if (!Array.isArray(agentInfoData.PartyList)) {
        return true;
      }
      return agentInfoData.PartyList.some(
        (party) => party?.ID === workerAgentIdNumber,
      );
    } catch (error) {
      return true;
    }
  }, [agentType, workerAgentIdNumber, agentInfoData?.PartyList]);

  const shouldFetchNic =
    claimantStatus === "representative" &&
    agentType === "local_agency" &&
    hasValidAgency &&
    hasMandateNumber &&
    isPlaintiffIdUnderAgency &&
    workerAgentIdNumber.length === 10 &&
    formattedWorkerAgentHijriDob?.length === 8;

  const nicAgent =
    agentType === "local_agency"
      ? localAgentNICResponse
      : agentType === "external_agency"
        ? externalAgentNICResponse
        : representativeNICResponse;
  const nicAgentLoading = false;
  const nicAgentError = false;
  const refetchNICAgent = () => {};

  useEffect(() => {
    if (!shouldFetchNic) {
      clearErrors("workerAgentIdNumber");
      return;
    }

    if (nicAgentLoading) return;

    if (nicAgentError || (nicAgent && !nicAgent?.NICDetails)) {
      let errorMessage = t("error.noNicData");
      if (
        nicAgent &&
        nicAgent.ErrorDetails &&
        Array.isArray(nicAgent.ErrorDetails)
      ) {
        const errorDetail = nicAgent.ErrorDetails.find(
          (detail: any) => detail.ErrorDesc,
        );
        if (errorDetail && errorDetail.ErrorDesc) {
          errorMessage = errorDetail.ErrorDesc;
        }
      }

      if (typeof setError === "function") {
        setError("workerAgentIdNumber", {
          type: "validate",
          message: errorMessage,
        });
      }
    } else if (nicAgent?.NICDetails) {
      clearErrors("workerAgentIdNumber");
      const d = nicAgent.NICDetails;
      setValue("userName", d.PlaintiffName || "", {
        shouldValidate: false,
      });

      if (d.Region_Code) {
        setValue(
          "plaintiffRegion",
          {
            value: d.Region_Code,
            label: d.Region || "",
          },
          {
            shouldValidate: false,
          },
        );
      }

      if (d.City_Code) {
        setValue(
          "plaintiffCity",
          {
            value: d.City_Code,
            label: d.City || "",
          },
          {
            shouldValidate: false,
          },
        );
      }

      if (d.Occupation_Code) {
        setValue(
          "occupation",
          {
            value: d.Occupation_Code,
            label: d.Occupation || "",
          },
          {
            shouldValidate: false,
          },
        );
      }

      if (d.Gender_Code) {
        setValue(
          "gender",
          {
            value: d.Gender_Code,
            label: d.Gender || "",
          },
          {
            shouldValidate: false,
          },
        );
      }

      if (d.Nationality_Code) {
        setValue(
          "nationality",
          {
            value: d.Nationality_Code,
            label: d.Nationality || "",
          },
          {
            shouldValidate: false,
          },
        );
      }

      if (!userPickedDateRef.current) {
        if (watch("hijriDate") !== (d.DateOfBirthHijri || "")) {
          setValue("hijriDate", d.DateOfBirthHijri || "", {
            shouldValidate: false,
          });
        }
        if (watch("gregorianDate") !== (d.DateOfBirthGregorian || "")) {
          setValue("gregorianDate", d.DateOfBirthGregorian || "", {
            shouldValidate: false,
          });
        }
      }
      setValue("applicant", d.Applicant || "", {
        shouldValidate: false,
      });

      if (d.PhoneNumber) {
        setValue("phoneNumber", d.PhoneNumber.toString(), {
          shouldValidate: false,
        });
      }
    }
  }, [
    shouldFetchNic,
    nicAgent,
    nicAgentError,
    nicAgentLoading,
    setValue,
    setError,
    t,
  ]);

  const plaintiffStatus = watch("plaintiffStatus");

  const selectedMainCategory = getCookie("mainCategory");
  const selectedSubCategory = getCookie("subCategory");

  const govRepDetail = userTypeLegalRepData?.GovRepDetails?.find(
    (item: any) => item.GOVTID === selectedMainCategory?.value,
  );

  const [attachment, setAttachment] = useState<FormData["attachment"] | null>(
    null,
  );

  const watchedClaimantStatus = useWatch({ name: "claimantStatus", control });

  useEffect(() => {
    if (
      principalNICResponse?.NICDetails &&
      watchedClaimantStatus === "principal"
    ) {
      const nic = principalNICResponse.NICDetails;

      if (nic.PlaintiffName && !watch("principal_userName")) {
        setValue("principal_userName", nic.PlaintiffName || "", {
          shouldValidate: false,
        });
      }

      if (nic.Region_Code && !watch("principal_region")) {
        setValue(
          "principal_region",
          {
            value: nic.Region_Code || "",
            label: nic.Region || "",
          },
          {
            shouldValidate: false,
          },
        );
      }

      if (nic.City_Code && !watch("principal_city")) {
        setValue(
          "principal_city",
          { value: nic.City_Code || "", label: nic.City || "" },
          {
            shouldValidate: false,
          },
        );
      }

      if (nic.Occupation_Code && !watch("principal_occupation")) {
        setValue(
          "principal_occupation",
          {
            value: nic.Occupation_Code || "",
            label: nic.Occupation || "",
          },
          {
            shouldValidate: false,
          },
        );
      }

      if (nic.Gender_Code && !watch("principal_gender")) {
        setValue(
          "principal_gender",
          {
            value: nic.Gender_Code || "",
            label: nic.Gender || "",
          },
          {
            shouldValidate: false,
          },
        );
      }

      if (nic.Nationality_Code && !watch("principal_nationality")) {
        setValue(
          "principal_nationality",
          {
            value: nic.Nationality_Code || "",
            label: nic.Nationality || "",
          },
          {
            shouldValidate: false,
          },
        );
      }

      if (!userPickedDateRef.current) {
        if (nic.DateOfBirthHijri && !watch("principal_hijriDate")) {
          setValue("principal_hijriDate", nic.DateOfBirthHijri || "", {
            shouldValidate: false,
          });
        }

        if (nic.DateOfBirthGregorian && !watch("principal_gregorianDate")) {
          setValue("principal_gregorianDate", nic.DateOfBirthGregorian || "", {
            shouldValidate: false,
          });
        }
      }

      if (nic.Applicant && !watch("principal_applicant")) {
        setValue("principal_applicant", nic.Applicant || "");
      }

      if (nic.PhoneNumber && !watch("principal_phoneNumber")) {
        setValue("principal_phoneNumber", nic.PhoneNumber.toString(), {
          shouldValidate: false,
        });
      }
    }
  }, [principalNICResponse, watch]);

  useEffect(() => {
    if (
      representativeNICResponse?.NICDetails &&
      watchedClaimantStatus === "representative"
    ) {
      const nic = representativeNICResponse.NICDetails;
      if (nic.PlaintiffName) {
        setValue("userName", nic.PlaintiffName || "", {
          shouldValidate: false,
        });
      }
      if (nic.Region_Code) {
        setValue(
          "plaintiffRegion",
          {
            value: nic.Region_Code || "",
            label: nic.Region || "",
          },
          {
            shouldValidate: false,
          },
        );
      }
      if (nic.City_Code) {
        setValue(
          "plaintiffCity",
          {
            value: nic.City_Code || "",
            label: nic.City || "",
          },
          {
            shouldValidate: false,
          },
        );
      }
      if (nic.Occupation_Code) {
        setValue(
          "occupation",
          {
            value: nic.Occupation_Code || "",
            label: nic.Occupation || "",
          },
          {
            shouldValidate: false,
          },
        );
      }
      if (nic.Gender_Code) {
        setValue(
          "gender",
          {
            value: nic.Gender_Code || "",
            label: nic.Gender || "",
          },
          {
            shouldValidate: false,
          },
        );
      }
      if (nic.Nationality_Code) {
        setValue(
          "nationality",
          {
            value: nic.Nationality_Code || "",
            label: nic.Nationality || "",
          },
          {
            shouldValidate: false,
          },
        );
      }

      if (!userPickedDateRef.current) {
        setValue("hijriDate", nic.DateOfBirthHijri || "", {
          shouldValidate: false,
        });
        setValue("gregorianDate", nic.DateOfBirthGregorian || "", {
          shouldValidate: false,
        });
      }
      setValue("applicant", nic.Applicant || "");
      if (nic.PhoneNumber) {
        setValue("phoneNumber", nic.PhoneNumber.toString(), {
          shouldValidate: false,
        });
      }
    } else {
      [
        "userName",
        "hijriDate",
        "gregorianDate",
        "applicant",
        "phoneNumber",
      ].forEach((f) => setValue(f as any, ""));
      setValue("plaintiffRegion", null);
      setValue("plaintiffCity", null);
      setValue("occupation", null);
      setValue("gender", null);
      setValue("nationality", null);
    }
  }, [representativeNICResponse]);

  useEffect(() => {
    if (
      localAgentNICResponse?.NICDetails &&
      claimantStatus === "representative" &&
      agentType === "local_agency"
    ) {
      const d = localAgentNICResponse.NICDetails;
      setValue("localAgent_userName", d.PlaintiffName || "");
      setValue(
        "localAgent_region",
        d.Region_Code ? { value: d.Region_Code, label: d.Region || "" } : null,
      );
      setValue(
        "localAgent_city",
        d.City_Code ? { value: d.City_Code, label: d.City || "" } : null,
      );
      setValue(
        "localAgent_occupation",
        d.Occupation_Code
          ? { value: d.Occupation_Code, label: d.Occupation || "" }
          : null,
      );
      setValue(
        "localAgent_gender",
        d.Gender_Code ? { value: d.Gender_Code, label: d.Gender || "" } : null,
      );
      setValue(
        "localAgent_nationality",
        d.Nationality_Code
          ? { value: d.Nationality_Code, label: d.Nationality || "" }
          : null,
      );
      setValue(
        "localAgent_phoneNumber",
        d.PhoneNumber ? d.PhoneNumber.toString() : "",
      );
    }
  }, [localAgentNICResponse, claimantStatus, agentType, setValue]);

  useEffect(() => {
    if (
      representativeNICResponse?.NICDetails &&
      claimantStatus === "representative" &&
      agentType === "external_agency"
    ) {
      const d = representativeNICResponse.NICDetails;
      setValue("externalAgent_userName", d.PlaintiffName || "");
      setValue(
        "externalAgent_region",
        d.Region_Code ? { value: d.Region_Code, label: d.Region ?? "" } : null,
      );
      setValue(
        "externalAgent_city",
        d.City_Code ? { value: d.City_Code, label: d.City ?? "" } : null,
      );
      setValue(
        "externalAgent_occupation",
        d.Occupation_Code
          ? { value: d.Occupation_Code, label: d.Occupation ?? "" }
          : null,
      );
      setValue(
        "externalAgent_gender",
        d.Gender_Code ? { value: d.Gender_Code, label: d.Gender ?? "" } : null,
      );
      setValue(
        "externalAgent_nationality",
        d.Nationality_Code
          ? { value: d.Nationality_Code, label: d.Nationality ?? "" }
          : null,
      );
      setValue(
        "externalAgent_phoneNumber",
        d.PhoneNumber ? d.PhoneNumber.toString() : "",
      );
    }
  }, [representativeNICResponse, claimantStatus, agentType, setValue]);

  const RegionOptions = useMemo(
    () =>
      plaintiffRegionData?.map((item: DataElement) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [],
    [plaintiffRegionData],
  );

  const CityOptions = useMemo(
    () =>
      plaintiffCityData?.map((item: DataElement) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [],
    [plaintiffCityData],
  );

  const OccupationOptions = useMemo(
    () =>
      occupationData?.map((item: DataElement) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [],
    [occupationData],
  );

  const GenderOptions = useMemo(
    () =>
      genderData?.map((item: DataElement) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [],
    [genderData],
  );

  const NationalityOptions = useMemo(
    () =>
      nationalityData?.map((item: DataElement) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [],
    [nationalityData],
  );

  const handleFileSelect = (fileData: FormData["attachment"]) => {
    if (!fileData) return;
    setAttachment(fileData);
    setValue("attachment.classification", fileData.classification || "");
    setValue("attachment.file", fileData.file || null);
    setValue("attachment.base64", fileData.base64 || null);
    setValue("attachment.fileName", fileData.fileName || "");
    setValue("attachment.fileType", fileData.fileType || "");
  };

  const baseSections =
    userType === "legal_representative"
      ? [
          {
            isHidden: true,
            title: LegalRep("claimantStatus"),
            isRadio: true,
            children: [
              {
                type: "radio",
                name: "plaintiffStatus",
                label: LegalRep("claimantStatus"),
                options: plaintiffTypeOptions,
                value: "",
                onChange: (value: string) => setValue("plaintiffStatus", value),
                validation: { required: "Region is required" },
              },
            ],
          },
        ]
      : [];

  const getWorkerSections = () => {
    const sections: any[] = [];

    useEffect(() => {
      if (!incompleteCaseType) {
        setValue("claimantStatus", "principal");
      }
    }, []);

    useEffect(() => {
      if (claimantStatus === "principal" && idNumber) {
        setValue("idNumber", idNumber);
      }
    }, [claimantStatus, idNumber, setValue]);

    const [userInteractedFields, setUserInteractedFields] = useState<
      Set<string>
    >(new Set());

    useEffect(() => {
      let requiredFields: string[] = [];

      if (claimantStatus === "principal") {
        requiredFields = [
          "principal_userName",
          "principal_region",
          "principal_city",
          "principal_occupation",
          "principal_gender",
          "principal_nationality",
          "principal_phoneNumber",
        ];
      } else if (claimantStatus === "representative") {
        if (agentType === "external_agency") {
          requiredFields = [
            "externalAgent_agentName",
            "externalAgent_agencyNumber",
            "externalAgent_agencyStatus",
            "externalAgent_agencySource",
            "externalAgent_currentPlaceOfWork",
            "externalAgent_residencyAddress",
            "externalAgent_agentPhoneNumber",
            "externalAgent_workerAgentIdNumber",
            "externalAgent_workerAgentDateOfBirthHijri",
            "externalAgent_userName",
            "externalAgent_phoneNumber",
            "externalAgent_region",
            "externalAgent_city",
            "externalAgent_occupation",
            "externalAgent_gender",
            "externalAgent_nationality",
          ];
        } else if (agentType === "local_agency") {
          requiredFields = [
            "localAgent_agentName",
            "localAgent_agencyNumber",
            "localAgent_agencyStatus",
            "localAgent_agencySource",
            "localAgent_currentPlaceOfWork",
            "localAgent_residencyAddress",
            "localAgent_workerAgentIdNumber",
            "localAgent_workerAgentDateOfBirthHijri",
            "localAgent_userName",
            "localAgent_phoneNumber",
            "localAgent_region",
            "localAgent_city",
            "localAgent_occupation",
            "localAgent_gender",
            "localAgent_nationality",
          ];
        } else {
          requiredFields = [
            "userName",
            "plaintiffRegion",
            "plaintiffCity",
            "occupation",
            "gender",
            "nationality",
            "phoneNumber",
            "workerAgentIdNumber",
            "workerAgentDateOfBirthHijri",
          ];
        }
      }

      const validateFields = async () => {
        const fieldsToValidate = requiredFields.filter((field) =>
          userInteractedFields.has(field),
        );

        if (fieldsToValidate.length > 0) {
          for (const field of fieldsToValidate) {
            await trigger(field);
          }
        } else {
        }
      };

      if (requiredFields.length > 0) {
        validateFields();
      }
    }, [claimantStatus, agentType, userInteractedFields, trigger]);

    useEffect(() => {
      const subscription = watch((_value, { name }) => {
        if (name) {
          setUserInteractedFields((prev) => new Set([...prev, name]));

          if (userInteractedFields.has(name)) {
            trigger(name);
          }
        }
      });
      return () => subscription.unsubscribe();
    }, [watch, trigger, userInteractedFields]);

    if (claimantStatus === "principal") {
      const pd = principalNICResponse?.NICDetails;
      sections.push({
        title: t("tab1_title"),
        className: "nic-details-section",
        gridCols: 2,
        children: [
          {
            type: "readonly" as const,
            label: t("nicDetails.idNumber"),
            value: idNumber,
            isLoading: nicAgentLoading,
          },

          {
            type: principalNICResponse?.NICDetails?.PlaintiffName
              ? "readonly"
              : "input",
            name: "principal_userName",
            label: t("nicDetails.name"),
            value:
              principalNICResponse?.NICDetails?.PlaintiffName ||
              watch("principal_userName"),
            isLoading: nicAgentLoading,
            ...(!principalNICResponse?.NICDetails?.PlaintiffName && {
              onChange: (v: string) => {
                setValue("principal_userName", v);
                setUserInteractedFields(
                  (prev) => new Set([...prev, "principal_userName"]),
                );
              },
            }),
            validation: { required: t("nameValidation") },
          },

          {
            type: pd?.Region ? "readonly" : "autocomplete",
            name: "principal_region",
            label: t("nicDetails.region"),
            value: pd?.Region ? pd.Region : watch("principal_region"),
            options: RegionOptions,
            isLoading: nicAgentLoading,
            ...(!pd?.Region && {
              validation: {
                required: true,
                validate: (value: any) => {
                  if (!value || (typeof value === "object" && !value.value)) {
                    return t("regionValidation");
                  }
                  return true;
                },
              },
              onChange: (value: any) => {
                setValue("principal_region", value);
                setValue("principal_city", null);
                setUserInteractedFields(
                  (prev) => new Set([...prev, "principal_region"]),
                );
              },
            }),
          },

          {
            type: pd?.City ? "readonly" : "autocomplete",
            name: "principal_city",
            label: t("nicDetails.city"),
            value: pd?.City ? pd.City : watch("principal_city"),
            options: CityOptions,
            isLoading: nicAgentLoading,
            ...(!pd?.City && {
              validation: {
                required: true,
                validate: (value: any) => {
                  if (!value || (typeof value === "object" && !value.value)) {
                    return t("cityValidation");
                  }
                  return true;
                },
              },
              onChange: (value: any) => {
                setValue("principal_city", value);
                setUserInteractedFields(
                  (prev) => new Set([...prev, "principal_city"]),
                );
              },
            }),
          },

          {
            type: "readonly" as const,
            label: t("nicDetails.dobHijri"),
            value:
              formatDateString(pd?.DateOfBirthHijri) ||
              watch("principal_hijriDate"),
            isLoading: nicAgentLoading,
          },

          {
            type: "readonly" as const,
            label: t("nicDetails.dobGrog"),
            value:
              formatDateString(pd?.DateOfBirthGregorian) ||
              watch("principal_gregorianDate"),
            isLoading: nicAgentLoading,
          },

          {
            type: pd?.PhoneNumber ? "readonly" : "input",
            name: "principal_phoneNumber",
            label: t("nicDetails.phoneNumber"),
            value: pd?.PhoneNumber || watch("principal_phoneNumber"),
            isLoading: nicAgentLoading,
            ...(!pd?.PhoneNumber && {
              onChange: (v: string) => {
                setValue("principal_phoneNumber", v);
                setUserInteractedFields(
                  (prev) => new Set([...prev, "principal_phoneNumber"]),
                );
              },
              validation: {
                required: t("phoneNumberValidation"),
                pattern: {
                  value: /^05\d{8}$/,
                  message: t("phoneNumberValidationٍstartWith"),
                },
              },
            }),
          },

          {
            type: pd?.Occupation ? "readonly" : "autocomplete",
            name: "principal_occupation",
            label: t("nicDetails.occupation"),
            value: pd?.Occupation
              ? pd.Occupation
              : watch("principal_occupation"),
            options: OccupationOptions,
            isLoading: nicAgentLoading,
            ...(!pd?.Occupation && {
              onChange: (value: any) => {
                setValue("principal_occupation", value);
                setUserInteractedFields(
                  (prev) => new Set([...prev, "principal_occupation"]),
                );
              },
              validation: {
                required: true,
                validate: (value: any) => {
                  if (!value || (typeof value === "object" && !value.value)) {
                    return t("occupationValidation");
                  }
                  return true;
                },
              },
            }),
          },

          {
            type: pd?.Gender ? "readonly" : "autocomplete",
            name: "principal_gender",
            label: t("nicDetails.gender"),
            value: pd?.Gender ? pd.Gender : watch("principal_gender"),
            options: GenderOptions,
            isLoading: nicAgentLoading,
            ...(!pd?.Gender && {
              onChange: (value: any) => {
                setValue("principal_gender", value);
                setUserInteractedFields(
                  (prev) => new Set([...prev, "principal_gender"]),
                );
              },
              validation: {
                required: true,
                validate: (value: any) => {
                  if (!value || (typeof value === "object" && !value.value)) {
                    return t("genderValidation");
                  }
                  return true;
                },
              },
            }),
          },

          {
            type: pd?.Nationality ? "readonly" : "autocomplete",
            name: "principal_nationality",
            label: t("nicDetails.nationality"),
            value: pd?.Nationality
              ? pd.Nationality
              : watch("principal_nationality"),
            options: NationalityOptions,
            isLoading: nicAgentLoading,
            ...(!pd?.Nationality && {
              onChange: (value: any) => {
                setValue("principal_nationality", value);
                setUserInteractedFields(
                  (prev) => new Set([...prev, "principal_nationality"]),
                );
              },
              validation: {
                required: true,
                validate: (value: any) => {
                  if (!value || (typeof value === "object" && !value.value)) {
                    return t("nationalityValidation");
                  }
                  return true;
                },
              },
            }),
          },
          ...(principalNICResponse?.NICDetails?.Applicant_Code === "DW1"
            ? [
                {
                  type: "readonly" as const,
                  label: t("workerType"),
                  value: t("domestic_worker"),
                },
              ]
            : []),
        ],
      });

      if (principalNICResponse?.NICDetails?.Applicant_Code === "DW1") {
        sections.push({
          title: t("attach_title"),
          className: "attachment-section",
          gridCols: 1,
          children: [
            {
              type: "custom",
              component: (
                <AddAttachment
                  onFileSelect={handleFileSelect}
                  selectedFile={attachment}
                />
              ),
            },
          ],
        });
      }
    }

    if (claimantStatus === "representative") {
      sections.push({
        title: t("AgentType"),
        isRadio: true,
        children: [
          {
            type: "radio" as const,
            name: "agentType",
            label: t("plaintiff_type"),
            options: AgentTypeOptions,
            value: agentType,
            onChange: (v: string) => setValue("agentType", v),
            validation: { required: t("agentTypeValidation") },
          },
        ],
      });

      if (agentType) {
        if (agentType === "local_agency") {
          sections.push({
            title: t("nicDetails.agentData"),
            className: "agent-data-section",
            gridCols: 2,
            children: [
              {
                type: "readonly" as const,
                label: t("nicDetails.idNumber"),
                value: idNumber,
              },
              {
                type: "readonly" as const,
                name: "localAgent_agentName",
                label: t("nicDetails.agentName"),
                value:
                  watch("localAgent_agentName") ||
                  agentInfoData?.Agent?.AgentName ||
                  "",
                isLoading: apiLoadingStates.agent,
              },
              {
                type: "custom",
                component: (
                  <FieldWrapper
                    label={t("nicDetails.agencyNumber")}
                    labelFor="localAgent_agencyNumber"
                    invalidFeedback={errors.localAgent_agencyNumber?.message}
                  >
                    <DigitOnlyInput
                      id="localAgent_agencyNumber"
                      name="localAgent_agencyNumber"
                      placeholder="10xxxxxxxx"
                      value={String(watch("localAgent_agencyNumber") || "")}
                      onChange={(e) =>
                        setValue(
                          "localAgent_agencyNumber",
                          typeof e === "string" ? e : e.target.value,
                        )
                      }
                      onBlur={() => {
                        const v = watch("localAgent_agencyNumber") + "";
                        if (v && v.length >= 1 && v.length <= 10) {
                          onAgencyNumberChange(v);
                        }
                      }}
                      maxLength={10}
                      required
                    />
                  </FieldWrapper>
                ),
              },
              {
                type: "readonly" as const,
                name: "localAgent_agencyStatus",
                label: t("nicDetails.agencyStatus"),
                value:
                  watch("localAgent_agencyStatus") ||
                  agentInfoData?.Agent?.MandateStatus ||
                  "",
                isLoading: apiLoadingStates.agent,
              },
              {
                type: "readonly" as const,
                name: "localAgent_agencySource",
                label: t("nicDetails.agencySource"),
                value:
                  watch("localAgent_agencySource") ||
                  agentInfoData?.Agent?.MandateSource ||
                  "",
                isLoading: apiLoadingStates.agent,
              },
              {
                type: "input" as const,
                name: "localAgent_currentPlaceOfWork",
                inputType: "text",
                label: t("nicDetails.currentWorkingPlace"),
                value: watch("localAgent_currentPlaceOfWork"),
                onChange: (v: string) =>
                  setValue("localAgent_currentPlaceOfWork", v),
                validation: { required: t("workplaceValidation") },
              },
              {
                type: "input" as const,
                name: "localAgent_residencyAddress",
                inputType: "text",
                label: t("nicDetails.residenceAddress"),
                value: watch("localAgent_residencyAddress"),
                onChange: (v: string) =>
                  setValue("localAgent_residencyAddress", v),
                validation: { required: t("residenceAddressValidation") },
              },
            ],
          });

          sections.push({
            title: t("nicDetails.plaintiffData"),
            className: "plaintiff-data-section",
            gridCols: 2,
            disabled: !hasValidAgency,
            children: [
              {
                type: "custom",
                component: (() => {
                  const idValue = watch("localAgent_workerAgentIdNumber") || "";
                  return (
                    <FieldWrapper
                      label={t("nicDetails.idNumber")}
                      labelFor="localAgent_workerAgentIdNumber"
                      invalidFeedback={
                        errors.localAgent_workerAgentIdNumber?.message
                      }
                    >
                      <DigitOnlyInput
                        id="localAgent_workerAgentIdNumber"
                        name="localAgent_workerAgentIdNumber"
                        placeholder="10xxxxxxxx"
                        value={idValue}
                        onChange={(e) => {
                          const newId =
                            typeof e === "string" ? e : e.target.value;
                          setValue("localAgent_workerAgentIdNumber", newId);
                          let shouldClear = false;
                          if (
                            newId.length === 10 &&
                            !safeAllowedIds.includes(newId)
                          ) {
                            shouldClear = true;
                            toast.error(t("error.idNotUnderAgency"));
                          } else if (newId.length !== 10) {
                            shouldClear = true;
                          }
                          if (shouldClear) {
                            setValue(
                              "localAgent_workerAgentDateOfBirthHijri",
                              "",
                            );
                            setValue("localAgent_gregorianDate", "");
                            setValue("localAgent_userName", "");
                            setValue("localAgent_phoneNumber", "");
                            setValue("localAgent_region", null);
                            setValue("localAgent_city", null);
                            setValue("localAgent_occupation", null);
                            setValue("localAgent_gender", null);
                            setValue("localAgent_nationality", null);
                            clearErrors("localAgent_workerAgentIdNumber");
                          }
                        }}
                        maxLength={10}
                        disabled={!hasValidAgency}
                      />
                    </FieldWrapper>
                  );
                })(),
              },
              {
                type: "custom",
                component: (
                  <div className="flex flex-col gap-2">
                    {!hasValidAgency ||
                    (watch("localAgent_workerAgentIdNumber") || "").length !==
                      10 ||
                    !safeAllowedIds.includes(
                      watch("localAgent_workerAgentIdNumber") || "",
                    ) ? (
                      <div style={{ pointerEvents: "none", opacity: 0.5 }}>
                        <HijriDatePickerInput
                          control={control}
                          name="localAgent_workerAgentDateOfBirthHijri"
                          label={t("nicDetails.dobHijri")}
                          rules={{ required: true }}
                          onChangeHandler={(date, _onChange) => {
                            userPickedDateRef.current = true;
                            if (!date || Array.isArray(date)) {
                              setValue("localAgent_gregorianDate", "");
                              return;
                            }
                            const gregorianStr = date
                              .convert(gregorian, gregorianLocaleEn)
                              .format("YYYY/MM/DD");
                            const gregorianStorage = gregorianStr.replace(
                              /\//g,
                              "",
                            );
                            if (
                              watch("localAgent_gregorianDate") !==
                              gregorianStorage
                            ) {
                              setValue(
                                "localAgent_gregorianDate",
                                gregorianStorage,
                              );
                            }
                          }}
                          notRequired={false}
                          isDateOfBirth={true}
                        />
                      </div>
                    ) : (
                      <HijriDatePickerInput
                        control={control}
                        name="localAgent_workerAgentDateOfBirthHijri"
                        label={t("nicDetails.dobHijri")}
                        rules={{ required: true }}
                        onChangeHandler={(date, _onChange) => {
                          userPickedDateRef.current = true;
                          if (!date || Array.isArray(date)) {
                            setValue("localAgent_gregorianDate", "");
                            return;
                          }
                          const gregorianStr = date
                            .convert(gregorian, gregorianLocaleEn)
                            .format("YYYY/MM/DD");
                          const gregorianStorage = gregorianStr.replace(
                            /\//g,
                            "",
                          );
                          if (
                            watch("localAgent_gregorianDate") !==
                            gregorianStorage
                          ) {
                            setValue(
                              "localAgent_gregorianDate",
                              gregorianStorage,
                            );
                          }

                          if (
                            hasValidAgency &&
                            (watch("localAgent_workerAgentIdNumber") || "")
                              .length === 10 &&
                            safeAllowedIds.includes(
                              watch("localAgent_workerAgentIdNumber") || "",
                            )
                          ) {
                            if (shouldFetchNic) refetchNICAgent();
                          }
                        }}
                        notRequired={false}
                        isDateOfBirth={true}
                      />
                    )}
                    <GregorianDateDisplayInput
                      control={control}
                      name="localAgent_gregorianDate"
                      label={t("nicDetails.dobGrog")}
                      notRequired={false}
                    />
                  </div>
                ),
              },
              {
                type:
                  localAgentNICResponse?.NICDetails?.PlaintiffName ||
                  watch("localAgent_userName")
                    ? "readonly"
                    : "input",
                name: "localAgent_userName",
                label: t("nicDetails.name"),
                value:
                  localAgentNICResponse?.NICDetails?.PlaintiffName ||
                  watch("localAgent_userName"),
                ...(localAgentNICResponse?.NICDetails?.PlaintiffName ||
                watch("localAgent_userName")
                  ? {}
                  : {
                      onChange: (v: string) =>
                        setValue("localAgent_userName", v),
                    }),
                validation: { required: t("nameValidation") },
                disabled: !(
                  hasValidAgency &&
                  (watch("localAgent_workerAgentIdNumber") || "").length ===
                    10 &&
                  safeAllowedIds.includes(
                    watch("localAgent_workerAgentIdNumber") || "",
                  ) &&
                  !!watch("localAgent_workerAgentDateOfBirthHijri")
                ),
              },
              {
                type: "input",
                name: "localAgent_phoneNumber",
                label: t("nicDetails.phoneNumber"),
                inputType: "text",
                placeholder: "05xxxxxxxx",
                value: watch("localAgent_phoneNumber"),
                onChange: (v: string) => setValue("localAgent_phoneNumber", v),
                validation: {
                  required: t("phoneNumberValidation"),
                  pattern: {
                    value: /^05\d{8}$/,
                    message: t("phoneNumberValidationٍstartWith"),
                  },
                },
                disabled: !(
                  hasValidAgency &&
                  (watch("localAgent_workerAgentIdNumber") || "").length ===
                    10 &&
                  safeAllowedIds.includes(
                    watch("localAgent_workerAgentIdNumber") || "",
                  ) &&
                  !!watch("localAgent_workerAgentDateOfBirthHijri")
                ),
              },
              {
                type: "autocomplete",
                name: "localAgent_region",
                isLoading: false,
                label: t("nicDetails.region"),
                value: watch("localAgent_region"),
                options: RegionOptions || [],
                validation: { required: t("regionValidation") },
                onChange: (value: any) => {
                  setValue("localAgent_region", value);
                  setValue("localAgent_city", null);
                },
                disabled: !(
                  hasValidAgency &&
                  (watch("localAgent_workerAgentIdNumber") || "").length ===
                    10 &&
                  safeAllowedIds.includes(
                    watch("localAgent_workerAgentIdNumber") || "",
                  ) &&
                  !!watch("localAgent_workerAgentDateOfBirthHijri")
                ),
              },
              {
                type: "autocomplete",
                name: "localAgent_city",
                isLoading: false,
                label: t("nicDetails.city"),
                value: watch("localAgent_city"),
                options: CityOptions || [],
                validation: { required: t("cityValidation") },
                disabled: !(
                  hasValidAgency &&
                  (watch("localAgent_workerAgentIdNumber") || "").length ===
                    10 &&
                  safeAllowedIds.includes(
                    watch("localAgent_workerAgentIdNumber") || "",
                  ) &&
                  !!watch("localAgent_workerAgentDateOfBirthHijri")
                ),
              },
              {
                isLoading: nicAgentLoading,
                type: "autocomplete",
                name: "localAgent_occupation",
                label: t("nicDetails.occupation"),
                value: watch("localAgent_occupation"),
                options: OccupationOptions || [],
                validation: { required: t("occupationValidation") },
                disabled: !(
                  hasValidAgency &&
                  (watch("localAgent_workerAgentIdNumber") || "").length ===
                    10 &&
                  safeAllowedIds.includes(
                    watch("localAgent_workerAgentIdNumber") || "",
                  ) &&
                  !!watch("localAgent_workerAgentDateOfBirthHijri")
                ),
              },
              {
                isLoading: nicAgentLoading,
                type: "autocomplete",
                name: "localAgent_gender",
                label: t("nicDetails.gender"),
                value: watch("localAgent_gender"),
                options: GenderOptions || [],
                validation: { required: t("genderValidation") },
                disabled: !(
                  hasValidAgency &&
                  (watch("localAgent_workerAgentIdNumber") || "").length ===
                    10 &&
                  safeAllowedIds.includes(
                    watch("localAgent_workerAgentIdNumber") || "",
                  ) &&
                  !!watch("localAgent_workerAgentDateOfBirthHijri")
                ),
              },
              {
                isLoading: nicAgentLoading,
                type: "autocomplete",
                name: "localAgent_nationality",
                label: t("nicDetails.nationality"),
                value: watch("localAgent_nationality"),
                options: NationalityOptions || [],
                validation: { required: t("nationalityValidation") },
                disabled: !(
                  hasValidAgency &&
                  (watch("localAgent_workerAgentIdNumber") || "").length ===
                    10 &&
                  safeAllowedIds.includes(
                    watch("localAgent_workerAgentIdNumber") || "",
                  ) &&
                  !!watch("localAgent_workerAgentDateOfBirthHijri")
                ),
              },
            ],
          });
        }

        if (agentType === "external_agency") {
          sections.push({
            title: t("nicDetails.agentData"),
            className: "agent-data-section",
            gridCols: 2,
            children: [
              {
                type: "readonly" as const,
                label: t("nicDetails.idNumber"),
                value: idNumber,
              },
              {
                type: "input" as const,
                name: "externalAgent_agentName",
                label: t("nicDetails.agentName"),
                value: watch("externalAgent_agentName"),
                onChange: (v: string) => {
                  setValue("externalAgent_agentName", v);
                  setUserInteractedFields(
                    (prev) => new Set([...prev, "externalAgent_agentName"]),
                  );
                },
                validation: { required: t("agentNameValidation") },
              },
              {
                type: "custom",
                component: (
                  <FieldWrapper
                    label={t("nicDetails.agencyNumber")}
                    labelFor="externalAgent_agencyNumber"
                    invalidFeedback={errors.externalAgent_agencyNumber?.message}
                  >
                    <DigitOnlyInput
                      id="externalAgent_agencyNumber"
                      name="externalAgent_agencyNumber"
                      placeholder={t("nicDetails.agencyNumberPlaceholder")}
                      value={String(watch("externalAgent_agencyNumber") || "")}
                      onChange={(e) => {
                        setValue(
                          "externalAgent_agencyNumber",
                          typeof e === "string" ? e : e.target.value,
                        );
                        setUserInteractedFields(
                          (prev) =>
                            new Set([...prev, "externalAgent_agencyNumber"]),
                        );
                      }}
                      maxLength={10}
                      required
                    />
                  </FieldWrapper>
                ),
                validation: { required: t("agencyNumberValidation") },
              },
              {
                type: "input" as const,
                name: "externalAgent_agencyStatus",
                label: t("nicDetails.agencyStatus"),
                value: watch("externalAgent_agencyStatus"),
                onChange: (v: string) => {
                  setValue("externalAgent_agencyStatus", v);
                  setUserInteractedFields(
                    (prev) => new Set([...prev, "externalAgent_agencyStatus"]),
                  );
                },
                validation: { required: t("agencyStatusValidation") },
              },
              {
                type: "input" as const,
                name: "externalAgent_agencySource",
                label: t("nicDetails.agencySource"),
                value: watch("externalAgent_agencySource"),
                onChange: (v: string) => {
                  setValue("externalAgent_agencySource", v);
                  setUserInteractedFields(
                    (prev) => new Set([...prev, "externalAgent_agencySource"]),
                  );
                },
                validation: { required: t("agencySourceValidation") },
              },
              {
                type: "input" as const,
                name: "externalAgent_currentPlaceOfWork",
                inputType: "text",
                label: t("nicDetails.currentWorkingPlace"),
                value: watch("externalAgent_currentPlaceOfWork"),
                onChange: (v: string) => {
                  setValue("externalAgent_currentPlaceOfWork", v);
                  setUserInteractedFields(
                    (prev) =>
                      new Set([...prev, "externalAgent_currentPlaceOfWork"]),
                  );
                },
                validation: { required: t("workplaceValidation") },
              },
              {
                type: "input" as const,
                name: "externalAgent_residencyAddress",
                inputType: "text",
                label: t("nicDetails.residenceAddress"),
                value: watch("externalAgent_residencyAddress"),
                onChange: (v: string) => {
                  setValue("externalAgent_residencyAddress", v);
                  setUserInteractedFields(
                    (prev) =>
                      new Set([...prev, "externalAgent_residencyAddress"]),
                  );
                },
                validation: { required: t("residenceAddressValidation") },
              },
              {
                type: "input" as const,
                name: "externalAgent_agentPhoneNumber",
                label: t("nicDetails.agentPhoneNumber"),
                inputType: "text",
                placeholder: t("nicDetails.phonePlaceholder"),
                value: watch("externalAgent_agentPhoneNumber"),
                onChange: (v: string) => {
                  setValue("externalAgent_agentPhoneNumber", v);
                  setUserInteractedFields(
                    (prev) =>
                      new Set([...prev, "externalAgent_agentPhoneNumber"]),
                  );
                },
                validation: {
                  required: t("phoneNumberValidation"),
                  pattern: {
                    value: /^05\d{8}$/,
                    message: t("phoneNumberValidationٍstartWith"),
                  },
                },
              },
            ],
          });

          sections.push({
            title: t("nicDetails.plaintiffData"),
            className: "plaintiff-data-section",
            gridCols: 2,
            children: [
              {
                type: "custom",
                component: (
                  <FieldWrapper
                    label={t("nicDetails.idNumber")}
                    labelFor="externalAgent_workerAgentIdNumber"
                    invalidFeedback={
                      errors.externalAgent_workerAgentIdNumber?.message
                    }
                  >
                    <DigitOnlyInput
                      id="externalAgent_workerAgentIdNumber"
                      name="externalAgent_workerAgentIdNumber"
                      placeholder="10xxxxxxxx"
                      value={String(
                        watch("externalAgent_workerAgentIdNumber") || "",
                      )}
                      onChange={(e) => {
                        setValue(
                          "externalAgent_workerAgentIdNumber",
                          typeof e === "string" ? e : e.target.value,
                        );
                        setUserInteractedFields(
                          (prev) =>
                            new Set([
                              ...prev,
                              "externalAgent_workerAgentIdNumber",
                            ]),
                        );
                      }}
                      maxLength={10}
                      required
                    />
                  </FieldWrapper>
                ),
                validation: { required: t("idNumberValidation") },
              },
              {
                type: "custom",
                component: (
                  <div className="flex flex-col gap-2">
                    <HijriDatePickerInput
                      control={control}
                      name="externalAgent_workerAgentDateOfBirthHijri"
                      label={t("nicDetails.dobHijri")}
                      rules={{ required: true }}
                      onChangeHandler={(date, _onChange) => {
                        userPickedDateRef.current = true;
                        setUserInteractedFields(
                          (prev) =>
                            new Set([
                              ...prev,
                              "externalAgent_workerAgentDateOfBirthHijri",
                            ]),
                        );
                        if (!date || Array.isArray(date)) {
                          setValue("externalAgent_gregorianDate", "");
                          return;
                        }
                        const gregorianStr = date
                          .convert(gregorian, gregorianLocaleEn)
                          .format("YYYY/MM/DD");
                        const gregorianStorage = gregorianStr.replace(
                          /\//g,
                          "",
                        );
                        if (
                          watch("externalAgent_gregorianDate") !==
                          gregorianStorage
                        ) {
                          setValue(
                            "externalAgent_gregorianDate",
                            gregorianStorage,
                          );
                        }
                      }}
                      notRequired={false}
                      isDateOfBirth={true}
                    />
                    <GregorianDateDisplayInput
                      control={control}
                      name="externalAgent_gregorianDate"
                      label={t("nicDetails.dobGrog")}
                      notRequired={false}
                    />
                  </div>
                ),
                validation: { required: t("dateOfBirthValidation") },
              },
              {
                type:
                  externalAgentNICResponse?.NICDetails?.PlaintiffName ||
                  watch("externalAgent_userName")
                    ? "readonly"
                    : "input",
                name: "externalAgent_userName",
                label: t("nicDetails.name"),
                value:
                  externalAgentNICResponse?.NICDetails?.PlaintiffName ||
                  watch("externalAgent_userName"),
                ...(externalAgentNICResponse?.NICDetails?.PlaintiffName ||
                watch("externalAgent_userName")
                  ? {}
                  : {
                      onChange: (v: string) => {
                        setValue("externalAgent_userName", v);
                        setUserInteractedFields(
                          (prev) =>
                            new Set([...prev, "externalAgent_userName"]),
                        );
                      },
                    }),
                validation: { required: t("nameValidation") },
              },
              {
                type: "input",
                name: "externalAgent_phoneNumber",
                label: t("nicDetails.phoneNumber"),
                inputType: "text",
                placeholder: t("nicDetails.phonePlaceholder"),
                value: watch("externalAgent_phoneNumber"),
                onChange: (v: string) => {
                  setValue("externalAgent_phoneNumber", v);
                  setUserInteractedFields(
                    (prev) => new Set([...prev, "externalAgent_phoneNumber"]),
                  );
                },
                validation: {
                  required: t("phoneNumberValidation"),
                  pattern: {
                    value: /^05\d{8}$/,
                    message: t("phoneNumberValidationٍstartWith"),
                  },
                },
              },
              {
                type: "autocomplete",
                name: "externalAgent_region",
                isLoading: false,
                label: t("nicDetails.region"),
                value: watch("externalAgent_region"),
                options: RegionOptions || [],
                validation: { required: t("regionValidation") },
                onChange: (value: any) => {
                  setValue("externalAgent_region", value);
                  setValue("externalAgent_city", null);
                  setUserInteractedFields(
                    (prev) => new Set([...prev, "externalAgent_region"]),
                  );
                },
              },
              {
                type: "autocomplete",
                name: "externalAgent_city",
                isLoading: false,
                label: t("nicDetails.city"),
                value: watch("externalAgent_city"),
                options: CityOptions || [],
                validation: { required: t("cityValidation") },
                onChange: (value: any) => {
                  setValue("externalAgent_city", value);
                  setUserInteractedFields(
                    (prev) => new Set([...prev, "externalAgent_city"]),
                  );
                },
              },
              {
                isLoading: nicAgentLoading,
                type: "autocomplete",
                name: "externalAgent_occupation",
                label: t("nicDetails.occupation"),
                value: watch("externalAgent_occupation"),
                options: OccupationOptions || [],
                validation: { required: t("occupationValidation") },
                onChange: (value: any) => {
                  setValue("externalAgent_occupation", value);
                  setUserInteractedFields(
                    (prev) => new Set([...prev, "externalAgent_occupation"]),
                  );
                },
              },
              {
                isLoading: nicAgentLoading,
                type: "autocomplete",
                name: "externalAgent_gender",
                label: t("nicDetails.gender"),
                value: watch("externalAgent_gender"),
                options: GenderOptions || [],
                validation: { required: t("genderValidation") },
                onChange: (value: any) => {
                  setValue("externalAgent_gender", value);
                  setUserInteractedFields(
                    (prev) => new Set([...prev, "externalAgent_gender"]),
                  );
                },
              },
              {
                isLoading: nicAgentLoading,
                type: "autocomplete",
                name: "externalAgent_nationality",
                label: t("nicDetails.nationality"),
                value: watch("externalAgent_nationality"),
                options: NationalityOptions || [],
                validation: { required: t("nationalityValidation") },
                onChange: (value: any) => {
                  setValue("externalAgent_nationality", value);
                  setUserInteractedFields(
                    (prev) => new Set([...prev, "externalAgent_nationality"]),
                  );
                },
              },
            ],
          });
        }
      }

      if (
        agentType &&
        agentType !== "local_agency" &&
        agentType !== "external_agency"
      ) {
        sections.push({
          title: t("nicDetails.plaintiffData"),
          className: "plaintiff-data-section",
          gridCols: 2,
          disabled: agentType === "local_agency" && !hasValidAgency,

          children: [
            {
              type: "custom",
              component: (
                <FieldWrapper
                  label={t("nicDetails.idNumber")}
                  labelFor="workerAgentIdNumber"
                  invalidFeedback={errors.workerAgentIdNumber?.message}
                >
                  <DigitOnlyInput
                    id="workerAgentIdNumber"
                    name="workerAgentIdNumber"
                    placeholder="10xxxxxxxx"
                    value={String(watch("workerAgentIdNumber") || "")}
                    onChange={(e) => {
                      const v = typeof e === "string" ? e : e.target.value;
                      setValue("workerAgentIdNumber", v);
                    }}
                    onBlur={() => {
                      if (hasValidAgency && shouldFetchNic) {
                        refetchNICAgent();
                      }
                    }}
                    maxLength={10}
                    disabled={
                      agentType === "local_agency" &&
                      (!hasMandateNumber || !hasValidAgency)
                    }
                  />
                </FieldWrapper>
              ),
            },
            {
              type: "custom",
              component: (
                <div className="flex flex-col gap-2">
                  <HijriDatePickerInput
                    control={control}
                    name="workerAgentDateOfBirthHijri"
                    label={t("nicDetails.dobHijri")}
                    rules={{ required: true }}
                    onChangeHandler={(date, _onChange) => {
                      userPickedDateRef.current = true;
                      if (!date || Array.isArray(date)) {
                        setValue("localAgent_gregorianDate", "");
                        return;
                      }
                      const gregorianStr = date
                        .convert(gregorian, gregorianLocaleEn)
                        .format("YYYY/MM/DD");
                      const gregorianStorage = gregorianStr.replace(/\//g, "");

                      if (
                        watch("localAgent_gregorianDate") !== gregorianStorage
                      ) {
                        setValue("localAgent_gregorianDate", gregorianStorage);
                      }

                      if (shouldFetchNic) refetchNICAgent();
                    }}
                    notRequired={false}
                    isDateOfBirth={true}
                  />
                  <GregorianDateDisplayInput
                    control={control}
                    name="localAgent_gregorianDate"
                    label={t("nicDetails.dobGrog")}
                    notRequired={false}
                  />
                </div>
              ),
            },
            {
              type: representativeNICResponse?.NICDetails?.PlaintiffName
                ? "readonly"
                : "input",
              label: t("nicDetails.name"),
              value:
                representativeNICResponse?.NICDetails?.PlaintiffName ||
                watch("userName"),
              isLoading: nicAgentLoading,
              name: "userName",
              ...(representativeNICResponse?.NICDetails?.PlaintiffName
                ? { inputType: "text" }
                : {}),
              ...(!representativeNICResponse?.NICDetails?.PlaintiffName && {
                validation: { required: t("nameValidation") },
              }),
              disabled:
                agentType === "local_agency" &&
                (!hasMandateNumber || !hasValidAgency),
            },
            {
              type: "input",
              name: "phoneNumber",
              label: t("nicDetails.phoneNumber"),
              inputType: "text",
              placeholder: "05xxxxxxxx",
              value: watch("phoneNumber"),
              onChange: (v: string) => setValue("phoneNumber", v),
              validation: {
                required: t("phoneNumberValidation"),
                pattern: {
                  value: /^05\d{8}$/,
                  message: t("phoneNumberValidationٍstartWith"),
                },
              },
              disabled:
                agentType === "local_agency" &&
                (!hasMandateNumber || !hasValidAgency),
            },
            {
              type: representativeNICResponse?.NICDetails?.Region
                ? "readonly"
                : "autocomplete",
              name: "plaintiffRegion",
              isLoading: false,
              label: t("nicDetails.region"),
              value:
                representativeNICResponse?.NICDetails?.Region ||
                watch("plaintiffRegion"),
              ...(representativeNICResponse?.NICDetails?.Region
                ? {}
                : {
                    options: RegionOptions || [],
                    validation: { required: t("regionValidation") },
                  }),
              disabled:
                agentType === "local_agency" &&
                (!hasMandateNumber || !hasValidAgency),
            },
            {
              type: representativeNICResponse?.NICDetails?.City
                ? "readonly"
                : "autocomplete",
              name: "plaintiffCity",
              isLoading: false,
              label: t("nicDetails.city"),
              value:
                representativeNICResponse?.NICDetails?.City ||
                watch("plaintiffCity"),
              ...(representativeNICResponse?.NICDetails?.City
                ? {}
                : {
                    options: CityOptions || [],
                    validation: { required: t("cityValidation") },
                  }),
              disabled:
                agentType === "local_agent" &&
                (!hasMandateNumber || !hasValidAgency),
            },
            {
              isLoading: nicAgentLoading,
              type: representativeNICResponse?.NICDetails?.Occupation
                ? "readonly"
                : "autocomplete",
              name: "occupation",
              label: t("nicDetails.occupation"),
              value:
                representativeNICResponse?.NICDetails?.Occupation ||
                watch("occupation"),
              ...(representativeNICResponse?.NICDetails?.Occupation
                ? {}
                : {
                    options: OccupationOptions || [],
                    validation: { required: t("occupationValidation") },
                  }),
              disabled:
                agentType === "local_agency" &&
                (!hasMandateNumber || !hasValidAgency),
            },
            {
              isLoading: nicAgentLoading,
              type: representativeNICResponse?.NICDetails?.Gender
                ? "readonly"
                : "autocomplete",
              name: "gender",
              label: t("nicDetails.gender"),
              value:
                representativeNICResponse?.NICDetails?.Gender ||
                watch("gender"),
              ...(representativeNICResponse?.NICDetails?.Gender
                ? {}
                : {
                    options: GenderOptions || [],
                    validation: { required: t("genderValidation") },
                  }),
              disabled:
                agentType === "local_agency" &&
                (!hasMandateNumber || !hasValidAgency),
            },
            {
              isLoading: nicAgentLoading,
              type: representativeNICResponse?.NICDetails?.Nationality
                ? "readonly"
                : "autocomplete",
              name: "nationality",
              label: t("nicDetails.nationality"),
              value:
                representativeNICResponse?.NICDetails?.Nationality ||
                watch("nationality"),
              ...(representativeNICResponse?.NICDetails?.Nationality
                ? {}
                : {
                    options: NationalityOptions || [],
                    validation: { required: t("nationalityValidation") },
                  }),
              disabled:
                agentType === "local_agency" &&
                (!hasMandateNumber || !hasValidAgency),
            },
          ],
        });
      }

      if (
        unprofessionalLetterAttachments &&
        unprofessionalLetterAttachments.length > 0
      ) {
        sections.push({
          title: t(
            "unprofessionalLetterAttachments.title",
            "Unprofessional Letter Attachments",
          ),
          className: "attachment-section",
          gridCols: 1,
          children: unprofessionalLetterAttachments.map(
            (file: any, idx: number) => ({
              type: "custom" as const,
              component: (
                <FileAttachment
                  key={file.FileKey || idx}
                  fileName={
                    file.FileName ||
                    t("unprofessionalLetterAttachments.unnamed", "Unnamed File")
                  }
                  onView={() => {
                    window.open(
                      `/api/file/download?key=${encodeURIComponent(
                        file.FileKey,
                      )}`,
                    );
                  }}
                  className="w-full"
                />
              ),
            }),
          ),
        });
      }
    }

    return sections;
  };

  const ClaimantSelectSection = [];

  if (userType === "Worker" || plaintiffStatus === "leg_rep_worker") {
    ClaimantSelectSection.push({
      isRadio: true,
      children: [
        {
          type: "radio",
          name: "claimantStatus",
          label: t("claimantStatus"),
          options: ClaimantStatusRadioOptions,
          value: claimantStatus,
          onChange: (value: string) => {
            setValue("claimantStatus", value);
          },
          validation: { required: "Region is required" },
        },
      ],
    });
  }

  const conditionalSections = [];

  if (plaintiffStatus === "legal_representative") {
    conditionalSections.push(
      {
        data: {
          type: "readonly",
          fields: [
            {
              label: LegalRep("plaintiffDetails.MainCategoryGovernmentEntity"),
              value: selectedMainCategory?.label || "",
            },
            {
              label: LegalRep("plaintiffDetails.SubcategoryGovernmentEntity"),
              value: selectedSubCategory?.label,
            },
          ],
        },
      },
      {
        title: LegalRep("LegalRepresentative"),
        data: {
          type: "readonly",
          fields: [
            {
              label: LegalRep(
                "LegalRepresentativeDetails.LegalRepresentativeName",
              ),
              value: govRepDetail?.RepName,
            },
            {
              label: LegalRep(
                "LegalRepresentativeDetails.LegalRepresentativeID",
              ),
              value: govRepDetail?.RepNationalid,
            },
            {
              label: LegalRep("LegalRepresentativeDetails.MobileNumber"),
              value: govRepDetail?.RepMobileNumber,
            },
            {
              label: LegalRep("LegalRepresentativeDetails.EmailAddress"),
              value: govRepDetail?.EmailAddress,
            },
          ],
        },
      },
    );
  }

  const OTPSection = OTPFormLayout({
    watch,
    setValue,
  });

  const formLayout: SectionLayout[] = [
    ...baseSections,
    ...ClaimantSelectSection,
    ...conditionalSections,
    ...getWorkerSections(),

    ...OTPSection,
  ].filter(Boolean) as SectionLayout[];

  useEffect(() => {
    const setFormValuesFromData = (data: any) => {
      if (!data) return;

      if (data?.PlaintiffName || data?.name) {
        setValue("userName", data?.PlaintiffName || data?.name || "", {
          shouldValidate: false,
        });

        setValue(
          "principal_userName",
          data?.PlaintiffName || data?.name || "",
          {
            shouldValidate: false,
          },
        );

        clearErrors("userName");
        clearErrors("principal_userName");
      }

      if (
        data?.Plaintiff_Region_Code ||
        data?.Plaintiff_Region ||
        data?.Region ||
        data?.region?.value
      ) {
        const regionValue = {
          value:
            data?.Region_Code ||
            data?.Plaintiff_Region_Code ||
            data?.Plaintiff_Region ||
            data?.Region ||
            data?.region?.value ||
            "",
          label:
            data?.Plaintiff_Region || data?.Region || data?.region?.label || "",
        };

        setValue("plaintiffRegion", regionValue, {
          shouldValidate: false,
        });

        setValue("principal_region", regionValue, {
          shouldValidate: false,
        });

        clearErrors("plaintiffRegion");
        clearErrors("principal_region");
      }

      if (
        data?.City_Code ||
        data?.Plaintiff_City_Code ||
        data?.Plaintiff_City ||
        data?.City ||
        data?.city?.value
      ) {
        const cityValue = {
          value:
            data?.City_Code ||
            data?.Plaintiff_City_Code ||
            data?.Plaintiff_City ||
            data?.City ||
            data?.city?.value ||
            "",
          label: data?.Plaintiff_City || data?.City || data?.city?.label || "",
        };
        setValue("plaintiffCity", cityValue, {
          shouldValidate: false,
        });

        setValue("principal_city", cityValue, {
          shouldValidate: false,
        });

        clearErrors("plaintiffCity");
        clearErrors("principal_city");
      }

      if (
        data?.Occupation_Code ||
        data?.Plaintiff_Occupation_Code ||
        data?.Plaintiff_Occupation ||
        data?.Occupation ||
        data?.occupation?.value
      ) {
        const occupationValue = {
          value:
            data?.Occupation_Code ||
            data?.Plaintiff_Occupation_Code ||
            data?.Plaintiff_Occupation ||
            data?.Occupation ||
            data?.occupation?.value ||
            "",
          label:
            data?.Plaintiff_Occupation ||
            data?.Occupation ||
            data?.occupation?.label ||
            "",
        };
        setValue("occupation", occupationValue, {
          shouldValidate: false,
        });

        setValue("principal_occupation", occupationValue, {
          shouldValidate: false,
        });

        clearErrors("occupation");
        clearErrors("principal_occupation");
      }

      if (
        data?.Gender_Code ||
        data?.Plaintiff_Gender_Code ||
        data?.Plaintiff_Gender ||
        data?.Gender ||
        data?.gender?.value
      ) {
        const genderValue = {
          value:
            data?.Gender_Code ||
            data?.Plaintiff_Gender_Code ||
            data?.Plaintiff_Gender ||
            data?.Gender ||
            data?.gender?.value ||
            "",
          label:
            data?.Plaintiff_Gender || data?.Gender || data?.gender?.label || "",
        };
        setValue("gender", genderValue, {
          shouldValidate: false,
        });

        setValue("principal_gender", genderValue, {
          shouldValidate: false,
        });

        clearErrors("gender");
        clearErrors("principal_gender");
      }

      if (
        data?.Nationality_Code ||
        data?.Plaintiff_Nationality_Code ||
        data?.Plaintiff_Nationality ||
        data?.Nationality ||
        data?.nationality?.value
      ) {
        const nationalityValue = {
          value:
            data?.Nationality_Code ||
            data?.Plaintiff_Nationality_Code ||
            data?.Plaintiff_Nationality ||
            data?.Nationality ||
            data?.nationality?.value ||
            "",
          label:
            data?.Plaintiff_Nationality ||
            data?.Nationality ||
            data?.nationality?.label ||
            "",
        };
        setValue("nationality", nationalityValue, {
          shouldValidate: false,
        });

        setValue("principal_nationality", nationalityValue, {
          shouldValidate: false,
        });

        clearErrors("nationality");
        clearErrors("principal_nationality");
      }

      if (
        data?.Plaintiff_ApplicantBirthDate ||
        data?.DateOfBirthHijri ||
        data?.hijriDate
      ) {
        setValue(
          "hijriDate",
          data?.Plaintiff_ApplicantBirthDate ||
            data?.DateOfBirthHijri ||
            data?.hijriDate ||
            "",
          {
            shouldValidate: false,
          },
        );

        setValue(
          "principal_hijriDate",
          data?.Plaintiff_ApplicantBirthDate ||
            data?.DateOfBirthHijri ||
            data?.hijriDate ||
            "",
          {
            shouldValidate: false,
          },
        );
      }

      if (
        data?.Plaintiff_ApplicantBirthDate ||
        data?.DateOfBirthGregorian ||
        data?.gregorianDate
      ) {
        setValue(
          "gregorianDate",
          data?.Plaintiff_ApplicantBirthDate ||
            data?.DateOfBirthGregorian ||
            data?.gregorianDate ||
            "",
          {
            shouldValidate: false,
          },
        );

        setValue(
          "principal_gregorianDate",
          data?.Plaintiff_ApplicantBirthDate ||
            data?.DateOfBirthGregorian ||
            data?.gregorianDate ||
            "",
          {
            shouldValidate: false,
          },
        );
      }

      if (
        data?.Plaintiff_PhoneNumber ||
        data?.Plaintiff_MobileNumber ||
        data?.PhoneNumber ||
        data?.phoneNumber
      ) {
        const phoneValue =
          data?.Plaintiff_PhoneNumber ||
          data?.Plaintiff_MobileNumber ||
          data?.PhoneNumber ||
          data?.phoneNumber;

        setValue("phoneNumber", phoneValue.toString(), {
          shouldValidate: false,
        });

        setValue("principal_phoneNumber", phoneValue.toString(), {
          shouldValidate: false,
        });

        clearErrors("phoneNumber");
        clearErrors("principal_phoneNumber");
      } else {
      }
      if (data?.Agent_PhoneNumber || data?.agentPhoneNumber) {
        setValue(
          "agentPhoneNumber",
          (data?.Agent_PhoneNumber || data?.agentPhoneNumber).toString(),
          {
            shouldValidate: false,
          },
        );
      }
    };

    if (principalNICResponse?.NICDetails) {
      setFormValuesFromData(principalNICResponse.NICDetails);
    }

    if (caseData) {
      if (caseData?.PlaintiffType_Code === "Self(Worker)") {
        setFormValuesFromData(caseData);
      } else if (caseData?.PlaintiffType_Code === "Agent") {
      } else {
        setFormValuesFromData(caseData);
      }
    } else {
    }
  }, [principalNICResponse, caseData, setValue, trigger, clearErrors, watch]);

  useEffect(() => {
    const handleAgentPrefilling = (data: any) => {
      if (!data) return;

      if (data.PlaintiffType_Code === "Agent") {
        setValue("claimantStatus", "representative");

        if (data.CertifiedBy_Code === "CB2") {
          setValue("agentType", "external_agency");
        } else if (data.CertifiedBy_Code === "CB1") {
          setValue("agentType", "local_agency");
        }

        if (data.Agent_AgentID) {
          setValue("idNumber", data.Agent_AgentID);
        }

        if (data.Agent_Name) {
          if (data.CertifiedBy_Code === "CB1") {
            setValue("localAgent_agentName", data.Agent_Name);
          } else if (data.CertifiedBy_Code === "CB2") {
            setValue("externalAgent_agentName", data.Agent_Name);
          }
        }

        if (data.Agent_PhoneNumber) {
          if (data.CertifiedBy_Code === "CB1") {
            setValue("agentPhoneNumber", data.Agent_PhoneNumber);
          } else if (data.CertifiedBy_Code === "CB2") {
            setValue("externalAgent_agentPhoneNumber", data.Agent_PhoneNumber);
          }
        }

        if (data.Agent_MandateNumber) {
          if (data.CertifiedBy_Code === "CB1") {
            setValue("localAgent_agencyNumber", data.Agent_MandateNumber);
          } else if (data.CertifiedBy_Code === "CB2") {
            setValue("externalAgent_agencyNumber", data.Agent_MandateNumber);
          }
        }

        if (data.Agent_MandateStatus) {
          if (data.CertifiedBy_Code === "CB1") {
            setValue("localAgent_agencyStatus", data.Agent_MandateStatus);
          } else if (data.CertifiedBy_Code === "CB2") {
            setValue("externalAgent_agencyStatus", data.Agent_MandateStatus);
          }
        }

        if (data.Agent_MandateSource) {
          if (data.CertifiedBy_Code === "CB1") {
            setValue("localAgent_agencySource", data.Agent_MandateSource);
          } else if (data.CertifiedBy_Code === "CB2") {
            setValue("externalAgent_agencySource", data.Agent_MandateSource);
          }
        }

        if (data.Agent_ResidencyAddress) {
          if (data.CertifiedBy_Code === "CB1") {
            setValue(
              "localAgent_residencyAddress",
              data.Agent_ResidencyAddress,
            );
          } else if (data.CertifiedBy_Code === "CB2") {
            setValue(
              "externalAgent_residencyAddress",
              data.Agent_ResidencyAddress,
            );
          }
        }

        if (data.Agent_CurrentPlaceOfWork) {
          if (data.CertifiedBy_Code === "CB1") {
            setValue(
              "localAgent_currentPlaceOfWork",
              data.Agent_CurrentPlaceOfWork,
            );
          } else if (data.CertifiedBy_Code === "CB2") {
            setValue(
              "externalAgent_currentPlaceOfWork",
              data.Agent_CurrentPlaceOfWork,
            );
          }
        }

        if (data.PlaintiffName) {
          if (data.CertifiedBy_Code === "CB1") {
            setValue("localAgent_userName", data.PlaintiffName);
          } else if (data.CertifiedBy_Code === "CB2") {
            setValue("externalAgent_userName", data.PlaintiffName);
          }
        }

        if (data.PlaintiffId) {
          if (data.CertifiedBy_Code === "CB1") {
            setValue("localAgent_workerAgentIdNumber", data.PlaintiffId);
          } else if (data.CertifiedBy_Code === "CB2") {
            setValue("externalAgent_workerAgentIdNumber", data.PlaintiffId);
          }
        }

        if (data.PlaintiffHijiriDOB) {
          if (data.CertifiedBy_Code === "CB1") {
            setValue(
              "localAgent_workerAgentDateOfBirthHijri",
              data.PlaintiffHijiriDOB,
            );
          } else if (data.CertifiedBy_Code === "CB2") {
            setValue(
              "externalAgent_workerAgentDateOfBirthHijri",
              data.PlaintiffHijiriDOB,
            );
          }
        }

        if (data.Plaintiff_ApplicantBirthDate) {
          if (data.CertifiedBy_Code === "CB1") {
            setValue(
              "localAgent_gregorianDate",
              data.Plaintiff_ApplicantBirthDate,
            );
          } else if (data.CertifiedBy_Code === "CB2") {
            setValue(
              "externalAgent_gregorianDate",
              data.Plaintiff_ApplicantBirthDate,
            );
          }
        }

        if (data.Plaintiff_PhoneNumber || data.Plaintiff_MobileNumber) {
          const phoneValue =
            data.Plaintiff_PhoneNumber || data.Plaintiff_MobileNumber;

          if (data.CertifiedBy_Code === "CB1") {
            setValue("localAgent_phoneNumber", phoneValue.toString());
          } else if (data.CertifiedBy_Code === "CB2") {
            setValue("externalAgent_phoneNumber", phoneValue.toString());
          }
        }

        if (data.Plaintiff_Region_Code && data.Plaintiff_Region) {
          const regionValue = {
            value: data.Plaintiff_Region_Code,
            label: data.Plaintiff_Region,
          };

          if (data.CertifiedBy_Code === "CB1") {
            setValue("localAgent_region", regionValue);
          } else if (data.CertifiedBy_Code === "CB2") {
            setValue("externalAgent_region", regionValue);
          }
        }

        if (data.Plaintiff_City_Code && data.Plaintiff_City) {
          const cityValue = {
            value: data.Plaintiff_City_Code,
            label: data.Plaintiff_City,
          };

          if (data.CertifiedBy_Code === "CB1") {
            setValue("localAgent_city", cityValue);
          } else if (data.CertifiedBy_Code === "CB2") {
            setValue("externalAgent_city", cityValue);
          }
        }

        if (data.Plaintiff_Occupation_Code && data.Plaintiff_Occupation) {
          const occupationValue = {
            value: data.Plaintiff_Occupation_Code,
            label: data.Plaintiff_Occupation,
          };

          if (data.CertifiedBy_Code === "CB1") {
            setValue("localAgent_occupation", occupationValue);
          } else if (data.CertifiedBy_Code === "CB2") {
            setValue("externalAgent_occupation", occupationValue);
          }
        } else {
        }

        if (data.Plaintiff_Gender_Code && data.Plaintiff_Gender) {
          const genderValue = {
            value: data.Plaintiff_Gender_Code,
            label: data.Plaintiff_Gender,
          };

          if (data.CertifiedBy_Code === "CB1") {
            setValue("localAgent_gender", genderValue);
          } else if (data.CertifiedBy_Code === "CB2") {
            setValue("externalAgent_gender", genderValue);
          }
        }

        if (data.Plaintiff_Nationality_Code && data.Plaintiff_Nationality) {
          const nationalityValue = {
            value: data.Plaintiff_Nationality_Code,
            label: data.Plaintiff_Nationality,
          };

          if (data.CertifiedBy_Code === "CB1") {
            setValue("localAgent_nationality", nationalityValue);
          } else if (data.CertifiedBy_Code === "CB2") {
            setValue("externalAgent_nationality", nationalityValue);
          }
        }
      }
    };

    if (caseData) {
      handleAgentPrefilling(caseData);
    } else {
    }
  }, [caseData, setValue]);

  useEffect(() => {
    if (claimantStatus === "representative" && !hasMandateNumber) {
      [
        "userName",
        "plaintiffRegion",
        "plaintiffCity",
        "occupation",
        "gender",
        "nationality",
        "hijriDate",
        "gregorianDate",
        "applicant",
        "phoneNumber",
        "workerAgentIdNumber",
        "workerAgentDateOfBirthHijri",
      ].forEach((f) => setValue(f as any, ""));
    }
  }, [hasMandateNumber, setValue, claimantStatus]);

  const watchedUserName = useWatch({ name: "userName", control });
  const watchedPlaintiffRegion = useWatch({ name: "plaintiffRegion", control });

  useEffect(() => {
    if (claimantStatus === "representative" && !shouldFetchNic) {
      if (!watchedUserName && !watchedPlaintiffRegion) {
        [
          "userName",
          "plaintiffRegion",
          "plaintiffCity",
          "occupation",
          "gender",
          "nationality",
          "hijriDate",
          "gregorianDate",
          "applicant",
          "phoneNumber",
        ].forEach((f) => setValue(f as any, ""));
      }
    }
  }, [
    shouldFetchNic,
    setValue,
    claimantStatus,
    watchedUserName,
    watchedPlaintiffRegion,
  ]);

  useEffect(() => {
    if (
      claimantStatus === "representative" &&
      agentType === "local_agency" &&
      workerAgentIdNumber &&
      workerAgentIdNumber.length === 10
    ) {
      if (!isPlaintiffIdUnderAgency) {
        [
          "userName",
          "plaintiffRegion",
          "plaintiffCity",
          "occupation",
          "gender",
          "nationality",
          "hijriDate",
          "gregorianDate",
          "applicant",
          "phoneNumber",
        ].forEach((f) => setValue(f as any, ""));

        clearErrors("workerAgentIdNumber");
        setError("workerAgentIdNumber", {
          type: "validate",
          message: t("error.idNotUnderAgency"),
        });
      } else {
        clearErrors("workerAgentIdNumber");
      }
    } else if (
      claimantStatus === "representative" &&
      agentType === "local_agency" &&
      workerAgentIdNumber &&
      workerAgentIdNumber.length !== 10
    ) {
      clearErrors("workerAgentIdNumber");
    }
  }, [
    workerAgentIdNumber,
    isPlaintiffIdUnderAgency,
    claimantStatus,
    agentType,
  ]);

  return formLayout;
};

export const useClaimantFormLayout = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language.toUpperCase();

  return {
    getNationalityLookup: () => ({
      url: `/WeddiServices/V1/MainLookUp`,
      params: {
        LookupType: "DataElements",
        ModuleKey: "MNT1",
        ModuleName: "Nationality",
        AcceptedLanguage: currentLanguage,
        SourceSystem: "E-Services",
      },
    }),
  };
};
