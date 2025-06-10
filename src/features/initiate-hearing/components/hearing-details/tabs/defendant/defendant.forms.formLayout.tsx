import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import {
  Option,
  SectionLayout,
  FormData,
} from "@/shared/components/form/form.types";
import { useFormOptions } from "./defendant.forms.formOptions";
import { useTranslation } from "react-i18next";
import { isArray } from "@/shared/lib/helpers";
import React, { useEffect, useState } from "react";
import { options } from "@/features/initiate-hearing/config/Options";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import EstablishmentSelectionSkeleton from "@/shared/components/loader/EstablishmentLoader";
import {
  useGetEstablishmentDetailsQuery,
  useGetExtractedEstablishmentDataQuery,
  useLazyGetEstablishmentDetailsQuery,
} from "@/features/initiate-hearing/api/create-case/defendantDetailsApis";
import { TokenClaims } from "@/features/login/components/AuthProvider";
import { toast } from "react-toastify";
import {
  useGetWorkerCityLookupDataQuery,
  useGetWorkerRegionLookupDataQuery,
} from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";
import { skipToken } from "@reduxjs/toolkit/query";
import { UserTypesEnum } from "@/shared/types/userTypes.enum";

export const useFormLayout = (
  setValue: UseFormSetValue<FormData>,
  watch: UseFormWatch<FormData>,
  EstablishmentData?: any[],
  governmentData?: any,
  subGovernmentData?: any,
  nicData?: any
  // establishmentDetails?: any,
  // isFileNumberCurrect?: any,
  // isSuccess?: boolean,
  // isFetching?: boolean,
  // isEstablishmentDetailLoading?: boolean
): SectionLayout[] => {
  const { IsGovernmentRadioOptions } = useFormOptions({ EstablishmentData });
  const [getCookie, setCookie] = useCookieState({ caseId: "" });
  const { t, i18n } = useTranslation("hearingdetails");
  const defendantStatus = watch("defendantStatus");
  const defendantDetails = watch("defendantDetails");

  //#region hassan

  const userClaims: TokenClaims = getCookie("userClaims");
  const [wrorkedEstablishmetUsers, setWrorkedEstablishmetUsers] = useState<Array<{ label: string; value: string }>>([]);
  const [
    establishmentDetailsByFileNumber,
    setEstablishmentDetailsByFileNumber,
  ] = useState<any>({});
  const [selectedDataEstablishment, setSelectedDataEstablishment] =
    useState<boolean>(false);

  const { data: getEstablismentWorkingData, isLoading: ExtractEstDataLoading } =
    useGetExtractedEstablishmentDataQuery(
      {
        WorkerId: userClaims?.UserID,
        AcceptedLanguage: i18n.language.toUpperCase(),
        SourceSystem: "E-Services",
      },
      {
        skip: !userClaims?.UserType || 
              !["Worker", "Embassy"].includes(userClaims.UserType)
      }
    );

  useEffect(() => {
    if (
      getEstablismentWorkingData &&
      getEstablismentWorkingData?.EstablishmentData?.length !== 0
    ) {
      setWrorkedEstablishmetUsers(
        getEstablismentWorkingData?.EstablishmentData?.map((est: any) => ({
          label: est.EstablishmentName,
          value:
            est.EstablishmentID ||
            est.FileNumber ||
            est.CRNumber ||
            est.EstablishmentName,
        })).concat({
          label: t("others"),
          value: "Others",
        })
      );
      // console.log(getEstablismentWorkingData?.EstablishmentData);
    } else {
      setValue("defendantDetails", "Others");
      setWrorkedEstablishmetUsers([
        {
          label: t("others"),
          value: "Others",
        }
      ]);
    }
  }, [getEstablismentWorkingData]);

  // to get establishment data from field input
  const [
    triggerGetStablishmentData,
    { data: establishmentData, isLoading: isEstablishmentLoading },
  ] = useLazyGetEstablishmentDetailsQuery();

  useEffect(() => {
    if (
      establishmentData &&
      establishmentData?.EstablishmentInfo?.length !== 0
    ) {
      setEstablishmentDetailsByFileNumber(
        establishmentData?.EstablishmentInfo?.[0]
      );
      setCookie(
        "getDefendEstablishmentData",
        establishmentData?.EstablishmentInfo?.[0]
      );
      setCookie("defendantDetails", establishmentData?.EstablishmentInfo?.[0]);
      setValue(
        "Defendant_Establishment_data_NON_SELECTED",
        establishmentData?.EstablishmentInfo?.[0]
      );
    }
  }, [establishmentData]);

  useEffect(() => {
    if (
      establishmentData &&
      establishmentData?.EstablishmentInfo?.length !== 0
    ) {
      setValue(
        "Defendant_Establishment_data_NON_SELECTED",
        establishmentData?.EstablishmentInfo?.[0]
      );

      // set Region And City Manually
      setValue("region", {
        label: establishmentData?.EstablishmentInfo?.[0]?.Region,
        value: establishmentData?.EstablishmentInfo?.[0]?.Region_Code,
      });
      setValue("city", {
        label: establishmentData?.EstablishmentInfo?.[0]?.City,
        value: establishmentData?.EstablishmentInfo?.[0]?.City_Code,
      });

      setValue(
        "Defendant_Establishment_data_NON_SELECTED.region.value",
        establishmentData?.EstablishmentInfo?.[0]?.Region_Code
      );
      setValue(
        "Defendant_Establishment_data_NON_SELECTED.region.label",
        establishmentData?.EstablishmentInfo?.[0]?.Region
      );
      setValue(
        "Defendant_Establishment_data_NON_SELECTED.city.value",
        establishmentData?.EstablishmentInfo?.[0]?.City_Code
      );
      setValue(
        "Defendant_Establishment_data_NON_SELECTED.city.label",
        establishmentData?.EstablishmentInfo?.[0]?.City
      );
    }
  }, [establishmentData, setValue]);

  // treger the function on loase focuse
  const getEstablishmentDataByFileNumber = async () => {
    const fNumber = watch("DefendantFileNumber");
    if (!fNumber) return;
    await triggerGetStablishmentData({
      AcceptedLanguage: i18n.language.toUpperCase(),
      SourceSystem: "E-Services",
      FileNumber: fNumber,
    });
  };

  // to get estrablishment data from redio selection
  const [
    triggerMyEstablishmentData,
    { data: myEstablishment, isLoading: isMyEstablishmentLoading },
  ] = useLazyGetEstablishmentDetailsQuery();

  useEffect(() => {
    if (myEstablishment && myEstablishment?.EstablishmentInfo.length !== 0) {
      setCookie(
        "getDefendEstablishmentData",
        myEstablishment?.EstablishmentInfo?.[0]
      );
      setCookie("defendantDetails", myEstablishment?.EstablishmentInfo?.[0]);

      setValue(
        "Defendant_Establishment_data",
        myEstablishment?.EstablishmentInfo?.[0],
        {
          shouldValidate: myEstablishment?.EstablishmentInfo?.[0],
        }
      );

      // set Region And City Manually
      setValue(
        "Defendant_Establishment_data.region.value",
        myEstablishment?.EstablishmentInfo?.[0]?.Region_Code
      );
      setValue(
        "Defendant_Establishment_data.region.label",
        myEstablishment?.EstablishmentInfo?.[0]?.Region
      );

      setValue(
        "Defendant_Establishment_data.city.value",
        myEstablishment?.EstablishmentInfo?.[0]?.City_Code
      );
      setValue(
        "Defendant_Establishment_data.city.label",
        myEstablishment?.EstablishmentInfo?.[0]?.City
      );
    } else {
      if (myEstablishment && myEstablishment.ErrorList) {
        toast.warning("Feild To Fetch");
      }
      setValue(
        "Defendant_Establishment_data",
        {
          region: null,
          city: null,
        },
        {
          shouldValidate: false,
        }
      );
    }
  }, [myEstablishment]);

  const getSelectedEstablishmentData = async (value: string) => {
    if (value === "Others") {
      setValue("DefendantFileNumber", "", {
        shouldValidate: false,
      });
      setSelectedDataEstablishment(false);
      return;
    }
    const selectedEstFileNumber = extracFileNumberFromWorkingEstData(value);
    const res = await triggerMyEstablishmentData({
      AcceptedLanguage: i18n.language.toUpperCase(),
      SourceSystem: "E-Services",
      FileNumber: selectedEstFileNumber,
    });
    // console.log("resjdshj", res);

    res && setSelectedDataEstablishment(true);
  };

  const extracFileNumberFromWorkingEstData = (estName: string) => {
    const establishment: any =
      getEstablismentWorkingData?.EstablishmentData.find(
        (val: any) => val.EstablishmentName === estName
      );
    return establishment ? establishment.EstablishmentFileNumber : null;
  };

  const region = watch("region");

  // Region/City/Occupation/Nationality lookups
  const { data: regionData } = useGetWorkerRegionLookupDataQuery({
    AcceptedLanguage: i18n.language.toUpperCase(),
    SourceSystem: "E-Services",
    ModuleKey: "EstablishmentRegion",
    ModuleName: "EstablishmentRegion",
  });
  const { data: cityData } = useGetWorkerCityLookupDataQuery(
    region && typeof region === "object" && "value" in region
      ? {
          AcceptedLanguage: i18n.language.toUpperCase(),
          SourceSystem: "E-Services",
          selectedWorkerRegion: { value: (region as { value: string }).value },
          ModuleName: "EstablishmentCity",
        }
      : skipToken
  );

  const RegionOptions = React.useMemo(() => {
    return (
      (regionData &&
        regionData?.DataElements?.map((item: any) => ({
          value: item.ElementKey,
          label: item.ElementValue,
        }))) ||
      []
    );
  }, [regionData]);

  const CityOptions = React.useMemo(() => {
    return (
      (cityData &&
        cityData?.DataElements?.map((item: any) => ({
          value: item.ElementKey,
          label: item.ElementValue,
        }))) ||
      []
    );
  }, [cityData]);

  //#endregion hassan

  useEffect(() => {
    if (defendantDetails) {
      setCookie("defendantDetails", defendantDetails);
      setCookie("getCookieEstablishmentData", defendantDetails);
    }
  }, [defendantDetails]);

  const hasEstablishments =
    isArray(wrorkedEstablishmetUsers) && wrorkedEstablishmetUsers.length > 0;

  // Build establishment radio options + "Others" option if establishments exist
  const establishmentOptions = hasEstablishments
    ? [
        ...wrorkedEstablishmetUsers?.map((est: any) => ({
          label: est.EstablishmentName,
          value: {
            est_Id: est.EstablishmentID,
            est_FileNumber: est.FileNumber,
            est_CRNumber: est.CRNumber,
            est_Name: est.EstablishmentName,
          },
        })),
        {
          label: t("others"),
          value: "Others",
        },
      ]
    : [];

  // Show Non-Governmental and Governmental entities only if no establishments or user chooses "Others"
  const showGovNonGovRadios =
    !hasEstablishments || defendantDetails === "Others";

  // Show government fields only when defendantStatus is Government and details is Others or no establishments
  const showGovSectionFields =
    (showGovNonGovRadios && defendantStatus === "Government") ||
    (hasEstablishments &&
      defendantStatus === "Government" &&
      defendantDetails === "Others");

  // Show non-gov section only when defendantStatus is Establishment and details is Others or no establishments
  const showNonGovSection =
    (showGovNonGovRadios && defendantStatus === "Establishment") ||
    (hasEstablishments &&
      defendantStatus === "Establishment" &&
      defendantDetails === "Others");

  const GovernmentOptions = React.useMemo(() => {
    return (
      governmentData?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || []
    );
  }, [governmentData]);

  const SubGovernmentOptions = React.useMemo(() => {
    return (
      subGovernmentData?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || []
    );
  }, [subGovernmentData]);

  useEffect(() => {
    if (nicData?.NICDetails) {
      // Set values with proper codes
      setValue("DefendantsPrisonerName", nicData?.NICDetails?.PlaintiffName, {
        shouldValidate: nicData?.NICDetails?.PlaintiffName,
      });
      setValue("DefendantsRegion", nicData?.NICDetails?.Region_Code || nicData?.NICDetails?.Region, {
        shouldValidate: nicData?.NICDetails?.Region,
      });
      setValue("DefendantsCity", nicData?.NICDetails?.City_Code || nicData?.NICDetails?.City, {
        shouldValidate: nicData?.NICDetails?.City,
      });
      setValue("DefendantsOccupation", nicData?.NICDetails?.Occupation_Code || nicData?.NICDetails?.Occupation, {
        shouldValidate: nicData?.NICDetails?.Occupation,
      });
      setValue("DefendantsGender", nicData?.NICDetails?.Gender_Code || nicData?.NICDetails?.Gender, {
        shouldValidate: nicData?.NICDetails?.Gender,
      });
      setValue("DefendantsNationality", nicData?.NICDetails?.Nationality_Code || nicData?.NICDetails?.Nationality, {
        shouldValidate: nicData?.NICDetails?.Nationality,
      });
      setValue("DefendantsPrisonerId", watch("nationalIdNumber"));
    }
  }, [nicData, watch]);

  return [
    ...(ExtractEstDataLoading
      ? [
          {
            title: t("tab2_title"),
            isRadio: true,
            children: [
              {
                type: "custom",
                component: <EstablishmentSelectionSkeleton />,
              },
            ],
          },
        ]
      : wrorkedEstablishmetUsers
      ? [
          {
            title: t("tab2_title"),
            isRadio: true,
            children: [
              {
                type: "radio",
                name: "defendantDetails",
                label: t("estab_name"),
                options: wrorkedEstablishmetUsers,
                value: defendantDetails,
                hasIcon: true,
                onChange: (value: string) => {
                  getSelectedEstablishmentData(value);
                  setValue("defendantDetails", value);
                  setValue("defendantStatus", value);
                },
              },
            ],
          },
        ]
      : []),

    ...(showGovNonGovRadios
      ? [
          {
            title: t("type_of_defendant"),
            isRadio: true,
            children: [
              {
                type: "radio",
                name: "defendantStatus",
                label: t("type_of_defendant"),
                options: IsGovernmentRadioOptions,
                value: defendantStatus,
                onChange: (value: string) => setValue("defendantStatus", value),
                notRequired: true,
              },
            ],
          },
        ]
      : []),

    {
      title: "",
      children: [
        showGovSectionFields && {
          notRequired: false,
          type: "autocomplete",
          label: t("main_category_of_the_government_entity"),
          name: "main_category_of_the_government_entity",
          options: GovernmentOptions,
          validation: { required: t("mainCategoryGovernValidation") },
          value: "",
        },
        showGovSectionFields && {
          type: "autocomplete",
          label: t("subcategory_of_the_government_entity"),
          name: "subcategory_of_the_government_entity",
          options: SubGovernmentOptions,
          validation: { required: t("subCategoryGovernValidation") },
          value: "",
        },
      ].filter(Boolean) as Option[],
    },

    ...(showNonGovSection
      ? [
          {
            removeMargin: true,
            children: [
              {
                type: "input",
                label: t("fileNumber"),
                name: "DefendantFileNumber",
                inputType: "text",
                value: "",
                onBlur: () => getEstablishmentDataByFileNumber(),
                validation: {
                  required: t("fileNumberValidation"),
                },
              },
              ...(establishmentDetailsByFileNumber
                ? [
                    {
                      isLoading: isEstablishmentLoading,
                      type: "readonly",
                      label: t("commercialRegistrationNumber"),
                      value: establishmentDetailsByFileNumber?.CRNumber,
                    },
                    {
                      isLoading: isEstablishmentLoading,
                      type: "readonly",
                      label: t("name"),
                      value:
                        establishmentDetailsByFileNumber?.EstablishmentName,
                    },
                    {
                      isLoading: isEstablishmentLoading,

                      label: t("region"),
                      name: "region",
                      validation: { required: t("regionValidation") },
                      type: !establishmentDetailsByFileNumber?.Region
                        ? "autocomplete"
                        : "readonly",
                      value: establishmentDetailsByFileNumber?.Region || "",
                      ...(!establishmentDetailsByFileNumber?.Region && {
                        options: RegionOptions || [],
                        validation: { required: t("regionValidation") },
                      }),
                      onChange: (v: string) => setValue("region", v),
                    },
                    {
                      isLoading: isEstablishmentLoading,
                      type: !establishmentDetailsByFileNumber?.City
                        ? "autocomplete"
                        : "readonly",
                      label: t("city"),
                      name: "city",
                      validation: { required: t("cityValidation") },
                      value: watch(
                        "Defendant_Establishment_data_NON_SELECTED.city.label"
                      ),
                      options: CityOptions,
                      onChange: (v: string) => setValue("city", v),
                    },
                    {
                      maxLength: 10,
                      type: "input",
                      name: "phoneNumber",
                      label: t("phoneNumber"),
                      inputType: "number",
                      placeholder: "05xxxxxxxx",
                      validation: {
                        required: t("phoneNumberValidation"),
                        pattern: {
                          value: /^05\d{8}$/,
                          message: t(
                            "Please enter phone number must start with 05."
                          ),
                        },
                      },
                    },
                  ]
                : []),
            ],
          },
        ]
      : []),
].filter(Boolean) as SectionLayout[];
};
