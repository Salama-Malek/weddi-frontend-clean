import React from "react";

const statusStyles: Record<string, { text: string; dot: string; bg: string }> =
  {
    completed: {
      text: "text-success-700",
      dot: "bg-success-700",
      bg: "bg-success-50 flex items-center",
    },
    resolved_agreement_reached: {
      text: "text-success-700",
      dot: "bg-success-700",
      bg: "bg-success-50 flex items-center",
    },
    resolved_agreementci: {
      text: "text-success-700",
      dot: "bg-success-700",
      bg: "bg-success-50 flex items-center",
    },

    "Resolved-Save the case": {
      text: "text-info-800",
      dot: "bg-info-800",
      bg: "bg-info-980 flex items-center",
    },
    resolved_save_the_case: {
      text: "text-info-800",
      dot: "bg-info-800",
      bg: "bg-info-980 flex items-center",
    },
    resolved_defendant_didnot_attend: {
      text: "text-info-800",
      dot: "bg-info-800",
      bg: "bg-info-980 flex items-center",
    },
    Resolved_Waived: {
      text: "text-info-800",
      dot: "bg-info-800",
      bg: "bg-info-980 flex items-center",
    },
    incomplete: {
      text: "text-info-800",
      dot: "bg-info-800",
      bg: "bg-info-980 flex items-center",
    },
    resolved_applicant_didnot_attend: {
      text: "text-info-800",
      dot: "bg-info-800",
      bg: "bg-info-980 flex items-center",
    },

    under_negotiations: {
      text: "text-warning-700",
      dot: "bg-warning-700",
      bg: "bg-warning-50",
    },
    resolved_rejected: {
      text: "text-error-700",
      dot: "bg-error-700",
      bg: "bg-error-100 flex items-center",
    },
    under_negotiationsci: {
      text: "text-warning-700",
      dot: "bg-warning-700",
      bg: "bg-warning-50",
    },
    under_awaitingapproval: {
      text: "text-warning-700",
      dot: "bg-warning-700",
      bg: "bg-warning-50",
    },
    under_awaitingapproval_ci: {
      text: "text-warning-700",
      dot: "bg-warning-700",
      bg: "bg-warning-50",
    },
    under_investigation: {
      text: "text-warning-700",
      dot: "bg-warning-700",
      bg: "bg-warning-50",
    },

    resolved_no_agreement: {
      text: "text-warning-700",
      dot: "bg-warning-700",
      bg: "bg-warning-50",
    },
    resolved_request_cancelled: {
      text: "text-warning-700",
      dot: "bg-warning-700",
      bg: "bg-warning-50",
    },
    resolved_waived: {
      text: "text-warning-700",
      dot: "bg-warning-700",
      bg: "bg-warning-50",
    },
    resolved_defendant_notattendci: {
      text: "text-warning-700",
      dot: "bg-warning-700",
      bg: "bg-warning-50",
    },
    resolved_noagreementci: {
      text: "text-warning-700",
      dot: "bg-warning-700",
      bg: "bg-warning-50",
    },
  };

interface StatusBadgeProps {
  status: string;
  status_code: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status_code, status }) => {
  return (
    <div
      className={`flex items-center justify-center ${statusStyles[status_code]?.bg} px-2 sm:px-3 py-1 gap-1 sm:gap-2 rounded-full min-w-0`}
    >
      <span
        className={`w-[8px] h-[8px] sm:w-[10px] sm:h-[10px] rounded-full ${statusStyles[status_code]?.dot} flex-shrink-0`}
      />
      <span
        className={`text-xs sm:text-sm md:text-md medium ${statusStyles[status_code]?.text} truncate max-w-[80px] sm:max-w-none`}
        title={status}
      >
        {status}
      </span>
    </div>
  );
};

export default StatusBadge;
