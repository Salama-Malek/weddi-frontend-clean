import React from "react";

interface SectionProps {
  title?: string;
  children: React.ReactNode;
  isRadio?: boolean;
  isAdd?: boolean;
  className?: string;
  isManageHearing?: boolean;
  gridCols?: number;
  removeMargin?: boolean;
  requiredText?: string;
  isHidden?: boolean;
}

export const Section = ({
  title,
  children,
  isRadio,
  isAdd,
  className,
  isManageHearing,
  gridCols = 3,
  removeMargin,
  requiredText,
  isHidden = false,
}: SectionProps) => {
  const getFlexClass = () => {
    if (isRadio) {
      return "grid grid-cols-1 gap-6";
    }

    switch (gridCols) {
      case 1:
        return "grid grid-cols-1 gap-6";
      case 2:
        return "grid grid-cols-2 lg:grid-cols-3 gap-6";
      case 3:
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";
      case 4:
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6";
      case 5:
        return "grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-[375px] sm:max-w-none";
      case 6:
        return "grid grid-cols-2 max-w-[375px] sm:grid-cols-3 sm:max-w-none gap-6";
      case 7:
        return "grid grid-cols-1 lg:grid-cols-2 gap-6";
      default:
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";
    }
  };

  const computedFlexClass = getFlexClass();

  const widthClass = isManageHearing ? "max-w-[50rem] min-w-auto" : "w-full";

  return (
    <div
      className={`${widthClass} ${removeMargin && "!mt-0 !mb-3"} ${
        isHidden && "hidden"
      } space-y-${isAdd ? "3" : "6"} mb-6`}
    >
      {title && (
        <h2 className="text-sm md:text-md text-primary-600 semibold">
          {title}
          <span className="text-secondary-700">
            {requiredText && requiredText}
          </span>
        </h2>
      )}
      <div className={className || computedFlexClass}>{children}</div>
    </div>
  );
};
