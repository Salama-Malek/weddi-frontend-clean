import React from "react";
import FieldRenderer from "./FieldRenderer";
import { FormSection } from "./types";

interface FormBuilderProps {
  sections: FormSection[];
}

export const FormBuilder: React.FC<FormBuilderProps> = ({ sections }) => {
  return (
    <>
      {sections.map((section) => (
        <div key={section.id} className="space-y-4 mb-6">
          {section.title && (
            <h3 className="text-lg font-medium">{section.title}</h3>
          )}
          {section.fields.map((field) => (
            <FieldRenderer key={field.name} field={field} />
          ))}
        </div>
      ))}
    </>
  );
};

export default FormBuilder;
