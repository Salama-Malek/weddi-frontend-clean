import { useState, useEffect } from "react";
import { useRemoveAttachmentMutation } from "../api/apis";
import { ensureFileNameWithExtension } from "@/utils/fileUtils";

interface FileAttachment {
  file: File | null;
  fileType: string;
  fileName: string;
  attachmentKey?: string;
}

interface AttachmentFile {
  FileType: string;
  FileName: string;
  FileData: string;
}

export interface UseAttachmentsParams {
  initialAttachmentFiles?: AttachmentFile[];
  triggerFileDetails?: any;
  fileBase64?: any;
}

export function useAttachments(params: UseAttachmentsParams = {}) {
  const [attachments, setAttachments] = useState<any[]>([]);
  const [attachmentFiles, setAttachmentFiles] = useState<AttachmentFile[]>([]);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<any>(null);
  const [removeAttachment] = useRemoveAttachmentMutation();

  useEffect(() => {
    if (
      params.initialAttachmentFiles &&
      params.initialAttachmentFiles.length > 0
    ) {
      setAttachmentFiles(params.initialAttachmentFiles);

      const mappedAttachments: FileAttachment[] =
        params.initialAttachmentFiles.map((f) => {
          return {
            file: null,
            fileType: f.FileType,
            fileName: ensureFileNameWithExtension(f.FileName, f.FileType),
          };
        });

      setAttachments(mappedAttachments);
    }
  }, [params.initialAttachmentFiles]);

  useEffect(() => {
    if (params.fileBase64 && params.fileBase64.Base64Stream) {
      setPreviewFile(params.fileBase64);
    }
  }, [params.fileBase64]);

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
          FileName: ensureFileNameWithExtension(file.fileName, file.fileType),
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

  const handleRemoveAttachment = async (index: number) => {
    const attachmentToRemove = attachments[index];

    if (
      attachmentToRemove &&
      (attachmentToRemove.FileKey || attachmentToRemove.fileKey)
    ) {
      try {
        await removeAttachment({
          AttachmentKey:
            attachmentToRemove.FileKey || attachmentToRemove.fileKey,
        });
      } catch (error) {}
    }
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleViewAttachment = (attachment: any) => {
    const key =
      attachment.FileKey || attachment.fileKey || attachment.attachmentKey;

    if (key && params.triggerFileDetails) {
      params.triggerFileDetails({
        AttachmentKey: key,
        AcceptedLanguage: (attachment.AcceptedLanguage || "EN").toUpperCase(),
      });
    } else if (attachment.base64) {
    } else {
    }
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
}
