// import {
//   lazy,
//   Suspense,
//   useCallback,
//   useEffect,
//   useMemo,
//   useState,
// } from "react";
// import { useForm, useWatch } from "react-hook-form";
// import Button from "@/shared/components/button";
// import TableLoader from "@/shared/components/loader/TableLoader";
// import { CustomPagination } from "@/shared/components/pagination/CustomPagination";
// import useToggle from "@/shared/hooks/generalSate";
// import { useTranslation } from "react-i18next";
// import auditIcon from "@/assets/audit-01.svg";
// import { Add01Icon } from "hugeicons-react";
// import { useDateContext } from "@/shared/components/calanders/DateContext";
// import AttachmentSection from "./components/AttachmentSection";
// import AttachmentModal from "./components/AttachmentModal";
// import FilePreviewModal from "../add-attachments/FilePreviewModal";
// import { useLookup } from "../../api/hook/useLookup";
// import { useSubTopicsSubLookupQuery } from "../../api/create-case/addHearingApis";
// import { FormProvider } from "@/providers/FormContext";
// import { setFormData } from "@/redux/slices/formSlice";
// import StepNavigation from "@/shared/modules/case-creation/components/StepNavigation";
// import { useNavigationService } from "@/shared/hooks/useNavigationService";
// import { steps } from "@/shared/modules/case-creation/components/tabs/tabsConfig";
// import { useSaveHearingTopicsMutation } from "../../api/create-case/apis";
// import { useCookieState } from "../../hooks/useCookieState";
// import { TableSkeletonLoader } from "@/shared/components/loader/SkeletonLoader";
// import { Topic, TopicFormValues } from "./hearing.topics.types";
// import { getHearingTopicsColumns } from "./config/colums";
// import { useAttachments } from "./hooks/useAttachments";
// import { useFormLayout as useFormLayoutEstablishment } from "./config/forms.layout.establishment";
// import { useFormLayout as useFormLayoutWorker } from "./config/forms.layout.worker";
// import { getPayloadBySubTopicID } from "./api/establishment.add.case.payload";
// import { useGetCaseDetailsQuery, useLazyGetCaseDetailsQuery } from "@/features/manage-hearings/api/myCasesApis";
// import { TokenClaims } from "@/features/login/components/AuthProvider";
// import useCaseDetailsPrefill from "../../hooks/useCaseDetailsPrefill";

// const Modal = lazy(() => import("@/shared/components/modal/Modal"));
// const ReusableTable = lazy(() =>
//   import("@/shared/components/table/ReusableTable").then((module) => ({
//     default: module.ReusableTable,
//   }))
// );
// const DynamicForm = lazy(() =>
//   import("@/shared/components/form/DynamicForm").then((module) => ({
//     default: module.DynamicForm,
//   }))
// );
// const HearingCta = lazy(() => import("./components/HearingCta"));

// export const useHearingTopics = () => {
//   const { i18n } = useTranslation();
//   const currentLanguage = i18n.language.toUpperCase();

//   return {
//     getTopics: () => ({
//       url: `/WeddiServices/V1/Topics`,
//       params: {
//         AcceptedLanguage: currentLanguage,
//         SourceSystem: "E-Services",
//       },
//     }),
//   };
// };

// function HearingTopicsDetails({ showFooter }: { showFooter: boolean }) {
//   const {
//     register,
//     handleSubmit,
//     watch,
//     setValue,
//     reset,
//     control,
//     getValues,
//     formState,
//     formState: {
//       errors,
//       isValid,
//       isDirty,
//       isSubmitting,
//       isSubmitSuccessful,
//       submitCount,
//     },
//   } = useForm<any>();
//   // //console.log("isValid HearingTopicsDetails", isValid);
//   const [getCookie] = useCookieState();
//   const [caseId] = useState(getCookie("caseId"));
//   const [lastSaved, setLastSaved] = useState(false);
//   const { updateParams, currentStep, currentTab } = useNavigationService();
//   const [saveHearingTopics, { isLoading: addHearingLoading }] =
//     useSaveHearingTopicsMutation();
//     const { i18n } = useTranslation();
//     const currentLanguage = i18n.language.toUpperCase();
//     const userClaims = getCookie("userClaims");
//     const [caseTopics, setCaseTopics] = useState<any[]>([]);
//     const UserClaims: TokenClaims = getCookie("userClaims");
//   const userType = getCookie("userType");

