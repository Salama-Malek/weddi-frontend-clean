// import { useLanguageDirection } from "@/i18n/LanguageDirectionProvider";
// import { AutoCompleteField } from "@/shared/components/form/AutoComplete";
// import { ReadOnlyField } from "@/shared/components/ui/read-only-view";
// import { Section } from "@/shared/layouts/Section";
// import { classes } from "@/shared/lib/clsx";
// import { lazy, Suspense, useState } from "react";
// import { CheckboxField } from "@/shared/components/form/Checkbox";
// import { RadioGroup, RadioOption } from "@/shared/components/form/RadioGroup";
// // import { Topic } from "../hearing-topics";
// // import { Topic } from "../hearing-topics/hearing.topics.types";
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

// const FileAttachment = lazy(
//   () => import("@/shared/components/ui/file-attachment/FileAttachment")
// );
// const ReusableTable = lazy(() =>
//   import("@/shared/components/table/ReusableTable").then((module) => ({
//     default: module.ReusableTable,
//   }))
// );
// type ReadOnlyDetail = { label: string; value: string };
// type FileDetail = { fileName: string; fileKey: string };

// interface FileType {
//   FileKey: "string";
//   FileType: "string";
//   FileName: "string";
// }

// type SectionData =
//   | {
//       type: "radio";
//       name: string;
//       label: string;
//       options: RadioOption[];
//       value: string;
//       onChange: (value: string) => void;
//     }
//   | { type: "readonly"; fields: ReadOnlyDetail[] }
//   | { type: "file"; files: FileDetail[] }
//   | { type: "table"; records: Topic[] };

// type ReviewSection = {
//   title?: string;
//   hideTitle?: boolean;
//   data: SectionData;
// };

// const ReviewDetails = ({ watch, control }: WithStepNavigationProps) => {
//   const [isChecked, setIsChecked] = useState<boolean | any>(false);
//   const [selectedOption, setSelectedOption] = useState<string | any>({
//     label: "English",
//     value: "EN",
//   });
//   const [getCookie, setCookie, removeCookie] = useCookieState();
//   const [fileKey, setFileKey] = useState("");
//   const [fileName, setFileName] = useState("");
//   const [previewFile, setPreviewFile] = useState(false);
//   const { isRTL } = useLanguageDirection();
//   const { t } = useTranslation("reviewdetails");

//   const [triggerFileDetailsQuery, { data: fileBase64, isLoading, isError }] =
//     useLazyGetFileDetailsQuery();

//   const { data: caseDetails } = useGetCaseDetailsQuery({
//     CaseID:
//       getCookie("caseId") !== undefined ? getCookie("caseId") : "CS-23113",
//     AcceptedLanguage: isRTL ? "AR" : "EN",
//     SourceSystem: "E-Services",
//     IDNumber:"22222222"
//   });

//   const details = caseDetails?.CaseDetails;

//   const { data: acknowlodgement } = useGetAcknowledgementQuery({
//     LookupType: "DataElements",
//     ModuleKey: "MACK1",
//     ModuleName: "Acknowledge",
//     AcceptedLanguage: selectedOption?.value,
//     SourceSystem: "E-Services",
//   });

//   const onView = async (fileKey: string, fileName: string) => {
//     setFileKey(fileKey);
//     setFileName(fileName);
//     setPreviewFile(true);
//     await triggerFileDetailsQuery({ AttachmentKey: fileKey });
//   };

//   //config
//   // const paragraphs = [`${t("p1")}`, `${t("p2")}`, `${t("p3")}`];

//   // const hearingTopics: Topic[] = [
//   //   {
//   //     id: 1,
//   //     mainCategory: "Request Hearing",
//   //     subCategory: "Request for Leave Pay",
//   //   },
//   //   {
//   //     id: 2,
//   //     mainCategory: "Request Hearing",
//   //     subCategory: "Request for Leave Pay",
//   //   },
//   //   {
//   //     id: 3,
//   //     mainCategory: "Request Hearing",
//   //     subCategory: "Request for Leave Pay",
//   //   },
//   //   {
//   //     id: 4,
//   //     mainCategory: "Request Hearing",
//   //     subCategory: "Request for Leave Pay",
//   //   },
//   //   {
//   //     id: 5,
//   //     mainCategory: "Request Hearing",
//   //     subCategory: "Request for Leave Pay",
//   //   },
//   // ];

//   const hearingColumns: ColumnDef<Topic>[] = [
//     {
//       id: "id",
//       header: t("no"),
//       cell: ({ row }) => row.index + 1,
//     },
//     {
//       id: "mainCategory",
//       accessorKey: "mainCategory",
//       header: t("mainCategory"),
//     },
//     {
//       id: "subCategory",
//       accessorKey: "subCategory",
//       header: t("subCategory"),
//     },
//   ];

