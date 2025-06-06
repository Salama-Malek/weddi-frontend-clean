import React from "react";
import { Control, Controller, UseFormSetValue } from "react-hook-form";
import DatePicker, { DateObject } from "react-multi-date-picker";
import hijriCalendar from "react-date-object/calendars/arabic";
import gregorianCalendar from "react-date-object/calendars/gregorian";
import hijriLocale from "react-date-object/locales/arabic_en";
import gregorianLocale from "react-date-object/locales/gregorian_en"; 
import { useTranslation } from "react-i18next";
import { FieldWrapper } from "../form";
import { Calculator01Icon } from "hugeicons-react";

interface Props {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  hijriFieldName: string;
  gregorianFieldName: string;
  hijriLabel: string;
  gregorianLabel: string;
  invalidFeedback?: string;
  notRequired?: boolean;
  type?: "contract-start" | "contract-end" | "work-start" | "work-end" | "dob";
  relatedStartDate?: string;
  relatedEndDate?: string;
}

const HijriDateField: React.FC<Props> = ({
  control,
  setValue,
  hijriFieldName,
  gregorianFieldName,
  hijriLabel,
  gregorianLabel,
  invalidFeedback,
  notRequired,
  type = "dob",
  relatedStartDate,
  relatedEndDate,
}) => {
  const { t } = useTranslation("hearingdetails");

  const handleDateChange = (
    date: DateObject | DateObject[] | null,
    onChange: (value: string) => void
  ) => {
    if (!date || Array.isArray(date)) {
      onChange("");
      setValue(gregorianFieldName, "");
      return;
    }

    const hijri = date.convert(hijriCalendar, hijriLocale).format("YYYY/MM/DD");
    const gregorian = date.convert(gregorianCalendar, gregorianLocale).format("YYYY/MM/DD");

    console.log("[handleDateChange] hijri:", hijri);
    console.log("[handleDateChange] gregorian:", gregorian);

    onChange(hijri);
    setValue(gregorianFieldName, gregorian);
  };

const validateDate = (value: string): true | string => {
  if (!value || typeof value !== "string") return true;

  const isValidPattern = /^\d{4}\/\d{2}\/\d{2}$/.test(value);
  if (!isValidPattern) return t("dateValidationDesc");

  const hijriDate = new DateObject({
    date: value,
    calendar: hijriCalendar,
    locale: hijriLocale,
    format: "YYYY/MM/DD",
  });

  const selected = hijriDate.convert(gregorianCalendar, gregorianLocale).toDate();

  const getGregorianFromHijri = (dateStr: string): Date => {
    return new DateObject({
      date: dateStr,
      calendar: hijriCalendar,
      locale: hijriLocale,
      format: "YYYY/MM/DD",
    }).convert(gregorianCalendar, gregorianLocale).toDate();
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (type) {
    case "contract-start":
      if (selected > today) return t("contractDateValidation.startDateFuture");
      if (relatedEndDate && selected > getGregorianFromHijri(relatedEndDate))
        return t("contractDateValidation.startAfterEnd");
      break;

    case "contract-end":
      if (relatedStartDate && selected < getGregorianFromHijri(relatedStartDate))
        return t("contractDateValidation.endBeforeStart");
      break;

    case "work-start":
      if (selected > today) return t("workDateValidation.startDateFuture");
      if (relatedEndDate && selected > getGregorianFromHijri(relatedEndDate))
        return t("workDateValidation.startAfterContract");
      break;

    case "work-end":
      if (selected > today) return t("workDateValidation.endDateFuture");
      if (relatedStartDate && selected < getGregorianFromHijri(relatedStartDate))
        return t("workDateValidation.endBeforeStart");
      if (relatedEndDate && selected > getGregorianFromHijri(relatedEndDate))
        return t("workDateValidation.endAfterContract");
      break;

    // Optional: you can add a check for 'dob' or 'work-start' here if needed
  }

  return true;
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
            shouldUnregister={false}
            name={hijriFieldName}
            control={control}
            rules={{
              required: !notRequired && t("This field is required"),
              pattern: {
                value: /^\d{4}\/\d{2}\/\d{2}$/,
                message: t("dateValidationDesc"),
              },
              validate: validateDate,
            }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <>
                <DatePicker
                  placeholder="YYYY/MM/DD"
                  calendar={hijriCalendar}
                  locale={hijriLocale}
                  format="YYYY/MM/DD"
                  value={
                    value && /^\d{4}\/\d{2}\/\d{2}$/.test(value)
                      ? new DateObject({
                          date: value,
                          calendar: hijriCalendar,
                          locale: hijriLocale,
                          format: "YYYY/MM/DD",
                        })
                      : undefined
                  }
                  onChange={(date) => handleDateChange(date, onChange)}
                  inputClass={`w-full p-2 border rounded text-sm focus:ring-1 focus:outline-none pr-8 ${
                    error || invalidFeedback
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-400 focus:ring-blue-500"
                  }`}
                  calendarPosition="bottom-right"
                />
                {/* <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <Calculator01Icon />
                </div> */}
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
        <Controller
          shouldUnregister={false}
          name={gregorianFieldName}
          control={control}
          render={({ field: { value } }) => (
            <input
              type="text"
              value={value || ""}
              readOnly
              placeholder="YYYY/MM/DD"
              className="w-full p-2 outline-none bg-gray-100"
            />
          )}
        />
      </FieldWrapper>
    </div>
  );
};

export default HijriDateField;
