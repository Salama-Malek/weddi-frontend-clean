import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { useForm, useWatch } from "react-hook-form";
import Button from "@/shared/components/button";
import TableLoader from "@/shared/components/loader/TableLoader";
import { CustomPagination } from "@/shared/components/pagination/CustomPagination";
import useToggle from "@/shared/hooks/generalSate";
import { useTranslation } from "react-i18next";
import auditIcon from "@/assets/audit-01.svg";
import { Add01Icon } from "hugeicons-react";
import { useDateContext } from "@/shared/components/calanders/DateContext";
import AttachmentSection from "./components/AttachmentSection";
import AttachmentModal from "./components/AttachmentModal";
import FilePreviewModal from "../add-attachments/FilePreviewModal";
import { useLookup } from "../../api/hook/useLookup";
import { useSubTopicsSubLookupQuery } from "../../api/create-case/addHearingApis";
import { FormProvider as RHFFormProvider } from "react-hook-form";
import { setFormData } from "@/redux/slices/formSlice";
import StepNavigation from "@/shared/modules/case-creation/components/StepNavigation";
import { useNavigationService } from "@/shared/hooks/useNavigationService";
import { steps } from "@/shared/modules/case-creation/components/tabs/tabsConfig";
import { useLazyGetFileDetailsQuery, useUpdateHearingTopicsMutation } from "../../api/create-case/apis";
import { useCookieState } from "../../hooks/useCookieState";
import { TableSkeletonLoader } from "@/shared/components/loader/SkeletonLoader";
import { TopicFormValues } from "./hearing.topics.types";
import { getHearingTopicsColumns } from "./config/colums";
import { useAttachments } from "./hooks/useAttachments";
import { useFormLayout as useFormLayoutWorker } from "./config/forms.layout.worker";
import { useFormLayout as useFormLayoutEstablishment } from "./config/forms.layout.establishment";
import { getPayloadBySubTopicID } from "./api/establishment.add.case.payload";
import {
  useLazyGetCaseDetailsQuery,
} from "@/features/manage-hearings/api/myCasesApis";
import { TokenClaims } from "@/features/login/components/AuthProvider";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ApiResponse } from "@/shared/modules/case-creation/components/StepNavigation";
import useCaseTopicsPrefill from "./hooks/useCaseTopicsPrefill";
import { useGetRegionLookupDataQuery } from "@/features/initiate-hearing/api/create-case/workDetailApis";
import { Option } from "@/shared/components/form/form.types";
import FileAttachment from "@/shared/components/ui/file-attachment/FileAttachment";
import { DateObject } from "react-multi-date-picker";
import gregorianCalendar from "react-date-object/calendars/gregorian";
import gregorianLocale from "react-date-object/locales/gregorian_en";
import arabicCalendar from "react-date-object/calendars/arabic";
import arabicLocale from "react-date-object/locales/arabic_ar";
import { useApiErrorHandler } from "@/shared/hooks/useApiErrorHandler";

const Modal = lazy(() => import("@/shared/components/modal/Modal"));
const ReusableTable = lazy(() =>
  import("@/shared/components/table/ReusableTable").then((m) => ({
    default: m.ReusableTable,
  }))
);
const DynamicForm = lazy(() =>
  import("@/shared/components/form/DynamicForm").then((m) => ({
    default: m.DynamicForm,
  }))
);
const HearingCta = lazy(() => import("./components/HearingCta"));


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

