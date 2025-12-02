/*
 * Migration: Create user_invitations table
 * Purpose: Track invitation history for audit and rate limiting
 * Affected Tables: user_invitations (new)
 * Special Considerations:
 *   - Enables RLS with admin-only access
 *   - Indexes optimized for rate limiting queries (invited_by + created_at)
 *   - ON DELETE CASCADE ensures cleanup when users are deleted
 */

create table if not exists public.user_invitations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  role text not null,
  invited_by uuid not null references auth.users(id),
  created_at timestamptz default now(),
  accepted_at timestamptz
);

comment on table public.user_invitations is 'Historique des invitations utilisateurs pour audit et rate limiting (max 10 invitations/jour/admin)';
comment on column public.user_invitations.invited_by is 'UUID de l''admin qui a créé l''invitation';
comment on column public.user_invitations.accepted_at is 'Date d''acceptation de l''invitation (null si en attente)';

create index idx_user_invitations_invited_by on public.user_invitations(invited_by, created_at);
create index idx_user_invitations_user_id on public.user_invitations(user_id);

alter table public.user_invitations enable row level security;

create policy "Authenticated admins can view all invitations"
on public.user_invitations for select
to authenticated
using (public.is_admin());

create policy "Anonymous cannot view invitations"
on public.user_invitations for select
to anon
using (false);

create policy "Authenticated admins can insert invitations"
on public.user_invitations for insert
to authenticated
with check (public.is_admin());

create policy "Anonymous cannot insert invitations"
on public.user_invitations for insert
to anon
with check (false);

create policy "Authenticated admins can update invitations"
on public.user_invitations for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Authenticated admins can delete invitations"
on public.user_invitations for delete
to authenticated
using (public.is_admin());
