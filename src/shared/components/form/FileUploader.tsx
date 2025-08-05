import React, { type InputHTMLAttributes } from "react";
import { Control, FieldValues, Path } from "react-hook-form";
import { FormField } from "./FormField";

interface FileUploaderProps<T extends FieldValues>
  extends InputHTMLAttributes<HTMLInputElement> {
  name: Path<T>;
  label: string;
  control?: Control<T>;
}

export function FileUploader<T extends FieldValues>({
  name,
  label,
  control,
  className = "",
  ...props
}: FileUploaderProps<T>) {
  return (
    <FormField<T>
      name={name}
      label={label}
      control={control}
      render={(field) => (
        <input
          type="file"
          id={field.name}
          name={field.name}
          ref={field.ref}
          onChange={(e) => field.onChange(e.target.files?.[0] ?? null)}
          className={`border rounded p-2 ${className}`.trim()}
          {...props}
        />
      )}
    />
  );
}
