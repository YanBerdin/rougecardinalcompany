"use client";

import {
    Clock,
    User,
    Database,
    Hash,
    Globe,
    Eye
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from "@/components/ui/pagination";
import { SortableHeader } from "@/components/ui/sortable-header";
import type { SortState } from "@/components/ui/sortable-header";
import type { AuditLogsTableProps } from "./types";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

// Sortable fields
export type AuditLogSortField = "created_at" | "action" | "table_name";
export type AuditLogSortState = SortState<AuditLogSortField>;

const ACTION_STYLES = {
    INSERT: "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20",
    UPDATE: "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20",
    DELETE: "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20",
} as const;

export function AuditLogsTable({
    logs,
    totalCount,
    filters,
    onFilterChange,
    onRowClick,
    sortState,
    onSort
}: AuditLogsTableProps) {
    const totalPages = Math.ceil(totalCount / filters.limit);
    const currentPage = filters.page;

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            onFilterChange({ ...filters, page });
        }
    };

    if (logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md bg-card text-muted-foreground">
                Aucun log trouvé avec ces critères
            </div>
        );
    }

    return (
        <div className="w-full mx-auto space-y-4">
            {/* 
              MOBILE VIEW (Cards) 
              Visible only on small screens (< 640px)
            */}
            <div className="grid grid-cols-1 gap-4 sm:hidden">
                {logs.map((log) => (
                    <div
                        key={log.id}
                        className="bg-card rounded-lg border shadow-sm p-4 space-y-4 cursor-pointer hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        role="button"
                        tabIndex={0}
                        onClick={() => onRowClick(log)}
                        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onRowClick(log)}
                        aria-label={`Log ${log.action} sur ${log.table_name}`}
                    >
                        {/* Header: Action Badge + Date */}
                        <div className="flex justify-between items-start gap-4">
                            <Badge variant="outline" className={ACTION_STYLES[log.action]}>
                                {log.action}
                            </Badge>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>
                                    {formatDistanceToNow(new Date(log.created_at), {
                                        addSuffix: true,
                                        locale: fr,
                                    })}
                                </span>
                            </div>
                        </div>

                        {/* Body: Meta data */}
                        <div className="grid grid-cols-1 gap-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">
                                    {log.user_email ?? "Système"}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Database className="h-4 w-4 flex-shrink-0" />
                                <span className="font-mono">{log.table_name}</span>
                            </div>
                            {log.record_id && (
                                <div className="flex items-center gap-2">
                                    <Hash className="h-4 w-4 flex-shrink-0" />
                                    <span className="font-mono truncate">{log.record_id}</span>
                                </div>
                            )}
                            {log.ip_address && (
                                <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4 flex-shrink-0" />
                                    <span>{log.ip_address}</span>
                                </div>
                            )}
                        </div>

                        {/* Footer: Action */}
                        <div className="flex items-center justify-end pt-2 border-t mt-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                className="h-10 px-3"
                                aria-label="Voir les détails"
                            >
                                <Eye className="h-5 w-5 mr-2" /> Détails
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* 
              DESKTOP VIEW (Table) 
              Visible only on larger screens (>= 640px)
            */}
            <div className="hidden sm:block rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/80">
                            <TableHead className="w-[140px]">
                                <SortableHeader
                                    field="created_at"
                                    label="Date"
                                    currentSort={sortState}
                                    onSort={onSort}
                                />
                            </TableHead>
                            <TableHead>Utilisateur</TableHead>
                            <TableHead className="w-[100px]">
                                <SortableHeader
                                    field="action"
                                    label="Action"
                                    currentSort={sortState}
                                    onSort={onSort}
                                />
                            </TableHead>
                            <TableHead>
                                <SortableHeader
                                    field="table_name"
                                    label="Table"
                                    currentSort={sortState}
                                    onSort={onSort}
                                />
                            </TableHead>
                            <TableHead>Record ID</TableHead>
                            <TableHead className="hidden lg:table-cell">IP</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.map((log) => (
                            <TableRow
                                key={log.id}
                                className="cursor-pointer hover:bg-background/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                                tabIndex={0}
                                onClick={() => onRowClick(log)}
                                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onRowClick(log)}
                                aria-label={`Log ${log.action} sur ${log.table_name}`}
                            >
                                <TableCell className="text-sm text-muted-foreground">
                                    {formatDistanceToNow(new Date(log.created_at), {
                                        addSuffix: true,
                                        locale: fr,
                                    })}
                                </TableCell>
                                <TableCell className="font-medium">
                                    {log.user_email ?? <span className="text-muted-foreground">Système</span>}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={ACTION_STYLES[log.action]}>
                                        {log.action}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-mono text-sm">{log.table_name}</TableCell>
                                <TableCell className="font-mono text-sm text-muted-foreground">
                                    {log.record_id ?? "—"}
                                </TableCell>
                                <TableCell className="hidden text-muted-foreground lg:table-cell">
                                    {log.ip_address ?? "—"}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground order-2 sm:order-1">
                        {totalCount} résultat{totalCount > 1 ? "s" : ""} • Page {currentPage}/{totalPages}
                    </p>
                    <Pagination className="order-1 sm:order-2">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const page = currentPage <= 3
                                    ? i + 1
                                    : currentPage + i - 2;
                                if (page > totalPages || page < 1) return null;
                                return (
                                    <PaginationItem key={page}>
                                        <PaginationLink
                                            onClick={() => handlePageChange(page)}
                                            isActive={page === currentPage}
                                            className="cursor-pointer"
                                        >
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            })}
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}
