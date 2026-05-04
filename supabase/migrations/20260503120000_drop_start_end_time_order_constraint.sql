-- Migration: Drop check_start_end_time_order constraint on evenements
-- Purpose: The constraint start_time <= end_time incorrectly rejects valid
--          theater events that run past midnight (e.g., start 20:30, end 00:30).
--          Chronological order is already enforced by date_debut / date_fin (timestamptz).
-- Affected tables: evenements
-- Date: 2026-05-03

alter table public.evenements
  drop constraint if exists check_start_end_time_order;
