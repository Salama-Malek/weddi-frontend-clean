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
import { setFormData } from "@/redux/slices/formSlice";
import StepNavigation from "@/shared/modules/case-creation/components/StepNavigation";
import { useNavigationService } from "@/shared/hooks/useNavigationService";
import { steps } from "@/shared/modules/case-creation/components/tabs/tabsConfig";
import { useSaveHearingTopicsMutation } from "../../api/create-case/apis";
import { useCookieState } from "../../hooks/useCookieState";
import { TableSkeletonLoader } from "@/shared/components/loader/SkeletonLoader";
import { Topic, TopicFormValues } from "./hearing.topics.types";
import { getHearingTopicsColumns } from "./config/colums";
import { useAttachments } from "./hooks/useAttachments";
import { useFormLayout as useFormLayoutEstablishment } from "./config/forms.layout.establishment";
import { useFormLayout as useFormLayoutWorker } from "./config/forms.layout.worker";
import { getPayloadBySubTopicID } from "./api/establishment.add.case.payload";
import {
  useGetCaseDetailsQuery,
  useLazyGetCaseDetailsQuery,
} from "@/features/manage-hearings/api/myCasesApis";
import { TokenClaims } from "@/features/login/components/AuthProvider";
import { toast } from "react-toastify";
import useCaseTopicsPrefill from "./hooks/useCaseTopicsPrefill";
import { useGetRegionLookupDataQuery } from "@/features/initiate-hearing/api/create-case/workDetailApis";
import { Option } from "@/shared/components/form/form.types";
import { FormProvider as RHFFormProvider } from "react-hook-form";
import { useApiErrorHandler } from "@/shared/hooks/useApiErrorHandler";
import { SUPPRESSED_ERROR_CODES } from '@/shared/lib/api/errorHandler';
import FeaturedIcon from '@/assets/Featured icon.svg';

interface ApiResponse {
  ServiceStatus: string;
  SuccessCode: string;
  CaseNumber?: string;
  S2Cservicelink?: string;
  ErrorDescription?: string;
  ErrorCodeList: Array<{ ErrorCode: string; ErrorDesc: string }>;
}

const Modal = lazy(() => import("@/shared/components/modal/Modal"));
const ReusableTable = lazy(() =>
  import("@/shared/components/table/ReusableTable").then((module) => ({
    default: module.ReusableTable,
  }))
);
const DynamicForm = lazy(() =>
  import("@/shared/components/form/DynamicForm").then((module) => ({
    default: module.DynamicForm,
  }))
);
const HearingCta = lazy(() => import("./components/HearingCta"));

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

