import React, { Suspense } from "react";
import Stepper from "./Stepper/Stepper";
import { steps } from "./stepConfig";
import { useCaseWizard } from "./CaseWizardContext";

const CaseWizard: React.FC = () => {
  const { state, dispatch } = useCaseWizard();
  const { currentStep, data } = state;

  const step = steps[currentStep];
  const StepComponent = step.component;

  const handleNext = () => {
    if (step.validate && !step.validate(data)) return;
    const nextIndex =
      step.next ? step.next(data) ?? currentStep + 1 : currentStep + 1;
    dispatch({ type: "SET_STEP", step: Math.min(nextIndex, steps.length - 1) });
  };

  const handlePrev = () => {
    const prevIndex =
      step.prev ? step.prev(data) ?? currentStep - 1 : currentStep - 1;
    dispatch({ type: "SET_STEP", step: Math.max(0, prevIndex) });
  };

  return (
    <div className="flex flex-col md:flex-row h-full md:min-h-screen p-4 mb-4">
      <div className="w-full md:w-1/4 mb-6 md:mb-0">
        <Stepper
          steps={steps.map((s) => ({ title: s.title, description: s.description }))}
          currentStep={currentStep}
        />
      </div>
      <div className="w-full md:w-3/4 md:p-4 pt-0">
        <Suspense fallback={<div>Loading...</div>}>
          <StepComponent />
        </Suspense>
        <div className="flex justify-between mt-6">
          <button
            type="button"
            className="px-4 py-2 border rounded"
            disabled={currentStep === 0}
            onClick={handlePrev}
          >
            Back
          </button>
          <button
            type="button"
            className="px-4 py-2 border rounded"
            onClick={handleNext}
          >
            {currentStep === steps.length - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaseWizard;
