"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { SortField, SortState } from "@/lib/tables/spectacle-table-helpers";

interface SortableHeaderProps {
  field: SortField;
  label: string;
  currentSort: SortState | null;
  onSort: (field: SortField) => void;
  className?: string;
}

export function SortableHeader({
  field,
  label,
  currentSort,
  onSort,
  className = "",
}: SortableHeaderProps) {
  const isActive = currentSort?.field === field;
  const direction = currentSort?.direction;

  const getSortIcon = () => {
    if (!isActive) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }

    return direction === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  return (
    <Button
      variant="ghost"
      onClick={() => onSort(field)}
      className={`h-auto p-0 font-medium hover:bg-transparent ${className}`}
    >
      {label}
      {getSortIcon()}
    </Button>
  );
}