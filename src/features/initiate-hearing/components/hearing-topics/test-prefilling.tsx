import React from 'react';
import { useForm } from 'react-hook-form';
import useCaseTopicsPrefill from './hooks/useCaseTopicsPrefill';
import { CaseTopicsPrefillService } from '../../services/caseTopicsPrefillService';

/**
 * Test component to verify prefilling functionality
 */
const TestPrefilling = () => {
  const { setValue, trigger, watch } = useForm();
  
  // Mock edit topic data
  const mockEditTopic = {
    MainTopicID: "WR",
    SubTopicID: "WR-1",
    MainSectionHeader: "Worker Rights",
    SubTopicName: "Salary Payment",
    AcknowledgementTerms: true,
    FromDateHijri: "1445/01/01",
    FromDate_New: "2023/09/01",
    ToDateHijri: "1445/12/30",
    ToDate_New: "2024/08/30",
    Amount: "5000",
    ManagerialDecisionNumber: "MD-001",
  };

  // Use the prefilling hook
  useCaseTopicsPrefill({
    setValue,
    trigger,
    caseTopics: [],
    isEditing: true,
    editTopic: mockEditTopic,
  });

  const formValues = watch();

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Prefilling Test</h2>
      <div className="space-y-2">
        <p><strong>Main Category:</strong> {formValues.mainCategory?.label}</p>
        <p><strong>Sub Category:</strong> {formValues.subCategory?.label}</p>
        <p><strong>Acknowledged:</strong> {formValues.acknowledged ? 'Yes' : 'No'}</p>
        <p><strong>From Date (Hijri):</strong> {formValues.from_date_hijri}</p>
        <p><strong>To Date (Hijri):</strong> {formValues.to_date_hijri}</p>
        <p><strong>Amount:</strong> {formValues.amount}</p>
        <p><strong>Managerial Decision Number:</strong> {formValues.managerialDecisionNumber}</p>
      </div>
      
      <div className="mt-4">
        <h3 className="font-bold">Raw Form Values:</h3>
        <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
          {JSON.stringify(formValues, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default TestPrefilling; 