# Tests Permissions et Rôles (TASK076)

> **Version** : 1.0
> **Date** : Mars 2026
> **Contexte** : Modèle hiérarchique `user (0) < editor (1) < admin (2)` implémenté dans TASK076
> **Source de vérité** : [`memory-bank/acl-permissions-role.md`](../memory-bank/acl-permissions-role.md)

---

## Table des matières

1. [Prérequis](#1-prérequis)
2. [Tests unitaires auth/helpers](#2-tests-unitaires-authhelpers)
3. [Tests intégration DAL](#3-tests-intégration-dal)
4. [Tests RLS SQL / scripts](#4-tests-rls-sql--scripts)
5. [Tests E2E](#5-tests-e2e)
6. [Annexe — Conventions](#6-annexe--conventions)

---

## 1. Prérequis

### Comptes de test

| Rôle | Session | `app_metadata.role` | Description |
| --- | --- | --- | --- |
| `anon` | Aucune (pas de session) | n/a | Visiteur non authentifié |
| `user` | Authentifié | `user` | Compte public, aucun accès backoffice |
| `editor` | Authentifié | `editor` | CRUD éditorial, bloqué sur zones admin-only |
| `admin` | Authentifié | `admin` | Accès complet |

### Scripts existants (référence)

- `scripts/test-editor-access-local.ts` — Tests RLS pour rôle `editor` (Supabase local)
- `scripts/test-editor-access-remote.ts` — Tests RLS pour rôle `editor` (Supabase distant)

### Fichiers d'implémentation testés

| Fichier | Rôle |
| --- | --- |
| `lib/auth/role-helpers.ts` | Fonctions pures : `normalizeRole()`, `isRoleAtLeast()`, `ROLE_HIERARCHY`, type `AppRole` |
| `lib/auth/roles.ts` | Guards server : `getCurrentUserRole()`, `requireMinRole()`, `requireBackofficeAccess()`, `requireAdminOnly()`, `requireBackofficePageAccess()`, `requireAdminPageAccess()` |
| `supabase/schemas/02b_functions_core.sql` | SQL : `has_min_role(required_role text)`, `is_admin()` |
| `supabase/schemas/61_rls_main_tables.sql` | Politiques RLS utilisant `has_min_role('editor')` et `is_admin()` |
| `supabase/middleware.ts` | Résolution rôle JWT, protection routes `/admin` et `/api/admin` |
| `components/admin/AdminSidebar.tsx` | Filtrage items sidebar par `minRole` via `isRoleAtLeast()` |

---

## 2. Tests unitaires auth/helpers

### 2.1 — `normalizeRole()` (`lib/auth/role-helpers.ts`)

| ID | Scénario | Input | Résultat attendu | Priorité |
| --- | --- | --- | --- | --- |
| ROLE-UNIT-001 | Rôle valide "admin" | `"admin"` | `"admin"` | P0 |
| ROLE-UNIT-002 | Rôle valide "editor" | `"editor"` | `"editor"` | P0 |
| ROLE-UNIT-003 | Rôle valide "user" | `"user"` | `"user"` | P0 |
| ROLE-UNIT-004 | Rôle en majuscules | `"ADMIN"` | `"admin"` | P1 |
| ROLE-UNIT-005 | Rôle en casse mixte | `"Editor"` | `"editor"` | P1 |
| ROLE-UNIT-006 | Rôle inconnu | `"superadmin"` | `"user"` (fallback) | P0 |
| ROLE-UNIT-007 | Chaîne vide | `""` | `"user"` (fallback) | P1 |
| ROLE-UNIT-008 | Input null | `null` | `"user"` (fallback) | P0 |
| ROLE-UNIT-009 | Input undefined | `undefined` | `"user"` (fallback) | P0 |
| ROLE-UNIT-010 | Input nombre | `42` | `"user"` (fallback) | P1 |
| ROLE-UNIT-011 | Input objet | `{}` | `"user"` (fallback) | P2 |

### 2.2 — `isRoleAtLeast()` (`lib/auth/role-helpers.ts`)

| ID | Scénario | `userRole` | `requiredRole` | Résultat attendu | Priorité |
| --- | --- | --- | --- | --- | --- |
| ROLE-UNIT-012 | Admin ≥ admin | `"admin"` | `"admin"` | `true` | P0 |
| ROLE-UNIT-013 | Admin ≥ editor | `"admin"` | `"editor"` | `true` | P0 |
| ROLE-UNIT-014 | Admin ≥ user | `"admin"` | `"user"` | `true` | P0 |
| ROLE-UNIT-015 | Editor ≥ editor | `"editor"` | `"editor"` | `true` | P0 |
| ROLE-UNIT-016 | Editor ≥ user | `"editor"` | `"user"` | `true` | P0 |
| ROLE-UNIT-017 | Editor < admin | `"editor"` | `"admin"` | `false` | P0 |
| ROLE-UNIT-018 | User ≥ user | `"user"` | `"user"` | `true` | P0 |
| ROLE-UNIT-019 | User < editor | `"user"` | `"editor"` | `false` | P0 |
| ROLE-UNIT-020 | User < admin | `"user"` | `"admin"` | `false` | P0 |

### 2.3 — `ROLE_HIERARCHY` (`lib/auth/role-helpers.ts`)

| ID | Scénario | Résultat attendu | Priorité |
| --- | --- | --- | --- |
| ROLE-UNIT-021 | Hiérarchie user = 0 | `ROLE_HIERARCHY["user"] === 0` | P0 |
| ROLE-UNIT-022 | Hiérarchie editor = 1 | `ROLE_HIERARCHY["editor"] === 1` | P0 |
| ROLE-UNIT-023 | Hiérarchie admin = 2 | `ROLE_HIERARCHY["admin"] === 2` | P0 |
| ROLE-UNIT-024 | Ordre strict user < editor < admin | `0 < 1 < 2` | P0 |

### 2.4 — `getCurrentUserRole()` (`lib/auth/roles.ts`)

| ID | Scénario | Préconditions | Résultat attendu | Priorité |
| --- | --- | --- | --- | --- |
| ROLE-UNIT-025 | Rôle depuis app_metadata | JWT `app_metadata.role = "editor"` | `"editor"` | P0 |
| ROLE-UNIT-026 | Rôle depuis app_metadata admin | JWT `app_metadata.role = "admin"` | `"admin"` | P0 |
| ROLE-UNIT-027 | Fallback user_metadata | JWT `app_metadata.role` absent, `user_metadata.role = "editor"` | `"editor"` | P1 |
| ROLE-UNIT-028 | Aucun rôle défini | JWT sans `role` dans les metadata | `"user"` (fallback) | P0 |
| ROLE-UNIT-029 | Erreur getClaims | `getClaims()` throw | `"user"` (fallback, pas de crash) | P1 |

### 2.5 — `requireMinRole()` (`lib/auth/roles.ts`)

| ID | Scénario | Rôle courant | Rôle requis | Résultat attendu | Priorité |
| --- | --- | --- | --- | --- | --- |
| ROLE-UNIT-030 | Admin passe admin | `admin` | `admin` | Pas d'erreur | P0 |
| ROLE-UNIT-031 | Editor passe editor | `editor` | `editor` | Pas d'erreur | P0 |
| ROLE-UNIT-032 | Editor échoue admin | `editor` | `admin` | Throw `Unauthorized` | P0 |
| ROLE-UNIT-033 | User échoue editor | `user` | `editor` | Throw `Unauthorized` | P0 |

### 2.6 — Wrappers `requireBackofficeAccess()` et `requireAdminOnly()`

| ID | Scénario | Rôle courant | Fonction | Résultat attendu | Priorité |
| --- | --- | --- | --- | --- | --- |
| ROLE-UNIT-034 | Editor a accès backoffice | `editor` | `requireBackofficeAccess()` | Pas d'erreur | P0 |
| ROLE-UNIT-035 | User n'a pas accès backoffice | `user` | `requireBackofficeAccess()` | Throw `Unauthorized` | P0 |
| ROLE-UNIT-036 | Admin a accès admin-only | `admin` | `requireAdminOnly()` | Pas d'erreur | P0 |
| ROLE-UNIT-037 | Editor n'a pas accès admin-only | `editor` | `requireAdminOnly()` | Throw `Unauthorized` | P0 |

### 2.7 — `requireBackofficePageAccess()` et `requireAdminPageAccess()`

| ID | Scénario | Rôle courant | Fonction | Résultat attendu | Priorité |
| --- | --- | --- | --- | --- | --- |
| ROLE-UNIT-038 | Editor passe page backoffice | `editor` | `requireBackofficePageAccess()` | Pas de redirect | P0 |
| ROLE-UNIT-039 | User redirect page backoffice | `user` | `requireBackofficePageAccess()` | `redirect("/auth/login")` | P0 |
| ROLE-UNIT-040 | Pas de session → redirect login | aucun | `requireBackofficePageAccess()` | `redirect("/auth/login")` | P0 |
| ROLE-UNIT-041 | Admin passe page admin | `admin` | `requireAdminPageAccess()` | Pas de redirect | P0 |
| ROLE-UNIT-042 | Editor redirect page admin | `editor` | `requireAdminPageAccess()` | `redirect("/auth/login")` | P0 |

---

## 3. Tests intégration DAL

### 3.1 — Editor : CRUD tables éditoriales (autorisé)

| ID | Scénario | Table | Opération | Résultat attendu | Priorité |
| --- | --- | --- | --- | --- | --- |
| ROLE-DAL-001 | Editor select spectacles | `spectacles` | SELECT | Toutes les lignes (dont brouillons) | P0 |
| ROLE-DAL-002 | Editor insert spectacle | `spectacles` | INSERT | Succès | P0 |
| ROLE-DAL-003 | Editor update spectacle | `spectacles` | UPDATE | Succès | P0 |
| ROLE-DAL-004 | Editor delete spectacle | `spectacles` | DELETE | Succès | P0 |
| ROLE-DAL-005 | Editor select evenements | `evenements` | SELECT | Succès | P0 |
| ROLE-DAL-006 | Editor insert evenement | `evenements` | INSERT | Succès | P0 |
| ROLE-DAL-007 | Editor update evenement | `evenements` | UPDATE | Succès | P0 |
| ROLE-DAL-008 | Editor delete evenement | `evenements` | DELETE | Succès | P0 |
| ROLE-DAL-009 | Editor select medias | `medias` | SELECT | Succès | P0 |
| ROLE-DAL-010 | Editor insert media | `medias` | INSERT | Succès | P0 |
| ROLE-DAL-011 | Editor update media | `medias` | UPDATE | Succès | P0 |
| ROLE-DAL-012 | Editor delete media | `medias` | DELETE | Succès | P0 |
| ROLE-DAL-013 | Editor CRUD media_tags | `media_tags` | CRUD | Succès complet | P1 |
| ROLE-DAL-014 | Editor CRUD media_folders | `media_folders` | CRUD | Succès complet | P1 |
| ROLE-DAL-015 | Editor CRUD media_item_tags | `media_item_tags` | CRUD | Succès complet | P1 |
| ROLE-DAL-016 | Editor CRUD lieux | `lieux` | CRUD | Succès complet | P0 |
| ROLE-DAL-017 | Editor CRUD articles_presse | `articles_presse` | CRUD | Succès complet | P0 |
| ROLE-DAL-018 | Editor CRUD communiques_presse | `communiques_presse` | CRUD | Succès complet | P0 |
| ROLE-DAL-019 | Editor CRUD categories | `categories` | CRUD | Succès complet | P1 |
| ROLE-DAL-020 | Editor CRUD tags | `tags` | CRUD | Succès complet | P1 |
| ROLE-DAL-021 | Editor CRUD spectacles_categories | `spectacles_categories` | CRUD | Succès complet | P1 |
| ROLE-DAL-022 | Editor CRUD spectacles_tags | `spectacles_tags` | CRUD | Succès complet | P1 |
| ROLE-DAL-023 | Editor CRUD compagnie_values | `compagnie_values` | CRUD | Succès complet | P1 |
| ROLE-DAL-024 | Editor CRUD compagnie_stats | `compagnie_stats` | CRUD | Succès complet | P1 |
| ROLE-DAL-025 | Editor CRUD compagnie_presentation_sections | `compagnie_presentation_sections` | CRUD | Succès complet | P1 |
| ROLE-DAL-026 | Editor CRUD spectacles_medias | `spectacles_medias` | CRUD | Succès complet | P1 |
| ROLE-DAL-027 | Editor CRUD articles_medias | `articles_medias` | CRUD | Succès complet | P1 |
| ROLE-DAL-028 | Editor CRUD communiques_medias | `communiques_medias` | CRUD | Succès complet | P1 |
| ROLE-DAL-029 | Editor CRUD articles_categories | `articles_categories` | CRUD | Succès complet | P2 |
| ROLE-DAL-030 | Editor CRUD articles_tags | `articles_tags` | CRUD | Succès complet | P2 |
| ROLE-DAL-031 | Editor CRUD communiques_categories | `communiques_categories` | CRUD | Succès complet | P2 |
| ROLE-DAL-032 | Editor CRUD communiques_tags | `communiques_tags` | CRUD | Succès complet | P2 |

### 3.2 — Editor : tables admin-only (bloqué)

| ID | Scénario | Table | Opération | Résultat attendu | Priorité |
| --- | --- | --- | --- | --- | --- |
| ROLE-DAL-033 | Editor bloqué insert membres_equipe | `membres_equipe` | INSERT | Refusé (RLS) | P0 |
| ROLE-DAL-034 | Editor bloqué update membres_equipe | `membres_equipe` | UPDATE | Refusé (RLS) | P0 |
| ROLE-DAL-035 | Editor bloqué delete membres_equipe | `membres_equipe` | DELETE | Refusé (RLS) | P0 |
| ROLE-DAL-036 | Editor bloqué insert contacts_presse | `contacts_presse` | INSERT | Refusé (RLS) | P0 |
| ROLE-DAL-037 | Editor bloqué update contacts_presse | `contacts_presse` | UPDATE | Refusé (RLS) | P0 |
| ROLE-DAL-038 | Editor bloqué insert partners | `partners` | INSERT | Refusé (RLS) | P0 |
| ROLE-DAL-039 | Editor bloqué update partners | `partners` | UPDATE | Refusé (RLS) | P0 |
| ROLE-DAL-040 | Editor bloqué delete partners | `partners` | DELETE | Refusé (RLS) | P0 |
| ROLE-DAL-041 | Editor bloqué CRUD configurations_site | `configurations_site` | INSERT/UPDATE | Refusé (RLS) | P0 |
| ROLE-DAL-042 | Editor bloqué CRUD user_invitations | `user_invitations` | INSERT | Refusé (RLS) | P0 |
| ROLE-DAL-043 | Editor bloqué CRUD home_hero_slides | `home_hero_slides` | INSERT/UPDATE | Refusé (RLS) | P1 |
| ROLE-DAL-044 | Editor bloqué CRUD home_about_content | `home_about_content` | INSERT/UPDATE | Refusé (RLS) | P1 |
| ROLE-DAL-045 | Editor bloqué CRUD seo_redirects | `seo_redirects` | INSERT | Refusé (RLS) | P2 |
| ROLE-DAL-046 | Editor bloqué CRUD spectacles_membres_equipe | `spectacles_membres_equipe` | INSERT | Refusé (RLS) | P1 |
| ROLE-DAL-047 | Editor bloqué select logs_audit | `logs_audit` | SELECT | Aucune ligne retournée | P1 |
| ROLE-DAL-048 | Editor bloqué select content_versions | `content_versions` | SELECT | Aucune ligne retournée | P2 |

### 3.3 — Admin : accès complet (vérification)

| ID | Scénario | Table | Opération | Résultat attendu | Priorité |
| --- | --- | --- | --- | --- | --- |
| ROLE-DAL-049 | Admin CRUD spectacles | `spectacles` | CRUD | Succès complet | P0 |
| ROLE-DAL-050 | Admin CRUD membres_equipe | `membres_equipe` | CRUD | Succès complet | P0 |
| ROLE-DAL-051 | Admin CRUD partners | `partners` | CRUD | Succès complet | P0 |
| ROLE-DAL-052 | Admin CRUD contacts_presse | `contacts_presse` | CRUD | Succès complet | P0 |
| ROLE-DAL-053 | Admin CRUD configurations_site | `configurations_site` | CRUD | Succès complet | P0 |
| ROLE-DAL-054 | Admin CRUD user_invitations | `user_invitations` | CRUD | Succès complet | P1 |
| ROLE-DAL-055 | Admin CRUD home_hero_slides | `home_hero_slides` | CRUD | Succès complet | P1 |
| ROLE-DAL-056 | Admin CRUD home_about_content | `home_about_content` | CRUD | Succès complet | P1 |
| ROLE-DAL-057 | Admin select logs_audit | `logs_audit` | SELECT | Lignes retournées | P1 |
| ROLE-DAL-058 | Admin select content_versions | `content_versions` | SELECT | Lignes retournées | P2 |

### 3.4 — User : aucun accès écriture (bloqué)

| ID | Scénario | Table | Opération | Résultat attendu | Priorité |
| --- | --- | --- | --- | --- | --- |
| ROLE-DAL-059 | User bloqué insert spectacles | `spectacles` | INSERT | Refusé (RLS) | P0 |
| ROLE-DAL-060 | User bloqué update spectacles | `spectacles` | UPDATE | Refusé (RLS) | P0 |
| ROLE-DAL-061 | User bloqué delete spectacles | `spectacles` | DELETE | Refusé (RLS) | P0 |
| ROLE-DAL-062 | User bloqué insert evenements | `evenements` | INSERT | Refusé (RLS) | P0 |
| ROLE-DAL-063 | User bloqué insert medias | `medias` | INSERT | Autorisé (authenticated peut upload) | P1 |
| ROLE-DAL-064 | User bloqué update medias (pas owner) | `medias` | UPDATE | Refusé (RLS — pas owner, pas editor+) | P1 |
| ROLE-DAL-065 | User bloqué insert membres_equipe | `membres_equipe` | INSERT | Refusé (RLS) | P0 |
| ROLE-DAL-066 | User bloqué insert partners | `partners` | INSERT | Refusé (RLS) | P0 |
| ROLE-DAL-067 | User bloqué insert configurations_site | `configurations_site` | INSERT | Refusé (RLS) | P1 |
| ROLE-DAL-068 | User select spectacles publics seuls | `spectacles` | SELECT | Uniquement public=true + published/archived | P0 |

---

## 4. Tests RLS SQL / scripts

> **Note :** Les scripts `test-editor-access-local.ts` et `test-editor-access-remote.ts` couvrent déjà une partie de ces cas pour le rôle `editor`. Les cas ci-dessous complètent la couverture pour `anon` et `user`.

### 4.1 — Anon : lecture publique uniquement

| ID | Scénario | Table | Opération | Résultat attendu | Priorité |
| --- | --- | --- | --- | --- | --- |
| ROLE-RLS-001 | Anon select spectacles | `spectacles` | SELECT | Uniquement `public=true AND status IN ('published','archived')` | P0 |
| ROLE-RLS-002 | Anon select evenements | `evenements` | SELECT | Toutes les lignes (lecture publique) | P0 |
| ROLE-RLS-003 | Anon select membres_equipe | `membres_equipe` | SELECT | Uniquement `active=true` | P0 |
| ROLE-RLS-004 | Anon select partners | `partners` | SELECT | Uniquement `is_active=true` | P0 |
| ROLE-RLS-005 | Anon select articles_presse | `articles_presse` | SELECT | Uniquement `published_at IS NOT NULL` | P0 |
| ROLE-RLS-006 | Anon select communiques_presse | `communiques_presse` | SELECT | Uniquement `public=true` | P0 |
| ROLE-RLS-007 | Anon select contacts_presse | `contacts_presse` | SELECT | Aucune ligne (non public) | P0 |
| ROLE-RLS-008 | Anon select medias | `medias` | SELECT | Toutes les lignes (lecture publique) | P1 |
| ROLE-RLS-009 | Anon select configurations_site | `configurations_site` | SELECT | Partiellement (`display_toggle_%`) | P1 |
| ROLE-RLS-010 | Anon insert toute table | toute | INSERT | Refusé (sauf `analytics_events`, `abonnes_newsletter`, `messages_contact`) | P0 |
| ROLE-RLS-011 | Anon select logs_audit | `logs_audit` | SELECT | Aucune ligne | P0 |
| ROLE-RLS-012 | Anon select user_invitations | `user_invitations` | SELECT | Aucune ligne | P1 |
| ROLE-RLS-013 | Anon select categories | `categories` | SELECT | Uniquement `is_active=true` | P1 |
| ROLE-RLS-014 | Anon select tags | `tags` | SELECT | Toutes les lignes | P2 |

### 4.2 — User (authenticated) : lecture publique, écriture bloquée

| ID | Scénario | Table | Opération | Résultat attendu | Priorité |
| --- | --- | --- | --- | --- | --- |
| ROLE-RLS-015 | User select spectacles | `spectacles` | SELECT | Comme anon (public + published/archived seulement) | P0 |
| ROLE-RLS-016 | User insert spectacles | `spectacles` | INSERT | Refusé (`has_min_role('editor')` = false) | P0 |
| ROLE-RLS-017 | User update spectacles | `spectacles` | UPDATE | Refusé | P0 |
| ROLE-RLS-018 | User delete spectacles | `spectacles` | DELETE | Refusé | P0 |
| ROLE-RLS-019 | User insert evenements | `evenements` | INSERT | Refusé | P0 |
| ROLE-RLS-020 | User insert membres_equipe | `membres_equipe` | INSERT | Refusé (`is_admin()` = false) | P0 |
| ROLE-RLS-021 | User insert partners | `partners` | INSERT | Refusé | P0 |
| ROLE-RLS-022 | User insert contacts_presse | `contacts_presse` | INSERT | Refusé | P0 |
| ROLE-RLS-023 | User select logs_audit | `logs_audit` | SELECT | Aucune ligne | P1 |
| ROLE-RLS-024 | User insert analytics_events | `analytics_events` | INSERT | Autorisé (insert public validé) | P1 |
| ROLE-RLS-025 | User insert messages_contact | `messages_contact` | INSERT | Autorisé | P1 |
| ROLE-RLS-026 | User insert abonnes_newsletter | `abonnes_newsletter` | INSERT | Autorisé | P2 |

### 4.3 — Editor : CRUD éditorial, bloqué admin-only

> **Couvert en partie par les scripts existants.** Nouveaux cas complémentaires :

| ID | Scénario | Table | Opération | Résultat attendu | Priorité |
| --- | --- | --- | --- | --- | --- |
| ROLE-RLS-027 | Editor select spectacles (tous) | `spectacles` | SELECT | Toutes les lignes (dont brouillons, grâce à `has_min_role('editor')`) | P0 |
| ROLE-RLS-028 | Editor insert spectacle | `spectacles` | INSERT | Succès | P0 |
| ROLE-RLS-029 | Editor update spectacle | `spectacles` | UPDATE | Succès | P0 |
| ROLE-RLS-030 | Editor delete spectacle | `spectacles` | DELETE | Succès | P0 |
| ROLE-RLS-031 | Editor CRUD evenements | `evenements` | CRUD | Succès complet | P0 |
| ROLE-RLS-032 | Editor CRUD lieux | `lieux` | CRUD | Succès complet | P0 |
| ROLE-RLS-033 | Editor CRUD medias | `medias` | CRUD | Succès complet | P0 |
| ROLE-RLS-034 | Editor CRUD media_tags | `media_tags` | CRUD | Succès complet | P1 |
| ROLE-RLS-035 | Editor CRUD media_folders | `media_folders` | CRUD | Succès complet | P1 |
| ROLE-RLS-036 | Editor CRUD media_item_tags | `media_item_tags` | CRUD | Succès complet | P1 |
| ROLE-RLS-037 | Editor CRUD articles_presse | `articles_presse` | CRUD | Succès complet | P0 |
| ROLE-RLS-038 | Editor CRUD communiques_presse | `communiques_presse` | CRUD | Succès complet | P0 |
| ROLE-RLS-039 | Editor bloqué insert membres_equipe | `membres_equipe` | INSERT | Refusé (`is_admin()`) | P0 |
| ROLE-RLS-040 | Editor bloqué insert partners | `partners` | INSERT | Refusé (`is_admin()`) | P0 |
| ROLE-RLS-041 | Editor bloqué insert contacts_presse | `contacts_presse` | INSERT | Refusé (`is_admin()`) | P0 |
| ROLE-RLS-042 | Editor bloqué insert configurations_site | `configurations_site` | INSERT | Refusé (`is_admin()`) | P0 |
| ROLE-RLS-043 | Editor bloqué insert home_hero_slides | `home_hero_slides` | INSERT | Refusé (`is_admin()`) | P1 |
| ROLE-RLS-044 | Editor bloqué insert home_about_content | `home_about_content` | INSERT | Refusé (`is_admin()`) | P1 |
| ROLE-RLS-045 | Editor bloqué CRUD spectacles_membres_equipe | `spectacles_membres_equipe` | INSERT | Refusé (`is_admin()`) | P1 |
| ROLE-RLS-046 | Editor select logs_audit | `logs_audit` | SELECT | Aucune ligne | P1 |
| ROLE-RLS-047 | Editor select content_versions | `content_versions` | SELECT | Aucune ligne | P2 |

### 4.4 — Admin : accès complet

| ID | Scénario | Table | Opération | Résultat attendu | Priorité |
| --- | --- | --- | --- | --- | --- |
| ROLE-RLS-048 | Admin select spectacles (tous) | `spectacles` | SELECT | Toutes les lignes | P0 |
| ROLE-RLS-049 | Admin CRUD membres_equipe | `membres_equipe` | CRUD | Succès complet | P0 |
| ROLE-RLS-050 | Admin CRUD partners | `partners` | CRUD | Succès complet | P0 |
| ROLE-RLS-051 | Admin CRUD contacts_presse | `contacts_presse` | CRUD | Succès complet | P0 |
| ROLE-RLS-052 | Admin CRUD configurations_site | `configurations_site` | CRUD | Succès complet | P0 |
| ROLE-RLS-053 | Admin CRUD home_hero_slides | `home_hero_slides` | CRUD | Succès complet | P1 |
| ROLE-RLS-054 | Admin CRUD home_about_content | `home_about_content` | CRUD | Succès complet | P1 |
| ROLE-RLS-055 | Admin select logs_audit | `logs_audit` | SELECT | Lignes retournées | P1 |
| ROLE-RLS-056 | Admin select content_versions | `content_versions` | SELECT | Lignes retournées | P2 |
| ROLE-RLS-057 | Admin CRUD user_invitations | `user_invitations` | CRUD | Succès complet | P1 |
| ROLE-RLS-058 | Admin CRUD seo_redirects | `seo_redirects` | CRUD | Succès complet | P2 |

### 4.5 — Fonctions SQL `has_min_role()` et `is_admin()`

| ID | Scénario | Fonction | Rôle appelant | Résultat attendu | Priorité |
| --- | --- | --- | --- | --- | --- |
| ROLE-RLS-059 | admin → has_min_role('editor') | `has_min_role('editor')` | admin | `true` | P0 |
| ROLE-RLS-060 | editor → has_min_role('editor') | `has_min_role('editor')` | editor | `true` | P0 |
| ROLE-RLS-061 | user → has_min_role('editor') | `has_min_role('editor')` | user | `false` | P0 |
| ROLE-RLS-062 | any → has_min_role('user') | `has_min_role('user')` | user | `true` | P1 |
| ROLE-RLS-063 | admin → is_admin() | `is_admin()` | admin | `true` | P0 |
| ROLE-RLS-064 | editor → is_admin() | `is_admin()` | editor | `false` | P0 |
| ROLE-RLS-065 | user → is_admin() | `is_admin()` | user | `false` | P0 |
| ROLE-RLS-066 | rôle invalide → has_min_role() | `has_min_role('superadmin')` | admin | `false` (rôle invalide) | P2 |

---

## 5. Tests E2E

> **Infrastructure Playwright non encore en place.** Ces cas sont documentés pour implémentation future.

### 5.1 — Parcours Editor

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Priorité |
| --- | --- | --- | --- | --- | --- |
| ROLE-E2E-001 | Editor login → dashboard | Compte editor | 1. Login avec credentials editor 2. Attendre redirection | Dashboard affiché, titre "Tableau de bord" | P0 |
| ROLE-E2E-002 | Editor sidebar filtrée | Connecté editor | 1. Vérifier items sidebar visibles | 8 items visibles : Tableau de bord, Spectacles, Agenda, Lieux, Presse, Compagnie, Médiathèque, Retour au site | P0 |
| ROLE-E2E-003 | Editor sidebar — items admin masqués | Connecté editor | 1. Vérifier items sidebar | Équipe, Utilisateurs, Accueil-Slides, Accueil-Compagnie, Partenaires, Analytics, Affichage Sections, Audit Logs, Paramètres, Debug Auth NON visibles | P0 |
| ROLE-E2E-004 | Editor CRUD spectacle | Connecté editor | 1. Naviguer `/admin/spectacles` 2. Créer un spectacle 3. Modifier 4. Supprimer | CRUD complet fonctionne | P0 |
| ROLE-E2E-005 | Editor CRUD événement | Connecté editor | 1. Naviguer `/admin/agenda` 2. Créer un événement 3. Modifier 4. Supprimer | CRUD complet fonctionne | P1 |
| ROLE-E2E-006 | Editor page admin-only bloquée | Connecté editor | 1. Naviguer directement vers `/admin/team` | Redirection vers `/admin` ou `/auth/login` | P0 |
| ROLE-E2E-007 | Editor page analytics bloquée | Connecté editor | 1. Naviguer vers `/admin/analytics` | Redirection vers `/admin` ou `/auth/login` | P0 |
| ROLE-E2E-008 | Editor page users bloquée | Connecté editor | 1. Naviguer vers `/admin/users` | Redirection vers `/admin` ou `/auth/login` | P1 |
| ROLE-E2E-009 | Editor page site-config bloquée | Connecté editor | 1. Naviguer vers `/admin/site-config` | Redirection vers `/admin` ou `/auth/login` | P1 |
| ROLE-E2E-010 | Editor page presse/contacts bloquée | Connecté editor | 1. Naviguer vers `/admin/presse/contacts/new` | Redirection ou message erreur | P1 |

### 5.2 — Parcours Admin

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Priorité |
| --- | --- | --- | --- | --- | --- |
| ROLE-E2E-011 | Admin login → dashboard complet | Compte admin | 1. Login avec credentials admin 2. Attendre redirection | Dashboard complet affiché | P0 |
| ROLE-E2E-012 | Admin sidebar complète | Connecté admin | 1. Vérifier items sidebar visibles | 18 items visibles (toutes les sections) | P0 |
| ROLE-E2E-013 | Admin accès toutes pages | Connecté admin | 1. Naviguer séquentiellement : `/admin/team`, `/admin/users`, `/admin/analytics`, `/admin/site-config`, `/admin/audit-logs` | Toutes les pages s'affichent | P0 |
| ROLE-E2E-014 | Admin CRUD membres_equipe | Connecté admin | 1. Naviguer `/admin/team` 2. Créer/modifier/supprimer | CRUD complet fonctionne | P1 |
| ROLE-E2E-015 | Admin CRUD partners | Connecté admin | 1. Naviguer `/admin/partners` 2. Créer/modifier/supprimer | CRUD complet fonctionne | P1 |

### 5.3 — Parcours User (bloqué)

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Priorité |
| --- | --- | --- | --- | --- | --- |
| ROLE-E2E-016 | User bloqué /admin | Connecté user | 1. Naviguer vers `/admin` | Redirection vers `/auth/login` | P0 |
| ROLE-E2E-017 | User bloqué /admin/spectacles | Connecté user | 1. Naviguer vers `/admin/spectacles` | Redirection vers `/auth/login` | P0 |
| ROLE-E2E-018 | User bloqué /admin/team | Connecté user | 1. Naviguer vers `/admin/team` | Redirection vers `/auth/login` | P1 |

### 5.4 — Parcours Anon (bloqué)

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Priorité |
| --- | --- | --- | --- | --- | --- |
| ROLE-E2E-019 | Anon bloqué /admin | Aucune session | 1. Naviguer vers `/admin` | Redirection vers `/auth/login` | P0 |
| ROLE-E2E-020 | Anon bloqué /admin/spectacles | Aucune session | 1. Naviguer vers `/admin/spectacles` | Redirection vers `/auth/login` | P0 |

### 5.5 — Middleware et API

| ID | Scénario | Préconditions | Étapes | Résultat attendu | Priorité |
| --- | --- | --- | --- | --- | --- |
| ROLE-E2E-021 | API admin — Editor bloqué | Connecté editor | 1. `fetch('/api/admin/...')` avec session editor | Réponse 403 JSON `{ error: "Forbidden" }` | P0 |
| ROLE-E2E-022 | API admin — User bloqué | Connecté user | 1. `fetch('/api/admin/...')` avec session user | Réponse 403 JSON `{ error: "Forbidden" }` | P0 |
| ROLE-E2E-023 | API admin — Anon bloqué | Aucune session | 1. `fetch('/api/admin/...')` sans cookie | Réponse 403 JSON `{ error: "Forbidden" }` | P0 |
| ROLE-E2E-024 | API admin — Admin autorisé | Connecté admin | 1. `fetch('/api/admin/...')` avec session admin | Réponse 200 | P0 |
| ROLE-E2E-025 | Middleware fallback user_metadata | JWT `user_metadata.role = "editor"`, pas de `app_metadata.role` | 1. Naviguer vers `/admin` | Accès accordé (fallback user_metadata) | P2 |

---

## 6. Annexe — Conventions

### Préfixes des IDs de test

| Préfixe | Catégorie | Nombre de cas |
| --- | --- | --- |
| `ROLE-UNIT-` | Tests unitaires auth/helpers | 42 |
| `ROLE-DAL-` | Tests intégration DAL | 68 |
| `ROLE-RLS-` | Tests RLS SQL / scripts | 66 |
| `ROLE-E2E-` | Tests E2E Playwright | 25 |
| **Total** | | **201** |

### Priorités

| Priorité | Signification | Quand tester |
| --- | --- | --- |
| P0 | Bloquant — Sécurité critique | Chaque PR |
| P1 | Important — Fonctionnel attendu | Chaque release |
| P2 | Confort — Edge case | Mensuel |

### Répartition par priorité

| Priorité | Nombre de cas |
| --- | --- |
| P0 | ~95 |
| P1 | ~75 |
| P2 | ~31 |

### Lien avec le plan de test principal

Ce fichier est référencé depuis [`specs/PLAN_DE_TEST_COMPLET.md`](PLAN_DE_TEST_COMPLET.md) :

- Section 2 (Prérequis) — note de renvoi
- Section 6.4 (Protection des routes) — AUTH-PROTECT-004 à 007
- Section 21.4 (Sécurité) — CROSS-SEC-006 à 010 + note de renvoi
