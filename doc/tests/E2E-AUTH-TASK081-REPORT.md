# Rapport E2E — Tests Authentification

**Date :** 2026-03-17  
**Tâche :** TASK081 — E2E Authentification  
**Projet Playwright :** `chromium-auth`  
**Fichiers de tests :** `e2e/tests/auth/**/*.spec.ts`

---

## Résumé

Implémentation et passage complet des **14 tests E2E** couvrant les flux d'authentification : login, inscription et mot de passe oublié — définis dans `specs/PLAN_DE_TEST_COMPLET.md` sections 6.1, 6.2, 6.3.

> **Résultat final : 14/14 tests passent (25.1s)**

---

## Périmètre couvert

| Suite | IDs | Description | Résultat |
| ----- | --- | ----------- | -------- |
| 6.1 — Login | AUTH-LOGIN-001→007 | Connexion, validation, navigation, persistance | ✅ 7/7 |
| 6.2 — Sign-up | AUTH-SIGNUP-001→004 | Champs, validation, navigation | ✅ 4/4 |
| 6.3 — Forgot password | AUTH-FORGOT-001→003 | Champ, confirmation, erreur | ✅ 3/3 |

---

## Résultats détaillés

### 6.1 — Login (`e2e/tests/auth/login/login.spec.ts`)

| ID | Description | Durée | Statut |
| -- | ----------- | ----- | ------ |
| AUTH-LOGIN-001 | Connexion admin réussie → redirection `/admin` | 2.9s | ✅ |
| AUTH-LOGIN-002 | Mauvais mot de passe → message d'erreur | 1.2s | ✅ |
| AUTH-LOGIN-003 | Email inexistant → message d'erreur | 1.2s | ✅ |
| AUTH-LOGIN-004 | Champs vides → bouton submit bloqué | 1.2s | ✅ |
| AUTH-LOGIN-005 | Lien "Sign up" → navigation `/auth/sign-up` | 1.2s | ✅ |
| AUTH-LOGIN-006 | Lien "Forgot your password?" → `/auth/forgot-password` | 1.1s | ✅ |
| AUTH-LOGIN-007 | Persistance de session après `page.reload()` | 2.3s | ✅ |

> **Sous-total : 7/7 — Durée cumulée : ~11.1s**

### 6.2 — Sign-up (`e2e/tests/auth/signup/signup.spec.ts`)

| ID | Description | Durée | Statut |
| -- | ----------- | ----- | ------ |
| AUTH-SIGNUP-001 | 3 champs affichés (Email, Password, Repeat Password) | 965ms | ✅ |
| AUTH-SIGNUP-002 | Mots de passe non concordants → erreur | 1.1s | ✅ |
| AUTH-SIGNUP-003 | Mot de passe trop court → erreur | 1.1s | ✅ |
| AUTH-SIGNUP-004 | Lien "Login" → navigation `/auth/login` | 1.0s | ✅ |

> **Sous-total : 4/4 — Durée cumulée : ~4.2s**

### 6.3 — Forgot Password (`e2e/tests/auth/forgot-password/forgot-password.spec.ts`)

| ID | Description | Durée | Statut |
| -- | ----------- | ----- | ------ |
| AUTH-FORGOT-001 | Champ Email + bouton "Send reset email" visibles | 1.4s | ✅ |
| AUTH-FORGOT-002 | Email valide → message de confirmation | 1.1s | ✅ |
| AUTH-FORGOT-003 | Email invalide → erreur de validation | 1.1s | ✅ |

> **Sous-total : 3/3 — Durée cumulée : ~3.6s**

---

## Structure des fichiers créés

```bash
e2e/
├── pages/auth/
│   ├── login.page.ts           # Page Object — /auth/login
│   ├── signup.page.ts          # Page Object — /auth/sign-up
│   └── forgot-password.page.ts # Page Object — /auth/forgot-password
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

---

## Problèmes rencontrés et résolutions

### Bug 1 — Hydration React (SIGNUP)

**Symptôme :** Tests signup échouaient — `fill()` sur les champs avant hydration React complète.

**Cause :** `waitUntil: 'domcontentloaded'` (défaut Playwright) ne garantit pas l'hydration React. Les champs étaient présents dans le DOM mais pas encore interactifs.

**Fix :**

- `waitUntil: 'networkidle'` dans `page.goto()`
- Ajout d'un `click()` avant chaque `fill()` pour activer le champ
- `waitFor()` sur les sélecteurs critiques avant interaction

### Bug 2 — CSP bloquant Supabase local

**Symptôme :** "Failed to fetch" dans la console — requêtes vers `localhost:54321` bloquées par Content-Security-Policy.

**Cause :** Le header CSP `connect-src` dans `next.config.ts` était hardcodé sur l'URL de production Supabase.

**Fix :** Rendu dynamique via `process.env.NEXT_PUBLIC_SUPABASE_URL` dans `next.config.ts` :

```ts
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://yvtrlvmbofklefxcxrzv.supabase.co";
```

> Note : `process.env` est utilisé ici directement (pas T3 Env) — exception justifiée car `next.config.ts` s'exécute avant le runtime Next.js. Voir `memory-bank/t3_env_guide.md`.

### Bug 3 — Utilisateur absent en base locale

**Symptôme :** Login retournait HTTP 400 — aucun utilisateur `yandevformation@gmail.com` en base locale.

**Fix :** Seed manuel via Supabase Admin API :

```bash
curl -X POST http://localhost:54321/auth/v1/admin/users \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -d '{ "email": "yandevformation@gmail.com", "password": "AdminRouge2025!", "role": "admin", ... }'
```

---

## Environnement d'exécution

| Paramètre | Valeur |
| --------- | ------ |
| OS | Linux |
| Navigateur | Chromium (Playwright) |
| Projet Playwright | `chromium-auth` |
| BaseURL | `http://localhost:3000` |
| Supabase local | `http://localhost:54321` |
| Workers | 1 (serial) |
| Fichier env | `.env.e2e` |
| Utilisateur seed | `yandevformation@gmail.com` — rôle `admin` |
| User ID | `7016523e-d328-4e84-be12-2de8ac7720c5` |

---

## Modifications de configuration apportées

| Fichier | Modification |
| ------- | ------------ |
| `playwright.config.ts` | Ajout du projet `chromium-auth` matchant `auth/**/*.spec.ts` |
| `next.config.ts` | CSP `connect-src` rendu dynamique via `process.env.NEXT_PUBLIC_SUPABASE_URL` |

---

## Commande d'exécution

```bash
npx playwright test --project=chromium-auth --reporter=list
```

---

## Références

- Plan de test source : `specs/PLAN_DE_TEST_COMPLET.md` §6.1, §6.2, §6.3
- Tâche Memory Bank : `memory-bank/tasks/TASK081-e2e-authentication.md`
- Infrastructure E2E : `e2e-tests/E2E_Tests_QuickReference_RCC.md`
- Config auth multi-rôles : `e2e-tests/E2E_Auth_Setup_RCC.md`
- Variables d'env T3 : `memory-bank/t3_env_guide.md`
