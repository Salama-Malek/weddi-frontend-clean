import React, { useCallback, useMemo } from "react";
import { FieldWrapper } from "./FieldWrapper";
import radioIcon from "@/assets/icon-radio.svg";
import { classes } from "@/shared/lib/clsx";
import { Controller } from "react-hook-form";

export type RadioOption<T = string> = {
  label: string;
  value: T;
  description?: string;
};

export type RadioGroupProps<T = string> = {
  options: RadioOption<T>[];
  name: string;
  value?: T;
  onChange?: (value: T) => void;
  label?: string;
  className?: string;
  invalidFeedback?: any;
  notRequired?: boolean;
  disabled?: boolean;
  hasIcon?: boolean;
  validation?: any;
  control?: any;
};

const RadioOptionComponent = React.memo(
  <T,>({
    option,
    isSelected,
    hasIcon,
    disabled,
    onChange,
    name,
  }: {
    option: RadioOption<T>;
    isSelected: boolean;
    hasIcon: boolean;
    disabled: boolean;
    onChange: (value: T) => void;
    name: string;
  }) => {
    const optionContainerClasses = classes(
      "flex gap-2 items-center h-auto w-[310px]",
      {
        "px-4 py-2.5 border-[0.5px] rounded-xs": option.description,
        "border-primary-600": isSelected,
        "border-gray-400": !isSelected,
        "flex-row-reverse h-16": hasIcon,
        "bg-primary-50 h-16": hasIcon && isSelected,
      },
    );

    const radioButtonClasses = classes(
      "w-5 h-5 flex items-center justify-center border rounded-full",
      { "border-gray-400": true },
    );

    const inputValue =
      typeof option.value === "object"
        ? JSON.stringify(option.value)
        : String(option.value);

    return (
      <label
        className={classes("flex items-center gap-2", {
          "cursor-pointer": !disabled,
          "opacity-50 cursor-not-allowed": disabled,
        })}
      >
        <input
          type="radio"
          name={name}
          value={inputValue}
          checked={isSelected}
          onChange={() => onChange(option.value)}
          className="hidden"
          disabled={disabled}
        />

        <div className={optionContainerClasses}>
          <div className={radioButtonClasses}>
            {isSelected && (
              <div className="w-3 h-3 bg-primary-600 rounded-full" />
            )}
          </div>

          <div className="flex flex-col flex-1">
            <span className="text-sm20 text-gray-800 medium">
              {option.label}
            </span>
            {option.description && (
              <p className="text-gray-700 normal text-xs20">
                {option.description}
              </p>
            )}
          </div>

          {hasIcon && (
            <div className="text-gray-600">
              <img src={radioIcon} alt="radioIcon" className="w-7 h-7" />
            </div>
          )}
        </div>
      </label>
    );
  },
);

export const RadioGroup = <T extends string | object = string>({
  options,
  name,
  value: propValue,
  onChange: propOnChange,
  label,
  className,
  invalidFeedback,
  notRequired,
  disabled = false,
  hasIcon = false,
  validation,
  control,
}: RadioGroupProps<T>) => {
  const memoizedOptions = useMemo(() => options, [options]);

  const defaultValue = useMemo(() => {
    if (hasIcon && memoizedOptions.length > 0 && !propValue) {
      return memoizedOptions[0].value;
    }
    return propValue;
  }, [hasIcon, memoizedOptions, propValue]);

  const handleChange = useCallback(
    (value: any) => {
      if (!disabled && propOnChange) {
        propOnChange(value);
      }
    },
    [disabled, propOnChange],
  );

  const isOptionSelected = (option: RadioOption<T>, currentValue?: unknown) => {
    if (typeof option.value === "object" && typeof currentValue === "object") {
      return JSON.stringify(option.value) === JSON.stringify(currentValue);
    }
    return (option.value as any) === (currentValue as any);
  };

  const renderRadioOptions = (
    currentValue?: unknown,
    onChangeHandler?: (value: T) => void,
  ) => {
    const change = (v: unknown) => {
      const value = v as T;
      if (onChangeHandler) onChangeHandler(value);
      else handleChange(value);
    };
    return (
      <div className={classes("flex flex-wrap gap-6", className)}>
        {memoizedOptions.map((option) => (
          <RadioOptionComponent
            key={
              typeof option.value === "object"
                ? JSON.stringify(option.value)
                : String(option.value)
            }
            option={option}
            isSelected={isOptionSelected(option, currentValue)}
            hasIcon={hasIcon}
            disabled={disabled}
            onChange={change as any}
            name={name}
          />
        ))}
      </div>
    );
  };

  if (control) {
    return (
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        rules={validation}
        render={({ field }) => {
          const onControlledChange = (v: any) => {
            field.onChange(v);

            if (propOnChange) propOnChange(v);
          };
          return (
            <FieldWrapper
              notRequired={notRequired}
              labelFor={name}
              label={label}
              invalidFeedback={invalidFeedback}
            >
              {renderRadioOptions(field.value, onControlledChange)}
            </FieldWrapper>
          );
        }}
      />
    );
  }

  return (
    <FieldWrapper
      notRequired={notRequired}
      labelFor={name}
      label={label}
      invalidFeedback={invalidFeedback}
    >
      {renderRadioOptions(defaultValue)} {}
    </FieldWrapper>
  );
};

RadioGroup.displayName = "RadioGroup";
RadioOptionComponent.displayName = "RadioOptionComponent";
