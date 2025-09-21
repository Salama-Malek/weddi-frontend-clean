import { classes } from "@/shared/lib/clsx";
import { Tick02Icon } from "hugeicons-react";
import React from "react";
import TableLoader from "../loader/TableLoader";

const buttonVariants: Record<string, Record<string, string>> = {
  primary: {
    brand: "bg-primary-600 text-white hover:bg-green-800",
    neutral: "bg-gray-950 text-white hover:bg-gray-800",
  },
  secondary: {
    solid: "bg-white text-default-color hover:bg-gray-100",
    outline: "border-[1px] border-gray-300 text-black hover:bg-gray-50",
    gray: "bg-gray-100 text-black hover:bg-gray-50",
    black: "bg-black text-white hover:bg-gray-900",
  },
  medium: {
    subtle: "text-black hover:bg-gray-100",
    transparent: "text-black hover:bg-transparent",
  },
  disabled: {
    freeze: "bg-gray-200 text-gray-400 cursor-not-allowed",
  },
  loading: {
    freeze: "bg-gray-200 text-gray-400 cursor-not-allowed",
  },
};

export type ButtonVariant = keyof typeof buttonVariants;
export type ButtonTypeVariant = keyof (typeof buttonVariants)[ButtonVariant];

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  typeVariant?: ButtonTypeVariant;
  icon?: boolean | React.ReactNode;
  size?: "xs" | "xs20" | "md" | "sl" | "lg" | "sm";
  responsiveSize?: {
    sm?: "xs" | "xs20" | "md" | "sl" | "lg" | "sm";
    md?: "xs" | "xs20" | "md" | "sl" | "lg" | "sm";
    lg?: "xs" | "xs20" | "md" | "sl" | "lg" | "sm";
    xl?: "xs" | "xs20" | "md" | "sl" | "lg" | "sm";
  };
  disabled?: boolean;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  disabled,
  variant = "primary",
  typeVariant = "brand",
  size = "md",
  responsiveSize,
  icon,
  children,
  className = "",
  isLoading = false,
  ...props
}) => {
  const baseStyles = `flex items-center justify-center gap-2 medium rounded-sm transition whitespace-nowrap ${className}`;

  const sizeStyles: Record<string, string> = {
    xs: "px-4 py-1 text-md min-h-[32px] max-h-[34px]",
    xs20: "px-4 py-1 text-sm20 min-h-[32px] max-h-[34px]",
    md: "px-5 py-2 text-sm min-h-[32px] max-h-[34px]",
    sl: "px-6 py-2 text-base min-h-[32px] max-h-[34px]",
    lg: "px-8 py-3 text-md min-h-[32px] max-h-[34px]",
    sm: "px-2 py-1 text-sm min-h-[32px] max-h-[34px]",
  };

  const getResponsiveSizeClasses = () => {
    if (!responsiveSize) return sizeStyles[size];

    const classes = [];
    if (responsiveSize.sm) classes.push(`sm:${sizeStyles[responsiveSize.sm]}`);
    if (responsiveSize.md) classes.push(`md:${sizeStyles[responsiveSize.md]}`);
    if (responsiveSize.lg) classes.push(`lg:${sizeStyles[responsiveSize.lg]}`);
    if (responsiveSize.xl) classes.push(`xl:${sizeStyles[responsiveSize.xl]}`);

    const defaultSize = responsiveSize.sm || size;
    classes.unshift(sizeStyles[defaultSize]);

    return classes.join(" ");
  };

  const appliedVariant = disabled
    ? "disabled"
    : isLoading
    ? "loading"
    : variant;
  const appliedTypeVariant = disabled
    ? "freeze"
    : isLoading
    ? "freeze"
    : typeVariant;

  const variantStyles =
    buttonVariants[appliedVariant]?.[appliedTypeVariant] ||
    buttonVariants["primary"]["brand"];

  return (
    <button
      className={classes(baseStyles, getResponsiveSizeClasses(), variantStyles)}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {icon === true ? <Tick02Icon /> : icon ? <span>{icon}</span> : null}
      {children}
      {isLoading && <TableLoader className="ml-2" />}
    </button>
  );
};

export default Button;
