"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AuditLogFilters } from "./AuditLogFilters";
import { AuditLogsTable } from "./AuditLogsTable";
import { AuditLogDetailModal } from "./AuditLogDetailModal";
import type { AuditLogsViewProps } from "./types";
import type { AuditLogDTO, AuditLogFilter } from "@/lib/schemas/audit-logs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { exportAuditLogsCSV } from "@/app/(admin)/admin/audit-logs/actions";
import { Skeleton } from "@/components/ui/skeleton";

export function AuditLogsView({
    initialLogs,
    initialTotalCount,
    initialFilters,
    tableNames
}: AuditLogsViewProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [logs, setLogs] = useState(initialLogs);
    const [totalCount, setTotalCount] = useState(initialTotalCount);
    const [filters, setFilters] = useState<AuditLogFilter>(initialFilters);
    const [selectedLog, setSelectedLog] = useState<AuditLogDTO | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    // Simulate initial loading to show skeleton //TODO: remove after testing
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsInitialLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    // ✅ CRITIQUE: Sync local state when props change (after router.refresh())
    useEffect(() => {
        setLogs(initialLogs);
        setTotalCount(initialTotalCount);
        setFilters(initialFilters);
    }, [initialLogs, initialTotalCount, initialFilters]);

    const handleFilterChange = (newFilters: AuditLogFilter) => {
        setFilters(newFilters);

        // Build query string from filters
        const params = new URLSearchParams();
        if (newFilters.page) params.set('page', newFilters.page.toString());
        if (newFilters.limit) params.set('limit', newFilters.limit.toString());
        if (newFilters.action) params.set('action', newFilters.action);
        if (newFilters.table_name) params.set('table_name', newFilters.table_name);
        if (newFilters.user_id) params.set('user_id', newFilters.user_id);
        if (newFilters.date_from) params.set('date_from', newFilters.date_from.toISOString());
        if (newFilters.date_to) params.set('date_to', newFilters.date_to.toISOString());
        if (newFilters.search) params.set('search', newFilters.search);

        startTransition(() => {
            setTimeout(() => {
                router.push(`/admin/audit-logs?${params.toString()}`);
            }, 500);
        });
    };

    const handleRefresh = () => {
        startTransition(() => {
            setTimeout(() => {
                router.refresh();
            }, 500);
        });
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const result = await exportAuditLogsCSV(filters);
            if (result.success) {
                const blob = new Blob([result.data], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
                link.click();
                URL.revokeObjectURL(url);
                toast.success("Export réussi");
            } else {
                toast.error(result.error);
            }
        } catch {
            toast.error("Erreur lors de l'export");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Card className="p-3 sm:p-4 md:p-6">
            <div className="mb-3 sm:mb-4 space-y-3">
                <AuditLogFilters
                    filters={filters}
                    tableNames={tableNames}
                    onFilterChange={handleFilterChange}
                    isLoading={isPending || isInitialLoading}
                />
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isPending || isInitialLoading}
                        className="flex-1 sm:flex-none min-w-[120px]"
                    >
                        <RefreshCw className={`mr-2 h-4 w-4 ${(isPending || isInitialLoading) ? "animate-spin" : ""}`} />
                        <span className="hidden sm:inline">Rafraîchir</span>
                        <span className="sm:hidden">Refresh</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        disabled={isExporting || isInitialLoading}
                        className="flex-1 sm:flex-none min-w-[120px]"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        {isExporting ? "Export..." : "Export CSV"}
                    </Button>
                </div>
            </div>

            {(isPending || isInitialLoading) ? (
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full rounded-md" />
                    <Skeleton className="h-[400px] w-full rounded-md" />
                    <div className="flex flex-col sm:flex-row justify-between gap-3">
                        <Skeleton className="h-10 w-full sm:w-32 rounded-md" />
                        <Skeleton className="h-10 w-full sm:w-48 rounded-md" />
                    </div>
                </div>
            ) : (
                <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
                    <AuditLogsTable
                        logs={logs}
                        totalCount={totalCount}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onRowClick={setSelectedLog}
                    />
                </div>
            )}

            {selectedLog && (
                <AuditLogDetailModal
                    log={selectedLog}
                    open={!!selectedLog}
                    onClose={() => setSelectedLog(null)}
                />
            )}
        </Card>
    );
}
