import React from "react";
import { FieldValues, UseFormHandleSubmit } from "react-hook-form";

interface FormWrapperProps<T extends FieldValues> {
  description?: string;
  onSubmit?: ReturnType<UseFormHandleSubmit<T>>;
  children?: React.ReactNode;
  isValid?: boolean;
  preventEnterSubmit?: boolean;
  showSubmitButton?: boolean;
}

const FormWrapper = <T extends FieldValues>({
  onSubmit,
  children,
  isValid = false,
  preventEnterSubmit = true,
  showSubmitButton = true,
}: FormWrapperProps<T>) => {

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (preventEnterSubmit) {
      const target = e.target as HTMLFormElement;
      const activeElement = document.activeElement;

      if (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA") &&
        activeElement.closest("form") === target
      ) {
        e.preventDefault();
        return;
      }
    }

    if (onSubmit) {
      onSubmit(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (preventEnterSubmit && e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      onKeyDown={handleKeyDown}
      className="space-y-6 mb-0"
    >
      {children}
      {showSubmitButton && (
        <button
          type="submit"
          className={`px-4 py-2 rounded text-white ${
            isValid
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={!isValid}
        >
          Submit
        </button>
      )}
    </form>
  );
};

export default FormWrapper;
