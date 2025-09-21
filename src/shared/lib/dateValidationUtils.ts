import { formatDateString } from "./helpers";

/**
 * Validates that a to date is not before the from date
 * @param fromDate - The start date (can be hijri or gregorian)
 * @param toDate - The end date (can be hijri or gregorian)
 * @param fromDateType - Type of from date ('hijri' or 'gregorian')
 * @param toDateType - Type of to date ('hijri' or 'gregorian')
 * @returns true if valid, error message if invalid
 */
export const validateDateRange = (
  fromDate: string | undefined,
  toDate: string | undefined,
  fromDateType: 'hijri' | 'gregorian' = 'hijri',
  toDateType: 'hijri' | 'gregorian' = 'hijri'
): true | string => {
  
  if (!fromDate || !toDate) {
    return true;
  }

  try {
    let fromDateObj: Date;
    let toDateObj: Date;

    if (fromDateType === 'hijri') {
      
      const gregorianFrom = formatDateString(fromDate);
      fromDateObj = gregorianFrom ? new Date(gregorianFrom) : new Date(fromDate);
    } else {
      fromDateObj = new Date(fromDate);
    }

    if (toDateType === 'hijri') {
      
      const gregorianTo = formatDateString(toDate);
      toDateObj = gregorianTo ? new Date(gregorianTo) : new Date(toDate);
    } else {
      toDateObj = new Date(toDate);
    }

    
    if (isNaN(fromDateObj.getTime()) || isNaN(toDateObj.getTime())) {
      return true; 
    }

    
    if (toDateObj < fromDateObj) {
      return 'common.date_validation.to_date_before_from';
    }

    return true;
  } catch (error) {
    
    return true;
  }
};

/**
 * Creates validation rules for date range fields
 * @param fromDateName - Name of the from date field
 * @param toDateName - Name of the to date field
 * @param fromDateType - Type of from date ('hijri' or 'gregorian')
 * @param toDateType - Type of to date ('hijri' or 'gregorian')
 * @returns Validation rules object
 */
export const createDateRangeValidation = (
  fromDateName: string,
  toDateName: string,
  fromDateType: 'hijri' | 'gregorian' = 'hijri',
  toDateType: 'hijri' | 'gregorian' = 'hijri'
) => ({
  validate: (formValues: any) => {
    const fromDate = formValues[fromDateName];
    const toDate = formValues[toDateName];
    
    return validateDateRange(fromDate, toDate, fromDateType, toDateType);
  }
});

/**
 * Validates multiple date range pairs in a form
 * @param formValues - All form values
 * @param dateRangePairs - Array of date range field pairs to validate
 * @returns Object with validation results
 */
export const validateMultipleDateRanges = (
  formValues: any,
  dateRangePairs: Array<{
    fromDateName: string;
    toDateName: string;
    fromDateType?: 'hijri' | 'gregorian';
    toDateType?: 'hijri' | 'gregorian';
  }>
) => {
  const errors: Record<string, string> = {};

  dateRangePairs.forEach(({ fromDateName, toDateName, fromDateType = 'hijri', toDateType = 'hijri' }) => {
    const fromDate = formValues[fromDateName];
    const toDate = formValues[toDateName];

    if (fromDate && toDate) {
      const validationResult = validateDateRange(fromDate, toDate, fromDateType, toDateType);
      if (validationResult !== true) {
        errors[toDateName] = validationResult;
      }
    }
  });

  return errors;
};

/**
 * Common date range field pairs used throughout the application
 */
export const COMMON_DATE_RANGE_PAIRS: Array<{
  fromDateName: string;
  toDateName: string;
  fromDateType: 'hijri' | 'gregorian';
  toDateType: 'hijri' | 'gregorian';
}> = [
  
  { fromDateName: 'from_date_hijri', toDateName: 'to_date_hijri', fromDateType: 'hijri', toDateType: 'hijri' },
  { fromDateName: 'from_date_gregorian', toDateName: 'to_date_gregorian', fromDateType: 'gregorian', toDateType: 'gregorian' },
  
  
  { fromDateName: 'WR1_fromDateHijri', toDateName: 'WR1_toDateHijri', fromDateType: 'hijri', toDateType: 'hijri' },
  { fromDateName: 'WR1_fromDateGregorian', toDateName: 'WR1_toDateGregorian', fromDateType: 'gregorian', toDateType: 'gregorian' },
  { fromDateName: 'WR2_fromDateHijri', toDateName: 'WR2_toDateHijri', fromDateType: 'hijri', toDateType: 'hijri' },
  { fromDateName: 'WR2_fromDateGregorian', toDateName: 'WR2_toDateGregorian', fromDateType: 'gregorian', toDateType: 'gregorian' },
  
  
  { fromDateName: 'BPSR1_fromDateHijri', toDateName: 'BPSR1_toDateHijri', fromDateType: 'hijri', toDateType: 'hijri' },
  { fromDateName: 'BPSR1_fromDateGregorian', toDateName: 'BPSR1_toDateGregorian', fromDateType: 'gregorian', toDateType: 'gregorian' },
  
  
  { fromDateName: 'CMR6_fromDateHijri', toDateName: 'CMR6_toDateHijri', fromDateType: 'hijri', toDateType: 'hijri' },
  { fromDateName: 'CMR6_fromDateGregorian', toDateName: 'CMR6_toDateGregorian', fromDateType: 'gregorian', toDateType: 'gregorian' },
  { fromDateName: 'CMR7_fromDateHijri', toDateName: 'CMR7_toDateHijri', fromDateType: 'hijri', toDateType: 'hijri' },
  { fromDateName: 'CMR7_fromDateGregorian', toDateName: 'CMR7_toDateGregorian', fromDateType: 'gregorian', toDateType: 'gregorian' },
  { fromDateName: 'CMR8_fromDateHijri', toDateName: 'CMR8_toDateHijri', fromDateType: 'hijri', toDateType: 'hijri' },
  { fromDateName: 'CMR8_fromDateGregorian', toDateName: 'CMR8_toDateGregorian', fromDateType: 'gregorian', toDateType: 'gregorian' },
  
  
  { fromDateName: 'Plaintiff_ContractStartDate', toDateName: 'Plaintiff_ContractEndDate', fromDateType: 'gregorian', toDateType: 'gregorian' },
  { fromDateName: 'Plaintiff_ContractStartDateHijri', toDateName: 'Plaintiff_ContractEndDateHijri', fromDateType: 'hijri', toDateType: 'hijri' },
  { fromDateName: 'Defendant_ContractStartDate', toDateName: 'Defendant_ContractEndDate', fromDateType: 'gregorian', toDateType: 'gregorian' },
  { fromDateName: 'Defendant_ContractStartDateHijri', toDateName: 'Defendant_ContractEndDateHijri', fromDateType: 'hijri', toDateType: 'hijri' },
  
  
  { fromDateName: 'Plaintiff_JobStartDate', toDateName: 'Plaintiff_JobEndDate', fromDateType: 'gregorian', toDateType: 'gregorian' },
  { fromDateName: 'Plaintiff_JobStartDateHijri', toDateName: 'Plaintiff_JobEndDateHijri', fromDateType: 'hijri', toDateType: 'hijri' },
  { fromDateName: 'Defendant_JobStartDate', toDateName: 'Defendant_JobEndDate', fromDateType: 'gregorian', toDateType: 'gregorian' },
  { fromDateName: 'Defendant_JobStartDateHijri', toDateName: 'Defendant_JobEndDateHijri', fromDateType: 'hijri', toDateType: 'hijri' },
];
