import { SectionLayout, FormData } from "@/shared/components/form/form.types";
import { UseFormWatch, UseFormSetValue } from "react-hook-form";
import { TFunction } from "i18next";

export interface AgentField {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  readonly?: boolean;
}

export const buildAgentInformationSection = (
  fields: AgentField[],
  watch: UseFormWatch<any>,
  setValue: UseFormSetValue<any>,
  t: TFunction,
  extraChildren: any[] = []
): SectionLayout => {
  return {
    title: t("agentInformation"),
    className: "agent-information-section",
    gridCols: 3,
    children: [
      ...fields.map((field) => ({
        type: "input" as const,
        name: field.name as any,
        label: field.label,
        inputType: field.type || "text",
        value: watch(field.name as any) as string,
        onChange: (v: string) => setValue(field.name as any, v),
        readonly: field.readonly,
        defaultValue: field.defaultValue,
      })),
      ...(extraChildren || [])
    ],
  };
};