function EditHearingTopicsDetails({ showFooter }: { showFooter: boolean }) {
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
  } = methods;

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const [getCookie] = useCookieState({ caseId: "" });
  const [caseId] = useState(getCookie("caseId"));
  const navigate = useNavigate();
  const [lastSaved, setLastSaved] = useState(false);
  const { updateParams, currentStep, currentTab } = useNavigationService();
  const [updateHearingTopics, { isLoading: addHearingLoading }] =
    useUpdateHearingTopicsMutation();
  const UserClaims: TokenClaims = getCookie("userClaims");
  const userType = getCookie("userType");
  const defendantStatus = getCookie("defendantStatus");
  const mainCategory2 = getCookie("mainCategory")?.value;
  const subCategory2 = getCookie("subCategory")?.value;
  const userID = getCookie("userClaims").UserID;
  const fileNumber = getCookie("userClaims")?.File_Number;

  const { i18n } = useTranslation();
  const currentLanguage = i18n.language.toUpperCase();

  // Use the centralized error handler
  const { handleResponse } = useApiErrorHandler();

  // Submit handler
  const onSubmit = (data: TopicFormValues) => { };

  const mainCategory = watch("mainCategory") ?? null;
  const subCategory: any = watch("subCategory") ?? null;
  // Debug logs for watched values
  console.log('[EditHearingTopicsDetails] mainCategory:', mainCategory);
  console.log('[EditHearingTopicsDetails] subCategory:', subCategory);
  const { t } = useTranslation("hearingtopics");
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

  useEffect(() => {
    // Don't interfere with prefilling when editing
    if (isEditing) return;

    if (subCategory?.value && mainCategory?.value) {
      goToLegalStep();
    }
  }, [subCategory?.value, mainCategory?.value, isEditing]);

  // Lookups
  const lookup = useLookup();
  const {
    data: mainCategoryData,
    isFetching,
    isLoading,
  } = lookup.mainCategory(isOpen);
  const { data: subCategoryData, isFetching: isSubCategoryLoading } =
    lookup.subCategory(mainCategory?.value);

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

  const { data: regionData, isFetching: isRegionLoading } = useGetRegionLookupDataQuery({
    AcceptedLanguage: currentLanguage,
    context: "default", // This uses RegionName module
  });

  const { data: subTopicsLookupData, isFetching: subTopicsLoading } =
    useSubTopicsSubLookupQuery(
      {
        LookupType: "CaseElements",
        ModuleKey: mainCategory?.value,
        ModuleName: "SubTopics",
        SourceSystem: "E-Services",
        AcceptedLanguage: currentLanguage,
      },
      { skip: !subCategory?.value }
    );

  const [triggerCaseDetailsQuery, { data: caseDetailsData }] =
    useLazyGetCaseDetailsQuery();



  const {
    attachments,
    attachmentFiles,
    previewFile,
    showAttachmentModal,
    handleAttachmentSave,
    handleRemoveAttachment,
    handleViewAttachment,
    openAttachmentModal,
    closeAttachmentModal,
    closePreview,
    setAttachments,
  } = useAttachments();
  const [topicData, setTopicData] = useState<any>(null);
  const [legalSection, setLegalSection] = useState<any>(null);
  const [fileKey, setFileKey] = useState("");
  const [fileName, setFileName] = useState("");
  const [previewFileModule, setPreviewFile] = useState(false);
  const [attachmentsModule, setAttachmentsModule] = useState<AttachmentFile[]>();
  const [triggerFileDetails, { data: fileBase64 }] =
    useLazyGetFileDetailsQuery();

  const onClickedView = (index: number) => {
    if (attachmentsModule?.[index]) {
      console.log(attachmentsModule?.[index]);
      handleView(attachmentsModule?.[index]?.FileKey, attachmentsModule?.[index]?.FileName)
    }
  }

  const handleView = async (key: string, name: string) => {
    setFileKey(key);
    setFileName(name);
    setPreviewFile(true);
    await triggerFileDetails({ AttachmentKey: key, AcceptedLanguage: i18n.language.toUpperCase() });
  };



  useEffect(() => {
    if (!caseId || caseDetailsData?.CaseDetails) return;

    const fetchCaseDetails = async () => {
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

      await triggerCaseDetailsQuery({
        ...userConfigs[userType],
        CaseID: caseId,
        AcceptedLanguage: currentLanguage,
        SourceSystem: "E-Services",
      });
    };

    fetchCaseDetails();
  }, [caseId, currentLanguage, triggerCaseDetailsQuery, userType, fileNumber, mainCategory2, subCategory2, userID, caseDetailsData]);

  useEffect(() => {
    if (caseDetailsData?.CaseDetails) {
      // تحقق مما إذا كانت البيانات موجودة بالفعل
      if (caseTopics.length === 0) {
        // Set case topics
        const formattedTopics = caseDetailsData.CaseDetails.CaseTopics.map(
          (topic: any) => ({
            ...topic,
            subCategory: {
              value: topic.SubTopicID,
              label: topic.SubTopicName,
            },
            mainCategory: {
              value: topic.MainTopicID,
              label: topic.CaseTopicName,
            },
            // تنسيق التواريخ
            date_hijri: topic.Date_New,
            from_date_hijri: topic.FromDateHijri,
            to_date_hijri: topic.ToDateHijri,
            // تنسيق القيم الرقمية
            amount: topic.Amount,
            wagesAmount: topic.WagesAmount,
            bonusAmount: topic.BonusAmount,
            payDue: topic.PayDue,
            // تنسيق القيم النصية
            durationOfLeaveDue: topic.DurationOfLeaveDue,
            theReason: topic.TheReason,
            currentPosition: topic.CurrentPosition,
            // تحويل قيم Yes/No إلى true/false
            doesBylawsIncludeAddingAccommodations:
              topic.IsBylawsIncludeAddingAccommodiation === "Yes",
            doesContractIncludeAddingAccommodations:
              topic.IsContractIncludeAddingAccommodiation === "Yes",
            housingSpecificationInByLaws:
              topic.HousingSpecificationsInBylaws || "",
            housingSpecificationsInContract:
              topic.HousingSpecificationsInContract || "",
            actualHousingSpecifications: topic.HousingSpecifications || "",
            // تنسيق القيم المنسدلة
            forAllowance: topic.ForAllowance
              ? {
                value: topic.ForAllowance,
                label: topic.ForAllowance,
              }
              : null,
            commissionType: topic.CommissionType
              ? {
                value: topic.CommissionType,
                label: topic.CommissionType,
              }
              : null,
            accordingToAgreement: topic.AccordingToAgreement
              ? {
                value: topic.AccordingToAgreement,
                label: topic.AccordingToAgreement,
              }
              : null,
            travelingWay: topic.TravelingWay
              ? {
                value: topic.TravelingWay,
                label: topic.TravelingWay,
              }
              : null,
            typeOfRequest: (topic.RequestType || topic.RequestType_Code)
              ? {
                value: topic.RequestType_Code || topic.RequestType,
                label: topic.RequestType || topic.RequestType_Code,
              }
              : null,
            kindOfHoliday: topic.KindOfHoliday
              ? {
                value: topic.KindOfHoliday,
                label: topic.KindOfHoliday,
              }
              : null,
            fromLocation: (topic.FromLocation || topic.FromLocation_Code)
              ? {
                value: topic.FromLocation_Code || topic.FromLocation,
                label: topic.FromLocation || topic.FromLocation_Code,
              }
              : null,
            toLocation: (topic.ToLocation || topic.ToLocation_Code)
              ? {
                value: topic.ToLocation_Code || topic.ToLocation,
                label: topic.ToLocation || topic.ToLocation_Code,
              }
              : null,
            typesOfPenalties: (topic.PenalityType || topic.PenalityType_Code || topic.TypesOfPenalties)
              ? {
                value: topic.PenalityType_Code || topic.PenalityType || topic.TypesOfPenalties,
                label: topic.PenalityTypeLabel || topic.TypesOfPenaltiesLabel || topic.PenalityType || topic.TypesOfPenalties,
              }
              : null,
          })
        );

        setCaseTopics(formattedTopics);

        if (caseDetailsData?.CaseDetails?.OtherAttachments?.length > 0
          || caseDetailsData?.CaseDetails?.CaseTopicAttachments?.length > 0
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
    }
  }, [caseDetailsData, caseTopics.length]);

  const matchedSubCategory = subTopicsLookupData?.DataElements?.find(
    (item: any) => item.ElementKey === subCategory?.value
  );

  const acknowledged = watch("acknowledged");
  const fromPlace = watch("fromPlace") ?? null;
  const toPlace = watch("toPlace") ?? null;
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

  const handleTopicSelect = (topic: any, index: number) => {
    console.log('Selected topic for editing:', topic);

    // Reset form first to clear any previous data
    reset();

    // Set the edit topic with the original topic data (not extracted form fields)
    // The prefilling hook will handle the extraction and setting of form values
    setEditTopic(topic);
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
        onDel: (topic) => {
          setDelTopic(topic);
          setShowDeleteConfirm(true);
        },
      }),
    [t, toggle]
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
    const result = saveTopic();
    reset();
    setDate({ hijri: null, gregorian: null, dateObject: null });
    setShowLegalSection(false);
    setShowTopicData(false);
    setEditTopic(null);
    setEditTopicIndex(null);
    close();
  };

  const handleAddTopic = async () => {
    const result = saveTopic();
    if (result === 1) {
      reset();
      setDate({ hijri: null, gregorian: null, dateObject: null });
      setShowLegalSection(false);
      setShowTopicData(false);
      setEditTopic(null);
      setEditTopicIndex(null);
    }
  };

  const handleUpdate = () => {
    if (!editTopic) return;

    const updatedValues = getValues();
    const mainCategoryValue = updatedValues.mainCategory?.value || editTopic.MainTopicID || editTopic.mainCategory?.value;
    const mainCategoryLabel = updatedValues.mainCategory?.label || editTopic.MainSectionHeader || editTopic.mainCategory?.label;
    const subCategoryValue = updatedValues.subCategory?.value || editTopic.SubTopicID || editTopic.subCategory?.value;
    const subCategoryLabel = updatedValues.subCategory?.label || editTopic.SubTopicName || editTopic.subCategory?.label;

    // Format dates for storage (remove slashes)
    const formatDateForStorage = (date: string) => {
      if (!date) return '';
      return date.replace(/\//g, '');
    };

    const updatedTopic = {
      ...updatedValues,
      MainTopicID: mainCategoryValue,
      SubTopicID: subCategoryValue,
      MainSectionHeader: mainCategoryLabel,
      SubTopicName: subCategoryLabel,
      CaseTopicName: mainCategoryLabel,
      subCategory: {
        value: subCategoryValue,
        label: subCategoryLabel,
      },
      mainCategory: {
        value: mainCategoryValue,
        label: mainCategoryLabel,
      },
      acknowledged: updatedValues.acknowledged || editTopic.acknowledged,
      amount: updatedValues.amount || editTopic.amount,
      payDue: updatedValues.payDue || editTopic.payDue,
      durationOfLeaveDue:
        updatedValues.durationOfLeaveDue || editTopic.durationOfLeaveDue,
      wagesAmount: updatedValues.wagesAmount || editTopic.wagesAmount,
      compensationAmount:
        updatedValues.compensationAmount || editTopic.compensationAmount,
      injuryType: updatedValues.injuryType || editTopic.injuryType,
      bonusAmount: updatedValues.bonusAmount || editTopic.bonusAmount,
      otherCommission:
        updatedValues.otherCommission || editTopic.otherCommission,
      amountOfCompensation:
        updatedValues.amountOfCompensation || editTopic.amountOfCompensation,
      damagedValue: updatedValues.damagedValue || editTopic.damagedValue,
      requiredJobTitle:
        updatedValues.requiredJobTitle || editTopic.requiredJobTitle,
      currentJobTitle:
        updatedValues.currentJobTitle || editTopic.currentJobTitle,
      damagedType: updatedValues.damagedType || editTopic.damagedType,
      currentInsuranceLevel:
        updatedValues.currentInsuranceLevel || editTopic.currentInsuranceLevel,
      theReason: updatedValues.theReason || editTopic.theReason,
      theWantedJob: updatedValues.theWantedJob || editTopic.theWantedJob,
      currentPosition:
        updatedValues.currentPosition || editTopic.currentPosition,
      typeOfRequest: updatedValues.typeOfRequest || editTopic?.typeOfRequest,
      kindOfHoliday: updatedValues.kindOfHoliday || editTopic?.kindOfHoliday,
      commissionType: updatedValues.commissionType || editTopic?.commissionType,
      accordingToAgreement: updatedValues.accordingToAgreement || editTopic?.accordingToAgreement,
      forAllowance: updatedValues.forAllowance || editTopic?.forAllowance,
      travelingWay: updatedValues.travelingWay || editTopic?.travelingWay,
      typesOfPenalties: updatedValues.typesOfPenalties || editTopic?.typesOfPenalties,
      fromLocation: updatedValues.fromLocation || editTopic?.fromLocation,
      toLocation: updatedValues.toLocation || editTopic?.toLocation,
      loanAmount: updatedValues.loanAmount || editTopic?.loanAmount,
      amountRatio: updatedValues.amountRatio || editTopic?.amountRatio,
      requiredDegreeOfInsurance:
        updatedValues.requiredDegreeOfInsurance ||
        editTopic?.requiredDegreeOfInsurance,
      typeOfCustody: updatedValues.typeOfCustody || editTopic?.typeOfCustody,
      amountsPaidFor: updatedValues.amountsPaidFor || editTopic?.amountsPaidFor,
      request_date_hijri:
        updatedValues.request_date_hijri || editTopic?.request_date_hijri,
      date_hijri: updatedValues.date_hijri || editTopic?.date_hijri,
      gregorianDate: updatedValues.gregorianDate || editTopic?.gregorianDate,
      decisionNumber: updatedValues.decisionNumber,
      Region_Code: updatedValues.DefendantsEstablishmentRegion,
      City_Code: updatedValues.DefendantsEstablishmentCity,
      Occupation_Code: updatedValues.DefendantsEstablishOccupation,
      Gender_Code: updatedValues.DefendantsEstablishmentGender,
      Nationality_Code: updatedValues.DefendantsEstablishmentNationality,
      PrisonerId: updatedValues.DefendantsEstablishmentPrisonerId,
      from_date_hijri:
        updatedValues.from_date_hijri || editTopic?.from_date_hijri,
      to_date_hijri: updatedValues.to_date_hijri || editTopic?.to_date_hijri,
      rewardType: updatedValues.rewardType || editTopic.rewardType,
      consideration: updatedValues.consideration || editTopic.consideration,
      AdditionalDetails:
        updatedValues.additionalDetails || editTopic.AdditionalDetails,
      // Format dates for storage
      ManagerialDecisionDateHijri: formatDateForStorage(updatedValues.managerial_decision_date_hijri),
      ManagerialDecisionDateGregorian: formatDateForStorage(updatedValues.managerial_decision_date_gregorian),
      ManagerialDecisionNumber: updatedValues.managerialDecisionNumber || editTopic.ManagerialDecisionNumber || "",
      // Additional date fields
      InjuryDateHijri: formatDateForStorage(updatedValues.injury_date_hijri),
      InjuryDateGregorian: formatDateForStorage(updatedValues.injury_date_gregorian),
      RequestDateHijri: formatDateForStorage(updatedValues.request_date_hijri),
      RequestDateGregorian: formatDateForStorage(updatedValues.request_date_gregorian),
      DateHijri: formatDateForStorage(updatedValues.date_hijri),
      DateGregorian: formatDateForStorage(updatedValues.date_gregorian),
      FromDateHijri: formatDateForStorage(updatedValues.from_date_hijri),
      FromDateGregorian: formatDateForStorage(updatedValues.from_date_gregorian),
      ToDateHijri: formatDateForStorage(updatedValues.to_date_hijri),
      ToDateGregorian: formatDateForStorage(updatedValues.to_date_gregorian),
    };

    console.log("Updated Topic:", updatedTopic);

    setCaseTopics((prev) =>
      prev.map((topic, idx) => (idx === editTopicIndex ? updatedTopic : topic))
    );

    // إضافة رسالة نجاح
    toast.success(
      t("topic_updated_successfully") || "Topic updated successfully"
    );

    // Reset and close
    reset();
    setDate({ hijri: null, gregorian: null, dateObject: null });
    setShowLegalSection(false);
    setShowTopicData(false);
    setEditTopic(null);
    setEditTopicIndex(null);
    close();
  };


  const handleCancel = () => {
    reset();
    setShowLegalSection(false);
    setShowTopicData(false);
    setEditTopic(null);
    close();
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
    const payload = getPayloadBySubTopicID(caseTopics, subCategory, "Save", caseId);
    try {
      const response = await updateHearingTopics(payload).unwrap();
      if (response?.SuccessCode === "200" && (!response?.ErrorCodeList || response?.ErrorCodeList?.length === 0)) {
        toast.success(t("save_success"));
        setLastSaved(true);
      }
      return response;
    } catch (error: any) {
      const errorMessage = error?.message || t("save_error");
      toast.error(errorMessage);
      return Promise.reject(error);
    }
  };

  const handleNext = async () => {
    const latestFormValues = getValues();
    setFormData(latestFormValues);
    const payload = getPayloadBySubTopicID(caseTopics, subCategory, "Next", caseId);

    try {
      const response = await updateHearingTopics(payload).unwrap();
      
      // Use centralized error handling
      const isSuccessful = handleResponse(response);
      
      if (isSuccessful) {
        // Only navigate if the API call is successful
        updateParams(currentStep + 1, 0);
      }
      // Errors are automatically handled by the centralized error handler
    } catch (error: any) {
      const errorMessage = error?.message || t("api_error_generic");
      toast.error(errorMessage);
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

    console.log("Saving new topic:", newTopic);

    // التحقق من القيم الفارغة
    for (const [key, value] of Object.entries(newTopic)) {
      if (
        value === "" &&
        key !== "housingSpecificationsInContract" &&
        key !== "actualHousingSpecifications" &&
        key !== "housingSpecificationInByLaws" &&
        key !== "regulatoryText"
      ) {
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
    //       topic.SubTopicID !== editTopic.subCategory.value ||
    //       topic.MainTopicID !== editTopic.mainCategory.value)
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
      if (!date) return '';
      return date.replace(/\//g, '');
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
      FromLocation: newTopic?.fromPlace,
      ToLocation: newTopic?.toPlace,
      AcknowledgedTerms: newTopic.acknowledged,
      Amount: newTopic.amount,
      PayDue: newTopic.payDue,
      DurationOfLeaveDue: newTopic.durationOfLeaveDue,
      WagesAmount: newTopic.wagesAmount,
      CompensationAmount: newTopic.compensationAmount,
      InjuryType: newTopic.injuryType,
      BonusAmount: newTopic.bonusAmount,
      AccordingToAgreement: newTopic?.accordingToAgreement?.value,
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
      ForAllowance: newTopic?.forAllowance?.value,
      RewardType: newTopic.rewardType,
      Consideration: newTopic.consideration,
      TravelingWay: newTopic.travelingWay,
      PenalityType: newTopic.typesOfPenalties?.value || "",
      LoanAmount: newTopic.loanAmount,
      ManagerialDecisionNumber: newTopic.managerialDecisionNumber,
      // Format dates for storage
      ManagerialDecisionDateHijri: formatDateForStorage(newTopic.managerial_decision_date_hijri),
      ManagerialDecisionDateGregorian: formatDateForStorage(newTopic.managerial_decision_date_gregorian),
      TypesOfPenalties: newTopic.typesOfPenalties?.value || "",
      TypesOfPenaltiesLabel: newTopic.typesOfPenalties?.label || "",
      kindOfHoliday:
        newTopic.kindOfHoliday?.value || editTopic?.kindOfHoliday?.label,
      // Additional date fields
      InjuryDateHijri: formatDateForStorage(newTopic.injury_date_hijri),
      InjuryDateGregorian: formatDateForStorage(newTopic.injury_date_gregorian),
      RequestDateHijri: formatDateForStorage(newTopic.request_date_hijri),
      RequestDateGregorian: formatDateForStorage(newTopic.request_date_gregorian),
      DateHijri: formatDateForStorage(newTopic.date_hijri),
      DateGregorian: formatDateForStorage(newTopic.date_gregorian),
      FromDateHijri: formatDateForStorage(newTopic.from_date_hijri),
      FromDateGregorian: formatDateForStorage(newTopic.from_date_gregorian),
      ToDateHijri: formatDateForStorage(newTopic.to_date_hijri),
      ToDateGregorian: formatDateForStorage(newTopic.to_date_gregorian),
    };

    console.log("Topic to save:", topicToSave);

    // تحديث حالة caseTopics
    setCaseTopics((prev) => {
      const newTopics = [...prev, topicToSave];
      console.log("Updated caseTopics:", newTopics);
      return newTopics;
    });

    // إضافة رسالة نجاح
    toast.success(t("topic_added_successfully") || "Topic added successfully");

    return 1;
  };


  const isStep3 = showTopicData;
  const isStep2 = showLegalSection;

  // Use the new prefilling hook
  useCaseTopicsPrefill({
    setValue,
    trigger,
    caseTopics,
    isEditing,
    editTopic,
  });

  // Utility to convert Hijri (YYYYMMDD) to Gregorian (YYYYMMDD)
  function hijriToGregorian(hijri: string) {
    if (!hijri) return "";
    const dateObj = new DateObject({
      date: hijri,
      calendar: arabicCalendar,
      locale: arabicLocale,
      format: "YYYYMMDD",
    });
    return dateObj.convert(gregorianCalendar, gregorianLocale).format("YYYYMMDD");
  }

  // Handle date context and section visibility when editing
  useEffect(() => {
    if (isEditing && editTopic && isOpen) {
      // Set date context if available
      if (editTopic.date_hijri) {
        setDate({
          hijri: editTopic.date_hijri,
          gregorian: editTopic.gregorianDate,
          dateObject: null,
        });
      }
      // Always set both Hijri and Gregorian fields for from/to dates
      setValue("from_date_hijri", editTopic.from_date_hijri);
      setValue(
        "from_date_gregorian",
        editTopic.from_date_gregorian || hijriToGregorian(editTopic.from_date_hijri)
      );
      setValue("to_date_hijri", editTopic.to_date_hijri);
      setValue(
        "to_date_gregorian",
        editTopic.to_date_gregorian || hijriToGregorian(editTopic.to_date_hijri)
      );
      // Show appropriate sections
      setShowLegalSection(true);
      setShowTopicData(true);
    }
  }, [isEditing, editTopic, isOpen, setDate, setShowLegalSection, setShowTopicData, setValue]);

  const handleClearMainCategory = useCallback(() => {
    setValue("mainCategory", null);
    setValue("subCategory", null);
    setValue("acknowledged", false);
    setShowTopicData(false);
    setShowLegalSection(false);
    setValue("regulatoryText", "");
  }, [setValue, setShowTopicData, setShowLegalSection]);

  const handleClearSubCategory = useCallback(() => {
    setValue("subCategory", null);
    setValue("acknowledged", false);
    setShowTopicData(false);
    setValue("regulatoryText", "");
  }, [setValue, setShowTopicData]);

  const bylawsValue = useWatch({ control, name: "doesBylawsIncludeAddingAccommodations" });
  const contractValue = useWatch({ control, name: "doesContractIncludeAddingAccommodations" });

  useEffect(() => {
    if (bylawsValue && contractValue) {
      setValue("doesContractIncludeAddingAccommodations", false);
      setValue("housingSpecificationsInContract", "");
    } else if (contractValue && bylawsValue) {
      setValue("doesBylawsIncludeAddingAccommodations", false);
      setValue("housingSpecificationInByLaws", "");
    }
  }, [bylawsValue, contractValue, setValue]);

  // Add new state for error message
  const [mojContractError, setMojContractError] = useState<string | null>(null);

  // Add effect to handle MOJ contract validation
  useEffect(() => {
    if (userType === "Worker" || userType === "Embassy User" && defendantStatus === "Establishment") {
      if (subCategory?.value && mainCategory?.value === 'WR') {
        // Check if selected subtopic is WR-1 or WR-2
        if (subCategory.value === 'WR-1' || subCategory.value === 'WR-2') {
          // Get the MOJ contract validation from the API response
          const mojContractExists = subCategoryData?.MOJContractExist === "false"; 
        const errorMessage = subCategoryData?.MOJContractExistErrorMessage;
          // const mojContractExists = true; // For local testing. Correct logic is: subCategoryData?.MOJContractExist === "true"
          // const errorMessage = "This is a test error message for MOJ Contract validation."; // For local testing. Correct logic is: subCategoryData?.MOJContractExistErrorMessage

          if (mojContractExists && errorMessage) {
            setMojContractError(errorMessage);
            // Clear the selected subtopic
            setValue("subCategory", null);
            setShowLegalSection(false);
            setShowTopicData(false);

            // Clear previous timeout if it exists
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }

            // Set new timeout
            timeoutRef.current = setTimeout(() => {
              setMojContractError(null);
            }, 3000);
          }
        }
      }
    }
  }, [userType, defendantStatus, subCategory?.value, mainCategory?.value, subCategoryData, setValue]);

  // ────────────────────────────────────────────────────────────────────────────────
  // Move both layout hooks to the top level, then pick between them:
  const formLayout = userType === "Worker" || userType === "Embassy User"
    ? useFormLayoutWorker({
      t,
      MainTopicID: mainCategory,
      SubTopicID: subCategory,
      FromLocation: fromPlace,
      ToLocation: toPlace,
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
      subTopicsLoading,
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
    })
    : useFormLayoutEstablishment({
      t,
      MainTopicID: mainCategory,
      SubTopicID: subCategory,
      FromLocation: fromPlace,
      ToLocation: toPlace,
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
      subTopicsLoading,
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

  const updateForm = useCallback((updates: Partial<FormData>) => {
    reset(updates);
  }, [reset]);

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

  const fetchLegalSection = useCallback(async () => {
    // Implementation will be added when the API is available
  }, []);

  // Memoize the topic data update effect
  useEffect(() => {
    if (showTopicData && topicData) {
      setValue("topicData", topicData);
    }
  }, [showTopicData, topicData, setValue]);

  // Memoize the legal section update effect
  useEffect(() => {
    if (showLegalSection && legalSection) {
      setValue("legalSection", legalSection);
    }
  }, [showLegalSection, legalSection, setValue]);

  // Memoize the topic data fetch effect
  useEffect(() => {
    fetchTopicData();
  }, [fetchTopicData]);

  // Memoize the legal section fetch effect
  useEffect(() => {
    fetchLegalSection();
  }, [fetchLegalSection]);

  // Memoize the acknowledged effect
  useEffect(() => {
    if (acknowledged) {
      setShowTopicData(true);
    }
  }, [acknowledged]);

  // Add this utility function at the top or in a utils file
  function findOption(options: Option[], value: string): Option | null {
    if (!options) return null;
    return (
      options.find((opt: Option) =>
        typeof opt === "object"
          ? opt.value === value
          : opt === value
      ) || null
    );
  }

  // In the useEffect or prefill logic where you set form values for editTopic:
  useEffect(() => {
    if (isEditing && editTopic && typeOfRequestLookupData?.DataElements) {
      const code = editTopic.RequestType_Code || editTopic.RequestType || editTopic.TypeOfRequest;
      const matchedOption = findOption(
        typeOfRequestLookupData.DataElements.map((item: any) => ({ value: item.ElementKey, label: item.ElementValue })),
        code
      );
      if (matchedOption) setValue("typeOfRequest", matchedOption);
    }
  }, [isEditing, editTopic, typeOfRequestLookupData, setValue]);

  return (
    <Suspense fallback={<TableLoader />}>
      <StepNavigation
        onSubmit={handleSubmit(onSubmit)}
        isValid={isValid}
        isFirstStep={currentStep === 0 && currentTab === 0}
        isLastStep={currentStep === steps.length - 1}
        currentStep={currentStep}
        goToNextStep={handleNext}
        goToPrevStep={handlePrevious}
        resetSteps={() => updateParams(0, 0)}
        handleSave={handleSaveApi}
        canProceed={caseTopics.length > 0}
        isButtonDisabled={(direction) =>
          direction === "prev" ? currentStep === 0 && currentTab === 0 : false
        }
        isLoading={addHearingLoading}
        lastAction={lastAction}
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
                    page={pagination.pageIndex + 1} // Convert to 1-based index
                    totalPages={Math.ceil(
                      caseTopics.length / pagination.pageSize
                    )}
                    onPageChange={(newPage) => {
                      setPagination((prev) => ({
                        ...prev,
                        pageIndex: newPage - 1, // Convert back to 0-based index
                      }));
                    }}
                    PaginationComponent={CustomPagination}
                  />
                  <AttachmentSection
                    attachments={attachments}
                    onAddClick={openAttachmentModal}
                    onRemove={handleRemoveAttachment}
                    onView={onClickedView}
                  // onClickedView={onClickedView}  
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
                  {previewFileModule && fileBase64?.Base64Stream && (
                    <Modal
                      header={fileName}
                      close={() => {
                        setPreviewFile(false);
                        setFileKey("");
                        setFileName("");
                      }}
                      modalWidth={800}
                      className="!max-h-max !m-0"
                    >
                      <div className="w-full h-[80vh] overflow-auto">
                        {fileBase64?.pyFileName?.toLowerCase().endsWith(".pdf") ? (
                          <iframe
                            src={`data:application/pdf;base64,${fileBase64?.Base64Stream}`}
                            className="w-full h-full border-none"
                          />
                        ) : (
                          <img
                            src={`data:image/*;base64,${fileBase64?.Base64Stream}`}
                            alt={fileName}
                            className="w-full h-full object-contain"
                          />
                        )}
                      </div>
                    </Modal>
                  )}
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
                {mojContractError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 relative">
                    <span>{mojContractError}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setMojContractError(null);
                        if (timeoutRef.current) {
                          clearTimeout(timeoutRef.current);
                        }
                      }}
                      className="absolute top-0 bottom-0 right-0 px-4 py-3"
                    >
                      <span className="text-2xl font-bold">&times;</span>
                    </button>
                  </div>
                )}
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
                      variant={isValid ? "primary" : "disabled"}
                      typeVariant={isValid ? "brand" : "freeze"}
                      size="sm"
                      onClick={() => {
                        if (isEditing) {
                          handleUpdate();
                        } else if (isStep3) {
                          handleSend();
                        } else if (isStep2 && acknowledged) {
                          handleSave();
                        }
                      }}
                      className="text-sm font-medium"
                      disabled={!isValid}
                    >
                      {isEditing
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
          {showDeleteConfirm && (
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
                    setCaseTopics((prev) => prev.filter((t) => t !== delTopic));
                    setShowDeleteConfirm(false);
                    setDelTopic(null);
                  }}
                >
                  {t("yes") || "Yes"}
                </Button>
              </div>
            </Modal>
          )}
        </div>
      </StepNavigation>
    </Suspense>
  );
}


export default EditHearingTopicsDetails; 