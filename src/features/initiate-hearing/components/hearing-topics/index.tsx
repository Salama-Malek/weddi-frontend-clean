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
  useValidateMojContractMutation,
} from "../../api/create-case/apis";
import { useCookieState } from "../../hooks/useCookieState";
import { TableSkeletonLoader } from "@/shared/components/loader/SkeletonLoader";
import { TopicFormValues } from "./hearing.topics.types";
import { getHearingTopicsColumns } from "./config/colums";
import { useAttachments } from "./hooks/useAttachments";
import { useFormLayout as useFormLayoutWorker } from "./config/forms.layout.worker";
import { useFormLayout as useFormLayoutEstablishment } from "./config/forms.layout.establishment";
import { getPayloadBySubTopicID } from "./api/case.topics.payload";
import { useLazyGetCaseDetailsQuery } from "@/features/manage-hearings/api/myCasesApis";
import { toast } from "react-toastify";
import { ApiResponse } from "@/shared/modules/case-creation/components/StepNavigation";
import useCaseTopicsPrefill from "./hooks/useCaseTopicsPrefill";
import { useGetRegionLookupDataQuery } from "@/features/initiate-hearing/api/create-case/workDetailApis";
import { Option } from "@/shared/components/form/form.types";

import FeaturedIcon from "@/assets/Featured icon.svg";
import { useRemoveAttachmentMutation } from "./api/apis";
import { isOtherCommission } from "./utils/isOtherCommission";
import { isOtherAllowance } from "./utils/isOtherAllowance";
import { useSubTopicPrefill } from "./hooks/useSubTopicPrefill";
import { ensureFileNameWithExtension } from "@/shared/lib/utils/fileUtils";

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

const DateValidationWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {

  return <>{children}</>;
};

function resolveOption(
  list: { ElementKey: string; ElementValue: string }[] | undefined,
  code?: string,
  fallbackLabel?: string
) {
  if (!code) return null;
  const hit = list?.find((i) => String(i.ElementKey) === String(code));
  return { value: code, label: hit ? hit.ElementValue : fallbackLabel ?? code };
}

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

