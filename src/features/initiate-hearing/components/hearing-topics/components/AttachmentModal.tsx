import React, { useRef, useState, useCallback } from "react";
import { FileAttachment as FileAttachmentType } from "@/shared/components/form/form.types";
import { AutoCompleteField } from "@/shared/components/form/AutoComplete";
import Modal from "@/shared/components/modal/Modal";
import Button from "@/shared/components/button";
import FileAttachment from "@/shared/components/ui/file-attachment/FileAttachment";
import FilePreviewModal from "../../add-attachments/FilePreviewModal";
import { useUploadAttachmentsMutation, useWorkerAttachmentCategoriesQuery } from "../api/apis";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import TableLoader from "@/shared/components/loader/TableLoader";
import { useTranslation } from "react-i18next";
import { TokenClaims } from "@/features/login/components/AuthProvider";

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/tiff'
];
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.tif', '.png'];

interface AttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (attachments: FileAttachmentType[]) => void;
}

interface FileWithMetadata {
  classificationLabel: string;
  classificationCode: string;
  file: File;
  fileType: string;
  fileName: string;
  base64: string;
}

const AttachmentModal: React.FC<AttachmentModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language.toUpperCase();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [classification, setClassification] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [getCookie] = useCookieState({ caseId: "" });
  const userClaims: TokenClaims = getCookie("userClaims");
  const userType = getCookie("userType");

  // API Queries
  const { data: WorkerAttachmentCategories, isFetching } = useWorkerAttachmentCategoriesQuery(
    {
      ModuleKey: (userType === "Legal representative" || userType === "Establishment") ? "EstablishmentAttachmentCategories" : "WorkerAttachmentCategories",
      ModuleName: (userType === "Legal representative" || userType === "Establishment") ? "EstablishmentAttachmentCategories" : "WorkerAttachmentCategories",
      AcceptedLanguage: "EN",
      SourceSystem: "E-Services"
    },
    { skip: !isOpen }
  );

  // Memoized options for the autocomplete
  const WorkerAttachmentCategoriesOptions = React.useMemo(() => {
    return (
      WorkerAttachmentCategories?.DataElements?.map((item: any) => ({
        value: item.ElementKey,
        label: item.ElementValue,
      })) || []
    );
  }, [WorkerAttachmentCategories]);

  // Validate file against requirements
  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError(t('attachments.errors.file_size', { name: file.name }));
      return false;
    }

    // Check MIME type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      // Fallback to extension check if MIME type isn't recognized
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
        setError(t('attachments.errors.file_type', {
          name: file.name,
          types: ALLOWED_EXTENSIONS.join(', ')
        }));
        return false;
      }
    }

    return true;
  };

  // Convert file to base64
  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1] || "");
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }, []);

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFiles = Array.from(event.target.files || []);

    if (!classification) {
      setError(t('attachments.errors.select_classification'));
      return;
    }

    try {
      const validFiles = selectedFiles.filter(validateFile);

      if (validFiles.length === 0) {
        return; // Error already set by validateFile
      }

      const newAttachments = await Promise.all(
        validFiles.map(async (file) => ({
          classificationLabel: classification.label,
          classificationCode: classification.value,
          file,
          fileType: file.type,
          fileName: file.name,
          base64: await fileToBase64(file),
        }))
      );

      setFiles((prev) => [...prev, ...newAttachments]);
      setClassification(null);
    } catch (err) {
      setError(t('attachments.errors.process_failed'));
    } finally {
      // Reset input to allow selecting the same file again
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const handleAddClick = () => {
    if (!classification) {
      setError(t('attachments.errors.select_classification'));
      return;
    }
    fileInputRef.current?.click();
  };

  const handleRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const [uploadAttachments, { isLoading }] = useUploadAttachmentsMutation();

  const handleSave = async () => {
    if (!files.length) {
      setError(t('attachments.errors.add_file'));
      return;
    }

    const payload = {
      AcceptedLanguage: currentLanguage,
      SourceSystem: "E-Services",
      CaseID: getCookie("caseId"),
      IDNumber: userClaims.UserID,
      FileNumber: userClaims.File_Number,
      CaseAttachments: files.map((file) => ({
        FileType: file.fileType.split('/').pop() || file.file.name.split('.').pop() || '',
        FileName: file.fileName,
        FileData: file.base64,
        AttachmentRequired: "true",
        AttachmentType: "CaseTopic",
        Attachmentdescription: file.classificationLabel || "",
        AttachmentCode: file.classificationCode || "",
      }))
    };

    try {
      const res = await uploadAttachments(payload).unwrap();
      onSave(files);
      setFiles([]);
      setClassification(null);
      onClose();
    } catch (err) {
      setError(t('attachments.errors.upload_failed'));
    }
  };

  if (!isOpen) return null;

  return (
    <Modal header={t('attachments.title')} close={onClose} modalWidth={600}>
      <div className="space-y-6 w-full">
        <div className="text-sm text-gray-500 mb-4">
          {t('attachments.allowed_files')}
        </div>

        <div className="grid grid-cols-3 gap-4 items-end">
          <div className="col-span-2">
            <AutoCompleteField
              label={t('attachments.classification')}
              name="fileClassification"
              isLoading={isFetching}
              options={WorkerAttachmentCategoriesOptions}
              value={classification}
              onChange={(selectedOption) => {
                setClassification(
                  typeof selectedOption === "string" ? null : selectedOption
                );
                setError(null);
              }}
            />
          </div>
          <div>
            <Button
              type="button"
              variant="primary"
              typeVariant="brand"
              size="sm"
              onClick={handleAddClick}
              className={!classification ? "opacity-50 cursor-not-allowed" : ""}
              disabled={!classification}
            >
              {t('attachments.add_files')}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple={false}
              accept=".pdf,.jpg,.jpeg,.tif,.png,application/pdf,image/jpeg,image/png,image/tiff"
              onChange={handleFileSelect}
            />
          </div>
        </div>

        {files.length > 0 && (
          <div className="max-h-52 overflow-y-auto space-y-2 pr-2">
            {files.map((file, index) => (
              <FileAttachment
                key={`${file.fileName}-${index}`}
                fileName={`${file.classificationLabel || "No Label"} - ${file.file.name}`}
                fileSize={`${(file.file.size / (1024 * 1024)).toFixed(2)} MB`}
                onRemove={() => handleRemove(index)}
                onView={() => setPreviewFile(file.file)}
              />
            ))}
          </div>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex justify-between mt-6">
          <Button
            type="button"
            variant="secondary"
            typeVariant="outline"
            size="sm"
            onClick={onClose}
          >
            {t('attachments.cancel')}
          </Button>
          <Button
            type="button"
            variant="primary"
            typeVariant="brand"
            size="sm"
            onClick={handleSave}
            disabled={!files.length || isLoading}
          >
            {isLoading ? (
              <>
                <span>{t('attachments.uploading')}</span> <TableLoader />
              </>
            ) : (
              t('attachments.save')
            )}
          </Button>
        </div>
      </div>
      <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
    </Modal>
  );
};

export default AttachmentModal;

export const useAttachmentModal = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language.toUpperCase();

  return {
    uploadAttachment: (formData: FormData) => {
      formData.append("AcceptedLanguage", currentLanguage);
      formData.append("SourceSystem", "E-Services");
      return fetch("WeddiServices/V1/UploadAttachment", {
        method: "POST",
        body: formData,
      });
    },

    getAttachments: (params: Record<string, string>) => {
      const queryParams = new URLSearchParams({
        ...params,
        AcceptedLanguage: currentLanguage,
        SourceSystem: "E-Services",
      });
      return fetch(`WeddiServices/V1/Attachments?${queryParams.toString()}`);
    },
  };
};