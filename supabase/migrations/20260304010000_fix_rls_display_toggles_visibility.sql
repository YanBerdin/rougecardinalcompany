-- migration: 20260304010000_fix_rls_display_toggles_visibility.sql
-- purpose: corriger la policy RLS SELECT sur configurations_site pour autoriser
--          les display_toggle_* en lecture publique (anon + authenticated).
--          Auparavant seules les clés 'public:%' étaient lisibles — les display toggles
--          étaient filtrés par RLS, rendant les sections héro/about/etc. invisibles.
-- affected: public.configurations_site (policy SELECT)
-- hotfix: oui — intégré au schéma déclaratif 10_tables_system.sql

-- Supprimer l'ancienne policy et recréer avec la condition élargie
drop policy if exists "Public site configurations are viewable by everyone" on public.configurations_site;

create policy "Public site configurations are viewable by everyone"
on public.configurations_site
for select
to anon, authenticated
using (
  key like 'public:%'
  or key like 'display_toggle_%'
  or (select public.is_admin())
);
