import React from "react";
import { InputField, InputFieldProps } from "./InputField";

interface FileNumberInputProps
  extends Omit<InputFieldProps, "preventEnterSubmit"> {
  onFileNumberSubmit?: (value: string) => void;
}

/**
 * Specialized input component for file numbers that prevents form submission on Enter
 * and optionally provides a callback for custom Enter key handling
 */
export const FileNumberInput = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  FileNumberInputProps
>(({ onFileNumberSubmit, onKeyDown, ...props }, ref) => {
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();

      if (onFileNumberSubmit && e.target instanceof HTMLInputElement) {
        onFileNumberSubmit(e.target.value);
      }

      return;
    }

    if (onKeyDown) {
      onKeyDown(e as React.KeyboardEvent<HTMLInputElement>);
    }
  };

  return (
    <InputField
      {...props}
      ref={ref}
      preventEnterSubmit={true}
      onKeyDown={handleKeyDown}
    />
  );
});

FileNumberInput.displayName = "FileNumberInput";
