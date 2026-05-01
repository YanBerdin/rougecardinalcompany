-- Migration: Fix SECURITY DEFINER advisor alerts (lint-0028, lint-0029)
-- Purpose: Fix 35 Supabase advisor security alerts (32 lint-0028/0029 + 1 auth_leaked_password_protection = 33 total fixable here).
-- Supersedes previous version of this file which had a critical bug:
--   REVOKE FROM anon/authenticated does NOT remove PUBLIC-inherited EXECUTE.
--   PostgreSQL grants EXECUTE to PUBLIC by default; only REVOKE FROM PUBLIC fixes this.
-- Strategy:
--   TIER 1: ALTER FUNCTION ... SECURITY INVOKER for 5 functions (alert disappears entirely — no longer SECURITY DEFINER)
--   TIER 2: REVOKE FROM PUBLIC for 10 remaining SECURITY DEFINER functions
--   TIER 3: GRANT TO authenticated for get_audit_logs_with_email only
-- Expected result: 35 → 2 advisor alerts after this migration
--   Remaining: 1 authenticated (get_audit_logs_with_email: must join auth.users system table)
--            + 1 auth_leaked_password_protection (manual Dashboard action required)

-- =============================================================================
-- TIER 1: Change to SECURITY INVOKER (removes lint-0028 and lint-0029 entirely)
-- Rationale: these functions only read public.profiles (SELECT RLS = using true,
-- so no circular dep) or access resources the caller already has permission to.
-- auth.uid() works correctly in SECURITY INVOKER context.
-- =============================================================================

-- is_admin: reads profiles via SELECT (using true) — no circular recursion risk
alter function public.is_admin() security invoker;

-- has_min_role: same reasoning as is_admin()
alter function public.has_min_role(required_role text) security invoker;

-- get_current_timestamp: just returns now() — no elevated access needed
alter function public.get_current_timestamp() security invoker;

-- reorder_hero_slides: UPDATE via RLS + internal is_admin() check — invoker is safe
alter function public.reorder_hero_slides(order_data jsonb) security invoker;

-- reorder_team_members: same reasoning as reorder_hero_slides
alter function public.reorder_team_members(items jsonb) security invoker;

-- =============================================================================
-- TIER 2: REVOKE FROM PUBLIC for remaining SECURITY DEFINER functions
-- These MUST keep SECURITY DEFINER for legitimate technical reasons:
--   - Trigger functions: must write to audit/auth tables regardless of caller
--   - Cleanup/cron functions: must bypass RLS for bulk deletes
--   - communiques_presse_dashboard: called via service_role only (explicit grant)
--   - get_audit_logs_with_email: must JOIN auth.users system table
-- REVOKE FROM PUBLIC is the correct fix — REVOKE FROM anon/authenticated
-- does NOT remove the default PUBLIC-inherited EXECUTE grant in PostgreSQL.
-- =============================================================================

-- Trigger functions — called by DB engine, never via REST API
revoke execute on function public.audit_trigger() from public;
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_user_deletion() from public;
revoke execute on function public.handle_user_update() from public;
revoke execute on function public.sync_evenements_genres_on_spectacle_update() from public;

-- Cleanup/cron functions — called by pg_cron or service_role only
revoke execute on function public.cleanup_expired_audit_logs() from public;
revoke execute on function public.cleanup_expired_data(p_table_name text) from public;
revoke execute on function public.cleanup_old_contact_messages() from public;
revoke execute on function public.cleanup_unsubscribed_newsletter() from public;

-- communiques_presse_dashboard — callable by service_role only (schema-level grant)
revoke execute on function public.communiques_presse_dashboard() from public;

-- get_audit_logs_with_email — must keep SECURITY DEFINER to JOIN auth.users
revoke execute on function public.get_audit_logs_with_email(
  p_action text,
  p_table_name text,
  p_user_id uuid,
  p_date_from timestamp with time zone,
  p_date_to timestamp with time zone,
  p_search text,
  p_page integer,
  p_limit integer
) from public;

-- =============================================================================
-- TIER 3: Selective GRANT for get_audit_logs_with_email
-- Must remain callable by authenticated admin users (internal is_admin() check
-- prevents unauthorized access; SECURITY DEFINER required for auth.users JOIN).
-- This function will remain flagged by lint-0029 — expected and documented.
-- =============================================================================

grant execute on function public.get_audit_logs_with_email(
  p_action text,
  p_table_name text,
  p_user_id uuid,
  p_date_from timestamp with time zone,
  p_date_to timestamp with time zone,
  p_search text,
  p_page integer,
  p_limit integer
) to authenticated;
