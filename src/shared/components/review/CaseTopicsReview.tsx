import React, { Suspense, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Section } from "@/shared/layouts/Section";
import TableLoader from "@/shared/components/loader/TableLoader";
import FileAttachment from "@/shared/components/ui/file-attachment/FileAttachment";
import Modal from "@/shared/components/modal/Modal";
import { useLazyGetFileDetailsQuery } from "@/features/initiate-hearing/api/create-case/apis";
import { ColumnDef, Row } from "@tanstack/react-table";
import { ensureFileNameWithExtension } from "@/shared/lib/utils/fileUtils";

const ReusableTable = React.lazy(() =>
  import("@/shared/components/table/ReusableTable").then((m) => ({
    default: m.ReusableTable,
  })),
);

interface CaseTopicsReviewProps {
  hearing: any;
  onViewAttachment: (key: string, name: string) => void;
}

interface TopicRow {
  mainCategory: string;
  subCategory: string;
}

const CaseTopicsReview: React.FC<CaseTopicsReviewProps> = ({
  hearing,
  onViewAttachment,
}) => {
  const { t, i18n } = useTranslation("reviewdetails");

  const rows = useMemo<TopicRow[]>(
    () =>
      (hearing?.CaseTopics || []).map((topic: any) => ({
        mainCategory: topic.CaseTopicName || topic.MainSectionHeader || "N/A",
        subCategory: topic.SubTopicName || topic.TopicSection || "N/A",
      })),
    [hearing?.CaseTopics],
  );

  const attachments = useMemo(
    () => [
      ...(hearing?.CaseTopicAttachments || []),
      ...(hearing?.OtherAttachments || []),
      ...(hearing?.RegionalAttachments || []),
    ],
    [
      hearing?.CaseTopicAttachments,
      hearing?.OtherAttachments,
      hearing?.RegionalAttachments,
    ],
  );

  const [previewFile, setPreviewFile] = useState(false);
  const [fileName, setFileName] = useState("");
  const [triggerFileDetails, { data: fileBase64, isLoading }] =
    useLazyGetFileDetailsQuery();

  const handleLocalView = async (key: string, name: string) => {
    setFileName(name);
    setPreviewFile(true);
    await triggerFileDetails({
      AttachmentKey: key,
      AcceptedLanguage: i18n.language.toUpperCase(),
    });
  };

  const columns: ColumnDef<TopicRow>[] = [
    {
      id: "no",
      header: t("no"),
      cell: ({ row }: { row: Row<TopicRow> }) => row.index + 1,
    },
    { accessorKey: "mainCategory", header: t("mainCategory") },
    { accessorKey: "subCategory", header: t("subCategory") },
  ];

  return (
    <>
      <Section title={t("hearingTopics")} className="grid-cols-1 gap-6">
        <Suspense fallback={<TableLoader />}>
          <ReusableTable
            data={rows}
            // @ts-ignore
            columns={columns}
            page={1}
            totalPages={1}
            hidePagination
            onPageChange={() => {}}
          />
        </Suspense>
      </Section>

      <Section title={t("attachedFiles")} className="grid-cols-1 gap-6">
        {attachments.map((file: any, idx: number) => {
          const displayFileName = ensureFileNameWithExtension(
            file.FileName,
            file.FileType,
          );
          return (
            <FileAttachment
              key={idx}
              fileName={displayFileName}
              onView={() => {
                handleLocalView(file.FileKey, displayFileName);
                onViewAttachment(file.FileKey, displayFileName);
              }}
              className="w-full"
            />
          );
        })}
      </Section>

      {previewFile && fileBase64?.Base64Stream && (
        <Modal
          header={ensureFileNameWithExtension(
            fileName,
            fileBase64?.pyFileName?.split(".").pop(),
          )}
          close={() => setPreviewFile(false)}
          modalWidth={800}
          className="!max-h-max !m-0"
        >
          {isLoading ? (
            <div className="p-4">
              <TableLoader />
            </div>
          ) : (
            <div className="w-full h-[80vh] overflow-auto">
              {fileBase64?.pyFileName.toLowerCase().endsWith(".pdf") ? (
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
          )}
        </Modal>
      )}
    </>
  );
};

export default CaseTopicsReview;
