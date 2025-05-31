// import React, { lazy, Suspense } from "react";
// import { useSearchParams } from "react-router-dom";
// import { useTranslation } from "react-i18next";
// import Tabs from "../shared/components/case-creation/components/tabs/Tabs";
// import ContentRenderer from "../shared/components/case-creation/components/ContentRenderer";
// import StepperSkeleton from "../shared/components/loader/StepperSkeleton";
// import Stepper from "../shared/components/case-creation/Stepper/Stepper";
// import StepNavigation from "../shared/components/case-creation/components/StepNavigation";


// export const tabs = ["1. Claimant’s Details", "2. Defendant’s Details", "3. Work Details"];

// const steps = [
//   { title: "Hearing details", description: "Basic information and details of the hearing" },
//   { title: "Hearing topics", description: "Add topics related to the hearing" },
//   { title: "Review the request and confirm the absence of malicious intent", description: "Review the hearing details and confirm the acknowledgment" },
// ];

// const StepperWithTabs: React.FC = () => {
//   const { t } = useTranslation();
//   const [searchParams, setSearchParams] = useSearchParams();
//   const currentStep = Number(searchParams.get("step")) || 0;
//   const currentTab = Number(searchParams.get("tab")) || 0;

//   const updateParams = (step: number, tab?: number) => {
//     const params: Record<string, string> = { step: String(step) };
//     if (step === 0 && tab !== undefined) {
//       params.tab = String(tab);
//     }
//     setSearchParams(params);
//   };

//   const handleSave = (section: string) => {
//      //console.log(`Saving data for ${section}`);
//   };

//   const handleNext = () => {
//     if (currentStep === 0) {
//       if (currentTab < tabs.length - 1) {
//         updateParams(currentStep, currentTab + 1);
//       } else {
//         updateParams(1);
//       }
//     } else {
//       updateParams(Math.min(currentStep + 1, steps.length - 1));
//     }
//   };

//   const handlePrevious = () => {
//     if (currentStep === 0) {
//       updateParams(currentStep, Math.max(currentTab - 1, 0));
//     } else {
//       updateParams(Math.max(currentStep - 1, 0));
//     }
//   };

//   return (
//     <div className="flex h-screen p-5">
//       <Suspense fallback={<StepperSkeleton />}>
//         <Stepper steps={steps} currentStep={currentStep} />
//       </Suspense>
//       <div className="w-full p-6">
//         {currentStep === 0 && (
//           <Tabs currentTab={currentTab} tabs={tabs} onTabChange={(tabIndex) => updateParams(currentStep, tabIndex)} />
//         )}
//         <ContentRenderer currentStep={currentStep} currentTab={currentTab} />
//         <StepNavigation
//           isFirstStep={currentStep === 0 && currentTab === 0}
//           isLastStep={currentStep === steps.length - 1}
//           goToNextStep={handleNext}
//           goToPrevStep={handlePrevious}
//           resetSteps={() => updateParams(0, 0)}
//           handleSave={() => handleSave(currentStep === 0 ? tabs[currentTab] : steps[currentStep].title)}
//           isButtonDisabled={(direction: "prev" | "next") =>
//             direction === "prev" ? currentStep === 0 && currentTab === 0 : false
//           }
//         />
//       </div>
//     </div>
//   );
// };

// export default StepperWithTabs;




import React from 'react'

const Test = () => {
  return (
    <div>
      
    </div>
  )
}

export default Test