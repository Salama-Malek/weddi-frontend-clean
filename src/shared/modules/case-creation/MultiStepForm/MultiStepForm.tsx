import React, { Suspense } from "react";
import { useTranslation } from "react-i18next";
import Stepper from "../Stepper/Stepper";
import StepSkeleton from "@shared/components/loader/StepSkeleton";
import MultiStepLayout from "@shared/layouts/MultiStepLayout";
import { useStepFlow } from "../StepFlowContext";

interface MultiStepFormProps {
  steps: { title: string; description: string }[];
  children: React.ReactNode;
}

const MultiStepForm: React.FC<MultiStepFormProps> = ({ steps, children }) => {
  const { currentStep: step, currentTab: tab, goToStep } = useStepFlow();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <div className="flex flex-col md:flex-row h-full md:min-h-screen p-4 mb-4">
      <div className="w-full md:w-1/4 mb-6 max-h-screen md:mb-0">
        <Suspense fallback={<StepSkeleton />}>
          <Stepper steps={steps} currentStep={step} />
        </Suspense>
      </div>

      <div className={`w-full md:w-3/4 md:p-4 pt-0 ${isRTL ? "pl-0" : "pr-0"}`}>
        <h2 className="text-lg semibold text-primary-600 mb-6">
          {steps[step]?.title}
        </h2>
        <MultiStepLayout
          currentStep={step}
          currentTab={tab}
          updateParams={goToStep}
        >
          {React.cloneElement(children as React.ReactElement, {
            currentStep: step,
            currentTab: tab,
          })}
        </MultiStepLayout>
      </div>
    </div>
  );
};

export default MultiStepForm;
