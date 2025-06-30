import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormProvider } from "@/providers/FormContext";
import useCaseTopicsPrefill from "./hooks/useCaseTopicsPrefill";
import { CaseTopicsPrefillService } from "../../services/caseTopicsPrefillService";
import { 
  dateFieldConfigs, 
  injuryDateFieldConfig, 
  managerialDecisionDateFieldConfig,
  requestDateFieldConfig 
} from "./config/dateFieldConfigs";
import { DynamicForm } from "@/shared/components/form/DynamicForm";

interface ExampleCaseTopicsProps {
  caseId?: string;
  isEditing?: boolean;
  existingTopics?: any[];
}

/**
 * Example component demonstrating how to use the case topics prefilling system
 * This shows how to integrate the prefilling mechanism into existing case topics forms
 */
const ExampleCaseTopics: React.FC<ExampleCaseTopicsProps> = ({
  caseId,
  isEditing = false,
  existingTopics = [],
}) => {
  const { t } = useTranslation("hearingdetails");
  const [currentTopic, setCurrentTopic] = useState<any>(null);
  const [selectedTopicType, setSelectedTopicType] = useState<string>("");

  // Form setup
  const formMethods = useForm({
    mode: "onChange",
    defaultValues: {
      mainCategory: null,
      subCategory: null,
      acknowledged: false,
      // Date fields with default empty values
      from_date_hijri: "",
      from_date_gregorian: "",
      to_date_hijri: "",
      to_date_gregorian: "",
      date_hijri: "",
      date_gregorian: "",
      injury_date_hijri: "",
      injury_date_gregorian: "",
      managerial_decision_date_hijri: "",
      managerial_decision_date_gregorian: "",
      request_date_hijri: "",
      request_date_gregorian: "",
      // Other fields
      amount: "",
      amountOfCompensation: "",
      wagesAmount: "",
      payDue: "",
      durationOfLeaveDue: "",
      injuryType: "",
      bonusAmount: "",
      otherCommission: "",
      damagedValue: "",
      requiredJobTitle: "",
      currentJobTitle: "",
      damagedType: "",
      currentInsuranceLevel: "",
      theReason: "",
      theWantedJob: "",
      currentPosition: "",
      loanAmount: "",
      amountRatio: "",
      managerialDecisionNumber: "",
      otherAllowance: "",
      typeOfCustody: "",
      consideration: "",
    },
  });

  const { setValue, watch, trigger } = formMethods;

  // Use the prefilling hook
  useCaseTopicsPrefill({
    setValue,
    trigger,
    caseTopics: existingTopics,
    isEditing,
    editTopic: currentTopic,
  });

  // Watch form values
  const mainCategory = watch("mainCategory");
  const subCategory = watch("subCategory");
  const from_date_hijri = watch("from_date_hijri");
  const to_date_hijri = watch("to_date_hijri");
  const injury_date_hijri = watch("injury_date_hijri");
  const managerial_decision_date_hijri = watch("managerial_decision_date_hijri");
  const request_date_hijri = watch("request_date_hijri");

  // Handle topic selection for editing
  const handleEditTopic = (topic: any) => {
    setCurrentTopic(topic);
    setSelectedTopicType(topic.SubTopicID);
  };

  // Build form layout based on selected topic type
  const buildFormLayout = () => {
    const baseFields = [
      {
        type: "autocomplete" as const,
        name: "mainCategory",
        label: t("mainCategory"),
        options: [], // Add your main category options here
        value: mainCategory,
        onChange: (value: any) => setValue("mainCategory", value),
        validation: { required: t("mainCategoryRequired") },
      },
      {
        type: "autocomplete" as const,
        name: "subCategory",
        label: t("subCategory"),
        options: [], // Add your sub category options here
        value: subCategory,
        onChange: (value: any) => setValue("subCategory", value),
        validation: { required: t("subCategoryRequired") },
      },
      {
        type: "checkbox" as const,
        name: "acknowledged",
        label: t("acknowledgeTerms"),
        checked: watch("acknowledged"),
        onChange: (checked: boolean) => setValue("acknowledged", checked),
        validation: { required: t("acknowledgeRequired") },
      },
    ];

    // Add topic-specific fields based on subCategory
    switch (selectedTopicType) {
      case "WR-1":
      case "WR-2":
      case "CMR-6":
      case "CMR-7":
      case "CMR-8":
      case "BPSR-1":
        return [
          ...baseFields,
          {
            type: "input" as const,
            name: "amount",
            label: t("amount"),
            inputType: "number",
            value: watch("amount"),
            onChange: (value: string) => setValue("amount", value),
            validation: { required: t("amountRequired") },
          },
          // Date range fields with prefilling support
          dateFieldConfigs(t, isEditing, from_date_hijri, to_date_hijri, currentTopic).fromDate,
          dateFieldConfigs(t, isEditing, from_date_hijri, to_date_hijri, currentTopic).toDate,
        ];

      case "CMR-3":
        return [
          ...baseFields,
          {
            type: "input" as const,
            name: "amount",
            label: t("compensationAmount"),
            inputType: "number",
            value: watch("amount"),
            onChange: (value: string) => setValue("amount", value),
            validation: { required: t("amountRequired") },
          },
          {
            type: "input" as const,
            name: "injuryType",
            label: t("injuryType"),
            inputType: "text",
            value: watch("injuryType"),
            onChange: (value: string) => setValue("injuryType", value),
            validation: { required: t("injuryTypeRequired") },
          },
          // Injury date field with prefilling support
          injuryDateFieldConfig(t, isEditing, injury_date_hijri, currentTopic),
        ];

      case "EDO-1":
      case "EDO-2":
        return [
          ...baseFields,
          {
            type: "input" as const,
            name: "managerialDecisionNumber",
            label: t("managerialDecisionNumber"),
            inputType: "text",
            value: watch("managerialDecisionNumber"),
            onChange: (value: string) => setValue("managerialDecisionNumber", value),
            validation: { required: t("decisionNumberRequired") },
          },
          // Managerial decision date field with prefilling support
          managerialDecisionDateFieldConfig(t, isEditing, managerial_decision_date_hijri, currentTopic),
        ];

      case "RLRAHI-1":
        return [
          ...baseFields,
          {
            type: "input" as const,
            name: "typeOfCustody",
            label: t("typeOfCustody"),
            inputType: "text",
            value: watch("typeOfCustody"),
            onChange: (value: string) => setValue("typeOfCustody", value),
            validation: { required: t("custodyTypeRequired") },
          },
          // Request date field with prefilling support
          requestDateFieldConfig(t, isEditing, request_date_hijri, currentTopic),
        ];

      default:
        return baseFields;
    }
  };

  const formLayout = [
    {
      gridCols: 2,
      className: "case-topics-form",
      children: buildFormLayout(),
    },
  ];

  return (
    <FormProvider>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">
          {isEditing ? "Edit Case Topic" : "Add New Case Topic"}
        </h2>
        
        <DynamicForm
          formLayout={formLayout}
          register={formMethods.register}
          errors={formMethods.formState.errors}
          setValue={setValue}
          control={formMethods.control}
          watch={watch}
        />
        
        <div className="mt-6 flex gap-4">
          <button
            type="button"
            onClick={() => {
              // Example of how to handle topic selection
              const sampleTopic = {
                MainTopicID: "WR",
                SubTopicID: "WR-1",
                MainSectionHeader: "Wage Request",
                SubTopicName: "Wage Request Type 1",
                FromDateHijri: "14451201",
                ToDateHijri: "14451231",
                Amount: "5000",
                AcknowledgementTerms: true,
              };
              handleEditTopic(sampleTopic);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Load Sample Topic
          </button>
          
          <button
            type="button"
            onClick={() => {
              // Example of how to save topic
              const formData = formMethods.getValues();
              console.log("Form data to save:", formData);
            }}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Save Topic
          </button>
        </div>
      </div>
    </FormProvider>
  );
};

export default ExampleCaseTopics; 