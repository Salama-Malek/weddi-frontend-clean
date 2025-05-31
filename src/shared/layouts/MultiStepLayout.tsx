import React, { Suspense, useMemo } from "react";
import TableLoader from "@/shared/components/loader/TableLoader";
import { useLanguageDirection } from "@/i18n/LanguageDirectionProvider";
import Tabs from "../modules/case-creation/components/tabs/Tabs";
import { useTabs } from "../modules/case-creation/components/tabs/tabsConfig";

interface MultiStepLayoutProps {
  currentStep: number;
  currentTab: number;
  updateParams: (step: number, tabIndex: number) => void;
  children: React.ReactNode;
}

const MultiStepLayout: React.FC<MultiStepLayoutProps> = ({
  currentStep,
  currentTab,
  updateParams,
  children,
}) => {
  const { isRTL } = useLanguageDirection();
  const tabs = useTabs();
  
  const memoizedTabs = useMemo(() => {
    return (
      currentStep === 0 && (
        <Tabs
          currentTab={currentTab}
          tabs={tabs}
          onTabChange={(tabIndex) => updateParams(currentStep, tabIndex)}
        />
      )
    );
  }, [currentStep, currentTab, updateParams, tabs]);

  const getLayoutClasses = () => {
    if (isRTL) {
      return "pr-3xl";
    }
    return `pl-3xl ${currentStep === 1 ? "!pl-0" : ""}`;
  };

  return (
    <div className={getLayoutClasses()}>
      {memoizedTabs}
      <Suspense fallback={<TableLoader />}>{children}</Suspense>
    </div>
  );
};

export default React.memo(MultiStepLayout);