//   // Prefill fields when continuing an incomplete case
//   useCaseDetailsPrefill((field, value) => {
//     setValue(field as any, value);
//     if (field === "CaseTopics") setCaseTopics(value as any[]);
//   });
//   const mainCategory2 = getCookie("mainCategory")?.value;
//   const subCategory2 = getCookie("subCategory")?.value;
//   const userID = getCookie("userClaims").UserID;
//   const fileNumber = getCookie("userClaims")?.File_Number;



// const [triggerCaseDetailsQuery, { data: caseDetailsData }] = useLazyGetCaseDetailsQuery();

// useEffect(() => {
//   if (caseId) {
//     const userConfigs: any = {
//       Worker: {
//         UserType: userType,
//         IDNumber: userID,
//       },
//       Establishment: {
//         UserType: userType,
//         IDNumber: userID,
//         FileNumber: fileNumber,
//       },
//       "Legal representative": {
//         UserType: userType,
//         IDNumber: userID,
//         MainGovernment:mainCategory2 ||  "",
//         SubGovernment: subCategory2 ||  "",
//       },
//     } ;

//     triggerCaseDetailsQuery({
//       ...userConfigs[userType],
//       CaseID: caseId,
//       AcceptedLanguage: currentLanguage,
//       SourceSystem: "E-Services",
//     });
//   }
// }, [caseId, userClaims?.UserID, currentLanguage, triggerCaseDetailsQuery]);

// useEffect(() => {
//   // console.log("caseDetailsData", caseDetailsData);
//   if (caseDetailsData?.CaseDetails) {
//     setCaseTopics(caseDetailsData.CaseDetails.CaseTopics);
//   }
// }, [caseDetailsData]);

  
//   // console.log("currentStep", currentStep);
//   // console.log("currentTab", currentTab);

//   // Submit handler
//   const onSubmit = (data: TopicFormValues) => {};

//   const mainCategory = watch("mainCategory") ?? null;
//   const subCategory: any = watch("subCategory") ?? null;
//   // console.log("subCategory", subCategory);
//   // console.log("mainCategory", mainCategory);
//   // //console.log(subCategory?.value);
//   const { t } = useTranslation("hearingtopics");
//   const { isOpen, close, toggle } = useToggle();

//   // //console.log("caseTopics???????????????????", caseTopics);

//   //<===================================== APIs =============================================>
//   const lookup = useLookup();
//   const {
//     data: mainCategoryData,
//     isFetching,
//     isLoading,
//   } = lookup.mainCategory(isOpen);
//   const { data: subCategoryData, isFetching: isSubCategoryLoading } =
//     lookup.subCategory(mainCategory?.value);

//   const { data: amountPaidData } = lookup.amountPaidCategory(
//     subCategory?.value
//   );
//   const { data: travelingWayData } = lookup.travelingWayCategory(
//     subCategory?.value
//   );
//   const { data: leaveTypeData } = lookup.leaveTypeCategory(subCategory?.value);
//   const { data: forAllowanceData } = lookup.forAllowance(subCategory?.value);
//   const { data: typeOfRequestLookupData } = lookup.typeOfRequest(
//     subCategory?.value
//   );
//   const { data: commissionTypeLookupData } = lookup.commissionType(
//     subCategory?.value
//   );
//   const { data: accordingToAgreementLookupData } = lookup.accordingToAgreement(
//     subCategory?.value
//   );

