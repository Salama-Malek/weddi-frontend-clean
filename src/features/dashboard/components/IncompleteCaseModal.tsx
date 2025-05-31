import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "@/shared/components/modal/Modal";
import Button from "@/shared/components/button";
import { useResolveCaseMutation } from "@/features/manage-hearings/services/hearingActionsService";
import { toast } from "react-toastify";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";

interface IncompleteCaseModalProps {
  onClose: () => void;
  onProceed: () => void;
  caseNumber: string;
  message: string;
}

interface ApiResponse {
  ServiceStatus: string;
  ErrorCodeList: Array<{ ErrorCode: string; ErrorDesc: string }>;
}

const IncompleteCaseModal: React.FC<IncompleteCaseModalProps> = ({
  onClose,
  onProceed,
  caseNumber,
  message,
}) => {
  const { t, i18n } = useTranslation("common");
  const [resolveCase] = useResolveCaseMutation();
  const [getCookie, setCookie, removeCookie] = useCookieState();
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      const response = await resolveCase({
        CaseID: caseNumber,
        AcceptedLanguage: i18n.language.toUpperCase(),
        SourceSystem: "E-Services",
        ResolveStatus: "Resolved-Request Cancelled",
      }).unwrap();

      const apiResponse = response as ApiResponse;
      if (apiResponse.ServiceStatus === "Success" && apiResponse.ErrorCodeList.length === 0) {
        // Clear only incomplete case related cookies
        removeCookie("caseId");
        removeCookie("incompleteCaseMessage");
        removeCookie("incompleteCaseNumber");

        toast.success(t("cancel_success"));
        onClose();
      } else {
        toast.error(t("cancel_error"));
      }
    } catch (error) {
      toast.error(t("cancel_error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal header={t("incomplete_case")} modalWidth={500} close={onClose} preventOutsideClick={true}>
      <div className="p-4">
        <p className="text-sm text-gray-700 mb-4">
          {message || t("incomplete_case_message", { caseNumber })}
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={handleCancel} disabled={isLoading}>
            {isLoading ? t("loading_spinner") : t("cancel")}
          </Button>
          <Button variant="primary" onClick={onProceed} disabled={isLoading}>
            {t("view_details")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default IncompleteCaseModal; 