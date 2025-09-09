-- Row Level Security Policies - Tables manquantes
-- Ordre: 63 - RLS pour les tables qui n'avaient pas encore de politiques

-- ---- LIEUX ----
alter table public.lieux enable row level security;

-- Tout le monde peut voir les lieux
drop policy if exists "Lieux are viewable by everyone" on public.lieux;
create policy "Lieux are viewable by everyone"
on public.lieux
for select
to anon, authenticated
using ( true );

-- Seuls les admins peuvent gérer les lieux
drop policy if exists "Admins can create lieux" on public.lieux;
create policy "Admins can create lieux"
on public.lieux
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update lieux" on public.lieux;
create policy "Admins can update lieux"
on public.lieux
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete lieux" on public.lieux;
create policy "Admins can delete lieux"
on public.lieux
for delete
to authenticated
using ( (select public.is_admin()) );

-- ---- MEMBRES EQUIPE ----
alter table public.membres_equipe enable row level security;

-- Tout le monde peut voir les membres d'équipe
drop policy if exists "Membres equipe are viewable by everyone" on public.membres_equipe;
create policy "Membres equipe are viewable by everyone"
on public.membres_equipe
for select
to anon, authenticated
using ( true );

-- Seuls les admins peuvent gérer les membres d'équipe
drop policy if exists "Admins can create membres equipe" on public.membres_equipe;
create policy "Admins can create membres equipe"
on public.membres_equipe
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update membres equipe" on public.membres_equipe;
create policy "Admins can update membres equipe"
on public.membres_equipe
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete membres equipe" on public.membres_equipe;
create policy "Admins can delete membres equipe"
on public.membres_equipe
for delete
to authenticated
using ( (select public.is_admin()) );

-- ---- ABONNES NEWSLETTER ----
alter table public.abonnes_newsletter enable row level security;

-- Seuls les admins peuvent voir les abonnés
drop policy if exists "Admins can view newsletter subscribers" on public.abonnes_newsletter;
create policy "Admins can view newsletter subscribers"
on public.abonnes_newsletter
for select
to authenticated
using ( (select public.is_admin()) );

-- Tout le monde peut s'abonner à la newsletter
drop policy if exists "Anyone can subscribe to newsletter" on public.abonnes_newsletter;
create policy "Anyone can subscribe to newsletter"
on public.abonnes_newsletter
for insert
to anon, authenticated
with check ( true );

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

-- Seuls les admins peuvent voir les messages de contact
drop policy if exists "Admins can view contact messages" on public.messages_contact;
create policy "Admins can view contact messages"
on public.messages_contact
for select
to authenticated
using ( (select public.is_admin()) );

-- Tout le monde peut envoyer un message de contact
drop policy if exists "Anyone can send contact messages" on public.messages_contact;
create policy "Anyone can send contact messages"
on public.messages_contact
for insert
to anon, authenticated
with check ( true );

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

-- Le système peut insérer des logs (via triggers)
drop policy if exists "System can insert audit logs" on public.logs_audit;
create policy "System can insert audit logs"
on public.logs_audit
for insert
to anon, authenticated
with check ( true );

-- Seuls les super-admins peuvent modifier/supprimer les logs (rare)
drop policy if exists "Super admins can update audit logs" on public.logs_audit;
create policy "Super admins can update audit logs"
on public.logs_audit
for update
to authenticated
using ( 
  (select public.is_admin()) 
  and exists (
    select 1 from public.profiles p 
    where p.user_id = (select auth.uid()) 
    and p.role = 'super_admin'
  )
)
with check ( 
  (select public.is_admin()) 
  and exists (
    select 1 from public.profiles p 
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
    select 1 from public.profiles p 
    where p.user_id = (select auth.uid()) 
    and p.role = 'super_admin'
  )
);



-- ---- EVENTS RECURRENCE ----
alter table public.events_recurrence enable row level security;

-- Tout le monde peut voir les récurrences des événements publics
drop policy if exists "Event recurrences are viewable by everyone" on public.events_recurrence;
create policy "Event recurrences are viewable by everyone"
on public.events_recurrence
for select
to anon, authenticated
using ( true );

-- Seuls les admins peuvent gérer les récurrences
drop policy if exists "Admins can create event recurrences" on public.events_recurrence;
create policy "Admins can create event recurrences"
on public.events_recurrence
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update event recurrences" on public.events_recurrence;
create policy "Admins can update event recurrences"
on public.events_recurrence
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete event recurrences" on public.events_recurrence;
create policy "Admins can delete event recurrences"
on public.events_recurrence
for delete
to authenticated
using ( (select public.is_admin()) );
