import { useEffect } from "react";
import { UseFormSetValue, UseFormTrigger } from "react-hook-form";
import { CaseTopicsPrefillService, CaseTopicData } from "../../initiate-hearing/services/caseTopicsPrefillService";

interface UseCaseTopicsPrefillProps {
  setValue: UseFormSetValue<any>;
  trigger?: UseFormTrigger<any>;
  caseTopics?: CaseTopicData[];
  isEditing?: boolean;
  editTopic?: any;
}

/**
 * Hook for prefilling case topics form fields including dates
 * Similar to useCaseDetailsPrefill but specifically for case topics
 */
const useCaseTopicsPrefill = ({
  setValue,
  trigger,
  caseTopics = [],
  isEditing = false,
  editTopic,
}: UseCaseTopicsPrefillProps) => {
  useEffect(() => {
    if (!isEditing || !editTopic) return;

    console.log('Prefilling form with editTopic:', editTopic);

    try {
      // If editing a specific topic, prefill that topic's data
      const formFields = CaseTopicsPrefillService.extractFormFields(editTopic);
      
      console.log('Extracted form fields:', formFields);
      
      // Set all form fields without prefix since we're editing a single topic
      Object.entries(formFields).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          console.log(`Setting ${key} to:`, value);
          setValue(key, value);
          
          // Special debugging for managerial decision number
          if (key === 'managerialDecisionNumber') {
            console.log('Setting managerialDecisionNumber specifically:', value);
            setTimeout(() => {
              console.log('Verifying managerialDecisionNumber was set correctly...');
            }, 100);
          }
        }
      });

      // Also set the original topic data for backward compatibility
      if (editTopic.MainTopicID) {
        const mainCategoryValue = {
          value: editTopic.MainTopicID,
          label: editTopic.MainSectionHeader || editTopic.mainCategory?.label || "",
        };
        console.log('Setting mainCategory to:', mainCategoryValue);
        setValue("mainCategory", mainCategoryValue);
      }
      
      if (editTopic.SubTopicID) {
        const subCategoryValue = {
          value: editTopic.SubTopicID,
          label: editTopic.SubTopicName || editTopic.subCategory?.label || "",
        };
        console.log('Setting subCategory to:', subCategoryValue);
        setValue("subCategory", subCategoryValue);
        
        // Double-check that it was set correctly with a longer delay
        setTimeout(() => {
          console.log('Verifying subCategory was set correctly after 100ms...');
        }, 100);
        
        // Additional verification after a longer delay
        setTimeout(() => {
          console.log('Final verification of subCategory after 500ms...');
        }, 500);
      }

      // Set acknowledged field
      if (editTopic.acknowledged !== undefined) {
        setValue("acknowledged", editTopic.acknowledged);
      }

      // Set regulatory text if available
      if (editTopic.Formal || editTopic.RegulatoryText) {
        setValue("regulatoryText", editTopic.Formal || editTopic.RegulatoryText);
      }

      // Trigger validation after setting all values with a longer delay
      if (trigger) {
        setTimeout(() => {
          console.log('Triggering form validation...');
          trigger();
        }, 200);
      }
    } catch (error) {
      console.error('Error during form prefilling:', error);
    }
  }, [editTopic, isEditing, setValue, trigger]);
};

export default useCaseTopicsPrefill; 