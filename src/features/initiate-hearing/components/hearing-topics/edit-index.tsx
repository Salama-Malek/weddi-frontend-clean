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
  useUpdateHearingTopicsMutation,
} from "../../api/create-case/apis";
import { useCookieState } from "../../hooks/useCookieState";
import { TableSkeletonLoader } from "@/shared/components/loader/SkeletonLoader";
import { TopicFormValues } from "./hearing.topics.types";
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
import FileAttachment from "@/shared/components/ui/file-attachment/FileAttachment";
import { DateObject } from "react-multi-date-picker";
import gregorianCalendar from "react-date-object/calendars/gregorian";
import gregorianLocale from "react-date-object/locales/gregorian_en";
import arabicCalendar from "react-date-object/calendars/arabic";
import arabicLocale from "react-date-object/locales/arabic_ar";
import { useApiErrorHandler } from "@/shared/hooks/useApiErrorHandler";
import FeaturedIcon from "@/assets/Featured icon.svg";
import { useRemoveAttachmentMutation } from "./api/apis";
import { isOtherCommission } from "./utils/isOtherCommission";

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
  } = methods;

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
  const userID = getCookie("userClaims")?.UserID;
  const fileNumber = getCookie("userClaims")?.File_Number;

  const { i18n } = useTranslation();
  const currentLanguage = i18n.language.toUpperCase();

  const { handleResponse } = useApiErrorHandler();

  const onSubmit = (data: TopicFormValues) => { };

  const mainCategory = watch("mainCategory") ?? null;
  const subCategory: any = watch("subCategory") ?? null;
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
  const isHIR1 = editTopic?.subCategory?.value === "HIR-1";
  const lockAccommodationSource = isEditing && isHIR1;

  useEffect(() => {
    // Don't interfere with prefilling when editing
    if (isEditing) return;

    if (subCategory?.value && mainCategory?.value) {
      goToLegalStep();
    }
  }, [subCategory?.value, mainCategory?.value, isEditing]);

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
  }, [
    caseId,
    currentLanguage,
    triggerCaseDetailsQuery,
    userType,
    fileNumber,
    mainCategory2,
    subCategory2,
    userID,
    caseDetailsData,
  ]);

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
        ...(topic.SubTopicID === "RFR-1"
          ? {
            amount: topic.amount || "",
            consideration: topic.consideration || "",
            date_hijri: topic.date_hijri || "",
            date_gregorian: topic.date_gregorian || "",
          }
          : {}),
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

        // Add correct mapping for WR-1 date fields
        ...(topic.SubTopicID === "WR-1"
          ? {
            from_date_hijri: topic.pyTempDate || topic.from_date_hijri || "",
            from_date_gregorian:
              topic.FromDate_New || topic.from_date_gregorian || "",
            to_date_hijri: topic.Date_New || topic.to_date_hijri || "",
            to_date_gregorian:
              topic.ToDate_New || topic.to_date_gregorian || "",
          }
          : {}),
        // Add correct mapping for forAllowance dropdown (WR-1 only)
        ...(topic.SubTopicID === "WR-1"
          ? {
            forAllowance: topic.ForAllowance_Code
              ? { value: topic.ForAllowance_Code, label: topic.ForAllowance }
              : null,
            otherAllowance: topic.OtherAllowance || "",
          }
          : {}),

        // Add correct mapping for WR-2 fields
        ...(topic.SubTopicID === "WR-2"
          ? {
            amount: topic.OverdueWagesAmount || "",
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
            requestType: topic.RequestType_Code
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
          compensationAmount: topic.Amount ? String(topic.Amount) : "",
          injury_date_hijri: topic.pyTempText || "",
          injury_date_gregorian: topic.InjuryDate_New || "",
          injuryType: topic.TypeOfWorkInjury || "",
        }),
        // CMR-4: Request compensation for the duration of the notice
        ...(topic.SubTopicID === "CMR-4" && {
          amount: topic.Amount ? String(topic.Amount) : "",
        }),
        // CMR-5: Pay for work during vacation
        ...(topic.SubTopicID === "CMR-5" && {
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
          pyTempDate: topic.pyTempDate || "",
          toDate_gregorian: topic.ToDate_New || "",
          date_hijri: topic.Date_New || "",
          fromDate_gregorian: topic.FromDate_New || "",
          durationOfLeaveDue: topic.DurationOfLeaveDue
            ? String(topic.DurationOfLeaveDue)
            : "",
          payDue: topic.PayDue ? String(topic.PayDue) : "",
        }),
        // CMR-8: Pay stop time
        ...(topic.SubTopicID === "CMR-8" && {
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
          amount: topic.amount || "",
          rewardType: topic.rewardType || "",
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
        ...(topic.SubTopicID === "JAR-3" && {
          doesTheInternalRegulationIncludePromotionMechanism:
            topic.doesTheInternalRegulationIncludePromotionMechanism || false,
          doesContractIncludeAdditionalUpgrade:
            topic.doesContractIncludeAdditionalUpgrade || false,
        }),
        // JAR-4: Job Application Request (currentPosition, theWantedJob)
        ...(topic.SubTopicID === "JAR-4" && {
          currentPosition: topic.CurrentPosition || topic.currentPosition || "",
          theWantedJob: topic.TheWantedJob || topic.theWantedJob || "",
        }),
        // ──────────────── END JAR SUBTOPICS MAPPING ────────────────
        // ──────────────── LRESR SUBTOPICS MAPPING ────────────────
        // LRESR-1: End of Service Reward
        ...(topic.SubTopicID === "LRESR-1" && {
          amount: topic.amount || "",
        }),
        // LRESR-2: End of Service Reward (amount, consideration)
        ...(topic.SubTopicID === "LRESR-2" && {
          amount: topic.amount || "",
          consideration: topic.consideration || "",
        }),
        // LRESR-3: End of Service Reward (amount, rewardType)
        ...(topic.SubTopicID === "LRESR-3" && {
          amount: topic.amount || "",
          rewardType: topic.rewardType || "",
        }),
        // ──────────────── END LRESR SUBTOPICS MAPPING ────────────────
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

  const handleTopicSelect = (topic: any, index: number) => {
    // Reset form first to clear any previous data
    reset();

    // --- Normalize mainCategory and subCategory to always be objects ---
    if (typeof topic.mainCategory === "string") {
      setValue("mainCategory", {
        value: topic.mainCategory,
        label: topic.mainCategory,
      });
    } else {
      setValue("mainCategory", topic.mainCategory);
    }
    if (typeof topic.subCategory === "string") {
      setValue("subCategory", {
        value: topic.subCategory,
        label: topic.subCategory,
      });
    } else {
      setValue("subCategory", topic.subCategory);
    }
    // --- END normalization ---


    if (topic.SubTopicID === "CMR-6") {
      setValue("from_date_hijri", topic.from_date_hijri || topic.pyTempDate || "");
      setValue("from_date_gregorian", topic.from_date_gregorian || topic.FromDate_New || "");
      setValue("to_date_hijri", topic.to_date_hijri || topic.Date_New || "");
      setValue("to_date_gregorian", topic.to_date_gregorian || topic.ToDate_New || "");
      setValue("newPayAmount", topic.newPayAmount || topic.NewPayAmount || "");
      setValue("payIncreaseType", topic.payIncreaseType || (topic.PayIncreaseType_Code ? { value: topic.PayIncreaseType_Code, label: topic.PayIncreaseType } : null));
      setValue("wageDifference", topic.wageDifference || topic.WageDifference || "");
    }



    // --- HIR-1 accommodation radio auto-select logic ---
    if (topic.doesBylawsIncludeAddingAccommodations) {
      setValue("accommodationSource", "bylaws");
    } else if (topic.doesContractIncludeAddingAccommodations) {
      setValue("accommodationSource", "contract");
    } else {
      setValue("accommodationSource", "");
    }
    // --- END HIR-1 logic ---

    // RFR-1: Set date fields from topic when editing from UI
    if (topic.subCategory?.value === "RFR-1" || topic.SubTopicID === "RFR-1") {
      reset({
        ...topic,
        date_hijri: topic.date_hijri || "",
        date_gregorian: topic.date_gregorian || "",
      });
    }

// --- BPSR-1 prefilling ---
if (topic.SubTopicID === "BPSR-1" || topic.subCategory?.value === "BPSR-1") {
  const commissionCode =
    topic.CommissionType_Code ??
    topic.commissionType?.value ??
    topic.CommissionType;

  setValue(
    "commissionType",
    ensureOption(
      commissionTypeLookupData?.DataElements,
      commissionCode,
      topic.CommissionTypeLabel || topic.CommissionType
    ),
    { shouldDirty: false, shouldValidate: false }
  );

  const agrCode =
    topic.AccordingToAgreement_Code ??
    topic.accordingToAgreement?.value ??
    topic.AccordingToAgreement;

  setValue(
    "accordingToAgreement",
    ensureOption(
      accordingToAgreementLookupData?.DataElements,
      agrCode,
      topic.AccordingToAgreement
    ),
    { shouldDirty: false, shouldValidate: false }
  );

  setValue("amount", String(topic.Amount ?? topic.amount ?? ""), { shouldDirty: false });
  setValue("amountRatio", String(topic.AmountRatio ?? topic.amountRatio ?? ""), { shouldDirty: false });
  setValue("from_date_hijri", topic.pyTempDate ?? topic.FromDateHijri ?? topic.from_date_hijri ?? "", { shouldDirty: false });
  setValue("from_date_gregorian", topic.FromDate_New ?? topic.FromDateGregorian ?? topic.from_date_gregorian ?? "", { shouldDirty: false });
  setValue("to_date_hijri", topic.Date_New ?? topic.ToDateHijri ?? topic.to_date_hijri ?? "", { shouldDirty: false });
  setValue("to_date_gregorian", topic.ToDate_New ?? topic.ToDateGregorian ?? topic.to_date_gregorian ?? "", { shouldDirty: false });
  setValue("otherCommission", String(topic.OtherCommission ?? topic.otherCommission ?? ""), { shouldDirty: false });
}


    // forAllowance
    let forAllowanceLabel = topic.forAllowance?.label || topic.ForAllowance;
    let forAllowanceValue = topic.forAllowance?.value || topic.ForAllowance;
    let forAllowanceOption = {
      value: forAllowanceValue,
      label: forAllowanceLabel,
    };
    if (forAllowanceValue && forAllowanceLabel) {
      setValue("forAllowance", forAllowanceOption);
    } else {
      setValue("forAllowance", null);
    }

    // travelingWay
    console.log("--- Debugging travelingWay ---");
    console.log("Topic object:", JSON.stringify(topic, null, 2));
    console.log("travelingWayData:", travelingWayData);
    let travelingWayLabel = topic.travelingWay?.label || topic.TravelingWay;
    let travelingWayValue = topic.travelingWay?.value || topic.TravelingWay;
    console.log("Initial travelingWayValue:", travelingWayValue);
    console.log("Initial travelingWayLabel:", travelingWayLabel);

    // Fix: Use travelingWayData.DataElements to get the label if available
    if (travelingWayData?.DataElements && travelingWayValue) {
      console.log(
        "travelingWayData.DataElements is available. Searching for value:",
        travelingWayValue
      );
      const found = travelingWayData.DataElements.find(
        (item: any) => item.ElementKey === travelingWayValue
      );
      if (found) {
        console.log("Found matching element:", found);
        travelingWayLabel = found.ElementValue;
      } else {
        console.log(
          "No matching element found in travelingWayData.DataElements."
        );
      }
    } else {
      console.log(
        "travelingWayData or its DataElements are not available, or travelingWayValue is missing."
      );
    }
    let travelingWayOption = {
      value: travelingWayValue,
      label: travelingWayLabel,
    };
    console.log("Final travelingWayOption to be set:", travelingWayOption);
    if (travelingWayValue && travelingWayLabel) {
      setValue("travelingWay", travelingWayOption);
    } else {
      setValue("travelingWay", null);
    }
    console.log("--- End Debugging travelingWay ---");

    // typeOfRequest
    let typeOfRequestLabel = topic.typeOfRequest?.label || topic.TypeOfRequest;
    let typeOfRequestValue = topic.typeOfRequest?.value || topic.TypeOfRequest;
    let typeOfRequestOption = {
      value: typeOfRequestValue,
      label: typeOfRequestLabel,
    };
    if (typeOfRequestValue && typeOfRequestLabel) {
      setValue("typeOfRequest", typeOfRequestOption);
    } else {
      setValue("typeOfRequest", null);
    }

    // typesOfPenalties
    let typesOfPenaltiesLabel =
      topic.typesOfPenalties?.label || topic.TypesOfPenalties;
    let typesOfPenaltiesValue =
      topic.typesOfPenalties?.value || topic.TypesOfPenalties;
    let typesOfPenaltiesOption = {
      value: typesOfPenaltiesValue,
      label: typesOfPenaltiesLabel,
    };
    if (typesOfPenaltiesValue && typesOfPenaltiesLabel) {
      setValue("typesOfPenalties", typesOfPenaltiesOption);
    } else {
      setValue("typesOfPenalties", null);
    }

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
        onDel: (topic, index) => {
          setDelTopic({ topic, index });
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

    const mainCategoryValue =
      updatedValues.mainCategory?.value ||
      editTopic.MainTopicID ||
      editTopic.mainCategory?.value;
    const mainCategoryLabel =
      updatedValues.mainCategory?.label ||
      editTopic.MainSectionHeader ||
      editTopic.mainCategory?.label;
    const subCategoryValue =
      updatedValues.subCategory?.value ||
      editTopic.SubTopicID ||
      editTopic.subCategory?.value;
    const subCategoryLabel =
      updatedValues.subCategory?.label ||
      editTopic.SubTopicName ||
      editTopic.subCategory?.label;

    const formatDateForStorage = (date: string) =>
      date ? date.replace(/\//g, "") : "";

    const updatedTopic: any = {
      ...updatedValues,
      MainTopicID: mainCategoryValue,
      SubTopicID: subCategoryValue,
      MainSectionHeader: mainCategoryLabel,
      SubTopicName: subCategoryLabel,
      CaseTopicName: mainCategoryLabel,
      subCategory: { value: subCategoryValue, label: subCategoryLabel },
      mainCategory: { value: mainCategoryValue, label: mainCategoryLabel },

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
      accordingToAgreement:
        updatedValues.accordingToAgreement || editTopic?.accordingToAgreement,
      forAllowance: updatedValues.forAllowance || editTopic?.forAllowance,
      travelingWay: updatedValues.travelingWay || editTopic?.travelingWay,
      typesOfPenalties:
        updatedValues.typesOfPenalties || editTopic?.typesOfPenalties,
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
      ToDateHijri: formatDateForStorage(updatedValues.to_date_hijri),
      ToDateGregorian: formatDateForStorage(updatedValues.to_date_gregorian),
      newPayAmount: updatedValues.newPayAmount || editTopic.newPayAmount,
      payIncreaseType:
        updatedValues.payIncreaseType || editTopic.payIncreaseType,
      wageDifference: updatedValues.wageDifference || editTopic.wageDifference,
      from_date_gregorian:
        updatedValues.from_date_gregorian || editTopic.from_date_gregorian,
      to_date_gregorian:
        updatedValues.to_date_gregorian || editTopic.to_date_gregorian,

      ManagerialDecisionDateHijri: formatDateForStorage(
        updatedValues.managerial_decision_date_hijri
      ),
      ManagerialDecisionDateGregorian: formatDateForStorage(
        updatedValues.managerial_decision_date_gregorian
      ),
      ManagerialDecisionNumber:
        updatedValues.managerialDecisionNumber ||
        editTopic.ManagerialDecisionNumber ||
        "",

      InjuryDateHijri: formatDateForStorage(updatedValues.injury_date_hijri),
      InjuryDateGregorian: formatDateForStorage(
        updatedValues.injury_date_gregorian
      ),
      RequestDateHijri: formatDateForStorage(updatedValues.request_date_hijri),
      RequestDateGregorian: formatDateForStorage(
        updatedValues.request_date_gregorian
      ),
      DateHijri: formatDateForStorage(updatedValues.date_hijri),
      DateGregorian: formatDateForStorage(updatedValues.date_gregorian),
      FromDateHijri: formatDateForStorage(updatedValues.from_date_hijri),
      FromDateGregorian: formatDateForStorage(
        updatedValues.from_date_gregorian
      ),
    };

    // ==================== BPSR-1 FIX ====================
    if (subCategoryValue === "BPSR-1") {
      updatedTopic.CommissionType =
        updatedValues.commissionType?.value ??
        editTopic.CommissionType ??
        "";
      updatedTopic.AccordingToAgreement =
        updatedValues.accordingToAgreement?.value ??
        editTopic.AccordingToAgreement ??
        "";
      updatedTopic.Amount = updatedValues.amount ?? editTopic.amount ?? "";
      updatedTopic.AmountRatio =
        updatedValues.amountRatio ?? editTopic.amountRatio ?? "";
      updatedTopic.pyTempDate =
        updatedValues.from_date_hijri ?? editTopic.pyTempDate ?? "";
      updatedTopic.FromDate_New =
        updatedValues.from_date_gregorian ??
        editTopic.FromDate_New ??
        "";
      updatedTopic.Date_New =
        updatedValues.to_date_hijri ?? editTopic.Date_New ?? "";
      updatedTopic.ToDate_New =
        updatedValues.to_date_gregorian ??
        editTopic.ToDate_New ??
        "";
      updatedTopic.OtherCommission = isOtherCommission(
        updatedValues.commissionType
      )
        ? updatedValues.otherCommission ??
        editTopic.otherCommission ??
        ""
        : "";
    }
    // ====================================================

    setCaseTopics((prev) =>
      prev.map((topic, idx) => (idx === editTopicIndex ? updatedTopic : topic))
    );

    toast.success(t("topic_updated_successfully") || "Topic updated successfully");

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
    try {
      setLastAction("Save");
      const payload = getPayloadBySubTopicID(
        caseTopics,
        subCategory,
        "Save",
        caseId
      );
      // Use the injected API if provided, otherwise fallback
      const response = onSaveApi
        ? await onSaveApi(payload)
        : await updateHearingTopics(payload).unwrap();
      if (
        response?.SuccessCode === "200" &&
        (!response?.ErrorCodeList || response?.ErrorCodeList?.length === 0)
      ) {
        toast.success(t("save_success"));
        setLastSaved(true);
      }
      return response;
    } catch (error: any) {
      setLastAction(undefined);
      const errorMessage = error?.message || t("save_error");
      toast.error(errorMessage);
      return Promise.reject(error);
    }
  };

  const handleNext = async () => {
    const latestFormValues = getValues();
    setFormData(latestFormValues);
    try {
      setLastAction("Next");
      const payload = getPayloadBySubTopicID(
        caseTopics,
        subCategory,
        "Next",
        caseId
      );

      const response = await updateHearingTopics(payload).unwrap();

      // Use centralized error handling
      const isSuccessful = handleResponse(response);

      if (isSuccessful) {
        // Only navigate if the API call is successful
        updateParams(currentStep + 1, 0);
      }
      // Errors are automatically handled by the centralized error handler
    } catch (error: any) {
      setLastAction(undefined);
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
      ...(newTopic.SubTopicID === "EDO-1" && {
        fromLocation: newTopic.FromLocation_Code
          ? { value: newTopic.FromLocation_Code, label: newTopic.FromLocation }
          : null,
        toLocation: newTopic.ToLocation_Code
          ? { value: newTopic.ToLocation_Code, label: newTopic.ToLocation }
          : null,
        managerial_decision_date_hijri: newTopic.Date_New || "",
        managerial_decision_date_gregorian: newTopic.ManDecsDate || "",
        managerialDecisionNumber: newTopic.ManagerialDecisionNumber || "",
      }),
      // EDO-2: Cancellation of the job transfer decision
      ...(newTopic.SubTopicID === "EDO-2" && {
        fromJob: newTopic.FromJob || "",
        toJob: newTopic.ToJob || "",
        managerial_decision_date_hijri: newTopic.Date_New || "",
        managerial_decision_date_gregorian: newTopic.ManDecsDate || "",
        managerialDecisionNumber: newTopic.ManagerialDecisionNumber || "",
      }),
      // EDO-3: Cancellation of the wage reduction decision
      ...(newTopic.SubTopicID === "EDO-3" && {
        amountOfReduction: newTopic.AmountOfReduction || "",
        managerial_decision_date_hijri: newTopic.pyTempDate || "",
        managerial_decision_date_gregorian:
          newTopic.ManagerialDecisionDate_New || "",
        managerialDecisionNumber: newTopic.ManagerialDecisionNumber || "",
      }),
      // EDO-4: Cancellation of disciplinary penalty decision
      ...(newTopic.SubTopicID === "EDO-4" && {
        typesOfPenalties: newTopic.PenalityType_Code
          ? { value: newTopic.PenalityType_Code, label: newTopic.PenalityType }
          : null,
        managerial_decision_date_hijri: newTopic.Date_New || "",
        managerial_decision_date_gregorian: newTopic.ManDecsDate || "",
        managerialDecisionNumber: newTopic.ManagerialDecisionNumber || "",
      }),
      // ──────────────── END EDO SUBTOPICS MAPPING ────────────────
      // Add correct mapping for WR-2 fields
      ...(newTopic.SubTopicID === "WR-2"
        ? {
          amount: newTopic.OverdueWagesAmount || "",
          from_date_hijri: newTopic.pyTempDate || "",
          from_date_gregorian: newTopic.FromDate_New || "",
          to_date_hijri: newTopic.Date_New || "",
          to_date_gregorian: newTopic.ToDate_New || "",
        }
        : {}),
      // ──────────────── MIR SUBTOPICS MAPPING ────────────────
      ...(newTopic.SubTopicID === "MIR-1"
        ? {
          requestType: newTopic.RequestType_Code
            ? {
              value: newTopic.RequestType_Code,
              label: newTopic.RequestType,
            }
            : null,
          requiredDegreeOfInsurance: newTopic.RequiredDegreeInsurance || "",
          theReason: newTopic.Reason || "",
          currentInsuranceLevel: newTopic.CurrentInsuranceLevel || "",
        }
        : {}),
      // ──────────────── END MIR SUBTOPICS MAPPING ────────────────

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
        compensationAmount:
          newTopic.compensationAmount !== undefined &&
            newTopic.compensationAmount !== null
            ? String(newTopic.compensationAmount)
            : "",
        injury_date_hijri: newTopic.injury_date_hijri ?? "",
        injury_date_gregorian: newTopic.injury_date_gregorian ?? "",
        injuryType: newTopic.injuryType ?? "",
      }),
      // CMR-4: Request compensation for the duration of the notice
      ...(newTopic.SubTopicID === "CMR-4" && {
        amount:
          newTopic.amount !== undefined && newTopic.amount !== null
            ? String(newTopic.amount)
            : "",
      }),
      // CMR-5: Pay for work during vacation
      ...(newTopic.SubTopicID === "CMR-5" && {
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
      ...(newTopic.SubTopicID === "CMR-6" && {
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
      ...(newTopic.SubTopicID === "BR-1" && {
        AccordingToAgreement: newTopic.accordingToAgreement?.value ?? "",
        BonusAmount: newTopic.bonusAmount ?? "",
        date_hijri: newTopic.date_hijri ?? "",
        date_gregorian: newTopic.date_gregorian ?? "",
      }),
      // ──────────────── END BR SUBTOPICS MAPPING ────────────────

      // ──────────────── BPSR SUBTOPICS MAPPING ────────────────
      // BPSR-1: Bonus and Profit Share Request
      ...(newTopic.SubTopicID === "BPSR-1" && {
        CommissionType: newTopic.commissionType?.value ?? "",
        AccordingToAgreement: newTopic.accordingToAgreement?.value ?? "",
        Amount: newTopic.amount ?? "",
        AmountRatio: newTopic.amountRatio ?? "",
        pyTempDate: newTopic.from_date_hijri ?? "",
        FromDate_New: newTopic.from_date_gregorian ?? "",
        Date_New: newTopic.to_date_hijri ?? "",
        ToDate_New: newTopic.to_date_gregorian ?? "",
        OtherCommission: isOtherCommission(newTopic.commissionType)
          ? newTopic.otherCommission ?? ""
          : "",
      }),

      // ──────────────── END BPSR SUBTOPICS MAPPING ────────────────

      // ──────────────── DR SUBTOPICS MAPPING ────────────────
      // DR-1: Documents Requests
      ...(newTopic.SubTopicID === "DR-1" && {
        documentType: newTopic.documentType ?? null,
        documentReason: newTopic.documentReason ?? "",
      }),
      // ──────────────── END DR SUBTOPICS MAPPING ────────────────

      // ──────────────── RR SUBTOPICS MAPPING ────────────────
      // RR-1: Reward Request
      ...(newTopic.SubTopicID === "RR-1" && {
        amount: newTopic.amount ?? "",
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
      ...(newTopic.SubTopicID === "JAR-3" && {
        doesTheInternalRegulationIncludePromotionMechanism:
          newTopic.doesTheInternalRegulationIncludePromotionMechanism ?? false,
        doesContractIncludeAdditionalUpgrade:
          newTopic.doesContractIncludeAdditionalUpgrade ?? false,
      }),
      // JAR-4: Job Application Request (currentPosition, theWantedJob)
      ...(newTopic.SubTopicID === "JAR-4" && {
        currentPosition: newTopic.currentPosition ?? "",
        theWantedJob: newTopic.theWantedJob ?? "",
      }),
      // ──────────────── END JAR SUBTOPICS MAPPING ────────────────
      // ──────────────── LRESR SUBTOPICS MAPPING ────────────────
      // LRESR-1: End of Service Reward
      ...(newTopic.SubTopicID === "LRESR-1" && {
        amount: newTopic.amount ?? "",
      }),
      // LRESR-2: End of Service Reward (amount, consideration)
      ...(newTopic.SubTopicID === "LRESR-2" && {
        amount: newTopic.amount ?? "",
        consideration: newTopic.consideration ?? "",
      }),
      // LRESR-3: End of Service Reward (amount, rewardType)
      ...(newTopic.SubTopicID === "LRESR-3" && {
        amount: newTopic.amount ?? "",
        rewardType: newTopic.rewardType ?? "",
      }),
      // ──────────────── END LRESR SUBTOPICS MAPPING ────────────────
    };

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
    return dateObj
      .convert(gregorianCalendar, gregorianLocale)
      .format("YYYYMMDD");
  }

  // Handle date context and section visibility when editing
  useEffect(() => {
    if (isEditing && editTopic && isOpen) {
      // RFR-1 specific date mapping
      if (
        editTopic.subCategory?.value === "RFR-1" ||
        editTopic.SubTopicID === "RFR-1"
      ) {
        setValue("date_hijri", editTopic.pyTempDate || "");
        setValue("date_gregorian", editTopic.Date_New || "");
      } else {
        // Existing logic for other topics
        if (editTopic.date_hijri) {
          setDate({
            hijri: editTopic.date_hijri,
            gregorian: editTopic.gregorianDate,
            dateObject: null,
          });
        }
        setValue("from_date_hijri", editTopic.from_date_hijri);
        setValue(
          "from_date_gregorian",
          editTopic.from_date_gregorian ||
          hijriToGregorian(editTopic.from_date_hijri)
        );
        setValue("to_date_hijri", editTopic.to_date_hijri);
        setValue(
          "to_date_gregorian",
          editTopic.to_date_gregorian ||
          hijriToGregorian(editTopic.to_date_hijri)
        );
        setValue("injury_date_hijri", editTopic.injury_date_hijri);
        setValue(
          "injury_date_gregorian",
          editTopic.injury_date_gregorian ||
          hijriToGregorian(editTopic.injury_date_hijri)
        );
      }
      // Prefill CMR-5 fields
      if (editTopic.subCategory?.value === "CMR-5") {
        setValue("kindOfHoliday", editTopic.kindOfHoliday ?? null);
        setValue("totalAmount", editTopic.totalAmount ?? "");
        setValue("workingHours", editTopic.workingHours ?? "");
        setValue("additionalDetails", editTopic.additionalDetails ?? "");
      }
      if (editTopic.SubTopicID === "CMR-6") {
        setValue("from_date_hijri", editTopic.from_date_hijri ?? editTopic.pyTempDate ?? "");
        setValue("from_date_gregorian", editTopic.from_date_gregorian ?? editTopic.FromDate_New ?? "");
        setValue("to_date_hijri", editTopic.to_date_hijri ?? editTopic.Date_New ?? "");
        setValue("to_date_gregorian", editTopic.to_date_gregorian ?? editTopic.ToDate_New ?? "");
        setValue("newPayAmount", editTopic.newPayAmount ?? editTopic.NewPayAmount ?? "");
        setValue("payIncreaseType", editTopic.payIncreaseType ?? null);
        setValue("wageDifference", editTopic.wageDifference ?? editTopic.WageDifference ?? "");
      }


      // Prefill EDO-2 fields
      if (editTopic.subCategory?.value === "EDO-2") {
        setValue("fromJob", editTopic.fromJob ?? "");
        setValue("toJob", editTopic.toJob ?? "");
        setValue(
          "managerial_decision_date_hijri",
          editTopic.managerial_decision_date_hijri ?? ""
        );
        setValue(
          "managerial_decision_date_gregorian",
          editTopic.managerial_decision_date_gregorian ?? ""
        );
        setValue(
          "managerialDecisionNumber",
          editTopic.managerialDecisionNumber ?? ""
        );
      }
      // Prefill EDO-3 fields
      if (editTopic.subCategory?.value === "EDO-3") {
        setValue("amountOfReduction", editTopic.amountOfReduction ?? "");
        setValue(
          "managerial_decision_date_hijri",
          editTopic.managerial_decision_date_hijri ?? ""
        );
        setValue(
          "managerial_decision_date_gregorian",
          editTopic.managerial_decision_date_gregorian ?? ""
        );
        setValue(
          "managerialDecisionNumber",
          editTopic.managerialDecisionNumber ?? ""
        );
      }
      // Prefill EDO-4 fields
      if (editTopic.subCategory?.value === "EDO-4") {
        setValue("typesOfPenalties", editTopic.typesOfPenalties ?? null);
        setValue(
          "managerial_decision_date_hijri",
          editTopic.managerial_decision_date_hijri ?? ""
        );
        setValue(
          "managerial_decision_date_gregorian",
          editTopic.managerial_decision_date_gregorian ?? ""
        );
        setValue(
          "managerialDecisionNumber",
          editTopic.managerialDecisionNumber ?? ""
        );
      }
      // ──────────────── END EDO SUBTOPICS PREFILL ────────────────
      // Set From Location and To Location fields (always use code for lookup)
      const fromLocationCode =
        editTopic.fromLocation?.value ||
        editTopic.FromLocation_Code ||
        editTopic.fromLocation;
      if (fromLocationCode && regionData?.DataElements) {
        const fromLocationOption = regionData.DataElements.find(
          (item: any) => String(item.ElementKey) === String(fromLocationCode)
        );
        setValue("fromLocation", {
          value: String(fromLocationCode),
          label: fromLocationOption
            ? fromLocationOption.ElementValue
            : String(fromLocationCode),
        });
      }
      const toLocationCode =
        editTopic.toLocation?.value ||
        editTopic.ToLocation_Code ||
        editTopic.toLocation;
      if (toLocationCode && regionData?.DataElements) {
        const toLocationOption = regionData.DataElements.find(
          (item: any) => String(item.ElementKey) === String(toLocationCode)
        );
        setValue("toLocation", {
          value: String(toLocationCode),
          label: toLocationOption
            ? toLocationOption.ElementValue
            : String(toLocationCode),
        });
      }
      // Show appropriate sections
      setShowLegalSection(true);
      setShowTopicData(true);
    }
  }, [isEditing, editTopic, isOpen, setShowLegalSection, setShowTopicData]);

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
        editTopic.RequestType_Code ||
        editTopic.RequestType ||
        editTopic.TypeOfRequest;
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
        editTopic.fromLocation?.value ??
        editTopic.FromLocation_Code ??
        editTopic.fromLocation;
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
        editTopic.toLocation?.value ??
        editTopic.ToLocation_Code ??
        editTopic.toLocation;
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

  useEffect(() => {
    if (isEditing && editTopic && (isOpen || true)) {
      // ──────────────── CMR SUBTOPICS PREFILL ────────────────
      // CMR-1: Treatment refunds
      if (
        editTopic.subCategory?.value === "CMR-1" ||
        editTopic.SubTopicID === "CMR-1"
      ) {
        setValue("amountsPaidFor", editTopic.amountsPaidFor ?? null, {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue("theAmountRequired", editTopic.theAmountRequired ?? "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        trigger(["amountsPaidFor", "theAmountRequired"]);
      }
      // CMR-3: Request compensation for work injury
      if (
        editTopic.subCategory?.value === "CMR-3" ||
        editTopic.SubTopicID === "CMR-3"
      ) {
        setValue("compensationAmount", editTopic.compensationAmount ?? "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue("injury_date_hijri", editTopic.injury_date_hijri ?? "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue(
          "injury_date_gregorian",
          editTopic.injury_date_gregorian ?? "",
          { shouldValidate: true, shouldDirty: true }
        );
        setValue("injuryType", editTopic.injuryType ?? "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        trigger([
          "compensationAmount",
          "injury_date_hijri",
          "injury_date_gregorian",
          "injuryType",
        ]);
      }
      // CMR-4: Request compensation for the duration of the notice
      if (
        editTopic.subCategory?.value === "CMR-4" ||
        editTopic.SubTopicID === "CMR-4"
      ) {
        setValue("amount", editTopic.amount ?? "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        trigger("amount");
      }
      // CMR-5: Pay for work during vacation
      if (
        editTopic.subCategory?.value === "CMR-5" ||
        editTopic.SubTopicID === "CMR-5"
      ) {
        setValue("kindOfHoliday", editTopic.kindOfHoliday ?? null, {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue("totalAmount", editTopic.totalAmount ?? "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue("workingHours", editTopic.workingHours ?? "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue("additionalDetails", editTopic.additionalDetails ?? "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        trigger([
          "kindOfHoliday",
          "totalAmount",
          "workingHours",
          "additionalDetails",
        ]);
      }

      // CMR-6: The Wage Difference/increase
      if (
        editTopic.subCategory?.value === "CMR-6" ||
        editTopic.SubTopicID === "CMR-6"
      ) {
        setValue("from_date_hijri", editTopic.from_date_hijri ?? editTopic.pyTempDate ?? "", { shouldValidate: true, shouldDirty: true });
        setValue("from_date_gregorian", editTopic.from_date_gregorian ?? editTopic.FromDate_New ?? "", { shouldValidate: true, shouldDirty: true });
        setValue("to_date_hijri", editTopic.to_date_hijri ?? editTopic.Date_New ?? "", { shouldValidate: true, shouldDirty: true });
        setValue("to_date_gregorian", editTopic.to_date_gregorian ?? editTopic.ToDate_New ?? "", { shouldValidate: true, shouldDirty: true });
        setValue("newPayAmount", editTopic.newPayAmount ?? editTopic.NewPayAmount ?? "", { shouldValidate: true, shouldDirty: true });
        setValue("payIncreaseType", editTopic.payIncreaseType ?? null, { shouldValidate: true, shouldDirty: true });
        setValue("wageDifference", editTopic.wageDifference ?? editTopic.WageDifference ?? "", { shouldValidate: true, shouldDirty: true });

        trigger([
          "from_date_hijri",
          "from_date_gregorian",
          "to_date_hijri",
          "to_date_gregorian",
          "newPayAmount",
          "payIncreaseType",
          "wageDifference",
        ]);
      }

      // CMR-7: Request for overtime pay
      if (
        editTopic.subCategory?.value === "CMR-7" ||
        editTopic.SubTopicID === "CMR-7"
      ) {
        setValue("pyTempDate", editTopic.pyTempDate ?? "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue("toDate_gregorian", editTopic.toDate_gregorian ?? "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue("date_hijri", editTopic.date_hijri ?? "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue("fromDate_gregorian", editTopic.fromDate_gregorian ?? "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue("durationOfLeaveDue", editTopic.durationOfLeaveDue ?? "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue("payDue", editTopic.payDue ?? "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        trigger([
          "pyTempDate",
          "toDate_gregorian",
          "date_hijri",
          "fromDate_gregorian",
          "durationOfLeaveDue",
          "payDue",
        ]);
      }
      // CMR-8: Pay stop time
      if (
        editTopic.subCategory?.value === "CMR-8" ||
        editTopic.SubTopicID === "CMR-8"
      ) {
        setValue("pyTempDate", editTopic.pyTempDate ?? "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue("toDate_gregorian", editTopic.toDate_gregorian ?? "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue("date_hijri", editTopic.date_hijri ?? "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue("fromDate_gregorian", editTopic.fromDate_gregorian ?? "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue("wagesAmount", editTopic.wagesAmount ?? "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        trigger([
          "pyTempDate",
          "toDate_gregorian",
          "date_hijri",
          "fromDate_gregorian",
          "wagesAmount",
        ]);
      }
      // ──────────────── END CMR SUBTOPICS PREFILL ────────────────

      // ──────────────── LCUT SUBTOPICS PREFILL ────────────────
      // LCUT-1, LCUTE-1: Lawsuit for compensation for unlawful termination
      if (
        editTopic.subCategory?.value === "LCUT-1" ||
        editTopic.SubTopicID === "LCUT-1"
      ) {
        setValue("amountOfCompensation", editTopic.amountOfCompensation ?? "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        trigger("amountOfCompensation");
      }
      if (
        editTopic.subCategory?.value === "LCUTE-1" ||
        editTopic.SubTopicID === "LCUTE-1"
      ) {
        setValue("amountOfCompensation", editTopic.amountOfCompensation ?? "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        trigger("amountOfCompensation");
      }
      // ──────────────── END LCUT SUBTOPICS PREFILL ────────────────

      // ──────────────── HIR SUBTOPICS PREFILL ────────────────
      // HIR-1: Housing Insurance Request
      if (
        editTopic.subCategory?.value === "HIR-1" ||
        editTopic.SubTopicID === "HIR-1"
      ) {
        setValue(
          "doesBylawsIncludeAddingAccommodations",
          editTopic.doesBylawsIncludeAddingAccommodations ?? false,
          { shouldValidate: true, shouldDirty: true }
        );
        setValue(
          "doesContractIncludeAddingAccommodations",
          editTopic.doesContractIncludeAddingAccommodations ?? false,
          { shouldValidate: true, shouldDirty: true }
        );
        setValue(
          "housingSpecificationInByLaws",
          editTopic.housingSpecificationInByLaws ?? "",
          { shouldValidate: true, shouldDirty: true }
        );
        setValue(
          "housingSpecificationsInContract",
          editTopic.housingSpecificationsInContract ?? "",
          { shouldValidate: true, shouldDirty: true }
        );
        setValue(
          "actualHousingSpecifications",
          editTopic.actualHousingSpecifications ?? "",
          { shouldValidate: true, shouldDirty: true }
        );
        trigger([
          "doesBylawsIncludeAddingAccommodations",
          "doesContractIncludeAddingAccommodations",
          "housingSpecificationInByLaws",
          "housingSpecificationsInContract",
          "actualHousingSpecifications",
        ]);
      }
      // ──────────────── END HIR SUBTOPICS PREFILL ────────────────

      // ──────────────── BR SUBTOPICS PREFILL ────────────────
      // BR-1: Bonus Request
      if (editTopic.subCategory?.value === "BR-1" || editTopic.SubTopicID === "BR-1") {
        const code =
          editTopic.AccordingToAgreement_Code ||
          editTopic.AccordingToAgreement ||
          editTopic.accordingToAgreement?.value;

        setValue(
          "accordingToAgreement",
          resolveOption(
            accordingToAgreementLookupData?.DataElements,
            code,
            editTopic.AccordingToAgreement
          ),
          { shouldValidate: true, shouldDirty: true }
        );

        setValue("bonusAmount", editTopic.bonusAmount ?? editTopic.Premium ?? "", { shouldValidate: true, shouldDirty: true });
        setValue("date_hijri", editTopic.date_hijri ?? editTopic.pyTempDate ?? "", { shouldValidate: true, shouldDirty: true });
        setValue("date_gregorian", editTopic.date_gregorian ?? editTopic.Date_New ?? "", { shouldValidate: true, shouldDirty: true });

        trigger(["accordingToAgreement", "bonusAmount", "date_hijri", "date_gregorian"]);
      }


      // ──────────────── END BR SUBTOPICS PREFILL ────────────────

      // ──────────────── BPSR SUBTOPICS PREFILL ────────────────
      // BPSR-1: Bonus and Profit Share Request (FIXED)
      if (
        editTopic.subCategory?.value === "BPSR-1" ||
        editTopic.SubTopicID === "BPSR-1"
      ) {
        const commissionCode =
          editTopic.CommissionType_Code ??
          editTopic.commissionType?.value ??
          editTopic.CommissionType;

        setValue(
          "commissionType",
          ensureOption(commissionTypeLookupData?.DataElements, commissionCode),
          { shouldValidate: true, shouldDirty: true }
        );

        const agrCode =
          editTopic.AccordingToAgreement_Code ??
          editTopic.accordingToAgreement?.value ??
          editTopic.AccordingToAgreement;

        setValue(
          "accordingToAgreement",
          ensureOption(accordingToAgreementLookupData?.DataElements, agrCode),
          { shouldValidate: true, shouldDirty: true }
        );

        setValue("amount", String(editTopic.Amount ?? editTopic.amount ?? ""), {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue("amountRatio", String(editTopic.AmountRatio ?? editTopic.amountRatio ?? ""), {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue(
          "from_date_hijri",
          editTopic.pyTempDate ?? editTopic.FromDateHijri ?? editTopic.from_date_hijri ?? "",
          { shouldValidate: true, shouldDirty: true }
        );
        setValue(
          "from_date_gregorian",
          editTopic.FromDate_New ?? editTopic.FromDateGregorian ?? editTopic.from_date_gregorian ?? "",
          { shouldValidate: true, shouldDirty: true }
        );
        setValue(
          "to_date_hijri",
          editTopic.Date_New ?? editTopic.ToDateHijri ?? editTopic.to_date_hijri ?? "",
          { shouldValidate: true, shouldDirty: true }
        );
        setValue(
          "to_date_gregorian",
          editTopic.ToDate_New ?? editTopic.ToDateGregorian ?? editTopic.to_date_gregorian ?? "",
          { shouldValidate: true, shouldDirty: true }
        );
        setValue("otherCommission", String(editTopic.OtherCommission ?? editTopic.otherCommission ?? ""), {
          shouldValidate: true,
          shouldDirty: true,
        });

        trigger([
          "commissionType",
          "accordingToAgreement",
          "amount",
          "amountRatio",
          "from_date_hijri",
          "from_date_gregorian",
          "to_date_hijri",
          "to_date_gregorian",
          "otherCommission",
        ]);
      }

      // ──────────────── END BPSR SUBTOPICS PREFILL ────────────────

      // ──────────────── DR SUBTOPICS PREFILL ────────────────
      // DR-1: Documents Requests
      if (
        editTopic.subCategory?.value === "DR-1" ||
        editTopic.SubTopicID === "DR-1"
      ) {
        setValue("documentType", editTopic.documentType ?? null, {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue("documentReason", editTopic.documentReason ?? "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        trigger(["documentType", "documentReason"]);
      }
      // ──────────────── END DR SUBTOPICS PREFILL ────────────────

      // ──────────────── RR SUBTOPICS PREFILL ────────────────
      // RR-1: Reward Request
      if (
        editTopic.subCategory?.value === "RR-1" ||
        editTopic.SubTopicID === "RR-1"
      ) {
        setValue("amount", editTopic.amount ?? "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue("rewardType", editTopic.rewardType ?? "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        trigger(["amount", "rewardType"]);
      }
      // ──────────────── END RR SUBTOPICS PREFILL ────────────────

      // ──────────────── JAR SUBTOPICS PREFILL ────────────────
      // JAR-2: Job Application Request (currentJobTitle, requiredJobTitle)
      if (
        editTopic.subCategory?.value === "JAR-2" ||
        editTopic.SubTopicID === "JAR-2"
      ) {
        setValue("currentJobTitle", editTopic.currentJobTitle ?? "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue("requiredJobTitle", editTopic.requiredJobTitle ?? "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        trigger(["currentJobTitle", "requiredJobTitle"]);
      }
      // JAR-3: Promotion Mechanism
      if (
        editTopic.subCategory?.value === "JAR-3" ||
        editTopic.SubTopicID === "JAR-3"
      ) {
        setValue(
          "doesTheInternalRegulationIncludePromotionMechanism",
          editTopic.doesTheInternalRegulationIncludePromotionMechanism ?? false,
          { shouldValidate: true, shouldDirty: true }
        );
        setValue(
          "doesContractIncludeAdditionalUpgrade",
          editTopic.doesContractIncludeAdditionalUpgrade ?? false,
          { shouldValidate: true, shouldDirty: true }
        );
        trigger([
          "doesTheInternalRegulationIncludePromotionMechanism",
          "doesContractIncludeAdditionalUpgrade",
        ]);
      }
      // JAR-4: Job Application Request (currentPosition, theWantedJob)
      if (
        editTopic.subCategory?.value === "JAR-4" ||
        editTopic.SubTopicID === "JAR-4"
      ) {
        setValue("currentPosition", editTopic.currentPosition ?? "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue("theWantedJob", editTopic.theWantedJob ?? "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        trigger(["currentPosition", "theWantedJob"]);
      }
      // ──────────────── END JAR SUBTOPICS PREFILL ────────────────

      // ──────────────── RFR SUBTOPICS PREFILL ────────────────
      // RFR-1: Lawsuit for refund request
      if (
        editTopic.subCategory?.value === "RFR-1" ||
        editTopic.SubTopicID === "RFR-1"
      ) {
        setValue("amount", editTopic.amount ?? "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue("consideration", editTopic.consideration ?? "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue("date_hijri", editTopic.date_hijri ?? "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue("date_gregorian", editTopic.date_gregorian ?? "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        trigger(["amount", "consideration", "date_hijri", "date_gregorian"]);
      }
      // ... existing code ...
    }
  }, [isEditing, editTopic, setValue, trigger, isOpen]);

  const { t: tCommon } = useTranslation("common");

  const [removeAttachment] = useRemoveAttachmentMutation();

  // Custom handler for AttachmentSection
  const handleRemoveAttachment = async (attachment: any, index: number) => {
    console.log("handleRemoveAttachment called", { attachment, index });
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

  // --- Ensure validation for CMR-1 autocomplete in edit mode ---
  useEffect(() => {
    if (
      isEditing &&
      editTopic &&
      (editTopic.subCategory?.value === "CMR-1" ||
        editTopic.SubTopicID === "CMR-1")
    ) {
      setValue("amountsPaidFor", editTopic.amountsPaidFor ?? null, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue("theAmountRequired", editTopic.theAmountRequired ?? "", {
        shouldValidate: true,
        shouldDirty: true,
      });
      trigger(["amountsPaidFor", "theAmountRequired"]);
    }
  }, [isEditing, editTopic, setValue, trigger]);

  // --- MIR-1 dynamic required fields fix (robust, watches form value) ---
  const typeOfRequestValueMIR = watch("typeOfRequest")?.value;
  useEffect(() => {
    // Only for MIR-1
    if (
      (subCategory?.value === "MIR-1" || editTopic?.SubTopicID === "MIR-1") &&
      typeOfRequestValueMIR !== undefined
    ) {
      // If the selected type REQUIRES the extra fields, trigger validation for them
      if (
        typeOfRequestValueMIR === "REQT1" ||
        typeOfRequestValueMIR === "REQT2" ||
        typeOfRequestValueMIR === "REQT3"
      ) {
        trigger([
          "requiredDegreeOfInsurance",
          "theReason",
          "currentInsuranceLevel",
        ]);
      } else {
        // If the selected type does NOT require the extra fields, clear/unregister them and trigger validation
        setValue("requiredDegreeOfInsurance", "");
        setValue("theReason", "");
        setValue("currentInsuranceLevel", "");
        if (unregister) {
          unregister("requiredDegreeOfInsurance");
          unregister("theReason");
          unregister("currentInsuranceLevel");
        }
        trigger([
          "requiredDegreeOfInsurance",
          "theReason",
          "currentInsuranceLevel",
        ]);
      }
    }
  }, [
    typeOfRequestValueMIR,
    subCategory?.value,
    editTopic?.SubTopicID,
    setValue,
    unregister,
    trigger,
  ]);

  // --- BPSR-1 dynamic required fields ---
  const commissionTypeOpt = watch("commissionType");
  useEffect(() => {
    if (
      (subCategory?.value === "BPSR-1" || editTopic?.SubTopicID === "BPSR-1") &&
      commissionTypeOpt !== undefined
    ) {
      if (isOtherCommission(commissionTypeOpt)) {
        trigger("otherCommission");
      } else {
        setValue("otherCommission", "");
        unregister?.("otherCommission");
        trigger("otherCommission");
      }
    }
  }, [commissionTypeOpt, subCategory?.value, editTopic?.SubTopicID, setValue, unregister, trigger]);


  // Add after handleTopicSelect and related hooks
  useEffect(() => {
    if (
      isEditing &&
      editTopic &&
      travelingWayData?.DataElements &&
      editTopic.TravelingWay
    ) {
      const found = travelingWayData.DataElements.find(
        (item: any) => item.ElementKey === editTopic.TravelingWay
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
          )}
        </div>
      </StepNavigation>
    </Suspense>
  );
}

export default EditHearingTopicsDetails;
