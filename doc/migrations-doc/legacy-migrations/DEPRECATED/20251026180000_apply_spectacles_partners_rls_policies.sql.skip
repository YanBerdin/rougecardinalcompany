-- Migration d'urgence: Apply RLS policies for spectacles and partners tables
-- Contexte: Les policies existaient dans 61_rls_main_tables.sql mais n'ont jamais été appliquées
-- Résultat: Tables inaccessibles après révocation des grants (rounds 1-17)
-- Date: 2025-10-26

-- ========================================
-- SPECTACLES - RLS Policies
-- ========================================

-- Activer RLS (déjà fait normalement mais on s'assure)
alter table public.spectacles enable row level security;

-- SELECT: Public spectacles viewable by everyone
drop policy if exists "Public spectacles are viewable by everyone" on public.spectacles;
create policy "Public spectacles are viewable by everyone"
on public.spectacles
for select
to anon, authenticated
using ( public = true );

-- INSERT: Authenticated users can create spectacles
drop policy if exists "Authenticated users can create spectacles" on public.spectacles;
create policy "Authenticated users can create spectacles"
on public.spectacles
for insert
to authenticated
with check ( (select auth.uid()) is not null );

-- UPDATE: Owners or admins can update spectacles
drop policy if exists "Owners or admins can update spectacles" on public.spectacles;
create policy "Owners or admins can update spectacles"
on public.spectacles
for update
to authenticated
using ( (created_by = (select auth.uid())) or (select public.is_admin()) )
with check ( (created_by = (select auth.uid())) or (select public.is_admin()) );

-- DELETE: Owners or admins can delete spectacles
drop policy if exists "Owners or admins can delete spectacles" on public.spectacles;
create policy "Owners or admins can delete spectacles"
on public.spectacles
for delete
to authenticated
using ( (created_by = (select auth.uid())) or (select public.is_admin()) );

-- ========================================
-- PARTNERS - RLS Policies
-- ========================================

-- Activer RLS
alter table public.partners enable row level security;

-- SELECT: Public/active partners viewable by anyone
drop policy if exists "Public partners are viewable by anyone" on public.partners;
create policy "Public partners are viewable by anyone"
on public.partners
for select
to authenticated, anon
using ( is_active = true );

-- SELECT: Admins can view all partners (including inactive)
drop policy if exists "Admins can view all partners" on public.partners;
create policy "Admins can view all partners"
on public.partners
for select
to authenticated
using ( (select public.is_admin()) );

-- INSERT: Admins can create partners
drop policy if exists "Admins can create partners" on public.partners;
create policy "Admins can create partners"
on public.partners
for insert
to authenticated
with check ( (select public.is_admin()) );

-- UPDATE: Admins can update partners
drop policy if exists "Admins can update partners" on public.partners;
create policy "Admins can update partners"
on public.partners
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

-- DELETE: Admins can delete partners
drop policy if exists "Admins can delete partners" on public.partners;
create policy "Admins can delete partners"
on public.partners
for delete
to authenticated
using ( (select public.is_admin()) );

-- ========================================
-- Vérification finale
-- ========================================
-- Les policies devraient maintenant être actives
-- Vérifier avec: SELECT * FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('spectacles', 'partners');
