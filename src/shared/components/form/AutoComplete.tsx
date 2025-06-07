import React from "react";
import Select, { components } from "react-select";
import { FieldWrapper } from "./FieldWrapper";
import { useTranslation } from "react-i18next";
import { Controller } from "react-hook-form";
import { ArrowDown01Icon } from "hugeicons-react";

export type AutoCompleteFieldProps = {
  options: any;
  id?: string;
  label?: string;
  className?: string;
  invalidFeedback?: any;
  onChange: (
    selectedOption: { value: string; label: string } | null | string
  ) => void;
  value: { value: string; label: string } | null | string;
  notRequired?: boolean;
  isWrapped?: boolean;
  name?: string;
  validation?: any;
  control?: any;
  isLoading?: boolean;
  disabled?: boolean;
};

const CustomDropdownIndicator = (props: any) => (
  <div {...props.innerProps} className="m-1.5">
    <ArrowDown01Icon size={20} />
  </div>
);

// Custom Clear Indicator that stops propagation to avoid closing parent modals
const CustomClearIndicator = (props: any) => {
  const { innerProps, clearValue } = props;
  return (
    <div
      {...innerProps}
      onMouseDown={(e) => {
        e.stopPropagation();
        // call default handler
        innerProps.onMouseDown(e);
      }}
    >
      {/* You can use the default clear icon */}
      <components.ClearIndicator {...props} />
    </div>
  );
};

export const AutoCompleteField: React.FC<AutoCompleteFieldProps> = ({
  options,
  id,
  label,
  className,
  invalidFeedback,
  onChange,
  notRequired,
  value,
  isWrapped = true,
  name = "",
  validation,
  control,
  isLoading,
  disabled,
}) => {
  const { t } = useTranslation();
  const errorMessage = invalidFeedback?.message || invalidFeedback;
  const hasError = !!errorMessage;

  const customStyles = {
    control: (provided: any, state: { isFocused: boolean }) => ({
      ...provided,
      width: "100%",
      border: `1px solid ${hasError ? "#EF4444" : "#9DA4AE"}`,
      borderRadius: "0.25rem",
      minHeight: "2.5rem",
      boxShadow: state.isFocused
        ? `0 0 0 2px ${
            hasError ? "rgba(239, 68, 68, 0.2)" : "rgba(191, 219, 254, 0.5)"
          }`
        : "none",
      "&:hover": {
        borderColor: hasError
          ? "#EF4444"
          : state.isFocused
          ? "#3B82F6"
          : "#9CA3AF",
      },
      transition: "all 0.2s ease",
    }),
    option: (
      provided: any,
      state: { isSelected: boolean; isFocused: boolean }
    ) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#2563EB"
        : state.isFocused
        ? "#E5E7EB"
        : "white",
      color: state.isSelected ? "white" : "black",
      "&:active": {
        backgroundColor: "#2563EB",
        color: "white",
      },
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: "#1F2937",
      fontSize: "0.875rem",
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#9CA3AF",
      fontSize: "0.875rem",
    }),
    dropdownIndicator: (provided: any) => ({
      ...provided,
      padding: "0.5rem",
      color: hasError ? "#EF4444" : "#6B7280",
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      padding: "0 0.75rem",
    }),
    input: (provided: any) => ({
      ...provided,
      margin: "0",
      padding: "0",
      color: "#1F2937",
    }),
    menu: (provided: any) => ({
      ...provided,
      marginTop: "0.25rem",
      borderRadius: "0.25rem",
      boxShadow:
        "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
      zIndex: 9999,
    }),
    indicatorSeparator: (provided: any) => ({
      ...provided,
      backgroundColor: hasError ? "#EF4444" : "#E5E7EB",
    }),
  };

  const selectProps = {
    isLoading,
    options,
    styles: customStyles,
    className: `w-full ${className ?? ""}`,
    classNamePrefix: "react-select",
    isClearable: true,
    placeholder: t("select_title"),
    isDisabled: disabled,
    components: {
      DropdownIndicator: CustomDropdownIndicator,
      ClearIndicator: CustomClearIndicator,
    },
  };

  const selectComponent = control ? (
    <Controller
      name={name}
      control={control}
      rules={validation}
      render={({ field }) => (
        <Select
          {...field}
          {...selectProps}
          onChange={field.onChange}
          value={field.value}
        />
      )}
    />
  ) : (
    <Select
      {...selectProps}
      id={id}
      value={value}
      onChange={onChange}
      name={name}
    />
  );

  return isWrapped ? (
    <FieldWrapper
      notRequired={notRequired}
      labelFor={id}
      label={label}
      invalidFeedback={errorMessage}
    >
      {selectComponent}
    </FieldWrapper>
  ) : (
    selectComponent
  );
};
