import { useEffect, useMemo, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  validateMultipleDateRanges,
  COMMON_DATE_RANGE_PAIRS,
} from "@/shared/lib/dateValidationUtils";

export const useDateRangeValidation = () => {
  const {
    setError,
    clearErrors,
    formState: { errors },
    trigger,
  } = useFormContext();
  const { t } = useTranslation();
  const { t: tCommon } = useTranslation("common");
  const previousValuesRef = useRef<Record<string, any>>({});
  const isProcessingRef = useRef(false);
  const lastValidationResultRef = useRef<Record<string, string>>({});

  const fieldNames = useMemo(
    () =>
      COMMON_DATE_RANGE_PAIRS.flatMap(({ fromDateName, toDateName }) => [
        fromDateName,
        toDateName,
      ]),
    []
  );
  const watchedValues = useWatch({ name: fieldNames });

  const formValues = useMemo(() => {
    const values: Record<string, any> = {};
    fieldNames.forEach((name, index) => {
      values[name] = watchedValues?.[index];
    });
    return values;
  }, [watchedValues, fieldNames]);

  useEffect(() => {
    if (isProcessingRef.current) {
      return;
    }

    isProcessingRef.current = true;

    try {
      const changedFields: string[] = [];
      COMMON_DATE_RANGE_PAIRS.forEach(({ fromDateName, toDateName }) => {
        const prevFrom = previousValuesRef.current[fromDateName];
        const prevTo = previousValuesRef.current[toDateName];
        const currentFrom = formValues[fromDateName];
        const currentTo = formValues[toDateName];

        if (prevFrom !== currentFrom || prevTo !== currentTo) {
          if (prevFrom !== currentFrom) changedFields.push(fromDateName);
          if (prevTo !== currentTo) changedFields.push(toDateName);
        }
      });

      const hasCompletePairs = COMMON_DATE_RANGE_PAIRS.some(
        ({ fromDateName, toDateName }) => {
          return formValues[fromDateName] && formValues[toDateName];
        }
      );

      if (hasCompletePairs && changedFields.length > 0) {
        const relevantPairs = COMMON_DATE_RANGE_PAIRS.filter(({ toDateName }) =>
          changedFields.includes(toDateName)
        );

        if (relevantPairs.length > 0) {
          const dateRangeErrors = validateMultipleDateRanges(
            formValues,
            relevantPairs
          );

          relevantPairs.forEach(({ toDateName }) => {
            clearErrors(toDateName);
          });

          Object.entries(dateRangeErrors).forEach(([fieldName, errorKey]) => {
            let errorMessage: string;
            if (errorKey === "common.date_validation.to_date_before_from") {
              errorMessage = tCommon("date_validation.to_date_before_from");
            } else if (
              errorKey === "common.date_validation.invalid_date_range"
            ) {
              errorMessage = tCommon("date_validation.invalid_date_range");
            } else {
              errorMessage = errorKey;
            }

            try {
              setError(fieldName, {
                type: "manual",
                message: errorMessage,
              });
            } catch (error) {}

            lastValidationResultRef.current[fieldName] = errorMessage;
          });

          if (Object.keys(dateRangeErrors).length > 0) {

            setTimeout(async () => {
              try {
              } catch (error) {}
            }, 50);
          }

          previousValuesRef.current = { ...formValues };
          return;
        }
      }

      if (!hasCompletePairs) {
        COMMON_DATE_RANGE_PAIRS.forEach(({ toDateName }) => {
          if (errors[toDateName]?.type === "validate") {
            clearErrors(toDateName);
          }
        });

        lastValidationResultRef.current = {};
      }

      previousValuesRef.current = { ...formValues };
    } finally {
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 100);
    }
  }, [formValues, errors, clearErrors, setError, t, tCommon, trigger]);

  const validateSpecificDateRange = (
    fromDateName: string,
    toDateName: string,
    fromDateType: "hijri" | "gregorian" = "hijri",
    toDateType: "hijri" | "gregorian" = "hijri"
  ) => {
    const fromDate = formValues[fromDateName];
    const toDate = formValues[toDateName];

    if (fromDate && toDate) {
      const { validateDateRange } = require("@/shared/lib/dateValidationUtils");
      const validationResult = validateDateRange(
        fromDate,
        toDate,
        fromDateType,
        toDateType
      );

      if (validationResult !== true) {
        setError(toDateName, {
          type: "validate",
          message: t(validationResult),
        });
        return false;
      } else {
        clearErrors(toDateName);
        return true;
      }
    }

    return true;
  };

  const clearDateRangeErrors = () => {
    COMMON_DATE_RANGE_PAIRS.forEach(({ toDateName }) => {
      if (errors[toDateName]?.type === "validate") {
        clearErrors(toDateName);
      }
    });
    lastValidationResultRef.current = {};
  };

  return {
    validateSpecificDateRange,
    clearDateRangeErrors,
    hasDateRangeErrors: Object.keys(errors).some((key) =>
      COMMON_DATE_RANGE_PAIRS.some((pair) => pair.toDateName === key)
    ),
  };
};
