import React, { ReactNode, Suspense } from "react";
const Stepper = React.lazy(() => import("../Stepper/Stepper"));
import useCasesLogic from "@/features/initiate-hearing/hooks/useCasesLogic";
import MultiStepLayout from "@/shared/layouts/MultiStepLayout";
import StepSkeleton from "@/shared/components/loader/StepSkeleton";
import { Step } from "..";
import { useTranslation } from "react-i18next";

interface MultiStepFormProps {
  steps: Step[];
  children?: ReactNode
}

const MultiStepForm: React.FC<MultiStepFormProps> = ({ steps, children }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const {
    currentStep,
    currentTab,
    updateParams,
  } = useCasesLogic();

  return (
    <div className="flex flex-col md:flex-row h-full md:min-h-screen p-4 mb-4">
      <div className="w-full md:w-1/4 mb-6 max-h-screen md:mb-0">
        <Suspense fallback={<StepSkeleton />}>
          <Stepper steps={steps} currentStep={currentStep} />
        </Suspense>
      </div>

      <div className={`w-full md:w-3/4 md:p-4 pt-0 ${isRTL ? "pl-0" : "pr-0"}`}>
        <h2 className="text-lg semibold text-primary-600 mb-6">
          {steps[currentStep]?.title}
        </h2>
        <MultiStepLayout
          currentStep={currentStep}
          currentTab={currentTab}
          updateParams={updateParams}
        >
          {children}
        </MultiStepLayout>
      </div>
    </div>
  );
};

export default MultiStepForm;
