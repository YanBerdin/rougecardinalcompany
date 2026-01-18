import { z } from "zod";

// =====================================================
// Server Schemas (bigint pour IDs)
// =====================================================

export const RetentionConfigSchema = z.object({
    id: z.coerce.bigint(),
    table_name: z.string().min(1).regex(/^[a-z_]+$/, "Table name must be lowercase with underscores"),
    retention_days: z.number().int().positive().max(3650, "Max 10 years retention"),
    date_column: z.string().min(1),
    enabled: z.boolean().default(true),
    last_run_at: z.string().datetime().nullable().optional(),
    description: z.string().max(500).nullable().optional(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
});

export const RetentionAuditSchema = z.object({
    id: z.coerce.bigint(),
    table_name: z.string().min(1),
    rows_deleted: z.number().int().nonnegative(),
    execution_time_ms: z.number().int().nonnegative().nullable().optional(),
    error_message: z.string().nullable().optional(),
    status: z.enum(["success", "partial", "failed"]),
    executed_at: z.string().datetime(),
    metadata: z.record(z.string(), z.unknown()).optional(),
});

export const RetentionMonitoringSchema = z.object({
    id: z.coerce.bigint(),
    table_name: z.string(),
    retention_days: z.number().int().positive(),
    date_column: z.string(),
    enabled: z.boolean(),
    description: z.string().nullable(),
    last_run_at: z.string().datetime().nullable(),
    last_deleted_count: z.number().int().nullable(),
    last_execution_ms: z.number().int().nullable(),
    last_status: z.enum(["success", "partial", "failed"]).nullable(),
    last_error: z.string().nullable(),
    last_execution: z.string().datetime().nullable(),
    health_status: z.enum(["ok", "warning", "critical", "failed", "never_run"]),
    next_run_estimated: z.string().datetime().nullable(),
});

// =====================================================
// UI Schemas (number pour IDs - formulaires)
// =====================================================

export const RetentionConfigFormSchema = z.object({
    table_name: z.string().min(1).regex(/^[a-z_]+$/),
    retention_days: z.number().int().positive().max(3650),
    date_column: z.string().min(1),
    enabled: z.boolean().default(true),
    description: z.string().max(500).optional(),
});

export const UpdateRetentionConfigSchema = RetentionConfigFormSchema.partial();

// =====================================================
// DTO Types
// =====================================================

export type RetentionConfigDTO = z.infer<typeof RetentionConfigSchema>;
export type RetentionAuditDTO = z.infer<typeof RetentionAuditSchema>;
export type RetentionMonitoringDTO = z.infer<typeof RetentionMonitoringSchema>;

// UI Types
export type RetentionConfigFormValues = z.infer<typeof RetentionConfigFormSchema>;
export type UpdateRetentionConfigInput = z.infer<typeof UpdateRetentionConfigSchema>;

// =====================================================
// RPC Response Schemas
// =====================================================

export const CleanupResultSchema = z.object({
    table: z.string(),
    deleted: z.number().int().nonnegative(),
    status: z.string(),
    execution_time_ms: z.number().int().nonnegative().optional(),
    error: z.string().nullable().optional(),
    archived: z.number().int().nonnegative().optional(),
});

export type CleanupResultDTO = z.infer<typeof CleanupResultSchema>;

export const RetentionHealthSchema = z.object({
    table_name: z.string(),
    issue: z.string(),
    severity: z.enum(["ok", "warning", "critical"]),
});

export type RetentionHealthDTO = z.infer<typeof RetentionHealthSchema>;
