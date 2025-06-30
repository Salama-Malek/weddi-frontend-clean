/**
 * Formats a date string to yyyymmdd format by removing any separators
 * @param dateStr - The date string to format (e.g. "2024/03/21" or "2024-03-21")
 * @returns The formatted date string in yyyymmdd format (e.g. "20240321")
 */
export const formatDateToYYYYMMDD = (dateStr: string | undefined): string | undefined => {
  if (!dateStr) return undefined;
  // Remove any existing separators and ensure 8 digits
  return dateStr.replace(/[\/\-]/g, '');
};

/**
 * Formats a date string from yyyymmdd format to a display format with separators
 * @param dateStr - The date string in yyyymmdd format (e.g. "20240321")
 * @param separator - The separator to use (default: "/")
 * @returns The formatted date string with separators (e.g. "2024/03/21")
 */
export const formatDateFromYYYYMMDD = (dateStr: string | undefined, separator: string = "/"): string | undefined => {
  if (!dateStr || dateStr.length !== 8) return undefined;
  return `${dateStr.slice(0, 4)}${separator}${dateStr.slice(4, 6)}${separator}${dateStr.slice(6, 8)}`;
}; 