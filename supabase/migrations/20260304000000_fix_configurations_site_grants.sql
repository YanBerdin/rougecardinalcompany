-- migration: 20260304000000_fix_configurations_site_grants.sql
-- purpose: ajouter les grants table-level manquants sur configurations_site
--
-- Les grants manquants causaient des erreurs PostgREST "permission denied" pour anon/authenticated
-- avant même que le filtrage RLS ne soit évalué, rendant le héros invisible sur la page publique.
--
-- Le filtrage par ligne (accès public vs admin) est géré par les RLS existantes sur la table.

-- Grant SELECT pour anon et authenticated (nécessaire pour les pages publiques)
grant select on public.configurations_site to anon, authenticated;

-- Grant DML pour authenticated uniquement (les RLS admin protègent las mutations)
grant insert, update, delete on public.configurations_site to authenticated;
