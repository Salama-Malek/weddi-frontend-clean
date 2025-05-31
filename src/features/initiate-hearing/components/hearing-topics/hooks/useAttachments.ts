import { useState, useEffect } from "react";

interface FileAttachment {
  file: File | null;
  fileType: string;
  fileName: string;
}

interface AttachmentFile {
  FileType: string;
  FileName: string;
  FileData: string;
}

interface UseAttachmentsParams {
  initialAttachmentFiles?: AttachmentFile[]; // base64 files from backend
}

export const useAttachments = ({ initialAttachmentFiles = [] }: UseAttachmentsParams = {}) => {
  const [attachments, setAttachments] = useState<any[]>([]);
  const [attachmentFiles, setAttachmentFiles] = useState<AttachmentFile[]>([]);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  // Initialize with existing files if provided
  useEffect(() => {
    if (initialAttachmentFiles.length > 0) {
      setAttachmentFiles(initialAttachmentFiles);

      const mappedAttachments: FileAttachment[] = initialAttachmentFiles.map((f) => {
        console.log(f);

        return ({
          file: null,
          fileType: f.FileType,
          fileName: f.FileName,
        })
      });

      setAttachments(mappedAttachments);
    }
  }, [initialAttachmentFiles]);

  const handleAttachmentSave = (newAttachments: FileAttachment[]) => {
    setAttachments((prev) => [...prev, ...newAttachments]);

    const updatedFiles: AttachmentFile[] = [];
    let processed = 0;

    newAttachments.forEach((file) => {
      if (!file.file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        updatedFiles.push({
          FileType: file.fileType,
          FileName: file.fileName,
          FileData: base64,
        });
        processed++;

        if (processed === newAttachments.length) {
          const finalFiles = [...attachmentFiles, ...updatedFiles];
          setAttachmentFiles(finalFiles);
        }
      };
      reader.readAsDataURL(file.file);
    });
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleViewAttachment = (index: number) => {
    const file = attachments[index]?.file;
    if (file) setPreviewFile(file);
  };

  const openAttachmentModal = () => setShowAttachmentModal(true);
  const closeAttachmentModal = () => setShowAttachmentModal(false);
  const closePreview = () => setPreviewFile(null);

  return {
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
    setAttachmentFiles,
  };
};
