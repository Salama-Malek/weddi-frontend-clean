import React from "react";
import {
  Control,
  Controller,
  ControllerRenderProps,
  FieldValues,
  Path,
  useFormContext,
} from "react-hook-form";
import { useTranslation } from "react-i18next";

interface FormFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  control?: Control<T>;
  render: (field: ControllerRenderProps<T>) => React.ReactNode;
}

export function FormField<T extends FieldValues>({
  name,
  label,
  control,
  render,
}: FormFieldProps<T>) {
  const { t } = useTranslation();
  const form = useFormContext<T>();

  return (
    <Controller
      name={name}
      control={control ?? form.control}
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-1">
          <label htmlFor={field.name} className="text-sm font-medium">
            {t(label)}
          </label>
          {render(field)}
          {fieldState.error?.message && (
            <p className="text-sm text-red-500">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  );
}