//   const { data: subTopicsLookupData, isFetching: subTopicsLoading } =
//     useSubTopicsSubLookupQuery(
//       {
//         LookupType: "CaseElements",
//         ModuleKey: mainCategory?.value,
//         ModuleName: "SubTopics",
//         SourceSystem: "E-Services",
//         AcceptedLanguage: currentLanguage,
//       },
//       {
//         skip: !subCategory?.value,
//       }
//     );

//   const matchedSubCategory = subTopicsLookupData?.DataElements?.find(
//     (item: any) => item.ElementKey === subCategory?.value
//   );
//   const [delTopic, setDelTopic] = useState<any | null>(null);

//   const [editTopic, setEditTopic] = useState<any | null>(null);
//   const [editTopicIndex, setEditTopicIndex] = useState<number | null>(null);
//   // //console.log("editTopic", editTopic);
//   const [showLegalSection, setShowLegalSection] = useState(false);
//   const [showTopicData, setShowTopicData] = useState(false);
//   const acknowledged = watch("acknowledged");
//   // //console.log("acknowledged", acknowledged);
//   const fromPlace = watch("fromPlace") ?? null;
//   const toPlace = watch("toPlace") ?? null;
//   const hijriDate = watch("hijriDate");
//   const gregorianDate = watch("gregorianDate");
//   const decisionNumber = watch("decisionNumber");
//   const totalAmount = watch("totalAmount");
//   const regulatoryText = t("regulatory_text_content");
//   const { setDate } = useDateContext();

//   const [pagination, setPagination] = useState({
//     pageIndex: 0, // 0-based index
//     pageSize: 5, // items per page
//   });

//   // Calculate paginated data
//   const getPaginatedTopics = useMemo(() => {
//     const start = pagination.pageIndex * pagination.pageSize;
//     const end = start + pagination.pageSize;
//     return caseTopics.slice(start, end);
//   }, [caseTopics, pagination.pageIndex, pagination.pageSize]);

//   const columns: any = useMemo(
//     () =>
//       getHearingTopicsColumns({
//         t,
//         onEdit: (topic, index) => {
//           setEditTopic(topic);
//           setEditTopicIndex(index);
//           toggle();
//         },
//         onDel: (topic) => {
//           // Remove the topic from caseTopics array
//           setCaseTopics((prev) => prev.filter((t) => t !== topic));
//         },
//       }),
//     [t, toggle]
//   );

//   const goToLegalStep = () => {
//     if (!mainCategory || !subCategory) return;
//     setShowLegalSection(true);
//     setShowTopicData(false);
//   };

//   const goToTopicDataStep = () => {
//     if (!acknowledged) return;
//     setShowTopicData(true);
//   };

//   const handleSend = () => {
//    let fillingForm = saveTopic();
//    if(fillingForm){
//     reset();
//     setDate({ hijri: null, gregorian: null, dateObject: null });
//     setShowLegalSection(false);
//     setShowTopicData(false);
//     setEditTopic(null);
//     setEditTopicIndex(null);
//     close();
//   }
//   };

//   const handleAddTopic = async () => {
//     saveTopic();
//     // Get all current form values
//     const latestFormValues = getValues();

//     // Validate form

//     // Proceed with your logic
//     reset();
//     setShowLegalSection(false);
//     setValue("subCategory", null);
//     setValue("mainCategory", null);
//     setShowTopicData(false);
//     setEditTopic(null);
//   };
//   const handleUpdate = () => {
//     if (!editTopic) return;

//     const updatedValues = getValues();
//     // //console.log("updated run");
//     // console.log("updatedValues", updatedValues);

//     const updatedTopic = {
//       ...editTopic,
//       AcknowledgedTerms: updatedValues.acknowledged,
//       MainCategoryId:
//         updatedValues.mainCategory?.value || editTopic.mainCategory,
//       SubCategoryId: updatedValues.subCategory?.value || editTopic.subCategory,
//       FromLocation: updatedValues.fromPlace || editTopic.fromPlace,
//       ToLocation: updatedValues.toPlace || editTopic.toPlace,
//       Amount: updatedValues.amount || editTopic.amount,
//       payDue: updatedValues.payDue || editTopic.payDue,
//       durationOfLeaveDue:
//         updatedValues.durationOfLeaveDue || editTopic.durationOfLeaveDue,

