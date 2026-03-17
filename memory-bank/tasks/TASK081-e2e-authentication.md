# \[TASK081] — E2E Authentification

**Status:** Completed
**Added:** 2026-03-17
**Updated:** 2026-03-17
**Completed:** 2026-03-17

## Original Request

Implémenter les tests E2E Playwright couvrant les flux d'authentification :
login, inscription, mot de passe oublié — définis dans
`specs/PLAN_DE_TEST_COMPLET.md` sections 6.1, 6.2, 6.3.

## Thought Process

- Infrastructure Playwright déjà en place (TASK078)
- Auth setups pour admin/editor/user déjà dans `e2e/tests/auth/`
- Ces tests couvrent les pages publiques d'auth (`/auth/login`, `/auth/sign-up`, `/auth/forgot-password`)
- Projet Playwright dédié `chromium-auth` créé (matchant `auth/**/*.spec.ts`)
- Attention au rate limiter Supabase Auth sur les tentatives de login échouées
- Hydration React nécessite `waitUntil: 'networkidle'` + `click()` avant `fill()` sur les champs
- CSP `connect-src` dans `next.config.ts` doit inclure l'URL Supabase dynamique pour supporter local et production

## Périmètre

### Sections couvertes (`specs/PLAN_DE_TEST_COMPLET.md`)

| Section | IDs | Cas | Priorité |
| ------- | --- | --- | -------- |
| 6.1 — Login | AUTH-LOGIN-001→007 | 7 | P0 |
| 6.2 — Sign-up | AUTH-SIGNUP-001→004 | 4 | P0/P1 |
| 6.3 — Forgot password | AUTH-FORGOT-001→003 | 3 | P1 |

> **Total : 14 cas — 14/14 PASS ✅**

### Cas détaillés

> **AUTH-LOGIN (P0) — 7/7 ✅**

- AUTH-LOGIN-001 : Connexion réussie admin → redirection `/admin` ✅
- AUTH-LOGIN-002 : Mauvais mot de passe → message d'erreur ✅
- AUTH-LOGIN-003 : Email inexistant → message d'erreur ✅
- AUTH-LOGIN-004 : Champs vides → validation bloquée ✅
- AUTH-LOGIN-005 : Lien "Sign up" → `/auth/sign-up` ✅
- AUTH-LOGIN-006 : Lien "Forgot your password?" → `/auth/forgot-password` ✅
- AUTH-LOGIN-007 : Persistance de session après rechargement ✅

> **AUTH-SIGNUP — 4/4 ✅**

- AUTH-SIGNUP-001 : 3 champs affichés (Email, Password, Repeat Password) ✅
- AUTH-SIGNUP-002 : Mots de passe non concordants → erreur ✅
- AUTH-SIGNUP-003 : Mot de passe trop court → erreur ✅
- AUTH-SIGNUP-004 : Lien "Login" → `/auth/login` ✅

> **AUTH-FORGOT — 3/3 ✅**

- AUTH-FORGOT-001 : Champ Email + bouton "Send reset email" visibles ✅
- AUTH-FORGOT-002 : Email valide → confirmation envoi ✅
- AUTH-FORGOT-003 : Email invalide → erreur validation ✅

## Implementation Plan

### Structure des fichiers créés

```bash
e2e/
├── pages/auth/
│   ├── login.page.ts           # Page Object login
│   ├── signup.page.ts          # Page Object signup
│   └── forgot-password.page.ts # Page Object forgot-password
└── tests/auth/
    ├── login/
    │   ├── login.fixtures.ts
    │   └── login.spec.ts       # 7 tests serial
    ├── signup/
    │   ├── signup.fixtures.ts
    │   └── signup.spec.ts      # 4 tests serial
    └── forgot-password/
        ├── forgot-password.fixtures.ts
        └── forgot-password.spec.ts  # 3 tests serial
```

### Fichiers modifiés

- `playwright.config.ts` — ajout projet `chromium-auth` (match `auth/**/*.spec.ts`)
- `next.config.ts` — CSP `connect-src` rendu dynamique via `process.env.NEXT_PUBLIC_SUPABASE_URL`

