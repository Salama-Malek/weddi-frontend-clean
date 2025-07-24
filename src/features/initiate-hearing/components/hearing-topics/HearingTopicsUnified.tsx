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
import {
  useLazyGetFileDetailsQuery,
  useSaveHearingTopicsMutation,
  useUpdateHearingTopicsMutation,
} from "../../api/create-case/apis";
import { useCookieState } from "../../hooks/useCookieState";
import { TableSkeletonLoader } from "@/shared/components/loader/SkeletonLoader";
import { TopicFormValues, Topic } from "./hearing.topics.types";
import { getHearingTopicsColumns } from "./config/colums";
import { useAttachments } from "./hooks/useAttachments";
import { useFormLayout as useFormLayoutWorker } from "./config/forms.layout.worker";
import { useFormLayout as useFormLayoutEstablishment } from "./config/forms.layout.establishment";
import { getPayloadBySubTopicID } from "./api/establishment.add.case.payload";
import { useLazyGetCaseDetailsQuery } from "@/features/manage-hearings/api/myCasesApis";
import { TokenClaims } from "@/features/login/components/AuthProvider";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ApiResponse } from "@/shared/modules/case-creation/components/StepNavigation";
import useCaseTopicsPrefill from "./hooks/useCaseTopicsPrefill";
import { useGetRegionLookupDataQuery } from "@/features/initiate-hearing/api/create-case/workDetailApis";
import { Option } from "@/shared/components/form/form.types";
import { useApiErrorHandler } from "@/shared/hooks/useApiErrorHandler";
import FeaturedIcon from '@/assets/Featured icon.svg';
import { ColumnDef } from "@tanstack/react-table";

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

interface HearingTopicsUnifiedProps {
  showFooter: boolean;
  mode: "create" | "edit";
}

