-- Fix TASK021: Correct RLS policy for spectacles INSERT
-- Issue: Policy uses auth.uid() which can be NULL during INSERT
-- Solution: Use is_admin() which has SECURITY DEFINER and works reliably

drop policy if exists "Authenticated users can create spectacles" on public.spectacles;
create policy "Authenticated users can create spectacles"
on public.spectacles
for insert
to authenticated
with check ( (select public.is_admin()) = true );

comment on policy "Authenticated users can create spectacles" on public.spectacles is 
'Only admins can create spectacles. Uses is_admin() instead of auth.uid() for reliable authentication check during INSERT operations.';
