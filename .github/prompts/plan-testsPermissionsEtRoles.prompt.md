# Plan : Tests permissions et rôles (TASK076)

## TL;DR

Suite à l'implémentation du modèle hiérarchique `user < editor < admin` (TASK076), créer un plan de tests structuré couvrant 4 niveaux de tests (unit auth/helpers, DAL intégration, RLS SQL, E2E). Livrable : un fichier dédié `specs/tests-permissions-et-rôles.md` (~120 cas de test). Le patch dans `specs/PLAN_DE_TEST_COMPLET.md` (comptes de test, sections auth/sécurité) a déjà été appliqué (Phase B terminée).

---

## Contexte

- Le plan de test existant (`PLAN_DE_TEST_COMPLET.md` v1.0, juillet 2025) a été écrit AVANT TASK076 : tous les scénarios admin supposent un seul rôle `admin`, pas de rôle `editor`.
- Le plan est structuré en 4 catégories de tests : unit auth/helpers, DAL intégration, RLS SQL, E2E.
- Des scripts de test RLS existent déjà (`scripts/test-editor-access-local.ts`, `scripts/test-editor-access-remote.ts`) mais couvrent uniquement le RLS SQL pour `editor`.
- Aucun test unitaire pour `role-helpers.ts` ni `roles.ts` n'existe.
- Aucun test E2E Playwright n'existe (infrastructure documentée mais non implémentée).

---

## Steps

### Phase A — Nouveau fichier `specs/tests-permissions-et-rôles.md`

**1. Section Pré-requis** — **parallel avec step 2**
- Définir les 4 comptes de test nécessaires : anon (pas de session), user (authenticated, role=user), editor (role=editor), admin (role=admin)
- Référencer les scripts existants qui provisionnent ces comptes

**2. Section 1 : Tests unitaires auth/helpers** — **parallel avec step 1**
- Tableaux de cas pour les fonctions pures de `lib/auth/role-helpers.ts` : `normalizeRole()`, `isRoleAtLeast()`, `ROLE_HIERARCHY`
- Tableaux de cas pour les fonctions server de `lib/auth/roles.ts` : `getCurrentUserRole()`, `requireMinRole()`, `requireBackofficeAccess()`, `requireAdminOnly()`
- ~20 cas de test couvrant : valeurs valides, valeurs invalides/unknown, fallback, hiérarchie correcte

**3. Section 2 : Tests intégration DAL** — **depends on 1**
- Matrice editor CRUD : 6 tables éditoriales × 4 opérations (select/insert/update/delete) = 24 cas
- Matrice editor BLOCKED : tables admin-only (membres_equipe, contacts_presse, configurations_site, partners, user_invitations, etc.) = ~20 cas
- Matrice admin CRUD : vérifier que admin a accès à tout = ~10 cas
- Matrice user BLOCKED : vérifier que simple authenticated user est bloqué sur toutes les tables admin/editorial write = ~10 cas

**4. Section 3 : Tests RLS SQL / scripts** — **parallel avec step 3**
- Matrice 4 rôles × N tables : anon (lecture publique seule), authenticated user (lecture publique, écriture bloquée), editor (CRUD éditorial, bloqué admin-only), admin (accès complet)
- Organisation par priorité de table (critique → haute → moyenne)
- Référence aux scripts existants `test-editor-access-local.ts` et `test-editor-access-remote.ts`
- Nouveaux cas pour `anon` et `authenticated user` non couverts par les scripts existants

**5. Section 4 : Tests E2E** — **depends on 2, 3**
- Parcours E2E editor : login → dashboard → sidebar filtrée → CRUD spectacle → page admin-only bloquée
- Parcours E2E admin : login → dashboard complet → sidebar complète → accès toutes pages
- Parcours E2E user : login → redirection/blocage backoffice
- Tests sidebar : items visibles par rôle (editor voit 8 items, admin voit 18 items)
- Tests middleware : redirection silencieuse sur pages non autorisées

### Phase B — Patch `specs/PLAN_DE_TEST_COMPLET.md` ✅ TERMINÉE

