import React, { useId } from "react";
import DatePicker, { DateObject } from "react-multi-date-picker";
import arabic from "react-date-object/calendars/arabic";
import arabic_locale from "react-date-object/locales/arabic_ar";
import gregorian from "react-date-object/calendars/gregorian";
import gregorian_locale_ar from "react-date-object/locales/gregorian_ar";
import gregorian_locale_en from "react-date-object/locales/gregorian_en";
import { FieldWrapper } from "../form";
import { Calculator01Icon } from "hugeicons-react";
import { useTranslation } from "react-i18next";

export type DatePickerFieldProps = {
  label?: string;
  invalidFeedback?: any;
  notRequired?: boolean;
  calendarType?: "hijri" | "gregorian";
  value?: DateObject | null;
  onDateChange?: (dateInfo: {
    dateObject: DateObject | null;
    hijri: string;
    gregorian: string;
  }) => void;
};

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label,
  invalidFeedback,
  notRequired,
  calendarType = "hijri",
  value,
  onDateChange,
}) => {
  const uniqueId = useId();
  const { t } = useTranslation('placeholder');
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const handleDateChange = (date: DateObject | DateObject[] | null) => {
    if (!date || Array.isArray(date)) {
      onDateChange?.({ dateObject: null, hijri: "", gregorian: "" });
      return;
    }

    let hijri = "";
    let gregorianStr = "";

    // Inside handleDateChange
    if (calendarType === "hijri") {
      hijri = date.format("YYYY/MM/DD");
      gregorianStr = date
        .convert(gregorian, gregorian_locale_ar)
        .format("YYYY/MM/DD");
    } else {
      gregorianStr = date.format("YYYY/MM/DD");
      hijri = date.convert(arabic, arabic_locale).format("YYYY/MM/DD");
    }

    onDateChange?.({
      dateObject: date,
      hijri,
      gregorian: gregorianStr,
    });
  };

  return (
    <FieldWrapper
      notRequired={notRequired}
      labelFor={uniqueId}
      label={label}
      invalidFeedback={invalidFeedback}
    >
      <div className="relative">
        <DatePicker
          id={uniqueId}
          calendar={isArabic ? arabic : gregorian}
          locale={isArabic ? arabic_locale : gregorian_locale_en}
          format="YYYY/MM/DD"
          placeholder={t('date')}
          value={
            value && /^\d{4}\/\d{2}\/\d{2}$/.test(value.toString())
              ? new DateObject({
                  date: value,
                  calendar: isArabic ? arabic : gregorian,
                  locale:
                    isArabic ? arabic_locale : gregorian_locale_en,
                  format:
                    "YYYY/MM/DD",
                })
              : undefined
          }
          onChange={handleDateChange}
          inputClass={`
            w-full p-2 border rounded text-sm focus:ring-1 focus:outline-none pr-8
            ${
              invalidFeedback
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-400 focus:ring-blue-500"
            }
          `}
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <Calculator01Icon />
        </div>
      </div>
    </FieldWrapper>
  );
};
