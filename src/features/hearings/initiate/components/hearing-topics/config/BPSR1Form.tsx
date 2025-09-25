import { FormElement } from "@/shared/components/form/form.types";
import { HijriDatePickerInput } from "@/shared/components/calanders/HijriDatePickerInput";
import { GregorianDateDisplayInput } from "@/shared/components/calanders/GregorianDateDisplayInput";
import { validateDateRange } from "@/utils/dateValidationUtils";
import { createDecimalValidation } from "@/utils/validators";

interface BPSR1FormProps {
  t: (key: string) => string;
  commissionType?: any;
  accordingToAgreement?: any;
  setValue: (name: string, value: any) => void;
  CommissionTypeLookUpOptions: any[];
  AccordingToAgreementLookupLookUpOptions: any[];
  isEditing: boolean;
  watch: (name: string) => any;
  editTopic: any;
  control: any;
  handleHijriDateChange: (
    date: any,
    onChange: any,
    gregorianFieldName: string,
  ) => void;
  trigger: (fields: string | string[]) => void;
  dateValidationError: string;
}

export const getBPSR1FormFields = ({
  t,
  setValue,
  CommissionTypeLookUpOptions,
  AccordingToAgreementLookupLookUpOptions,
  isEditing,
  watch,
  editTopic,
  control,
  handleHijriDateChange,
  trigger,
  dateValidationError,
}: BPSR1FormProps): FormElement[] => {
  const commissionTypeValue = watch("BPSR1_commissionType");
  const isOtherCommissionType =
    commissionTypeValue &&
    (["CT4", "OTHER", "3"].includes(String(commissionTypeValue.value)) ||
      (commissionTypeValue.label ?? "").toLowerCase().includes("other"));

  const baseFields: FormElement[] = [
    {
      type: "input",
      name: "BPSR1_bonusProfitShareAmount",
      label: t("bonusProfitShareAmount"),
      inputType: "text",
      numericType: "decimal",
      maxFractionDigits: 2,
      decimalSeparators: [".", ","],
      value: isEditing
        ? editTopic?.BPSR1_bonusProfitShareAmount
        : watch("BPSR1_bonusProfitShareAmount"),
      onChange: (value: string) =>
        setValue("BPSR1_bonusProfitShareAmount", value),
      validation: createDecimalValidation({
        required: t("fieldRequired"),
        maxFractionDigits: 2,
        min: 0,
      }),
      notRequired: false,
      maxLength: 10,
    },
    {
      type: "input",
      name: "BPSR1_amountRatio",
      label: t("amountRatio"),
      inputType: "text",
      numericType: "decimal",
      maxFractionDigits: 2,
      decimalSeparators: [".", ","],
      allowPercent: true,
      value: isEditing
        ? editTopic?.BPSR1_amountRatio
        : watch("BPSR1_amountRatio"),
      onChange: (value: string) => setValue("BPSR1_amountRatio", value),
      validation: createDecimalValidation({
        required: t("fieldRequired"),
        maxFractionDigits: 2,
        min: 0,
        max: 10,
        allowPercent: true,
      }),
      notRequired: false,
      maxLength: 10,
    },
    {
      type: "autocomplete",
      name: "BPSR1_commissionType",
      label: t("commissionType"),
      options: CommissionTypeLookUpOptions,
      value: isEditing
        ? editTopic?.BPSR1_commissionType
        : watch("BPSR1_commissionType"),
      onChange: (option: any) => setValue("BPSR1_commissionType", option),
      validation: {
        required: true,
        validate: (val: any) =>
          (val && typeof val === "object" && !!val.value) ||
          "Field is required",
      },
      notRequired: false,
    },
    {
      type: "autocomplete",
      name: "BPSR1_accordingToAgreement",
      label: t("accordingToAgreement"),
      options: AccordingToAgreementLookupLookUpOptions,
      value: isEditing
        ? editTopic?.BPSR1_accordingToAgreement
        : watch("BPSR1_accordingToAgreement"),
      onChange: (option: any) => setValue("BPSR1_accordingToAgreement", option),
      validation: {
        required: true,
        validate: (val: any) =>
          (val && typeof val === "object" && !!val.value) ||
          "Field is required",
      },
      notRequired: false,
    },
  ];

  if (isOtherCommissionType) {
    baseFields.push({
      type: "input",
      name: "BPSR1_otherCommission",
      label: t("otherCommission"),
      inputType: "text",
      value: isEditing
        ? editTopic?.BPSR1_otherCommission
        : watch("BPSR1_otherCommission"),
      onChange: (value: string) => setValue("BPSR1_otherCommission", value),
      validation: { required: t("fieldRequired") },
      notRequired: false,
      maxLength: 50,
    });
  }

  baseFields.push(
    {
      type: "custom",
      component: (
        <div className="flex flex-col gap-2">
          <HijriDatePickerInput
            control={control as any}
            name="BPSR1_fromDateHijri"
            label={t("fromDateHijri")}
            rules={{ required: true }}
            onChangeHandler={(date, onChange) => {
              handleHijriDateChange(date, onChange, "BPSR1_fromDateGregorian");
              const toDateValue = watch("BPSR1_toDateHijri");
              if (toDateValue && typeof trigger === "function") {
                setTimeout(() => trigger("BPSR1_toDateHijri"), 100);
              }
            }}
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
            rules={{
              required: true,
              validate: {
                dateRange: (value: string, formValues: any) => {
                  const fromDate = formValues.BPSR1_fromDateHijri;
                  const toDate = value;

                  if (fromDate && toDate) {
                    const result = validateDateRange(
                      fromDate,
                      toDate,
                      "hijri",
                      "hijri",
                    );
                    if (result !== true) {
                      return dateValidationError;
                    }
                    return true;
                  }
                  return true;
                },
              },
            }}
            notRequired={false}
            onChangeHandler={(date, onChange) =>
              handleHijriDateChange(date, onChange, "BPSR1_toDateGregorian")
            }
            isDateOfBirth={false}
          />
          <GregorianDateDisplayInput
            control={control as any}
            name="BPSR1_toDateGregorian"
            label={t("toDateGregorian")}
          />
        </div>
      ),
    },
  );

  return baseFields;
};
