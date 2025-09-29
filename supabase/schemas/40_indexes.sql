-- Index et optimisations
-- Ordre: 40 - Après les tables

-- Index de base
create index if not exists idx_medias_storage_path on public.medias (storage_path);
create index if not exists idx_profiles_user_id on public.profiles (user_id);
create index if not exists idx_spectacles_title on public.spectacles (title);
create index if not exists idx_articles_published_at on public.articles_presse (published_at);
-- Index partiel pour optimiser les lectures publiques (articles publiés uniquement)
create index if not exists idx_articles_published_at_public 
	on public.articles_presse (published_at desc)
	where published_at is not null;

-- Index date pour événements
create index if not exists idx_evenements_date_debut on public.evenements (date_debut);
create index if not exists idx_evenements_parent_event_id on public.evenements (parent_event_id);
create index if not exists idx_evenements_recurrence_end_date on public.evenements (recurrence_end_date);

-- Index pour nouveaux champs événements
create index if not exists idx_evenements_start_time on public.evenements (start_time);
create index if not exists idx_evenements_type_array on public.evenements using gin (type_array);
create index if not exists idx_evenements_spectacle_date on public.evenements (spectacle_id, date_debut);
create index if not exists idx_evenements_date_time on public.evenements (date_debut, start_time) where start_time is not null;

-- Index trigram pour recherche fuzzy
create index if not exists idx_spectacles_title_trgm on public.spectacles using gin (title gin_trgm_ops);
create index if not exists idx_articles_title_trgm on public.articles_presse using gin (title gin_trgm_ops);

-- Index pour optimiser les politiques RLS
create index if not exists idx_medias_uploaded_by on public.medias (uploaded_by);
create index if not exists idx_spectacles_created_by on public.spectacles (created_by);

-- ===== INDEX COMMUNIQUES PRESSE =====

-- Index pour communiqués de presse
create index if not exists idx_communiques_presse_date_publication on public.communiques_presse(date_publication desc);
create index if not exists idx_communiques_presse_public on public.communiques_presse(public) where public = true;
create index if not exists idx_communiques_presse_ordre on public.communiques_presse(ordre_affichage, date_publication desc);
create index if not exists idx_communiques_presse_spectacle_id on public.communiques_presse(spectacle_id);
create index if not exists idx_communiques_presse_created_by on public.communiques_presse(created_by);

-- Index pour contacts presse
create index if not exists idx_contacts_presse_media on public.contacts_presse(media);
create index if not exists idx_contacts_presse_actif on public.contacts_presse(actif) where actif = true;
create index if not exists idx_contacts_presse_specialites on public.contacts_presse using gin (specialites);

-- Index pour relations communiqués-medias
create index if not exists idx_communiques_medias_ordre on public.communiques_medias(communique_id, ordre);

-- Recherche full-text sur titre et description (harmonisé avec articles_presse)
create index if not exists idx_communiques_presse_search on public.communiques_presse using gin (
	to_tsvector('french', coalesce(title, '') || ' ' || coalesce(description, ''))
);
create index if not exists idx_spectacles_public on public.spectacles (public) where public = true;
create index if not exists idx_partners_is_active on public.partners (is_active) where is_active = true;
create index if not exists idx_categories_is_active on public.categories (is_active) where is_active = true;
create index if not exists idx_profiles_role on public.profiles (role);
create index if not exists idx_configurations_site_key_pattern on public.configurations_site (key) where key like 'public:%';

-- ===== INDEX MESSAGES CONTACT =====
create index if not exists idx_messages_contact_reason on public.messages_contact(reason);
create index if not exists idx_messages_contact_status on public.messages_contact(status);
create index if not exists idx_messages_contact_created_at on public.messages_contact(created_at desc);
create index if not exists idx_messages_contact_contact_presse on public.messages_contact(contact_presse_id) where contact_presse_id is not null;
-- Index partiel pour filtrage rapide des messages actifs (non terminés) dans dashboard
create index if not exists idx_messages_contact_status_actifs on public.messages_contact(status) where status in ('nouveau','en_cours');
-- Index partiel pour recherche des messages avec consentement explicite (ex: export ciblé)
create index if not exists idx_messages_contact_consent_true on public.messages_contact(id) where consent = true;
