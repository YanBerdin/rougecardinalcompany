-- Tables utilitaires - Tables système et configuration
-- Ordre: 09 - Tables indépendantes

-- Newsletter subscribers
drop table if exists public.abonnes_newsletter cascade;
create table public.abonnes_newsletter (
  id bigint generated always as identity primary key,
  email citext not null,
  subscribed boolean default true,
  subscribed_at timestamptz default now(),
  unsubscribed_at timestamptz null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null
);
alter table public.abonnes_newsletter add constraint abonnes_email_unique unique (email);

-- Contact form messages  
drop table if exists public.messages_contact cascade;
create table public.messages_contact (
  id bigint generated always as identity primary key,
  firstname text,
  lastname text,
  email text not null,
  phone text, -- téléphone volontaire
  reason text not null, -- booking|partenariat|presse|education|technique|autre (valeurs FR normalisées)
  message text not null,
  consent boolean default false, -- consentement RGPD (newsletter ou réponse)
  consent_at timestamptz null, -- timestamp auto quand consent passe à true
  status text default 'nouveau' not null, -- nouveau|en_cours|traite|archive|spam
  processed boolean generated always as (status in ('traite','archive')) stored, -- compat legacy (dérivé)
  processed_at timestamptz null,
  spam_score numeric(5,2), -- score heuristique (optionnel)
  metadata jsonb default '{}'::jsonb, -- données supplémentaires (ip, user_agent)
  contact_presse_id bigint null references public.contacts_presse(id) on delete set null, -- association manuelle via back-office
  created_at timestamptz default now() not null
);

comment on table public.messages_contact is 'Messages issus du formulaire de contact (public). Ne stocke que les soumissions entrantes.';
comment on column public.messages_contact.firstname is 'Prénom saisi dans le formulaire de contact.';
comment on column public.messages_contact.lastname is 'Nom de famille saisi dans le formulaire de contact.';
comment on column public.messages_contact.reason is 'Motif du contact (booking|partenariat|presse|education|technique|autre) en français.';
comment on column public.messages_contact.consent is 'Indique si l''utilisateur a donné son consentement explicite.';
comment on column public.messages_contact.consent_at is 'Horodatage du consentement enregistré automatiquement.';
comment on column public.messages_contact.status is 'Workflow de traitement: nouveau|en_cours|traite|archive|spam';
comment on column public.messages_contact.processed is 'Champ dérivé: true si status final (traite, archive).';
comment on column public.messages_contact.contact_presse_id is 'Lien optionnel vers un contact presse existant (association manuelle back-office).';

-- Vue d'administration pour le suivi et le tri des messages de contact
-- SECURITY: Explicitly set SECURITY INVOKER to run with querying user's privileges
drop view if exists public.messages_contact_admin cascade;
create view public.messages_contact_admin
with (security_invoker = true)
as
select
  mc.id,
  mc.created_at,
  now() - mc.created_at as age,
  mc.firstname,
  mc.lastname,
  trim(coalesce(mc.firstname,'') || ' ' || coalesce(mc.lastname,'')) as full_name,
  mc.email,
  mc.phone,
  mc.reason,
  mc.message,
  mc.status,
  mc.processed,
  mc.processed_at,
  case when mc.processed_at is not null then mc.processed_at - mc.created_at end as processing_latency,
  mc.consent,
  mc.consent_at,
  mc.spam_score,
  mc.metadata,
  mc.contact_presse_id,
  cp.nom as contact_presse_nom,
  cp.email as contact_presse_email
from public.messages_contact mc
left join public.contacts_presse as cp on cp.id = mc.contact_presse_id
order by
  case
    when mc.status = 'nouveau' then 1
    when mc.status = 'en_cours' then 2
    when mc.status = 'traite' then 3
    else 4
  end,
  mc.created_at desc;

comment on view public.messages_contact_admin is 'Vue pour l administration: suivi des messages, latences, association presse.';

alter view public.messages_contact_admin owner to admin_views_owner;
revoke all on public.messages_contact_admin from anon, authenticated;
grant select on public.messages_contact_admin to service_role;

-- Site configuration
drop table if exists public.configurations_site cascade;
create table public.configurations_site (
  key text primary key,
  value jsonb not null,
  description text,
  category text,
  updated_at timestamptz default now() not null,
  updated_by uuid references auth.users(id) on delete set null
);

-- Audit logs
drop table if exists public.logs_audit cascade;
create table public.logs_audit (
  id bigserial primary key,
  user_id uuid null,
  action text not null,
  table_name text not null,
  record_id text null,
  old_values jsonb null,
  new_values jsonb null,
  ip_address inet null,
  user_agent text null,
  created_at timestamptz default now() not null
);

comment on table public.abonnes_newsletter is 'newsletter subscribers';
comment on table public.messages_contact is 'contact form messages received from website';
comment on table public.configurations_site is 'key-value store for site-wide configuration';
comment on table public.logs_audit is 'audit log for create/update/delete operations on tracked tables';

-- ===== ROW LEVEL SECURITY =====

-- ---- ABONNES NEWSLETTER ----
alter table public.abonnes_newsletter enable row level security;

-- RGPD: Seuls les admins peuvent lire les emails des abonnés (donnée personnelle)
-- L'email ne doit pas être exposé publiquement
drop policy if exists "Admins can view newsletter subscribers" on public.abonnes_newsletter;
create policy "Admins can view newsletter subscribers"
on public.abonnes_newsletter
for select
to authenticated
using ( (select public.is_admin()) );

-- NOTE: Newsletter INSERT policy removed from declarative schema
-- Managed by migration: 20260106232619_fix_newsletter_infinite_recursion.sql (LATEST FIX)
-- Previous: 20260106190617_fix_rls_policy_with_check_true_vulnerabilities.sql (had recursion bug)
-- Policy name: "Validated newsletter subscription"

