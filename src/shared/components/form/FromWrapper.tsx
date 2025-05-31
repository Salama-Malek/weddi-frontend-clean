import React from "react";
import { FieldValues, UseFormHandleSubmit } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface FormWrapperProps<T extends FieldValues> {
  description?: string;
  onSubmit?: ReturnType<UseFormHandleSubmit<T>>;
  children?: React.ReactNode;
  isValid?: boolean;
}

const FormWrapper = <T extends FieldValues>({ 
  description, 
  onSubmit, 
  children,
  isValid = false 
}: FormWrapperProps<T>) => {
  const { t } = useTranslation("hearingdetails");

  return (
    <form onSubmit={onSubmit} className="space-y-6 mb-0">
      {children}
      <button 
        type="submit" 
        className={`px-4 py-2 rounded text-white ${
          isValid 
            ? 'bg-blue-500 hover:bg-blue-600' 
            : 'bg-gray-400 cursor-not-allowed'
        }`}
        disabled={!isValid}
      >
        Submit
      </button>
    </form>
  );
};

export default FormWrapper;