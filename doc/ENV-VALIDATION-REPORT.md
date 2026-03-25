# Rapport — Validation d'environnement runtime

> **Date** : 25 mars 2026  
> **Branche** : `ref/env-validation-docs-ci`  
> **Auteur** : Copilot (DevOps Expert)

---

## 1. Contexte et problème

Le fichier `instrumentation.ts` de Next.js contenait ~108 lignes de logique de validation mélangées avec l'initialisation Sentry. Le code validait la cohérence des variables d'environnement Supabase en production (URL vs PROJECT_REF, format des clés, blocage des refs non-production) mais était **impossible à tester unitairement** car couplé au cycle de vie Next.js.

### Risque adressé

Un déploiement en production avec les variables d'un environnement staging/dev pouvait provoquer :

- Données de production écrites sur une base staging
- Fuites de données sensibles vers un environnement non sécurisé
- Corruption de données inter-environnements

---

## 2. Architecture après refactoring

```bash
instrumentation.ts          (38 lignes — orchestrateur Sentry + appel validation)
    └── lib/env-validation.ts   (90 lignes — logique pure, injectable)
         └── __tests__/utils/env-validation.test.ts  (22 tests)
```

### Principes appliqués

| Principe | Application |
| ---------- | ------------- |
| **SRP** | Un seul fichier = une seule responsabilité (validation OU orchestration) |
| **DI** | `validateEnvironment(envVars?: EnvLike)` accepte un env injectable |
| **Fail-fast** | Throw immédiat en production si incohérence détectée |
| **Defense-in-depth** | Guard-rail hardcodé (`NON_PRODUCTION_REFS`), pas configurable via env |

---

## 3. Fichiers créés/modifiés

### `lib/env-validation.ts` (CRÉÉ)

Module exportant :

- `hasValidPrefix(value, prefixes)` — vérifie le format des clés Supabase
- `validateEnvironment(envVars?)` — 4 contrôles séquentiels :
  1. **Check 1a** : Le ref extrait de `NEXT_PUBLIC_SUPABASE_URL` correspond à `SUPABASE_PROJECT_REF`
  2. **Check 1b** : En production, le ref ne figure pas dans `NON_PRODUCTION_REFS`
  3. **Check 2** : La clé anon/publishable a un préfixe valide (`eyJ` ou `sb_publishable_`)
  4. **Check 3** : La clé secrète a un préfixe valide (`eyJ` ou `sb_secret_`)
- Constantes exportées : `VALID_KEY_PREFIXES`, `VALID_SECRET_PREFIXES`, `NON_PRODUCTION_REFS`

### `instrumentation.ts` (SIMPLIFIÉ)

Réduit de ~108 à ~38 lignes. Ne contient plus que :

- Import de `validateEnvironment`
- Initialisation Sentry (server + edge)
- Appel `validateEnvironment()` dans le runtime `nodejs`
- Handler `onRequestError` pour Sentry

### `__tests__/utils/env-validation.test.ts` (CRÉÉ)

22 tests couvrant tous les chemins :

| Groupe | Tests |
| ---------- | ------- |
| `hasValidPrefix` | 2 tests (match / reject) |
| Skip local dev | 1 test (VERCEL_ENV undefined → warn) |
| Missing vars | 2 tests (URL / REF manquant) |
| Check 1a — URL ref mismatch | 3 tests (match, mismatch prod throw, mismatch preview warn) |
| Check 1b — NON_PRODUCTION_REFS | 2 tests (staging ref en prod throw, staging ref en preview OK) |
| Invalid URL | 1 test (format URL invalide) |
| Check 2 — anon key | 3 tests (sb_publishable_, eyJ, invalid) |
| Check 3 — secret key | 3 tests (sb_secret_, eyJ, invalid) |
| Missing keys | 2 tests (anon undefined, secret undefined) |
| Full valid env | 3 tests (prod, preview, preview mismatch warn) |

**Helper** : `makeValidEnv(overrides)` pour construire un env valide et ne modifier qu'une variable à la fois.

---

## 4. Décisions architecturales

### Décision 1 : `NON_PRODUCTION_REFS` hardcodé

**Rejeté** : lecture depuis une variable d'environnement.  
**Raison** : Le guard-rail ne doit pas dépendre du mécanisme qu'il surveille. Un env mal configuré pourrait aussi mal renseigner la blocklist.

### Décision 2 : Type `EnvLike`

**Problème** : `ProcessEnv` de Node.js n'est pas assignable à `Record<string, string | undefined>`.  
**Solution** : `type EnvLike = Record<string, string | undefined>` avec cast explicite `process.env as EnvLike` dans le default parameter.

### Décision 3 : Module séparé plutôt que fonction inline

**Raison** : Rendre la logique testable unitairement sans démarrer Next.js. Le pattern DI permet d'injecter un env factice dans les tests.

---

## 5. Résultats des tests

```bash
 ✓ __tests__/utils/env-validation.test.ts (22 tests)
 ✓ __tests__/auth/roles.test.ts (42 tests)
 ✓ __tests__/auth/role-helpers.test.ts (2 tests)
 ✓ __tests__/utils/image-compress.test.ts (9 tests)

Test Files  4 passed (4)
Tests       75 passed (75)
```

Zéro régression sur les suites existantes.

---

## 6. Impact DevOps

### Avant

- Validation env = code entremêlé dans `instrumentation.ts`
- Aucun test unitaire sur la validation
- Détection d'erreur uniquement au runtime en production
- **Aucun workflow CI n'exécute les tests unitaires**

### Après

- Module isolé avec 22 tests
- Détection d'incohérences à l'initialisation (fail-fast)
- Tests exécutables localement via `pnpm vitest run`
- Prêt pour intégration CI (workflow `unit-tests.yml` à créer)

---

## 7. Prochaines étapes

1. **Créer le workflow CI `unit-tests.yml`** — exécuter `pnpm vitest run` sur push/PR
2. **Ajouter un script `test:unit`** dans `package.json` pour standardiser la commande
3. **Monitoring** — intégrer les résultats Vitest dans les checks GitHub PR
4. **Extension** — envisager d'ajouter d'autres validations runtime au module (ex: versions API)

---

## 8. Références

- [Next.js Instrumentation](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation)
- [Vitest](https://vitest.dev/)
- Memory Bank : `systemPatterns.md` (pattern "Runtime Environment Validation")
- Memory Bank : `t3_env_guide.md` (exception instrumentation.ts)
