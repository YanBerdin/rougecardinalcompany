"use client";

import { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import type { AuditLogFiltersProps } from "./types";
import { Search, X } from "lucide-react";

export function AuditLogFilters({
    filters,
    tableNames,
    onFilterChange,
    isLoading
}: AuditLogFiltersProps) {
    const [localSearch, setLocalSearch] = useState(filters.search ?? "");

    const handleApplySearch = () => {
        onFilterChange({
            ...filters,
            search: localSearch || undefined,
            page: 1
        });
    };

    const handleReset = () => {
        setLocalSearch("");
        onFilterChange({ page: 1, limit: 50 });
    };

    return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {/* Action Filter */}
            <Select
                value={filters.action ?? "all"}
                onValueChange={(value) =>
                    onFilterChange({
                        ...filters,
                        action: value === "all" ? undefined : value as "INSERT" | "UPDATE" | "DELETE",
                        page: 1,
                    })
                }
                disabled={isLoading}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Toutes les actions</SelectItem>
                    <SelectItem value="INSERT">INSERT</SelectItem>
                    <SelectItem value="UPDATE">UPDATE</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
            </Select>

            {/* Table Name Filter */}
            <Select
                value={filters.table_name ?? "all"}
                onValueChange={(value) =>
                    onFilterChange({
                        ...filters,
                        table_name: value === "all" ? undefined : value,
                        page: 1,
                    })
                }
                disabled={isLoading}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Table" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Toutes les tables</SelectItem>
                    {tableNames.map((table) => (
                        <SelectItem key={table} value={table}>
                            {table}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Date Range Filter */}
            <DateRangePicker
                from={filters.date_from}
                to={filters.date_to}
                onSelect={(range) =>
                    onFilterChange({
                        ...filters,
                        date_from: range?.from,
                        date_to: range?.to,
                        page: 1,
                    })
                }
            />

            {/* Search Input */}
            <div className="flex gap-2 lg:col-span-2">
                <Input
                    placeholder="Rechercher (record_id, table)..."
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleApplySearch()}
                    disabled={isLoading}
                />
                <Button
                    onClick={handleApplySearch}
                    size="icon"
                    disabled={isLoading}
                >
                    <Search className="h-4 w-4" />
                </Button>
                <Button
                    onClick={handleReset}
                    size="icon"
                    variant="ghost"
                    disabled={isLoading}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
