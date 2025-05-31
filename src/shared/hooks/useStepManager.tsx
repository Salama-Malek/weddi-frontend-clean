import { useState, useCallback, useMemo } from "react";

export const useStepManager = (stepsLength: number) => {
  const [currentStep, setCurrentStep] = useState(0);

  const isFirstStep = useMemo(() => currentStep === 0, [currentStep]);
  const isLastStep = useMemo(() => currentStep === stepsLength - 1, [currentStep]);

  const goToNextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, stepsLength - 1));
  }, [stepsLength]);

  const goToPrevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const resetSteps = useCallback(() => {
    setCurrentStep(0);
  }, []);

  const isButtonDisabled = useCallback(
    (direction: "prev" | "next") =>
      direction === "prev" ? isFirstStep : isLastStep,
    [isFirstStep, isLastStep]
  );

  return {
    currentStep,
    isFirstStep,
    isLastStep,
    goToNextStep,
    goToPrevStep,
    resetSteps,
    isButtonDisabled,
    setCurrentStep
  };
};
