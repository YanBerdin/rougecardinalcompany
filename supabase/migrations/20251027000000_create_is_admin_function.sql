-- Migration d'urgence: Create is_admin() function
-- Contexte: Les RLS policies utilisent is_admin() mais la fonction n'existe pas en base
-- Cette fonction DOIT exister AVANT les policies RLS
-- Date: 2025-10-27

-- Fonction helper pour vérifier les droits admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'admin'
  );
$$;

comment on function public.is_admin() is 
'Helper function: Checks if current user has admin role. Uses SECURITY DEFINER to access auth.uid() and profiles table reliably across different security contexts. Marked STABLE since auth.uid() remains constant during transaction.';

-- Grant execute to authenticated users (needed for RLS policies)
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_admin() to anon;
