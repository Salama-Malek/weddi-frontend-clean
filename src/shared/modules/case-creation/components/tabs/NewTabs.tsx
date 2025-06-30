import React, { useCallback } from "react";

interface TabsProps {
  currentTab: number;
  tabs: string[];
  onTabChange: (tabIndex: number) => void;
  isFormValid?: boolean;
}

const TabButton: React.FC<{
  index: number;
  label: string;
  currentTab: number;
  onChange: (idx: number) => void;
  disabled: boolean;
}> = React.memo(({ index, label, currentTab, onChange, disabled }) => {
  const handleClick = useCallback(() => onChange(index), [onChange, index]);
  const isActive = index === currentTab;
  const isVisited = index < currentTab;

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`py-3 transition text-sm font-medium ${
          isActive ? "bold" : isVisited ? "text-gray-700" : "text-gray-400 hover:text-gray-600"
        }`}
      >
        {label}
      </button>
      <div
        className={`h-[3px] w-full transition-all ${
          isActive ? "bg-primary-600 h-[3px] rounded-lg" : isVisited ? "h-[3px] rounded-lg" : "bg-transparent"
        }`}
      ></div>
    </div>
  );
});
TabButton.displayName = "TabButton";

const NewTabs: React.FC<TabsProps> = ({ currentTab, tabs, onTabChange, isFormValid }) => {
  const handleChange = useCallback(
    (idx: number) => {
      onTabChange(idx);
    },
    [onTabChange]
  );

  return (
    <div className="flex flex-col gap-x-12 mb-6 md:flex-row lg:flex-row">
      {tabs.map((tab, index) => (
        <TabButton
          key={index}
          index={index}
          label={tab}
          currentTab={currentTab}
          onChange={handleChange}
          disabled={index > currentTab && !isFormValid}
        />
      ))}
    </div>
  );
};

export default React.memo(NewTabs);
