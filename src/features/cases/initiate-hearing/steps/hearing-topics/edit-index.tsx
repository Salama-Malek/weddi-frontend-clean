import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { useForm, useWatch, useFormContext } from "react-hook-form";
import Button from "@shared/components/button";
import TableLoader from "@shared/components/loader/TableLoader";
import { CustomPagination } from "@shared/components/pagination/CustomPagination";
import useToggle from "@shared/hooks/generalSate";
import { useTranslation } from "react-i18next";
import auditIcon from "@/assets/audit-01.svg";
import { Add01Icon } from "hugeicons-react";
import { useDateContext } from "@shared/components/calanders/DateContext";
import AttachmentSection from "./components/AttachmentSection";
import AttachmentModal from "./components/AttachmentModal";
import FilePreviewModal from "../add-attachments/FilePreviewModal";
import { useLookup } from "../../api/hook/useLookup";
import { useSubTopicsSubLookupQuery } from "../../api/create-case/addHearingApis";
import { FormProvider as RHFFormProvider } from "react-hook-form";
import { setFormData } from "@app/redux/slices/formSlice";
import StepNavigation from "@shared/modules/case-creation/components/StepNavigation";
import { useNavigationService } from "@shared/hooks/useNavigationService";
import { steps } from "@shared/modules/case-creation/components/tabs/tabsConfig";
import {
  useLazyGetFileDetailsQuery,
  useUpdateHearingTopicsMutation,
} from "../../api/create-case/apis";
import { useCookieState } from "../../hooks/useCookieState";
import { TableSkeletonLoader } from "@shared/components/loader/SkeletonLoader";
import { TopicFormValues } from "./hearing.topics.types";
import { getHearingTopicsColumns } from "./config/colums";
import { useAttachments } from "./hooks/useAttachments";
import { useFormLayout as useFormLayoutWorker } from "./config/forms.layout.worker";
import { useFormLayout as useFormLayoutEstablishment } from "./config/forms.layout.establishment";
import { getPayloadBySubTopicID } from "./api/case.topics.payload";
import { useLazyGetCaseDetailsQuery } from "@features/cases/manage-hearings/api/myCasesApis";
import { TokenClaims } from "@features/auth/components/AuthProvider";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ApiResponse } from "@shared/modules/case-creation/components/StepNavigation";
import useCaseTopicsPrefill from "./hooks/useCaseTopicsPrefill";
import { useGetRegionLookupDataQuery } from "@features/cases/initiate-hearing/api/create-case/workDetailApis";
import { Option } from "@shared/components/form/form.types";
import FileAttachment from "@shared/components/ui/file-attachment/FileAttachment";
import { DateObject } from "react-multi-date-picker";
import gregorianCalendar from "react-date-object/calendars/gregorian";
import gregorianLocale from "react-date-object/locales/gregorian_en";
import arabicCalendar from "react-date-object/calendars/arabic";
import arabicLocale from "react-date-object/locales/arabic_ar";
import { useApiErrorHandler } from "@shared/hooks/useApiErrorHandler";
import FeaturedIcon from "@/assets/Featured icon.svg";
import { useRemoveAttachmentMutation } from "./api/apis";
import { isOtherCommission } from "./utils/isOtherCommission";
import { isOtherAllowance } from "./utils/isOtherAllowance";
import { useSubTopicPrefill } from "./hooks/useSubTopicPrefill";
import useCaseSave from "../../hooks/useCaseSave";

const Modal = lazy(() => import("@shared/components/modal/Modal"));
const ReusableTable = lazy(() =>
  import("@shared/components/table/ReusableTable").then((m) => ({
    default: m.ReusableTable,
  }))
);
const DynamicForm = lazy(() =>
  import("@shared/components/form/DynamicForm").then((m) => ({
    default: m.DynamicForm,
  }))
);

const HearingCta = lazy(() => import("./components/HearingCta"));


function resolveOption(
  list: { ElementKey: string; ElementValue: string }[] | undefined,
  code?: string,
  fallbackLabel?: string
) {
  if (!code) return null;
  const hit = list?.find((i) => String(i.ElementKey) === String(code));
  return { value: code, label: hit ? hit.ElementValue : (fallbackLabel ?? code) };
}

// const makeOption = (
//   list: { ElementKey: string; ElementValue: string }[] | undefined,
//   code?: string,
//   fallbackLabel?: string
// ): Option | null => {
//   if (!code) return null;
//   const hit = list?.find(i => String(i.ElementKey) === String(code));
//   return { value: code, label: hit ? hit.ElementValue : (fallbackLabel ?? code) };
// };

export const ensureOption = (
  opts: { ElementKey: string; ElementValue: string }[] | Option[] | undefined,
  code?: any,
  fallbackLabel?: string
): Option | null => {
  if (!code) return null;
  const val = String(code);
  const hit =
    (opts as any[])?.find((o) =>
      "ElementKey" in o ? String(o.ElementKey) === val : String(o.value) === val
    ) ?? null;

  if (!hit) return { value: val, label: fallbackLabel ?? val };
  return "ElementKey" in hit
    ? { value: hit.ElementKey, label: hit.ElementValue }
    : hit;
};


interface AttachmentFile {
  FileType: string;
  FileName: string;
  FileKey: string;
}

export const useHearingTopics = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language.toUpperCase();

  return {
    getTopics: () => ({
      url: `/WeddiServices/V1/Topics`,
      params: {
        AcceptedLanguage: currentLanguage,
        SourceSystem: "E-Services",
      },
    }),
  };
};

