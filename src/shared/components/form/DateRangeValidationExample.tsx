import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { HijriDatePickerInput } from "@/shared/components/calanders/HijriDatePickerInput";
import { GregorianDateDisplayInput } from "@/shared/components/calanders/GregorianDateDisplayInput";
import { createDateRangeValidation } from "@/shared/lib/dateValidationUtils";
import { useDateRangeValidation } from "@/shared/hooks/useDateRangeValidation";
import gregorianCalendar from "react-date-object/calendars/gregorian";
import gregorianLocale from "react-date-object/locales/gregorian_en";

/**
 * Example component demonstrating date range validation
 * This shows how to implement validation for from/to date pairs
 */
export const DateRangeValidationExample: React.FC = () => {
  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      from_date_hijri: "",
      from_date_gregorian: "",
      to_date_hijri: "",
      to_date_gregorian: "",
      WR1_fromDateHijri: "",
      WR1_fromDateGregorian: "",
      WR1_toDateHijri: "",
      WR1_toDateGregorian: "",
    },
  });

  const { hasDateRangeErrors, clearDateRangeErrors } = useDateRangeValidation();

  const handleHijriDateChange = (
    date: any,
    onChange: (value: string) => void,
    gregorianFieldName: string,
  ) => {
    if (date) {
      const hijri = date.format("YYYY/MM/DD");
      const hijriStorage = hijri.replace(/\//g, "");
      onChange(hijriStorage);

      const gregorian = date.convert(gregorianCalendar, gregorianLocale);
      const gregorianStorage = gregorian
        .format("YYYY/MM/DD")
        .replace(/\//g, "");
      methods.setValue(gregorianFieldName as any, gregorianStorage);
    }
  };

  const onSubmit = (_data: any) => {
    if (hasDateRangeErrors) {
      alert("Please fix date range errors before submitting");
      return;
    }
    alert("Form submitted successfully!");
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6 p-6">
        <h2 className="text-xl font-semibold mb-4">
          Date Range Validation Example
        </h2>

        {/* Basic from/to date fields */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Basic Date Range</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                From Date (Hijri)
              </label>
              <HijriDatePickerInput
                control={methods.control}
                name="from_date_hijri"
                label=""
                rules={{ required: "From date is required" }}
                onChangeHandler={(date, onChange) =>
                  handleHijriDateChange(date, onChange, "from_date_gregorian")
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                To Date (Hijri)
              </label>
              <HijriDatePickerInput
                control={methods.control}
                name="to_date_hijri"
                label=""
                rules={{
                  required: "To date is required",
                  ...createDateRangeValidation(
                    "from_date_hijri",
                    "to_date_hijri",
                    "hijri",
                    "hijri",
                  ),
                }}
                onChangeHandler={(date, onChange) =>
                  handleHijriDateChange(date, onChange, "to_date_gregorian")
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                From Date (Gregorian)
              </label>
              <GregorianDateDisplayInput
                control={methods.control}
                name="from_date_gregorian"
                label=""
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                To Date (Gregorian)
              </label>
              <GregorianDateDisplayInput
                control={methods.control}
                name="to_date_gregorian"
                label=""
              />
            </div>
          </div>
        </div>

        {/* Worker Rights date fields */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Worker Rights Date Range</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                WR1 From Date (Hijri)
              </label>
              <HijriDatePickerInput
                control={methods.control}
                name="WR1_fromDateHijri"
                label=""
                rules={{ required: "From date is required" }}
                onChangeHandler={(date, onChange) =>
                  handleHijriDateChange(date, onChange, "WR1_fromDateGregorian")
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                WR1 To Date (Hijri)
              </label>
              <HijriDatePickerInput
                control={methods.control}
                name="WR1_toDateHijri"
                label=""
                rules={{
                  required: "To date is required",
                  ...createDateRangeValidation(
                    "WR1_fromDateHijri",
                    "WR1_toDateHijri",
                    "hijri",
                    "hijri",
                  ),
                }}
                onChangeHandler={(date, onChange) =>
                  handleHijriDateChange(date, onChange, "WR1_toDateGregorian")
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                WR1 From Date (Gregorian)
              </label>
              <GregorianDateDisplayInput
                control={methods.control}
                name="WR1_fromDateGregorian"
                label=""
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                WR1 To Date (Gregorian)
              </label>
              <GregorianDateDisplayInput
                control={methods.control}
                name="WR1_toDateGregorian"
                label=""
              />
            </div>
          </div>
        </div>

        {/* Error display */}
        {hasDateRangeErrors && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Date Range Validation Errors
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Please fix the following date range issues:</p>
                  <ul className="list-disc list-inside mt-1">
                    <li>End date cannot be before start date</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={clearDateRangeErrors}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Clear Date Errors
          </button>

          <button
            type="submit"
            disabled={hasDateRangeErrors}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Form
          </button>
        </div>

        {/* Form state display */}
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <h4 className="font-medium mb-2">Form State:</h4>
          <pre className="text-xs text-gray-600">
            {JSON.stringify(
              {
                values: methods.watch(),
                errors: methods.formState.errors,
                hasDateRangeErrors,
                isValid: methods.formState.isValid,
              },
              null,
              2,
            )}
          </pre>
        </div>
      </form>
    </FormProvider>
  );
};

export default DateRangeValidationExample;
