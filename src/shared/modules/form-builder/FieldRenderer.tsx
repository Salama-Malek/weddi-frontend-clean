import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@shared/components/form/Input";
import { Select } from "@shared/components/form/Select";
import { RadioGroup } from "@shared/components/form/RadioGroup";
import { FieldConfig } from "./types";

interface FieldRendererProps {
  field: FieldConfig;
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({ field }) => {
  const { control } = useFormContext();

  switch (field.type) {
    case "text":
      return (
        <Input
          name={field.name}
          label={field.label}
          type={field.inputType || "text"}
        />
      );
    case "select":
      return (
        <Select
          name={field.name}
          label={field.label}
          options={field.options}
        />
      );
    case "radio":
      return (
        <RadioGroup
          name={field.name}
          label={field.label}
          options={field.options}
          control={control}
        />
      );
    default:
      return null;
  }
};

export default FieldRenderer;
