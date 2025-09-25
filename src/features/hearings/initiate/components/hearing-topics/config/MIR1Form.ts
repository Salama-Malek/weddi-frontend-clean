import { FormElement, Option } from "@/shared/components/form/form.types";

const requiresAdditionalFields = (requestType?: Option | null) => {
  if (!requestType) return false;
  return ["REQT1", "REQT2", "REQT3"].includes(String(requestType.value));
};

const requiresReasonAndCurrentLevel = (requestType?: Option | null) => {
  if (!requestType) return false;
  return String(requestType.value) === "REQT3";
};

export const getMIR1FormFields = ({
  t,
  typeOfRequest,
  setValue,
  TypeOfRequestLookUpOptions,
  isEditing,
  watch,
  editTopic,
  trigger,
}: any): FormElement[] => {
  const effectiveTypeOfRequest =
    watch("MIR1_typeOfRequest") ||
    typeOfRequest ||
    (isEditing && editTopic?.RequestType_Code
      ? {
          value: editTopic.RequestType_Code,
          label: editTopic.RequestType || editTopic.TypeOfRequest,
        }
      : null);

  const needsAdditionalFields = requiresAdditionalFields(
    effectiveTypeOfRequest,
  );
  const needsReasonAndCurrentLevel = requiresReasonAndCurrentLevel(
    effectiveTypeOfRequest,
  );

  const baseFields: FormElement[] = [
    {
      type: "autocomplete" as const,
      name: "MIR1_typeOfRequest",
      label: t("typeOfRequest"),
      options: TypeOfRequestLookUpOptions,
      value: watch("MIR1_typeOfRequest") || typeOfRequest,
      onChange: (option: Option | null) => {
        setValue("MIR1_typeOfRequest", option);

        if (!requiresAdditionalFields(option)) {
          setValue("MIR1_requiredDegreeOfInsurance", "");
        }
        if (!requiresReasonAndCurrentLevel(option)) {
          setValue("MIR1_theReason", "");
          setValue("MIR1_currentInsuranceLevel", "");
        }

        if (typeof trigger === "function") {
          trigger([
            "MIR1_requiredDegreeOfInsurance",
            "MIR1_theReason",
            "MIR1_currentInsuranceLevel",
          ]);
        }
      },
      validation: { required: t("fieldRequired") },
      notRequired: false,
    },
  ];

  if (needsAdditionalFields) {
    baseFields.push({
      type: "input" as const,
      name: "MIR1_requiredDegreeOfInsurance",
      label: t("requiredDegreeOfInsurance"),
      inputType: "text" as const,
      value: watch("MIR1_requiredDegreeOfInsurance") || "",
      onChange: (value: string) =>
        setValue("MIR1_requiredDegreeOfInsurance", value),
      validation: { required: t("fieldRequired") },
      notRequired: false,
      maxLength: 50,
    });
  }

  if (needsReasonAndCurrentLevel) {
    baseFields.push(
      {
        type: "input" as const,
        name: "MIR1_theReason",
        label: t("reason"),
        inputType: "textarea" as const,
        value: watch("MIR1_theReason") || "",
        onChange: (value: string) => setValue("MIR1_theReason", value),
        validation: { required: t("fieldRequired") },
        notRequired: false,
        maxLength: 100,
      },
      {
        type: "input" as const,
        name: "MIR1_currentInsuranceLevel",
        label: t("currentInsuranceLevel"),
        inputType: "text" as const,
        value: watch("MIR1_currentInsuranceLevel") || "",
        onChange: (value: string) =>
          setValue("MIR1_currentInsuranceLevel", value),
        validation: { required: t("fieldRequired") },
        notRequired: false,
        maxLength: 50,
      },
    );
  }

  return baseFields;
};
