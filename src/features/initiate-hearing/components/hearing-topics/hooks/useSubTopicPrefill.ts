import { useCallback, useRef } from "react";
import { UseFormSetValue, UseFormTrigger } from "react-hook-form";
import { ensureOption } from "../edit-index";

interface UseSubTopicPrefillProps {
  setValue: UseFormSetValue<any>;
  trigger: UseFormTrigger<any>;
  isEditing: boolean;
  editTopic: any;
  caseDetails?: any;
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
  lookupData,
}: UseSubTopicPrefillProps) => {
  const prefillDoneRef = useRef<string | null>(null);

  const setValueOnly = (field: string, value: any, options?: any) => {
    setValue(field, value, options);
  };

  const setLegacyIfValue = (field: string, value: any, options?: any) => {
    if (value === undefined || value === null) return;
    if (typeof value === "string" && value.trim() === "") return;
    setValueOnly(field, value, options);
  };

  const prefillWR1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== "WR-1") return;

    const forAllowanceValue =
      editTopic.WR1_forAllowance?.value ||
      editTopic.forAllowance?.value ||
      editTopic.ForAllowance_Code ||
      editTopic.ForAllowance;
    const forAllowanceLabel =
      editTopic.WR1_forAllowance?.label ||
      editTopic.forAllowance?.label ||
      editTopic.ForAllowance;
    if (forAllowanceValue && forAllowanceLabel) {
      const forAllowanceOption = {
        value: forAllowanceValue,
        label: forAllowanceLabel,
      };
      setValueOnly("WR1_forAllowance", forAllowanceOption);
    }

    const otherAllowanceValue =
      editTopic.WR1_otherAllowance ||
      editTopic.otherAllowance ||
      editTopic.OtherAllowance;
    if (otherAllowanceValue) {
      setValueOnly("WR1_otherAllowance", otherAllowanceValue);
    } else {
    }

    setValueOnly(
      "WR1_fromDateHijri",
      editTopic.WR1_fromDateHijri ||
        editTopic.FromDateHijri ||
        editTopic.from_date_hijri ||
        editTopic.pyTempDate ||
        "",
    );
    setValueOnly(
      "WR1_fromDateGregorian",
      editTopic.WR1_fromDateGregorian ||
        editTopic.FromDateGregorian ||
        editTopic.from_date_gregorian ||
        editTopic.FromDate_New ||
        "",
    );
    setValueOnly(
      "WR1_toDateHijri",
      editTopic.WR1_toDateHijri ||
        editTopic.ToDateHijri ||
        editTopic.to_date_hijri ||
        editTopic.Date_New ||
        "",
    );
    setValueOnly(
      "WR1_toDateGregorian",
      editTopic.WR1_toDateGregorian ||
        editTopic.ToDateGregorian ||
        editTopic.to_date_gregorian ||
        editTopic.ToDate_New ||
        "",
    );
    setValueOnly(
      "WR1_wageAmount",
      editTopic.WR1_wageAmount ||
        editTopic.wageAmount ||
        editTopic.amount ||
        editTopic.Amount ||
        "",
    );

    setValueOnly(
      "forAllowance",
      editTopic.forAllowance ||
        (forAllowanceValue && forAllowanceLabel
          ? { value: forAllowanceValue, label: forAllowanceLabel }
          : null),
    );
    setValueOnly(
      "otherAllowance",
      editTopic.otherAllowance || otherAllowanceValue || "",
    );
    setValueOnly(
      "from_date_hijri",
      editTopic.from_date_hijri ||
        editTopic.FromDateHijri ||
        editTopic.pyTempDate ||
        "",
    );
    setValueOnly(
      "from_date_gregorian",
      editTopic.from_date_gregorian ||
        editTopic.FromDateGregorian ||
        editTopic.FromDate_New ||
        "",
    );
    setValueOnly(
      "to_date_hijri",
      editTopic.to_date_hijri ||
        editTopic.ToDateHijri ||
        editTopic.Date_New ||
        "",
    );
    setValueOnly(
      "to_date_gregorian",
      editTopic.to_date_gregorian ||
        editTopic.ToDateGregorian ||
        editTopic.ToDate_New ||
        "",
    );
    setValueOnly(
      "wageAmount",
      editTopic.wageAmount || editTopic.amount || editTopic.Amount || "",
    );
  }, [isEditing, editTopic, setValueOnly]);

  const prefillWR2 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== "WR-2") return;

    setValueOnly(
      "WR2_wageAmount",
      editTopic.WR2_wageAmount ||
        editTopic.wageAmount ||
        editTopic.amount ||
        editTopic.Amount ||
        editTopic.OverdueWagesAmount ||
        "",
    );
    setValueOnly(
      "WR2_fromDateHijri",
      editTopic.WR2_fromDateHijri ||
        editTopic.FromDateHijri ||
        editTopic.from_date_hijri ||
        editTopic.pyTempDate ||
        "",
    );
    setValueOnly(
      "WR2_fromDateGregorian",
      editTopic.WR2_fromDateGregorian ||
        editTopic.FromDateGregorian ||
        editTopic.from_date_gregorian ||
        editTopic.FromDate_New ||
        "",
    );
    setValueOnly(
      "WR2_toDateHijri",
      editTopic.WR2_toDateHijri ||
        editTopic.ToDateHijri ||
        editTopic.to_date_hijri ||
        editTopic.Date_New ||
        "",
    );
    setValueOnly(
      "WR2_toDateGregorian",
      editTopic.WR2_toDateGregorian ||
        editTopic.ToDateGregorian ||
        editTopic.to_date_gregorian ||
        editTopic.ToDate_New ||
        "",
    );

    setValueOnly(
      "wageAmount",
      editTopic.wageAmount ||
        editTopic.amount ||
        editTopic.Amount ||
        editTopic.OverdueWagesAmount ||
        "",
    );
    setValueOnly(
      "from_date_hijri",
      editTopic.from_date_hijri || editTopic.pyTempDate || "",
    );
    setValueOnly(
      "from_date_gregorian",
      editTopic.from_date_gregorian || editTopic.FromDate_New || "",
    );
    setValueOnly(
      "to_date_hijri",
      editTopic.to_date_hijri || editTopic.Date_New || "",
    );
    setValueOnly(
      "to_date_gregorian",
      editTopic.to_date_gregorian || editTopic.ToDate_New || "",
    );
  }, [isEditing, editTopic, setValueOnly]);

  const prefillBPSR1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== "BPSR-1") {
      return;
    }

    const commissionCode =
      editTopic.BPSR1_commissionType?.value ||
      editTopic.CommissionType_Code ||
      editTopic.commissionType?.value ||
      editTopic.CommissionType;
    const commissionLabel =
      editTopic.BPSR1_commissionType?.label ||
      editTopic.CommissionTypeLabel ||
      editTopic.CommissionType;
    if (commissionCode && commissionLabel) {
      const commissionOption = {
        value: commissionCode,
        label: commissionLabel,
      };
      setValueOnly("BPSR1_commissionType", commissionOption, {
        shouldValidate: true,
      });
    }

    const agrCode =
      editTopic.BPSR1_accordingToAgreement?.value ||
      editTopic.AccordingToAgreement_Code ||
      editTopic.accordingToAgreement?.value ||
      editTopic.AccordingToAgreement;
    const agrLabel =
      editTopic.BPSR1_accordingToAgreement?.label ||
      editTopic.AccordingToAgreement;
    if (agrCode && agrLabel) {
      const agrOption = { value: agrCode, label: agrLabel };
      setValueOnly("BPSR1_accordingToAgreement", agrOption, {
        shouldValidate: true,
      });
    }

    setValueOnly(
      "BPSR1_bonusProfitShareAmount",
      editTopic.BPSR1_bonusProfitShareAmount ||
        editTopic.bonusProfitShareAmount ||
        editTopic.Amount ||
        editTopic.amount ||
        "",
      { shouldValidate: true },
    );
    setValueOnly(
      "BPSR1_amountRatio",
      editTopic.BPSR1_amountRatio ||
        editTopic.amountRatio ||
        editTopic.AmountRatio ||
        "",
      { shouldValidate: true },
    );
    setValueOnly(
      "BPSR1_fromDateHijri",
      editTopic.BPSR1_fromDateHijri ||
        editTopic.from_date_hijri ||
        editTopic.pyTempDate ||
        "",
      { shouldValidate: true },
    );
    setValueOnly(
      "BPSR1_fromDateGregorian",
      editTopic.BPSR1_fromDateGregorian ||
        editTopic.from_date_gregorian ||
        editTopic.FromDate_New ||
        "",
      { shouldValidate: true },
    );
    setValueOnly(
      "BPSR1_toDateHijri",
      editTopic.BPSR1_toDateHijri ||
        editTopic.to_date_hijri ||
        editTopic.Date_New ||
        "",
      { shouldValidate: true },
    );
    setValueOnly(
      "BPSR1_toDateGregorian",
      editTopic.BPSR1_toDateGregorian ||
        editTopic.to_date_gregorian ||
        editTopic.ToDate_New ||
        "",
      { shouldValidate: true },
    );
    setValueOnly(
      "BPSR1_otherCommission",
      editTopic.BPSR1_otherCommission ||
        editTopic.otherCommission ||
        editTopic.OtherCommission ||
        "",
      { shouldValidate: true },
    );

    setValueOnly(
      "commissionType",
      editTopic.commissionType ||
        (commissionCode && commissionLabel
          ? { value: commissionCode, label: commissionLabel }
          : null),
    );
    setValueOnly(
      "accordingToAgreement",
      editTopic.accordingToAgreement ||
        (agrCode && agrLabel ? { value: agrCode, label: agrLabel } : null),
    );
    setValueOnly(
      "bonusProfitShareAmount",
      editTopic.bonusProfitShareAmount ||
        editTopic.Amount ||
        editTopic.amount ||
        "",
    );
    setValueOnly(
      "amountRatio",
      editTopic.amountRatio || editTopic.AmountRatio || "",
    );
    setValueOnly(
      "from_date_hijri",
      editTopic.from_date_hijri || editTopic.pyTempDate || "",
    );
    setValueOnly(
      "from_date_gregorian",
      editTopic.from_date_gregorian || editTopic.FromDate_New || "",
    );
    setValueOnly(
      "to_date_hijri",
      editTopic.to_date_hijri || editTopic.Date_New || "",
    );
    setValueOnly(
      "to_date_gregorian",
      editTopic.to_date_gregorian || editTopic.ToDate_New || "",
    );
    setValueOnly(
      "otherCommission",
      editTopic.otherCommission || editTopic.OtherCommission || "",
    );

    try {
      setTimeout(() => {
        trigger([
          "BPSR1_commissionType",
          "BPSR1_accordingToAgreement",
          "BPSR1_bonusProfitShareAmount",
          "BPSR1_amountRatio",
          "BPSR1_fromDateHijri",
          "BPSR1_toDateHijri",
          "BPSR1_otherCommission",
        ]);
        trigger();
      }, 0);
    } catch {}
  }, [isEditing, editTopic, setValueOnly]);

  const prefillMIR1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== "MIR-1") return;

    const requestTypeValue =
      editTopic.MIR1_typeOfRequest?.value ||
      editTopic.RequestType_Code ||
      editTopic.typeOfRequest?.value ||
      editTopic.RequestType;
    const requestTypeLabel =
      editTopic.MIR1_typeOfRequest?.label ||
      editTopic.TypeOfRequest ||
      editTopic.typeOfRequest?.label ||
      editTopic.RequestType;
    if (requestTypeValue && requestTypeLabel) {
      const requestTypeOption = {
        value: requestTypeValue,
        label: requestTypeLabel,
      };
      setValueOnly("MIR1_typeOfRequest", requestTypeOption);
    }

    setValueOnly(
      "MIR1_requiredDegreeOfInsurance",
      editTopic.MIR1_requiredDegreeOfInsurance ||
        editTopic.RequiredDegreeInsurance ||
        editTopic.requiredDegreeOfInsurance ||
        "",
    );
    setValueOnly(
      "MIR1_theReason",
      editTopic.MIR1_theReason || editTopic.Reason || editTopic.theReason || "",
    );
    setValueOnly(
      "MIR1_currentInsuranceLevel",
      editTopic.MIR1_currentInsuranceLevel ||
        editTopic.CurrentInsuranceLevel ||
        editTopic.currentInsuranceLevel ||
        "",
    );

    setValueOnly(
      "typeOfRequest",
      editTopic.typeOfRequest ||
        (requestTypeValue && requestTypeLabel
          ? { value: requestTypeValue, label: requestTypeLabel }
          : null),
    );
    setValueOnly(
      "requiredDegreeOfInsurance",
      editTopic.requiredDegreeOfInsurance ||
        editTopic.RequiredDegreeInsurance ||
        "",
    );
    setValueOnly("theReason", editTopic.theReason || editTopic.Reason || "");
    setValueOnly(
      "currentInsuranceLevel",
      editTopic.currentInsuranceLevel || editTopic.CurrentInsuranceLevel || "",
    );
  }, [isEditing, editTopic, setValueOnly]);

  const prefillCMR1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== "CMR-1") return;

    const amountsPaidForValue =
      editTopic.CMR1_amountsPaidFor?.value ||
      editTopic.amountsPaidFor?.value ||
      editTopic.AmountsPaidFor;
    const amountsPaidForLabel =
      editTopic.CMR1_amountsPaidFor?.label ||
      editTopic.amountsPaidFor?.label ||
      editTopic.AmountsPaidFor;
    if (amountsPaidForValue && amountsPaidForLabel) {
      const amountsPaidForOption = {
        value: amountsPaidForValue,
        label: amountsPaidForLabel,
      };
      setValueOnly("CMR1_amountsPaidFor", amountsPaidForOption);
    }

    setValueOnly(
      "CMR1_theAmountRequired",
      editTopic.CMR1_theAmountRequired ||
        editTopic.theAmountRequired ||
        editTopic.AmountRequired ||
        "",
    );

    const legacyAmountsPaidForOption = ensureOption(
      lookupData.amountPaidData?.DataElements,
      amountsPaidForValue,
    );
    setValueOnly("amountsPaidFor", legacyAmountsPaidForOption);
    setValueOnly(
      "theAmountRequired",
      editTopic.theAmountRequired || editTopic.AmountRequired || "",
    );
  }, [isEditing, editTopic, lookupData, setValueOnly]);

  const prefillCMR3 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== "CMR-3") return;

    setValueOnly(
      "CMR3_compensationAmount",
      editTopic.CMR3_compensationAmount ||
        editTopic.compensationAmount ||
        editTopic.Amount ||
        "",
    );
    setValueOnly(
      "CMR3_injuryDateHijri",
      editTopic.CMR3_injuryDateHijri ||
        editTopic.InjuryDateHijri ||
        editTopic.injury_date_hijri ||
        editTopic.pyTempText ||
        "",
    );
    setValueOnly(
      "CMR3_injuryDateGregorian",
      editTopic.CMR3_injuryDateGregorian ||
        editTopic.InjuryDateGregorian ||
        editTopic.injury_date_gregorian ||
        editTopic.InjuryDate_New ||
        "",
    );
    setValueOnly(
      "CMR3_injuryType",
      editTopic.CMR3_injuryType ||
        editTopic.TypeOfWorkInjury ||
        editTopic.injuryType ||
        "",
    );

    setValueOnly(
      "compensationAmount",
      editTopic.compensationAmount || editTopic.Amount || "",
    );
    setValueOnly(
      "injury_date_hijri",
      editTopic.injury_date_hijri ||
        editTopic.InjuryDateHijri ||
        editTopic.pyTempText ||
        "",
    );
    setValueOnly(
      "injury_date_gregorian",
      editTopic.injury_date_gregorian ||
        editTopic.InjuryDateGregorian ||
        editTopic.InjuryDate_New ||
        "",
    );
    setValueOnly(
      "injuryType",
      editTopic.injuryType || editTopic.TypeOfWorkInjury || "",
    );
  }, [isEditing, editTopic, setValueOnly]);

  const prefillCMR4 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== "CMR-4") return;

    setValueOnly(
      "CMR4_compensationAmount",
      editTopic.CMR4_compensationAmount ||
        editTopic.noticeCompensationAmount ||
        editTopic.Amount ||
        editTopic.amount ||
        "",
    );

    setValueOnly(
      "noticeCompensationAmount",
      editTopic.noticeCompensationAmount ||
        editTopic.Amount ||
        editTopic.amount ||
        "",
    );
  }, [isEditing, editTopic, setValueOnly]);

  const prefillCMR5 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== "CMR-5") return;

    const prefilledLeaveTypeOption = editTopic.CMR5_kindOfHoliday;
    const leaveTypeCode =
      prefilledLeaveTypeOption?.value ||
      editTopic.LeaveType_Code ||
      editTopic.KindOfHoliday_Code ||
      editTopic.kindOfHoliday?.value;
    const leaveTypeLabel =
      prefilledLeaveTypeOption?.label ||
      editTopic.LeaveType ||
      editTopic.KindOfHoliday ||
      editTopic.kindOfHoliday?.label;

    let leaveTypeOption = null;

    if (leaveTypeCode && leaveTypeLabel && leaveTypeCode !== leaveTypeLabel) {
      leaveTypeOption = { value: leaveTypeCode, label: leaveTypeLabel };
    } else if (leaveTypeCode) {
      leaveTypeOption = ensureOption(
        lookupData.leaveTypeData?.DataElements,
        leaveTypeCode,
      );
    } else if (leaveTypeLabel) {
      const matchingElement = lookupData.leaveTypeData?.DataElements?.find(
        (element: any) => element.ElementValue === leaveTypeLabel,
      );
      if (matchingElement) {
        leaveTypeOption = {
          value: matchingElement.ElementKey,
          label: matchingElement.ElementValue,
        };
      }
    }

    setValueOnly(
      "CMR5_kindOfHoliday",
      prefilledLeaveTypeOption || leaveTypeOption,
    );
    setValueOnly(
      "CMR5_totalAmount",
      editTopic.CMR5_totalAmount ||
        editTopic.TotalAmountRequired ||
        editTopic.totalAmount ||
        editTopic.TotalAmount ||
        "",
    );
    setValueOnly(
      "CMR5_workingHours",
      editTopic.CMR5_workingHours ||
        editTopic.WorkingHoursCount ||
        editTopic.workingHours ||
        editTopic.WorkingHours ||
        "",
    );
    setValueOnly(
      "CMR5_additionalDetails",
      editTopic.CMR5_additionalDetails ||
        editTopic.AdditionalDetails ||
        editTopic.additionalDetails ||
        "",
    );

    setValueOnly("kindOfHoliday", leaveTypeOption);
    setValueOnly(
      "totalAmount",
      editTopic.TotalAmountRequired ||
        editTopic.totalAmount ||
        editTopic.TotalAmount ||
        "",
    );
    setValueOnly(
      "workingHours",
      editTopic.WorkingHoursCount ||
        editTopic.workingHours ||
        editTopic.WorkingHours ||
        "",
    );
    setValueOnly(
      "additionalDetails",
      editTopic.AdditionalDetails || editTopic.additionalDetails || "",
    );
  }, [isEditing, editTopic, lookupData, setValueOnly]);

  const prefillCMR6 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== "CMR-6") return;

    setValueOnly(
      "CMR6_fromDateHijri",
      editTopic.CMR6_fromDateHijri ||
        editTopic.FromDateHijri ||
        editTopic.from_date_hijri ||
        editTopic.pyTempDate ||
        "",
    );
    setValueOnly(
      "CMR6_fromDateGregorian",
      editTopic.CMR6_fromDateGregorian ||
        editTopic.FromDate_New ||
        editTopic.from_date_gregorian ||
        "",
    );
    setValueOnly(
      "CMR6_toDateHijri",
      editTopic.CMR6_toDateHijri ||
        editTopic.ToDateHijri ||
        editTopic.to_date_hijri ||
        editTopic.Date_New ||
        "",
    );
    setValueOnly(
      "CMR6_toDateGregorian",
      editTopic.CMR6_toDateGregorian ||
        editTopic.ToDate_New ||
        editTopic.to_date_gregorian ||
        "",
    );
    setValueOnly(
      "CMR6_newPayAmount",
      editTopic.CMR6_newPayAmount ||
        editTopic.NewPayAmount ||
        editTopic.newPayAmount ||
        "",
    );

    const payIncreaseTypePrefilled = editTopic.CMR6_payIncreaseType;
    const payIncreaseTypeCode =
      payIncreaseTypePrefilled?.value ||
      editTopic.PayIncreaseType_Code ||
      editTopic.payIncreaseType?.value;
    const payIncreaseTypeLabel =
      payIncreaseTypePrefilled?.label ||
      editTopic.PayIncreaseType ||
      editTopic.payIncreaseType?.label;

    let payIncreaseTypeOption = null;

    if (
      payIncreaseTypeCode &&
      payIncreaseTypeLabel &&
      payIncreaseTypeCode !== payIncreaseTypeLabel
    ) {
      payIncreaseTypeOption = {
        value: payIncreaseTypeCode,
        label: payIncreaseTypeLabel,
      };
    } else if (payIncreaseTypeCode) {
      payIncreaseTypeOption = ensureOption(
        lookupData.payIncreaseTypeData?.DataElements,
        payIncreaseTypeCode,
      );
    } else if (payIncreaseTypeLabel) {
      const matchingElement =
        lookupData.payIncreaseTypeData?.DataElements?.find(
          (element: any) => element.ElementValue === payIncreaseTypeLabel,
        );
      if (matchingElement) {
        payIncreaseTypeOption = {
          value: matchingElement.ElementKey,
          label: matchingElement.ElementValue,
        };
      }
    }

    setValueOnly(
      "CMR6_payIncreaseType",
      payIncreaseTypePrefilled || payIncreaseTypeOption,
    );
    setValueOnly(
      "CMR6_wageDifference",
      editTopic.CMR6_wageDifference ||
        editTopic.WageDifference ||
        editTopic.wageDifference ||
        "",
    );

    setValueOnly(
      "from_date_hijri",
      editTopic.FromDateHijri ||
        editTopic.from_date_hijri ||
        editTopic.pyTempDate ||
        "",
    );
    setValueOnly(
      "from_date_gregorian",
      editTopic.FromDate_New || editTopic.from_date_gregorian || "",
    );
    setValueOnly(
      "to_date_hijri",
      editTopic.ToDateHijri ||
        editTopic.to_date_hijri ||
        editTopic.Date_New ||
        "",
    );
    setValueOnly(
      "to_date_gregorian",
      editTopic.ToDate_New || editTopic.to_date_gregorian || "",
    );
    setValueOnly(
      "newPayAmount",
      editTopic.NewPayAmount || editTopic.newPayAmount || "",
    );
    setValueOnly("payIncreaseType", payIncreaseTypeOption);
    setValueOnly(
      "wageDifference",
      editTopic.WageDifference || editTopic.wageDifference || "",
    );
  }, [isEditing, editTopic, lookupData, setValueOnly]);

  const prefillCMR7 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== "CMR-7") return;

    setValueOnly(
      "CMR7_fromDateHijri",
      editTopic.CMR7_fromDateHijri ||
        editTopic.FromDateHijri ||
        editTopic.from_date_hijri ||
        editTopic.pyTempDate ||
        "",
    );
    setValueOnly(
      "CMR7_fromDateGregorian",
      editTopic.CMR7_fromDateGregorian ||
        editTopic.FromDate_New ||
        editTopic.from_date_gregorian ||
        "",
    );
    setValueOnly(
      "CMR7_toDateHijri",
      editTopic.CMR7_toDateHijri ||
        editTopic.ToDateHijri ||
        editTopic.to_date_hijri ||
        editTopic.Date_New ||
        "",
    );
    setValueOnly(
      "CMR7_toDateGregorian",
      editTopic.CMR7_toDateGregorian ||
        editTopic.ToDate_New ||
        editTopic.to_date_gregorian ||
        "",
    );
    setValueOnly(
      "CMR7_durationOfLeaveDue",
      editTopic.CMR7_durationOfLeaveDue ||
        editTopic.DurationOfLeaveDue ||
        editTopic.durationOfLeaveDue ||
        "",
    );
    setValueOnly(
      "CMR7_payDue",
      editTopic.CMR7_payDue || editTopic.PayDue || editTopic.payDue || "",
    );

    setValueOnly(
      "from_date_hijri",
      editTopic.FromDateHijri ||
        editTopic.from_date_hijri ||
        editTopic.pyTempDate ||
        "",
    );
    setValueOnly(
      "from_date_gregorian",
      editTopic.FromDate_New || editTopic.from_date_gregorian || "",
    );
    setValueOnly(
      "to_date_hijri",
      editTopic.ToDateHijri ||
        editTopic.to_date_hijri ||
        editTopic.Date_New ||
        "",
    );
    setValueOnly(
      "to_date_gregorian",
      editTopic.ToDate_New || editTopic.to_date_gregorian || "",
    );
    setValueOnly(
      "durationOfLeaveDue",
      editTopic.DurationOfLeaveDue || editTopic.durationOfLeaveDue || "",
    );
    setValueOnly("payDue", editTopic.PayDue || editTopic.payDue || "");
  }, [isEditing, editTopic, setValueOnly]);

  const prefillCMR8 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== "CMR-8") return;

    setValueOnly(
      "CMR8_fromDateHijri",
      editTopic.CMR8_fromDateHijri ||
        editTopic.FromDateHijri ||
        editTopic.from_date_hijri ||
        editTopic.pyTempDate ||
        "",
    );
    setValueOnly(
      "CMR8_fromDateGregorian",
      editTopic.CMR8_fromDateGregorian ||
        editTopic.FromDate_New ||
        editTopic.from_date_gregorian ||
        "",
    );
    setValueOnly(
      "CMR8_toDateHijri",
      editTopic.CMR8_toDateHijri ||
        editTopic.ToDateHijri ||
        editTopic.to_date_hijri ||
        editTopic.Date_New ||
        "",
    );
    setValueOnly(
      "CMR8_toDateGregorian",
      editTopic.CMR8_toDateGregorian ||
        editTopic.ToDate_New ||
        editTopic.to_date_gregorian ||
        "",
    );
    setValueOnly(
      "CMR8_wagesAmount",
      editTopic.CMR8_wagesAmount ||
        editTopic.WagesAmount ||
        editTopic.wagesAmount ||
        "",
    );

    setValueOnly(
      "from_date_hijri",
      editTopic.FromDateHijri ||
        editTopic.from_date_hijri ||
        editTopic.pyTempDate ||
        "",
    );
    setValueOnly(
      "from_date_gregorian",
      editTopic.FromDate_New || editTopic.from_date_gregorian || "",
    );
    setValueOnly(
      "to_date_hijri",
      editTopic.ToDateHijri ||
        editTopic.to_date_hijri ||
        editTopic.Date_New ||
        "",
    );
    setValueOnly(
      "to_date_gregorian",
      editTopic.ToDate_New || editTopic.to_date_gregorian || "",
    );
    setValueOnly(
      "wagesAmount",
      editTopic.WagesAmount || editTopic.wagesAmount || "",
    );
  }, [isEditing, editTopic, setValueOnly]);

  const prefillBR1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== "BR-1") return;

    const prefilledAccordingToAgreement = editTopic.BR1_accordingToAgreement;
    const accordingToAgreementCode =
      prefilledAccordingToAgreement?.value ||
      editTopic.AccordingToAgreement_Code ||
      editTopic.accordingToAgreement?.value;
    const accordingToAgreementLabel =
      prefilledAccordingToAgreement?.label ||
      editTopic.AccordingToAgreement ||
      editTopic.accordingToAgreement?.label;

    let accordingToAgreementOption = null;

    if (
      accordingToAgreementCode &&
      accordingToAgreementLabel &&
      accordingToAgreementCode !== accordingToAgreementLabel
    ) {
      accordingToAgreementOption = {
        value: accordingToAgreementCode,
        label: accordingToAgreementLabel,
      };
    } else if (accordingToAgreementCode) {
      accordingToAgreementOption = ensureOption(
        lookupData.accordingToAgreementLookupData?.DataElements,
        accordingToAgreementCode,
      );
    } else if (accordingToAgreementLabel) {
      const matchingElement =
        lookupData.accordingToAgreementLookupData?.DataElements?.find(
          (element: any) => element.ElementValue === accordingToAgreementLabel,
        );
      if (matchingElement) {
        accordingToAgreementOption = {
          value: matchingElement.ElementKey,
          label: matchingElement.ElementValue,
        };
      }
    }

    if (accordingToAgreementOption) {
      setValueOnly("BR1_accordingToAgreement", accordingToAgreementOption);
    }
    setValueOnly(
      "BR1_bonusAmount",
      editTopic.BR1_bonusAmount ||
        editTopic.bonusAmount ||
        editTopic.BonusAmount ||
        editTopic.Amount ||
        editTopic.Premium ||
        "",
    );
    setValueOnly(
      "BR1_dateHijri",
      editTopic.BR1_dateHijri ||
        editTopic.date_hijri ||
        editTopic.pyTempDate ||
        "",
    );
    setValueOnly(
      "BR1_dateGregorian",
      editTopic.BR1_dateGregorian ||
        editTopic.date_gregorian ||
        editTopic.Date_New ||
        "",
    );

    setLegacyIfValue("accordingToAgreement", accordingToAgreementOption);
    setLegacyIfValue(
      "bonusAmount",
      editTopic.bonusAmount ||
        editTopic.BonusAmount ||
        editTopic.Amount ||
        editTopic.Premium ||
        editTopic.BR1_bonusAmount ||
        "",
    );
    setLegacyIfValue(
      "date_hijri",
      editTopic.date_hijri ||
        editTopic.BR1_dateHijri ||
        editTopic.pyTempDate ||
        "",
    );
    setLegacyIfValue(
      "date_gregorian",
      editTopic.date_gregorian ||
        editTopic.BR1_dateGregorian ||
        editTopic.Date_New ||
        "",
    );
  }, [isEditing, editTopic, lookupData, setValueOnly]);

  const prefillEDO1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== "EDO-1") return;

    const fromLocationCode =
      editTopic.EDO1_fromLocation?.value ||
      editTopic.fromLocation?.value ||
      editTopic.FromLocation_Code ||
      editTopic.fromLocation;
    const fromLocationLabel =
      editTopic.EDO1_fromLocation?.label ||
      editTopic.fromLocation?.label ||
      editTopic.FromLocation;
    if (fromLocationCode && fromLocationLabel) {
      const fromLocationOption = {
        value: fromLocationCode,
        label: fromLocationLabel,
      };
      setValueOnly("EDO1_fromLocation", fromLocationOption);
    }

    const toLocationCode =
      editTopic.EDO1_toLocation?.value ||
      editTopic.toLocation?.value ||
      editTopic.ToLocation_Code ||
      editTopic.toLocation;
    const toLocationLabel =
      editTopic.EDO1_toLocation?.label ||
      editTopic.toLocation?.label ||
      editTopic.ToLocation;
    if (toLocationCode && toLocationLabel) {
      const toLocationOption = {
        value: toLocationCode,
        label: toLocationLabel,
      };
      setValueOnly("EDO1_toLocation", toLocationOption);
    }

    setValueOnly(
      "EDO1_managerialDecisionDateHijri",
      editTopic.EDO1_managerialDecisionDateHijri ||
        editTopic.managerial_decision_date_hijri ||
        editTopic.Date_New ||
        "",
    );
    setValueOnly(
      "EDO1_managerialDecisionDateGregorian",
      editTopic.EDO1_managerialDecisionDateGregorian ||
        editTopic.managerial_decision_date_gregorian ||
        editTopic.ManDecsDate ||
        "",
    );
    setValueOnly(
      "EDO1_managerialDecisionNumber",
      editTopic.EDO1_managerialDecisionNumber ||
        editTopic.managerialDecisionNumber ||
        "",
    );

    setValueOnly(
      "fromLocation",
      editTopic.fromLocation ||
        (fromLocationCode && fromLocationLabel
          ? { value: fromLocationCode, label: fromLocationLabel }
          : null),
    );
    setValueOnly(
      "toLocation",
      editTopic.toLocation ||
        (toLocationCode && toLocationLabel
          ? { value: toLocationCode, label: toLocationLabel }
          : null),
    );
    setValueOnly(
      "managerial_decision_date_hijri",
      editTopic.managerial_decision_date_hijri || editTopic.Date_New || "",
    );
    setValueOnly(
      "managerial_decision_date_gregorian",
      editTopic.managerial_decision_date_gregorian ||
        editTopic.ManDecsDate ||
        "",
    );
    setValueOnly(
      "managerialDecisionNumber",
      editTopic.managerialDecisionNumber || "",
    );
  }, [isEditing, editTopic, setValueOnly]);

  const prefillEDO2 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== "EDO-2") return;

    setValueOnly(
      "EDO2_fromJob",
      editTopic.EDO2_fromJob || editTopic.fromJob || "",
    );
    setValueOnly("EDO2_toJob", editTopic.EDO2_toJob || editTopic.toJob || "");
    setValueOnly(
      "EDO2_managerialDecisionDateHijri",
      editTopic.EDO2_managerialDecisionDateHijri ||
        editTopic.managerial_decision_date_hijri ||
        editTopic.Date_New ||
        "",
    );
    setValueOnly(
      "EDO2_managerialDecisionDateGregorian",
      editTopic.EDO2_managerialDecisionDateGregorian ||
        editTopic.managerial_decision_date_gregorian ||
        editTopic.ManDecsDate ||
        "",
    );
    setValueOnly(
      "EDO2_managerialDecisionNumber",
      editTopic.EDO2_managerialDecisionNumber ||
        editTopic.managerialDecisionNumber ||
        "",
    );

    setValueOnly("fromJob", editTopic.fromJob || "");
    setValueOnly("toJob", editTopic.toJob || "");
    setValueOnly(
      "managerial_decision_date_hijri",
      editTopic.managerial_decision_date_hijri || editTopic.Date_New || "",
    );
    setValueOnly(
      "managerial_decision_date_gregorian",
      editTopic.managerial_decision_date_gregorian ||
        editTopic.ManDecsDate ||
        "",
    );
    setValueOnly(
      "managerialDecisionNumber",
      editTopic.managerialDecisionNumber || "",
    );
  }, [isEditing, editTopic, setValueOnly]);

  const prefillEDO3 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== "EDO-3") return;

    setValueOnly(
      "EDO3_amountOfReduction",
      editTopic.EDO3_amountOfReduction ||
        editTopic.amountOfReduction ||
        editTopic.AmountOfReduction ||
        "",
    );
    setValueOnly(
      "EDO3_managerialDecisionDateHijri",
      editTopic.EDO3_managerialDecisionDateHijri ||
        editTopic.managerial_decision_date_hijri ||
        editTopic.pyTempDate ||
        "",
    );
    setValueOnly(
      "EDO3_managerialDecisionDateGregorian",
      editTopic.EDO3_managerialDecisionDateGregorian ||
        editTopic.managerial_decision_date_gregorian ||
        editTopic.ManagerialDecisionDate_New ||
        "",
    );
    setValueOnly(
      "EDO3_managerialDecisionNumber",
      editTopic.EDO3_managerialDecisionNumber ||
        editTopic.managerialDecisionNumber ||
        "",
    );

    setValueOnly(
      "amountOfReduction",
      editTopic.amountOfReduction || editTopic.AmountOfReduction || "",
    );
    setValueOnly(
      "managerial_decision_date_hijri",
      editTopic.managerial_decision_date_hijri || editTopic.pyTempDate || "",
    );
    setValueOnly(
      "managerial_decision_date_gregorian",
      editTopic.managerial_decision_date_gregorian ||
        editTopic.ManagerialDecisionDate_New ||
        "",
    );
    setValueOnly(
      "managerialDecisionNumber",
      editTopic.managerialDecisionNumber || "",
    );
  }, [isEditing, editTopic, setValueOnly]);

  const prefillEDO4 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== "EDO-4") return;

    const penaltyCode =
      editTopic.EDO4_typesOfPenalties?.value ||
      editTopic.PenalityType_Code ||
      editTopic.TypesOfPenalties_Code ||
      editTopic.typesOfPenalties?.value;
    const penaltyLabel =
      editTopic.EDO4_typesOfPenalties?.label ||
      editTopic.PenalityType ||
      editTopic.TypesOfPenalties ||
      editTopic.typesOfPenalties?.label;

    let penaltyOption = null;

    if (penaltyCode && penaltyLabel && penaltyCode !== penaltyLabel) {
      penaltyOption = { value: penaltyCode, label: penaltyLabel };
    } else if (penaltyCode) {
      penaltyOption = ensureOption(
        lookupData.typesOfPenaltiesData?.DataElements,
        penaltyCode,
      );
    } else if (penaltyLabel) {
      const matchingElement =
        lookupData.typesOfPenaltiesData?.DataElements?.find(
          (element: any) => element.ElementValue === penaltyLabel,
        );
      if (matchingElement) {
        penaltyOption = {
          value: matchingElement.ElementKey,
          label: matchingElement.ElementValue,
        };
      }
    }

    setValueOnly("EDO4_typesOfPenalties", penaltyOption);

    setValueOnly(
      "EDO4_managerialDecisionDateHijri",
      editTopic.EDO4_managerialDecisionDateHijri ||
        editTopic.ManagerialDecisionDateHijri ||
        editTopic.managerial_decision_date_hijri ||
        editTopic.Date_New ||
        "",
    );
    setValueOnly(
      "EDO4_managerialDecisionDateGregorian",
      editTopic.EDO4_managerialDecisionDateGregorian ||
        editTopic.ManagerialDecisionDateGregorian ||
        editTopic.managerial_decision_date_gregorian ||
        editTopic.ManDecsDate ||
        "",
    );
    setValueOnly(
      "EDO4_managerialDecisionNumber",
      editTopic.EDO4_managerialDecisionNumber ||
        editTopic.managerialDecisionNumber ||
        "",
    );

    setValueOnly(
      "typesOfPenalties",
      editTopic.typesOfPenalties || penaltyOption,
    );
    setValueOnly(
      "managerial_decision_date_hijri",
      editTopic.ManagerialDecisionDateHijri ||
        editTopic.managerial_decision_date_hijri ||
        editTopic.Date_New ||
        "",
    );
    setValueOnly(
      "managerial_decision_date_gregorian",
      editTopic.ManagerialDecisionDateGregorian ||
        editTopic.managerial_decision_date_gregorian ||
        editTopic.ManDecsDate ||
        "",
    );
    setValueOnly(
      "managerialDecisionNumber",
      editTopic.managerialDecisionNumber || "",
    );
  }, [isEditing, editTopic, lookupData, setValueOnly]);

  const prefillHIR1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== "HIR-1") return;

    const bylawsYes =
      editTopic.IsBylawsIncludeAddingAccommodation === "Yes" ||
      editTopic.IsBylawsIncludeAddingAccommodiation === "Yes";
    const contractYes =
      editTopic.IsContractIncludeAddingAccommodation === "Yes" ||
      editTopic.IsContractIncludeAddingAccommodiation === "Yes";

    const hasBylawsSpecs = !!(
      editTopic.HousingSpecificationsInBylaws &&
      String(editTopic.HousingSpecificationsInBylaws).trim() !== ""
    );
    const hasContractSpecs = !!(
      (editTopic.HousingSpecificationsInContract &&
        String(editTopic.HousingSpecificationsInContract).trim() !== "") ||
      (editTopic.HousingSpecifications &&
        String(editTopic.HousingSpecifications).trim() !== "")
    );

    const sourceChoice = bylawsYes
      ? "bylaws"
      : contractYes
        ? "contract"
        : hasBylawsSpecs
          ? "bylaws"
          : hasContractSpecs
            ? "contract"
            : undefined;

    if (sourceChoice) {
      setValueOnly("HIR1_AccommodationSource", sourceChoice, {
        shouldValidate: false,
        shouldDirty: false,
      });
    }

    setTimeout(() => {
      const bylawsA = editTopic.IsBylawsIncludeAddingAccommodation;
      const bylawsB = editTopic.IsBylawsIncludeAddingAccommodiation;
      const bylawsFlag =
        bylawsA === "Yes" || bylawsB === "Yes"
          ? "Yes"
          : (bylawsA ?? bylawsB ?? "");
      const contractA = editTopic.IsContractIncludeAddingAccommodation;
      const contractB = editTopic.IsContractIncludeAddingAccommodiation;
      const contractFlag =
        contractA === "Yes" || contractB === "Yes"
          ? "Yes"
          : (contractA ?? contractB ?? "");
      setValueOnly("HIR1_IsBylawsIncludeAddingAccommodation", bylawsFlag, {
        shouldValidate: false,
        shouldDirty: false,
      });
      setValueOnly("HIR1_IsContractIncludeAddingAccommodation", contractFlag, {
        shouldValidate: false,
        shouldDirty: false,
      });

      const specInBylaws =
        editTopic.HousingSpecificationsInBylaws ||
        editTopic.HIR1_HousingSpecificationsInBylaws ||
        "";
      const specInContract =
        editTopic.HousingSpecificationsInContract ||
        editTopic.HIR1_HousingSpecificationsInContract ||
        "";
      const specActual =
        editTopic.HousingSpecifications ||
        editTopic.HIR1_HousingSpecifications ||
        "";

      if (sourceChoice === "bylaws") {
        setValueOnly("HIR1_HousingSpecificationsInBylaws", specInBylaws, {
          shouldValidate: false,
          shouldDirty: false,
        });

        setValueOnly("HIR1_HousingSpecificationsInContract", "", {
          shouldValidate: false,
          shouldDirty: false,
        });
        setValueOnly("HIR1_HousingSpecifications", "", {
          shouldValidate: false,
          shouldDirty: false,
        });
      } else if (sourceChoice === "contract") {
        setValueOnly("HIR1_HousingSpecificationsInContract", specInContract, {
          shouldValidate: false,
          shouldDirty: false,
        });
        setValueOnly("HIR1_HousingSpecifications", specActual, {
          shouldValidate: false,
          shouldDirty: false,
        });

        setValueOnly("HIR1_HousingSpecificationsInBylaws", "", {
          shouldValidate: false,
          shouldDirty: false,
        });
      }

      try {
        if (sourceChoice === "bylaws") {
          trigger(["HIR1_HousingSpecificationsInBylaws"]);
        } else if (sourceChoice === "contract") {
          trigger([
            "HIR1_HousingSpecificationsInContract",
            "HIR1_HousingSpecifications",
          ]);
        }
      } catch {}
    }, 50);
  }, [isEditing, editTopic, setValueOnly]);

  const prefillJAR2 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== "JAR-2") return;

    setValueOnly(
      "JAR2_currentJobTitle",
      editTopic.JAR2_currentJobTitle ||
        editTopic.CurrentJobTitle ||
        editTopic.currentJobTitle ||
        "",
    );
    setValueOnly(
      "JAR2_requiredJobTitle",
      editTopic.JAR2_requiredJobTitle ||
        editTopic.RequiredJobTitle ||
        editTopic.requiredJobTitle ||
        "",
    );

    setValueOnly(
      "currentJobTitle",
      editTopic.currentJobTitle ||
        editTopic.CurrentJobTitle ||
        editTopic.JAR2_currentJobTitle ||
        "",
    );
    setValueOnly(
      "requiredJobTitle",
      editTopic.requiredJobTitle ||
        editTopic.RequiredJobTitle ||
        editTopic.JAR2_requiredJobTitle ||
        "",
    );
  }, [isEditing, editTopic, setValueOnly]);

  const prefillJAR3 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== "JAR-3") return;

    setValueOnly(
      "JAR3_promotionMechanism",
      editTopic.JAR3_promotionMechanism ||
        editTopic.PromotionMechanism ||
        editTopic.promotionMechanism ||
        "",
    );
    setValueOnly(
      "JAR3_additionalUpgrade",
      editTopic.JAR3_additionalUpgrade ||
        editTopic.AdditionalUpgrade ||
        editTopic.additionalUpgrade ||
        "",
    );

    setValueOnly(
      "promotionMechanism",
      editTopic.promotionMechanism || editTopic.PromotionMechanism || "",
    );
    setValueOnly(
      "additionalUpgrade",
      editTopic.additionalUpgrade || editTopic.AdditionalUpgrade || "",
    );

    const explicitChoice = editTopic.JAR3_JobApplicationRequest;
    if (
      explicitChoice === "promotionMechanism" ||
      explicitChoice === "contractUpgrade"
    ) {
      setValueOnly("JAR3_JobApplicationRequest", explicitChoice);
    } else {
      const hasPromotionMechanism =
        editTopic.JAR3_promotionMechanism === "Yes" ||
        editTopic.PromotionMechanism === "Yes" ||
        editTopic.promotionMechanism === "Yes";
      const hasAdditionalUpgrade =
        editTopic.JAR3_additionalUpgrade === "Yes" ||
        editTopic.AdditionalUpgrade === "Yes" ||
        editTopic.additionalUpgrade === "Yes";

      if (hasPromotionMechanism) {
        setValueOnly("JAR3_JobApplicationRequest", "promotionMechanism");
      } else if (hasAdditionalUpgrade) {
        setValueOnly("JAR3_JobApplicationRequest", "contractUpgrade");
      } else {
        setValueOnly("JAR3_JobApplicationRequest", "promotionMechanism");
      }
    }
  }, [isEditing, editTopic, setValueOnly]);

  const prefillJAR4 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== "JAR-4") return;

    setValueOnly(
      "JAR4_CurrentPosition",
      editTopic.JAR4_CurrentPosition ||
        editTopic.CurrentPosition ||
        editTopic.currentPosition ||
        "",
    );
    setValueOnly(
      "JAR4_WantedJob",
      editTopic.JAR4_WantedJob ||
        editTopic.WantedJob ||
        editTopic.theWantedJob ||
        "",
    );

    setValueOnly(
      "currentPosition",
      editTopic.currentPosition || editTopic.CurrentPosition || "",
    );
    setValueOnly(
      "theWantedJob",
      editTopic.theWantedJob || editTopic.WantedJob || "",
    );
  }, [isEditing, editTopic, setValueOnly]);

  const prefillLRESR1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== "LRESR-1") return;

    setValueOnly(
      "LRESR1_Amount",
      editTopic.LRESR1_Amount || editTopic.Amount || editTopic.amount || "",
    );

    setValueOnly(
      "endOfServiceRewardAmount",
      editTopic.endOfServiceRewardAmount ||
        editTopic.Amount ||
        editTopic.amount ||
        "",
    );
  }, [isEditing, editTopic, setValueOnly]);

  const prefillTTR1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== "TTR-1") return;

    const travelingWayCode =
      editTopic.TTR1_travelingWay?.value ||
      editTopic.TravelingWay_Code ||
      editTopic.travelingWay?.value;
    const travelingWayLabel =
      editTopic.TTR1_travelingWay?.label ||
      editTopic.TravelingWay ||
      editTopic.travelingWay?.label;

    let travelingWayOption = null;

    if (travelingWayCode) {
      const matchingElement = lookupData.travelingWayData?.DataElements?.find(
        (element: any) => element.ElementKey === travelingWayCode,
      );

      if (matchingElement) {
        travelingWayOption = {
          value: matchingElement.ElementKey,
          label: matchingElement.ElementValue,
        };
      } else {
        travelingWayOption = {
          value: travelingWayCode,
          label: travelingWayLabel || travelingWayCode,
        };
      }
    }

    if (!travelingWayOption && travelingWayLabel) {
      const matchingElement = lookupData.travelingWayData?.DataElements?.find(
        (element: any) => element.ElementValue === travelingWayLabel,
      );
      if (matchingElement) {
        travelingWayOption = {
          value: matchingElement.ElementKey,
          label: matchingElement.ElementValue,
        };
      }
    }

    if (!travelingWayOption && (travelingWayCode || travelingWayLabel)) {
      travelingWayOption = {
        value: travelingWayCode || travelingWayLabel,
        label: travelingWayLabel || travelingWayCode,
      };
    }

    setValueOnly("TTR1_travelingWay", travelingWayOption);

    setValueOnly("travelingWay", travelingWayOption);
  }, [isEditing, editTopic, lookupData, setValueOnly]);

  const prefillRFR1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== "RFR-1") return;

    setValueOnly(
      "RFR1_Amount",
      editTopic.RFR1_Amount || editTopic.Amount || editTopic.amount || "",
    );
    setValueOnly(
      "RFR1_Consideration",
      editTopic.RFR1_Consideration ||
        editTopic.Consideration ||
        editTopic.consideration ||
        "",
    );
    setValueOnly(
      "RFR1_dateHijri",
      editTopic.RFR1_dateHijri ||
        editTopic.date_hijri ||
        editTopic.pyTempDate ||
        "",
    );
    setValueOnly(
      "RFR1_dateGregorian",
      editTopic.RFR1_dateGregorian ||
        editTopic.date_gregorian ||
        editTopic.Date_New ||
        "",
    );

    setValueOnly(
      "rewardRequestAmount",
      editTopic.rewardRequestAmount ||
        editTopic.Amount ||
        editTopic.amount ||
        "",
    );
    setValueOnly(
      "consideration",
      editTopic.consideration || editTopic.Consideration || "",
    );
    setValueOnly(
      "date_hijri",
      editTopic.date_hijri || editTopic.pyTempDate || "",
    );
    setValueOnly(
      "date_gregorian",
      editTopic.date_gregorian || editTopic.Date_New || "",
    );
  }, [isEditing, editTopic, setValueOnly]);

  const prefillRR1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== "RR-1") return;

    const rr1Amount =
      editTopic.RR1_Amount ||
      editTopic.rewardAmount ||
      editTopic.Amount ||
      editTopic.amount ||
      "";
    const rr1Type =
      editTopic.RR1_Type || editTopic.rewardType || editTopic.Type || "";

    setValueOnly("RR1_Amount", rr1Amount);
    setValueOnly("RR1_Type", rr1Type);

    setLegacyIfValue("rewardAmount", rr1Amount);
    setLegacyIfValue("rewardType", rr1Type);
  }, [isEditing, editTopic, setValueOnly]);

  const prefillLCUT1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== "LCUT-1") return;

    setValueOnly(
      "LCUT1_amountOfCompensation",
      editTopic.LCUT1_amountOfCompensation ||
        editTopic.amountOfCompensation ||
        editTopic.AmountOfCompensation ||
        "",
    );

    setValueOnly(
      "amountOfCompensation",
      editTopic.amountOfCompensation || editTopic.AmountOfCompensation || "",
    );
  }, [isEditing, editTopic, setValueOnly]);

  const prefillDR1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== "DR-1") return;
  }, [isEditing, editTopic]);

  const prefillCR1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== "CR-1") return;

    const typeOfCustodyCode =
      editTopic.TypeOfCustody_Code || editTopic.typeOfCustody?.value;
    const typeOfCustodyLabel =
      editTopic.TypeOfCustody || editTopic.typeOfCustody?.label;

    let typeOfCustodyOption = null;

    if (typeOfCustodyCode) {
      typeOfCustodyOption = ensureOption(
        lookupData.typeOfCustodyData?.DataElements,
        typeOfCustodyCode,
      );
    } else if (typeOfCustodyLabel) {
      const matchingElement = lookupData.typeOfCustodyData?.DataElements?.find(
        (element: any) => element.ElementValue === typeOfCustodyLabel,
      );
      if (matchingElement) {
        typeOfCustodyOption = {
          value: matchingElement.ElementKey,
          label: matchingElement.ElementValue,
        };
      }
    }

    setValueOnly("typeOfCustody", typeOfCustodyOption);

    const compensationAmountValue =
      editTopic.CR1_compensationAmount ||
      editTopic.CompensationAmount ||
      editTopic.compensationAmount ||
      editTopic.Amount ||
      editTopic.amount ||
      "";

    setValueOnly("CR1_compensationAmount", compensationAmountValue);
    setValueOnly("compensationAmount", compensationAmountValue);
  }, [isEditing, editTopic, lookupData, setValueOnly]);

  const prefillLCUTE1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== "LCUTE-1") return;

    const amount =
      editTopic.LCUTE1_amountOfCompensation ||
      editTopic.amountOfCompensation ||
      editTopic.AmountOfCompensation ||
      "";
    setValueOnly("LCUTE1_amountOfCompensation", amount);
    setValueOnly("amountOfCompensation", amount);
  }, [isEditing, editTopic, setValueOnly]);

  const prefillDPVR1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== "DPVR-1") return;

    const damagedType =
      editTopic.DPVR1_damagedType ||
      editTopic.damagedType ||
      editTopic.SpoilerType ||
      "";
    const damagedValue =
      editTopic.DPVR1_damagedValue ||
      editTopic.damagedValue ||
      editTopic.DamagedValue ||
      "";
    setValueOnly("DPVR1_damagedType", damagedType);
    setValueOnly("DPVR1_damagedValue", damagedValue);
    setValueOnly("damagedType", damagedType);
    setValueOnly("damagedValue", damagedValue);
  }, [isEditing, editTopic, setValueOnly]);

  const prefillAWRW1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== "AWRW-1") return;
  }, [isEditing, editTopic]);

  const prefillAWRW2 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== "AWRW-2") return;
  }, [isEditing, editTopic]);

  const prefillRLRAHI1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== "RLRAHI-1") return;

    const requestTypeValue =
      editTopic.RLRAHI1_typeOfRequest?.value ||
      editTopic.typeOfRequest?.value ||
      editTopic.RequestType_Code ||
      editTopic.RequestType;
    const requestTypeLabel =
      editTopic.RLRAHI1_typeOfRequest?.label ||
      editTopic.typeOfRequest?.label ||
      editTopic.TypeOfRequest ||
      editTopic.RequestType ||
      requestTypeValue;

    if (requestTypeValue) {
      const requestTypeOption = {
        value: requestTypeValue,
        label: requestTypeLabel,
      };

      setValueOnly("RLRAHI1_typeOfRequest", requestTypeOption);
      setValueOnly("typeOfRequest", requestTypeOption);
    }

    if (requestTypeValue === "RLRAHI2") {
      const loanAmount =
        editTopic.RLRAHI1_loanAmount ||
        editTopic.loanAmount ||
        editTopic.LoanAmount ||
        "";
      setValueOnly("RLRAHI1_loanAmount", loanAmount);
      setValueOnly("loanAmount", loanAmount);
    } else {
      const typeOfCustody =
        editTopic.RLRAHI1_typeOfCustody ||
        editTopic.typeOfCustody ||
        editTopic.TypeOfCustody ||
        "";
      const requestDateHijri =
        editTopic.RLRAHI1_request_date_hijri ||
        editTopic.request_date_hijri ||
        editTopic.Date_New ||
        "";
      const requestDateGregorian =
        editTopic.RLRAHI1_request_date_gregorian ||
        editTopic.request_date_gregorian ||
        editTopic.RequestDate_New ||
        "";

      setValueOnly("RLRAHI1_typeOfCustody", typeOfCustody);
      setValueOnly("RLRAHI1_request_date_hijri", requestDateHijri);
      setValueOnly("RLRAHI1_request_date_gregorian", requestDateGregorian);
      setValueOnly("typeOfCustody", typeOfCustody);
      setValueOnly("request_date_hijri", requestDateHijri);
      setValueOnly("request_date_gregorian", requestDateGregorian);
    }
  }, [isEditing, editTopic, setValueOnly]);

  const prefillRUF1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== "RUF-1") {
      return;
    }

    const refundType =
      editTopic.RUF1_refundType ||
      editTopic.refundType ||
      editTopic.RefundType ||
      "";
    const amount =
      editTopic.RUF1_refundAmount ||
      editTopic.refundAmount ||
      editTopic.amount ||
      editTopic.Amount ||
      "";

    setValueOnly("RUF1_refundType", refundType);
    setValueOnly("RUF1_refundAmount", amount);
    setValueOnly("RefundType", refundType);
    setValueOnly("refundAmount", amount);
  }, [isEditing, editTopic, setValueOnly]);

  const prefillSubTopic = useCallback(() => {
    if (!isEditing || !editTopic) {
      return;
    }

    const subTopicId = editTopic.SubTopicID;
    const topicIndex = editTopic.index;
    const topicId = editTopic.topicId || editTopic.id;

    const uniqueKey = `${subTopicId}-${editTopic.MainTopicID}-${topicIndex}-${
      topicId || "no-id"
    }`;

    if (prefillDoneRef.current !== uniqueKey) {
      prefillDoneRef.current = uniqueKey;
    } else {
    }

    switch (subTopicId) {
      case "WR-1":
        prefillWR1();
        break;
      case "WR-2":
        prefillWR2();
        break;
      case "BPSR-1":
        prefillBPSR1();
        break;
      case "MIR-1":
        prefillMIR1();
        break;
      case "CMR-1":
        prefillCMR1();
        break;
      case "CMR-3":
        prefillCMR3();
        break;
      case "CMR-4":
        prefillCMR4();
        break;
      case "CMR-5":
        prefillCMR5();
        break;
      case "CMR-6":
        prefillCMR6();
        break;
      case "CMR-7":
        prefillCMR7();
        break;
      case "CMR-8":
        prefillCMR8();
        break;
      case "BR-1":
        prefillBR1();
        break;
      case "EDO-1":
        prefillEDO1();
        break;
      case "EDO-2":
        prefillEDO2();
        break;
      case "EDO-3":
        prefillEDO3();
        break;
      case "EDO-4":
        prefillEDO4();
        break;
      case "HIR-1":
        prefillHIR1();
        break;
      case "JAR-2":
        prefillJAR2();
        break;
      case "JAR-3":
        prefillJAR3();
        break;
      case "JAR-4":
        prefillJAR4();
        break;
      case "LRESR-1":
        prefillLRESR1();
        break;
      case "TTR-1":
        prefillTTR1();
        break;
      case "RFR-1":
        prefillRFR1();
        break;
      case "RR-1":
        prefillRR1();
        break;
      case "LCUT-1":
        prefillLCUT1();
        break;
      case "DR-1":
        prefillDR1();
        break;

      case "CR-1":
        prefillCR1();
        break;
      case "LCUTE-1":
        prefillLCUTE1();
        break;
      case "DPVR-1":
        prefillDPVR1();
        break;
      case "AWRW-1":
        prefillAWRW1();
        break;
      case "AWRW-2":
        prefillAWRW2();
        break;
      case "RLRAHI-1":
        prefillRLRAHI1();
        break;
      case "RUF-1":
        prefillRUF1();
        break;

      default:
        break;
    }
  }, [
    isEditing,
    editTopic,

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

    prefillCR1,
    prefillLCUTE1,
    prefillDPVR1,
    prefillAWRW1,
    prefillAWRW2,
    prefillRLRAHI1,
    prefillRUF1,
  };
};
