# TASK066-audit-admin-team-violations — Admin Team Audit Violations Fix

**Status:** Completed  
**Added:** 2026-03-01  
**Updated:** 2026-03-01

## Original Request

Exécuter le plan `.github/prompts/plan-fixAdminTeamAuditViolations.prompt.md` pour corriger 13 violations d'audit (4 critiques, 4 majeures, 5 mineures) identifiées sur la feature Admin Team. Score visé : ~84% → ~95%.

## Thought Process

La feature team était fonctionnelle mais accumulait des dettes techniques : DAL > 300 lignes, props locales dupliquées dans chaque composant, fautes d'orthographe dans les callbacks, états mal nommés, checkbox native au lieu de shadcn `Switch`, et paramètres Server Actions non typés. Le plan ordonnait les étapes par dépendance (DAL → auth → pages → composants → schémas).

**Décision clé** : Le plan prévoyait que `team.ts` ré-exporterait depuis `team-hard-delete.ts` et `team-reorder.ts`. En pratique, Next.js interdit les ré-exports non-async dans les fichiers `"use server"` — résoud avec imports directs dans `actions.ts`.

## Implementation Plan

1. Créer `components/features/admin/team/types.ts` (Props colocalisées)
2. Extraire `team-hard-delete.ts` + helpers privés
3. Extraire `team-reorder.ts`
4. Refactorer `team.ts` → DALResult + dalSuccess/dalError + codes ERR_TEAM_0XX
5. Sécuriser paramètres `actions.ts` avec `unknown` + Zod
6. Créer `requireAdminPageAccess()` dans `lib/auth/is-admin.ts`
7. Mettre à jour 3 pages avec `requireAdminPageAccess()` + unwrap DALResult
8. Refactorer `TeamManagementContainer` : Switch + renommages états
9. Refactorer Card/List/Form : imports types colocalisés, named exports, aria-required
10. Supprimer `SetActiveBodySchema` vestige API Route
11. (Bonus / non-fait) `useConfirmDialog` hook + composant `ConfirmDialog`

## Deviations from Plan (important)

### Déviation 1 : Re-exports interdits dans "use server" (Étape 2)

**Plan** : `team.ts` ré-exporte `hardDeleteTeamMember` et `reorderTeamMembers` depuis les fichiers splittés.

**Réalité** : Next.js interdit les ré-exports non-async dans les fichiers marqués `"use server"`. Build error :

```bash
Server Actions file can only export async functions
```

**Fix appliqué** : Retrait des ré-exports de `team.ts`. `actions.ts` importe directement depuis `team-hard-delete.ts` et `team-reorder.ts`.

### Déviation 2 : DALResult unwrap manquant dans team-hard-delete.ts (Étape 3)

**Plan** : Migration de `fetchTeamMemberById` vers `DALResult<T>` (Étape 3) et création de `team-hard-delete.ts` (Étape 2) traitées séparément.

**Réalité** : `validateTeamMemberForDeletion` utilisait `member.active` directement (type pré-migration). Après migration, `fetchTeamMemberById` retourne `DALResult<TeamRow | null>` — build error `Property 'active' does not exist on type 'DALResult'`.

**Fix appliqué** :

```typescript
const result = await fetchTeamMemberById(id);
if (!result.success || !result.data) {
  return dalError("[ERR_TEAM_050] Team member not found", HttpStatus.NOT_FOUND);
}
if (result.data.active) {
  return dalError("[ERR_TEAM_051] Cannot delete active team member...", ...);
}
```

### Déviation 3 : Réécriture complète de edit/page.tsx (Étape 7)

**Plan** : Mise à jour partielle via `multi_replace_string_in_file`.

**Réalité** : Les `oldString` ne correspondaient pas exactement au contenu du fichier → remplacement silencieusement raté. Page gardait l'ancien code.

**Fix appliqué** : Réécriture complète via 3 `replace_string_in_file` ciblés sur l'intégralité du fichier.

### Déviation 4 : Étape 10 (bonus) non implémentée

Le hook `useConfirmDialog` et le composant `ConfirmDialog` générique étaient marqués "BONUS" dans le plan. Non implémentés — la feature est complète et la dette restante est négligeable.

