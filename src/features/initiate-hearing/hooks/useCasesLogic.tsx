import { useCallback, useMemo, useState, useEffect } from "react";
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
import { useSearchParams } from "react-router-dom";
import { useApiErrorHandler } from "@/shared/hooks/useApiErrorHandler";
 
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
  const { updateParams, currentStep, currentTab } = useNavigationService();
  const { handleSaveOrSubmit } = useCaseApiService();
  const [getCookie] = useCookieState({ caseId: "" });
  const getCaseId = getCookie("caseId");
  const attorneyData = getCookie("attorneyData");
  const userType = getCookie("userType");
  const getNicDetailObject = getCookie("nicDetailObject");
  const storeAllNicData = getCookie("storeAllNicData");
  const extractEstablishmentObject = getCookie("defendantDetails");
  const GetCookieEstablishmentData = getCookie("defendantDetails");
 
  const [localStep, setLocalStep] = useState(currentStep);
  const [localTab, setLocalTab] = useState(currentTab);
 
  useEffect(() => {
    const savedStep = localStorage.getItem("step");
    const savedTab = localStorage.getItem("tab");
 
    if (savedStep) {
      const newStep = parseInt(savedStep);
      setLocalStep(newStep);
    }
    if (savedTab) {
      const newTab = parseInt(savedTab);
      setLocalTab(newTab);
    }
  }, [currentStep, currentTab]);
 
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
 
  // console.log("currentStep", currentStep);
  // console.log("currentTab", currentTab);
  // console.log("tabs", tabs);
 
  const currentLanguage = i18n.language.toUpperCase();
  const { hasErrors } = useApiErrorHandler();
 
  const handleNext = async () => {
    console.log("handleNext: Function entered.");
    console.log("handleNext: isValid =", isValid);
    if (!isValid) {
      console.log("handleNext: Blocked by !isValid, returning.");
      return;
    }
    const latestFormValues = getValues();
    console.log("handleNext: Latest form values before save:", latestFormValues);
    setFormData(latestFormValues);
    setActionButtonName("Next");
 
    const payload: any = getPayload(
      localStep,
      localTab,
      "Next",
      latestFormValues,
      userClaims,
      userType,
      isRTL,
      getCaseId,
      attorneyData
    );
 
    console.log("handleNext: Payload condition check. latestFormValues:", latestFormValues, "payload:", payload);
    if (latestFormValues && payload && Object.keys(payload).length > 0) {
      console.log("handleNext: Payload condition met. Attempting handleSaveOrSubmit.");
      try {
        const apiResponse = await handleSaveOrSubmit(localStep, localTab, payload);
        console.log("handleNext: handleSaveOrSubmit completed. API Response:", apiResponse);
 
        let nextStep = localStep;
        let nextTab = localTab;
 
        if (localStep === 0) {
          if (localTab < 2) {
            nextTab = localTab + 1;
          } else {
            nextStep = 1;
            nextTab = 0;
          }
        } else if (localStep === 1) {
          nextStep = 2;
          nextTab = 0;
        }
 
        console.log("handleNext: Moving to next step/tab:", { nextStep, nextTab });
        console.log("handleNext: API Response SuccessCode:", apiResponse?.SuccessCode);
        console.log("handleNext: API Response ErrorCodeList (after filter in service):", apiResponse?.ErrorCodeList);
 
        // Use centralized error handling to check if response is successful
        const isSuccessful = !hasErrors(apiResponse) && (apiResponse?.SuccessCode === "200" || apiResponse?.ServiceStatus === "Success");
 
        if (isSuccessful) {
          localStorage.setItem("step", nextStep.toString());
          localStorage.setItem("tab", nextTab.toString());
 
          setLocalStep(nextStep);
          setLocalTab(nextTab);
 
          updateParams(nextStep, nextTab);
 
          setActionButtonName("");
          setLastSaved(false);
 
          window.dispatchEvent(new Event("storage"));
        }
      } catch (error) {
        console.error("handleNext: Caught error during handleSaveOrSubmit:", error);
      }
    } else {
      console.log("handleNext: Payload condition NOT met. Not calling handleSaveOrSubmit.");
      console.log("handleNext: Form values check:", !!latestFormValues);
      console.log("handleNext: Payload check:", !!payload);
      console.log("handleNext: Payload keys:", payload ? Object.keys(payload) : "No payload");
    }
  };
 
  const handleSave = async () => {
    const latestFormValues = getValues();
    console.log("handleSave: Latest form values before save:", latestFormValues);
    setFormData(latestFormValues);
    setActionButtonName("Save");
    try {
      const payload = getPayload(
        localStep,
        localTab,
        "Save",
        latestFormValues,
        userClaims,
        userType,
        isRTL,
        getCaseId,
        attorneyData
      );
 
      console.log("handleSave: Generated payload:", payload);
      if (payload && Object.keys(payload).length > 0) {
        const response = await handleSaveOrSubmit(localStep, localTab, payload);
        setLastSaved(true);
        setActionButtonName("");
        return response;
      } else {
        console.log("handleSave: No payload generated. Form values:", latestFormValues);
        // Return a default error response when no payload is available
        return {
          ServiceStatus: "Error",
          SuccessCode: "400",
          CaseNumber: "",
          ErrorCodeList: [{
            ErrorCode: "NO_PAYLOAD",
            ErrorDesc: "No payload available for save operation"
          }]
        };
      }
    } catch (error) {
      console.error("Error in handleSave:", error);
      throw error;
    }
  };
 
  const handlePrevious = useCallback(() => {
    let prevStep = localStep;
    let prevTab = localTab;
 
    if (localStep === 1) {
      prevStep = 0;
      prevTab = 2;
    } else if (localStep === 0) {
      prevTab = Math.max(localTab - 1, 0);
    } else if (localStep === 2) {
      prevStep = 1;
      prevTab = 0;
    }
 
    // console.log("Moving to previous step/tab:", { prevStep, prevTab });
 
    updateParams(prevStep, prevTab);
    setLocalStep(prevStep);
    setLocalTab(prevTab);
  }, [localStep, localTab, updateParams]);
 
  const getCases = async (queryParams: Record<string, string> = {}) => {
    try {
      const params = new URLSearchParams({
        ...queryParams,
        AcceptedLanguage: currentLanguage,
        SourceSystem: "E-Services",
      });
      const response = await fetch(
        `WeddiServices/V1/Cases?${params.toString()}`
      );
 
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
    currentStep: localStep,
    currentTab: localTab,
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