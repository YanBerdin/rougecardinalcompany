"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from "@/components/ui/pagination";
import type { AuditLogsTableProps } from "./types";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

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
    onRowClick
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
            <div className="flex h-32 items-center justify-center text-muted-foreground">
                Aucun log trouvé avec ces critères
            </div>
        );
    }

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[140px]">Date</TableHead>
                            <TableHead>Utilisateur</TableHead>
                            <TableHead className="w-[100px]">Action</TableHead>
                            <TableHead>Table</TableHead>
                            <TableHead>Record ID</TableHead>
                            <TableHead className="hidden lg:table-cell">IP</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.map((log) => (
                            <TableRow
                                key={log.id}
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => onRowClick(log)}
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

            {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        {totalCount} résultat{totalCount > 1 ? "s" : ""} • Page {currentPage}/{totalPages}
                    </p>
                    <Pagination>
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
        </>
    );
}
