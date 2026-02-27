-- Migration: Fix analytics_events INSERT RLS policy
-- Purpose: Allow NULL entity_type and add 'page_view' event type
-- Affected table: analytics_events
-- Reason: Previous policy required entity_type to be non-null (SQL IN with NULL
--         evaluates to NULL/false) and did not include 'page_view' event type
--         which is the primary event type for page view tracking.
-- Note: Policies split by role (anon / authenticated) per project RLS conventions.
--       Hotfix migration — conformant with Declarative_Database_Schema.instructions.md
--       (INSERT policy intentionally managed here, not in 62_rls_advanced_tables.sql)

-- Drop existing combined INSERT policy (replaced by two granular policies below)
drop policy if exists "Validated analytics collection" on public.analytics_events;

-- Policy for anonymous users (non authentifiés, cas courant pour le tracking public)
create policy "Anon can insert validated analytics events"
on public.analytics_events
for insert
to anon
with check (
  -- Types d''événements autorisés (page_view ajouté pour le tracking de navigation)
  event_type in ('page_view', 'view', 'click', 'share', 'download')

  -- entity_type : optionnel pour page_view, doit être dans la whitelist si fourni
  and (
    entity_type is null
    or entity_type in ('spectacle', 'article', 'communique', 'evenement', 'media', 'partner', 'team')
  )

  -- entity_id : optionnel, entier positif si fourni
  and (entity_id is null or entity_id::text ~ '^\d+$')

  -- session_id : optionnel, format UUID 36 caractères si fourni
  and (session_id is null or session_id::text ~ '^[a-f0-9-]{36}$')

  -- user_agent : optionnel, max 500 caractères
  and (user_agent is null or length(user_agent) <= 500)
);

-- Policy pour les utilisateurs authentifiés (même règles de validation)
create policy "Authenticated users can insert validated analytics events"
on public.analytics_events
for insert
to authenticated
with check (
  -- Types d''événements autorisés (page_view ajouté pour le tracking de navigation)
  event_type in ('page_view', 'view', 'click', 'share', 'download')

  -- entity_type : optionnel pour page_view, doit être dans la whitelist si fourni
  and (
    entity_type is null
    or entity_type in ('spectacle', 'article', 'communique', 'evenement', 'media', 'partner', 'team')
  )

  -- entity_id : optionnel, entier positif si fourni
  and (entity_id is null or entity_id::text ~ '^\d+$')

  -- session_id : optionnel, format UUID 36 caractères si fourni
  and (session_id is null or session_id::text ~ '^[a-f0-9-]{36}$')

  -- user_agent : optionnel, max 500 caractères
  and (user_agent is null or length(user_agent) <= 500)
);
