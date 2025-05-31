import { ColumnDef } from "@tanstack/react-table";
import Button from "@/shared/components/button";
import { Topic } from "../hearing.topics.types";
import { useTranslation } from "react-i18next";

interface HearingTopicsColumnsProps {
  t: (key: string) => string;
  onEdit: (topic: Topic) => void;
  onDel: (topic: Topic) => void;
}

export const getHearingTopicsColumns = ({
  t,
  onEdit,
  onDel,
}: HearingTopicsColumnsProps): ColumnDef<Topic>[] => [
  {
    id: "no",
    header: "No.",
    cell: ({ row }) => row.index + 1,
  },
  {
    id: "MainSectionHeader",
    header: t("mainCategory"),
    accessorKey: "MainSectionHeader",
  },
  {
    id: "SubTopicName",
    header: t("subCategory"),
    accessorKey: "SubTopicName",
  },
  {
    id: "actions",
    header: t("actions"),
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button
          variant="secondary"
          typeVariant="outline"
          size="xs"
          onClick={() => onEdit(row.original)}
        >
          {t("edit")}
        </Button>
        <Button
          onClick={() => onDel(row.original)}
          variant="secondary"
          typeVariant="outline"
          size="xs"
        >
          {t("delete")}
        </Button>
      </div>
    ),
  },
];
