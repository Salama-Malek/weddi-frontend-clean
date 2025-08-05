import { FormElement, Option } from "@shared/components/form/form.types";

// Utility function to check if request type requires additional fields
const requiresAdditionalFields = (requestType?: Option | null) => {
  if (!requestType) return false;
  return ["REQT1", "REQT2", "REQT3"].includes(String(requestType.value));
};

// Utility function to check if request type requires reason and current level
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
  trigger
}: any): FormElement[] => {
  const requiredDegreeOfInsurance = watch("MIR1_requiredDegreeOfInsurance") || watch("requiredDegreeOfInsurance");
  const currentInsuranceLevel = watch("MIR1_currentInsuranceLevel") || watch("currentInsuranceLevel");
  const theReason = watch("MIR1_theReason") || watch("theReason");

  // Always use the current watched value for reactivity, fallback to editTopic only if not set
  const effectiveTypeOfRequest = watch("MIR1_typeOfRequest") || typeOfRequest || (isEditing && editTopic?.RequestType_Code ? {
    value: editTopic.RequestType_Code,
    label: editTopic.RequestType || editTopic.TypeOfRequest
  } : null);

  // Determine which fields are needed based on the request type
  const needsAdditionalFields = requiresAdditionalFields(effectiveTypeOfRequest);
  const needsReasonAndCurrentLevel = requiresReasonAndCurrentLevel(effectiveTypeOfRequest);
  
  // Debug logging
  // console.log('[🔧 MIR-1 FORM] effectiveTypeOfRequest:', effectiveTypeOfRequest);
  // console.log('[🔧 MIR-1 FORM] needsAdditionalFields:', needsAdditionalFields);
  // console.log('[🔧 MIR-1 FORM] needsReasonAndCurrentLevel:', needsReasonAndCurrentLevel);

  // Custom validation for requiredDegreeOfInsurance
  const requiredDegreeValidation = {
    validate: (value: any) => {
      if (needsAdditionalFields) {
        // Handle different value types safely
        if (value === null || value === undefined) {
          return t("fieldRequired");
        }
        if (typeof value === 'string') {
          return value.trim().length > 0 || t("fieldRequired");
        }
        if (typeof value === 'number') {
          return value.toString().trim().length > 0 || t("fieldRequired");
        }
        // For objects or other types, convert to string and check
        return String(value).trim().length > 0 || t("fieldRequired");
      }
      return true;
    },
  };

  // Custom validation for theReason
  const reasonValidation = {
    validate: (value: any) => {
      if (needsReasonAndCurrentLevel) {
        // Handle different value types safely
        if (value === null || value === undefined) {
          return t("fieldRequired");
        }
        if (typeof value === 'string') {
          return value.trim().length > 0 || t("fieldRequired");
        }
        if (typeof value === 'number') {
          return value.toString().trim().length > 0 || t("fieldRequired");
        }
        // For objects or other types, convert to string and check
        return String(value).trim().length > 0 || t("fieldRequired");
      }
      return true;
    },
  };

  // Custom validation for currentInsuranceLevel
  const currentLevelValidation = {
    validate: (value: any) => {
      if (needsReasonAndCurrentLevel) {
        // Handle different value types safely
        if (value === null || value === undefined) {
          return t("fieldRequired");
        }
        if (typeof value === 'string') {
          return value.trim().length > 0 || t("fieldRequired");
        }
        if (typeof value === 'number') {
          return value.toString().trim().length > 0 || t("fieldRequired");
        }
        // For objects or other types, convert to string and check
        return String(value).trim().length > 0 || t("fieldRequired");
      }
      return true;
    },
  };

  const baseFields: FormElement[] = [
    {
      type: "autocomplete" as const,
      name: "MIR1_typeOfRequest",
      label: t("typeOfRequest"),
      options: TypeOfRequestLookUpOptions,
      value: watch("MIR1_typeOfRequest") || typeOfRequest,
      onChange: (option: Option | null) => {
        // console.log('[🔧 MIR-1 FORM] onChange triggered with option:', option);
        setValue("MIR1_typeOfRequest", option);
        // Clear dependent fields when request type changes
        if (!requiresAdditionalFields(option)) {
          // console.log('[🔧 MIR-1 FORM] Clearing MIR1_requiredDegreeOfInsurance');
          setValue("MIR1_requiredDegreeOfInsurance", "");
        }
        if (!requiresReasonAndCurrentLevel(option)) {
          // console.log('[🔧 MIR-1 FORM] Clearing MIR1_theReason and MIR1_currentInsuranceLevel');
          setValue("MIR1_theReason", "");
          setValue("MIR1_currentInsuranceLevel", "");
        }
        // Trigger validation for dependent fields
        if (typeof trigger === 'function') {
          trigger(["MIR1_requiredDegreeOfInsurance", "MIR1_theReason", "MIR1_currentInsuranceLevel"]);
        }
      },
      validation: { required: t("fieldRequired") },
      notRequired: false,
    }
  ];

  // Add conditional fields based on request type
  if (needsAdditionalFields) {
    // console.log('[🔧 MIR-1 FORM] Adding MIR1_requiredDegreeOfInsurance field');
    baseFields.push({
      type: "input" as const,
      name: "MIR1_requiredDegreeOfInsurance",
      label: t("requiredDegreeOfInsurance"),
      inputType: "number" as const,
      value: watch("MIR1_requiredDegreeOfInsurance") || "",
      onChange: (value: string) => setValue("MIR1_requiredDegreeOfInsurance", value),
      validation: requiredDegreeValidation,
      notRequired: false,
    });
  }

  if (needsReasonAndCurrentLevel) {
    // console.log('[🔧 MIR-1 FORM] Adding MIR1_theReason and MIR1_currentInsuranceLevel fields');
    baseFields.push(
      {
        type: "input" as const,
        name: "MIR1_theReason",
        label: t("reason"),
        inputType: "textarea" as const,
        value: watch("MIR1_theReason") || "",
        onChange: (value: string) => setValue("MIR1_theReason", value),
        validation: reasonValidation,
        notRequired: false,
      },
      {
        type: "input" as const,
        name: "MIR1_currentInsuranceLevel",
        label: t("currentInsuranceLevel"),
        inputType: "number" as const,
        value: watch("MIR1_currentInsuranceLevel") || "",
        onChange: (value: string) => setValue("MIR1_currentInsuranceLevel", value),
        validation: currentLevelValidation,
        notRequired: false,
      }
    );
  }
  // Note: Field clearing is now handled by the dynamic field registration useEffect
  // in the main component to avoid render-time setValue calls

  // console.log('[🔧 MIR-1 FORM] Returning fields:', baseFields.map(f => (f as any).name || f.type));
  return baseFields;
};