import { FormElement } from "@/shared/components/form/form.types";
import { formatHijriDate } from "@/shared/lib/helpers";

interface Option {
  value: string;
  label: string;
}

interface BR1FormProps {
  t: (key: string) => string;
  accordingToAgreement: Option | null;
  setValue: (field: string, value: unknown) => void;
  AccordingToAgreementLookupLookUpOptions: Option[];
  isEditing?: any;
  watch?: any;
  editTopic?: any;
}

export const getBR1FormFields = ({
  t,
  accordingToAgreement,
  setValue,
  AccordingToAgreementLookupLookUpOptions,
  isEditing,
  watch,
  editTopic,
}: BR1FormProps): FormElement[] => {
  const bonusAmount=watch("bonusAmount")
  const date_hijri=watch("date_hijri")
  return [
    {
      type: "autocomplete",
      name: "accordingToAgreement",
      label: t("accordingToTheAgreement"),
      options: AccordingToAgreementLookupLookUpOptions,
      value: editTopic
      ? editTopic?.accordingToAgreement
      : accordingToAgreement?.value,
      onChange: (option: Option | null) =>
        setValue("accordingToAgreement", option),
    },
    {
      type: "input",
      name: "bonusAmount",
      label: t("bonusAmount"),
      inputType: "number",
      value: isEditing ? editTopic?.bonusAmount : bonusAmount,
      onChange: (value) => setValue("bonusAmount", value),
    },
    {
      name: "date",
      type: "dateOfBirth",
      hijriLabel: t("dateHijri"),
      gregorianLabel: t("gregorianDate"),
      hijriFieldName: "date_hijri",
      value: isEditing && formatHijriDate(date_hijri),
      gregorianFieldName: "date_gregorian",
    },
  ];
};
