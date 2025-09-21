import React from "react";
import { cn } from "@/shared/lib/clsx";

interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

interface ResponsiveListProps {
  items: ListItem[];
  className?: string;
  variant?: "default" | "card" | "compact";
  showIcons?: boolean;
  showSubtitles?: boolean;
  showDescriptions?: boolean;
}

export const ResponsiveList: React.FC<ResponsiveListProps> = ({
  items,
  className = "",
  variant = "default",
  showIcons = true,
  showSubtitles = true,
  showDescriptions = true,
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "card":
        return "space-y-2";
      case "compact":
        return "space-y-1";
      default:
        return "space-y-3";
    }
  };

  const getItemClasses = (variant: string) => {
    switch (variant) {
      case "card":
        return "p-3 sm:p-4 bg-white border border-gray-200 rounded-md hover:shadow-md transition-shadow cursor-pointer";
      case "compact":
        return "p-2 sm:p-3 hover:bg-gray-50 rounded-md cursor-pointer";
      default:
        return "p-3 sm:p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 cursor-pointer";
    }
  };

  return (
    <div className={cn("w-full", getVariantClasses(), className)}>
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(getItemClasses(variant), item.className)}
          onClick={item.onClick}
        >
          <div className="flex items-start space-x-3">
            {showIcons && item.icon && (
              <div className="flex-shrink-0 mt-1">{item.icon}</div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">
                  {item.title}
                </h3>
              </div>

              {showSubtitles && item.subtitle && (
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  {item.subtitle}
                </p>
              )}

              {showDescriptions && item.description && (
                <p className="text-xs sm:text-sm text-gray-500 mt-2 line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

interface ResponsiveListGridProps {
  items: ListItem[];
  className?: string;
  columns?: 1 | 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
  variant?: "default" | "card" | "compact";
}

export const ResponsiveListGrid: React.FC<ResponsiveListGridProps> = ({
  items,
  className = "",
  columns = 3,
  gap = "md",
}) => {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  const gapClasses = {
    sm: "gap-2 sm:gap-3",
    md: "gap-3 sm:gap-4 md:gap-6",
    lg: "gap-4 sm:gap-6 md:gap-8",
  };

  return (
    <div
      className={cn("grid", gridClasses[columns], gapClasses[gap], className)}
    >
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            "p-3 sm:p-4 bg-white border border-gray-200 rounded-md hover:shadow-md transition-shadow cursor-pointer",
            item.className
          )}
          onClick={item.onClick}
        >
          <div className="flex items-start space-x-3">
            {item.icon && <div className="flex-shrink-0 mt-1">{item.icon}</div>}

            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">
                {item.title}
              </h3>

              {item.subtitle && (
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  {item.subtitle}
                </p>
              )}

              {item.description && (
                <p className="text-xs sm:text-sm text-gray-500 mt-2 line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