### Résolutions de bugs

1. **Hydration React** : `domcontentloaded` → `networkidle`, ajout `click()` avant `fill()`, ajout `waitFor()` après `goto()`
2. **CSP bloquant localhost** : `connect-src` hardcodé → dynamique via `process.env.NEXT_PUBLIC_SUPABASE_URL ?? fallback`
3. **Utilisateur test manquant** : Seed admin via API Admin Supabase (ID: `7016523e-d328-4e84-be12-2de8ac7720c5`)

## Progress Tracking

**Overall Status:** Completed — 100%

### Subtasks

| ID  | Description                                 | Status    | Updated    | Notes                              |
| --- | ------------------------------------------- | --------- | ---------- | ---------------------------------- |
| 1.1 | Page Objects auth (login, signup, forgot)   | Complete  | 2026-03-17 | 3 fichiers POM créés               |
| 1.2 | Fixtures auth tests                         | Complete  | 2026-03-17 | 3 fichiers fixtures créés          |
| 1.3 | Tests login (AUTH-LOGIN-001→007)            | Complete  | 2026-03-17 | 7/7 pass                           |
| 1.4 | Tests signup (AUTH-SIGNUP-001→004)          | Complete  | 2026-03-17 | 4/4 pass                           |
| 1.5 | Tests forgot password (AUTH-FORGOT-001→003) | Complete  | 2026-03-17 | 3/3 pass                           |
| 1.6 | Fix hydration (networkidle + click)         | Complete  | 2026-03-17 | Appliqué aux 3 Page Objects        |
| 1.7 | Fix CSP connect-src dynamique               | Complete  | 2026-03-17 | next.config.ts modifié             |
| 1.8 | Seed utilisateur admin local                | Complete  | 2026-03-17 | Via Supabase Admin API             |

## Progress Log

### 2026-03-17

- Créé 3 Page Objects (`login.page.ts`, `signup.page.ts`, `forgot-password.page.ts`)
- Créé 3 fixtures (`login.fixtures.ts`, `signup.fixtures.ts`, `forgot-password.fixtures.ts`)
- Créé 3 specs (14 tests total) en mode `test.describe.serial`
- Ajouté projet `chromium-auth` dans `playwright.config.ts`
- **Bug 1** : Tests signup échouaient — hydration React trop lente. Fix : `networkidle` + `click()` avant `fill()` + `waitFor()`. Résultat : 4/4 signup pass
- **Bug 2** : Tests login/forgot échouaient ("Failed to fetch") — CSP bloquait `http://localhost:54321`. Diagnostiqué via test temporaire interceptant `page.on('console')`. Fix : CSP `connect-src` rendu dynamique dans `next.config.ts`
- **Bug 3** : Login 400 Bad Request — aucun utilisateur en base locale. Fix : seed admin via `curl -X POST .../auth/v1/admin/users`
- Résultat final : **14/14 tests pass** en 25.1s
- Nettoyage : supprimé `check-supabase-url.spec.ts` (diagnostic temporaire)

## Note T3 Env

Le `next.config.ts` utilise `process.env.NEXT_PUBLIC_SUPABASE_URL` directement (marqué `//TODO T3Env`). C'est une **exception justifiée** : `next.config.ts` s'exécute au démarrage avant le runtime Next.js — importer T3 Env ici forcerait la validation de TOUTES les variables serveur (RESEND_API_KEY, etc.) même quand elles ne sont pas nécessaires pour la config. Même logique que les scripts CLI (`scripts/*.ts`).

## Références

- Plan de test : `specs/PLAN_DE_TEST_COMPLET.md` sections 6.1, 6.2, 6.3
- Infrastructure E2E : `e2e-tests/E2E_Tests_QuickReference_RCC.md`
- Auth setup existant : `e2e/tests/auth/admin.setup.ts`
- Variables env : `.env.e2e`
- CSP fix : `next.config.ts` ligne 4-7
