# GitHub Secrets — Configuration CI E2E

> Secrets à configurer dans **Settings → Secrets and variables → Actions**
> du repository GitHub.

---

## Secrets obligatoires

| Secret                    | Description                             | Exemple / Valeur CI                      |
| ------------------------- | --------------------------------------- | ---------------------------------------- |
| `E2E_ADMIN_EMAIL`         | Email du compte admin de test           | `admin@rougecardinalcompany.fr`          |
| `E2E_ADMIN_PASSWORD`      | Mot de passe du compte admin de test    | **(mot de passe fort, ≥ 12 caractères)** |
| `E2E_EDITOR_EMAIL`        | Email du compte éditeur de test         | `editor@rougecardinalcompany.fr`         |
| `E2E_EDITOR_PASSWORD`     | Mot de passe du compte éditeur de test  | **(mot de passe fort, ≥ 12 caractères)** |
| `E2E_USER_EMAIL`          | Email du compte utilisateur de test     | `user@rougecardinalcompany.fr`           |
| `E2E_USER_PASSWORD`       | Mot de passe du compte utilisateur test | **(mot de passe fort, ≥ 12 caractères)** |

## Secrets générés automatiquement

Les clés Supabase locales (`anon key`, `service_role key`) sont **extraites automatiquement** de `supabase status` dans le workflow.
Il n'est pas nécessaire de les configurer manuellement comme secrets GitHub.

## Secrets optionnels

| Secret             | Description                       | Valeur CI par défaut          |
| ------------------ | --------------------------------- | ----------------------------- |
| `SENTRY_AUTH_TOKEN`| Token Sentry (source maps upload) | **(non utilisé en E2E, skip)**|

## Variables d'environnement hardcodées dans le workflow

Ces valeurs sont fixées directement dans le fichier `e2e.yml` et n'ont pas
besoin d'être configurées comme secrets :

| Variable                                        | Valeur                          |
| ----------------------------------------------- | ------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`                      | `http://127.0.0.1:54321`        |
| `NEXT_PUBLIC_SITE_URL`                          | `http://localhost:3000`         |
| `PLAYWRIGHT_BASE_URL`                           | `http://localhost:3000`         |
| `RESEND_API_KEY`                                | `re_test_ci_not_a_real_key`     |
| `EMAIL_FROM`                                    | `noreply@ci.test`               |
| `EMAIL_CONTACT`                                 | `contact@ci.test`               |
| `NEXT_PUBLIC_SENTRY_ENABLED`                    | `false`                         |
| `SKIP_ENV_VALIDATION`                           | `1`                             |

## Configuration pas à pas

1. Ouvrir **Settings → Secrets and variables → Actions** dans le repository
2. Cliquer **New repository secret**
3. Ajouter les 6 secrets obligatoires listés ci-dessus
4. Le workflow `E2E Tests` se déclenchera automatiquement sur les push/PR
   vers `main` et `develop`

## Test local

Pour vérifier que le script de création de comptes fonctionne localement :

```bash
# Démarrer Supabase local
pnpm dlx supabase start

# Exporter les variables nécessaires
export NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
export SUPABASE_SERVICE_ROLE_KEY=$(pnpm dlx supabase status --output json | jq -r '.SERVICE_ROLE_KEY')
export E2E_ADMIN_EMAIL=admin@rougecardinalcompany.fr
export E2E_ADMIN_PASSWORD=yourpassword
export E2E_EDITOR_EMAIL=editor@rougecardinalcompany.fr
export E2E_EDITOR_PASSWORD=yourpassword
export E2E_USER_EMAIL=user@rougecardinalcompany.fr
export E2E_USER_PASSWORD=yourpassword

# Créer les comptes
npx tsx scripts/ci-create-test-accounts.ts
```
