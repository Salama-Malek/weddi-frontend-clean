export type TextField = {
  type: "text";
  name: string;
  label: string;
  inputType?: string;
};

export type SelectField = {
  type: "select";
  name: string;
  label: string;
  options: { label: string; value: string }[];
};

export type RadioField = {
  type: "radio";
  name: string;
  label: string;
  options: { label: string; value: string }[];
};

export type FieldConfig = TextField | SelectField | RadioField;

export interface FormSection {
  id: string;
  title?: string;
  fields: FieldConfig[];
}
