-- Script: check_unused_indexes.sql
-- Usage: exécuter sur la base de données cible (production)
-- Objectif: lister les index avec idx_scan = 0 pour revue avant suppression

select
  schemaname,
  relname as tablename,
  indexrelname as indexname,
  idx_scan,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
from pg_stat_user_indexes
where schemaname = 'public'
  and idx_scan = 0
order by pg_relation_size(indexrelid) desc;