function EditHearingTopicsDetails({
  showFooter,
  onSaveApi,
}: {
  showFooter: boolean;
  onSaveApi?: (payload: any) => Promise<any>;
}) {
  const methods = useForm<any>();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    getValues,
    trigger,
    formState,
    formState: {
      errors,
      isValid,
      isDirty,
      isSubmitting,
      isSubmitSuccessful,
      submitCount,
    },
    unregister,
    clearErrors,
  } = methods;

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prefillDoneRef = useRef<string | null>(null);
  const isUpdatingRef = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Reset refs on cleanup
      isUpdatingRef.current = false;
      prefillDoneRef.current = null;
    };
  }, []);

  const [getCookie] = useCookieState({ caseId: "" });
  const [caseId, setCaseId] = useState(getCookie("caseId"));
  const navigate = useNavigate();

  // Modal state for critical errors with countdown
  const [showCriticalErrorModal, setShowCriticalErrorModal] = useState(false);
  const [criticalErrorMessage, setCriticalErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(7);

  // Watch for changes in the caseId cookie and update state accordingly
  useEffect(() => {
    const currentCookieCaseId = getCookie("caseId");
    if (currentCookieCaseId !== caseId) {
      console.log("[🔍 CASE ID UPDATE] Cookie caseId changed from", caseId, "to", currentCookieCaseId);
      setCaseId(currentCookieCaseId);
    }
  }, [getCookie, caseId]);

  // Handle countdown and navigation in useEffect
  useEffect(() => {
    if (!showCriticalErrorModal) return;

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setShowCriticalErrorModal(false);
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [showCriticalErrorModal, navigate]);

  const [lastSaved, setLastSaved] = useState(false);
  const { updateParams, currentStep, currentTab } = useNavigationService();
  console.log("[🔍 EDIT HEARING TOPICS DETAILS] Component rendered with showFooter:", showFooter, "currentStep:", currentStep);
  const [updateHearingTopics, { isLoading: addHearingLoading }] =
    useUpdateHearingTopicsMutation();
  const UserClaims: TokenClaims = getCookie("userClaims");
  const userType = getCookie("userType");
  const defendantStatus = getCookie("defendantStatus");
  const mainCategory2 = getCookie("mainCategory")?.value;
  const subCategory2 = getCookie("subCategory")?.value;
  const userID = getCookie("userClaims")?.UserID;
  const fileNumber = getCookie("userClaims")?.File_Number;

  const { i18n } = useTranslation();
  const currentLanguage = i18n.language.toUpperCase();

  const { handleResponse } = useApiErrorHandler();

  const onSubmit = async (data: TopicFormValues) => {
    console.log("[🔍 onSubmit] Called with data:", data);
    console.log("[🔍 onSubmit] Form state:", { isValid, isSubmitting, lastAction });
    
    // Prevent multiple rapid Next button calls
    if (lastAction === "Next" || isSubmitting) {
      console.log("[🔍 onSubmit] Preventing multiple calls - lastAction:", lastAction, "isSubmitting:", isSubmitting);
      return;
    }
    
    try {
      console.log("[🔍 onSubmit] About to call handleNext");
      console.log("[🔍 onSubmit] Current loading state:", { isSubmitting, isUpdatingRef: isUpdatingRef.current });
      
      const result = await handleNext();
      console.log("[🔍 onSubmit] handleNext result:", result);
      
      if (result.success && result.response) {
        // Only show success toast if we have a confirmed successful API response
        const hasSuccessCode = result.response?.SuccessCode === "200";
        const hasSuccessStatus = result.response?.ServiceStatus === "Success";
        const hasNoErrors = !result.response?.ErrorCodeList || result.response.ErrorCodeList.length === 0;
        
        console.log("[🔍 onSubmit] Response analysis:", {
          hasSuccessCode,
          hasSuccessStatus,
          hasNoErrors,
          SuccessCode: result.response?.SuccessCode,
          ServiceStatus: result.response?.ServiceStatus,
          ErrorCodeList: result.response?.ErrorCodeList,
          fullResponse: result.response
        });
        
        // More robust success condition - prioritize ServiceStatus when SuccessCode is not present
        const isSuccessful = (hasSuccessStatus && hasNoErrors) || (hasSuccessCode && hasNoErrors);
        
        if (isSuccessful) {
          console.log("[🔍 onSubmit] API call confirmed successful, showing success toast");
          toast.success(t("save_success"));
        } else {
          console.log("[🔍 onSubmit] API call not successful, not showing success toast");
          console.log("[🔍 onSubmit] Failed conditions:", {
            hasSuccessCode,
            hasSuccessStatus,
            hasNoErrors,
            isSuccessful
          });
        }
      } else if (result.error) {
        console.error("[🔍 onSubmit] handleNext failed:", result.error);
        // Show error toast based on the actual error from API
        const errorMessage = result.error?.ErrorDesc || 
                            result.error?.message || 
                            t("api_error_generic");
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error("[🔍 onSubmit] Unexpected error in handleNext:", error);
      toast.error(t("api_error_generic"));
    }
  };

  // Function to handle critical errors with modal and countdown
  const handleCriticalError = useCallback((message: string) => {
    console.log("[🔍 CRITICAL ERROR] Setting modal with message:", message);
    setCriticalErrorMessage(message);
    setShowCriticalErrorModal(true);
    setCountdown(7);
  }, []);

  const mainCategory = watch("mainCategory") ?? null;
  const subCategory: any = watch("subCategory") ?? null;
  const { t } = useTranslation("hearingtopics");
  const { t: tManageHearing } = useTranslation("manageHearingDetails");
  const { isOpen, close, toggle } = useToggle();
  const userClaims = getCookie("userClaims");
  const [caseTopics, setCaseTopics] = useState<any[]>([]);

  const [delTopic, setDelTopic] = useState<any | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editTopic, setEditTopic] = useState<any | null>(null);
  const [editTopicIndex, setEditTopicIndex] = useState<number | null>(null);
  const [showLegalSection, setShowLegalSection] = useState(false);
  const [showTopicData, setShowTopicData] = useState(false);

  // Define isEditing before any usage
  const isEditing = Boolean(editTopic);
  const isHIR1 = editTopic?.subCategory?.value === "HIR-1";
  const lockAccommodationSource = isEditing && isHIR1;

  useEffect(() => {
    // Don't interfere with prefilling when editing
    if (isEditing) return;

    if (subCategory?.value && mainCategory?.value) {
      goToLegalStep();
    }
  }, [subCategory?.value, mainCategory?.value, isEditing]);

  // Unregister fields when subcategory changes to prevent stale data
  useEffect(() => {
    if (isEditing) return; // Don't unregister when editing

    const currentSubCategory = subCategory?.value;
    if (!currentSubCategory) return;

    // Define fields for each subcategory
    const subcategoryFields: Record<string, string[]> = {
      "CMR-8": ["CMR8_wagesAmount", "CMR8_fromDateHijri", "CMR8_fromDateGregorian", "CMR8_toDateHijri", "CMR8_toDateGregorian"],
      "BR-1": ["BR1_accordingToAgreement", "BR1_bonusAmount", "BR1_dateHijri", "BR1_dateGregorian"],
      "BPSR-1": ["BPSR1_commissionType", "BPSR1_accordingToAgreement", "BPSR1_bonusProfitShareAmount", "BPSR1_amountRatio", "BPSR1_otherCommission", "BPSR1_fromDateHijri", "BPSR1_fromDateGregorian", "BPSR1_toDateHijri", "BPSR1_toDateGregorian"],
      "DR-1": [],
      "JAR-3": ["JAR3_promotionMechanism", "JAR3_additionalUpgrade"],
      "JAR-4": ["JAR4_CurrentPosition", "JAR4_WantedJob"],
      "RFR-1": ["RFR1_Amount", "RFR1_Consideration", "RFR1_dateHijri", "RFR1_dateGregorian"],
      "LRESR-1": ["LRESR1_Amount"],
      "RUF-1": ["refundType", "refundAmount"],
      "WR-1": ["WR1_forAllowance", "WR1_otherAllowance"],
      "WR-2": ["WR2_wageAmount"],
      "CMR-1": ["CMR1_amountsPaidFor", "CMR1_theAmountRequired"],
      "CMR-3": ["CMR3_compensationAmount", "CMR3_injuryDateHijri", "CMR3_injuryDateGregorian", "CMR3_injuryType"],
      "CMR-4": ["CMR4_compensationAmount"],
      "CMR-5": ["CMR5_kindOfHoliday", "CMR5_totalAmount", "CMR5_workingHours", "CMR5_additionalDetails"],
      "CMR-6": ["CMR6_newPayAmount", "CMR6_payIncreaseType", "CMR6_wageDifference", "CMR6_fromDateHijri", "CMR6_fromDateGregorian", "CMR6_toDateHijri", "CMR6_toDateGregorian"],
      "CMR-7": ["CMR7_durationOfLeaveDue", "CMR7_payDue", "CMR7_fromDateHijri", "CMR7_fromDateGregorian", "CMR7_toDateHijri", "CMR7_toDateGregorian"],
      "EDO-1": ["EDO1_fromLocation", "EDO1_toLocation", "EDO1_managerialDecisionDateHijri", "EDO1_managerialDecisionDateGregorian", "EDO1_managerialDecisionNumber"],
      "EDO-2": ["EDO2_fromJob", "EDO2_toJob", "EDO2_managerialDecisionDateHijri", "EDO2_managerialDecisionDateGregorian", "EDO2_managerialDecisionNumber"],
      "EDO-3": ["EDO3_amountOfReduction", "EDO3_managerialDecisionDateHijri", "EDO3_managerialDecisionDateGregorian", "EDO3_managerialDecisionNumber"],
      "EDO-4": ["EDO4_typesOfPenalties", "EDO4_managerialDecisionDateHijri", "EDO4_managerialDecisionDateGregorian", "EDO4_managerialDecisionNumber"],
      "LCUT-1": ["LCUT1_amountOfCompensation"],
      "TTR-1": ["TTR1_travelingWay"],
      "RR-1": ["RR1_Amount", "RR1_Type"],
      "JAR-2": ["JAR2_currentJobTitle", "JAR2_requiredJobTitle"],
      "RLRAHI-1": ["request_date_hijri", "request_date_gregorian"],
      "MIR-1": ["MIR1_typeOfRequest"],
      "HIR-1": ["HIR1_IsBylawsIncludeAddingAccomodation", "HIR1_IsContractIncludeAddingAccommodation", "HIR1_HousingSpecificationsInContract", "HIR1_HousingSpecificationsInBylaws", "HIR1_HousingSpecifications"],
    };

    // Get all possible fields from all subcategories
    const allPossibleFields = new Set<string>();
    Object.values(subcategoryFields).forEach(fields => {
      fields.forEach(field => allPossibleFields.add(field));
    });

    // Get current subcategory fields
    const currentFields = subcategoryFields[currentSubCategory] || [];

    // Unregister fields that are not in the current subcategory
    allPossibleFields.forEach(field => {
      if (!currentFields.includes(field)) {
        unregister(field);
      }
    });

    console.log(`[🔄 FIELD UNREGISTRATION] Unregistered fields for ${currentSubCategory}`);
  }, [subCategory?.value, isEditing, unregister]);

  const [triggerCaseDetailsQuery, { data: caseDetailsData }] =
    useLazyGetCaseDetailsQuery();
  // Lookups
  const lookup = useLookup();
  const {
    data: mainCategoryData,
    isFetching,
    isLoading,
  } = lookup.mainCategory(isOpen);
  // Removed duplicate subCategory call - using useSubTopicsSubLookupQuery instead
  const { data: amountPaidData } = lookup.amountPaidCategory(
    subCategory?.value
  );
  const { data: travelingWayData } = lookup.travelingWayCategory(
    subCategory?.value
  );
  const { data: leaveTypeData } = lookup.leaveTypeCategory(subCategory?.value);
  const { data: forAllowanceData } = lookup.forAllowance(subCategory?.value);
  const { data: typeOfRequestLookupData } = lookup.typeOfRequest(
    subCategory?.value
  );
  const { data: commissionTypeLookupData } = lookup.commissionType(
    subCategory?.value
  );
  const { data: accordingToAgreementLookupData } = lookup.accordingToAgreement(
    subCategory?.value
  );
  const { data: typesOfPenaltiesData } = lookup.typesOfPenalties(
    subCategory?.value
  );
  const { data: payIncreaseTypeData } = lookup.payIncreaseType(
    subCategory?.value
  );
  // typeOfCustodyData is not available in lookup, will be undefined
  const typeOfCustodyData = undefined;

  const PayIncreaseTypeOptions = useMemo<Option[]>(
    () =>
      payIncreaseTypeData?.DataElements?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [],
    [payIncreaseTypeData]
  );
  // helper (put it near your other utils)
  const toOption = (list: any[] | undefined, code?: string) => {
    if (!code) return null;
    const hit = list?.find((i) => String(i.ElementKey) === String(code));
    return hit
      ? { value: String(hit.ElementKey), label: hit.ElementValue }
      : { value: String(code), label: String(code) }; // temp fallback
  };

  // inside EditHearingTopicsDetails component
  useEffect(() => {
    // 1) get the current code (from editTopic or the form)
    const code =
      getValues("accordingToAgreement")?.value ||
      editTopic?.AccordingToAgreement_Code ||
      editTopic?.AccordingToAgreement ||
      editTopic?.accordingToAgreement?.value;

    if (!code) return;

    // 2) only run when lookup is ready
    const list = accordingToAgreementLookupData?.DataElements;
    if (!list) return;

    // 3) if the label is already correct, skip
    const curr = getValues("accordingToAgreement");
    if (curr?.label && curr.label !== curr.value) return;

    // 4) update the field with the resolved label
    setValue("accordingToAgreement", toOption(list, code), {
      shouldDirty: false,
      shouldValidate: false,
    });
  }, [accordingToAgreementLookupData?.DataElements, editTopic, getValues, setValue]);


  const { data: regionData, isFetching: isRegionLoading } =
    useGetRegionLookupDataQuery({
      AcceptedLanguage: currentLanguage,
      context: "worker", // Always use WorkerRegion
    });

  const subTopicsLookupParams = useMemo(() => {
    const base: any = {
      LookupType: "CaseElements",
      ModuleKey: mainCategory?.value,
      ModuleName: "SubTopics",
      SourceSystem: "E-Services",
      AcceptedLanguage: currentLanguage,
    };
    if (caseDetailsData?.CaseDetails) {
      base.PlaintiffID = caseDetailsData.CaseDetails.PlaintiffId;
      base.Number700 = caseDetailsData.CaseDetails.Defendant_Number700;
      base.DefendantType = caseDetailsData.CaseDetails.DefendantType;
    }
    return base;
  }, [mainCategory?.value, currentLanguage, caseDetailsData?.CaseDetails]);

  const { data: subCategoryData, isFetching: isSubCategoryLoading } =
    useSubTopicsSubLookupQuery(subTopicsLookupParams, {
      skip: !mainCategory?.value || !caseDetailsData?.CaseDetails,
    });

  const [triggerFileDetails, { data: fileBase64 }] =
    useLazyGetFileDetailsQuery();
  const {
    attachments,
    attachmentFiles,
    previewFile,
    showAttachmentModal,
    handleAttachmentSave,
    handleViewAttachment,
    openAttachmentModal,
    closeAttachmentModal,
    closePreview,
    setAttachments,
    setAttachmentFiles,
  } = useAttachments({ triggerFileDetails, fileBase64 });
  const [topicData, setTopicData] = useState<any>(null);
  const [legalSection, setLegalSection] = useState<any>(null);
  const [fileKey, setFileKey] = useState("");
  const [fileName, setFileName] = useState("");
  const [previewFileModule, setPreviewFile] = useState(false);
  const [localPreviewBase64, setLocalPreviewBase64] = useState<string | null>(
    null
  );
  const [attachmentsModule, setAttachmentsModule] =
    useState<AttachmentFile[]>();

  const handleView = async (attachment: any) => {
    if (attachment.FileKey) {
      setFileKey(attachment.FileKey);
      setFileName(attachment.FileName);
      setPreviewFile(true);
      setLocalPreviewBase64(null);
      await triggerFileDetails({
        AttachmentKey: attachment.FileKey,
        AcceptedLanguage: i18n.language.toUpperCase(),
      });
    } else if (attachment.base64) {
      setFileName(attachment.FileName);
      setLocalPreviewBase64(attachment.base64);
      setPreviewFile(true);
    }
  };

  // Add a ref to track if topics have been loaded from caseDetailsData
  const topicsLoadedRef = useRef(false);

  useEffect(() => {
    if ((caseDetailsData as any)?.CaseDetails && !topicsLoadedRef.current) {
      const formattedTopics = (
        caseDetailsData as any
      ).CaseDetails.CaseTopics.map((topic: any) => ({
        ...topic,
        // Main/sub category for form
        mainCategory: { value: topic.MainTopicID, label: topic.CaseTopicName },
        subCategory: { value: topic.SubTopicID, label: topic.SubTopicName },

        // Dates
        date_hijri: topic.Date_New || "",
        from_date_hijri: topic.FromDateHijri || "",
        to_date_hijri: topic.ToDateHijri || "",
        managerial_decision_date_hijri: topic.ManDecsDate || "",
        // managerialDecisionNumber: topic.ManagerialDecisionNumber || "",
        date_gregorian: topic.DateGregorian || "",
        from_date_gregorian: topic.FromDateGregorian || "",
        to_date_gregorian: topic.ToDateGregorian || "",
        injury_date_hijri:
          topic.SubTopicID === "CMR-3"
            ? topic.pyTempText || ""
            : topic.injury_date_hijri || "",
        injury_date_gregorian:
          topic.SubTopicID === "CMR-3"
            ? topic.InjuryDate_New || ""
            : topic.injury_date_gregorian || "",
        request_date_hijri: topic.RequestDateHijri || "",
        request_date_gregorian: topic.RequestDateGregorian || "",

        // Job fields
        fromJob: topic.FromJob || "",
        toJob: topic.ToJob || "",
        requiredJobTitle: topic.RequiredJobTitle || "",
        currentJobTitle: topic.CurrentJobTitle || "",
        theWantedJob: topic.TheWantedJob || "",

        // Amounts and numbers
        amount: topic.Amount || "",
        wagesAmount: topic.WagesAmount || "",
        bonusAmount: topic.BonusAmount || "",
        payDue: topic.PayDue || "",
        durationOfLeaveDue: topic.DurationOfLeaveDue || "",
        compensationAmount: topic.CompensationAmount || "",
        injuryType: topic.InjuryType || "",
        otherCommission: topic.OtherCommission || "",
        amountOfCompensation: topic.AmountOfCompensation || "",
        damagedValue: topic.DamagedValue || "",
        requiredDegreeOfInsurance: topic.RequiredDegreeOfInsurance || "",
        currentInsuranceLevel: topic.CurrentInsuranceLevel || "",
        theReason: topic.TheReason || "",
        currentPosition: topic.CurrentPosition || "",
        typeOfCustody: topic.TypeOfCustody || "",
        amountsPaidFor: topic.AmountsPaidFor || "",
        gregorianDate: topic.GregorianDate || "",
        decisionNumber: topic.DecisionNumber || "",
        regionCode: topic.RegionCode || "",
        cityCode: topic.CityCode || "",
        occupationCode: topic.OccupationCode || "",
        genderCode: topic.GenderCode || "",
        nationalityCode: topic.NationalityCode || "",
        prisonerId: topic.PrisonerId || "",
        rewardType: topic.RewardType || "",
        consideration: topic.Consideration || "",
        // travelingWay: topic.TravelingWay || "",
        loanAmount: topic.LoanAmount || "",
        managerialDecisionNumber: topic.ManagerialDecisionNumber || "",

        // Dropdowns
        forAllowance: topic.ForAllowance
          ? { value: topic.ForAllowance, label: topic.ForAllowance }
          : null,

        accordingToAgreement: topic.AccordingToAgreement
          ? {
            value: topic.AccordingToAgreement,
            label: topic.AccordingToAgreement,
          }
          : null,
        travelingWay: topic.TravelingWay
          ? { value: topic.TravelingWay, label: topic.TravelingWay }
          : null,
        typeOfRequest:
          topic.RequestType || topic.RequestType_Code
            ? {
              value: topic.RequestType_Code || topic.RequestType,
              label: topic.RequestType || topic.RequestType_Code,
            }
            : null,
        kindOfHoliday: topic.KindOfHoliday
          ? { value: topic.KindOfHoliday, label: topic.KindOfHoliday }
          : null,
        fromLocation:
          topic.FromLocation || topic.FromLocation_Code
            ? {
              value: topic.FromLocation_Code || topic.FromLocation,
              label: topic.FromLocation || topic.FromLocation_Code,
            }
            : null,
        toLocation:
          topic.ToLocation || topic.ToLocation_Code
            ? {
              value: topic.ToLocation_Code || topic.ToLocation,
              label: topic.ToLocation || topic.ToLocation_Code,
            }
            : null,
        typesOfPenalties:
          topic.PenalityType ||
            topic.PenalityType_Code ||
            topic.TypesOfPenalties
            ? {
              value:
                topic.PenalityType_Code ||
                topic.PenalityType ||
                topic.TypesOfPenalties,
              label:
                topic.PenalityTypeLabel ||
                topic.TypesOfPenaltiesLabel ||
                topic.PenalityType ||
                topic.TypesOfPenalties,
            }
            : null,

        // Booleans
        doesBylawsIncludeAddingAccommodations:
          topic.IsBylawsIncludeAddingAccommodiation === "Yes" ||
          topic.doesBylawsIncludeAddingAccommodations === true,
        doesContractIncludeAddingAccommodations:
          topic.IsContractIncludeAddingAccommodiation === "Yes" ||
          topic.doesContractIncludeAddingAccommodations === true,

        // Housing
        housingSpecificationInByLaws:
          topic.HousingSpecificationsInBylaws ||
          topic.housingSpecificationInByLaws ||
          "",
        housingSpecificationsInContract:
          topic.HousingSpecificationsInContract ||
          topic.housingSpecificationsInContract ||
          "",
        actualHousingSpecifications:
          topic.HousingSpecifications ||
          topic.actualHousingSpecifications ||
          "",

        // Any other fields you want to add...
        // Add correct mapping for CMR-5 leave fields
        ...(topic.SubTopicID === "CMR-5"
          ? {
            kindOfHoliday: (() => {
              if (topic.LeaveType_Code) {
                return {
                  value: topic.LeaveType_Code,
                  label: topic.LeaveType,
                };
              }
              if (
                topic.kindOfHoliday &&
                typeof topic.kindOfHoliday === "object"
              ) {
                return topic.kindOfHoliday;
              }
              if (
                typeof topic.kindOfHoliday === "string" &&
                leaveTypeData?.DataElements
              ) {
                const found = leaveTypeData.DataElements.find(
                  (item: any) => item.ElementKey === topic.kindOfHoliday
                );
                return found
                  ? { value: found.ElementKey, label: found.ElementValue }
                  : {
                    value: topic.kindOfHoliday,
                    label: topic.kindOfHoliday,
                  };
              }
              return null;
            })(),
            totalAmount: topic.TotalAmountRequired || "",
            workingHours: topic.WorkingHoursCount || "",
            additionalDetails: topic.AdditionalDetails || "",
          }
          : {}),

        // Add correct mapping for JAR-3 promotion mechanism fields
        ...(topic.SubTopicID === "JAR-3"
          ? {
            doesTheInternalRegulationIncludePromotionMechanism:
              topic.PromotionMechanism === "Yes",
            doesContractIncludeAdditionalUpgrade:
              topic.AdditionalUpgrade === "Yes",
          }
          : {}),

        // Add correct mapping for BPSR-1 date fields
        ...(topic.SubTopicID === "BPSR-1"
          ? {
            from_date_hijri: topic.pyTempDate || "",
            from_date_gregorian: topic.FromDate_New || "",
            to_date_hijri: topic.Date_New || "",
            to_date_gregorian: topic.ToDate_New || "",
          }
          : {}),
        // Add correct mapping for RFR-1 date fields
        ...(topic.SubTopicID === "RFR-1" && {
          RFR1_Amount: topic.Amount ?? "",
          RFR1_Consideration: topic.Consideration ?? "",
          RFR1_dateHijri: topic.pyTempDate ?? "",
          RFR1_dateGregorian: topic.Date_New ?? "",
          // Legacy fields for backward compatibility
          amount: topic.Amount ?? "",
          consideration: topic.Consideration ?? "",
          date_hijri: topic.pyTempDate ?? "",
          date_gregorian: topic.Date_New ?? "",
        }),
        // --- EDO-3 Amount Of Reduction mapping ---
        ...(topic.SubTopicID === "EDO-3"
          ? {
            amountOfReduction: topic.AmountOfReduction || "",
            managerial_decision_date_hijri: topic.pyTempDate || "",
            managerial_decision_date_gregorian:
              topic.ManagerialDecisionDate_New || "",
            managerialDecisionNumber: topic.ManagerialDecisionNumber || "",
          }
          : {}),
        // ──────────────── EDO SUBTOPICS MAPPING ────────────────
        // EDO-1: Cancellation of the location transfer decision
        ...(topic.SubTopicID === "EDO-1" && {
          fromLocation: topic.FromLocation_Code
            ? { value: topic.FromLocation_Code, label: topic.FromLocation }
            : null,
          toLocation: topic.ToLocation_Code
            ? { value: topic.ToLocation_Code, label: topic.ToLocation }
            : null,
          managerial_decision_date_hijri: topic.Date_New || "",
          managerial_decision_date_gregorian: topic.ManDecsDate || "",
          managerialDecisionNumber: topic.ManagerialDecisionNumber || "",
        }),
        // EDO-2: Cancellation of the job transfer decision
        ...(topic.SubTopicID === "EDO-2" && {
          fromJob: topic.FromJob || "",
          toJob: topic.ToJob || "",
          managerial_decision_date_hijri: topic.Date_New || "",
          managerial_decision_date_gregorian: topic.ManDecsDate || "",
          managerialDecisionNumber: topic.ManagerialDecisionNumber || "",
        }),
        // EDO-3: Cancellation of the wage reduction decision
        ...(topic.SubTopicID === "EDO-3" && {
          amountOfReduction: topic.AmountOfReduction || "",
          managerial_decision_date_hijri: topic.pyTempDate || "",
          managerial_decision_date_gregorian:
            topic.ManagerialDecisionDate_New || "",
          managerialDecisionNumber: topic.ManagerialDecisionNumber || "",
        }),
        // EDO-4: Cancellation of disciplinary penalty decision
        ...(topic.SubTopicID === "EDO-4" && {
          typesOfPenalties: topic.PenalityType_Code
            ? { value: topic.PenalityType_Code, label: topic.PenalityType }
            : null,
          managerial_decision_date_hijri: topic.Date_New || "",
          managerial_decision_date_gregorian: topic.ManDecsDate || "",
          managerialDecisionNumber: topic.ManagerialDecisionNumber || "",
        }),
        // ──────────────── END EDO SUBTOPICS MAPPING ────────────────

        // ──────────────── WR SUBTOPICS MAPPING ────────────────

        // Add correct mapping for WR-1 fields with new naming convention
        ...(topic.SubTopicID === "WR-1"
          ? {
            WR1_wageAmount: topic.Amount || topic.wageAmount || topic.amount || "",
            WR1_forAllowance: topic.ForAllowance_Code
              ? { value: topic.ForAllowance_Code, label: topic.ForAllowance }
              : null,
            WR1_otherAllowance: topic.OtherAllowance || "",
            WR1_fromDateHijri: topic.pyTempDate || "",
            WR1_fromDateGregorian: topic.FromDate_New || "",
            WR1_toDateHijri: topic.Date_New || "",
            WR1_toDateGregorian: topic.ToDate_New || "",
            // Legacy fields for backward compatibility
            wageAmount: topic.Amount || topic.wageAmount || topic.amount || "",
            forAllowance: topic.ForAllowance_Code
              ? { value: topic.ForAllowance_Code, label: topic.ForAllowance }
              : null,
            otherAllowance: topic.OtherAllowance || "",
            from_date_hijri: topic.pyTempDate || "",
            from_date_gregorian: topic.FromDate_New || "",
            to_date_hijri: topic.Date_New || "",
            to_date_gregorian: topic.ToDate_New || "",
          }
          : {}),

        // Add correct mapping for WR-2 fields
        ...(topic.SubTopicID === "WR-2"
          ? {
            WR2_wageAmount: topic.OverdueWagesAmount || topic.Amount || "",
            WR2_fromDateHijri: topic.pyTempDate || "",
            WR2_fromDateGregorian: topic.FromDate_New || "",
            WR2_toDateHijri: topic.Date_New || "",
            WR2_toDateGregorian: topic.ToDate_New || "",
            // Legacy fields for backward compatibility
            amount: topic.OverdueWagesAmount || topic.Amount || "",
            from_date_hijri: topic.pyTempDate || "",
            from_date_gregorian: topic.FromDate_New || "",
            to_date_hijri: topic.Date_New || "",
            to_date_gregorian: topic.ToDate_New || "",
          }
          : {}),
        // ──────────────── END WR SUBTOPICS MAPPING ────────────────

        // ──────────────── HIR SUBTOPICS MAPPING ────────────────
        ...(topic.SubTopicID === "HIR-1"
          ? {
            doesBylawsIncludeAddingAccommodations:
              topic.IsBylawsIncludeAddingAccommodiation === "Yes" ||
              topic.doesBylawsIncludeAddingAccommodations === true,
            doesContractIncludeAddingAccommodations:
              topic.IsContractIncludeAddingAccommodiation === "Yes" ||
              topic.doesContractIncludeAddingAccommodations === true,
            housingSpecificationInByLaws:
              topic.HousingSpecificationsInBylaws ||
              topic.housingSpecificationInByLaws ||
              "",
            housingSpecificationsInContract:
              topic.HousingSpecificationsInContract ||
              topic.housingSpecificationsInContract ||
              "",
            actualHousingSpecifications:
              topic.HousingSpecifications ||
              topic.actualHousingSpecifications ||
              "",
          }
          : {}),
        // ──────────────── END HIR SUBTOPICS MAPPING ────────────────

        // ──────────────── MIR SUBTOPICS MAPPING ────────────────
        ...(topic.SubTopicID === "MIR-1"
          ? {
            MIR1_typeOfRequest: topic.RequestType_Code
              ? { value: topic.RequestType_Code, label: topic.RequestType }
              : null,
            MIR1_requiredDegreeOfInsurance: topic.RequiredDegreeInsurance || "",
            MIR1_theReason: topic.Reason || "",
            MIR1_currentInsuranceLevel: topic.CurrentInsuranceLevel || "",
            // Legacy fields for backward compatibility
            typeOfRequest: topic.RequestType_Code
              ? { value: topic.RequestType_Code, label: topic.RequestType }
              : null,
            requiredDegreeOfInsurance: topic.RequiredDegreeInsurance || "",
            theReason: topic.Reason || "",
            currentInsuranceLevel: topic.CurrentInsuranceLevel || "",
          }
          : {}),
        // ──────────────── END MIR SUBTOPICS MAPPING ────────────────

        // ──────────────── TTR SUBTOPICS MAPPING ────────────────
        ...(topic.SubTopicID === "TTR-1"
          ? {
            travelingWay: topic.TravelingWay_Code
              ? { value: topic.TravelingWay_Code, label: topic.TravelingWay }
              : null,
          }
          : {}),
        // ──────────────── END TTR SUBTOPICS MAPPING ────────────────

        // ──────────────── CMR SUBTOPICS MAPPING ────────────────
        // CMR-1: Treatment refunds
        ...(topic.SubTopicID === "CMR-1" && {
          CMR1_amountsPaidFor:
            topic.AmountsPaidFor_Code && topic.AmountsPaidFor
              ? {
                value: topic.AmountsPaidFor_Code,
                label: topic.AmountsPaidFor,
              }
              : topic.AmountsPaidFor_Code
                ? {
                  value: topic.AmountsPaidFor_Code,
                  label: topic.AmountsPaidFor_Code,
                }
                : null,
          CMR1_theAmountRequired: topic.AmountRequired
            ? String(topic.AmountRequired)
            : "",
          // Legacy fields for backward compatibility
          amountsPaidFor:
            topic.AmountsPaidFor_Code && topic.AmountsPaidFor
              ? {
                value: topic.AmountsPaidFor_Code,
                label: topic.AmountsPaidFor,
              }
              : topic.AmountsPaidFor_Code
                ? {
                  value: topic.AmountsPaidFor_Code,
                  label: topic.AmountsPaidFor_Code,
                }
                : null,
          theAmountRequired: topic.AmountRequired
            ? String(topic.AmountRequired)
            : "",
        }),
        // CMR-3: Request compensation for work injury
        ...(topic.SubTopicID === "CMR-3" && {
          CMR3_compensationAmount: topic.Amount ? String(topic.Amount) : "",
          CMR3_injuryDateHijri: topic.pyTempText || "",
          CMR3_injuryDateGregorian: topic.InjuryDate_New || "",
          CMR3_injuryType: topic.TypeOfWorkInjury || "",
          // Legacy fields for backward compatibility
          compensationAmount: topic.Amount ? String(topic.Amount) : "",
          injury_date_hijri: topic.pyTempText || "",
          injury_date_gregorian: topic.InjuryDate_New || "",
          injuryType: topic.TypeOfWorkInjury || "",
        }),
        // CMR-4: Request compensation for the duration of the notice
        ...(topic.SubTopicID === "CMR-4" && {
          CMR4_compensationAmount: topic.Amount ? String(topic.Amount) : "",
          // Legacy fields for backward compatibility
          amount: topic.Amount ? String(topic.Amount) : "",
        }),
        // CMR-5: Pay for work during vacation
        ...(topic.SubTopicID === "CMR-5" && {
          CMR5_kindOfHoliday:
            topic.LeaveType_Code && topic.LeaveType
              ? { value: topic.LeaveType_Code, label: topic.LeaveType }
              : topic.LeaveType_Code
                ? { value: topic.LeaveType_Code, label: topic.LeaveType_Code }
                : null,
          CMR5_totalAmount: topic.TotalAmountRequired
            ? String(topic.TotalAmountRequired)
            : "",
          CMR5_workingHours: topic.WorkingHoursCount
            ? String(topic.WorkingHoursCount)
            : "",
          CMR5_additionalDetails: topic.AdditionalDetails || "",
          // Legacy fields for backward compatibility
          kindOfHoliday:
            topic.LeaveType_Code && topic.LeaveType
              ? { value: topic.LeaveType_Code, label: topic.LeaveType }
              : topic.LeaveType_Code
                ? { value: topic.LeaveType_Code, label: topic.LeaveType_Code }
                : null,
          totalAmount: topic.TotalAmountRequired
            ? String(topic.TotalAmountRequired)
            : "",
          workingHours: topic.WorkingHoursCount
            ? String(topic.WorkingHoursCount)
            : "",
          additionalDetails: topic.AdditionalDetails || "",
        }),

        // CMR-6: The Wage Difference/increase
        ...(topic.SubTopicID === "CMR-6" && {
          CMR6_newPayAmount: topic.NewPayAmount ? String(topic.NewPayAmount) : "",
          CMR6_payIncreaseType: topic.PayIncreaseType_Code
            ? { value: topic.PayIncreaseType_Code, label: topic.PayIncreaseType }
            : null,
          CMR6_wageDifference: topic.WageDifference ? String(topic.WageDifference) : "",
          CMR6_fromDateHijri: topic.pyTempDate || "",
          CMR6_fromDateGregorian: topic.FromDate_New || "",
          CMR6_toDateHijri: topic.Date_New || "",
          CMR6_toDateGregorian: topic.ToDate_New || "",
          // Legacy fields for backward compatibility
          from_date_hijri: topic.pyTempDate || "",
          from_date_gregorian: topic.FromDate_New || "",
          to_date_hijri: topic.Date_New || "",
          to_date_gregorian: topic.ToDate_New || "",
          newPayAmount: topic.NewPayAmount ? String(topic.NewPayAmount) : "",
          payIncreaseType: topic.PayIncreaseType_Code
            ? { value: topic.PayIncreaseType_Code, label: topic.PayIncreaseType }
            : null,
          wageDifference: topic.WageDifference ? String(topic.WageDifference) : "",
        }),
        // CMR-7: Request for overtime pay
        ...(topic.SubTopicID === "CMR-7" && {
          CMR7_durationOfLeaveDue: topic.DurationOfLeaveDue ? String(topic.DurationOfLeaveDue) : "",
          CMR7_payDue: topic.PayDue ? String(topic.PayDue) : "",
          CMR7_fromDateHijri: topic.pyTempDate || "",
          CMR7_fromDateGregorian: topic.FromDate_New || "",
          CMR7_toDateHijri: topic.Date_New || "",
          CMR7_toDateGregorian: topic.ToDate_New || "",
          // Legacy fields for backward compatibility
          pyTempDate: topic.pyTempDate || "",
          toDate_gregorian: topic.ToDate_New || "",
          date_hijri: topic.Date_New || "",
          fromDate_gregorian: topic.FromDate_New || "",
          durationOfLeaveDue: topic.DurationOfLeaveDue ? String(topic.DurationOfLeaveDue) : "",
          payDue: topic.PayDue ? String(topic.PayDue) : "",
        }),
        // CMR-8: Pay stop time
        ...(topic.SubTopicID === "CMR-8" && {
          CMR8_wagesAmount: topic.WagesAmount ? String(topic.WagesAmount) : "",
          CMR8_fromDateHijri: topic.pyTempDate || "",
          CMR8_fromDateGregorian: topic.FromDate_New || "",
          CMR8_toDateHijri: topic.Date_New || "",
          CMR8_toDateGregorian: topic.ToDate_New || "",
          // Legacy fields for backward compatibility
          pyTempDate: topic.pyTempDate || "",
          toDate_gregorian: topic.ToDate_New || "",
          date_hijri: topic.Date_New || "",
          fromDate_gregorian: topic.FromDate_New || "",
          wagesAmount: topic.WagesAmount ? String(topic.WagesAmount) : "",
        }),
        // ──────────────── END CMR SUBTOPICS MAPPING ────────────────

        // ──────────────── BR SUBTOPICS MAPPING ────────────────
        // BR-1: Bonus Request
        ...(topic.SubTopicID === "BR-1" && (() => {
          const code = topic.AccordingToAgreement_Code || topic.AccordingToAgreement;
          return {
            accordingToAgreement: resolveOption(
              accordingToAgreementLookupData?.DataElements,
              code,
              topic.AccordingToAgreement
            ),
            bonusAmount: topic.Premium ?? topic.BonusAmount ?? "",
            date_hijri: topic.pyTempDate || "",
            date_gregorian: topic.Date_New || "",
          };
        })()),
        // ──────────────── END BR SUBTOPICS MAPPING ────────────────



        // ──────────────── END BR SUBTOPICS MAPPING ────────────────

        // ──────────────── BPSR SUBTOPICS MAPPING (FIXED) ────────────────
        ...(topic.SubTopicID === "BPSR-1" && {
          commissionType: ensureOption(
            commissionTypeLookupData?.DataElements,
            topic.CommissionType_Code ?? topic.CommissionType
          ),
          accordingToAgreement: ensureOption(
            accordingToAgreementLookupData?.DataElements,
            topic.AccordingToAgreement_Code ?? topic.AccordingToAgreement
          ),
          amount: String(topic.Amount ?? topic.amount ?? ""),
          amountRatio: String(topic.AmountRatio ?? topic.amountRatio ?? ""),
          from_date_hijri: topic.pyTempDate ?? topic.FromDateHijri ?? topic.from_date_hijri ?? "",
          from_date_gregorian: topic.FromDate_New ?? topic.FromDateGregorian ?? topic.from_date_gregorian ?? "",
          to_date_hijri: topic.Date_New ?? topic.ToDateHijri ?? topic.to_date_hijri ?? "",
          to_date_gregorian: topic.ToDate_New ?? topic.ToDateGregorian ?? topic.to_date_gregorian ?? "",
          otherCommission: String(topic.OtherCommission ?? topic.otherCommission ?? ""),
        }),
        // ──────────────── END BPSR SUBTOPICS MAPPING (FIXED) ────────────────


        // ──────────────── DR SUBTOPICS MAPPING ────────────────
        // DR-1: Documents Requests
        ...(topic.SubTopicID === "DR-1" && {
          documentType: topic.documentType || null,
          documentReason: topic.documentReason || "",
        }),
        // ──────────────── END DR SUBTOPICS MAPPING ────────────────

        // ──────────────── RR SUBTOPICS MAPPING ────────────────
        // RR-1: Reward Request
        ...(topic.SubTopicID === "RR-1" && {
          amount: topic.Amount || topic.amount || "",
          rewardType: topic.Type || topic.rewardType || "",
        }),
        // ──────────────── END RR SUBTOPICS MAPPING ────────────────

        // ──────────────── JAR SUBTOPICS MAPPING ────────────────
        // JAR-2: Job Application Request (currentJobTitle, requiredJobTitle)
        ...(topic.SubTopicID === "JAR-2" && {
          currentJobTitle: topic.CurrentJobTitle || topic.currentJobTitle || "",
          requiredJobTitle:
            topic.RequiredJobTitle || topic.requiredJobTitle || "",
        }),
        // JAR-3: Promotion Mechanism
        ...(topic.SubTopicID === "JAR-3"
          ? {
            doesTheInternalRegulationIncludePromotionMechanism:
              topic.PromotionMechanism === "Yes" || topic.doesTheInternalRegulationIncludePromotionMechanism,
            doesContractIncludeAdditionalUpgrade:
              topic.AdditionalUpgrade === "Yes" || topic.doesContractIncludeAdditionalUpgrade,
          }
          : {}),
        // JAR-4: Job Application Request (currentPosition, theWantedJob)
        ...(topic.SubTopicID === "JAR-4" && {
          currentPosition: topic.CurrentPosition || topic.currentPosition || "",
          theWantedJob: topic.TheWantedJob || topic.theWantedJob || topic.WantedJob || "",
        }),
        // ──────────────── END JAR SUBTOPICS MAPPING ────────────────
        // ──────────────── RUF SUBTOPICS MAPPING ────────────────
        // RUF-1: Reimbursement of Undue Funds
        ...(topic.SubTopicID === "RUF-1" && {
          RefundType: topic.RefundType || topic.refundType || "",
          refundAmount: topic.Amount || topic.amount || "", // Map to specific field name
        }),
        // ──────────────── END RUF SUBTOPICS MAPPING ────────────────
        // ──────────────── LRESR SUBTOPICS MAPPING ────────────────
        // LRESR-1: End of Service Reward
        ...(topic.SubTopicID === "LRESR-1" && {
          LRESR1_Amount: topic.Amount || topic.amount || "",
          // Legacy fields for backward compatibility
          endOfServiceRewardAmount: topic.Amount || topic.amount || "",
        }),
        // LRESR-2: End of Service Reward (amount, consideration)
        ...(topic.SubTopicID === "LRESR-2" && {
          endOfServiceRewardAmount: topic.Amount || topic.amount || "", // Changed from "amount"
          consideration: topic.Consideration || topic.consideration || "",
        }),
        // LRESR-3: End of Service Reward (amount, rewardType)
        ...(topic.SubTopicID === "LRESR-3" && {
          endOfServiceRewardAmount: topic.Amount || topic.amount || "", // Changed from "amount"
          rewardType: topic.RewardType || topic.rewardType || "",
        }),
        // ──────────────── END LRESR SUBTOPICS MAPPING ────────────────
        // ──────────────── LCUT SUBTOPICS MAPPING ────────────────
        // LCUT-1: Labor Contract and Unemployment Termination
        ...(topic.SubTopicID === "LCUT-1" && {
          LCUT1_amountOfCompensation: topic.AmountOfCompensation || topic.amountOfCompensation || "",
          // Legacy fields for backward compatibility
          amountOfCompensation: topic.AmountOfCompensation || topic.amountOfCompensation || "",
        }),
        // ──────────────── END LCUT SUBTOPICS MAPPING ────────────────
      }));
      setCaseTopics(formattedTopics);
      topicsLoadedRef.current = true;

      if (
        caseDetailsData?.CaseDetails?.OtherAttachments?.length > 0 ||
        caseDetailsData?.CaseDetails?.CaseTopicAttachments?.length > 0
      ) {
        const formattedAttachments =
          caseDetailsData.CaseDetails.OtherAttachments.map(
            (attachment: any) => ({
              fileKey: attachment.FileKey,
              fileType: attachment.FileType,
              fileName: attachment.FileName,
            })
          );

        setAttachments(formattedAttachments);
        setAttachmentsModule([
          ...(caseDetailsData?.CaseDetails?.OtherAttachments || []),
          ...(caseDetailsData?.CaseDetails?.CaseTopicAttachments || []),
        ]);
      }
    }
  }, [caseDetailsData]);

  const matchedSubCategory = subCategoryData?.DataElements?.find(
    (item: any) => item.ElementKey === subCategory?.value
  );

  const acknowledged = watch("acknowledged");
  const fromLocation = watch("fromLocation") ?? null;
  const toLocation = watch("toLocation") ?? null;
  const hijriDate = watch("hijriDate");
  const gregorianDate = watch("gregorianDate");
  const decisionNumber = watch("decisionNumber");
  const regulatoryText = t("regulatory_text_content");
  const { setDate } = useDateContext();

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  const getPaginatedTopics = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    return caseTopics.slice(start, end);
  }, [caseTopics, pagination.pageIndex, pagination.pageSize]);

  // Case details fetching and validation useEffect
  useEffect(() => {
    if (!caseId) return;

    const fetchCaseDetails = async () => {
      console.log("[🔍 CASE DETAILS] Fetching case details for caseId:", caseId);
      console.log("[🔍 CASE DETAILS] Current caseDetailsData:", caseDetailsData);
      
      const userConfigs: Record<string, any> = {
        Worker: {
          UserType: userType,
          IDNumber: userID,
        },
        "Embassy User": {
          UserType: userType,
          IDNumber: userID,
        },
        Establishment: {
          UserType: userType,
          IDNumber: userID,
          FileNumber: fileNumber,
        },
        "Legal representative": {
          UserType: userType,
          IDNumber: userID,
          MainGovernment: mainCategory2 || "",
          SubGovernment: subCategory2 || "",
        },
      };

      console.log("[🔍 CASE DETAILS] Calling API with config:", {
        ...userConfigs[userType],
        CaseID: caseId,
        AcceptedLanguage: currentLanguage,
        SourceSystem: "E-Services",
      });
      
      try {
        const result = await triggerCaseDetailsQuery({
          ...userConfigs[userType],
          CaseID: caseId,
          AcceptedLanguage: currentLanguage,
          SourceSystem: "E-Services",
        });
        
        console.log("[🔍 CASE DETAILS] API result:", result);
        
        // Check if the API call was successful and if UpdateCase is "true" and StatusWork_Code is "Under-Negotiations"
        if (result.data?.CaseDetails) {
          const updateCase = result.data.CaseDetails.UpdateCase;
          const statusWorkCode = result.data.CaseDetails.StatusWork_Code;
          console.log("[🔍 CASE DETAILS] UpdateCase value:", updateCase);
          console.log("[🔍 CASE DETAILS] StatusWork_Code value:", statusWorkCode);
          
          if (updateCase !== "true") {
            console.log("[🔍 CASE DETAILS] UpdateCase is not 'true', showing critical error modal");
            handleCriticalError(tManageHearing("not_authorized_to_edit_case"));
            return;
          }

          if (statusWorkCode !== "Under-Negotiations" && statusWorkCode !== "Under-NegotiationsCI") {
            console.log("[🔍 CASE DETAILS] StatusWork_Code is not 'Under-Negotiations', showing critical error modal");
            handleCriticalError(tManageHearing("case_cannot_be_edited_current_status"));
            return;
          }
        } else {
          console.log("[🔍 CASE DETAILS] No CaseDetails in response, showing critical error modal");
          handleCriticalError(tManageHearing("unable_to_retrieve_case_details"));
          return;
        }
                } catch (error: any) {
                  console.log("[🔍 CASE DETAILS] Error fetching case details:", error);
                  console.log("[🔍 CASE DETAILS] Error data:", error?.data);
                  console.log("[🔍 CASE DETAILS] Error details:", error?.data?.ErrorDetails);
                  
                  // Check for specific API error responses
                  if (error?.data?.ErrorDetails && Array.isArray(error.data.ErrorDetails)) {
                    const firstError = error.data.ErrorDetails[0];
                    console.log("[🔍 CASE DETAILS] Error details found:", firstError);
                    
                    // Handle "You are not authorized to view the case" error
                    if (firstError?.ErrorCode === "ERR002") {
                      console.log("[🔍 CASE DETAILS] User not authorized error detected");
                      handleCriticalError(firstError.ErrorDesc || tManageHearing("not_authorized_to_edit_case"));
                      return;
                    }
                    
                    // Handle "No Records Found" error
                    if (firstError?.ErrorCode === "ER4059") {
                      console.log("[🔍 CASE DETAILS] No records found error detected");
                      handleCriticalError(firstError.ErrorDesc || tManageHearing("unable_to_retrieve_case_details"));
                      return;
                    }
                  }
                  
                  // For other general errors, show normal toast
                  toast.error(tManageHearing("error_retrieving_case_details"));
                  navigate("/");
                  return;
                }
    };

    fetchCaseDetails();
              }, [
              caseId,
              currentLanguage,
              triggerCaseDetailsQuery,
              userType,
              fileNumber,
              mainCategory2,
              subCategory2,
              userID,
              navigate,
              tManageHearing,
              handleCriticalError,
            ]);

  const handleTopicSelect = (topic: any, index: number) => {
    console.log("[🔍 EDIT TOPIC] Starting prefill for topic:", {
      SubTopicID: topic.SubTopicID,
      MainTopicID: topic.MainTopicID,
      index,
      topicKeys: Object.keys(topic)
    });

    // Reset form first to clear any previous data
    reset();

    // Reset prefill ref when selecting a new topic
    prefillDoneRef.current = null;

    // --- Normalize mainCategory and subCategory to always be objects ---
    const mainCategoryOpt = typeof topic.mainCategory === "string"
      ? { value: topic.mainCategory, label: topic.mainCategory }
      : topic.mainCategory ?? { value: topic.MainTopicID, label: topic.CaseTopicName };
    setValue("mainCategory", mainCategoryOpt);

    const subCategoryOpt = typeof topic.subCategory === "string"
      ? { value: topic.subCategory, label: topic.subCategory }
      : topic.subCategory ?? { value: topic.SubTopicID, label: topic.SubTopicName };
    setValue("subCategory", subCategoryOpt);

    // Set the edit topic with the original topic data and index
    setEditTopic({ ...topic, index });
    setEditTopicIndex(index);

    // Show appropriate sections
    setShowLegalSection(true);
    setShowTopicData(true);
    toggle();
  };

  const columns: any = useMemo(
    () =>
      getHearingTopicsColumns({
        t,
        onEdit: (topic, index) => handleTopicSelect(topic, index),
        onDel: (topic, index) => {
          setDelTopic({ topic, index });
          setShowDeleteConfirm(true);
        },
      }),
    [t, toggle, caseTopics] // Added caseTopics to dependencies
  );

  const goToLegalStep = () => {
    if (!mainCategory || !subCategory) return;
    setShowLegalSection(true);
    setShowTopicData(false);
    setValue("regulatoryText", regulatoryText);
  };

  const goToTopicDataStep = () => {
    if (!acknowledged) return;
    setShowTopicData(true);
  };

  const handleSend = () => {
    console.log("[🚀 SEND TOPIC] Preparing to send. caseTopics:", caseTopics);
    const result = saveTopic();
    console.log("[🚀 SEND TOPIC] saveTopic() returned:", result);

    reset();
    setDate({ hijri: null, gregorian: null, dateObject: null });
    setShowLegalSection(false);
    setShowTopicData(false);
    setEditTopic(null);
    setEditTopicIndex(null);
    close();
  };

  const handleAddTopic = async () => {
    console.log("[🔥 ADD TOPIC] Current form values:", getValues());
    console.log("[🔥 ADD TOPIC] Current caseTopics before add:", caseTopics);
    console.log("[🔥 ADD TOPIC] Form errors:", formState.errors);
    console.log("[🔥 ADD TOPIC] Is form valid:", formState.isValid);

    const result = saveTopic();
    if (result === 1) {
      console.log("[✅ ADD TOPIC] Topic successfully added. New caseTopics:", caseTopics);

      reset();
      setDate({ hijri: null, gregorian: null, dateObject: null });
      setShowLegalSection(false);
      setShowTopicData(false);
      setEditTopic(null);
      setEditTopicIndex(null);
    }
    else {
      console.warn("[⚠️ ADD TOPIC] Validation failed. Not adding topic.");
    }
  };

  const handleUpdate = () => {
    if (!editTopic) return;

    const updatedValues = getValues();
    console.log("[📝 UPDATE TOPIC] Original topic:", editTopic);
    console.log("[📝 UPDATE TOPIC] New form values:", updatedValues);
    console.log("[📝 UPDATE TOPIC] otherAllowance value:", updatedValues.otherAllowance);
    console.log("[📝 UPDATE TOPIC] forAllowance value:", updatedValues.forAllowance);

    const mainCategoryValue =
      updatedValues.mainCategory?.value ||
      editTopic?.MainTopicID ||
      editTopic?.mainCategory?.value;
    const mainCategoryLabel =
      updatedValues.mainCategory?.label ||
      editTopic?.MainSectionHeader ||
      editTopic?.mainCategory?.label;
    const subCategoryValue =
      updatedValues.subCategory?.value ||
      editTopic?.SubTopicID ||
      editTopic?.subCategory?.value;
    const subCategoryLabel =
      updatedValues.subCategory?.label ||
      editTopic?.SubTopicName ||
      editTopic?.subCategory?.label;

    const formatDateForStorage = (date: string) =>
      date ? date.replace(/\//g, "") : "";

    // Base topic structure
    const updatedTopic: any = {
      MainTopicID: mainCategoryValue,
      SubTopicID: subCategoryValue,
      MainSectionHeader: mainCategoryLabel,
      SubTopicName: subCategoryLabel,
      CaseTopicName: mainCategoryLabel,
      subCategory: { value: subCategoryValue, label: subCategoryLabel },
      mainCategory: { value: mainCategoryValue, label: mainCategoryLabel },
      acknowledged: updatedValues.acknowledged || editTopic?.acknowledged,
    };

    // ==================== SUBTOPIC-SPECIFIC HANDLERS ====================

    // WR-1: Worker Rights - Salary Payment
    if (subCategoryValue === "WR-1") {
      const {
        WR1_forAllowance,
        WR1_otherAllowance,
        WR1_wageAmount,
        WR1_fromDateHijri,
        WR1_fromDateGregorian,
        WR1_toDateHijri,
        WR1_toDateGregorian,
      } = updatedValues;

      console.log("[📝 UPDATE TOPIC] WR-1 Debug - WR1_forAllowance:", WR1_forAllowance);
      console.log("[📝 UPDATE TOPIC] WR-1 Debug - WR1_otherAllowance:", WR1_otherAllowance);

      Object.assign(updatedTopic, {
        ForAllowance: WR1_forAllowance?.label ?? "",
        ForAllowance_Code: WR1_forAllowance?.value ?? "",
        WR1_forAllowance: WR1_forAllowance ?? null, // Store the full object for API payload generation
        OtherAllowance: WR1_otherAllowance ?? "",
        WR1_otherAllowance: WR1_otherAllowance ?? "", // Also store in lowercase for consistency
        Amount: WR1_wageAmount ?? "", // Use new field name
        pyTempDate: formatDateForStorage(WR1_fromDateHijri),
        FromDate_New: formatDateForStorage(WR1_fromDateGregorian),
        Date_New: formatDateForStorage(WR1_toDateHijri),
        ToDate_New: formatDateForStorage(WR1_toDateGregorian),
        // Legacy fields for backward compatibility
        forAllowance: WR1_forAllowance ?? null,
        otherAllowance: WR1_otherAllowance ?? "",
        wageAmount: WR1_wageAmount ?? "",
        from_date_hijri: WR1_fromDateHijri ?? "",
        from_date_gregorian: WR1_fromDateGregorian ?? "",
        to_date_hijri: WR1_toDateHijri ?? "",
        to_date_gregorian: WR1_toDateGregorian ?? "",
      });

      console.log("[📝 UPDATE TOPIC] WR-1 Debug - Final OtherAllowance:", updatedTopic.OtherAllowance);
    }

    // WR-2: Worker Rights - End of Service
    else if (subCategoryValue === "WR-2") {
      const {
        WR2_wageAmount,
        WR2_fromDateHijri,
        WR2_fromDateGregorian,
        WR2_toDateHijri,
        WR2_toDateGregorian,
      } = updatedValues;

      Object.assign(updatedTopic, {
        Amount: WR2_wageAmount ?? "",
        WR2_wageAmount: WR2_wageAmount ?? "", // Store in new field name
        pyTempDate: formatDateForStorage(WR2_fromDateHijri),
        FromDate_New: formatDateForStorage(WR2_fromDateGregorian),
        Date_New: formatDateForStorage(WR2_toDateHijri),
        ToDate_New: formatDateForStorage(WR2_toDateGregorian),
        // Legacy fields for backward compatibility
        wageAmount: WR2_wageAmount ?? "",
        from_date_hijri: WR2_fromDateHijri ?? "",
        from_date_gregorian: WR2_fromDateGregorian ?? "",
        to_date_hijri: WR2_toDateHijri ?? "",
        to_date_gregorian: WR2_toDateGregorian ?? "",
      });
    }

    // BPSR-1: Bonus and Profit Share Request
    else if (subCategoryValue === "BPSR-1") {
      const {
        commissionType,
        accordingToAgreement,
        bonusProfitShareAmount,
        amountRatio,
        from_date_hijri,
        from_date_gregorian,
        to_date_hijri,
        to_date_gregorian,
        otherCommission,
      } = updatedValues;

      Object.assign(updatedTopic, {
        CommissionType: commissionType?.label ?? "",
        CommissionType_Code: commissionType?.value ?? "",
        commissionType: commissionType ?? null, // Store the full object for API payload generation
        AccordingToAgreement: accordingToAgreement?.label ?? "",
        AccordingToAgreement_Code: accordingToAgreement?.value ?? "",
        accordingToAgreement: accordingToAgreement ?? null, // Store the full object for API payload generation
        Amount: bonusProfitShareAmount ?? "",
        bonusProfitShareAmount: bonusProfitShareAmount ?? "", // Also store in lowercase for consistency
        AmountRatio: amountRatio ?? "",
        amountRatio: amountRatio ?? "", // Also store in lowercase for consistency
        pyTempDate: formatDateForStorage(from_date_hijri),
        FromDate_New: formatDateForStorage(from_date_gregorian),
        Date_New: formatDateForStorage(to_date_hijri),
        ToDate_New: formatDateForStorage(to_date_gregorian),
        OtherCommission: otherCommission ?? "",
        otherCommission: otherCommission ?? "", // Also store in lowercase for consistency
      });
    }

    // MIR-1: Medical Insurance Request
    else if (subCategoryValue === "MIR-1") {
      const {
        MIR1_typeOfRequest,
        MIR1_requiredDegreeOfInsurance,
        MIR1_theReason,
        MIR1_currentInsuranceLevel,
      } = updatedValues;

      Object.assign(updatedTopic, {
        RequestType: MIR1_typeOfRequest?.label ?? "",
        RequestType_Code: MIR1_typeOfRequest?.value ?? "",
        RequiredDegreeInsurance: MIR1_requiredDegreeOfInsurance ?? "",
        Reason: MIR1_theReason ?? "",
        CurrentInsuranceLevel: MIR1_currentInsuranceLevel ?? "",
        // Legacy fields for backward compatibility
        typeOfRequest: MIR1_typeOfRequest,
        requiredDegreeOfInsurance: MIR1_requiredDegreeOfInsurance ?? "",
        theReason: MIR1_theReason ?? "",
        currentInsuranceLevel: MIR1_currentInsuranceLevel ?? "",
      });
    }

    // CMR-1: Compensation Request - Amounts Paid For
    else if (subCategoryValue === "CMR-1") {
      const {
        amountsPaidFor,
        theAmountRequired,
      } = updatedValues;

      Object.assign(updatedTopic, {
        AmountsPaidFor: amountsPaidFor?.label ?? "",
        AmountsPaidFor_Code: amountsPaidFor?.value ?? "",
        AmountRequired: theAmountRequired ?? "",
      });
    }

    // CMR-3: Compensation Request - Work Injury
    else if (subCategoryValue === "CMR-3") {
      const {
        compensationAmount,
        injury_date_hijri,
        injury_date_gregorian,
        injuryType,
      } = updatedValues;

      Object.assign(updatedTopic, {
        Amount: compensationAmount ?? "",
        InjuryDateHijri: formatDateForStorage(injury_date_hijri),
        InjuryDateGregorian: formatDateForStorage(injury_date_gregorian),
        TypeOfWorkInjury: injuryType ?? "",
      });
    }

    // CMR-4: Compensation Request - General
    else if (subCategoryValue === "CMR-4") {
      const {
        noticeCompensationAmount,
      } = updatedValues;

      Object.assign(updatedTopic, {
        Amount: noticeCompensationAmount ?? "",
      });
    }

    // CMR-5: Compensation Request - Holiday
    else if (subCategoryValue === "CMR-5") {
      const {
        kindOfHoliday,
        totalAmount,
        workingHours,
        additionalDetails,
      } = updatedValues;

      Object.assign(updatedTopic, {
        KindOfHoliday: kindOfHoliday?.label ?? "",
        KindOfHoliday_Code: kindOfHoliday?.value ?? "",
        TotalAmount: totalAmount ?? "",
        WorkingHours: workingHours ?? "",
        AdditionalDetails: additionalDetails ?? "",
      });
    }

    // CMR-6: Compensation Request - Pay Increase
    else if (subCategoryValue === "CMR-6") {
      const {
        newPayAmount,
        payIncreaseType,
        from_date_hijri,
        from_date_gregorian,
        to_date_hijri,
        to_date_gregorian,
        wageDifference,
      } = updatedValues;

      Object.assign(updatedTopic, {
        NewPayAmount: newPayAmount ?? "",
        PayIncreaseType: payIncreaseType?.label ?? "",
        PayIncreaseType_Code: payIncreaseType?.value ?? "",
        payIncreaseType: payIncreaseType ?? null, // Store the full object for API payload generation
        from_date_hijri: formatDateForStorage(from_date_hijri),
        from_date_gregorian: formatDateForStorage(from_date_gregorian),
        to_date_hijri: formatDateForStorage(to_date_hijri),
        to_date_gregorian: formatDateForStorage(to_date_gregorian),
        WageDifference: wageDifference ?? "",
        wageDifference: wageDifference ?? "", // Also store in lowercase for consistency
      });
    }

    // CMR-7: Compensation Request - Leave
    else if (subCategoryValue === "CMR-7") {
      const {
        from_date_hijri,
        from_date_gregorian,
        to_date_hijri,
        to_date_gregorian,
        durationOfLeaveDue,
        payDue,
      } = updatedValues;

      Object.assign(updatedTopic, {
        from_date_hijri: formatDateForStorage(from_date_hijri),
        from_date_gregorian: formatDateForStorage(from_date_gregorian),
        to_date_hijri: formatDateForStorage(to_date_hijri),
        to_date_gregorian: formatDateForStorage(to_date_gregorian),
        DurationOfLeaveDue: durationOfLeaveDue ?? "",
        PayDue: payDue ?? "",
        durationOfLeaveDue: durationOfLeaveDue ?? "", // Also store in lowercase for consistency
        payDue: payDue ?? "", // Also store in lowercase for consistency
      });
    }

    // CMR-8: Compensation Request - Wages
    else if (subCategoryValue === "CMR-8") {
      const {
        wagesAmount,
        from_date_hijri,
        from_date_gregorian,
        to_date_hijri,
        to_date_gregorian,
      } = updatedValues;

      Object.assign(updatedTopic, {
        WagesAmount: wagesAmount ?? "",
        wagesAmount: wagesAmount ?? "", // Also store in lowercase for consistency
        from_date_hijri: formatDateForStorage(from_date_hijri),
        from_date_gregorian: formatDateForStorage(from_date_gregorian),
        to_date_hijri: formatDateForStorage(to_date_hijri),
        to_date_gregorian: formatDateForStorage(to_date_gregorian),
      });
    }

    // BR-1: Bonus Request
    else if (subCategoryValue === "BR-1") {
      const {
        BR1_accordingToAgreement,
        BR1_bonusAmount,
        BR1_dateHijri,
        BR1_dateGregorian,
      } = updatedValues;

      Object.assign(updatedTopic, {
        AccordingToAgreement: BR1_accordingToAgreement?.label ?? "",
        AccordingToAgreement_Code: BR1_accordingToAgreement?.value ?? "",
        Premium: BR1_bonusAmount ?? "",
        BR1_bonusAmount: BR1_bonusAmount ?? "", // Store in new field name
        pyTempDate: formatDateForStorage(BR1_dateHijri),
        Date_New: formatDateForStorage(BR1_dateGregorian),
        // Legacy fields for backward compatibility
        accordingToAgreement: BR1_accordingToAgreement ?? null,
        bonusAmount: BR1_bonusAmount ?? "",
        date_hijri: BR1_dateHijri ?? "",
        date_gregorian: BR1_dateGregorian ?? "",
      });
    }

    // EDO-1: Establishment Decision - Location
    else if (subCategoryValue === "EDO-1") {
      const {
        EDO1_fromLocation,
        EDO1_toLocation,
        EDO1_managerialDecisionDateHijri,
        EDO1_managerialDecisionDateGregorian,
        EDO1_managerialDecisionNumber,
      } = updatedValues;

      Object.assign(updatedTopic, {
        FromLocation: EDO1_fromLocation?.label ?? "",
        FromLocation_Code: EDO1_fromLocation?.value ?? "",
        ToLocation: EDO1_toLocation?.label ?? "",
        ToLocation_Code: EDO1_toLocation?.value ?? "",
        Date_New: formatDateForStorage(EDO1_managerialDecisionDateHijri),
        ManDecsDate: formatDateForStorage(EDO1_managerialDecisionDateGregorian),
        ManagerialDecisionNumber: EDO1_managerialDecisionNumber ?? "",
        // Legacy fields for backward compatibility
        fromLocation: EDO1_fromLocation ?? null,
        toLocation: EDO1_toLocation ?? null,
        managerial_decision_date_hijri: EDO1_managerialDecisionDateHijri ?? "",
        managerial_decision_date_gregorian: EDO1_managerialDecisionDateGregorian ?? "",
        managerialDecisionNumber: EDO1_managerialDecisionNumber ?? "",
      });
    }

    // EDO-2: Establishment Decision - Job
    else if (subCategoryValue === "EDO-2") {
      const {
        EDO2_fromJob,
        EDO2_toJob,
        EDO2_managerialDecisionDateHijri,
        EDO2_managerialDecisionDateGregorian,
        EDO2_managerialDecisionNumber,
      } = updatedValues;

      Object.assign(updatedTopic, {
        FromJob: EDO2_fromJob ?? "",
        ToJob: EDO2_toJob ?? "",
        Date_New: formatDateForStorage(EDO2_managerialDecisionDateHijri),
        ManDecsDate: formatDateForStorage(EDO2_managerialDecisionDateGregorian),
        ManagerialDecisionNumber: EDO2_managerialDecisionNumber ?? "",
        // Legacy fields for backward compatibility
        fromJob: EDO2_fromJob ?? "",
        toJob: EDO2_toJob ?? "",
        managerial_decision_date_hijri: EDO2_managerialDecisionDateHijri ?? "",
        managerial_decision_date_gregorian: EDO2_managerialDecisionDateGregorian ?? "",
        managerialDecisionNumber: EDO2_managerialDecisionNumber ?? "",
      });
    }

    // EDO-3: Establishment Decision - Reduction
    else if (subCategoryValue === "EDO-3") {
      const {
        EDO3_amountOfReduction,
        EDO3_managerialDecisionDateHijri,
        EDO3_managerialDecisionDateGregorian,
        EDO3_managerialDecisionNumber,
      } = updatedValues;

      Object.assign(updatedTopic, {
        AmountOfReduction: EDO3_amountOfReduction ?? "",
        pyTempDate: formatDateForStorage(EDO3_managerialDecisionDateHijri),
        ManagerialDecisionDate_New: formatDateForStorage(EDO3_managerialDecisionDateGregorian),
        ManagerialDecisionNumber: EDO3_managerialDecisionNumber ?? "",
        // Legacy fields for backward compatibility
        amountOfReduction: EDO3_amountOfReduction ?? "",
        managerial_decision_date_hijri: EDO3_managerialDecisionDateHijri ?? "",
        managerial_decision_date_gregorian: EDO3_managerialDecisionDateGregorian ?? "",
        managerialDecisionNumber: EDO3_managerialDecisionNumber ?? "",
      });
    }

    // EDO-4: Establishment Decision - Penalty
    else if (subCategoryValue === "EDO-4") {
      const {
        EDO4_typesOfPenalties,
        EDO4_managerialDecisionDateHijri,
        EDO4_managerialDecisionDateGregorian,
        EDO4_managerialDecisionNumber,
      } = updatedValues;

      Object.assign(updatedTopic, {
        PenalityType: EDO4_typesOfPenalties?.value ?? "",
        PenalityTypeLabel: EDO4_typesOfPenalties?.label ?? "",
        Date_New: formatDateForStorage(EDO4_managerialDecisionDateHijri),
        ManDecsDate: formatDateForStorage(EDO4_managerialDecisionDateGregorian),
        ManagerialDecisionNumber: EDO4_managerialDecisionNumber ?? "",
        // Legacy fields for backward compatibility
        typesOfPenalties: EDO4_typesOfPenalties ?? null,
        managerial_decision_date_hijri: EDO4_managerialDecisionDateHijri ?? "",
        managerial_decision_date_gregorian: EDO4_managerialDecisionDateGregorian ?? "",
        managerialDecisionNumber: EDO4_managerialDecisionNumber ?? "",
      });
    }

    // HIR-1: Housing Insurance Request
    else if (subCategoryValue === "HIR-1") {
      const {
        HIR1_IsBylawsIncludeAddingAccomodation,
        HIR1_IsContractIncludeAddingAccommodation,
        HIR1_HousingSpecificationsInContract,
        HIR1_HousingSpecificationsInBylaws,
        HIR1_HousingSpecifications,
      } = updatedValues;

      // Ensure both accommodation flags have values
      const bylawsFlag = HIR1_IsBylawsIncludeAddingAccomodation || "";
      const contractFlag = HIR1_IsContractIncludeAddingAccommodation || "";
      
      // If one is "Yes" and the other is empty, set the empty one to "No"
      const finalBylawsFlag = bylawsFlag === "Yes" ? "Yes" : (contractFlag === "Yes" ? "No" : "");
      const finalContractFlag = contractFlag === "Yes" ? "Yes" : (bylawsFlag === "Yes" ? "No" : "");

      Object.assign(updatedTopic, {
        IsBylawsIncludeAddingAccomodation: finalBylawsFlag,
        IsContractIncludeAddingAccommodation: finalContractFlag,
        HousingSpecificationsInContract: HIR1_HousingSpecificationsInContract ?? "",
        HousingSpecificationsInBylaws: HIR1_HousingSpecificationsInBylaws ?? "",
        HousingSpecifications: HIR1_HousingSpecifications ?? "",
        // Legacy fields for backward compatibility
        doesBylawsIncludeAddingAccommodations: finalBylawsFlag === "Yes",
        doesContractIncludeAddingAccommodations: finalContractFlag === "Yes",
        housingSpecificationInByLaws: HIR1_HousingSpecificationsInBylaws ?? "",
        housingSpecificationsInContract: HIR1_HousingSpecificationsInContract ?? "",
        actualHousingSpecifications: HIR1_HousingSpecifications ?? "",
      });
    }

    // JAR-2: Job and Assignment Request - Title
    else if (subCategoryValue === "JAR-2") {
      const {
        JAR2_currentJobTitle,
        JAR2_requiredJobTitle,
      } = updatedValues;

      Object.assign(updatedTopic, {
        CurrentJobTitle: JAR2_currentJobTitle ?? "",
        RequiredJobTitle: JAR2_requiredJobTitle ?? "",
        // Legacy fields for backward compatibility
        currentJobTitle: JAR2_currentJobTitle ?? "",
        requiredJobTitle: JAR2_requiredJobTitle ?? "",
      });
    }

    // JAR-3: Job and Assignment Request - Promotion
    else if (subCategoryValue === "JAR-3") {
      const {
        JAR3_promotionMechanism,
        JAR3_additionalUpgrade,
      } = updatedValues;

      Object.assign(updatedTopic, {
        PromotionMechanism: JAR3_promotionMechanism ?? "",
        AdditionalUpgrade: JAR3_additionalUpgrade ?? "",
        // Legacy fields for backward compatibility
        promotionMechanism: JAR3_promotionMechanism ?? "",
        additionalUpgrade: JAR3_additionalUpgrade ?? "",
      });
    }

    // JAR-4: Job and Assignment Request - Position
    else if (subCategoryValue === "JAR-4") {
      const {
        JAR4_CurrentPosition,
        JAR4_WantedJob,
      } = updatedValues;

      Object.assign(updatedTopic, {
        CurrentPosition: JAR4_CurrentPosition ?? "",
        WantedJob: JAR4_WantedJob ?? "",
        // Legacy fields for backward compatibility
        currentPosition: JAR4_CurrentPosition ?? "",
        theWantedJob: JAR4_WantedJob ?? "",
      });
    }

    // LRESR-1: Labor Relations and Employment Service Request
    else if (subCategoryValue === "LRESR-1") {
      const {
        LRESR1_Amount,
      } = updatedValues;

      Object.assign(updatedTopic, {
        Amount: LRESR1_Amount ?? "",
        // Legacy fields for backward compatibility
        amount: LRESR1_Amount ?? "",
      });
    }

    // TTR-1: Travel and Transportation Request
    else if (subCategoryValue === "TTR-1") {
      const {
        TTR1_travelingWay,
      } = updatedValues;

      Object.assign(updatedTopic, {
        TravelingWay: TTR1_travelingWay?.label ?? "",
        TravelingWay_Code: TTR1_travelingWay?.value ?? "",
        // Legacy fields for backward compatibility
        travelingWay: TTR1_travelingWay ?? null,
      });
    }

    // RFR-1: Reward and Financial Request
    else if (subCategoryValue === "RFR-1") {
      const {
        RFR1_Amount,
        RFR1_Consideration,
        RFR1_dateHijri,
        RFR1_dateGregorian,
      } = updatedValues;

      Object.assign(updatedTopic, {
        Amount: RFR1_Amount ?? "",
        Consideration: RFR1_Consideration ?? "",
        DateHijri: formatDateForStorage(RFR1_dateHijri),
        DateGregorian: formatDateForStorage(RFR1_dateGregorian),
        // Legacy fields for backward compatibility
        rewardRequestAmount: RFR1_Amount ?? "",
        consideration: RFR1_Consideration ?? "",
        date_hijri: RFR1_dateHijri ?? "",
        date_gregorian: RFR1_dateGregorian ?? "",
      });
    }

    // RR-1: Reward Request
    else if (subCategoryValue === "RR-1") {
      const {
        RR1_Amount,
        RR1_Type,
      } = updatedValues;

      Object.assign(updatedTopic, {
        Amount: RR1_Amount ?? "",
        Type: RR1_Type ?? "",
        // Legacy fields for backward compatibility
        rewardAmount: RR1_Amount ?? "",
        rewardType: RR1_Type ?? "",
      });
    }

    // LCUT-1: Labor Contract and Unemployment Termination
    else if (subCategoryValue === "LCUT-1") {
      const {
        LCUT1_amountOfCompensation,
      } = updatedValues;

      Object.assign(updatedTopic, {
        AmountOfCompensation: LCUT1_amountOfCompensation ?? "",
        // Legacy fields for backward compatibility
        amountOfCompensation: LCUT1_amountOfCompensation ?? "",
      });
    }



    // DR-1: Document Request (No specific fields)
    else if (subCategoryValue === "DR-1") {
      // DR-1 has no specific fields, just acknowledgment
    }

    // CR-1: Custody Request
    else if (subCategoryValue === "CR-1") {
      const {
        typeOfCustody,
        compensationAmount,
      } = updatedValues;

      Object.assign(updatedTopic, {
        TypeOfCustody: typeOfCustody?.label ?? "",
        TypeOfCustody_Code: typeOfCustody?.value ?? "",
        Amount: compensationAmount ?? "", // Changed from "amount"
      });
    }

    // LCUTE-1: Labor Contract and Unemployment Termination - Establishment
    else if (subCategoryValue === "LCUTE-1") {
      const {
        amountOfCompensation,
      } = updatedValues;

      Object.assign(updatedTopic, {
        AmountOfCompensation: amountOfCompensation ?? "",
      });
    }

    // DPVR-1: Damages and Property Value Request
    else if (subCategoryValue === "DPVR-1") {
      const {
        damagedValue,
        damagedType,
        amountOfCompensation,
      } = updatedValues;

      Object.assign(updatedTopic, {
        DamagedValue: damagedValue ?? "",
        DamagedType: damagedType ?? "",
        AmountOfCompensation: amountOfCompensation ?? "",
      });
    }

    // LRESR-1: End of Service Reward
    else if (subCategoryValue === "LRESR-1") {
      const {
        LRESR1_Amount,
      } = updatedValues;

      Object.assign(updatedTopic, {
        Amount: LRESR1_Amount ?? "",
        // Legacy fields for backward compatibility
        endOfServiceRewardAmount: LRESR1_Amount ?? "",
      });
    }

    // AWRW-1: Additional Worker Rights and Wages
    else if (subCategoryValue === "AWRW-1") {
      const {
        amount,
        from_date_hijri,
        from_date_gregorian,
        to_date_hijri,
        to_date_gregorian,
      } = updatedValues;

      Object.assign(updatedTopic, {
        Amount: amount ?? "",
        FromDateHijri: formatDateForStorage(from_date_hijri),
        FromDateGregorian: formatDateForStorage(from_date_gregorian),
        ToDateHijri: formatDateForStorage(to_date_hijri),
        ToDateGregorian: formatDateForStorage(to_date_gregorian),
      });
    }

    // AWRW-2: Additional Worker Rights and Wages
    else if (subCategoryValue === "AWRW-2") {
      const {
        amount,
        from_date_hijri,
        from_date_gregorian,
        to_date_hijri,
        to_date_gregorian,
      } = updatedValues;

      Object.assign(updatedTopic, {
        Amount: amount ?? "",
        FromDateHijri: formatDateForStorage(from_date_hijri),
        FromDateGregorian: formatDateForStorage(from_date_gregorian),
        ToDateHijri: formatDateForStorage(to_date_hijri),
        ToDateGregorian: formatDateForStorage(to_date_gregorian),
      });
    }

    // RLRAHI-1: Regional Labor Relations and Additional Housing Information
    else if (subCategoryValue === "RLRAHI-1") {
      const {
        fromLocation,
        toLocation,
        managerial_decision_date_hijri,
        managerial_decision_date_gregorian,
        managerialDecisionNumber,
        additionalDetails,
      } = updatedValues;

      Object.assign(updatedTopic, {
        FromLocation: fromLocation?.label ?? "",
        FromLocation_Code: fromLocation?.value ?? "",
        ToLocation: toLocation?.label ?? "",
        ToLocation_Code: toLocation?.value ?? "",
        ManagerialDecisionDateHijri: formatDateForStorage(managerial_decision_date_hijri),
        ManagerialDecisionDateGregorian: formatDateForStorage(managerial_decision_date_gregorian),
        ManagerialDecisionNumber: managerialDecisionNumber ?? "",
        AdditionalDetails: additionalDetails ?? "",
      });
    }

    // RUF-1: Refund Request (Establishment)
    else if (subCategoryValue === "RUF-1") {
      const {
        RefundType,
        refundAmount,
      } = updatedValues;

      console.log("[📝 UPDATE TOPIC] RUF-1 Debug - RefundType:", RefundType);
      console.log("[📝 UPDATE TOPIC] RUF-1 Debug - refundAmount:", refundAmount);

      Object.assign(updatedTopic, {
        RefundType: RefundType ?? "",
        Amount: refundAmount ?? "",
      });
    }

    // Default case for any unhandled subtopics
    else {
      console.warn(`[⚠️ UPDATE TOPIC] No specific handler for subtopic: ${subCategoryValue}`);
      // Fallback to generic mapping for unhandled subtopics
      Object.assign(updatedTopic, {
        ...updatedValues,
        // Add any common fields that should be mapped for all subtopics
      });
    }

    // ====================================================
    console.log("[📝 UPDATE TOPIC] Mapped payload to save:", updatedTopic);
    console.log("[📝 UPDATE TOPIC] otherAllowance in updatedTopic:", updatedTopic.otherAllowance);
    console.log("[📝 UPDATE TOPIC] forAllowance in updatedTopic:", updatedTopic.forAllowance);

    setCaseTopics((prev) => {
      console.log("[📝 UPDATE TOPIC] Previous caseTopics before update:", prev);
      console.log("[📝 UPDATE TOPIC] Updating topic at index:", editTopicIndex);
      
      const newTopics = prev.map((topic, idx) => {
        if (idx === editTopicIndex) {
          console.log(`[📝 UPDATE TOPIC] Updating topic ${idx} (BPSR-1):`, topic, "->", updatedTopic);
          return updatedTopic;
        } else {
          console.log(`[📝 UPDATE TOPIC] Keeping topic ${idx} unchanged:`, topic);
          return topic;
        }
      });
      
      console.log("[📝 UPDATE TOPIC] Updated caseTopics:", newTopics);
      
      // Update the editTopic with the new values immediately, preserving the index
      setEditTopic({ ...updatedTopic, index: editTopicIndex });
      
      return newTopics;
    });

    toast.success(t("topic_updated_successfully") || "Topic updated successfully");
    console.log("[✅ UPDATE TOPIC] Updated editTopic:", updatedTopic);

    reset();
    setDate({ hijri: null, gregorian: null, dateObject: null });
    setShowLegalSection(false);
    setShowTopicData(false);
    setEditTopicIndex(null);
    close();
  };


  const handleCancel = () => {
    reset();
    setShowLegalSection(false);
    setShowTopicData(false);
    setEditTopic(null);
    close();
    // Reset prefill ref when modal closes
    prefillDoneRef.current = null;
  };

  const handleSave = () => {
    if (!showLegalSection) {
      goToLegalStep();
    } else if (!showTopicData) {
      goToTopicDataStep();
    }
  };

  const [lastAction, setLastAction] = useState<"Save" | "Next" | undefined>(
    undefined
  );

  const handleSaveApi = async (): Promise<ApiResponse> => {
    console.log("[📡 SAVE API] Function called");
    console.log("[📡 SAVE API] Current state:", { lastAction, isSubmitting, isUpdatingRef: isUpdatingRef.current });
    
    // Prevent multiple calls to UpdateCaseTopics
    if (lastAction === "Save" || isSubmitting || isUpdatingRef.current) {
      console.log("[📡 SAVE API] Preventing multiple calls - lastAction:", lastAction, "isSubmitting:", isSubmitting, "isUpdating:", isUpdatingRef.current);
      // Return a response that indicates operation is in progress - don't show success toast
      return {
        ServiceStatus: "InProgress",
        SuccessCode: "IN_PROGRESS",
        ErrorCodeList: []
      };
    }

    console.log("[📡 SAVE API] Last saved flag before:", lastSaved);
    setLastAction("Save");
    isUpdatingRef.current = true;
    const payload = getPayloadBySubTopicID(caseTopics, subCategory, "Save", caseId);
    console.log("[📡 SAVE API] Payload to send:", payload);

    try {
      const response = onSaveApi
        ? await onSaveApi(payload)
        : await updateHearingTopics(payload).unwrap();

      console.log("[📡 SAVE API] Response received:", response);
      console.log("[📡 SAVE API] SuccessCode:", response?.SuccessCode);
      console.log("[📡 SAVE API] ServiceStatus:", response?.ServiceStatus);
      console.log("[📡 SAVE API] ErrorCodeList:", response?.ErrorCodeList);
      
      const isSuccessCode = response?.SuccessCode === "200";
      const isSuccessStatus = response?.ServiceStatus === "Success";
      const hasNoErrors = !response?.ErrorCodeList || response?.ErrorCodeList.length === 0;
      
      console.log("[📡 SAVE API] Success conditions:", { isSuccessCode, isSuccessStatus, hasNoErrors });
      
      // Check if there are validation errors in the response
      if (response?.ErrorCodeList && response.ErrorCodeList.length > 0) {
        console.log("[📡 SAVE API] Validation errors found in API response");
        setLastAction(undefined);
        return response;
      }
      
      if ((isSuccessCode || isSuccessStatus) && hasNoErrors) {
        console.log("[📡 SAVE API] API call successful");
        setLastSaved(true);
        setLastAction(undefined); // Reset lastAction after successful save
      } else {
        console.log("[📡 SAVE API] API call not successful");
        setLastAction(undefined); // Reset lastAction even on failure
        isUpdatingRef.current = false;
      }
      return response;
    } catch (error: any) {
      console.error("[📡 SAVE API] Error during save:", error);
      setLastAction(undefined);
      isUpdatingRef.current = false;
      // Don't show toast here - let the caller handle the error
      return Promise.reject(error);
    } finally {
      isUpdatingRef.current = false;
    }
  };

  const { onSave, isSaveLoading, isSaveSuccess, isSaveError } = useCaseSave(handleSaveApi);


  const handleNext = async (): Promise<{ success: boolean; error?: any; response?: any }> => {
    // Prevent multiple calls to UpdateCaseTopics
    if (lastAction === "Next" || isSubmitting || isUpdatingRef.current) {
      console.log("[🔍 HANDLE NEXT] Preventing multiple calls - lastAction:", lastAction, "isSubmitting:", isSubmitting, "isUpdating:", isUpdatingRef.current);
      return { success: false, error: new Error("Operation already in progress") };
    }

    const latestFormValues = getValues();
    setFormData(latestFormValues);
    try {
      setLastAction("Next");
      isUpdatingRef.current = true;
      const payload = getPayloadBySubTopicID(
        caseTopics,
        subCategory,
        "Next",
        caseId
      );

      const response = await updateHearingTopics(payload).unwrap();

      console.log("[🔍 HANDLE NEXT] API Response:", response);
      console.log("[🔍 HANDLE NEXT] Response ServiceStatus:", response?.ServiceStatus);
      console.log("[🔍 HANDLE NEXT] Response ErrorCodeList:", response?.ErrorCodeList);

      // Check if there are validation errors in the response
      if (response?.ErrorCodeList && response.ErrorCodeList.length > 0) {
        console.log("[🔍 HANDLE NEXT] Validation errors found in API response");
        setLastAction(undefined);
        isUpdatingRef.current = false;
        return { 
          success: false, 
          error: response.ErrorCodeList[0], 
          response 
        };
      }

      // Check if the response indicates success
      const hasSuccessCode = response?.SuccessCode === "200";
      const hasSuccessStatus = response?.ServiceStatus === "Success";
      const hasNoErrors = !response?.ErrorCodeList || response.ErrorCodeList.length === 0;
      
      // Additional check for empty ErrorCodeList array
      const hasEmptyErrorList = Array.isArray(response?.ErrorCodeList) && response.ErrorCodeList.length === 0;

      console.log("[🔍 HANDLE NEXT] Response analysis:", {
        hasSuccessCode,
        hasSuccessStatus,
        hasNoErrors,
        hasEmptyErrorList,
        SuccessCode: response?.SuccessCode,
        ServiceStatus: response?.ServiceStatus,
        ErrorCodeList: response?.ErrorCodeList,
        fullResponse: response
      });

      // More robust success condition - prioritize ServiceStatus when SuccessCode is not present
      const isSuccessful = (hasSuccessStatus && hasNoErrors) || (hasSuccessCode && hasNoErrors);
      
      if (isSuccessful) {
        // API call successful - navigate to next step
        console.log("[🔍 HANDLE NEXT] API call successful, navigating to next step");
        console.log("[🔍 HANDLE NEXT] Showing success toast");
        toast.success(t("save_success"));
        updateParams(currentStep + 1, 0);
        return { success: true, response };
      } else {
        console.log("[🔍 HANDLE NEXT] API call was not successful");
        console.log("[🔍 HANDLE NEXT] Failed conditions:", {
          hasSuccessCode,
          hasSuccessStatus,
          hasNoErrors,
          hasEmptyErrorList,
          isSuccessful
        });
        // Clear lastAction to allow retry
        setLastAction(undefined);
        isUpdatingRef.current = false;
        return { success: false, response };
      }
      // Errors are automatically handled by the centralized error handler
    } catch (error: any) {
      setLastAction(undefined);
      isUpdatingRef.current = false;
      console.error("[🔍 HANDLE NEXT] Error during API call:", error);
      return { success: false, error };
    } finally {
      isUpdatingRef.current = false;
    }
  };

  const handlePrevious = useCallback(() => {
    if (currentStep === 1) {
      updateParams(0, [0, 1, 2].length - 1);
    } else {
      updateParams(
        currentStep === 0 ? 0 : currentStep - 1,
        Math.max(currentTab - 1, 0)
      );
    }
  }, [currentStep, currentTab, updateParams]);

  const saveTopic = (): number => {
    const newTopic = getValues();

    console.log('[🔍 SAVE TOPIC] All form values:', newTopic);

    // التحقق من القيم الفارغة - Improved validation with subtopic-specific logic
    const subTopicID = newTopic.subCategory?.value;
    
    for (const [key, value] of Object.entries(newTopic)) {
      // Skip validation for optional fields
      const optionalFields = [
        "housingSpecificationsInContract",
        "actualHousingSpecifications", 
        "housingSpecificationInByLaws",
        "regulatoryText",
        "date_hijri",
        "date_gregorian",
        "managerial_decision_date_hijri",
        "managerial_decision_date_gregorian",
        "topicData", // Form metadata
        "legalSection", // Form metadata
        "subCategoryData", // Form metadata
        "subCategoryOptions", // Form metadata
        // MIR-1 conditional fields - these are handled by dynamic validation
        "MIR1_requiredDegreeOfInsurance",
        "MIR1_theReason", 
        "MIR1_currentInsuranceLevel",
        "requiredDegreeOfInsurance",
        "theReason",
        "currentInsuranceLevel",
        // HIR-1 conditional fields - these are handled by dynamic validation
        "HIR1_HousingSpecificationsInBylaws",
        "HIR1_HousingSpecificationsInContract",
        "HIR1_HousingSpecifications",
        "HIR1_IsBylawsIncludeAddingAccomodation",
        "HIR1_IsContractIncludeAddingAccommodation"
      ];
      
      // Special handling for WR-1 otherAllowance field
      if ((key === "otherAllowance" || key === "WR1_otherAllowance") && subTopicID === "WR-1") {
        const forAllowance = newTopic.WR1_forAllowance || newTopic.forAllowance;
        const isOther = forAllowance && (
          ["FA11", "OTHER", "3"].includes(String(forAllowance.value)) ||
          (forAllowance.label ?? "").toLowerCase().includes("other")
        );
        
        // Only validate otherAllowance if forAllowance is "Other"
        if (!isOther) {
          continue; // Skip validation for this field
        }
      }

      // Special handling for BPSR-1 otherCommission field
      if ((key === "otherCommission" || key === "BPSR1_otherCommission") && subTopicID === "BPSR-1") {
        const commissionType = newTopic.BPSR1_commissionType || newTopic.commissionType;
        const isOther = commissionType && (
          ["OTHER", "3"].includes(String(commissionType.value)) ||
          (commissionType.label ?? "").toLowerCase().includes("other")
        );

        // Only validate otherCommission if commissionType is "Other"
        if (!isOther) {
          continue; // Skip validation for this field
        }
      }

      // Special handling for MIR-1 fields
      if (subTopicID === "MIR-1") {
        const typeOfRequest = newTopic.typeOfRequest;
        const requiresAdditionalFields = typeOfRequest && ["REQT1", "REQT2", "REQT3"].includes(String(typeOfRequest.value));
        const requiresReasonAndCurrentLevel = typeOfRequest && String(typeOfRequest.value) === "REQT3";

        // Skip validation for requiredDegreeOfInsurance if not needed
        if (key === "requiredDegreeOfInsurance" && !requiresAdditionalFields) {
          continue;
        }

        // Skip validation for theReason and currentInsuranceLevel if not needed
        if ((key === "theReason" || key === "currentInsuranceLevel") && !requiresReasonAndCurrentLevel) {
          continue;
        }
      }

      // Special handling for HIR-1 accommodation source fields
      if (subTopicID === "HIR-1") {
        const accommodationSource = newTopic.HIR1_AccommodationSource;
        
        // Skip validation for housing specifications fields if they belong to the unselected option
        if (key === "HIR1_HousingSpecificationsInBylaws" && accommodationSource !== "bylaws") {
          continue; // Skip validation for bylaws field if contract is selected
        }
        
        if ((key === "HIR1_HousingSpecificationsInContract" || key === "HIR1_HousingSpecifications") && accommodationSource !== "contract") {
          continue; // Skip validation for contract fields if bylaws is selected
        }
        
        // Skip validation for the accommodation source flags if they belong to the unselected option
        if (key === "HIR1_IsBylawsIncludeAddingAccomodation" && accommodationSource !== "bylaws") {
          continue; // Skip validation for bylaws flag if contract is selected
        }
        
        if (key === "HIR1_IsContractIncludeAddingAccommodation" && accommodationSource !== "contract") {
          continue; // Skip validation for contract flag if bylaws is selected
        }
        
        // For accommodation source flags, only validate if they are empty (not "Yes" or "No")
        if ((key === "HIR1_IsBylawsIncludeAddingAccomodation" || key === "HIR1_IsContractIncludeAddingAccommodation") && 
            (value === "Yes" || value === "No")) {
          continue; // Skip validation if the field has a valid value
        }
      }

      // Special handling for topics with required date fields
      if (["CMR-6", "CMR-7", "CMR-8", "BR-1", "BPSR-1", "RLRAHI-1"].includes(subTopicID)) {
        const requiredDateFields = ["from_date_hijri", "to_date_hijri", "date_hijri"];
        if (requiredDateFields.includes(key) && (value === "" || (typeof value === "string" && value.trim().length === 0))) {
          console.log(`[🔍 SAVE TOPIC] ${subTopicID} validation failed for required date field: ${key} with value: "${value}"`);
          return 0;
        }
      }
      
      if ((value === "" || (typeof value === "string" && value.trim().length === 0)) && !optionalFields.includes(key)) {
        console.log(`[🔍 SAVE TOPIC] Validation failed for field: ${key} with value: "${value}"`);
        console.log(`[🔍 SAVE TOPIC] SubTopicID: ${subTopicID}`);
        console.log(`[🔍 SAVE TOPIC] forAllowance:`, newTopic.forAllowance);
        console.log(`[🔍 SAVE TOPIC] Optional fields:`, optionalFields);
        console.log(`[🔍 SAVE TOPIC] Is field optional:`, optionalFields.includes(key));
        return 0;
      }
    }

    // // التحقق من تكرار الموضوع
    // const isDuplicate = caseTopics.some(
    //   (topic) =>
    //     topic.SubTopicID === newTopic.subCategory.value &&
    //     topic.MainTopicID === newTopic.mainCategory.value &&
    //     // استثناء الموضوع الحالي في حالة التعديل
    //     (!editTopic ||
    //       topic.SubTopicID !== editTopic?.subCategory.value ||
    //       topic.MainTopicID !== editTopic?.mainCategory.value)
    // );

    // if (isDuplicate) {
    //   toast.error(
    //     t("duplicate_topic_error") ||
    //     "This topic is already added. Please choose a different topic."
    //   );
    //   return 0;
    // }

    // Format dates for storage (remove slashes)
    const formatDateForStorage = (date: string) => {
      if (!date) return "";
      return date.replace(/\//g, "");
    };

    const topicToSave = {
      ...newTopic,
      MainTopicID: newTopic.mainCategory.value,
      SubTopicID: newTopic.subCategory.value,
      MainSectionHeader: newTopic.mainCategory.label,
      SubTopicName: newTopic?.subCategory.label,
      CaseTopicName: newTopic?.mainCategory.label,
      Date_New: newTopic.date_hijri,
      ManDecsDate: newTopic.manDecsDate,
      // Only send string codes for FromLocation and ToLocation
      FromLocation:
        newTopic?.fromLocation?.value || newTopic?.fromLocation || "",
      ToLocation: newTopic?.toLocation?.value || newTopic?.toLocation || "",
      fromJob: newTopic.fromJob || "",
      toJob: newTopic.toJob || "",
      Amount: newTopic.amount,
      PayDue: newTopic.payDue,
      DurationOfLeaveDue: newTopic.durationOfLeaveDue,
      WagesAmount: newTopic.wagesAmount,
      CompensationAmount: newTopic.compensationAmount,
      InjuryType: newTopic.injuryType,
      BonusAmount: newTopic.bonusAmount,
      AccordingToAgreement:
        newTopic?.accordingToAgreement?.value ||
        newTopic?.accordingToAgreement ||
        "",
      OtherCommission: newTopic.otherCommission,
      AmountOfCompensation: newTopic.amountOfCompensation,
      DamagedValue: newTopic.damagedValue,
      RequiredJobTitle: newTopic.requiredJobTitle,
      CurrentJobTitle: newTopic.currentJobTitle,
      DamagedType: newTopic.damagedType,
      CurrentInsuranceLevel: newTopic.currentInsuranceLevel,
      TheReason: newTopic.theReason,
      TheWantedJob: newTopic.theWantedJob,
      CurrentPosition: newTopic.currentPosition,
      TypeOfCustody: newTopic.typeOfCustody,
      AmountsPaidFor: newTopic.amountsPaidFor,
      GregorianDate: newTopic.gregorianDate,
      DecisionNumber: newTopic.decisionNumber,
      RegionCode: newTopic.DefendantsEstablishmentRegion,
      CityCode: newTopic.DefendantsEstablishmentCity,
      OccupationCode: newTopic.DefendantsEstablishOccupation,
      GenderCode: newTopic.DefendantsEstablishmentGender,
      NationalityCode: newTopic.DefendantsEstablishmentNationality,
      PrisonerId: newTopic.DefendantsEstablishmentPrisonerId,
      ForAllowance:
        newTopic?.forAllowance?.value || newTopic?.forAllowance || "",
      RewardType: newTopic.rewardType,
      Consideration: newTopic.consideration,
      TravelingWay:
        newTopic?.travelingWay?.value || newTopic?.travelingWay || "",
      PenalityType:
        newTopic.typesOfPenalties?.value || newTopic.typesOfPenalties || "",
      LoanAmount: newTopic.loanAmount,
      ManagerialDecisionNumber: newTopic.managerialDecisionNumber,
      ManagerialDecisionDateHijri: formatDateForStorage(
        newTopic.managerial_decision_date_hijri
      ),
      ManagerialDecisionDateGregorian: formatDateForStorage(
        newTopic.managerial_decision_date_gregorian
      ),
      TypesOfPenalties:
        newTopic.typesOfPenalties?.value || newTopic.typesOfPenalties || "",
      TypesOfPenaltiesLabel: newTopic.typesOfPenalties?.label || "",
      // --- Normalize kindOfHoliday for CMR-5 ---
      kindOfHoliday:
        newTopic.subCategory?.value === "CMR-5"
          ? newTopic.kindOfHoliday && typeof newTopic.kindOfHoliday === "object"
            ? newTopic.kindOfHoliday
            : newTopic.kindOfHoliday
              ? {
                value: newTopic.kindOfHoliday,
                label:
                  (leaveTypeData?.DataElements || []).find(
                    (item: any) => item.ElementKey === newTopic.kindOfHoliday
                  )?.ElementValue || newTopic.kindOfHoliday,
              }
              : null
          : newTopic.kindOfHoliday && typeof newTopic.kindOfHoliday === "object"
            ? newTopic.kindOfHoliday
            : newTopic.kindOfHoliday
              ? { value: newTopic.kindOfHoliday, label: newTopic.kindOfHoliday }
              : null,
      kindOfHolidayLabel:
        newTopic.subCategory?.value === "CMR-5"
          ? typeof newTopic.kindOfHoliday === "object"
            ? newTopic.kindOfHoliday.label
            : (leaveTypeData?.DataElements || []).find(
              (item: any) => item.ElementKey === newTopic.kindOfHoliday
            )?.ElementValue ||
            newTopic.kindOfHoliday ||
            ""
          : undefined,
      totalAmount:
        newTopic.subCategory?.value === "CMR-5"
          ? newTopic.totalAmount || ""
          : undefined,
      workingHours:
        newTopic.subCategory?.value === "CMR-5"
          ? newTopic.workingHours || ""
          : undefined,
      additionalDetails:
        newTopic.subCategory?.value === "CMR-5"
          ? newTopic.additionalDetails || ""
          : undefined,
      // --- END CMR-5 special handling ---
      // Additional date fields
      InjuryDateHijri: formatDateForStorage(newTopic.injury_date_hijri),
      InjuryDateGregorian: formatDateForStorage(newTopic.injury_date_gregorian),
      RequestDateHijri: formatDateForStorage(newTopic.request_date_hijri),
      RequestDateGregorian: formatDateForStorage(
        newTopic.request_date_gregorian
      ),
      DateHijri: formatDateForStorage(newTopic.date_hijri),
      DateGregorian: formatDateForStorage(newTopic.date_gregorian),
      FromDateHijri: formatDateForStorage(newTopic.from_date_hijri),
      FromDateGregorian: formatDateForStorage(newTopic.from_date_gregorian),
      ToDateHijri: formatDateForStorage(newTopic.to_date_hijri),
      ToDateGregorian: formatDateForStorage(newTopic.to_date_gregorian),
      // --- EDO-3 Amount Of Reduction save ---
      amountOfReduction:
        newTopic.subCategory?.value === "EDO-3"
          ? newTopic.amountOfReduction || ""
          : undefined,
      // ──────────────── EDO SUBTOPICS MAPPING ────────────────
      // EDO-1: Cancellation of the location transfer decision
      ...(newTopic.subCategory?.value === "EDO-1" && {
        // New EDO-1 specific fields
        EDO1_fromLocation: newTopic.EDO1_fromLocation || newTopic.fromLocation || (newTopic.FromLocation_Code
          ? { value: newTopic.FromLocation_Code, label: newTopic.FromLocation }
          : null),
        EDO1_toLocation: newTopic.EDO1_toLocation || newTopic.toLocation || (newTopic.ToLocation_Code
          ? { value: newTopic.ToLocation_Code, label: newTopic.ToLocation }
          : null),
        EDO1_managerialDecisionDateHijri: newTopic.EDO1_managerialDecisionDateHijri || newTopic.managerial_decision_date_hijri || newTopic.Date_New || "",
        EDO1_managerialDecisionDateGregorian: newTopic.EDO1_managerialDecisionDateGregorian || newTopic.managerial_decision_date_gregorian || newTopic.ManDecsDate || "",
        EDO1_managerialDecisionNumber: newTopic.EDO1_managerialDecisionNumber || newTopic.managerialDecisionNumber || "",
        // Legacy fields for backward compatibility
        fromLocation: newTopic.fromLocation || (newTopic.FromLocation_Code
          ? { value: newTopic.FromLocation_Code, label: newTopic.FromLocation }
          : null),
        toLocation: newTopic.toLocation || (newTopic.ToLocation_Code
          ? { value: newTopic.ToLocation_Code, label: newTopic.ToLocation }
          : null),
        managerial_decision_date_hijri: newTopic.managerial_decision_date_hijri || newTopic.Date_New || "",
        managerial_decision_date_gregorian: newTopic.managerial_decision_date_gregorian || newTopic.ManDecsDate || "",
        managerialDecisionNumber: newTopic.managerialDecisionNumber || "",
      }),
      // EDO-2: Cancellation of the job transfer decision
      ...(newTopic.subCategory?.value === "EDO-2" && {
        // New EDO-2 specific fields
        EDO2_fromJob: newTopic.EDO2_fromJob || newTopic.fromJob || newTopic.FromJob || "",
        EDO2_toJob: newTopic.EDO2_toJob || newTopic.toJob || newTopic.ToJob || "",
        EDO2_managerialDecisionDateHijri: newTopic.EDO2_managerialDecisionDateHijri || newTopic.managerial_decision_date_hijri || newTopic.Date_New || "",
        EDO2_managerialDecisionDateGregorian: newTopic.EDO2_managerialDecisionDateGregorian || newTopic.managerial_decision_date_gregorian || newTopic.ManDecsDate || "",
        EDO2_managerialDecisionNumber: newTopic.EDO2_managerialDecisionNumber || newTopic.managerialDecisionNumber || "",
        // Legacy fields for backward compatibility
        fromJob: newTopic.fromJob || newTopic.FromJob || "",
        toJob: newTopic.toJob || newTopic.ToJob || "",
        managerial_decision_date_hijri: newTopic.managerial_decision_date_hijri || newTopic.Date_New || "",
        managerial_decision_date_gregorian: newTopic.managerial_decision_date_gregorian || newTopic.ManDecsDate || "",
        managerialDecisionNumber: newTopic.managerialDecisionNumber || "",
      }),
      // EDO-3: Cancellation of the wage reduction decision
      ...(newTopic.subCategory?.value === "EDO-3" && {
        // New EDO-3 specific fields
        EDO3_amountOfReduction: newTopic.EDO3_amountOfReduction || newTopic.amountOfReduction || newTopic.AmountOfReduction || "",
        EDO3_managerialDecisionDateHijri: newTopic.EDO3_managerialDecisionDateHijri || newTopic.managerial_decision_date_hijri || newTopic.pyTempDate || "",
        EDO3_managerialDecisionDateGregorian: newTopic.EDO3_managerialDecisionDateGregorian || newTopic.managerial_decision_date_gregorian || newTopic.ManagerialDecisionDate_New || "",
        EDO3_managerialDecisionNumber: newTopic.EDO3_managerialDecisionNumber || newTopic.managerialDecisionNumber || "",
        // Legacy fields for backward compatibility
        amountOfReduction: newTopic.amountOfReduction || newTopic.AmountOfReduction || "",
        managerial_decision_date_hijri: newTopic.managerial_decision_date_hijri || newTopic.pyTempDate || "",
        managerial_decision_date_gregorian: newTopic.managerial_decision_date_gregorian || newTopic.ManagerialDecisionDate_New || "",
        managerialDecisionNumber: newTopic.managerialDecisionNumber || "",
      }),
      // EDO-4: Cancellation of disciplinary penalty decision
      ...(newTopic.subCategory?.value === "EDO-4" && {
        // New EDO-4 specific fields
        EDO4_typesOfPenalties: newTopic.EDO4_typesOfPenalties || newTopic.typesOfPenalties || (newTopic.PenalityType_Code
          ? { value: newTopic.PenalityType_Code, label: newTopic.PenalityType }
          : null),
        EDO4_managerialDecisionDateHijri: newTopic.EDO4_managerialDecisionDateHijri || newTopic.managerial_decision_date_hijri || newTopic.Date_New || "",
        EDO4_managerialDecisionDateGregorian: newTopic.EDO4_managerialDecisionDateGregorian || newTopic.managerial_decision_date_gregorian || newTopic.ManDecsDate || "",
        EDO4_managerialDecisionNumber: newTopic.EDO4_managerialDecisionNumber || newTopic.managerialDecisionNumber || "",
        // Legacy fields for backward compatibility
        typesOfPenalties: newTopic.typesOfPenalties || (newTopic.PenalityType_Code
          ? { value: newTopic.PenalityType_Code, label: newTopic.PenalityType }
          : null),
        managerial_decision_date_hijri: newTopic.managerial_decision_date_hijri || newTopic.Date_New || "",
        managerial_decision_date_gregorian: newTopic.managerial_decision_date_gregorian || newTopic.ManDecsDate || "",
        managerialDecisionNumber: newTopic.managerialDecisionNumber || "",
      }),
      // ──────────────── END EDO SUBTOPICS MAPPING ────────────────
      // Add correct mapping for WR-1 fields
      ...(newTopic.subCategory?.value === "WR-1"
        ? {
          // New WR-1 specific fields
          WR1_wageAmount: newTopic.WR1_wageAmount || newTopic.wageAmount || "",
          WR1_fromDateHijri: newTopic.WR1_fromDateHijri || newTopic.from_date_hijri || "",
          WR1_fromDateGregorian: newTopic.WR1_fromDateGregorian || newTopic.from_date_gregorian || "",
          WR1_toDateHijri: newTopic.WR1_toDateHijri || newTopic.to_date_hijri || "",
          WR1_toDateGregorian: newTopic.WR1_toDateGregorian || newTopic.to_date_gregorian || "",
          WR1_forAllowance: newTopic.WR1_forAllowance || newTopic.forAllowance || null,
          WR1_otherAllowance: newTopic.WR1_otherAllowance || newTopic.otherAllowance || "",
          // Legacy fields for backward compatibility
          wageAmount: newTopic.wageAmount || "",
          from_date_hijri: newTopic.from_date_hijri || "",
          from_date_gregorian: newTopic.from_date_gregorian || "",
          to_date_hijri: newTopic.to_date_hijri || "",
          to_date_gregorian: newTopic.to_date_gregorian || "",
          forAllowance: newTopic.forAllowance || null,
          otherAllowance: newTopic.otherAllowance || "",
        }
        : {}),
      // Add correct mapping for WR-2 fields
      ...(newTopic.subCategory?.value === "WR-2"
        ? {
          WR2_wageAmount: newTopic.WR2_wageAmount || newTopic.wageAmount || "",
          WR2_fromDateHijri: newTopic.WR2_fromDateHijri || newTopic.from_date_hijri || "",
          WR2_fromDateGregorian: newTopic.WR2_fromDateGregorian || newTopic.from_date_gregorian || "",
          WR2_toDateHijri: newTopic.WR2_toDateHijri || newTopic.to_date_hijri || "",
          WR2_toDateGregorian: newTopic.WR2_toDateGregorian || newTopic.to_date_gregorian || "",
          // Legacy fields for backward compatibility
          wageAmount: newTopic.wageAmount || "",
          from_date_hijri: newTopic.from_date_hijri || "",
          from_date_gregorian: newTopic.from_date_gregorian || "",
          to_date_hijri: newTopic.to_date_hijri || "",
          to_date_gregorian: newTopic.to_date_gregorian || "",
        }
        : {}),
      // ──────────────── MIR SUBTOPICS MAPPING ────────────────
      ...(newTopic.SubTopicID === "MIR-1"
        ? {
          typeOfRequest: newTopic.typeOfRequest
            ? {
              value: newTopic.typeOfRequest.value,
              label: newTopic.typeOfRequest.label,
            }
            : null,
          requiredDegreeOfInsurance: newTopic.requiredDegreeOfInsurance || "",
          theReason: newTopic.theReason || "",
          currentInsuranceLevel: newTopic.currentInsuranceLevel || "",
        }
        : {}),
      // ──────────────── END MIR SUBTOPICS MAPPING ────────────────

      // ──────────────── HIR SUBTOPICS MAPPING ────────────────
      ...(newTopic.subCategory?.value === "HIR-1"
        ? {
          // Ensure both accommodation flags have values
          IsBylawsIncludeAddingAccomodation: (() => {
            const bylawsFlag = newTopic.HIR1_IsBylawsIncludeAddingAccomodation || "";
            const contractFlag = newTopic.HIR1_IsContractIncludeAddingAccommodation || "";
            return bylawsFlag === "Yes" ? "Yes" : (contractFlag === "Yes" ? "No" : "");
          })(),
          IsContractIncludeAddingAccommodation: (() => {
            const bylawsFlag = newTopic.HIR1_IsBylawsIncludeAddingAccomodation || "";
            const contractFlag = newTopic.HIR1_IsContractIncludeAddingAccommodation || "";
            return contractFlag === "Yes" ? "Yes" : (bylawsFlag === "Yes" ? "No" : "");
          })(),
          HousingSpecificationsInContract: newTopic.HIR1_HousingSpecificationsInContract || "",
          HousingSpecificationsInBylaws: newTopic.HIR1_HousingSpecificationsInBylaws || "",
          HousingSpecifications: newTopic.HIR1_HousingSpecifications || "",
          // Legacy fields for backward compatibility
          doesBylawsIncludeAddingAccommodations: newTopic.HIR1_IsBylawsIncludeAddingAccomodation === "Yes",
          doesContractIncludeAddingAccommodations: newTopic.HIR1_IsContractIncludeAddingAccommodation === "Yes",
          housingSpecificationInByLaws: newTopic.HIR1_HousingSpecificationsInBylaws || "",
          housingSpecificationsInContract: newTopic.HIR1_HousingSpecificationsInContract || "",
          actualHousingSpecifications: newTopic.HIR1_HousingSpecifications || "",
        }
        : {}),
      // ──────────────── END HIR SUBTOPICS MAPPING ────────────────

      // ──────────────── TTR SUBTOPICS MAPPING ────────────────
      ...(newTopic.SubTopicID === "TTR-1"
        ? {
          travelingWay: newTopic.TravelingWay_Code
            ? {
              value: newTopic.TravelingWay_Code,
              label: newTopic.TravelingWay,
            }
            : null,
        }
        : {}),
      // ──────────────── END TTR SUBTOPICS MAPPING ────────────────

      // ──────────────── CMR SUBTOPICS MAPPING ────────────────
      // CMR-1: Treatment refunds
      ...(newTopic.SubTopicID === "CMR-1" && {
        CMR1_amountsPaidFor:
          newTopic.CMR1_amountsPaidFor && typeof newTopic.CMR1_amountsPaidFor === "object"
            ? newTopic.CMR1_amountsPaidFor
            : null,
        CMR1_theAmountRequired:
          newTopic.CMR1_theAmountRequired !== undefined &&
            newTopic.CMR1_theAmountRequired !== null
            ? String(newTopic.CMR1_theAmountRequired)
            : "",
        // Legacy fields for backward compatibility
        amountsPaidFor:
          newTopic.amountsPaidFor && typeof newTopic.amountsPaidFor === "object"
            ? newTopic.amountsPaidFor
            : null,
        theAmountRequired:
          newTopic.theAmountRequired !== undefined &&
            newTopic.theAmountRequired !== null
            ? String(newTopic.theAmountRequired)
            : "",
      }),
      // CMR-3: Request compensation for work injury
      ...(newTopic.SubTopicID === "CMR-3" && {
        CMR3_compensationAmount:
          newTopic.CMR3_compensationAmount !== undefined &&
            newTopic.CMR3_compensationAmount !== null
            ? String(newTopic.CMR3_compensationAmount)
            : "",
        CMR3_injuryDateHijri: newTopic.CMR3_injuryDateHijri || "",
        CMR3_injuryDateGregorian: newTopic.CMR3_injuryDateGregorian || "",
        CMR3_injuryType: newTopic.CMR3_injuryType || "",
        // Legacy fields for backward compatibility
        compensationAmount:
          newTopic.compensationAmount !== undefined &&
            newTopic.compensationAmount !== null
            ? String(newTopic.compensationAmount)
            : "",
        injury_date_hijri: newTopic.injury_date_hijri || "",
        injury_date_gregorian: newTopic.injury_date_gregorian || "",
        injuryType: newTopic.injuryType || "",
      }),
      // CMR-4: Request compensation for the duration of the notice
      ...(newTopic.subCategory?.value === "CMR-4" && {
        CMR4_compensationAmount:
          newTopic.CMR4_compensationAmount !== undefined && newTopic.CMR4_compensationAmount !== null
            ? String(newTopic.CMR4_compensationAmount)
            : "",
        // Legacy fields for backward compatibility
        amount:
          newTopic.noticeCompensationAmount !== undefined && newTopic.noticeCompensationAmount !== null
            ? String(newTopic.noticeCompensationAmount)
            : "",
      }),
      // CMR-5: Pay for work during vacation
      ...(newTopic.subCategory?.value === "CMR-5" && {
        CMR5_kindOfHoliday:
          newTopic.CMR5_kindOfHoliday && typeof newTopic.CMR5_kindOfHoliday === "object"
            ? newTopic.CMR5_kindOfHoliday
            : null,
        CMR5_totalAmount:
          newTopic.CMR5_totalAmount !== undefined && newTopic.CMR5_totalAmount !== null
            ? String(newTopic.CMR5_totalAmount)
            : "",
        CMR5_workingHours:
          newTopic.CMR5_workingHours !== undefined && newTopic.CMR5_workingHours !== null
            ? String(newTopic.CMR5_workingHours)
            : "",
        CMR5_additionalDetails: newTopic.CMR5_additionalDetails ?? "",
        // Legacy fields for backward compatibility
        kindOfHoliday:
          newTopic.kindOfHoliday && typeof newTopic.kindOfHoliday === "object"
            ? newTopic.kindOfHoliday
            : null,
        totalAmount:
          newTopic.totalAmount !== undefined && newTopic.totalAmount !== null
            ? String(newTopic.totalAmount)
            : "",
        workingHours:
          newTopic.workingHours !== undefined && newTopic.workingHours !== null
            ? String(newTopic.workingHours)
            : "",
        additionalDetails: newTopic.additionalDetails ?? "",
      }),
      // CMR-6: The Wage Difference/increase
      ...(newTopic.subCategory?.value === "CMR-6" && {
        CMR6_newPayAmount:
          newTopic.CMR6_newPayAmount !== undefined && newTopic.CMR6_newPayAmount !== null
            ? String(newTopic.CMR6_newPayAmount)
            : "",
        CMR6_payIncreaseType:
          newTopic.CMR6_payIncreaseType && typeof newTopic.CMR6_payIncreaseType === "object"
            ? newTopic.CMR6_payIncreaseType
            : null,
        CMR6_wageDifference: newTopic.CMR6_wageDifference ?? "",
        CMR6_fromDateHijri: newTopic.CMR6_fromDateHijri ?? "",
        CMR6_fromDateGregorian: newTopic.CMR6_fromDateGregorian ?? "",
        CMR6_toDateHijri: newTopic.CMR6_toDateHijri ?? "",
        CMR6_toDateGregorian: newTopic.CMR6_toDateGregorian ?? "",
        // Legacy fields for backward compatibility
        from_date_hijri: newTopic.from_date_hijri ?? "",
        from_date_gregorian: newTopic.from_date_gregorian ?? "",
        to_date_hijri: newTopic.to_date_hijri ?? "",
        to_date_gregorian: newTopic.to_date_gregorian ?? "",
        newPayAmount: newTopic.newPayAmount != null ? String(newTopic.newPayAmount) : "",
        payIncreaseType: (newTopic.payIncreaseType && typeof newTopic.payIncreaseType === "object") ? newTopic.payIncreaseType : null,
        wageDifference: newTopic.wageDifference != null ? String(newTopic.wageDifference) : "",
      }),

      // CMR-7: Request for overtime pay
      ...(newTopic.SubTopicID === "CMR-7" && {
        pyTempDate: newTopic.pyTempDate ?? "",
        toDate_gregorian: newTopic.toDate_gregorian ?? "",
        date_hijri: newTopic.date_hijri ?? "",
        fromDate_gregorian: newTopic.fromDate_gregorian ?? "",
        durationOfLeaveDue:
          newTopic.durationOfLeaveDue !== undefined &&
            newTopic.durationOfLeaveDue !== null
            ? String(newTopic.durationOfLeaveDue)
            : "",
        payDue:
          newTopic.payDue !== undefined && newTopic.payDue !== null
            ? String(newTopic.payDue)
            : "",
      }),
      // CMR-8: Pay stop time
      ...(newTopic.SubTopicID === "CMR-8" && {
        CMR8_wagesAmount:
          newTopic.CMR8_wagesAmount !== undefined && newTopic.CMR8_wagesAmount !== null
            ? String(newTopic.CMR8_wagesAmount)
            : "",
        CMR8_fromDateHijri: newTopic.CMR8_fromDateHijri ?? "",
        CMR8_fromDateGregorian: newTopic.CMR8_fromDateGregorian ?? "",
        CMR8_toDateHijri: newTopic.CMR8_toDateHijri ?? "",
        CMR8_toDateGregorian: newTopic.CMR8_toDateGregorian ?? "",
        // Legacy fields for backward compatibility
        pyTempDate: newTopic.pyTempDate ?? "",
        toDate_gregorian: newTopic.toDate_gregorian ?? "",
        date_hijri: newTopic.date_hijri ?? "",
        fromDate_gregorian: newTopic.fromDate_gregorian ?? "",
        wagesAmount:
          newTopic.wagesAmount !== undefined && newTopic.wagesAmount !== null
            ? String(newTopic.wagesAmount)
            : "",
      }),
      // ──────────────── END CMR SUBTOPICS MAPPING ────────────────

      // ──────────────── BR SUBTOPICS MAPPING ────────────────
      // BR-1: Bonus Request
      ...(newTopic.subCategory?.value === "BR-1" && {
        BR1_accordingToAgreement: newTopic.BR1_accordingToAgreement || newTopic.accordingToAgreement || null,
        BR1_bonusAmount: newTopic.BR1_bonusAmount || newTopic.bonusAmount || "",
        BR1_dateHijri: newTopic.BR1_dateHijri || newTopic.date_hijri || "",
        BR1_dateGregorian: newTopic.BR1_dateGregorian || newTopic.date_gregorian || "",
        // Legacy fields for backward compatibility
        accordingToAgreement: newTopic.accordingToAgreement || null,
        bonusAmount: newTopic.bonusAmount || "",
        date_hijri: newTopic.date_hijri || "",
        date_gregorian: newTopic.date_gregorian || "",
      }),
      // ──────────────── END BR SUBTOPICS MAPPING ────────────────

      // ──────────────── BPSR SUBTOPICS MAPPING ────────────────
      // BPSR-1: Bonus and Profit Share Request
      ...(newTopic.subCategory?.value === "BPSR-1" && {
        // New BPSR-1 specific fields
        BPSR1_commissionType: newTopic.BPSR1_commissionType || newTopic.commissionType || null,
        BPSR1_accordingToAgreement: newTopic.BPSR1_accordingToAgreement || newTopic.accordingToAgreement || null,
        BPSR1_bonusProfitShareAmount: newTopic.BPSR1_bonusProfitShareAmount || newTopic.bonusProfitShareAmount || "",
        BPSR1_amountRatio: newTopic.BPSR1_amountRatio || newTopic.amountRatio || "",
        BPSR1_fromDateHijri: newTopic.BPSR1_fromDateHijri || newTopic.from_date_hijri || "",
        BPSR1_fromDateGregorian: newTopic.BPSR1_fromDateGregorian || newTopic.from_date_gregorian || "",
        BPSR1_toDateHijri: newTopic.BPSR1_toDateHijri || newTopic.to_date_hijri || "",
        BPSR1_toDateGregorian: newTopic.BPSR1_toDateGregorian || newTopic.to_date_gregorian || "",
        BPSR1_otherCommission: newTopic.BPSR1_otherCommission || newTopic.otherCommission || "",
        // Legacy fields for backward compatibility
        commissionType: newTopic.commissionType || null,
        accordingToAgreement: newTopic.accordingToAgreement || null,
        bonusProfitShareAmount: newTopic.bonusProfitShareAmount || "",
        amountRatio: newTopic.amountRatio || "",
        from_date_hijri: newTopic.from_date_hijri || "",
        from_date_gregorian: newTopic.from_date_gregorian || "",
        to_date_hijri: newTopic.to_date_hijri || "",
        to_date_gregorian: newTopic.to_date_gregorian || "",
        otherCommission: newTopic.otherCommission || "",
      }),

      // ──────────────── END BPSR SUBTOPICS MAPPING ────────────────

      // ──────────────── DR SUBTOPICS MAPPING ────────────────
      // DR-1: Documents Requests (No specific fields)
      ...(newTopic.SubTopicID === "DR-1" && {
        // DR-1 has no specific fields, just acknowledgment
      }),
      // ──────────────── END DR SUBTOPICS MAPPING ────────────────

      // ──────────────── RR SUBTOPICS MAPPING ────────────────
      // RR-1: Reward Request
      ...(newTopic.subCategory?.value === "RR-1" && {
        amount: newTopic.rewardAmount ?? "", // Changed from "amount"
        rewardType: newTopic.rewardType ?? "",
      }),
      // ──────────────── END RR SUBTOPICS MAPPING ────────────────

      // ──────────────── JAR SUBTOPICS MAPPING ────────────────
      // JAR-2: Job Application Request (currentJobTitle, requiredJobTitle)
      ...(newTopic.SubTopicID === "JAR-2" && {
        currentJobTitle: newTopic.currentJobTitle ?? "",
        requiredJobTitle: newTopic.requiredJobTitle ?? "",
      }),
      // JAR-3: Promotion Mechanism
      ...(newTopic.SubTopicID === "JAR-3"
        ? {
          doesTheInternalRegulationIncludePromotionMechanism:
            newTopic.doesTheInternalRegulationIncludePromotionMechanism ?? false,
          doesContractIncludeAdditionalUpgrade:
            newTopic.doesContractIncludeAdditionalUpgrade ?? false,
        }
        : {}),
      // JAR-4: Job Application Request (currentPosition, theWantedJob)
      ...(newTopic.SubTopicID === "JAR-4" && {
        currentPosition: newTopic.currentPosition ?? "",
        theWantedJob: newTopic.theWantedJob ?? "",
      }),
      // ──────────────── END JAR SUBTOPICS MAPPING ────────────────
      // ──────────────── RFR SUBTOPICS MAPPING ────────────────
      // RFR-1: Reward and Financial Request
      ...(newTopic.subCategory?.value === "RFR-1" && {
        amount: newTopic.RFR1_Amount ?? newTopic.rewardRequestAmount ?? "",
        consideration: newTopic.RFR1_Consideration ?? newTopic.consideration ?? "",
      }),
      // ──────────────── END RFR SUBTOPICS MAPPING ────────────────
      // ──────────────── RUF SUBTOPICS MAPPING ────────────────
      // RUF-1: Reimbursement of Undue Funds
      ...(newTopic.SubTopicID === "RUF-1" && {
        RefundType: newTopic.RefundType || newTopic.refundType || "",
        refundAmount: newTopic.Amount || newTopic.amount || "", // Map to specific field name
      }),
      // ──────────────── END RUF SUBTOPICS MAPPING ────────────────
      // ──────────────── LRESR SUBTOPICS MAPPING ────────────────
      // LRESR-1: End of Service Reward
      ...(newTopic.subCategory?.value === "LRESR-1" && {
        amount: newTopic.LRESR1_Amount ?? "",
      }),
      // LRESR-2: End of Service Reward (amount, consideration)
      ...(newTopic.subCategory?.value === "LRESR-2" && {
        amount: newTopic.endOfServiceRewardAmount ?? "", // Changed from "amount"
        consideration: newTopic.consideration ?? "",
      }),
      // LRESR-3: End of Service Reward (amount, rewardType)
      ...(newTopic.subCategory?.value === "LRESR-3" && {
        amount: newTopic.endOfServiceRewardAmount ?? "", // Changed from "amount"
        rewardType: newTopic.rewardType ?? "",
      }),
      // ──────────────── END LRESR SUBTOPICS MAPPING ────────────────
      // ──────────────── LCUT SUBTOPICS MAPPING ────────────────
      // LCUT-1: Labor Contract and Unemployment Termination
      ...(newTopic.subCategory?.value === "LCUT-1" && {
        amountOfCompensation: newTopic.LCUT1_amountOfCompensation ?? "",
      }),
      // ──────────────── END LCUT SUBTOPICS MAPPING ────────────────
    };

    // MIR-1: Medical Insurance Request
    if (newTopic.subCategory?.value === "MIR-1" || newTopic.SubTopicID === "MIR-1") {
      // New MIR-1 specific fields
      topicToSave.MIR1_typeOfRequest = newTopic.MIR1_typeOfRequest || newTopic.typeOfRequest;
      topicToSave.MIR1_requiredDegreeOfInsurance = newTopic.MIR1_requiredDegreeOfInsurance || newTopic.requiredDegreeOfInsurance;
      topicToSave.MIR1_theReason = newTopic.MIR1_theReason || newTopic.theReason;
      topicToSave.MIR1_currentInsuranceLevel = newTopic.MIR1_currentInsuranceLevel || newTopic.currentInsuranceLevel;
      // Legacy fields for backward compatibility
      topicToSave.typeOfRequest = newTopic.typeOfRequest || newTopic.MIR1_typeOfRequest;
      topicToSave.requiredDegreeOfInsurance = newTopic.requiredDegreeOfInsurance || newTopic.MIR1_requiredDegreeOfInsurance;
      topicToSave.theReason = newTopic.theReason || newTopic.MIR1_theReason;
      topicToSave.currentInsuranceLevel = newTopic.currentInsuranceLevel || newTopic.MIR1_currentInsuranceLevel;
    }

    // تحديث حالة caseTopics
    setCaseTopics((prev) => {
      const newTopics = [...prev, topicToSave];
      return newTopics;
    });

    // إضافة رسالة نجاح
    toast.success(t("topic_added_successfully") || "Topic added successfully");

    return 1;
  };

  const isStep3 = showTopicData;
  const isStep2 = showLegalSection;

  // Use the new centralized subtopic prefill hook
  const { prefillSubTopic } = useSubTopicPrefill({
    setValue,
    trigger,
    isEditing,
    editTopic,
    lookupData: {
      commissionTypeLookupData,
      accordingToAgreementLookupData,
      typeOfRequestLookupData,
      forAllowanceData,
      regionData,
      leaveTypeData,
      payIncreaseTypeData,
      amountPaidData,
      travelingWayData,
      typesOfPenaltiesData,
      typeOfCustodyData,
    },
  });

  // Use the legacy prefilling hook for backward compatibility
  useCaseTopicsPrefill({
    setValue,
    trigger,
    caseTopics,
    isEditing,
    editTopic,
  });

  // Dynamic field registration for MIR-1 conditional fields
  useEffect(() => {
    if (subCategory?.value === "MIR-1") {
      const typeOfRequest = watch("MIR1_typeOfRequest");
      
      // Check if additional fields are needed
      const needsAdditionalFields = typeOfRequest && ["REQT1", "REQT2", "REQT3"].includes(String(typeOfRequest.value));
      const needsReasonAndCurrentLevel = typeOfRequest && String(typeOfRequest.value) === "REQT3";
      
      // Register/unregister fields based on requirements
      if (needsAdditionalFields) {
        register("MIR1_requiredDegreeOfInsurance");
      } else {
        unregister("MIR1_requiredDegreeOfInsurance");
        setValue("MIR1_requiredDegreeOfInsurance", "");
      }
      
      if (needsReasonAndCurrentLevel) {
        register("MIR1_theReason");
        register("MIR1_currentInsuranceLevel");
      } else {
        unregister("MIR1_theReason");
        unregister("MIR1_currentInsuranceLevel");
        setValue("MIR1_theReason", "");
        setValue("MIR1_currentInsuranceLevel", "");
      }
    }
  }, [subCategory?.value, watch("MIR1_typeOfRequest"), register, unregister, setValue]);

  // Utility to convert Hijri (YYYYMMDD) to Gregorian (YYYYMMDD)
  function hijriToGregorian(hijri: string) {
    if (!hijri) return "";
    const dateObj = new DateObject({
      date: hijri,
      calendar: arabicCalendar,
      locale: arabicLocale,
      format: "YYYYMMDD",
    });
    return dateObj
      .convert(gregorianCalendar, gregorianLocale)
      .format("YYYYMMDD");
  }

  // Handle date context and section visibility when editing
  useEffect(() => {
    if (isEditing && editTopic && isOpen) {
      console.log("[🔧 MODAL OPEN] Setting up form for editing:", editTopic);
      
      // Show appropriate sections
      setShowLegalSection(true);
      setShowTopicData(true);
    }
  }, [isEditing, editTopic?.SubTopicID, editTopic?.id, editTopic?.index, isOpen, setShowLegalSection, setShowTopicData]);

  // Trigger prefill when editTopic changes and modal is open
  useEffect(() => {
    if (isEditing && editTopic && isOpen) {
      console.log("[🔍 PREFILL TRIGGER] editTopic changed, triggering prefill");
      setTimeout(() => {
        console.log("[🔍 PREFILL TRIGGER] Calling prefillSubTopic");
        prefillSubTopic();
      }, 100); // Small delay to ensure form is ready
    }
  }, [isEditing, editTopic, isOpen]); // Removed prefillSubTopic from dependencies



  const handleClearMainCategory = useCallback(() => {
    setValue("mainCategory", null);
    setValue("subCategory", null);
    setValue("acknowledged", false);
    setShowTopicData(false);
    setShowLegalSection(false);
    setValue("regulatoryText", "");
  }, [setShowTopicData, setShowLegalSection]);

  const handleClearSubCategory = useCallback(() => {
    setValue("subCategory", null);
    setValue("acknowledged", false);
    setShowTopicData(false);
    setValue("regulatoryText", "");
  }, [setShowTopicData]);

  const bylawsValue = useWatch({
    control,
    name: "doesBylawsIncludeAddingAccommodations",
  });
  const contractValue = useWatch({
    control,
    name: "doesContractIncludeAddingAccommodations",
  });

  useEffect(() => {
    if (bylawsValue && contractValue) {
      setValue("doesContractIncludeAddingAccommodations", false);
      setValue("housingSpecificationsInContract", "");
    } else if (contractValue && bylawsValue) {
      setValue("doesBylawsIncludeAddingAccommodations", false);
      setValue("housingSpecificationInByLaws", "");
    }
  }, [bylawsValue, contractValue]);

  // --- MOJ Contract Error UI and Handlers Disabled ---
  // To re-enable, uncomment the mojContractError state, UI, and handler code blocks as needed.
  // All references to mojContractError and setMojContractError are now commented out for linter compliance.
  /*
  useEffect(() => {
    // Only run validation for Worker or Embassy User with Establishment defendant
    if (
      (userType === "Worker" ||
        (userType === "Embassy User" && defendantStatus === "Establishment")) &&
      subCategory?.value &&
      mainCategory?.value === "WR"
    ) {
      // Guard: don't clear or set errors until lookup is ready
      if (!matchedSubCategory) return;

      const mojContractExists = matchedSubCategory?.MojContractExist === "true";
      const errorMessage = matchedSubCategory?.MojContractExistError;

      if (mojContractExists && errorMessage) {
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Set error and remember which subcategory caused it
        setMojContractError(errorMessage);
        setLastErrorSubCategory(subCategory.value);
        // Reset form state
        setValue("subCategory", null);
        setValue("acknowledged", false);
        setShowLegalSection(false);
        setShowTopicData(false);

        // Set timeout to clear error after 10 seconds
        timeoutRef.current = setTimeout(() => {
          setMojContractError(null);
          setLastErrorSubCategory(null);
        }, 10000);
      } else if (
        lastErrorSubCategory === subCategory.value &&
        (mojContractExists === false || !errorMessage)
      ) {
        // Only clear if the error was for this subcategory
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        setMojContractError(null);
        setLastErrorSubCategory(null);
      }
    }
  }, [
    userType,
    defendantStatus,
    subCategory?.value,
    mainCategory?.value,
    matchedSubCategory,
    lastErrorSubCategory,
  ]);
  */
  // --- END MOJ Contract Error UI and Handlers Disabled ---

  // Clear error when main category changes away from WR
  // useEffect(() => {
  //   if (mainCategory?.value !== "WR" && lastErrorSubCategory) {
  //     if (timeoutRef.current) {
  //       clearTimeout(timeoutRef.current);
  //     }
  //     setLastErrorSubCategory(null);
  //   }
  // }, [mainCategory?.value, lastErrorSubCategory]);

  // // Clear error when user selects a different subcategory and allow new validation
  // useEffect(() => {
  //   if (
  //     lastErrorSubCategory &&
  //     subCategory?.value &&
  //     subCategory.value !== lastErrorSubCategory &&
  //     mainCategory?.value === "WR"
  //   ) {
  //     // Clear the previous error
  //     if (timeoutRef.current) {
  //       clearTimeout(timeoutRef.current);
  //     }
  //     setLastErrorSubCategory(null);

  //     // The validation effect will run again for the new subcategory
  //     // because we cleared the error and the subcategory changed
  //   }
  // }, [subCategory?.value, lastErrorSubCategory, mainCategory?.value]);

  // ────────────────────────────────────────────────────────────────────────────────
  // Move both layout hooks to the top level, then pick between them:
  const formLayout =
    userType === "Worker" || userType === "Embassy User"
      ? useFormLayoutWorker({
        t,
        MainTopicID: mainCategory,
        SubTopicID: subCategory,
        FromLocation: fromLocation,
        ToLocation: toLocation,
        AcknowledgementTerms: acknowledged,
        showLegalSection,
        showTopicData,
        setValue,
        regulatoryText,
        handleAdd: goToLegalStep,
        handleAcknowledgeChange: (val: boolean) => {
          setValue("acknowledged", val);
          if (val) setShowTopicData(true);
        },
        handleAddTopic,
        handleSend,
        decisionNumber: decisionNumber || "",
        isEditing,
        mainCategoryData,
        subCategoryData,
        watch,
        forAllowanceData,
        typeOfRequestLookupData,
        commissionTypeLookupData,
        accordingToAgreementLookupData,
        typesOfPenaltiesData,
        matchedSubCategory,
        subTopicsLoading: isSubCategoryLoading,
        amountPaidData,
        leaveTypeData,
        travelingWayData,
        editTopic,
        caseTopics,
        setShowLegalSection,
        setShowTopicData,
        isValid,
        isMainCategoryLoading: isFetching || isLoading,
        isSubCategoryLoading,
        control,
        trigger,
        lockAccommodationSource,
        errors,
        payIncreaseTypeData,
        PayIncreaseTypeOptions,
      })
      : useFormLayoutEstablishment({
        t,
        MainTopicID: mainCategory,
        SubTopicID: subCategory,
        FromLocation: fromLocation,
        ToLocation: toLocation,
        AcknowledgementTerms: acknowledged,
        showLegalSection,
        showTopicData,
        setValue,
        regulatoryText,
        handleAdd: goToLegalStep,
        handleAcknowledgeChange: (val: boolean) => {
          setValue("acknowledged", val);
          if (val) setShowTopicData(true);
        },
        handleAddTopic,
        handleSend,
        decisionNumber: decisionNumber || "",
        isEditing,
        mainCategoryData,
        subCategoryData,
        watch,
        forAllowanceData,
        typeOfRequestLookupData,
        commissionTypeLookupData,
        accordingToAgreementLookupData,
        typesOfPenaltiesData,
        matchedSubCategory,
        subTopicsLoading: isSubCategoryLoading,
        amountPaidData,
        leaveTypeData,
        travelingWayData,
        editTopic,
        caseTopics,
        setShowLegalSection,
        setShowTopicData,
        isValid,
        isMainCategoryLoading: isFetching || isLoading,
        isSubCategoryLoading,
        lockAccommodationSource,
        errors,
        payIncreaseTypeData,
        PayIncreaseTypeOptions,
        control,
        trigger,
      });

  // Fix the FormData type issue
  interface FormData {
    mainCategory: any;
    subCategory: any;
    acknowledged: boolean;
    regulatoryText: string;
    topicData?: any;
    legalSection?: any;
  }

  const updateForm = useCallback(
    (updates: Partial<FormData>) => {
      reset(updates);
    },
    [reset]
  );

  const updateTopicData = useCallback((data: any) => {
    if (data?.TopicData) {
      setTopicData(data.TopicData);
      setShowTopicData(true);
    }
  }, []);

  const updateLegalSection = useCallback((data: any) => {
    if (data?.LegalSection) {
      setLegalSection(data.LegalSection);
      setShowLegalSection(true);
    }
  }, []);

  const fetchTopicData = useCallback(async () => {
    // Implementation will be added when the API is available
  }, []);

  const fetchLegalSection = useCallback(async () => { }, []);

  useEffect(() => {
    if (showTopicData && topicData) {
      setValue("topicData", topicData);
    }
  }, [showTopicData, topicData]);

  useEffect(() => {
    if (showLegalSection && legalSection) {
      setValue("legalSection", legalSection);
    }
  }, [showLegalSection, legalSection]);

  useEffect(() => {
    fetchTopicData();
  }, [fetchTopicData]);

  useEffect(() => {
    fetchLegalSection();
  }, [fetchLegalSection]);

  useEffect(() => {
    if (acknowledged) {
      setShowTopicData(true);
    }
  }, [acknowledged]);

  function findOption(options: Option[], value: string): Option | null {
    if (!options) return null;
    return (
      options.find((opt: Option) =>
        typeof opt === "object" ? opt.value === value : opt === value
      ) || null
    );
  }

  useEffect(() => {
    if (isEditing && editTopic && typeOfRequestLookupData?.DataElements) {
      const code =
        editTopic?.RequestType_Code ||
        editTopic?.RequestType ||
        editTopic?.TypeOfRequest;
      const matchedOption = findOption(
        typeOfRequestLookupData.DataElements.map((item: any) => ({
          value: item.ElementKey,
          label: item.ElementValue,
        })),
        code
      );
      if (matchedOption) setValue("typeOfRequest", matchedOption);
    }
  }, [isEditing, editTopic, typeOfRequestLookupData]);

  useEffect(() => {
    if (isEditing && editTopic && regionData?.DataElements) {
      let fromLocationCode =
        editTopic?.fromLocation?.value ??
        editTopic?.FromLocation_Code ??
        editTopic?.fromLocation;
      if (fromLocationCode && regionData?.DataElements) {
        // Try both string and number comparison
        const fromLocationOption = regionData.DataElements.find(
          (item: any) =>
            String(item.ElementKey) === String(fromLocationCode) ||
            Number(item.ElementKey) === Number(fromLocationCode)
        );
        setValue("fromLocation", {
          value: String(fromLocationCode),
          label: fromLocationOption
            ? fromLocationOption.ElementValue
            : String(fromLocationCode),
        });
      }

      let toLocationCode =
        editTopic?.toLocation?.value ??
        editTopic?.ToLocation_Code ??
        editTopic?.toLocation;
      if (toLocationCode && regionData?.DataElements) {
        const toLocationOption = regionData.DataElements.find(
          (item: any) =>
            String(item.ElementKey) === String(toLocationCode) ||
            Number(item.ElementKey) === Number(toLocationCode)
        );
        setValue("toLocation", {
          value: String(toLocationCode),
          label: toLocationOption
            ? toLocationOption.ElementValue
            : String(toLocationCode),
        });
      }
    }
  }, [isEditing, editTopic, regionData, setValue]);

  const { t: tCommon } = useTranslation("common");

  const [removeAttachment] = useRemoveAttachmentMutation();

  // Custom handler for AttachmentSection
  const handleRemoveAttachment = async (attachment: any, index: number) => {
    // console.log("handleRemoveAttachment called", { attachment, index });
    const key =
      attachment.FileKey ||
      attachment.fileKey ||
      attachment.attachmentKey ||
      "";
    try {
      const response = await removeAttachment({ AttachmentKey: key }).unwrap();
      if (
        response?.ServiceStatus === "Success" ||
        response?.SuccessCode === "200"
      ) {
        setAttachments((prev: any[]) => prev.filter((_, i) => i !== index));
        setAttachmentFiles((prev: any[]) => prev.filter((_, i) => i !== index));
        console.log(
          "Current language:",
          i18n.language,
          "Localized string:",
          t("attachments.remove_success")
        );
        toast.success(t("attachments.remove_success"));
      } else {
        console.log(
          "Current language:",
          i18n.language,
          "Localized string:",
          t("attachments.remove_failed")
        );
        toast.error(t("attachments.remove_failed"));
      }
    } catch (error) {
      console.log(
        "Current language:",
        i18n.language,
        "Localized string:",
        t("attachments.remove_failed")
      );
      toast.error(t("attachments.remove_failed"));
    }
  };


  // DYNAMIC: only require otherCommission when commissionType === "Other"
  const commissionTypeOpt = watch("commissionType");
  useEffect(() => {
    if (isOtherCommission(commissionTypeOpt)) {
      // only register—and make it required—when we really need it
      register("otherCommission", { required: t("fieldRequired") });
    } else {
      // completely unregister it (so no more validation or lingering errors)
      unregister("otherCommission", { keepValue: false });
    }
    // no need to trigger here: RHF will skip any unregistered field
  }, [commissionTypeOpt, register, unregister, t]);

  // DYNAMIC: only require otherAllowance when forAllowance === "Other"
  const forAllowanceOpt = watch("WR1_forAllowance");
  const isWR1 = subCategory?.value === "WR-1" || editTopic?.SubTopicID === "WR-1";
  const isEditingWR1 = isEditing && editTopic?.SubTopicID === "WR-1";
  
  useEffect(() => {
    console.log("[🔧 DYNAMIC REG] forAllowanceOpt:", forAllowanceOpt);
    console.log("[🔧 DYNAMIC REG] isWR1:", isWR1);
    console.log("[🔧 DYNAMIC REG] isEditingWR1:", isEditingWR1);
    console.log("[🔧 DYNAMIC REG] isOtherAllowance:", isOtherAllowance(forAllowanceOpt));
    
    // Only run dynamic registration when we're actually editing a WR-1 topic
    if (!isWR1 || !isEditingWR1) return;

    if (isOtherAllowance(forAllowanceOpt)) {
      console.log("[🔧 DYNAMIC REG] Registering WR1_otherAllowance field");
      // only register—and make it required—when we really need it
      register("WR1_otherAllowance", { required: t("fieldRequired") });
      // Trigger validation to clear any existing errors
      trigger("WR1_otherAllowance");
    } else {
      console.log("[🔧 DYNAMIC REG] Unregistering WR1_otherAllowance field");
      // unregister it and clear the value when not needed
      unregister("WR1_otherAllowance", { keepValue: false });
    }
  }, [forAllowanceOpt, isWR1, isEditingWR1, register, unregister, t, trigger]);

  // Trigger validation when WR1_otherAllowance value changes
  const otherAllowanceValue = watch("WR1_otherAllowance");
  useEffect(() => {
    console.log("[🔧 VALIDATION] otherAllowanceValue changed:", otherAllowanceValue);
    console.log("[🔧 VALIDATION] isWR1:", isWR1);
    console.log("[🔧 VALIDATION] isEditingWR1:", isEditingWR1);
    console.log("[🔧 VALIDATION] isOtherAllowance:", isOtherAllowance(forAllowanceOpt));
    if (isWR1 && isEditingWR1 && isOtherAllowance(forAllowanceOpt) && otherAllowanceValue !== undefined) {
      console.log("[🔧 VALIDATION] Triggering WR1_otherAllowance validation");
      trigger("WR1_otherAllowance");
    }
  }, [otherAllowanceValue, isWR1, isEditingWR1, forAllowanceOpt, trigger]);

  // DYNAMIC: only require MIR-1 additional fields when typeOfRequest requires them
  const typeOfRequestOpt = watch("MIR1_typeOfRequest");
  const isMIR1 = subCategory?.value === "MIR-1" || editTopic?.SubTopicID === "MIR-1";
  useEffect(() => {
    if (!isMIR1) return;

    const requiresAdditionalFields = typeOfRequestOpt && ["REQT1", "REQT2", "REQT3"].includes(String(typeOfRequestOpt.value));
    const requiresReasonAndCurrentLevel = typeOfRequestOpt && String(typeOfRequestOpt.value) === "REQT3";

    if (requiresAdditionalFields) {
      register("MIR1_requiredDegreeOfInsurance", { required: t("fieldRequired") });
    } else {
      unregister("MIR1_requiredDegreeOfInsurance", { keepValue: false });
      setValue("MIR1_requiredDegreeOfInsurance", "");
    }

    if (requiresReasonAndCurrentLevel) {
      register("MIR1_theReason", { required: t("fieldRequired") });
      register("MIR1_currentInsuranceLevel", { required: t("fieldRequired") });
    } else {
      unregister("MIR1_theReason", { keepValue: false });
      unregister("MIR1_currentInsuranceLevel", { keepValue: false });
      setValue("MIR1_theReason", "");
      setValue("MIR1_currentInsuranceLevel", "");
    }
  }, [typeOfRequestOpt, isMIR1, register, unregister, setValue, t]);
  

  // Add after handleTopicSelect and related hooks
  useEffect(() => {
    if (
      isEditing &&
      editTopic &&
      travelingWayData?.DataElements &&
      editTopic?.TravelingWay
    ) {
      const found = travelingWayData.DataElements.find(
        (item: any) => item.ElementKey === editTopic?.TravelingWay
      );
      if (found) {
        setValue("travelingWay", {
          value: found.ElementKey,
          label: found.ElementValue,
        });
      }
    }
  }, [isEditing, editTopic, travelingWayData, setValue]);

  return (
    <Suspense fallback={<TableLoader />}>
      <StepNavigation
        onSubmit={handleSubmit(onSubmit)}
        isValid={isValid}
        isFormSubmitting={isSubmitting}
        isFirstStep={currentStep === 0 && currentTab === 0}
        isLastStep={currentStep === steps.length - 1}
        currentStep={currentStep}
        goToNextStep={handleNext}
        goToPrevStep={handlePrevious}
        resetSteps={() => updateParams(0, 0)}
        onSave={onSave}
        isSaveLoading={isSaveLoading}
        isSaveSuccess={isSaveSuccess}
        isSaveError={isSaveError}
        canProceed={caseTopics.length > 0}
        isButtonDisabled={(direction) =>
          direction === "prev" ? currentStep === 0 && currentTab === 0 : false
        }
        showFooterBtn={showFooter}
      >
        <div className="flex flex-col min-h-auto">
          <div>
            {caseTopics.length > 0 ? (
              <>
                <div className="mx-4">
                  <p className="text-primary-600 font-semibold text-md leading-6 font-primary mb-7xl">
                    {t("lawsuit_topics") || "Lawsuit Topics"}
                  </p>
                  <Button
                    variant="primary"
                    size="xs"
                    type="button"
                    onClick={() => {
                      reset();
                      setValue("subCategory", null);
                      setValue("mainCategory", null);
                      setValue("acknowledged", false);
                      setShowLegalSection(false);
                      setShowTopicData(false);
                      setEditTopic(null);
                      toggle();
                    }}
                    className="mb-7xl"
                  >
                    <Add01Icon size={20} /> {t("add_topic") || "Add Topic"}
                  </Button>
                  <div className="border-b border-gray-300 mb-7xl" />
                </div>
                <Suspense fallback={<TableSkeletonLoader />}>
                  <ReusableTable
                    data={getPaginatedTopics}
                    columns={columns}
                    page={pagination.pageIndex + 1}
                    totalPages={Math.ceil(
                      caseTopics.length / pagination.pageSize
                    )}
                    onPageChange={(newPage) => {
                      setPagination((prev) => ({
                        ...prev,
                        pageIndex: newPage - 1,
                      }));
                    }}
                    PaginationComponent={CustomPagination}
                  />
                  <AttachmentSection
                    attachments={attachments}
                    onAddClick={openAttachmentModal}
                    onRemove={handleRemoveAttachment}
                    onView={handleViewAttachment}
                  />

                  <AttachmentModal
                    isOpen={showAttachmentModal}
                    onClose={closeAttachmentModal}
                    onSave={handleAttachmentSave}
                  />
                  {/* {attachments && attachments?.map((file: any, idx: number) => (
                    <FileAttachment
                      key={idx}
                      fileName={file.FileName || "Unnamed File"}
                      onView={() => handleView(file.FileKey, file.FileName)}
                      className="w-full mt-3"
                    />
                  ))} */}
                  <FilePreviewModal file={previewFile} onClose={closePreview} />
                </Suspense>
              </>
            ) : (
              <Suspense fallback={<TableLoader />}>
                <HearingCta auditIcon={auditIcon} toggle={toggle} />
              </Suspense>
            )}
          </div>
          {isOpen && (
            <Suspense fallback={<TableLoader />}>
              <Modal
                modalWidth={800}
                close={handleCancel}
                header={
                  editTopic
                    ? t("edit_topic") || "Edit Topic"
                    : t("add_topic") || "Add Topic"
                }
                className="h-[60vh] sm:h-[600px] overflow-y-auto w-full max-w-[800px]"
              >
                {/* Add error message display */}
                {/* {mojContractError && (
                  <div
                    className="flex flex-col items-start p-4 md:p-6 gap-4 relative w-full bg-[#FFFBFA] border border-[#FECDCA] rounded-lg mb-4"
                    style={{ boxSizing: 'border-box', isolation: 'isolate' }}
                  >
                    <div className="flex items-center w-full">
                      <div className="flex-shrink-0 me-4 md:me-6">
                        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white">
                          <img src={FeaturedIcon} alt="Notification Icon" className="w-10 h-10" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-red-700 font-bold text-xl mb-1">
                          {tCommon('notification')}
                        </div>
                        <div className="text-gray-700 text-base">
                          {t(mojContractError) !== mojContractError ? t(mojContractError) : mojContractError}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setMojContractError(null);
                          if (timeoutRef.current) {
                            clearTimeout(timeoutRef.current);
                          }
                        }}
                        className="end-4 ms-4 md:ms-6 text-gray-400 hover:text-gray-600"
                        aria-label="Close"
                      >
                        <span className="text-2xl font-bold">&times;</span>
                      </button>
                    </div>
                  </div>
                )} */}
                <RHFFormProvider {...methods}>
                  <Suspense fallback={<TableLoader />}>
                    <DynamicForm
                      formLayout={formLayout}
                      register={register}
                      errors={errors}
                      setValue={setValue}
                      control={control}
                      watch={watch}
                    />
                  </Suspense>
                  <div className="flex w-full justify-between mt-6xl">
                    <Button
                      variant="secondary"
                      typeVariant="outline"
                      size="sm"
                      onClick={handleCancel}
                      className="text-sm20 font-medium"
                    >
                      {t("cancel") || "Cancel"}
                    </Button>
                    <Button
                      variant={isValid && acknowledged ? "primary" : "disabled"}
                      typeVariant={isValid && acknowledged ? "brand" : "freeze"}
                      size="sm"
                      onClick={() => {
                        // Debug: log all form values and errors on Add Topic and Send click
                        if (typeof window !== "undefined") {
                          // eslint-disable-next-line no-console
                          console.log(
                            "DEBUG Add/Send Topic: form values",
                            getValues()
                          );
                          // eslint-disable-next-line no-console
                          console.log("DEBUG Add/Send Topic: errors", errors);
                        }
                        if (isEditing) {
                          handleUpdate();
                        } else if (isStep3) {
                          handleSend();
                        } else if (isStep2 && acknowledged) {
                          handleSave();
                        }
                      }}
                      className="text-sm font-medium"
                      disabled={!isValid || !acknowledged}
                    >
                      {currentStep === steps.length - 1
                        ? t("finalSubmit") || "Final Submit"
                        : isEditing
                          ? t("update") || "Update"
                          : isStep3
                            ? t("send") || "Send"
                            : isStep2 && acknowledged
                              ? t("Next") || "Next"
                              : t("Next") || "Next"}
                    </Button>
                  </div>
                </RHFFormProvider>
              </Modal>
            </Suspense>
          )}
          {/* <FilePreviewModal file={previewFile} onClose={closePreview} /> */}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm ? (
            <Modal
              close={() => setShowDeleteConfirm(false)}
              header={t("delete_topic") || "Delete Topic"}
              modalWidth={500}
            >
              <p className="text-sm text-gray-700">
                {t("confirm_delete_topic") ||
                  "Are you sure you want to delete this topic? This action cannot be undone."}
              </p>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  {t("no") || "No"}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setCaseTopics((prev) =>
                      prev.filter((_, i) => i !== delTopic?.index)
                    );
                    setShowDeleteConfirm(false);
                    setDelTopic(null);
                  }}
                >
                  {t("yes") || "Yes"}
                </Button>
              </div>
            </Modal>
          ) : null}

          {/* Critical Error Modal with Countdown */}
          {showCriticalErrorModal && (
            <Modal
              close={() => {
                // Immediately redirect if user tries to close the modal
                setShowCriticalErrorModal(false);
                navigate("/");
              }}
              header={tManageHearing("warning") || "Warning"}
              modalWidth={500}
              preventOutsideClick={true}
            >
              <div className="text-center">
                <div className="mb-4">
                  <img 
                    src={FeaturedIcon} 
                    alt={tManageHearing("warning_icon") || "Warning Icon"} 
                    className="w-16 h-16 mx-auto mb-4"
                  />
                  <p className="text-sm text-gray-700 mb-4">
                    {criticalErrorMessage}
                  </p>
                  <p className="text-sm text-gray-500 mb-2">
                    {tManageHearing("redirecting_in_seconds", { seconds: countdown }) || `Redirecting in ${countdown} seconds...`}
                  </p>
                  <p className="text-xs text-gray-400">
                    {tManageHearing("modal_will_close_automatically") || "This modal will close automatically and redirect you to the home page."}
                  </p>
                </div>
                <div className="flex justify-center mt-4">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      // Immediately redirect if user clicks close
                      setShowCriticalErrorModal(false);
                      navigate("/");
                    }}
                  >
                    {tManageHearing("close_and_redirect") || "Close & Redirect"}
                  </Button>
                </div>
              </div>
            </Modal>
          )}
        </div>
      </StepNavigation>
    </Suspense>
  );
}

export default EditHearingTopicsDetails;
