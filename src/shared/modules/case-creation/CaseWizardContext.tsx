import React, { createContext, useContext, useReducer } from "react";

interface WizardState {
  data: Record<string, any>;
}

type WizardAction = { type: "UPDATE_DATA"; payload: Record<string, any> };

const CaseWizardContext = createContext<{
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
} | undefined>(undefined);

function reducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "UPDATE_DATA":
      return { ...state, data: { ...state.data, ...action.payload } };
    default:
      return state;
  }
}

export const CaseWizardProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, {
    data: {},
  });

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