> **Déjà appliqué.** Les modifications ci-dessous sont déjà présentes dans le fichier.

**6. Section 2 (Prérequis)** — ✅ Fait
- Comptes editor et user ajoutés dans le tableau des comptes de test
- Note ajoutée : "Voir `specs/tests-permissions-et-rôles.md` pour le plan détaillé permissions"

**7. Section 6.4 (Protection des routes)** — ✅ Fait
- AUTH-PROTECT-004 à 007 ajoutés : editor accès OK au dashboard, editor bloqué sur /admin/team, user bloqué sur /admin, user bloqué sur /admin/spectacles

**8. Section 21.4 (Sécurité)** — ✅ Fait
- CROSS-SEC-006 à CROSS-SEC-010 ajoutés : tests RLS pour editor, tests middleware role, test API admin refusée pour editor sur routes admin-only

---

## Relevant files

### À générer
- `specs/tests-permissions-et-rôles.md` — Plan de tests dédié (4 sections, ~120 cas de test)

### Déjà modifié ✅
- `specs/PLAN_DE_TEST_COMPLET.md` — Sections 2, 6.4, 21.4 déjà patchées (comptes + ~10 cas)

### Référence (implémentation à tester)
- `lib/auth/role-helpers.ts` — Fonctions pures : `normalizeRole()`, `isRoleAtLeast()`, type `AppRole`, `ROLE_HIERARCHY`
- `lib/auth/roles.ts` — Guards server : `getCurrentUserRole()`, `requireMinRole()`, `requireBackofficeAccess()`, `requireAdminOnly()`, `requireBackofficePageAccess()`, `requireAdminPageAccess()`
- `supabase/schemas/02b_functions_core.sql` — SQL `has_min_role(required_role text)` et `is_admin()`
- `supabase/schemas/61_rls_main_tables.sql` — Politiques RLS utilisant `has_min_role('editor')` et `is_admin()`
- `supabase/middleware.ts` — Logique middleware qui résout le rôle depuis JWT et bloque /admin
- `components/admin/AdminSidebar.tsx` — Filtrage des items par `minRole` via `isRoleAtLeast()`
- `scripts/test-editor-access-local.ts` — Script de test RLS local existant (template de référence)
- `memory-bank/acl-permissions-role.md` — Matrice de permissions (source de vérité pour les attendus)

---

## Verification

1. Vérifier que chaque table de `acl-permissions-role.md` est couverte par au moins un cas de test dans le plan
2. Vérifier que les 4 rôles (anon, user, editor, admin) ont des cas explicites
3. Vérifier la cohérence des IDs de test (préfixe ROLE-UNIT-**, ROLE-DAL-**, ROLE-RLS-**, ROLE-E2E-**)
4. Vérifier que les sections déjà patchées dans PLAN_DE_TEST_COMPLET.md référencent le nouveau fichier
5. Relecture croisée entre la matrice ACL et les résultats attendus de chaque cas

---

## Decisions

- **Fichier séparé plutôt qu'inline** : le plan permissions est dense (~120 cas) et transversal — l'insérer dans le plan complet (déjà 143 cas) le rendrait illisible
- **Patch léger** dans le plan complet : seuls les comptes de test, la section auth-protect et la section sécurité sont mis à jour — les autres sections admin (spectacles, agenda, etc.) restent inchangées car elles testent le fonctionnel, pas les permissions
- **Format tableaux cohérent** avec PLAN_DE_TEST_COMPLET.md (ID / Scénario / Préconditions / Étapes / Résultat attendu / Priorité)
- **Pas de squelettes code** dans ce plan : c'est un plan de cas de test, pas un plan d'implémentation de tests

---

## Further Considerations

1. Les scripts `test-editor-access-local.ts` et `test-editor-access-remote.ts` couvrent déjà une partie du niveau RLS — le plan les référence comme "déjà implémentés" et ajoute les cas manquants (anon, user).
2. L'infrastructure E2E Playwright n'est pas encore en place — les cas E2E sont documentés comme "à implémenter" quand l'infrastructure sera prête.
