import { FormSection } from "@shared/modules/form-builder";

export const claimantSection: FormSection = {
  id: "claimant",
  title: "Claimant Details",
  fields: [
    {
      type: "radio",
      name: "claimantStatus",
      label: "Claimant Status",
      options: [
        { label: "Self", value: "self" },
        { label: "Representative", value: "representative" },
      ],
    },
    { type: "text", name: "claimantName", label: "Claimant Name" },
  ],
};

export const representativeSection: FormSection = {
  id: "representative",
  title: "Representative",
  fields: [
    { type: "text", name: "representativeName", label: "Representative Name" },
    {
      type: "select",
      name: "relationship",
      label: "Relationship",
      options: [
        { label: "Father", value: "father" },
        { label: "Mother", value: "mother" },
        { label: "Other", value: "other" },
      ],
    },
  ],
};
