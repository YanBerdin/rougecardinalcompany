-- =====================================================
-- Schema: User Invitations Management
-- Description: Tables pour gérer les invitations utilisateurs
--              et le mécanisme de retry des emails
-- =====================================================

-- =====================================================
-- Table: user_invitations
-- Description: Historique des invitations pour audit et rate limiting
-- =====================================================

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

create index if not exists idx_user_invitations_invited_by on public.user_invitations(invited_by, created_at);
create index if not exists idx_user_invitations_user_id on public.user_invitations(user_id);

-- Enable RLS
alter table public.user_invitations enable row level security;

-- RLS Policies for user_invitations
drop policy if exists "Authenticated admins can view all invitations" on public.user_invitations;
create policy "Authenticated admins can view all invitations"
on public.user_invitations for select
to authenticated
using (public.is_admin());

drop policy if exists "Anonymous cannot view invitations" on public.user_invitations;
create policy "Anonymous cannot view invitations"
on public.user_invitations for select
to anon
using (false);

drop policy if exists "Authenticated admins can insert invitations" on public.user_invitations;
create policy "Authenticated admins can insert invitations"
on public.user_invitations for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Anonymous cannot insert invitations" on public.user_invitations;
create policy "Anonymous cannot insert invitations"
on public.user_invitations for insert
to anon
with check (false);

drop policy if exists "Authenticated admins can update invitations" on public.user_invitations;
create policy "Authenticated admins can update invitations"
on public.user_invitations for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Authenticated admins can delete invitations" on public.user_invitations;
create policy "Authenticated admins can delete invitations"
on public.user_invitations for delete
to authenticated
using (public.is_admin());

-- =====================================================
-- Table: pending_invitations
-- Description: File d'attente pour retry des emails échoués
-- =====================================================

create table if not exists public.pending_invitations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  invitation_url text not null,
  attempts integer default 0,
  max_attempts integer default 3,
  last_error text,
  next_retry_at timestamptz,
  status text default 'pending',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  constraint pending_invitations_status_check check (status in ('pending', 'sent', 'failed', 'cancelled'))
);

comment on table public.pending_invitations is 'File d''attente pour mécanisme de retry des emails d''invitation échoués';
comment on column public.pending_invitations.attempts is 'Nombre de tentatives d''envoi effectuées';
comment on column public.pending_invitations.max_attempts is 'Nombre maximum de tentatives avant échec définitif';
comment on column public.pending_invitations.next_retry_at is 'Date/heure de la prochaine tentative (backoff exponentiel)';
comment on column public.pending_invitations.metadata is 'Données additionnelles (role, invited_by, etc.)';

create index if not exists idx_pending_invitations_status on public.pending_invitations(status, next_retry_at);
create index if not exists idx_pending_invitations_user_id on public.pending_invitations(user_id);

-- Enable RLS
alter table public.pending_invitations enable row level security;

-- RLS Policies for pending_invitations
drop policy if exists "Authenticated admins can view all pending invitations" on public.pending_invitations;
create policy "Authenticated admins can view all pending invitations"
on public.pending_invitations for select
to authenticated
using (public.is_admin());

drop policy if exists "Anonymous cannot view pending invitations" on public.pending_invitations;
create policy "Anonymous cannot view pending invitations"
on public.pending_invitations for select
to anon
using (false);

drop policy if exists "Authenticated admins can insert pending invitations" on public.pending_invitations;
create policy "Authenticated admins can insert pending invitations"
on public.pending_invitations for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Anonymous cannot insert pending invitations" on public.pending_invitations;
create policy "Anonymous cannot insert pending invitations"
on public.pending_invitations for insert
to anon
with check (false);

drop policy if exists "Authenticated admins can update pending invitations" on public.pending_invitations;
create policy "Authenticated admins can update pending invitations"
on public.pending_invitations for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Authenticated admins can delete pending invitations" on public.pending_invitations;
create policy "Authenticated admins can delete pending invitations"
on public.pending_invitations for delete
to authenticated
using (public.is_admin());

-- =====================================================
-- Function: update_pending_invitations_updated_at
-- Description: Trigger function pour mettre à jour updated_at
-- =====================================================

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

-- Trigger for pending_invitations
drop trigger if exists pending_invitations_updated_at_trigger on public.pending_invitations;
create trigger pending_invitations_updated_at_trigger
before update on public.pending_invitations
for each row
execute function public.update_pending_invitations_updated_at();
