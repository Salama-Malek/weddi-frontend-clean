import React, { type InputHTMLAttributes } from "react";
import { Control, FieldValues, Path } from "react-hook-form";
import { FormField } from "./FormField";

interface DatePickerProps<T extends FieldValues>
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  name: Path<T>;
  label: string;
  control?: Control<T>;
}

export function DatePicker<T extends FieldValues>({
  name,
  label,
  control,
  className = "",
  ...props
}: DatePickerProps<T>) {
  return (
    <FormField<T>
      name={name}
      label={label}
      control={control}
      render={(field) => (
        <input
          type="date"
          id={field.name}
          {...field}
          {...props}
          className={`border rounded p-2 ${className}`.trim()}
        />
      )}
    />
  );
}
