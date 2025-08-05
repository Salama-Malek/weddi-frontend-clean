import { useCallback, useRef } from 'react';
import { UseFormSetValue, UseFormTrigger } from 'react-hook-form';
import { Option } from '@/shared/components/form/form.types';
import { isOtherAllowance } from '../utils/isOtherAllowance';
import { isOtherCommission } from '../utils/isOtherCommission';
import { ensureOption } from '../edit-index';

interface UseSubTopicPrefillProps {
  setValue: UseFormSetValue<any>;
  trigger: UseFormTrigger<any>;
  isEditing: boolean;
  editTopic: any;
  lookupData: {
    commissionTypeLookupData?: any;
    accordingToAgreementLookupData?: any;
    typeOfRequestLookupData?: any;
    forAllowanceData?: any;
    regionData?: any;
    leaveTypeData?: any;
    payIncreaseTypeData?: any;
    amountPaidData?: any;
    travelingWayData?: any;
    typesOfPenaltiesData?: any;
    typeOfCustodyData?: any;
    documentTypeLookupData?: any;
  };
}

export const useSubTopicPrefill = ({
  setValue,
  trigger,
  isEditing,
  editTopic,
  lookupData
}: UseSubTopicPrefillProps) => {
  
  // Ref to track if prefill has been done for the current topic
  const prefillDoneRef = useRef<string | null>(null);
  
  // Helper function to set value without triggering validation (to avoid infinite loops)
  const setValueOnly = (field: string, value: any, options?: any) => {
    console.log(`[🔧 SETVALUE] Setting ${field}:`, value);
    setValue(field, value, options);
  };

  // ==================== WORKER SUBTOPICS ====================

  // WR-1: Worker Rights - Salary Payment
  const prefillWR1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'WR-1') return;
    
    console.log('[🔄 WR-1] Starting prefill for WR-1');

    // Set WR-1 specific fields
    const forAllowanceValue = editTopic.WR1_forAllowance?.value || editTopic.forAllowance?.value || editTopic.ForAllowance_Code || editTopic.ForAllowance;
    const forAllowanceLabel = editTopic.WR1_forAllowance?.label || editTopic.forAllowance?.label || editTopic.ForAllowance;
    if (forAllowanceValue && forAllowanceLabel) {
      const forAllowanceOption = { value: forAllowanceValue, label: forAllowanceLabel };
      setValueOnly('WR1_forAllowance', forAllowanceOption);
      console.log('[🔄 WR-1] Set WR1_forAllowance:', forAllowanceOption);
    }

    // Set otherAllowance if it exists in the data
    const otherAllowanceValue = editTopic.WR1_otherAllowance || editTopic.otherAllowance || editTopic.OtherAllowance;
    console.log('[🔄 WR-1] WR1_otherAllowanceValue from editTopic:', otherAllowanceValue);
    if (otherAllowanceValue) {
      setValueOnly('WR1_otherAllowance', otherAllowanceValue);
      console.log('[🔄 WR-1] Set WR1_otherAllowance:', otherAllowanceValue);
    } else {
      console.log('[🔄 WR-1] No WR1_otherAllowance value found in editTopic');
    }

    // Set date fields - use new WR-1 specific field names
    setValueOnly('WR1_fromDateHijri', editTopic.WR1_fromDateHijri || editTopic.FromDateHijri || editTopic.from_date_hijri || editTopic.pyTempDate || '');
    setValueOnly('WR1_fromDateGregorian', editTopic.WR1_fromDateGregorian || editTopic.FromDateGregorian || editTopic.from_date_gregorian || editTopic.FromDate_New || '');
    setValueOnly('WR1_toDateHijri', editTopic.WR1_toDateHijri || editTopic.ToDateHijri || editTopic.to_date_hijri || editTopic.Date_New || '');
    setValueOnly('WR1_toDateGregorian', editTopic.WR1_toDateGregorian || editTopic.ToDateGregorian || editTopic.to_date_gregorian || editTopic.ToDate_New || '');
    setValueOnly('WR1_wageAmount', editTopic.WR1_wageAmount || editTopic.wageAmount || editTopic.amount || editTopic.Amount || '');

    // Set legacy fields for backward compatibility
    setValueOnly('forAllowance', editTopic.forAllowance || (forAllowanceValue && forAllowanceLabel ? { value: forAllowanceValue, label: forAllowanceLabel } : null));
    setValueOnly('otherAllowance', editTopic.otherAllowance || otherAllowanceValue || '');
    setValueOnly('from_date_hijri', editTopic.from_date_hijri || editTopic.FromDateHijri || editTopic.pyTempDate || '');
    setValueOnly('from_date_gregorian', editTopic.from_date_gregorian || editTopic.FromDateGregorian || editTopic.FromDate_New || '');
    setValueOnly('to_date_hijri', editTopic.to_date_hijri || editTopic.ToDateHijri || editTopic.Date_New || '');
    setValueOnly('to_date_gregorian', editTopic.to_date_gregorian || editTopic.ToDateGregorian || editTopic.ToDate_New || '');
    setValueOnly('wageAmount', editTopic.wageAmount || editTopic.amount || editTopic.Amount || '');

    console.log('[🔄 WR-1] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // WR-2: Worker Rights - End of Service
  const prefillWR2 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'WR-2') return;

    console.log('[🔄 WR-2] Starting prefill for WR-2');

    // Set WR-2 specific fields
    setValueOnly('WR2_wageAmount', editTopic.WR2_wageAmount || editTopic.wageAmount || editTopic.amount || editTopic.Amount || editTopic.OverdueWagesAmount || '');
    setValueOnly('WR2_fromDateHijri', editTopic.WR2_fromDateHijri || editTopic.FromDateHijri || editTopic.from_date_hijri || editTopic.pyTempDate || '');
    setValueOnly('WR2_fromDateGregorian', editTopic.WR2_fromDateGregorian || editTopic.FromDateGregorian || editTopic.from_date_gregorian || editTopic.FromDate_New || '');
    setValueOnly('WR2_toDateHijri', editTopic.WR2_toDateHijri || editTopic.ToDateHijri || editTopic.to_date_hijri || editTopic.Date_New || '');
    setValueOnly('WR2_toDateGregorian', editTopic.WR2_toDateGregorian || editTopic.ToDateGregorian || editTopic.to_date_gregorian || editTopic.ToDate_New || '');

    // Set legacy fields for backward compatibility
    setValueOnly('wageAmount', editTopic.wageAmount || editTopic.amount || editTopic.Amount || editTopic.OverdueWagesAmount || '');
    setValueOnly('from_date_hijri', editTopic.from_date_hijri || editTopic.pyTempDate || '');
    setValueOnly('from_date_gregorian', editTopic.from_date_gregorian || editTopic.FromDate_New || '');
    setValueOnly('to_date_hijri', editTopic.to_date_hijri || editTopic.Date_New || '');
    setValueOnly('to_date_gregorian', editTopic.to_date_gregorian || editTopic.ToDate_New || '');

    console.log('[🔄 WR-2] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // BPSR-1: Bonus and Profit Share Request
  const prefillBPSR1 = useCallback(() => {
    console.log('[🔍 BPSR-1 DEBUG] prefillBPSR1 called with:', {
      isEditing,
      editTopicSubTopicID: editTopic?.SubTopicID,
      editTopicExists: !!editTopic
    });
    
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'BPSR-1') {
      console.log('[🔍 BPSR-1 DEBUG] Early return - isEditing:', isEditing, 'editTopic exists:', !!editTopic, 'SubTopicID matches:', editTopic?.SubTopicID === 'BPSR-1');
      return;
    }

    console.log('[🔄 BPSR-1] Starting prefill for BPSR-1');

    // Set BPSR-1 specific fields
    const commissionCode = editTopic.BPSR1_commissionType?.value || editTopic.CommissionType_Code || editTopic.commissionType?.value || editTopic.CommissionType;
    const commissionLabel = editTopic.BPSR1_commissionType?.label || editTopic.CommissionTypeLabel || editTopic.CommissionType;
    if (commissionCode && commissionLabel) {
      const commissionOption = { value: commissionCode, label: commissionLabel };
      setValueOnly('BPSR1_commissionType', commissionOption);
      console.log('[🔄 BPSR-1] Set BPSR1_commissionType:', commissionOption);
    }

    // Set accordingToAgreement
    const agrCode = editTopic.BPSR1_accordingToAgreement?.value || editTopic.AccordingToAgreement_Code || editTopic.accordingToAgreement?.value || editTopic.AccordingToAgreement;
    const agrLabel = editTopic.BPSR1_accordingToAgreement?.label || editTopic.AccordingToAgreement;
    if (agrCode && agrLabel) {
      const agrOption = { value: agrCode, label: agrLabel };
      setValueOnly('BPSR1_accordingToAgreement', agrOption);
      console.log('[🔄 BPSR-1] Set BPSR1_accordingToAgreement:', agrOption);
    }

    // Set other BPSR-1 specific fields
    setValueOnly('BPSR1_bonusProfitShareAmount', editTopic.BPSR1_bonusProfitShareAmount || editTopic.bonusProfitShareAmount || editTopic.Amount || editTopic.amount || '');
    setValueOnly('BPSR1_amountRatio', editTopic.BPSR1_amountRatio || editTopic.amountRatio || editTopic.AmountRatio || '');
    setValueOnly('BPSR1_fromDateHijri', editTopic.BPSR1_fromDateHijri || editTopic.from_date_hijri || editTopic.pyTempDate || '');
    setValueOnly('BPSR1_fromDateGregorian', editTopic.BPSR1_fromDateGregorian || editTopic.from_date_gregorian || editTopic.FromDate_New || '');
    setValueOnly('BPSR1_toDateHijri', editTopic.BPSR1_toDateHijri || editTopic.to_date_hijri || editTopic.Date_New || '');
    setValueOnly('BPSR1_toDateGregorian', editTopic.BPSR1_toDateGregorian || editTopic.to_date_gregorian || editTopic.ToDate_New || '');
    setValueOnly('BPSR1_otherCommission', editTopic.BPSR1_otherCommission || editTopic.otherCommission || editTopic.OtherCommission || '');

    // Set legacy fields for backward compatibility
    setValueOnly('commissionType', editTopic.commissionType || (commissionCode && commissionLabel ? { value: commissionCode, label: commissionLabel } : null));
    setValueOnly('accordingToAgreement', editTopic.accordingToAgreement || (agrCode && agrLabel ? { value: agrCode, label: agrLabel } : null));
    setValueOnly('bonusProfitShareAmount', editTopic.bonusProfitShareAmount || editTopic.Amount || editTopic.amount || '');
    setValueOnly('amountRatio', editTopic.amountRatio || editTopic.AmountRatio || '');
    setValueOnly('from_date_hijri', editTopic.from_date_hijri || editTopic.pyTempDate || '');
    setValueOnly('from_date_gregorian', editTopic.from_date_gregorian || editTopic.FromDate_New || '');
    setValueOnly('to_date_hijri', editTopic.to_date_hijri || editTopic.Date_New || '');
    setValueOnly('to_date_gregorian', editTopic.to_date_gregorian || editTopic.ToDate_New || '');
    setValueOnly('otherCommission', editTopic.otherCommission || editTopic.OtherCommission || '');

    console.log('[🔄 BPSR-1] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // MIR-1: Medical Insurance Request
  const prefillMIR1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'MIR-1') return;

    console.log('[🔄 MIR-1] Starting prefill for MIR-1');

    // Set MIR-1 specific fields
    const requestTypeValue = editTopic.MIR1_typeOfRequest?.value || editTopic.RequestType_Code || editTopic.typeOfRequest?.value || editTopic.RequestType;
    const requestTypeLabel = editTopic.MIR1_typeOfRequest?.label || editTopic.TypeOfRequest || editTopic.typeOfRequest?.label || editTopic.RequestType;
    if (requestTypeValue && requestTypeLabel) {
      const requestTypeOption = { value: requestTypeValue, label: requestTypeLabel };
      setValueOnly('MIR1_typeOfRequest', requestTypeOption);
      console.log('[🔄 MIR-1] Set MIR1_typeOfRequest:', requestTypeOption);
    }

    setValueOnly('MIR1_requiredDegreeOfInsurance', editTopic.MIR1_requiredDegreeOfInsurance || editTopic.RequiredDegreeInsurance || editTopic.requiredDegreeOfInsurance || '');
    setValueOnly('MIR1_theReason', editTopic.MIR1_theReason || editTopic.Reason || editTopic.theReason || '');
    setValueOnly('MIR1_currentInsuranceLevel', editTopic.MIR1_currentInsuranceLevel || editTopic.CurrentInsuranceLevel || editTopic.currentInsuranceLevel || '');

    // Set legacy fields for backward compatibility
    setValueOnly('typeOfRequest', editTopic.typeOfRequest || (requestTypeValue && requestTypeLabel ? { value: requestTypeValue, label: requestTypeLabel } : null));
    setValueOnly('requiredDegreeOfInsurance', editTopic.requiredDegreeOfInsurance || editTopic.RequiredDegreeInsurance || '');
    setValueOnly('theReason', editTopic.theReason || editTopic.Reason || '');
    setValueOnly('currentInsuranceLevel', editTopic.currentInsuranceLevel || editTopic.CurrentInsuranceLevel || '');

    console.log('[🔄 MIR-1] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // CMR-1: Compensation Request - Amounts Paid For
  const prefillCMR1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'CMR-1') return;

    console.log('[🔄 CMR-1] Starting prefill for CMR-1');

    // Set CMR-1 specific fields
    const amountsPaidForValue = editTopic.CMR1_amountsPaidFor?.value || editTopic.amountsPaidFor?.value || editTopic.AmountsPaidFor;
    const amountsPaidForLabel = editTopic.CMR1_amountsPaidFor?.label || editTopic.amountsPaidFor?.label || editTopic.AmountsPaidFor;
    if (amountsPaidForValue && amountsPaidForLabel) {
      const amountsPaidForOption = { value: amountsPaidForValue, label: amountsPaidForLabel };
      setValueOnly('CMR1_amountsPaidFor', amountsPaidForOption);
      console.log('[🔄 CMR-1] Set CMR1_amountsPaidFor:', amountsPaidForOption);
    }

    setValueOnly('CMR1_theAmountRequired', editTopic.CMR1_theAmountRequired || editTopic.theAmountRequired || editTopic.AmountRequired || '');

    // Set legacy fields for backward compatibility
    const legacyAmountsPaidForOption = ensureOption(lookupData.amountPaidData?.DataElements, amountsPaidForValue);
    setValueOnly('amountsPaidFor', legacyAmountsPaidForOption);
    setValueOnly('theAmountRequired', editTopic.theAmountRequired || editTopic.AmountRequired || '');

    console.log('[🔄 CMR-1] Prefill completed');
  }, [isEditing, editTopic, lookupData, setValueOnly]);

  // CMR-3: Compensation Request - Work Injury
  const prefillCMR3 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'CMR-3') return;

    console.log('[🔄 CMR-3] Starting prefill for CMR-3');

    // Set CMR-3 specific fields
    setValueOnly('CMR3_compensationAmount', editTopic.CMR3_compensationAmount || editTopic.compensationAmount || editTopic.Amount || '');
    setValueOnly('CMR3_injuryDateHijri', editTopic.CMR3_injuryDateHijri || editTopic.InjuryDateHijri || editTopic.injury_date_hijri || editTopic.pyTempText || '');
    setValueOnly('CMR3_injuryDateGregorian', editTopic.CMR3_injuryDateGregorian || editTopic.InjuryDateGregorian || editTopic.injury_date_gregorian || editTopic.InjuryDate_New || '');
    setValueOnly('CMR3_injuryType', editTopic.CMR3_injuryType || editTopic.TypeOfWorkInjury || editTopic.injuryType || '');

    // Set legacy fields for backward compatibility
    setValueOnly('compensationAmount', editTopic.compensationAmount || editTopic.Amount || '');
    setValueOnly('injury_date_hijri', editTopic.injury_date_hijri || editTopic.InjuryDateHijri || editTopic.pyTempText || '');
    setValueOnly('injury_date_gregorian', editTopic.injury_date_gregorian || editTopic.InjuryDateGregorian || editTopic.InjuryDate_New || '');
    setValueOnly('injuryType', editTopic.injuryType || editTopic.TypeOfWorkInjury || '');

    console.log('[🔄 CMR-3] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // CMR-4: Compensation Request - General
  const prefillCMR4 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'CMR-4') return;

    console.log('[🔄 CMR-4] Starting prefill for CMR-4');

    // Set CMR-4 specific fields
    setValueOnly('CMR4_compensationAmount', editTopic.CMR4_compensationAmount || editTopic.noticeCompensationAmount || editTopic.Amount || editTopic.amount || '');

    // Set legacy fields for backward compatibility
    setValueOnly('noticeCompensationAmount', editTopic.noticeCompensationAmount || editTopic.Amount || editTopic.amount || '');

    console.log('[🔄 CMR-4] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // CMR-5: Compensation Request - Leave
  const prefillCMR5 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'CMR-5') return;

    console.log('[🔄 CMR-5] Starting prefill for CMR-5');

    // Handle kindOfHoliday option field
    const leaveTypeCode = editTopic.LeaveType_Code || editTopic.KindOfHoliday_Code || editTopic.kindOfHoliday?.value;
    const leaveTypeLabel = editTopic.LeaveType || editTopic.KindOfHoliday || editTopic.kindOfHoliday?.label;
    
    console.log('[🔄 CMR-5] leaveTypeCode:', leaveTypeCode);
    console.log('[🔄 CMR-5] leaveTypeLabel:', leaveTypeLabel);
    
    let leaveTypeOption = null;
    
    // Priority 1: If we have both code and label from case details AND they are different, use them directly
    if (leaveTypeCode && leaveTypeLabel && leaveTypeCode !== leaveTypeLabel) {
      leaveTypeOption = { value: leaveTypeCode, label: leaveTypeLabel };
      console.log('[🔄 CMR-5] Using code and label from case details:', leaveTypeOption);
    }
    // Priority 2: If we have the code, use it to find the option from lookup
    else if (leaveTypeCode) {
      leaveTypeOption = ensureOption(lookupData.leaveTypeData?.DataElements, leaveTypeCode);
      console.log('[🔄 CMR-5] Using code to find option from lookup:', leaveTypeOption);
    }
    // Priority 3: If we only have the label, try to find by label
    else if (leaveTypeLabel) {
      const matchingElement = lookupData.leaveTypeData?.DataElements?.find(
        (element: any) => element.ElementValue === leaveTypeLabel
      );
      if (matchingElement) {
        leaveTypeOption = { value: matchingElement.ElementKey, label: matchingElement.ElementValue };
      }
      console.log('[🔄 CMR-5] Using label to find option from lookup:', leaveTypeOption);
    }
    
    console.log('[🔄 CMR-5] Final leaveTypeOption:', leaveTypeOption);

    // Set CMR-5 specific fields
    setValueOnly('CMR5_kindOfHoliday', leaveTypeOption);
    setValueOnly('CMR5_totalAmount', editTopic.TotalAmountRequired || editTopic.totalAmount || editTopic.TotalAmount || '');
    setValueOnly('CMR5_workingHours', editTopic.WorkingHoursCount || editTopic.workingHours || editTopic.WorkingHours || '');
    setValueOnly('CMR5_additionalDetails', editTopic.AdditionalDetails || editTopic.additionalDetails || '');

    // Set legacy fields for backward compatibility
    setValueOnly('kindOfHoliday', leaveTypeOption);
    setValueOnly('totalAmount', editTopic.TotalAmountRequired || editTopic.totalAmount || editTopic.TotalAmount || '');
    setValueOnly('workingHours', editTopic.WorkingHoursCount || editTopic.workingHours || editTopic.WorkingHours || '');
    setValueOnly('additionalDetails', editTopic.AdditionalDetails || editTopic.additionalDetails || '');

    console.log('[🔄 CMR-5] Prefill completed');
  }, [isEditing, editTopic, lookupData, setValueOnly]);

  // CMR-6: Compensation Request - Wage Difference/Increase
  const prefillCMR6 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'CMR-6') return;

    console.log('[🔄 CMR-6] Starting prefill for CMR-6');

    // Set CMR-6 specific fields
    setValueOnly('CMR6_fromDateHijri', editTopic.FromDateHijri || editTopic.from_date_hijri || editTopic.pyTempDate || '');
    setValueOnly('CMR6_fromDateGregorian', editTopic.FromDate_New || editTopic.from_date_gregorian || '');
    setValueOnly('CMR6_toDateHijri', editTopic.ToDateHijri || editTopic.to_date_hijri || editTopic.Date_New || '');
    setValueOnly('CMR6_toDateGregorian', editTopic.ToDate_New || editTopic.to_date_gregorian || '');
    setValueOnly('CMR6_newPayAmount', editTopic.NewPayAmount || editTopic.newPayAmount || '');
    
    // Handle payIncreaseType option field
    const payIncreaseTypeCode = editTopic.PayIncreaseType_Code || editTopic.payIncreaseType?.value;
    const payIncreaseTypeLabel = editTopic.PayIncreaseType || editTopic.payIncreaseType?.label;
    
    console.log('[🔄 CMR-6] payIncreaseTypeCode:', payIncreaseTypeCode);
    console.log('[🔄 CMR-6] payIncreaseTypeLabel:', payIncreaseTypeLabel);
    
    let payIncreaseTypeOption = null;
    
    // Priority 1: If we have both code and label from case details AND they are different, use them directly
    if (payIncreaseTypeCode && payIncreaseTypeLabel && payIncreaseTypeCode !== payIncreaseTypeLabel) {
      payIncreaseTypeOption = { value: payIncreaseTypeCode, label: payIncreaseTypeLabel };
      console.log('[🔄 CMR-6] Using code and label from case details:', payIncreaseTypeOption);
    }
    // Priority 2: If we have the code, use it to find the option from lookup
    else if (payIncreaseTypeCode) {
      payIncreaseTypeOption = ensureOption(lookupData.payIncreaseTypeData?.DataElements, payIncreaseTypeCode);
      console.log('[🔄 CMR-6] Using code to find option from lookup:', payIncreaseTypeOption);
    }
    // Priority 3: If we only have the label, try to find by label
    else if (payIncreaseTypeLabel) {
      const matchingElement = lookupData.payIncreaseTypeData?.DataElements?.find(
        (element: any) => element.ElementValue === payIncreaseTypeLabel
      );
      if (matchingElement) {
        payIncreaseTypeOption = { value: matchingElement.ElementKey, label: matchingElement.ElementValue };
      }
      console.log('[🔄 CMR-6] Using label to find option from lookup:', payIncreaseTypeOption);
    }
    
    console.log('[🔄 CMR-6] Final payIncreaseTypeOption:', payIncreaseTypeOption);
    setValueOnly('CMR6_payIncreaseType', payIncreaseTypeOption);
    setValueOnly('CMR6_wageDifference', editTopic.WageDifference || editTopic.wageDifference || '');

    // Set legacy fields for backward compatibility
    setValueOnly('from_date_hijri', editTopic.FromDateHijri || editTopic.from_date_hijri || editTopic.pyTempDate || '');
    setValueOnly('from_date_gregorian', editTopic.FromDate_New || editTopic.from_date_gregorian || '');
    setValueOnly('to_date_hijri', editTopic.ToDateHijri || editTopic.to_date_hijri || editTopic.Date_New || '');
    setValueOnly('to_date_gregorian', editTopic.ToDate_New || editTopic.to_date_gregorian || '');
    setValueOnly('newPayAmount', editTopic.NewPayAmount || editTopic.newPayAmount || '');
    setValueOnly('payIncreaseType', payIncreaseTypeOption);
    setValueOnly('wageDifference', editTopic.WageDifference || editTopic.wageDifference || '');

    console.log('[🔄 CMR-6] Prefill completed');
  }, [isEditing, editTopic, lookupData, setValueOnly]);

  // CMR-7: Compensation Request - Overtime
  const prefillCMR7 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'CMR-7') return;

    console.log('[🔄 CMR-7] Starting prefill for CMR-7');

    // Set CMR-7 specific fields
    setValueOnly('CMR7_fromDateHijri', editTopic.FromDateHijri || editTopic.from_date_hijri || editTopic.pyTempDate || '');
    setValueOnly('CMR7_fromDateGregorian', editTopic.FromDate_New || editTopic.from_date_gregorian || '');
    setValueOnly('CMR7_toDateHijri', editTopic.ToDateHijri || editTopic.to_date_hijri || editTopic.Date_New || '');
    setValueOnly('CMR7_toDateGregorian', editTopic.ToDate_New || editTopic.to_date_gregorian || '');
    setValueOnly('CMR7_durationOfLeaveDue', editTopic.DurationOfLeaveDue || editTopic.durationOfLeaveDue || '');
    setValueOnly('CMR7_payDue', editTopic.PayDue || editTopic.payDue || '');

    // Set legacy fields for backward compatibility
    setValueOnly('from_date_hijri', editTopic.FromDateHijri || editTopic.from_date_hijri || editTopic.pyTempDate || '');
    setValueOnly('from_date_gregorian', editTopic.FromDate_New || editTopic.from_date_gregorian || '');
    setValueOnly('to_date_hijri', editTopic.ToDateHijri || editTopic.to_date_hijri || editTopic.Date_New || '');
    setValueOnly('to_date_gregorian', editTopic.ToDate_New || editTopic.to_date_gregorian || '');
    setValueOnly('durationOfLeaveDue', editTopic.DurationOfLeaveDue || editTopic.durationOfLeaveDue || '');
    setValueOnly('payDue', editTopic.PayDue || editTopic.payDue || '');

    console.log('[🔄 CMR-7] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // CMR-8: Compensation Request - Pay Stop Time
  const prefillCMR8 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'CMR-8') return;

    console.log('[🔄 CMR-8] Starting prefill for CMR-8');

    // Set CMR-8 specific fields
    setValueOnly('CMR8_fromDateHijri', editTopic.FromDateHijri || editTopic.from_date_hijri || editTopic.pyTempDate || '');
    setValueOnly('CMR8_fromDateGregorian', editTopic.FromDate_New || editTopic.from_date_gregorian || '');
    setValueOnly('CMR8_toDateHijri', editTopic.ToDateHijri || editTopic.to_date_hijri || editTopic.Date_New || '');
    setValueOnly('CMR8_toDateGregorian', editTopic.ToDate_New || editTopic.to_date_gregorian || '');
    setValueOnly('CMR8_wagesAmount', editTopic.WagesAmount || editTopic.wagesAmount || '');

    // Set legacy fields for backward compatibility
    setValueOnly('from_date_hijri', editTopic.FromDateHijri || editTopic.from_date_hijri || editTopic.pyTempDate || '');
    setValueOnly('from_date_gregorian', editTopic.FromDate_New || editTopic.from_date_gregorian || '');
    setValueOnly('to_date_hijri', editTopic.ToDateHijri || editTopic.to_date_hijri || editTopic.Date_New || '');
    setValueOnly('to_date_gregorian', editTopic.ToDate_New || editTopic.to_date_gregorian || '');
    setValueOnly('wagesAmount', editTopic.WagesAmount || editTopic.wagesAmount || '');

    console.log('[🔄 CMR-8] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // BR-1: Bonus Request
  const prefillBR1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'BR-1') return;

    console.log('[🔄 BR-1] Starting prefill for BR-1');

    // Handle accordingToAgreement option field
    const accordingToAgreementCode = editTopic.AccordingToAgreement_Code || editTopic.accordingToAgreement?.value;
    const accordingToAgreementLabel = editTopic.AccordingToAgreement || editTopic.accordingToAgreement?.label;
    
    console.log('[🔄 BR-1] accordingToAgreementCode:', accordingToAgreementCode);
    console.log('[🔄 BR-1] accordingToAgreementLabel:', accordingToAgreementLabel);
    
    let accordingToAgreementOption = null;
    
    // Priority 1: If we have both code and label from case details AND they are different, use them directly
    if (accordingToAgreementCode && accordingToAgreementLabel && accordingToAgreementCode !== accordingToAgreementLabel) {
      accordingToAgreementOption = { value: accordingToAgreementCode, label: accordingToAgreementLabel };
      console.log('[🔄 BR-1] Using code and label from case details:', accordingToAgreementOption);
    }
    // Priority 2: If we have the code, use it to find the option from lookup
    else if (accordingToAgreementCode) {
      accordingToAgreementOption = ensureOption(lookupData.accordingToAgreementLookupData?.DataElements, accordingToAgreementCode);
      console.log('[🔄 BR-1] Using code to find option from lookup:', accordingToAgreementOption);
    }
    // Priority 3: If we only have the label, try to find by label
    else if (accordingToAgreementLabel) {
      const matchingElement = lookupData.accordingToAgreementLookupData?.DataElements?.find(
        (element: any) => element.ElementValue === accordingToAgreementLabel
      );
      if (matchingElement) {
        accordingToAgreementOption = { value: matchingElement.ElementKey, label: matchingElement.ElementValue };
      }
      console.log('[🔄 BR-1] Using label to find option from lookup:', accordingToAgreementOption);
    }
    
    // Set BR-1 specific fields
    setValueOnly('BR1_accordingToAgreement', accordingToAgreementOption);
    setValueOnly('BR1_bonusAmount', editTopic.BR1_bonusAmount || editTopic.bonusAmount || editTopic.BonusAmount || editTopic.Amount || editTopic.Premium || '');
    setValueOnly('BR1_dateHijri', editTopic.BR1_dateHijri || editTopic.date_hijri || editTopic.pyTempDate || '');
    setValueOnly('BR1_dateGregorian', editTopic.BR1_dateGregorian || editTopic.date_gregorian || editTopic.Date_New || '');

    // Set legacy fields for backward compatibility
    setValueOnly('accordingToAgreement', accordingToAgreementOption);
    setValueOnly('bonusAmount', editTopic.bonusAmount || editTopic.BonusAmount || editTopic.Amount || editTopic.Premium || '');
    setValueOnly('date_hijri', editTopic.date_hijri || editTopic.pyTempDate || '');
    setValueOnly('date_gregorian', editTopic.date_gregorian || editTopic.Date_New || '');

    console.log('[🔄 BR-1] Prefill completed');
  }, [isEditing, editTopic, lookupData, setValueOnly]);

  // EDO-1: Cancellation of Location Transfer Decision
  const prefillEDO1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'EDO-1') return;

    console.log('[🔄 EDO-1] Starting prefill for EDO-1');

    // Set EDO-1 specific fields
    const fromLocationCode = editTopic.EDO1_fromLocation?.value || editTopic.fromLocation?.value || editTopic.FromLocation_Code || editTopic.fromLocation;
    const fromLocationLabel = editTopic.EDO1_fromLocation?.label || editTopic.fromLocation?.label || editTopic.FromLocation;
    if (fromLocationCode && fromLocationLabel) {
      const fromLocationOption = { value: fromLocationCode, label: fromLocationLabel };
      setValueOnly('EDO1_fromLocation', fromLocationOption);
      console.log('[🔄 EDO-1] Set EDO1_fromLocation:', fromLocationOption);
    }

    const toLocationCode = editTopic.EDO1_toLocation?.value || editTopic.toLocation?.value || editTopic.ToLocation_Code || editTopic.toLocation;
    const toLocationLabel = editTopic.EDO1_toLocation?.label || editTopic.toLocation?.label || editTopic.ToLocation;
    if (toLocationCode && toLocationLabel) {
      const toLocationOption = { value: toLocationCode, label: toLocationLabel };
      setValueOnly('EDO1_toLocation', toLocationOption);
      console.log('[🔄 EDO-1] Set EDO1_toLocation:', toLocationOption);
    }

    // Set date and decision fields
    setValueOnly('EDO1_managerialDecisionDateHijri', editTopic.EDO1_managerialDecisionDateHijri || editTopic.managerial_decision_date_hijri || editTopic.Date_New || '');
    setValueOnly('EDO1_managerialDecisionDateGregorian', editTopic.EDO1_managerialDecisionDateGregorian || editTopic.managerial_decision_date_gregorian || editTopic.ManDecsDate || '');
    setValueOnly('EDO1_managerialDecisionNumber', editTopic.EDO1_managerialDecisionNumber || editTopic.managerialDecisionNumber || '');

    // Set legacy fields for backward compatibility
    setValueOnly('fromLocation', editTopic.fromLocation || (fromLocationCode && fromLocationLabel ? { value: fromLocationCode, label: fromLocationLabel } : null));
    setValueOnly('toLocation', editTopic.toLocation || (toLocationCode && toLocationLabel ? { value: toLocationCode, label: toLocationLabel } : null));
    setValueOnly('managerial_decision_date_hijri', editTopic.managerial_decision_date_hijri || editTopic.Date_New || '');
    setValueOnly('managerial_decision_date_gregorian', editTopic.managerial_decision_date_gregorian || editTopic.ManDecsDate || '');
    setValueOnly('managerialDecisionNumber', editTopic.managerialDecisionNumber || '');

    console.log('[🔄 EDO-1] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // EDO-2: Cancellation of Job Transfer Decision
  const prefillEDO2 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'EDO-2') return;

    console.log('[🔄 EDO-2] Starting prefill for EDO-2');

    // Set EDO-2 specific fields
    setValueOnly('EDO2_fromJob', editTopic.EDO2_fromJob || editTopic.fromJob || '');
    setValueOnly('EDO2_toJob', editTopic.EDO2_toJob || editTopic.toJob || '');
    setValueOnly('EDO2_managerialDecisionDateHijri', editTopic.EDO2_managerialDecisionDateHijri || editTopic.managerial_decision_date_hijri || editTopic.Date_New || '');
    setValueOnly('EDO2_managerialDecisionDateGregorian', editTopic.EDO2_managerialDecisionDateGregorian || editTopic.managerial_decision_date_gregorian || editTopic.ManDecsDate || '');
    setValueOnly('EDO2_managerialDecisionNumber', editTopic.EDO2_managerialDecisionNumber || editTopic.managerialDecisionNumber || '');

    // Set legacy fields for backward compatibility
    setValueOnly('fromJob', editTopic.fromJob || '');
    setValueOnly('toJob', editTopic.toJob || '');
    setValueOnly('managerial_decision_date_hijri', editTopic.managerial_decision_date_hijri || editTopic.Date_New || '');
    setValueOnly('managerial_decision_date_gregorian', editTopic.managerial_decision_date_gregorian || editTopic.ManDecsDate || '');
    setValueOnly('managerialDecisionNumber', editTopic.managerialDecisionNumber || '');

    console.log('[🔄 EDO-2] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // EDO-3: Cancellation of Wage Reduction Decision
  const prefillEDO3 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'EDO-3') return;

    console.log('[🔄 EDO-3] Starting prefill for EDO-3');

    // Set EDO-3 specific fields
    setValueOnly('EDO3_amountOfReduction', editTopic.EDO3_amountOfReduction || editTopic.amountOfReduction || editTopic.AmountOfReduction || '');
    setValueOnly('EDO3_managerialDecisionDateHijri', editTopic.EDO3_managerialDecisionDateHijri || editTopic.managerial_decision_date_hijri || editTopic.pyTempDate || '');
    setValueOnly('EDO3_managerialDecisionDateGregorian', editTopic.EDO3_managerialDecisionDateGregorian || editTopic.managerial_decision_date_gregorian || editTopic.ManagerialDecisionDate_New || '');
    setValueOnly('EDO3_managerialDecisionNumber', editTopic.EDO3_managerialDecisionNumber || editTopic.managerialDecisionNumber || '');

    // Set legacy fields for backward compatibility
    setValueOnly('amountOfReduction', editTopic.amountOfReduction || editTopic.AmountOfReduction || '');
    setValueOnly('managerial_decision_date_hijri', editTopic.managerial_decision_date_hijri || editTopic.pyTempDate || '');
    setValueOnly('managerial_decision_date_gregorian', editTopic.managerial_decision_date_gregorian || editTopic.ManagerialDecisionDate_New || '');
    setValueOnly('managerialDecisionNumber', editTopic.managerialDecisionNumber || '');

    console.log('[🔄 EDO-3] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // EDO-4: Cancellation of Disciplinary Penalty Decision
  const prefillEDO4 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'EDO-4') return;

    console.log('[🔄 EDO-4] Starting prefill for EDO-4');

    // Set EDO-4 specific fields
    const penaltyCode = editTopic.EDO4_typesOfPenalties?.value || editTopic.PenalityType_Code || editTopic.TypesOfPenalties_Code || editTopic.typesOfPenalties?.value;
    const penaltyLabel = editTopic.EDO4_typesOfPenalties?.label || editTopic.PenalityType || editTopic.TypesOfPenalties || editTopic.typesOfPenalties?.label;
    
    console.log('[🔄 EDO-4] penaltyCode:', penaltyCode);
    console.log('[🔄 EDO-4] penaltyLabel:', penaltyLabel);
    
    let penaltyOption = null;
    
    // Priority 1: If we have both code and label from case details AND they are different, use them directly
    if (penaltyCode && penaltyLabel && penaltyCode !== penaltyLabel) {
      penaltyOption = { value: penaltyCode, label: penaltyLabel };
      console.log('[🔄 EDO-4] Using code and label from case details:', penaltyOption);
    }
    // Priority 2: If we have the code, use it to find the option from lookup (this handles cases where code=label)
    else if (penaltyCode) {
      penaltyOption = ensureOption(lookupData.typesOfPenaltiesData?.DataElements, penaltyCode);
      console.log('[🔄 EDO-4] Using code to find option from lookup:', penaltyOption);
    }
    // Priority 3: If we only have the label, try to find by label
    else if (penaltyLabel) {
      const matchingElement = lookupData.typesOfPenaltiesData?.DataElements?.find(
        (element: any) => element.ElementValue === penaltyLabel
      );
      if (matchingElement) {
        penaltyOption = { value: matchingElement.ElementKey, label: matchingElement.ElementValue };
      }
      console.log('[🔄 EDO-4] Using label to find option from lookup:', penaltyOption);
    }
    
    console.log('[🔄 EDO-4] Final penaltyOption:', penaltyOption);
    setValueOnly('EDO4_typesOfPenalties', penaltyOption);

    setValueOnly('EDO4_managerialDecisionDateHijri', editTopic.EDO4_managerialDecisionDateHijri || editTopic.ManagerialDecisionDateHijri || editTopic.managerial_decision_date_hijri || editTopic.Date_New || '');
    setValueOnly('EDO4_managerialDecisionDateGregorian', editTopic.EDO4_managerialDecisionDateGregorian || editTopic.ManagerialDecisionDateGregorian || editTopic.managerial_decision_date_gregorian || editTopic.ManDecsDate || '');
    setValueOnly('EDO4_managerialDecisionNumber', editTopic.EDO4_managerialDecisionNumber || editTopic.managerialDecisionNumber || '');

    // Set legacy fields for backward compatibility
    setValueOnly('typesOfPenalties', editTopic.typesOfPenalties || penaltyOption);
    setValueOnly('managerial_decision_date_hijri', editTopic.ManagerialDecisionDateHijri || editTopic.managerial_decision_date_hijri || editTopic.Date_New || '');
    setValueOnly('managerial_decision_date_gregorian', editTopic.ManagerialDecisionDateGregorian || editTopic.managerial_decision_date_gregorian || editTopic.ManDecsDate || '');
    setValueOnly('managerialDecisionNumber', editTopic.managerialDecisionNumber || '');

    console.log('[🔄 EDO-4] Prefill completed');
  }, [isEditing, editTopic, lookupData, setValueOnly]);



  // HIR-1: Housing Insurance Request
  const prefillHIR1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'HIR-1') return;

    console.log('[🔄 HIR-1] Starting prefill for HIR-1');

    // Determine which accommodation source was selected based on existing data
    const isBylawsSelected = editTopic.IsBylawsIncludeAddingAccomodation === "Yes" || 
                           editTopic.IsBylawsIncludeAddingAccommodiation === "Yes" ||
                           editTopic.doesBylawsIncludeAddingAccommodations === true;
    
    const isContractSelected = editTopic.IsContractIncludeAddingAccommodation === "Yes" || 
                             editTopic.IsContractIncludeAddingAccommodiation === "Yes" ||
                             editTopic.doesContractIncludeAddingAccommodations === true;

    // Set the accommodation source based on which option has data
    if (isBylawsSelected) {
      setValueOnly('HIR1_AccommodationSource', 'bylaws');
    } else if (isContractSelected) {
      setValueOnly('HIR1_AccommodationSource', 'contract');
    } else {
      // If neither is explicitly set, check which fields have data
      const hasBylawsData = editTopic.HousingSpecificationsInBylaws || editTopic.housingSpecificationInByLaws;
      const hasContractData = editTopic.HousingSpecificationsInContract || editTopic.housingSpecificationsInContract || 
                             editTopic.HousingSpecifications || editTopic.actualHousingSpecifications;
      
      if (hasBylawsData && !hasContractData) {
        setValueOnly('HIR1_AccommodationSource', 'bylaws');
      } else if (hasContractData && !hasBylawsData) {
        setValueOnly('HIR1_AccommodationSource', 'contract');
      }
      // If both have data or neither has data, leave it empty for user to choose
    }

    // Set HIR-1 specific fields - ensure both flags have values
    const bylawsFlag = editTopic.IsBylawsIncludeAddingAccomodation || editTopic.IsBylawsIncludeAddingAccommodiation || "";
    const contractFlag = editTopic.IsContractIncludeAddingAccommodation || editTopic.IsContractIncludeAddingAccommodiation || "";
    
    // If one is "Yes" and the other is empty, set the empty one to "No"
    if (bylawsFlag === "Yes" && !contractFlag) {
      setValueOnly('HIR1_IsBylawsIncludeAddingAccomodation', "Yes");
      setValueOnly('HIR1_IsContractIncludeAddingAccommodation', "No");
    } else if (contractFlag === "Yes" && !bylawsFlag) {
      setValueOnly('HIR1_IsBylawsIncludeAddingAccomodation', "No");
      setValueOnly('HIR1_IsContractIncludeAddingAccommodation', "Yes");
    } else {
      // If both have values or both are empty, use the original values
      setValueOnly('HIR1_IsBylawsIncludeAddingAccomodation', bylawsFlag);
      setValueOnly('HIR1_IsContractIncludeAddingAccommodation', contractFlag);
    }
    setValueOnly('HIR1_HousingSpecificationsInContract', editTopic.HousingSpecificationsInContract || editTopic.housingSpecificationsInContract || "");
    setValueOnly('HIR1_HousingSpecificationsInBylaws', editTopic.HousingSpecificationsInBylaws || editTopic.housingSpecificationInByLaws || "");
    setValueOnly('HIR1_HousingSpecifications', editTopic.HousingSpecifications || editTopic.actualHousingSpecifications || "");

    // Set legacy fields for backward compatibility
    setValueOnly('doesBylawsIncludeAddingAccommodations', 
      editTopic.doesBylawsIncludeAddingAccommodations !== undefined 
        ? editTopic.doesBylawsIncludeAddingAccommodations 
        : editTopic.IsBylawsIncludeAddingAccomodation === "Yes" || editTopic.IsBylawsIncludeAddingAccommodiation === "Yes"
    );
    setValueOnly('doesContractIncludeAddingAccommodations', 
      editTopic.doesContractIncludeAddingAccommodations !== undefined 
        ? editTopic.doesContractIncludeAddingAccommodations 
        : editTopic.IsContractIncludeAddingAccommodation === "Yes" || editTopic.IsContractIncludeAddingAccommodiation === "Yes"
    );
    setValueOnly('housingSpecificationInByLaws', editTopic.housingSpecificationInByLaws || editTopic.HousingSpecificationsInBylaws || '');
    setValueOnly('housingSpecificationsInContract', editTopic.housingSpecificationsInContract || editTopic.HousingSpecificationsInContract || '');
    setValueOnly('actualHousingSpecifications', editTopic.actualHousingSpecifications || editTopic.HousingSpecifications || '');

    console.log('[🔄 HIR-1] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // JAR-2: Job Application Request (Change Job Title)
  const prefillJAR2 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'JAR-2') return;

    console.log('[🔄 JAR-2] Starting prefill for JAR-2');

    // Set JAR-2 specific fields
    setValueOnly('JAR2_currentJobTitle', editTopic.CurrentJobTitle || editTopic.currentJobTitle || "");
    setValueOnly('JAR2_requiredJobTitle', editTopic.RequiredJobTitle || editTopic.requiredJobTitle || "");

    // Set legacy fields for backward compatibility
    setValueOnly('currentJobTitle', editTopic.currentJobTitle || editTopic.CurrentJobTitle || '');
    setValueOnly('requiredJobTitle', editTopic.requiredJobTitle || editTopic.RequiredJobTitle || '');

    console.log('[🔄 JAR-2] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // JAR-3: Job Application Request (Promotion Mechanism)
  const prefillJAR3 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'JAR-3') return;

    console.log('[🔄 JAR-3] Starting prefill for JAR-3');
    console.log('[🔄 JAR-3] editTopic data:', editTopic);

    // Set JAR-3 specific fields
    setValueOnly('JAR3_promotionMechanism', editTopic.PromotionMechanism || editTopic.promotionMechanism || "");
    setValueOnly('JAR3_additionalUpgrade', editTopic.AdditionalUpgrade || editTopic.additionalUpgrade || "");

    // Set legacy fields for backward compatibility
    setValueOnly('promotionMechanism', editTopic.promotionMechanism || editTopic.PromotionMechanism || "");
    setValueOnly('additionalUpgrade', editTopic.additionalUpgrade || editTopic.AdditionalUpgrade || "");

    console.log('[🔄 JAR-3] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // JAR-4: Job Application Request (Position Change)
  const prefillJAR4 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'JAR-4') return;

    console.log('[🔄 JAR-4] Starting prefill for JAR-4');

    // Set JAR-4 specific fields
    setValueOnly('JAR4_CurrentPosition', editTopic.CurrentPosition || editTopic.currentPosition || "");
    setValueOnly('JAR4_WantedJob', editTopic.WantedJob || editTopic.theWantedJob || "");
    
    // Set legacy fields for backward compatibility
    setValueOnly('currentPosition', editTopic.currentPosition || editTopic.CurrentPosition || "");
    setValueOnly('theWantedJob', editTopic.theWantedJob || editTopic.WantedJob || "");

    console.log('[🔄 JAR-4] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // LRESR-1: End of Service Reward
  const prefillLRESR1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'LRESR-1') return;

    console.log('[🔄 LRESR-1] Starting prefill for LRESR-1');

    // Set LRESR-1 specific fields - look for the new field names first, then fallback to legacy
    setValueOnly('LRESR1_Amount', editTopic.LRESR1_Amount || editTopic.Amount || editTopic.amount || "");
    
    // Set legacy fields for backward compatibility
    setValueOnly('endOfServiceRewardAmount', editTopic.endOfServiceRewardAmount || editTopic.Amount || editTopic.amount || '');

    console.log('[🔄 LRESR-1] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // TTR-1: Travel Transportation Request
  const prefillTTR1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'TTR-1') return;

    console.log('[🔄 TTR-1] Starting prefill for TTR-1');

    // Handle both code and label formats
    const travelingWayCode = editTopic.TravelingWay_Code || editTopic.travelingWay?.value;
    const travelingWayLabel = editTopic.TravelingWay || editTopic.travelingWay?.label;
    
    console.log('[🔄 TTR-1] travelingWayCode:', travelingWayCode);
    console.log('[🔄 TTR-1] travelingWayLabel:', travelingWayLabel);
    console.log('[🔄 TTR-1] travelingWayData available:', !!lookupData.travelingWayData);
    console.log('[🔄 TTR-1] travelingWayData elements:', lookupData.travelingWayData?.DataElements);
    
    let travelingWayOption = null;
    
    if (travelingWayCode) {
      // If we have the code, use it to find the option
      travelingWayOption = ensureOption(lookupData.travelingWayData?.DataElements, travelingWayCode, travelingWayLabel);
      console.log('[🔄 TTR-1] Option from code lookup:', travelingWayOption);
    }
    
    // If we still don't have an option, try to find by label
    if (!travelingWayOption && travelingWayLabel) {
      const matchingElement = lookupData.travelingWayData?.DataElements?.find(
        (element: any) => element.ElementValue === travelingWayLabel
      );
      if (matchingElement) {
        travelingWayOption = { value: matchingElement.ElementKey, label: matchingElement.ElementValue };
        console.log('[🔄 TTR-1] Option from label lookup:', travelingWayOption);
      }
    }
    
    // If we still don't have an option, create one from the available data
    if (!travelingWayOption && (travelingWayCode || travelingWayLabel)) {
      travelingWayOption = { 
        value: travelingWayCode || travelingWayLabel, 
        label: travelingWayLabel || travelingWayCode 
      };
      console.log('[🔄 TTR-1] Option from fallback:', travelingWayOption);
    }
    
    console.log('[🔄 TTR-1] Final travelingWayOption:', travelingWayOption);

    // Set TTR-1 specific fields
    setValueOnly('TTR1_travelingWay', travelingWayOption);

    // Set legacy fields for backward compatibility
    setValueOnly('travelingWay', travelingWayOption);

    console.log('[🔄 TTR-1] Prefill completed');
  }, [isEditing, editTopic, lookupData, setValueOnly]);



  // RFR-1: Refund Request
  const prefillRFR1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'RFR-1') return;

    console.log('[🔄 RFR-1] Starting prefill for RFR-1');
    console.log('[🔄 RFR-1] editTopic data:', editTopic);

    // Set RFR-1 specific fields - look for the new field names first, then fallback to legacy
    setValueOnly('RFR1_Amount', editTopic.RFR1_Amount || editTopic.Amount || editTopic.amount || "");
    setValueOnly('RFR1_Consideration', editTopic.RFR1_Consideration || editTopic.Consideration || editTopic.consideration || "");
    setValueOnly('RFR1_dateHijri', editTopic.RFR1_dateHijri || editTopic.date_hijri || editTopic.pyTempDate || "");
    setValueOnly('RFR1_dateGregorian', editTopic.RFR1_dateGregorian || editTopic.date_gregorian || editTopic.Date_New || "");

    // Set legacy fields for backward compatibility
    setValueOnly('rewardRequestAmount', editTopic.rewardRequestAmount || editTopic.Amount || editTopic.amount || '');
    setValueOnly('consideration', editTopic.consideration || editTopic.Consideration || '');
    setValueOnly('date_hijri', editTopic.date_hijri || editTopic.pyTempDate || '');
    setValueOnly('date_gregorian', editTopic.date_gregorian || editTopic.Date_New || '');

    console.log('[🔄 RFR-1] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // RR-1: Reward Request
  const prefillRR1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'RR-1') return;

    console.log('[🔄 RR-1] Starting prefill for RR-1');

    // Set RR-1 specific fields
    setValueOnly('RR1_Amount', editTopic.Amount || editTopic.amount || "");
    setValueOnly('RR1_Type', editTopic.Type || "");

    // Set legacy fields for backward compatibility
    setValueOnly('rewardAmount', editTopic.rewardAmount || editTopic.Amount || editTopic.amount || '');
    setValueOnly('rewardType', editTopic.rewardType || editTopic.RewardType || editTopic.Type || '');

    console.log('[🔄 RR-1] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // LCUT-1: Labor Contract Termination - Unilateral termination
  const prefillLCUT1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'LCUT-1') return;

    console.log('[🔄 LCUT-1] Starting prefill for LCUT-1');

    // Set LCUT-1 specific fields
    setValueOnly('LCUT1_amountOfCompensation', editTopic.LCUT1_amountOfCompensation || editTopic.amountOfCompensation || editTopic.AmountOfCompensation || '');

    // Set legacy fields for backward compatibility
    setValueOnly('amountOfCompensation', editTopic.amountOfCompensation || editTopic.AmountOfCompensation || '');

    console.log('[🔄 LCUT-1] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // DR-1: Document Request
  const prefillDR1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'DR-1') return;

    console.log('[🔄 DR-1] Starting prefill for DR-1');

    // DR-1 typically doesn't have specific form fields, just acknowledgment
    console.log('[🔄 DR-1] Prefill completed');
  }, [isEditing, editTopic]);

  // ==================== ESTABLISHMENT SUBTOPICS ====================

  // CR-1: Custody Request
  const prefillCR1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'CR-1') return;

    console.log('[🔄 CR-1] Starting prefill for CR-1');

    // Handle typeOfCustody option field
    const typeOfCustodyCode = editTopic.TypeOfCustody_Code || editTopic.typeOfCustody?.value;
    const typeOfCustodyLabel = editTopic.TypeOfCustody || editTopic.typeOfCustody?.label;
    
    console.log('[🔄 CR-1] typeOfCustodyCode:', typeOfCustodyCode);
    console.log('[🔄 CR-1] typeOfCustodyLabel:', typeOfCustodyLabel);
    
    let typeOfCustodyOption = null;
    
    if (typeOfCustodyCode) {
      // If we have the code, use it to find the option
      typeOfCustodyOption = ensureOption(lookupData.typeOfCustodyData?.DataElements, typeOfCustodyCode);
    } else if (typeOfCustodyLabel) {
      // If we only have the label, try to find by label
      const matchingElement = lookupData.typeOfCustodyData?.DataElements?.find(
        (element: any) => element.ElementValue === typeOfCustodyLabel
      );
      if (matchingElement) {
        typeOfCustodyOption = { value: matchingElement.ElementKey, label: matchingElement.ElementValue };
      }
    }
    
    console.log('[🔄 CR-1] Final typeOfCustodyOption:', typeOfCustodyOption);
    setValueOnly('typeOfCustody', typeOfCustodyOption);
    
    const compensationAmountValue = editTopic.CompensationAmount || editTopic.compensationAmount || editTopic.Amount || editTopic.amount || '';
    console.log('[🔄 CR-1] Setting compensationAmount to:', compensationAmountValue);
    setValueOnly('compensationAmount', compensationAmountValue); // Changed from 'amount' to 'compensationAmount'

    console.log('[🔄 CR-1] Prefill completed');
  }, [isEditing, editTopic, lookupData, setValueOnly]);

  // LCUTE-1: Leave Cancellation (Establishment)
  const prefillLCUTE1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'LCUTE-1') return;

    console.log('[🔄 LCUTE-1] Starting prefill for LCUTE-1');

    setValueOnly('amountOfCompensation', editTopic.amountOfCompensation || editTopic.AmountOfCompensation || '');

    console.log('[🔄 LCUTE-1] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // DPVR-1: Damaged Property Value Request
  const prefillDPVR1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'DPVR-1') return;

    console.log('[🔄 DPVR-1] Starting prefill for DPVR-1');

    setValueOnly('damagedType', editTopic.damagedType || editTopic.SpoilerType || '');
    setValueOnly('damagedValue', editTopic.damagedValue || editTopic.DamagedValue || '');

    console.log('[🔄 DPVR-1] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // AWRW-1: Additional Worker Rights (Establishment)
  const prefillAWRW1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'AWRW-1') return;

    console.log('[🔄 AWRW-1] Starting prefill for AWRW-1');

    // AWRW-1 typically doesn't have specific form fields, just acknowledgment
    console.log('[🔄 AWRW-1] Prefill completed');
  }, [isEditing, editTopic]);

  // AWRW-2: Additional Worker Rights (Establishment)
  const prefillAWRW2 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'AWRW-2') return;

    console.log('[🔄 AWRW-2] Starting prefill for AWRW-2');

    // AWRW-2 typically doesn't have specific form fields, just acknowledgment
    console.log('[🔄 AWRW-2] Prefill completed');
  }, [isEditing, editTopic]);

  // RLRAHI-1: Request for Loan or Custody
  const prefillRLRAHI1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'RLRAHI-1') return;

    console.log('[🔄 RLRAHI-1] Starting prefill for RLRAHI-1');
    console.log('[🔄 RLRAHI-1] editTopic data:', editTopic);

    // Handle typeOfRequest field - check multiple possible sources
    const requestTypeValue = editTopic.typeOfRequest?.value || editTopic.RequestType || editTopic.RequestType_Code;
    const requestTypeLabel = editTopic.typeOfRequest?.label || editTopic.RequestType || requestTypeValue;
    
    console.log('[🔄 RLRAHI-1] requestTypeValue:', requestTypeValue);
    console.log('[🔄 RLRAHI-1] requestTypeLabel:', requestTypeLabel);
    
    if (requestTypeValue) {
      const requestTypeOption = { value: requestTypeValue, label: requestTypeLabel };
      setValueOnly('typeOfRequest', requestTypeOption);
      console.log('[🔄 RLRAHI-1] Set typeOfRequest:', requestTypeOption);
    }

    if (requestTypeValue === 'RLRAHI2') {
      // Loan request
      const loanAmount = editTopic.loanAmount || editTopic.LoanAmount || '';
      setValueOnly('loanAmount', loanAmount);
      console.log('[🔄 RLRAHI-1] Set loanAmount:', loanAmount);
    } else {
      // Custody request
      const typeOfCustody = editTopic.typeOfCustody || editTopic.TypeOfCustody || '';
      const requestDateHijri = editTopic.request_date_hijri || editTopic.Date_New || '';
      const requestDateGregorian = editTopic.request_date_gregorian || editTopic.RequestDate_New || '';
      
      setValueOnly('typeOfCustody', typeOfCustody);
      setValueOnly('request_date_hijri', requestDateHijri);
      setValueOnly('request_date_gregorian', requestDateGregorian);
      
      console.log('[🔄 RLRAHI-1] Set custody fields:', { typeOfCustody, requestDateHijri, requestDateGregorian });
    }

    console.log('[🔄 RLRAHI-1] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // RUF-1: Refund Request (Establishment)
  const prefillRUF1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'RUF-1') {
      console.log('[🔄 RUF-1] Prefill skipped - isEditing:', isEditing, 'editTopic:', !!editTopic, 'SubTopicID:', editTopic?.SubTopicID);
      return;
    }

    console.log('[🔄 RUF-1] Starting prefill for RUF-1');
    console.log('[🔄 RUF-1] editTopic data:', editTopic);

    const refundType = editTopic.refundType || editTopic.RefundType || '';
    const amount = editTopic.refundAmount || editTopic.amount || editTopic.Amount || '';
    
    console.log('[🔄 RUF-1] refundType:', refundType);
    console.log('[🔄 RUF-1] amount:', amount);
    
    setValueOnly('RefundType', refundType);
    setValueOnly('refundAmount', amount); // Changed from 'amount' to 'refundAmount'
    
    console.log('[🔄 RUF-1] Set RefundType:', refundType);
    console.log('[🔄 RUF-1] Set refundAmount:', amount);

    console.log('[🔄 RUF-1] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // Main prefill function that routes to appropriate handler
  const prefillSubTopic = useCallback(() => {
    console.log('[🔍 PREFILL DEBUG] prefillSubTopic called with:', {
      isEditing,
      editTopic: editTopic ? { SubTopicID: editTopic.SubTopicID, MainTopicID: editTopic.MainTopicID, index: editTopic.index } : null
    });
    
    if (!isEditing || !editTopic) {
      console.log('[🔍 PREFILL DEBUG] Early return - isEditing:', isEditing, 'editTopic exists:', !!editTopic);
      return;
    }

    const subTopicId = editTopic.SubTopicID;
    const topicIndex = editTopic.index;
    const topicId = editTopic.topicId || editTopic.id;
    
    // Create a unique identifier that includes topic-specific information
    // Use index as the primary differentiator since it's always unique per topic
    const uniqueKey = `${subTopicId}-${editTopic.MainTopicID}-${topicIndex}-${topicId || 'no-id'}`;
    
    console.log(`[🔍 PREFILL DEBUG] editTopic:`, {
      SubTopicID: editTopic.SubTopicID,
      MainTopicID: editTopic.MainTopicID,
      index: editTopic.index,
      topicId: editTopic.topicId,
      id: editTopic.id,
      uniqueKey,
      currentPrefillDone: prefillDoneRef.current,
      // Add more details to help debug the issue
      fullEditTopic: editTopic
    });
    
    console.log(`[🔍 PREFILL DEBUG] Unique key comparison:`, {
      uniqueKey,
      currentPrefillDone: prefillDoneRef.current,
      keysMatch: prefillDoneRef.current === uniqueKey
    });
    
    // Reset prefillDoneRef when editTopic changes
    if (prefillDoneRef.current !== uniqueKey) {
      prefillDoneRef.current = uniqueKey;
      console.log(`[🔄 SUBTOPIC] Starting prefill for ${subTopicId} (index: ${topicIndex})`);
    } else {
      console.log(`[🔄 SUBTOPIC] Prefill already done for ${subTopicId} (index: ${topicIndex}), but continuing anyway to ensure form values are set`);
      // Continue with prefill even if already done to ensure form values are set
    }

    switch (subTopicId) {
      // Worker Subtopics
      case 'WR-1':
        prefillWR1();
        break;
      case 'WR-2':
        prefillWR2();
        break;
      case 'BPSR-1':
        prefillBPSR1();
        break;
      case 'MIR-1':
        prefillMIR1();
        break;
      case 'CMR-1':
        prefillCMR1();
        break;
      case 'CMR-3':
        prefillCMR3();
        break;
      case 'CMR-4':
        prefillCMR4();
        break;
      case 'CMR-5':
        prefillCMR5();
        break;
      case 'CMR-6':
        prefillCMR6();
        break;
      case 'CMR-7':
        prefillCMR7();
        break;
      case 'CMR-8':
        prefillCMR8();
        break;
      case 'BR-1':
        prefillBR1();
        break;
      case 'EDO-1':
        prefillEDO1();
        break;
      case 'EDO-2':
        prefillEDO2();
        break;
      case 'EDO-3':
        prefillEDO3();
        break;
      case 'EDO-4':
        prefillEDO4();
        break;
      case 'HIR-1':
        prefillHIR1();
        break;
      case 'JAR-2':
        prefillJAR2();
        break;
      case 'JAR-3':
        prefillJAR3();
        break;
      case 'JAR-4':
        prefillJAR4();
        break;
      case 'LRESR-1':
        prefillLRESR1();
        break;
      case 'TTR-1':
        prefillTTR1();
        break;
      case 'RFR-1':
        prefillRFR1();
        break;
      case 'RR-1':
        prefillRR1();
        break;
      case 'LCUT-1':
        prefillLCUT1();
        break;
      case 'DR-1':
        prefillDR1();
        break;

      // Establishment Subtopics
      case 'CR-1':
        prefillCR1();
        break;
      case 'LCUTE-1':
        prefillLCUTE1();
        break;
      case 'DPVR-1':
        prefillDPVR1();
        break;
      case 'AWRW-1':
        prefillAWRW1();
        break;
      case 'AWRW-2':
        prefillAWRW2();
        break;
      case 'RLRAHI-1':
        prefillRLRAHI1();
        break;
      case 'RUF-1':
        prefillRUF1();
        break;

      default:
        console.log(`[🔄 SUBTOPIC] No specific prefill handler for ${subTopicId}`);
        break;
    }
  }, [
    isEditing,
    editTopic,
    // Worker Subtopics
    prefillWR1,
    prefillWR2,
    prefillBPSR1,
    prefillMIR1,
    prefillCMR1,
    prefillCMR3,
    prefillCMR4,
    prefillCMR5,
    prefillCMR6,
    prefillCMR7,
    prefillCMR8,
    prefillBR1,
    prefillEDO1,
    prefillEDO2,
    prefillEDO3,
    prefillEDO4,
    prefillHIR1,
    prefillJAR2,
    prefillJAR3,
    prefillJAR4,
    prefillLRESR1,
    prefillTTR1,
    prefillRFR1,
    prefillRR1,
    prefillLCUT1,
    prefillDR1,
    // Establishment Subtopics
    prefillCR1,
    prefillLCUTE1,
    prefillDPVR1,
    prefillAWRW1,
    prefillAWRW2,
    prefillRLRAHI1,
    prefillRUF1,
  ]);

  return {
    prefillSubTopic,
    // Worker Subtopics
    prefillWR1,
    prefillWR2,
    prefillBPSR1,
    prefillMIR1,
    prefillCMR1,
    prefillCMR3,
    prefillCMR4,
    prefillCMR5,
    prefillCMR6,
    prefillCMR7,
    prefillCMR8,
    prefillBR1,
    prefillEDO1,
    prefillEDO2,
    prefillEDO3,
    prefillEDO4,
    prefillHIR1,
    prefillJAR2,
    prefillJAR3,
    prefillJAR4,
    prefillLRESR1,
    prefillTTR1,
    prefillRFR1,
    prefillRR1,
    prefillLCUT1,
    prefillDR1,
    // Establishment Subtopics
    prefillCR1,
    prefillLCUTE1,
    prefillDPVR1,
    prefillAWRW1,
    prefillAWRW2,
    prefillRLRAHI1,
    prefillRUF1,
  };
}; 