import React, { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

export interface ResponsiveTableProps<TData extends object> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  className?: string;
  hidePagination?: boolean;
  showEdit?: boolean;
  title?: string;
}

function DefaultPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}) {
  const { t } = useTranslation("managehearings");

  return (
    <div className="flex justify-end items-center space-x-4 px-4 mt-2 mb-4">
      <button
        className="text-gray-600 disabled:opacity-50"
        onClick={() => onPageChange(Math.max(page - 1, 1))}
        type="button"
        disabled={page === 1}
      >
        {t("pagination.prev")}
      </button>
      <div className="text-gray-600 text-md medium">
        {t("pagination.page_of", { page, totalPages })}
      </div>
      <button
        className="text-gray-600 disabled:opacity-50"
        onClick={() => onPageChange(Math.min(page + 1, totalPages))}
        type="button"
        disabled={page === totalPages}
      >
        {t("pagination.next")}
      </button>
    </div>
  );
}

export function ResponsiveTable<TData extends object>({
  data,
  columns,
  page,
  totalPages,
  onPageChange,
  className = "",
  hidePagination = false,
  showEdit = false,
  title,
}: ResponsiveTableProps<TData>) {
  const { t } = useTranslation("managehearings");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const filteredColumns = React.useMemo(() => {
    if (!showEdit) {
      return columns.filter((column) => column.id !== "edit");
    }
    return columns;
  }, [columns, showEdit]);

  const table = useReactTable({
    data,
    columns: filteredColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const toggleRow = (rowId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(rowId)) {
      newExpandedRows.delete(rowId);
    } else {
      newExpandedRows.add(rowId);
    }
    setExpandedRows(newExpandedRows);
  };

  return (
    <div className={`w-full bg-white ${className}`}>
      {title && (
        <div className="px-4 py-3 border-b border-gray-300">
          <h3 className="text-lg semibold text-primary-600">{title}</h3>
        </div>
      )}

      {}
      <div className="hidden lg:block">
        <div className="rounded-md border border-gray-300 overflow-auto">
          <table className="w-full" style={{ borderSpacing: 0 }}>
            <thead className="bg-gray-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-300">
                  {headerGroup.headers.map((header) => {
                    let headerContent = flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    );
                    if (typeof headerContent === "string") {
                      headerContent = t(headerContent);
                    }
                    return (
                      <th
                        key={header.id}
                        className="p-3 text-start border-r border-gray-300 last:border-r-0 th-min-screen-width"
                      >
                        {headerContent}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, rowIndex, rowArray) => (
                <tr
                  key={row.id}
                  className={`border-b border-gray-300 ${
                    rowIndex === rowArray.length - 1 ? "last:border-b-0" : ""
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {}
      <div className="lg:hidden">
        <div className="space-y-3">
          {table.getRowModel().rows.map((row, _rowIndex) => {
            const isExpanded = expandedRows.has(row.id);
            const cells = row.getVisibleCells();
            const firstCell = cells[0];
            const remainingCells = cells.slice(1);

            return (
              <div
                key={row.id}
                className="border border-gray-300 rounded-md overflow-hidden"
              >
                {}
                <div
                  className="p-4 bg-gray-50 flex items-center justify-between cursor-pointer"
                  onClick={() => toggleRow(row.id)}
                >
                  <div className="flex-1">
                    {flexRender(
                      firstCell.column.columnDef.cell,
                      firstCell.getContext(),
                    )}
                  </div>
                  <div className="ml-3">
                    {isExpanded ? (
                      <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </div>

                {}
                {isExpanded && (
                  <div className="p-4 bg-white border-t border-gray-200">
                    <div className="space-y-3">
                      {remainingCells.map((cell, _cellIndex) => {
                        const header = cell.column.columnDef.header;
                        let headerText = "";

                        if (typeof header === "string") {
                          headerText = t(header);
                        } else if (header) {
                          headerText = String(header);
                        }

                        return (
                          <div key={cell.id} className="flex flex-col">
                            <span className="text-sm font-medium text-gray-600 mb-1">
                              {headerText}
                            </span>
                            <div className="text-sm text-gray-900">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {}
      {!hidePagination && (
        <DefaultPagination
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
