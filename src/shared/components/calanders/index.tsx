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

  return (
    <>
      <DatePickerField
        label={hijriLabel}
        notRequired={notRequired}
        calendarType="hijri"
        value={dateInfo.dateObject}
        onDateChange={(info) => setDateInfo(info)}
      />
      <ConvertedDateDisplay
        notRequired={notRequired}
        gregorianDate={dateInfo.gregorian}
        label={gregorianLabel}
      />
    </>
  );
};