function HearingTopicsDetails({
  showFooter,
  onSaveApi,
}: {
  showFooter: boolean;
  onSaveApi?: (payload: any) => Promise<any>;
}) {
  const methods = useForm<any>({
    mode: "onChange",
    reValidateMode: "onChange",
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
      isSubmitting,
    },
    unregister,

  } = methods;

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prefillDoneRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const [getCookie] = useCookieState({ caseId: "" });
  const [caseId, setCaseId] = useState(getCookie("caseId"));

  useEffect(() => {
    const currentCookieCaseId = getCookie("caseId");
    if (currentCookieCaseId !== caseId) {
      setCaseId(currentCookieCaseId);
    }
  }, [getCookie, caseId]);
  const { updateParams, currentStep, currentTab } = useNavigationService();
  const [saveHearingTopics, { isLoading: addHearingLoading }] =
    useSaveHearingTopicsMutation();
  const userType = getCookie("userType");
  const mainCategory2 = getCookie("mainCategory")?.value;
  const subCategory2 = getCookie("subCategory")?.value;
  const userID = getCookie("userClaims")?.UserID;
  const fileNumber = getCookie("userClaims")?.File_Number;

  const { i18n } = useTranslation();
  const currentLanguage = i18n.language.toUpperCase();


  const onSubmit = async (_data: TopicFormValues) => {
    if (lastAction === "Next" || isSubmitting) {
      return;
    }
    await handleNext();
  };

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
  const [mojContractError, setMojContractError] = useState<string | null>(null);
  const [lastErrorSubCategory, setLastErrorSubCategory] = useState<
    string | null
  >(null);

  const isEditing = Boolean(editTopic);
  const isHIR1 = editTopic?.subCategory?.value === "HIR-1";
  const lockAccommodationSource = isEditing && isHIR1;

  useEffect(() => {
    if (isEditing) return;

    if (subCategory?.value && mainCategory?.value) {
      goToLegalStep();
    }
  }, [subCategory?.value, mainCategory?.value, isEditing]);

  useEffect(() => {
    if (isEditing) return;

    const currentSubCategory = subCategory?.value;
    if (!currentSubCategory) return;

    const subcategoryFields: Record<string, string[]> = {
      "CMR-8": [
        "CMR8_wagesAmount",
        "CMR8_fromDateHijri",
        "CMR8_fromDateGregorian",
        "CMR8_toDateHijri",
        "CMR8_toDateGregorian",
      ],
      "BR-1": [
        "BR1_accordingToAgreement",
        "BR1_bonusAmount",
        "BR1_dateHijri",
        "BR1_dateGregorian",
      ],
      "BPSR-1": [
        "BPSR1_commissionType",
        "BPSR1_accordingToAgreement",
        "BPSR1_bonusProfitShareAmount",
        "BPSR1_amountRatio",
        "BPSR1_otherCommission",
        "BPSR1_fromDateHijri",
        "BPSR1_fromDateGregorian",
        "BPSR1_toDateHijri",
        "BPSR1_toDateGregorian",
      ],
      "DR-1": [],
      "JAR-3": [
        "JAR3_JobApplicationRequest",
        "JAR3_promotionMechanism",
        "JAR3_additionalUpgrade",
      ],
      "JAR-4": ["JAR4_CurrentPosition", "JAR4_WantedJob"],
      "RFR-1": [
        "RFR1_Amount",
        "RFR1_Consideration",
        "RFR1_dateHijri",
        "RFR1_dateGregorian",
      ],
      "LRESR-1": ["LRESR1_Amount"],

      "RUF-1": [
        "RUF1_refundType",
        "RUF1_refundAmount",
        "RefundType",
        "refundAmount",
      ],
      "WR-1": ["WR1_forAllowance", "WR1_otherAllowance"],
      "WR-2": ["WR2_wageAmount"],
      "CMR-1": ["CMR1_amountsPaidFor", "CMR1_theAmountRequired"],
      "CMR-3": [
        "CMR3_compensationAmount",
        "CMR3_injuryDateHijri",
        "CMR3_injuryDateGregorian",
        "CMR3_injuryType",
      ],
      "CMR-4": ["CMR4_compensationAmount"],
      "CMR-5": [
        "CMR5_kindOfHoliday",
        "CMR5_totalAmount",
        "CMR5_workingHours",
        "CMR5_additionalDetails",
      ],
      "CMR-6": [
        "CMR6_newPayAmount",
        "CMR6_payIncreaseType",
        "CMR6_wageDifference",
        "CMR6_fromDateHijri",
        "CMR6_fromDateGregorian",
        "CMR6_toDateHijri",
        "CMR6_toDateGregorian",
      ],
      "CMR-7": [
        "CMR7_durationOfLeaveDue",
        "CMR7_payDue",
        "CMR7_fromDateHijri",
        "CMR7_fromDateGregorian",
        "CMR7_toDateHijri",
        "CMR7_toDateGregorian",
      ],
      "EDO-1": [
        "EDO1_fromLocation",
        "EDO1_toLocation",
        "EDO1_managerialDecisionDateHijri",
        "EDO1_managerialDecisionDateGregorian",
        "EDO1_managerialDecisionNumber",
      ],
      "EDO-2": [
        "EDO2_fromJob",
        "EDO2_toJob",
        "EDO2_managerialDecisionDateHijri",
        "EDO2_managerialDecisionDateGregorian",
        "EDO2_managerialDecisionNumber",
      ],
      "EDO-3": [
        "EDO3_amountOfReduction",
        "EDO3_managerialDecisionDateHijri",
        "EDO3_managerialDecisionDateGregorian",
        "EDO3_managerialDecisionNumber",
      ],
      "EDO-4": [
        "EDO4_typesOfPenalties",
        "EDO4_managerialDecisionDateHijri",
        "EDO4_managerialDecisionDateGregorian",
        "EDO4_managerialDecisionNumber",
      ],
      "LCUT-1": ["LCUT1_amountOfCompensation"],
      "TTR-1": ["TTR1_travelingWay"],
      "RR-1": ["RR1_Amount", "RR1_Type"],
      "JAR-2": ["JAR2_currentJobTitle", "JAR2_requiredJobTitle"],

      "RLRAHI-1": [
        "RLRAHI1_typeOfRequest",
        "RLRAHI1_typeOfCustody",
        "RLRAHI1_loanAmount",
        "RLRAHI1_request_date_hijri",
        "RLRAHI1_request_date_gregorian",
        "typeOfRequest",
        "typeOfCustody",
        "request_date_hijri",
        "request_date_gregorian",
      ],

      "CR-1": ["CR1_compensationAmount"],
      "LCUTE-1": ["LCUTE1_amountOfCompensation"],
      "DPVR-1": ["DPVR1_damagedType", "DPVR1_damagedValue"],
      "MIR-1": ["MIR1_typeOfRequest"],
      "HIR-1": [
        "HIR1_AccommodationSource",
        "HIR1_IsBylawsIncludeAddingAccommodation",
        "HIR1_IsContractIncludeAddingAccommodation",
        "HIR1_HousingSpecificationsInContract",
        "HIR1_HousingSpecificationsInBylaws",
        "HIR1_HousingSpecifications",
      ],
    };

    const allPossibleFields = new Set<string>();
    Object.values(subcategoryFields).forEach((fields) => {
      fields.forEach((field) => allPossibleFields.add(field));
    });

    const currentFields = subcategoryFields[currentSubCategory] || [];

    allPossibleFields.forEach((field) => {
      if (!currentFields.includes(field)) {
        unregister(field);
      }
    });
  }, [subCategory?.value, isEditing, unregister]);

  const [triggerCaseDetailsQuery, { data: caseDetailsData }] =
    useLazyGetCaseDetailsQuery();

  const defendantStatus = (caseDetailsData as any)?.CaseDetails?.DefendantType_Code;

  useEffect(() => {
    if (caseDetailsData?.CaseDetails?.CaseTopics) {
      const formattedTopics = caseDetailsData.CaseDetails.CaseTopics.map((topic: any) => ({
        ...topic,
        mainCategory: { value: topic.MainTopicID, label: topic.CaseTopicName },
        subCategory: { value: topic.SubTopicID, label: topic.SubTopicName },
      }));

      setCaseTopics(formattedTopics);
    }
  }, [caseDetailsData?.CaseDetails?.CaseTopics]);

  useEffect(() => {
    if (caseDetailsData?.CaseDetails?.OtherAttachments) {
      const formattedAttachments = caseDetailsData.CaseDetails.OtherAttachments.map(
        (attachment: any) => ({
          fileKey: attachment.FileKey,
          fileType: attachment.FileType,
          fileName: ensureFileNameWithExtension(
            attachment.FileName,
            attachment.FileType
          ),
        })
      );

      setAttachments(formattedAttachments);
    } else {
      setAttachments([]);
    }
  }, [caseDetailsData?.CaseDetails?.OtherAttachments]);

  const lookup = useLookup();
  const {
    data: mainCategoryData,
    isFetching,
    isLoading,
  } = lookup.mainCategory(isOpen);

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

  const typeOfCustodyData = undefined;

  const PayIncreaseTypeOptions = useMemo<Option[]>(
    () =>
      payIncreaseTypeData?.DataElements?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || [],
    [payIncreaseTypeData]
  );

  const toOption = (list: any[] | undefined, code?: string) => {
    if (!code) return null;
    const hit = list?.find((i) => String(i.ElementKey) === String(code));
    return hit
      ? { value: String(hit.ElementKey), label: hit.ElementValue }
      : { value: String(code), label: String(code) };
  };

  useEffect(() => {
    const code =
      getValues("accordingToAgreement")?.value ||
      editTopic?.AccordingToAgreement_Code ||
      editTopic?.AccordingToAgreement ||
      editTopic?.accordingToAgreement?.value;

    if (!code) return;

    const list = accordingToAgreementLookupData?.DataElements;
    if (!list) return;

    const curr = getValues("accordingToAgreement");
    if (curr?.label && curr.label !== curr.value) return;

    setValue("accordingToAgreement", toOption(list, code), {
      shouldDirty: false,
      shouldValidate: false,
    });
  }, [
    accordingToAgreementLookupData?.DataElements,
    editTopic,
    getValues,
    setValue,
  ]);

  const { data: regionData } =
    useGetRegionLookupDataQuery({
      AcceptedLanguage: currentLanguage,
      context: "worker",
    });

  const subTopicsLookupParams = useMemo(() => {
    const base: any = {
      LookupType: "CaseElements",
      ModuleKey: mainCategory?.value,
      ModuleName: "SubTopics",
      SourceSystem: "E-Services",
      AcceptedLanguage: currentLanguage,
    };
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
  const [topicData, _setTopicData] = useState<any>(null);
  const [legalSection, _setLegalSection] = useState<any>(null);



  useEffect(() => {
    if (!caseId) return;

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
  ]);

  const topicsLoadedRef = useRef(false);

  useEffect(() => {
    if ((caseDetailsData as any)?.CaseDetails && !topicsLoadedRef.current) {
      const formattedTopics = (
        caseDetailsData as any
      ).CaseDetails.CaseTopics.map((topic: any) => ({
        ...topic,

        mainCategory: { value: topic.MainTopicID, label: topic.CaseTopicName },
        subCategory: { value: topic.SubTopicID, label: topic.SubTopicName },

        date_hijri: topic.Date_New || "",
        from_date_hijri: topic.FromDateHijri || "",
        to_date_hijri: topic.ToDateHijri || "",
        managerial_decision_date_hijri: topic.ManDecsDate || "",

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

        fromJob: topic.FromJob || "",
        toJob: topic.ToJob || "",
        requiredJobTitle: topic.RequiredJobTitle || "",
        currentJobTitle: topic.CurrentJobTitle || "",
        theWantedJob: topic.TheWantedJob || "",

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

        ...(topic.SubTopicID === "HIR-1"
          ? {
            IsBylawsIncludeAddingAccommodation:
              topic.IsBylawsIncludeAddingAccommodation ??
              topic.IsBylawsIncludeAddingAccommodiation,
            IsContractIncludeAddingAccommodation:
              topic.IsContractIncludeAddingAccommodation ??
              topic.IsContractIncludeAddingAccommodiation,
            HousingSpecificationsInContract:
              topic.HousingSpecificationsInContract ?? "",
            HousingSpecificationsInBylaws:
              topic.HousingSpecificationsInBylaws ?? "",
            HousingSpecifications: topic.HousingSpecifications ?? "",
          }
          : {}),
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

        ...(topic.SubTopicID === "JAR-3"
          ? {
            doesTheInternalRegulationIncludePromotionMechanism:
              topic.PromotionMechanism === "Yes",
            doesContractIncludeAdditionalUpgrade:
              topic.AdditionalUpgrade === "Yes",
          }
          : {}),

        ...(topic.SubTopicID === "BPSR-1"
          ? {
            from_date_hijri: topic.pyTempDate || "",
            from_date_gregorian: topic.FromDate_New || "",
            to_date_hijri: topic.Date_New || "",
            to_date_gregorian: topic.ToDate_New || "",
          }
          : {}),

        ...(topic.SubTopicID === "RFR-1" && {
          RFR1_Amount: topic.Amount ?? "",
          RFR1_Consideration: topic.Consideration ?? "",
          RFR1_dateHijri: topic.pyTempDate ?? "",
          RFR1_dateGregorian: topic.Date_New ?? "",

          amount: topic.Amount ?? "",
          consideration: topic.Consideration ?? "",
          date_hijri: topic.pyTempDate ?? "",
          date_gregorian: topic.Date_New ?? "",
        }),

        ...(topic.SubTopicID === "EDO-3"
          ? {
            amountOfReduction: topic.AmountOfReduction || "",
            managerial_decision_date_hijri: topic.pyTempDate || "",
            managerial_decision_date_gregorian:
              topic.ManagerialDecisionDate_New || "",
            managerialDecisionNumber: topic.ManagerialDecisionNumber || "",
          }
          : {}),

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

        ...(topic.SubTopicID === "EDO-2" && {
          fromJob: topic.FromJob || "",
          toJob: topic.ToJob || "",
          managerial_decision_date_hijri: topic.Date_New || "",
          managerial_decision_date_gregorian: topic.ManDecsDate || "",
          managerialDecisionNumber: topic.ManagerialDecisionNumber || "",
        }),

        ...(topic.SubTopicID === "EDO-3" && {
          amountOfReduction: topic.AmountOfReduction || "",
          managerial_decision_date_hijri: topic.pyTempDate || "",
          managerial_decision_date_gregorian:
            topic.ManagerialDecisionDate_New || "",
          managerialDecisionNumber: topic.ManagerialDecisionNumber || "",
        }),

        ...(topic.SubTopicID === "EDO-4" && {
          typesOfPenalties: topic.PenalityType_Code
            ? { value: topic.PenalityType_Code, label: topic.PenalityType }
            : null,
          managerial_decision_date_hijri: topic.Date_New || "",
          managerial_decision_date_gregorian: topic.ManDecsDate || "",
          managerialDecisionNumber: topic.ManagerialDecisionNumber || "",
        }),

        ...(topic.SubTopicID === "WR-1"
          ? {
            WR1_wageAmount:
              topic.Amount || topic.wageAmount || topic.amount || "",
            WR1_forAllowance: topic.ForAllowance_Code
              ? { value: topic.ForAllowance_Code, label: topic.ForAllowance }
              : null,
            WR1_otherAllowance: topic.OtherAllowance || "",
            WR1_fromDateHijri: topic.pyTempDate || "",
            WR1_fromDateGregorian: topic.FromDate_New || "",
            WR1_toDateHijri: topic.Date_New || "",
            WR1_toDateGregorian: topic.ToDate_New || "",

            wageAmount:
              topic.Amount || topic.wageAmount || topic.amount || "",
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

        ...(topic.SubTopicID === "WR-2"
          ? {
            WR2_wageAmount: topic.OverdueWagesAmount || topic.Amount || "",
            WR2_fromDateHijri: topic.pyTempDate || "",
            WR2_fromDateGregorian: topic.FromDate_New || "",
            WR2_toDateHijri: topic.Date_New || "",
            WR2_toDateGregorian: topic.ToDate_New || "",

            amount: topic.OverdueWagesAmount || topic.Amount || "",
            from_date_hijri: topic.pyTempDate || "",
            from_date_gregorian: topic.FromDate_New || "",
            to_date_hijri: topic.Date_New || "",
            to_date_gregorian: topic.ToDate_New || "",
          }
          : {}),

        ...(topic.SubTopicID === "HIR-1" &&
          (topic.HIR1_AccommodationSource ||
            topic.HIR1_HousingSpecificationsInContract ||
            topic.HIR1_HousingSpecificationsInBylaws ||
            topic.HIR1_HousingSpecifications)
          ? {
            IsBylawsIncludeAddingAccommodation:
              topic.HIR1_AccommodationSource === "bylaws" ? "Yes" : "No",
            IsContractIncludeAddingAccommodation:
              topic.HIR1_AccommodationSource === "contract" ? "Yes" : "No",
            HousingSpecificationsInContract:
              topic.HIR1_HousingSpecificationsInContract || "",
            HousingSpecificationsInBylaws:
              topic.HIR1_HousingSpecificationsInBylaws || "",
            HousingSpecifications: topic.HIR1_HousingSpecifications || "",
          }
          : {}),

        ...(topic.SubTopicID === "MIR-1"
          ? {
            MIR1_typeOfRequest: topic.RequestType_Code
              ? { value: topic.RequestType_Code, label: topic.RequestType }
              : null,
            MIR1_requiredDegreeOfInsurance:
              topic.RequiredDegreeInsurance || "",
            MIR1_theReason: topic.Reason || "",
            MIR1_currentInsuranceLevel: topic.CurrentInsuranceLevel || "",

            typeOfRequest: topic.RequestType_Code
              ? { value: topic.RequestType_Code, label: topic.RequestType }
              : null,
            requiredDegreeOfInsurance: topic.RequiredDegreeInsurance || "",
            theReason: topic.Reason || "",
            currentInsuranceLevel: topic.CurrentInsuranceLevel || "",
          }
          : {}),

        ...(topic.SubTopicID === "TTR-1"
          ? {
            TTR1_travelingWay: topic.TravelingWay_Code
              ? {
                value: topic.TravelingWay_Code,
                label: topic.TravelingWay || topic.TravelingWay_Code,
              }
              : null,

            travelingWay: topic.TravelingWay_Code
              ? {
                value: topic.TravelingWay_Code,
                label: topic.TravelingWay || topic.TravelingWay_Code,
              }
              : null,
          }
          : {}),

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

        ...(topic.SubTopicID === "CMR-3" && {
          compensationAmount: topic.Amount ? String(topic.Amount) : "",
          injury_date_hijri: topic.pyTempText || "",
          injury_date_gregorian: topic.InjuryDate_New || "",
          injuryType: topic.TypeOfWorkInjury || "",
        }),

        ...(topic.SubTopicID === "CMR-4" && {
          CMR4_compensationAmount: topic.Amount ? String(topic.Amount) : "",

          amount: topic.Amount ? String(topic.Amount) : "",
        }),

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

        ...(topic.SubTopicID === "CMR-6" && {
          CMR6_newPayAmount: topic.NewPayAmount
            ? String(topic.NewPayAmount)
            : "",
          CMR6_payIncreaseType: topic.PayIncreaseType_Code
            ? {
              value: topic.PayIncreaseType_Code,
              label: topic.PayIncreaseType,
            }
            : null,
          CMR6_wageDifference: topic.WageDifference
            ? String(topic.WageDifference)
            : "",
          CMR6_fromDateHijri: topic.pyTempDate || "",
          CMR6_fromDateGregorian: topic.FromDate_New || "",
          CMR6_toDateHijri: topic.Date_New || "",
          CMR6_toDateGregorian: topic.ToDate_New || "",

          from_date_hijri: topic.pyTempDate || "",
          from_date_gregorian: topic.FromDate_New || "",
          to_date_hijri: topic.Date_New || "",
          to_date_gregorian: topic.ToDate_New || "",
          newPayAmount: topic.NewPayAmount ? String(topic.NewPayAmount) : "",
          payIncreaseType: topic.PayIncreaseType_Code
            ? {
              value: topic.PayIncreaseType_Code,
              label: topic.PayIncreaseType,
            }
            : null,
          wageDifference: topic.WageDifference
            ? String(topic.WageDifference)
            : "",
        }),

        ...(topic.SubTopicID === "CMR-7" && {
          CMR7_durationOfLeaveDue: topic.DurationOfLeaveDue
            ? String(topic.DurationOfLeaveDue)
            : "",
          CMR7_payDue: topic.PayDue ? String(topic.PayDue) : "",
          CMR7_fromDateHijri: topic.pyTempDate || "",
          CMR7_fromDateGregorian: topic.FromDate_New || "",
          CMR7_toDateHijri: topic.Date_New || "",
          CMR7_toDateGregorian: topic.ToDate_New || "",

          pyTempDate: topic.pyTempDate || "",
          toDate_gregorian: topic.ToDate_New || "",
          date_hijri: topic.Date_New || "",
          fromDate_gregorian: topic.FromDate_New || "",
          durationOfLeaveDue: topic.DurationOfLeaveDue
            ? String(topic.DurationOfLeaveDue)
            : "",
          payDue: topic.PayDue ? String(topic.PayDue) : "",
        }),

        ...(topic.SubTopicID === "CMR-8" && {
          CMR8_wagesAmount: topic.WagesAmount ? String(topic.WagesAmount) : "",
          CMR8_fromDateHijri: topic.pyTempDate || "",
          CMR8_fromDateGregorian: topic.FromDate_New || "",
          CMR8_toDateHijri: topic.Date_New || "",
          CMR8_toDateGregorian: topic.ToDate_New || "",

          pyTempDate: topic.pyTempDate || "",
          toDate_gregorian: topic.ToDate_New || "",
          date_hijri: topic.Date_New || "",
          fromDate_gregorian: topic.FromDate_New || "",
          wagesAmount: topic.WagesAmount ? String(topic.WagesAmount) : "",
        }),

        ...(topic.SubTopicID === "BR-1" &&
          (() => {
            const code =
              topic.AccordingToAgreement_Code || topic.AccordingToAgreement;
            const accOpt = resolveOption(
              accordingToAgreementLookupData?.DataElements,
              code,
              topic.AccordingToAgreement
            );
            const bonus = topic.Premium ?? topic.BonusAmount ?? "";
            const hijri = topic.pyTempDate || "";
            const greg = topic.Date_New || "";
            return {
              BR1_accordingToAgreement: accOpt,
              BR1_bonusAmount: bonus,
              BR1_dateHijri: hijri,
              BR1_dateGregorian: greg,

              accordingToAgreement: accOpt,
              bonusAmount: bonus,
              date_hijri: hijri,
              date_gregorian: greg,
            };
          })()),

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
          from_date_hijri:
            topic.pyTempDate ??
            topic.FromDateHijri ??
            topic.from_date_hijri ??
            "",
          from_date_gregorian:
            topic.FromDate_New ??
            topic.FromDateGregorian ??
            topic.from_date_gregorian ??
            "",
          to_date_hijri:
            topic.Date_New ?? topic.ToDateHijri ?? topic.to_date_hijri ?? "",
          to_date_gregorian:
            topic.ToDate_New ??
            topic.ToDateGregorian ??
            topic.to_date_gregorian ??
            "",
          otherCommission: String(
            topic.OtherCommission ?? topic.otherCommission ?? ""
          ),
        }),

        ...(topic.SubTopicID === "DR-1" && {
          documentType: topic.documentType || null,
          documentReason: topic.documentReason || "",
        }),

        ...(topic.SubTopicID === "RR-1" && {
          RR1_Amount: topic.Amount || topic.amount || "",
          RR1_Type: topic.Type || topic.rewardType || "",

          amount: topic.Amount || topic.amount || "",
          rewardType: topic.Type || topic.rewardType || "",
        }),

        ...(topic.SubTopicID === "JAR-2" && {
          currentJobTitle: topic.CurrentJobTitle || topic.currentJobTitle || "",
          requiredJobTitle:
            topic.RequiredJobTitle || topic.requiredJobTitle || "",
        }),

        ...(topic.SubTopicID === "JAR-3"
          ? {
            JAR3_promotionMechanism:
              topic.PromotionMechanism || topic.promotionMechanism || "",
            JAR3_additionalUpgrade:
              topic.AdditionalUpgrade || topic.additionalUpgrade || "",

            promotionMechanism:
              topic.promotionMechanism || topic.PromotionMechanism || "",
            additionalUpgrade:
              topic.additionalUpgrade || topic.AdditionalUpgrade || "",
          }
          : {}),

        ...(topic.SubTopicID === "JAR-4" && {
          currentPosition: topic.CurrentPosition || topic.currentPosition || "",
          theWantedJob:
            topic.TheWantedJob || topic.theWantedJob || topic.WantedJob || "",
        }),

        ...(topic.SubTopicID === "RUF-1" && {
          RefundType: topic.RefundType || topic.refundType || "",
          refundAmount: topic.Amount || topic.amount || "",
        }),

        ...(topic.SubTopicID === "LRESR-1" && {
          LRESR1_Amount: topic.Amount || topic.amount || "",

          endOfServiceRewardAmount: topic.Amount || topic.amount || "",
        }),

        ...(topic.SubTopicID === "LRESR-2" && {
          endOfServiceRewardAmount: topic.Amount || topic.amount || "",
          consideration: topic.Consideration || topic.consideration || "",
        }),

        ...(topic.SubTopicID === "LRESR-3" && {
          endOfServiceRewardAmount: topic.Amount || topic.amount || "",
          rewardType: topic.RewardType || topic.rewardType || "",
        }),

        ...(topic.SubTopicID === "LCUT-1" && {
          LCUT1_amountOfCompensation:
            topic.AmountOfCompensation || topic.amountOfCompensation || "",

          amountOfCompensation:
            topic.AmountOfCompensation || topic.amountOfCompensation || "",
        }),
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
              fileName: ensureFileNameWithExtension(
                attachment.FileName,
                attachment.FileType
              ),
            })
          );

        setAttachments(formattedAttachments);
      }
    }
  }, [caseDetailsData]);

  const matchedSubCategory = subCategoryData?.DataElements?.find(
    (item: any) => item.ElementKey === subCategory?.value
  );

  const acknowledged = watch("acknowledged");
  const fromLocation = watch("fromLocation") ?? null;
  const toLocation = watch("toLocation") ?? null;

  const decisionNumber = watch("decisionNumber");
  const regulatoryText = t("regulatory_text_content");
  const { setDate } = useDateContext();

  useEffect(() => {
    const subscription = watch((_, info) => {
      try {
        const changedField = info?.name as string | undefined;
        changedField
          ? getValues(changedField as any)
          : undefined;
      } catch { }
    });
    return () => subscription.unsubscribe();
  }, [watch, getValues, formState]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  const getPaginatedTopics = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    return caseTopics.slice(start, end);
  }, [caseTopics, pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    const maxPageIndex = Math.max(
      0,
      Math.ceil(caseTopics.length / pagination.pageSize) - 1
    );
    if (pagination.pageIndex > maxPageIndex && maxPageIndex >= 0) {
      setPagination((prev) => ({
        ...prev,
        pageIndex: maxPageIndex,
      }));
    }
  }, [caseTopics, pagination.pageSize, pagination.pageIndex]);

  const handleTopicSelect = (topic: any, index: number) => {
    reset();

    prefillDoneRef.current = null;

    const mainCategoryOpt =
      typeof topic.mainCategory === "string"
        ? { value: topic.mainCategory, label: topic.mainCategory }
        : topic.mainCategory ?? {
          value: topic.MainTopicID,
          label: topic.CaseTopicName,
        };
    setValue("mainCategory", mainCategoryOpt);

    const subCategoryOpt =
      typeof topic.subCategory === "string"
        ? { value: topic.subCategory, label: topic.subCategory }
        : topic.subCategory ?? {
          value: topic.SubTopicID,
          label: topic.SubTopicName,
        };
    setValue("subCategory", subCategoryOpt);

    setEditTopic({ ...topic, index });
    setEditTopicIndex(index);

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
        currentPageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      }),
    [t, toggle, caseTopics, pagination.pageIndex, pagination.pageSize]
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
    saveTopic();

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
    } else {
    }
  };

  const handleUpdate = () => {
    if (!editTopic) return;

    const updatedValues = getValues();

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

      Object.assign(updatedTopic, {
        ForAllowance: WR1_forAllowance?.label ?? "",
        ForAllowance_Code: WR1_forAllowance?.value ?? "",
        WR1_forAllowance: WR1_forAllowance ?? null,
        OtherAllowance: WR1_otherAllowance ?? "",
        WR1_otherAllowance: WR1_otherAllowance ?? "",
        Amount: WR1_wageAmount ?? "",
        pyTempDate: formatDateForStorage(WR1_fromDateHijri),
        FromDate_New: formatDateForStorage(WR1_fromDateGregorian),
        Date_New: formatDateForStorage(WR1_toDateHijri),
        ToDate_New: formatDateForStorage(WR1_toDateGregorian),

        forAllowance: WR1_forAllowance ?? null,
        otherAllowance: WR1_otherAllowance ?? "",
        wageAmount: WR1_wageAmount ?? "",
        from_date_hijri: WR1_fromDateHijri ?? "",
        from_date_gregorian: WR1_fromDateGregorian ?? "",
        to_date_hijri: WR1_toDateHijri ?? "",
        to_date_gregorian: WR1_toDateGregorian ?? "",
      });
    } else if (subCategoryValue === "WR-2") {
      const {
        WR2_wageAmount,
        WR2_fromDateHijri,
        WR2_fromDateGregorian,
        WR2_toDateHijri,
        WR2_toDateGregorian,
      } = updatedValues;

      Object.assign(updatedTopic, {
        Amount: WR2_wageAmount ?? "",
        WR2_wageAmount: WR2_wageAmount ?? "",
        pyTempDate: formatDateForStorage(WR2_fromDateHijri),
        FromDate_New: formatDateForStorage(WR2_fromDateGregorian),
        Date_New: formatDateForStorage(WR2_toDateHijri),
        ToDate_New: formatDateForStorage(WR2_toDateGregorian),

        wageAmount: WR2_wageAmount ?? "",
        from_date_hijri: WR2_fromDateHijri ?? "",
        from_date_gregorian: WR2_fromDateGregorian ?? "",
        to_date_hijri: WR2_toDateHijri ?? "",
        to_date_gregorian: WR2_toDateGregorian ?? "",
      });
    } else if (subCategoryValue === "BPSR-1") {
      const {
        BPSR1_commissionType,
        BPSR1_accordingToAgreement,
        BPSR1_bonusProfitShareAmount,
        BPSR1_amountRatio,
        BPSR1_fromDateHijri,
        BPSR1_fromDateGregorian,
        BPSR1_toDateHijri,
        BPSR1_toDateGregorian,
        BPSR1_otherCommission,
      } = updatedValues;

      Object.assign(updatedTopic, {
        CommissionType:
          BPSR1_commissionType?.label ?? editTopic?.CommissionType ?? "",
        CommissionType_Code:
          BPSR1_commissionType?.value ?? editTopic?.CommissionType_Code ?? "",
        commissionType:
          BPSR1_commissionType ?? editTopic?.commissionType ?? null,
        AccordingToAgreement:
          BPSR1_accordingToAgreement?.label ??
          editTopic?.AccordingToAgreement ??
          "",
        AccordingToAgreement_Code:
          BPSR1_accordingToAgreement?.value ??
          editTopic?.AccordingToAgreement_Code ??
          "",
        accordingToAgreement:
          BPSR1_accordingToAgreement ?? editTopic?.accordingToAgreement ?? null,
        Amount: BPSR1_bonusProfitShareAmount ?? editTopic?.Amount ?? "",
        bonusProfitShareAmount:
          BPSR1_bonusProfitShareAmount ??
          editTopic?.bonusProfitShareAmount ??
          "",
        AmountRatio: BPSR1_amountRatio ?? editTopic?.AmountRatio ?? "",
        amountRatio: BPSR1_amountRatio ?? editTopic?.amountRatio ?? "",
        pyTempDate:
          formatDateForStorage(BPSR1_fromDateHijri) ||
          editTopic?.pyTempDate ||
          "",
        FromDate_New:
          formatDateForStorage(BPSR1_fromDateGregorian) ||
          editTopic?.FromDate_New ||
          "",
        Date_New:
          formatDateForStorage(BPSR1_toDateHijri) || editTopic?.Date_New || "",
        ToDate_New:
          formatDateForStorage(BPSR1_toDateGregorian) ||
          editTopic?.ToDate_New ||
          "",
        OtherCommission:
          BPSR1_otherCommission ?? editTopic?.OtherCommission ?? "",
        otherCommission:
          BPSR1_otherCommission ?? editTopic?.otherCommission ?? "",

        BPSR1_commissionType:
          BPSR1_commissionType ?? editTopic?.BPSR1_commissionType ?? null,
        BPSR1_accordingToAgreement:
          BPSR1_accordingToAgreement ??
          editTopic?.BPSR1_accordingToAgreement ??
          null,
        BPSR1_bonusProfitShareAmount:
          BPSR1_bonusProfitShareAmount ??
          editTopic?.BPSR1_bonusProfitShareAmount ??
          "",
        BPSR1_amountRatio:
          BPSR1_amountRatio ?? editTopic?.BPSR1_amountRatio ?? "",
        BPSR1_fromDateHijri:
          BPSR1_fromDateHijri ?? editTopic?.BPSR1_fromDateHijri ?? "",
        BPSR1_fromDateGregorian:
          BPSR1_fromDateGregorian ?? editTopic?.BPSR1_fromDateGregorian ?? "",
        BPSR1_toDateHijri:
          BPSR1_toDateHijri ?? editTopic?.BPSR1_toDateHijri ?? "",
        BPSR1_toDateGregorian:
          BPSR1_toDateGregorian ?? editTopic?.BPSR1_toDateGregorian ?? "",
        BPSR1_otherCommission:
          BPSR1_otherCommission ?? editTopic?.BPSR1_otherCommission ?? "",

        from_date_hijri:
          BPSR1_fromDateHijri ?? editTopic?.from_date_hijri ?? "",
        from_date_gregorian:
          BPSR1_fromDateGregorian ?? editTopic?.from_date_gregorian ?? "",
        to_date_hijri: BPSR1_toDateHijri ?? editTopic?.to_date_hijri ?? "",
        to_date_gregorian:
          BPSR1_toDateGregorian ?? editTopic?.to_date_gregorian ?? "",
      });
    } else if (subCategoryValue === "MIR-1") {
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

        typeOfRequest: MIR1_typeOfRequest,
        requiredDegreeOfInsurance: MIR1_requiredDegreeOfInsurance ?? "",
        theReason: MIR1_theReason ?? "",
        currentInsuranceLevel: MIR1_currentInsuranceLevel ?? "",
      });
    } else if (subCategoryValue === "CMR-1") {
      const { CMR1_amountsPaidFor, CMR1_theAmountRequired } = updatedValues;

      Object.assign(updatedTopic, {
        AmountsPaidFor:
          CMR1_amountsPaidFor?.label ?? editTopic?.AmountsPaidFor ?? "",
        AmountsPaidFor_Code:
          CMR1_amountsPaidFor?.value ?? editTopic?.AmountsPaidFor_Code ?? "",
        AmountRequired:
          CMR1_theAmountRequired ?? editTopic?.AmountRequired ?? "",

        CMR1_amountsPaidFor:
          CMR1_amountsPaidFor ?? editTopic?.CMR1_amountsPaidFor ?? null,
        CMR1_theAmountRequired:
          CMR1_theAmountRequired ?? editTopic?.CMR1_theAmountRequired ?? "",

        amountsPaidFor:
          CMR1_amountsPaidFor ?? editTopic?.amountsPaidFor ?? null,
        theAmountRequired:
          CMR1_theAmountRequired ?? editTopic?.theAmountRequired ?? "",
      });
    } else if (subCategoryValue === "CMR-3") {
      const {
        CMR3_compensationAmount,
        CMR3_injuryDateHijri,
        CMR3_injuryDateGregorian,
        CMR3_injuryType,
      } = updatedValues;

      Object.assign(updatedTopic, {
        Amount: CMR3_compensationAmount ?? editTopic?.Amount ?? "",
        InjuryDateHijri:
          formatDateForStorage(CMR3_injuryDateHijri) ||
          editTopic?.InjuryDateHijri ||
          "",
        InjuryDateGregorian:
          formatDateForStorage(CMR3_injuryDateGregorian) ||
          editTopic?.InjuryDateGregorian ||
          "",
        TypeOfWorkInjury: CMR3_injuryType ?? editTopic?.TypeOfWorkInjury ?? "",

        CMR3_compensationAmount:
          CMR3_compensationAmount ?? editTopic?.CMR3_compensationAmount ?? "",
        CMR3_injuryDateHijri:
          CMR3_injuryDateHijri ?? editTopic?.CMR3_injuryDateHijri ?? "",
        CMR3_injuryDateGregorian:
          CMR3_injuryDateGregorian ?? editTopic?.CMR3_injuryDateGregorian ?? "",
        CMR3_injuryType: CMR3_injuryType ?? editTopic?.CMR3_injuryType ?? "",

        compensationAmount:
          CMR3_compensationAmount ?? editTopic?.compensationAmount ?? "",
        injury_date_hijri:
          CMR3_injuryDateHijri ?? editTopic?.injury_date_hijri ?? "",
        injury_date_gregorian:
          CMR3_injuryDateGregorian ?? editTopic?.injury_date_gregorian ?? "",
        injuryType: CMR3_injuryType ?? editTopic?.injuryType ?? "",
      });
    } else if (subCategoryValue === "CMR-4") {
      const { CMR4_compensationAmount } = updatedValues;

      Object.assign(updatedTopic, {
        Amount: CMR4_compensationAmount ?? editTopic?.Amount ?? "",

        CMR4_compensationAmount:
          CMR4_compensationAmount ?? editTopic?.CMR4_compensationAmount ?? "",

        noticeCompensationAmount:
          CMR4_compensationAmount ?? editTopic?.noticeCompensationAmount ?? "",
      });
    } else if (subCategoryValue === "CMR-5") {
      const {
        CMR5_kindOfHoliday,
        CMR5_totalAmount,
        CMR5_workingHours,
        CMR5_additionalDetails,
      } = updatedValues;

      Object.assign(updatedTopic, {
        KindOfHoliday:
          CMR5_kindOfHoliday?.label ?? editTopic?.KindOfHoliday ?? "",
        KindOfHoliday_Code:
          CMR5_kindOfHoliday?.value ?? editTopic?.KindOfHoliday_Code ?? "",
        TotalAmount: CMR5_totalAmount ?? editTopic?.TotalAmount ?? "",
        WorkingHours: CMR5_workingHours ?? editTopic?.WorkingHours ?? "",
        AdditionalDetails:
          CMR5_additionalDetails ?? editTopic?.AdditionalDetails ?? "",

        CMR5_kindOfHoliday:
          CMR5_kindOfHoliday ?? editTopic?.CMR5_kindOfHoliday ?? null,
        CMR5_totalAmount: CMR5_totalAmount ?? editTopic?.CMR5_totalAmount ?? "",
        CMR5_workingHours:
          CMR5_workingHours ?? editTopic?.CMR5_workingHours ?? "",
        CMR5_additionalDetails:
          CMR5_additionalDetails ?? editTopic?.CMR5_additionalDetails ?? "",

        kindOfHoliday: CMR5_kindOfHoliday ?? editTopic?.kindOfHoliday ?? null,
        totalAmount: CMR5_totalAmount ?? editTopic?.totalAmount ?? "",
        workingHours: CMR5_workingHours ?? editTopic?.workingHours ?? "",
        additionalDetails:
          CMR5_additionalDetails ?? editTopic?.additionalDetails ?? "",
      });
    } else if (subCategoryValue === "CMR-6") {
      const {
        CMR6_newPayAmount,
        CMR6_payIncreaseType,
        CMR6_fromDateHijri,
        CMR6_fromDateGregorian,
        CMR6_toDateHijri,
        CMR6_toDateGregorian,
        CMR6_wageDifference,
      } = updatedValues;

      Object.assign(updatedTopic, {
        NewPayAmount: CMR6_newPayAmount ?? editTopic?.NewPayAmount ?? "",
        PayIncreaseType:
          CMR6_payIncreaseType?.label ?? editTopic?.PayIncreaseType ?? "",
        PayIncreaseType_Code:
          CMR6_payIncreaseType?.value ?? editTopic?.PayIncreaseType_Code ?? "",
        FromDateHijri:
          formatDateForStorage(CMR6_fromDateHijri) ||
          editTopic?.FromDateHijri ||
          "",
        FromDateGregorian:
          formatDateForStorage(CMR6_fromDateGregorian) ||
          editTopic?.FromDateGregorian ||
          "",
        ToDateHijri:
          formatDateForStorage(CMR6_toDateHijri) ||
          editTopic?.ToDateHijri ||
          "",
        ToDateGregorian:
          formatDateForStorage(CMR6_toDateGregorian) ||
          editTopic?.ToDateGregorian ||
          "",
        WageDifference: CMR6_wageDifference ?? editTopic?.WageDifference ?? "",

        CMR6_newPayAmount:
          CMR6_newPayAmount ?? editTopic?.CMR6_newPayAmount ?? "",
        CMR6_payIncreaseType:
          CMR6_payIncreaseType ?? editTopic?.CMR6_payIncreaseType ?? null,
        CMR6_fromDateHijri:
          CMR6_fromDateHijri ?? editTopic?.CMR6_fromDateHijri ?? "",
        CMR6_fromDateGregorian:
          CMR6_fromDateGregorian ?? editTopic?.CMR6_fromDateGregorian ?? "",
        CMR6_toDateHijri: CMR6_toDateHijri ?? editTopic?.CMR6_toDateHijri ?? "",
        CMR6_toDateGregorian:
          CMR6_toDateGregorian ?? editTopic?.CMR6_toDateGregorian ?? "",
        CMR6_wageDifference:
          CMR6_wageDifference ?? editTopic?.CMR6_wageDifference ?? "",

        newPayAmount: CMR6_newPayAmount ?? editTopic?.newPayAmount ?? "",
        payIncreaseType:
          CMR6_payIncreaseType ?? editTopic?.payIncreaseType ?? null,
        from_date_hijri: CMR6_fromDateHijri ?? editTopic?.from_date_hijri ?? "",
        from_date_gregorian:
          CMR6_fromDateGregorian ?? editTopic?.from_date_gregorian ?? "",
        to_date_hijri: CMR6_toDateHijri ?? editTopic?.to_date_hijri ?? "",
        to_date_gregorian:
          CMR6_toDateGregorian ?? editTopic?.to_date_gregorian ?? "",
        wageDifference: CMR6_wageDifference ?? editTopic?.wageDifference ?? "",
      });
    } else if (subCategoryValue === "CMR-7") {
      const {
        CMR7_fromDateHijri,
        CMR7_fromDateGregorian,
        CMR7_toDateHijri,
        CMR7_toDateGregorian,
        CMR7_durationOfLeaveDue,
        CMR7_payDue,
      } = updatedValues;

      Object.assign(updatedTopic, {
        FromDateHijri:
          formatDateForStorage(CMR7_fromDateHijri) ||
          editTopic?.FromDateHijri ||
          "",
        FromDateGregorian:
          formatDateForStorage(CMR7_fromDateGregorian) ||
          editTopic?.FromDateGregorian ||
          "",
        ToDateHijri:
          formatDateForStorage(CMR7_toDateHijri) ||
          editTopic?.ToDateHijri ||
          "",
        ToDateGregorian:
          formatDateForStorage(CMR7_toDateGregorian) ||
          editTopic?.ToDateGregorian ||
          "",
        DurationOfLeaveDue:
          CMR7_durationOfLeaveDue ?? editTopic?.DurationOfLeaveDue ?? "",
        PayDue: CMR7_payDue ?? editTopic?.PayDue ?? "",

        CMR7_fromDateHijri:
          CMR7_fromDateHijri ?? editTopic?.CMR7_fromDateHijri ?? "",
        CMR7_fromDateGregorian:
          CMR7_fromDateGregorian ?? editTopic?.CMR7_fromDateGregorian ?? "",
        CMR7_toDateHijri: CMR7_toDateHijri ?? editTopic?.CMR7_toDateHijri ?? "",
        CMR7_toDateGregorian:
          CMR7_toDateGregorian ?? editTopic?.CMR7_toDateGregorian ?? "",
        CMR7_durationOfLeaveDue:
          CMR7_durationOfLeaveDue ?? editTopic?.CMR7_durationOfLeaveDue ?? "",
        CMR7_payDue: CMR7_payDue ?? editTopic?.CMR7_payDue ?? "",

        from_date_hijri: CMR7_fromDateHijri ?? editTopic?.from_date_hijri ?? "",
        from_date_gregorian:
          CMR7_fromDateGregorian ?? editTopic?.from_date_gregorian ?? "",
        to_date_hijri: CMR7_toDateHijri ?? editTopic?.to_date_hijri ?? "",
        to_date_gregorian:
          CMR7_toDateGregorian ?? editTopic?.to_date_gregorian ?? "",
        durationOfLeaveDue:
          CMR7_durationOfLeaveDue ?? editTopic?.durationOfLeaveDue ?? "",
        payDue: CMR7_payDue ?? editTopic?.payDue ?? "",
      });
    } else if (subCategoryValue === "CMR-8") {
      const {
        CMR8_wagesAmount,
        CMR8_fromDateHijri,
        CMR8_fromDateGregorian,
        CMR8_toDateHijri,
        CMR8_toDateGregorian,
      } = updatedValues;

      Object.assign(updatedTopic, {
        WagesAmount: CMR8_wagesAmount ?? editTopic?.WagesAmount ?? "",
        FromDateHijri:
          formatDateForStorage(CMR8_fromDateHijri) ||
          editTopic?.FromDateHijri ||
          "",
        FromDateGregorian:
          formatDateForStorage(CMR8_fromDateGregorian) ||
          editTopic?.FromDateGregorian ||
          "",
        ToDateHijri:
          formatDateForStorage(CMR8_toDateHijri) ||
          editTopic?.ToDateHijri ||
          "",
        ToDateGregorian:
          formatDateForStorage(CMR8_toDateGregorian) ||
          editTopic?.ToDateGregorian ||
          "",

        CMR8_wagesAmount: CMR8_wagesAmount ?? editTopic?.CMR8_wagesAmount ?? "",
        CMR8_fromDateHijri:
          CMR8_fromDateHijri ?? editTopic?.CMR8_fromDateHijri ?? "",
        CMR8_fromDateGregorian:
          CMR8_fromDateGregorian ?? editTopic?.CMR8_fromDateGregorian ?? "",
        CMR8_toDateHijri: CMR8_toDateHijri ?? editTopic?.CMR8_toDateHijri ?? "",
        CMR8_toDateGregorian:
          CMR8_toDateGregorian ?? editTopic?.CMR8_toDateGregorian ?? "",

        wagesAmount: CMR8_wagesAmount ?? editTopic?.wagesAmount ?? "",
        from_date_hijri: CMR8_fromDateHijri ?? editTopic?.from_date_hijri ?? "",
        from_date_gregorian:
          CMR8_fromDateGregorian ?? editTopic?.from_date_gregorian ?? "",
        to_date_hijri: CMR8_toDateHijri ?? editTopic?.to_date_hijri ?? "",
        to_date_gregorian:
          CMR8_toDateGregorian ?? editTopic?.to_date_gregorian ?? "",
      });
    } else if (subCategoryValue === "BR-1") {
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
        BR1_bonusAmount: BR1_bonusAmount ?? "",
        pyTempDate: formatDateForStorage(BR1_dateHijri),
        Date_New: formatDateForStorage(BR1_dateGregorian),

        accordingToAgreement: BR1_accordingToAgreement ?? null,
        bonusAmount: BR1_bonusAmount ?? "",
        date_hijri: BR1_dateHijri ?? "",
        date_gregorian: BR1_dateGregorian ?? "",
      });
    } else if (subCategoryValue === "EDO-1") {
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

        EDO1_fromLocation: EDO1_fromLocation ?? null,
        EDO1_toLocation: EDO1_toLocation ?? null,
        EDO1_managerialDecisionDateHijri:
          EDO1_managerialDecisionDateHijri ?? "",
        EDO1_managerialDecisionDateGregorian:
          EDO1_managerialDecisionDateGregorian ?? "",
        EDO1_managerialDecisionNumber: EDO1_managerialDecisionNumber ?? "",

        fromLocation: EDO1_fromLocation ?? null,
        toLocation: EDO1_toLocation ?? null,
        managerial_decision_date_hijri: EDO1_managerialDecisionDateHijri ?? "",
        managerial_decision_date_gregorian:
          EDO1_managerialDecisionDateGregorian ?? "",
        managerialDecisionNumber: EDO1_managerialDecisionNumber ?? "",
      });
    } else if (subCategoryValue === "EDO-2") {
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

        EDO2_fromJob: EDO2_fromJob ?? "",
        EDO2_toJob: EDO2_toJob ?? "",
        EDO2_managerialDecisionDateHijri:
          EDO2_managerialDecisionDateHijri ?? "",
        EDO2_managerialDecisionDateGregorian:
          EDO2_managerialDecisionDateGregorian ?? "",
        EDO2_managerialDecisionNumber: EDO2_managerialDecisionNumber ?? "",

        fromJob: EDO2_fromJob ?? "",
        toJob: EDO2_toJob ?? "",
        managerial_decision_date_hijri: EDO2_managerialDecisionDateHijri ?? "",
        managerial_decision_date_gregorian:
          EDO2_managerialDecisionDateGregorian ?? "",
        managerialDecisionNumber: EDO2_managerialDecisionNumber ?? "",
      });
    } else if (subCategoryValue === "EDO-3") {
      const {
        EDO3_amountOfReduction,
        EDO3_managerialDecisionDateHijri,
        EDO3_managerialDecisionDateGregorian,
        EDO3_managerialDecisionNumber,
      } = updatedValues;

      Object.assign(updatedTopic, {
        AmountOfReduction: EDO3_amountOfReduction ?? "",
        pyTempDate: formatDateForStorage(EDO3_managerialDecisionDateHijri),
        ManagerialDecisionDate_New: formatDateForStorage(
          EDO3_managerialDecisionDateGregorian
        ),
        ManagerialDecisionNumber: EDO3_managerialDecisionNumber ?? "",

        EDO3_amountOfReduction: EDO3_amountOfReduction ?? "",
        EDO3_managerialDecisionDateHijri:
          EDO3_managerialDecisionDateHijri ?? "",
        EDO3_managerialDecisionDateGregorian:
          EDO3_managerialDecisionDateGregorian ?? "",
        EDO3_managerialDecisionNumber: EDO3_managerialDecisionNumber ?? "",

        amountOfReduction: EDO3_amountOfReduction ?? "",
        managerial_decision_date_hijri: EDO3_managerialDecisionDateHijri ?? "",
        managerial_decision_date_gregorian:
          EDO3_managerialDecisionDateGregorian ?? "",
        managerialDecisionNumber: EDO3_managerialDecisionNumber ?? "",
      });
    } else if (subCategoryValue === "EDO-4") {
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

        EDO4_typesOfPenalties: EDO4_typesOfPenalties ?? null,
        EDO4_managerialDecisionDateHijri:
          EDO4_managerialDecisionDateHijri ?? "",
        EDO4_managerialDecisionDateGregorian:
          EDO4_managerialDecisionDateGregorian ?? "",
        EDO4_managerialDecisionNumber: EDO4_managerialDecisionNumber ?? "",

        typesOfPenalties: EDO4_typesOfPenalties ?? null,
        managerial_decision_date_hijri: EDO4_managerialDecisionDateHijri ?? "",
        managerial_decision_date_gregorian:
          EDO4_managerialDecisionDateGregorian ?? "",
        managerialDecisionNumber: EDO4_managerialDecisionNumber ?? "",
      });
    } else if (subCategoryValue === "HIR-1") {
      const {
        HIR1_AccommodationSource,
        HIR1_HousingSpecificationsInContract,
        HIR1_HousingSpecificationsInBylaws,
        HIR1_HousingSpecifications,
      } = updatedValues;

      Object.assign(updatedTopic, {
        IsBylawsIncludeAddingAccommodation:
          HIR1_AccommodationSource === "bylaws" ? "Yes" : "No",
        IsContractIncludeAddingAccommodation:
          HIR1_AccommodationSource === "contract" ? "Yes" : "No",

        HIR1_IsBylawsIncludeAddingAccommodation:
          HIR1_AccommodationSource === "bylaws" ? "Yes" : "No",
        HIR1_IsContractIncludeAddingAccommodation:
          HIR1_AccommodationSource === "contract" ? "Yes" : "No",
        HIR1_HousingSpecificationsInContract:
          HIR1_HousingSpecificationsInContract ?? "",
        HIR1_HousingSpecificationsInBylaws:
          HIR1_HousingSpecificationsInBylaws ?? "",
        HIR1_HousingSpecifications: HIR1_HousingSpecifications ?? "",
        HousingSpecificationsInContract:
          HIR1_HousingSpecificationsInContract ?? "",
        HousingSpecificationsInBylaws: HIR1_HousingSpecificationsInBylaws ?? "",
        HousingSpecifications: HIR1_HousingSpecifications ?? "",
      });
    } else if (subCategoryValue === "JAR-2") {
      const { JAR2_currentJobTitle, JAR2_requiredJobTitle } = updatedValues;

      Object.assign(updatedTopic, {
        JAR2_currentJobTitle: JAR2_currentJobTitle ?? "",
        JAR2_requiredJobTitle: JAR2_requiredJobTitle ?? "",

        CurrentJobTitle: JAR2_currentJobTitle ?? "",
        RequiredJobTitle: JAR2_requiredJobTitle ?? "",
        currentJobTitle: JAR2_currentJobTitle ?? "",
        requiredJobTitle: JAR2_requiredJobTitle ?? "",
      });
    } else if (subCategoryValue === "JAR-3") {
      const { JAR3_promotionMechanism, JAR3_additionalUpgrade } = updatedValues;

      Object.assign(updatedTopic, {
        JAR3_promotionMechanism: JAR3_promotionMechanism ?? "",
        JAR3_additionalUpgrade: JAR3_additionalUpgrade ?? "",

        PromotionMechanism: JAR3_promotionMechanism ?? "",
        AdditionalUpgrade: JAR3_additionalUpgrade ?? "",
        promotionMechanism: JAR3_promotionMechanism ?? "",
        additionalUpgrade: JAR3_additionalUpgrade ?? "",
      });
    } else if (subCategoryValue === "JAR-4") {
      const { JAR4_CurrentPosition, JAR4_WantedJob } = updatedValues;

      Object.assign(updatedTopic, {
        JAR4_CurrentPosition: JAR4_CurrentPosition ?? "",
        JAR4_WantedJob: JAR4_WantedJob ?? "",

        CurrentPosition: JAR4_CurrentPosition ?? "",
        WantedJob: JAR4_WantedJob ?? "",
        currentPosition: JAR4_CurrentPosition ?? "",
        theWantedJob: JAR4_WantedJob ?? "",
      });
    } else if (subCategoryValue === "LRESR-1") {
      const { LRESR1_Amount } = updatedValues;

      Object.assign(updatedTopic, {
        Amount: LRESR1_Amount ?? "",

        amount: LRESR1_Amount ?? "",
      });
    } else if (subCategoryValue === "TTR-1") {
      const { TTR1_travelingWay } = updatedValues;

      Object.assign(updatedTopic, {
        TravelingWay: TTR1_travelingWay?.label ?? "",
        TravelingWay_Code: TTR1_travelingWay?.value ?? "",

        TTR1_travelingWay: TTR1_travelingWay ?? null,

        travelingWay: TTR1_travelingWay ?? null,
      });
    } else if (subCategoryValue === "RFR-1") {
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

        rewardRequestAmount: RFR1_Amount ?? "",
        consideration: RFR1_Consideration ?? "",
        date_hijri: RFR1_dateHijri ?? "",
        date_gregorian: RFR1_dateGregorian ?? "",
      });
    } else if (subCategoryValue === "RR-1") {
      const { RR1_Amount, RR1_Type } = updatedValues;

      Object.assign(updatedTopic, {
        Amount: RR1_Amount ?? "",
        Type: RR1_Type ?? "",

        rewardAmount: RR1_Amount ?? "",
        rewardType: RR1_Type ?? "",
      });
    } else if (subCategoryValue === "LCUT-1") {
      const { LCUT1_amountOfCompensation } = updatedValues;

      Object.assign(updatedTopic, {
        AmountOfCompensation: LCUT1_amountOfCompensation ?? "",

        amountOfCompensation: LCUT1_amountOfCompensation ?? "",
      });
    } else if (subCategoryValue === "DR-1") {
    } else if (subCategoryValue === "CR-1") {
      const { typeOfCustody, CR1_compensationAmount, compensationAmount } =
        updatedValues;

      const effectiveCompensation =
        CR1_compensationAmount ??
        compensationAmount ??
        editTopic?.CR1_compensationAmount ??
        editTopic?.CompensationAmount ??
        editTopic?.compensationAmount ??
        editTopic?.Amount ??
        "";

      Object.assign(updatedTopic, {
        TypeOfCustody: typeOfCustody?.label ?? "",
        TypeOfCustody_Code: typeOfCustody?.value ?? "",
        Amount: String(effectiveCompensation),
        CR1_compensationAmount: String(effectiveCompensation),
        compensationAmount: String(effectiveCompensation),
      });
    } else if (subCategoryValue === "LCUTE-1") {
      const { LCUTE1_amountOfCompensation, amountOfCompensation } =
        updatedValues as any;

      const effectiveAmountOfCompensation =
        LCUTE1_amountOfCompensation ??
        amountOfCompensation ??
        editTopic?.LCUTE1_amountOfCompensation ??
        editTopic?.amountOfCompensation ??
        editTopic?.AmountOfCompensation ??
        "";

      Object.assign(updatedTopic, {
        AmountOfCompensation: effectiveAmountOfCompensation,
        LCUTE1_amountOfCompensation: effectiveAmountOfCompensation,
        amountOfCompensation: effectiveAmountOfCompensation,
      });
    } else if (subCategoryValue === "DPVR-1") {
      const {
        DPVR1_damagedValue,
        DPVR1_damagedType,
        damagedValue,
        damagedType,
        amountOfCompensation,
      } = updatedValues as any;

      const effectiveDamagedValue =
        DPVR1_damagedValue ??
        damagedValue ??
        editTopic?.DPVR1_damagedValue ??
        editTopic?.damagedValue ??
        editTopic?.DamagedValue ??
        "";

      const effectiveDamagedType =
        DPVR1_damagedType ??
        damagedType ??
        editTopic?.DPVR1_damagedType ??
        editTopic?.damagedType ??
        editTopic?.SpoilerType ??
        "";

      Object.assign(updatedTopic, {
        DamagedValue: effectiveDamagedValue,
        DamagedType: effectiveDamagedType,
        AmountOfCompensation:
          amountOfCompensation ?? updatedTopic?.AmountOfCompensation ?? "",

        DPVR1_damagedValue: effectiveDamagedValue,
        DPVR1_damagedType: effectiveDamagedType,
        damagedValue: effectiveDamagedValue,
        damagedType: effectiveDamagedType,
      });
    } else if (subCategoryValue === "LRESR-1") {
      const { LRESR1_Amount } = updatedValues;

      Object.assign(updatedTopic, {
        Amount: LRESR1_Amount ?? "",

        endOfServiceRewardAmount: LRESR1_Amount ?? "",
      });
    } else if (subCategoryValue === "AWRW-1") {
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
    } else if (subCategoryValue === "AWRW-2") {
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
    } else if (subCategoryValue === "RLRAHI-1") {
      const {
        RLRAHI1_typeOfRequest,
        RLRAHI1_request_date_hijri,
        RLRAHI1_request_date_gregorian,
        RLRAHI1_typeOfCustody,
        RLRAHI1_loanAmount,
      } = updatedValues as any;

      const requestTypeCode = RLRAHI1_typeOfRequest?.value ?? "";
      const requestTypeLabel = RLRAHI1_typeOfRequest?.label ?? "";

      const mapped: any = {
        RequestType: requestTypeLabel,
        RequestType_Code: requestTypeCode,
        RLRAHI1_typeOfRequest: RLRAHI1_typeOfRequest ?? null,
      };

      if (requestTypeCode === "RLRAHI1") {
        mapped.TypeOfCustody = RLRAHI1_typeOfCustody ?? "";
        mapped.RLRAHI1_typeOfCustody = RLRAHI1_typeOfCustody ?? "";
        mapped.Date_New =
          formatDateForStorage(RLRAHI1_request_date_hijri) || "";
        mapped.RequestDate_New =
          formatDateForStorage(RLRAHI1_request_date_gregorian) || "";
        mapped.RLRAHI1_request_date_hijri = RLRAHI1_request_date_hijri ?? "";
        mapped.RLRAHI1_request_date_gregorian =
          RLRAHI1_request_date_gregorian ?? "";
      } else if (requestTypeCode === "RLRAHI2") {
        mapped.LoanAmount = RLRAHI1_loanAmount ?? "";
        mapped.RLRAHI1_loanAmount = RLRAHI1_loanAmount ?? "";
      }

      Object.assign(updatedTopic, mapped);
    } else if (subCategoryValue === "RUF-1") {
      const { RefundType, refundAmount, RUF1_refundType, RUF1_refundAmount } =
        updatedValues;

      Object.assign(updatedTopic, {
        RefundType: RUF1_refundType ?? RefundType ?? "",
        Amount: RUF1_refundAmount ?? refundAmount ?? "",

        RUF1_refundType: RUF1_refundType ?? RefundType ?? "",
        RUF1_refundAmount: RUF1_refundAmount ?? refundAmount ?? "",
        refundAmount: RUF1_refundAmount ?? refundAmount ?? "",
      });
    } else {
      Object.assign(updatedTopic, {
        ...updatedValues,
      });
    }

    setCaseTopics((prev) => {
      const newTopics = prev.map((topic, idx) => {
        if (idx === editTopicIndex) {
          return updatedTopic;
        } else {
          return topic;
        }
      });

      setEditTopic({ ...updatedTopic, index: editTopicIndex });

      return newTopics;
    });

    toast.success(
      t("topic_updated_successfully") || "Topic updated successfully"
    );

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

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setMojContractError(null);
    setLastErrorSubCategory(null);
    close();

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
    setLastAction("Save");
    const payload = getPayloadBySubTopicID(
      {
        caseTopics,
        lastAction: "Save",
        caseId
      }
    );

    try {
      const response = onSaveApi
        ? await onSaveApi(payload)
        : await saveHearingTopics(payload).unwrap();

      const isSuccessCode = response?.SuccessCode === "200";
      const isSuccessStatus = response?.ServiceStatus === "Success";

      const hasActualErrors =
        response?.ErrorCodeList &&
        response.ErrorCodeList.some(
          (error: any) =>
            error &&
            (error.ErrorCode || error.ErrorDesc) &&
            !(error.ErrorCode === "" && error.ErrorDesc === "")
        );

      if (hasActualErrors) {
        response.ErrorCodeList.forEach((error: any) => {
          if (error?.ErrorDesc) {
            toast.error(error.ErrorDesc);
          }
        });
        setLastAction(undefined);
        return response;
      }

      if (isSuccessCode && isSuccessStatus) {

      } else {
      }
      return response;
    } catch (error: any) {
      setLastAction(undefined);
      toast.error(error?.message);
      return Promise.reject(error);
    }
  };

  const handleNext = async () => {
    const latestFormValues = getValues();
    setFormData(latestFormValues);
    try {
      setLastAction("Next");
      const payload = getPayloadBySubTopicID(
        {
          caseTopics,
          lastAction: "Next",
          caseId
        }
      );

      const response = await saveHearingTopics(payload).unwrap();

      const hasActualErrors =
        response?.ErrorCodeList &&
        response.ErrorCodeList.some(
          (error: any) =>
            error &&
            (error.ErrorCode || error.ErrorDesc) &&
            !(error.ErrorCode === "" && error.ErrorDesc === "")
        );

      if (hasActualErrors) {
        response.ErrorCodeList.forEach((error: any) => {
          if (error?.ErrorDesc) {
            toast.error(error.ErrorDesc);
          }
        });
        setLastAction(undefined);
        return;
      }

      const isSuccessCode = response?.SuccessCode === "200";
      const isSuccessStatus = response?.ServiceStatus === "Success";
      const isSuccessful = isSuccessCode && isSuccessStatus;

      if (isSuccessful) {
        updateParams(currentStep + 1, 0);
      } else {
        setLastAction(undefined);
      }
    } catch (error: any) {
      setLastAction(undefined);
      const errorMessage = error?.message;
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

    const subTopicID = newTopic.subCategory?.value;

    for (const [key, value] of Object.entries(newTopic)) {
      const optionalFields = [
        "housingSpecificationsInContract",
        "actualHousingSpecifications",
        "housingSpecificationInByLaws",
        "regulatoryText",
        "date_hijri",
        "from_date_hijri",
        "from_date_gregorian",
        "to_date_hijri",
        "to_date_gregorian",
        "managerial_decision_date_hijri",
        "managerial_decision_date_gregorian",
        "topicData",
        "legalSection",
        "subCategoryData",
        "subCategoryOptions",

        "MIR1_requiredDegreeOfInsurance",
        "MIR1_theReason",
        "MIR1_currentInsuranceLevel",
        "requiredDegreeOfInsurance",
        "theReason",
        "currentInsuranceLevel",

        "HIR1_HousingSpecificationsInBylaws",
        "HIR1_HousingSpecificationsInContract",
        "HIR1_HousingSpecifications",
        "HIR1_IsBylawsIncludeAddingAccommodation",
        "HIR1_IsContractIncludeAddingAccommodation",

        "EDO1_managerialDecisionNumber",

        "EDO2_managerialDecisionNumber",

        "EDO3_managerialDecisionNumber",

        "EDO4_managerialDecisionNumber",

        "CMR5_additionalDetails",
      ];

      if (
        (key === "otherAllowance" || key === "WR1_otherAllowance") &&
        subTopicID === "WR-1"
      ) {
        const forAllowance = newTopic.WR1_forAllowance || newTopic.forAllowance;
        const isOther =
          forAllowance &&
          (["FA11", "OTHER", "3"].includes(String(forAllowance.value)) ||
            (forAllowance.label ?? "").toLowerCase().includes("other"));

        if (!isOther) {
          continue;
        }
      }

      if (
        (key === "otherCommission" || key === "BPSR1_otherCommission") &&
        subTopicID === "BPSR-1"
      ) {
        const commissionType =
          newTopic.BPSR1_commissionType || newTopic.commissionType;
        const isOther =
          commissionType &&
          (["CT4", "OTHER", "3"].includes(String(commissionType.value)) ||
            (commissionType.label ?? "").toLowerCase().includes("other"));
        if (!isOther) {
          continue;
        }
      }

      if (subTopicID === "MIR-1") {
        const typeOfRequest = newTopic.typeOfRequest;
        const requiresAdditionalFields =
          typeOfRequest &&
          ["REQT1", "REQT2", "REQT3"].includes(String(typeOfRequest.value));
        const requiresReasonAndCurrentLevel =
          typeOfRequest && String(typeOfRequest.value) === "REQT3";

        if (key === "requiredDegreeOfInsurance" && !requiresAdditionalFields) {
          continue;
        }

        if (
          (key === "theReason" || key === "currentInsuranceLevel") &&
          !requiresReasonAndCurrentLevel
        ) {
          continue;
        }
      }

      if (subTopicID === "HIR-1") {
        const accommodationSource = newTopic.HIR1_AccommodationSource;

        if (
          key === "HIR1_HousingSpecificationsInBylaws" &&
          accommodationSource !== "bylaws"
        ) {
          continue;
        }

        if (
          (key === "HIR1_HousingSpecificationsInContract" ||
            key === "HIR1_HousingSpecifications") &&
          accommodationSource !== "contract"
        ) {
          continue;
        }

        if (
          key === "HIR1_IsBylawsIncludeAddingAccommodation" &&
          accommodationSource !== "bylaws"
        ) {
          continue;
        }

        if (
          key === "HIR1_IsContractIncludeAddingAccommodation" &&
          accommodationSource !== "contract"
        ) {
          continue;
        }

        if (
          (key === "HIR1_IsBylawsIncludeAddingAccommodation" ||
            key === "HIR1_IsContractIncludeAddingAccommodation") &&
          (value === "Yes" || value === "No")
        ) {
          continue;
        }
      }

      if (
        (subTopicID === "EDO-1" && key === "EDO1_managerialDecisionNumber") ||
        (subTopicID === "EDO-2" && key === "EDO2_managerialDecisionNumber") ||
        (subTopicID === "EDO-3" && key === "EDO3_managerialDecisionNumber") ||
        (subTopicID === "EDO-4" && key === "EDO4_managerialDecisionNumber")
      ) {
        continue;
      }

      if (
        ["CMR-6", "CMR-7", "CMR-8", "BR-1", "BPSR-1", "RLRAHI-1"].includes(
          subTopicID
        )
      ) {
        const requiredDateFields = [
          "from_date_hijri",
          "to_date_hijri",
          "date_hijri",
        ];
        if (
          requiredDateFields.includes(key) &&
          (value === "" ||
            (typeof value === "string" && value.trim().length === 0))
        ) {
          return 0;
        }
      }

      if (
        (value === "" ||
          (typeof value === "string" && value.trim().length === 0)) &&
        !optionalFields.includes(key)
      ) {
        return 0;
      }
    }

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

      FromLocation:
        newTopic?.fromLocation?.value || newTopic?.fromLocation || "",
      ToLocation: newTopic?.toLocation?.value || newTopic?.toLocation || "",
      fromJob: newTopic.fromJob || "",
      toJob: newTopic.toJob || "",
      Amount: newTopic.amount,
      PayDue: newTopic.payDue,
      DurationOfLeaveDue: newTopic.durationOfLeaveDue,
      WagesAmount: newTopic.wagesAmount,
      CompensationAmount:
        newTopic.CR1_compensationAmount || newTopic.compensationAmount,
      InjuryType: newTopic.injuryType,
      BonusAmount: newTopic.bonusAmount,
      AccordingToAgreement:
        newTopic?.accordingToAgreement?.value ||
        newTopic?.accordingToAgreement ||
        "",
      OtherCommission: newTopic.otherCommission,
      AmountOfCompensation:
        newTopic.LCUTE1_amountOfCompensation || newTopic.amountOfCompensation,
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

      kindOfHoliday:
        newTopic.SubTopicID === "CMR-5"
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
        newTopic.SubTopicID === "CMR-5"
          ? typeof newTopic.kindOfHoliday === "object"
            ? newTopic.kindOfHoliday.label
            : (leaveTypeData?.DataElements || []).find(
              (item: any) => item.ElementKey === newTopic.kindOfHoliday
            )?.ElementValue ||
            newTopic.kindOfHoliday ||
            ""
          : undefined,
      totalAmount:
        newTopic.SubTopicID === "CMR-5"
          ? newTopic.totalAmount || ""
          : undefined,
      workingHours:
        newTopic.SubTopicID === "CMR-5"
          ? newTopic.workingHours || ""
          : undefined,
      additionalDetails:
        newTopic.SubTopicID === "CMR-5"
          ? newTopic.additionalDetails || ""
          : undefined,

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

      amountOfReduction:
        newTopic.subCategory?.value === "EDO-3"
          ? newTopic.amountOfReduction || ""
          : undefined,

      ...(newTopic.subCategory?.value === "EDO-1" && {
        EDO1_fromLocation:
          newTopic.EDO1_fromLocation ||
          newTopic.fromLocation ||
          (newTopic.FromLocation_Code
            ? {
              value: newTopic.FromLocation_Code,
              label: newTopic.FromLocation,
            }
            : null),
        EDO1_toLocation:
          newTopic.EDO1_toLocation ||
          newTopic.toLocation ||
          (newTopic.ToLocation_Code
            ? { value: newTopic.ToLocation_Code, label: newTopic.ToLocation }
            : null),
        EDO1_managerialDecisionDateHijri:
          newTopic.EDO1_managerialDecisionDateHijri ||
          newTopic.managerial_decision_date_hijri ||
          newTopic.Date_New ||
          "",
        EDO1_managerialDecisionDateGregorian:
          newTopic.EDO1_managerialDecisionDateGregorian ||
          newTopic.managerial_decision_date_gregorian ||
          newTopic.ManDecsDate ||
          "",
        EDO1_managerialDecisionNumber:
          newTopic.EDO1_managerialDecisionNumber ||
          newTopic.managerialDecisionNumber ||
          "",

        fromLocation:
          newTopic.fromLocation ||
          (newTopic.FromLocation_Code
            ? {
              value: newTopic.FromLocation_Code,
              label: newTopic.FromLocation,
            }
            : null),
        toLocation:
          newTopic.toLocation ||
          (newTopic.ToLocation_Code
            ? { value: newTopic.ToLocation_Code, label: newTopic.ToLocation }
            : null),
        managerial_decision_date_hijri:
          newTopic.managerial_decision_date_hijri || newTopic.Date_New || "",
        managerial_decision_date_gregorian:
          newTopic.managerial_decision_date_gregorian ||
          newTopic.ManDecsDate ||
          "",
        managerialDecisionNumber: newTopic.managerialDecisionNumber || "",
      }),

      ...(newTopic.subCategory?.value === "EDO-2" && {
        EDO2_fromJob:
          newTopic.EDO2_fromJob || newTopic.fromJob || newTopic.FromJob || "",
        EDO2_toJob:
          newTopic.EDO2_toJob || newTopic.toJob || newTopic.ToJob || "",
        EDO2_managerialDecisionDateHijri:
          newTopic.EDO2_managerialDecisionDateHijri ||
          newTopic.managerial_decision_date_hijri ||
          newTopic.Date_New ||
          "",
        EDO2_managerialDecisionDateGregorian:
          newTopic.EDO2_managerialDecisionDateGregorian ||
          newTopic.managerial_decision_date_gregorian ||
          newTopic.ManDecsDate ||
          "",
        EDO2_managerialDecisionNumber:
          newTopic.EDO2_managerialDecisionNumber ||
          newTopic.managerialDecisionNumber ||
          "",

        fromJob: newTopic.fromJob || newTopic.FromJob || "",
        toJob: newTopic.toJob || newTopic.ToJob || "",
        managerial_decision_date_hijri:
          newTopic.managerial_decision_date_hijri || newTopic.Date_New || "",
        managerial_decision_date_gregorian:
          newTopic.managerial_decision_date_gregorian ||
          newTopic.ManDecsDate ||
          "",
        managerialDecisionNumber: newTopic.managerialDecisionNumber || "",
      }),

      ...(newTopic.subCategory?.value === "EDO-3" && {
        EDO3_amountOfReduction:
          newTopic.EDO3_amountOfReduction ||
          newTopic.amountOfReduction ||
          newTopic.AmountOfReduction ||
          "",
        EDO3_managerialDecisionDateHijri:
          newTopic.EDO3_managerialDecisionDateHijri ||
          newTopic.managerial_decision_date_hijri ||
          newTopic.pyTempDate ||
          "",
        EDO3_managerialDecisionDateGregorian:
          newTopic.EDO3_managerialDecisionDateGregorian ||
          newTopic.managerial_decision_date_gregorian ||
          newTopic.ManagerialDecisionDate_New ||
          "",
        EDO3_managerialDecisionNumber:
          newTopic.EDO3_managerialDecisionNumber ||
          newTopic.managerialDecisionNumber ||
          "",

        amountOfReduction:
          newTopic.amountOfReduction || newTopic.AmountOfReduction || "",
        managerial_decision_date_hijri:
          newTopic.managerial_decision_date_hijri || newTopic.pyTempDate || "",
        managerial_decision_date_gregorian:
          newTopic.managerial_decision_date_gregorian ||
          newTopic.ManagerialDecisionDate_New ||
          "",
        managerialDecisionNumber: newTopic.managerialDecisionNumber || "",
      }),

      ...(newTopic.subCategory?.value === "EDO-4" && {
        EDO4_typesOfPenalties:
          newTopic.EDO4_typesOfPenalties ||
          newTopic.typesOfPenalties ||
          (newTopic.PenalityType_Code
            ? {
              value: newTopic.PenalityType_Code,
              label: newTopic.PenalityType,
            }
            : null),
        EDO4_managerialDecisionDateHijri:
          newTopic.EDO4_managerialDecisionDateHijri ||
          newTopic.managerial_decision_date_hijri ||
          newTopic.Date_New ||
          "",
        EDO4_managerialDecisionDateGregorian:
          newTopic.EDO4_managerialDecisionDateGregorian ||
          newTopic.managerial_decision_date_gregorian ||
          newTopic.ManDecsDate ||
          "",
        EDO4_managerialDecisionNumber:
          newTopic.EDO4_managerialDecisionNumber ||
          newTopic.managerialDecisionNumber ||
          "",

        typesOfPenalties:
          newTopic.typesOfPenalties ||
          (newTopic.PenalityType_Code
            ? {
              value: newTopic.PenalityType_Code,
              label: newTopic.PenalityType,
            }
            : null),
        managerial_decision_date_hijri:
          newTopic.managerial_decision_date_hijri || newTopic.Date_New || "",
        managerial_decision_date_gregorian:
          newTopic.managerial_decision_date_gregorian ||
          newTopic.ManDecsDate ||
          "",
        managerialDecisionNumber: newTopic.managerialDecisionNumber || "",
      }),

      ...(newTopic.subCategory?.value === "WR-1"
        ? {
          WR1_wageAmount:
            newTopic.WR1_wageAmount || newTopic.wageAmount || "",
          WR1_fromDateHijri:
            newTopic.WR1_fromDateHijri || newTopic.from_date_hijri || "",
          WR1_fromDateGregorian:
            newTopic.WR1_fromDateGregorian ||
            newTopic.from_date_gregorian ||
            "",
          WR1_toDateHijri:
            newTopic.WR1_toDateHijri || newTopic.to_date_hijri || "",
          WR1_toDateGregorian:
            newTopic.WR1_toDateGregorian || newTopic.to_date_gregorian || "",
          WR1_forAllowance:
            newTopic.WR1_forAllowance || newTopic.forAllowance || null,
          WR1_otherAllowance:
            newTopic.WR1_otherAllowance || newTopic.otherAllowance || "",

          wageAmount: newTopic.wageAmount || "",
          from_date_hijri: newTopic.from_date_hijri || "",
          from_date_gregorian: newTopic.from_date_gregorian || "",
          to_date_hijri: newTopic.to_date_hijri || "",
          to_date_gregorian: newTopic.to_date_gregorian || "",
          forAllowance: newTopic.forAllowance || null,
          otherAllowance: newTopic.otherAllowance || "",
        }
        : {}),

      ...(newTopic.subCategory?.value === "WR-2"
        ? {
          WR2_wageAmount:
            newTopic.WR2_wageAmount || newTopic.wageAmount || "",
          WR2_fromDateHijri:
            newTopic.WR2_fromDateHijri || newTopic.from_date_hijri || "",
          WR2_fromDateGregorian:
            newTopic.WR2_fromDateGregorian ||
            newTopic.from_date_gregorian ||
            "",
          WR2_toDateHijri:
            newTopic.WR2_toDateHijri || newTopic.to_date_hijri || "",
          WR2_toDateGregorian:
            newTopic.WR2_toDateGregorian || newTopic.to_date_gregorian || "",

          wageAmount: newTopic.wageAmount || "",
          from_date_hijri: newTopic.from_date_hijri || "",
          from_date_gregorian: newTopic.from_date_gregorian || "",
          to_date_hijri: newTopic.to_date_hijri || "",
          to_date_gregorian: newTopic.to_date_gregorian || "",
        }
        : {}),

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

      ...(newTopic.subCategory?.value === "HIR-1"
        ? {
          IsBylawsIncludeAddingAccommodation:
            newTopic.HIR1_AccommodationSource === "bylaws" ? "Yes" : "No",
          IsContractIncludeAddingAccommodation:
            newTopic.HIR1_AccommodationSource === "contract" ? "Yes" : "No",
          HousingSpecificationsInContract:
            newTopic.HIR1_HousingSpecificationsInContract || "",
          HousingSpecificationsInBylaws:
            newTopic.HIR1_HousingSpecificationsInBylaws || "",
          HousingSpecifications: newTopic.HIR1_HousingSpecifications || "",
        }
        : {}),

      ...(newTopic.SubTopicID === "TTR-1"
        ? {
          TTR1_travelingWay:
            newTopic.TTR1_travelingWay || newTopic.travelingWay || null,

          travelingWay:
            newTopic.TTR1_travelingWay || newTopic.travelingWay || null,
        }
        : {}),

      ...(newTopic.SubTopicID === "CMR-1" && {
        CMR1_amountsPaidFor:
          newTopic.CMR1_amountsPaidFor &&
            typeof newTopic.CMR1_amountsPaidFor === "object"
            ? newTopic.CMR1_amountsPaidFor
            : null,
        CMR1_theAmountRequired:
          newTopic.CMR1_theAmountRequired !== undefined &&
            newTopic.CMR1_theAmountRequired !== null
            ? String(newTopic.CMR1_theAmountRequired)
            : "",

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

      ...(newTopic.SubTopicID === "CMR-3" && {
        CMR3_compensationAmount:
          newTopic.CMR3_compensationAmount !== undefined &&
            newTopic.CMR3_compensationAmount !== null
            ? String(newTopic.CMR3_compensationAmount)
            : "",
        CMR3_injuryDateHijri: newTopic.CMR3_injuryDateHijri || "",
        CMR3_injuryDateGregorian: newTopic.CMR3_injuryDateGregorian || "",
        CMR3_injuryType: newTopic.CMR3_injuryType || "",

        compensationAmount:
          newTopic.compensationAmount !== undefined &&
            newTopic.compensationAmount !== null
            ? String(newTopic.compensationAmount)
            : "",
        injury_date_hijri: newTopic.injury_date_hijri || "",
        injury_date_gregorian: newTopic.injury_date_gregorian || "",
        injuryType: newTopic.injuryType || "",
      }),

      ...(newTopic.SubTopicID === "CMR-4" && {
        CMR4_compensationAmount:
          newTopic.CMR4_compensationAmount !== undefined &&
            newTopic.CMR4_compensationAmount !== null
            ? String(newTopic.CMR4_compensationAmount)
            : "",

        amount:
          newTopic.noticeCompensationAmount !== undefined &&
            newTopic.noticeCompensationAmount !== null
            ? String(newTopic.noticeCompensationAmount)
            : "",
      }),

      ...(newTopic.SubTopicID === "CMR-5" && {
        CMR5_kindOfHoliday:
          newTopic.CMR5_kindOfHoliday &&
            typeof newTopic.CMR5_kindOfHoliday === "object"
            ? newTopic.CMR5_kindOfHoliday
            : null,
        CMR5_totalAmount:
          newTopic.CMR5_totalAmount !== undefined &&
            newTopic.CMR5_totalAmount !== null
            ? String(newTopic.CMR5_totalAmount)
            : "",
        CMR5_workingHours:
          newTopic.CMR5_workingHours !== undefined &&
            newTopic.CMR5_workingHours !== null
            ? String(newTopic.CMR5_workingHours)
            : "",
        CMR5_additionalDetails: newTopic.CMR5_additionalDetails ?? "",

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

      ...(newTopic.SubTopicID === "CMR-6" && {
        CMR6_newPayAmount:
          newTopic.CMR6_newPayAmount !== undefined &&
            newTopic.CMR6_newPayAmount !== null
            ? String(newTopic.CMR6_newPayAmount)
            : "",
        CMR6_payIncreaseType:
          newTopic.CMR6_payIncreaseType &&
            typeof newTopic.CMR6_payIncreaseType === "object"
            ? newTopic.CMR6_payIncreaseType
            : null,
        CMR6_wageDifference: newTopic.CMR6_wageDifference ?? "",
        CMR6_fromDateHijri: newTopic.CMR6_fromDateHijri ?? "",
        CMR6_fromDateGregorian: newTopic.CMR6_fromDateGregorian ?? "",
        CMR6_toDateHijri: newTopic.CMR6_toDateHijri ?? "",
        CMR6_toDateGregorian: newTopic.CMR6_toDateGregorian ?? "",

        from_date_hijri: newTopic.from_date_hijri ?? "",
        from_date_gregorian: newTopic.from_date_gregorian ?? "",
        to_date_hijri: newTopic.to_date_hijri ?? "",
        to_date_gregorian: newTopic.to_date_gregorian ?? "",
        newPayAmount:
          newTopic.newPayAmount != null ? String(newTopic.newPayAmount) : "",
        payIncreaseType:
          newTopic.payIncreaseType &&
            typeof newTopic.payIncreaseType === "object"
            ? newTopic.payIncreaseType
            : null,
        wageDifference:
          newTopic.wageDifference != null
            ? String(newTopic.wageDifference)
            : "",
      }),

      ...(newTopic.SubTopicID === "CMR-7" && {
        CMR7_durationOfLeaveDue:
          newTopic.CMR7_durationOfLeaveDue !== undefined &&
            newTopic.CMR7_durationOfLeaveDue !== null
            ? String(newTopic.CMR7_durationOfLeaveDue)
            : "",
        CMR7_payDue:
          newTopic.CMR7_payDue !== undefined && newTopic.CMR7_payDue !== null
            ? String(newTopic.CMR7_payDue)
            : "",
        CMR7_fromDateHijri: newTopic.CMR7_fromDateHijri ?? "",
        CMR7_fromDateGregorian: newTopic.CMR7_fromDateGregorian ?? "",
        CMR7_toDateHijri: newTopic.CMR7_toDateHijri ?? "",
        CMR7_toDateGregorian: newTopic.CMR7_toDateGregorian ?? "",

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

      ...(newTopic.SubTopicID === "CMR-8" && {
        CMR8_wagesAmount:
          newTopic.CMR8_wagesAmount !== undefined &&
            newTopic.CMR8_wagesAmount !== null
            ? String(newTopic.CMR8_wagesAmount)
            : "",
        CMR8_fromDateHijri: newTopic.CMR8_fromDateHijri ?? "",
        CMR8_fromDateGregorian: newTopic.CMR8_fromDateGregorian ?? "",
        CMR8_toDateHijri: newTopic.CMR8_toDateHijri ?? "",
        CMR8_toDateGregorian: newTopic.CMR8_toDateGregorian ?? "",

        pyTempDate: newTopic.pyTempDate ?? "",
        toDate_gregorian: newTopic.toDate_gregorian ?? "",
        date_hijri: newTopic.date_hijri ?? "",
        fromDate_gregorian: newTopic.fromDate_gregorian ?? "",
        wagesAmount:
          newTopic.wagesAmount !== undefined && newTopic.wagesAmount !== null
            ? String(newTopic.wagesAmount)
            : "",
      }),

      ...(newTopic.subCategory?.value === "BR-1" && {
        BR1_accordingToAgreement:
          newTopic.BR1_accordingToAgreement ||
          newTopic.accordingToAgreement ||
          null,
        BR1_bonusAmount: newTopic.BR1_bonusAmount || newTopic.bonusAmount || "",
        BR1_dateHijri: newTopic.BR1_dateHijri || newTopic.date_hijri || "",
        BR1_dateGregorian:
          newTopic.BR1_dateGregorian || newTopic.date_gregorian || "",

        accordingToAgreement: newTopic.accordingToAgreement || null,
        bonusAmount: newTopic.bonusAmount || "",
        date_hijri: newTopic.date_hijri || "",
        date_gregorian: newTopic.date_gregorian || "",
      }),

      ...(newTopic.subCategory?.value === "BPSR-1" && {
        BPSR1_commissionType:
          newTopic.BPSR1_commissionType || newTopic.commissionType || null,
        BPSR1_accordingToAgreement:
          newTopic.BPSR1_accordingToAgreement ||
          newTopic.accordingToAgreement ||
          null,
        BPSR1_bonusProfitShareAmount:
          newTopic.BPSR1_bonusProfitShareAmount ||
          newTopic.bonusProfitShareAmount ||
          "",
        BPSR1_amountRatio:
          newTopic.BPSR1_amountRatio || newTopic.amountRatio || "",
        BPSR1_fromDateHijri:
          newTopic.BPSR1_fromDateHijri || newTopic.from_date_hijri || "",
        BPSR1_fromDateGregorian:
          newTopic.BPSR1_fromDateGregorian ||
          newTopic.from_date_gregorian ||
          "",
        BPSR1_toDateHijri:
          newTopic.BPSR1_toDateHijri || newTopic.to_date_hijri || "",
        BPSR1_toDateGregorian:
          newTopic.BPSR1_toDateGregorian || newTopic.to_date_gregorian || "",
        BPSR1_otherCommission:
          newTopic.BPSR1_otherCommission || newTopic.otherCommission || "",

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

      ...(newTopic.SubTopicID === "DR-1" && {}),

      ...(newTopic.subCategory?.value === "RR-1" && {
        RR1_Amount:
          newTopic.RR1_Amount ?? newTopic.amount ?? newTopic.rewardAmount ?? "",
        RR1_Type:
          newTopic.RR1_Type ?? newTopic.Type ?? newTopic.rewardType ?? "",

        amount: newTopic.amount ?? newTopic.RR1_Amount ?? "",
        rewardType: newTopic.rewardType ?? newTopic.RR1_Type ?? "",
      }),

      ...(newTopic.SubTopicID === "JAR-2" && {
        currentJobTitle: newTopic.currentJobTitle ?? "",
        requiredJobTitle: newTopic.requiredJobTitle ?? "",
      }),

      ...(newTopic.SubTopicID === "JAR-3"
        ? {
          doesTheInternalRegulationIncludePromotionMechanism:
            (newTopic.JAR3_promotionMechanism ??
              newTopic.promotionMechanism) === "Yes",
          doesContractIncludeAdditionalUpgrade:
            (newTopic.JAR3_additionalUpgrade ??
              newTopic.additionalUpgrade) === "Yes",

          PromotionMechanism:
            newTopic.JAR3_promotionMechanism ??
            (newTopic.JAR3_JobApplicationRequest === "promotionMechanism"
              ? "Yes"
              : "No"),
          AdditionalUpgrade:
            newTopic.JAR3_additionalUpgrade ??
            (newTopic.JAR3_JobApplicationRequest === "contractUpgrade"
              ? "Yes"
              : "No"),
        }
        : {}),

      ...(newTopic.SubTopicID === "JAR-4" && {
        currentPosition: newTopic.currentPosition ?? "",
        theWantedJob: newTopic.theWantedJob ?? "",
      }),

      ...(newTopic.subCategory?.value === "RFR-1" && {
        amount: newTopic.RFR1_Amount ?? newTopic.rewardRequestAmount ?? "",
        consideration:
          newTopic.RFR1_Consideration ?? newTopic.consideration ?? "",
      }),

      ...(newTopic.SubTopicID === "RUF-1" && {
        RefundType: newTopic.RefundType || newTopic.refundType || "",
        refundAmount: newTopic.Amount || newTopic.amount || "",
      }),

      ...(newTopic.subCategory?.value === "LRESR-1" && {
        amount: newTopic.LRESR1_Amount ?? "",
      }),

      ...(newTopic.subCategory?.value === "LRESR-2" && {
        amount: newTopic.endOfServiceRewardAmount ?? "",
        consideration: newTopic.consideration ?? "",
      }),

      ...(newTopic.subCategory?.value === "LRESR-3" && {
        amount: newTopic.endOfServiceRewardAmount ?? "",
        rewardType: newTopic.rewardType ?? "",
      }),

      ...(newTopic.subCategory?.value === "LCUT-1" && {
        amountOfCompensation: newTopic.LCUT1_amountOfCompensation ?? "",
      }),
    };

    if (
      newTopic.subCategory?.value === "MIR-1" ||
      newTopic.SubTopicID === "MIR-1"
    ) {
      topicToSave.MIR1_typeOfRequest =
        newTopic.MIR1_typeOfRequest || newTopic.typeOfRequest;
      topicToSave.MIR1_requiredDegreeOfInsurance =
        newTopic.MIR1_requiredDegreeOfInsurance ||
        newTopic.requiredDegreeOfInsurance;
      topicToSave.MIR1_theReason =
        newTopic.MIR1_theReason || newTopic.theReason;
      topicToSave.MIR1_currentInsuranceLevel =
        newTopic.MIR1_currentInsuranceLevel || newTopic.currentInsuranceLevel;

      topicToSave.typeOfRequest =
        newTopic.typeOfRequest || newTopic.MIR1_typeOfRequest;
      topicToSave.requiredDegreeOfInsurance =
        newTopic.requiredDegreeOfInsurance ||
        newTopic.MIR1_requiredDegreeOfInsurance;
      topicToSave.theReason = newTopic.theReason || newTopic.MIR1_theReason;
      topicToSave.currentInsuranceLevel =
        newTopic.currentInsuranceLevel || newTopic.MIR1_currentInsuranceLevel;
    }

    setCaseTopics((prev) => {
      const newTopics = [...prev, topicToSave];
      return newTopics;
    });

    toast.success(t("topic_added_successfully") || "Topic added successfully");

    return 1;
  };

  const isStep3 = showTopicData;
  const isStep2 = showLegalSection;

  const { prefillSubTopic } = useSubTopicPrefill({
    setValue,
    trigger,
    isEditing,
    editTopic,
    caseDetails: (caseDetailsData as any)?.CaseDetails,
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

  useEffect(() => {
    const details = (caseDetailsData as any)?.CaseDetails;
    if (details) {
      try {
        localStorage.setItem("CaseDetails", JSON.stringify(details));
      } catch { }
    }
  }, [caseDetailsData?.CaseDetails]);

  useEffect(() => {
    if (!isEditing || editTopic?.SubTopicID !== "HIR-1") return;

    setTimeout(() => {

    }, 0);
  }, [isEditing, editTopic, watch]);

  useCaseTopicsPrefill({
    setValue,
    trigger,
    caseTopics,
    isEditing,
    editTopic,
  });

  const [triggerValidateMojContract] = useValidateMojContractMutation();

  useEffect(() => {
    if (subCategory?.value === "MIR-1") {
      const typeOfRequest = watch("MIR1_typeOfRequest");

      const needsAdditionalFields =
        typeOfRequest &&
        ["REQT1", "REQT2", "REQT3"].includes(String(typeOfRequest.value));
      const needsReasonAndCurrentLevel =
        typeOfRequest && String(typeOfRequest.value) === "REQT3";

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
  }, [
    subCategory?.value,
    watch("MIR1_typeOfRequest"),
    register,
    unregister,
    setValue,
  ]);


  useEffect(() => {
    if (isEditing && editTopic && isOpen) {
      setShowLegalSection(true);
      setShowTopicData(true);
    }
  }, [
    isEditing,
    editTopic?.SubTopicID,
    editTopic?.id,
    editTopic?.index,
    isOpen,
    setShowLegalSection,
    setShowTopicData,
  ]);

  useEffect(() => {
    if (isEditing && editTopic && isOpen) {
      setTimeout(() => {
        prefillSubTopic();
      }, 100);
    }
  }, [isEditing, editTopic, isOpen]);

  useEffect(() => {
    if (!isEditing || !editTopic || !isOpen) return;
    const isBR1 =
      editTopic?.SubTopicID === "BR-1" || subCategory?.value === "BR-1";
    if (!isBR1) return;
    const ready =
      Array.isArray(accordingToAgreementLookupData?.DataElements) &&
      accordingToAgreementLookupData?.DataElements?.length > 0;
    if (!ready) return;
    prefillSubTopic();
  }, [
    isEditing,
    editTopic,
    isOpen,
    accordingToAgreementLookupData?.DataElements,
    subCategory?.value,
  ]);


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

  useEffect(() => {
    if (
      !isEditing &&
      (userType === "Worker" || userType === "Embassy User") &&
      defendantStatus === "Establishment" &&
      subCategory?.value &&
      (mainCategory?.value === "WR" ||
        mainCategory?.value === "EDO" ||
        mainCategory?.value === "CMR") &&
      caseId
    ) {
      const subTopicIDsToValidate = ["WR-1", "WR-2", "EDO-3", "CMR-4"];
      if (
        subCategory &&
        subCategory.value &&
        subTopicIDsToValidate.includes(subCategory.value)
      ) {
        triggerValidateMojContract({
          SubTopicID: subCategory.value,
          CaseID: caseId,
          IDNumber: userID,
          UserType: userType,
          AcceptedLanguage: currentLanguage,
        })
          .unwrap()
          .then((result) => {
            if (result) {
              const apiResponse = result;
              const mojContractExists = apiResponse.MojContractExist === "true";
              const errorMessage = apiResponse.MojContractExistError;

              if (mojContractExists && errorMessage) {
                if (timeoutRef.current) {
                  clearTimeout(timeoutRef.current);
                }

                setMojContractError(errorMessage);
                setLastErrorSubCategory(subCategory.value);

                setValue("subCategory", null);
                setValue("acknowledged", false);
                setShowLegalSection(false);
                setShowTopicData(false);

                timeoutRef.current = setTimeout(() => {
                  setMojContractError(null);
                  setLastErrorSubCategory(null);
                }, 10000);
              } else if (
                lastErrorSubCategory === subCategory.value &&
                (mojContractExists === false || !errorMessage)
              ) {
                if (timeoutRef.current) {
                  clearTimeout(timeoutRef.current);
                }
                setMojContractError(null);
                setLastErrorSubCategory(null);
              }
            }
          })
          .catch((_error) => { });
      }
    }
  }, [
    userType,
    defendantStatus,
    subCategory?.value,
    mainCategory?.value,
    caseId,
    userID,
    currentLanguage,
    triggerValidateMojContract,
    lastErrorSubCategory,
    setValue,
    setShowLegalSection,
    setShowTopicData,
    isEditing,
  ]);

  useEffect(() => {
    if (
      !["WR", "EDO", "CMR"].includes(mainCategory?.value) &&
      lastErrorSubCategory
    ) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setMojContractError(null);
      setLastErrorSubCategory(null);
    }
  }, [mainCategory?.value, lastErrorSubCategory]);

  useEffect(() => {
    if (
      lastErrorSubCategory &&
      subCategory?.value &&
      subCategory.value !== lastErrorSubCategory &&
      ["WR", "EDO", "CMR"].includes(mainCategory?.value)
    ) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setMojContractError(null);
      setLastErrorSubCategory(null);
    }
  }, [subCategory?.value, lastErrorSubCategory, mainCategory?.value]);

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

  interface FormData {
    mainCategory: any;
    subCategory: any;
    acknowledged: boolean;
    regulatoryText: string;
    topicData?: any;
    legalSection?: any;
  }



  const fetchTopicData = useCallback(async () => { }, []);

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
      const fromLocationCode =
        editTopic?.fromLocation?.value ??
        editTopic?.FromLocation_Code ??
        editTopic?.fromLocation;
      if (fromLocationCode && regionData?.DataElements) {
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

      const toLocationCode =
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

  const handleRemoveAttachment = async (attachment: any, index: number) => {
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

        toast.success(t("attachments.remove_success"));
      } else {
        toast.error(t("attachments.remove_failed"));
      }
    } catch (error) {
      toast.error(t("attachments.remove_failed"));
    }
  };

  const commissionTypeOpt = watch("commissionType");
  const BPSR1_commissionTypeOpt = watch("BPSR1_commissionType");
  const isBPSR1 =
    subCategory?.value === "BPSR-1" || editTopic?.SubTopicID === "BPSR-1";

  useEffect(() => {
    const effectiveCommissionType = isBPSR1
      ? BPSR1_commissionTypeOpt
      : commissionTypeOpt;

    if (isOtherCommission(effectiveCommissionType)) {
      if (isBPSR1) {
        register("BPSR1_otherCommission", { required: t("fieldRequired") });
      } else {
        register("otherCommission", { required: t("fieldRequired") });
      }
    } else {
      if (isBPSR1) {
        unregister("BPSR1_otherCommission", { keepValue: false });
      } else {
        unregister("otherCommission", { keepValue: false });
      }
    }
  }, [
    commissionTypeOpt,
    BPSR1_commissionTypeOpt,
    isBPSR1,
    register,
    unregister,
    t,
  ]);

  const forAllowanceOpt = watch("WR1_forAllowance");
  const isWR1 =
    subCategory?.value === "WR-1" || editTopic?.SubTopicID === "WR-1";
  const isEditingWR1 = isEditing && editTopic?.SubTopicID === "WR-1";

  useEffect(() => {
    if (!isWR1 || !isEditingWR1) return;

    if (isOtherAllowance(forAllowanceOpt)) {
      register("WR1_otherAllowance", { required: t("fieldRequired") });

      trigger("WR1_otherAllowance");
    } else {
      unregister("WR1_otherAllowance", { keepValue: false });
    }
  }, [forAllowanceOpt, isWR1, isEditingWR1, register, unregister, t, trigger]);

  const otherAllowanceValue = watch("WR1_otherAllowance");
  useEffect(() => {
    if (
      isWR1 &&
      isEditingWR1 &&
      isOtherAllowance(forAllowanceOpt) &&
      otherAllowanceValue !== undefined
    ) {
      trigger("WR1_otherAllowance");
    }
  }, [otherAllowanceValue, isWR1, isEditingWR1, forAllowanceOpt, trigger]);

  const typeOfRequestOpt = watch("MIR1_typeOfRequest");
  const isMIR1 =
    subCategory?.value === "MIR-1" || editTopic?.SubTopicID === "MIR-1";
  useEffect(() => {
    if (!isMIR1) return;

    const requiresAdditionalFields =
      typeOfRequestOpt &&
      ["REQT1", "REQT2", "REQT3"].includes(String(typeOfRequestOpt.value));
    const requiresReasonAndCurrentLevel =
      typeOfRequestOpt && String(typeOfRequestOpt.value) === "REQT3";

    if (requiresAdditionalFields) {
      register("MIR1_requiredDegreeOfInsurance", {
        required: t("fieldRequired"),
      });
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

  const restState = () => {
    if (editTopic !== null) {
      setEditTopic(null);
      setEditTopicIndex(null);
    }
    reset();
    if (mainCategory !== null) {
      setValue("subCategory", null);
      setValue("mainCategory", null);
      setValue("acknowledged", false);
    }
    setShowLegalSection(false);
    setShowTopicData(false);
  };

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

                      if (timeoutRef.current) {
                        clearTimeout(timeoutRef.current);
                      }
                      setMojContractError(null);
                      setLastErrorSubCategory(null);
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
                {mojContractError && (
                  <div
                    className="flex flex-col items-start p-4 md:p-6 gap-4 relative w-full bg-[#FFFBFA] border border-[#FECDCA] rounded-lg mb-4"
                    style={{ boxSizing: "border-box", isolation: "isolate" }}
                  >
                    <div className="flex items-center w-full">
                      <div className="flex-shrink-0 me-4 md:me-6">
                        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white">
                          <img
                            src={FeaturedIcon}
                            alt="Notification Icon"
                            className="w-10 h-10"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-red-700 font-bold text-xl mb-1">
                          {tCommon("notification")}
                        </div>
                        <div className="text-gray-700 text-base">
                          {t(mojContractError) !== mojContractError
                            ? t(mojContractError)
                            : mojContractError}
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
                        className="end-4 ms-4 md:me-6 text-gray-400 hover:text-gray-600"
                        aria-label="Close"
                      >
                        <span className="text-2xl font-bold">&times;</span>
                      </button>
                    </div>
                  </div>
                )}
                <RHFFormProvider {...methods}>
                  <DateValidationWrapper>
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
                  </DateValidationWrapper>
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
                      variant={
                        isEditing
                          ? "primary"
                          : isValid && acknowledged
                            ? "primary"
                            : "disabled"
                      }
                      typeVariant={
                        isEditing
                          ? "brand"
                          : isValid && acknowledged
                            ? "brand"
                            : "freeze"
                      }
                      size="sm"
                      type="button"
                      onClick={() => {
                        if (typeof window !== "undefined") {
                        }
                        if (isEditing) {
                          handleUpdate();
                        } else if (isStep3) {
                          handleSend();
                        } else if (isStep2 && acknowledged) {
                          handleSave();
                        }
                      }}
                      className="text-sm sm:text-base font-medium"
                      disabled={
                        isEditing ? !isValid : !isValid || !acknowledged
                      }
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
                    setCaseTopics((prev) =>
                      prev.filter((_, i) => i !== delTopic?.index)
                    );
                    setShowDeleteConfirm(false);
                    setDelTopic(null);

                    restState();
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
