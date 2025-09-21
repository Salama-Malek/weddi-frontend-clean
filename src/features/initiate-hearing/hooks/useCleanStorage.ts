import { useAPIFormsData } from "@/providers/FormContext";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";

export const useCleanStorage = () => {
  const { clearFormData } = useAPIFormsData();
  const [, , removeCookie] = useCookieState();

  const cleanAll = () => {
    clearFormData();

    localStorage.removeItem("CaseDetails");
    localStorage.removeItem("caseRoleTab");
    localStorage.removeItem("DefendantDetails");
    localStorage.removeItem("step");
    localStorage.removeItem("tab");

    removeCookie("caseId");
    removeCookie("incompleteCaseMessage");
    removeCookie("incompleteCaseNumber");
    removeCookie("incompleteCase");
    removeCookie("defendantTypeInfo");
    removeCookie("defendantStatus");
    removeCookie("defendantDetails");
  };

  return { cleanAll };
};
