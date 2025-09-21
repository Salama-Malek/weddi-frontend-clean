import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

import { useTranslation } from "react-i18next";
import { ActionsCell } from "../components/ActionsCell";
import { truncateText } from "../utils/tables/tableUtils";

export interface Hearing {
  requestNumber: string;
  hearingNumber: string;
  legalRepresentative?: string;
  defendantName: string;
  dateOfHearingCreation: string;
  hearingDate: string;
  sessionTiming: string;
  hearingStatus: string;
}

export const columnHelper = createColumnHelper<Hearing>();

const TranslatedHeader = ({ translationKey }: { translationKey: string }) => {
  const { t } = useTranslation("managehearings");
  return <span>{t(translationKey)}</span>;
};

export const claimantColumns: ColumnDef<Hearing, any>[] = [
  columnHelper.accessor("requestNumber", {
    header: () => <TranslatedHeader translationKey="table.requestNumber" />,
    cell: (info) => (
      <span className="text-xs sm:text-sm md:text-md normal text-gray-700">
        {truncateText(info.getValue(), 12)}
      </span>
    ),
  }),
  columnHelper.accessor("hearingNumber", {
    header: () => <TranslatedHeader translationKey="table.hearingNumber" />,
    cell: (info) => (
      <span className="text-xs sm:text-sm md:text-md normal text-gray-700">
        {truncateText(info.getValue(), 12)}
      </span>
    ),
  }),
  columnHelper.accessor("legalRepresentative", {
    header: () => (
      <TranslatedHeader translationKey="table.legalRepresentative" />
    ),
    cell: (info) => (
      <span className="text-xs sm:text-sm md:text-md normal text-gray-700">
        {truncateText(info.getValue() || "", 12)}
      </span>
    ),
  }),
  columnHelper.accessor("defendantName", {
    header: () => <TranslatedHeader translationKey="table.defendantName" />,
    cell: (info) => (
      <span className="text-xs sm:text-sm md:text-md normal text-gray-700">
        {truncateText(info.getValue(), 12)}
      </span>
    ),
  }),
  columnHelper.accessor("dateOfHearingCreation", {
    header: () => (
      <TranslatedHeader translationKey="table.dateOfHearingCreation" />
    ),
    cell: (info) => (
      <span className="text-xs sm:text-sm md:text-md normal text-gray-700">
        {truncateText(info.getValue(), 12)}
      </span>
    ),
  }),
  columnHelper.accessor("hearingDate", {
    header: () => <TranslatedHeader translationKey="table.hearingDate" />,
    cell: (info) => (
      <span className="text-xs sm:text-sm md:text-md normal text-gray-700">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("sessionTiming", {
    header: () => <TranslatedHeader translationKey="table.sessionTiming" />,
    cell: (info) => (
      <div className="text-center text-xs sm:text-sm md:text-md normal text-gray-700">
        {info.getValue()}
      </div>
    ),
  }),
  columnHelper.accessor("hearingStatus", {
    header: () => <TranslatedHeader translationKey="table.hearingStatus" />,
    cell: (info) => {
      const status = info.getValue();
      let textColor = "";
      let bgColor = "";

      switch (status) {
        case "Under negotiation":
          textColor = "text-warning-800";
          bgColor = "bg-[#FFFAEB]";
          break;
        case "Under review":
          textColor = "text-info-800";
          bgColor = "bg-[#EFF8FF]";
          break;
        case "Rejected":
          textColor = "text-error-800";
          bgColor = "bg-[#FEF3F2]";
          break;
        case "Completed":
          textColor = "text-success-800";
          bgColor = "bg-[#ECFDF3]";
          break;
        default:
          textColor = "text-default-color";
          bgColor = "bg-white";
      }

      return (
        <span
          className={`
            inline-flex items-center gap-1 sm:gap-2 
            rounded-full 
            text-xs sm:text-[14px]
            leading-[20px] 
            whitespace-nowrap 
            px-2 sm:px-4 py-[7px]
            medium
            ${textColor} 
            ${bgColor}
            min-w-0
          `}
        >
          <span className="inline-block w-[8px] h-[8px] sm:w-[10px] sm:h-[10px] rounded-full bg-current flex-shrink-0" />
          <span className="truncate max-w-[80px] sm:max-w-none" title={status}>
            {status}
          </span>
        </span>
      );
    },
  }),

  {
    id: "actions",
    header: () => <TranslatedHeader translationKey="table.actions" />,
    cell: ({ row }) => (
      //@ts-ignore
      <ActionsCell
        hearingStatus={row.original.hearingStatus}
        activeTab="claimant"
      />
    ),
  },
];

export const defendantColumns: ColumnDef<Hearing, any>[] = [
  columnHelper.accessor("requestNumber", {
    header: () => <TranslatedHeader translationKey="table.requestNumber" />,
    cell: (info) => (
      <span className="text-xs sm:text-sm md:text-md normal text-gray-700">
        {truncateText(info.getValue(), 12)}
      </span>
    ),
  }),
  columnHelper.accessor("hearingNumber", {
    header: () => <TranslatedHeader translationKey="table.hearingNumber" />,
    cell: (info) => (
      <span className="text-xs sm:text-sm md:text-md normal text-gray-700">
        {truncateText(info.getValue(), 12)}
      </span>
    ),
  }),
  columnHelper.accessor("defendantName", {
    header: () => <TranslatedHeader translationKey="table.defendantName" />,
    cell: (info) => (
      <span className="text-xs sm:text-sm md:text-md normal text-gray-700">
        {truncateText(info.getValue(), 12)}
      </span>
    ),
  }),
  columnHelper.accessor("dateOfHearingCreation", {
    header: () => (
      <TranslatedHeader translationKey="table.dateOfHearingCreation" />
    ),
    cell: (info) => (
      <span className="text-xs sm:text-sm md:text-md normal text-gray-700">
        {truncateText(info.getValue(), 12)}
      </span>
    ),
  }),
  columnHelper.accessor("hearingDate", {
    header: () => <TranslatedHeader translationKey="table.hearingDate" />,
    cell: (info) => (
      <span className="text-xs sm:text-sm md:text-md normal text-gray-700">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("sessionTiming", {
    header: () => <TranslatedHeader translationKey="table.sessionTiming" />,
    cell: (info) => (
      <div className="text-center text-xs sm:text-sm md:text-md normal text-gray-700">
        {info.getValue()}
      </div>
    ),
  }),
  columnHelper.accessor("hearingStatus", {
    header: () => <TranslatedHeader translationKey="table.hearingStatus" />,
    cell: (info) => {
      const { t } = useTranslation("managehearings");
      const status = info.getValue();

      const translatedStatus = t(`hearingStatuses.${status}`, status) as string;

      let textColor = "";
      let bgColor = "";

      switch (status) {
        case "Under negotiation":
          textColor = "text-warning-800";
          bgColor = "bg-[#FFFAEB]";
          break;
        case "Under review":
          textColor = "text-info-800";
          bgColor = "bg-[#EFF8FF]";
          break;
        case "Rejected":
          textColor = "text-error-800";
          bgColor = "bg-[#FEF3F2]";
          break;
        case "Completed":
          textColor = "text-success-800";
          bgColor = "bg-[#ECFDF3]";
          break;
        default:
          textColor = "text-default-color";
          bgColor = "bg-white";
      }

      return (
        <span
          className={`
          inline-flex items-center gap-1 sm:gap-2
          rounded-full 
          text-xs sm:text-sm medium 
          whitespace-nowrap 
          px-2 sm:px-md py-[7px]
          ${textColor} 
          ${bgColor}
          min-w-0
        `}
        >
          <span className="inline-block w-[8px] h-[8px] sm:w-[10px] sm:h-[10px] rounded-full bg-current flex-shrink-0" />
          <span
            className="truncate max-w-[80px] sm:max-w-none"
            title={translatedStatus}
          >
            {translatedStatus}
          </span>
        </span>
      );
    },
  }),

  {
    id: "actions",
    header: () => <TranslatedHeader translationKey="table.actions" />,
    cell: ({ row }) => (
      //@ts-ignore
      <ActionsCell
        hearingStatus={row.original.hearingStatus}
        activeTab="defendant"
      />
    ),
  },
];
