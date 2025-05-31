import { useTabs } from "@/shared/components/tabs/TabsContext";

export const useTabNavigation = (tabIds: string[], goToNextStep: () => void) => {
  const { activeTab, setActiveTab } = useTabs();

  const currentIndex = tabIds.indexOf(activeTab);

  const goToNextTab = () => {
    if (currentIndex < tabIds.length - 1) {
      setActiveTab(tabIds[currentIndex + 1]); 
    } else {
      goToNextStep(); 
    }
  };

  const goToPrevTab = () => {
    if (currentIndex > 0) {
      setActiveTab(tabIds[currentIndex - 1]); 
    }
  };

  return { goToNextTab, goToPrevTab };
};
