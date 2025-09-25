import React, { Suspense, useState } from "react";
import { ColumnDef, Row } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import TableLoader from "@/shared/components/loader/TableLoader";
import FileAttachment from "@/shared/components/ui/file-attachment/FileAttachment";
import Modal from "@/shared/components/modal/Modal";

import { useLazyGetFileDetailsQuery } from "@/features/initiate-hearing/api/create-case/apis";
import { ensureFileNameWithExtension } from "@/shared/lib/utils/fileUtils";

const ReusableTable = React.lazy(() =>
  import("@/shared/components/table/ReusableTable").then((m) => ({
    default: m.ReusableTable,
  })),
);

interface TopicsDetailsProps {
  hearing: any;
}

interface TopicRow {
  mainCategory: string;
  subCategory: string;
  fromPlace?: string;
  toPlace?: string;
  hijriDate?: string;
  gregorianDate?: string;
  decisionNumber?: string;
}

const TopicsDetails: React.FC<TopicsDetailsProps> = ({ hearing }) => {
  const { t, i18n } = useTranslation("manageHearingDetails");

  const rows: TopicRow[] = (hearing?.CaseTopics || []).map((topic: any) => ({
    mainCategory: topic.CaseTopicName || topic.MainSectionHeader || "N/A",
    subCategory: topic.SubTopicName || topic.TopicSection || "N/A",
    fromPlace: topic.FromLocation || "",
    toPlace: topic.ToLocation || "",
    hijriDate: topic.Date_New || "",
    gregorianDate: topic.ManagerialDecisionDate_New || "",
    decisionNumber: topic.ManagerialDecisionNumber || "",
  }));

  const columns: ColumnDef<TopicRow>[] = [
    {
      id: "no",
      header: t("no"),
      cell: ({ row }: { row: Row<TopicRow> }) => row.index + 1,
    },
    { accessorKey: "mainCategory", header: t("main_category") },
    { accessorKey: "subCategory", header: t("sub_category") },
  ];

  const attachments = [
    ...(hearing?.CaseTopicAttachments || []),
    ...(hearing?.OtherAttachments || []),
  ];

  const [fileName, setFileName] = useState("");
  const [previewFile, setPreviewFile] = useState(false);
  const [triggerFileDetails, { data: fileBase64 }] =
    useLazyGetFileDetailsQuery();

  const handleView = async (key: string, name: string) => {
    setFileName(name);
    setPreviewFile(true);
    await triggerFileDetails({
      AttachmentKey: key,
      AcceptedLanguage: i18n.language.toUpperCase(),
    });
  };

  return (
    <Suspense fallback={<TableLoader />}>
      <div className="space-y-8">
        {/* Topics Table */}
        <div className="px-4 space-y-3">
          <h3 className="text-primary-600 font-semibold text-md">
            {t("case_topics_details")}
          </h3>
        </div>
        <div className="px-4">
          <ReusableTable
            data={rows}
            columns={columns as ColumnDef<object, any>[]}
            page={1}
            totalPages={1}
            onPageChange={() => {}}
            hidePagination
          />
        </div>

        {/* Attachments List */}
        <div className="px-4 space-y-4">
          <h3 className="text-primary-600 font-semibold text-md">
            {t("attached_files")}
          </h3>
          {attachments.map((file: any, idx: number) => {
            const displayFileName = ensureFileNameWithExtension(
              file.FileName,
              file.FileType,
            );
            return (
              <FileAttachment
                key={idx}
                fileName={displayFileName}
                onView={() => handleView(file.FileKey, displayFileName)}
                className="w-full"
              />
            );
          })}
        </div>

        {/* Preview Modal */}
        {previewFile && fileBase64?.Base64Stream && (
          <Modal
            header={ensureFileNameWithExtension(
              fileName,
              fileBase64?.pyFileName?.split(".").pop(),
            )}
            close={() => {
              setPreviewFile(false);
              setFileName("");
            }}
            modalWidth={800}
            className="!max-h-max !m-0"
          >
            <div className="w-full h-[80vh] overflow-auto">
              {fileBase64?.pyFileName?.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={`data:application/pdf;base64,${fileBase64.Base64Stream}`}
                  className="w-full h-full border-none"
                />
              ) : (
                <img
                  src={`data:image/*;base64,${fileBase64.Base64Stream}`}
                  alt={fileName}
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          </Modal>
        )}
      </div>
    </Suspense>
  );
};

export default TopicsDetails;
