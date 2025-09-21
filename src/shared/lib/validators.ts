export type DecimalValidationOptions = {
  maxFractionDigits?: number;
  min?: number;
  max?: number;
  decimalSeparators?: Array<"." | ",">;
  allowPercent?: boolean;
};

export type CreateDecimalRuleOptions = DecimalValidationOptions & {
  required?: boolean | string;
  errorMessage?: string;
  rangeErrorMessage?: string;
};

const DEFAULT_DECIMAL_SEPARATORS: Array<"." | ","> = [".", ","];

/**
 * Normalizes a decimal string by converting allowed separators to '.' and removing invalid chars.
 * Returns an empty string if input is falsy after trim.
 */
export function normalizeDecimal(
  value: string,
  options?: Pick<DecimalValidationOptions, "decimalSeparators" | "allowPercent">
): string {
  const separators = options?.decimalSeparators ?? DEFAULT_DECIMAL_SEPARATORS;
  if (!value) return "";
  const trimmed = String(value).trim();
  if (!trimmed) return "";

  let result = "";
  let hasSeparator = false;
  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (options?.allowPercent && ch === "%") {
      continue;
    }
    if (ch >= "0" && ch <= "9") {
      result += ch;
      continue;
    }
    if (!hasSeparator && separators.includes(ch as any)) {
      result += ".";
      hasSeparator = true;
      continue;
    }
  }
  return result;
}

export function validateNonNegativeInteger(value: string): boolean {
  if (value == null || String(value).trim() === "") return true;
  return /^\d+$/.test(String(value).trim());
}

export function validateNonNegativeDecimal(
  value: string,
  options?: Pick<
    DecimalValidationOptions,
    "maxFractionDigits" | "decimalSeparators" | "allowPercent"
  >
): boolean {
  if (value == null || String(value).trim() === "") return true;
  const normalized = normalizeDecimal(String(value), {
    decimalSeparators: options?.decimalSeparators,
    allowPercent: options?.allowPercent,
  });
  const { maxFractionDigits } = options || {};
  const pattern =
    maxFractionDigits != null
      ? new RegExp(`^\\d+(?:\\.\\d{0,${Math.max(0, maxFractionDigits)}})?$`)
      : /^\d+(?:\.\d+)?$/;
  return pattern.test(normalized);
}

export function validateRange(
  value: string,
  options?: Pick<
    DecimalValidationOptions,
    "min" | "max" | "decimalSeparators" | "allowPercent"
  >
): boolean {
  if (value == null || String(value).trim() === "") return true;
  const normalized = normalizeDecimal(String(value), {
    decimalSeparators: options?.decimalSeparators,
    allowPercent: options?.allowPercent,
  });
  if (normalized === "" || normalized === ".") return false;
  const num = Number(normalized);
  if (Number.isNaN(num)) return false;
  if (options?.min != null && num < options.min) return false;
  if (options?.max != null && num > options.max) return false;
  return true;
}

export function createDecimalValidation(opts?: CreateDecimalRuleOptions) {
  const requiredRule = opts?.required ?? false;
  const errorMessage = opts?.errorMessage || "Invalid number";
  const rangeErrorMessage = opts?.rangeErrorMessage || "Out of allowed range";
  const { maxFractionDigits, min, max, decimalSeparators, allowPercent } =
    opts || {};

  return {
    required: requiredRule,
    validate: (value: string) => {
      if (requiredRule && typeof requiredRule === "string") {
        if (value == null || String(value).trim() === "") {
          return requiredRule;
        }
      }
      if (
        !validateNonNegativeDecimal(value, {
          maxFractionDigits,
          decimalSeparators,
          allowPercent,
        })
      ) {
        return errorMessage;
      }
      if (
        !validateRange(value, { min, max, decimalSeparators, allowPercent })
      ) {
        return rangeErrorMessage;
      }
      return true;
    },
  } as const;
}