//   const reviewSections: ReviewSection[] = [
//     {
//       title: t("claimantStatus"),
//       data: {
//         type: "radio",
//         name: "claimantStatus",
//         label: t("applicant"),
//         options: [
//           {
//             label: t("worker"),
//             value: "Worker",
//             description: t("representativeOfClaimant"),
//           },
//           {
//             label: t("employer"),
//             value: "Employer",
//             description: t("claimant"),
//           },
//         ],
//         value: details?.ApplicantType || "",
//         onChange: () => {},
//       },
//     },
//     // {
//     //   title: t("defendantStatus"),
//     //   hideTitle: true,
//     //   data: {
//     //     type: "radio",
//     //     name: "defendantStatus",
//     //     label: t("defendant"),
//     //     options: [
//     //       { label: t("worker"), value: "Worker" },
//     //       { label: t("employer"), value: "Employer" },
//     //       { label: t("establishment"), value: "Establishment" },
//     //     ],
//     //     value: details?.DefendantType || "",
//     //     onChange: () => {},
//     //   },
//     // },
//     {
//       title: t("claimantDetails"),
//       data: {
//         type: "readonly",
//         fields: [
//           { label: t("idNumber"), value: details?.PlaintiffId || "" },
//           { label: t("name"), value: details?.PlaintiffName || "" },
//           { label: t("region"), value: details?.Plaintiff_Region || "" },
//           { label: t("city"), value: details?.Plaintiff_City || "" },
//           { label: t("hijriDate"), value: details?.PlaintiffHijiriDOB || "" },
//           {
//             label: t("gregorianDate"),
//             value: details?.Plaintiff_Gregorian || "",
//           },
//           {
//             label: t("phoneNumber"),
//             value: details?.Plaintiff_PhoneNumber || "",
//           },
//           {
//             label: t("occupation"),
//             value: details?.Plaintiff_Occupation || "",
//           },
//           {
//             label: t("gender"),
//             value: details?.Plaintiff_Gender || "",
//           },
//           {
//             label: t("nationality"),
//             value: details?.Plaintiff_Nationality || "",
//           },
//         ],
//       },
//     },
//     {
//       data: {
//         type: "readonly",
//         fields: [
//           {
//             label: t("countryCode"),
//             value: details?.Plaintiff_Nationality_Code || "",
//           },
//           {
//             label: t("phoneNumber"),
//             value: details?.Plaintiff_PhoneNumber || "",
//           },
//         ],
//       },
//     },

//     {
//       title: t("AgentInformation"),
//       data: {
//         type: "readonly",
//         fields: [
//           { label: t("agentCapacity"), value: "" },
//           { label: t("emapssyName"), value: "" },
//           {
//             label: t("phoneNumber"),
//             value: details?.Agent_PhoneNumber || "",
//           },
//           {
//             label: t("plaintiffNativeLanguage"),
//             value: details?.Plaintiff_FirstLanguage || "",
//           },
//           {
//             label: t("E-mail"),
//             value: details?.Agent_EmailAddress || "",
//           },
//           { label: t("nationality"), value: "" },
//         ],
//       },
//     },
//     {
//       title: t("defendantDetails"),
//       data: {
//         type: "radio",
//         name: "defendantStatus",
//         label: t("Defendant's Type:"),
//         options: [
//           {
//             label: t("Non-Governmental Entities"),
//             value: "Establishment",
//           },
//           {
//             label: t("establishments"),
//             value: "Governmental Entities",
//           },
//         ],
//         value: details?.DefendantType || "",
//         onChange: () => {},
//       },
//     },
//     {
//       data: {
//         type: "readonly",
//         fields: [
//           { label: t("fileNumber"), value: "" },
//           { label: t("CRNumber"), value: details?.Defendant_CRNumber || "" },
//           { label: t("phoneNumber"), value: "" },
//           { label: t("region"), value: details?.Defendant_Region || "" },
//           { label: t("city"), value: details?.Defendant_City || "" },
//           { label: t("nearestLabourOffice"), value: "" },
//         ],
//       },
//     },
//     {
//       title: t("workDetails"),
//       data: {
//         type: "readonly",
//         fields: [
//           {
//             label: t("typeoFWage"),
//             value: details?.Plaintiff_SalaryType || "",
//           },
//           {
//             label: t("currentSalary"),
//             value: details?.Plaintiff_Salary || "",
//           },
//           {
//             label: t("contractType"),
//             value: details?.Plaintiff_ContractType || "",
//           },
//           {
//             label: t("contractNumber"),
//             value: details?.Plaintiff_ContractNumber || "",
//           },
//           {
//             label: t("contractHijriDate"),
//             value: details?.Plaintiff_JobStartDate || "",
//           },
//           {
//             label: t("contractGregorianDate"),
//             value: details?.Plaintiff_JobEndDate || "",
//           },
//           {
//             label: t("contractExHijriDate"),
//             value: details?.Plaintiff_JobStartDate || "",
//           },
//           {
//             label: t("contractExGregorianDate"),
//             value: details?.Plaintiff_JobEndDate || "",
//           },
//           {
//             label: t("stillEmployed"),
//             value: details?.Plaintiff_StillWorking || "",
//           },
//           {
//             label: t("dateHijriofResignation"),
//             value: details?.Plaintiff_JobStartDate || "",
//           },
//           {
//             label: t("lastWorkingDay"),
//             value: details?.Plaintiff_JobEndDate || "",
//           },
//           {
//             label: t("reason"),
//             value: details?.Plaintiff_JobEndDate || "",
//           },
//         ],
//       },
//     },
//     {
//       title: t("hearingTopics"),
//       data: {
//         type: "table",
//         records: (details?.CaseTopics || []).map(
//           (topic: any, index: number) => ({
//             id: index + 1,
//             mainCategory: topic.TopicName || "",
//             subCategory: topic.SubTopicName || "",
//           })
//         ),
//       },
//     },
//     {
//       title: t("attachedFiles"),
//       data: {
//         type: "file",
//         files: (details?.RegionalAttachments || []).map((f: FileType) => ({
//           fileName: f.FileName || "Unnamed File",
//           fileKey: f.FileKey || "Unnamed File",
//         })),
//       },
//     },
//   ];

