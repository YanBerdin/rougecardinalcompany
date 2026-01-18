"use server";
import "server-only";

import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";
import type { DALResult } from "@/lib/dal/helpers";
import type {
    RetentionConfigDTO,
    RetentionAuditDTO,
    RetentionMonitoringDTO,
    CleanupResultDTO,
    RetentionHealthDTO,
    RetentionConfigFormValues,
    UpdateRetentionConfigInput,
} from "@/lib/schemas/data-retention";

// =====================================================
// READS - Configuration
// =====================================================

/**
 * Récupère toutes les configurations de rétention
 * @returns DALResult avec liste des configs
 */
export async function fetchRetentionConfigs(): Promise<
    DALResult<RetentionConfigDTO[]>
> {
    await requireAdmin();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("data_retention_config")
        .select("*")
        .order("table_name");

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, data: data ?? [] };
}

/**
 * Récupère une configuration spécifique
 * @param tableName Nom de la table
 * @returns DALResult avec config ou null
 */
export async function fetchRetentionConfig(
    tableName: string
): Promise<DALResult<RetentionConfigDTO | null>> {
    await requireAdmin();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("data_retention_config")
        .select("*")
        .eq("table_name", tableName)
        .single();

    if (error) {
        if (error.code === "PGRST116") {
            return { success: true, data: null };
        }
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

// =====================================================
// READS - Audit Logs
// =====================================================

/**
 * Récupère les logs d'audit de rétention (paginés)
 * @param limit Nombre de résultats (défaut: 50)
 * @param offset Offset pour pagination (défaut: 0)
 * @returns DALResult avec liste des logs
 */
export async function fetchRetentionAuditLogs(
    limit = 50,
    offset = 0
): Promise<DALResult<RetentionAuditDTO[]>> {
    await requireAdmin();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("data_retention_audit")
        .select("*")
        .order("executed_at", { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, data: data ?? [] };
}

/**
 * Récupère les logs pour une table spécifique
 * @param tableName Nom de la table
 * @param limit Nombre de résultats
 * @returns DALResult avec liste des logs
 */
export async function fetchRetentionAuditLogsByTable(
    tableName: string,
    limit = 20
): Promise<DALResult<RetentionAuditDTO[]>> {
    await requireAdmin();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("data_retention_audit")
        .select("*")
        .eq("table_name", tableName)
        .order("executed_at", { ascending: false })
        .limit(limit);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, data: data ?? [] };
}

// =====================================================
// READS - Monitoring Views
// =====================================================

/**
 * Récupère la vue de monitoring complète
 * @returns DALResult avec données monitoring
 */
export async function fetchRetentionMonitoring(): Promise<
    DALResult<RetentionMonitoringDTO[]>
> {
    await requireAdmin();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("data_retention_monitoring")
        .select("*");

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, data: data ?? [] };
}

/**
 * Vérifie la santé du système de rétention
 * @returns DALResult avec liste des problèmes détectés
 */
export async function fetchRetentionHealth(): Promise<
    DALResult<RetentionHealthDTO[]>
> {
    await requireAdmin();
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("check_retention_health");

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, data: data ?? [] };
}

// =====================================================
// WRITES - Configuration Management
// =====================================================

/**
 * Crée une nouvelle configuration de rétention
 * @param input Données de configuration
 * @returns DALResult avec config créée
 */
export async function createRetentionConfig(
    input: RetentionConfigFormValues
): Promise<DALResult<RetentionConfigDTO>> {
    await requireAdmin();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("data_retention_config")
        .insert({
            table_name: input.table_name,
            retention_days: input.retention_days,
            date_column: input.date_column,
            enabled: input.enabled,
            description: input.description ?? null,
        })
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

/**
 * Met à jour une configuration de rétention
 * @param tableName Nom de la table
 * @param input Données partielles à mettre à jour
 * @returns DALResult avec config mise à jour
 */
export async function updateRetentionConfig(
    tableName: string,
    input: UpdateRetentionConfigInput
): Promise<DALResult<RetentionConfigDTO>> {
    await requireAdmin();
    const supabase = await createClient();

    const updateData: Record<string, unknown> = {};
    if (input.retention_days !== undefined)
        updateData.retention_days = input.retention_days;
    if (input.date_column !== undefined)
        updateData.date_column = input.date_column;
    if (input.enabled !== undefined) updateData.enabled = input.enabled;
    if (input.description !== undefined)
        updateData.description = input.description;

    const { data, error } = await supabase
        .from("data_retention_config")
        .update(updateData)
        .eq("table_name", tableName)
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

/**
 * Toggle enabled status pour une table
 * @param tableName Nom de la table
 * @param enabled Nouveau statut
 * @returns DALResult avec config mise à jour
 */
export async function toggleRetentionConfig(
    tableName: string,
    enabled: boolean
): Promise<DALResult<RetentionConfigDTO>> {
    return updateRetentionConfig(tableName, { enabled });
}

// =====================================================
// OPERATIONS - Manual Cleanup Triggers
// =====================================================

/**
 * Déclenche une purge manuelle pour une table spécifique
 * @param tableName Nom de la table
 * @returns DALResult avec résultat de la purge
 */
export async function triggerManualCleanup(
    tableName: string
): Promise<DALResult<CleanupResultDTO>> {
    await requireAdmin();
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("cleanup_expired_data", {
        p_table_name: tableName,
    });

    if (error) {
        return { success: false, error: error.message };
    }

    if (!data) {
        return { success: false, error: "No data returned from cleanup function" };
    }

    return { success: true, data };
}

/**
 * Déclenche purge manuelle newsletter (désabonnements)
 * @returns DALResult avec résultat de la purge
 */
export async function triggerNewsletterCleanup(): Promise<
    DALResult<CleanupResultDTO>
> {
    await requireAdmin();
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("cleanup_unsubscribed_newsletter");

    if (error) {
        return { success: false, error: error.message };
    }

    if (!data) {
        return {
            success: false,
            error: "No data returned from newsletter cleanup",
        };
    }

    return { success: true, data };
}

/**
 * Déclenche purge manuelle messages contact
 * @returns DALResult avec résultat de la purge
 */
export async function triggerContactMessagesCleanup(): Promise<
    DALResult<CleanupResultDTO>
> {
    await requireAdmin();
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("cleanup_old_contact_messages");

    if (error) {
        return { success: false, error: error.message };
    }

    if (!data) {
        return {
            success: false,
            error: "No data returned from contact messages cleanup",
        };
    }

    return { success: true, data };
}

/**
 * Déclenche purges manuelles pour toutes les tables actives
 * @returns DALResult avec résultats de toutes les purges
 */
export async function triggerAllCleanups(): Promise<
    DALResult<CleanupResultDTO[]>
> {
    await requireAdmin();

    const configsResult = await fetchRetentionConfigs();
    if (!configsResult.success) {
        return { success: false, error: configsResult.error };
    }

    const enabledConfigs = configsResult.data.filter((c) => c.enabled);
    const results: CleanupResultDTO[] = [];
    const errors: string[] = [];

    for (const config of enabledConfigs) {
        const result = await triggerManualCleanup(config.table_name);

        if (result.success) {
            results.push(result.data);
        } else {
            errors.push(`${config.table_name}: ${result.error}`);
        }
    }

    if (errors.length > 0) {
        return {
            success: false,
            error: `Some cleanups failed: ${errors.join("; ")}`,
        };
    }

    return { success: true, data: results };
}
