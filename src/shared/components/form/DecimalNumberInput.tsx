import { forwardRef, useEffect, useId, useState } from "react";
import { FieldWrapper } from "./FieldWrapper";
import { Controller } from "react-hook-form";
import { classes } from "@/utils/clsx";
import { useTranslation } from "react-i18next";
import { normalizeDecimal } from "@/utils/validators";

type DecimalNumberInputProps = {
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  id?: string;
  label?: string;
  className?: string;
  invalidFeedback?: any;
  notRequired?: boolean;
  maxLength?: number;
  isLoading?: boolean;
  control?: any;
  rules?: any;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  preventEnterSubmit?: boolean;
  decimalSeparators?: Array<"." | ",">;
  allowPercent?: boolean;
};

export const DecimalNumberInput = forwardRef<
  HTMLInputElement,
  DecimalNumberInputProps
>(
  (
    {
      onChange,
      onBlur,
      value: propValue = "",
      notRequired,
      label,
      className,
      invalidFeedback,
      maxLength,
      isLoading,
      control,
      name,
      rules,
      defaultValue = "",
      placeholder,
      disabled,
      preventEnterSubmit = true,
      decimalSeparators = [".", ","],
      allowPercent = false,
      ...inputProps
    },
    ref,
  ) => {
    const { i18n } = useTranslation();
    const uniqueId = useId();
    const id = inputProps.id ?? uniqueId;
    const [inputValue, setInputValue] = useState(propValue);
    const errorMessage = invalidFeedback?.message || invalidFeedback;
    const hasError = !!errorMessage;

    useEffect(() => {
      setInputValue(propValue);
    }, [propValue]);

    const placeholderStyle =
      i18n.language === "ar" ? { textAlign: "right" } : {};

    const commonProps: Record<string, unknown> = {
      id,
      className: classes(
        "w-full px-3 py-2 border rounded-xs transition-all duration-200",
        "focus:outline-none focus:ring-2 text-sm leading-none text-gray-900",
        "placeholder-gray-400 h-10",
        hasError
          ? "border-red-500 focus:ring-red-200 focus:border-red-500"
          : "border-gray-400 focus:ring-blue-200 focus:border-blue-500",
        className,
      ),
      "aria-invalid": hasError ? "true" : "false",
      style: placeholderStyle,
      type: "text",
      inputMode: "decimal",
      ...inputProps,
    };

    const filterDecimal = (raw: string): string => {
      const normalized = normalizeDecimal(raw, {
        decimalSeparators,
        allowPercent,
      });

      if (normalized === ".") return "";
      return normalized;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const filtered = filterDecimal(rawValue);
      setInputValue(filtered);
      if (onChange) onChange(filtered);
    };

    const handleBlur = () => {
      onBlur?.();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (preventEnterSubmit && e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      const allowed = [
        "Backspace",
        "Delete",
        "Tab",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End",
      ];
      const isDigit = /^\d$/.test(e.key);
      const isSeparator = decimalSeparators.includes(e.key as any);
      const isPercent = allowPercent && e.key === "%";
      const isAllowed = allowed.includes(e.key);
      const isPaste =
        (e.ctrlKey || e.metaKey) && (e.key === "v" || e.key === "V");

      if (!(isDigit || isSeparator || isPercent || isAllowed || isPaste)) {
        e.preventDefault();
        return;
      }

      const currentVal = (e.target as HTMLInputElement).value || "";
      if (
        isSeparator &&
        (currentVal.includes(".") || currentVal.includes(","))
      ) {
        e.preventDefault();
      }

      if (isPercent) {
        if (currentVal.includes("%")) {
          e.preventDefault();
        }
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData("text/plain");
      const filtered = filterDecimal(pastedText);
      if (filtered) {
        const current = (e.target as HTMLInputElement).value || "";
        const numericNext = filterDecimal(current + filtered);
        const shouldAddPercent =
          allowPercent &&
          (pastedText.includes("%") || current.includes("%")) &&
          !numericNext.includes("%");
        const nextValue = numericNext + (shouldAddPercent ? "%" : "");
        setInputValue(nextValue);
        if (onChange) onChange(nextValue);
      }
    };

    const renderInput = (field?: {
      value?: string;
      onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    }) => {
      const valueToUse = field?.value ?? inputValue;
      const inputOnChange = field?.onChange ?? handleChange;

      if (isLoading) {
        return <div className="wave-loading h-4 w-40 rounded-xs"></div>;
      }

      return (
        <input
          {...commonProps}
          {...field}
          ref={ref as React.ForwardedRef<HTMLInputElement>}
          maxLength={maxLength}
          value={valueToUse}
          onChange={inputOnChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          disabled={disabled}
        />
      );
    };

    if (control && name) {
      return (
        <Controller
          name={name}
          control={control}
          rules={rules}
          defaultValue={defaultValue}
          render={({ field, fieldState }) => (
            <FieldWrapper
              notRequired={notRequired}
              labelFor={id}
              label={label}
              invalidFeedback={fieldState.error?.message || errorMessage}
            >
              {renderInput(field)}
            </FieldWrapper>
          )}
        />
      );
    }

    return (
      <FieldWrapper
        notRequired={notRequired}
        labelFor={id}
        label={label}
        invalidFeedback={errorMessage}
      >
        {renderInput()}
      </FieldWrapper>
    );
  },
);

DecimalNumberInput.displayName = "DecimalNumberInput";
