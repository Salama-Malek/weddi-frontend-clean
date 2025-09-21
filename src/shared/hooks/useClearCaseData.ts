import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { useDispatch } from "react-redux";
import { setFormData } from "@/redux/slices/formSlice";
import { setTitles } from "@/redux/slices/formOptionsSlice";

export const useClearCaseData = () => {
  const [, setCookie, removeCookie] = useCookieState();
  const dispatch = useDispatch();

  const clearCaseData = () => {
    removeCookie("caseId");
    removeCookie("incompleteCaseMessage");
    removeCookie("incompleteCaseNumber");
    removeCookie("incompleteCase");
    removeCookie("manage-incomplete");
    removeCookie("step");
    removeCookie("tab");

    removeCookie("defendantTypeInfo");
    removeCookie("defendantStatus");
    removeCookie("defendantDetails");
    removeCookie("getCookieEstablishmentData");
    removeCookie("getDefendEstablishmentData");

    removeCookie("storeAllNicData");
    removeCookie("nicDetailObject");

    setCookie("caseId", "");

    setCookie("caseDataCleared", true);

    localStorage.removeItem("CaseDetails");
    localStorage.removeItem("DefendantDetails");
    localStorage.removeItem("step");
    localStorage.removeItem("tab");
    localStorage.removeItem("formData");
    localStorage.removeItem("claimantDetails");
    localStorage.removeItem("defendantDetails");
    localStorage.removeItem("workDetails");
    localStorage.removeItem("hearingTopics");
    localStorage.removeItem("EmploymentDetails");

    dispatch(setFormData([]));
    dispatch(setTitles(""));

    window.dispatchEvent(new Event("storage"));

    window.dispatchEvent(new CustomEvent("caseDataCleared"));
  };

  const resetCaseDataClearedFlag = () => {
    removeCookie("caseDataCleared");
  };

  return { clearCaseData, resetCaseDataClearedFlag };
};
