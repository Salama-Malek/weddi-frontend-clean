import { createContext, useContext, useState } from 'react';

interface DateInfo {
  hijri: string | null;
  gregorian: string | null;
  convertedDate: string | null;
}

interface DateContextType {
  calendarType: 'hijri' | 'gregorian';
  dateInfo: DateInfo;
  setDate: (date: DateInfo) => void;
  registerDateField: (name: string, setFormValue: (value: string) => void) => void;
}

const DateContext = createContext<DateContextType>({} as DateContextType);

export const DateProvider = ({ children }: { children: React.ReactNode }) => {
  const [calendarType, setCalendarType] = useState<'hijri' | 'gregorian'>('hijri');
  const [dateInfo, setDateInfo] = useState<DateInfo>({
    hijri: null,
    gregorian: null,
    convertedDate: null
  });
  const [formFields, setFormFields] = useState<Record<string, (value: string) => void>>({});

  const setDate = (info: DateInfo) => {
    setDateInfo(info);
    Object.entries(formFields).forEach(([name, setValue]) => {
        
      // if (name === 'hijriDate' && info.hijri) setValue(info.hijri);
      // if (name === 'gregorianDate' && info.gregorian) setValue(info.gregorian);
        if (name === 'hijriDate') setValue(info.hijri || '');
        if (name === 'gregorianDate') setValue(info.gregorian || '');
    });
  };

  const registerDateField = (name: string, setFormValue: (value: string) => void) => {
    setFormFields(prev => ({ ...prev, [name]: setFormValue }));
    return () => {
      setFormFields(prev => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    };
  };

  return (
    <DateContext.Provider value={{ calendarType, dateInfo, setDate, registerDateField }}>
      {children}
    </DateContext.Provider>
  );
};

export const useDateContext = () => useContext(DateContext);