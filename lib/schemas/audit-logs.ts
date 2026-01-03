import { z } from "zod";

// Action enum
export const AuditActionEnum = z.enum(["INSERT", "UPDATE", "DELETE"]);
export type AuditAction = z.infer<typeof AuditActionEnum>;

// Base audit log schema (matches database)
export const AuditLogSchema = z.object({
    id: z.coerce.number().int().positive(), // PostgREST returns number, not bigint
    user_id: z.string().uuid().nullable(),
    action: AuditActionEnum,
    table_name: z.string().min(1),
    record_id: z.string().nullable(),
    old_values: z.record(z.string(), z.unknown()).nullable(),
    new_values: z.record(z.string(), z.unknown()).nullable(),
    ip_address: z.string().nullable(),
    user_agent: z.string().nullable(),
    created_at: z.coerce.date(),
    expires_at: z.coerce.date().nullable(),
});

// DTO with resolved email (from auth.users join)
export const AuditLogDTOSchema = AuditLogSchema.extend({
    user_email: z.string().email().nullable(),
    total_count: z.coerce.number().optional(), // For pagination
});

// Filter schema for search/pagination
export const AuditLogFilterSchema = z.object({
    action: AuditActionEnum.optional(),
    table_name: z.string().optional(),
    user_id: z.string().uuid().optional(),
    date_from: z.coerce.date().optional(),
    date_to: z.coerce.date().optional(),
    search: z.string().max(100).optional(), // Search in record_id or table_name only
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(50),
});

// Export types
export type AuditLog = z.infer<typeof AuditLogSchema>;
export type AuditLogDTO = z.infer<typeof AuditLogDTOSchema>;
export type AuditLogFilter = z.infer<typeof AuditLogFilterSchema>;
