# \[TASK080] — Investigation et correction des 5 échecs RLS policies

**Status:** Completed  
**Added:** 2026-03-16  
**Updated:** 2026-03-16

## Original Request

Le script `scripts/test-permissions-rls.ts` (TASK078 Phase 3) révèle 5 échecs RLS réels sur la DB Supabase locale. Ces échecs indiquent des politiques RLS mal appliquées ou des GRANTs excessifs. Investiguer les causes racines et corriger.

## Thought Process

- Les schémas déclaratifs (`supabase/schemas/`) contiennent des politiques **correctes** pour toutes les tables concernées
- L'hypothèse principale est que la DB locale n'a pas été réinitialisée après les migrations TASK077/TASK079 (séparation policies combinées)
- Si `supabase db reset` résout les 4 premiers échecs, seul RLS-019 (ordre d'évaluation PostgreSQL) nécessite un travail spécifique
- Si des échecs persistent post-reset, il faudra investiguer les GRANTs auto-générés par `supabase db diff`

## Rapport de référence

`doc/tests/RLS-POLICY-FAILURES-REPORT.md`

## Implementation Plan

### Phase 1 — Validation rapide (db reset)

1. Exécuter `supabase db reset`
2. Relancer `pnpm test:rls:local`
3. Documenter quels échecs ont disparu

### Phase 2 — Investigation des échecs persistants

4. Pour chaque échec persistant, inspecter `pg_policies` et `information_schema.table_privileges`
5. Identifier les GRANTs excessifs ou politiques résiduelles
6. Déterminer si le problème vient du schéma déclaratif ou d'une migration manuelle

### Phase 3 — Corrections

7. Corriger les schémas déclaratifs si nécessaire
8. Révoquer les GRANTs excessifs via migration ou schéma
9. Ajuster le test RLS-019 si l'ordre d'évaluation PostgreSQL est confirmé

### Phase 4 — Validation finale

10. Relancer `pnpm test:rls:local` — objectif 34/34
11. Vérifier `supabase db reset` passe sans erreur
12. Mettre à jour le rapport

## Progress Tracking

**Overall Status:** Completed — 100%

### Subtasks

| ID  | Description                                         | Status      | Updated    | Notes |
| --- | --------------------------------------------------- | ----------- | ---------- | ----- |
| 1.1 | Exécuter `supabase db reset`                        | Complete    | 2026-03-16 | RLS-001 corrigé |
| 1.2 | Relancer tests post-reset                           | Complete    | 2026-03-16 | 30/34 |
| 1.3 | Documenter résultats post-reset                     | Complete    | 2026-03-16 |       |
| 2.1 | Inspecter `pg_policies` tables en échec             | Complete    | 2026-03-16 | 28 policies correctes |
| 2.2 | Vérifier GRANTs anon sur tables critiques           | Complete    | 2026-03-16 | ALL normal (Supabase), RLS = gatekeeper |
| 3.1 | Fix signInAs() session mutation bug                 | Complete    | 2026-03-16 | Cause racine RLS-009/010/011 |
| 3.2 | Fix evenements payload (colonne title inexistante)  | Complete    | 2026-03-16 | Cause racine RLS-019 |
| 4.1 | Validation finale 34/34                             | Complete    | 2026-03-16 | ✅ 34/34 |

## Les 5 échecs à investiguer

| ID | Table | Opération | Rôle | Erreur | Sévérité |
| ---- | ------- | ----------- | ------ | -------- | ---------- |
| RLS-001 | `spectacles` | SELECT | anon | 2 rows non-publics/draft retournés | Moyenne |
| RLS-009 | `configurations_site` | SELECT | anon | 7 clés non-publiques visibles | Haute |
| RLS-010 | `spectacles`, `membres_equipe`, `partners` | INSERT | anon | INSERT autorisé (devrait être bloqué) | **Critique** |
| RLS-011 | `logs_audit` | SELECT | anon | Rows retournés (table admin-only) | **Critique** |
| RLS-019 | `evenements` | INSERT | user | Erreur schema au lieu de RLS block | Haute |

## Progress Log

### 2026-03-16

- Task créée suite aux résultats du script `test-permissions-rls.ts` (TASK078 Phase 3)
- 29/34 tests passent, 5 échecs réels identifiés
- Rapport détaillé : `doc/tests/RLS-POLICY-FAILURES-REPORT.md`
- Hypothèse principale : DB locale non réinitialisée après migrations TASK077/TASK079

### 2026-03-16 — Résolution complète

**Phase 1 — db reset** : `supabase db reset` a corrigé RLS-001 (anciennes policies combinées remplacées). Score → 30/34.

**Phase 2 — Investigation** :

- `pg_policies` : 28 policies correctement configurées sur les 6 tables
- GRANTs : ALL privileges pour anon = comportement normal Supabase (RLS est le contrôle d'accès)
- Tests directs curl + Node.js client frais : RLS fonctionne parfaitement → le problème est dans le script de test

**Causes racines identifiées** :

1. **RLS-009/010/011** : Bug dans `signInAs()` — la fonction appelait `anonClient.auth.signInWithPassword()` qui **mutait l'état interne** du client anon. Après 3 sign-ins (user → editor → admin), `anonClient` avait une session admin. Les tests "anon" s'exécutaient donc en tant qu'admin.
2. **RLS-019** : Le payload `{ title: "__rls_test__" }` pour `evenements` utilisait une **colonne inexistante** (`title`). PostgREST retournait PGRST204 (schema cache error), qui matchait le pattern `error.message.includes("column")` → faux négatif.

**Phase 3 — Corrections** dans `scripts/test-permissions-rls.ts` :

1. `signInAs()` utilise désormais un `tempClient` séparé pour `signInWithPassword()` au lieu de `anonClient`
2. Payloads `evenements` corrigés : `{ spectacle_id: 999999, date_debut: "2099-01-01T00:00:00" }` (colonnes valides)
3. Correction appliquée aux deux tests RLS-010 et RLS-019

**Phase 4 — Validation** : ✅ **34/34 tests passent** — 0 échec.
