import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Stepper from "./Stepper/Stepper";
import { steps } from "./stepConfig";
import { useCaseWizard } from "./CaseWizardContext";

const CaseWizard: React.FC = () => {
  const { state } = useCaseWizard();
  const { data } = state;
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const stepId = pathname.split("/").pop() || steps[0].id;
  const currentStep = Math.max(0, steps.findIndex(s => s.id === stepId));
  const step = steps[currentStep];

  useEffect(() => {
    if (steps.findIndex(s => s.id === stepId) === -1) {
      navigate(steps[0].id, { replace: true });
    }
  }, [stepId, navigate]);

  useEffect(() => {
    const invalidIndex = steps
      .slice(0, currentStep)
      .findIndex(s => s.validate && !s.validate(data));
    if (invalidIndex !== -1) {
      navigate(steps[invalidIndex].id, { replace: true });
    }
  }, [currentStep, data, navigate]);

  const handleNext = () => {
    if (step.validate && !step.validate(data)) return;
    const nextIndex = step.next
      ? step.next(data) ?? currentStep + 1
      : currentStep + 1;
    navigate(steps[Math.min(nextIndex, steps.length - 1)].id);
  };

  const handlePrev = () => {
    const prevIndex = step.prev
      ? step.prev(data) ?? currentStep - 1
      : currentStep - 1;
    navigate(steps[Math.max(0, prevIndex)].id);
  };

  return (
    <div className="flex flex-col md:flex-row h-full md:min-h-screen p-4 mb-4">
      <div className="w-full md:w-1/4 mb-6 md:mb-0">
        <Stepper
          steps={steps.map(s => ({ title: s.title, description: s.description }))}
          currentStep={currentStep}
        />
      </div>
      <div className="w-full md:w-3/4 md:p-4 pt-0">
        <Outlet />
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
