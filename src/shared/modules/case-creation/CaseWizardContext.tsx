import React, { createContext, useContext, useEffect, useReducer } from "react";
import { useSearchParams } from "react-router-dom";

interface WizardState {
  currentStep: number;
  data: Record<string, any>;
}

type WizardAction =
  | { type: "NEXT" }
  | { type: "PREV" }
  | { type: "SET_STEP"; step: number }
  | { type: "UPDATE_DATA"; payload: Record<string, any> };

const CaseWizardContext = createContext<{
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
} | undefined>(undefined);

function reducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "NEXT":
      return { ...state, currentStep: state.currentStep + 1 };
    case "PREV":
      return { ...state, currentStep: Math.max(0, state.currentStep - 1) };
    case "SET_STEP":
      return { ...state, currentStep: action.step };
    case "UPDATE_DATA":
      return { ...state, data: { ...state.data, ...action.payload } };
    default:
      return state;
  }
}

export const CaseWizardProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStep = Number(searchParams.get("step")) || 0;

  const [state, dispatch] = useReducer(reducer, {
    currentStep: initialStep,
    data: {},
  });

  useEffect(() => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("step", state.currentStep.toString());
      return params;
    });
  }, [state.currentStep, setSearchParams]);

  return (
    <CaseWizardContext.Provider value={{ state, dispatch }}>
      {children}
    </CaseWizardContext.Provider>
  );
};

export const useCaseWizard = () => {
  const ctx = useContext(CaseWizardContext);
  if (!ctx) {
    throw new Error("useCaseWizard must be used within a CaseWizardProvider");
  }
  return ctx;
};
