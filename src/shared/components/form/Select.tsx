import React, { type SelectHTMLAttributes } from "react";
import { Control, FieldValues, Path } from "react-hook-form";
import { FormField } from "./FormField";

interface Option {
  value: string;
  label: string;
}

interface SelectProps<T extends FieldValues>
  extends SelectHTMLAttributes<HTMLSelectElement> {
  name: Path<T>;
  label: string;
  options: Option[];
  control?: Control<T>;
}

export function Select<T extends FieldValues>({
  name,
  label,
  options,
  control,
  className = "",
  ...props
}: SelectProps<T>) {
  return (
    <FormField<T>
      name={name}
      label={label}
      control={control}
      render={(field) => (
        <select
          id={field.name}
          {...field}
          {...props}
          className={`border rounded p-2 ${className}`.trim()}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
    />
  );
}
