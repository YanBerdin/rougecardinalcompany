# \[TASK081] — E2E Authentification

**Status:** Pending
**Added:** 2026-03-17
**Updated:** 2026-03-17

## Original Request

Implémenter les tests E2E Playwright couvrant les flux d'authentification :
login, inscription, mot de passe oublié — définis dans
`specs/PLAN_DE_TEST_COMPLET.md` sections 6.1, 6.2, 6.3.

## Thought Process

- Infrastructure Playwright déjà en place (TASK078)
- Auth setups pour admin/editor/user déjà dans `e2e/tests/auth/`
- Ces tests couvrent les pages publiques d'auth (`/auth/login`, `/auth/sign-up`, `/auth/forgot-password`)
- Pas besoin de storageState — tests en mode anon
- Attention au rate limiter Supabase Auth sur les tentatives de login échouées

## Périmètre

### Sections couvertes (`specs/PLAN_DE_TEST_COMPLET.md`)

| Section | IDs | Cas | Priorité |
| ------- | --- | --- | -------- |
| 6.1 — Login | AUTH-LOGIN-001→007 | 7 | P0 |
| 6.2 — Sign-up | AUTH-SIGNUP-001→004 | 4 | P0/P1 |
| 6.3 — Forgot password | AUTH-FORGOT-001→003 | 3 | P1 |

> **Total : ~14 cas**

### Cas détaillés

> **AUTH-LOGIN (P0)**

- AUTH-LOGIN-001 : Connexion réussie admin → redirection `/admin`
- AUTH-LOGIN-002 : Mauvais mot de passe → message d'erreur
- AUTH-LOGIN-003 : Email inexistant → message d'erreur
- AUTH-LOGIN-004 : Champs vides → validation bloquée
- AUTH-LOGIN-005 : Lien "Sign up" → `/auth/sign-up`
- AUTH-LOGIN-006 : Lien "Forgot your password?" → `/auth/forgot-password`
- AUTH-LOGIN-007 : Persistance de session après fermeture onglet

> **AUTH-SIGNUP**

- AUTH-SIGNUP-001 : 3 champs affichés (Email, Password, Repeat Password)
- AUTH-SIGNUP-002 : Mots de passe non concordants → erreur
- AUTH-SIGNUP-003 : Mot de passe trop court → erreur
- AUTH-SIGNUP-004 : Lien "Login" → `/auth/login`

> **AUTH-FORGOT**

- AUTH-FORGOT-001 : Champ Email + bouton "Send reset email" visibles
- AUTH-FORGOT-002 : Email valide → confirmation envoi
- AUTH-FORGOT-003 : Email invalide → erreur validation

## Implementation Plan

### Structure des fichiers à créer

```bash
e2e/
├── pages/auth/
│   ├── login.page.ts
│   ├── signup.page.ts
│   └── forgot-password.page.ts
└── tests/auth/
    ├── login/
    │   ├── login.fixtures.ts
    │   └── login.spec.ts
    ├── signup/
    │   ├── signup.fixtures.ts
    │   └── signup.spec.ts
    └── forgot-password/
        ├── forgot-password.fixtures.ts
        └── forgot-password.spec.ts
```

### Projet Playwright

Pas de nouveau projet nécessaire — utiliser `chromium-public` (pas de storageState requis).
Les tests de login réussi peuvent utiliser les comptes de test `.env.e2e`.

### Points d'attention

- **AUTH-LOGIN-002/003** : tester avec des credentials invalides → Supabase renvoie un message générique ("Invalid login credentials")
- **AUTH-LOGIN-007** : persistence nécessite un reload — utiliser `page.reload()` + vérifier que `/admin` est accessible
- **AUTH-SIGNUP** : ne pas créer de vrais comptes en base locale → tester uniquement la validation côté client si possible, ou nettoyer après
- **Mode serial** sur les tests login pour éviter les problèmes de session concurrente

## Progress Tracking

**Overall Status:** Not Started — 0%

### Subtasks

| ID  | Description                                 | Status      | Updated    | Notes |
| --- | ------------------------------------------- | ----------- | ---------- | ----- |
| 1.1 | Page Objects auth (login, signup, forgot)   | Not Started | 2026-03-17 |       |
| 1.2 | Fixtures auth tests                         | Not Started | 2026-03-17 |       |
| 1.3 | Tests login (AUTH-LOGIN-001→007)            | Not Started | 2026-03-17 |       |
| 1.4 | Tests signup (AUTH-SIGNUP-001→004)          | Not Started | 2026-03-17 |       |
| 1.5 | Tests forgot password (AUTH-FORGOT-001→003) | Not Started | 2026-03-17 |       |

## Références

- Plan de test : `specs/PLAN_DE_TEST_COMPLET.md` sections 6.1, 6.2, 6.3
- Infrastructure E2E : `e2e-tests/E2E_Tests_QuickReference_RCC.md`
- Auth setup existant : `e2e/tests/auth/admin.setup.ts`
- Variables env : `.env.e2e`