function HearingTopicsDetails({ showFooter }: { showFooter: boolean }) {
  const methods = useForm<any>({
    defaultValues: {
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
    },
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

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  const [getCookie] = useCookieState();
  const [caseId] = useState(getCookie("caseId"));
  const [lastSaved, setLastSaved] = useState(false);
  const { updateParams, currentStep, currentTab } = useNavigationService();
  const [saveHearingTopics, { isLoading: addHearingLoading }] =
    useSaveHearingTopicsMutation();
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language.toUpperCase();
  const userClaims = getCookie("userClaims");
  const [caseTopics, setCaseTopics] = useState<any[]>([]);
  const UserClaims: TokenClaims = getCookie("userClaims");
  const userType = getCookie("userType");
  const defendantStatus = getCookie("defendantStatus");
  const mainCategory2 = getCookie("mainCategory")?.value;
  const subCategory2 = getCookie("subCategory")?.value;
  const userID = getCookie("userClaims")?.UserID;
  const fileNumber = getCookie("userClaims")?.File_Number;

  const [triggerCaseDetailsQuery, { data: caseDetailsData }] =
    useLazyGetCaseDetailsQuery();

  // Use the centralized error handler
  const { handleResponse, createError } = useApiErrorHandler();

  useEffect(() => {
    if (caseId) {
      const userConfigs: any = {
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

      const queryParams = {
        ...userConfigs[userType],
        CaseID: caseId,
        AcceptedLanguage: currentLanguage,
        SourceSystem: "E-Services",
      };
      
      triggerCaseDetailsQuery(queryParams);
    }
  }, [caseId, userType, userID, fileNumber, mainCategory2, subCategory2, currentLanguage, triggerCaseDetailsQuery]);

  useEffect(() => {
    if (caseDetailsData?.CaseDetails) {
      if (caseTopics.length === 0) {
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
            date_hijri: topic.Date_New,
            from_date_hijri: topic.FromDateHijri,
            to_date_hijri: topic.ToDateHijri,
            amount: topic.Amount,
            wagesAmount: topic.WagesAmount,
            bonusAmount: topic.BonusAmount,
            payDue: topic.PayDue,
            durationOfLeaveDue: topic.DurationOfLeaveDue,
            theReason: topic.TheReason,
            currentPosition: topic.CurrentPosition,
            // doesBylawsIncludeAddingAccommodations:
            //   topic.IsBylawsIncludeAddingAccommodiation === "Yes",
            // doesContractIncludeAddingAccommodations:
            //   topic.IsContractIncludeAddingAccommodiation === "Yes",
            // housingSpecificationInByLaws:
            //   topic.HousingSpecificationsInBylaws || "",
            // housingSpecificationsInContract:
            //   topic.HousingSpecificationsInContract || "",
            // actualHousingSpecifications: topic.HousingSpecifications || "",

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
            typeOfRequest:
              topic.RequestType || topic.RequestType_Code
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
          })
        );

        setCaseTopics(formattedTopics);

        if (caseDetailsData.CaseDetails.OtherAttachments?.length > 0) {
          const formattedAttachments =
            caseDetailsData.CaseDetails.OtherAttachments.map(
              (attachment: any) => ({
                fileKey: attachment.FileKey,
                fileType: attachment.FileType,
                fileName: attachment.FileName,
              })
            );
          setAttachments(formattedAttachments);
        }
      }
    }
  }, [caseDetailsData, caseTopics.length]);

  const onSubmit = async (data: TopicFormValues) => {
    await handleNext();
  };

  const mainCategory = watch("mainCategory") ?? null;
  const subCategory: any = watch("subCategory") ?? null;
  const { t } = useTranslation("hearingtopics");
  const [hasModalOpened, setHasModalOpened] = useState(false);
  const { isOpen, close, toggle } = useToggle();

  // Track first modal open
  useEffect(() => {
    if (isOpen && !hasModalOpened) {
      setHasModalOpened(true);
    }
  }, [isOpen, hasModalOpened]);

  useEffect(() => {
    if (watch("subCategory")?.value && mainCategory?.value) {
      setShowLegalSection(true);
      setShowTopicData(false);
    }
  }, [watch("subCategory")?.value, mainCategory?.value]);

  const lookup = useLookup();
  const {
    data: mainCategoryData,
    isFetching,
    isLoading,
  } = lookup.mainCategory(hasModalOpened); // Only fetch on first modal open
  // Removed duplicate subCategory call - using useSubTopicsSubLookupQuery instead

  const { data: amountPaidData } = lookup.amountPaidCategory(
    watch("subCategory")?.value
  );


  const { data: travelingWayData } = lookup.travelingWayCategory(
    watch("subCategory")?.value
  );
  const { data: leaveTypeData } = lookup.leaveTypeCategory(
    watch("subCategory")?.value
  );
  const { data: forAllowanceData } = lookup.forAllowance(
    watch("subCategory")?.value
  );
  const { data: typeOfRequestLookupData } = lookup.typeOfRequest(
    watch("subCategory")?.value
  );
  const { data: commissionTypeLookupData } = lookup.commissionType(
    watch("subCategory")?.value
  );
  const { data: accordingToAgreementLookupData } = lookup.accordingToAgreement(
    watch("subCategory")?.value
  );
  const { data: typesOfPenaltiesData } = lookup.typesOfPenalties(
    watch("subCategory")?.value
  );

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
    useSubTopicsSubLookupQuery(
      subTopicsLookupParams,
      {
        skip: !mainCategory?.value || !caseDetailsData?.CaseDetails,
      }
    );

  const matchedSubCategory = subCategoryData?.DataElements?.find(
    (item: any) => item.ElementKey === watch("subCategory")?.value
  );
  const [delTopic, setDelTopic] = useState<any | null>(null);

  const [editTopic, setEditTopic] = useState<any | null>(null);
  const [editTopicIndex, setEditTopicIndex] = useState<number | null>(null);
  const [showLegalSection, setShowLegalSection] = useState(false);
  const [showTopicData, setShowTopicData] = useState(false);
  const acknowledged = watch("acknowledged");
  const fromPlace = watch("fromPlace") ?? null;
  const toPlace = watch("toPlace") ?? null;
  const hijriDate = watch("hijriDate");
  const gregorianDate = watch("gregorianDate");
  const decisionNumber = watch("decisionNumber");
  const totalAmount = watch("totalAmount");
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

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isProcessingError, setIsProcessingError] = useState(false);

  const handleTopicSelect = (topic: any, index: number) => {
    reset();

    setEditTopic(topic);
    setEditTopicIndex(index);

    setShowLegalSection(true);
    setShowTopicData(true);

    toggle();
  };

  const columns: any = useMemo(
    () =>
      getHearingTopicsColumns({
        t,
        onEdit: (topic, index) => {
          handleTopicSelect(topic, index);
        },
        onDel: (topic, index) => {
          setDelTopic({ topic, index });
          setShowDeleteConfirm(true);
        },
      }),
    [t, toggle, setEditTopic, setCaseTopics]
  );

  const goToLegalStep = () => {
    if (!mainCategory || !subCategory) return;
    setShowLegalSection(true);
    setShowTopicData(false);
  };

  const goToTopicDataStep = () => {
    if (!acknowledged) return;
    setShowTopicData(true);
  };

  const handleSend = () => {
    const result = saveTopic();
    if (result === 1) {
      reset();
      setDate({ hijri: null, gregorian: null, dateObject: null });
      setShowLegalSection(false);
      setShowTopicData(false);
      setEditTopic(null);
      setEditTopicIndex(null);
      close();
    }
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
      editTopic.CaseTopicName ||
      editTopic.mainCategory?.label;
    const subCategoryValue =
      updatedValues.subCategory?.value ||
      editTopic.SubTopicID ||
      editTopic.subCategory?.value;
    const subCategoryLabel =
      updatedValues.subCategory?.label ||
      editTopic.SubTopicName ||
      editTopic.subCategory?.label;

    const formatDateForStorage = (date: string) => {
      if (!date) return "";
      return date.replace(/\//g, "");
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
      ToDateHijri: formatDateForStorage(updatedValues.to_date_hijri),
      ToDateGregorian: formatDateForStorage(updatedValues.to_date_gregorian),
    };


    setCaseTopics((prev) =>
      prev.map((topic, idx) => (idx === editTopicIndex ? updatedTopic : topic))
    );

    toast.success(
      t("topic_updated_successfully") || "Topic updated successfully"
    );

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
    setEditTopicIndex(null);
    close();
  };

  const handleSave = () => {
    if (!mainCategory || !subCategory) {
      goToLegalStep();
    } else if (!showTopicData) {
      goToTopicDataStep();
    }
  };

  const [lastAction, setLastAction] = useState<"Save" | "Next" | undefined>(
    undefined
  );

  const handleSaveApi = async (): Promise<ApiResponse> => {
    if (caseTopics.length) {
      try {
        setLastAction("Save");
        const response = await saveHearingTopics(
          getPayloadBySubTopicID(
            caseTopics,
            watch("subCategory"),
            "Save",
            caseId
          )
        ).unwrap();

        setLastSaved(true);

        // Use centralized error handling
        const isSuccessful = handleResponse(response);

        if (isSuccessful) {
          return response as ApiResponse;
        } else {
          // Errors have already been handled by the error handler
          return {
            ServiceStatus: "Error",
            SuccessCode: "500",
            ErrorCodeList: [
              {
                ErrorCode: "API_ERROR",
                ErrorDesc: t("error_saving_topics") || "Error saving topics",
              },
            ],
          };
        }
      } catch (error: any) {
        setLastAction(undefined);
        const errorCode = error?.data?.ErrorCodeList?.[0]?.ErrorCode || "API_ERROR";
        const errorMessage =
          error?.data?.ErrorCodeList?.[0]?.ErrorDesc ||
          error?.message ||
          t("error_saving_topics") ||
          "Error saving topics";
        if (!SUPPRESSED_ERROR_CODES.includes(errorCode)) {
          toast.error(errorMessage);
        }
        return {
          ServiceStatus: "Error",
          SuccessCode: "500",
          ErrorCodeList: [
            {
              ErrorCode: errorCode,
              ErrorDesc: errorMessage,
            },
          ],
        };
      }
    } else {
      const noTopicsMessage = t("no_topics_to_save") || "No topics to save.";
      toast.error(noTopicsMessage);
      return {
        ServiceStatus: "Error",
        SuccessCode: "400",
        ErrorCodeList: [
          {
            ErrorCode: "NO_TOPICS_TO_SAVE",
            ErrorDesc: noTopicsMessage,
          },
        ],
      };
    }
  };

  const handleNext = async () => {
    const latestFormValues = getValues();
    setFormData(latestFormValues);

    try {
      setLastAction("Next");
      const payload = getPayloadBySubTopicID(
        caseTopics,
        watch("subCategory"),
        "Next",
        caseId
      );

      const response = await saveHearingTopics(payload).unwrap();

      updateParams(
        currentStep === 0 && currentTab < [0, 1, 2].length - 1
          ? currentStep
          : Math.min(currentStep + 1, steps.length - 1),
        currentStep === 0 && currentTab < [0, 1, 2].length - 1
          ? currentTab + 1
          : undefined
      );
      setLastSaved(false);
    } catch (error) {
      setLastAction(undefined);
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

    if (
      !newTopic.mainCategory?.value ||
      !newTopic.subCategory?.value ||
      !newTopic.acknowledged
    ) {
      toast.error(
        t("required_fields_error") ||
          "Please fill in all required fields (Main Category, Sub Category, and Acknowledgement)."
      );
      return 0;
    }

    // const isDuplicate = caseTopics.some(
    //   (topic) =>
    //     topic.SubTopicID === newTopic.subCategory.value &&
    //     topic.MainTopicID === newTopic.mainCategory.value
    // );

    // if (isDuplicate) {
    //   toast.error(
    //     t("duplicate_topic_error") ||
    //       "This topic is already added. Please choose a different topic."
    //   );
    //   return 0;
    // }



    const formatDateForStorage = (date: string) => {
      if (!date) return "";
      return date.replace(/\//g, "");
    };

    const topicToSave = {
      ...newTopic,
      MainTopicID: newTopic.mainCategory.value,
      SubTopicID: newTopic.subCategory.value,
      MainSectionHeader: newTopic.mainCategory.label,
      CaseTopicName: newTopic.mainCategory.label,
      SubTopicName: newTopic?.subCategory.label,
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
      TypesOfPenalties: newTopic.typesOfPenalties?.value || "",
      TypesOfPenaltiesLabel: newTopic.typesOfPenalties?.label || "",
      RequestType: newTopic.typeOfRequest?.value || "",
      RequestTypeLabel: newTopic.typeOfRequest?.label || "",
      LoanAmount: newTopic.loanAmount,
      ManagerialDecisionNumber: newTopic.managerialDecisionNumber,
      ManagerialDecisionDateHijri: formatDateForStorage(
        newTopic.managerial_decision_date_hijri
      ),
      ManagerialDecisionDateGregorian: formatDateForStorage(
        newTopic.managerial_decision_date_gregorian
      ),
      kindOfHoliday:
        newTopic.kindOfHoliday?.value || editTopic?.kindOfHoliday?.label,
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
    };

    setCaseTopics((prev) => [...prev, topicToSave]);

    toast.success(t("topic_added_successfully") || "Topic added successfully");

    return 1;
  };

  const isStep3 = showTopicData;
  const isStep2 = showLegalSection;
  const isEditing = Boolean(editTopic);

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

  const formLayout =
    userType === "Worker" || userType === "Embassy User"
      ? useFormLayoutWorker({
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
          handleAdd: goToLegalStep,
          handleAcknowledgeChange: (val: boolean) => {
            setValue("acknowledged", val);
            if (val) {
              setShowTopicData(true);
            }
          },
          handleAddTopic,
          handleSend: handleSend,
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
        })
      : useFormLayoutEstablishment({
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
          handleAdd: goToLegalStep,
          handleAcknowledgeChange: (val: boolean) => {
            setValue("acknowledged", val);
            if (val) {
              setShowTopicData(true);
            }
          },
          handleAddTopic,
          handleSend: handleSend,
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
        });

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

  useEffect(() => {
    if (editTopic && isOpen) {
      setShowLegalSection(true);
      setShowTopicData(true);
    }
  }, [isOpen]);

  useEffect(() => {
    const bylawsValue = watch("doesBylawsIncludeAddingAccommodations");
    const contractValue = watch("doesContractIncludeAddingAccommodations");

    if (bylawsValue === true) {
      setValue("doesContractIncludeAddingAccommodations", false);
      setValue("housingSpecificationsInContract", "");
    } else if (contractValue === true) {
      setValue("doesBylawsIncludeAddingAccommodations", false);
      setValue("housingSpecificationInByLaws", "");
    }
  }, [
    watch("doesBylawsIncludeAddingAccommodations"),
    watch("doesContractIncludeAddingAccommodations"),
    setValue,
  ]);

  const { data: regionData, isFetching: isRegionLoading } =
    useGetRegionLookupDataQuery({
      AcceptedLanguage: currentLanguage,
      context: "default",
    });

  useEffect(() => {
    if (editTopic && isOpen && watch("subCategory")?.value) {
      const setDropdownValues = () => {
        if (forAllowanceData?.DataElements && editTopic.ForAllowance) {
          const forAllowanceOption = forAllowanceData.DataElements.find(
            (item: any) => item.ElementKey === editTopic.ForAllowance
          );
          if (forAllowanceOption) {
            setValue(
              "forAllowance",
              {
                value: forAllowanceOption.ElementKey,
                label: forAllowanceOption.ElementValue,
              },
              { shouldValidate: true }
            );
          }
        }
        if (
          commissionTypeLookupData?.DataElements &&
          editTopic.CommissionType
        ) {
          const commissionTypeOption =
            commissionTypeLookupData.DataElements.find(
              (item: any) => item.ElementKey === editTopic.CommissionType
            );
          if (commissionTypeOption) {
            setValue(
              "commissionType",
              {
                value: commissionTypeOption.ElementKey,
                label: commissionTypeOption.ElementValue,
              },
              { shouldValidate: true }
            );
          }
        }

        if (
          accordingToAgreementLookupData?.DataElements &&
          editTopic.AccordingToAgreement
        ) {
          const accordingToAgreementOption =
            accordingToAgreementLookupData.DataElements.find(
              (item: any) => item.ElementKey === editTopic.AccordingToAgreement
            );
          if (accordingToAgreementOption) {
            setValue(
              "accordingToAgreement",
              {
                value: accordingToAgreementOption.ElementKey,
                label: accordingToAgreementOption.ElementValue,
              },
              { shouldValidate: true }
            );
          }
        }

        if (travelingWayData?.DataElements && editTopic.TravelingWay) {
          const travelingWayOption = travelingWayData.DataElements.find(
            (item: any) => item.ElementKey === editTopic.TravelingWay
          );
          if (travelingWayOption) {
            setValue(
              "travelingWay",
              {
                value: travelingWayOption.ElementKey,
                label: travelingWayOption.ElementValue,
              },
              { shouldValidate: true }
            );
          }
        }

        if (typeOfRequestLookupData?.DataElements && editTopic.TypeOfRequest) {
          const typeOfRequestOption = typeOfRequestLookupData.DataElements.find(
            (item: any) => item.ElementKey === editTopic.TypeOfRequest
          );
          if (typeOfRequestOption) {
            setValue(
              "typeOfRequest",
              {
                value: typeOfRequestOption.ElementKey,
                label: typeOfRequestOption.ElementValue,
              },
              { shouldValidate: true }
            );
          }
        }

        if (
          typesOfPenaltiesData?.DataElements &&
          (editTopic.PenalityType || editTopic.TypesOfPenalties)
        ) {
          const penaltyTypeValue =
            editTopic.PenalityType || editTopic.TypesOfPenalties;
          const penaltyTypeCode = editTopic.PenalityType_Code;

          let typesOfPenaltiesOption = null;
          if (penaltyTypeCode) {
            typesOfPenaltiesOption = typesOfPenaltiesData.DataElements.find(
              (item: any) => item.ElementKey === penaltyTypeCode
            );
          }

          if (!typesOfPenaltiesOption) {
            typesOfPenaltiesOption = typesOfPenaltiesData.DataElements.find(
              (item: any) => item.ElementKey === penaltyTypeValue
            );
          }

          if (typesOfPenaltiesOption) {
            setValue(
              "typesOfPenalties",
              {
                value: typesOfPenaltiesOption.ElementKey,
                label: typesOfPenaltiesOption.ElementValue,
              },
              { shouldValidate: true }
            );
          }
        }

        if (regionData?.DataElements) {
          if (editTopic.FromLocation) {
            const fromLocationOption = regionData.DataElements.find(
              (item: any) => item.ElementKey === editTopic.FromLocation
            );
            if (fromLocationOption) {
              setValue(
                "fromLocation",
                {
                  value: fromLocationOption.ElementKey,
                  label: fromLocationOption.ElementValue,
                },
                { shouldValidate: true }
              );
            }
          }

          if (editTopic.ToLocation) {
            const toLocationOption = regionData.DataElements.find(
              (item: any) => item.ElementKey === editTopic.ToLocation
            );
            if (toLocationOption) {
              setValue(
                "toLocation",
                {
                  value: toLocationOption.ElementKey,
                  label: toLocationOption.ElementValue,
                },
                { shouldValidate: true }
              );
            }
          }
        }
      };
      setTimeout(setDropdownValues, 200);
    }
  }, [
    editTopic,
    isOpen,
    watch("subCategory")?.value,
    forAllowanceData,
    commissionTypeLookupData,
    accordingToAgreementLookupData,
    travelingWayData,
    typeOfRequestLookupData,
    typesOfPenaltiesData,
    regionData,
    setValue,
  ]);

  useCaseTopicsPrefill({
    setValue,
    trigger,
    caseTopics,
    isEditing,
    editTopic,
  });

  useEffect(() => {
    if (isEditing && editTopic && isOpen) {
      if (editTopic.date_hijri) {
        setDate({
          hijri: editTopic.date_hijri,
          gregorian: editTopic.gregorianDate,
          dateObject: null,
        });
      }

      setShowLegalSection(true);
      setShowTopicData(true);
    }
  }, [
    isEditing,
    editTopic,
    isOpen,
    setDate,
    setShowLegalSection,
    setShowTopicData,
  ]);

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
  }, [isEditing, editTopic, typeOfRequestLookupData, setValue]);

  // Add new state for error message
  // --- MOJ Contract Error UI and Handlers Disabled ---
  // To re-enable, uncomment the following blocks as needed.
  // Commenting out error state and UI rendering:
  // const [mojContractError, setMojContractError] = useState<string | null>(null);
  // const [lastErrorSubCategory, setLastErrorSubCategory] = useState<string | null>(null);
  // Simplified MOJ contract validation
  // --- MOJ Contract Error Validation Disabled ---
  // To re-enable, uncomment the following useEffect block.
  /*
  useEffect(() => {
    // Only run validation for Worker or Embassy User with Establishment defendant
    if (
      (userType === "Worker" ||
        (userType === "Embassy User" && defendantStatus === "Establishment")) &&
      subCategory?.value &&
      mainCategory?.value === "WR" &&
      (subCategory.value === "WR-1" || subCategory.value === "WR-2")
    ) {
      const mojSubtopic = matchedSubCategory;
      const mojContractExists = mojSubtopic?.MojContractExist === "true";
      const errorMessage = mojSubtopic?.MojContractExistError;

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
      } else if (mojContractExists === false || !errorMessage) {
        // If this subcategory doesn't have an error, clear any existing error
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
    setValue,
  ]);
  */
  // --- END MOJ Contract Error Validation Disabled ---

  // Clear error when main category changes away from WR
  // useEffect(() => {
  //   if (mainCategory?.value !== "WR" && mojContractError) {
  //     if (timeoutRef.current) {
  //       clearTimeout(timeoutRef.current);
  //     }
  //     setMojContractError(null);
  //     setLastErrorSubCategory(null);
  //   }
  // }, [mainCategory?.value, mojContractError]);

  // // Clear error when user selects a different subcategory and allow new validation
  // useEffect(() => {
  //   if (
  //     mojContractError &&
  //     subCategory?.value &&
  //     subCategory.value !== lastErrorSubCategory &&
  //     mainCategory?.value === "WR"
  //   ) {
  //     // Clear the previous error
  //     if (timeoutRef.current) {
  //       clearTimeout(timeoutRef.current);
  //     }
  //     setMojContractError(null);
  //     setLastErrorSubCategory(null);
      
  //     // The validation effect will run again for the new subcategory
  //     // because we cleared the error and the subcategory changed
  //   }
  // }, [subCategory?.value, mojContractError, lastErrorSubCategory, mainCategory?.value]);



  const { t: tCommon } = useTranslation('common');

  return (
    <Suspense fallback={<TableLoader />}>
      <StepNavigation<FormData>
        onSubmit={handleSubmit(onSubmit)}
        isValid={isValid && caseTopics.length > 0}
        isFirstStep={currentStep === 0 && currentTab === 0}
        isLastStep={currentStep === 3 - 1}
        currentStep={currentStep}
        goToNextStep={handleNext}
        goToPrevStep={handlePrevious}
        resetSteps={() => updateParams(0, 0)}
        handleSave={handleSaveApi}
        canProceed={!!caseTopics.length}
        isButtonDisabled={(direction: "prev" | "next") =>
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
                <div className="mx-4 sm:mx-6 md:mx-8">
                  <p className="text-primary-600 font-semibold text-base sm:text-lg md:text-xl leading-6 font-primary mb-4 sm:mb-6 md:mb-8">
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
                    className="mb-4 sm:mb-6 md:mb-8"
                  >
                    <Add01Icon size={20} /> {t("add_topic") || "Add Topic"}
                  </Button>
                  <div className="border-b border-gray-300 mb-4 sm:mb-6 md:mb-8" />
                </div>
                <Suspense fallback={<TableSkeletonLoader />}>
                  <div className="overflow-x-auto">
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
                  </div>
                </Suspense>
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
                    {formLayout && (
                      <DynamicForm
                        formLayout={formLayout}
                        register={register}
                        errors={errors}
                        setValue={setValue}
                        control={control}
                        watch={watch}
                      />
                    )}
                  </Suspense>
                  <div className="flex w-full justify-between mt-4 sm:mt-6">
                    <Button
                      variant="secondary"
                      typeVariant="outline"
                      size="sm"
                      type="button"
                      onClick={handleCancel}
                      className="text-sm sm:text-base font-medium"
                    >
                      {t("cancel") || "Cancel"}
                    </Button>
                    <Button
                      variant={isValid ? "primary" : "disabled"}
                      typeVariant={isValid ? "brand" : "freeze"}
                      size="sm"
                      type="button"
                      onClick={() => {
                        if (isEditing) {
                          handleUpdate();
                        } else if (isStep3) {
                          handleSend();
                        } else if (isStep2 && acknowledged) {
                          handleSave();
                        }
                      }}
                      className="text-sm sm:text-base font-medium"
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
          <FilePreviewModal file={previewFile} onClose={closePreview} />
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
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  {t("no") || "No"}
                </Button>
                <Button
                  variant="primary"
                  type="button"
                  onClick={() => {
                    setCaseTopics((prev) => prev.filter((_, i) => i !== delTopic?.index));
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

export default HearingTopicsDetails;
