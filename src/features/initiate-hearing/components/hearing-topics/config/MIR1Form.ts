import { FormElement, Option } from "@/shared/components/form/form.types";

export const getMIR1FormFields = ({
  t,
  typeOfRequest,
  setValue,
  TypeOfRequestLookUpOptions,
  isEditing,
  watch,
  editTopic
}: any): FormElement[] => {
  const requiredDegreeOfInsurance=watch("requiredDegreeOfInsurance")
  const currentInsuranceLevel=watch("currentInsuranceLevel")
  const theReason=watch("theReason")
  return [
    {
      type: "autocomplete" as const,
      name: "typeOfRequest",
      label: t("typeOfRequest"),
      options: TypeOfRequestLookUpOptions,
      value: typeOfRequest,
      onChange: (option: Option | null) => setValue("typeOfRequest", option),
      validation:{required:"Type of request is required"}
    },
    ...((typeOfRequest?.value === "REQT1" || typeOfRequest?.value === "REQT2") ? [
      {
        type: "input" as const,
        name: "requiredDegreeOfInsurance",
        label: t("requiredDegreeOfInsurance"),
        inputType: "number" as const,
        value: isEditing ? editTopic?.requiredDegreeOfInsurance : requiredDegreeOfInsurance,
        onChange: (value: string) => setValue("requiredDegreeOfInsurance", value),
      }
    ] : []),
    ...(typeOfRequest?.value === "REQT3" ? [
      {
        type: "input" as const,
        name: "theReason",
        label: t("reason"),
        inputType: "textarea" as const,
        value:  isEditing ? editTopic?.theReason : theReason,
        onChange: (value: string) => setValue("theReason", value),
      },
      {
        type: "input" as const,
        name: "currentInsuranceLevel",
        label: t("currentInsuranceLevel"),
        inputType: "number" as const,
        value: isEditing ? editTopic?.currentInsuranceLevel : currentInsuranceLevel,
        onChange: (value: string) => setValue("currentInsuranceLevel", value),
      },
      {
        type: "input" as const,
        name: "requiredDegreeOfInsurance",
        label: t("requiredDegreeOfInsurance"),
        inputType: "number" as const,
        value: isEditing ? editTopic?.requiredDegreeOfInsurance : requiredDegreeOfInsurance,
        onChange: (value: string) => setValue("requiredDegreeOfInsurance", value),
      }
    ] : [])
  ];
};