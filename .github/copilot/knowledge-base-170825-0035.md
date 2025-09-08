# knowledge-base — Cahier des charges – Création de site internet  **Compagnie de Théâtre « Rouge Cardinal »**

## Contexte

- Projet : **from-scratch** (base vide).
- Source de vérité unique : `/lib/supabase/schemas/*`
- Le contenu ci-dessous reprend textuellement les objets DDL présents dans le script (tables, indexes, fonctions, triggers, policies, commentaires).

---

## Table des matières

- [1. Présentation](#1-présentation)
- [2. Public cible](#2-public-cible)
- [3. Objectifs fonctionnels](#3-objectifs-fonctionnels)
- [4. Architecture technique & choix technologiques](#4-architecture-technique--choix-technologiques)
- [5. Architecture Backend Détaillée](#5-architecture-backend-détaillée)
- [6. Structure de Base de Données](#6-structure-de-base-de-données)
- [7. Row Level Security (RLS) and Policies (règles appliquées & raisons)](#7-row-level-security-rls-and-policies-règles-appliquées--raisons)
- [8. Functions & Triggers (sécurité et bonnes pratiques)](#8-functions--triggers-sécurité-et-bonnes-pratiques)
- [9. Indexes & Performance & Monitoring](#9-indexes--performance--monitoring)
- [10. Sécurité et Conformité](#10-sécurité-et-conformité)
- [11. Migration & Declarative schema (Supabase workflow)](#11-migration--declarative-schema-supabase-workflow)
- [12. Tests recommandés (staging scripts à exécuter)](#12-tests-recommandés-staging-scripts-à-exécuter)
- [13. API et Intégrations](#13-api-et-intégrations)
- [14. User Stories Complètes](#14-user-stories-complètes)
- [15. Livrables et Formation](#15-livrables-et-formation)
- [16. Critères d'Acceptance](#16-critères-dacceptance)
- [17. Conventional Commit Guide](#17-conventional-commit-guide)
- [18. Annexes](#18-annexes)
- [19. CRITICAL INSTRUCTIONS FOR AI LANGUAGE MODELS](#19--critical-instructions-for-ai-language-models-)

## 1. Présentation

### 1.1. Coordonnées

- **Compagnie :** Rouge Cardinal  
- **Forme juridique :** Association loi 1901  
- **Siège social :** [Adresse complète]  
- **Contact projet :** [Prénom Nom], Président / Responsable communication  
- **Téléphone :** [Numéro]  
- **Email :** [adresse.email@rougecardinal.fr]

### 1.2. Description de l'établissement

Association à but non lucratif dédiée à la création et à la diffusion de projets culturels (spectacles de théâtre, expositions photographiques).
Soutenue par des subventions et mécénats.

### 1.3. Contexte et objectifs

- Offrir une vitrine professionnelle  
- Valoriser les productions passées et en cours  
- Faciliter les demandes de subventions et partenariats  
- Exploiter Google Ad Grants pour accroître le trafic  

### 1.4. Références

- Logo (SVG) : rougecardinal_logo.svg
- RGAA (accessibilité)  
- Guide SEO Google (mai 2025)
- Charte graphique
- Mood board

---

## 2. Public cible

- Grand public (amateurs de théâtre et photographie)  
- Institutions culturelles, salles de spectacle  
- Presse spécialisée  
- Mécènes, donateurs, adhérents et bénévoles

---

## 3. Objectifs fonctionnels

1. Présenter la compagnie et son identité  
2. Mettre en avant spectacles et expositions (actuels et passés)  
3. Gérer un agenda interactif d'événements  
4. Centraliser la presse (communiqués, revues)  
5. Permettre une mise à jour autonome via un back-office sécurisé  
6. Optimiser le SEO et préparer Google Ad Grants
7. Gérer la newsletter et les contacts
8. Fournir un espace presse professionnel

---

## 4. Architecture technique & choix technologiques

| Élément               | Technologie retenue                              |
|-----------------------|--------------------------------------------------|
| **Frontend**          | Next.js 15.4.5 + Tailwind CSS + TypeScript           |
| **Backend**           | Supabase (PostgreSQL + Auth + API + Storage)     |
| **Back-office**       | Next.js Admin + Supabase Auth & RLS              |
| **Hébergement**       | Vercel (CI/CD, CDN, SSL)                         |
| **Cache**             | Redis (requêtes fréquentes)                      |
| **Stockage**          | Supabase Storage (images, PDF, vidéos)           |
| **Domaine**           | <www.compagnie-ougecardinal.fr> (à configurer)            |
| **Analytics**         | Google Analytics / Matomo                        |
| **Email**             | Service externe (Resend)           |

### 4.0. Architectural Approach

🔧 **Appliquer les méthodologies suivantes uniquement dans leurs contextes pertinents :**

- **Clean Architecture** → Organiser le système en couches distinctes (application, domaine, infrastructure). Maintenir la modularité pour garantir l’évolutivité.  
- **Feature-Driven Development (FDD)** → Catégoriser et structurer les fonctionnalités de manière efficace, en veillant à ce qu’elles restent autonomes et faciles à gérer.  
- **Domain-Driven Design (DDD)** → Se concentrer sur une architecture orientée métier en utilisant des Entités, Agrégats, Objets de Valeur, Référentiels et Services pour assurer la cohérence du domaine.  
- **Behavior-Driven Development (BDD)** → Lors du travail sur des user stories, des fichiers de test ou des scénarios Gherkin, se baser sur le comportement réel des utilisateurs pour orienter la conception du système.  
- **Principes SOLID** → Respecter la responsabilité unique, la modularité et le découplage afin d’assurer la maintenabilité et la flexibilité à long terme.

---

### 4.1. Environnements

- Dev local (localhost + Supabase CLI)  
- Staging (preview Vercel)  
- Prod (companie-rouge-cardinal.fr)

### 4.2. Exigences non-fonctionnelles

- **Mobile-First** : expérience optimale sur smartphones/tablettes.  
- **Performance** : < 3 s de chargement, lazy-loading, compression, cache Redis.  
- **SEO & Accessibilité** : meta-tags dynamiques, schéma événementiel, sitemap automatique, RGAA.  
- **Sécurité** : HTTPS, JWT, RLS, rate-limiting, cookies sécurisés, protection XSS/CSRF/IDOR/Open Redirect.  
- **RGPD** : double opt-in, droit à l'oubli, mentions légales visibles.  
- **Analytique** : Google Analytics / Matomo + statistiques internes.
- **Disponibilité** : SLA 99,9% uptime, monitoring en temps réel.

### 4.3. UI et Design

- Typographie audacieuse (titres XXL)  
- Esthétique minimaliste (espaces blancs)  
- Micro-interactions & animations subtiles
- Mode sombre optionnel  
- Illustrations personnalisées (théâtre)

### 4.4. Capacités de billetterie & médias

- **Pages Productions** : synopsis, bande‑annonce, distribution, galerie HD.  
- **Billetterie** : lien vers plateforme externe, download billet  
- **Fichier .ics** : export calendrier pour ajout personnel  
- **Médiathèque** : photos HD, vidéos, documents presse

---

## 5. Architecture Backend Détaillée

### 5.1. Authentification et Autorisation

- **Supabase Auth** : JWT (clés asymétriques (ES256)) avec refresh tokens

   <https://supabase.com/docs/guides/auth/signing-keys>

   <https://supabase.com/docs/guides/auth/sessions>

L’objet user contient les attributs suivants :

| Attributes         | Type             | Description   |
| ------------------ | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id                 | `string`         | The unique id of the identity of the user.  |
| aud                | `string`         | The audience claim.  |
| role               | `string`         | The role claim used by Postgres to perform Row Level Security (RLS) checks.  |
| email              | `string`         | The user's email address.   |
| email_confirmed_at | `string`         | The timestamp that the user's email was confirmed. If null, it means that the user's email is not confirmed.     |
| phone              | `string`         | The user's phone  |
| phone_confirmed_at | `string`         | The timestamp that the user's phone was confirmed. If null, it means that the user's phone is not confirmed.   |
| confirmed_at       | `string`         | The timestamp that either the user's email or phone was confirmed. If null, it means that the user does not have a confirmed email address and phone number.   |
| last_sign_in_at    | `string`         | The timestamp that the user last signed in.    |
| app_metadata       | `object`         | The `provider` attribute indicates the first provider that the user used to sign up with. The `providers` attribute indicates the list of providers that the user can use to login with.   |
| user_metadata      | `object`         | Defaults to the first provider's identity data but can contain additional custom user metadata if specified. Refer to [**User Identity**](/docs/guides/auth/auth-identity-linking#the-user-identity) for more information about the identity object. |
| identities         | `UserIdentity[]` | Contains an object array of identities linked to the user.   |
| created_at         | `string`         | The timestamp that the user was created.     |
| updated_at         | `string`         | The timestamp that the user was last updated.   |
| is_anonymous       | `boolean`        | Is true if the user is an anonymous user.  |

- **Rôles** : `admin` (toutes permissions) et `editor` (contenu uniquement)
- **RLS** : Row Level Security sur toutes les tables sensibles
- **Sécurité** : Protection contre force brute, IDOR, sessions sécurisées
- **Middleware** : Vérification des droits par endpoint

### 5.2. Gestion de Contenu (CMS)

#### 5.2.1. Spectacles et Productions

- CRUD complet avec validation stricte
- Statuts : "À l'affiche", "Archives"
- Relations : équipe, dates, lieux, médias
- Upload et gestion des visuels
- Filtrage par année, type, statut
- Historique des modifications

#### 5.2.2. Agenda et Événements  

- CRUD événements avec types multiples
- Gestion des récurrences
- Association événement-spectacle
- Export iCal pour intégration calendrier
- Liens billetterie externes

#### 5.2.3. Présentation Compagnie

- Contenu éditorial (histoire, mission, valeurs)
- Gestion équipe (membres, photos, biographies)
- Timeline des étapes importantes
- Partenaires avec logos et liens
- Versioning du contenu

#### 5.2.4. Espace Presse

- CRUD communiqués de presse
- Upload documents PDF téléchargeables
- Revue de presse (articles, liens, médias)
- Médiathèque professionnelle (photos HD, vidéos)
- Gestion contacts presse
- Catégorisation et indexation

### 5.3. Gestion des Médias

- **Supabase Storage** : upload sécurisé multi-formats
- **Optimisation** : redimensionnement et compression automatiques
- **CDN** : diffusion optimisée avec cache intelligent
- **Organisation** : structure hiérarchique par dossiers
- **Nettoyage** : suppression automatique des fichiers orphelins
- **Sécurité** : URLs signées pour contenus sensibles

### 5.4. Communication

#### 5.4.1. Formulaire de Contact

- API sécurisée avec validation complète
- Protection antispam (CAPTCHA, rate limiting)
- Templates d'emails personnalisables
- Accusé de réception automatique
- Stockage avec statuts de traitement
- Notifications admin par email

#### 5.4.2. Newsletter

- Double opt-in obligatoire (RGPD)
- Gestion complète des abonnés
- Segmentation des listes
- Export pour campagnes (CSV, API)
- Statistiques d'abonnement
- Droit à l'oubli

### 5.5. SEO et Référencement

- **Technique** : sitemap.xml automatique, meta-tags dynamiques
- **Schema.org** : Organisation, Event, CreativeWork
- **Social** : Open Graph, Twitter Cards
- **Analytics** : intégration GA/Matomo + statistiques internes
- **Performance** : monitoring et rapports

---

## 6. Structure de Base de Données

### 6.1. Tables Principales

Chaque table doit avoir un fichier déclaratif dans `supabase/schemas/public/` (nommage recommandé `NN_table_<name>.sql`).

#### Table: `profiles`

```sql
create table public.profiles (
  id bigint generated always as identity primary key,
  user_id uuid null,
  display_name text,
  slug text,
  bio text,
  avatar_media_id bigint null,
  role text default 'user',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint profiles_userid_unique unique (user_id)
);

comment on table public.profiles is 'user profiles linked to auth.users; contains display info and role metadata';
comment on column public.profiles.user_id is 'references auth.users.id managed by Supabase';
```

#### Table: `medias`

```sql
create table public.medias (
  id bigint generated always as identity primary key,
  storage_path text not null,
  filename text,
  mime text,
  size_bytes bigint,
  alt_text text,
  metadata jsonb default '{}'::jsonb,
  uploaded_by uuid null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.medias is 'media storage metadata (paths, filenames, mime, size)';
comment on column public.medias.storage_path is 'storage provider path (bucket/key)';
```

#### Table: `membres_equipe`

```sql
drop table if exists public.membres_equipe cascade;
create table public.membres_equipe (
  id bigint generated always as identity primary key,
  nom text not null,
  role text,
  description text,
  photo_media_id bigint null references public.medias(id) on delete set null,
  ordre smallint default 0,
  active boolean default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.membres_equipe is 'members of the team (artists, staff)';
```

#### Table: `lieux`

```sql
create table public.lieux (
  id bigint generated always as identity primary key,
  nom text not null,
  adresse text,
  ville text,
  code_postal text,
  pays text default 'France',
  latitude double precision,
  longitude double precision,
  capacite integer,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.lieux is 'physical venues where events can be scheduled';
```

#### Table: `spectacles`

```sql
create table public.spectacles (
  id bigint generated always as identity primary key,
  title text not null,
  slug text,
  status text,
  description text,
  short_description text,
  genre text,
  duration_minutes integer,
  cast integer,
  premiere timestamptz null,
  image text,
  public boolean default true,
  awards text,
  created_by uuid null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  search_vector tsvector
);

comment on table public.spectacles is 'shows/performances (base entity)';
```

#### Table: `evenements`

```sql
create table public.evenements (
  id bigint generated always as identity primary key,
  spectacle_id bigint not null references public.spectacles(id) on delete cascade,
  lieu_id bigint null references public.lieux(id) on delete set null,
  date_debut timestamptz not null,
  date_fin timestamptz null,
  capacity integer,
  price_cents integer null,
  status text default 'scheduled',
  metadata jsonb default '{}'::jsonb,
  recurrence_rule text,
  recurrence_end_date timestamptz,
  parent_event_id bigint references public.evenements(id) on delete cascade,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.evenements is 'scheduled occurrences of spectacles with date and venue';
comment on column public.evenements.recurrence_rule is 'Règle de récurrence au format RRULE (RFC 5545)';
comment on column public.evenements.recurrence_end_date is 'Date de fin de la récurrence';
comment on column public.evenements.parent_event_id is 'Référence vers l''événement parent pour les occurrences générées';
```

#### Table: `articles_presse`

```sql
create table public.articles_presse (
  id bigint generated always as identity primary key,
  title text not null,
  slug text,
  chapo text,
  contenu text,
  source_nom text,
  source_url text,
  published_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  search_vector tsvector
);

comment on table public.articles_presse is 'press articles referencing shows or company news';
```

#### Table: `abonnes_newsletter`

```sql
create table public.abonnes_newsletter (
  id bigint generated always as identity primary key,
  email citext not null,
  nom text,
  subscribed boolean default true,
  subscribed_at timestamptz default now(),
  unsubscribed_at timestamptz null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null
);
alter table public.abonnes_newsletter add constraint abonnes_email_unique unique (email);
```

#### Table: `messages_contact`

```sql
create table public.messages_contact (
  id bigint generated always as identity primary key,
  nom text,
  email text,
  sujet text,
  message text,
  processed boolean default false,
  processed_at timestamptz null,
  created_at timestamptz default now() not null
);
```

#### Table: `configurations_site`

```sql
create table public.configurations_site (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now() not null
);
```

- Comment: key-value store for site-wide configuration

#### Table: `logs_audit`

```sql
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
```

#### Table: `spectacles_membres_equipe`

```sql
create table public.spectacles_membres_equipe (
  spectacle_id bigint not null references public.spectacles(id) on delete cascade,
  membre_id bigint not null references public.membres_equipe(id) on delete cascade,
  role text,
  primary key (spectacle_id, membre_id)
);
```

#### Table: `spectacles_medias`

```sql
create table public.spectacles_medias (
  spectacle_id bigint not null references public.spectacles(id) on delete cascade,
  media_id bigint not null references public.medias(id) on delete cascade,
  ordre smallint default 0,
  primary key (spectacle_id, media_id)
);
```

#### Table: `articles_medias`

```sql
create table public.articles_medias (
  article_id bigint not null references public.articles_presse(id) on delete cascade,
  media_id bigint not null references public.medias(id) on delete cascade,
  ordre smallint default 0,
  primary key (article_id, media_id)
);
```

#### Table: `partners`

```sql
create table if not exists public.partners (
  id bigint generated always as identity primary key,
  name text not null,
  slug text,
  description text,
  url text,
  logo_media_id bigint references public.medias(id) on delete set null,
  is_active boolean not null default true,
  featured boolean not null default false,
  display_order integer not null default 0,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

- Comment: Liste des partenaires (nom, logo, url, visibilité, ordre d'affichage).

### 6.2. Relations et Contraintes

- Clés étrangères avec contraintes d'intégrité
- Index optimisés pour les performances
- Triggers pour audit automatique
- Contraintes de validation des données

#### Relations / Contraintes (FK)

- `partners.logo_media_id` → `public.medias(id)` ON DELETE SET NULL
- Various existing relations in schema (extracted):
  - FK references found: medias, spectacles, lieux, membres_equipe, articles_presse
- Ensure `profiles.user_id` is UNIQUE and indexed to allow efficient policy subqueries:
  - `alter table public.profiles add constraint profiles_userid_unique unique(user_id);`
  - `create index idx_profiles_user_id on public.profiles(user_id);`

---

## 7. Row Level Security (RLS) and Policies (règles appliquées & raisons)

- RLS design principles applied:
  - **Do not trust JWT/app_metadata** for role decisions; use `profiles.role` stored in DB.
  - **Policies separated per operation** (SELECT / INSERT / UPDATE / DELETE).
  - **Use (select auth.uid())** in policies for optimizer initPlan benefits.
  - **Explicit TO** clauses: `to authenticated, anon` or `to authenticated`.

- Tables with RLS enabled:
  - `partners`

### Policy on `partners` — "Public partners are viewable by anyone"

```sql
create policy "Public partners are viewable by anyone"
on public.partners
for select
to authenticated, anon
using ( is_active is true );
```

### Policy on `partners` — "Admins can view all partners"

```sql
create policy "Admins can view all partners"
on public.partners
for select
to authenticated
using ( (select p.role from public.profiles p where p.user_id = (select auth.uid())) = 'admin' );
```

### Policy on `partners` — "Authenticated can insert partners"

```sql
create policy "Authenticated can insert partners"
on public.partners
for insert
to authenticated
with check ( (select auth.uid()) = created_by or (select p.role from public.profiles p where p.user_id = (select auth.uid())) = 'admin' );
```

### Policy on `partners` — "Owners or admins can update partners"

```sql
create policy "Owners or admins can update partners"
on public.partners
for update
to authenticated
using ( (select auth.uid()) = created_by or (select p.role from public.profiles p where p.user_id = (select auth.uid())) = 'admin' )
with check ( (select auth.uid()) = created_by or (select p.role from public.profiles p where p.user_id = (select auth.uid())) = 'admin' );
```

### Policy on `partners` — "Owners or admins can delete partners"

```sql
create policy "Owners or admins can delete partners"
on public.partners
for delete
to authenticated
using ( (select auth.uid()) = created_by or (select p.role from public.profiles p where p.user_id = (select auth.uid())) = 'admin' );
```

---

## 8. Functions & Triggers (sécurité et bonnes pratiques)

### 8.1. Functions

- All functions follow Supabase best practices:
  - `security invoker` (default) unless `security definer` is explicitly required and documented.
  - `set search_path = ''` to avoid schema resolution issues.
  - Fully-qualified references (e.g., `public.to_tsvector_french(...)`).
- Examples from schema:
  - `public.partners_set_created_by()` — sets `created_by` to `(select auth.uid())::uuid` on insert.
  - `public.partners_protect_created_by()` — prevent updating `created_by` on update.
  - `public.medias_set_uploaded_by()`, `public.medias_protect_uploaded_by()` — same pattern for medias.
  - `public.audit_trigger()` — inserts rows into `public.logs_audit` with parsed IP/user-agent, uses `TG_OP` / `TG_TABLE_NAME`.

#### Function: `public.is_admin`

```sql
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
```

#### Function: `public.update_updated_at_column`

```sql
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
```

#### Function: `public.audit_trigger`

```sql
create or replace function public.audit_trigger()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
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
$$;
```

#### Function: `public.to_tsvector_french`

```sql
create or replace function public.to_tsvector_french(text)
returns tsvector
language sql
immutable
as $$
  select to_tsvector('french', coalesce($1, ''));
$$;
```

#### Function: `public.spectacles_search_vector_trigger`

```sql
create or replace function public.spectacles_search_vector_trigger()
returns trigger
language plpgsql
as $$
begin
  new.search_vector := to_tsvector('french', coalesce(new.title,'') || ' ' || coalesce(new.description,''));
  return new;
end;
$$;
```

#### Function: `public.articles_search_vector_trigger`

```sql
create or replace function public.articles_search_vector_trigger()
returns trigger
language plpgsql
as $$
begin
  new.search_vector := to_tsvector('french', coalesce(new.title,'') || ' ' || coalesce(new.chapo,'') || ' ' || coalesce(new.contenu,''));
  return new;
end;
$$;
```

#### Function: `public.partners_set_created_by`

```sql
create or replace function public.partners_set_created_by()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null then
    new.created_by := (select auth.uid())::uuid;
  end if;
  new.created_at := coalesce(new.created_at, now());
  new.updated_at := now();
  return new;
end;
$$;
```

#### Function: `public.partners_protect_created_by`

```sql
create or replace function public.partners_protect_created_by()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.created_by := old.created_by;
  new.updated_at := now();
  return new;
end;
$$;
```

---

### 8.2. Triggers

```sql
drop trigger if exists trg_spectacles_search_vector on public.spectacles;
```

```sql
create trigger trg_spectacles_search_vector
before insert or update on public.spectacles
for each row execute function public.spectacles_search_vector_trigger();
```

```sql
drop trigger if exists trg_articles_search_vector on public.articles_presse;
```

```sql
create trigger trg_articles_search_vector
before insert or update on public.articles_presse
for each row execute function public.articles_search_vector_trigger();
```

```sql
create trigger trg_update_updated_at
      before update on %s
      for each row
      execute function public.update_updated_at_column();
```

```sql
create trigger trg_audit
      after insert or update or delete on %s
      for each row
      execute function public.audit_trigger();
```

```sql
drop trigger if exists trg_partners_set_created_by on public.partners;
```

```sql
create trigger trg_partners_set_created_by
before insert on public.partners
for each row execute function public.partners_set_created_by();
```

```sql
drop trigger if exists trg_partners_protect_created_by on public.partners;
```

```sql
create trigger trg_partners_protect_created_by
before update on public.partners
for each row execute function public.partners_protect_created_by();
```

### 8.3. Column comments

- `profiles.user_id`: references auth.users.id managed by Supabase
- `medias.storage_path`: storage provider path (bucket/key)
- `configurations_site.show_partners`: Toggle pour afficher/masquer la section "Nos partenaires" sur la page d'accueil.

## 9. Indexes & Performance & Monitoring

### 9.1 Indexes

- Index `idx_medias_storage_path` on `medias`

```sql
create index if not exists idx_medias_storage_path on public.medias (storage_path);
```

- Index `idx_profiles_user_id` on `profiles`

```sql
create index if not exists idx_profiles_user_id on public.profiles (user_id);
```

- Index `idx_spectacles_title` on `spectacles`

```sql
create index if not exists idx_spectacles_title on public.spectacles (title);
```

- Index `idx_articles_published_at` on `articles_presse`

```sql
create index if not exists idx_articles_published_at on public.articles_presse (published_at);
```

- Index `idx_spectacles_title_trgm` on `spectacles`

```sql
create index if not exists idx_spectacles_title_trgm on public.spectacles using gin (title gin_trgm_ops);
```

- Index `idx_articles_title_trgm` on `articles_presse`

```sql
create index if not exists idx_articles_title_trgm on public.articles_presse using gin (title gin_trgm_ops);
```

- Index `idx_partners_slug` on `partners`

```sql
create unique index if not exists idx_partners_slug on public.partners (slug);
```

- Index `idx_partners_is_active` on `partners`

```sql
create index if not exists idx_partners_is_active on public.partners (is_active);
```

- Index `idx_partners_display_order` on `partners`

```sql
create index if not exists idx_partners_display_order on public.partners (display_order);
```

### 9.2. Monitoring

- Health checks des services
- Métriques de performance temps réel
- Alertes automatiques en cas de surcharge
- Logging structuré avec niveaux
- Dashboard de supervision

---

## 10. Sécurité et Conformité

### 10.1. Sécurité Technique

- **Validation** : sanitisation anti-XSS sur toutes les entrées
- **Protection** : CSRF, rate limiting par IP et utilisateur
- **Cookies** : HttpOnly, Secure, SameSite
- **Monitoring** : détection d'intrusion, scans de vulnérabilités
- **Backup** : sauvegardes chiffrées régulières

Pour garantir la sécurité du site et éviter les failles les plus courantes (IDOR, Open Redirect, XSS…), appliquer systématiquement la checklist suivante :

- ✅ Toutes les routes authentifiées sont protégées côté backend (contrôle d’accès strict, prévention IDOR).
- ✅ Ownership / droits d’accès bien vérifiés sur chaque ressource (aucun accès à une ressource qui n’appartient pas à l’utilisateur connecté).
- ✅ Pas de redirections externes non contrôlées (protection contre l’Open Redirect : n’autoriser que des URLs internes ou whitelist stricte pour les domaines externes).
- ✅ Inputs utilisateurs validés et/ou sanitized côté backend (prévention XSS, injections, etc.).
- ✅ Pas d’utilisation de `dangerouslySetInnerHTML` sans sanitation stricte (XSS).
- ✅ Les tokens JWT sont toujours vérifiés côté backend (signature, expiration, etc.).
- ✅ Les erreurs ne révèlent jamais d’informations sensibles en production.
- ✅ Les logs sont sécurisés et ne contiennent pas de données confidentielles.
- ✅ Les dépendances sont à jour et vérifiées contre les CVE connues.

> **Rappel** : IDOR (Insecure Direct Object Reference), Open Redirect et XSS sont parmi les failles les plus critiques du web. Leur prévention repose sur la rigueur du contrôle d’accès, la validation/sanitation des entrées, et la gestion stricte des redirections.

### 10.2. Remarques de sécurité / opérationnelles

- Préférer `profiles.role` pour décisions de sécurité au lieu de `auth.jwt()` (app_metadata), afin d'éviter les tokens obsolètes.
- Assurez-vous que `profiles.user_id` est unique et indexé.
- Vérifier que les extensions `citext` et `unaccent` sont installées si nécessaire.
- Pour les conversions de `serial` -> `identity`, planifier fenêtre de maintenance si tables contiennent des données volumineuses.
- Documenter les propriétaires (owners) des functions `SECURITY DEFINER` si elles existent, et limiter leurs droits.

### 10.3. Security considerations & rationale

- **Use DB-stored roles** (`profiles.role`) for authorization decisions to avoid stale JWT issues.
- **service_role** bypasses RLS — ensure secrets are protected and server code uses service_role only when necessary.
- **Ensure citext/unaccent** extensions exist if using case-insensitive email or search features.
- **Media privacy**: `medias.is_public` flag + RLS policies + trigger enforcement for uploaded_by.

### 10.4. Conformité RGPD

- Consentement explicite pour newsletter
- Droit à l'oubli complet
- Export des données personnelles
- Pseudonymisation des logs
- Notification des violations
- Plan de continuité des données
- Collecte minimale des données personnelles.
- Anonymisation des données sensibles.
- Fonctionnalités pour droits d'accès, rectification, suppression.
- Procédure de notification en cas de violation (alerte utilisateurs & CNIL).

---

## 11. Migration & Declarative schema (Supabase workflow)

- All schema objects must be declared in `supabase/schemas/public/` files (one entity per file recommended).
- Run `supabase db diff -f <init_schema_name>` to generate migrationsn local env (after `supabase stop` local Supabase per the official workflow).
- Avoid DML in schema files; use migrations for seeding if necessary.
- Apply migration to staging, run full test suite (RLS, triggers, performance).
- Prepare CI job to apply migrations on merges to main (with manual approval for prod).

1. Placer `supabase/schemas/public/` dans la racine du repo, commit.
   - Fichiers concernés (exemples) :
     - 00_profiles_fix.sql
     - 01_table_partners.sql
     - 02_alter_configurations_site.sql
     - 20_function_partners_set_created_by.sql
     - 21_function_partners_protect_created_by.sql
     - 30_trigger_partners.sql
     - 40_policy_partners.sql
     - autres fichiers déjà présents pour tables/fonctions/triggers

2. Stopper l'environnement Supabase local :

   ```bash
   supabase stop
   ```

3. Générer la migration déclarative :

   ```bash
   supabase db diff -f init_schema_or_update
   ```

   - Inspecter le fichier de migration généré dans `supabase/migrations/`.
   - Vérifier qu'il ne contient pas de DML non volontaire.
   - Corriger si besoin, puis commit.

4. Démarrer Supabase localement :

   ```bash
   supabase start
   ```

5. Tests en staging (exécuter les requêtes d'exemple incluses dans le cahier) :
   - RLS (anon/auth/admin) pour partners et medias
   - Triggers pour medias (uploaded_by) et partners (created_by)
   - Audit triggers (inserts/updates/deletes) -> verify logs in `public.logs_audit`

6. CI/CD :
   - Ajouter job GitHub Actions pour exécuter les migrations sur staging et prod.
   - Protéger `service_role` keys ; ne pas les exposer client-side.

## 12. Tests recommandés (staging scripts à exécuter)

- RLS tests (anon/auth/owner/admin) for each table with policies.
- Trigger tests: insert/update partners & medias to ensure created_by/uploaded_by are set and protected.
- Audit tests: create/update/delete to confirm logs_audit entries.
- Performance: EXPLAIN ANALYZE on typical SELECTs using RLS filters and ordering columns.

## 13. API et Intégrations

### 13.1. API REST

- Documentation OpenAPI complète
- Versioning des endpoints (/api/v1/)
- Format JSON standardisé
- Codes d'erreur cohérents
- Pagination standard (limit/offset)

### 13.2. Intégrations Externes

- **Google Ad Grants** : préparation SEO
- **Réseaux sociaux** : partage automatique
- **Services emailing** : Resend
- **Analytics** : Google Analytics, Matomo, Clarity
- **Billetterie** : liens vers plateformes externes

---

## 14. User Stories Complètes

- **Audit-Logs** — *System* : Toutes opérations critiques sont auditées dans `logs_audit`.

### 14.1. Page d'Accueil

| ID | En tant que | Je veux | Afin de |
|----|-------------|---------|---------|
| Accueil-01 | Visiteur | Voir une bannière dynamique avec logo et menu | Impression engageante |
| Accueil-02 | Visiteur | Voir une animation de qualité (pas un carrousel) | Créer une ambiance immersive |
| Accueil-03 | Visiteur | Afficher les dernières actus/événements | Rester informé |
| Accueil-04 | Visiteur | Lire un court paragraphe de présentation | Comprendre rapidement la mission |
| Accueil-05 | Visiteur | Accéder aux liens des réseaux sociaux | Engagement social |
| Accueil-06 | Visiteur | Voir mentions légales, RGPD et plan du site | Conformité juridique |
| Accueil-07 | Visiteur | Voir les partenaires de la compagnie. | Promouvoir et remercier les partenaires |

#### Epic : Page d’Accueil (Home page)

##### "Bannière dynamique"

**As a** visiteur  
**I want** voir logo + menu responsive  
**So that** je navigue facilement

*Acceptance Criteria:*

- [ ] Affichage logo et menu au chargement  
- [ ] Menu cliquable et accessible mobile

---

##### "Animation immersive"

**As a** visiteur  
**I want** une animation fluide non bloquante  
**So that** l’accueil soit impactant

*Acceptance Criteria:*

- [ ] Démarrage auto sans freeze  
- [ ] Compatibilité navigateurs principaux

---

##### "Fil d’actualités"

**As a** visiteur  
**I want** voir les dernières actus  
**So that** je reste informé

*Acceptance Criteria:*

- [ ] Tri antéchronologique  
- [ ] Chaque actus = titre + date + lien détail

---

##### "Présentation courte"

**As a** visiteur  
**I want** un texte mission clair  
**So that** je sache à quoi sert la compagnie

*Acceptance Criteria:*

- [ ] Administrable via back-office  
- [ ] Affichage responsive

---

##### "Liens réseaux sociaux"

**As a** visiteur  
**I want** accéder aux réseaux officiels  
**So that** je suive l’actualité

*Acceptance Criteria:*

- [ ] Icônes cliquables, nouvel onglet  
- [ ] Logos officiels

---

##### "Footer légal"

**As a** visiteur  
**I want** consulter mentions légales, RGPD, plan du site  
**So that** je sois informé

*Acceptance Criteria:*

- [ ] Liens visibles et fonctionnels

---

##### "Section partenaires"

**As a** visiteur  
**I want** voir logos partenaires  
**So that** je les découvre

*Acceptance Criteria:*

- [ ] Filtrage partenaires actifs  
- [ ] Lien vers leur site

### 14.2. PAge présentation de la compagnie

| ID | En tant que | Je veux | Afin de |
|----|-------------|---------|---------|
| Presentation-01 | Visiteur | Lire la page "La compagnie" avec histoire, mission, équipe | Comprendre l'identité et les valeurs |
| Presentation-02 | Admin | Modifier le contenu de présentation via le back-office | Maintenir les informations à jour |
| Presentation-03 | Admin | Gérer les membres de l'équipe (CRUD) | Présenter l'équipe actuelle |

#### Epic : Présentation de la compagnie

##### "Lire la présentation complète"

**As a** visiteur  
**I want** lire la page "La compagnie" avec histoire, mission, équipe  
**So that** je comprenne l'identité et les valeurs

*Acceptance Criteria:*

- [ ] GIVEN : que je suis sur la page "La compagnie"  
- [ ] WHEN : j’affiche la page  
- [ ] THEN : l’histoire, la mission et la présentation de l’équipe sont visibles  
- [ ] AND : la mise en page est responsive et accessible

---

##### "Modifier le contenu de présentation"

**As an** admin  
**I want** modifier le contenu via le back-office  
**So that** je maintienne les informations à jour

*Acceptance Criteria:*

- [ ] Connexion admin requise  
- [ ] Sauvegarde en base avec confirmation  
- [ ] Mise à jour immédiate sur le site  
- [ ] Journalisation des modifications

---

##### "Gérer les membres de l'équipe"

**As an** admin  
**I want** CRUD complet des membres d’équipe  
**So that** je présente la composition actuelle

*Acceptance Criteria:*

- [ ] Ajout avec photo, nom, rôle  
- [ ] Modification des infos existantes  
- [ ] Suppression effective  
- [ ] Tri personnalisable

##### "Toggle affichage sections À la une et Partenaires"

**As an** admin  
**I want** disposer dans le back‑office d’un interrupteur (toggle) pour afficher ou masquer la section "À la une" et la section "Partenaires"  
**So that** je contrôle leur présence sur le site sans les supprimer du contenu

*Acceptance Criteria:*

- [ ] GIVEN : que je suis connecté en admin  
- [ ] WHEN : j’accède à la gestion de la présentation dans le back‑office  
- [ ] THEN : deux toggles distincts sont visibles : un pour "À la une", un pour "Partenaires"  
- [ ] AND : chaque toggle permet d’activer ou désactiver l’affichage sur le site public  
- [ ] AND : l’état du toggle est sauvegardé en base et appliqué en front immédiatement  
- [ ] AND : la modification est tracée dans le journal d’audit

### 14.3. Page Nos Spectacles (événements)

| ID | En tant que | Je veux | Afin de |
|----|-------------|---------|---------|
| Spectacles-01 | Visiteur | Voir les événements "À l'affiche" (image+titre) | Découvrir les événement en cours |
| Spectacles-02 | Visiteur | Consulter la fiche complète d'un événement | Décision de clic vers lien de  réservation |
| Spectacles-03 | Visiteur | Parcourir les événements avec filtres avancés | Explorer l'historique |
| Spectacles-04 | Visiteur | Cliquer sur "Voir l'agenda" depuis une fiche | Accéder aux dates |
| Spectacles-05 | Admin | Gérer CRUD des événements (médias, date, lieux, description)  | Maintenir la base à jour |
| Spectacles-06 | Admin | Voir l'historique des modifications | Traçabilité des changements |

#### Epic : Page Nos Spectacles (événements)

##### "Voir les événements à l'affiche"

**As a** visiteur  
**I want** voir la liste des événements "À l'affiche" avec image et titre  
**So that** je découvre les événements en cours

*Acceptance Criteria:*

- [ ] GIVEN : que des événements "À l'affiche" existent en base  
- [ ] WHEN : j’accède à la page "Nos Spectacles"  
- [ ] THEN : la liste affiche chaque événement avec son image et son titre  
- [ ] AND : l’ordre est chronologique ou selon priorité définie  
- [ ] AND : l’affichage est responsive

---

##### "Consulter la fiche complète d'un événement"

**As a** visiteur  
**I want** consulter la fiche complète d’un événement  
**So that** je décide de cliquer vers le lien de réservation

*Acceptance Criteria:*

- [ ] GIVEN : que je clique sur un événement dans la liste  
- [ ] WHEN : la fiche s’ouvre  
- [ ] THEN : elle affiche image, titre, description, lieu, dates, horaires, tarifs  
- [ ] AND : un bouton ou lien mène vers la réservation externe si disponible

---

##### "Parcourir les événements avec filtres avancés"

**As a** visiteur  
**I want** filtrer les événements par critères avancés (date, lieu, type, statut)  
**So that** j’explore facilement l’historique ou les en cours

*Acceptance Criteria:*

- [ ] GIVEN : que des filtres sont disponibles  
- [ ] WHEN : je sélectionne un ou plusieurs filtres  
- [ ] THEN : la liste est mise à jour instantanément avec les résultats correspondants  
- [ ] AND : possibilité de réinitialiser les filtres

---

##### "Lien vers l'agenda depuis une fiche"

**As a** visiteur  
**I want** cliquer sur "Voir l'agenda" depuis la fiche d’un événement  
**So that** j’accède aux dates correspondantes

*Acceptance Criteria:*

- [ ] GIVEN : que la fiche événement affiche un bouton "Voir l'agenda"  
- [ ] WHEN : je clique dessus  
- [ ] THEN : je suis redirigé vers l’agenda filtré sur cet événement

---

##### "CRUD des événements"

**As an** admin  
**I want** créer, lire, mettre à jour et supprimer des événements avec médias, date, lieux, description  
**So that** je maintienne la base à jour

*Acceptance Criteria:*

- [ ] Formulaire complet avec champs : titre, description, images, date(s), lieu, statut "À l'affiche"/archivé  
- [ ] Upload images avec prévisualisation  
- [ ] Validation des champs obligatoires  
- [ ] Suppression avec confirmation  
- [ ] Changements sauvegardés et visibles immédiatement

---

##### "Voir l'historique des modifications"

**As an** admin  
**I want** consulter l’historique des modifications des événements  
**So that** je garde une traçabilité des changements

*Acceptance Criteria:*

- [ ] Liste horodatée des modifications (création, édition, suppression)  
- [ ] Indication de l’utilisateur ayant effectué l’action  
- [ ] Détail des champs modifiés  
- [ ] Export possible en CSV/PDF

### 14.4. Page Agenda

| ID | En tant que | Je veux | Afin de |
|----|-------------|---------|---------|
| Agenda-01 | Visiteur | Voir un calendrier interactif responsive | Planifier ma venue |
| Agenda-02 | Visiteur | Filtrer par type d'événement | Rapidité d'accès |
| Agenda-03 | Visiteur | Télécharger fichier .ics pour ajout à mon calendrier | Intégration personnelle |
| Agenda-04 | Visiteur | Accéder aux liens billetterie externes | Acheter mes billets |
| Agenda-05 | Admin | Gérer CRUD des événements (médias, date, lieux, description) via BackOffice | Mise à jour autonome |
| Agenda-06 | Admin | Gérer CRUD des liens de billeterie via BackOffice | Mise à jour autonome |
| Agenda-07 | Visiteur | Voir CTA d'abonnement à la newsletter | Recevoir la newsletter |
| Agenda-08 | Admin| Toggle dans BackOffice pour afficher ou non la section "Abonnement Newsletter" sur Page Agenda | Pouvoir mettre en avant ou pas la Newsletter |

#### Epic : Page Agenda

##### "Voir un calendrier interactif responsive"

**As a** visiteur  
**I want** voir un calendrier interactif responsive  
**So that** je planifie ma venue

*Acceptance Criteria:*

- [ ] GIVEN : que je suis sur la page Agenda  
- [ ] WHEN : le calendrier se charge  
- [ ] THEN : il est affiché en format desktop et mobile de façon responsive  
- [ ] AND : je peux naviguer par mois/semaine/jour  
- [ ] AND : les événements sont visibles dans les cases correspondantes avec titre court

---

##### "Filtrer par type d'événement"

**As a** visiteur  
**I want** filtrer le calendrier par type d’événement (ex : concert, spectacle, exposition)  
**So that** j’accède plus rapidement à l’info qui m’intéresse

*Acceptance Criteria:*

- [ ] Liste de filtres accessible et claire  
- [ ] Sélection d’un ou plusieurs types d’événement met à jour l’affichage du calendrier instantanément  
- [ ] Bouton "Réinitialiser" pour revenir à l’affichage complet

---

##### "Télécharger un fichier .ics"

**As a** visiteur  
**I want** télécharger un fichier .ics pour un événement  
**So that** je l’ajoute facilement à mon propre calendrier

*Acceptance Criteria:*

- [ ] Sur chaque événement : bouton ou lien "Ajouter à mon calendrier"  
- [ ] Clic sur le bouton télécharge un fichier .ics compatible (Google, Outlook, Apple Calendar)  
- [ ] Le fichier contient au minimum : titre, date/heure, lieu, description courte, lien vers billetterie

---

##### "Accéder aux liens billetterie externes"

**As a** visiteur  
**I want** accéder depuis l’agenda aux liens de billetterie  
**So that** j’achète mes billets rapidement

*Acceptance Criteria:*

- [ ] GIVEN : qu’un lien billetterie est configuré pour un événement  
- [ ] WHEN : je clique sur "Billetterie"  
- [ ] THEN : je suis redirigé vers le site externe dans un nouvel onglet  
- [ ] AND : si aucun lien n’est disponible, le bouton est désactivé ou absent

---

##### "CRUD des événements via BackOffice"

**As an** admin  
**I want** gérer la création, lecture, mise à jour, suppression des événements (médias, date, lieux, description)  
**So that** je maintienne l’agenda à jour

*Acceptance Criteria:*

- [ ] Formulaire avec champs : titre, description, images, dates/horaires, lieu, type, statut  
- [ ] Upload d’images avec prévisualisation  
- [ ] Validation des champs requis  
- [ ] Suppression avec confirmation  
- [ ] Sauvegarde avec retour visuel de succès/échec

---

##### "CRUD des liens billetterie via BackOffice"

**As an** admin  
**I want** gérer les liens billetterie pour chaque événement  
**So that** ils soient accessibles aux visiteurs

*Acceptance Criteria:*

- [ ] Champ dédié au lien billetterie dans la fiche événement  
- [ ] Vérification de format d’URL  
- [ ] Possibilité d’ajouter, modifier ou supprimer le lien  
- [ ] Sauvegarde et mise à jour immédiate côté front

---

##### "Voir CTA abonnement newsletter"

**As a** visiteur  
**I want** voir un appel à l’action pour m’abonner à la newsletter  
**So that** je reste informé des prochains événements

*Acceptance Criteria:*

- [ ] Bloc CTA visible sur la page Agenda (titre, texte court, champ email, bouton)  
- [ ] Formulaire envoie l’email vers le service newsletter configuré  
- [ ] Message de confirmation après inscription réussie

---

##### "Toggle affichage CTA newsletter dans BackOffice"

**As an** admin  
**I want** activer ou désactiver l’affichage de la section "Abonnement Newsletter"  
**So that** je choisis de la mettre en avant ou non

*Acceptance Criteria:*

- [ ] Interrupteur (toggle) disponible dans BackOffice, section Paramètres Agenda  
- [ ] WHEN : le toggle est activé  
- [ ] THEN : la section newsletter apparaît côté front  
- [ ] WHEN : il est désactivé  
- [ ] THEN : la section n’est pas affichée  
- [ ] Changement visible immédiatement sans redéploiement

### 14.5. Page Presse

| ID | En tant que | Je veux | Afin de |
|----|-------------|---------|---------|
| Presse-01 | Visiteur | Télécharger les communiqués de presse (PDF) | Accès aux documents officiels |
| Presse-02 | Visiteur | Parcourir revues de presse (articles, vidéos) | Connaître retours médias |
| Presse-03 | Visiteur | Accéder à la médiathèque HD | Illustrer mes articles |
| Presse-04 | Admin | Gérer CRUD des communiqués et revues | Centraliser gestion presse |
| Presse-05 | Admin | Uploader et organiser la médiathèque | Organisation des ressources |

#### Epic : Page Presse

##### "Télécharger les communiqués de presse (PDF)"

**As a** visiteur  
**I want** télécharger les communiqués de presse au format PDF  
**So that** j'accède aux documents officiels

*Acceptance Criteria:*

- [ ] GIVEN : qu'un ou plusieurs communiqués sont disponibles  
- [ ] WHEN : j'affiche la page Presse  
- [ ] THEN : chaque communiqué apparaît avec son titre, date, résumé  
- [ ] AND : un bouton "Télécharger" déclenche le téléchargement direct du PDF  
- [ ] AND : le lien ouvre le fichier dans un nouvel onglet si configuré ainsi

---

##### "Parcourir revues de presse"

**As a** visiteur  
**I want** voir la revue de presse (articles, vidéos)  
**So that** je découvre les retombées médiatiques

*Acceptance Criteria:*

- [ ] Liste claire avec vignette, titre, média/source, date de publication  
- [ ] Les articles cliquables ouvrent le lien externe dans un nouvel onglet  
- [ ] Les vidéos intégrées peuvent être lues directement sur la page (si autorisé)  
- [ ] Filtre ou tri possible (par date, type de média)

---

##### "Accéder à la médiathèque HD"

**As a** visiteur  
**I want** accéder à une médiathèque HD  
**So that** j'utilise des visuels officiels pour illustrer mes articles

*Acceptance Criteria:*

- [ ] Accès clair via bouton ou lien depuis la page Presse  
- [ ] Galerie HD avec aperçu + option de téléchargement en taille originale  
- [ ] Mention des droits d’utilisation et crédits photo  
- [ ] Classement ou filtres par événement / thématique

---

##### "CRUD communiqués et revues"

**As an** admin  
**I want** créer, lire, mettre à jour, supprimer les communiqués et revues de presse  
**So that** je centralise la gestion presse

*Acceptance Criteria:*

- [ ] Formulaire d’édition avec champs : titre, date, résumé, lien/URL ou fichier PDF, type (communiqué/revue)  
- [ ] Validation des champs requis  
- [ ] Upload de PDF avec contrôle de format et taille  
- [ ] Suppression avec confirmation  
- [ ] Changements visibles immédiatement côté front

---

##### "Uploader et organiser la médiathèque"

**As an** admin  
**I want** uploader et organiser la médiathèque HD  
**So that** je structure les ressources

*Acceptance Criteria:*

- [ ] Upload d’images HD (JPG, PNG) avec prévisualisation  
- [ ] Classement par catégories / tags (ex : événement, type de média)  
- [ ] Édition des métadonnées (titre, description, crédits, droits)  
- [ ] Suppression avec confirmation  
- [ ] Réorganisation possible par glisser-déposer

### 14.6. Page Contact & Newsletter

| ID | En tant que | Je veux | Afin de |
|----|-------------|---------|---------|
| Contact-01 | Visiteur | Remplir un formulaire sécurisé | Poser une question |
| Contact-02 | Visiteur | Recevoir un accusé de réception automatique | Confirmation de prise en compte |
| Contact-03 | Admin | Consulter et traiter les messages reçus | Gérer les demandes |
| Newsletter-01 | Visiteur | M'inscrire avec double opt-in (RGPD) | Recevoir la newsletter |
| Newsletter-02 | Abonné | Me désinscrire facilement | Exercer mon droit |
| Newsletter-03 | Admin | Exporter liste des abonnés (CSV) | Gérer campagnes email |
| Newsletter-04 | Admin | Voir statistiques d'abonnement | Mesurer l'engagement |

#### Epic : Contact & Newsletter

##### "Formulaire de contact sécurisé"

**As a** visiteur  
**I want** remplir un formulaire sécurisé  
**So that** je puisse poser une question ou faire une demande à l'équipe

*Acceptance Criteria:*

- [ ] GIVEN : que je suis sur la page Contact  
- [ ] WHEN : j'affiche le formulaire  
- [ ] THEN : je vois les champs obligatoires : prénom, nom, email, téléphone (optionnel), motif, sujet, message, case RGPD  
- [ ] AND : un captcha anti‑spam est présent et fonctionnel  
- [ ] AND : le bouton d’envoi est désactivé tant que tous les champs obligatoires ne sont pas valides  
- [ ] AND : les données sont transmises en HTTPS

---

##### "Accusé de réception automatique"

**As a** visiteur  
**I want** recevoir un accusé de réception automatique après envoi du formulaire  
**So that** je sois certain que ma demande a été prise en compte

*Acceptance Criteria:*

- [ ] GIVEN : que j’ai soumis un formulaire valide  
- [ ] WHEN : l’envoi est confirmé côté serveur  
- [ ] THEN : un email automatique est envoyé à l’adresse indiquée, reprenant les informations soumises et les délais de réponse estimés

---

##### "Consulter et traiter les messages reçus"

**As an** admin  
**I want** consulter et traiter les messages reçus via le formulaire  
**So that** je gère efficacement les demandes

*Acceptance Criteria:*

- [ ] Interface back‑office listant les messages avec tri et filtres (date, motif, statut)  
- [ ] Possibilité de marquer un message comme traité / en cours / en attente  
- [ ] Consultation du détail complet d’un message  
- [ ] Journalisation de l’ouverture et de l’état

---

##### "Coordonnées visibles sur la page"

**As a** visiteur  
**I want** voir les coordonnées de la compagnie (email, téléphone, adresse, horaires, contacts spécialisés)  
**So that** je puisse contacter directement la bonne personne

*Acceptance Criteria:*

- [ ] Affichage dans une section dédiée avec icônes correspondantes  
- [ ] Email et téléphone cliquables (mailto: / tel:)  
- [ ] Mise à jour dynamique si les données changent côté back‑office

---

##### "CRUD Coordonnées"

**As an** admin  
**I want** ajouter / modifier / supprimer les coordonnées affichées sur la page Contact  
**So that** elles restent à jour

*Acceptance Criteria:*

- [ ] Formulaire back‑office complet avec champs : Nom de la compagnie, adresse, email, téléphone, horaires, contacts spécialisés (email presse)
- [ ] Validation des champs obligatoires  
- [ ] Suppression avec confirmation  
- [ ] Historisation dans `audit_logs`  
- [ ] Changement visible immédiatement côté front

---

##### "Inscription newsletter avec double opt‑in"

**As a** visiteur  
**I want** m’inscrire avec mon email via le formulaire newsletter  
**So that** je reçoive les actualités de la compagnie

*Acceptance Criteria:*

- [ ] GIVEN : que je suis sur la page Contact ou un autre emplacement intégrant le module newsletter  
- [ ] WHEN : je saisis mon email et clique sur "S'abonner"  
- [ ] THEN : un email de confirmation est envoyé (double opt‑in RGPD)  
- [ ] AND : l’abonnement n’est effectif qu’après clic sur le lien de confirmation  
- [ ] AND : un lien de désinscription est présent dans chaque envoi

---

##### "Désinscription newsletter"

**As an** abonné  
**I want** me désinscrire facilement  
**So that** j’exerce mon droit de retrait

*Acceptance Criteria:*

- [ ] Lien de désinscription unique présent dans chaque email  
- [ ] Confirmation de désinscription affichée côté front  
- [ ] Email supprimé ou marqué comme "désinscrit" en base de données

---

##### "Exporter la liste des abonnés"

**As an** admin  
**I want** exporter la liste des abonnés au format CSV  
**So that** je puisse gérer mes campagnes email dans un outil externe

*Acceptance Criteria:*

- [ ] Bouton "Exporter CSV" dans le back‑office newsletter  
- [ ] Fichier CSV contenant : email, date d’inscription, statut (actif/désinscrit)  
- [ ] Export limité aux administrateurs

---

##### "Voir statistiques d’abonnement"

**As an** admin  
**I want** consulter les statistiques d’abonnement newsletter  
**So that** je mesure l’engagement

*Acceptance Criteria:*

- [ ] Graphiques et chiffres clés (abonnés actifs, nouveaux abonnés, désinscriptions)  
- [ ] Filtre par période  
- [ ] Données actualisées en temps réel ou via rafraîchissement manuel

### 14.7. Back-office Avancé

| ID | En tant que | Je veux | Afin de |
|----|-------------|---------|---------|
| BO-01 | Administrateur | Me connecter avec authentification sécurisée | Sécuriser l'accès |
| BO-02 | Administrateur | Voir un dashboard avec statistiques | Vue d'ensemble |
| BO-03 | Éditeur | CRUD Spectacles, événements, presse via interface intuitive | Autonomie |
| BO-04 | Éditeur | Uploader et gérer médias avec prévisualisation | Organisation |
| BO-05 | Administrateur | Gérer rôles utilisateurs (admin/editor) | Contrôle d'accès |
| BO-06 | Administrateur | Consulter logs d'audit détaillés | Traçabilité |
| BO-07 | Administrateur | Recevoir alertes de sécurité | Monitoring |
| BO-08 | Utilisateur | Bénéficier d'une interface responsive | Mobilité |
| BO-09 | Administrateur| Choisir d'afficher ou non la section "A la Une" sur Page d'Accueil | Pouvoir mettre en avant ou pas les prochains évènements |
| BO-10 | Administrateur| Choisir d'afficher ou non la section "Nos partenaires" sur la Page d'Accueil.| Pouvoir mettre en avant ou pas les partenaires. |
| BO-11 | Administrateur| Toggle pour afficher ou non la section "Abonnement Newsletter" sur Page Agenda | Pouvoir mettre en avant ou pas la Newsletter |

#### Epic : Back‑office

##### "Authentification sécurisée"

**As an** administrateur  
**I want** me connecter avec une authentification sécurisée  
**So that** je sécurise l'accès au back‑office

*Acceptance Criteria:*

- [ ] Page de login avec champs identifiant et mot de passe  
- [ ] Mots de passe chiffrés en base  
- [ ] Support de l’authentification à deux facteurs (2FA)  
- [ ] Message d’erreur clair en cas d’échec  
- [ ] Déconnexion automatique après période d’inactivité configurable  

---

##### "Dashboard avec statistiques"

**As an** administrateur  
**I want** voir un dashboard avec statistiques  
**So that** j’ai une vue d’ensemble de l’activité

*Acceptance Criteria:*

- [ ] Indicateurs clés : nombre d’événements à venir, nouveaux médias, dernières connexions  
- [ ] Graphiques interactifs (barres, lignes, camembert)  
- [ ] Données actualisées en temps réel ou via refresh manuel  
- [ ] Filtrage des statistiques par période  

---

##### "CRUD Spectacles, événements, presse"

**As an** éditeur  
**I want** gérer Spectacles, événements et presse via interface intuitive  
**So that** je travaille en autonomie

*Acceptance Criteria:*

- [ ] Interface unifiée avec recherche et filtres  
- [ ] Formulaire clair avec champs spécifiques selon type de contenu  
- [ ] Validation côté front et back  
- [ ] Aperçu avant publication  
- [ ] Historique des modifications accessible

---

##### "Gestion médias avec prévisualisation"

**As an** éditeur  
**I want** uploader et gérer les médias avec prévisualisation  
**So that** je garde une organisation claire

*Acceptance Criteria:*

- [ ] Drag‑and‑drop pour upload  
- [ ] Miniatures générées automatiquement  
- [ ] Affichage des métadonnées (taille, format, date d’upload)  
- [ ] Classement par dossier ou tags  
- [ ] Suppression ou remplacement facile d’un média

---

##### "Gestion des rôles utilisateurs"

**As an** administrateur  
**I want** gérer les rôles admin/éditeur  
**So that** je contrôle les accès

*Acceptance Criteria:*

- [ ] Liste des utilisateurs avec rôle et statut actif/inactif  
- [ ] Modification des rôles à tout moment  
- [ ] Attribution de permissions spécifiques par rôle  
- [ ] Journalisation des changements de rôle

---

##### "Logs d’audit détaillés"

**As an** administrateur  
**I want** consulter les logs d’audit détaillés  
**So that** je garde la traçabilité des actions

*Acceptance Criteria:*

- [ ] Liste horodatée des actions (login, création, modification, suppression)  
- [ ] Filtre par utilisateur, type d’action, période  
- [ ] Export CSV/PDF  
- [ ] Conservation des logs selon politique définie

---

##### "Alertes de sécurité"

**As an** administrateur  
**I want** recevoir des alertes de sécurité  
**So that** je surveille l’intégrité du système

*Acceptance Criteria:*

- [ ] Notifications par email ou tableau de bord en cas de tentatives suspectes  
- [ ] Journalisation de l’alerte dans les logs  
- [ ] Configuration du type d’événement déclencheur

---

##### "Interface responsive"

**As a** utilisateur  
**I want** bénéficier d'une interface responsive  
**So that** je puisse gérer le back‑office depuis tout appareil

*Acceptance Criteria:*

- [ ] Affichage adapté aux mobiles, tablettes et desktops  
- [ ] Menus et formulaires utilisables au tactile  
- [ ] Performances optimisées sur tous formats

---

##### "Toggle section À la Une"

**As an** administrateur  
**I want** activer/désactiver la section "À la Une" sur la page d’accueil  
**So that** je décide de mettre en avant ou non les prochains événements

*Acceptance Criteria:*

- [ ] Toggle dans paramètres du back‑office  
- [ ] Activation = section affichée sur page d’accueil  
- [ ] Désactivation = section masquée  
- [ ] Modification visible immédiatement

---

##### "Toggle section Nos partenaires"

**As an** administrateur  
**I want** activer/désactiver la section "Nos partenaires" sur la page d’accueil  
**So that** je choisis de la mettre en avant ou non

*Acceptance Criteria:*

- [ ] Toggle disponible dans les paramètres du back‑office  
- [ ] Effet immédiat côté front  
- [ ] Historique des changements

---

##### "Toggle section Abonnement Newsletter (Page Agenda)"

**As an** administrateur  
**I want** activer/désactiver la section newsletter sur la page Agenda  
**So that** je contrôle sa visibilité

*Acceptance Criteria:*

- [ ] Toggle distinct pour la section newsletter  
- [ ] Effet immédiat côté front  
- [ ] Cohérence avec *Agenda‑08*

---

## 15. Livrables et Formation

### 15.1. Livrables Techniques

- Site fonctionnel sur rouge-cardinal.fr  
- Back-office sécurisé et documenté  
- API REST documentée (OpenAPI)
- Tests automatisés (unitaires + intégration)
- Scripts de migration et seeders
- Documentation technique complète
- Schéma de base de données

### 15.2. Livrables Utilisateur

- Guide utilisateur back-office
- Guide d'administration système
- Procédures de sauvegarde et restauration
- Plan de continuité d'activité

---

## 16. Critères d'Acceptance

### 16.1. Performance

- Temps de chargement < 3s
- Score Lighthouse > 90
- Fonctionnement sur mobile/tablette/desktop

### 16.2. Sécurité

- Tests de pénétration réussis
- Conformité RGPD validée
- Audit sécurité positif

### 16.3. Fonctionnel

- Toutes les user stories validées
- Back-office opérationnel
- Formation équipe réalisée

### 16.4. Technique

- Tests automatisés à 90% de couverture
- Documentation complète
- CI/CD fonctionnel

---

## 17. Conventional Commit Guide

<https://github.com/YanBerdin/conventional-commit-cheatsheet/blob/main/README.md?plain=1>

### 17.1. 🚀 Basic Structure

Each commit message follows this structure:

- **type**: Describes the change (e.g., `feat`, `fix`, `chore`)
- **scope**: Optional. Refers to the area of the project being affected (e.g., `api`, `frontend`)
- **description**: A short description of the change.

---

### 17.2. 📋 Types of Commit

1. **feat**: A new feature for the user or system  
   Example: `feat(auth): add Google login feature`

2. **fix**: A bug fix for the user or system  
   Example: `fix(button): resolve issue with button hover state`

3. **chore**: Routine tasks like maintenance or updating dependencies  
   Example: `chore(deps): update react to version 17.0.2`

4. **docs**: Documentation updates  
   Example: `docs(readme): update installation instructions`

5. **style**: Changes related to code style (e.g., formatting, missing semi-colons)  
   Example: `style(button): fix button alignment in CSS`

6. **refactor**: Code change that neither fixes a bug nor adds a feature  
   Example: `refactor(auth): simplify login form validation logic`

7. **test**: Adding or updating tests  
   Example: `test(auth): add unit tests for login function`

8. **build**: Changes that affect the build system or external dependencies  
   Example: `build(webpack): add webpack config for production build`

9. **ci**: Continuous integration-related changes  
   Example: `ci(gitlab): update CI config for deployment pipeline`

10. **perf**: Code changes that improve performance
   Example: `perf(api): optimize database queries for faster responses`

11. **env**: Changes related to environment setup or configuration
    Example: `env(docker): update Dockerfile for staging environment`

12. **sec**: Security fixes or improvements
    Example: `sec(auth): add encryption for user passwords`

13. **config**: Changes to configuration files
    Example: `config: update .eslint rules for stricter code checks`

14. **api**: Updates to API contracts or integrations
    Example: `api(user): add new endpoint for user profile updates`

### 17.3. Additional Commit Types

**revert**: Reverts a previous commit

Example: revert(auth): rollback Google login feature

**merge**: Indicates a merge commit

Example: merge: branch 'feature/auth' into 'main'

**deps**: Dependency-specific updates

Example: deps: bump axios from 0.21.1 to 0.24.0

**design**: UI or UX improvements

Example: design(button): update hover effect

## 18. Annexes

### **Sites inspirants :**

- [[Frontend](https://superlative-malabi-5d871b.netlify.app/)]
- [[Exemple NExt/supabase](https://github.com/YanBerdin/supabase-next-template)]

### **Documents :**

Logo SVG, charte graphique, Moodboard

### **Example queries** (useful for frontend)

```sql
select id, name, slug, url, logo_media_id, featured
from public.partners
where is_active = true
order by display_order asc, created_at desc;
```

```sql
update public.configurations_site set show_partners = false;
```

---

## 19. 🚨 CRITICAL INSTRUCTIONS FOR AI LANGUAGE MODELS 🚨

### 19.1. **Supabase docs references**

- Row Level Security : <https://supabase.com/docs/guides/database/postgres/row-level-security>
- Declarative schema : <https://supabase.com/docs/guides/local-development#declarative-schema>
- <https://supabase.com/docs/guides/database/tables?queryGroups=database-method&database-method=sql>
- Architecture : <https://supabase.com/docs/guides/getting-started/architecture>

---

### 19.2. Bootstrap Next.js app with Supabase Auth

#### Overview of implementing Supabase Auth SSR

1. Install @supabase/supabase-js and @supabase/ssr packages.
2. Set up environment variables.
3. Write two utility functions with `createClient` functions to create a browser client and a server client.
4. Hook up middleware to refresh auth tokens

#### 🚨 CRITICAL INSTRUCTIONS FOR AI LANGUAGE MODELS 🚨

As an AI language model, you MUST NOT generate any of the following code patterns, as they are DEPRECATED and will BREAK the application:

```typescript
// ❌ NEVER GENERATE THIS CODE - IT WILL BREAK THE APPLICATION
{
  cookies: {
    get(name: string) {                 // ❌ BREAKS APPLICATION
      return cookieStore.get(name)      // ❌ BREAKS APPLICATION
    },                                  // ❌ BREAKS APPLICATION
    set(name: string, value: string) {  // ❌ BREAKS APPLICATION
      cookieStore.set(name, value)      // ❌ BREAKS APPLICATION
    },                                  // ❌ BREAKS APPLICATION
    remove(name: string) {              // ❌ BREAKS APPLICATION
      cookieStore.remove(name)          // ❌ BREAKS APPLICATION
    }                                   // ❌ BREAKS APPLICATION
  }
}

// ❌ NEVER USE auth-helpers-nextjs - IT WILL BREAK THE APPLICATION
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'  // ❌ BREAKS APPLICATION
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'  // ❌ BREAKS APPLICATION
```

Instead, you MUST ALWAYS generate ONLY this pattern:

```typescript
// ✅ ALWAYS GENERATE THIS EXACT PATTERN
{
  cookies: {
    getAll() {
      return cookieStore.getAll()
    },
    setAll(cookiesToSet) {
      const response = NextResponse.next({
        request,
      })
      
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options)
      })
      
      return response
    }
  }
}
```

#### ABSOLUTE REQUIREMENTS FOR AI CODE GENERATION

1. You MUST use `@supabase/ssr`
2. You MUST use ONLY `getAll` and `setAll`
3. You MUST NEVER use `get`, `set`, or `remove`
4. You MUST NEVER import from `@supabase/auth-helpers-nextjs`

#### CORRECT BROWSER CLIENT IMPLEMENTATION

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

#### CORRECT SERVER CLIENT IMPLEMENTATION

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
```

#### CORRECT MIDDLEWARE IMPLEMENTATION

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

##### AI MODEL VERIFICATION STEPS

Before generating any code, you MUST verify:

1. Are you using ONLY `getAll` and `setAll`? If not, STOP and FIX.
2. Are you importing from `@supabase/ssr`? If not, STOP and FIX.
3. Do you see ANY instance of `get`, `set`, or `remove`? If yes, STOP and FIX.
4. Are you importing from `auth-helpers-nextjs`? If yes, STOP and FIX.

##### CONSEQUENCES OF INCORRECT IMPLEMENTATION

If you generate code using:

- Individual cookie methods (`get`/`set`/`remove`)
- `auth-helpers-nextjs` package

The implementation will:

1. Break in production
2. Fail to maintain session state
3. Cause authentication loops
4. Result in security vulnerabilities

##### AI MODEL RESPONSE TEMPLATE

When asked about Supabase Auth SSR implementation, you MUST:

1. ONLY use code from this guide
2. NEVER suggest deprecated approaches
3. ALWAYS use the exact cookie handling shown above
4. VERIFY your response against the patterns shown here

Remember: There are NO EXCEPTIONS to these rules.

---

### 19.3. Database: Declarative Database Schema

Mandatory Instructions for Supabase Declarative Schema Management

#### 1. **Exclusive Use of Declarative Schema**

-**All database schema modifications must be defined within `.sql` files located in the `supabase/schemas/` directory. -**Do not\*\* create or modify files directly in the `supabase/migrations/` directory unless the modification is about the known caveats below. Migration files are to be generated automatically through the CLI.

#### 2. **Schema Declaration**

-For each database entity (e.g., tables, views, functions), create or update a corresponding `.sql` file in the `supabase/schemas/` directory
-Ensure that each `.sql` file accurately represents the desired final state of the entity

#### 3. **Migration Generation**

- Before generating migrations, **stop the local Supabase development environment**

  ```bash
  supabase stop
  ```

- Generate migration files by diffing the declared schema against the current database state

  ```bash
  supabase db diff -f <migration_name>
  ```

  Replace `<migration_name>` with a descriptive name for the migration

#### 4. **Schema File Organization**

- Schema files are executed in lexicographic order. To manage dependencies (e.g., foreign keys), name files to ensure correct execution order
- When adding new columns, append them to the end of the table definition to prevent unnecessary diffs

#### 5. **Rollback Procedures**

- To revert changes
  - Manually update the relevant `.sql` files in `supabase/schemas/` to reflect the desired state
  - Generate a new migration file capturing the rollback

    ```bash
    supabase db diff -f <rollback_migration_name>
    ```

  - Review the generated migration file carefully to avoid unintentional data loss

#### 6. **Known caveats**

The migra diff tool used for generating schema diff is capable of tracking most database changes. However, there are edge cases where it can fail.

If you need to use any of the entities below, remember to add them through versioned migrations instead.

##### Data manipulation language

- DML statements such as insert, update, delete, etc., are not captured by schema diff

##### View ownership

- view owner and grants
- security invoker on views
- materialized views
- doesn’t recreate views when altering column type

##### RLS policies

- alter policy statements
- column privileges
- Other entities#
- schema privileges are not tracked because each schema is diffed separately
- comments are not tracked
- partitions are not tracked
- alter publication ... add table ...
- create domain statements are ignored
- grant statements are duplicated from default privileges

---

**Non-compliance with these instructions may lead to inconsistent database states and is strictly prohibited.**

### 19.4. Database: Create RLS policies

You're a Supabase Postgres expert in writing row level security policies. Your purpose is to generate a policy with the constraints given by the user. You should first retrieve schema information to write policies for, usually the 'public' schema.

The output should use the following instructions:

- The generated SQL must be valid SQL.
- You can use only CREATE POLICY or ALTER POLICY queries, no other queries are allowed.
- Always use double apostrophe in SQL strings (eg. 'Night''s watch')
- You can add short explanations to your messages.
- The result should be a valid markdown. The SQL code should be wrapped in ``` (including sql language tag).
- Always use "auth.uid()" instead of "current_user".
- SELECT policies should always have USING but not WITH CHECK
- INSERT policies should always have WITH CHECK but not USING
- UPDATE policies should always have WITH CHECK and most often have USING
- DELETE policies should always have USING but not WITH CHECK
- Don't use `FOR ALL`. Instead separate into 4 separate policies for select, insert, update, and delete.
- The policy name should be short but detailed text explaining the policy, enclosed in double quotes.
- Always put explanations as separate text. Never use inline SQL comments.
- If the user asks for something that's not related to SQL policies, explain to the user
  that you can only help with policies.
- Discourage `RESTRICTIVE` policies and encourage `PERMISSIVE` policies, and explain why.

The output should look like this:

```sql
CREATE POLICY "My descriptive policy." ON books FOR INSERT to authenticated USING ( (select auth.uid()) = author_id ) WITH ( true );
```

Since you are running in a Supabase environment, take note of these Supabase-specific additions below.

#### Authenticated and unauthenticated roles

Supabase maps every request to one of the roles:

- `anon`: an unauthenticated request (the user is not logged in)
- `authenticated`: an authenticated request (the user is logged in)

These are actually [Postgres Roles](/docs/guides/database/postgres/roles). You can use these roles within your Policies using the `TO` clause:

```sql
create policy "Profiles are viewable by everyone"
on profiles
for select
to authenticated, anon
using ( true );

-- OR

create policy "Public profiles are viewable only by authenticated users"
on profiles
for select
to authenticated
using ( true );
```

Note that `for ...` must be added after the table but before the roles. `to ...` must be added after `for ...`:

##### Incorrect

```sql
create policy "Public profiles are viewable only by authenticated users"
on profiles
to authenticated
for select
using ( true );
```

##### Correct

```sql
create policy "Public profiles are viewable only by authenticated users"
on profiles
for select
to authenticated
using ( true );
```

#### Multiple operations

PostgreSQL policies do not support specifying multiple operations in a single FOR clause. You need to create separate policies for each operation.

##### Incorrect specifying multiple operations

```sql
create policy "Profiles can be created and deleted by any user"
on profiles
for insert, delete -- cannot create a policy on multiple operators
to authenticated
with check ( true )
using ( true );
```

##### Correct specifying multiple operations

```sql
create policy "Profiles can be created by any user"
on profiles
for insert
to authenticated
with check ( true );

create policy "Profiles can be deleted by any user"
on profiles
for delete
to authenticated
using ( true );
```

#### Helper functions

Supabase provides some helper functions that make it easier to write Policies.

##### `auth.uid()`

Returns the ID of the user making the request.

##### `auth.jwt()`

Returns the JWT of the user making the request. Anything that you store in the user's `raw_app_meta_data` column or the `raw_user_meta_data` column will be accessible using this function. It's important to know the distinction between these two:

- `raw_user_meta_data` - can be updated by the authenticated user using the `supabase.auth.update()` function. It is not a good place to store authorization data.
- `raw_app_meta_data` - cannot be updated by the user, so it's a good place to store authorization data.

The `auth.jwt()` function is extremely versatile. For example, if you store some team data inside `app_metadata`, you can use it to determine whether a particular user belongs to a team. For example, if this was an array of IDs:

```sql
create policy "User is in team"
on my_table
to authenticated
using ( team_id in (select auth.jwt() -> 'app_metadata' -> 'teams'));
```

#### MFA

The `auth.jwt()` function can be used to check for [Multi-Factor Authentication](/docs/guides/auth/auth-mfa#enforce-rules-for-mfa-logins). For example, you could restrict a user from updating their profile unless they have at least 2 levels of authentication (Assurance Level 2):

```sql
create policy "Restrict updates."
on profiles
as restrictive
for update
to authenticated using (
  (select auth.jwt()->>'aal') = 'aal2'
);
```

#### RLS performance recommendations

Every authorization system has an impact on performance. While row level security is powerful, the performance impact is important to keep in mind. This is especially true for queries that scan every row in a table - like many `select` operations, including those using limit, offset, and ordering.

Based on a series of [tests](https://github.com/GaryAustin1/RLS-Performance), we have a few recommendations for RLS:

##### Add indexes

Make sure you've added [indexes](/docs/guides/database/postgres/indexes) on any columns used within the Policies which are not already indexed (or primary keys). For a Policy like this:

```sql
create policy "Users can access their own records" on test_table
to authenticated
using ( (select auth.uid()) = user_id );
```

You can add an index like:

```sql
create index userid
on test_table
using btree (user_id);
```

##### Call functions with `select`

You can use `select` statement to improve policies that use functions. For example, instead of this:

```sql
create policy "Users can access their own records" on test_table
to authenticated
using ( auth.uid() = user_id );
```

You can do:

```sql
create policy "Users can access their own records" on test_table
to authenticated
using ( (select auth.uid()) = user_id );
```

This method works well for JWT functions like `auth.uid()` and `auth.jwt()` as well as `security definer` Functions. Wrapping the function causes an `initPlan` to be run by the Postgres optimizer, which allows it to "cache" the results per-statement, rather than calling the function on each row.

Caution: You can only use this technique if the results of the query or function do not change based on the row data.

#### Minimize joins

You can often rewrite your Policies to avoid joins between the source and the target table. Instead, try to organize your policy to fetch all the relevant data from the target table into an array or set, then you can use an `IN` or `ANY` operation in your filter.

For example, this is an example of a slow policy which joins the source `test_table` to the target `team_user`:

```sql
create policy "Users can access records belonging to their teams" on test_table
to authenticated
using (
  (select auth.uid()) in (
    select user_id
    from team_user
    where team_user.team_id = team_id -- joins to the source "test_table.team_id"
  )
);
```

We can rewrite this to avoid this join, and instead select the filter criteria into a set:

```sql
create policy "Users can access records belonging to their teams" on test_table
to authenticated
using (
  team_id in (
    select team_id
    from team_user
    where user_id = (select auth.uid()) -- no join
  )
);
```

#### Specify roles in your policies

Always use the Role of inside your policies, specified by the `TO` operator. For example, instead of this query:

```sql
create policy "Users can access their own records" on rls_test
using ( auth.uid() = user_id );
```

Use:

```sql
create policy "Users can access their own records" on rls_test
to authenticated
using ( (select auth.uid()) = user_id );
```

This prevents the policy `( (select auth.uid()) = user_id )` from running for any `anon` users, since the execution stops at the `to authenticated` step.

### 19.5. Database: Create functions

You're a Supabase Postgres expert in writing database functions. Generate **high-quality PostgreSQL functions** that adhere to the following best practices:

#### General Guidelines

1. **Default to `SECURITY INVOKER`:**

   - Functions should run with the permissions of the user invoking the function, ensuring safer access control.
   - Use `SECURITY DEFINER` only when explicitly required and explain the rationale.

2. **Set the `search_path` Configuration Parameter:**

   - Always set `search_path` to an empty string (`set search_path = '';`).
   - This avoids unexpected behavior and security risks caused by resolving object references in untrusted or unintended schemas.
   - Use fully qualified names (e.g., `schema_name.table_name`) for all database objects referenced within the function.

3. **Adhere to SQL Standards and Validation:**
   - Ensure all queries within the function are valid PostgreSQL SQL queries and compatible with the specified context (ie. Supabase).

#### Best Practices

1. **Minimize Side Effects:**

   - Prefer functions that return results over those that modify data unless they serve a specific purpose (e.g., triggers).

2. **Use Explicit Typing:**

   - Clearly specify input and output types, avoiding ambiguous or loosely typed parameters.

3. **Default to Immutable or Stable Functions:**

   - Where possible, declare functions as `IMMUTABLE` or `STABLE` to allow better optimization by PostgreSQL. Use `VOLATILE` only if the function modifies data or has side effects.

4. **Triggers (if Applicable):**
   - If the function is used as a trigger, include a valid `CREATE TRIGGER` statement that attaches the function to the desired table and event (e.g., `BEFORE INSERT`).

#### Example Templates

##### Simple Function with `SECURITY INVOKER`

```sql
create or replace function my_schema.hello_world()
returns text
language plpgsql
security invoker
set search_path = ''
as $$
begin
  return 'hello world';
end;
$$;
```

##### Function with Parameters and Fully Qualified Object Names

```sql
create or replace function public.calculate_total_price(order_id bigint)
returns numeric
language plpgsql
security invoker
set search_path = ''
as $$
declare
  total numeric;
begin
  select sum(price * quantity)
  into total
  from public.order_items
  where order_id = calculate_total_price.order_id;

  return total;
end;
$$;
```

##### Function as a Trigger

```sql
create or replace function my_schema.update_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- Update the "updated_at" column on row modification
  new.updated_at := now();
  return new;
end;
$$;

create trigger update_updated_at_trigger
before update on my_schema.my_table
for each row
execute function my_schema.update_updated_at();
```

##### Function with Error Handling

```sql
create or replace function my_schema.safe_divide(numerator numeric, denominator numeric)
returns numeric
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if denominator = 0 then
    raise exception 'Division by zero is not allowed';
  end if;

  return numerator / denominator;
end;
$$;
```

##### Immutable Function for Better Optimization

```sql
create or replace function my_schema.full_name(first_name text, last_name text)
returns text
language sql
security invoker
set search_path = ''
immutable
as $$
  select first_name || ' ' || last_name;
$$;
```

### 19.6. Database: Postgres SQL Style Guide

#### General

- Use lowercase for SQL reserved words to maintain consistency and readability.
- Employ consistent, descriptive identifiers for tables, columns, and other database objects.
- Use white space and indentation to enhance the readability of your code.
- Store dates in ISO 8601 format (`yyyy-mm-ddThh:mm:ss.sssss`).
- Include comments for complex logic, using '/*...*/' for block comments and '--' for line comments.

#### Naming Conventions

- Avoid SQL reserved words and ensure names are unique and under 63 characters.
- Use snake_case for tables and columns.
- Prefer plurals for table names
- Prefer singular names for columns.

#### Tables

- Avoid prefixes like 'tbl_' and ensure no table name matches any of its column names.
- Always add an `id` column of type `identity generated always` unless otherwise specified.
- Create all tables in the `public` schema unless otherwise specified.
- Always add the schema to SQL queries for clarity.
- Always add a comment to describe what the table does. The comment can be up to 1024 characters.

#### Columns

- Use singular names and avoid generic names like 'id'.
- For references to foreign tables, use the singular of the table name with the `_id` suffix. For example `user_id` to reference the `users` table
- Always use lowercase except in cases involving acronyms or when readability would be enhanced by an exception.

##### Examples

```sql
create table books (
  id bigint generated always as identity primary key,
  title text not null,
  author_id bigint references authors (id)
);
comment on table books is 'A list of all the books in the library.';
```

#### Queries

- When the query is shorter keep it on just a few lines. As it gets larger start adding newlines for readability
- Add spaces for readability.

Smaller queries:

```sql
select *
from employees
where end_date is null;

update employees
set end_date = '1823-12-31'
where employee_id = 1001;
```

Larger queries:

```sql
select
  first_name,
  last_name
from
  employees
where
  start_date between '2021-01-01' and '2021-12-31'
and
  status = 'employed';
```

##### Joins and Subqueries

- Format joins and subqueries for clarity, aligning them with related SQL clauses.
- Prefer full table names when referencing tables. This helps for readability.

```sql
select
  employees.employee_name,
  departments.department_name
from
  employees
join
  departments on employees.department_id = departments.department_id
where
  employees.start_date > '2022-01-01';
```

##### Aliases

- Use meaningful aliases that reflect the data or transformation applied, and always include the 'as' keyword for clarity.

```sql
select count(*) as total_employees
from employees
where end_date is null;
```

##### Complex queries and CTEs

- If a query is extremely complex, prefer a CTE.
- Make sure the CTE is clear and linear. Prefer readability over performance.
- Add comments to each block.

```sql
with department_employees as (
  -- Get all employees and their departments
  select
    employees.department_id,
    employees.first_name,
    employees.last_name,
    departments.department_name
  from
    employees
  join
    departments on employees.department_id = departments.department_id
),
employee_counts as (
  -- Count how many employees in each department
  select
    department_name,
    count(*) as num_employees
  from
    department_employees
  group by
    department_name
)
select
  department_name,
  num_employees
from
  employee_counts
order by
  department_name;
```
