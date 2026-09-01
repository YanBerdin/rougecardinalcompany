-- Migration: Backfill display_order on articles_presse
-- Purpose: Initialize display_order for existing rows based on the current
--          chronological order (published_at desc, nulls last), so the
--          drag-and-drop admin UI and public sort order do not change on
--          first load after the previous migration.
-- Affected: public.articles_presse (data only, no schema change)
-- Special: DML migration, not captured by supabase db diff.

update public.articles_presse
set display_order = sub.rn - 1
from (
	select
		id,
		row_number() over (order by published_at desc nulls last, id desc) as rn
	from public.articles_presse
) as sub
where public.articles_presse.id = sub.id;
