import { useCallback, useState, useEffect } from "react";
import { useNavigationService } from "@/shared/hooks/useNavigationService";
import { useCaseApiService } from "./useCaseApiService";
import { usePayloadService } from "./payloadService";
import { useTranslation } from "react-i18next";
import { useAPIFormsData } from "@/providers/FormContext";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { useCookieState } from "./useCookieState";
import { TokenClaims } from "@/features/auth/components/AuthProvider";
import { useApiErrorHandler } from "@/shared/hooks/useApiErrorHandler";
import { useGetNICDetailsQuery } from "@/features/hearings/initiate/api/create-case/plaintiffDetailsApis";
import { formatDateToYYYYMMDD, isHijriDateInFuture } from "@/utils/helpers";

const tabs: string[] = [
  "1.Plaintiff's Details",
  "2.Defendant's Details",
  "3.Work Details",
];

interface UseCasesLogicOptions {
  enableNICCalls?: boolean;
}

export const useCasesLogic = (options: UseCasesLogicOptions = {}) => {
  const { enableNICCalls = false } = options;

  const {
    getValues,
    setFormData,
    watch,
    formState: { isValid },
  } = useAPIFormsData();
  const defendantStatus = watch("defendantStatus");
  const defendantDetails = watch("defendantDetails");
  const isDomestic = useSelector(
    (state: RootState) => state.formOptions.titles,
  );
  const { i18n } = useTranslation("stepper");
  const [actionButtonName, setActionButtonName] = useState<string>("");
  const [lastSaved, setLastSaved] = useState(false);
  const { updateParams, currentStep, currentTab } = useNavigationService();
  const { handleSaveOrSubmit } = useCaseApiService();
  const [getCookie] = useCookieState({ caseId: "" });
  const getCaseId = getCookie("caseId");
  const attorneyData = getCookie("attorneyData");
  const userType = getCookie("userType");
  const getNicDetailObject = getCookie("nicDetailObject");

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

  const isRTL = i18n.language === "ar" ? "AR" : "EN";
  const userClaims: TokenClaims = getCookie("userClaims");

  const { getPayload } = usePayloadService({
    isDomestic,

    userType,
    GetCookieEstablishmentData,
    getNicDetailObject,
    defendantStatus,
    defendantDetails,
  });

  const principalId = userClaims?.UserID || "";
  const principalDob = formatDateToYYYYMMDD(userClaims?.UserDOB);
  const representativeId = watch("workerAgentIdNumber") as string;
  const representativeDob = formatDateToYYYYMMDD(
    watch("workerAgentDateOfBirthHijri"),
  );
  const claimantStatus = watch("claimantStatus") as
    | "principal"
    | "representative";
  const lang = i18n.language.toUpperCase();

  const shouldEnableNICCalls =
    enableNICCalls && localStep === 0 && localTab === 0;

  const { data: principalNICResponse } = useGetNICDetailsQuery(
    {
      IDNumber: principalId,
      DateOfBirth: principalDob || "",
      AcceptedLanguage: lang,
      SourceSystem: "E-Services",
    },
    {
      skip:
        !shouldEnableNICCalls ||
        claimantStatus !== "principal" ||
        !principalId ||
        principalId.length !== 10 ||
        !principalDob ||
        isHijriDateInFuture(principalDob) ||
        userType === "Legal representative" ||
        userType === "Establishment",
    },
  );

  const { data: representativeNICResponse } = useGetNICDetailsQuery(
    {
      IDNumber: representativeId,
      DateOfBirth: representativeDob || "",
      AcceptedLanguage: lang,
      SourceSystem: "E-Services",
    },
    {
      skip:
        !shouldEnableNICCalls ||
        claimantStatus !== "representative" ||
        !representativeId ||
        representativeId.length !== 10 ||
        !representativeDob ||
        representativeDob.length !== 8 ||
        isHijriDateInFuture(representativeDob) ||
        userType === "Legal representative" ||
        userType === "Establishment",
    },
  );

  const { hasErrors } = useApiErrorHandler();

  const handleNext = async () => {
    if (!isValid) {
      return;
    }
    const latestFormValues = getValues();
    setFormData(latestFormValues);
    setActionButtonName("Next");

    const claimantStatus = latestFormValues.claimantStatus;
    let nicDetails = undefined;
    if (claimantStatus === "representative") {
      nicDetails = representativeNICResponse?.NICDetails;
    } else {
      nicDetails = principalNICResponse?.NICDetails;
    }
    const payload: any = getPayload(
      localStep,
      localTab,
      "Next",
      latestFormValues,
      userClaims,
      userType,
      isRTL,
      getCaseId,
      attorneyData,
      nicDetails,
    );

    if (latestFormValues && payload && Object.keys(payload).length > 0) {
      try {
        const apiResponse = await handleSaveOrSubmit(
          localStep,
          localTab,
          payload,
          latestFormValues,
          userClaims,
          userType,
          isRTL,
        );

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

        const isSuccessful =
          !hasErrors(apiResponse) &&
          (apiResponse?.SuccessCode === "200" ||
            apiResponse?.ServiceStatus === "Success");

        if (isSuccessful) {
          localStorage.setItem("step", nextStep.toString());
          localStorage.setItem("tab", nextTab.toString());

          setLocalStep(nextStep);
          setLocalTab(nextTab);

          updateParams(nextStep, nextTab);

          setActionButtonName("");
          setLastSaved(false);

          window.dispatchEvent(new Event("storage"));
        } else {
          setActionButtonName("");
        }
      } catch (error) {
        setActionButtonName("");
      }
    }
  };

  const handleSave = async () => {
    const latestFormValues = getValues();
    setFormData(latestFormValues);
    setActionButtonName("Save");
    try {
      const claimantStatus = latestFormValues.claimantStatus;
      let nicDetails = undefined;
      if (claimantStatus === "representative") {
        nicDetails = representativeNICResponse?.NICDetails;
      } else {
        nicDetails = principalNICResponse?.NICDetails;
      }
      const payload = getPayload(
        localStep,
        localTab,
        "Save",
        latestFormValues,
        userClaims,
        userType,
        isRTL,
        getCaseId,
        attorneyData,
        nicDetails,
      );

      if (payload && Object.keys(payload).length > 0) {
        const response = await handleSaveOrSubmit(
          localStep,
          localTab,
          payload,
          latestFormValues,
          userClaims,
          userType,
          isRTL,
        );

        const isSuccessful =
          !hasErrors(response) &&
          (response?.SuccessCode === "200" ||
            response?.ServiceStatus === "Success");

        if (isSuccessful) {
          setLastSaved(true);
          setActionButtonName("");
        } else {
          setActionButtonName("");
        }

        return response;
      } else {
        return {
          ServiceStatus: "Error",
          SuccessCode: "400",
          CaseNumber: "",
          ErrorCodeList: [
            {
              ErrorCode: "NO_PAYLOAD",
              ErrorDesc: "No payload available for save operation",
            },
          ],
        };
      }
    } catch (error) {
      setActionButtonName("");
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

    updateParams(prevStep, prevTab);
    setLocalStep(prevStep);
    setLocalTab(prevTab);
  }, [localStep, localTab, updateParams]);

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
