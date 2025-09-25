import React, { Suspense, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Stepper from "../stepper/Stepper";
import StepSkeleton from "@/shared/components/loader/StepSkeleton";
import MultiStepLayout from "@/shared/layouts/MultiStepLayout";
import useCasesLogic from "@/features/hearings/initiate/hooks/useCasesLogic";

interface MultiStepFormProps {
  steps: { title: string; description: string }[];
  children: React.ReactNode;
}

const MultiStepForm: React.FC<MultiStepFormProps> = ({ steps, children }) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const { currentStep, currentTab, updateParams } = useCasesLogic({
    enableNICCalls: false,
  });
  const [step, setStep] = useState(currentStep);
  const [tab, setTab] = useState(currentTab);

  useEffect(() => {
    const savedStep = localStorage.getItem("step");
    const savedTab = localStorage.getItem("tab");

    if (savedStep) {
      const newStep = parseInt(savedStep);
      setStep(newStep);
      updateParams(newStep, savedTab ? parseInt(savedTab) : undefined);
    }
    if (savedTab) {
      const newTab = parseInt(savedTab);
      setTab(newTab);
    }
  }, [currentStep, currentTab, updateParams]);

  useEffect(() => {
    const handleStorageChange = () => {
      const savedStep = localStorage.getItem("step");
      const savedTab = localStorage.getItem("tab");

      if (savedStep) {
        const newStep = parseInt(savedStep);
        setStep(newStep);
      }
      if (savedTab) {
        const newTab = parseInt(savedTab);
        setTab(newTab);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row h-full lg:min-h-screen p-2 sm:p-3 md:p-4 mb-4">
      <div className="w-full lg:w-1/4 mb-4 lg:mb-0 max-h-screen">
        <Suspense fallback={<StepSkeleton />}>
          <Stepper steps={steps} currentStep={step} />
        </Suspense>
      </div>

      <div
        className={`w-full lg:w-3/4 lg:p-4 pt-0 ${
          isRTL ? "lg:pl-0" : "lg:pr-0"
        }`}
      >
        <h2 className="text-base sm:text-lg semibold text-primary-600 mb-4 sm:mb-6">
          {steps[step]?.title}
        </h2>
        <MultiStepLayout
          currentStep={step}
          currentTab={tab}
          updateParams={updateParams}
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