//       wagesAmount: updatedValues.wagesAmount || editTopic.wagesAmount,

//       compensationAmount:
//         updatedValues.compensationAmount || editTopic.compensationAmount,
//       injuryType: updatedValues.injuryType || editTopic.injuryType,

//       typesOfPenalties: updatedValues.typesOfPenalties || editTopic.typesOfPenalties,

//       bonusAmount: updatedValues.bonusAmount || editTopic.bonusAmount,
//       otherCommission:
//         updatedValues.otherCommission || editTopic.otherCommission,
//       amountOfCompensation:
//         updatedValues.amountOfCompensation || editTopic.amountOfCompensation,
//       damagedValue: updatedValues.damagedValue || editTopic.damagedValue,
//       requiredJobTitle:
//         updatedValues.requiredJobTitle || editTopic.requiredJobTitle,
//       currentJobTitle:
//         updatedValues.currentJobTitle || editTopic.currentJobTitle,

//       damagedType: updatedValues.damagedType || editTopic.damagedType,
//       currentInsuranceLevel:
//         updatedValues.currentInsuranceLevel || editTopic.currentInsuranceLevel,
//       theReason: updatedValues.theReason || editTopic.theReason,

//       theWantedJob: updatedValues.theWantedJob || editTopic.theWantedJob,
//       currentPosition:
//         updatedValues.currentPosition || editTopic.currentPosition,

//       typeOfRequest:
//         updatedValues.typeOfRequest?.value || editTopic?.typeOfRequest?.label,
//       kindOfHoliday:
//         updatedValues.kindOfHoliday?.value || editTopic?.kindOfHoliday?.label,

//       commissionType:
//         updatedValues.commissionType?.value || editTopic?.commissionType?.label,

//       accordingToAgreement:
//         updatedValues.accordingToAgreement?.value ||
//         editTopic?.accordingToAgreement?.label,
//       loanAmount: updatedValues.loanAmount || editTopic?.loanAmount,
//       amountRatio: updatedValues.amountRatio || editTopic?.amountRatio,
//       requiredDegreeOfInsurance:
//         updatedValues.requiredDegreeOfInsurance ||
//         editTopic?.requiredDegreeOfInsurance,

//       typeOfCustody: updatedValues.typeOfCustody || editTopic?.typeOfCustody,
//       amountsPaidFor: updatedValues.amountsPaidFor || editTopic?.amountsPaidFor,

//       request_date_hijri:
//         updatedValues.request_date_hijri || editTopic?.request_date_hijri,
//       date_hijri: updatedValues.date_hijri || editTopic?.date_hijri,
//       gregorianDate: updatedValues.gregorianDate || editTopic?.gregorianDate,
//       decisionNumber: updatedValues.decisionNumber,
//       Region_Code: updatedValues.DefendantsEstablishmentRegion,
//       City_Code: updatedValues.DefendantsEstablishmentCity,
//       Occupation_Code: updatedValues.DefendantsEstablishOccupation,
//       Gender_Code: updatedValues.DefendantsEstablishmentGender,
//       Nationality_Code: updatedValues.DefendantsEstablishmentNationality,
//       PrisonerId: updatedValues.DefendantsEstablishmentPrisonerId,

//       ////////////////////////////////  Worker //////////////////////////////
//       from_date_hijri:
//         updatedValues.from_date_hijri || editTopic?.from_date_hijri,
//       to_date_hijri: updatedValues.to_date_hijri || editTopic?.to_date_hijri,

//       forAllowance: updatedValues.forAllowance?.value || editTopic.forAllowance,
//       rewardType: updatedValues.rewardType || editTopic.rewardType,
//       consideration: updatedValues.consideration || editTopic.consideration,

//       travelingWay: updatedValues.travelingWay?.value || editTopic.travelingWay,
//     };

