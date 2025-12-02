/*
 * Migration: Create pending_invitations table
 * Purpose: Queue for retry mechanism on failed invitation emails
 * Affected Tables: pending_invitations (new)
 * Special Considerations:
 *   - Enables RLS with admin-only access
 *   - Includes retry tracking (attempts, last_error, next_retry_at)
 *   - Automatic timestamp updates via trigger
 *   - ON DELETE CASCADE ensures cleanup when users are deleted
 */

create table if not exists public.pending_invitations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  invitation_url text not null,
  attempts integer default 0,
  max_attempts integer default 3,
  last_error text,
  next_retry_at timestamptz,
  status text default 'pending' check (status in ('pending', 'sent', 'failed', 'cancelled')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.pending_invitations is 'File d''attente pour mécanisme de retry des emails d''invitation échoués';
comment on column public.pending_invitations.attempts is 'Nombre de tentatives d''envoi effectuées';
comment on column public.pending_invitations.max_attempts is 'Nombre maximum de tentatives avant échec définitif';
comment on column public.pending_invitations.next_retry_at is 'Date/heure de la prochaine tentative (backoff exponentiel)';
comment on column public.pending_invitations.metadata is 'Données additionnelles (role, invited_by, etc.)';

create index idx_pending_invitations_status on public.pending_invitations(status, next_retry_at);
create index idx_pending_invitations_user_id on public.pending_invitations(user_id);

alter table public.pending_invitations enable row level security;

create policy "Authenticated admins can view all pending invitations"
on public.pending_invitations for select
to authenticated
using (public.is_admin());

create policy "Anonymous cannot view pending invitations"
on public.pending_invitations for select
to anon
using (false);

create policy "Authenticated admins can insert pending invitations"
on public.pending_invitations for insert
to authenticated
with check (public.is_admin());

create policy "Anonymous cannot insert pending invitations"
on public.pending_invitations for insert
to anon
with check (false);

create policy "Authenticated admins can update pending invitations"
on public.pending_invitations for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Authenticated admins can delete pending invitations"
on public.pending_invitations for delete
to authenticated
using (public.is_admin());

create or replace function public.update_pending_invitations_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

comment on function public.update_pending_invitations_updated_at is 'Trigger function pour mettre à jour updated_at automatiquement';

create trigger pending_invitations_updated_at_trigger
before update on public.pending_invitations
for each row
execute function public.update_pending_invitations_updated_at();
