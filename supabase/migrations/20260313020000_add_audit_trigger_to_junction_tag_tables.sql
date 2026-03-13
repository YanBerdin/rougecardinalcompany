-- Migration: Add audit trigger to 4 junction tag tables
-- Purpose: Extend audit coverage to tag association tables so that
--          tag attach/detach operations appear in audit logs.
-- Affected tables: articles_tags, communiques_tags, media_item_tags, spectacles_tags
-- Note: popular_tags is a VIEW and cannot have triggers.
-- Note: communiques_tags already has trg_communiques_tags_usage_count (compatible).

-- articles_tags
drop trigger if exists trg_audit on public.articles_tags;
create trigger trg_audit
  after insert or update or delete on public.articles_tags
  for each row
  execute function public.audit_trigger();

-- communiques_tags
drop trigger if exists trg_audit on public.communiques_tags;
create trigger trg_audit
  after insert or update or delete on public.communiques_tags
  for each row
  execute function public.audit_trigger();

-- media_item_tags
drop trigger if exists trg_audit on public.media_item_tags;
create trigger trg_audit
  after insert or update or delete on public.media_item_tags
  for each row
  execute function public.audit_trigger();

-- spectacles_tags
drop trigger if exists trg_audit on public.spectacles_tags;
create trigger trg_audit
  after insert or update or delete on public.spectacles_tags
  for each row
  execute function public.audit_trigger();
