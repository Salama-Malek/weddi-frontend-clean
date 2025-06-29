import React, { useEffect, useState } from "react";
import { DatePickerField } from "@/shared/components/calanders/DatePickerField";
import { ConvertedDateDisplay } from "./ConvertedDateDisplay";
import { Control, UseFormSetValue } from "react-hook-form";

export type DateOfBirthFieldProps = {
  hijriLabel?: string;
  gregorianLabel?: string;
  notRequired?: boolean;
  setValue?: UseFormSetValue<any>;
  hijriFieldName?: string;
  gregorianFieldName?: string;
  value?: any;
  control?: Control<any>;
};

export const DateOfBirthField: React.FC<DateOfBirthFieldProps> = ({
  hijriLabel = "Date (Hijri)",
  gregorianLabel = "Date (Gregorian)",
  notRequired,
  setValue,
  hijriFieldName = "hijriDate",
  gregorianFieldName = "gregorianDate",
  value,
  control,
}) => {
  const [dateInfo, setDateInfo] = useState<{
    hijri: string;
    gregorian: string;
    dateObject: any;
  }>({ hijri: "", gregorian: "", dateObject: null });

  // whenever dateObject changes, write back the eight-digit strings
  useEffect(() => {
    if (dateInfo.dateObject) {
      setValue?.(hijriFieldName, dateInfo.hijri);
      setValue?.(gregorianFieldName, dateInfo.gregorian);
    } else {
      setValue?.(hijriFieldName, "");
      setValue?.(gregorianFieldName, "");
    }
  }, [dateInfo, setValue, hijriFieldName, gregorianFieldName]);

  // Get gregorian value from form if available
  let gregorianValue = dateInfo.gregorian;
  if (control && gregorianFieldName) {
    // Try to get value from form state if possible
    // @ts-ignore
    const formValue = control._formValues?.[gregorianFieldName];
    if (formValue) gregorianValue = formValue;
  }

  return (
    <>
      <DatePickerField
        label={hijriLabel}
        notRequired={notRequired}
        calendarType="hijri"
        value={dateInfo.dateObject}
        onDateChange={(info) => setDateInfo(info)}
      />
      <div className="mt-2">
        <label className="text-sm !leading-5 normal block mb-1">
          {gregorianLabel}
        </label>
        <input
          type="text"
          value={gregorianValue || ""}
          readOnly
          className="w-full p-2 border rounded text-sm bg-gray-50 border-gray-200"
          placeholder="YYYY/MM/DD"
        />
      </div>
    </>
  );
};
