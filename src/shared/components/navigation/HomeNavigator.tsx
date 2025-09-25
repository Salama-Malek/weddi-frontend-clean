import { useNavigate } from "react-router-dom";
import { useClearCaseData } from "@/shared/hooks/useClearCaseData";

export const useHomeNavigator = () => {
  const navigate = useNavigate();
  const { clearCaseData } = useClearCaseData();

  const navigateToHome = () => {
    clearCaseData();
    navigate("/");
  };

  return navigateToHome;
};
