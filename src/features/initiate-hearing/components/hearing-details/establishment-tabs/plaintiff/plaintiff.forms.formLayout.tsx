import { UseFormSetValue, UseFormWatch } from "react-hook-form";

import { SectionLayout, FormData } from "@/shared/components/form/form.types";

import { useTranslation } from "react-i18next";
import React, { isValidElement, useEffect } from "react";
import { options } from "@/features/initiate-hearing/config/Options";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { useGetEstablishmentDetailsQuery } from "@/features/initiate-hearing/api/create-case/defendantDetailsApis";
import { TokenClaims } from "@/features/login/components/AuthProvider";
import { toast } from "react-toastify";

export const useEstablishmentPlaintiffFormLayout = ({
  establishmentDetails,
  apiLoadingStates,
  regionData,
  cityData,
  setValue,
  trigger,
}: any) => {
  const { i18n } = useTranslation();
  const [getCookie, setCookie] = useCookieState();
  const userClaims: TokenClaims = getCookie("userClaims");

  const { data: establishmentDetails2, isFetching: isEstablishmentLoading } =
    useGetEstablishmentDetailsQuery(
      {
        AcceptedLanguage: i18n.language === "ar" ? "AR" : "EN",
        SourceSystem: "E-Services",
        FileNumber: userClaims?.File_Number
      }, {
      skip: !userClaims?.File_Number
    }
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

  useEffect(() => {
    setValue("PlaintiffsEstablishmentName", establishmentDetails?.EstablishmentName, {
      shouldValidate: establishmentDetails?.EstablishmentName,
    }),
      setValue("PlaintiffsFileNumber", establishmentDetails?.FileNumber, {
        shouldValidate: establishmentDetails?.FileNumber,
      }),
      setValue("PlaintiffsCRNumber", establishmentDetails?.CRNumber, {
        shouldValidate: establishmentDetails?.CRNumber,
      }),
      setValue("PlaintiffsRegion", establishmentDetails?.Region_Code, {
        shouldValidate: establishmentDetails?.Region_Code,
      }),
      setValue("PlaintiffsCity", establishmentDetails?.City_Code, {
        shouldValidate: establishmentDetails?.City_Code,
      }),
      setValue("PlaintiffsEstablishmentID", establishmentDetails?.EstablishmentID, {
        shouldValidate: establishmentDetails?.EstablishmentID,
      })
      setValue("Plaintiff_PhoneNumber", establishmentDetails?.ContactNumber, {
        shouldValidate: establishmentDetails?.ContactNumber,
      })
      //hassan code 700
      setValue("PlaintiffsNumber700", establishmentDetails?.Number700, {
        shouldValidate: establishmentDetails?.Number700,
      })
      //hassan code 700
      setValue("claimantStatus", "establishment", {
        shouldValidate: true,
      })
    setValue("region", { value: establishmentDetails?.Region_Code || "", label: establishmentDetails?.Region || "" });
    setValue("city", { value: establishmentDetails?.City_Code || "", label: establishmentDetails?.City || "" });

    // Ensure city lookup is triggered by also setting plaintiffRegion and plaintiffCity
    setValue("plaintiffRegion", { value: establishmentDetails?.Region_Code || "", label: establishmentDetails?.Region || "" });
    setValue("plaintiffCity", { value: establishmentDetails?.City_Code || "", label: establishmentDetails?.City || "" });

  }, [establishmentDetails2])

  const { t } = useTranslation("hearingdetails");
  const EstablishmentSectionFrom: any = [];
  EstablishmentSectionFrom.push({
    title: t("tab1_title"),
    children: [
      {
        type: "readonly",
        label: t("establishment_tab1.establishmentName"),
        value: establishmentDetails?.EstablishmentName,
        isLoading: apiLoadingStates?.estab,
        name: "PlaintiffsEstablishmentName"
      },
      {
        type: "readonly",
        label: t("establishment_tab1.fileNumber"),
        value: establishmentDetails?.FileNumber,
        isLoading: apiLoadingStates?.estab,
        name: "PlaintiffsFileNumber"
      },
      {
        type: "readonly",
        label: t("establishment_tab1.commercialRegistrationNumber"),
        value: establishmentDetails?.CRNumber,
        isLoading: apiLoadingStates?.estab,
        name: "PlaintiffsCRNumber"
      },
      //hassan code 700
      {
        type: "readonly",
        label: t("establishment_tab1.number700"),
        value: establishmentDetails?.Number700,
        isLoading: apiLoadingStates?.estab,
        name: "PlaintiffsNumber700"
      },
      //hassan code 700
      {
        type: !establishmentDetails?.Region ? "autocomplete" : "readonly",
        name: "PlaintiffsRegion",
        ...(establishmentDetails?.Region && {
          isLoading: apiLoadingStates?.estab,
        }),
        title: "",
        isLoading: apiLoadingStates?.estab,

        label: t("establishment_tab1.region"),
        value: establishmentDetails?.Region || "", // Fallback empty string
        ...(!establishmentDetails?.Region && {
          options: RegionOptions || [],
        }), // Fallback empty array
        ...(!establishmentDetails?.Region && {
          validation: { required: t("regionValidation") },
        }),
      },
      {
        type: !establishmentDetails?.City ? "autocomplete" : "readonly",
        name: "PlaintiffsCity",
        ...(establishmentDetails?.City && {
          isLoading: apiLoadingStates?.estab,
        }),
        isLoading: apiLoadingStates?.estab,
        title: "",
        label: t("establishment_tab1.city"),
        value: establishmentDetails?.City || "", // Fallback empty string
        ...(!establishmentDetails?.City && { options: CityOptions || [] }), // Fallback empty array
        ...(!establishmentDetails?.City && {
          validation: { required: t("cityValidation") },
        }),
      },
      {
        type: !establishmentDetails?.ContactNumber ? "input" : "readonly",
        name: "Plaintiff_PhoneNumber",
        label: t("establishment_tab2.mobileNumber"),
        isLoading: apiLoadingStates?.estab,
        inputType: "text",
        placeholder: "05xxxxxxxx",
        value: establishmentDetails?.ContactNumber || "",
        validation: {
          required: t("phoneNumberValidation"),
          pattern: {
            value: /^05\d{8}$/,
            message: t("phoneValidationMessage"),
          },
        },
      },
    ],
  });

  return [...EstablishmentSectionFrom].filter(Boolean) as SectionLayout[];
};
