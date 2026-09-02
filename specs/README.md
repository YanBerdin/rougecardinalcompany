# Spécifications de tests

Ce dossier décrit les comportements attendus et leur couverture automatisée.

| Document | Portée | État au 2 septembre 2026 |
| --- | --- | --- |
| [Plan de test complet](PLAN_DE_TEST_COMPLET.md) | Parcours publics, auth, admin et transversaux | Référence fonctionnelle active |
| [Permissions et rôles](tests-permissions-et-rôles.md) | Hiérarchie `user < editor < admin`, DAL, RLS et E2E | 20 cas permissions directs automatisés |

## Exécution

```bash
pnpm test:unit
pnpm test:integration
pnpm test:e2e
pnpm test:coverage
```

Les tests unitaires sont autonomes. Les tests d'intégration et E2E nécessitent
Supabase local et `.env.e2e`, créé à partir de `.env.e2e.example`.

Sur la machine de développement actuelle, lancer un seul projet Playwright par
invocation pour éviter un arrêt du serveur par manque de mémoire :

```bash
pnpm exec playwright test --project=chromium-public
pnpm exec playwright test --project=chromium-auth
pnpm exec playwright test --project=permissions
```

La suite complète est destinée au workflow `.github/workflows/e2e.yml`.

## Résultats vérifiés

- Unitaires : 159/159
- Intégration RLS/audit : 81/81
- E2E public : 15/15
- E2E auth : 19/19
- Projet E2E permissions : 23/23, dont 3 tests de setup d'authentification
- E2E editor, admin et cross : validation complète encore attendue en CI

Les résultats datés sont suivis dans
`memory-bank/tasks/TASK201-strategie-tests-audit-implementation.md`.
