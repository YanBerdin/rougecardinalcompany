# Plan : Implémenter le rôle Éditeur (permissions hiérarchiques)

## TL;DR

L'audit `doc/audit-permissions.md` est **vérifié et exact** (2 divergences mineures signalées). Le rôle `editor` existe dans le modèle de données mais n'a aucune permission différenciée — c'est un `user` standard bloqué du backoffice. Ce plan implémente un système hiérarchique `user < editor < admin` en 2 lots : Lot A (fondations TS + navigation) puis Lot B (RLS SQL + migration DAL/Actions).

---

## Rapport de vérification de l'audit

### Confirmations (toutes les affirmations vérifiées exactes)

- ✅ `is_admin()` est la seule fonction SQL d'autorisation — `has_min_role()` N'EXISTE PAS
- ✅ `lib/auth/roles.ts` N'EXISTE PAS — aucune hiérarchie de rôles côté TypeScript
- ✅ `requireAdmin()` utilisé partout (115+ occurrences) — modèle binaire admin/non-admin
- ✅ `AdminSidebar.tsx` : aucun filtrage par rôle, 18 items tous visibles pour tout utilisateur authentifié
- ✅ `SetupAccountForm.tsx` : bug confirmé — editor redirigé vers `/admin` puis bloqué par layout guard
- ✅ `app/(admin)/layout.tsx` : unique garde `requireAdmin()` à la ligne 27
- ✅ Toutes les politiques RLS écriture utilisent `is_admin()` sans exception
- ✅ Contrainte `profiles_role_check` accepte `'user'`, `'editor'`, `'admin'`
- ✅ Stockage : bucket `medias` public en lecture, écriture admin-only ; bucket `backups` service_role-only

### Divergences mineures détectées

1. **`events_recurrence`** : n'existe PAS comme table séparée — la récurrence est gérée par colonnes dans `evenements` (`recurrence_rule`, `recurrence_end_date`, `parent_event_id`). Les scripts SQL contiennent du code conditionnel `IF EXISTS` qui ne s'exécute jamais. **Impact : aucune RLS à migrer pour cette table.**
2. **`super_admin`** : les politiques mentionnées dans l'audit sont explicitement **DROP**ées et remplacées par `is_admin()` unifiées. **Impact : aucun résidu super_admin à gérer.**

### Constat additionnel non signalé dans l'audit

