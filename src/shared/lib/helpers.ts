import { useMemo } from "react";
import { DateObject } from "react-multi-date-picker";
 
// Map Arabic-Indic digits to ASCII
const ARABIC_INDIC_DIGITS: Record<string, string> = {
  "٠": "0","١": "1","٢": "2","٣": "3","٤": "4",
  "٥": "5","٦": "6","٧": "7","٨": "8","٩": "9"
};
function toAsciiDigits(input: string): string {
  return input.replace(/[٠-٩]/g, d => ARABIC_INDIC_DIGITS[d] || d);
}
 
// CLDR full names and Safari abbreviations for Hijri months
const HIJRI_MONTHS: Record<string, string> = {
  // Full CLDR names:
  "محرم": "01", "صفر": "02", "ربيع الأول": "03", "ربيع الآخر": "04",
  "جمادى الأولى": "05", "جمادى الآخرة": "06", "رجب": "07", "شعبان": "08",
  "رمضان": "09", "شوال": "10", "ذو القعدة": "11", "ذو الحجة": "12",
  // Safari numeric abbreviations:
  "جما١": "05", "جما٢": "06"
};
 
function normalizeHijriString(str: string): string {
  let s = str;
  // Replace month names/abbrev
  for (const [name, num] of Object.entries(HIJRI_MONTHS)) {
    s = s.replace(new RegExp(name, 'g'), num);
  }
  // Convert digits and strip non-digits
  s = toAsciiDigits(s).replace(/[^0-9]/g, '');
  if (!/^\d{8}$/.test(s)) {
    throw new Error(`Cannot normalize Hijri "${str}" → "${s}"`);
  }
  return s;
}
 
/**
 * Convert any input (ASCII DD/MM/YYYY or Arabic-Indic/names) into
 * Hijri YYYYMMDD (or DD/MM/YYYY if friendlyFormat=true).
 */
export function toHijri_YYYYMMDD(
  dateString: string,
  friendlyFormat: boolean = false
): string {
  try {
    const raw = toAsciiDigits(dateString.trim());
    // Quick path: already Hijri
    if (/^14\d{6}$/.test(raw)) {
      const Y = raw.slice(0,4), M = raw.slice(4,6), D = raw.slice(6);
      return friendlyFormat ? `${D}/${M}/${Y}` : `${Y}${M}${D}`;
    }
    // Parse Gregorian
    const [d, m, y] = raw.split(/[\/\-\s]/).map(Number);
    if ([d,m,y].some(isNaN)) throw new Error('Invalid Gregorian input');
    const dt = new Date(Date.UTC(y, m-1, d));
    // ASCII Intl pass
    const parts = new Intl.DateTimeFormat('en-u-ca-islamic', {
      year: 'numeric', month: '2-digit', day: '2-digit', numberingSystem: 'latn', timeZone: 'UTC'
    }).formatToParts(dt);
    const yp = parts.find(p => p.type==='year')?.value;
    const mp = parts.find(p => p.type==='month')?.value;
    const dp = parts.find(p => p.type==='day')?.value;
    if (yp && mp && dp) {
      return friendlyFormat ? `${dp}/${mp}/${yp}` : `${yp}${mp}${dp}`;
    }
    // Safari fallback
    const arabic = new Intl.DateTimeFormat('ar-u-ca-islamic', {
      year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
    }).format(dt);
    const norm = normalizeHijriString(arabic);
    const Y2 = norm.slice(0,4), M2 = norm.slice(4,6), D2 = norm.slice(6);
    return friendlyFormat ? `${D2}/${M2}/${Y2}` : `${Y2}${M2}${D2}`;
  } catch {
    return dateString;
  }
}
 
export const getEnvVar = <T extends string | number | boolean>(
  key: string,
  defaultValue?: T
): T => {
  const value = import.meta.env[key];
  if (value == null) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Env var ${key} required but missing`);
  }
  if (typeof defaultValue === 'number') return Number(value) as T;
  if (typeof defaultValue === 'boolean') return (value === 'true') as T;
  return value as T;
};
 
export function isObjectWithData(value: unknown): value is Record<string, unknown> {
  return typeof value==='object' && value!=null && !Array.isArray(value) && Object.keys(value).length>0;
}
export function isObjectEmpty(value: unknown): boolean {
  return typeof value==='object' && value!=null && !Array.isArray(value) && Object.keys(value).length===0;
}
export function isArrayWithData(value: unknown): value is Array<unknown> { return Array.isArray(value)&&value.length>0; }
export function isArray(value: unknown): value is Array<unknown> { return Array.isArray(value); }
export function isNotArray(value: unknown): boolean { return !Array.isArray(value); }
 
export type OptionMapperParams = { data?: any[]; valueKey?: string; labelKey?: string };
export const mapToOptions = ({ data=[], valueKey='ElementKey', labelKey='ElementValue' }: OptionMapperParams) =>
  data.map(item => ({ value: item[valueKey], label: item[labelKey] }));
 
interface BaseFieldProps { name: string; label: string; readOnly?: boolean; }
interface InputFieldProps extends BaseFieldProps { placeholder?: string; inputType?: string; validation?: any; }
interface AutocompleteFieldProps extends BaseFieldProps { options: any[]; value: any; onChange: (v:any)=>void; }
const getFieldType=(def:string,ro?:boolean)=>ro?'readonly':def;
export const createInputField = ({ name, label, placeholder, inputType='text', validation={}, readOnly=false }: InputFieldProps) => ({
  type: getFieldType(inputType==='dateOfBirth'?'readonly':'input',readOnly), name, label, placeholder, inputType, validation, readOnly
});
export const createAutocompleteField = ({ name, label, options, value, onChange, readOnly=false }: AutocompleteFieldProps) => ({
  type: getFieldType('autocomplete', readOnly), name, label, options, value, onChange, readOnly
});
 
export function useLoadingStates<T extends Record<string,boolean>>(states:T):T {
  return useMemo(() => states, Object.values(states));
}
 
/**
 * Converts a compact Hijri date string (YYYYMMDD) to formatted date (MM/DD/YYYY)
 */
export function formatHijriDate(compact:string):string {
  if (!compact||compact.length!==8) return compact;
  const y=compact.slice(0,4), m=compact.slice(4,6), d=compact.slice(6);
  return `${m}/${d}/${y}`;
}
 
export function formatDateToYYYYMMDD(dateString:string):string {
  if (!dateString) return '';
  try { return new DateObject(dateString).format('YYYYMMDD'); }
  catch { return dateString; }
}
 
export function formatDateGMT(inputDate: string | null | undefined): string {
  if (!inputDate) return '---:---';
  const year=inputDate.slice(0,4), month=inputDate.slice(4,6), day=inputDate.slice(6,8);
  const hour=inputDate.slice(9,11), minute=inputDate.slice(11,13);
  const dt=new Date(`${year}-${month}-${day}T${hour}:${minute}:00.000Z`);
  return dt.toLocaleString('en-US',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',timeZone:'GMT',timeZoneName:'short'});
}
 
 
 
export const formatDateString = (raw: string | undefined | null): string => {
  if (!raw || raw.length !== 8) return "";
  const year = raw.slice(0, 4);
  const month = raw.slice(4, 6);
  const day = raw.slice(6, 8);
  return `${year}/${month}/${day}`;
};