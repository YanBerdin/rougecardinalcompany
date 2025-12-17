-- migration: cleanup spectacles status normalization backup table
-- date: 2025-12-17
-- purpose: remove temporary backup table created during status normalization
-- affected table: public.spectacles_backup_20251209120000 (DROP)
-- special considerations:
--   - only run after verifying migration 20251209120000 was successful
--   - ensure no data loss occurred during normalization
--   - check that constraint chk_spectacles_status_allowed is enforced

begin;

-- verify the main table has the correct constraint before dropping backup
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'chk_spectacles_status_allowed'
    and conrelid = 'public.spectacles'::regclass
  ) then
    raise exception 'Cannot drop backup: constraint chk_spectacles_status_allowed not found on spectacles table';
  end if;
end$$;

-- drop the backup table (created in migration 20251209120000)
drop table if exists public.spectacles_backup_20251209120000;

comment on schema public is 'Backup table spectacles_backup_20251209120000 removed on 2025-12-17 after successful status normalization';

commit;

-- notes:
-- - backup table was created during migration 20251209120000_normalize_spectacles_status_to_english.sql
-- - after 8+ days of production use without issues, backup is no longer needed
-- - if data recovery is needed, use Supabase Time Travel feature (available for 7 days)