//     // Update the caseTopics array
//     setCaseTopics((prev) =>
//       prev.map((topic) => (topic === editTopic ? updatedTopic : topic))
//     );

//     // Reset and close
//     reset();
//     setDate({ hijri: null, gregorian: null, dateObject: null });
//     setShowLegalSection(false);
//     setShowTopicData(false);
//     setEditTopic(null);
//     close();
//   };

//   const handleCancel = () => {
//     reset();
//     setShowLegalSection(false);
//     setShowTopicData(false);
//     setEditTopic(null);
//     close();
//   };

//   const handleSave = () => {
//     if (!showLegalSection) {
//       goToLegalStep();
//     } else if (!showTopicData) {
//       goToTopicDataStep();
//     }
//   };

//   const [lastAction, setLastAction] = useState<"Save" | "Next" | undefined>(
//     undefined
//   );

//   const handleSaveApi = async () => {
//     if (caseTopics.length) {
//       try {
//         setLastAction("Save"); // Set action FIRST before API call
//         const response = await saveHearingTopics(
//           getPayloadBySubTopicID(caseTopics, subCategory, "Save", caseId) // Pass explicit action
//         ).unwrap();
//         setLastSaved(true);
//       } catch (error) {
//         setLastAction(undefined); // Reset on error
//       }
//     }
//   };

//   const handleNext = async () => {
//     const latestFormValues = getValues();
//     setFormData(latestFormValues);
//     // console.log("caseTopics", caseTopics);

//     try {
//       setLastAction("Next"); // Set action FIRST before API call
//       const response = await saveHearingTopics(
//         getPayloadBySubTopicID(caseTopics, subCategory, "Next", caseId) // Pass explicit action
//       ).unwrap();

//       updateParams(
//         currentStep === 0 && currentTab < [0, 1, 2].length - 1
//           ? currentStep
//           : Math.min(currentStep + 1, steps.length - 1),
//         currentStep === 0 && currentTab < [0, 1, 2].length - 1
//           ? currentTab + 1
//           : undefined
//       );
//       setLastSaved(false);
//     } catch (error) {
//       setLastAction(undefined); // Reset on error
//     }
//   };

//   const handlePrevious = useCallback(() => {
//     if (currentStep === 1) {
//       updateParams(0, [0, 1, 2].length - 1);
//     } else {
//       updateParams(
//         currentStep === 0 ? 0 : currentStep - 1,
//         Math.max(currentTab - 1, 0)
//       );
//     }
//   }, [currentStep, currentTab, updateParams]);

//   const saveTopic = ():number => {
//     const newTopic = getValues();

//     console.log(newTopic);

//     for (const [key, value] of Object.entries(newTopic)) {
//        if (
//             value === "" &&
//             key !== "housingSpecificationsInContract" &&
//             key !== "actualHousingSpecifications" &&
//             key !== "housingSpecificationInByLaws"
//           ) {
//         return 0;
//       }
//     }

//     console.log(newTopic);

