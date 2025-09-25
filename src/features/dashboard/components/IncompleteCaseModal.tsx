import React from "react";
import { useTranslation } from "react-i18next";
import Modal from "@/shared/components/modal/Modal";
import Button from "@/shared/components/button";
import { useNavigate } from "react-router-dom";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { useClearCaseData } from "@/shared/hooks/useClearCaseData";

interface IncompleteCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  incompleteCaseData: {
    CaseInfo: Array<{ CaseNumber: string; pyMessage?: string }>;
  };
}

const IncompleteCaseModal: React.FC<IncompleteCaseModalProps> = ({
  isOpen,
  onClose,
  incompleteCaseData,
}) => {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const [, setCookie] = useCookieState();
  const { resetCaseDataClearedFlag } = useClearCaseData();

  const firstCase = incompleteCaseData.CaseInfo[0];
  const caseNumber = firstCase?.CaseNumber || "";
  const rawMessage = firstCase?.pyMessage || "";

  const renderMessage = () => {
    if (!rawMessage || !caseNumber || !rawMessage.includes(caseNumber)) {
      return <span>{rawMessage}</span>;
    }

    const [before, after] = rawMessage.split(caseNumber);
    return (
      <>
        {before}
        <button
          type="button"
          onClick={() => {
            navigate(`/manage-hearings/${caseNumber}`);
            onClose();
          }}
          className="text-primary-700 underline hover:no-underline bg-transparent p-0"
        >
          {caseNumber}
        </button>
        {after}
      </>
    );
  };

  const handleNo = () => {
    onClose();
  };

  const handleYes = () => {
    if (!caseNumber) {
      onClose();
      return;
    }

    resetCaseDataClearedFlag();

    setCookie("caseId", caseNumber);

    localStorage.setItem("step", "0");
    localStorage.setItem("tab", "0");

    navigate("/initiate-hearing/case-creation");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal close={onClose} header={t("incomplete_case.title")} modalWidth={500}>
      <div className="space-y-6">
        <p className="text-sm text-gray-700">{renderMessage()}</p>

        <div className="flex justify-between gap-3">
          <Button variant="secondary" onClick={handleNo}>
            {t("incomplete_case.no")}
          </Button>

          <Button
            variant="primary"
            onClick={handleYes}
            className="bg-green-600 hover:bg-green-700"
          >
            {t("incomplete_case.yes")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default IncompleteCaseModal;
