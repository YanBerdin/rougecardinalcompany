-- Migration: Add audit trigger to media_tags table
-- Purpose: media_tags was missing from the audit_tables array, causing editor-created
--          media tags to not appear in audit logs (Bug: tag visible in media_tags but
--          absent from logs_audit).
-- Affected tables: media_tags (add trg_audit trigger)
-- Related task: TASK076 - fix editor role permissions

-- Add trg_audit (insert / update / delete) to public.media_tags
drop trigger if exists trg_audit on public.media_tags;
create trigger trg_audit
  after insert or update or delete on public.media_tags
  for each row
  execute function public.audit_trigger();