//     const topicToSave = {
//       ...newTopic,
//       MainTopicID: newTopic.mainCategory.value,
//       SubTopicID: newTopic.subCategory.value,
//       MainSectionHeader: newTopic.mainCategory.label,
//       SubTopicName: newTopic?.subCategory.label,
//       Date_New: newTopic.date_hijri,
//       ManDecsDate: newTopic.manDecsDate,
//       FromLocation: newTopic?.fromPlace,
//       ToLocation: newTopic?.toPlace,
//       AcknowledgedTerms: newTopic.acknowledged,
//       Amount: newTopic.amount,
//       PayDue: newTopic.payDue,
//       DurationOfLeaveDue: newTopic.durationOfLeaveDue,
//       WagesAmount: newTopic.wagesAmount,
//       CompensationAmount: newTopic.compensationAmount,
//       InjuryType: newTopic.injuryType,
//       BonusAmount: newTopic.bonusAmount,
//       AccordingToAgreement: newTopic?.accordingToAgreement?.value,
//       OtherCommission: newTopic.otherCommission,
//       AmountOfCompensation: newTopic.amountOfCompensation,
//       DamagedValue: newTopic.damagedValue,
//       RequiredJobTitle: newTopic.requiredJobTitle,
//       CurrentJobTitle: newTopic.currentJobTitle,
//       DamagedType: newTopic.damagedType,
//       CurrentInsuranceLevel: newTopic.currentInsuranceLevel,
//       TheReason: newTopic.theReason,
//       TheWantedJob: newTopic.theWantedJob,
//       CurrentPosition: newTopic.currentPosition,
//       TypeOfCustody: newTopic.typeOfCustody,
//       AmountsPaidFor: newTopic.amountsPaidFor,
//       RequestDateHijri: newTopic.request_date_hijri,
//       DateHijri: newTopic.date_hijri,
//       GregorianDate: newTopic.gregorianDate,
//       DecisionNumber: newTopic.decisionNumber,
//       RegionCode: newTopic.DefendantsEstablishmentRegion,
//       CityCode: newTopic.DefendantsEstablishmentCity,
//       OccupationCode: newTopic.DefendantsEstablishOccupation,
//       GenderCode: newTopic.DefendantsEstablishmentGender,
//       NationalityCode: newTopic.DefendantsEstablishmentNationality,
//       PrisonerId: newTopic.DefendantsEstablishmentPrisonerId,
//       FromDateHijri: newTopic.from_date_hijri,
//       ToDateHijri: newTopic.to_date_hijri,
//       OverdueWagesAmount: newTopic.overdueWagesAmount,
//       ToDateGregorian: newTopic.to_date_gregorian,
//       FromDateGregorian: newTopic.from_date_gregorian,
//       ForAllowance: newTopic?.forAllowance?.value,
//       RewardType: newTopic.rewardType,
//       Consideration: newTopic.consideration,
//       TravelingWay: newTopic.travelingWay,
//       PenalityType: newTopic.typesOfPenalties,
//     };
    
//     setCaseTopics((prev) => [...prev, topicToSave]);
//     return 1;
//   };

//   const isStep3 = showTopicData;
//   const isStep2 = showLegalSection;
//   const isEditing = Boolean(editTopic);

