-- Fix RLS policy for spectacles INSERT
-- The policy should use is_admin() instead of auth.uid() check

drop policy if exists "Authenticated users can create spectacles" on public.spectacles;
create policy "Authenticated users can create spectacles"
on public.spectacles
for insert
to authenticated
with check ( (select public.is_admin()) = true );
