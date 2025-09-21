import { UseFormSetValue, UseFormWatch, UseFormTrigger } from "react-hook-form";
import {
  SectionLayout,
  FormData,
} from "@/shared/components/form/form.types";
import { useFormOptions } from "./defendant.forms.formOptions";
import { useTranslation } from "react-i18next";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import EstablishmentSelectionSkeleton from "@/shared/components/loader/EstablishmentLoader";
import {
  useGetExtractedEstablishmentDataQuery,
  useLazyGetEstablishmentDetailsQuery,
} from "@/features/initiate-hearing/api/create-case/defendantDetailsApis";
import { toast } from "react-toastify";
import {
  useGetWorkerCityLookupDataQuery,
  useGetWorkerRegionLookupDataQuery,
} from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";
import { useAPIFormsData } from "@/providers/FormContext";

interface EstablishmentState {
  status: "idle" | "loading" | "success" | "error" | "not_found";
  data: any;
  originalValues: { fileNumber: string; crNumber: string };
  hasLoaded: boolean;
  lastRequestId: string;
}

export const useFormLayout = (
  setValue: UseFormSetValue<FormData>,
  watch: UseFormWatch<FormData>,
  trigger: UseFormTrigger<FormData>,
  governmentData?: any,
  subGovernmentData?: any,
  caseDetailsLoading?: boolean,
  defendantData?: any,
  hasDefendantPrefill?: boolean
): { layout: SectionLayout[]; isOnlyFileNumberFilled: () => boolean } => {
  const { IsGovernmentRadioOptions } = useFormOptions([]);
  const [getCookie, setCookie] = useCookieState({ caseId: "" });
  const { t, i18n } = useTranslation("hearingdetails");
  const defendantStatus = watch("defendantStatus");
  const defendantDetails = watch("defendantDetails");
  const mainCategory = watch(
    "main_category_of_the_government_entity" as keyof FormData
  );
  const subCategoryValue = watch(
    "subcategory_of_the_government_entity" as keyof FormData
  );
  const establishmentValue = watch("EstablishmentData" as keyof FormData);
  const [prevMainCategory, setPrevMainCategory] = useState(mainCategory);
  const [hasInteractedWithSubCategory, setHasInteractedWithSubCategory] =
    useState(false);
  const [hasManuallySelectedSubCategory, setHasManuallySelectedSubCategory] =
    useState(false);
  const [hasSubCategoryFromCaseDetails, setHasSubCategoryFromCaseDetails] =
    useState(false);
  const [idNumberPlainteff, setIdNumberPlainteff] = useState<string>("");

  const [isPrefilling, setIsPrefilling] = useState(false);
  const [previousDefendantCity, setPreviousDefendantCity] = useState<any>(null);

  const [establishmentState, setEstablishmentState] =
    useState<EstablishmentState>({
      status: "idle",
      data: null,
      originalValues: { fileNumber: "", crNumber: "" },
      hasLoaded: false,
      lastRequestId: "",
    });

  const [isManuallyChangingNumbers, setIsManuallyChangingNumbers] =
    useState<boolean>(false);

  const currentRequestRef = useRef<AbortController | null>(null);

  const lastRequestedKeyRef = useRef<string | null>(null);
  const lastCompletedKeyRef = useRef<string | null>(null);

  const lastEditedNumberRef = useRef<"file" | "cr" | null>(null);

  const lastTriggerSourceRef = useRef<
    "onChange" | "onBlur" | "programmatic" | null
  >(null);

  const [selectedDataEstablishment, setSelectedDataEstablishment] =
    useState<boolean>(false);

  const { formState, setError, clearErrors } = useAPIFormsData();

  

  const isValidFileNumber = useCallback((value: string): boolean => {
    if (!value) return false;

    if (!/^[0-9-]+$/.test(value)) return false;
    if ((value.match(/-/g) || []).length !== 1) return false;
    if (value.length > 10) return false;
    const [left, right] = value.split("-");
    return Boolean(left && right && /\d+/.test(left) && /\d+/.test(right));
  }, []);



  const isValidCRNumber = useCallback((value: string): boolean => {
    return /^\d{10}$/.test(value || "");
  }, []);

  const updateEstablishmentState = useCallback(
    (updates: Partial<EstablishmentState>) => {
      setEstablishmentState((prev) => ({
        ...prev,
        ...updates,
        lastRequestId: updates.lastRequestId || prev.lastRequestId,
      }));
    },
    []
  );

  const clearAllEstablishmentFields = useCallback(
    (shouldShowToast = true) => {
      if (formState.isSubmitting) return;

      [
        "DefendantNumber700",
        "DefendantEstablishmentName",
        "defendantRegion",
        "defendantCity",
        "establishment_phoneNumber",
        "EstablishmentData",
        "Defendant_Establishment_data_NON_SELECTED",
      ].forEach((field) => {
        setValue(
          field as any,
          field.includes("Region") || field.includes("City") ? null : "",
          {
            shouldValidate: false,
            shouldDirty: true,
          }
        );
      });

      updateEstablishmentState({
        status: "idle",
        data: null,
        hasLoaded: false,
        originalValues: { fileNumber: "", crNumber: "" },
        lastRequestId: "",
      });

      if (shouldShowToast) {
        const clearedMsg =
          i18n.language === "ar"
            ? "تم مسح جميع بيانات المنشأة."
            : "All establishment fields have been cleared.";
        toast.info(
          t("establishmentFieldsCleared", { defaultValue: clearedMsg })
        );
      }
    },
    [
      formState.isSubmitting,
      setValue,
      updateEstablishmentState,
      t,
      i18n.language,
    ]
  );


  const userType = getCookie("userType");
  const [wrorkedEstablishmetUsers, setWrorkedEstablishmetUsers] = useState<
    Array<{ label: string; value: string }>
  >([
    {
      label: t("others"),
      value: "Others",
    },
  ]);

  useEffect(() => {
    let plaintiffId = "";

    try {
      if (defendantData && defendantData.PlaintiffId) {
        plaintiffId = defendantData?.PlaintiffId || "";
      }
      setIdNumberPlainteff(plaintiffId);
    } catch (error) {
      setIdNumberPlainteff("");
    }
  }, [caseDetailsLoading, defendantData]);

  const caseId = getCookie("caseId");
  const shouldSkipEstablishmentAPI =
    !["Worker", "Embassy User"].includes(userType) ||
    idNumberPlainteff === "" ||
    !caseId;

  const { data: getEstablismentWorkingData, isLoading: ExtractEstDataLoading } =
    useGetExtractedEstablishmentDataQuery(
      {
        WorkerId: idNumberPlainteff,
        AcceptedLanguage: i18n.language.toUpperCase(),
        SourceSystem: "E-Services",
        UserType: userType,
        CaseID: caseId,
      },
      {
        skip: shouldSkipEstablishmentAPI,
      }
    );

  useEffect(() => {
    if (
      getEstablismentWorkingData &&
      getEstablismentWorkingData?.EstablishmentData &&
      getEstablismentWorkingData?.EstablishmentData?.length !== 0
    ) {
      const establishments = getEstablismentWorkingData?.EstablishmentData?.map(
        (est: any) => ({
          label: est.EstablishmentName,
          value: est.EstablishmentName,
        })
      ).concat({
        label: t("others"),
        value: "Others",
      });
      setWrorkedEstablishmetUsers(establishments);
    } else {
      setWrorkedEstablishmetUsers([
        {
          label: t("others"),
          value: "Others",
        },
      ]);

      setValue("defendantDetails", "Others");
    }
  }, [
    getEstablismentWorkingData?.EstablishmentData?.length,
    setValue,
    t,
    watch,
  ]);

  const [
    triggerGetEstablishmentData,
    { data: establishmentData },
  ] = useLazyGetEstablishmentDetailsQuery();

  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const handleUserInteraction = useCallback(() => {
    if (!hasUserInteracted) {
      setHasUserInteracted(true);

      setTimeout(() => {
        trigger();
      }, 100);
    }
  }, [hasUserInteracted, trigger]);

  const isOnlyFileNumberFilled = useCallback(() => {
    const isGovernmentEntity = defendantStatus === "Government";

    if (isGovernmentEntity) {
      const mainCategory = watch("main_category_of_the_government_entity");
      const subCategory = watch("subcategory_of_the_government_entity");

      const mainCategoryValue =
        mainCategory &&
        typeof mainCategory === "object" &&
        "value" in mainCategory
          ? (mainCategory as any).value
          : mainCategory;
      const subCategoryValue =
        subCategory && typeof subCategory === "object" && "value" in subCategory
          ? (subCategory as any).value
          : subCategory;
      const hasRequiredGovFields = mainCategoryValue && subCategoryValue;
      return !hasRequiredGovFields;
    }

    if (!hasUserInteracted) {
      return false;
    }

    const fileNumber = watch("DefendantFileNumber");
    const crNumber = watch("DefendantCRNumber");
    const region = watch("defendantRegion");
    const city = watch("defendantCity");
    const phoneNumber = watch("establishment_phoneNumber");
    const establishmentName = watch("DefendantEstablishmentName");
    const number700 = watch("DefendantNumber700");

    const result =
      (!!fileNumber || !!crNumber) &&
      (!region || !region.value) &&
      (!city || !city.value) &&
      !phoneNumber &&
      !establishmentName &&
      !number700;

    return result;
  }, [watch, hasUserInteracted, defendantStatus]);

  useEffect(() => {
    if (isManuallyChangingNumbers) {
      return;
    }

    if (establishmentData) {
      const errorCode = establishmentData?.ErrorDetails?.[0]?.ErrorCode;
      if (errorCode === "ER4012") {
        const fieldName =
          lastEditedNumberRef.current === "file"
            ? "DefendantFileNumber"
            : "DefendantCRNumber";
        setValue("DefendantFileNumber", "", {
          shouldValidate: false,
          shouldDirty: true,
        });
        setValue("DefendantCRNumber", "", {
          shouldValidate: false,
          shouldDirty: true,
        });
        clearAllEstablishmentFields(false);
        updateEstablishmentState({
          status: "not_found",
          data: null,
          hasLoaded: false,
          originalValues: { fileNumber: "", crNumber: "" },
        });
        setError(fieldName as any, {
          type: "manual",
          message:
            i18n.language === "ar"
              ? "لا توجد بيانات للرقم المدخل"
              : "No data found for the entered number",
        });
        setIsManuallyChangingNumbers(false);
        return;
      }

      if (establishmentData.EstablishmentInfo?.length) {
        const establishmentInfo = establishmentData.EstablishmentInfo[0];
        updateEstablishmentState({
          status: "success",
          data: establishmentInfo,
          originalValues: {
            fileNumber: establishmentInfo.FileNumber || "",
            crNumber: establishmentInfo.CRNumber || "",
          },
          hasLoaded: true,
        });

        const currentFile = watch("DefendantFileNumber");
        const currentCR = watch("DefendantCRNumber");
        setCookie("getDefendEstablishmentData", establishmentInfo);
        setCookie("defendantDetails", establishmentInfo);
        setValue(
          "Defendant_Establishment_data_NON_SELECTED",
          establishmentInfo
        );
        if (
          lastEditedNumberRef.current !== "file" &&
          (!currentFile ||
            currentFile === establishmentState.originalValues.fileNumber)
        ) {
          setValue("DefendantFileNumber", establishmentInfo.FileNumber || "");
        }
        if (
          lastEditedNumberRef.current !== "cr" &&
          (!currentCR ||
            currentCR === establishmentState.originalValues.crNumber)
        ) {
          setValue("DefendantCRNumber", establishmentInfo.CRNumber || "");
        }
        if (establishmentInfo.Region && establishmentInfo.Region_Code) {
          setValue("defendantRegion", {
            label: establishmentInfo.Region,
            value: establishmentInfo.Region_Code,
          });
          setValue("Defendant_Establishment_data_NON_SELECTED.region", {
            label: establishmentInfo.Region,
            value: establishmentInfo.Region_Code,
          });
        }
        if (establishmentInfo.City && establishmentInfo.City_Code) {
          setValue("defendantCity", {
            label: establishmentInfo.City,
            value: establishmentInfo.City_Code,
          });
          setValue("Defendant_Establishment_data_NON_SELECTED.city", {
            label: establishmentInfo.City,
            value: establishmentInfo.City_Code,
          });
        }
        if (establishmentInfo.Number700) {
          setValue(
            "Defendant_Establishment_data_NON_SELECTED.Number700",
            establishmentInfo.Number700
          );
        }
      } else {
        const status =
          establishmentData.EstablishmentInfo?.length === 0
            ? "not_found"
            : "error";
        const fieldName =
          lastEditedNumberRef.current === "file"
            ? "DefendantFileNumber"
            : "DefendantCRNumber";
        setValue("DefendantFileNumber", "", {
          shouldValidate: false,
          shouldDirty: true,
        });
        setValue("DefendantCRNumber", "", {
          shouldValidate: false,
          shouldDirty: true,
        });
        clearAllEstablishmentFields(false);
        updateEstablishmentState({
          status,
          data: null,
          originalValues: { fileNumber: "", crNumber: "" },
          hasLoaded: false,
        });
        setError(fieldName as any, {
          type: "manual",
          message:
            i18n.language === "ar"
              ? "لا توجد بيانات للرقم المدخل"
              : "No data found for the entered number",
        });
      }

      setIsManuallyChangingNumbers(false);
    }
  }, [
    establishmentData,
    setValue,
    setCookie,
    isManuallyChangingNumbers,
    updateEstablishmentState,
    watch,
    clearAllEstablishmentFields,
    t,
    i18n.language,
  ]);

  const getEstablishmentDataByNumber = useCallback(async () => {
    if (isManuallyChangingNumbers) {
    }

    if (caseDetailsLoading === false && defendantData && isPrefilling) {
      return;
    }

    const fNumber = watch("DefendantFileNumber");
    const crNumber = watch("DefendantCRNumber");

    if (!fNumber && !crNumber) {
      updateEstablishmentState({ status: "idle" });
      return;
    }

    try {
      const params: any = {
        AcceptedLanguage: i18n.language.toUpperCase(),
        SourceSystem: "E-Services",
      };

      if (lastEditedNumberRef.current === "file") {
        if (fNumber) params.FileNumber = fNumber;
      } else if (lastEditedNumberRef.current === "cr") {
        if (crNumber) params.CRNumber = crNumber;
      } else {
        if (fNumber && !crNumber) params.FileNumber = fNumber;
        else if (crNumber && !fNumber) params.CRNumber = crNumber;
        else if (fNumber && crNumber) {
          params.FileNumber = fNumber;
        }
      }

      if (!params.FileNumber && !params.CRNumber) {
        updateEstablishmentState({ status: "idle" });
        return;
      }

      const requestKey = params.FileNumber
        ? `file:${params.FileNumber}`
        : `cr:${params.CRNumber}`;
      if (requestKey) {
        if (
          lastRequestedKeyRef.current === requestKey &&
          establishmentState.status === "loading"
        ) {
          return;
        }
        lastRequestedKeyRef.current = requestKey;
      }

      if (lastTriggerSourceRef.current !== "onBlur") {
        updateEstablishmentState({ status: "loading" });
      }
      if (currentRequestRef.current) {
        currentRequestRef.current.abort();
        currentRequestRef.current = null;
      }
      currentRequestRef.current = new AbortController();

      const result = await triggerGetEstablishmentData(params);

      if (!result.error && (result as any)?.data?.EstablishmentInfo?.length) {
        const info = (result as any).data.EstablishmentInfo[0];

        clearAllEstablishmentFields(false);
        updateEstablishmentState({
          status: "success",
          data: info,
          originalValues: {
            fileNumber: info.FileNumber || "",
            crNumber: info.CRNumber || "",
          },
          hasLoaded: true,
        });
        if (watch("defendantStatus") !== "Establishment") {
          setValue("defendantStatus", "Establishment");
        }
        setCookie("getDefendEstablishmentData", info);
        setCookie("defendantDetails", info);
        setValue("Defendant_Establishment_data_NON_SELECTED", info, {
          shouldValidate: true,
        });
        setValue("Defendant_Establishment_data", info, {
          shouldValidate: true,
        });
        if (info.FileNumber)
          setValue("DefendantFileNumber", info.FileNumber, {
            shouldValidate: true,
          });
        if (info.CRNumber)
          setValue("DefendantCRNumber", info.CRNumber, {
            shouldValidate: true,
          });
        if (info.EstablishmentName)
          setValue("DefendantEstablishmentName", info.EstablishmentName, {
            shouldValidate: true,
          });
        if (info.Number700)
          setValue("DefendantNumber700", info.Number700, {
            shouldValidate: true,
          });
        if (info.Region && info.Region_Code) {
          setValue(
            "defendantRegion",
            { label: info.Region, value: info.Region_Code },
            { shouldValidate: true }
          );
          setValue(
            "Defendant_Establishment_data_NON_SELECTED.region",
            { label: info.Region, value: info.Region_Code },
            { shouldValidate: false }
          );
        }
        if (info.City && info.City_Code) {
          setValue(
            "defendantCity",
            { label: info.City, value: info.City_Code },
            { shouldValidate: true }
          );
          setValue(
            "Defendant_Establishment_data_NON_SELECTED.city",
            { label: info.City, value: info.City_Code },
            { shouldValidate: false }
          );
        }
        if (info.Number700)
          setValue(
            "Defendant_Establishment_data_NON_SELECTED.Number700",
            info.Number700,
            { shouldValidate: false }
          );
        clearErrors(["DefendantFileNumber", "DefendantCRNumber"] as any);
        setIsManuallyChangingNumbers(false);
      }

      if (!result.error && requestKey) {
        lastCompletedKeyRef.current = requestKey;
      }

      if (result.error) {
        updateEstablishmentState({
          status: "error",
          data: null,
          hasLoaded: false,
        });

        setValue("defendantRegion", null, {
          shouldValidate: false,
          shouldDirty: true,
        });

        setValue("defendantCity", null, {
          shouldValidate: false,
          shouldDirty: true,
        });

        setValue("establishment_phoneNumber", "", {
          shouldValidate: false,
          shouldDirty: true,
        });

        setValue("DefendantNumber700", "", {
          shouldValidate: false,
          shouldDirty: true,
        });

        setValue("DefendantEstablishmentName", "", {
          shouldValidate: false,
          shouldDirty: true,
        });

        setValue("Defendant_Establishment_data_NON_SELECTED", undefined, {
          shouldValidate: false,
          shouldDirty: true,
        });

        setValue("Defendant_Establishment_data_NON_SELECTED.region", null, {
          shouldValidate: false,
          shouldDirty: true,
        });
        setValue("Defendant_Establishment_data_NON_SELECTED.city", null, {
          shouldValidate: false,
          shouldDirty: true,
        });
        setValue("Defendant_Establishment_data_NON_SELECTED.Number700", "", {
          shouldValidate: false,
          shouldDirty: true,
        });

        updateEstablishmentState({
          originalValues: { fileNumber: "", crNumber: "" },
        });
      }
    } catch (error) {
      updateEstablishmentState({
        status: "error",
        data: null,
        hasLoaded: false,
      });

      setValue("defendantRegion", null, {
        shouldValidate: false,
        shouldDirty: true,
      });

      setValue("defendantCity", null, {
        shouldValidate: false,
        shouldDirty: true,
      });

      setValue("establishment_phoneNumber", "", {
        shouldValidate: false,
        shouldDirty: true,
      });

      setValue("DefendantNumber700", "", {
        shouldValidate: false,
        shouldDirty: true,
      });

      setValue("DefendantEstablishmentName", "", {
        shouldValidate: false,
        shouldDirty: true,
      });

      setValue("Defendant_Establishment_data_NON_SELECTED", undefined, {
        shouldValidate: false,
        shouldDirty: true,
      });

      setValue("Defendant_Establishment_data_NON_SELECTED.region", null, {
        shouldValidate: false,
        shouldDirty: true,
      });
      setValue("Defendant_Establishment_data_NON_SELECTED.city", null, {
        shouldValidate: false,
        shouldDirty: true,
      });
      setValue("Defendant_Establishment_data_NON_SELECTED.Number700", "", {
        shouldValidate: false,
        shouldDirty: true,
      });

      updateEstablishmentState({
        originalValues: { fileNumber: "", crNumber: "" },
      });
    }
  }, [
    watch,
    triggerGetEstablishmentData,
    i18n.language,
    setValue,
    setEstablishmentState,
    isManuallyChangingNumbers,
    caseDetailsLoading,
    defendantData,
    t,
    clearAllEstablishmentFields,
  ]);

  const [
    triggerMyEstablishmentData,
    { data: myEstablishment },
  ] = useLazyGetEstablishmentDetailsQuery();

  useEffect(() => {
    if (isManuallyChangingNumbers) {
      return;
    }

    if (myEstablishment) {
      if (myEstablishment.EstablishmentInfo?.length) {
        const info = myEstablishment.EstablishmentInfo[0];
        try {
        } catch {}
        setSelectedDataEstablishment(true);
        updateEstablishmentState({
          status: "idle",
          data: null,
          originalValues: { fileNumber: "", crNumber: "" },
          hasLoaded: false,
        });

        clearAllEstablishmentFields(false);

        try {
          setCookie("getDefendEstablishmentData", info);
          setCookie("defendantDetails", info);
          setCookie("isEstablishment", true as any);
          setCookie("defendantStatus", "Establishment");
        } catch {}
        setValue("Defendant_Establishment_data_NON_SELECTED", info, {
          shouldValidate: false,
        });
        setValue("Defendant_Establishment_data", info, {
          shouldValidate: false,
        });
        try {
        } catch {}

        if (!hasUserInteracted) {
          setHasUserInteracted(true);
        }
        clearErrors();
      } else {
        if (myEstablishment.ErrorList) {
          toast.warning("Failed To Fetch Establishment Data");
        }
        setValue(
          "Defendant_Establishment_data",
          { region: null, city: null },
          { shouldValidate: false }
        );
      }

      setIsManuallyChangingNumbers(false);
    }
  }, [
    myEstablishment,
    setValue,
    setCookie,
    isManuallyChangingNumbers,
    updateEstablishmentState,
    watch,
  ]);

  const getSelectedEstablishmentData = async (value: string) => {
    if (value === "Others") {
      try {
      } catch {}
      clearAllEstablishmentFields(false);
      setValue("DefendantFileNumber", "", { shouldValidate: false });
      setValue("DefendantCRNumber", "", { shouldValidate: false });
      setValue("Defendant_Establishment_data_NON_SELECTED", undefined as any, {
        shouldValidate: false,
      });
      setValue("Defendant_Establishment_data", undefined as any, {
        shouldValidate: false,
      });
      setSelectedDataEstablishment(false);
      updateEstablishmentState({
        status: "idle",
        data: null,
        hasLoaded: false,
        originalValues: { fileNumber: "", crNumber: "" },
      });
      clearErrors();

      try {
        setCookie("defendantDetails", "Others");
        setCookie("getDefendEstablishmentData", null as any);
        setCookie("defendantStatus", "Establishment");
      } catch {}
      return;
    }

    try {
      setCookie("defendantDetails", value);
    } catch {}
    const selectedEstData = extracFileNumberFromWorkingEstData(value);
    const params: any = {
      AcceptedLanguage: i18n.language.toUpperCase(),
      SourceSystem: "E-Services",
    };

    if (selectedEstData?.FileNumber) {
      params.FileNumber = selectedEstData.FileNumber;
    }

    if (selectedEstData?.CRNumber) {
      params.CRNumber = selectedEstData.CRNumber;
    }
    try {
    } catch {}

    const res = await triggerMyEstablishmentData(params);
    if (res && (res as any)?.data?.EstablishmentInfo?.length) {
      setSelectedDataEstablishment(true);
      const info = (res as any).data.EstablishmentInfo[0];

      setValue("DefendantFileNumber", info.FileNumber || "", {
        shouldValidate: false,
      });
      setValue("DefendantCRNumber", info.CRNumber || "", {
        shouldValidate: false,
      });
      setValue("DefendantEstablishmentName", info.EstablishmentName || "", {
        shouldValidate: false,
      });
      setValue("DefendantNumber700", info.Number700 || "", {
        shouldValidate: false,
      });

      if (info.Region && info.Region_Code) {
        setValue(
          "defendantRegion",
          {
            value: info.Region_Code,
            label: info.Region,
          },
          { shouldValidate: false }
        );
      }

      if (info.City && info.City_Code) {
        setValue(
          "defendantCity",
          {
            value: info.City_Code,
            label: info.City,
          },
          { shouldValidate: false }
        );
      }

      setValue("Defendant_Establishment_data", info, { shouldValidate: false });
      setValue("Defendant_Establishment_data_NON_SELECTED", info, {
        shouldValidate: false,
      });

      clearErrors();
      if (!hasUserInteracted) {
        setHasUserInteracted(true);
      }

      try {
        setCookie("defendantDetails", value);
        setCookie("getDefendEstablishmentData", info);
        setCookie("isEstablishment", true as any);
        setCookie("defendantStatus", "Establishment");
      } catch {}

      try {
      } catch {}

      setTimeout(() => {
        trigger();
      }, 200);
    }
  };

  const extracFileNumberFromWorkingEstData = (estName: string) => {
    const establishment: any =
      getEstablismentWorkingData?.EstablishmentData.find(
        (val: any) => val.EstablishmentName === estName
      );
    return establishment
      ? {
          FileNumber: establishment.EstablishmentFileNumber,
          CRNumber: establishment.CRNumber,
        }
      : null;
  };

  const defendantRegion = watch("defendantRegion");
  const defendantCity = watch("defendantCity");

  useEffect(() => {
    if (isPrefilling || !previousDefendantCity) {
      setPreviousDefendantCity(defendantCity);
      return;
    }

    if (!defendantCity && !previousDefendantCity) {
      return;
    }

    if (
      JSON.stringify(defendantCity) === JSON.stringify(previousDefendantCity)
    ) {
      return;
    }

    if (
      establishmentState.status === "success" &&
      establishmentState.data?.City
    ) {
      setPreviousDefendantCity(defendantCity);
      return;
    }

    if (isPrefilling) {
      setPreviousDefendantCity(defendantCity);
      return;
    }

    if (defendantCity !== previousDefendantCity && hasUserInteracted) {
      setValue("defendantRegion", null, { shouldValidate: true });
    }

    setPreviousDefendantCity(defendantCity);
  }, [
    defendantCity,
    isPrefilling,
    establishmentState.status,
    caseDetailsLoading,
    hasUserInteracted,
  ]);

  useEffect(() => {
    if (caseDetailsLoading === true) {
      setIsPrefilling(true);

      const timer = setTimeout(() => {
        setIsPrefilling(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [caseDetailsLoading]);

  const { data: regionData } = useGetWorkerRegionLookupDataQuery({
    AcceptedLanguage: i18n.language.toUpperCase(),
    SourceSystem: "E-Services",
    ModuleKey: "EstablishmentRegion",
    ModuleName: "EstablishmentRegion",
  });
  const {
    data: cityData,
    isError: isCityError,
  } = useGetWorkerCityLookupDataQuery(
    {
      AcceptedLanguage: i18n.language.toUpperCase(),
      SourceSystem: "E-Services",
      selectedWorkerRegion:
        typeof defendantRegion === "object"
          ? defendantRegion?.value
          : defendantRegion || "",
      ModuleName: "EstablishmentCity",
    },
    {
      skip: !(typeof defendantRegion === "object"
        ? defendantRegion?.value
        : defendantRegion),
    }
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

  useEffect(() => {
    if (defendantDetails) {
      setCookie("defendantDetails", defendantDetails);
    }
  }, [defendantDetails]);

  useEffect(() => {
    if (
      establishmentState.status === "success" &&
      establishmentState.data &&
      !isManuallyChangingNumbers
    ) {
      const data = establishmentState.data;

      if (data.EstablishmentName) {
        setValue("DefendantEstablishmentName", data.EstablishmentName, {
          shouldValidate: true,
        });
      }
      if (data.Number700) {
        setValue("DefendantNumber700", data.Number700, {
          shouldValidate: true,
        });
      }
      if (data.Region && data.Region_Code) {
        setValue(
          "defendantRegion",
          {
            value: data.Region_Code,
            label: data.Region,
          },
          { shouldValidate: true }
        );
      }
      if (data.City && data.City_Code) {
        setValue(
          "defendantCity",
          {
            value: data.City_Code,
            label: data.City,
          },
          { shouldValidate: true }
        );
      }

      setValue("Defendant_Establishment_data_NON_SELECTED", data, {
        shouldValidate: true,
      });

      updateEstablishmentState({
        originalValues: {
          fileNumber: data.FileNumber || "",
          crNumber: data.CRNumber || "",
        },
      });

      setIsManuallyChangingNumbers(false);

      const completedKey = data?.FileNumber
        ? `file:${data.FileNumber}`
        : data?.CRNumber
        ? `cr:${data.CRNumber}`
        : null;
      if (completedKey) {
        lastCompletedKeyRef.current = completedKey;
      }

      clearErrors(["DefendantFileNumber", "DefendantCRNumber"] as any);
    }
  }, [
    establishmentState.status,
    establishmentState.data,
    isManuallyChangingNumbers,
    setValue,
    updateEstablishmentState,
  ]);

  const [showGovNonGovRadios, setShowGovNonGovRadios] = useState<boolean>(true);

  useEffect(() => {
    const shouldShow = defendantDetails === "Others";
    setShowGovNonGovRadios(shouldShow);
  }, [defendantDetails]);

  const selectedEstablishmentObj = watch("Defendant_Establishment_data");
  const selectedEstablishmentObjNonSelected = watch(
    "Defendant_Establishment_data_NON_SELECTED"
  );
  const prefillName = watch("DefendantEstablishmentName");
  const prefillRegion = watch("defendantRegion");
  const prefillCity = watch("defendantCity");
  const prefillPhone = watch("establishment_phoneNumber");
  const hasEstablishmentPrefill = !!(
    selectedEstablishmentObj ||
    selectedEstablishmentObjNonSelected ||
    prefillName ||
    (prefillRegion && (prefillRegion as any)?.value) ||
    (prefillCity && (prefillCity as any)?.value) ||
    prefillPhone
  );

  const hasGovPrefill = !!(
    mainCategory &&
    (typeof mainCategory === "object"
      ? (mainCategory as any).value
      : mainCategory) &&
    subCategoryValue &&
    (typeof subCategoryValue === "object"
      ? (subCategoryValue as any).value
      : subCategoryValue)
  );

  useEffect(() => {
    if (hasDefendantPrefill) {
      setValue("defendantDetails", "Others");
    }
  }, [hasDefendantPrefill, caseDetailsLoading]);

  const showGovSectionFields =
    defendantStatus === "Government" &&
    (defendantDetails === "Others" || hasGovPrefill);

  const showNonGovSection =
    defendantStatus === "Establishment" &&
    (defendantDetails === "Others" ||
      (hasEstablishmentPrefill && !selectedDataEstablishment));

  const GovernmentOptions = React.useMemo(() => {
    if (!governmentData?.DataElements) return [];
    return governmentData.DataElements.map(
      (item: { ElementKey: string; ElementValue: string }) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })
    );
  }, [governmentData]);

  const SubGovernmentOptions = React.useMemo(() => {
    if (!subGovernmentData?.DataElements) return [];
    return subGovernmentData.DataElements.map(
      (item: { ElementKey: string; ElementValue: string }) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })
    );
  }, [subGovernmentData]);

  useEffect(() => {
    const shouldClearSubCategory =
      mainCategory !== prevMainCategory &&
      !hasManuallySelectedSubCategory &&
      !hasSubCategoryFromCaseDetails &&
      !subCategoryValue;

    if (shouldClearSubCategory) {
      setValue("subcategory_of_the_government_entity" as keyof FormData, null, {
        shouldValidate: false,
      });
      setHasInteractedWithSubCategory(false);
      setHasManuallySelectedSubCategory(false);
      setPrevMainCategory(mainCategory);
    } else if (mainCategory !== prevMainCategory) {
      setPrevMainCategory(mainCategory);
    }
  }, [
    mainCategory,
    setValue,
    prevMainCategory,
    hasManuallySelectedSubCategory,
    hasSubCategoryFromCaseDetails,
    subCategoryValue,
  ]);

  useEffect(() => {
    if (defendantStatus === "Government" && !hasUserInteracted) {
      const mainCategory = watch("main_category_of_the_government_entity");
      const subCategory = watch("subcategory_of_the_government_entity");
      const mainCategoryValue =
        mainCategory &&
        typeof mainCategory === "object" &&
        "value" in mainCategory
          ? (mainCategory as any).value
          : mainCategory;
      const subCategoryValue =
        subCategory && typeof subCategory === "object" && "value" in subCategory
          ? (subCategory as any).value
          : subCategory;
      if (mainCategoryValue && subCategoryValue) {
        setHasUserInteracted(true);
        setHasSubCategoryFromCaseDetails(true);
        setTimeout(() => {
          trigger();
        }, 100);
      }
    }
  }, [
    defendantStatus,
    watch("main_category_of_the_government_entity"),
    watch("subcategory_of_the_government_entity"),
    hasUserInteracted,
    trigger,
  ]);

  useEffect(() => {
    setValue("defendantStatus", "");

    setValue("main_category_of_the_government_entity" as keyof FormData, null, {
      shouldValidate: false,
    });
    setValue("subcategory_of_the_government_entity" as keyof FormData, null, {
      shouldValidate: false,
    });
    setHasInteractedWithSubCategory(false);
    setHasManuallySelectedSubCategory(false);

    clearAllEstablishmentFields(false);
    setValue("Defendant_Establishment_data_NON_SELECTED", undefined, {
      shouldValidate: false,
    });
    setValue("Defendant_Establishment_data", undefined, {
      shouldValidate: false,
    });
    setValue("DefendantFileNumber", "", { shouldValidate: false });
    setValue("DefendantCRNumber", "", { shouldValidate: false });
    updateEstablishmentState({
      status: "idle",
      data: null,
      hasLoaded: false,
      originalValues: { fileNumber: "", crNumber: "" },
    });
  }, []);

  useEffect(() => {
    if (
      establishmentValue &&
      !hasManuallySelectedSubCategory &&
      !hasSubCategoryFromCaseDetails &&
      !subCategoryValue
    ) {
      setValue(
        "main_category_of_the_government_entity" as keyof FormData,
        null,
        { shouldValidate: false }
      );
      setValue("subcategory_of_the_government_entity" as keyof FormData, null, {
        shouldValidate: false,
      });
      setHasInteractedWithSubCategory(false);
      setHasManuallySelectedSubCategory(false);
    }
  }, [
    establishmentValue,
    setValue,
    hasManuallySelectedSubCategory,
    hasSubCategoryFromCaseDetails,
    subCategoryValue,
  ]);

  useEffect(() => {
    if (defendantStatus === "Government") {
      clearAllEstablishmentFields(false);
      setValue("Defendant_Establishment_data_NON_SELECTED", undefined, {
        shouldValidate: false,
      });
      setValue("Defendant_Establishment_data", undefined, {
        shouldValidate: false,
      });
      setValue("DefendantFileNumber", "", { shouldValidate: false });
      setValue("DefendantCRNumber", "", { shouldValidate: false });
      updateEstablishmentState({
        status: "idle",
        data: null,
        hasLoaded: false,
        originalValues: { fileNumber: "", crNumber: "" },
      });
    }
  }, [
    defendantStatus,
    clearAllEstablishmentFields,
    updateEstablishmentState,
    setValue,
  ]);

  const ClearAndHideNonGovields = (feildName: string) => {
    clearAllEstablishmentFields(false);
    if (feildName === "crNumber") {
      setValue("DefendantFileNumber", "", { shouldValidate: false });
    }
    if (feildName === "fileNumber") {
      setValue("DefendantCRNumber", "", { shouldValidate: false });
    }
    setValue("Defendant_Establishment_data_NON_SELECTED", undefined, {
      shouldValidate: false,
    });
    setValue("Defendant_Establishment_data", undefined, {
      shouldValidate: false,
    });
  };

  useEffect(() => {
    if (!hasDefendantPrefill && ExtractEstDataLoading) return;

    const hasPrefillAndHaveEstData =
      hasDefendantPrefill &&
      wrorkedEstablishmetUsers.length !== 0 &&
      defendantData;
    if (hasPrefillAndHaveEstData) {
      const isWorker: any = wrorkedEstablishmetUsers.find(
        (val) => val.value === defendantData.DefendantsEstablishmentPrisonerName
      );
      if (isWorker) {
        setValue("defendantDetails", isWorker.value);
        setSelectedDataEstablishment(true);
        setShowGovNonGovRadios(false);
        const establishmentData: any = {
          EstablishmentName:
            defendantData.DefendantsEstablishmentPrisonerName || "",
        };
        if (defendantData.DefendantFileNumber) {
          establishmentData.FileNumber = defendantData.DefendantFileNumber;
        }
        if (defendantData.Defendant_CRNumber) {
          establishmentData.CRNumber = defendantData.Defendant_CRNumber;
        }
        if (defendantData.Defendant_Number700) {
          establishmentData.Number700 = defendantData.Defendant_Number700;
        }
        if (
          defendantData.Defendant_Region &&
          defendantData.Defendant_Region_Code
        ) {
          establishmentData.Region = defendantData.Defendant_Region;
          establishmentData.Region_Code = defendantData.Defendant_Region_Code;
        }
        if (defendantData.Defendant_City && defendantData.Defendant_City_Code) {
          establishmentData.City = defendantData.Defendant_City;
          establishmentData.City_Code = defendantData.Defendant_City_Code;
        }
        if (defendantData.establishment_phoneNumber) {
          establishmentData.ContactNumber =
            defendantData.establishment_phoneNumber;
        }

        setValue("Defendant_Establishment_data", establishmentData as any, {
          shouldValidate: true,
        });
        setValue(
          "Defendant_Establishment_data_NON_SELECTED",
          establishmentData as any,
          { shouldValidate: true }
        );
        if (defendantData.DefendantFileNumber) {
          setValue("DefendantFileNumber", defendantData.DefendantFileNumber, {
            shouldValidate: true,
          });
        }
        if (defendantData.Defendant_CRNumber) {
          setValue("DefendantCRNumber", defendantData.Defendant_CRNumber, {
            shouldValidate: true,
          });
        }
        if (defendantData.Defendant_Number700) {
          setValue("DefendantNumber700", defendantData.Defendant_Number700, {
            shouldValidate: true,
          });
        }
        if (defendantData.DefendantsEstablishmentPrisonerName) {
          setValue(
            "DefendantEstablishmentName",
            defendantData.DefendantsEstablishmentPrisonerName,
            { shouldValidate: true }
          );
        }
        if (defendantData.establishment_phoneNumber) {
          setValue(
            "establishment_phoneNumber",
            defendantData.establishment_phoneNumber,
            { shouldValidate: true }
          );
        }

        if (
          defendantData.Defendant_Region_Code &&
          defendantData.Defendant_Region
        ) {
          setValue(
            "defendantRegion",
            {
              value: defendantData.Defendant_Region_Code,
              label: defendantData.Defendant_Region,
            },
            { shouldValidate: true }
          );
        }
        if (defendantData.Defendant_City_Code && defendantData.Defendant_City) {
          setValue(
            "defendantCity",
            {
              value: defendantData.Defendant_City_Code,
              label: defendantData.Defendant_City,
            },
            { shouldValidate: true }
          );
        }

        if (!hasUserInteracted) {
          setHasUserInteracted(true);
        }

        clearErrors();
        setTimeout(() => {
          trigger();
        }, 100);
      }
    }
  }, [hasDefendantPrefill, wrorkedEstablishmetUsers, ExtractEstDataLoading]);

  const layout = [
    ...(ExtractEstDataLoading
      ? [
          {
            title: t("tab2_title"),
            isRadio: true,
            gridCols: 1,
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
            gridCols: 1,
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

                  try {
                    setCookie("defendantDetails", value);
                    if (value === "Others") {
                      setCookie("getDefendEstablishmentData", null as any);
                      setCookie("defendantStatus", "Establishment");

                      setCookie("isEstablishment", false as any);
                    }
                  } catch {}

                  setValue("defendantStatus", "Establishment");
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
            gridCols: 1,
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

    ...(showGovSectionFields
      ? [
          {
            title: "",
            gridCols: 2,
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
                  handleUserInteraction();
                  setValue(
                    "main_category_of_the_government_entity" as keyof FormData,
                    value
                  );

                  if (!hasSubCategoryFromCaseDetails) {
                    setValue(
                      "subcategory_of_the_government_entity" as keyof FormData,
                      null,
                      { shouldValidate: false }
                    );
                    setHasInteractedWithSubCategory(false);
                    setHasManuallySelectedSubCategory(false);
                  }
                },
                onClear: () => {
                  handleUserInteraction();
                  setValue(
                    "main_category_of_the_government_entity" as keyof FormData,
                    null,
                    { shouldValidate: false }
                  );
                  setValue(
                    "subcategory_of_the_government_entity" as keyof FormData,
                    null,
                    { shouldValidate: false }
                  );
                  setHasInteractedWithSubCategory(false);
                  setHasManuallySelectedSubCategory(false);
                  setHasSubCategoryFromCaseDetails(false);
                },
              },
              {
                type: "autocomplete",
                label: t("subcategory_of_the_government_entity"),
                name: "subcategory_of_the_government_entity",
                options: SubGovernmentOptions,
                validation: {
                  required: mainCategory
                    ? hasInteractedWithSubCategory ||
                      hasSubCategoryFromCaseDetails
                      ? t("subCategoryGovernValidation")
                      : " "
                    : false,
                },
                value: subCategoryValue,
                disabled: !mainCategory,
                onChange: (value: any) => {
                  handleUserInteraction();
                  setValue(
                    "subcategory_of_the_government_entity" as keyof FormData,
                    value,
                    { shouldValidate: true }
                  );
                  setHasInteractedWithSubCategory(true);
                  setHasManuallySelectedSubCategory(true);

                  setHasSubCategoryFromCaseDetails(false);
                },
                onClear: () => {
                  handleUserInteraction();
                  setValue(
                    "subcategory_of_the_government_entity" as keyof FormData,
                    null,
                    { shouldValidate: false }
                  );
                  setHasInteractedWithSubCategory(false);
                  setHasManuallySelectedSubCategory(false);
                  setHasSubCategoryFromCaseDetails(false);
                },
              },
            ],
          },
        ]
      : []),

    ...(showNonGovSection
      ? [
          {
            removeMargin: true,
            gridCols: 2,
            children: [
              {
                isLoading: establishmentState.status === "loading",
                type: "input",
                label: t("fileNumber"),
                name: "DefendantFileNumber",
                placeholder:
                  establishmentState.status === "loading"
                    ? t("establishmentLoadingMessage")
                    : "XX-XXXXXXX",
                inputType: "text",
                maxLength: 10,
                value: watch("DefendantFileNumber") || "",
                onChange: (_e: any) => {
                  ClearAndHideNonGovields("fileNumber");
                },

                onBlur: () => {
                  handleUserInteraction();
                  lastTriggerSourceRef.current = "onBlur";

                  lastEditedNumberRef.current = "file";
                  const current = watch("DefendantFileNumber") || "";

                  setIsManuallyChangingNumbers(false);

                  if (!current || current.trim() === "") {
                    clearAllEstablishmentFields(false);
                    setError("DefendantFileNumber" as any, {
                      type: "manual",
                      message:
                        i18n.language === "ar"
                          ? "الرجاء إدخال رقم ملف"
                          : "Please enter a File Number",
                    });
                    return;
                  }

                  if (!isValidFileNumber(current)) {
                    clearAllEstablishmentFields(false);
                    setError("DefendantFileNumber" as any, {
                      type: "manual",
                      message:
                        i18n.language === "ar"
                          ? "الرجاء ادخال رقم ملف صحيح"
                          : "Please enter a valid File Number",
                    });
                    return;
                  }
                  if (watch("defendantStatus") !== "Establishment") {
                    setValue("defendantStatus", "Establishment");
                  }
                  getEstablishmentDataByNumber();
                },
                validation: {
                  validate: (value: string) => {
                    if (!hasUserInteracted) {
                      return true;
                    }

                    if (!value) return true;

                    if (!/^[0-9-]+$/.test(value)) {
                      return i18n.language === "ar"
                        ? "الرجاء ادخال رقم ملف صحيح"
                        : "Please enter a valid File Number";
                    }
                    if ((value.match(/-/g) || []).length !== 1) {
                      return i18n.language === "ar"
                        ? "الرجاء ادخال رقم ملف صحيح"
                        : "Please enter a valid File Number";
                    }
                    if (value.length > 10) {
                      return i18n.language === "ar"
                        ? "الرجاء ادخال رقم ملف صحيح"
                        : "Please enter a valid File Number";
                    }
                    const [left, right] = value.split("-");
                    if (!left || !right) {
                      return i18n.language === "ar"
                        ? "الرجاء ادخال رقم ملف صحيح"
                        : "Please enter a valid File Number";
                    }
                    return true;
                  },
                },
              },

              {
                isLoading: establishmentState.status === "loading",
                type: "input",
                label: t("commercialRegistrationNumber"),
                name: "DefendantCRNumber",
                placeholder:
                  establishmentState.status === "loading"
                    ? t("establishmentLoadingMessage")
                    : "XXXXXXXXXX",
                inputType: "text",
                maxLength: 10,
                value: watch("DefendantCRNumber") || "",
                onChange: (_e: any) => {
                  ClearAndHideNonGovields("crNumber");
                },

                onBlur: () => {
                  handleUserInteraction();
                  lastTriggerSourceRef.current = "onBlur";

                  lastEditedNumberRef.current = "cr";
                  const current = watch("DefendantCRNumber") || "";

                  setIsManuallyChangingNumbers(false);

                  if (!current || current.trim() === "") {
                    clearAllEstablishmentFields(false);
                    setError("DefendantCRNumber" as any, {
                      type: "manual",
                      message:
                        i18n.language === "ar"
                          ? "الرجاء إدخال رقم سجل تجاري"
                          : "Please enter a Commercial Registration Number",
                    });
                    return;
                  }

                  if (!isValidCRNumber(current)) {
                    clearAllEstablishmentFields(false);
                    setError("DefendantCRNumber" as any, {
                      type: "manual",
                      message:
                        i18n.language === "ar"
                          ? "الرجاء إدخال رقم سجل تجاري صحيح"
                          : "Please enter a valid Commercial Registration Number",
                    });
                    return;
                  }
                  if (watch("defendantStatus") !== "Establishment") {
                    setValue("defendantStatus", "Establishment");
                  }
                  getEstablishmentDataByNumber();
                },
                validation: {
                  validate: (value: string) => {
                    if (!hasUserInteracted) {
                      return true;
                    }
                    if (!value) return true;
                    if (!/^\d+$/.test(value)) {
                      return i18n.language === "ar"
                        ? "الرجاء إدخال رقم سجل تجاري صحيح"
                        : "Please enter a valid Commercial Registration Number";
                    }
                    if (value.length !== 10) {
                      return i18n.language === "ar"
                        ? "الرجاء إدخال رقم سجل تجاري صحيح"
                        : "Please enter a valid Commercial Registration Number";
                    }
                    return true;
                  },
                },
              },
              ...(establishmentState.status === "success" ||
              hasEstablishmentPrefill
                ? [
                    {
                      isLoading: false,
                      type:
                        establishmentState.status === "success" &&
                        establishmentState.data?.Number700
                          ? "readonly"
                          : "readonly",
                      label: t("number700"),
                      name: "DefendantNumber700",
                      placeholder:
                        !establishmentState.hasLoaded && !caseDetailsLoading
                          ? t("Please enter File Number or CR Number first")
                          : "XXXXXXX",
                      inputType: "text",
                      disabled: false,
                      value:
                        establishmentState.status === "success" &&
                        establishmentState.data?.Number700
                          ? establishmentState.data?.Number700
                          : watch("DefendantNumber700") || "",
                    },

                    {
                      isLoading: false,
                      type: "readonly",
                      label: t("name"),
                      name: "DefendantEstablishmentName",
                      placeholder:
                        !establishmentState.hasLoaded && !caseDetailsLoading
                          ? t("Please enter File Number or CR Number first")
                          : t("establishmentNamePlaceholder"),
                      inputType: "text",
                      disabled: false,
                      value:
                        establishmentState.status === "success" &&
                        establishmentState.data?.EstablishmentName
                          ? establishmentState.data?.EstablishmentName
                          : watch("DefendantEstablishmentName") || "",
                      validation: {
                        required: hasUserInteracted
                          ? t("establishmentNameValidation")
                          : false,
                      },
                    },

                    {
                      isLoading: false,
                      label: t("region"),
                      name: "defendantRegion",
                      type:
                        establishmentState.status === "success" &&
                        establishmentState.data?.Region
                          ? "readonly"
                          : "autocomplete",
                      disabled: false,
                      placeholder:
                        !establishmentState.hasLoaded && !caseDetailsLoading
                          ? t("Please enter File Number or CR Number first")
                          : t("Select region"),
                      value:
                        establishmentState.status === "success" &&
                        establishmentState.data?.Region
                          ? establishmentState.data?.Region
                          : watch("defendantRegion")?.label ||
                            watch("defendantRegion") ||
                            "",
                      ...((establishmentState.status !== "success" ||
                        !establishmentState.data?.Region) && {
                        options: RegionOptions,
                        validation: {
                          required: hasUserInteracted
                            ? t("regionValidation")
                            : false,
                          validate: (value: any) => {
                            if (!hasUserInteracted) {
                              return true;
                            }
                            if (!value || !value.value) {
                              return t("regionValidation");
                            }
                            return true;
                          },
                        },
                      }),
                      onChange: (v: any) => {
                        handleUserInteraction();
                        if (!v || !v.value) {
                          setValue("defendantRegion", null, {
                            shouldValidate: true,
                          });
                          setValue("defendantCity", null, {
                            shouldValidate: true,
                          });
                        } else {
                          setValue("defendantRegion", v, {
                            shouldValidate: true,
                          });
                          setValue("defendantCity", null, {
                            shouldValidate: true,
                          });
                        }
                      },
                    },

                    {
                      isLoading: false,
                      type:
                        establishmentState.status === "success" &&
                        establishmentState.data?.City
                          ? "readonly"
                          : "autocomplete",
                      label: t("city"),
                      name: "defendantCity",
                      disabled: false,
                      placeholder:
                        !establishmentState.hasLoaded && !caseDetailsLoading
                          ? t("Please enter File Number or CR Number first")
                          : t("Select city"),
                      value:
                        establishmentState.status === "success" &&
                        establishmentState.data?.City
                          ? establishmentState.data?.City
                          : watch("defendantCity")?.label ||
                            watch("defendantCity") ||
                            "",
                      ...((establishmentState.status !== "success" ||
                        !establishmentState.data?.City) && {
                        options: CityOptions,
                        validation: {
                          required: hasUserInteracted
                            ? t("cityValidation")
                            : false,
                          validate: (value: any) => {
                            if (!hasUserInteracted) {
                              return true;
                            }
                            if (!value || !value.value) {
                              return t("cityValidation");
                            }
                            return true;
                          },
                        },
                      }),
                      onChange: (v: any) => {
                        handleUserInteraction();
                        if (!isPrefilling) {
                          setIsPrefilling(false);
                        }
                        if (!v || !v.value) {
                          setValue("defendantCity", null, {
                            shouldValidate: true,
                          });
                        } else {
                          setValue("defendantCity", v, {
                            shouldValidate: true,
                          });
                        }
                      },
                    },

                    {
                      maxLength: 10,
                      type: "input",
                      name: "establishment_phoneNumber",
                      label: t("phoneNumber"),
                      inputType: "text",
                      placeholder:
                        !establishmentState.hasLoaded && !caseDetailsLoading
                          ? t("Please enter File Number or CR Number first")
                          : "05xxxxxxxx",
                      disabled: false,
                      onChange: (e: any) => {
                        handleUserInteraction();
                        const value =
                          typeof e === "string" ? e : e.target.value;
                        setValue("establishment_phoneNumber", value, {
                          shouldValidate: true,
                        });
                      },
                      validation: {
                        required: hasUserInteracted
                          ? t("phoneNumberValidation")
                          : false,
                        pattern: hasUserInteracted
                          ? {
                              value: /^05\d{8}$/,
                              message: t("phoneNumberValidationٍstartWith"),
                            }
                          : undefined,
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
    isOnlyFileNumberFilled,
  };
};