//   const formLayout = useMemo(() => {
//     if (userType === "Worker") {
//       return useFormLayoutWorker({
//         t: t,
//         MainTopicID: mainCategory,
//         SubTopicID: isEditing ? editTopic?.subCategory : subCategory,
//         FromLocation: fromPlace,
//         ToLocation: toPlace,
//         AcknowledgementTerms: acknowledged,
//         showLegalSection: showLegalSection,
//         showTopicData: showTopicData,
//         setValue: (field: string, value: any) => setValue(field as any, value),
//         regulatoryText: regulatoryText,
//         handleAdd: goToLegalStep,
//         handleAcknowledgeChange: (val: boolean) =>
//           setValue("acknowledged", val),
//         handleAddTopic: handleAddTopic,
//         decisionNumber: decisionNumber || "",
//         isEditing: isEditing,
//         mainCategoryData: mainCategoryData,
//         subCategoryData: subCategoryData,
//         watch: watch,
//         forAllowanceData: forAllowanceData,
//         typeOfRequestLookupData: typeOfRequestLookupData,
//         commissionTypeLookupData: commissionTypeLookupData,
//         accordingToAgreementLookupData: accordingToAgreementLookupData,
//         matchedSubCategory: matchedSubCategory,
//         subTopicsLoading: subTopicsLoading,
//         amountPaidData: amountPaidData,
//         leaveTypeData: leaveTypeData,
//         travelingWayData: travelingWayData,
//         isValid: isValid,
//         isMainCategoryLoading: isFetching || isLoading,
//         isSubCategoryLoading: isSubCategoryLoading,
//         editTopic: editTopic,
//         caseTopics: caseTopics,
//       });
//     } else {
//       return useFormLayoutEstablishment({
//         t: t,
//         MainTopicID: mainCategory,
//         SubTopicID: isEditing ? editTopic?.subCategory : subCategory,
//         FromLocation: fromPlace,
//         ToLocation: toPlace,
//         AcknowledgementTerms: acknowledged,
//         showLegalSection: showLegalSection,
//         showTopicData: showTopicData,
//         setValue: (field: string, value: any) => setValue(field as any, value),
//         regulatoryText: regulatoryText,
//         handleAdd: goToLegalStep,
//         handleAcknowledgeChange: (val: boolean) =>
//           setValue("acknowledged", val),
//         handleAddTopic: handleAddTopic,
//         decisionNumber: decisionNumber || "",
//         isEditing: isEditing,
//         mainCategoryData: mainCategoryData,
//         subCategoryData: subCategoryData,
//         watch: watch,
//         forAllowanceData: forAllowanceData,
//         typeOfRequestLookupData: typeOfRequestLookupData,
//         commissionTypeLookupData: commissionTypeLookupData,
//         accordingToAgreementLookupData: accordingToAgreementLookupData,
//         matchedSubCategory: matchedSubCategory,
//         subTopicsLoading: subTopicsLoading,
//         amountPaidData: amountPaidData,
//         leaveTypeData: leaveTypeData,
//         travelingWayData: travelingWayData,
//         isValid: isValid,
//         isMainCategoryLoading: isFetching || isLoading,
//         isSubCategoryLoading: isSubCategoryLoading,
//         editTopic: editTopic,
//         caseTopics: caseTopics,
//       });
//     }
//   }, [
//     userType,
//     t,
//     mainCategory,
//     subCategory,
//     fromPlace,
//     toPlace,
//     acknowledged,
//     showLegalSection,
//     showTopicData,
//     setValue,
//     regulatoryText,
//     goToLegalStep,
//     handleAddTopic,
//     decisionNumber,
//     isEditing,
//     mainCategoryData,
//     subCategoryData,
//     watch,
//     forAllowanceData,
//     typeOfRequestLookupData,
//     commissionTypeLookupData,
//     accordingToAgreementLookupData,
//     matchedSubCategory,
//     subTopicsLoading,
//     amountPaidData,
//     leaveTypeData,
//     travelingWayData,
//     isValid,
//     isFetching,
//     isLoading,
//     isSubCategoryLoading,
//     editTopic,
//     caseTopics,
//   ]);
//   // //console.log("formLayout", formLayout);
//   const {
//     attachments,
//     attachmentFiles,
//     previewFile,
//     showAttachmentModal,
//     handleAttachmentSave,
//     handleRemoveAttachment,
//     handleViewAttachment,
//     openAttachmentModal,
//     closeAttachmentModal,
//     closePreview,
//   } = useAttachments();

//   useEffect(() => {
//     if (mainCategory) {
//       setValue("subCategory", null);
//     }
//   }, [mainCategory, setValue]);

