import React, { useId } from "react";
import DatePicker, { DateObject } from "react-multi-date-picker";
import arabic from "react-date-object/calendars/arabic";
import gregorian from "react-date-object/calendars/gregorian";
import arabic_locale from "react-date-object/locales/arabic_en";
import gregorian_locale from "react-date-object/locales/gregorian_en";
import { FieldWrapper } from "../form";
import { Calculator01Icon } from "hugeicons-react";

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

  const handleDateChange = (date: DateObject | DateObject[] | null) => {
    if (!date || Array.isArray(date)) {
      onDateChange?.({ dateObject: null, hijri: "", gregorian: "" });
      return;
    }

    let hijri = "";
    let gregorianStr = "";

    // Inside handleDateChange
    if (calendarType === "hijri") {
      hijri = date.format("YYYY/MM/DD"); // forces 4-digit Hijri year
      gregorianStr = date
        .convert(gregorian, gregorian_locale)
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
          calendar={calendarType === "hijri" ? arabic : gregorian}
          locale={calendarType === "hijri" ? arabic_locale : gregorian_locale}
          // format="YYYY/MM/DD"
          format={calendarType === "hijri" ? "YYYY/MM/DD" : "YYYY/MM/DD"}
          placeholder="YYYY/MM/DD"
          value={
            value && /^\d{4}\/\d{2}\/\d{2}$/.test(value.toString())
              ? new DateObject({
                  date: value,
                  calendar: calendarType === "hijri" ? arabic : gregorian,
                  locale:
                    calendarType === "hijri" ? arabic_locale : gregorian_locale,
                  format:
                    calendarType === "hijri" ? "YYYY/MM/DD" : "YYYY/MM/DD",
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
