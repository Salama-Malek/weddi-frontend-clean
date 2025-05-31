import { FormElement } from "@/shared/components/form/form.types";
import { formatHijriDate } from "@/shared/lib/helpers";
import { useTranslation } from "react-i18next";

type FormConfig = {
  isEditing: boolean;
  handleAddTopic: () => void;
  t: (key: string) => string;
};

let formConfig: FormConfig | null = null;

export const initFormConfig = (config: FormConfig) => {
  formConfig = config;
};

export const getCommonElements = (
  isValid: boolean | undefined
): (FormElement | false)[] => {
  if (!formConfig) throw new Error("Form config not initialized!");

  const { isEditing, handleAddTopic, t } = formConfig;

  return [
    !isEditing && {
      type: "custom" as const,
      colSpan: 2,
      component: (
        <p className="text-sm text-secondary-700 font-semibold">
          {t("auto_save_note")}
        </p>
      ),
    },
    !isEditing && {
      disabled: !isValid,
      type: "button" as const,
      label: t("add_topic"),
      onClick: handleAddTopic,
      size: "sm" as const,
      colSpan: 1,
    },
  ];
};

export const buildForm = (elements: (FormElement | false)[]) => [...elements];

export const dateFieldConfigs = (
  t: any,
  isEditing?: any,
  from_date_hijri?: any,
  to_date_hijri?: any
) =>
  ({
    fromDate: {
      name: "fromDate",
      type: "dateOfBirth" as const,
      value: isEditing && formatHijriDate(from_date_hijri),
      hijriLabel: t("fromDateHijri"),
      gregorianLabel: t("formDateGregorian"),
      hijriFieldName: "from_date_hijri",
      gregorianFieldName: "from_date_gregorian",
    },
    toDate: {
      name: "toDate",
      type: "dateOfBirth" as const,
      hijriLabel: t("toDateHijri"),
      value: isEditing && formatHijriDate(to_date_hijri),
      gregorianLabel: t("toDateGregorian"),
      hijriFieldName: "to_date_hijri",
      gregorianFieldName: "to_date_gregorian",
    },
  } as const);

export type DateFieldKey = keyof typeof dateFieldConfigs;

export const managerialDateConfigs = (t: any, setValue?: any) =>
  ({
    managerialDate: {
      name: "managerialDecisionDate",
      type: "dateOfBirth" as const,
      hijriLabel: t("managerialDecisionDateHijri"),
      gregorianLabel: t("managerialDecisionDateGregorian"),
      hijriFieldName: "managerial_decision_date_hijri",
      gregorianFieldName: "managerial_decision_date_gregorian",
    },
    managerialNumber: {
      type: "input",
      name: "managerialDecisionNumber",
      label: t("managerialDecisionNumber"),
      inputType: "number",
      notRequired: true,
      value: "",
      onChange: (value: string) => setValue("managerialDecisionNumber", value),
    },
  } as const);

interface InputFieldProps {
  name: string;
  labelKey: string;
  inputType?: "text" | "number" | "email" | "password" | "textarea";
  value?: string;
  onChange: (value: string) => void;
  colSpan?: number;
  disabled?: boolean;
  t: (key: string) => string;
}

export const inputField = ({
  name,
  labelKey,
  inputType = "text",
  value = "",
  onChange,
  colSpan,
  t,
}: InputFieldProps): FormElement => ({
  type: "input",
  name,
  label: t(labelKey),
  inputType,
  value,
  onChange,
  colSpan,
});
