
// import { useLanguageDirection } from "@/i18n/LanguageDirectionProvider";
// import { AutoCompleteField } from "@/shared/components/form/AutoComplete";
// import { ReadOnlyField } from "@/shared/components/ui/read-only-view";
// import { Section } from "@/shared/layouts/Section";
// import { classes } from "@/shared/lib/clsx";
// import { lazy, Suspense, useState } from "react";
// import { CheckboxField } from "@/shared/components/form/Checkbox";
// import { RadioGroup, RadioOption } from "@/shared/components/form/RadioGroup";
// import { ColumnDef } from "@tanstack/react-table";
// import TableLoader from "@/shared/components/loader/TableLoader";
// import { useTranslation } from "react-i18next";
// import withStepNavigation, {
//   WithStepNavigationProps,
// } from "@/shared/HOC/withStepNavigation";
// import {
//   useGetAcknowledgementQuery,
//   useGetCaseDetailsQuery,
// } from "../../api/create-case/apis";
// import { useLazyGetFileDetailsQuery } from "../../api/create-case/apis";
// import { useCookieState } from "../../hooks/useCookieState";
// import { skipToken } from "@reduxjs/toolkit/query";
// import Modal from "@/shared/components/modal/Modal";
// import { Controller } from "react-hook-form";
// import { Topic } from "../hearing-topics/hearing.topics.types";

// import ReviewSectionRenderer, {
//   ReviewSection,
// } from "@/shared/components/review/ReviewSectionRenderer";
// import { buildReviewSections } from "@/shared/components/review/ReviewDetailsBuilder";

// const FileAttachment = lazy(
//   () => import("@/shared/components/ui/file-attachment/FileAttachment")
// );
// const ReusableTable = lazy(() =>
//   import("@/shared/components/table/ReusableTable").then((m) => ({
//     default: m.ReusableTable,
//   }))
// );

// const ReviewDetails = ({ watch, control }: WithStepNavigationProps) => {
//   const [selectedOption, setSelectedOption] = useState({
//     label: "English",
//     value: "EN",
//   });
//   const [getCookie, setCookie] = useCookieState();
//   const [fileKey, setFileKey] = useState("");
//   const [fileName, setFileName] = useState("");
//   const [previewFile, setPreviewFile] = useState(false);
//   const { isRTL } = useLanguageDirection();
//   const { t } = useTranslation("reviewdetails");

//   const [triggerFileDetailsQuery, { data: fileBase64 }] =
//     useLazyGetFileDetailsQuery();

//   // Fetch case details
//   const { data: caseDetailsData } = useGetCaseDetailsQuery({
//     CaseID: getCookie("caseId") ?? skipToken,
//     AcceptedLanguage: isRTL ? "AR" : "EN",
//     SourceSystem: "E-Services",
//     IDNumber:"22222222"
//   });
//   const details = caseDetailsData?.CaseDetails || {};

//   // Build our shared sections
//   const sections: ReviewSection[] = buildReviewSections(details);

//   // Fetch acknowledgement text elements
//   const { data: acknowledgementData } = useGetAcknowledgementQuery({
//     LookupType: "DataElements",
//     ModuleKey: "MACK1",
//     ModuleName: "Acknowledge",
//     AcceptedLanguage: selectedOption.value,
//     SourceSystem: "E-Services",
//   });

//   const onView = async (key: string, name: string) => {
//     setFileKey(key);
//     setFileName(name);
//     setPreviewFile(true);
//     await triggerFileDetailsQuery({ AttachmentKey: key });
//   };

//   // Columns for topics table
//   const hearingColumns: ColumnDef<Topic>[] = [
//     { id: "id", header: t("no"), cell: ({ row }) => row.index + 1 },
//     { accessorKey: "mainCategory", header: t("mainCategory") },
//     { accessorKey: "subCategory", header: t("subCategory") },
//   ];

//   return (
//     <div className={classes("w-full space-y-6 !mb-0")}>
//       {/* Render all our shared read-only sections */}
//       <ReviewSectionRenderer sections={sections} />

//       {/* Attached files from RegionalAttachments inside buildReviewSections */}
//       {/* If you want a separate grid for attachments, you can keep it here */}

//       {/* Topics table */}
//       <Section title={t("hearingTopics")} className="grid-cols-1 gap-6">
//         <Suspense fallback={<TableLoader />}>
//           <ReusableTable
//             data={details.CaseTopics || []}
//             //@ts-ignore
//             columns={hearingColumns}
//             page={1}
//             totalPages={1}
//             hidePagination
//             onPageChange={() => {}}
//           />
//         </Suspense>
//       </Section>

//       {/* Acknowledgement */}
//       <Section title={t("acknowledgment")} className="grid-cols-1 gap-6">
//         <AutoCompleteField
//           className="!w-80"
//           options={[
//             { label: "English", value: "EN" },
//             { label: "Arabic", value: "AR" },
//           ]}
//           label={t("ack_lang")}
//           value={selectedOption}
//           onChange={(opt) => {
//             // opt may be string|null|{label,value}; only accept our object
//             if (opt && typeof opt !== "string") {
//               setSelectedOption(opt);
//             }
//           }}
//         />
//         {/* Acknowledgement text */}
//         <div className="w-full space-y-4 tracking-wider">
//           {acknowledgementData?.DataElements?.map(
//             (el: { ElementValue: string }, idx: number) => (
//               <p key={idx}>{el.ElementValue}</p>
//             )
//           )}
//         </div>

//         <CheckboxField
//           name="acknowledge"
//           control={control}
//           defaultValue={false}
//           rules={{ required: "You must acknowledge before proceeding" }}
//           label={t("acknowledge_desc")}
//         />
//       </Section>

//       {/* File preview modal */}
//       {previewFile && fileKey && fileBase64?.Base64Stream && (
//         <Modal
//           header={fileName}
//           close={() => {
//             setPreviewFile(false);
//             setFileKey("");
//             setFileName("");
//           }}
//           modalWidth={800}
//           className="!max-h-max !m-0"
//         >
//           <div className="w-full h-[80vh] overflow-auto">
//             {fileName.toLowerCase().endsWith(".pdf") ? (
//               <iframe
//                 src={`data:application/pdf;base64,${fileBase64.Base64Stream}`}
//                 className="w-full h-full border-none"
//               />
//             ) : (
//               <img
//                 src={`data:image/*;base64,${fileBase64.Base64Stream}`}
//                 alt={fileName}
//                 className="w-full h-full object-contain"
//               />
//             )}
//           </div>
//         </Modal>
//       )}
//     </div>
//   );
// };

// export default withStepNavigation(ReviewDetails);
