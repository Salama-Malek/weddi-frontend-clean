import React, { Suspense, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Stepper from "../Stepper/Stepper";
import StepSkeleton from "@/shared/components/loader/StepSkeleton";
import MultiStepLayout from "@/shared/layouts/MultiStepLayout";
import useCasesLogic from "@/features/initiate-hearing/hooks/useCasesLogic";

interface MultiStepFormProps {
  steps: { title: string; description: string }[];
  children: React.ReactNode;
}

const MultiStepForm: React.FC<MultiStepFormProps> = ({ steps, children }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { currentStep, currentTab, updateParams } = useCasesLogic();
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

  // إضافة useEffect جديد للاستماع إلى تغييرات localStorage
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

  // console.log("MultiStepForm - Current state:", {
  //   step,
  //   tab,
  //   currentStep,
  //   currentTab,
  // });

  // console.log("Moving to next step/tab:", { nextStep: step + 1, nextTab: tab });
  // console.log("Moving to previous step/tab:", {
  //   prevStep: step - 1,
  //   prevTab: tab,
  // });

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
