create extension if not exists "citext" with schema "public" version '1.6';

create extension if not exists "pg_trgm" with schema "public" version '1.6';

create extension if not exists "unaccent" with schema "public" version '1.1';

create sequence "public"."logs_audit_id_seq";

create table "public"."abonnes_newsletter" (
    "id" bigint generated always as identity not null,
    "email" citext not null,
    "subscribed" boolean default true,
    "subscribed_at" timestamp with time zone default now(),
    "unsubscribed_at" timestamp with time zone,
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."abonnes_newsletter" enable row level security;

create table "public"."analytics_events" (
    "id" bigint generated always as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "event_type" text not null,
    "entity_type" text,
    "entity_id" bigint,
    "user_id" uuid,
    "session_id" text,
    "pathname" text,
    "search_query" text,
    "metadata" jsonb default '{}'::jsonb,
    "ip_address" text,
    "user_agent" text
);


alter table "public"."analytics_events" enable row level security;

create table "public"."articles_categories" (
    "article_id" bigint not null,
    "category_id" bigint not null
);


alter table "public"."articles_categories" enable row level security;

create table "public"."articles_medias" (
    "article_id" bigint not null,
    "media_id" bigint not null,
    "ordre" smallint default 0
);


alter table "public"."articles_medias" enable row level security;

create table "public"."articles_presse" (
    "id" bigint generated always as identity not null,
    "title" text not null,
    "author" text,
    "type" text,
    "slug" text,
    "chapo" text,
    "excerpt" text,
    "source_publication" text,
    "source_url" text,
    "published_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "search_vector" tsvector,
    "meta_title" text,
    "meta_description" text,
    "og_image_media_id" bigint,
    "schema_type" text default 'Article'::text,
    "canonical_url" text,
    "keywords" text[]
);


create table "public"."articles_tags" (
    "article_id" bigint not null,
    "tag_id" bigint not null
);


alter table "public"."articles_tags" enable row level security;

create table "public"."categories" (
    "id" bigint generated always as identity not null,
    "name" text not null,
    "slug" text not null,
    "description" text,
    "parent_id" bigint,
    "color" text,
    "icon" text,
    "display_order" integer not null default 0,
    "is_active" boolean not null default true,
    "created_at" timestamp with time zone not null default now(),
    "created_by" uuid,
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."categories" enable row level security;

create table "public"."communiques_categories" (
    "communique_id" bigint not null,
    "category_id" bigint not null
);


alter table "public"."communiques_categories" enable row level security;

create table "public"."communiques_medias" (
    "communique_id" bigint not null,
    "media_id" bigint not null,
    "ordre" smallint default 0
);


alter table "public"."communiques_medias" enable row level security;

create table "public"."communiques_presse" (
    "id" bigint generated always as identity not null,
    "title" text not null,
    "slug" text,
    "description" text,
    "date_publication" date not null,
    "image_url" text,
    "spectacle_id" bigint,
    "evenement_id" bigint,
    "ordre_affichage" integer default 0,
    "public" boolean default true,
    "file_size_bytes" bigint,
    "created_by" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."communiques_presse" enable row level security;

create table "public"."communiques_tags" (
    "communique_id" bigint not null,
    "tag_id" bigint not null
);


alter table "public"."communiques_tags" enable row level security;

create table "public"."compagnie_presentation_sections" (
    "id" bigint generated always as identity not null,
    "slug" text not null,
    "kind" text not null,
    "title" text,
    "subtitle" text,
    "content" text[],
    "quote_text" text,
    "quote_author" text,
    "image_url" text,
    "image_media_id" bigint,
    "position" smallint not null default 0,
    "active" boolean not null default true,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."compagnie_presentation_sections" enable row level security;

create table "public"."compagnie_stats" (
    "id" bigint generated always as identity not null,
    "key" text not null,
    "label" text not null,
    "value" text not null,
    "position" smallint not null default 0,
    "active" boolean not null default true,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."compagnie_stats" enable row level security;

create table "public"."compagnie_values" (
    "id" bigint generated always as identity not null,
    "key" text not null,
    "title" text not null,
    "description" text not null,
    "position" smallint not null default 0,
    "active" boolean not null default true,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."compagnie_values" enable row level security;

create table "public"."configurations_site" (
    "key" text not null,
    "value" jsonb not null,
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."configurations_site" enable row level security;

create table "public"."contacts_presse" (
    "id" bigint generated always as identity not null,
    "nom" text not null,
    "prenom" text,
    "fonction" text,
    "media" text not null,
    "email" text not null,
    "telephone" text,
    "adresse" text,
    "ville" text,
    "specialites" text[],
    "notes" text,
    "actif" boolean default true,
    "derniere_interaction" timestamp with time zone,
    "created_by" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."contacts_presse" enable row level security;

create table "public"."content_versions" (
    "id" bigint generated always as identity not null,
    "entity_type" text not null,
    "entity_id" bigint not null,
    "version_number" integer not null,
    "content_snapshot" jsonb not null,
    "change_summary" text,
    "change_type" text not null,
    "created_at" timestamp with time zone not null default now(),
    "created_by" uuid
);


alter table "public"."content_versions" enable row level security;

create table "public"."evenements" (
    "id" bigint generated always as identity not null,
    "spectacle_id" bigint not null,
    "lieu_id" bigint,
    "date_debut" timestamp with time zone not null,
    "date_fin" timestamp with time zone,
    "capacity" integer,
    "price_cents" integer,
    "status" text default 'planifie'::text,
    "metadata" jsonb default '{}'::jsonb,
    "recurrence_rule" text,
    "recurrence_end_date" timestamp with time zone,
    "parent_event_id" bigint,
    "ticket_url" text,
    "image_url" text,
    "start_time" time without time zone,
    "end_time" time without time zone,
    "type_array" text[] default '{}'::text[],
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."evenements" enable row level security;

create table "public"."home_hero_slides" (
    "id" bigint generated always as identity not null,
    "slug" text not null,
    "title" text not null,
    "subtitle" text,
    "description" text,
    "image_url" text,
    "image_media_id" bigint,
    "cta_label" text,
    "cta_url" text,
    "position" smallint not null default 0,
    "active" boolean not null default true,
    "starts_at" timestamp with time zone,
    "ends_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."home_hero_slides" enable row level security;

create table "public"."lieux" (
    "id" bigint generated always as identity not null,
    "nom" text not null,
    "adresse" text,
    "ville" text,
    "code_postal" text,
    "pays" text default 'France'::text,
    "latitude" double precision,
    "longitude" double precision,
    "capacite" integer,
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."lieux" enable row level security;

create table "public"."logs_audit" (
    "id" bigint not null default nextval('logs_audit_id_seq'::regclass),
    "user_id" uuid,
    "action" text not null,
    "table_name" text not null,
    "record_id" text,
    "old_values" jsonb,
    "new_values" jsonb,
    "ip_address" inet,
    "user_agent" text,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."logs_audit" enable row level security;

create table "public"."medias" (
    "id" bigint generated always as identity not null,
    "storage_path" text not null,
    "filename" text,
    "mime" text,
    "size_bytes" bigint,
    "alt_text" text,
    "metadata" jsonb default '{}'::jsonb,
    "uploaded_by" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."medias" enable row level security;

create table "public"."membres_equipe" (
    "id" bigint generated always as identity not null,
    "name" text not null,
    "role" text,
    "description" text,
    "image_url" text,
    "photo_media_id" bigint,
    "ordre" smallint default 0,
    "active" boolean default true,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."membres_equipe" enable row level security;

create table "public"."messages_contact" (
    "id" bigint generated always as identity not null,
    "firstname" text,
    "lastname" text,
    "email" text not null,
    "phone" text,
    "reason" text not null,
    "message" text not null,
    "consent" boolean default false,
    "consent_at" timestamp with time zone,
    "status" text not null default 'nouveau'::text,
    "processed" boolean generated always as ((status = ANY (ARRAY['traite'::text, 'archive'::text]))) stored,
    "processed_at" timestamp with time zone,
    "spam_score" numeric(5,2),
    "metadata" jsonb default '{}'::jsonb,
    "contact_presse_id" bigint,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."messages_contact" enable row level security;

create table "public"."partners" (
    "id" bigint generated always as identity not null,
    "name" text not null,
    "description" text,
    "website_url" text,
    "logo_url" text,
    "logo_media_id" bigint,
    "is_active" boolean not null default true,
    "display_order" integer not null default 0,
    "created_by" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."partners" enable row level security;

create table "public"."profiles" (
    "id" bigint generated always as identity not null,
    "user_id" uuid,
    "display_name" text,
    "slug" text,
    "bio" text,
    "avatar_media_id" bigint,
    "role" text default 'user'::text,
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."profiles" enable row level security;

create table "public"."seo_redirects" (
    "id" bigint generated always as identity not null,
    "old_path" text not null,
    "new_path" text not null,
    "redirect_type" integer not null default 301,
    "is_active" boolean not null default true,
    "hit_count" integer not null default 0,
    "last_hit_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "created_by" uuid,
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."seo_redirects" enable row level security;

create table "public"."sitemap_entries" (
    "id" bigint generated always as identity not null,
    "url" text not null,
    "entity_type" text,
    "entity_id" bigint,
    "last_modified" timestamp with time zone not null default now(),
    "change_frequency" text,
    "priority" numeric(3,2),
    "is_indexed" boolean not null default true,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."sitemap_entries" enable row level security;

create table "public"."spectacles" (
    "id" bigint generated always as identity not null,
    "title" text not null,
    "slug" text,
    "status" text,
    "description" text,
    "short_description" text,
    "genre" text,
    "duration_minutes" integer,
    "casting" integer,
    "premiere" timestamp with time zone,
    "image_url" text,
    "public" boolean default true,
  "awards" text[],
    "created_by" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "search_vector" tsvector,
    "meta_title" text,
    "meta_description" text,
    "og_image_media_id" bigint,
    "schema_type" text default 'TheaterEvent'::text,
    "canonical_url" text
);


alter table "public"."spectacles" enable row level security;

create table "public"."spectacles_categories" (
    "spectacle_id" bigint not null,
    "category_id" bigint not null
);


alter table "public"."spectacles_categories" enable row level security;

create table "public"."spectacles_medias" (
    "spectacle_id" bigint not null,
    "media_id" bigint not null,
    "ordre" smallint default 0
);


alter table "public"."spectacles_medias" enable row level security;

create table "public"."spectacles_membres_equipe" (
    "spectacle_id" bigint not null,
    "membre_id" bigint not null,
    "role" text
);


alter table "public"."spectacles_membres_equipe" enable row level security;

create table "public"."spectacles_tags" (
    "spectacle_id" bigint not null,
    "tag_id" bigint not null
);


alter table "public"."spectacles_tags" enable row level security;

create table "public"."tags" (
    "id" bigint generated always as identity not null,
    "name" text not null,
    "slug" text not null,
    "description" text,
    "usage_count" integer not null default 0,
    "is_featured" boolean not null default false,
    "created_at" timestamp with time zone not null default now(),
    "created_by" uuid,
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."tags" enable row level security;

alter sequence "public"."logs_audit_id_seq" owned by "public"."logs_audit"."id";

CREATE UNIQUE INDEX abonnes_email_unique ON public.abonnes_newsletter USING btree (email);

CREATE UNIQUE INDEX abonnes_newsletter_pkey ON public.abonnes_newsletter USING btree (id);

CREATE UNIQUE INDEX analytics_events_pkey ON public.analytics_events USING btree (id);

CREATE UNIQUE INDEX articles_categories_pkey ON public.articles_categories USING btree (article_id, category_id);

CREATE UNIQUE INDEX articles_medias_pkey ON public.articles_medias USING btree (article_id, media_id);

CREATE UNIQUE INDEX articles_presse_pkey ON public.articles_presse USING btree (id);

CREATE UNIQUE INDEX articles_tags_pkey ON public.articles_tags USING btree (article_id, tag_id);

CREATE UNIQUE INDEX categories_pkey ON public.categories USING btree (id);

CREATE UNIQUE INDEX communiques_categories_pkey ON public.communiques_categories USING btree (communique_id, category_id);

CREATE UNIQUE INDEX communiques_medias_pkey ON public.communiques_medias USING btree (communique_id, media_id);

CREATE UNIQUE INDEX communiques_presse_pkey ON public.communiques_presse USING btree (id);

CREATE UNIQUE INDEX communiques_slug_unique ON public.communiques_presse USING btree (slug);

CREATE UNIQUE INDEX communiques_tags_pkey ON public.communiques_tags USING btree (communique_id, tag_id);

CREATE UNIQUE INDEX compagnie_presentation_sections_pkey ON public.compagnie_presentation_sections USING btree (id);

CREATE UNIQUE INDEX compagnie_presentation_sections_slug_key ON public.compagnie_presentation_sections USING btree (slug);

CREATE UNIQUE INDEX compagnie_stats_key_key ON public.compagnie_stats USING btree (key);

CREATE UNIQUE INDEX compagnie_stats_pkey ON public.compagnie_stats USING btree (id);

CREATE UNIQUE INDEX compagnie_values_key_key ON public.compagnie_values USING btree (key);

CREATE UNIQUE INDEX compagnie_values_pkey ON public.compagnie_values USING btree (id);

CREATE UNIQUE INDEX configurations_site_pkey ON public.configurations_site USING btree (key);

CREATE UNIQUE INDEX contacts_presse_email_unique ON public.contacts_presse USING btree (email);

CREATE UNIQUE INDEX contacts_presse_pkey ON public.contacts_presse USING btree (id);

CREATE UNIQUE INDEX content_versions_entity_version_unique ON public.content_versions USING btree (entity_type, entity_id, version_number);

CREATE UNIQUE INDEX content_versions_pkey ON public.content_versions USING btree (id);

CREATE UNIQUE INDEX evenements_pkey ON public.evenements USING btree (id);

CREATE UNIQUE INDEX home_hero_slides_pkey ON public.home_hero_slides USING btree (id);

CREATE UNIQUE INDEX home_hero_slides_slug_key ON public.home_hero_slides USING btree (slug);

CREATE INDEX idx_analytics_events_created_at ON public.analytics_events USING btree (created_at);

CREATE INDEX idx_analytics_events_entity ON public.analytics_events USING btree (entity_type, entity_id);

CREATE INDEX idx_analytics_events_type ON public.analytics_events USING btree (event_type, created_at);

CREATE INDEX idx_analytics_events_user_session ON public.analytics_events USING btree (user_id, session_id);

CREATE INDEX idx_analytics_search_query_trgm ON public.analytics_events USING gin (search_query gin_trgm_ops);

CREATE INDEX idx_articles_published_at ON public.articles_presse USING btree (published_at);

CREATE INDEX idx_articles_title_trgm ON public.articles_presse USING gin (title gin_trgm_ops);

CREATE INDEX idx_categories_display_order ON public.categories USING btree (display_order);

CREATE INDEX idx_categories_is_active ON public.categories USING btree (is_active) WHERE (is_active = true);

CREATE INDEX idx_categories_parent_id ON public.categories USING btree (parent_id);

CREATE INDEX idx_categories_slug ON public.categories USING btree (slug);

CREATE INDEX idx_communiques_medias_ordre ON public.communiques_medias USING btree (communique_id, ordre);

CREATE INDEX idx_communiques_presse_created_by ON public.communiques_presse USING btree (created_by);

CREATE INDEX idx_communiques_presse_date_publication ON public.communiques_presse USING btree (date_publication DESC);

CREATE INDEX idx_communiques_presse_ordre ON public.communiques_presse USING btree (ordre_affichage, date_publication DESC);

CREATE INDEX idx_communiques_presse_public ON public.communiques_presse USING btree (public) WHERE (public = true);

CREATE INDEX idx_communiques_presse_search ON public.communiques_presse USING gin (to_tsvector('french'::regconfig, ((COALESCE(title, ''::text) || ' '::text) || COALESCE(description, ''::text))));

CREATE INDEX idx_communiques_presse_spectacle_id ON public.communiques_presse USING btree (spectacle_id);

CREATE INDEX idx_compagnie_presentation_sections_active_order ON public.compagnie_presentation_sections USING btree (active, "position") WHERE (active = true);

CREATE INDEX idx_compagnie_presentation_sections_kind ON public.compagnie_presentation_sections USING btree (kind);

CREATE INDEX idx_compagnie_stats_active_order ON public.compagnie_stats USING btree (active, "position") WHERE (active = true);

CREATE INDEX idx_compagnie_values_active_order ON public.compagnie_values USING btree (active, "position") WHERE (active = true);

CREATE INDEX idx_configurations_site_key_pattern ON public.configurations_site USING btree (key) WHERE (key ~~ 'public:%'::text);

CREATE INDEX idx_contacts_presse_actif ON public.contacts_presse USING btree (actif) WHERE (actif = true);

CREATE INDEX idx_contacts_presse_media ON public.contacts_presse USING btree (media);

CREATE INDEX idx_contacts_presse_specialites ON public.contacts_presse USING gin (specialites);

CREATE INDEX idx_content_versions_created_at ON public.content_versions USING btree (created_at DESC);

CREATE INDEX idx_content_versions_created_by ON public.content_versions USING btree (created_by);

CREATE INDEX idx_content_versions_entity ON public.content_versions USING btree (entity_type, entity_id);

CREATE INDEX idx_content_versions_type ON public.content_versions USING btree (change_type);

CREATE INDEX idx_evenements_date_debut ON public.evenements USING btree (date_debut);

CREATE INDEX idx_evenements_date_time ON public.evenements USING btree (date_debut, start_time) WHERE (start_time IS NOT NULL);

CREATE INDEX idx_evenements_parent_event_id ON public.evenements USING btree (parent_event_id);

CREATE INDEX idx_evenements_recurrence_end_date ON public.evenements USING btree (recurrence_end_date);

CREATE INDEX idx_evenements_spectacle_date ON public.evenements USING btree (spectacle_id, date_debut);

CREATE INDEX idx_evenements_start_time ON public.evenements USING btree (start_time);

CREATE INDEX idx_evenements_type_array ON public.evenements USING gin (type_array);

CREATE INDEX idx_home_hero_slides_active_order ON public.home_hero_slides USING btree (active, "position") WHERE (active = true);

CREATE INDEX idx_home_hero_slides_schedule ON public.home_hero_slides USING btree (starts_at, ends_at) WHERE (active = true);

CREATE INDEX idx_medias_storage_path ON public.medias USING btree (storage_path);

CREATE INDEX idx_medias_uploaded_by ON public.medias USING btree (uploaded_by);

CREATE INDEX idx_messages_contact_consent_true ON public.messages_contact USING btree (id) WHERE (consent = true);

CREATE INDEX idx_messages_contact_contact_presse ON public.messages_contact USING btree (contact_presse_id) WHERE (contact_presse_id IS NOT NULL);

CREATE INDEX idx_messages_contact_created_at ON public.messages_contact USING btree (created_at DESC);

CREATE INDEX idx_messages_contact_reason ON public.messages_contact USING btree (reason);

CREATE INDEX idx_messages_contact_status ON public.messages_contact USING btree (status);

CREATE INDEX idx_messages_contact_status_actifs ON public.messages_contact USING btree (status) WHERE (status = ANY (ARRAY['nouveau'::text, 'en_cours'::text]));

CREATE INDEX idx_partners_active_order ON public.partners USING btree (is_active, display_order) WHERE (is_active = true);

CREATE INDEX idx_partners_created_by ON public.partners USING btree (created_by);

CREATE INDEX idx_partners_is_active ON public.partners USING btree (is_active) WHERE (is_active = true);

CREATE INDEX idx_profiles_role ON public.profiles USING btree (role);

CREATE INDEX idx_profiles_user_id ON public.profiles USING btree (user_id);

CREATE INDEX idx_seo_redirects_active ON public.seo_redirects USING btree (is_active) WHERE (is_active = true);

CREATE INDEX idx_seo_redirects_old_path ON public.seo_redirects USING btree (old_path);

CREATE INDEX idx_sitemap_entries_indexed ON public.sitemap_entries USING btree (is_indexed) WHERE (is_indexed = true);

CREATE INDEX idx_sitemap_entries_last_modified ON public.sitemap_entries USING btree (last_modified DESC);

CREATE INDEX idx_spectacles_created_by ON public.spectacles USING btree (created_by);

CREATE INDEX idx_spectacles_public ON public.spectacles USING btree (public) WHERE (public = true);

CREATE INDEX idx_spectacles_title ON public.spectacles USING btree (title);

CREATE INDEX idx_spectacles_title_trgm ON public.spectacles USING gin (title gin_trgm_ops);

CREATE INDEX idx_tags_is_featured ON public.tags USING btree (is_featured);

CREATE INDEX idx_tags_slug ON public.tags USING btree (slug);

CREATE INDEX idx_tags_usage_count ON public.tags USING btree (usage_count DESC);

CREATE UNIQUE INDEX lieux_pkey ON public.lieux USING btree (id);

CREATE UNIQUE INDEX logs_audit_pkey ON public.logs_audit USING btree (id);

CREATE UNIQUE INDEX medias_pkey ON public.medias USING btree (id);

CREATE UNIQUE INDEX membres_equipe_pkey ON public.membres_equipe USING btree (id);

CREATE UNIQUE INDEX messages_contact_pkey ON public.messages_contact USING btree (id);

CREATE UNIQUE INDEX partners_pkey ON public.partners USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX profiles_userid_unique ON public.profiles USING btree (user_id);

CREATE UNIQUE INDEX seo_redirects_pkey ON public.seo_redirects USING btree (id);

CREATE UNIQUE INDEX sitemap_entries_pkey ON public.sitemap_entries USING btree (id);

CREATE UNIQUE INDEX spectacles_categories_pkey ON public.spectacles_categories USING btree (spectacle_id, category_id);

CREATE UNIQUE INDEX spectacles_medias_pkey ON public.spectacles_medias USING btree (spectacle_id, media_id);

CREATE UNIQUE INDEX spectacles_membres_equipe_pkey ON public.spectacles_membres_equipe USING btree (spectacle_id, membre_id);

CREATE UNIQUE INDEX spectacles_pkey ON public.spectacles USING btree (id);

CREATE UNIQUE INDEX spectacles_tags_pkey ON public.spectacles_tags USING btree (spectacle_id, tag_id);

CREATE UNIQUE INDEX tags_pkey ON public.tags USING btree (id);

alter table "public"."abonnes_newsletter" add constraint "abonnes_newsletter_pkey" PRIMARY KEY using index "abonnes_newsletter_pkey";

alter table "public"."analytics_events" add constraint "analytics_events_pkey" PRIMARY KEY using index "analytics_events_pkey";

alter table "public"."articles_categories" add constraint "articles_categories_pkey" PRIMARY KEY using index "articles_categories_pkey";

alter table "public"."articles_medias" add constraint "articles_medias_pkey" PRIMARY KEY using index "articles_medias_pkey";

alter table "public"."articles_presse" add constraint "articles_presse_pkey" PRIMARY KEY using index "articles_presse_pkey";

alter table "public"."articles_tags" add constraint "articles_tags_pkey" PRIMARY KEY using index "articles_tags_pkey";

alter table "public"."categories" add constraint "categories_pkey" PRIMARY KEY using index "categories_pkey";

alter table "public"."communiques_categories" add constraint "communiques_categories_pkey" PRIMARY KEY using index "communiques_categories_pkey";

alter table "public"."communiques_medias" add constraint "communiques_medias_pkey" PRIMARY KEY using index "communiques_medias_pkey";

alter table "public"."communiques_presse" add constraint "communiques_presse_pkey" PRIMARY KEY using index "communiques_presse_pkey";

alter table "public"."communiques_tags" add constraint "communiques_tags_pkey" PRIMARY KEY using index "communiques_tags_pkey";

alter table "public"."compagnie_presentation_sections" add constraint "compagnie_presentation_sections_pkey" PRIMARY KEY using index "compagnie_presentation_sections_pkey";

alter table "public"."compagnie_stats" add constraint "compagnie_stats_pkey" PRIMARY KEY using index "compagnie_stats_pkey";

alter table "public"."compagnie_values" add constraint "compagnie_values_pkey" PRIMARY KEY using index "compagnie_values_pkey";

alter table "public"."configurations_site" add constraint "configurations_site_pkey" PRIMARY KEY using index "configurations_site_pkey";

alter table "public"."contacts_presse" add constraint "contacts_presse_pkey" PRIMARY KEY using index "contacts_presse_pkey";

alter table "public"."content_versions" add constraint "content_versions_pkey" PRIMARY KEY using index "content_versions_pkey";

alter table "public"."evenements" add constraint "evenements_pkey" PRIMARY KEY using index "evenements_pkey";

alter table "public"."home_hero_slides" add constraint "home_hero_slides_pkey" PRIMARY KEY using index "home_hero_slides_pkey";

alter table "public"."lieux" add constraint "lieux_pkey" PRIMARY KEY using index "lieux_pkey";

alter table "public"."logs_audit" add constraint "logs_audit_pkey" PRIMARY KEY using index "logs_audit_pkey";

alter table "public"."medias" add constraint "medias_pkey" PRIMARY KEY using index "medias_pkey";

alter table "public"."membres_equipe" add constraint "membres_equipe_pkey" PRIMARY KEY using index "membres_equipe_pkey";

alter table "public"."messages_contact" add constraint "messages_contact_pkey" PRIMARY KEY using index "messages_contact_pkey";

alter table "public"."partners" add constraint "partners_pkey" PRIMARY KEY using index "partners_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."seo_redirects" add constraint "seo_redirects_pkey" PRIMARY KEY using index "seo_redirects_pkey";

alter table "public"."sitemap_entries" add constraint "sitemap_entries_pkey" PRIMARY KEY using index "sitemap_entries_pkey";

alter table "public"."spectacles" add constraint "spectacles_pkey" PRIMARY KEY using index "spectacles_pkey";

alter table "public"."spectacles_categories" add constraint "spectacles_categories_pkey" PRIMARY KEY using index "spectacles_categories_pkey";

alter table "public"."spectacles_medias" add constraint "spectacles_medias_pkey" PRIMARY KEY using index "spectacles_medias_pkey";

alter table "public"."spectacles_membres_equipe" add constraint "spectacles_membres_equipe_pkey" PRIMARY KEY using index "spectacles_membres_equipe_pkey";

alter table "public"."spectacles_tags" add constraint "spectacles_tags_pkey" PRIMARY KEY using index "spectacles_tags_pkey";

alter table "public"."tags" add constraint "tags_pkey" PRIMARY KEY using index "tags_pkey";

alter table "public"."abonnes_newsletter" add constraint "abonnes_email_unique" UNIQUE using index "abonnes_email_unique";

alter table "public"."analytics_events" add constraint "analytics_events_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."analytics_events" validate constraint "analytics_events_user_id_fkey";

alter table "public"."articles_categories" add constraint "articles_categories_article_id_fkey" FOREIGN KEY (article_id) REFERENCES articles_presse(id) ON DELETE CASCADE not valid;

alter table "public"."articles_categories" validate constraint "articles_categories_article_id_fkey";

alter table "public"."articles_categories" add constraint "articles_categories_category_id_fkey" FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE not valid;

alter table "public"."articles_categories" validate constraint "articles_categories_category_id_fkey";

alter table "public"."articles_medias" add constraint "articles_medias_article_id_fkey" FOREIGN KEY (article_id) REFERENCES articles_presse(id) ON DELETE CASCADE not valid;

alter table "public"."articles_medias" validate constraint "articles_medias_article_id_fkey";

alter table "public"."articles_medias" add constraint "articles_medias_media_id_fkey" FOREIGN KEY (media_id) REFERENCES medias(id) ON DELETE CASCADE not valid;

alter table "public"."articles_medias" validate constraint "articles_medias_media_id_fkey";

alter table "public"."articles_presse" add constraint "articles_presse_og_image_media_id_fkey" FOREIGN KEY (og_image_media_id) REFERENCES medias(id) ON DELETE SET NULL not valid;

alter table "public"."articles_presse" validate constraint "articles_presse_og_image_media_id_fkey";

alter table "public"."articles_tags" add constraint "articles_tags_article_id_fkey" FOREIGN KEY (article_id) REFERENCES articles_presse(id) ON DELETE CASCADE not valid;

alter table "public"."articles_tags" validate constraint "articles_tags_article_id_fkey";

alter table "public"."articles_tags" add constraint "articles_tags_tag_id_fkey" FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE not valid;

alter table "public"."articles_tags" validate constraint "articles_tags_tag_id_fkey";

alter table "public"."categories" add constraint "categories_color_check" CHECK ((color ~ '^#[0-9A-Fa-f]{6}$'::text)) not valid;

alter table "public"."categories" validate constraint "categories_color_check";

alter table "public"."categories" add constraint "categories_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."categories" validate constraint "categories_created_by_fkey";

alter table "public"."categories" add constraint "categories_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE RESTRICT not valid;

alter table "public"."categories" validate constraint "categories_parent_id_fkey";

alter table "public"."communiques_categories" add constraint "communiques_categories_category_id_fkey" FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE not valid;

alter table "public"."communiques_categories" validate constraint "communiques_categories_category_id_fkey";

alter table "public"."communiques_categories" add constraint "communiques_categories_communique_id_fkey" FOREIGN KEY (communique_id) REFERENCES communiques_presse(id) ON DELETE CASCADE not valid;

alter table "public"."communiques_categories" validate constraint "communiques_categories_communique_id_fkey";

alter table "public"."communiques_medias" add constraint "check_pdf_order_constraint" CHECK (((ordre = '-1'::integer) OR (ordre >= 0))) not valid;

alter table "public"."communiques_medias" validate constraint "check_pdf_order_constraint";

alter table "public"."communiques_medias" add constraint "communiques_medias_communique_id_fkey" FOREIGN KEY (communique_id) REFERENCES communiques_presse(id) ON DELETE CASCADE not valid;

alter table "public"."communiques_medias" validate constraint "communiques_medias_communique_id_fkey";

alter table "public"."communiques_medias" add constraint "communiques_medias_media_id_fkey" FOREIGN KEY (media_id) REFERENCES medias(id) ON DELETE CASCADE not valid;

alter table "public"."communiques_medias" validate constraint "communiques_medias_media_id_fkey";

alter table "public"."communiques_presse" add constraint "communiques_presse_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."communiques_presse" validate constraint "communiques_presse_created_by_fkey";

alter table "public"."communiques_presse" add constraint "communiques_presse_evenement_id_fkey" FOREIGN KEY (evenement_id) REFERENCES evenements(id) ON DELETE SET NULL not valid;

alter table "public"."communiques_presse" validate constraint "communiques_presse_evenement_id_fkey";

alter table "public"."communiques_presse" add constraint "communiques_presse_spectacle_id_fkey" FOREIGN KEY (spectacle_id) REFERENCES spectacles(id) ON DELETE SET NULL not valid;

alter table "public"."communiques_presse" validate constraint "communiques_presse_spectacle_id_fkey";

alter table "public"."communiques_presse" add constraint "communiques_slug_unique" UNIQUE using index "communiques_slug_unique";

alter table "public"."communiques_tags" add constraint "communiques_tags_communique_id_fkey" FOREIGN KEY (communique_id) REFERENCES communiques_presse(id) ON DELETE CASCADE not valid;

alter table "public"."communiques_tags" validate constraint "communiques_tags_communique_id_fkey";

alter table "public"."communiques_tags" add constraint "communiques_tags_tag_id_fkey" FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE not valid;

alter table "public"."communiques_tags" validate constraint "communiques_tags_tag_id_fkey";

alter table "public"."compagnie_presentation_sections" add constraint "compagnie_presentation_sections_image_media_id_fkey" FOREIGN KEY (image_media_id) REFERENCES medias(id) ON DELETE SET NULL not valid;

alter table "public"."compagnie_presentation_sections" validate constraint "compagnie_presentation_sections_image_media_id_fkey";

alter table "public"."compagnie_presentation_sections" add constraint "compagnie_presentation_sections_kind_check" CHECK ((kind = ANY (ARRAY['hero'::text, 'history'::text, 'quote'::text, 'values'::text, 'team'::text, 'mission'::text, 'custom'::text]))) not valid;

alter table "public"."compagnie_presentation_sections" validate constraint "compagnie_presentation_sections_kind_check";

alter table "public"."compagnie_presentation_sections" add constraint "compagnie_presentation_sections_slug_key" UNIQUE using index "compagnie_presentation_sections_slug_key";

alter table "public"."compagnie_stats" add constraint "compagnie_stats_key_key" UNIQUE using index "compagnie_stats_key_key";

alter table "public"."compagnie_values" add constraint "compagnie_values_key_key" UNIQUE using index "compagnie_values_key_key";

alter table "public"."contacts_presse" add constraint "contacts_presse_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."contacts_presse" validate constraint "contacts_presse_created_by_fkey";

alter table "public"."contacts_presse" add constraint "contacts_presse_email_unique" UNIQUE using index "contacts_presse_email_unique";

alter table "public"."content_versions" add constraint "content_versions_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."content_versions" validate constraint "content_versions_created_by_fkey";

alter table "public"."content_versions" add constraint "content_versions_entity_version_unique" UNIQUE using index "content_versions_entity_version_unique";

alter table "public"."evenements" add constraint "check_image_url_format" CHECK (((image_url IS NULL) OR (image_url ~* '^https?://.*$'::text))) not valid;

alter table "public"."evenements" validate constraint "check_image_url_format";

alter table "public"."evenements" add constraint "check_no_self_parent" CHECK (((parent_event_id <> id) OR (parent_event_id IS NULL))) not valid;

alter table "public"."evenements" validate constraint "check_no_self_parent";

alter table "public"."evenements" add constraint "check_start_end_time_order" CHECK (((start_time IS NULL) OR (end_time IS NULL) OR (start_time <= end_time))) not valid;

alter table "public"."evenements" validate constraint "check_start_end_time_order";

alter table "public"."evenements" add constraint "check_ticket_url_format" CHECK (((ticket_url IS NULL) OR (ticket_url ~* '^https?://.*$'::text))) not valid;

alter table "public"."evenements" validate constraint "check_ticket_url_format";

alter table "public"."evenements" add constraint "check_valid_event_types" CHECK (((type_array IS NULL) OR (type_array <@ ARRAY['spectacle'::text, 'première'::text, 'premiere'::text, 'atelier'::text, 'workshop'::text, 'rencontre'::text, 'conference'::text, 'masterclass'::text, 'répétition'::text, 'repetition'::text, 'audition'::text, 'casting'::text, 'formation'::text, 'residency'::text, 'résidence'::text]))) not valid;

alter table "public"."evenements" validate constraint "check_valid_event_types";

-- Ensure validate_rrule() exists before using in constraint
CREATE OR REPLACE FUNCTION public.validate_rrule(rule text)
 RETURNS boolean
 LANGUAGE plpgsql
 IMMUTABLE
 SECURITY INVOKER
 SET search_path TO ''
AS $function$
begin
  if rule is null then
    return true;
  end if;
  if position('RRULE:' in upper(rule)) != 1 then
    return false;
  end if;
  if position('FREQ=' in upper(rule)) = 0 then
    return false;
  end if;
  return true;
end;
$function$;

alter table "public"."evenements" add constraint "check_valid_rrule" CHECK (((recurrence_rule IS NULL) OR validate_rrule(recurrence_rule))) not valid;

alter table "public"."evenements" validate constraint "check_valid_rrule";

alter table "public"."evenements" add constraint "evenements_lieu_id_fkey" FOREIGN KEY (lieu_id) REFERENCES lieux(id) ON DELETE SET NULL not valid;

alter table "public"."evenements" validate constraint "evenements_lieu_id_fkey";

alter table "public"."evenements" add constraint "evenements_parent_event_id_fkey" FOREIGN KEY (parent_event_id) REFERENCES evenements(id) ON DELETE CASCADE not valid;

alter table "public"."evenements" validate constraint "evenements_parent_event_id_fkey";

alter table "public"."evenements" add constraint "evenements_spectacle_id_fkey" FOREIGN KEY (spectacle_id) REFERENCES spectacles(id) ON DELETE CASCADE not valid;

alter table "public"."evenements" validate constraint "evenements_spectacle_id_fkey";

alter table "public"."evenements" add constraint "evenements_status_check" CHECK ((status = ANY (ARRAY['planifie'::text, 'confirme'::text, 'complet'::text, 'annule'::text, 'reporte'::text, 'scheduled'::text, 'confirmed'::text, 'sold_out'::text, 'cancelled'::text, 'postponed'::text]))) not valid;

alter table "public"."evenements" validate constraint "evenements_status_check";

alter table "public"."home_hero_slides" add constraint "home_hero_slides_image_media_id_fkey" FOREIGN KEY (image_media_id) REFERENCES medias(id) ON DELETE SET NULL not valid;

alter table "public"."home_hero_slides" validate constraint "home_hero_slides_image_media_id_fkey";

alter table "public"."home_hero_slides" add constraint "home_hero_slides_slug_key" UNIQUE using index "home_hero_slides_slug_key";

alter table "public"."membres_equipe" add constraint "membres_equipe_image_url_format" CHECK (((image_url IS NULL) OR (image_url ~* '^https?://[A-Za-z0-9._~:/?#%\-@!$&''()*+,;=]+\.(jpg|jpeg|png|webp|gif|avif|svg)(\?.*)?(#.*)?$'::text))) not valid;

alter table "public"."membres_equipe" validate constraint "membres_equipe_image_url_format";

alter table "public"."membres_equipe" add constraint "membres_equipe_photo_media_id_fkey" FOREIGN KEY (photo_media_id) REFERENCES medias(id) ON DELETE SET NULL not valid;

alter table "public"."membres_equipe" validate constraint "membres_equipe_photo_media_id_fkey";

alter table "public"."messages_contact" add constraint "messages_contact_contact_presse_id_fkey" FOREIGN KEY (contact_presse_id) REFERENCES contacts_presse(id) ON DELETE SET NULL not valid;

alter table "public"."messages_contact" validate constraint "messages_contact_contact_presse_id_fkey";

alter table "public"."messages_contact" add constraint "messages_contact_reason_check" CHECK ((reason = ANY (ARRAY['booking'::text, 'partenariat'::text, 'presse'::text, 'education'::text, 'technique'::text, 'autre'::text]))) not valid;

alter table "public"."messages_contact" validate constraint "messages_contact_reason_check";

alter table "public"."messages_contact" add constraint "messages_contact_status_check" CHECK ((status = ANY (ARRAY['nouveau'::text, 'en_cours'::text, 'traite'::text, 'archive'::text, 'spam'::text]))) not valid;

alter table "public"."messages_contact" validate constraint "messages_contact_status_check";

alter table "public"."partners" add constraint "check_display_order_positive" CHECK ((display_order >= 0)) not valid;

alter table "public"."partners" validate constraint "check_display_order_positive";

alter table "public"."partners" add constraint "check_website_url_format" CHECK (((website_url IS NULL) OR (website_url ~* '^https?://.*$'::text))) not valid;

alter table "public"."partners" validate constraint "check_website_url_format";

alter table "public"."partners" add constraint "partners_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."partners" validate constraint "partners_created_by_fkey";

alter table "public"."partners" add constraint "partners_logo_media_id_fkey" FOREIGN KEY (logo_media_id) REFERENCES medias(id) ON DELETE SET NULL not valid;

alter table "public"."partners" validate constraint "partners_logo_media_id_fkey";

alter table "public"."partners" add constraint "partners_logo_url_format" CHECK (((logo_url IS NULL) OR (logo_url ~* '^https?://[A-Za-z0-9._~:/?#%\-@!$&''()*+,;=]+'::text))) not valid;

alter table "public"."partners" validate constraint "partners_logo_url_format";

alter table "public"."profiles" add constraint "profiles_role_check" CHECK ((role = ANY (ARRAY['user'::text, 'editor'::text, 'admin'::text]))) not valid;

alter table "public"."profiles" validate constraint "profiles_role_check";

alter table "public"."profiles" add constraint "profiles_userid_unique" UNIQUE using index "profiles_userid_unique";

alter table "public"."seo_redirects" add constraint "check_different_paths" CHECK ((old_path <> new_path)) not valid;

alter table "public"."seo_redirects" validate constraint "check_different_paths";

alter table "public"."seo_redirects" add constraint "seo_redirects_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."seo_redirects" validate constraint "seo_redirects_created_by_fkey";

alter table "public"."sitemap_entries" add constraint "sitemap_entries_change_frequency_check" CHECK ((change_frequency = ANY (ARRAY['always'::text, 'hourly'::text, 'daily'::text, 'weekly'::text, 'monthly'::text, 'yearly'::text, 'never'::text]))) not valid;

alter table "public"."sitemap_entries" validate constraint "sitemap_entries_change_frequency_check";

alter table "public"."sitemap_entries" add constraint "sitemap_entries_priority_check" CHECK (((priority >= 0.0) AND (priority <= 1.0))) not valid;

alter table "public"."sitemap_entries" validate constraint "sitemap_entries_priority_check";

alter table "public"."spectacles" add constraint "spectacles_og_image_media_id_fkey" FOREIGN KEY (og_image_media_id) REFERENCES medias(id) ON DELETE SET NULL not valid;

alter table "public"."spectacles" validate constraint "spectacles_og_image_media_id_fkey";

alter table "public"."spectacles_categories" add constraint "spectacles_categories_category_id_fkey" FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE not valid;

alter table "public"."spectacles_categories" validate constraint "spectacles_categories_category_id_fkey";

alter table "public"."spectacles_categories" add constraint "spectacles_categories_spectacle_id_fkey" FOREIGN KEY (spectacle_id) REFERENCES spectacles(id) ON DELETE CASCADE not valid;

alter table "public"."spectacles_categories" validate constraint "spectacles_categories_spectacle_id_fkey";

alter table "public"."spectacles_medias" add constraint "spectacles_medias_media_id_fkey" FOREIGN KEY (media_id) REFERENCES medias(id) ON DELETE CASCADE not valid;

alter table "public"."spectacles_medias" validate constraint "spectacles_medias_media_id_fkey";

alter table "public"."spectacles_medias" add constraint "spectacles_medias_spectacle_id_fkey" FOREIGN KEY (spectacle_id) REFERENCES spectacles(id) ON DELETE CASCADE not valid;

alter table "public"."spectacles_medias" validate constraint "spectacles_medias_spectacle_id_fkey";

alter table "public"."spectacles_membres_equipe" add constraint "spectacles_membres_equipe_membre_id_fkey" FOREIGN KEY (membre_id) REFERENCES membres_equipe(id) ON DELETE CASCADE not valid;

alter table "public"."spectacles_membres_equipe" validate constraint "spectacles_membres_equipe_membre_id_fkey";

alter table "public"."spectacles_membres_equipe" add constraint "spectacles_membres_equipe_spectacle_id_fkey" FOREIGN KEY (spectacle_id) REFERENCES spectacles(id) ON DELETE CASCADE not valid;

alter table "public"."spectacles_membres_equipe" validate constraint "spectacles_membres_equipe_spectacle_id_fkey";

alter table "public"."spectacles_tags" add constraint "spectacles_tags_spectacle_id_fkey" FOREIGN KEY (spectacle_id) REFERENCES spectacles(id) ON DELETE CASCADE not valid;

alter table "public"."spectacles_tags" validate constraint "spectacles_tags_spectacle_id_fkey";

alter table "public"."spectacles_tags" add constraint "spectacles_tags_tag_id_fkey" FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE not valid;

alter table "public"."spectacles_tags" validate constraint "spectacles_tags_tag_id_fkey";

alter table "public"."tags" add constraint "tags_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."tags" validate constraint "tags_created_by_fkey";

set check_function_bodies = off;

create or replace view "public"."analytics_summary" as  SELECT event_type,
    entity_type,
    date_trunc('day'::text, created_at) AS event_date,
    count(*) AS total_events,
    count(DISTINCT user_id) AS unique_users,
    count(DISTINCT session_id) AS unique_sessions
   FROM analytics_events
  WHERE (created_at >= (CURRENT_DATE - '30 days'::interval))
  GROUP BY event_type, entity_type, (date_trunc('day'::text, created_at))
  ORDER BY (date_trunc('day'::text, created_at)) DESC, (count(*)) DESC;


CREATE OR REPLACE FUNCTION public.articles_versioning_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  change_summary_text text;
  change_type_value text;
begin
  if tg_op = 'INSERT' then
    change_type_value := 'create';
    change_summary_text := 'Création de l''article: ' || NEW.title;
  else
    if OLD.published_at is null and NEW.published_at is not null then
      change_type_value := 'publish';
      change_summary_text := 'Publication de l''article: ' || NEW.title;
    elsif OLD.published_at is not null and NEW.published_at is null then
      change_type_value := 'unpublish';
      change_summary_text := 'Dépublication de l''article: ' || NEW.title;
    else
      change_type_value := 'update';
      change_summary_text := 'Mise à jour de l''article: ' || NEW.title;
    end if;
  end if;
  
  -- Créer la version
  perform public.create_content_version(
    'article_presse',
    NEW.id,
    to_jsonb(NEW),
    change_summary_text,
    change_type_value
  );
  
  return NEW;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.audit_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  headers_json json;
  xff_text text;
  ua_text text;
  user_id_uuid uuid := null;
  record_id_text text;
begin
  begin
    headers_json := coalesce(current_setting('request.headers', true), '{}')::json;
  exception when others then
    headers_json := '{}';
  end;

  xff_text := headers_json ->> 'x-forwarded-for';
  ua_text := headers_json ->> 'user-agent';

  if xff_text is not null and btrim(xff_text) = '' then
    xff_text := null;
  end if;
  if ua_text is not null and btrim(ua_text) = '' then
    ua_text := null;
  end if;

  begin
    user_id_uuid := nullif(auth.uid(), '')::uuid;
  exception when others then
    user_id_uuid := null;
  end;

  begin
    if tg_op in ('insert','update') then
      record_id_text := coalesce(new.id::text, null);
    else
      record_id_text := coalesce(old.id::text, null);
    end if;
  exception when others then
    record_id_text := null;
  end;

  insert into public.logs_audit (
    user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent, created_at
  ) values (
    user_id_uuid, tg_op, tg_table_name, record_id_text,
    case when tg_op = 'delete' then row_to_json(old) else null end,
    case when tg_op in ('insert','update') then row_to_json(new) else null end,
    case when xff_text is not null then nullif(xff_text, '')::inet else null end,
    ua_text,
    now()
  );

  if tg_op = 'delete' then
    return old;
  else
    return new;
  end if;
end;
$function$
;

create or replace view "public"."categories_hierarchy" as  WITH RECURSIVE category_tree AS (
         SELECT categories.id,
            categories.name,
            categories.slug,
            categories.parent_id,
            0 AS level,
            ARRAY[categories.id] AS path,
            categories.name AS full_path
           FROM categories
          WHERE ((categories.parent_id IS NULL) AND (categories.is_active = true))
        UNION ALL
         SELECT c.id,
            c.name,
            c.slug,
            c.parent_id,
            (ct.level + 1) AS level,
            (ct.path || c.id) AS path,
            ((ct.full_path || ' > '::text) || c.name) AS full_path
           FROM (categories c
             JOIN category_tree ct ON ((c.parent_id = ct.id)))
          WHERE (c.is_active = true)
        )
 SELECT id,
    name,
    slug,
    parent_id,
    level,
    path,
    full_path
   FROM category_tree
  ORDER BY path;


CREATE OR REPLACE FUNCTION public.check_communique_has_pdf()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  pdf_count integer;
begin
  -- Compter les PDFs principaux (ordre = -1) pour ce communiqué
  select count(*)
  into pdf_count
  from public.communiques_medias cm
  where cm.communique_id = coalesce(NEW.communique_id, OLD.communique_id)
    and cm.ordre = -1;

  -- INSERT: empêcher l'ajout d'un second PDF principal
  if TG_OP = 'INSERT' then
    if NEW.ordre = -1 and pdf_count >= 1 then
      raise exception 'Un communiqué ne peut avoir qu''un seul PDF principal (ordre = -1). PDF principal déjà existant.';
    end if;
    return NEW;
  end if;

  -- UPDATE: gérer les transitions vers/depuis ordre = -1
  if TG_OP = 'UPDATE' then
    -- Passage vers ordre = -1: vérifier qu''il n''en existe pas déjà un autre
    if NEW.ordre = -1 and coalesce(OLD.ordre, 0) <> -1 then
      if pdf_count >= 1 then
        raise exception 'Un communiqué ne peut avoir qu''un seul PDF principal (ordre = -1). PDF principal déjà existant.';
      end if;
    end if;

    -- Passage de -1 vers autre valeur: s''assurer qu''il en reste au moins un
    if OLD.ordre = -1 and NEW.ordre <> -1 then
      if pdf_count <= 1 then
        raise exception 'Impossible de modifier le PDF principal: il doit en rester un (ordre = -1).';
      end if;
    end if;
    return NEW;
  end if;

  -- DELETE: empêcher la suppression du dernier PDF principal
  if TG_OP = 'DELETE' then
    if OLD.ordre = -1 and pdf_count <= 1 then
      raise exception 'Impossible de supprimer le dernier PDF principal du communiqué. Un communiqué doit toujours avoir un PDF principal (ordre = -1).';
    end if;
    return OLD;
  end if;
end;
$function$
;

create or replace view "public"."communiques_presse_dashboard" as  SELECT cp.id,
    cp.title,
    cp.slug,
    cp.description,
    cp.date_publication,
    cp.public,
    cp.ordre_affichage,
    pdf_m.filename AS pdf_filename,
    round(((COALESCE(cp.file_size_bytes, pdf_m.size_bytes))::numeric / 1024.0), 2) AS pdf_size_kb,
    cp.image_url,
    im.filename AS image_filename,
    s.title AS spectacle_titre,
    e.date_debut AS evenement_date,
    p.display_name AS createur,
    cp.created_at,
    cp.updated_at,
    count(cc.category_id) AS nb_categories,
    count(ct.tag_id) AS nb_tags
   FROM (((((((((communiques_presse cp
     LEFT JOIN communiques_medias pdf_cm ON (((cp.id = pdf_cm.communique_id) AND (pdf_cm.ordre = '-1'::integer))))
     LEFT JOIN medias pdf_m ON ((pdf_cm.media_id = pdf_m.id)))
     LEFT JOIN communiques_medias cm ON (((cp.id = cm.communique_id) AND (cm.ordre = 0))))
     LEFT JOIN medias im ON ((cm.media_id = im.id)))
     LEFT JOIN spectacles s ON ((cp.spectacle_id = s.id)))
     LEFT JOIN evenements e ON ((cp.evenement_id = e.id)))
     LEFT JOIN profiles p ON ((cp.created_by = p.user_id)))
     LEFT JOIN communiques_categories cc ON ((cp.id = cc.communique_id)))
     LEFT JOIN communiques_tags ct ON ((cp.id = ct.communique_id)))
  GROUP BY cp.id, pdf_m.filename, pdf_m.size_bytes, im.filename, cp.image_url, s.title, e.date_debut, p.display_name
  ORDER BY cp.created_at DESC;


create or replace view "public"."communiques_presse_public" as  SELECT cp.id,
    cp.title,
    cp.slug,
    cp.description,
    cp.date_publication,
    cp.ordre_affichage,
    cp.spectacle_id,
    cp.evenement_id,
    pdf_m.filename AS pdf_filename,
    cp.file_size_bytes,
        CASE
            WHEN (cp.file_size_bytes IS NOT NULL) THEN
            CASE
                WHEN (cp.file_size_bytes < 1024) THEN ((cp.file_size_bytes)::text || ' B'::text)
                WHEN (cp.file_size_bytes < 1048576) THEN ((round(((cp.file_size_bytes)::numeric / 1024.0), 1))::text || ' KB'::text)
                ELSE ((round(((cp.file_size_bytes)::numeric / 1048576.0), 1))::text || ' MB'::text)
            END
            ELSE (pdf_m.size_bytes)::text
        END AS file_size_display,
    pdf_m.storage_path AS pdf_path,
    concat('/storage/v1/object/public/', pdf_m.storage_path) AS file_url,
    cp.image_url,
    cm.ordre AS image_ordre,
    im.filename AS image_filename,
    im.storage_path AS image_path,
    concat('/storage/v1/object/public/', im.storage_path) AS image_file_url,
    s.title AS spectacle_titre,
    e.date_debut AS evenement_date,
    l.nom AS lieu_nom,
    array_agg(DISTINCT c.name) FILTER (WHERE (c.name IS NOT NULL)) AS categories,
    array_agg(DISTINCT t.name) FILTER (WHERE (t.name IS NOT NULL)) AS tags
   FROM (((((((((((communiques_presse cp
     LEFT JOIN communiques_medias pdf_cm ON (((cp.id = pdf_cm.communique_id) AND (pdf_cm.ordre = '-1'::integer))))
     LEFT JOIN medias pdf_m ON ((pdf_cm.media_id = pdf_m.id)))
     LEFT JOIN communiques_medias cm ON (((cp.id = cm.communique_id) AND (cm.ordre = 0))))
     LEFT JOIN medias im ON ((cm.media_id = im.id)))
     LEFT JOIN spectacles s ON ((cp.spectacle_id = s.id)))
     LEFT JOIN evenements e ON ((cp.evenement_id = e.id)))
     LEFT JOIN lieux l ON ((e.lieu_id = l.id)))
     LEFT JOIN communiques_categories cc ON ((cp.id = cc.communique_id)))
     LEFT JOIN categories c ON (((cc.category_id = c.id) AND (c.is_active = true))))
     LEFT JOIN communiques_tags ct ON ((cp.id = ct.communique_id)))
     LEFT JOIN tags t ON ((ct.tag_id = t.id)))
  WHERE ((cp.public = true) AND (EXISTS ( SELECT 1
           FROM communiques_medias pdf_check
          WHERE ((pdf_check.communique_id = cp.id) AND (pdf_check.ordre = '-1'::integer)))))
  GROUP BY cp.id, pdf_m.filename, pdf_m.size_bytes, pdf_m.storage_path, cm.ordre, im.filename, im.storage_path, cp.image_url, s.title, e.date_debut, l.nom
  ORDER BY cp.ordre_affichage, cp.date_publication DESC;


CREATE OR REPLACE FUNCTION public.communiques_versioning_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  change_summary_text text;
  change_type_value text;
begin
  if tg_op = 'INSERT' then
    change_type_value := 'create';
    change_summary_text := 'Création du communiqué: ' || NEW.title;
  else
    if OLD.public = false and NEW.public = true then
      change_type_value := 'publish';
      change_summary_text := 'Publication du communiqué: ' || NEW.title;
    elsif OLD.public = true and NEW.public = false then
      change_type_value := 'unpublish';
      change_summary_text := 'Dépublication du communiqué: ' || NEW.title;
    else
      change_type_value := 'update';
      change_summary_text := 'Mise à jour du communiqué: ' || NEW.title;
    end if;
  end if;
  
  -- Créer la version
  perform public.create_content_version(
    'communique_presse',
    NEW.id,
    to_jsonb(NEW),
    change_summary_text,
    change_type_value
  );
  
  return NEW;
end;
$function$
;

create or replace view "public"."compagnie_presentation_sections_admin" as  SELECT s.id,
    s.slug,
    s.kind,
    s.title,
    s.subtitle,
    s.content,
    s.quote_text,
    s.quote_author,
    s.image_url,
    s.image_media_id,
    s."position",
    s.active,
    s.created_at,
    s.updated_at,
    cv.version_number AS last_version_number,
    cv.change_type AS last_change_type,
    cv.created_at AS last_version_created_at,
    vcount.total_versions
   FROM ((compagnie_presentation_sections s
     LEFT JOIN LATERAL ( SELECT content_versions.version_number,
            content_versions.change_type,
            content_versions.created_at
           FROM content_versions
          WHERE ((content_versions.entity_type = 'compagnie_presentation_section'::text) AND (content_versions.entity_id = s.id))
          ORDER BY content_versions.version_number DESC
         LIMIT 1) cv ON (true))
     LEFT JOIN LATERAL ( SELECT (count(*))::integer AS total_versions
           FROM content_versions
          WHERE ((content_versions.entity_type = 'compagnie_presentation_section'::text) AND (content_versions.entity_id = s.id))) vcount ON (true));


CREATE OR REPLACE FUNCTION public.compagnie_presentation_sections_versioning_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  change_summary_text text;
  change_type_value text;
begin
  if tg_op = 'INSERT' then
    change_type_value := 'create';
    change_summary_text := 'Création section présentation: ' || coalesce(NEW.slug, '');
  else
    change_type_value := 'update';
    change_summary_text := 'Mise à jour section présentation: ' || coalesce(NEW.slug, '');
  end if;

  perform public.create_content_version(
    'compagnie_presentation_section',
    NEW.id,
    to_jsonb(NEW),
    change_summary_text,
    change_type_value
  );

  return NEW;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.compagnie_stats_versioning_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  change_summary_text text;
  change_type_value text;
begin
  if tg_op = 'INSERT' then
    change_type_value := 'create';
    change_summary_text := 'Création statistique compagnie: ' || coalesce(NEW.label, '');
  else
    change_type_value := 'update';
    change_summary_text := 'Mise à jour statistique compagnie: ' || coalesce(NEW.label, '');
  end if;

  perform public.create_content_version(
    'compagnie_stat',
    NEW.id,
    to_jsonb(NEW),
    change_summary_text,
    change_type_value
  );

  return NEW;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.compagnie_values_versioning_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  change_summary_text text;
  change_type_value text;
begin
  if tg_op = 'INSERT' then
    change_type_value := 'create';
    change_summary_text := 'Création valeur compagnie: ' || coalesce(NEW.title, '');
  else
    change_type_value := 'update';
    change_summary_text := 'Mise à jour valeur compagnie: ' || coalesce(NEW.title, '');
  end if;

  perform public.create_content_version(
    'compagnie_value',
    NEW.id,
    to_jsonb(NEW),
    change_summary_text,
    change_type_value
  );

  return NEW;
end;
$function$
;

create or replace view "public"."content_versions_detailed" as  SELECT cv.id,
    cv.entity_type,
    cv.entity_id,
    cv.version_number,
    cv.change_type,
    cv.change_summary,
    cv.created_at,
    p.display_name AS created_by_name,
    cv.created_by AS created_by_id,
    char_length((cv.content_snapshot)::text) AS snapshot_size
   FROM (content_versions cv
     LEFT JOIN profiles p ON ((cv.created_by = p.user_id)))
  ORDER BY cv.entity_type, cv.entity_id, cv.version_number DESC;


CREATE OR REPLACE FUNCTION public.create_content_version(p_entity_type text, p_entity_id bigint, p_content_snapshot jsonb, p_change_summary text DEFAULT NULL::text, p_change_type text DEFAULT 'update'::text)
 RETURNS bigint
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  next_version integer;
  extracted_title text;
  version_id bigint;
begin
  -- Calculer le prochain numéro de version
  select coalesce(max(version_number), 0) + 1
  into next_version
  from public.content_versions
  where entity_type = p_entity_type and entity_id = p_entity_id;
  
  -- Extraire un title du snapshot si possible pour le résumé auto
  extracted_title := p_content_snapshot->>'title';
  if extracted_title is null then
    extracted_title := p_content_snapshot->>'name';
  end if;
  
  -- Générer un résumé automatique si non fourni
  if p_change_summary is null then
    p_change_summary := case
      when p_change_type = 'create' then 'Création initiale'
      when p_change_type = 'update' then 'Mise à jour'
      when p_change_type = 'publish' then 'Publication'
      when p_change_type = 'unpublish' then 'Dépublication'
      when p_change_type = 'restore' then 'Restauration depuis version antérieure'
      else 'Modification'
    end;
    
    if extracted_title is not null then
      p_change_summary := p_change_summary || ' - ' || extracted_title;
    end if;
  end if;
  
  -- Insérer la nouvelle version
  insert into public.content_versions (
    entity_type,
    entity_id,
    version_number,
    content_snapshot,
    change_summary,
    change_type,
    created_by
  ) values (
    p_entity_type,
    p_entity_id,
    next_version,
    p_content_snapshot,
    p_change_summary,
    p_change_type,
    (select auth.uid())
  ) returning id into version_id;
  
  return version_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.evenements_versioning_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  change_summary_text text;
  change_type_value text;
  spectacle_title text;
begin
  -- Récupérer le titre du spectacle pour le résumé
  select title into spectacle_title 
  from public.spectacles 
  where id = NEW.spectacle_id;
  
  if tg_op = 'INSERT' then
    change_type_value := 'create';
    change_summary_text := 'Création d''événement pour: ' || coalesce(spectacle_title, 'Spectacle #' || NEW.spectacle_id);
  else
    if OLD.status != NEW.status then
      change_type_value := 'update';
      change_summary_text := 'Changement de statut (' || OLD.status || ' → ' || NEW.status || ') pour: ' || coalesce(spectacle_title, 'Spectacle #' || NEW.spectacle_id);
    else
      change_type_value := 'update';
      change_summary_text := 'Mise à jour d''événement pour: ' || coalesce(spectacle_title, 'Spectacle #' || NEW.spectacle_id);
    end if;
  end if;
  
  -- Créer la version
  perform public.create_content_version(
    'evenement',
    NEW.id,
    to_jsonb(NEW),
    change_summary_text,
    change_type_value
  );
  
  return NEW;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_slug(input_text text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO ''
AS $function$
declare
  normalized_text text;
begin
  if input_text is null then
    return null;
  end if;
  
  -- Normaliser: minuscules, supprimer les accents, remplacer espaces/caractères spéciaux par des tirets
  normalized_text := lower(input_text);
  normalized_text := unaccent(normalized_text);
  normalized_text := regexp_replace(normalized_text, '[^a-z0-9]+', '-', 'g');
  normalized_text := regexp_replace(normalized_text, '^-+|-+$', '', 'g');
  
  return normalized_text;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_current_timestamp()
 RETURNS timestamp with time zone
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  return now();
end;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  profile_display_name text;
  profile_role text;
begin
  -- Validation de l'entrée
  if new.id is null then
    raise exception 'User ID cannot be null';
  end if;

  -- Construction sécurisée du display_name
  profile_display_name := coalesce(
    new.raw_user_meta_data->>'display_name',
    concat_ws(' ', 
      new.raw_user_meta_data->>'first_name', 
      new.raw_user_meta_data->>'last_name'
    ),
    new.email,
    'Utilisateur'
  );

  -- Validation et assignation du rôle
  profile_role := case 
    when new.raw_user_meta_data->>'role' in ('user', 'editor', 'admin') 
    then new.raw_user_meta_data->>'role'
    else 'user'
  end;

  -- Insertion avec gestion d'erreur
  begin
    insert into public.profiles (user_id, display_name, role)
    values (new.id, profile_display_name, profile_role);
  exception 
    when unique_violation then
      raise warning 'Profile already exists for user %', new.id;
    when others then
      raise warning 'Failed to create profile for user %: %', new.id, sqlerrm;
  end;

  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_user_deletion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if old.id is null then
    raise warning 'Cannot delete profile: user ID is null';
    return old;
  end if;

  begin
    delete from public.profiles where user_id = old.id;
    raise notice 'Profile deleted for user %', old.id;
  exception when others then
    raise warning 'Failed to delete profile for user %: %', old.id, sqlerrm;
  end;

  return old;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_user_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  new_display_name text;
  new_role text;
begin
  -- Vérification des changements pertinents
  if old.raw_user_meta_data is not distinct from new.raw_user_meta_data 
     and old.email is not distinct from new.email then
    return new;
  end if;

  -- Construction du nouveau display_name
  new_display_name := coalesce(
    new.raw_user_meta_data->>'display_name',
    concat_ws(' ', 
      new.raw_user_meta_data->>'first_name', 
      new.raw_user_meta_data->>'last_name'
    ),
    new.email,
    'Utilisateur'
  );

  -- Validation du nouveau rôle
  new_role := case 
    when new.raw_user_meta_data->>'role' in ('user', 'editor', 'admin') 
    then new.raw_user_meta_data->>'role'
    else coalesce((select role from public.profiles where user_id = new.id), 'user')
  end;

  begin
    update public.profiles
    set 
      display_name = new_display_name,
      role = new_role,
      updated_at = now()
    where user_id = new.id;

    if not found then
      raise warning 'No profile found to update for user %', new.id;
    end if;

  exception when others then
    raise warning 'Failed to update profile for user %: %', new.id, sqlerrm;
  end;
  
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'admin'
  );
$function$
;

create or replace view "public"."membres_equipe_admin" as  SELECT m.id,
    m.name,
    m.role,
    m.description,
    m.image_url,
    m.photo_media_id,
    m.ordre,
    m.active,
    m.created_at,
    m.updated_at,
    cv.version_number AS last_version_number,
    cv.change_type AS last_change_type,
    cv.created_at AS last_version_created_at,
    vcount.total_versions
   FROM ((membres_equipe m
     LEFT JOIN LATERAL ( SELECT content_versions.version_number,
            content_versions.change_type,
            content_versions.created_at
           FROM content_versions
          WHERE ((content_versions.entity_type = 'membre_equipe'::text) AND (content_versions.entity_id = m.id))
          ORDER BY content_versions.version_number DESC
         LIMIT 1) cv ON (true))
     LEFT JOIN LATERAL ( SELECT (count(*))::integer AS total_versions
           FROM content_versions
          WHERE ((content_versions.entity_type = 'membre_equipe'::text) AND (content_versions.entity_id = m.id))) vcount ON (true));


CREATE OR REPLACE FUNCTION public.membres_equipe_versioning_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  change_summary_text text;
  change_type_value text;
begin
  if tg_op = 'INSERT' then
    change_type_value := 'create';
  change_summary_text := 'Création membre équipe: ' || coalesce(NEW.name, '');
  else
    change_type_value := 'update';
  change_summary_text := 'Mise à jour membre équipe: ' || coalesce(NEW.name, '');
  end if;

  perform public.create_content_version(
    'membre_equipe',
    NEW.id,
    to_jsonb(NEW),
    change_summary_text,
    change_type_value
  );

  return NEW;
end;
$function$
;

create or replace view "public"."messages_contact_admin" as  SELECT mc.id,
    mc.created_at,
    (now() - mc.created_at) AS age,
    mc.firstname,
    mc.lastname,
    TRIM(BOTH FROM ((COALESCE(mc.firstname, ''::text) || ' '::text) || COALESCE(mc.lastname, ''::text))) AS full_name,
    mc.email,
    mc.phone,
    mc.reason,
    mc.message,
    mc.status,
    mc.processed,
    mc.processed_at,
        CASE
            WHEN (mc.processed_at IS NOT NULL) THEN (mc.processed_at - mc.created_at)
            ELSE NULL::interval
        END AS processing_latency,
    mc.consent,
    mc.consent_at,
    mc.spam_score,
    mc.metadata,
    mc.contact_presse_id,
    cp.nom AS contact_presse_nom,
    cp.media AS contact_presse_media,
    cp.fonction AS contact_presse_role
   FROM (messages_contact mc
     LEFT JOIN contacts_presse cp ON ((cp.id = mc.contact_presse_id)));


create or replace view "public"."partners_admin" as  SELECT p.id,
    p.name,
    p.description,
    p.website_url,
    p.logo_url,
    p.logo_media_id,
    p.is_active,
    p.display_order,
    p.created_by,
    p.created_at,
    p.updated_at,
    lv.version_number AS last_version_number,
    lv.change_type AS last_change_type,
    lv.created_at AS last_version_created_at
   FROM (partners p
     LEFT JOIN LATERAL ( SELECT cv.version_number,
            cv.change_type,
            cv.created_at
           FROM content_versions cv
          WHERE ((cv.entity_type = 'partner'::text) AND (cv.entity_id = p.id))
          ORDER BY cv.version_number DESC
         LIMIT 1) lv ON (true));


CREATE OR REPLACE FUNCTION public.partners_versioning_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  change_summary_text text;
  change_type_value text;
begin
  if tg_op = 'INSERT' then
    change_type_value := 'create';
    change_summary_text := 'Création partenaire: ' || coalesce(NEW.name, '');
  else
    change_type_value := 'update';
    change_summary_text := 'Mise à jour partenaire: ' || coalesce(NEW.name, '');
  end if;

  perform public.create_content_version(
    'partner',
    NEW.id,
    to_jsonb(NEW),
    change_summary_text,
    change_type_value
  );

  return NEW;
end;
$function$
;

create or replace view "public"."popular_tags" as  SELECT id,
    name,
    slug,
    usage_count,
    is_featured,
    created_at
   FROM tags
  WHERE (usage_count > 0)
  ORDER BY is_featured DESC, usage_count DESC, name;


CREATE OR REPLACE FUNCTION public.restore_content_version(p_version_id bigint, p_change_summary text DEFAULT 'Restauration d''une version antérieure'::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  version_record record;
  restore_success boolean := false;
begin
  -- Récupérer les informations de la version à restaurer
  select 
    entity_type,
    entity_id,
    content_snapshot
  into version_record
  from public.content_versions
  where id = p_version_id;
  
  -- Vérifier que la version existe
  if version_record is null then
    return false;
  end if;
  
  -- Restaurer selon le type d'entité
  if version_record.entity_type = 'spectacle' then
    update public.spectacles
    set 
      title = version_record.content_snapshot->>'title',
      description = version_record.content_snapshot->>'description',
      published_at = (version_record.content_snapshot->>'published_at')::timestamptz,
      public = (version_record.content_snapshot->>'public')::boolean,
      image_url = version_record.content_snapshot->>'image_url',
      updated_at = now()
      -- Autres champs à restaurer
    where id = version_record.entity_id;
    
    restore_success := found;
    
  elsif version_record.entity_type = 'article_presse' then
    update public.articles_presse
    set 
      title = version_record.content_snapshot->>'title',
      author = version_record.content_snapshot->>'author',
      type = version_record.content_snapshot->>'type',
      slug = version_record.content_snapshot->>'slug',
      chapo = version_record.content_snapshot->>'chapo',
      excerpt = version_record.content_snapshot->>'excerpt',
      source_publication = version_record.content_snapshot->>'source_publication',
      source_url = version_record.content_snapshot->>'source_url',
      published_at = (version_record.content_snapshot->>'published_at')::timestamptz,
      updated_at = now()
      -- Autres champs à restaurer
    where id = version_record.entity_id;
    
    restore_success := found;
    
  elsif version_record.entity_type = 'communique_presse' then
    update public.communiques_presse
    set 
      title = version_record.content_snapshot->>'title',
      description = version_record.content_snapshot->>'description',
      date_publication = (version_record.content_snapshot->>'date_publication')::date,
      public = (version_record.content_snapshot->>'public')::boolean,
      ordre_affichage = (version_record.content_snapshot->>'ordre_affichage')::integer,
      file_size_bytes = (version_record.content_snapshot->>'file_size_bytes')::bigint,
      image_url = version_record.content_snapshot->>'image_url',
      updated_at = now()
      -- Note: Relations many-to-many (medias, categories, tags) non restaurées pour éviter incohérences
    where id = version_record.entity_id;
    
    restore_success := found;
    
  elsif version_record.entity_type = 'evenement' then
    update public.evenements
    set 
      spectacle_id = (version_record.content_snapshot->>'spectacle_id')::bigint,
      lieu_id = (version_record.content_snapshot->>'lieu_id')::bigint,
      date_debut = (version_record.content_snapshot->>'date_debut')::timestamptz,
      date_fin = (version_record.content_snapshot->>'date_fin')::timestamptz,
      capacity = (version_record.content_snapshot->>'capacity')::integer,
      price_cents = (version_record.content_snapshot->>'price_cents')::integer,
      status = version_record.content_snapshot->>'status',
      ticket_url = version_record.content_snapshot->>'ticket_url',
      image_url = version_record.content_snapshot->>'image_url',
      start_time = (version_record.content_snapshot->>'start_time')::time,
      end_time = (version_record.content_snapshot->>'end_time')::time,
      type_array = array(select jsonb_array_elements_text(version_record.content_snapshot->'type_array')),
      metadata = version_record.content_snapshot->'metadata',
      recurrence_rule = version_record.content_snapshot->>'recurrence_rule',
      recurrence_end_date = (version_record.content_snapshot->>'recurrence_end_date')::timestamptz,
      parent_event_id = (version_record.content_snapshot->>'parent_event_id')::bigint,
      updated_at = now()
    where id = version_record.entity_id;
    
    restore_success := found;
  elsif version_record.entity_type = 'membre_equipe' then
    update public.membres_equipe
    set 
      name = coalesce(version_record.content_snapshot->>'name', version_record.content_snapshot->>'nom'),
      role = version_record.content_snapshot->>'role',
      description = version_record.content_snapshot->>'description',
      image_url = version_record.content_snapshot->>'image_url',
      photo_media_id = (version_record.content_snapshot->>'photo_media_id')::bigint,
      ordre = (version_record.content_snapshot->>'ordre')::smallint,
      active = (version_record.content_snapshot->>'active')::boolean,
      updated_at = now()
    where id = version_record.entity_id;

    restore_success := found;
  elsif version_record.entity_type = 'partner' then
    update public.partners
    set
      name = version_record.content_snapshot->>'name',
      description = version_record.content_snapshot->>'description',
      website_url = version_record.content_snapshot->>'website_url',
      logo_url = version_record.content_snapshot->>'logo_url',
      logo_media_id = (version_record.content_snapshot->>'logo_media_id')::bigint,
      is_active = (version_record.content_snapshot->>'is_active')::boolean,
      display_order = (version_record.content_snapshot->>'display_order')::integer,
      updated_at = now()
    where id = version_record.entity_id;

    restore_success := found;
  elsif version_record.entity_type = 'compagnie_value' then
    update public.compagnie_values
    set
      key = version_record.content_snapshot->>'key',
      title = version_record.content_snapshot->>'title',
      description = version_record.content_snapshot->>'description',
      position = (version_record.content_snapshot->>'position')::smallint,
      active = (version_record.content_snapshot->>'active')::boolean,
      updated_at = now()
    where id = version_record.entity_id;

    restore_success := found;
  elsif version_record.entity_type = 'compagnie_stat' then
    update public.compagnie_stats
    set
      key = version_record.content_snapshot->>'key',
      label = version_record.content_snapshot->>'label',
      value = version_record.content_snapshot->>'value',
      position = (version_record.content_snapshot->>'position')::smallint,
      active = (version_record.content_snapshot->>'active')::boolean,
      updated_at = now()
    where id = version_record.entity_id;

    restore_success := found;
  elsif version_record.entity_type = 'compagnie_presentation_section' then
    update public.compagnie_presentation_sections
    set
      slug = version_record.content_snapshot->>'slug',
      kind = version_record.content_snapshot->>'kind',
      title = version_record.content_snapshot->>'title',
      subtitle = version_record.content_snapshot->>'subtitle',
      content = case when version_record.content_snapshot ? 'content' then array(select jsonb_array_elements_text(version_record.content_snapshot->'content')) else null end,
      quote_text = version_record.content_snapshot->>'quote_text',
      quote_author = version_record.content_snapshot->>'quote_author',
      image_url = version_record.content_snapshot->>'image_url',
      image_media_id = (version_record.content_snapshot->>'image_media_id')::bigint,
      position = (version_record.content_snapshot->>'position')::smallint,
      active = (version_record.content_snapshot->>'active')::boolean,
      updated_at = now()
    where id = version_record.entity_id;

    restore_success := found;
  end if;
  
  -- Si restauration réussie, créer une nouvelle version pour tracer l'opération
  if restore_success then
    perform public.create_content_version(
      version_record.entity_type,
      version_record.entity_id,
      version_record.content_snapshot,
      p_change_summary,
      'restore'
    );
  end if;
  
  return restore_success;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.set_messages_contact_consent_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
  if (tg_op = 'INSERT' and new.consent = true and new.consent_at is null) then
    new.consent_at := now();
  elsif (tg_op = 'UPDATE' and new.consent = true and (old.consent is distinct from new.consent) and new.consent_at is null) then
    new.consent_at := now();
  end if;
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.set_slug_if_empty()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
  if NEW.slug is null or NEW.slug = '' then
    if TG_TABLE_NAME = 'spectacles' and NEW.title is not null then
      NEW.slug := public.generate_slug(NEW.title);
    elsif TG_TABLE_NAME = 'articles_presse' and NEW.title is not null then
      NEW.slug := public.generate_slug(NEW.title);
    elsif TG_TABLE_NAME = 'categories' and NEW.name is not null then
      NEW.slug := public.generate_slug(NEW.name);
    elsif TG_TABLE_NAME = 'tags' and NEW.name is not null then
      NEW.slug := public.generate_slug(NEW.name);
    end if;
  end if;
  
  return NEW;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.spectacles_versioning_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  change_summary_text text;
  change_type_value text;
begin
  -- Déterminer le type de changement
  if tg_op = 'INSERT' then
    change_type_value := 'create';
    change_summary_text := 'Création du spectacle: ' || NEW.title;
  else
    if OLD.published_at is null and NEW.published_at is not null then
      change_type_value := 'publish';
      change_summary_text := 'Publication du spectacle: ' || NEW.title;
    elsif OLD.published_at is not null and NEW.published_at is null then
      change_type_value := 'unpublish';
      change_summary_text := 'Dépublication du spectacle: ' || NEW.title;
    else
      change_type_value := 'update';
      change_summary_text := 'Mise à jour du spectacle: ' || NEW.title;
    end if;
  end if;
  
  -- Créer la version
  perform public.create_content_version(
    'spectacle',
    NEW.id,
    to_jsonb(NEW),
    change_summary_text,
    change_type_value
  );
  
  return NEW;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.to_tsvector_french(text)
 RETURNS tsvector
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO ''
AS $function$
  select to_tsvector('french', coalesce($1, ''));
$function$
;

CREATE OR REPLACE FUNCTION public.track_analytics_event(p_event_type text, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS bigint
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  headers_json json;
  event_id bigint;
  v_session_id text;
  v_pathname text;
  v_entity_type text;
  v_entity_id bigint;
  v_search_query text;
  v_ip_address text;
  v_user_agent text;
begin
  -- Récupérer les headers HTTP
  headers_json := current_setting('request.headers', true)::json;
  
  -- Extraire les informations des métadonnées
  v_session_id := p_metadata->>'session_id';
  v_pathname := p_metadata->>'pathname';
  v_entity_type := p_metadata->>'entity_type';
  v_entity_id := (p_metadata->>'entity_id')::bigint;
  v_search_query := p_metadata->>'search_query';
  
  -- Extraire IP et User-Agent des headers
  v_ip_address := headers_json->'x-forwarded-for'->>0;
  v_user_agent := headers_json->>'user-agent';
  
  -- Insérer l'événement
  insert into public.analytics_events (
    event_type,
    entity_type,
    entity_id,
    user_id,
    session_id,
    pathname,
    search_query,
    metadata,
    ip_address,
    user_agent
  ) values (
    p_event_type,
    v_entity_type,
    v_entity_id,
    (select auth.uid()),
    v_session_id,
    v_pathname,
    v_search_query,
    p_metadata,
    v_ip_address,
    v_user_agent
  ) returning id into event_id;
  
  return event_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_tag_usage_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  tag_id_to_update bigint;
begin
  -- Récupérer l'ID du tag concerné selon l'opération
  if TG_OP = 'INSERT' then
    tag_id_to_update := NEW.tag_id;
    
    -- Incrémenter le compteur d'usage
    update public.tags 
    set usage_count = usage_count + 1 
    where id = tag_id_to_update;
    
  elsif TG_OP = 'DELETE' then
    tag_id_to_update := OLD.tag_id;
    
    -- Décrémenter le compteur d'usage
    update public.tags 
    set usage_count = greatest(0, usage_count - 1) 
    where id = tag_id_to_update;
  end if;
  
  return null; -- trigger AFTER ne retourne rien
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_communique_creation(p_communique_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  pdf_count integer;
begin
  -- Vérifier qu'il y a exactement un PDF principal
  select count(*)
  into pdf_count
  from public.communiques_medias cm
  where cm.communique_id = p_communique_id
    and cm.ordre = -1;
    
  return pdf_count = 1;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_rrule(rule text)
 RETURNS boolean
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO ''
AS $function$
begin
  -- Validation basique du format RRULE
  if rule is null then
    return true;
  end if;

  -- Vérifier que la règle commence par RRULE:
  if position('RRULE:' in upper(rule)) != 1 then
    return false;
  end if;

  -- Vérification basique de la présence de FREQ (obligatoire)
  if position('FREQ=' in upper(rule)) = 0 then
    return false;
  end if;

  -- Validation passée
  return true;
end;
$function$
;

grant delete on table "public"."abonnes_newsletter" to "anon";

grant insert on table "public"."abonnes_newsletter" to "anon";

grant references on table "public"."abonnes_newsletter" to "anon";

grant select on table "public"."abonnes_newsletter" to "anon";

grant trigger on table "public"."abonnes_newsletter" to "anon";

grant truncate on table "public"."abonnes_newsletter" to "anon";

grant update on table "public"."abonnes_newsletter" to "anon";

grant delete on table "public"."abonnes_newsletter" to "authenticated";

grant insert on table "public"."abonnes_newsletter" to "authenticated";

grant references on table "public"."abonnes_newsletter" to "authenticated";

grant select on table "public"."abonnes_newsletter" to "authenticated";

grant trigger on table "public"."abonnes_newsletter" to "authenticated";

grant truncate on table "public"."abonnes_newsletter" to "authenticated";

grant update on table "public"."abonnes_newsletter" to "authenticated";

grant delete on table "public"."abonnes_newsletter" to "service_role";

grant insert on table "public"."abonnes_newsletter" to "service_role";

grant references on table "public"."abonnes_newsletter" to "service_role";

grant select on table "public"."abonnes_newsletter" to "service_role";

grant trigger on table "public"."abonnes_newsletter" to "service_role";

grant truncate on table "public"."abonnes_newsletter" to "service_role";

grant update on table "public"."abonnes_newsletter" to "service_role";

grant delete on table "public"."analytics_events" to "anon";

grant insert on table "public"."analytics_events" to "anon";

grant references on table "public"."analytics_events" to "anon";

grant select on table "public"."analytics_events" to "anon";

grant trigger on table "public"."analytics_events" to "anon";

grant truncate on table "public"."analytics_events" to "anon";

grant update on table "public"."analytics_events" to "anon";

grant delete on table "public"."analytics_events" to "authenticated";

grant insert on table "public"."analytics_events" to "authenticated";

grant references on table "public"."analytics_events" to "authenticated";

grant select on table "public"."analytics_events" to "authenticated";

grant trigger on table "public"."analytics_events" to "authenticated";

grant truncate on table "public"."analytics_events" to "authenticated";

grant update on table "public"."analytics_events" to "authenticated";

grant delete on table "public"."analytics_events" to "service_role";

grant insert on table "public"."analytics_events" to "service_role";

grant references on table "public"."analytics_events" to "service_role";

grant select on table "public"."analytics_events" to "service_role";

grant trigger on table "public"."analytics_events" to "service_role";

grant truncate on table "public"."analytics_events" to "service_role";

grant update on table "public"."analytics_events" to "service_role";

grant delete on table "public"."articles_categories" to "anon";

grant insert on table "public"."articles_categories" to "anon";

grant references on table "public"."articles_categories" to "anon";

grant select on table "public"."articles_categories" to "anon";

grant trigger on table "public"."articles_categories" to "anon";

grant truncate on table "public"."articles_categories" to "anon";

grant update on table "public"."articles_categories" to "anon";

grant delete on table "public"."articles_categories" to "authenticated";

grant insert on table "public"."articles_categories" to "authenticated";

grant references on table "public"."articles_categories" to "authenticated";

grant select on table "public"."articles_categories" to "authenticated";

grant trigger on table "public"."articles_categories" to "authenticated";

grant truncate on table "public"."articles_categories" to "authenticated";

grant update on table "public"."articles_categories" to "authenticated";

grant delete on table "public"."articles_categories" to "service_role";

grant insert on table "public"."articles_categories" to "service_role";

grant references on table "public"."articles_categories" to "service_role";

grant select on table "public"."articles_categories" to "service_role";

grant trigger on table "public"."articles_categories" to "service_role";

grant truncate on table "public"."articles_categories" to "service_role";

grant update on table "public"."articles_categories" to "service_role";

grant delete on table "public"."articles_medias" to "anon";

grant insert on table "public"."articles_medias" to "anon";

grant references on table "public"."articles_medias" to "anon";

grant select on table "public"."articles_medias" to "anon";

grant trigger on table "public"."articles_medias" to "anon";

grant truncate on table "public"."articles_medias" to "anon";

grant update on table "public"."articles_medias" to "anon";

grant delete on table "public"."articles_medias" to "authenticated";

grant insert on table "public"."articles_medias" to "authenticated";

grant references on table "public"."articles_medias" to "authenticated";

grant select on table "public"."articles_medias" to "authenticated";

grant trigger on table "public"."articles_medias" to "authenticated";

grant truncate on table "public"."articles_medias" to "authenticated";

grant update on table "public"."articles_medias" to "authenticated";

grant delete on table "public"."articles_medias" to "service_role";

grant insert on table "public"."articles_medias" to "service_role";

grant references on table "public"."articles_medias" to "service_role";

grant select on table "public"."articles_medias" to "service_role";

grant trigger on table "public"."articles_medias" to "service_role";

grant truncate on table "public"."articles_medias" to "service_role";

grant update on table "public"."articles_medias" to "service_role";

grant delete on table "public"."articles_presse" to "anon";

grant insert on table "public"."articles_presse" to "anon";

grant references on table "public"."articles_presse" to "anon";

grant select on table "public"."articles_presse" to "anon";

grant trigger on table "public"."articles_presse" to "anon";

grant truncate on table "public"."articles_presse" to "anon";

grant update on table "public"."articles_presse" to "anon";

grant delete on table "public"."articles_presse" to "authenticated";

grant insert on table "public"."articles_presse" to "authenticated";

grant references on table "public"."articles_presse" to "authenticated";

grant select on table "public"."articles_presse" to "authenticated";

grant trigger on table "public"."articles_presse" to "authenticated";

grant truncate on table "public"."articles_presse" to "authenticated";

grant update on table "public"."articles_presse" to "authenticated";

grant delete on table "public"."articles_presse" to "service_role";

grant insert on table "public"."articles_presse" to "service_role";

grant references on table "public"."articles_presse" to "service_role";

grant select on table "public"."articles_presse" to "service_role";

grant trigger on table "public"."articles_presse" to "service_role";

grant truncate on table "public"."articles_presse" to "service_role";

grant update on table "public"."articles_presse" to "service_role";

grant delete on table "public"."articles_tags" to "anon";

grant insert on table "public"."articles_tags" to "anon";

grant references on table "public"."articles_tags" to "anon";

grant select on table "public"."articles_tags" to "anon";

grant trigger on table "public"."articles_tags" to "anon";

grant truncate on table "public"."articles_tags" to "anon";

grant update on table "public"."articles_tags" to "anon";

grant delete on table "public"."articles_tags" to "authenticated";

grant insert on table "public"."articles_tags" to "authenticated";

grant references on table "public"."articles_tags" to "authenticated";

grant select on table "public"."articles_tags" to "authenticated";

grant trigger on table "public"."articles_tags" to "authenticated";

grant truncate on table "public"."articles_tags" to "authenticated";

grant update on table "public"."articles_tags" to "authenticated";

grant delete on table "public"."articles_tags" to "service_role";

grant insert on table "public"."articles_tags" to "service_role";

grant references on table "public"."articles_tags" to "service_role";

grant select on table "public"."articles_tags" to "service_role";

grant trigger on table "public"."articles_tags" to "service_role";

grant truncate on table "public"."articles_tags" to "service_role";

grant update on table "public"."articles_tags" to "service_role";

grant delete on table "public"."categories" to "anon";

grant insert on table "public"."categories" to "anon";

grant references on table "public"."categories" to "anon";

grant select on table "public"."categories" to "anon";

grant trigger on table "public"."categories" to "anon";

grant truncate on table "public"."categories" to "anon";

grant update on table "public"."categories" to "anon";

grant delete on table "public"."categories" to "authenticated";

grant insert on table "public"."categories" to "authenticated";

grant references on table "public"."categories" to "authenticated";

grant select on table "public"."categories" to "authenticated";

grant trigger on table "public"."categories" to "authenticated";

grant truncate on table "public"."categories" to "authenticated";

grant update on table "public"."categories" to "authenticated";

grant delete on table "public"."categories" to "service_role";

grant insert on table "public"."categories" to "service_role";

grant references on table "public"."categories" to "service_role";

grant select on table "public"."categories" to "service_role";

grant trigger on table "public"."categories" to "service_role";

grant truncate on table "public"."categories" to "service_role";

grant update on table "public"."categories" to "service_role";

grant delete on table "public"."communiques_categories" to "anon";

grant insert on table "public"."communiques_categories" to "anon";

grant references on table "public"."communiques_categories" to "anon";

grant select on table "public"."communiques_categories" to "anon";

grant trigger on table "public"."communiques_categories" to "anon";

grant truncate on table "public"."communiques_categories" to "anon";

grant update on table "public"."communiques_categories" to "anon";

grant delete on table "public"."communiques_categories" to "authenticated";

grant insert on table "public"."communiques_categories" to "authenticated";

grant references on table "public"."communiques_categories" to "authenticated";

grant select on table "public"."communiques_categories" to "authenticated";

grant trigger on table "public"."communiques_categories" to "authenticated";

grant truncate on table "public"."communiques_categories" to "authenticated";

grant update on table "public"."communiques_categories" to "authenticated";

grant delete on table "public"."communiques_categories" to "service_role";

grant insert on table "public"."communiques_categories" to "service_role";

grant references on table "public"."communiques_categories" to "service_role";

grant select on table "public"."communiques_categories" to "service_role";

grant trigger on table "public"."communiques_categories" to "service_role";

grant truncate on table "public"."communiques_categories" to "service_role";

grant update on table "public"."communiques_categories" to "service_role";

grant delete on table "public"."communiques_medias" to "anon";

grant insert on table "public"."communiques_medias" to "anon";

grant references on table "public"."communiques_medias" to "anon";

grant select on table "public"."communiques_medias" to "anon";

grant trigger on table "public"."communiques_medias" to "anon";

grant truncate on table "public"."communiques_medias" to "anon";

grant update on table "public"."communiques_medias" to "anon";

grant delete on table "public"."communiques_medias" to "authenticated";

grant insert on table "public"."communiques_medias" to "authenticated";

grant references on table "public"."communiques_medias" to "authenticated";

grant select on table "public"."communiques_medias" to "authenticated";

grant trigger on table "public"."communiques_medias" to "authenticated";

grant truncate on table "public"."communiques_medias" to "authenticated";

grant update on table "public"."communiques_medias" to "authenticated";

grant delete on table "public"."communiques_medias" to "service_role";

grant insert on table "public"."communiques_medias" to "service_role";

grant references on table "public"."communiques_medias" to "service_role";

grant select on table "public"."communiques_medias" to "service_role";

grant trigger on table "public"."communiques_medias" to "service_role";

grant truncate on table "public"."communiques_medias" to "service_role";

grant update on table "public"."communiques_medias" to "service_role";

grant delete on table "public"."communiques_presse" to "anon";

grant insert on table "public"."communiques_presse" to "anon";

grant references on table "public"."communiques_presse" to "anon";

grant select on table "public"."communiques_presse" to "anon";

grant trigger on table "public"."communiques_presse" to "anon";

grant truncate on table "public"."communiques_presse" to "anon";

grant update on table "public"."communiques_presse" to "anon";

grant delete on table "public"."communiques_presse" to "authenticated";

grant insert on table "public"."communiques_presse" to "authenticated";

grant references on table "public"."communiques_presse" to "authenticated";

grant select on table "public"."communiques_presse" to "authenticated";

grant trigger on table "public"."communiques_presse" to "authenticated";

grant truncate on table "public"."communiques_presse" to "authenticated";

grant update on table "public"."communiques_presse" to "authenticated";

grant delete on table "public"."communiques_presse" to "service_role";

grant insert on table "public"."communiques_presse" to "service_role";

grant references on table "public"."communiques_presse" to "service_role";

grant select on table "public"."communiques_presse" to "service_role";

grant trigger on table "public"."communiques_presse" to "service_role";

grant truncate on table "public"."communiques_presse" to "service_role";

grant update on table "public"."communiques_presse" to "service_role";

grant delete on table "public"."communiques_tags" to "anon";

grant insert on table "public"."communiques_tags" to "anon";

grant references on table "public"."communiques_tags" to "anon";

grant select on table "public"."communiques_tags" to "anon";

grant trigger on table "public"."communiques_tags" to "anon";

grant truncate on table "public"."communiques_tags" to "anon";

grant update on table "public"."communiques_tags" to "anon";

grant delete on table "public"."communiques_tags" to "authenticated";

grant insert on table "public"."communiques_tags" to "authenticated";

grant references on table "public"."communiques_tags" to "authenticated";

grant select on table "public"."communiques_tags" to "authenticated";

grant trigger on table "public"."communiques_tags" to "authenticated";

grant truncate on table "public"."communiques_tags" to "authenticated";

grant update on table "public"."communiques_tags" to "authenticated";

grant delete on table "public"."communiques_tags" to "service_role";

grant insert on table "public"."communiques_tags" to "service_role";

grant references on table "public"."communiques_tags" to "service_role";

grant select on table "public"."communiques_tags" to "service_role";

grant trigger on table "public"."communiques_tags" to "service_role";

grant truncate on table "public"."communiques_tags" to "service_role";

grant update on table "public"."communiques_tags" to "service_role";

grant delete on table "public"."compagnie_presentation_sections" to "anon";

grant insert on table "public"."compagnie_presentation_sections" to "anon";

grant references on table "public"."compagnie_presentation_sections" to "anon";

grant select on table "public"."compagnie_presentation_sections" to "anon";

grant trigger on table "public"."compagnie_presentation_sections" to "anon";

grant truncate on table "public"."compagnie_presentation_sections" to "anon";

grant update on table "public"."compagnie_presentation_sections" to "anon";

grant delete on table "public"."compagnie_presentation_sections" to "authenticated";

grant insert on table "public"."compagnie_presentation_sections" to "authenticated";

grant references on table "public"."compagnie_presentation_sections" to "authenticated";

grant select on table "public"."compagnie_presentation_sections" to "authenticated";

grant trigger on table "public"."compagnie_presentation_sections" to "authenticated";

grant truncate on table "public"."compagnie_presentation_sections" to "authenticated";

grant update on table "public"."compagnie_presentation_sections" to "authenticated";

grant delete on table "public"."compagnie_presentation_sections" to "service_role";

grant insert on table "public"."compagnie_presentation_sections" to "service_role";

grant references on table "public"."compagnie_presentation_sections" to "service_role";

grant select on table "public"."compagnie_presentation_sections" to "service_role";

grant trigger on table "public"."compagnie_presentation_sections" to "service_role";

grant truncate on table "public"."compagnie_presentation_sections" to "service_role";

grant update on table "public"."compagnie_presentation_sections" to "service_role";

grant delete on table "public"."compagnie_stats" to "anon";

grant insert on table "public"."compagnie_stats" to "anon";

grant references on table "public"."compagnie_stats" to "anon";

grant select on table "public"."compagnie_stats" to "anon";

grant trigger on table "public"."compagnie_stats" to "anon";

grant truncate on table "public"."compagnie_stats" to "anon";

grant update on table "public"."compagnie_stats" to "anon";

grant delete on table "public"."compagnie_stats" to "authenticated";

grant insert on table "public"."compagnie_stats" to "authenticated";

grant references on table "public"."compagnie_stats" to "authenticated";

grant select on table "public"."compagnie_stats" to "authenticated";

grant trigger on table "public"."compagnie_stats" to "authenticated";

grant truncate on table "public"."compagnie_stats" to "authenticated";

grant update on table "public"."compagnie_stats" to "authenticated";

grant delete on table "public"."compagnie_stats" to "service_role";

grant insert on table "public"."compagnie_stats" to "service_role";

grant references on table "public"."compagnie_stats" to "service_role";

grant select on table "public"."compagnie_stats" to "service_role";

grant trigger on table "public"."compagnie_stats" to "service_role";

grant truncate on table "public"."compagnie_stats" to "service_role";

grant update on table "public"."compagnie_stats" to "service_role";

grant delete on table "public"."compagnie_values" to "anon";

grant insert on table "public"."compagnie_values" to "anon";

grant references on table "public"."compagnie_values" to "anon";

grant select on table "public"."compagnie_values" to "anon";

grant trigger on table "public"."compagnie_values" to "anon";

grant truncate on table "public"."compagnie_values" to "anon";

grant update on table "public"."compagnie_values" to "anon";

grant delete on table "public"."compagnie_values" to "authenticated";

grant insert on table "public"."compagnie_values" to "authenticated";

grant references on table "public"."compagnie_values" to "authenticated";

grant select on table "public"."compagnie_values" to "authenticated";

grant trigger on table "public"."compagnie_values" to "authenticated";

grant truncate on table "public"."compagnie_values" to "authenticated";

grant update on table "public"."compagnie_values" to "authenticated";

grant delete on table "public"."compagnie_values" to "service_role";

grant insert on table "public"."compagnie_values" to "service_role";

grant references on table "public"."compagnie_values" to "service_role";

grant select on table "public"."compagnie_values" to "service_role";

grant trigger on table "public"."compagnie_values" to "service_role";

grant truncate on table "public"."compagnie_values" to "service_role";

grant update on table "public"."compagnie_values" to "service_role";

grant delete on table "public"."configurations_site" to "anon";

grant insert on table "public"."configurations_site" to "anon";

grant references on table "public"."configurations_site" to "anon";

grant select on table "public"."configurations_site" to "anon";

grant trigger on table "public"."configurations_site" to "anon";

grant truncate on table "public"."configurations_site" to "anon";

grant update on table "public"."configurations_site" to "anon";

grant delete on table "public"."configurations_site" to "authenticated";

grant insert on table "public"."configurations_site" to "authenticated";

grant references on table "public"."configurations_site" to "authenticated";

grant select on table "public"."configurations_site" to "authenticated";

grant trigger on table "public"."configurations_site" to "authenticated";

grant truncate on table "public"."configurations_site" to "authenticated";

grant update on table "public"."configurations_site" to "authenticated";

grant delete on table "public"."configurations_site" to "service_role";

grant insert on table "public"."configurations_site" to "service_role";

grant references on table "public"."configurations_site" to "service_role";

grant select on table "public"."configurations_site" to "service_role";

grant trigger on table "public"."configurations_site" to "service_role";

grant truncate on table "public"."configurations_site" to "service_role";

grant update on table "public"."configurations_site" to "service_role";

grant delete on table "public"."contacts_presse" to "anon";

grant insert on table "public"."contacts_presse" to "anon";

grant references on table "public"."contacts_presse" to "anon";

grant select on table "public"."contacts_presse" to "anon";

grant trigger on table "public"."contacts_presse" to "anon";

grant truncate on table "public"."contacts_presse" to "anon";

grant update on table "public"."contacts_presse" to "anon";

grant delete on table "public"."contacts_presse" to "authenticated";

grant insert on table "public"."contacts_presse" to "authenticated";

grant references on table "public"."contacts_presse" to "authenticated";

grant select on table "public"."contacts_presse" to "authenticated";

grant trigger on table "public"."contacts_presse" to "authenticated";

grant truncate on table "public"."contacts_presse" to "authenticated";

grant update on table "public"."contacts_presse" to "authenticated";

grant delete on table "public"."contacts_presse" to "service_role";

grant insert on table "public"."contacts_presse" to "service_role";

grant references on table "public"."contacts_presse" to "service_role";

grant select on table "public"."contacts_presse" to "service_role";

grant trigger on table "public"."contacts_presse" to "service_role";

grant truncate on table "public"."contacts_presse" to "service_role";

grant update on table "public"."contacts_presse" to "service_role";

grant delete on table "public"."content_versions" to "anon";

grant insert on table "public"."content_versions" to "anon";

grant references on table "public"."content_versions" to "anon";

grant select on table "public"."content_versions" to "anon";

grant trigger on table "public"."content_versions" to "anon";

grant truncate on table "public"."content_versions" to "anon";

grant update on table "public"."content_versions" to "anon";

grant delete on table "public"."content_versions" to "authenticated";

grant insert on table "public"."content_versions" to "authenticated";

grant references on table "public"."content_versions" to "authenticated";

grant select on table "public"."content_versions" to "authenticated";

grant trigger on table "public"."content_versions" to "authenticated";

grant truncate on table "public"."content_versions" to "authenticated";

grant update on table "public"."content_versions" to "authenticated";

grant delete on table "public"."content_versions" to "service_role";

grant insert on table "public"."content_versions" to "service_role";

grant references on table "public"."content_versions" to "service_role";

grant select on table "public"."content_versions" to "service_role";

grant trigger on table "public"."content_versions" to "service_role";

grant truncate on table "public"."content_versions" to "service_role";

grant update on table "public"."content_versions" to "service_role";

grant delete on table "public"."evenements" to "anon";

grant insert on table "public"."evenements" to "anon";

grant references on table "public"."evenements" to "anon";

grant select on table "public"."evenements" to "anon";

grant trigger on table "public"."evenements" to "anon";

grant truncate on table "public"."evenements" to "anon";

grant update on table "public"."evenements" to "anon";

grant delete on table "public"."evenements" to "authenticated";

grant insert on table "public"."evenements" to "authenticated";

grant references on table "public"."evenements" to "authenticated";

grant select on table "public"."evenements" to "authenticated";

grant trigger on table "public"."evenements" to "authenticated";

grant truncate on table "public"."evenements" to "authenticated";

grant update on table "public"."evenements" to "authenticated";

grant delete on table "public"."evenements" to "service_role";

grant insert on table "public"."evenements" to "service_role";

grant references on table "public"."evenements" to "service_role";

grant select on table "public"."evenements" to "service_role";

grant trigger on table "public"."evenements" to "service_role";

grant truncate on table "public"."evenements" to "service_role";

grant update on table "public"."evenements" to "service_role";

grant delete on table "public"."home_hero_slides" to "anon";

grant insert on table "public"."home_hero_slides" to "anon";

grant references on table "public"."home_hero_slides" to "anon";

grant select on table "public"."home_hero_slides" to "anon";

grant trigger on table "public"."home_hero_slides" to "anon";

grant truncate on table "public"."home_hero_slides" to "anon";

grant update on table "public"."home_hero_slides" to "anon";

grant delete on table "public"."home_hero_slides" to "authenticated";

grant insert on table "public"."home_hero_slides" to "authenticated";

grant references on table "public"."home_hero_slides" to "authenticated";

grant select on table "public"."home_hero_slides" to "authenticated";

grant trigger on table "public"."home_hero_slides" to "authenticated";

grant truncate on table "public"."home_hero_slides" to "authenticated";

grant update on table "public"."home_hero_slides" to "authenticated";

grant delete on table "public"."home_hero_slides" to "service_role";

grant insert on table "public"."home_hero_slides" to "service_role";

grant references on table "public"."home_hero_slides" to "service_role";

grant select on table "public"."home_hero_slides" to "service_role";

grant trigger on table "public"."home_hero_slides" to "service_role";

grant truncate on table "public"."home_hero_slides" to "service_role";

grant update on table "public"."home_hero_slides" to "service_role";

grant delete on table "public"."lieux" to "anon";

grant insert on table "public"."lieux" to "anon";

grant references on table "public"."lieux" to "anon";

grant select on table "public"."lieux" to "anon";

grant trigger on table "public"."lieux" to "anon";

grant truncate on table "public"."lieux" to "anon";

grant update on table "public"."lieux" to "anon";

grant delete on table "public"."lieux" to "authenticated";

grant insert on table "public"."lieux" to "authenticated";

grant references on table "public"."lieux" to "authenticated";

grant select on table "public"."lieux" to "authenticated";

grant trigger on table "public"."lieux" to "authenticated";

grant truncate on table "public"."lieux" to "authenticated";

grant update on table "public"."lieux" to "authenticated";

grant delete on table "public"."lieux" to "service_role";

grant insert on table "public"."lieux" to "service_role";

grant references on table "public"."lieux" to "service_role";

grant select on table "public"."lieux" to "service_role";

grant trigger on table "public"."lieux" to "service_role";

grant truncate on table "public"."lieux" to "service_role";

grant update on table "public"."lieux" to "service_role";

grant delete on table "public"."logs_audit" to "anon";

grant insert on table "public"."logs_audit" to "anon";

grant references on table "public"."logs_audit" to "anon";

grant select on table "public"."logs_audit" to "anon";

grant trigger on table "public"."logs_audit" to "anon";

grant truncate on table "public"."logs_audit" to "anon";

grant update on table "public"."logs_audit" to "anon";

grant delete on table "public"."logs_audit" to "authenticated";

grant insert on table "public"."logs_audit" to "authenticated";

grant references on table "public"."logs_audit" to "authenticated";

grant select on table "public"."logs_audit" to "authenticated";

grant trigger on table "public"."logs_audit" to "authenticated";

grant truncate on table "public"."logs_audit" to "authenticated";

grant update on table "public"."logs_audit" to "authenticated";

grant delete on table "public"."logs_audit" to "service_role";

grant insert on table "public"."logs_audit" to "service_role";

grant references on table "public"."logs_audit" to "service_role";

grant select on table "public"."logs_audit" to "service_role";

grant trigger on table "public"."logs_audit" to "service_role";

grant truncate on table "public"."logs_audit" to "service_role";

grant update on table "public"."logs_audit" to "service_role";

grant delete on table "public"."medias" to "anon";

grant insert on table "public"."medias" to "anon";

grant references on table "public"."medias" to "anon";

grant select on table "public"."medias" to "anon";

grant trigger on table "public"."medias" to "anon";

grant truncate on table "public"."medias" to "anon";

grant update on table "public"."medias" to "anon";

grant delete on table "public"."medias" to "authenticated";

grant insert on table "public"."medias" to "authenticated";

grant references on table "public"."medias" to "authenticated";

grant select on table "public"."medias" to "authenticated";

grant trigger on table "public"."medias" to "authenticated";

grant truncate on table "public"."medias" to "authenticated";

grant update on table "public"."medias" to "authenticated";

grant delete on table "public"."medias" to "service_role";

grant insert on table "public"."medias" to "service_role";

grant references on table "public"."medias" to "service_role";

grant select on table "public"."medias" to "service_role";

grant trigger on table "public"."medias" to "service_role";

grant truncate on table "public"."medias" to "service_role";

grant update on table "public"."medias" to "service_role";

grant delete on table "public"."membres_equipe" to "anon";

grant insert on table "public"."membres_equipe" to "anon";

grant references on table "public"."membres_equipe" to "anon";

grant select on table "public"."membres_equipe" to "anon";

grant trigger on table "public"."membres_equipe" to "anon";

grant truncate on table "public"."membres_equipe" to "anon";

grant update on table "public"."membres_equipe" to "anon";

grant delete on table "public"."membres_equipe" to "authenticated";

grant insert on table "public"."membres_equipe" to "authenticated";

grant references on table "public"."membres_equipe" to "authenticated";

grant select on table "public"."membres_equipe" to "authenticated";

grant trigger on table "public"."membres_equipe" to "authenticated";

grant truncate on table "public"."membres_equipe" to "authenticated";

grant update on table "public"."membres_equipe" to "authenticated";

grant delete on table "public"."membres_equipe" to "service_role";

grant insert on table "public"."membres_equipe" to "service_role";

grant references on table "public"."membres_equipe" to "service_role";

grant select on table "public"."membres_equipe" to "service_role";

grant trigger on table "public"."membres_equipe" to "service_role";

grant truncate on table "public"."membres_equipe" to "service_role";

grant update on table "public"."membres_equipe" to "service_role";

grant delete on table "public"."messages_contact" to "anon";

grant insert on table "public"."messages_contact" to "anon";

grant references on table "public"."messages_contact" to "anon";

grant select on table "public"."messages_contact" to "anon";

grant trigger on table "public"."messages_contact" to "anon";

grant truncate on table "public"."messages_contact" to "anon";

grant update on table "public"."messages_contact" to "anon";

grant delete on table "public"."messages_contact" to "authenticated";

grant insert on table "public"."messages_contact" to "authenticated";

grant references on table "public"."messages_contact" to "authenticated";

grant select on table "public"."messages_contact" to "authenticated";

grant trigger on table "public"."messages_contact" to "authenticated";

grant truncate on table "public"."messages_contact" to "authenticated";

grant update on table "public"."messages_contact" to "authenticated";

grant delete on table "public"."messages_contact" to "service_role";

grant insert on table "public"."messages_contact" to "service_role";

grant references on table "public"."messages_contact" to "service_role";

grant select on table "public"."messages_contact" to "service_role";

grant trigger on table "public"."messages_contact" to "service_role";

grant truncate on table "public"."messages_contact" to "service_role";

grant update on table "public"."messages_contact" to "service_role";

grant delete on table "public"."partners" to "anon";

grant insert on table "public"."partners" to "anon";

grant references on table "public"."partners" to "anon";

grant select on table "public"."partners" to "anon";

grant trigger on table "public"."partners" to "anon";

grant truncate on table "public"."partners" to "anon";

grant update on table "public"."partners" to "anon";

grant delete on table "public"."partners" to "authenticated";

grant insert on table "public"."partners" to "authenticated";

grant references on table "public"."partners" to "authenticated";

grant select on table "public"."partners" to "authenticated";

grant trigger on table "public"."partners" to "authenticated";

grant truncate on table "public"."partners" to "authenticated";

grant update on table "public"."partners" to "authenticated";

grant delete on table "public"."partners" to "service_role";

grant insert on table "public"."partners" to "service_role";

grant references on table "public"."partners" to "service_role";

grant select on table "public"."partners" to "service_role";

grant trigger on table "public"."partners" to "service_role";

grant truncate on table "public"."partners" to "service_role";

grant update on table "public"."partners" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."seo_redirects" to "anon";

grant insert on table "public"."seo_redirects" to "anon";

grant references on table "public"."seo_redirects" to "anon";

grant select on table "public"."seo_redirects" to "anon";

grant trigger on table "public"."seo_redirects" to "anon";

grant truncate on table "public"."seo_redirects" to "anon";

grant update on table "public"."seo_redirects" to "anon";

grant delete on table "public"."seo_redirects" to "authenticated";

grant insert on table "public"."seo_redirects" to "authenticated";

grant references on table "public"."seo_redirects" to "authenticated";

grant select on table "public"."seo_redirects" to "authenticated";

grant trigger on table "public"."seo_redirects" to "authenticated";

grant truncate on table "public"."seo_redirects" to "authenticated";

grant update on table "public"."seo_redirects" to "authenticated";

grant delete on table "public"."seo_redirects" to "service_role";

grant insert on table "public"."seo_redirects" to "service_role";

grant references on table "public"."seo_redirects" to "service_role";

grant select on table "public"."seo_redirects" to "service_role";

grant trigger on table "public"."seo_redirects" to "service_role";

grant truncate on table "public"."seo_redirects" to "service_role";

grant update on table "public"."seo_redirects" to "service_role";

grant delete on table "public"."sitemap_entries" to "anon";

grant insert on table "public"."sitemap_entries" to "anon";

grant references on table "public"."sitemap_entries" to "anon";

grant select on table "public"."sitemap_entries" to "anon";

grant trigger on table "public"."sitemap_entries" to "anon";

grant truncate on table "public"."sitemap_entries" to "anon";

grant update on table "public"."sitemap_entries" to "anon";

grant delete on table "public"."sitemap_entries" to "authenticated";

grant insert on table "public"."sitemap_entries" to "authenticated";

grant references on table "public"."sitemap_entries" to "authenticated";

grant select on table "public"."sitemap_entries" to "authenticated";

grant trigger on table "public"."sitemap_entries" to "authenticated";

grant truncate on table "public"."sitemap_entries" to "authenticated";

grant update on table "public"."sitemap_entries" to "authenticated";

grant delete on table "public"."sitemap_entries" to "service_role";

grant insert on table "public"."sitemap_entries" to "service_role";

grant references on table "public"."sitemap_entries" to "service_role";

grant select on table "public"."sitemap_entries" to "service_role";

grant trigger on table "public"."sitemap_entries" to "service_role";

grant truncate on table "public"."sitemap_entries" to "service_role";

grant update on table "public"."sitemap_entries" to "service_role";

grant delete on table "public"."spectacles" to "anon";

grant insert on table "public"."spectacles" to "anon";

grant references on table "public"."spectacles" to "anon";

grant select on table "public"."spectacles" to "anon";

grant trigger on table "public"."spectacles" to "anon";

grant truncate on table "public"."spectacles" to "anon";

grant update on table "public"."spectacles" to "anon";

grant delete on table "public"."spectacles" to "authenticated";

grant insert on table "public"."spectacles" to "authenticated";

grant references on table "public"."spectacles" to "authenticated";

grant select on table "public"."spectacles" to "authenticated";

grant trigger on table "public"."spectacles" to "authenticated";

grant truncate on table "public"."spectacles" to "authenticated";

grant update on table "public"."spectacles" to "authenticated";

grant delete on table "public"."spectacles" to "service_role";

grant insert on table "public"."spectacles" to "service_role";

grant references on table "public"."spectacles" to "service_role";

grant select on table "public"."spectacles" to "service_role";

grant trigger on table "public"."spectacles" to "service_role";

grant truncate on table "public"."spectacles" to "service_role";

grant update on table "public"."spectacles" to "service_role";

grant delete on table "public"."spectacles_categories" to "anon";

grant insert on table "public"."spectacles_categories" to "anon";

grant references on table "public"."spectacles_categories" to "anon";

grant select on table "public"."spectacles_categories" to "anon";

grant trigger on table "public"."spectacles_categories" to "anon";

grant truncate on table "public"."spectacles_categories" to "anon";

grant update on table "public"."spectacles_categories" to "anon";

grant delete on table "public"."spectacles_categories" to "authenticated";

grant insert on table "public"."spectacles_categories" to "authenticated";

grant references on table "public"."spectacles_categories" to "authenticated";

grant select on table "public"."spectacles_categories" to "authenticated";

grant trigger on table "public"."spectacles_categories" to "authenticated";

grant truncate on table "public"."spectacles_categories" to "authenticated";

grant update on table "public"."spectacles_categories" to "authenticated";

grant delete on table "public"."spectacles_categories" to "service_role";

grant insert on table "public"."spectacles_categories" to "service_role";

grant references on table "public"."spectacles_categories" to "service_role";

grant select on table "public"."spectacles_categories" to "service_role";

grant trigger on table "public"."spectacles_categories" to "service_role";

grant truncate on table "public"."spectacles_categories" to "service_role";

grant update on table "public"."spectacles_categories" to "service_role";

grant delete on table "public"."spectacles_medias" to "anon";

grant insert on table "public"."spectacles_medias" to "anon";

grant references on table "public"."spectacles_medias" to "anon";

grant select on table "public"."spectacles_medias" to "anon";

grant trigger on table "public"."spectacles_medias" to "anon";

grant truncate on table "public"."spectacles_medias" to "anon";

grant update on table "public"."spectacles_medias" to "anon";

grant delete on table "public"."spectacles_medias" to "authenticated";

grant insert on table "public"."spectacles_medias" to "authenticated";

grant references on table "public"."spectacles_medias" to "authenticated";

grant select on table "public"."spectacles_medias" to "authenticated";

grant trigger on table "public"."spectacles_medias" to "authenticated";

grant truncate on table "public"."spectacles_medias" to "authenticated";

grant update on table "public"."spectacles_medias" to "authenticated";

grant delete on table "public"."spectacles_medias" to "service_role";

grant insert on table "public"."spectacles_medias" to "service_role";

grant references on table "public"."spectacles_medias" to "service_role";

grant select on table "public"."spectacles_medias" to "service_role";

grant trigger on table "public"."spectacles_medias" to "service_role";

grant truncate on table "public"."spectacles_medias" to "service_role";

grant update on table "public"."spectacles_medias" to "service_role";

grant delete on table "public"."spectacles_membres_equipe" to "anon";

grant insert on table "public"."spectacles_membres_equipe" to "anon";

grant references on table "public"."spectacles_membres_equipe" to "anon";

grant select on table "public"."spectacles_membres_equipe" to "anon";

grant trigger on table "public"."spectacles_membres_equipe" to "anon";

grant truncate on table "public"."spectacles_membres_equipe" to "anon";

grant update on table "public"."spectacles_membres_equipe" to "anon";

grant delete on table "public"."spectacles_membres_equipe" to "authenticated";

grant insert on table "public"."spectacles_membres_equipe" to "authenticated";

grant references on table "public"."spectacles_membres_equipe" to "authenticated";

grant select on table "public"."spectacles_membres_equipe" to "authenticated";

grant trigger on table "public"."spectacles_membres_equipe" to "authenticated";

grant truncate on table "public"."spectacles_membres_equipe" to "authenticated";

grant update on table "public"."spectacles_membres_equipe" to "authenticated";

grant delete on table "public"."spectacles_membres_equipe" to "service_role";

grant insert on table "public"."spectacles_membres_equipe" to "service_role";

grant references on table "public"."spectacles_membres_equipe" to "service_role";

grant select on table "public"."spectacles_membres_equipe" to "service_role";

grant trigger on table "public"."spectacles_membres_equipe" to "service_role";

grant truncate on table "public"."spectacles_membres_equipe" to "service_role";

grant update on table "public"."spectacles_membres_equipe" to "service_role";

grant delete on table "public"."spectacles_tags" to "anon";

grant insert on table "public"."spectacles_tags" to "anon";

grant references on table "public"."spectacles_tags" to "anon";

grant select on table "public"."spectacles_tags" to "anon";

grant trigger on table "public"."spectacles_tags" to "anon";

grant truncate on table "public"."spectacles_tags" to "anon";

grant update on table "public"."spectacles_tags" to "anon";

grant delete on table "public"."spectacles_tags" to "authenticated";

grant insert on table "public"."spectacles_tags" to "authenticated";

grant references on table "public"."spectacles_tags" to "authenticated";

grant select on table "public"."spectacles_tags" to "authenticated";

grant trigger on table "public"."spectacles_tags" to "authenticated";

grant truncate on table "public"."spectacles_tags" to "authenticated";

grant update on table "public"."spectacles_tags" to "authenticated";

grant delete on table "public"."spectacles_tags" to "service_role";

grant insert on table "public"."spectacles_tags" to "service_role";

grant references on table "public"."spectacles_tags" to "service_role";

grant select on table "public"."spectacles_tags" to "service_role";

grant trigger on table "public"."spectacles_tags" to "service_role";

grant truncate on table "public"."spectacles_tags" to "service_role";

grant update on table "public"."spectacles_tags" to "service_role";

grant delete on table "public"."tags" to "anon";

grant insert on table "public"."tags" to "anon";

grant references on table "public"."tags" to "anon";

grant select on table "public"."tags" to "anon";

grant trigger on table "public"."tags" to "anon";

grant truncate on table "public"."tags" to "anon";

grant update on table "public"."tags" to "anon";

grant delete on table "public"."tags" to "authenticated";

grant insert on table "public"."tags" to "authenticated";

grant references on table "public"."tags" to "authenticated";

grant select on table "public"."tags" to "authenticated";

grant trigger on table "public"."tags" to "authenticated";

grant truncate on table "public"."tags" to "authenticated";

grant update on table "public"."tags" to "authenticated";

grant delete on table "public"."tags" to "service_role";

grant insert on table "public"."tags" to "service_role";

grant references on table "public"."tags" to "service_role";

grant select on table "public"."tags" to "service_role";

grant trigger on table "public"."tags" to "service_role";

grant truncate on table "public"."tags" to "service_role";

grant update on table "public"."tags" to "service_role";

create policy "Admins can update newsletter subscriptions"
on "public"."abonnes_newsletter"
as permissive
for update
to authenticated
using (( SELECT is_admin() AS is_admin))
with check (( SELECT is_admin() AS is_admin));


create policy "Admins can view newsletter subscribers"
on "public"."abonnes_newsletter"
as permissive
for select
to authenticated
using (( SELECT is_admin() AS is_admin));


create policy "Anyone can subscribe to newsletter"
on "public"."abonnes_newsletter"
as permissive
for insert
to anon, authenticated
with check (true);


create policy "Subscribers can unsubscribe or admins can delete"
on "public"."abonnes_newsletter"
as permissive
for delete
to anon, authenticated
using (( SELECT is_admin() AS is_admin));


create policy "Admins can delete analytics events"
on "public"."analytics_events"
as permissive
for delete
to authenticated
using (( SELECT ( SELECT is_admin() AS is_admin) AS is_admin));


create policy "Admins can update analytics events"
on "public"."analytics_events"
as permissive
for update
to authenticated
using (( SELECT ( SELECT is_admin() AS is_admin) AS is_admin))
with check (( SELECT ( SELECT is_admin() AS is_admin) AS is_admin));


create policy "Admins can view analytics events"
on "public"."analytics_events"
as permissive
for select
to authenticated
using (( SELECT ( SELECT is_admin() AS is_admin) AS is_admin));


create policy "Anyone can insert analytics events"
on "public"."analytics_events"
as permissive
for insert
to anon, authenticated
with check (true);


create policy "Admins can manage article categories"
on "public"."articles_categories"
as permissive
for all
to authenticated
using (( SELECT is_admin() AS is_admin))
with check (( SELECT is_admin() AS is_admin));


create policy "Article category relations are viewable by everyone"
on "public"."articles_categories"
as permissive
for select
to anon, authenticated
using (true);


create policy "Admins can manage article media relations"
on "public"."articles_medias"
as permissive
for all
to authenticated
using (( SELECT is_admin() AS is_admin))
with check (( SELECT is_admin() AS is_admin));


create policy "Article media relations are viewable by everyone"
on "public"."articles_medias"
as permissive
for select
to anon, authenticated
using (true);


create policy "Admins can manage article tags"
on "public"."articles_tags"
as permissive
for all
to authenticated
using (( SELECT is_admin() AS is_admin))
with check (( SELECT is_admin() AS is_admin));


create policy "Article tag relations are viewable by everyone"
on "public"."articles_tags"
as permissive
for select
to anon, authenticated
using (true);


create policy "Active categories are viewable by everyone"
on "public"."categories"
as permissive
for select
to anon, authenticated
using ((is_active = true));


create policy "Admins can create categories"
on "public"."categories"
as permissive
for insert
to authenticated
with check (( SELECT ( SELECT is_admin() AS is_admin) AS is_admin));


create policy "Admins can delete categories"
on "public"."categories"
as permissive
for delete
to authenticated
using (( SELECT ( SELECT is_admin() AS is_admin) AS is_admin));


create policy "Admins can update categories"
on "public"."categories"
as permissive
for update
to authenticated
using (( SELECT ( SELECT is_admin() AS is_admin) AS is_admin))
with check (( SELECT ( SELECT is_admin() AS is_admin) AS is_admin));


create policy "Admins can view all categories"
on "public"."categories"
as permissive
for select
to authenticated
using (( SELECT ( SELECT is_admin() AS is_admin) AS is_admin));


create policy "Admins can manage press release categories"
on "public"."communiques_categories"
as permissive
for all
to authenticated
using (( SELECT is_admin() AS is_admin))
with check (( SELECT is_admin() AS is_admin));


create policy "Press release categories follow parent visibility"
on "public"."communiques_categories"
as permissive
for select
to anon, authenticated
using ((EXISTS ( SELECT 1
   FROM communiques_presse cp
  WHERE ((cp.id = communiques_categories.communique_id) AND ((cp.public = true) OR ( SELECT is_admin() AS is_admin))))));


create policy "Admins can manage press release media relations"
on "public"."communiques_medias"
as permissive
for all
to authenticated
using (( SELECT is_admin() AS is_admin))
with check (( SELECT is_admin() AS is_admin));


create policy "Press release media relations follow parent visibility"
on "public"."communiques_medias"
as permissive
for select
to anon, authenticated
using ((EXISTS ( SELECT 1
   FROM communiques_presse cp
  WHERE ((cp.id = communiques_medias.communique_id) AND ((cp.public = true) OR ( SELECT is_admin() AS is_admin))))));


create policy "Admins can create press releases"
on "public"."communiques_presse"
as permissive
for insert
to authenticated
with check (( SELECT is_admin() AS is_admin));


create policy "Admins can delete press releases"
on "public"."communiques_presse"
as permissive
for delete
to authenticated
using (( SELECT is_admin() AS is_admin));


create policy "Admins can update press releases"
on "public"."communiques_presse"
as permissive
for update
to authenticated
using (( SELECT is_admin() AS is_admin))
with check (( SELECT is_admin() AS is_admin));


create policy "Admins can view all press releases"
on "public"."communiques_presse"
as permissive
for select
to authenticated
using (( SELECT is_admin() AS is_admin));


create policy "Public press releases are viewable by everyone"
on "public"."communiques_presse"
as permissive
for select
to anon, authenticated
using ((public = true));


create policy "Admins can manage press release tags"
on "public"."communiques_tags"
as permissive
for all
to authenticated
using (( SELECT is_admin() AS is_admin))
with check (( SELECT is_admin() AS is_admin));


create policy "Press release tags follow parent visibility"
on "public"."communiques_tags"
as permissive
for select
to anon, authenticated
using ((EXISTS ( SELECT 1
   FROM communiques_presse cp
  WHERE ((cp.id = communiques_tags.communique_id) AND ((cp.public = true) OR ( SELECT is_admin() AS is_admin))))));


create policy "Admins can manage compagnie presentation sections"
on "public"."compagnie_presentation_sections"
as permissive
for all
to authenticated
using (( SELECT is_admin() AS is_admin))
with check (( SELECT is_admin() AS is_admin));


create policy "Compagnie presentation sections are viewable by everyone"
on "public"."compagnie_presentation_sections"
as permissive
for select
to anon, authenticated
using (true);


create policy "Admins can manage compagnie stats"
on "public"."compagnie_stats"
as permissive
for all
to authenticated
using (( SELECT is_admin() AS is_admin))
with check (( SELECT is_admin() AS is_admin));


create policy "Compagnie stats are viewable by everyone"
on "public"."compagnie_stats"
as permissive
for select
to anon, authenticated
using (true);


create policy "Admins can manage compagnie values"
on "public"."compagnie_values"
as permissive
for all
to authenticated
using (( SELECT is_admin() AS is_admin))
with check (( SELECT is_admin() AS is_admin));


create policy "Compagnie values are viewable by everyone"
on "public"."compagnie_values"
as permissive
for select
to anon, authenticated
using (true);


create policy "Admins can create site configurations"
on "public"."configurations_site"
as permissive
for insert
to authenticated
with check (( SELECT is_admin() AS is_admin));


create policy "Admins can delete site configurations"
on "public"."configurations_site"
as permissive
for delete
to authenticated
using (( SELECT is_admin() AS is_admin));


create policy "Admins can update site configurations"
on "public"."configurations_site"
as permissive
for update
to authenticated
using (( SELECT is_admin() AS is_admin))
with check (( SELECT is_admin() AS is_admin));


create policy "Public site configurations are viewable by everyone"
on "public"."configurations_site"
as permissive
for select
to anon, authenticated
using (((key ~~ 'public:%'::text) OR ( SELECT is_admin() AS is_admin)));


create policy "Admins can manage press contacts"
on "public"."contacts_presse"
as permissive
for all
to authenticated
using (( SELECT is_admin() AS is_admin))
with check (( SELECT is_admin() AS is_admin));


create policy "Admins can view press contacts"
on "public"."contacts_presse"
as permissive
for select
to authenticated
using (( SELECT is_admin() AS is_admin));


create policy "Admins can delete content versions"
on "public"."content_versions"
as permissive
for delete
to authenticated
using (( SELECT is_admin() AS is_admin));


create policy "Admins can manage content versions"
on "public"."content_versions"
as permissive
for update
to authenticated
using (( SELECT is_admin() AS is_admin))
with check (( SELECT is_admin() AS is_admin));


create policy "Admins can view content versions"
on "public"."content_versions"
as permissive
for select
to authenticated
using (( SELECT is_admin() AS is_admin));


create policy "Authenticated users can create content versions"
on "public"."content_versions"
as permissive
for insert
to authenticated
with check ((( SELECT auth.uid() AS uid) IS NOT NULL));


create policy "Admins can create events"
on "public"."evenements"
as permissive
for insert
to authenticated
with check (( SELECT is_admin() AS is_admin));


create policy "Admins can delete events"
on "public"."evenements"
as permissive
for delete
to authenticated
using (( SELECT is_admin() AS is_admin));


create policy "Admins can update events"
on "public"."evenements"
as permissive
for update
to authenticated
using (( SELECT is_admin() AS is_admin))
with check (( SELECT is_admin() AS is_admin));


create policy "Events are viewable by everyone"
on "public"."evenements"
as permissive
for select
to anon, authenticated
using (true);


create policy "Admins can manage home hero slides"
on "public"."home_hero_slides"
as permissive
for all
to authenticated
using (( SELECT is_admin() AS is_admin))
with check (( SELECT is_admin() AS is_admin));


create policy "Home hero slides are viewable by everyone"
on "public"."home_hero_slides"
as permissive
for select
to anon, authenticated
using (((active = true) AND ((starts_at IS NULL) OR (starts_at <= now())) AND ((ends_at IS NULL) OR (ends_at >= now()))));


create policy "Admins can create lieux"
on "public"."lieux"
as permissive
for insert
to authenticated
with check (( SELECT is_admin() AS is_admin));


create policy "Admins can delete lieux"
on "public"."lieux"
as permissive
for delete
to authenticated
using (( SELECT is_admin() AS is_admin));


create policy "Admins can update lieux"
on "public"."lieux"
as permissive
for update
to authenticated
using (( SELECT is_admin() AS is_admin))
with check (( SELECT is_admin() AS is_admin));


create policy "Lieux are viewable by everyone"
on "public"."lieux"
as permissive
for select
to anon, authenticated
using (true);


create policy "Admins can view audit logs"
on "public"."logs_audit"
as permissive
for select
to authenticated
using (( SELECT is_admin() AS is_admin));


create policy "Super admins can delete audit logs"
on "public"."logs_audit"
as permissive
for delete
to authenticated
using ((( SELECT is_admin() AS is_admin) AND (EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.user_id = ( SELECT auth.uid() AS uid)) AND (p.role = 'super_admin'::text))))));


create policy "Super admins can update audit logs"
on "public"."logs_audit"
as permissive
for update
to authenticated
using ((( SELECT is_admin() AS is_admin) AND (EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.user_id = ( SELECT auth.uid() AS uid)) AND (p.role = 'super_admin'::text))))))
with check ((( SELECT is_admin() AS is_admin) AND (EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.user_id = ( SELECT auth.uid() AS uid)) AND (p.role = 'super_admin'::text))))));


create policy "System can insert audit logs"
on "public"."logs_audit"
as permissive
for insert
to anon, authenticated
with check (true);


create policy "Authenticated users can insert medias"
on "public"."medias"
as permissive
for insert
to authenticated
with check ((( SELECT auth.uid() AS uid) IS NOT NULL));


create policy "Medias are viewable by everyone"
on "public"."medias"
as permissive
for select
to anon, authenticated
using (true);


create policy "Uploaders or admins can delete medias"
on "public"."medias"
as permissive
for delete
to authenticated
using (((uploaded_by = ( SELECT auth.uid() AS uid)) OR ( SELECT is_admin() AS is_admin)));


create policy "Uploaders or admins can update medias"
on "public"."medias"
as permissive
for update
to authenticated
using (((uploaded_by = ( SELECT auth.uid() AS uid)) OR ( SELECT is_admin() AS is_admin)))
with check (((uploaded_by = ( SELECT auth.uid() AS uid)) OR ( SELECT is_admin() AS is_admin)));


create policy "Admins can create membres equipe"
on "public"."membres_equipe"
as permissive
for insert
to authenticated
with check (( SELECT is_admin() AS is_admin));


create policy "Admins can delete membres equipe"
on "public"."membres_equipe"
as permissive
for delete
to authenticated
using (( SELECT is_admin() AS is_admin));


create policy "Admins can update membres equipe"
on "public"."membres_equipe"
as permissive
for update
to authenticated
using (( SELECT is_admin() AS is_admin))
with check (( SELECT is_admin() AS is_admin));


create policy "Membres equipe are viewable by everyone"
on "public"."membres_equipe"
as permissive
for select
to anon, authenticated
using (true);


create policy "Admins can delete contact messages"
on "public"."messages_contact"
as permissive
for delete
to authenticated
using (( SELECT is_admin() AS is_admin));


create policy "Admins can update contact messages"
on "public"."messages_contact"
as permissive
for update
to authenticated
using (( SELECT is_admin() AS is_admin))
with check (( SELECT is_admin() AS is_admin));


create policy "Admins can view contact messages"
on "public"."messages_contact"
as permissive
for select
to authenticated
using (( SELECT is_admin() AS is_admin));


create policy "Anyone can send contact messages"
on "public"."messages_contact"
as permissive
for insert
to anon, authenticated
with check (true);


create policy "Admins can create partners"
on "public"."partners"
as permissive
for insert
to authenticated
with check (( SELECT is_admin() AS is_admin));


create policy "Admins can delete partners"
on "public"."partners"
as permissive
for delete
to authenticated
using (( SELECT is_admin() AS is_admin));


create policy "Admins can update partners"
on "public"."partners"
as permissive
for update
to authenticated
using (( SELECT is_admin() AS is_admin))
with check (( SELECT is_admin() AS is_admin));


create policy "Admins can view all partners"
on "public"."partners"
as permissive
for select
to authenticated
using (( SELECT is_admin() AS is_admin));


create policy "Public partners are viewable by anyone"
on "public"."partners"
as permissive
for select
to authenticated, anon
using ((is_active = true));


create policy "Profiles are viewable by everyone"
on "public"."profiles"
as permissive
for select
to anon, authenticated
using (true);


create policy "Users can delete their own profile"
on "public"."profiles"
as permissive
for delete
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Users can insert their own profile"
on "public"."profiles"
as permissive
for insert
to authenticated
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "Users can update their own profile"
on "public"."profiles"
as permissive
for update
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "Admins can manage SEO redirects"
on "public"."seo_redirects"
as permissive
for all
to authenticated
using (( SELECT is_admin() AS is_admin))
with check (( SELECT is_admin() AS is_admin));


create policy "Admins can view SEO redirects"
on "public"."seo_redirects"
as permissive
for select
to authenticated
using (( SELECT is_admin() AS is_admin));


create policy "Admins can manage sitemap entries"
on "public"."sitemap_entries"
as permissive
for all
to authenticated
using (( SELECT is_admin() AS is_admin))
with check (( SELECT is_admin() AS is_admin));


create policy "Sitemap entries are viewable by everyone"
on "public"."sitemap_entries"
as permissive
for select
to anon, authenticated
using ((is_indexed = true));


create policy "Authenticated users can create spectacles"
on "public"."spectacles"
as permissive
for insert
to authenticated
with check ((( SELECT auth.uid() AS uid) IS NOT NULL));


create policy "Owners or admins can delete spectacles"
on "public"."spectacles"
as permissive
for delete
to authenticated
using (((created_by = ( SELECT auth.uid() AS uid)) OR ( SELECT is_admin() AS is_admin)));


create policy "Owners or admins can update spectacles"
on "public"."spectacles"
as permissive
for update
to authenticated
using (((created_by = ( SELECT auth.uid() AS uid)) OR ( SELECT is_admin() AS is_admin)))
with check (((created_by = ( SELECT auth.uid() AS uid)) OR ( SELECT is_admin() AS is_admin)));


create policy "Public spectacles are viewable by everyone"
on "public"."spectacles"
as permissive
for select
to anon, authenticated
using ((public = true));


create policy "Admins can manage spectacle categories"
on "public"."spectacles_categories"
as permissive
for all
to authenticated
using (( SELECT is_admin() AS is_admin))
with check (( SELECT is_admin() AS is_admin));


create policy "Spectacle category relations are viewable by everyone"
on "public"."spectacles_categories"
as permissive
for select
to anon, authenticated
using (true);


create policy "Admins can manage spectacle media relations"
on "public"."spectacles_medias"
as permissive
for all
to authenticated
using (( SELECT is_admin() AS is_admin))
with check (( SELECT is_admin() AS is_admin));


create policy "Spectacle media relations are viewable by everyone"
on "public"."spectacles_medias"
as permissive
for select
to anon, authenticated
using (true);


create policy "Admins can manage spectacle member relations"
on "public"."spectacles_membres_equipe"
as permissive
for all
to authenticated
using (( SELECT is_admin() AS is_admin))
with check (( SELECT is_admin() AS is_admin));


create policy "Spectacle member relations are viewable by everyone"
on "public"."spectacles_membres_equipe"
as permissive
for select
to anon, authenticated
using (true);


create policy "Admins can manage spectacle tags"
on "public"."spectacles_tags"
as permissive
for all
to authenticated
using (( SELECT is_admin() AS is_admin))
with check (( SELECT is_admin() AS is_admin));


create policy "Spectacle tag relations are viewable by everyone"
on "public"."spectacles_tags"
as permissive
for select
to anon, authenticated
using (true);


create policy "Admins can create tags"
on "public"."tags"
as permissive
for insert
to authenticated
with check (( SELECT is_admin() AS is_admin));


create policy "Admins can delete tags"
on "public"."tags"
as permissive
for delete
to authenticated
using (( SELECT is_admin() AS is_admin));


create policy "Admins can update tags"
on "public"."tags"
as permissive
for update
to authenticated
using (( SELECT is_admin() AS is_admin))
with check (( SELECT is_admin() AS is_admin));


create policy "Tags are viewable by everyone"
on "public"."tags"
as permissive
for select
to anon, authenticated
using (true);


CREATE TRIGGER trg_audit AFTER INSERT OR DELETE OR UPDATE ON public.abonnes_newsletter FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER trg_update_updated_at BEFORE UPDATE ON public.abonnes_newsletter FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_articles_slug BEFORE INSERT OR UPDATE ON public.articles_presse FOR EACH ROW EXECUTE FUNCTION set_slug_if_empty();

CREATE TRIGGER trg_articles_versioning AFTER INSERT OR UPDATE ON public.articles_presse FOR EACH ROW EXECUTE FUNCTION articles_versioning_trigger();

CREATE TRIGGER trg_audit AFTER INSERT OR DELETE OR UPDATE ON public.articles_presse FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER trg_update_updated_at BEFORE UPDATE ON public.articles_presse FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_articles_tags_usage_count AFTER INSERT OR DELETE ON public.articles_tags FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

CREATE TRIGGER trg_categories_slug BEFORE INSERT OR UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION set_slug_if_empty();

CREATE TRIGGER trg_check_communique_pdf BEFORE INSERT OR DELETE OR UPDATE ON public.communiques_medias FOR EACH ROW EXECUTE FUNCTION check_communique_has_pdf();

CREATE TRIGGER trg_audit AFTER INSERT OR DELETE OR UPDATE ON public.communiques_presse FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER trg_communiques_slug BEFORE INSERT OR UPDATE ON public.communiques_presse FOR EACH ROW EXECUTE FUNCTION set_slug_if_empty();

CREATE TRIGGER trg_communiques_versioning AFTER INSERT OR UPDATE ON public.communiques_presse FOR EACH ROW EXECUTE FUNCTION communiques_versioning_trigger();

CREATE TRIGGER trg_update_updated_at BEFORE UPDATE ON public.communiques_presse FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_communiques_tags_usage_count AFTER INSERT OR DELETE ON public.communiques_tags FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

CREATE TRIGGER trg_compagnie_presentation_sections_versioning AFTER INSERT OR UPDATE ON public.compagnie_presentation_sections FOR EACH ROW EXECUTE FUNCTION compagnie_presentation_sections_versioning_trigger();

CREATE TRIGGER trg_compagnie_stats_versioning AFTER INSERT OR UPDATE ON public.compagnie_stats FOR EACH ROW EXECUTE FUNCTION compagnie_stats_versioning_trigger();

CREATE TRIGGER trg_compagnie_values_versioning AFTER INSERT OR UPDATE ON public.compagnie_values FOR EACH ROW EXECUTE FUNCTION compagnie_values_versioning_trigger();

CREATE TRIGGER trg_audit AFTER INSERT OR DELETE OR UPDATE ON public.configurations_site FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER trg_update_updated_at BEFORE UPDATE ON public.configurations_site FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_audit AFTER INSERT OR DELETE OR UPDATE ON public.contacts_presse FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER trg_update_updated_at BEFORE UPDATE ON public.contacts_presse FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_audit AFTER INSERT OR DELETE OR UPDATE ON public.evenements FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER trg_evenements_versioning AFTER INSERT OR UPDATE ON public.evenements FOR EACH ROW EXECUTE FUNCTION evenements_versioning_trigger();

CREATE TRIGGER trg_update_updated_at BEFORE UPDATE ON public.evenements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_audit AFTER INSERT OR DELETE OR UPDATE ON public.lieux FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER trg_update_updated_at BEFORE UPDATE ON public.lieux FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_audit AFTER INSERT OR DELETE OR UPDATE ON public.medias FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER trg_update_updated_at BEFORE UPDATE ON public.medias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_audit AFTER INSERT OR DELETE OR UPDATE ON public.membres_equipe FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER trg_membres_equipe_versioning AFTER INSERT OR UPDATE ON public.membres_equipe FOR EACH ROW EXECUTE FUNCTION membres_equipe_versioning_trigger();

CREATE TRIGGER trg_update_updated_at BEFORE UPDATE ON public.membres_equipe FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_audit AFTER INSERT OR DELETE OR UPDATE ON public.messages_contact FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER trg_messages_contact_consent BEFORE INSERT OR UPDATE ON public.messages_contact FOR EACH ROW EXECUTE FUNCTION set_messages_contact_consent_timestamp();

CREATE TRIGGER trg_update_updated_at BEFORE UPDATE ON public.messages_contact FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_audit AFTER INSERT OR DELETE OR UPDATE ON public.partners FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER trg_partners_versioning AFTER INSERT OR UPDATE ON public.partners FOR EACH ROW EXECUTE FUNCTION partners_versioning_trigger();

CREATE TRIGGER trg_update_updated_at BEFORE UPDATE ON public.partners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_audit AFTER INSERT OR DELETE OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER trg_update_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_audit AFTER INSERT OR DELETE OR UPDATE ON public.spectacles FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER trg_spectacles_slug BEFORE INSERT OR UPDATE ON public.spectacles FOR EACH ROW EXECUTE FUNCTION set_slug_if_empty();

CREATE TRIGGER trg_spectacles_versioning AFTER INSERT OR UPDATE ON public.spectacles FOR EACH ROW EXECUTE FUNCTION spectacles_versioning_trigger();

CREATE TRIGGER trg_update_updated_at BEFORE UPDATE ON public.spectacles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_spectacles_tags_usage_count AFTER INSERT OR DELETE ON public.spectacles_tags FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

CREATE TRIGGER trg_tags_slug BEFORE INSERT OR UPDATE ON public.tags FOR EACH ROW EXECUTE FUNCTION set_slug_if_empty();


