-- Migration: Add composite and column indexes on logs_audit for filter performance.
-- Purpose: Speed up WHERE clauses on action, table_name, and user_id columns used by
--          get_audit_logs_with_email and the DAL fetchAuditTableNames / fetchDistinctAuditUsers.
-- Affected tables: public.logs_audit
-- Special considerations: All indexes are CONCURRENTLY safe (IF NOT EXISTS). They complement
--                         the existing idx_logs_audit_created_at index (created 2026-03-18).

-- Index on action to accelerate filter by operation type (INSERT/UPDATE/DELETE/SELECT).
create index if not exists idx_logs_audit_action
  on public.logs_audit using btree (action);

comment on index public.idx_logs_audit_action is
  'Supports WHERE action = p_action filter in get_audit_logs_with_email and fetchAuditTableNames.';

-- Index on table_name to accelerate filter by table and the DISTINCT table_name query.
create index if not exists idx_logs_audit_table_name
  on public.logs_audit using btree (table_name);

comment on index public.idx_logs_audit_table_name is
  'Supports WHERE table_name = p_table_name filter and DISTINCT table_name query in fetchAuditTableNames.';

-- Index on user_id to accelerate filter by user and the DISTINCT user_id query.
create index if not exists idx_logs_audit_user_id
  on public.logs_audit using btree (user_id);

comment on index public.idx_logs_audit_user_id is
  'Supports WHERE user_id = p_user_id filter and DISTINCT user_id query in fetchDistinctAuditUsers.';