//   return (
//     <div className={classes("w-full space-y-6 !mb-0")}>
//       {reviewSections.map(({ title, data, hideTitle }) => (
//         <Section
//           className={`${
//             data.type === "radio" || data.type === "table"
//               ? "grid grid-cols-1 gap-x-6 gap-y-6"
//               : "grid grid-cols-3 gap-x-6 gap-y-6"
//           }`}
//           key={title}
//           title={hideTitle ? "" : title}
//         >
//           {data.type === "radio" && (
//             <RadioGroup
//               notRequired
//               name={data.name}
//               label={data.label}
//               options={data.options.filter(
//                 (option) => option.value === data.value
//               )}
//               value={data.value}
//               onChange={data.onChange}
//             />
//           )}

//           {data.type === "readonly" &&
//             data.fields.map(({ label, value }, index) => (
//               <ReadOnlyField
//                 notRequired
//                 key={index}
//                 label={label}
//                 value={value}
//               />
//             ))}
//           {data.type === "table" && (
//             <Suspense fallback={<TableLoader />}>
//               <ReusableTable
//                 data={data.records}
//                 //@ts-ignore
//                 columns={hearingColumns}
//                 page={1}
//                 totalPages={10}
//                 onPageChange={() => {}}
//                 hidePagination={true}
//               />
//             </Suspense>
//           )}
//           {data.type === "file" && (
//             <Suspense fallback={<p>Loading files...</p>}>
//               <div className="grid grid-cols-1 gap-x-6 gap-y-6">
//                 {data.files.map(({ fileName, fileKey }, index) => (
//                   <FileAttachment
//                     key={index}
//                     fileName={fileName}
//                     onView={() => {
//                       onView(fileKey, fileName);
//                     }}
//                   />
//                 ))}
//               </div>
//             </Suspense>
//           )}
//         </Section>
//       ))}

//       <Section
//         title={t("acknowledgment")}
//         className="grid-cols-1 gap-x-6 gap-y-6"
//       >
//         <AutoCompleteField
//           className="!w-80"
//           notRequired
//           options={[
//             { label: "English", value: "EN" },
//             { label: "Arabic", value: "AR" },
//           ]}
//           label={t("ack_lang")}
//           value={selectedOption}
//           onChange={(value) => {
//             setSelectedOption(value);
//           }}
//           invalidFeedback={selectedOption === "" ? "Select language" : ""}
//         />
//         <div className="w-full space-y-4 medium tracking-wider">
//           {acknowlodgement?.DataElements?.map((value: any, index: number) => (
//             <p key={index}>{value.ElementValue}</p>
//           ))}
//         </div>
//         <Controller
//           name="acknowledge"
//           control={control}
//           defaultValue={false}
//           rules={{ required: true }}
//           render={({ field }) => (
//             <CheckboxField
//               id="acknowledge"
//               label={t("acknowledge_desc")}
//               checked={field.value}
//               //@ts-ignore
//               onChange={(value) => {
//                 field.onChange(value);
//               }}
//             />
//           )}
//         />
//       </Section>
//       {fileBase64 && fileKey !== "" && previewFile && (
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
//             <iframe
//               src={`data:application/pdf;base64,${fileBase64.Base64Stream}`}
//               className="w-full h-full border-none"
//             ></iframe>
//           </div>
//         </Modal>
//       )}
//     </div>
//   );
// };

// export default withStepNavigation(ReviewDetails);