- **Inconsistance défense-en-profondeur** : spectacles et media ont des gardes `requireAdmin()` à 2 niveaux (Server Actions + DAL), tandis que agenda et presse n'ont des gardes qu'au niveau DAL (les Server Actions n'appellent PAS `requireAdmin`). Le plan corrige cette inconsistance.

---

## Décisions utilisateur

| Décision | Choix |
| ---------- | ------- |
| Scope éditeur | **Option A — Éditorial** : spectacles, agenda, presse (articles + communiqués), media, compagnie, lieux |
| Contacts presse | **Admin-only** (données RGPD) |
| Pages Accueil (slides/about/partenaires) | **Admin-only** |
| Livraison | **2 lots** (A: fondations, B: permissions) |

### Mapping des droits par page admin

| Route admin | Rôle minimum | Lot |
| ------------- | ------------- | ----- |
| spectacles/ | `editor` | B |
| agenda/ | `editor` | B |
| presse/ (articles + communiqués) | `editor` | B |
| presse/ (contacts) | `admin` | B |
| media/ | `editor` | B |
| compagnie/ | `editor` | B |
| lieux/ | `editor` | B |
| home/ (slides, about, partenaires) | `admin` | A |
| team/ | `admin` | A |
| users/ | `admin` | A |
| analytics/ | `admin` | A |
| audit-logs/ | `admin` | A |
| site-config/ | `admin` | A |
| debug-auth/ | `admin` | A |
| partners/ | `admin` | A |

---

## Lot A — Fondations & Navigation

### Phase 1 : Créer `lib/auth/roles.ts`

Créer le module de hiérarchie de rôles TypeScript :

- Constante `ROLE_HIERARCHY` : `{ user: 0, editor: 1, admin: 2 }` (ou tuple ordonné)
- Type `AppRole = 'user' | 'editor' | 'admin'`
- Fonction `isRoleAtLeast(userRole: AppRole, requiredRole: AppRole): boolean`
- Fonction `getCurrentUserRole(): Promise<AppRole>` — lit `app_metadata.role` via Supabase, fallback `user_metadata.role`, default `'user'`
- Fonction `requireMinRole(requiredRole: AppRole): Promise<void>` — throw si insuffisant (remplace `requireAdmin()`)
- Alias `requireBackofficeAccess = () => requireMinRole('editor')` — pour le layout admin
- Alias `requireAdminOnly = () => requireMinRole('admin')` — pour les pages admin-only

**Fichiers** :

- `lib/auth/roles.ts` — CRÉER (nouveau fichier)
- `lib/auth/is-admin.ts` — NE PAS modifier dans cette phase (garder backward compat)

**Dépendances** : aucune
**Vérification** : Test unitaire script vérifiant que `isRoleAtLeast('editor', 'editor') === true`, `isRoleAtLeast('user', 'editor') === false`, `isRoleAtLeast('admin', 'editor') === true`

---

### Phase 2 : Mettre à jour le layout admin

Modifier `app/(admin)/layout.tsx` ligne 27 : remplacer `requireAdmin()` par `requireBackofficeAccess()` (importé de `lib/auth/roles.ts`).

**Fichiers** :

- `app/(admin)/layout.tsx` — modifier import + appel guard

**Dépend de** : Phase 1
**Vérification** : Un utilisateur `editor` peut accéder au backoffice ; un utilisateur `user` est toujours redirigé.

---

### Phase 3 : Rendre AdminSidebar sensible au rôle

Modifier `components/admin/AdminSidebar.tsx` :

- Ajouter prop `userRole: AppRole` (ou le récupérer via Supabase client)
- Chaque item de menu reçoit un champ `minRole: AppRole`
- Filtrer les items visibles selon `isRoleAtLeast(userRole, item.minRole)`
- Mapping des items :
  - **Éditeur+** : Tableau de bord, Spectacles, Agenda, Lieux, Presse (sans contacts), Compagnie, Médiathèque
  - **Admin-only** : Équipe, Utilisateurs, Slides, About, Partenaires, Analytics, Affichage Sections, Audit Logs, Paramètres, Debug Auth

**Fichiers** :

- `components/admin/AdminSidebar.tsx` — modifier structure des items + ajout filtrage
- Le composant parent qui rend AdminSidebar doit passer le rôle (ou le sidebar le fetch)

**Dépend de** : Phase 1
**Parallélisable avec** : Phase 2
**Vérification** : Un éditeur voit 8 items (dashboard + 7 éditoriaux) ; un admin voit les 18 items.

---

### Phase 4 : Corriger SetupAccountForm.tsx

Modifier `components/auth/SetupAccountForm.tsx` lignes 64-70 :

- Lire le rôle réel de l'utilisateur après setup
- Si `editor` → rediriger vers `/admin` (maintenant autorisé grâce à Phase 2)
- Si `user` → rediriger vers `/` (page publique)
- Si `admin` → rediriger vers `/admin`

**Note** : Ce bug est déjà partiellement résolu par Phase 2 (l'éditeur ne sera plus bloqué), mais le commentaire/logique doit être nettoyé.

**Fichiers** :

- `components/auth/SetupAccountForm.tsx` — modifier la logique de redirection

**Dépend de** : Phase 2
**Vérification** : Un nouvel éditeur invité peut compléter le setup et atterrir sur `/admin`.

---

### Phase 5 : Dashboard conditionnel

Modifier `app/(admin)/admin/page.tsx` pour afficher un dashboard adapté au rôle :

- Éditeur : widgets éditoriaux uniquement (spectacles, agenda, derniers médias)
- Admin : dashboard complet actuel

**Fichiers** :

- `app/(admin)/admin/page.tsx` — ajouter lecture du rôle + rendu conditionnel

**Dépend de** : Phase 1
**Parallélisable avec** : Phases 2-4
**Vérification** : Éditeur voit un dashboard réduit, admin voit tout.

---

### Phase 6 : Protéger les pages admin-only

Pour chaque page admin-only (team, users, analytics, audit-logs, site-config, debug-auth, partners, home/*), ajouter un appel explicite `requireAdminOnly()` dans le Server Component page.tsx :

**Pages à modifier** (ajouter guard explicite) :

- `app/(admin)/admin/team/page.tsx` — déjà `requireAdmin()`, remplacer par `requireAdminOnly()`
- `app/(admin)/admin/users/page.tsx`
- `app/(admin)/admin/analytics/page.tsx`
- `app/(admin)/admin/audit-logs/page.tsx`
- `app/(admin)/admin/site-config/page.tsx`
- `app/(admin)/admin/debug-auth/page.tsx`
- `app/(admin)/admin/partners/page.tsx`
- `app/(admin)/admin/home/*/page.tsx` (slides, about, partenaires — 3 pages)

> **Total : ~10 pages**

Les pages spectacles (qui ont déjà `requireAdmin()` aux lignes explicites dans 4 pages) seront migrées vers `requireMinRole('editor')` dans le Lot B.

**Dépend de** : Phase 1
**Parallélisable avec** : Phases 2-5
**Vérification** : Un éditeur qui tente d'accéder à `/admin/team` est redirigé ou voit une erreur 403 ; un admin accède normalement.

---

## Lot B — Permissions (RLS + DAL + Actions)

### Phase 7 : Créer la fonction SQL `has_min_role()`

Ajouter dans `supabase/schemas/02b_functions_core.sql` :

```bash
public.has_min_role(required_role text) returns boolean
```

- SECURITY DEFINER (comme `is_admin()`)
- STABLE
- `search_path = ''`
- Logique : lire `profiles.role` pour `auth.uid()`, comparer avec la hiérarchie `user(0) < editor(1) < admin(2)`
- `is_admin()` peut être réécrit comme alias de `has_min_role('admin')` (ou conservé pour compat)

**Fichiers** :

- `supabase/schemas/02b_functions_core.sql` — ajouter fonction `has_min_role()`

**Dépend de** : aucune (indépendant du Lot A)
**Vérification** : Tester via SQL : `select public.has_min_role('editor')` pour un utilisateur editor → true, pour un user → false, pour un admin → true.

---

### Phase 8 : Migrer les politiques RLS éditoriales

Remplacer `(select public.is_admin())` par `(select public.has_min_role('editor'))` dans les politiques INSERT/UPDATE/DELETE des tables éditoriales :

**Tables principales** (`61_rls_main_tables.sql`) :

| Table | Politiques à migrer (INSERT/UPDATE/DELETE) |
| ------- | ------------------------------------------- |
| `spectacles` | 3 politiques |
| `evenements` | 3 politiques |
| `media` | 3 politiques |
| `compagnie_presentation_sections` | 3 politiques (note : SELECT garde condition `active = true OR is_admin()` → changer en `active = true OR has_min_role('editor')`) |
| `lieux` | 3 politiques |

**Tables avancées** (`62_rls_advanced_tables.sql`) :

| Table | Politiques à migrer |
| ------- | ------------------- |
| `spectacles_categories` | 3 (INSERT/UPDATE/DELETE) |
| `spectacles_tags` | 3 |
| `spectacles_medias` | 3 |
| `spectacles_membres_equipe` | 3 |
| `articles_categories` | 3 |
| `articles_tags` | 3 |
| `articles_medias` | 3 |
| `articles_presse` | 3 |
| `communiques_presse` | 3 |
| `communiques_categories` | 3 |
| `communiques_tags` | 3 |
| `media_item_tags` | 3 |
| `media_folders` | 3 |
| `categories` | 3 |
| `tags` | 3 |
| `table_compagnie_content` | ? |
| `evenements_recurrence` | ? |
| `categories_tags` | ? |

**Tables qui RESTENT `is_admin()`** :

- `contacts_presse` (admin-only, RGPD)
- `membres_equipe` (admin-only)
- `partners` (admin-only)
- `hero_slides` (admin-only)
- `configurations_site` (admin-only)
- `logs_audit` (admin-only)
- `newsletter_subscribers` (admin-only)
- `profiles` (self-service + admin override, pas de changement)

> **Total : ~20 tables × 3 politiques = ~60 ALTER POLICY**

**Approche** : Utiliser des migrations manuelles (les RLS ne sont pas trackées par le schema diff, cf. instructions Declarative Schema). Créer un fichier `supabase/migrations/YYYYMMDDHHMMSS_editor_role_rls_policies.sql`.

**Fichiers** :

- `supabase/schemas/61_rls_main_tables.sql` — modifier les politiques (source de vérité déclarative)
- `supabase/schemas/62_rls_advanced_tables.sql` — modifier les politiques
- `supabase/migrations/YYYYMMDDHHMMSS_editor_role_rls_policies.sql` — CRÉER migration manuelle

**Dépend de** : Phase 7
**Vérification** : Script SQL testant qu'un editor peut INSERT/UPDATE/DELETE dans spectacles mais PAS dans membres_equipe.

---

### Phase 9 : Migrer les gardes DAL

Remplacer `requireAdmin()` par `requireMinRole('editor')` dans les DAL éditoriaux :

| Module DAL | Occurrences | Pattern actuel |
| ----------- | ------------- | ---------------- |
| `lib/dal/spectacles.ts` | 3 | Defense-in-depth |
| `lib/dal/spectacle-photos.ts` | 8 | Defense-in-depth |
| `lib/dal/admin-agenda.ts` | 7 | Single-layer |
| `lib/dal/admin-press-releases.ts` | 8 | Single-layer |
| `lib/dal/admin-press-articles.ts` | 6 | Single-layer |
| `lib/dal/media.ts` | 20 | Defense-in-depth |
| `lib/dal/admin-compagnie-presentation.ts` | 4 | Single-layer |
| `lib/dal/admin-compagnie-values.ts` | 5 | Single-layer |
| `lib/dal/admin-lieux.ts` | 5 | Single-layer |

**Total : ~66 occurrences `requireAdmin()` → `requireMinRole('editor')`**

Les DAL admin-only (`admin-press-contacts.ts` : 7 occurrences, `team.ts`, `audit-logs.ts`, etc.) restent avec `requireAdmin()` ou migrent vers `requireAdminOnly()` pour cohérence.

**Fichiers** : 9 fichiers DAL ci-dessus
**Dépend de** : Phase 1 (besoin de `requireMinRole`)
**Parallélisable avec** : Phase 8
**Vérification** : Tests scripts existants (`pnpm test:partners` ne doit pas régresser). Créer un script `scripts/test-editor-access-local.ts`.

---

### Phase 10 : Migrer les gardes Server Actions

Remplacer `requireAdmin()` par `requireMinRole('editor')` dans les Actions éditoriales. **ET** ajouter les gardes manquants pour corriger l'inconsistance défense-en-profondeur :

**Actions avec gardes existants** (migration simple) :

| Fichier | Occurrences |
| --------- | ------------- |
| `app/(admin)/admin/spectacles/actions.ts` | 3 |
| `app/(admin)/admin/spectacles/spectacle-photo-actions.ts` | 5 |
| `lib/actions/media-actions.ts` | 3 |

**Actions SANS gardes** (ajouter `requireMinRole('editor')`) :

| Fichier | Actions à protéger |
| --------- | -------------------- |
| `app/(admin)/admin/agenda/actions.ts` | toutes les fonctions mutation |
| `app/(admin)/admin/presse/actions.ts` (ou fichiers équivalents) | articles + communiqués actions |
| `app/(admin)/admin/compagnie/*/actions.ts` | présentation + valeurs actions |
| `app/(admin)/admin/lieux/actions.ts` | si existe |

> **Total : ~11 migrations + ~15-20 ajouts**

**Fichiers** : ~8 fichiers actions
**Dépend de** : Phase 1
**Parallélisable avec** : Phases 8-9
**Vérification** : Vérifier que chaque Server Action éditorial a un guard `requireMinRole('editor')`.

---

### Phase 11 : Politique stockage

Modifier la politique d'écriture du bucket `medias` dans `supabase/schemas/02c_storage_buckets.sql` :

- Remplacer `(select public.is_admin())` par `(select public.has_min_role('editor'))` pour INSERT/UPDATE/DELETE sur `storage.objects` WHERE `bucket_id = 'medias'`

Le bucket `backups` reste `service_role` only (aucun changement).

**Fichiers** :

- `supabase/schemas/02c_storage_buckets.sql` — modifier politiques bucket medias
- `supabase/migrations/YYYYMMDDHHMMSS_editor_storage_policies.sql` — CRÉER migration

**Dépend de** : Phase 7
**Parallélisable avec** : Phases 8-10
**Vérification** : Un editor peut uploader dans le bucket medias via l'interface admin.

---

### Phase 12 : Pages spectacles — migrer les gardes explicites

Les 4 pages spectacles ayant un `requireAdmin()` explicite doivent migrer vers `requireMinRole('editor')` :

- `app/(admin)/admin/spectacles/page.tsx`
- `app/(admin)/admin/spectacles/new/page.tsx`
- `app/(admin)/admin/spectacles/[id]/page.tsx`
- `app/(admin)/admin/spectacles/[id]/edit/page.tsx`

Idem pour compagnie si des pages ont des gardes explicites :

- `app/(admin)/admin/compagnie/presentation/page.tsx` (1 occurrence)
- `app/(admin)/admin/compagnie/valeurs/page.tsx` (1 occurrence)

**Fichiers** : 6 fichiers page.tsx
**Dépend de** : Phase 1
**Parallélisable avec** : Phases 8-11

---

### Phase 13 : Déprécier `requireAdmin()` dans `is-admin.ts`

Une fois toutes les migrations terminées :

- Ajouter un commentaire `@deprecated` sur `requireAdmin()` dans `lib/auth/is-admin.ts`
- S'assurer que les modules admin-only utilisent `requireAdminOnly()` de `roles.ts`
- Ne PAS supprimer `requireAdmin()` immédiatement (backward compat pour modules non migrés)

**Fichiers** :

- `lib/auth/is-admin.ts` — ajouter `@deprecated`

**Dépend de** : Toutes les phases précédentes
**Vérification** : `grep -r "requireAdmin" lib/ app/ components/` ne trouve que les modules admin-only + le fichier déprécié.

---

### Phase 14 (hors plan) : Migration prérequis cloud — fonction `has_min_role()`

Lors du premier `supabase db push --linked`, les migrations Phase 8 et 10 échouaient car la fonction `has_min_role()` n'existait pas encore en cloud (elle était créée via le schéma déclaratif en local, mais le cloud ne l'avait pas). Une migration prérequis dédiée a été créée pour résoudre cette dépendance.

**Fichiers** :

- `supabase/migrations/20260311030000_create_has_min_role_function.sql` (créé) — crée la fonction `has_min_role(required_role text)` en cloud avant les migrations RLS/Storage qui en dépendent.

**Dépend de** : Phase 7 (fonction `has_min_role()` dans le schéma déclaratif)
**Vérification** : `pnpm dlx supabase db push --linked` applique les 3 migrations dans l'ordre sans erreur.

---

### Phase 15 (hors plan) : Correction middleware backoffice — redirect 307 éditeur

Après déploiement cloud, un utilisateur éditeur recevait une redirection 307 systématique sur `/admin`. Le middleware Supabase (`supabase/middleware.ts`) contenait un check `role === "admin"` en dur, bloquant tous les rôles non-admin même s'ils avaient un accès backoffice légitime.

**Cause racine** : `supabase/middleware.ts` comparait `role === "admin"` au lieu d'utiliser la hiérarchie de rôles.

**Correction** : Import de `normalizeRole()` et `isRoleAtLeast()` depuis `lib/auth/role-helpers.ts`. Le middleware prend le max entre `app_metadata.role` et `user_metadata.role` via `normalizeRole()`, puis vérifie `isRoleAtLeast(effectiveRole, "editor")`.

**Fichiers** :

- `supabase/middleware.ts` (modifié) — remplacement du check `role === "admin"` par `isRoleAtLeast(effectiveRole, "editor")`

**Dépend de** : Phase 1 (`role-helpers.ts`)
**Vérification** : Un éditeur accède à `/admin` sans redirection 307. Un simple `user` est toujours redirigé.

---

## Vérification globale

1. **Script test éditeur** : Créer `scripts/test-editor-access-local.ts` qui :
   - Crée un client Supabase avec un token éditeur
   - Vérifie accès SELECT/INSERT/UPDATE/DELETE sur `spectacles` → ✅
   - Vérifie accès SELECT/INSERT/UPDATE/DELETE sur `evenements` → ✅
   - Vérifie accès SELECT/INSERT/UPDATE/DELETE sur `media` → ✅
   - Vérifie accès bloqué sur `membres_equipe` → ❌ (admin-only)
   - Vérifie accès bloqué sur `contacts_presse` → ❌ (admin-only)
   - Vérifie accès bloqué sur `configurations_site` → ❌ (admin-only)

2. **Test E2E navigation** : Vérifier avec un utilisateur éditeur :
   - Peut se connecter et accéder à `/admin` → ✅
   - Voit uniquement les items de menu éditoriaux dans la sidebar → ✅
   - Peut naviguer vers `/admin/spectacles` et créer un spectacle → ✅
   - Ne peut PAS naviguer vers `/admin/team` → redirigé ou 403
   - Ne peut PAS naviguer vers `/admin/analytics` → redirigé ou 403

3. **Test régression admin** : Vérifier qu'un admin garde TOUS les accès existants :
   - `pnpm test:partners` → PASS
   - `pnpm test:audit-logs:dal` → PASS
   - Toutes les pages admin accessibles

4. **Build** : `pnpm build` passe sans erreur TypeScript

---

## Fichiers critiques (récapitulatif)

### À CRÉER

- `lib/auth/roles.ts` — hiérarchie de rôles TS, `requireMinRole()`, `requireBackofficeAccess()`, `requireAdminOnly()`
- `lib/auth/role-helpers.ts` — module pur partagé (`normalizeRole()`, `isRoleAtLeast()`, `ROLE_HIERARCHY`)
- `supabase/migrations/20260311030000_create_has_min_role_function.sql` — prérequis cloud `has_min_role()` (Phase 14)
- `supabase/migrations/20260311030511_editor_storage_policies.sql` — migration stockage (Phase 8)
- `supabase/migrations/20260311120000_editor_role_rls_policies.sql` — migration RLS ~60 ALTER POLICY (Phase 10)
- `scripts/test-editor-access-local.ts` — script de test
- `scripts/test-editor-access-remote.ts` — script de test

### À MODIFIER

- `supabase/schemas/02b_functions_core.sql` — ajouter `has_min_role()` (source déclarative)
- `supabase/schemas/61_rls_main_tables.sql` — migrer politiques éditoriales (source déclarative)
- `supabase/schemas/62_rls_advanced_tables.sql` — migrer politiques éditoriales (source déclarative)
- `supabase/schemas/02c_storage_buckets.sql` — migrer politique bucket medias (source déclarative)
- `supabase/middleware.ts` — remplacement check `role === "admin"` par `isRoleAtLeast(effectiveRole, "editor")` (Phase 15)
- `app/(admin)/layout.tsx` — `requireAdmin()` → `requireBackofficeAccess()`
- `components/admin/AdminSidebar.tsx` — ajout filtrage par rôle
- `components/auth/SetupAccountForm.tsx` — fix redirection éditeur
- `app/(admin)/admin/page.tsx` — dashboard conditionnel
- 10 pages admin-only — ajouter `requireAdminOnly()` explicite
- 6 pages éditoriales — migrer `requireAdmin()` → `requireMinRole('editor')`
- 9 modules DAL éditoriaux — ~66 occurrences à migrer
- ~8 fichiers Server Actions — ~11 migrations + ~15-20 ajouts de gardes
- `lib/auth/is-admin.ts` — déprécier `requireAdmin()`

---

### Bug #1 (hors plan) : Onglet "Contacts Presse" — accès éditeur bloqué

Après déploiement, l'onglet "Contacts" de la page `/admin/presse` retournait une erreur 403 pour les éditeurs. La route API du CRUD contacts presse utilisait `withAdminAuth` (admin-only) au lieu de `withBackofficeAuth` (editor+admin).

**Cause racine** : La route API contacts presse avait conservé le guard `withAdminAuth` alors que les contacts presse sont en lecture pour les éditeurs dans le cadre de leur travail éditorial.

**Correction** : Remplacement de `withAdminAuth` par `withBackofficeAuth` sur la route API concernée.

**Fichiers** :

- Route API contacts presse (modifiée) — `withAdminAuth` → `withBackofficeAuth`

**Dépend de** : Phase 3 (`withBackofficeAuth`)
**Vérification** : Un éditeur peut accéder à l'onglet "Contacts" sans erreur 403.

---

### Bug #2 (hors plan) : Recherche média — accès éditeur bloqué

La route de recherche dans la médiathèque retournait 403 pour les éditeurs, empêchant toute sélection d'image dans les formulaires.

**Cause racine** : `app/api/admin/media/search/route.ts` utilisait `withAdminAuth` au lieu de `withBackofficeAuth`. Or la médiathèque est une ressource éditoriale (les éditeurs doivent pouvoir chercher et téléverser des médias).

**Correction** : Remplacement de `withAdminAuth` par `withBackofficeAuth`.

**Fichiers** :

- `app/api/admin/media/search/route.ts` (modifié) — `withAdminAuth` → `withBackofficeAuth`

**Dépend de** : Phase 3 (`withBackofficeAuth`)
**Vérification** : Un éditeur peut rechercher et sélectionner des médias via la `MediaLibraryPicker`.

---

### Bug #3 (hors plan) : Race condition `isLoading` dans `SpectaclePhotoManager`

Lors de l'ouverture d'un formulaire de spectacle existant, le gestionnaire de photos affichait momentanément des slots vides (état "0 photos") alors que les photos étaient encore en cours de chargement. Ce comportement déclenchait une erreur visuelle et potentiellement des actions utilisateur incorrectes.

**Cause racine** : La condition d'affichage de l'état vide ne tenait pas compte du flag `isLoading`. L'état "aucune photo" était rendu immédiatement avant que la requête de récupération des photos ne soit terminée.

**Correction** : Ajout d'un guard `!isLoading` dans la condition d'affichage de l'état vide du `SpectaclePhotoManager`. Le composant attend la fin du chargement avant de décider si les slots sont réellement vides.

**Fichiers** :

- `SpectaclePhotoManager` (modifié) — correction de la gestion du state `isLoading` pour éviter le flash d'état vide

**Dépend de** : Aucune dépendance de rôle, bug UI indépendant
**Vérification** : L'ouverture d'un spectacle existant avec des photos affiche correctement les photos sans flash d'état vide.

---

### Bug #4 (hors plan) : Galerie photos spectacle — accès éditeur bloqué

Les appels à la galerie de photos d'un spectacle (chargement et ajout) retournaient 403 pour les éditeurs.

**Cause racine** : `app/api/admin/spectacles/[id]/gallery-photos/route.ts` utilisait `withAdminAuth` au lieu de `withBackofficeAuth`. La galerie de photos fait partie du contenu éditorial des spectacles.

**Correction** : Remplacement de `withAdminAuth` par `withBackofficeAuth`.

**Fichiers** :

- `app/api/admin/spectacles/[id]/gallery-photos/route.ts` (modifié) — `withAdminAuth` → `withBackofficeAuth`

**Dépend de** : Phase 3 (`withBackofficeAuth`)
**Vérification** : Un éditeur peut charger et gérer la galerie de photos d'un spectacle.

---

### Bug #5 (hors plan) : `[ERR_PHOTO_001]` à l'édition de spectacle par un éditeur

Lors de l'édition d'un spectacle existant par un éditeur, un ajout de photo retournait `[ERR_PHOTO_001]` même si le spectacle semblait n'avoir aucune photo dans le formulaire.

**Cause racine** : La migration de sécurité `20260220130000_fix_spectacle_admin_views_security.sql` avait ajouté `AND (select public.is_admin()) = true` dans les vues `spectacles_landscape_photos_admin` et `spectacles_gallery_photos_admin`. Or, un éditeur n'est pas admin au sens de `is_admin()` → les vues retournaient 0 lignes pour les éditeurs → le formulaire affichait 0 photos (d'où le Bug #3) → le DAL `addSpectaclePhoto` lisait le nombre réel de photos en base (2 photos existantes) et bloquait l'insertion avec `[ERR_PHOTO_001]` (limite dépassée).

**Chaîne causale** :

1. `spectacles_landscape_photos_admin` et `spectacles_gallery_photos_admin` → filtre `is_admin()` → 0 lignes retournées pour un éditeur
2. `SpectaclePhotoManager` reçoit 0 photos → affiche "aucune photo" (Bug #3)
3. L'éditeur clique "Ajouter une photo" → `addSpectaclePhoto` requête la vraie table (pas la vue) → 2 photos existent → `[ERR_PHOTO_001]` : limite dépassée

**Correction** : Migration `20260311190551_fix_spectacle_photo_views_editor_access.sql` — remplacement de `(select public.is_admin()) = true` par `(select public.has_min_role('editor')) = true` dans les deux vues. Les schémas déclaratifs correspondants ont également été mis à jour.

**Fichiers** :

- `supabase/migrations/20260311190551_fix_spectacle_photo_views_editor_access.sql` (créé) — `is_admin()` → `has_min_role('editor')` dans les deux vues
- `supabase/schemas/41_views_spectacle_photos.sql` (modifié) — source déclarative vue paysage : `is_admin()` → `has_min_role('editor')`
- `supabase/schemas/42_views_spectacle_gallery.sql` (modifié) — source déclarative vue galerie : `is_admin()` → `has_min_role('editor')`
- `supabase/schemas/README.md` (documenté) — note sur la sécurité des vues admin spectacle

**Sécurité préservée** : `SECURITY INVOKER` maintenu sur les deux vues, `REVOKE SELECT FROM anon` conservé, le DAL appelle toujours `requireMinRole('editor')` comme garde côté serveur.

**Dépend de** : Phase 14 (fonction `has_min_role()` disponible en cloud), Phase 10 (RLS éditeur)
**Vérification** : `supabase db push` → `Finished supabase db push.` Un éditeur peut voir et gérer les photos de spectacle sans `[ERR_PHOTO_001]`.

### Total estimé : ~37 fichiers modifiés/créés
