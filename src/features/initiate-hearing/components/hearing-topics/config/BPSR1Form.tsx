import { FormElement, Option } from "@/shared/components/form/form.types";
import { HijriDatePickerInput } from "@/shared/components/calanders/HijriDatePickerInput";
import { GregorianDateDisplayInput } from "@/shared/components/calanders/GregorianDateDisplayInput";
import { ensureOption } from "../edit-index";
import { isOtherCommission } from "../utils/isOtherCommission"; 
interface BPSR1FormProps {
  t: (key: string) => string;
  commissionType: Option | null;
  accordingToAgreement: Option | null;
  setValue: (field: string, value: unknown) => void;
  CommissionTypeLookUpOptions: Option[];
  AccordingToAgreementLookupLookUpOptions: Option[];
  isEditing?: boolean;
  watch: ReturnType<any>;
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
  isEditing = false,
  watch,
  editTopic,
  control,
  handleHijriDateChange,
}: BPSR1FormProps): FormElement[] => {
  const amount = watch("amount");
  const amountRatio = watch("amountRatio");
  const otherCommission = watch("otherCommission");

  // Ensure we have a commissionType option in edit mode
  let effectiveCommissionType = commissionType;
  if (!effectiveCommissionType && isEditing && editTopic?.CommissionType) {
    effectiveCommissionType = ensureOption(
      CommissionTypeLookUpOptions,
      editTopic.CommissionType
    );
  }

  const needsOther = isOtherCommission(effectiveCommissionType);

  return [
    {
      type: "input",
      name: "amount",
      label: t("amount"),
      inputType: "number",
      value: isEditing ? editTopic?.Amount ?? editTopic?.amount : amount,
      validation: { required: t("fieldRequired") },
      onChange: (v: string) => setValue("amount", v),
    },
    {
      type: "input",
      name: "amountRatio",
      label: t("amountRatio"),
      inputType: "number",
      value: isEditing ? editTopic?.AmountRatio ?? editTopic?.amountRatio : amountRatio,
      validation: { required: t("fieldRequired") },
      onChange: (v: string) => setValue("amountRatio", v),
    },
    {
      type: "custom",
      component: (
        <div className="flex flex-col gap-2">
          <HijriDatePickerInput
            control={control}
            name="from_date_hijri"
            label={t("fromDateHijri")}
            rules={{ required: true }}
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
            rules={{ required: true }}
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
      value: effectiveCommissionType,
      onChange: (opt: Option | null) => setValue("commissionType", opt),
      validation: { required: t("fieldRequired") },
    },
    ...(needsOther
      ? [
          {
            type: "input",
            name: "otherCommission",
            label: t("otherCommission"),
            inputType: "text",
            value: isEditing
              ? editTopic?.OtherCommission ?? editTopic?.otherCommission ?? ""
              : otherCommission,
            onChange: (v: string) => setValue("otherCommission", v),
            validation: { required: t("fieldRequired") },
          } as const,
        ]
      : []),
    {
      type: "autocomplete",
      name: "accordingToAgreement",
      label: t("accordingToTheAgreement"),
      options: AccordingToAgreementLookupLookUpOptions,
      value: isEditing
        ? ensureOption(
            AccordingToAgreementLookupLookUpOptions,
            editTopic?.accordingToAgreement?.value ?? editTopic?.AccordingToAgreement
          )
        : accordingToAgreement,
      onChange: (opt: Option | null) => setValue("accordingToAgreement", opt),
      validation: { required: t("fieldRequired") },
    },
  ];
};