## Progress Tracking

**Overall Status:** Completed — 100%

### Subtasks

| ID  | Description                              | Status   | Updated    | Notes                                         |
| --- | ---------------------------------------- | -------- | ---------- | --------------------------------------------- |
| 1   | `types.ts` colocalisé + renommage prop   | Complete | 2026-03-01 | Prior session                                 |
| 2   | `team-hard-delete.ts` extrait            | Complete | 2026-03-01 | Prior session + fix DALResult unwrap          |
| 3   | `team-reorder.ts` extrait                | Complete | 2026-03-01 | Prior session                                 |
| 4   | `team.ts` → DALResult + codes ERR_TEAM   | Complete | 2026-03-01 | Prior session + re-exports supprimés          |
| 5   | `actions.ts` params unknown + Zod        | Complete | 2026-03-01 | Prior session                                 |
| 6   | `requireAdminPageAccess()` créé          | Complete | 2026-03-01 | Prior session                                 |
| 7   | 3 pages mises à jour (auth + DALResult)  | Complete | 2026-03-01 | edit/page.tsx : réécriture complète           |
| 8   | Container : Switch + renommages          | Complete | 2026-03-01 |                                               |
| 9   | Card/List/Form : types + aria + exports  | Complete | 2026-03-01 |                                               |
| 10  | `SetActiveBodySchema` supprimé           | Complete | 2026-03-01 | Supprimé de `schemas/team.ts` + barrel        |
| 11  | `pnpm build` ✅ + `pnpm lint` ✅         | Complete | 2026-03-01 | 0 erreurs TS, 0 erreurs ESLint                |
| 12  | Script `test:team` + `package.json`      | Complete | 2026-03-01 | Script existait déjà, ajout entrée pkg.json   |
| Bonus | `useConfirmDialog` hook              | Skipped  | —          | Marqué BONUS dans le plan, non prioritaire    |

## Progress Log

### 2026-03-01 (session 1 — prior)

- Steps 1–6 complétés : `types.ts`, `team-hard-delete.ts`, `team-reorder.ts`, DAL refactoring, Server Actions sécurisés, `requireAdminPageAccess()`.

### 2026-03-01 (session 2 — this session)

- Step 7 : 3 pages mises à jour. `edit/page.tsx` nécessitait une réécriture complète (multi-replace échoué silencieusement).
- Steps 8–10 : composants, schéma, barrel.
- Déviation 1 découverte : re-exports `"use server"` interdits → fix `actions.ts`.
- Default import → named import fix (`TeamManagementContainer`).
- Déviation 2 : `team-hard-delete.ts` — unwrap DALResult dans `validateTeamMemberForDeletion`.
- Build réussi à la 4e tentative. Lint 0 erreurs. Plan intégralement exécuté (sauf bonus).
- Ajout `test:team` dans `package.json`.
- Memory bank mise à jour.

## Files Created/Modified

### Fichiers créés

- `components/features/admin/team/types.ts`
- `lib/dal/team-hard-delete.ts`
- `lib/dal/team-reorder.ts`
- `scripts/test-team-server-actions.ts`

### Fichiers modifiés

- `lib/dal/team.ts` (DALResult, no re-exports, 242 lignes)
- `app/(admin)/admin/team/actions.ts` (unknown params + Zod, imports directs)
- `lib/auth/is-admin.ts` (`requireAdminPageAccess()` ajouté)
- `app/(admin)/admin/team/page.tsx` (metadata + requireAdminPageAccess + DALResult)
- `app/(admin)/admin/team/new/page.tsx` (requireAdminPageAccess)
- `app/(admin)/admin/team/[id]/edit/page.tsx` (réécriture complète)
- `components/features/admin/team/TeamManagementContainer.tsx` (Switch + renames)
- `components/features/admin/team/TeamMemberCard.tsx` (onDeactivate + types)
- `components/features/admin/team/TeamMemberList.tsx` (named import + renamed prop)
- `components/features/admin/team/TeamMemberForm.tsx` (aria-required + types)
- `lib/schemas/team.ts` (SetActiveBodySchema supprimé)
- `lib/schemas/index.ts` (barrel nettoyé)
- `package.json` (test:team ajouté)
