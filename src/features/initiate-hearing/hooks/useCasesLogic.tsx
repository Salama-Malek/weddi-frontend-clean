import { useCallback, useMemo, useState } from "react";
import { useNavigationService } from "@/shared/hooks/useNavigationService";
import { useCaseApiService } from "./useCaseApiService";
import { usePayloadService } from "./payloadService";
import { Step } from "@/shared/modules/case-creation/Stepper/stepper.types";
import { useTranslation } from "react-i18next";
import { useAPIFormsData } from "@/providers/FormContext";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useGetEstablishmentDetailsQuery } from "../api/create-case/defendantDetailsApis";
import { useCookieState } from "./useCookieState";
import { steps } from "@/shared/modules/case-creation/components/tabs/tabsConfig";
import { TokenClaims } from "@/features/login/components/AuthProvider";

const tabs: string[] = [
  "1.Plaintiff's Details",
  "2.Defendant's Details",
  "3.Work Details",
];

export const useCasesLogic = () => {
  // const {
  //   data: EstablishmentData,
  //   error,
  //   isLoading,
  // } = useGetEstablishmentDetailsQuery({
  //   FileNumber: "1-204757",
  //   AcceptedLanguage: "EN",
  //   SourceSystem: "E-Services",
  // });

  const {
    formData: formState,
    getValues,
    setFormData,
    editTopic,
    watch,
    formState: { errors, isValid, isSubmitting: isFormSubmitting },
  } = useAPIFormsData();
  const defendantStatus = watch("defendantStatus");
  const defendantDetails = watch("defendantDetails");
  const { caseTopics } = useSelector((state: RootState) => state.form.formData);
  const isDomestic = useSelector(
    (state: RootState) => state.formOptions.titles
  );
  const { t, i18n } = useTranslation("stepper");
  const [actionButtonName, setActionButtonName] = useState<string>("");
  const [lastSaved, setLastSaved] = useState(false);
  const { clearFormData } = useAPIFormsData();
  const { updateParams, searchParams } = useNavigationService();
  const { handleSaveOrSubmit } = useCaseApiService();
  const [getCookie] = useCookieState({ caseId: "" });
  const getCaseId = getCookie("caseId");
  const attorneyData = getCookie("attorneyData");
  const userType = getCookie("userType");
  const getNicDetailObject = getCookie("nicDetailObject");
  const storeAllNicData = getCookie("storeAllNicData");
  const extractEstablishmentObject = getCookie("defendantDetails");
  const GetCookieEstablishmentData = getCookie("defendantDetails");

  /*Get User Data From Cookies  */
  const isRTL = i18n.language === "ar" ? "AR" : "EN";
  const userClaims: TokenClaims = getCookie("userClaims");

  const { getPayload } = usePayloadService({
    isDomestic,
    // EstablishmentData,
    userType,
    GetCookieEstablishmentData,
    getNicDetailObject,
    defendantStatus,
    defendantDetails,
  });
  const currentStep: number = useMemo(
    () => Number(searchParams.get("step")) || 0,
    [searchParams]
  );
  const currentTab: number = useMemo(
    () => Number(searchParams.get("tab")) || 0,
    [searchParams]
  );

  const currentLanguage = i18n.language.toUpperCase();

  const handleNext = async () => {
    if (!isValid) return;
    const latestFormValues = getValues(); // always fresh
    setFormData(latestFormValues); // keep in sync
    setActionButtonName("Next");
    //console.log(
    //   "Frist Step , current Tap , Last Data ",
    //   currentStep,
    //   currentTab,
    //   latestFormValues,
    //   "Next",
    //   getCaseId,
    //   attorneyData,
    //   userClaims,
    //   isRTL
    // );

    /*
    
    currentStep: number,
    currentTab: number,
    buttonName: "Next" | "Save",
    formData: any,
    userClaims: TokenClaims,
    userType: string,
    language?: string,
    getCaseId?: any,
    extractEstablishmentObject?: any,
    caseTopics?: any,
    attorneyData?: any,
    watch?: any
    */

    const payload: any = getPayload(
      currentStep,
      currentTab,
      "Next",
      latestFormValues,
      userClaims,
      userType,
      isRTL,
      getCaseId,
      attorneyData
    );

    if (latestFormValues && payload && Object.keys(payload).length > 0) {
      try {

        //Hassan Comment This  
        // payload.PlaintiffId = userClaims?.UserID;
        // payload.CreatedBy = userClaims?.UserID;
        // payload.PlaintiffName = storeAllNicData?.NICDetails?.PlaintiffName;
        // payload.PlaintiffHijiriDOB =
        //   storeAllNicData?.NICDetails?.DateOfBirthHijri;
        // payload.Plaintiff_City = storeAllNicData?.NICDetails?.City;
        // payload.Plaintiff_Region = storeAllNicData?.NICDetails?.Region;
        // //console.log("payload", payload);
        await handleSaveOrSubmit(currentStep, currentTab, payload);

        updateParams(
          currentStep === 0 && currentTab < tabs.length - 1
            ? currentStep
            : Math.min(currentStep + 1, steps.length - 1),
          currentStep === 0 && currentTab < tabs.length - 1
            ? currentTab + 1
            : undefined
        );
        setActionButtonName("");
        setLastSaved(false);
      } catch (error) {
        // Handle error
      }
    }
  };

  const handleSave = async () => {
    const latestFormValues = getValues(); // always fresh
    setFormData(latestFormValues); // keep in sync
    setActionButtonName("Save");
    try {
      const payload = getPayload(
        currentStep,
        currentTab,
        "Save",
        latestFormValues,
        userClaims,
        userType,
        isRTL,
        getCaseId,
        attorneyData
      );
      // //console.log("From Handle Save", payload);

      if (payload && Object.keys(payload).length > 0) {
        await handleSaveOrSubmit(currentStep, currentTab, payload);
        setLastSaved(true);
        setActionButtonName("");
      }
    } catch (error) {
      // Handle error
    }
  };

  const handlePrevious = useCallback(() => {
    if (currentStep === 1) {
      updateParams(0, tabs.length - 1);
    } else {
      updateParams(
        currentStep === 0 ? 0 : currentStep - 1,
        Math.max(currentTab - 1, 0)
      );
    }
  }, [currentStep, currentTab, updateParams]);

  const getCases = async (queryParams: Record<string, string> = {}) => {
    try {
      const params = new URLSearchParams({
        ...queryParams,
        AcceptedLanguage: currentLanguage,
        SourceSystem: "E-Services"
      });
      const response = await fetch(`WeddiServices/V1/Cases?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching cases:", error);
      throw error;
    }
  };

  return {
    currentStep,
    currentTab,
    tabs,
    updateParams,
    handleNext,
    handlePrevious,
    handleSave,
    lastSaved,
    actionButtonName,
  };
};

export default useCasesLogic;