-- Seuls les admins peuvent modifier les abonnements
drop policy if exists "Admins can update newsletter subscriptions" on public.abonnes_newsletter;
create policy "Admins can update newsletter subscriptions"
on public.abonnes_newsletter
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

-- Les abonnés peuvent se désabonner ou les admins peuvent supprimer
drop policy if exists "Subscribers can unsubscribe or admins can delete" on public.abonnes_newsletter;
create policy "Subscribers can unsubscribe or admins can delete"
on public.abonnes_newsletter
for delete
to anon, authenticated
using ( 
  -- Les admins peuvent tout supprimer
  (select public.is_admin()) 
  -- Ou l'utilisateur peut se désabonner via email (à implementer côté app)
);

-- ---- MESSAGES CONTACT ----
alter table public.messages_contact enable row level security;

-- RGPD: Seuls les admins peuvent lire les données personnelles (prénom, nom, email, téléphone)
-- Les messages de contact contiennent des informations sensibles qui ne doivent jamais être exposées publiquement
drop policy if exists "Admins can view contact messages" on public.messages_contact;
create policy "Admins can view contact messages"
on public.messages_contact
for select
to authenticated
using ( (select public.is_admin()) );

-- NOTE: Contact INSERT policy removed from declarative schema
-- Managed by migration: 20260106190617_fix_rls_policy_with_check_true_vulnerabilities.sql
-- Policy name: "Validated contact submission"

-- Seuls les admins peuvent modifier les messages
drop policy if exists "Admins can update contact messages" on public.messages_contact;
create policy "Admins can update contact messages"
on public.messages_contact
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

-- Seuls les admins peuvent supprimer les messages
drop policy if exists "Admins can delete contact messages" on public.messages_contact;
create policy "Admins can delete contact messages"
on public.messages_contact
for delete
to authenticated
using ( (select public.is_admin()) );

-- Validation applicative basique via contraintes CHECK (enum text simulé)
do $$
begin
  -- reason check
  if exists (select 1 from pg_constraint where conname = 'messages_contact_reason_check') then
    alter table public.messages_contact drop constraint messages_contact_reason_check;
  end if;
  alter table public.messages_contact add constraint messages_contact_reason_check
    check (reason in ('booking','partenariat','presse','education','technique','autre'));

  -- status check
  if exists (select 1 from pg_constraint where conname = 'messages_contact_status_check') then
    alter table public.messages_contact drop constraint messages_contact_status_check;
  end if;
  alter table public.messages_contact add constraint messages_contact_status_check
    check (status in ('nouveau','en_cours','traite','archive','spam'));
exception when others then
  raise notice 'Could not apply messages_contact checks: %', sqlerrm;
end;$$ language plpgsql;

-- ---- CONFIGURATIONS SITE ----
alter table public.configurations_site enable row level security;

-- Tout le monde peut voir les configurations publiques (selon convention de nommage)
drop policy if exists "Public site configurations are viewable by everyone" on public.configurations_site;
create policy "Public site configurations are viewable by everyone"
on public.configurations_site
for select
to anon, authenticated
using ( 
  -- Seules les configs dont la clé commence par 'public:' sont visibles pour tous
  key like 'public:%'
  -- Ou si l'utilisateur est admin, il peut voir toutes les configs
  or (select public.is_admin())
);

-- Seuls les admins peuvent gérer les configurations
drop policy if exists "Admins can create site configurations" on public.configurations_site;
create policy "Admins can create site configurations"
on public.configurations_site
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update site configurations" on public.configurations_site;
create policy "Admins can update site configurations"
on public.configurations_site
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete site configurations" on public.configurations_site;
create policy "Admins can delete site configurations"
on public.configurations_site
for delete
to authenticated
using ( (select public.is_admin()) );

-- ---- LOGS AUDIT ----
alter table public.logs_audit enable row level security;

-- Seuls les admins peuvent voir les logs d'audit
drop policy if exists "Admins can view audit logs" on public.logs_audit;
create policy "Admins can view audit logs"
on public.logs_audit
for select
to authenticated
using ( (select public.is_admin()) );

-- INSERT restreint au trigger SECURITY DEFINER uniquement
-- Les utilisateurs n'ont PAS de droit INSERT direct pour éviter falsification
-- Voir audit_trigger() dans 02b_functions_core.sql (SECURITY DEFINER)
drop policy if exists "System can insert audit logs" on public.logs_audit;
-- NO INSERT POLICY - Access via SECURITY DEFINER trigger only

comment on table public.logs_audit is 
'Audit trail table. INSERT restricted to SECURITY DEFINER trigger only. 
Direct user INSERT blocked to prevent log falsification. 
14 tables use trg_audit trigger for automatic logging.';

-- Seuls les super-admins peuvent modifier/supprimer les logs (rare)
drop policy if exists "Super admins can update audit logs" on public.logs_audit;
create policy "Super admins can update audit logs"
on public.logs_audit
for update
to authenticated
using ( 
  (select public.is_admin()) 
  and exists (
    select 1 
    from public.profiles as p 
    where p.user_id = (select auth.uid()) 
      and p.role = 'super_admin'
  )
)
with check ( 
  (select public.is_admin()) 
  and exists (
    select 1 
    from public.profiles as p 
    where p.user_id = (select auth.uid()) 
      and p.role = 'super_admin'
  )
);

drop policy if exists "Super admins can delete audit logs" on public.logs_audit;
create policy "Super admins can delete audit logs"
on public.logs_audit
for delete
to authenticated
using ( 
  (select public.is_admin()) 
  and exists (
    select 1 
    from public.profiles as p 
    where p.user_id = (select auth.uid()) 
      and p.role = 'super_admin'
  )
);
