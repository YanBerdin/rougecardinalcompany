-- Migration: Add display_order to articles_presse
-- Purpose: Support manual drag-and-drop reordering of press articles in admin,
--          which also drives the public sort order (/presse + homepage "À la une").
-- Affected: public.articles_presse (new column + index)
-- Special: Backfill of existing rows is handled by a separate DML migration
--          (20260703120001_backfill_display_order_articles_presse.sql).

alter table public.articles_presse
	add column if not exists display_order integer not null default 0;

comment on column public.articles_presse.display_order is 'manual display order for admin drag-and-drop reordering; also drives public sort order on /presse and the homepage "À la une" widget';

create index if not exists idx_articles_presse_display_order on public.articles_presse (display_order);
