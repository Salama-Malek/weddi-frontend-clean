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
import { useDebouncedCallback } from "@/shared/hooks/use-debounced-callback";

export const useFormLayout = (
  setValue: UseFormSetValue<FormData>,
  watch: UseFormWatch<FormData>,
  trigger: UseFormTrigger<FormData>,
  governmentData?: any,
  subGovernmentData?: any,
  caseDetailsLoading?: boolean,
  defendantData?: any
): { layout: SectionLayout[]; isOnlyFileNumberFilled: () => boolean } => {
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
  const [hasManuallySelectedSubCategory, setHasManuallySelectedSubCategory] = useState(false);
  const [idNumberPlainteff, setIdNumberPlainteff] = useState<string>("");
  
  // Consolidated establishment search state
  const [establishmentSearchState, setEstablishmentSearchState] = useState<'idle' | 'loading' | 'success' | 'error' | 'not_found'>('idle');
  const {
    formState,
    formData
  } = useAPIFormsData();

  // Function to clear all establishment-related data
  const clearEstablishmentData = () => {
    console.log("[🔍 DEFENDANT] clearEstablishmentData called - clearing establishment data");
    
    // Don't clear establishment data during form submission
    if (formState.isSubmitting) {
      console.log("[🔍 DEFENDANT] Skipping clearEstablishmentData - form is submitting");
      return;
    }
    
    setValue("Defendant_Establishment_data_NON_SELECTED", undefined, {
      shouldValidate: true,
    });
    setValue("Defendant_Establishment_data", undefined, {
      shouldValidate: true,
    });
    setEstablishmentDetailsByFileNumber(null);
    setEstablishmentSearchState('idle');
  };

  // Function to check if only file number is filled (for Next and Save button validation)
  const isOnlyFileNumberFilled = () => {
    const fileNumber = watch("DefendantFileNumber");
    const region = watch("defendantRegion");
    const city = watch("defendantCity");
    const phoneNumber = watch("establishment_phoneNumber");
    const defendantStatus = watch("defendantStatus");
    const defendantDetails = watch("defendantDetails");
    const mainCategory = watch("main_category_of_the_government_entity");
    const subCategory = watch("subcategory_of_the_government_entity");
    const establishmentData = watch("Defendant_Establishment_data_NON_SELECTED");
    
    const result = !!fileNumber && 
           !region && 
           !city && 
           !phoneNumber && 
           !defendantStatus && 
           !defendantDetails && 
           !mainCategory && 
           !subCategory &&
           (!establishmentData || !establishmentData.EstablishmentName || !establishmentData.FileNumber);
    
    console.log("[🔍 DEFENDANT] isOnlyFileNumberFilled check:", {
      fileNumber,
      region,
      city,
      phoneNumber,
      defendantStatus,
      defendantDetails,
      mainCategory,
      subCategory,
      establishmentData,
      result
    });
    
    return result;
  };


  //#region hassan
  const userClaims: TokenClaims = getCookie("userClaims");
  const userType = getCookie("userType");
  const [wrorkedEstablishmetUsers, setWrorkedEstablishmetUsers] = useState<Array<{ label: string; value: string }>>([
    {
      label: t("others"),
      value: "Others",
    },
  ]);

  const [
    establishmentDetailsByFileNumber,
    setEstablishmentDetailsByFileNumber,
  ] = useState<any>(undefined);

  const [selectedDataEstablishment, setSelectedDataEstablishment] =
    useState<boolean>(false);


  useEffect(() => {
    if (caseDetailsLoading && defendantData) {
      try {
        const caseDetails = defendantData;
        if (!caseDetails || caseDetails === "null" || caseDetails === "") {
          setIdNumberPlainteff("");
          return;
        }
        setIdNumberPlainteff(caseDetails?.PlaintiffId || "");
      } catch (error) {
        setIdNumberPlainteff("");
      }
    }
  }, [caseDetailsLoading, defendantData])

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
        skip: !["Worker", "Embassy User"].includes(userType) || !caseDetailsLoading || idNumberPlainteff === ""
      }
    );

  useEffect(() => {
    if (
      getEstablismentWorkingData && getEstablismentWorkingData?.EstablishmentData &&
      getEstablismentWorkingData?.EstablishmentData?.length !== 0
    ) {
      const establishments = getEstablismentWorkingData?.EstablishmentData?.map((est: any) => ({
        label: est.EstablishmentName,
        value:
          est.EstablishmentID ||
          est.FileNumber ||
          est.CRNumber ||
          est.EstablishmentName,
      })).concat({
        label: t("others"),
        value: "Others",
      });
      setWrorkedEstablishmetUsers(establishments);
    } else {
      // When no establishment data, show "Others" as the only option
      setWrorkedEstablishmetUsers([{
        label: t("others"),
        value: "Others",
      }]);
      // Set defendantDetails to "Others" to show the full options
      setValue("defendantDetails", "Others");
    }
  }, [getEstablismentWorkingData?.EstablishmentData?.length, setValue, t]);



  useEffect(() => {
    // Don't run this effect during form submission to prevent data clearing
    if (formState.isSubmitting) {
      console.log("[🔍 DEFENDANT FORM] Skipping defendantDetails effect - form is submitting");
      return;
    }
    
    // Only set defendantDetails to "Others" if it's undefined AND we don't have any establishment data
    // This prevents clearing valid data after form resets
    if (defendantDetails === undefined) {
      const establishmentData = watch("Defendant_Establishment_data_NON_SELECTED");
      const fileNumber = watch("DefendantFileNumber");
      
      // Only set to "Others" if we don't have any establishment data or file number
      if (!establishmentData && !fileNumber) {
        console.log("[🔍 DEFENDANT FORM] Setting defendantDetails to 'Others' - no establishment data found");
        setValue("defendantDetails", "Others");
      } else {
        console.log("[🔍 DEFENDANT FORM] Skipping setting defendantDetails to 'Others' - establishment data or file number exists");
      }
    }
  }, [defendantDetails, watch, setValue, formState.isSubmitting])

  // Prefill from case details if available
  useEffect(() => {
    if (caseDetailsLoading) {
      try {
        const storedData = localStorage.getItem("DefendantDetails");
        if (!storedData || storedData === "null" || storedData === "") {
          return;
        }
        const caseDetails = JSON.parse(storedData);
        if (caseDetails) {
          // Handle establishment data prefill
          if (caseDetails.DefendantType === "Establishment" && caseDetails.DefendantEstFileNumber) {
            // Set defendant status to Establishment to show the correct section
            setValue("defendantStatus", "Establishment");

            // Set file number
            setValue("DefendantFileNumber", caseDetails.DefendantEstFileNumber);

            // Create establishment data object with all available fields
            const establishmentData = {
              EstablishmentName: caseDetails.EstablishmentFullName || caseDetails.DefendantName || "",
              FileNumber: caseDetails.DefendantEstFileNumber || "",
              CRNumber: caseDetails.Defendant_CRNumber || "",
              Number700: caseDetails.Defendant_Number700 || "",
              Region: caseDetails.Defendant_Region || "",
              Region_Code: caseDetails.Defendant_Region_Code || "",
              City: caseDetails.Defendant_City || "",
              City_Code: caseDetails.Defendant_City_Code || "",
              region: null,
              city: null,
            };

            setValue("Defendant_Establishment_data_NON_SELECTED", establishmentData);

            // Set region and city if available
            if (caseDetails.Defendant_Region_Code && caseDetails.Defendant_Region) {
              setValue("defendantRegion", {
                value: caseDetails.Defendant_Region_Code,
                label: caseDetails.Defendant_Region,
              });
            }
            if (caseDetails.Defendant_City_Code && caseDetails.Defendant_City) {
              setValue("defendantCity", {
                value: caseDetails.Defendant_City_Code,
                label: caseDetails.Defendant_City,
              });
            }

            // Set phone number
            if (caseDetails.Defendant_PhoneNumber) {
              setValue("establishment_phoneNumber", caseDetails.Defendant_PhoneNumber);
            }

            // Set establishment details in state for display
            setEstablishmentDetailsByFileNumber(establishmentData);

            // Trigger establishment data fetch to ensure all data is loaded
            if (caseDetails.DefendantEstFileNumber) {
              setEstablishmentSearchState('loading');
              triggerGetStablishmentData({
                FileNumber: caseDetails.DefendantEstFileNumber,
                AcceptedLanguage: "EN"
              });
            }
          }

          // Handle government entity data prefill
          if (caseDetails.DefendantType_Code === "Government") {
            // Set defendant status to Government to show the correct section
            setValue("defendantStatus", "Government");
            setValue("defendantDetails", "Government");

            // Set main government category
            if (caseDetails.Defendant_MainGovtDefend_Code && caseDetails.Defendant_MainGovtDefend) {
              setValue("main_category_of_the_government_entity", {
                value: caseDetails.Defendant_MainGovtDefend_Code,
                label: caseDetails.Defendant_MainGovtDefend,
              } as any);
            }

            // Set sub government category
            if (caseDetails.DefendantSubGovtDefend_Code && caseDetails.DefendantSubGovtDefend) {
              setValue("subcategory_of_the_government_entity", {
                value: caseDetails.DefendantSubGovtDefend_Code,
                label: caseDetails.DefendantSubGovtDefend,
              } as any);
            }

            // Set phone number if available
            if (caseDetails.Defendant_PhoneNumber && caseDetails.Defendant_PhoneNumber !== "0") {
              setValue("establishment_phoneNumber", caseDetails.Defendant_PhoneNumber);
            }
          }
        }
      } catch (error) {
        console.error("Error parsing defendant details:", error);
      }
    }
  }, [caseDetailsLoading, setValue]);


  // to get establishment data from field input
  const [
    triggerGetStablishmentData,
    { data: establishmentData, isLoading: isEstablishmentLoading },
  ] = useLazyGetEstablishmentDetailsQuery();

  // Consolidated useEffect to handle establishment data
  useEffect(() => {
    console.log("[🔍 DEFENDANT] Establishment data useEffect triggered:", {
      establishmentData,
      hasEstablishmentInfo: establishmentData?.EstablishmentInfo?.length !== 0,
      hasErrorDetails: establishmentData?.ErrorDetails?.length !== 0,
      establishmentInfoLength: establishmentData?.EstablishmentInfo?.length,
      isSubmitting: formState.isSubmitting
    });
    
    if (establishmentData && establishmentData?.EstablishmentInfo?.length !== 0) {
      const establishmentInfo = establishmentData?.EstablishmentInfo?.[0];

      // Set state
      setEstablishmentDetailsByFileNumber(establishmentInfo);
      setEstablishmentSearchState('success');

      // Set cookies
      setCookie("getDefendEstablishmentData", establishmentInfo);
      setCookie("defendantDetails", establishmentInfo);

      // Set form values only if not already set or if data is different
      console.log("[🔍 DEFENDANT] Setting establishment data from API response:", establishmentInfo);
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
      console.log("[🔍 DEFENDANT] Establishment data error:", establishmentData.ErrorDetails);
      setEstablishmentDetailsByFileNumber(null);
      setEstablishmentSearchState('error');
    } else if (establishmentData && establishmentData?.EstablishmentInfo?.length === 0) {
      // API returned successfully but no establishment found
      console.log("[🔍 DEFENDANT] No establishment found for file number");
      setEstablishmentDetailsByFileNumber(null);
      setEstablishmentSearchState('not_found');
    }
  }, [establishmentData, setValue, setCookie, formState.isSubmitting]);

  const getEstablishmentDataByFileNumber = async () => {
    const fNumber = watch("DefendantFileNumber");
    const currentEstablishmentData = watch("Defendant_Establishment_data_NON_SELECTED");
    
    // Don't search if we already have valid establishment data for this file number
    if (currentEstablishmentData && currentEstablishmentData.FileNumber === fNumber && currentEstablishmentData.EstablishmentName) {
      console.log("[🔍 DEFENDANT] Skipping establishment search - already have valid data for file number:", fNumber);
      return;
    }
    
    if (!fNumber || fNumber.length < 3) {
      setEstablishmentSearchState('idle');
      return;
    }
    
    console.log("[🔍 DEFENDANT] Starting establishment search for file number:", fNumber);
    setEstablishmentSearchState('loading');
    try {
      const result = await triggerGetStablishmentData({
        AcceptedLanguage: i18n.language.toUpperCase(),
        SourceSystem: "E-Services",
        FileNumber: fNumber,
      });
      
      // Check if the API call was successful
      if (result.error) {
        console.log("[🔍 DEFENDANT] Establishment search failed:", result.error);
        setEstablishmentSearchState('error');
        setEstablishmentDetailsByFileNumber(null);
      }
      // Note: The success case is handled in the useEffect below
    } catch (error) {
      console.log("[🔍 DEFENDANT] Establishment search error:", error);
      setEstablishmentSearchState('error');
      setEstablishmentDetailsByFileNumber(null);
    }
  };

  // Debounced version to prevent multiple rapid API calls
  const debouncedGetEstablishmentData = useDebouncedCallback(
    getEstablishmentDataByFileNumber,
    [watch, setValue, triggerGetStablishmentData, i18n.language],
    500 // 500ms delay
  );

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


  // Show Non-Governmental and Governmental entities when user chooses "Others" or when no establishments are available
  const [showGovNonGovRadios, setShowGovNonGovRadios] = useState<boolean>(true);


  useEffect(() => {
    // Show the radio options when:
    // 1. Defendant status is "Establishment", "Government", or "Others"
    // 2. Defendant details is "Others" (meaning user selected Others from establishment list)
    // 3. No establishment data is available (wrorkedEstablishmetUsers has only "Others" option)
    const shouldShow =
      ["Establishment", "Government", "Others"].includes(defendantStatus?.toString() || "") ||
      defendantDetails === "Others" ||
      (wrorkedEstablishmetUsers && wrorkedEstablishmetUsers.length === 1 && wrorkedEstablishmetUsers[0].value === "Others");

    setShowGovNonGovRadios(shouldShow);
  }, [defendantStatus, defendantDetails, wrorkedEstablishmetUsers?.length]);



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

  const layout = [
    // Only show establishment selection if there are multiple establishments
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
      : wrorkedEstablishmetUsers && wrorkedEstablishmetUsers.length > 1
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

    // Defendant type selection (Government/Establishment)
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

    // Government entity fields (only shown when Government is selected)
    ...(showGovSectionFields
      ? [
        {
          title: "",
          children: [
            {
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
            {
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
          ],
        },
      ]
      : []),

    ...(showNonGovSection
      ? [
        {
          removeMargin: true,
          children: [
                         {
               isLoading: establishmentSearchState === 'loading',
               type: "input",
               label: t("fileNumber"),
               name: "DefendantFileNumber",
               placeholder: establishmentSearchState === 'loading' ? t("establishmentLoadingMessage") : "XX-XXXXXXX",
               inputType: "text",
               value: watch("DefendantFileNumber") || "",
               onBlur: () => debouncedGetEstablishmentData(),
              onChange: (value: string) => {
                console.log("[🔍 DEFENDANT] File number onChange called", {
                  newValue: value,
                  currentValue: watch("DefendantFileNumber"),
                  isSubmitting: formState.isSubmitting,
                  establishmentData: watch("Defendant_Establishment_data_NON_SELECTED"),
                  formState: formState
                });
                
                // Don't process changes during form submission
                if (formState.isSubmitting || formState.isValidating) {
                  console.log("[🔍 DEFENDANT] Skipping file number onChange - form is submitting or validating");
                  return;
                }
                
                // Only clear establishment data if the value actually changed significantly
                const currentValue = watch("DefendantFileNumber");
                const currentEstablishmentData = watch("Defendant_Establishment_data_NON_SELECTED");
                
                if (value !== currentValue) {
                  // Only clear if we don't have matching establishment data
                  if (currentEstablishmentData && currentEstablishmentData.FileNumber === value) {
                    console.log("[🔍 DEFENDANT] File number changed but establishment data matches, skipping clear");
                  } else if (value.length < 3) {
                    // Only clear if the new value is too short to be valid
                    console.log("[🔍 DEFENDANT] File number too short, clearing establishment data");
                    clearEstablishmentData();
                  } else {
                    // For valid file numbers, don't clear immediately - let the API call handle it
                    console.log("[🔍 DEFENDANT] File number changed to valid length, will fetch new data");
                  }
                }
                
                // Trigger search on change with debouncing only for valid file numbers
                if (value && value.length >= 3 && establishmentSearchState !== 'loading') {
                  console.log("[🔍 DEFENDANT] Triggering debounced establishment search");
                  debouncedGetEstablishmentData();
                }
              },
                             validation: {
                 validate: (value: string) => {
                   if (!value) {
                     return t("fileNumberValidation");
                   }
                   
                   // Simple validation based on file number length
                   if (value.length < 3) {
                     return t("establishmentEnterValidNumber");
                   }
                   
                   // If file number is 3+ characters but no establishment data is loaded yet
                   const establishmentData = watch("Defendant_Establishment_data_NON_SELECTED");
                   if (!establishmentData || !establishmentData.EstablishmentName || !establishmentData.FileNumber) {
                     // Only show loading message if we're actually loading
                     if (establishmentSearchState === 'loading') {
                       return t("establishmentLoadingMessage");
                     }
                     // If not loading and no data, allow the field to be valid
                     // The establishment data will be fetched on blur
                     return true;
                   }
                   
                   // If establishment data is loaded, check for any errors
                   switch (establishmentSearchState) {
                     case 'loading':
                       return t("establishmentWaitForLoading");
                     case 'error':
                       return t("establishmentErrorFetching");
                     case 'not_found':
                       return t("establishmentNotFound");
                     case 'success':
                       return true;
                     default:
                       return true;
                   }
                 }
               },
            },
            ...(establishmentSearchState === 'success' && establishmentDetailsByFileNumber && establishmentDetailsByFileNumber !== null
              ? [
                {
                  isLoading: false, // No loading state needed for readonly fields when data is already loaded
                  type: "readonly",
                  label: t("commercialRegistrationNumber"),
                  value: establishmentDetailsByFileNumber?.CRNumber,
                },
                // hassan code 700
                {
                  isLoading: false,
                  type: "readonly",
                  label: t("number700"),
                  value: establishmentDetailsByFileNumber?.Number700,
                },
                // hassan code 700

                {
                  isLoading: false,
                  type: "readonly",
                  label: t("name"),
                  value:
                    establishmentDetailsByFileNumber?.EstablishmentName,
                },
                {
                  isLoading: false,
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
                    console.log("[🔍 DEFENDANT] defendantRegion onChange called:", {
                      value: v,
                      timestamp: new Date().toISOString()
                    });
                    if (!v || !v.value) {
                      console.log("[🔍 DEFENDANT] Setting defendantRegion to null");
                      setValue("defendantRegion", null, { shouldValidate: true });
                      console.log("[🔍 DEFENDANT] Setting defendantCity to null");
                      setValue("defendantCity", null, { shouldValidate: true });
                    } else {
                      console.log("[🔍 DEFENDANT] Setting defendantRegion to:", v);
                      setValue("defendantRegion", v, { shouldValidate: true });
                      console.log("[🔍 DEFENDANT] Setting defendantCity to null");
                      setValue("defendantCity", null, { shouldValidate: true });
                    }
                  },
                },
                {
                  isLoading: false,
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
                    console.log("[🔍 DEFENDANT] defendantCity onChange called:", {
                      value: v,
                      timestamp: new Date().toISOString()
                    });
                    if (!v || !v.value) {
                      console.log("[🔍 DEFENDANT] Setting defendantCity to null");
                      setValue("defendantCity", null, { shouldValidate: true });
                    } else {
                      console.log("[🔍 DEFENDANT] Setting defendantCity to:", v);
                      setValue("defendantCity", v, { shouldValidate: true });
                    }
                  },
                },
                {
                  maxLength: 10,
                  type: "input",
                  name: "establishment_phoneNumber",
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



  return {
    layout,
    isOnlyFileNumberFilled
  };
};

