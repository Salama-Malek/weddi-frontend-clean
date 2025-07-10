import { UseFormSetValue, UseFormWatch, UseFormTrigger } from "react-hook-form";
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
import { useFormResetContext } from "@/providers/FormResetProvider";
import { useAPIFormsData } from "@/providers/FormContext";

export const useFormLayout = (
  setValue: UseFormSetValue<FormData>,
  watch: UseFormWatch<FormData>,
  trigger: UseFormTrigger<FormData>,
  governmentData?: any,
  subGovernmentData?: any,
  caseDetailsLoading?: boolean
): SectionLayout[] => {
  const { resetField } = useFormResetContext();
  const { IsGovernmentRadioOptions } = useFormOptions([]);
  const [getCookie, setCookie] = useCookieState({ caseId: "" });
  const { t, i18n } = useTranslation("hearingdetails");
  const defendantStatus = watch("defendantStatus");
  const defendantDetails = watch("defendantDetails");
  const mainCategory = watch("main_category_of_the_government_entity" as keyof FormData);
  const subCategoryValue = watch("subcategory_of_the_government_entity" as keyof FormData);
  const establishmentValue = watch("EstablishmentData" as keyof FormData);
  const [prevMainCategory, setPrevMainCategory] = useState(mainCategory);
  const [hasInteractedWithSubCategory, setHasInteractedWithSubCategory] = useState(false);
  const [hasInitiatedFileNumberSearch, setHasInitiatedFileNumberSearch] = useState(false);
  const [hasManuallySelectedSubCategory, setHasManuallySelectedSubCategory] = useState(false);
  const [idNumberPlainteff, setIdNumberPlainteff] = useState<string>("");
  const {
    formState,
    formData
  } = useAPIFormsData();



  //#region hassan
  const userClaims: TokenClaims = getCookie("userClaims");
  const userType = getCookie("userType");
  const [wrorkedEstablishmetUsers, setWrorkedEstablishmetUsers] = useState<Array<{ label: string; value: string }>>([]);

  const [
    establishmentDetailsByFileNumber,
    setEstablishmentDetailsByFileNumber,
  ] = useState<any>(null);

  const [selectedDataEstablishment, setSelectedDataEstablishment] =
    useState<boolean>(false);


  useEffect(() => {
    if (caseDetailsLoading) {
      const id = JSON.parse(localStorage.getItem("CaseDetails") || "")?.PlaintiffId
      setIdNumberPlainteff(id)
    }
  }, [caseDetailsLoading])

  const { data: getEstablismentWorkingData, isLoading: ExtractEstDataLoading } =
    useGetExtractedEstablishmentDataQuery(
      {
        WorkerId: idNumberPlainteff,
        AcceptedLanguage: i18n.language.toUpperCase(),
        SourceSystem: "E-Services",
        UserType: userType,
        CaseID: getCookie("caseId"),
      },
      {
        skip: !caseDetailsLoading || idNumberPlainteff === ""
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
    } else {
      setWrorkedEstablishmetUsers([
        {
          label: t("others"),
          value: "Others",
        },
      ]);
    }
  }, [getEstablismentWorkingData]);

  // to get establishment data from field input
  const [
    triggerGetStablishmentData,
    { data: establishmentData, isLoading: isEstablishmentLoading },
  ] = useLazyGetEstablishmentDetailsQuery();

  // Add state to track if we're waiting for API response
  const [isWaitingForEstablishment, setIsWaitingForEstablishment] = useState(false);

  // Consolidated useEffect to handle establishment data
  useEffect(() => {
    if (establishmentData && establishmentData?.EstablishmentInfo?.length !== 0) {
      const establishmentInfo = establishmentData?.EstablishmentInfo?.[0];
      console.log("Setting establishment data:", establishmentInfo?.FileNumber);

      // Set state
      setEstablishmentDetailsByFileNumber(establishmentInfo);
      setIsWaitingForEstablishment(false);

      // Set cookies
      setCookie("getDefendEstablishmentData", establishmentInfo);
      setCookie("defendantDetails", establishmentInfo);

      // Set form values only if not already set or if data is different
      setValue("Defendant_Establishment_data_NON_SELECTED", establishmentInfo);
      setValue("DefendantFileNumber", establishmentInfo?.FileNumber);

      // Set region and city only if they exist and are not already set
      if (establishmentInfo?.Region && establishmentInfo?.Region_Code) {
        setValue("defendantRegion", {
          label: establishmentInfo.Region,
          value: establishmentInfo.Region_Code,
        });
        setValue("Defendant_Establishment_data_NON_SELECTED.region", {
          label: establishmentInfo.Region,
          value: establishmentInfo.Region_Code,
        });
      }

      if (establishmentInfo?.City && establishmentInfo?.City_Code) {
        setValue("defendantCity", {
          label: establishmentInfo.City,
          value: establishmentInfo.City_Code,
        });
        setValue("Defendant_Establishment_data_NON_SELECTED.city", {
          label: establishmentInfo.City,
          value: establishmentInfo.City_Code,
        });
      }

      // Set Number700
      if (establishmentInfo?.Number700) {
        setValue("Defendant_Establishment_data_NON_SELECTED.Number700", establishmentInfo.Number700);
      }
    } else if (establishmentData && establishmentData?.ErrorDetails?.length !== 0) {
      setEstablishmentDetailsByFileNumber(null);
      setIsWaitingForEstablishment(false);
    }
  }, [establishmentData, setValue, setCookie]);

  const getEstablishmentDataByFileNumber = async () => {
    const fNumber = watch("DefendantFileNumber");
    if (!fNumber) {
      setValue("DefendantFileNumber", "", { shouldValidate: true });
      setHasInitiatedFileNumberSearch(false);
      setIsWaitingForEstablishment(false);
      return;
    }
    setHasInitiatedFileNumberSearch(true);
    setIsWaitingForEstablishment(true);
    try {
      await triggerGetStablishmentData({
        AcceptedLanguage: i18n.language.toUpperCase(),
        SourceSystem: "E-Services",
        FileNumber: fNumber,
      });
      // trigger('DefendantFileNumber');
    } catch (error) {
      setHasInitiatedFileNumberSearch(false);
      setEstablishmentDetailsByFileNumber(null);
      setIsWaitingForEstablishment(false);
    }
  };

  // to get estrablishment data from redio selection
  const [
    triggerMyEstablishmentData,
    { data: myEstablishment, isLoading: isMyEstablishmentLoading },
  ] = useLazyGetEstablishmentDetailsQuery();

  useEffect(() => {
    if (myEstablishment && myEstablishment?.EstablishmentInfo?.length !== 0) {
      const establishmentInfo = myEstablishment?.EstablishmentInfo?.[0];

      // Set cookies
      setCookie("getDefendEstablishmentData", establishmentInfo);
      setCookie("defendantDetails", establishmentInfo);

      // Set form values
      setValue(
        "Defendant_Establishment_data",
        establishmentInfo,
        {
          shouldValidate: establishmentInfo,
        }
      );

      // Set region and city only if they exist
      if (establishmentInfo?.Region && establishmentInfo?.Region_Code) {
        setValue(
          "defendantRegion",
          {
            label: establishmentInfo.Region,
            value: establishmentInfo.Region_Code,
          }
        );
      }

      if (establishmentInfo?.City && establishmentInfo?.City_Code) {
        setValue(
          "defendantCity",
          {
            label: establishmentInfo.City,
            value: establishmentInfo.City_Code,
          }
        );
      }
    } else {
      if (myEstablishment && myEstablishment.ErrorList) {
        toast.warning("Failed To Fetch Establishment Data");
      }
      // Only clear if there's an error, not on every render
      if (myEstablishment && myEstablishment.ErrorList) {
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
    }
  }, [myEstablishment, setValue, setCookie]);

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
    res && setSelectedDataEstablishment(true);
  };

  const extracFileNumberFromWorkingEstData = (estName: string) => {
    const establishment: any =
      getEstablismentWorkingData?.EstablishmentData.find(
        (val: any) => val.EstablishmentName === estName
      );
    return establishment ? establishment.EstablishmentFileNumber : null;
  };

  const defendantRegion = watch("defendantRegion");


  // Region/City/Occupation/Nationality lookups
  const { data: regionData } = useGetWorkerRegionLookupDataQuery({
    AcceptedLanguage: i18n.language.toUpperCase(),
    SourceSystem: "E-Services",
    ModuleKey: "EstablishmentRegion",
    ModuleName: "EstablishmentRegion",
  });
  const {
    data: cityData,
    isFetching: isCityLoading,
    isError: isCityError,
  } = useGetWorkerCityLookupDataQuery(
    {
      AcceptedLanguage: i18n.language.toUpperCase(),
      SourceSystem: "E-Services",
      selectedWorkerRegion: typeof defendantRegion === 'object' ? defendantRegion?.value : defendantRegion || "",
      ModuleName: "EstablishmentCity",
    },
    { skip: !(typeof defendantRegion === 'object' ? defendantRegion?.value : defendantRegion) }
  );

  useEffect(() => {
    if (cityData && isCityError) {
      toast.error("Error fetching city data");
    }
  }, [cityData, isCityError]);

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

  // Note: City field configuration has been fixed to handle cases where region comes in response but city doesn't
  // The city field will now properly show as autocomplete with options when region is set but city is not

  //#endregion hassan

  useEffect(() => {
    if (defendantDetails) {
      setCookie("defendantDetails", defendantDetails);
      setCookie("getCookieEstablishmentData", defendantDetails);
    }
  }, [defendantDetails]);


  // Show Non-Governmental and Governmental entities only if no establishments or user chooses "Others"
  const [showGovNonGovRadios, setShowGovNonGovRadios] = useState<boolean>(true);


  useEffect(() => {
    const shouldBeIn = ["Establishment", "Government", "Others"];
    if (shouldBeIn.includes(defendantStatus?.toString() || "")) {
      console.log("this is defTime ", defendantStatus);
      setShowGovNonGovRadios(true);
    } else {
      setShowGovNonGovRadios(false);
    }
  }, [defendantStatus]);



  // Show government fields only when defendantStatus is Government
  const showGovSectionFields = defendantStatus === "Government";

  // Show non-gov section only when defendantStatus is Establishment
  const showNonGovSection = defendantStatus === "Establishment";

  const GovernmentOptions = React.useMemo(() => {
    if (!governmentData?.DataElements) return [];
    return governmentData.DataElements.map((item: { ElementKey: string; ElementValue: string }) => ({
      value: item.ElementKey,
      label: item.ElementValue,
    }));
  }, [governmentData]);

  const SubGovernmentOptions = React.useMemo(() => {
    if (!subGovernmentData?.DataElements) return [];
    return subGovernmentData.DataElements.map((item: { ElementKey: string; ElementValue: string }) => ({
      value: item.ElementKey,
      label: item.ElementValue,
    }));
  }, [subGovernmentData]);



  // Reset subcategory when main category changes
  useEffect(() => {
    // Only clear subcategory if main category actually changed and is different from previous
    // AND the user hasn't manually selected a subcategory
    if (mainCategory !== prevMainCategory && !hasManuallySelectedSubCategory) {
      setValue("subcategory_of_the_government_entity" as keyof FormData, null, { shouldValidate: false });
      setHasInteractedWithSubCategory(false);
      setHasManuallySelectedSubCategory(false);
      setPrevMainCategory(mainCategory);
    } else if (mainCategory !== prevMainCategory) {
      // If main category changed but user has manually selected subcategory, just update the previous value
      setPrevMainCategory(mainCategory);
    }
  }, [mainCategory, setValue, prevMainCategory, hasManuallySelectedSubCategory]);

  // Clear main and sub government fields when an establishment is selected
  useEffect(() => {
    if (establishmentValue && !hasManuallySelectedSubCategory) {
      setValue("main_category_of_the_government_entity" as keyof FormData, null, { shouldValidate: false });
      setValue("subcategory_of_the_government_entity" as keyof FormData, null, { shouldValidate: false });
      setHasInteractedWithSubCategory(false);
      setHasManuallySelectedSubCategory(false);
    }
  }, [establishmentValue, setValue, hasManuallySelectedSubCategory]);

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
          value: mainCategory,
          onChange: (value: any) => {
            setValue("main_category_of_the_government_entity" as keyof FormData, value);
            setValue("subcategory_of_the_government_entity" as keyof FormData, null, { shouldValidate: false });
            setHasInteractedWithSubCategory(false);
            setHasManuallySelectedSubCategory(false);
          },
          onClear: () => {
            setValue("main_category_of_the_government_entity" as keyof FormData, null, { shouldValidate: false });
            setValue("subcategory_of_the_government_entity" as keyof FormData, null, { shouldValidate: false });
            setHasInteractedWithSubCategory(false);
            setHasManuallySelectedSubCategory(false);
          }
        },
        showGovSectionFields && {
          type: "autocomplete",
          label: t("subcategory_of_the_government_entity"),
          name: "subcategory_of_the_government_entity",
          options: SubGovernmentOptions,
          validation: {
            required: mainCategory ? (hasInteractedWithSubCategory ? t("subCategoryGovernValidation") : " ") : false
          },
          value: subCategoryValue,
          disabled: !mainCategory,
          onChange: (value: any) => {
            setValue("subcategory_of_the_government_entity" as keyof FormData, value, { shouldValidate: true });
            setHasInteractedWithSubCategory(true);
            setHasManuallySelectedSubCategory(true);
          },
          onClear: () => {
            setValue("subcategory_of_the_government_entity" as keyof FormData, null, { shouldValidate: false });
            setHasInteractedWithSubCategory(false);
            setHasManuallySelectedSubCategory(false);
          }
        },
      ].filter(Boolean),
    },

    ...(showNonGovSection
      ? [
        {
          removeMargin: true,
          children: [
            {
              isLoading: isEstablishmentLoading,
              type: "input",
              label: t("fileNumber"),
              name: "DefendantFileNumber",
              inputType: "text",
              value: watch("DefendantFileNumber") || "",
              onBlur: () => getEstablishmentDataByFileNumber(),
              validation: {
                validate: (value: string) => {
                  if (!value) {
                    return t("fileNumberValidation");
                  }
                  if (hasInitiatedFileNumberSearch) {
                    if (isEstablishmentLoading || isWaitingForEstablishment) {
                      return t("Please wait for establishment details to load");
                    }
                    if (!establishmentDetailsByFileNumber || Object.keys(establishmentDetailsByFileNumber).length === 0) {
                      return t("No establishment found for this File Number");
                    }
                  }
                  return true;
                }
              },
            },
            ...(establishmentDetailsByFileNumber && establishmentDetailsByFileNumber !== null && !isEstablishmentLoading
              ? [
                {
                  isLoading: isEstablishmentLoading,
                  type: "readonly",
                  label: t("commercialRegistrationNumber"),
                  value: establishmentDetailsByFileNumber?.CRNumber,
                },
                // hassan code 700
                {
                  isLoading: isEstablishmentLoading,
                  type: "readonly",
                  label: t("number700"),
                  value: establishmentDetailsByFileNumber?.Number700,
                },
                // hassan code 700

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
                  name: "defendantRegion",
                  type: !establishmentDetailsByFileNumber?.Region && !establishmentDetailsByFileNumber?.region
                    ? "autocomplete"
                    : "readonly",
                  value: establishmentDetailsByFileNumber?.Region || establishmentDetailsByFileNumber?.region || "",
                  ...((!establishmentDetailsByFileNumber?.Region && !establishmentDetailsByFileNumber?.region) && {
                    options: RegionOptions,
                    validation: {
                      required: t("regionValidation"),
                      validate: (value: any) => {
                        if (!value || !value.value) {
                          return t("regionValidation");
                        }
                        return true;
                      }
                    },
                  }),
                  onChange: (v: any) => {
                    if (!v || !v.value) {
                      setValue("defendantRegion", null, { shouldValidate: true });
                    } else {
                      setValue("defendantRegion", v, { shouldValidate: true });
                    }
                  },
                },
                {
                  isLoading: isEstablishmentLoading,
                  type: !establishmentDetailsByFileNumber?.City && !establishmentDetailsByFileNumber?.city
                    ? "autocomplete"
                    : "readonly",
                  label: t("city"),
                  name: "defendantCity",
                  value: establishmentDetailsByFileNumber?.City || establishmentDetailsByFileNumber?.city || watch("defendantCity") || "",
                  ...((!establishmentDetailsByFileNumber?.City && !establishmentDetailsByFileNumber?.city) && {
                    options: CityOptions,
                    validation: {
                      required: t("cityValidation"),
                      validate: (value: any) => {
                        if (!value || !value.value) {
                          return t("cityValidation");
                        }
                        return true;
                      }
                    },
                  }),
                  onChange: (v: any) => {
                    if (!v || !v.value) {
                      setValue("defendantCity", null, { shouldValidate: true });
                    } else {
                      setValue("defendantCity", v, { shouldValidate: true });
                    }
                  },
                },
                {
                  maxLength: 10,
                  type: "input",
                  name: "phoneNumber",
                  label: t("phoneNumber"),
                  inputType: "text",
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