function HearingTopicsUnified({ showFooter, mode }: HearingTopicsUnifiedProps) {
  // --- FORM SETUP ---
  const methods = useForm<any>({
    defaultValues: mode === "create" ? {
      mainCategory: null,
      subCategory: null,
      acknowledged: false,
      regulatoryText: "",
      managerial_decision_date_hijri: "",
      managerial_decision_date_gregorian: "",
      managerialDecisionNumber: "",
      typesOfPenalties: null,
      amount: "",
      payDue: "",
      durationOfLeaveDue: "",
      wagesAmount: "",
      compensationAmount: "",
      injuryType: "",
      bonusAmount: "",
      otherCommission: "",
      amountOfCompensation: "",
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
      requiredDegreeOfInsurance: "",
      typeOfCustody: "",
      amountsPaidFor: "",
      consideration: "",
      rewardType: "",
      fromPlace: "",
      toPlace: "",
      additionalDetails: "",
    } : undefined,
  });
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

  // --- STATE & HOOKS ---
  const [getCookie] = useCookieState({ caseId: "" });
  const [caseId] = useState(getCookie("caseId"));
  const [lastSaved, setLastSaved] = useState(false);
  const { updateParams, currentStep, currentTab } = useNavigationService();
  const [saveHearingTopics] = useSaveHearingTopicsMutation();
  const [updateHearingTopics] = useUpdateHearingTopicsMutation();
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
  const mainCategory = watch("mainCategory") ?? null;
  const subCategory: any = watch("subCategory") ?? null;
  const { t } = useTranslation("hearingtopics");
  const { isOpen, close, toggle } = useToggle();
  const [caseTopics, setCaseTopics] = useState<any[]>([]);
  const [delTopic, setDelTopic] = useState<any | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editTopic, setEditTopic] = useState<any | null>(null);
  const [editTopicIndex, setEditTopicIndex] = useState<number | null>(null);
  const [showLegalSection, setShowLegalSection] = useState(false);
  const [showTopicData, setShowTopicData] = useState(false);
  const isEditing = Boolean(editTopic);
  const acknowledged = watch("acknowledged");
  const fromPlace = watch("fromPlace") ?? null;
  const toPlace = watch("toPlace") ?? null;
  const decisionNumber = watch("decisionNumber");
  const regulatoryText = t("regulatory_text_content");
  const { setDate } = useDateContext();
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const getPaginatedTopics = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    return caseTopics.slice(start, end);
  }, [caseTopics, pagination.pageIndex, pagination.pageSize]);

  // --- LOOKUPS & DATA ---
  const lookup = useLookup();
  const { data: mainCategoryData, isFetching, isLoading } = lookup.mainCategory(isOpen);
  const { data: amountPaidData } = lookup.amountPaidCategory(subCategory?.value);
  const { data: travelingWayData } = lookup.travelingWayCategory(subCategory?.value);
  const { data: leaveTypeData } = lookup.leaveTypeCategory(subCategory?.value);
  const { data: forAllowanceData } = lookup.forAllowance(subCategory?.value);
  const { data: typeOfRequestLookupData } = lookup.typeOfRequest(subCategory?.value);
  const { data: commissionTypeLookupData } = lookup.commissionType(subCategory?.value);
  const { data: accordingToAgreementLookupData } = lookup.accordingToAgreement(subCategory?.value);
  const { data: typesOfPenaltiesData } = lookup.typesOfPenalties(subCategory?.value);
  const { data: regionData } = useGetRegionLookupDataQuery({ AcceptedLanguage: currentLanguage, context: "worker" });
  const [triggerCaseDetailsQuery, { data: caseDetailsData }] = useLazyGetCaseDetailsQuery();

  // --- SubTopics Lookup (for subCategoryData, matchedSubCategory, subTopicsLoading) ---
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

  const { data: subCategoryData, isFetching: isSubCategoryLoading } = useSubTopicsSubLookupQuery(
    subTopicsLookupParams,
    {
      skip: !mainCategory?.value || !caseDetailsData?.CaseDetails,
    }
  );

  const matchedSubCategory = subCategoryData?.DataElements?.find(
    (item: any) => item.ElementKey === subCategory?.value
  );
  const subTopicsLoading = isSubCategoryLoading;

  // --- ATTACHMENTS ---
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

  // --- EFFECTS: Prefill, Initialization, and Cleanup ---
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Prefill topics and attachments in edit mode
  useEffect(() => {
    if (mode === "edit" && caseDetailsData?.CaseDetails && caseTopics.length === 0) {
      const formattedTopics = caseDetailsData.CaseDetails.CaseTopics.map((topic: any) => ({
        ...topic,
        // Main/sub category for form
        mainCategory: { value: topic.MainTopicID, label: topic.CaseTopicName },
        subCategory: { value: topic.SubTopicID, label: topic.SubTopicName },

        // Dates
        date_hijri: topic.Date_New || "",
        from_date_hijri: topic.FromDateHijri || "",
        to_date_hijri: topic.ToDateHijri || "",
        managerial_decision_date_hijri: topic.ManDecsDate || "",
        date_gregorian: topic.DateGregorian || "",
        from_date_gregorian: topic.FromDateGregorian || "",
        to_date_gregorian: topic.ToDateGregorian || "",
        injury_date_hijri: topic.InjuryDateHijri || "",
        injury_date_gregorian: topic.InjuryDateGregorian || "",
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
        loanAmount: topic.LoanAmount || "",
        managerialDecisionNumber: topic.ManagerialDecisionNumber || "",

        // Dropdowns
        forAllowance: topic.ForAllowance
          ? { value: topic.ForAllowance, label: topic.ForAllowance }
          : null,
        commissionType: topic.CommissionType
          ? { value: topic.CommissionType, label: topic.CommissionType }
          : null,
        accordingToAgreement: topic.AccordingToAgreement
          ? { value: topic.AccordingToAgreement, label: topic.AccordingToAgreement }
          : null,
        travelingWay: topic.TravelingWay
          ? { value: topic.TravelingWay, label: topic.TravelingWay }
          : null,
        typeOfRequest: topic.RequestType || topic.RequestType_Code
          ? {
            value: topic.RequestType_Code || topic.RequestType,
            label: topic.RequestType || topic.RequestType_Code,
          }
          : null,
        kindOfHoliday: topic.KindOfHoliday
          ? { value: topic.KindOfHoliday, label: topic.KindOfHoliday }
          : null,
        fromLocation: topic.FromLocation || topic.FromLocation_Code
          ? {
            value: topic.FromLocation_Code || topic.FromLocation,
            label: topic.FromLocation || topic.FromLocation_Code,
          }
          : null,
        toLocation: topic.ToLocation || topic.ToLocation_Code
          ? {
            value: topic.ToLocation_Code || topic.ToLocation,
            label: topic.ToLocation || topic.ToLocation_Code,
          }
          : null,
        typesOfPenalties: topic.PenalityType || topic.PenalityType_Code || topic.TypesOfPenalties
          ? {
            value: topic.PenalityType_Code || topic.PenalityType || topic.TypesOfPenalties,
            label: topic.PenalityTypeLabel || topic.TypesOfPenaltiesLabel || topic.PenalityType || topic.TypesOfPenalties,
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
      }));
      setCaseTopics(formattedTopics);
      if (caseDetailsData.CaseDetails.OtherAttachments?.length > 0) {
        setAttachments(caseDetailsData.CaseDetails.OtherAttachments.map((attachment: any) => ({
          fileKey: attachment.FileKey,
          fileType: attachment.FileType,
          fileName: attachment.FileName,
        })));
      }
    }
  }, [mode, caseDetailsData, caseTopics.length, setAttachments]);

  // --- HANDLERS: Add, Update, Delete, Save, Navigation ---
  // Add topic handler
  const handleAddTopic = () => {
    const newTopic = getValues();
    if (!newTopic.mainCategory?.value || !newTopic.subCategory?.value || !newTopic.acknowledged) {
      toast.error(t("required_fields_error") || "Please fill in all required fields (Main Category, Sub Category, and Acknowledgement).");
      return 0;
    }
    // (Add duplicate check if needed)
    setCaseTopics((prev) => [...prev, newTopic]);
    toast.success(t("topic_added_successfully") || "Topic added successfully");
    reset();
    setShowLegalSection(false);
    setShowTopicData(false);
    setEditTopic(null);
    setEditTopicIndex(null);
    return 1;
  };

  // Update topic handler
  const handleUpdate = () => {
    if (!editTopic) return;
    const updatedValues = getValues();
    setCaseTopics((prev) => prev.map((topic, idx) => (idx === editTopicIndex ? updatedValues : topic)));
    toast.success(t("topic_updated_successfully") || "Topic updated successfully");
    reset();
    setShowLegalSection(false);
    setShowTopicData(false);
    setEditTopic(null);
    setEditTopicIndex(null);
    close();
  };

  // Delete topic handler
  const handleDelete = () => {
    setCaseTopics((prev) => prev.filter((_, i) => i !== delTopic?.index));
    setShowDeleteConfirm(false);
    setDelTopic(null);
  };

  // Cancel handler
  const handleCancel = () => {
    reset();
    setShowLegalSection(false);
    setShowTopicData(false);
    setEditTopic(null);
    setEditTopicIndex(null);
    close();
  };

  // --- TABLE COLUMNS (with edit/delete actions) ---
  const handleTopicSelect = useCallback((topic: Topic, index: number) => {
    reset();
    setEditTopic(topic);
    setEditTopicIndex(index);
    setShowLegalSection(true);
    setShowTopicData(true);
    toggle();
  }, [reset, toggle]);

  const columns = useMemo(
    () =>
      getHearingTopicsColumns({
        t,
        onEdit: handleTopicSelect,
        onDel: (topic: Topic, index: number) => {
          setDelTopic({ topic, index });
          setShowDeleteConfirm(true);
        },
      }),
    [t, handleTopicSelect]
  );

  // --- DYNAMIC FORM LAYOUT ---
  let formLayout: any[] = [];
  if (userType === "Worker" || userType === "Embassy User") {
    formLayout =
      useFormLayoutWorker({
        t,
        MainTopicID: mainCategory,
        SubTopicID: isEditing ? editTopic?.subCategory : subCategory,
        FromLocation: fromPlace,
        ToLocation: toPlace,
        AcknowledgementTerms: acknowledged,
        showLegalSection,
        showTopicData,
        setValue,
        regulatoryText,
        handleAdd: () => {
          setShowLegalSection(true);
          setShowTopicData(false);
        },
        handleAcknowledgeChange: (val: boolean) => {
          setValue("acknowledged", val);
          if (val) setShowTopicData(true);
        },
        handleAddTopic,
        handleSend: handleAddTopic,
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
        trigger,
      }) || [];
  } else {
    formLayout =
      useFormLayoutEstablishment({
        t,
        MainTopicID: mainCategory,
        SubTopicID: isEditing ? editTopic?.subCategory : subCategory,
        FromLocation: fromPlace,
        ToLocation: toPlace,
        AcknowledgementTerms: acknowledged,
        showLegalSection,
        showTopicData,
        setValue,
        regulatoryText,
        handleAdd: () => {
          setShowLegalSection(true);
          setShowTopicData(false);
        },
        handleAcknowledgeChange: (val: boolean) => {
          setValue("acknowledged", val);
          if (val) setShowTopicData(true);
        },
        handleAddTopic,
        handleSend: handleAddTopic,
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
        trigger,
      }) || [];
  }

  // --- STEP NAVIGATION LOGIC ---
  const handleNext = async () => {
    // Save current form data and go to next step
    setFormData(getValues());
    // TODO: implement step logic as in originals
    updateParams(currentStep + 1, 0);
  };
  const handlePrevious = () => {
    // TODO: implement previous step logic as in originals
    updateParams(currentStep === 0 ? 0 : currentStep - 1, Math.max(currentTab - 1, 0));
  };

  // --- PAYLOAD CONSTRUCTION FOR SAVE ---
  const handleSaveApi = async () => {
    try {
      // Use 'Save' for both create and edit to match allowed types
      const payload = getPayloadBySubTopicID(caseTopics, subCategory, 'Save', caseId);
      let response;
      if (mode === "create") {
        response = await saveHearingTopics(payload).unwrap();
      } else {
        response = await updateHearingTopics(payload).unwrap();
      }
      if (response?.SuccessCode === "200") {
        toast.success(t("save_success"));
        setLastSaved(true);
      }
      return response;
    } catch (error: any) {
      toast.error(error?.message || t("save_error"));
      return Promise.reject(error);
    }
  };

  // --- SECTION/STEP LOGIC AND PREFILL ---
  useEffect(() => {
    if (mainCategory) {
      setValue("acknowledged", false);
      setShowTopicData(false);
      setShowLegalSection(false);
      setValue("regulatoryText", "");
    }
  }, [mainCategory, setValue]);
  useEffect(() => {
    if (subCategory) {
      setValue("acknowledged", false);
      setShowTopicData(false);
      setValue("regulatoryText", "");
    }
  }, [subCategory, setValue]);

  // --- UI: Table, Modal, DynamicForm, StepNavigation ---
  return (
    <Suspense fallback={<TableLoader />}>
      <StepNavigation
        onSubmit={handleSubmit(handleNext)}
        isValid={isValid && caseTopics.length > 0}
        isFirstStep={currentStep === 0 && currentTab === 0}
        isLastStep={currentStep === (steps.length - 1)}
        currentStep={currentStep}
        goToNextStep={handleNext}
        goToPrevStep={handlePrevious}
        resetSteps={() => updateParams(0, 0)}
        handleSave={handleSaveApi}
        canProceed={!!caseTopics.length}
        isButtonDisabled={(direction) => direction === "prev" ? currentStep === 0 && currentTab === 0 : false}
        isLoading={false}
        lastAction={undefined}
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
                    columns={columns as ColumnDef<object, any>[]}
                    page={pagination.pageIndex + 1}
                    totalPages={Math.ceil(caseTopics.length / pagination.pageSize)}
                    onPageChange={(newPage) => setPagination((prev) => ({ ...prev, pageIndex: newPage - 1 }))}
                    PaginationComponent={CustomPagination}
                  />
                  <AttachmentSection
                    attachments={attachments}
                    onAddClick={openAttachmentModal}
                    onRemove={(_, index) => handleRemoveAttachment(index)}
                    onView={handleViewAttachment}
                  />
                  <AttachmentModal
                    isOpen={showAttachmentModal}
                    onClose={closeAttachmentModal}
                    onSave={handleAttachmentSave}
                  />
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
                header={editTopic ? t("edit_topic") || "Edit Topic" : t("add_topic") || "Add Topic"}
                className="h-[60vh] sm:h-[600px] overflow-y-auto w-full max-w-[800px]"
              >
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
                        if (isEditing) {
                          handleUpdate();
                        } else {
                          handleAddTopic();
                        }
                      }}
                      className="text-sm font-medium"
                      disabled={!isValid || !acknowledged}
                    >
                      {isEditing ? t("update") || "Update" : t("send") || "Send"}
                    </Button>
                  </div>
                </RHFFormProvider>
              </Modal>
            </Suspense>
          )}
          {showDeleteConfirm && (
            <Modal
              close={() => setShowDeleteConfirm(false)}
              header={t("delete_topic") || "Delete Topic"}
              modalWidth={500}
            >
              <p className="text-sm text-gray-700">
                {t("confirm_delete_topic") || "Are you sure you want to delete this topic? This action cannot be undone."}
              </p>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                  {t("no") || "No"}
                </Button>
                <Button variant="primary" onClick={handleDelete}>
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

export { HearingTopicsUnified };
export default HearingTopicsUnified; 