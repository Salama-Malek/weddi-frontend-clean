import React, { useEffect, useState } from "react";
import Modal from "@/shared/components/modal/Modal";

interface FilePreviewModalProps {
  /** Either a base64 string (no data: prefix) or a File object */
  file: File | string | null;
  /** Optional override for the header (falls back to file.name) */
  fileName?: string;
  onClose: () => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  fileName,
  onClose,
}) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("application/pdf");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setObjectUrl(null);
      return;
    }

    let url: string | null = null;

    const createBlobUrl = (binaryString: string, type: string) => {
      const binary = atob(binaryString);
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type });
      return URL.createObjectURL(blob);
    };

    if (typeof file === "string") {
      // We assume "file" is already a base64 string without data: prefix
      setMimeType("application/pdf");
      url = createBlobUrl(file, "application/pdf");
      setObjectUrl(url);
    } else {
      // It's a File → read as DataURL, then strip prefix
      const reader = new FileReader();
      reader.onerror = () => {
        setError("Failed to read file.");
      };
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const [prefix, b64] = dataUrl.split(",");
        const typeMatch = prefix.match(/data:(.*?);base64/) || [];
        const type = typeMatch[1] || file.type || "application/octet-stream";
        setMimeType(type);
        try {
          url = createBlobUrl(b64, type);
          setObjectUrl(url);
        } catch {
          setError("Failed to process file for preview.");
        }
      };
      reader.readAsDataURL(file);
    }

    // Cleanup old URL on unmount or when file changes
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [file]);

  // useEffect(()=>{
    // console.log({file,fileName,onClose});
    
  // },[])

  // If there's an error or nothing to preview, render nothing (or you could show a message)
  if (!file || !objectUrl) {
    if (error) {
      return (
        <Modal header="Preview Error" close={onClose} modalWidth={500}>
          <div className="p-4 text-red-600">{error}</div>
        </Modal>
      );
    }
    return null;
  }

  // Determine if it’s a PDF by mime type
  const isPDF = mimeType === "application/pdf";
  const headerText =
    fileName ?? (file instanceof File ? file.name : "Preview File");

  return (
    <Modal
      header={headerText}
      close={onClose}
      modalWidth={800}
      className="!max-h-max !m-0"
    >
      <div className="w-full h-[80vh] overflow-auto">
        {isPDF ? (
          <iframe
            src={objectUrl}
            className="w-full h-full border-none"
            title="PDF Preview"
          />
        ) : (
          <img
            src={objectUrl}
            alt={headerText}
            className="w-full h-full object-contain"
          />
        )}
      </div>
    </Modal>
  );
};

export default FilePreviewModal;
