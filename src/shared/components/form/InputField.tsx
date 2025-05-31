import { forwardRef, useId, useState, useEffect } from "react";
import { FieldWrapper } from "./FieldWrapper";
import { useDebouncedCallback } from "@/shared/hooks/use-debounced-callback";
import { Controller } from "react-hook-form";
import { classes } from "@/shared/lib/clsx";

type InputOrTextareaProps = React.InputHTMLAttributes<HTMLInputElement> &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export type InputFieldProps = InputOrTextareaProps & {
  name?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  type?: string;
  id?: string;
  label?: string;
  className?: string;
  invalidFeedback?: any;
  notRequired?: boolean;
  isSearch?: boolean;
  rows?: number;
  maxLength?: number;
  isLoading?: boolean;
  control?: any;
  rules?: any;
  defaultValue?: string;
};

export const InputField = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputFieldProps>(
  (
    {
      isSearch = false,
      onChange,
      onBlur,
      value: propValue = "",
      notRequired,
      label,
      className,
      invalidFeedback,
      type,
      rows = 3,
      maxLength,
      isLoading,
      control,
      name,
      rules,
      defaultValue = "",
      ...inputProps
    },
    ref
  ) => {
    const uniqueId = useId();
    const id = inputProps.id ?? uniqueId;
    const [inputValue, setInputValue] = useState(propValue);
    const isTextarea = type === "textarea" && !isSearch;
    const errorMessage = invalidFeedback?.message || invalidFeedback;
    const hasError = !!errorMessage;

    // Sync with external value
    useEffect(() => {
      setInputValue(propValue);
    }, [propValue]);

    const commonProps: any = {
      id,
      className: classes(
        "w-full px-3 py-2 border rounded-xs transition-all duration-200",
        "focus:outline-none focus:ring-2 text-sm leading-none text-gray-900",
        "placeholder-gray-400",
        !isTextarea && "h-10",
        hasError
          ? "border-red-500 focus:ring-red-200 focus:border-red-500"
          : "border-gray-400 focus:ring-blue-200 focus:border-blue-500",
        className
      ),
      "aria-invalid": hasError ? "true" : "false",
      ...inputProps,
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setInputValue(e.target.value);
      onChange?.(e);
    };
    const handleBlur = (e: React. FocusEventHandler<HTMLInputElement | undefined>) => {
      onBlur?.();
    };


    const debouncedOnChange = useDebouncedCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(event);
      },
      [onChange],
      500
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      debouncedOnChange(e);
    };

    const renderInput = (field?: any) => {
      const valueToUse = field?.value ?? inputValue;
      const inputOnChange = field?.onChange ?? handleChange;

      if (isLoading) {
        return <div className="wave-loading h-4 w-40 rounded-xs"></div>;
      }

      if (isTextarea) {
        return (
          <textarea
            {...commonProps}
            {...field}
            ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
            rows={rows}
            value={valueToUse}
            onChange={inputOnChange}
          />
        );
      }

      if (isSearch) {
        return (
          <input
            {...commonProps}
            ref={ref as React.ForwardedRef<HTMLInputElement>}
            type={type}
            value={valueToUse}
            onChange={handleSearchChange}
            onBlur={handleBlur}
          />
        );
      }

      return (
        <input
          {...commonProps}
          {...field}
          ref={ref as React.ForwardedRef<HTMLInputElement>}
          type={type}
          maxLength={maxLength}
          value={valueToUse}
          onChange={inputOnChange}
          onBlur={handleBlur}
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
  }
);

InputField.displayName = "InputField";
