import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
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
import { FormProvider } from "@/providers/FormContext";
import { setFormData } from "@/redux/slices/formSlice";
import StepNavigation from "@/shared/modules/case-creation/components/StepNavigation";
import { useNavigationService } from "@/shared/hooks/useNavigationService";
import { steps } from "@/shared/modules/case-creation/components/tabs/tabsConfig";
import { useUpdateHearingTopicsMutation } from "../../api/create-case/apis";
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

function EditHearingTopicsDetails({ showFooter }: { showFooter: boolean }) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    getValues,
    formState,
    formState: {
      errors,
      isValid,
      isDirty,
      isSubmitting,
      isSubmitSuccessful,
      submitCount,
    },
  } = useForm<any>();
  // //console.log("isValid EditHearingTopicsDetails", isValid);
  const [getCookie, setCookie] = useCookieState({ caseId: "" });
  const [caseId] = useState(getCookie("caseId"));
  const [lastSaved, setLastSaved] = useState(false);
  // const { updateParams, searchParams } = useNavigationService();
  const { updateParams, currentStep, currentTab } = useNavigationService();
  const [updateHearingTopics, { isLoading: addHearingLoading }] =
    useUpdateHearingTopicsMutation();
  const UserClaims: TokenClaims = getCookie("userClaims");
  const userType = getCookie("userType");
  const mainCategory2 = getCookie("mainCategory")?.value;
  const subCategory2 = getCookie("subCategory")?.value;
  const userID = getCookie("userClaims").UserID;
  const fileNumber = getCookie("userClaims")?.File_Number;

  const { i18n } = useTranslation();
  const currentLanguage = i18n.language.toUpperCase();

  // Submit handler
  const onSubmit = (data: TopicFormValues) => {};

  const mainCategory = watch("mainCategory") ?? null;
  const subCategory: any = watch("subCategory") ?? null;
  // //console.log(subCategory?.value);
  const { t } = useTranslation("hearingtopics");
  const { isOpen, close, toggle } = useToggle();
  const userClaims = getCookie("userClaims");
  const [caseTopics, setCaseTopics] = useState<any[]>([]);
  // //console.log("caseTopics???????????????????", caseTopics);

  //<===================================== APIs =============================================>
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
  // //console.log("travelingWayData", travelingWayData);
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

  const { data: subTopicsLookupData, isFetching: subTopicsLoading } =
    useSubTopicsSubLookupQuery(
      {
        LookupType: "CaseElements",
        ModuleKey: mainCategory?.value,
        ModuleName: "SubTopics",
        SourceSystem: "E-Services",
        AcceptedLanguage: currentLanguage,
      },
      {
        skip: !subCategory?.value,
      }
    );

  // const {
  //   data,
  //   isLoading: isLoadingCaseDetails,
  //   isError,
  //   refetch,
  // } = useGetCaseDetailsQuery(
  //   {
  //     ...userConfigs[userType],
  //     CaseID: caseId ?? "",
  //     AcceptedLanguage: i18n.language === "ar" ? "AR" : "EN",
  //     SourceSystem: "E-Services",
  //   },
  //   { skip: !caseId }
  // );

  // useEffect(() => {
  //   if (caseId) {
  //     refetch();
  //   }
  // }, [caseId, i18n.language, refetch]);

  // useEffect(() => {
  //   if (data) {
  //     data?.CaseDetails?.CaseTopics
  //       ? setCaseTopics(data?.CaseDetails?.CaseTopics)
  //       : setCaseTopics([]);

  //     // if (data) {
  //     //   data?.CaseDetails?.CaseTopics
  //     //     ? setCaseTopics(data?.CaseDetails?.CaseTopics)
  //     //     : setCaseTopics([]);

  //     //   // Initialize attachments from API response
  //     //   if (data?.CaseDetails?.OtherAttachments) {
  //     //     const initialAttachments = data.CaseDetails.OtherAttachments.map(
  //     //       (attachment: any) => ({
  //     //         id: attachment.FileKey,
  //     //         name: attachment.FileName,
  //     //         type: attachment.FileType,
  //     //         url: attachment.FileKey, // You might need to construct a proper URL here
  //     //       })
  //     //     );
  //     //     initializeAttachments(initialAttachments);
  //     //   }
  //     // }
  //   }
  // }, [data]);

  const [triggerCaseDetailsQuery, { data: caseDetailsData }] =
    useLazyGetCaseDetailsQuery();

  useEffect(() => {
    if (caseId) {
      const userConfigs: any = {
        Worker: {
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

      triggerCaseDetailsQuery({
        ...userConfigs[userType],
        CaseID: caseId,
        AcceptedLanguage: currentLanguage,
        SourceSystem: "E-Services",
      });
    }
  }, [caseId, userClaims?.UserID, currentLanguage, triggerCaseDetailsQuery]);

  useEffect(() => {
    console.log("caseDetailsData", caseDetailsData);
    if (caseDetailsData?.CaseDetails) {
      setCaseTopics(caseDetailsData.CaseDetails.CaseTopics);
    }
  }, [caseDetailsData]);

  useEffect(() => {
    console.log("Updated topics:", caseTopics);
  }, [caseTopics]);

  const matchedSubCategory = subTopicsLookupData?.DataElements?.find(
    (item: any) => item.ElementKey === subCategory?.value
  );
  const [delTopic, setDelTopic] = useState<any | null>(null);

  const [editTopic, setEditTopic] = useState<any | null>(null);
  const [editTopicIndex, setEditTopicIndex] = useState<number | null>(null);
  // //console.log("editTopic", editTopic);
  const [showLegalSection, setShowLegalSection] = useState(false);
  const [showTopicData, setShowTopicData] = useState(false);
  const acknowledged = watch("acknowledged");
  // //console.log("acknowledged", acknowledged);
  const fromPlace = watch("fromPlace") ?? null;
  const toPlace = watch("toPlace") ?? null;
  const hijriDate = watch("hijriDate");
  const gregorianDate = watch("gregorianDate");
  const decisionNumber = watch("decisionNumber");
  const totalAmount = watch("totalAmount");
  const regulatoryText = t("regulatory_text_content");
  const { setDate } = useDateContext();

  const [pagination, setPagination] = useState({
    pageIndex: 0, // 0-based index
    pageSize: 5, // items per page
  });

  // Calculate paginated data

  const getPaginatedTopics = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    return caseTopics.slice(start, end);
  }, [caseTopics, pagination.pageIndex, pagination.pageSize]);

  // تحديث حالة editTopic عندما يتم تحديد موضوع
  const handleTopicSelect = (topic: any, index: number) => {
    console.log("topicvvvvvvv", topic);
    const formattedTopic = {
      ...topic,
      subCategory: {
        value: topic.subCategory?.value || topic.SubTopicID,
        label: topic.subCategory?.label || topic.SubTopicName,
      },
      mainCategory: {
        value: topic.mainCategory?.value || topic.MainTopicID,
        label: topic.mainCategory?.label || topic.MainSectionHeader,
      },
      // تنسيق التواريخ
      date_hijri: topic.date_hijri || topic.Date_New,
      from_date_hijri: topic.from_date_hijri || topic.FromDateHijri,
      to_date_hijri: topic.to_date_hijri || topic.ToDateHijri,
      // تنسيق القيم الرقمية
      amount: topic.compensationAmount ? topic.compensationAmount : (topic.amount || topic.Amount),
      wagesAmount: topic.wagesAmount || topic.WagesAmount,
      bonusAmount: topic.bonusAmount || topic.BonusAmount,
      payDue: topic.payDue || topic.PayDue,
      // تنسيق القيم النصية
      durationOfLeaveDue: topic.durationOfLeaveDue || topic.DurationOfLeaveDue,
      theReason: topic.theReason || topic.TheReason,
      currentPosition: topic.currentPosition || topic.CurrentPosition,
      // تنسيق القيم المنسدلة
      forAllowance: topic.forAllowance || {
        value: topic.ForAllowance,
        label: topic.ForAllowance,
      },
      commissionType: topic.commissionType || {
        value: topic.CommissionType,
        label: topic.CommissionType,
      },
      accordingToAgreement: topic.accordingToAgreement || {
        value: topic.AccordingToAgreement,
        label: topic.AccordingToAgreement,
      },
      travelingWay: topic.travelingWay || {
        value: topic.TravelingWay,
        label: topic.TravelingWay,
      },
    };

    setEditTopic(formattedTopic);
    setEditTopicIndex(index);
    reset(formattedTopic);
    toggle();
  };
  /**
  
    const handleTopicSelect = (topic: any) => {
    console.log("topicvvvvvvv", topic);
    const formattedTopic = {
      ...topic,
      subCategory: {
        value: topic.subCategory?.value || topic.SubTopicID,
        label: topic.subCategory?.label || topic.SubTopicName,
      },
      mainCategory: {
        value: topic.mainCategory?.value || topic.MainTopicID,
        label: topic.mainCategory?.label || topic.MainSectionHeader,
      },
      // تنسيق التواريخ
      date_hijri: topic.date_hijri || topic.Date_New,
      from_date_hijri: topic.from_date_hijri || topic.FromDateHijri,
      to_date_hijri: topic.to_date_hijri || topic.ToDateHijri,
      // تنسيق القيم الرقمية
      amount: topic.amount || topic.Amount,
      wagesAmount: topic.wagesAmount || topic.WagesAmount,
      bonusAmount: topic.bonusAmount || topic.BonusAmount,
      payDue: topic.payDue || topic.PayDue,
      // تنسيق القيم النصية
      durationOfLeaveDue: topic.durationOfLeaveDue || topic.DurationOfLeaveDue,
      theReason: topic.theReason || topic.TheReason,
      currentPosition: topic.currentPosition || topic.CurrentPosition,
      // تنسيق القيم المنسدلة
      forAllowance: topic.forAllowance || {
        value: topic.ForAllowance,
        label: topic.ForAllowance,
      },
      commissionType: topic.commissionType || {
        value: topic.CommissionType,
        label: topic.CommissionType,
      },
      accordingToAgreement: topic.accordingToAgreement || {
        value: topic.AccordingToAgreement,
        label: topic.AccordingToAgreement,
      },
      travelingWay: topic.travelingWay || {
        value: topic.TravelingWay,
        label: topic.TravelingWay,
      },
    };

    // Set edit topic and reset form values
    setEditTopic(formattedTopic);
    // Populate the form with the selected topic values
    reset(formattedTopic);
    // Ensure legal and data sections are visible when editing
    setShowLegalSection(true);
    setShowTopicData(true);
    toggle();
  }; 



  */

  const columns: any = useMemo(
    () =>
      getHearingTopicsColumns({
        t,
        onEdit: (topic, index) => {
          handleTopicSelect(topic, index);
        },
        onDel: (topic) => {
          setCaseTopics((prev) => prev.filter((t) => t !== topic));
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
    saveTopic();
    // Get all current form values
    const latestFormValues = getValues();

    // Validate form

    // Proceed with your logic
    reset();
    setShowLegalSection(false);
    setValue("subCategory", null);
    setValue("mainCategory", null);
    setShowTopicData(false);
    setEditTopic(null);
  };

  const handleUpdate = () => {
    if (!editTopic) return;

    const updatedValues = getValues();
    console.log("Updated Values:", updatedValues);

    const updatedTopic = {
      ...updatedValues,
      subCategory: {
        value: updatedValues.subCategory?.value || editTopic.subCategory?.value,
        label: updatedValues.subCategory?.label || editTopic.subCategory?.label,
      },
      acknowledged: updatedValues.acknowledged || editTopic.acknowledged,
      mainCategory: updatedValues.mainCategory?.value || editTopic.mainCategory,
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
      typeOfRequest:
        updatedValues.typeOfRequest?.value || editTopic?.typeOfRequest?.label,
      kindOfHoliday:
        updatedValues.kindOfHoliday?.value || editTopic?.kindOfHoliday?.label,
      commissionType:
        updatedValues.commissionType?.value || editTopic?.commissionType?.label,
      accordingToAgreement:
        updatedValues.accordingToAgreement?.value ||
        editTopic?.accordingToAgreement?.label,
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
      forAllowance: updatedValues.forAllowance?.value || editTopic.forAllowance,
      rewardType: updatedValues.rewardType || editTopic.rewardType,
      consideration: updatedValues.consideration || editTopic.consideration,
      travelingWay: updatedValues.travelingWay?.value || editTopic.travelingWay,
      AdditionalDetails: updatedValues.additionalDetails || editTopic.AdditionalDetails
    };

    console.log("Updated Topic:", updatedTopic);
    // console.log("Topic:", topic);

    setCaseTopics((prev) =>
      prev.map((topic, idx) => (idx === editTopicIndex ? updatedTopic : topic))
    );

    console.log("finallll", caseTopics);

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

  const handleSaveApi = async () => {
    //console.log("dddd");

    if (caseTopics.length) {
      //console.log("dssdadssssssssssss");
      try {
        setLastAction("Save"); // Set action FIRST before API call
        const response = await updateHearingTopics(
          getPayloadBySubTopicID(caseTopics, subCategory, "Save", caseId) // Pass explicit action
        ).unwrap();
        setLastSaved(true);
      } catch (error) {
        setLastAction(undefined); // Reset on error
      }
    }
  };

  const handleNext = async () => {
    const latestFormValues = getValues();
    setFormData(latestFormValues);

    try {
      setLastAction("Next"); // Set action FIRST before API call
      const response = await updateHearingTopics(
        getPayloadBySubTopicID(caseTopics, subCategory, "Next", caseId) // Pass explicit action
      ).unwrap();

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
      setLastAction(undefined); // Reset on error
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

    console.log(newTopic);

    for (const [key, value] of Object.entries(newTopic)) {
      if (
        value === "" &&
        key !== "housingSpecificationsInContract" &&
        key !== "actualHousingSpecifications" &&
        key !== "housingSpecificationInByLaws"
      ) {
        return 0;
      }
    }

    console.log(newTopic);

    const topicToSave = {
      ...newTopic,
      MainTopicID: newTopic.mainCategory.value,
      SubTopicID: newTopic.subCategory.value,
      MainSectionHeader: newTopic.mainCategory.label,
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
      RequestDateHijri: newTopic.request_date_hijri,
      DateHijri: newTopic.date_hijri,
      GregorianDate: newTopic.gregorianDate,
      DecisionNumber: newTopic.decisionNumber,
      RegionCode: newTopic.DefendantsEstablishmentRegion,
      CityCode: newTopic.DefendantsEstablishmentCity,
      OccupationCode: newTopic.DefendantsEstablishOccupation,
      GenderCode: newTopic.DefendantsEstablishmentGender,
      NationalityCode: newTopic.DefendantsEstablishmentNationality,
      PrisonerId: newTopic.DefendantsEstablishmentPrisonerId,
      FromDateHijri: newTopic.from_date_hijri,
      ToDateHijri: newTopic.to_date_hijri,
      OverdueWagesAmount: newTopic.overdueWagesAmount,
      ToDateGregorian: newTopic.to_date_gregorian,
      FromDateGregorian: newTopic.from_date_gregorian,
      ForAllowance: newTopic?.forAllowance?.value,
      RewardType: newTopic.rewardType,
      Consideration: newTopic.consideration,
      TravelingWay: newTopic.travelingWay,
      PenalityType: newTopic.typesOfPenalties,
      LoanAmount: newTopic.loanAmount,
    };

    setCaseTopics((prev) => [...prev, topicToSave]);
    return 1;
  };

  const isStep3 = showTopicData;
  const isStep2 = showLegalSection;
  const isEditing = Boolean(editTopic);

  const formLayout = useMemo(() => {
    if (userType === "Worker" || userType === "Embassy User") {
      return useFormLayoutWorker({
        t: t,
        MainTopicID: mainCategory,
        SubTopicID: isEditing
          ? editTopic?.subCategory?.value
          : subCategory?.value,
        FromLocation: fromPlace,
        ToLocation: toPlace,
        AcknowledgementTerms: acknowledged,
        showLegalSection: showLegalSection,
        showTopicData: showTopicData,
        setValue: (field: string, value: any) => setValue(field as any, value),
        regulatoryText: regulatoryText,
        handleAdd: goToLegalStep,
        handleAcknowledgeChange: (val: boolean) =>
          setValue("acknowledged", val),
        handleAddTopic: handleAddTopic,
        decisionNumber: decisionNumber || "",
        isEditing: isEditing,
        mainCategoryData: mainCategoryData,
        subCategoryData: subCategoryData,
        watch: watch,
        forAllowanceData: forAllowanceData,
        typeOfRequestLookupData: typeOfRequestLookupData,
        commissionTypeLookupData: commissionTypeLookupData,
        accordingToAgreementLookupData: accordingToAgreementLookupData,
        matchedSubCategory: matchedSubCategory,
        subTopicsLoading: subTopicsLoading,
        amountPaidData: amountPaidData,
        leaveTypeData: leaveTypeData,
        travelingWayData: travelingWayData,
        isValid: isValid,
        isMainCategoryLoading: isFetching || isLoading,
        isSubCategoryLoading: isSubCategoryLoading,
        editTopic: editTopic,
        caseTopics: caseTopics,
      });
    } else {
      return useFormLayoutEstablishment({
        t: t,
        MainTopicID: mainCategory,
        SubTopicID: isEditing
          ? editTopic?.subCategory?.value
          : subCategory?.value,
        FromLocation: fromPlace,
        ToLocation: toPlace,
        AcknowledgementTerms: acknowledged,
        showLegalSection: showLegalSection,
        showTopicData: showTopicData,
        setValue: (field: string, value: any) => setValue(field as any, value),
        regulatoryText: regulatoryText,
        handleAdd: goToLegalStep,
        handleAcknowledgeChange: (val: boolean) =>
          setValue("acknowledged", val),
        handleAddTopic: handleAddTopic,
        decisionNumber: decisionNumber || "",
        isEditing: isEditing,
        mainCategoryData: mainCategoryData,
        subCategoryData: subCategoryData,
        watch: watch,
        forAllowanceData: forAllowanceData,
        typeOfRequestLookupData: typeOfRequestLookupData,
        commissionTypeLookupData: commissionTypeLookupData,
        accordingToAgreementLookupData: accordingToAgreementLookupData,
        matchedSubCategory: matchedSubCategory,
        subTopicsLoading: subTopicsLoading,
        amountPaidData: amountPaidData,
        leaveTypeData: leaveTypeData,
        travelingWayData: travelingWayData,
        isValid: isValid,
        isMainCategoryLoading: isFetching || isLoading,
        isSubCategoryLoading: isSubCategoryLoading,
        editTopic: editTopic,
        caseTopics: caseTopics,
      });
    }
  }, [
    userType,
    t,
    mainCategory,
    subCategory,
    fromPlace,
    toPlace,
    acknowledged,
    showLegalSection,
    showTopicData,
    setValue,
    regulatoryText,
    goToLegalStep,
    handleAddTopic,
    decisionNumber,
    isEditing,
    mainCategoryData,
    subCategoryData,
    watch,
    forAllowanceData,
    typeOfRequestLookupData,
    commissionTypeLookupData,
    accordingToAgreementLookupData,
    matchedSubCategory,
    subTopicsLoading,
    amountPaidData,
    leaveTypeData,
    travelingWayData,
    isValid,
    isFetching,
    isLoading,
    isSubCategoryLoading,
    editTopic,
    caseTopics,
  ]);
  // //console.log("formLayout", formLayout);
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
  } = useAttachments();

  useEffect(() => {
    if (mainCategory) {
      setValue("subCategory", null);
    }
  }, [mainCategory, setValue]);

  useEffect(() => {
    if (editTopic) {
      setValue("subCategory", {
        value: editTopic.subCategory?.value,
        label: editTopic.subCategory?.label,
      });
    }
  }, [editTopic, setValue]);

  return (
    <Suspense fallback={<TableLoader />}>
      <StepNavigation<FormData>
        onSubmit={handleSubmit(onSubmit)} // ✅ both valid/invalid handlers
        isValid={isValid}
        isFirstStep={currentStep === 0 && currentTab === 0}
        isLastStep={currentStep === 3 - 1}
        currentStep={currentStep}
        goToNextStep={handleNext}
        goToPrevStep={handlePrevious}
        resetSteps={() => updateParams(0, 0)}
        handleSave={handleSaveApi}
        canProceed={!!caseTopics.length} // true if caseTopic has value
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
                <div className="mx-4">
                  <p className="text-primary-600 font-semibold text-md leading-6 font-primary mb-7xl">
                    {t("lawsuit_topics") || "Lawsuit Topics"}
                  </p>
                  <Button
                    variant="primary"
                    size="xs"
                    onClick={() => {
                      reset();
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
                    onView={handleViewAttachment}
                  />

                  <AttachmentModal
                    isOpen={showAttachmentModal}
                    onClose={closeAttachmentModal}
                    onSave={handleAttachmentSave}
                  />
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
              >
                <FormProvider>
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
                </FormProvider>
              </Modal>
            </Suspense>
          )}
          <FilePreviewModal file={previewFile} onClose={closePreview} />
        </div>
      </StepNavigation>
    </Suspense>
  );
}

export default EditHearingTopicsDetails;
