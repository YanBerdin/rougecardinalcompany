-- 04_indexes_fulltext.sql
-- indexes and fulltext

-- evenements date index
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i'
      AND c.relname = 'idx_evenements_date_debut'
      AND n.nspname = 'public'
  ) THEN
    EXECUTE 'create index idx_evenements_date_debut on public.evenements (date_debut)';
  END IF;
END;
$$;

-- full text indexes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i'
      AND c.relname = 'idx_spectacles_search_vector'
      AND n.nspname = 'public'
  ) THEN
    EXECUTE 'create index idx_spectacles_search_vector on public.spectacles using gin (search_vector)';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i'
      AND c.relname = 'idx_articles_search_vector'
      AND n.nspname = 'public'
  ) THEN
    EXECUTE 'create index idx_articles_search_vector on public.articles_presse using gin (search_vector)';
  END IF;
END;
$$;

-- regular indexes
create index if not exists idx_medias_storage_path on public.medias (storage_path);
create index if not exists idx_profiles_user_id on public.profiles (user_id);
create index if not exists idx_spectacles_titre on public.spectacles (titre);
create index if not exists idx_articles_published_at on public.articles_presse (published_at);

-- trigram indexes for fuzzy title search
create index if not exists idx_spectacles_titre_trgm on public.spectacles using gin (titre gin_trgm_ops);
create index if not exists idx_articles_title_trgm on public.articles_presse using gin (titre gin_trgm_ops);
