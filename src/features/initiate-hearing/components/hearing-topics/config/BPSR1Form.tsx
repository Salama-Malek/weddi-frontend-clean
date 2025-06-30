import { FormElement } from "@/shared/components/form/form.types";
import {HijriDatePickerInput} from "@/shared/components/calanders/HijriDatePickerInput";
import{ GregorianDateDisplayInput} from "@/shared/components/calanders/GregorianDateDisplayInput";

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
  control: any;
  handleHijriDateChange: (
    date: any,
    setHijriValue: (value: string) => void,
    gregorianFieldName: string
  ) => void;
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
  control,
  handleHijriDateChange,
}: BPSR1FormProps): FormElement[] => {
  const amount = watch("amount");
  const amountRatio = watch("amountRatio");
  const accordingToTheAgreement = watch("accordingToTheAgreement");
  const otherCommission = watch("otherCommission");

  // In edit mode, determine the commission type from editTopic if commissionType is not set
  const effectiveCommissionType = commissionType || (isEditing && editTopic?.CommissionType ? {
    value: editTopic.CommissionType,
    label: editTopic.CommissionType
  } : null);

  return [
    {
      type: "input",
      name: "amount",
      label: t("amount"),
      inputType: "number",
      value: isEditing ? editTopic?.Amount || editTopic?.amount : amount,
      onChange: (value) => setValue("amount", value),
    },
    {
      type: "input",
      name: "amountRatio",
      label: t("amountRatio"),
      inputType: "number",
      value: isEditing ? editTopic?.AmountRatio || editTopic?.amountRatio : amountRatio,
      onChange: (value) => setValue("amountRatio", value),
    },
    {
      type: "custom",
      component: (
        <div className="flex flex-col gap-2">
          <HijriDatePickerInput
            control={control}
            name="from_date_hijri"
            label={t("fromDateHijri")}
            rules={{}}
            onChangeHandler={(date, onChange) =>
              handleHijriDateChange(date, onChange, "from_date_gregorian")
            }
          />
          <GregorianDateDisplayInput
            control={control}
            name="from_date_gregorian"
            label={t("fromDateGregorian")}
          />
        </div>
      ),
    },
    {
      type: "custom",
      component: (
        <div className="flex flex-col gap-2">
          <HijriDatePickerInput
            control={control}
            name="to_date_hijri"
            label={t("toDateHijri")}
            rules={{}}
            onChangeHandler={(date, onChange) =>
              handleHijriDateChange(date, onChange, "to_date_gregorian")
            }
          />
          <GregorianDateDisplayInput
            control={control}
            name="to_date_gregorian"
            label={t("toDateGregorian")}
          />
        </div>
      ),
    },
    {
      type: "autocomplete",
      name: "commissionType",
      label: t("commissionType"),
      options: CommissionTypeLookUpOptions,
      value: editTopic ? editTopic?.commissionType : commissionType?.value,
      onChange: (option: Option | null) => setValue("commissionType", option),
    },
    ...((effectiveCommissionType?.label === "Other Commissions" || (isEditing && editTopic?.CommissionType === "Other Commissions"))
      ? [
          {
            type: "input",
            name: "otherCommission",
            label: t("otherCommission"),
            inputType: "number",
            value: isEditing ? editTopic?.OtherCommission || editTopic?.otherCommission : otherCommission,
            onChange: (value: string) => setValue("otherCommission", value),
          } as const,
        ]
      : []),
    {
      type: "autocomplete",
      name: "accordingToAgreement",
      label: t("accordingToTheAgreement"),
      options: AccordingToAgreementLookupLookUpOptions,
      value: editTopic ? editTopic?.accordingToTheAgreement : accordingToTheAgreement?.value,
      onChange: (option: Option | null) => setValue("accordingToAgreement", option),
    },
  ];
};
