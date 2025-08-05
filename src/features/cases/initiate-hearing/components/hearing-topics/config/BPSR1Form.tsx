import { FormElement, Option } from "@shared/components/form/form.types";
import { HijriDatePickerInput } from "@shared/components/calanders/HijriDatePickerInput";
import { GregorianDateDisplayInput } from "@shared/components/calanders/GregorianDateDisplayInput";
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
  trigger: (field: string | string[]) => void;
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
  trigger,
}: BPSR1FormProps): FormElement[] => {
  const amount = watch("BPSR1_bonusProfitShareAmount"); // Updated to use new field name
  const amountRatio = watch("BPSR1_amountRatio");
  const otherCommission = watch("BPSR1_otherCommission");

  // In edit mode, prefer the existing topic value
  let effectiveCommissionType = commissionType;
  if (!effectiveCommissionType && isEditing && editTopic?.CommissionType) {
    effectiveCommissionType = ensureOption(
      CommissionTypeLookUpOptions,
      editTopic.CommissionType
    );
  }

  const needsOther = isOtherCommission(effectiveCommissionType);

  // Custom validation for otherCommission
  const otherCommissionValidation = {
    validate: (value: any) => {
      if (needsOther) {
        // Handle different value types safely
        if (value === null || value === undefined) {
          return t("fieldRequired");
        }
        if (typeof value === 'string') {
          return value.trim() !== "" || t("fieldRequired");
        }
        if (typeof value === 'number') {
          return value.toString().trim() !== "" || t("fieldRequired");
        }
        // For objects or other types, convert to string and check
        return String(value).trim() !== "" || t("fieldRequired");
      }
      return true;
    },
  };

  return [
    {
      type: "input",
      name: "BPSR1_bonusProfitShareAmount", // Updated to use new field name
      label: t("amount"),
      inputType: "number",
      value: isEditing
        ? editTopic?.BPSR1_bonusProfitShareAmount ?? editTopic?.bonusProfitShareAmount ?? editTopic?.Amount ?? editTopic?.amount
        : amount,
      validation: { required: t("fieldRequired") },
      onChange: (v: string) => setValue("BPSR1_bonusProfitShareAmount", v),
    },
    {
      type: "input",
      name: "BPSR1_amountRatio",
      label: t("amountRatio"),
      inputType: "number",
      value: isEditing
        ? editTopic?.BPSR1_amountRatio ?? editTopic?.amountRatio ?? editTopic?.AmountRatio
        : amountRatio,
      validation: { required: t("fieldRequired") },
      onChange: (v: string) => setValue("BPSR1_amountRatio", v),
    },
    {
      type: "custom",
      component: (
        <div className="flex flex-col gap-2">
          <HijriDatePickerInput
            control={control as any}
            name="BPSR1_fromDateHijri"
            label={t("fromDateHijri")}
            rules={{ required: true }}
            onChangeHandler={(date, onChange) =>
              handleHijriDateChange(date, onChange, "BPSR1_fromDateGregorian")
            }
          />
          <GregorianDateDisplayInput
            control={control as any}
            name="BPSR1_fromDateGregorian"
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
            control={control as any}
            name="BPSR1_toDateHijri"
            label={t("toDateHijri")}
            rules={{ required: true }}
            onChangeHandler={(date, onChange) =>
              handleHijriDateChange(date, onChange, "BPSR1_toDateGregorian")
            }
          />
          <GregorianDateDisplayInput
            control={control as any}
            name="BPSR1_toDateGregorian"
            label={t("toDateGregorian")}
          />
        </div>
      ),
    },
    {
      type: "autocomplete",
      name: "BPSR1_commissionType",
      label: t("commissionType"),
      options: CommissionTypeLookUpOptions,
      value: effectiveCommissionType,
      onChange: (opt: Option | null) => {
        setValue("BPSR1_commissionType", opt);
        trigger("BPSR1_commissionType");
        // If the new commission type does not require 'otherCommission', clear it
        if (!isOtherCommission(opt)) {
          setValue("BPSR1_otherCommission", "");
        }
        // Always trigger validation for otherCommission
        trigger("BPSR1_otherCommission");
      },
      validation: { required: t("fieldRequired") },
    },
    {
      type: "input",
      name: "BPSR1_otherCommission",
      label: t("otherCommission"),
      inputType: "text",
      value: "", // Let Controller manage the value
      onChange: () => { }, // No-op, Controller handles this
      validation: otherCommissionValidation,
      // Only show if needed
      condition: needsOther,
    },
    {
      type: "autocomplete",
      name: "BPSR1_accordingToAgreement",
      label: t("accordingToTheAgreement"),
      options: AccordingToAgreementLookupLookUpOptions,
      value: isEditing
        ? ensureOption(
          AccordingToAgreementLookupLookUpOptions,
          editTopic?.AccordingToAgreement_Code ?? editTopic?.AccordingToAgreement
        )
        : accordingToAgreement,
      onChange: (opt: Option | null) =>
        setValue("BPSR1_accordingToAgreement", opt),
      validation: { required: t("fieldRequired") },
    },
  ];
};
