import React, { createContext, useCallback, useContext, useEffect, useReducer } from "react";

interface StepFlowState {
  step: number;
  tab: number;
}

interface StepFlowContextValue {
  currentStep: number;
  currentTab: number;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number, tab?: number) => void;
  setTab: (tab: number) => void;
}

const StepFlowContext = createContext<StepFlowContextValue | undefined>(undefined);

function reducer(state: StepFlowState, action: any): StepFlowState {
  switch (action.type) {
    case "NEXT":
      return { step: state.step + 1, tab: 0 };
    case "PREV":
      return { step: Math.max(0, state.step - 1), tab: 0 };
    case "GOTO":
      return { step: action.step, tab: action.tab ?? state.tab };
    case "SET_TAB":
      return { ...state, tab: action.tab };
    default:
      return state;
  }
}

export const StepFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const step = Number(localStorage.getItem("step") || 0);
    const tab = Number(localStorage.getItem("tab") || 0);
    return { step, tab } as StepFlowState;
  });

  useEffect(() => {
    localStorage.setItem("step", state.step.toString());
    localStorage.setItem("tab", state.tab.toString());
  }, [state.step, state.tab]);

  useEffect(() => {
    const handleStorage = () => {
      const step = Number(localStorage.getItem("step") || 0);
      const tab = Number(localStorage.getItem("tab") || 0);
      dispatch({ type: "GOTO", step, tab });
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const nextStep = useCallback(() => dispatch({ type: "NEXT" }), []);
  const prevStep = useCallback(() => dispatch({ type: "PREV" }), []);
  const goToStep = useCallback((step: number, tab?: number) => dispatch({ type: "GOTO", step, tab }), []);
  const setTab = useCallback((tab: number) => dispatch({ type: "SET_TAB", tab }), []);

  const value: StepFlowContextValue = {
    currentStep: state.step,
    currentTab: state.tab,
    nextStep,
    prevStep,
    goToStep,
    setTab,
  };

  return <StepFlowContext.Provider value={value}>{children}</StepFlowContext.Provider>;
};

export const useStepFlow = () => {
  const context = useContext(StepFlowContext);
  if (!context) {
    throw new Error("useStepFlow must be used within a StepFlowProvider");
  }
  return context;
};

export default StepFlowContext;

