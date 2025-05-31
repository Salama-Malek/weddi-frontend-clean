import { dateFieldConfigs } from "@/config/formConfig";
import { FormElement } from "@/shared/components/form/form.types";

interface Option {
  value: string;
  label: string;
}

interface BPSR1FormProps {
  t: (key: string) => string;
  commissionType: Option | null;
  accordingToAgreement: Option | null;
  setValue: (field: string, value: unknown) => void;
  CommissionTypeLookUpOptions: Option[];
  AccordingToAgreementLookupLookUpOptions: Option[];
  isEditing?: any;
  watch?: any;
  editTopic?: any;
}

export const getBPSR1FormFields = ({
  t,
  commissionType,
  accordingToAgreement,
  setValue,
  CommissionTypeLookUpOptions,
  AccordingToAgreementLookupLookUpOptions,
  isEditing,
  watch,
  editTopic,
}: BPSR1FormProps): FormElement[] => {
  const amount=watch("amount")
  const amountRatio=watch("amountRatio")
  const accordingToTheAgreement=watch("accordingToTheAgreement")
  const otherCommission=watch("otherCommission")
  const from_date_hijri=watch("from_date_hijri")
  const to_date_hijri=watch("to_date_hijri")
  return [
    {
      type: "input",
      name: "amount",
      label: t("amount"),
      inputType: "number",
      value:  isEditing ? editTopic?.amount : amount,
      onChange: (value) => setValue("amount", value),
    },
    {
      type: "input",
      name: "amountRatio",
      label: t("amountRatio"),
      inputType: "number",
      value: isEditing ? editTopic?.amountRatio : amountRatio,
      onChange: (value) => setValue("amountRatio", value),
    },
     dateFieldConfigs(t, isEditing, from_date_hijri, to_date_hijri)
            .fromDate,
          dateFieldConfigs(t, isEditing, from_date_hijri, to_date_hijri).toDate,
    {
      type: "autocomplete",
      name: "commissionType",
      label: t("commissionType"),
      options: CommissionTypeLookUpOptions,
      value: editTopic
      ? editTopic?.commissionType
      : commissionType?.value,
      onChange: (option: Option | null) => setValue("commissionType", option),
    },
    ...(commissionType?.label === "Other Commissions"
      ? [
          {
            type: "input",
            name: "otherCommission",
            label: t("otherCommission"),
            inputType: "number",
            value: isEditing ? editTopic?.otherCommission : otherCommission,
            onChange: (value: string) => setValue("otherCommission", value),
          } as const,
        ]
      : []),
    {
      type: "autocomplete",
      name: "accordingToAgreement",
      label: t("accordingToTheAgreement"),
      options: AccordingToAgreementLookupLookUpOptions,
      value: editTopic
      ? editTopic?.accordingToTheAgreement
      : accordingToTheAgreement?.value,
      onChange: (option: Option | null) =>
        setValue("accordingToAgreement", option),
    },
  ];
};
