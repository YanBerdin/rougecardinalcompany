-- Fix spectacles RLS insert policy
-- Remove unnecessary "= true" comparison since is_admin() already returns boolean

drop policy if exists "Authenticated users can create spectacles" on public.spectacles;

create policy "Authenticated users can create spectacles"
on public.spectacles
for insert
to authenticated
with check ( (select public.is_admin()) );
