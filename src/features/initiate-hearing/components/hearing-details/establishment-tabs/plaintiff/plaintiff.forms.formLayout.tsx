import { SectionLayout } from "@/shared/components/form/form.types";

import { useTranslation } from "react-i18next";
import React, { useEffect, useRef } from "react";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { useGetEstablishmentDetailsQuery } from "@/features/initiate-hearing/api/create-case/defendantDetailsApis";
import { TokenClaims } from "@/features/login/components/AuthProvider";

export const useEstablishmentPlaintiffFormLayout = ({
  establishmentDetails,
  apiLoadingStates,
  regionData,
  cityData,
  setValue,
}: any) => {
  const { i18n } = useTranslation();
  const [getCookie] = useCookieState();
  const userClaims: TokenClaims = getCookie("userClaims");

  const { data: establishmentDetails2 } = useGetEstablishmentDetailsQuery(
    {
      AcceptedLanguage: i18n.language === "ar" ? "AR" : "EN",
      SourceSystem: "E-Services",
      FileNumber: userClaims?.File_Number,
    },
    {
      skip: !userClaims?.File_Number,
    },
  );

  const RegionOptions = React.useMemo(() => {
    return (
      regionData?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || []
    );
  }, [regionData]);

  const CityOptions = React.useMemo(() => {
    return (
      cityData?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || []
    );
  }, [cityData]);

  const caseDetails = (() => {
    try {
      const stored = localStorage.getItem("CaseDetails");
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      const currentCaseId = getCookie("caseId");
      if (!currentCaseId) return null;

      if (parsed?.CaseID && parsed.CaseID !== currentCaseId) return null;
      return parsed;
    } catch {
      return null;
    }
  })();

  const caseEstablishmentDetails = React.useMemo(() => {
    if (!caseDetails) return null;
    const isEstablishmentApplicant =
      (caseDetails?.ApplicantType || "")
        .toString()
        .toLowerCase()
        .includes("establishment") ||
      caseDetails?.ApplicantType_Code === "Establishment";

    if (!isEstablishmentApplicant) return null;

    return {
      EstablishmentName:
        caseDetails?.PlaintiffName || caseDetails?.EstablishmentFullName || "",
      FileNumber: caseDetails?.PlaintiffEstFileNumber || "",
      CRNumber: caseDetails?.Plaintiff_CRNumber || "",
      Number700: caseDetails?.Plaintiff_Number700 || "",
      Region: caseDetails?.Plaintiff_Region || "",
      Region_Code: caseDetails?.Plaintiff_Region_Code || "",
      City: caseDetails?.Plaintiff_City || "",
      City_Code: caseDetails?.Plaintiff_City_Code || "",
      ContactNumber:
        caseDetails?.Plaintiff_PhoneNumber ||
        caseDetails?.Plaintiff_MobileNumber ||
        "",
      EstablishmentID: caseDetails?.Plaintiff_StatusID || "",
    } as any;
  }, [caseDetails]);

  const apiEstablishment = establishmentDetails || null;

  const prefillDoneRef = useRef(false);
  const prefillCityDoneRef = useRef(false);
  const apiRegionAppliedRef = useRef(false);

  useEffect(() => {
    if (prefillDoneRef.current) return;

    let didSetAny = false;

    if (
      !apiEstablishment?.EstablishmentName &&
      caseEstablishmentDetails?.EstablishmentName
    ) {
      setValue(
        "establishment_name",
        caseEstablishmentDetails.EstablishmentName,
        { shouldValidate: true },
      );
      didSetAny = true;
    }
    if (
      !apiEstablishment?.EstablishmentType &&
      caseEstablishmentDetails?.EstablishmentType
    ) {
      setValue(
        "establishment_type",
        caseEstablishmentDetails.EstablishmentType,
        { shouldValidate: true },
      );
      didSetAny = true;
    }
    if (!apiEstablishment?.FileNumber && caseEstablishmentDetails?.FileNumber) {
      setValue(
        "establishment_fileNumber",
        caseEstablishmentDetails.FileNumber,
        { shouldValidate: true },
      );
      didSetAny = true;
    }
    if (!apiEstablishment?.CRNumber && caseEstablishmentDetails?.CRNumber) {
      setValue("establishment_crNumber", caseEstablishmentDetails.CRNumber, {
        shouldValidate: true,
      });
      didSetAny = true;
    }
    if (
      !apiEstablishment?.EstablishmentID &&
      caseEstablishmentDetails?.EstablishmentID
    ) {
      setValue("establishment_id", caseEstablishmentDetails.EstablishmentID, {
        shouldValidate: true,
      });
      didSetAny = true;
    }
    if (
      !apiEstablishment?.ContactNumber &&
      caseEstablishmentDetails?.ContactNumber
    ) {
      setValue(
        "establishment_phoneNumber",
        caseEstablishmentDetails.ContactNumber,
        { shouldValidate: true },
      );
      didSetAny = true;
    }
    if (!apiEstablishment?.Number700 && caseEstablishmentDetails?.Number700) {
      setValue("establishment_number700", caseEstablishmentDetails.Number700, {
        shouldValidate: true,
      });
      didSetAny = true;
    }
    if (
      !(apiEstablishment?.Region || apiEstablishment?.Region_Code) &&
      (caseEstablishmentDetails?.Region ||
        caseEstablishmentDetails?.Region_Code)
    ) {
      setValue("establishment_region", {
        value: caseEstablishmentDetails?.Region_Code || "",
        label: caseEstablishmentDetails?.Region || "",
      });
      didSetAny = true;
    }

    if (
      !(apiEstablishment?.City || apiEstablishment?.City_Code) &&
      (caseEstablishmentDetails?.City || caseEstablishmentDetails?.Region)
    ) {
      const cityValue =
        caseEstablishmentDetails?.City ||
        caseEstablishmentDetails?.Region ||
        "";
      const cityCode =
        caseEstablishmentDetails?.City_Code ||
        caseEstablishmentDetails?.Region_Code ||
        "";
      setValue("establishment_city", { value: cityCode, label: cityValue });
      didSetAny = true;
    }
    if (didSetAny) {
      setValue("claimantStatus", "establishment", { shouldValidate: true });
      prefillDoneRef.current = true;
    }
  }, [
    establishmentDetails2,
    apiEstablishment,
    caseEstablishmentDetails,
    setValue,
  ]);

  useEffect(() => {
    if (apiRegionAppliedRef.current) return;
    if (!apiEstablishment?.Region_Code || !apiEstablishment?.Region) return;

    setValue(
      "establishment_region",
      { value: apiEstablishment.Region_Code, label: apiEstablishment.Region },
      { shouldValidate: true },
    );
    apiRegionAppliedRef.current = true;
  }, [apiEstablishment, setValue]);

  useEffect(() => {
    if (prefillCityDoneRef.current) return;
    if (apiEstablishment?.City || apiEstablishment?.City_Code) return;

    const desiredCityCode =
      caseEstablishmentDetails?.City_Code ||
      caseEstablishmentDetails?.Region_Code ||
      "";
    const desiredCityLabel =
      caseEstablishmentDetails?.City || caseEstablishmentDetails?.Region || "";

    if (!desiredCityCode && !desiredCityLabel) return;

    if (!Array.isArray(CityOptions)) return;
    const list: any[] = CityOptions || [];
    const byCode = list.find(
      (opt: any) => String(opt.value) === String(desiredCityCode),
    );
    const byLabel = list.find(
      (opt: any) =>
        String(opt.label).toUpperCase() ===
        String(desiredCityLabel).toUpperCase(),
    );
    const selected = byCode || byLabel;
    if (!selected) return;

    setValue("establishment_city", selected, { shouldValidate: true });
    prefillCityDoneRef.current = true;
  }, [CityOptions, apiEstablishment, caseEstablishmentDetails, setValue]);

  const { t } = useTranslation("hearingdetails");

  useEffect(() => {
    if (!apiEstablishment) return;
    if (apiEstablishment.EstablishmentName) {
      setValue("establishment_name", apiEstablishment.EstablishmentName, {
        shouldValidate: true,
      });
    }
    if (apiEstablishment.EstablishmentType) {
      setValue("establishment_type", apiEstablishment.EstablishmentType, {
        shouldValidate: true,
      });
    }
    if (apiEstablishment.FileNumber) {
      setValue("establishment_fileNumber", apiEstablishment.FileNumber, {
        shouldValidate: true,
      });
    }
    if (apiEstablishment.CRNumber) {
      setValue("establishment_crNumber", apiEstablishment.CRNumber, {
        shouldValidate: true,
      });
    }
    if (apiEstablishment.ContactNumber) {
      setValue("establishment_phoneNumber", apiEstablishment.ContactNumber, {
        shouldValidate: true,
      });
    }
    if (apiEstablishment.Number700) {
      setValue("establishment_number700", apiEstablishment.Number700, {
        shouldValidate: true,
      });
    }
    if (apiEstablishment.EstablishmentID) {
      setValue("establishment_id", apiEstablishment.EstablishmentID, {
        shouldValidate: true,
      });
    }
  }, [apiEstablishment, setValue]);

  const establishmentSections: SectionLayout[] = [
    {
      title: t("tab1_title"),
      gridCols: 3,
      className: "establishment-section",
      children: [
        apiEstablishment?.EstablishmentName
          ? {
              type: "readonly",
              label: t("establishment_tab1.establishmentName"),
              value: apiEstablishment?.EstablishmentName,
              isLoading: apiLoadingStates?.estab,
            }
          : {
              type: "input",
              name: "establishment_name",
              label: t("establishment_tab1.establishmentName"),
              inputType: "text",
              isLoading: apiLoadingStates?.estab,
              value: "",
              onChange: () => {},
            },

        apiEstablishment?.FileNumber
          ? {
              type: "readonly",
              label: t("establishment_tab1.fileNumber"),
              value: apiEstablishment?.FileNumber,
              isLoading: apiLoadingStates?.estab,
            }
          : {
              type: "input",
              name: "establishment_fileNumber",
              label: t("establishment_tab1.fileNumber"),
              inputType: "text",
              isLoading: apiLoadingStates?.estab,
              value: "",
              onChange: () => {},
            },

        apiEstablishment?.CRNumber
          ? {
              type: "readonly",
              label: t("establishment_tab1.commercialRegistrationNumber"),
              value: apiEstablishment?.CRNumber,
              isLoading: apiLoadingStates?.estab,
            }
          : {
              type: "input",
              name: "establishment_crNumber",
              label: t("establishment_tab1.commercialRegistrationNumber"),
              inputType: "text",
              isLoading: apiLoadingStates?.estab,
              value: "",
              onChange: () => {},
            },

        apiEstablishment?.Number700
          ? {
              type: "readonly",
              label: t("establishment_tab1.number700"),
              value: apiEstablishment?.Number700,
              isLoading: apiLoadingStates?.estab,
            }
          : {
              type: "input",
              name: "establishment_number700",
              label: t("establishment_tab1.number700"),
              inputType: "text",
              isLoading: apiLoadingStates?.estab,
              value: "",
              onChange: () => {},
            },
        {
          type: !apiEstablishment?.Region ? "autocomplete" : "readonly",
          name: "establishment_region",
          isLoading: apiLoadingStates?.estab,
          label: t("establishment_tab1.region"),
          value: apiEstablishment?.Region,
          options: RegionOptions || [],
          validation: { required: t("regionValidation") },
          autoSelectValue: caseEstablishmentDetails?.Region_Code || undefined,
          onChange: (value: any) => {
            setValue("establishment_region", value);
            setValue("establishment_city", null);
          },
        },
        {
          type: !apiEstablishment?.City ? "autocomplete" : "readonly",
          name: "establishment_city",
          isLoading: apiLoadingStates?.estab,
          label: t("establishment_tab1.city"),
          value: apiEstablishment?.City,
          options: CityOptions || [],
          validation: { required: t("cityValidation") },
          autoSelectValue: caseEstablishmentDetails?.City_Code || undefined,
          onChange: (v: any) => {
            setValue("establishment_city", v);
          },
        },
        {
          type: !apiEstablishment?.ContactNumber ? "input" : "readonly",
          name: "establishment_phoneNumber",
          label: t("establishment_tab2.mobileNumber"),
          isLoading: apiLoadingStates?.estab,
          inputType: "text",
          placeholder: "05xxxxxxxx",
          value: apiEstablishment?.ContactNumber,
          validation: {
            required: t("phoneNumberValidation"),
            pattern: {
              value: /^05\d{8}$/,
              message: t("phoneValidationMessage"),
            },
          },
          onChange: () => {},
        },
      ],
    },
  ];

  return establishmentSections.filter(Boolean);
};
