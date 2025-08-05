import React from "react";
import CaseWizard from "./CaseWizard";
import { CaseWizardProvider } from "./CaseWizardContext";

const CaseCreation: React.FC = () => {
  return (
    <CaseWizardProvider>
      <CaseWizard />
    </CaseWizardProvider>
  );
};

export default CaseCreation;
