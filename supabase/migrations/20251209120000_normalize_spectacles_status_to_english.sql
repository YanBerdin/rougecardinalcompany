-- migration: normalize spectacles status values to canonical english tokens
-- date: 2025-12-09
-- purpose: map legacy and localized status values to canonical english values (draft, published, archived)
-- affected table: public.spectacles (status column)
-- special considerations:
--   - runs on supabase cloud
--   - non-destructive data updates (rows are updated to canonical values)
--   - after mapping, add a check constraint to prevent regressions
--   - ensure operators with different locales are considered (accent-free variants)

begin;

-- 0) create a non-destructive backup (timestamped)
create table if not exists public.spectacles_backup_20251209120000 as table public.spectacles with data;

-- 0b) disable content-versioning trigger to avoid flooding content_versions
-- (will be re-enabled at the end of the migration)
do $$
begin
  if exists (
    select 1 from pg_trigger where tgname = 'trg_spectacles_versioning'
  ) then
    alter table public.spectacles disable trigger trg_spectacles_versioning;
  end if;
end$$;

-- 1) update common french/legacy variants -> canonical english
update public.spectacles
set status = case
  -- drafts
  when lower(trim(status)) in ('brouillon','draft','projet','projet ') then 'draft'

  -- published / currently showing
  when lower(trim(status)) in ('actuellement','a l''affiche','a l''affiche ','a l affiche','a laffiche','en cours','en_cours','en cours ','en_tournee','en_tournee','en tournée') then 'published'
  when lower(trim(status)) in ('published','published ') then 'published'

  -- archived / finished
  when lower(trim(status)) in ('archive','archivé','archived','archived ','archive ','terminé','termine','termine ','annulé','annule') then 'archived'
  when lower(trim(status)) in ('archived','archive') then 'archived'

  -- fallback: keep existing value (will be validated later)
  else status
end
where status is not null;

-- 2) optional: normalize whitespace and remove accidental underscores
update public.spectacles
set status = regexp_replace(status, '_', ' ', 'g')
where status like '%\_%';

-- 3) verify no unexpected values remain (diagnostic)
-- this SELECT is for review when running migration manually; remove or ignore in automated runs
-- select distinct status from public.spectacles order by 1;

-- 4) ensure all rows now contain only allowed canonical values
-- we add a check constraint to protect from future bad writes
alter table public.spectacles
  add constraint chk_spectacles_status_allowed
  check (status in ('draft','published','archived'));

-- 5) update comment for documentation (keeps declarative schema aligned)

-- re-enable content-versioning trigger
do $$
begin
  if exists (
    select 1 from pg_trigger where tgname = 'trg_spectacles_versioning'
  ) then
    alter table public.spectacles enable trigger trg_spectacles_versioning;
  end if;
end$$;

comment on column public.spectacles.status is 'canonical status values: ''draft'', ''published'', ''archived''. ui shows localized labels (french) via application helper.';

commit;

-- notes:
-- - run this migration through the supabase migrations mechanism (git + supabase db push) on cloud.
-- - if your project still accepts legacy values from external sources, add a small server-side mapping layer when inserting/updating records instead of re-introducing legacy tokens.
-- - if any third-party code expects french tokens, update it to use translateStatus helper.
