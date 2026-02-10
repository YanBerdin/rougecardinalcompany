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
    users,
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
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
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

            {/* User Filter */}
            <Select
                value={filters.user_id ?? "all"}
                onValueChange={(value) =>
                    onFilterChange({
                        ...filters,
                        user_id: value === "all" ? undefined : value,
                        page: 1,
                    })
                }
                disabled={isLoading}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Utilisateur" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tous les utilisateurs</SelectItem>
                    {users.map((user) => (
                        <SelectItem key={user.user_id} value={user.user_id}>
                            {user.user_email}
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
            <div className="flex gap-2 sm:col-span-2 md:col-span-3 lg:col-span-3">
                <Input
                    placeholder="Rechercher (record_id, table)..."
                    title="Rechercher dans les logs"
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleApplySearch()}
                    disabled={isLoading}
                />
                <Button
                    onClick={handleApplySearch}
                    size="icon"
                    variant="default"
                    title="Appliquer la recherche"
                    disabled={isLoading}
                >
                    <Search className="h-4 w-4" />
                </Button>
                <Button
                    onClick={handleReset}
                    size="icon"
                    variant="outline"
                    title="Réinitialiser les filtres"
                    disabled={isLoading}
                >
                    <X />
                </Button>
            </div>
        </div>
    );
}
