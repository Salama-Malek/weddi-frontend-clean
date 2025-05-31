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


  // API Queries
  const { data: WorkerAttachmentCategories, isFetching } = useWorkerAttachmentCategoriesQuery(
    { AcceptedLanguage: "EN", SourceSystem: "E-Services" },
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
      setError(`File "${file.name}" exceeds maximum size of 5MB`);
      return false;
    }

    // Check MIME type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      // Fallback to extension check if MIME type isn't recognized
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
        setError(
          `File "${file.name}" has invalid type. Only ${ALLOWED_EXTENSIONS.join(', ')} files are allowed`
        );
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
      setError("Please select a classification first");
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
      setError("Failed to process files. Please try again.");
    } finally {
      // Reset input to allow selecting the same file again
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const handleAddClick = () => {
    if (!classification) {
      setError("Please select a classification first");
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
      setError("Please add at least one file");
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
      setError("Failed to upload attachments. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <Modal header="Add Attachments" close={onClose} modalWidth={600}>
      <div className="space-y-6 w-full">
        <div className="text-sm text-gray-500 mb-4">
          Allowed file types: PDF, JPG, JPEG, TIF, PNG (Max 5MB each)
        </div>

        <div className="grid grid-cols-3 gap-4 items-end">
          <div className="col-span-2">
            <AutoCompleteField
              label="File Classification"
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
              variant="primary"
              typeVariant="brand"
              size="sm"
              onClick={handleAddClick}
              className={!classification ? "opacity-50 cursor-not-allowed" : ""}
              disabled={!classification}
            >
              Add Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
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

        <div className="flex justify-between mt-6">
          <Button
            variant="secondary"
            typeVariant="outline"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            typeVariant="brand"
            size="sm"
            onClick={handleSave}
            disabled={!files.length || isLoading}
          >
            {isLoading ? (
              <>
                <span>Uploading</span> <TableLoader />
              </>
            ) : (
              "Save"
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