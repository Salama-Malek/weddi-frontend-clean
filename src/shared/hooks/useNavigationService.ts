import { useSearchParams } from "react-router-dom";

export const useNavigationService = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const updateParams = (step: number, tab?: number) => {
    const params: Record<string, string> = { step: step.toString() };
    if (step === 0 && tab !== undefined) {
      params.tab = tab.toString();
    }
    setSearchParams(params);
  };

  return { updateParams, searchParams };
};