//   return (
//     <Suspense fallback={<TableLoader />}>
//       <StepNavigation<FormData>
//         onSubmit={handleSubmit(onSubmit)} 
//         isValid={isValid && caseTopics.length > 0}
//         isFirstStep={currentStep === 0 && currentTab === 0}
//         isLastStep={currentStep === 3 - 1}
//         currentStep={currentStep}
//         goToNextStep={handleNext}
//         goToPrevStep={handlePrevious}
//         resetSteps={() => updateParams(0, 0)}
//         handleSave={handleSaveApi}
//         canProceed={!!caseTopics.length} // true if caseTopic has value
//         isButtonDisabled={(direction: "prev" | "next") =>
//           direction === "prev" ? currentStep === 0 && currentTab === 0 : false
//         }
//         isLoading={addHearingLoading}
//         lastAction={lastAction}
//         showFooterBtn={showFooter}
//       >
//         <div className="flex flex-col min-h-auto">
//           <div>
//             {caseTopics.length > 0 ? (
//               <>
//                 <div className="mx-4 sm:mx-6 md:mx-8">
//                   <p className="text-primary-600 font-semibold text-base sm:text-lg md:text-xl leading-6 font-primary mb-4 sm:mb-6 md:mb-8">
//                     {t("lawsuit_topics") || "Lawsuit Topics"}
//                   </p>
//                   <Button
//                     variant="primary"
//                     size="xs"
//                     onClick={() => {
//                       reset();
//                       setEditTopic(null);
//                       toggle();
//                     }}
//                     className="mb-4 sm:mb-6 md:mb-8"
//                   >
//                     <Add01Icon size={20} /> {t("add_topic") || "Add Topic"}
//                   </Button>
//                   <div className="border-b border-gray-300 mb-4 sm:mb-6 md:mb-8" />
//                 </div>
//                 <Suspense fallback={<TableSkeletonLoader />}>
//                   <div className="overflow-x-auto">
//                     <ReusableTable
//                       data={getPaginatedTopics}
//                       columns={columns}
//                       page={pagination.pageIndex + 1}
//                       totalPages={Math.ceil(
//                         caseTopics.length / pagination.pageSize
//                       )}
//                       onPageChange={(newPage) => {
//                         setPagination((prev) => ({
//                           ...prev,
//                           pageIndex: newPage - 1,
//                         }));
//                       }}
//                       PaginationComponent={CustomPagination}
//                     />
//                   </div>
//                 </Suspense>
//                 <AttachmentSection
//                   attachments={attachments}
//                   onAddClick={openAttachmentModal}
//                   onRemove={handleRemoveAttachment}
//                   onView={handleViewAttachment}
//                 />

//                 <AttachmentModal
//                   isOpen={showAttachmentModal}
//                   onClose={closeAttachmentModal}
//                   onSave={handleAttachmentSave}
//                 />
//               </>
//             ) : (
//               <Suspense fallback={<TableLoader />}>
//                 <HearingCta auditIcon={auditIcon} toggle={toggle} />
//               </Suspense>
//             )}
//           </div>
//           {isOpen && (
//             <Suspense fallback={<TableLoader />}>
//               <Modal
//                 modalWidth={800}
//                 close={handleCancel}
//                 header={
//                   editTopic
//                     ? t("edit_topic") || "Edit Topic"
//                     : t("add_topic") || "Add Topic"
//                 }
//                 className="h-[60vh] sm:h-[600px] overflow-y-auto w-full max-w-[800px]"
//               >
//                 <FormProvider>
//                   <Suspense fallback={<TableLoader />}>
//                     <DynamicForm
//                       formLayout={formLayout}
//                       register={register}
//                       errors={errors}
//                       setValue={setValue}
//                       control={control}
//                       watch={watch}
//                     />
//                   </Suspense>
//                   <div className="flex w-full justify-between mt-4 sm:mt-6">
//                     <Button
//                       variant="secondary"
//                       typeVariant="outline"
//                       size="sm"
//                       onClick={handleCancel}
//                       className="text-sm sm:text-base font-medium"
//                     >
//                       {t("cancel") || "Cancel"}
//                     </Button>
//                     <Button
//                       variant={isValid ? "primary" : "disabled"}
//                       typeVariant={isValid ? "brand" : "freeze"}
//                       size="sm"
//                       onClick={() => {
//                         if (isEditing) {
//                           handleUpdate();
//                         } else if (isStep3) {
//                           handleSend();
//                         } else if (isStep2 && acknowledged) {
//                           handleSave();
//                         }
//                       }}
//                       className="text-sm sm:text-base font-medium"
//                       disabled={!isValid}
//                     >
//                       {isEditing
//                         ? t("update") || "Update"
//                         : isStep3
//                         ? t("send") || "Send"
//                         : isStep2 && acknowledged
//                         ? t("Next") || "Next"
//                         : t("Next") || "Next"}
//                     </Button>
//                   </div>
//                 </FormProvider>
//               </Modal>
//             </Suspense>
//           )}
//           <FilePreviewModal file={previewFile} onClose={closePreview} />
//         </div>
//       </StepNavigation>
//     </Suspense>
//   );
// }

// export default HearingTopicsDetails;
