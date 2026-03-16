# \[TASK080] — Investigation et correction des 5 échecs RLS policies

**Status:** Pending  
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

**Overall Status:** Not Started — 0%

### Subtasks

| ID  | Description                                         | Status      | Updated    | Notes |
| --- | --------------------------------------------------- | ----------- | ---------- | ----- |
| 1.1 | Exécuter `supabase db reset`                        | Not Started | 2026-03-16 |       |
| 1.2 | Relancer tests post-reset                           | Not Started | 2026-03-16 |       |
| 1.3 | Documenter résultats post-reset                     | Not Started | 2026-03-16 |       |
| 2.1 | Inspecter `pg_policies` tables en échec             | Not Started | 2026-03-16 |       |
| 2.2 | Vérifier GRANTs anon sur tables critiques           | Not Started | 2026-03-16 |       |
| 3.1 | Corriger schémas / révoquer GRANTs si nécessaire    | Not Started | 2026-03-16 |       |
| 3.2 | Ajuster test RLS-019 si problème d'évaluation PG    | Not Started | 2026-03-16 |       |
| 4.1 | Validation finale 34/34                             | Not Started | 2026-03-16 |       |

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
