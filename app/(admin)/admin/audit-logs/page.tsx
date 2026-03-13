import { Suspense } from "react";
import { AuditLogsContainer } from "@/components/features/admin/audit-logs/AuditLogsContainer";
import { AuditLogsSkeleton } from "@/components/features/admin/audit-logs/AuditLogsSkeleton";
import { requireAdminPageAccess } from "@/lib/auth/roles";

export const metadata = {
    title: "Audit Logs | Admin",
    description: "Consulter les logs d'audit système",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface AuditLogsPageProps {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AuditLogsPage({ searchParams }: AuditLogsPageProps) {
    await requireAdminPageAccess();

    const params = await searchParams;
    
    return (
        <div className="flex-1 space-y-4 p-1 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Audit Logs</h2>
            </div>
            <Suspense fallback={<AuditLogsSkeleton />}>
                <AuditLogsContainer searchParams={params} />
            </Suspense>
        </div>
    );
}
