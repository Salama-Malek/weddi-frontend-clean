import { Control, Controller, UseFormSetValue } from "react-hook-form";
import DatePicker, { DateObject } from "react-multi-date-picker";
import arabic from "react-date-object/calendars/arabic";
import gregorian from "react-date-object/calendars/gregorian";
import arabic_locale from "react-date-object/locales/arabic_en";
import gregorian_locale from "react-date-object/locales/gregorian_en";
import { useTranslation } from "react-i18next";
import { FieldWrapper } from "../form";

export const DateOfBirthField = ({
  control,
  hijriLabel,
  gregorianLabel,
  hijriFieldName = "hijriDate",
  gregorianFieldName = "gregorianDate",
  setValue,
  notRequired,
  invalidFeedback,
  validation,
}: {
  control: Control<any>;
  hijriLabel: string;
  gregorianLabel: string;
  hijriFieldName?: string;
  gregorianFieldName?: string;
  setValue: UseFormSetValue<any>;
  notRequired?: boolean;
  invalidFeedback?: string;
  validation?: any;
}) => {
  const { t } = useTranslation();

  const handleDateChange = (
    date: DateObject | DateObject[] | null,
    onChange: (value: string) => void
  ) => {
    if (!date || Array.isArray(date)) {
      onChange("");
      setValue(gregorianFieldName, "");
      return;
    }

    // format both calendars as YYYYMMDD
    const hijriDate = date.format("YYYYMMDD");
    const gregorianDate = date
      .convert(gregorian, gregorian_locale)
      .format("YYYYMMDD");

    onChange(hijriDate);
    setValue(gregorianFieldName, gregorianDate);
  };

  return (
    <div className="contents flex-wrap col gap-4">
      <FieldWrapper
        notRequired={notRequired}
        invalidFeedback={invalidFeedback}
        label={hijriLabel}
      >
        <div className="relative">
          <Controller
            name={hijriFieldName}
            control={control}
            rules={{
              required: notRequired
                ? false
                : validation?.required || t("This field is required"),
              pattern: {
                value: /^\d{8}$/,
                message: t("dateValidationDesc"),
              },
            }}
            render={({
              field: { onChange, value },
              fieldState: { error },
            }) => (
              <>
                <DatePicker
                  placeholder="YYYYMMDD"
                  calendar={arabic}
                  locale={arabic_locale}
                  value={value || undefined}
                  onChange={(date) => handleDateChange(date, onChange)}
                  inputClass={`w-full p-2 border rounded text-sm focus:ring-1 focus:outline-none pr-8 ${
                    error || invalidFeedback
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-400 focus:ring-blue-500"
                  }`}
                />
                {(error || invalidFeedback) && (
                  <div className="invalid-feedback text-red-500 mt-2">
                    {error?.message || invalidFeedback}
                  </div>
                )}
              </>
            )}
          />
        </div>
      </FieldWrapper>

      <FieldWrapper notRequired label={gregorianLabel}>
        <div className="relative">
          <Controller
            name={gregorianFieldName}
            control={control}
            render={({ field: { value } }) => (
              <input
                value={value || ""}
                type="text"
                readOnly
                placeholder="YYYYMMDD"
                className="w-full p-2 outline-none bg-gray-100"
              />
            )}
          />
        </div>
      </FieldWrapper>
    </div>
  );
};
