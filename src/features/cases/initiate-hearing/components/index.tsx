import CaseCreation from "@shared/modules/case-creation";
import { StepFlowProvider } from "@shared/modules/case-creation/StepFlowContext";

const CaseCreationPage = () => {
  return (
    <StepFlowProvider>
      <CaseCreation />
    </StepFlowProvider>
  );
}

export default CaseCreationPage
