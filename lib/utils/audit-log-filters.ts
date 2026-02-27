import { AuditLogFilterSchema, type AuditLogFilter } from "@/lib/schemas/audit-logs";

/**
 * Parse un objet searchParams (Next.js App Router) en AuditLogFilter validé.
 *
 * Élimine les assertions de type manuelles et gère automatiquement les valeurs
 * manquantes / NaN via les defaults et coercions Zod de AuditLogFilterSchema.
 *
 * @param searchParams - Objet searchParams issu d'une page Next.js App Router
 * @returns AuditLogFilter validé avec valeurs par défaut appliquées
 */
export function parseAuditLogFilters(
    searchParams: Record<string, string | string[] | undefined>
): AuditLogFilter {
    const raw = {
        page: searchParams.page ?? undefined,
        limit: searchParams.limit ?? undefined,
        action: searchParams.action ?? undefined,
        table_name: searchParams.table_name ?? undefined,
        user_id: searchParams.user_id ?? undefined,
        date_from: searchParams.date_from ?? undefined,
        date_to: searchParams.date_to ?? undefined,
        search: searchParams.search ?? undefined,
    };
    return AuditLogFilterSchema.parse(raw);
}
