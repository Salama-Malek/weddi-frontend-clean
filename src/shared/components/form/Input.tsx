import React, { type InputHTMLAttributes } from "react";
import { Control, FieldValues, Path } from "react-hook-form";
import { FormField } from "./FormField";

interface InputProps<T extends FieldValues>
  extends InputHTMLAttributes<HTMLInputElement> {
  name: Path<T>;
  label: string;
  control?: Control<T>;
}

export function Input<T extends FieldValues>({
  name,
  label,
  control,
  className = "",
  ...props
}: InputProps<T>) {
  return (
    <FormField<T>
      name={name}
      label={label}
      control={control}
      render={(field) => (
        <input
          id={field.name}
          {...field}
          {...props}
          className={`border rounded p-2 ${className}`.trim()}
        />
      )}
    />
  );
}
