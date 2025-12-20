# Plan d'Implémentation de T3 Env

> **Dernière mise à jour** : 20 décembre 2025  
> **Statut** : Prêt pour implémentation (après Phase 0)

## 📋 Vue d'ensemble

T3 Env (@t3-oss/env-nextjs) est une solution de validation et typage des variables d'environnement qui apporte :
- Validation runtime avec Zod
- Type-safety TypeScript
- Différenciation client/server
- Détection précoce des erreurs de configuration

## 🎯 Objectifs

1. Remplacer les accès directs `process.env.*` par un système validé
2. Assurer la sécurité (jamais exposer les clés sensibles côté client)
3. Améliorer la DX avec autocomplete et type-checking
4. Détecter les erreurs de configuration au démarrage

---

## ⚠️ PHASE 0 : Pré-requis (OBLIGATOIRE avant implémentation)

### 0.1 Standardiser le nom de la variable service role

**Problème** : Le projet utilise deux noms différents :
- `.env.local` ligne 43 : `SUPABASE_SECRET_KEY`
- `.env.local` ligne 55 : `SUPABASE_SERVICE_ROLE_KEY`
- 10+ scripts utilisent `SUPABASE_SECRET_KEY`

**Action** : Standardiser sur `SUPABASE_SERVICE_ROLE_KEY` partout.

**Scripts à mettre à jour** (chercher/remplacer `SUPABASE_SECRET_KEY` → `SUPABASE_SERVICE_ROLE_KEY`) :
- `scripts/create-admin-user.ts`
- `scripts/create-local-admin.ts`
- `scripts/check-admin-status.ts`
- `scripts/diagnose-server-auth.ts`
- `scripts/test-admin-access.ts`
- `scripts/test-evenements-access.ts`
- `scripts/test-spectacles-crud.ts`
- `scripts/test-team-active-dal.ts`
- `scripts/verify-view-security-invoker.ts`
- `scripts/Test_fetchMediaArticles/check-rls-policies.ts`
- `scripts/Test_fetchMediaArticles/apply-migration-articles-view.ts`

### 0.2 Nettoyer `.env.local`

**Problème** : Duplication de la clé service role (lignes 43 et 55)

**Action** : 
1. Supprimer la ligne 43 (`SUPABASE_SECRET_KEY=...`)
2. Garder uniquement la ligne 55 (`SUPABASE_SERVICE_ROLE_KEY=...`)

### 0.3 Supprimer `hasEnvVars`

**Problème** : `hasEnvVars` est utilisé dans 5 fichiers mais T3 Env gère la validation au démarrage.

**Fichiers à modifier** :
| Fichier | Action |
|---------|--------|
| `lib/utils.ts` | Supprimer l'export `hasEnvVars` |
| `supabase/middleware.ts` | Supprimer import et bloc `if (!hasEnvVars)` |
| `app/(admin)/layout.tsx` | Supprimer import et prop `hasEnvVars` |
| `components/admin/AdminSidebar.tsx` | Supprimer prop et passage à `AdminAuthRow` |
| `components/admin/AdminAuthRow.tsx` | Supprimer prop et condition `if (!hasEnvVars)` |

---

## 📦 Étape 1 : Installation

```bash
pnpm add @t3-oss/env-nextjs
# Note: zod est déjà installé dans le projet
```

## 🏗️ Étape 2 : Création du fichier de configuration

Créer `lib/env.ts` avec le contenu de `t3_env_config.ts`.

## 🔄 Étape 3 : Migration des fichiers existants

### 3.1 Migration `lib/site-config.ts`

Voir `site_config_migrated.ts` - **Note** : `REDIRECT_TO_DASHBOARD` reste `/protected` (pas `/dashboard`).

### 3.2 Migration `lib/resend.ts`

Voir `resend_migrated.ts`

### 3.3 Migration Supabase (4 fichiers séparés)

**Architecture décidée** : GARDER la séparation entre les fichiers Supabase pour :
- Sécurité : admin operations explicites
- Audit : facile de tracer `createAdminClient()`
- SOLID : une responsabilité par fichier
- Clarté : imports montrent le niveau de privilège

Voir `supabase_files_migrated.ts` qui contient :
- FILE 1: `supabase/client.ts`
- FILE 2: `supabase/server.ts`
- FILE 3: `supabase/admin.ts`
- FILE 4: `supabase/middleware.ts`

### 3.4 Migration `lib/email/actions.ts`

Voir `email_actions_migrated.ts` - **Note** : Props `InvitationEmail` alignées avec l'interface actuelle.

## 🛠️ Étape 4 : Mise à jour des scripts

### 4.1 Migration `scripts/create-admin-user.ts`

```typescript
// scripts/create-admin-user.ts
import { env } from "../lib/env";
import { createAdminClient } from "../supabase/admin";

async function createAdminUser() {
  // ✅ Validated via T3 Env
  const email = env.DEFAULT_ADMIN_EMAIL ?? "admin@rougecardinal.com";
  const password = env.DEFAULT_ADMIN_PASSWORD ?? "Admin123!";
  
  // ... rest of script
}
```

## 📝 Étape 5 : Mise à jour `.env.example`

Voir `env_example_updated.sh` - Le fichier `.env.example` actuel est déjà bien structuré.

## 🧪 Étape 6 : Tests de validation

Voir `test_env_validation.ts`

## 📚 Étape 7 : Documentation

Voir `t3_env_readme.md` pour le guide complet.

---

## 📋 Checklist de Migration Complète

### Phase 0 : Pré-requis (⚠️ OBLIGATOIRE)
- [ ] Standardiser `SUPABASE_SECRET_KEY` → `SUPABASE_SERVICE_ROLE_KEY` dans 11 scripts
- [ ] Nettoyer `.env.local` (supprimer duplication ligne 43)
- [ ] Supprimer `hasEnvVars` de 5 fichiers

### Phase 1 : Setup (✅ Prêt)
- [x] Installer `@t3-oss/env-nextjs` (zod déjà présent)
- [x] Créer `lib/env.ts` avec tous les schémas → `t3_env_config.ts`
- [x] Créer documentation → `t3_env_readme.md`
- [x] Créer script de test → `test_env_validation.ts`

### Phase 2 : Core Files (Priorité haute)
- [ ] Migrer `lib/site-config.ts` → `site_config_migrated.ts`
- [ ] Migrer `lib/resend.ts` → `resend_migrated.ts`
- [ ] Migrer `supabase/server.ts` → FILE 2 dans `supabase_files_migrated.ts`
- [ ] Migrer `supabase/client.ts` → FILE 1 dans `supabase_files_migrated.ts`
- [ ] Migrer `supabase/admin.ts` → FILE 3 dans `supabase_files_migrated.ts`
- [ ] Migrer `supabase/middleware.ts` → FILE 4 dans `supabase_files_migrated.ts`

### Phase 3 : Email System
- [ ] Migrer `lib/email/actions.ts` → `email_actions_migrated.ts`
- [ ] Tester redirect dev avec T3 Env

### Phase 4 : DAL Files (17 fichiers)
- [ ] `lib/dal/admin-*.ts`
- [ ] `lib/dal/home-*.ts`
- [ ] `lib/dal/*.ts` (autres)

### Phase 5 : Scripts (11 fichiers)
- [ ] `scripts/create-admin-user.ts`
- [ ] `scripts/create-local-admin.ts`
- [ ] `scripts/check-admin-status.ts`
- [ ] Tous les autres scripts de test

### Phase 6 : API Routes (minimal)
- [ ] `app/api/admin/media/search/route.ts`
- [ ] `app/api/contact/route.ts`
- [ ] `app/api/newsletter/route.ts`

### Phase 7 : Tests & CI
- [ ] Exécuter `pnpm tsx scripts/test-env-validation.ts`
- [ ] Vérifier build Next.js : `pnpm build`
- [ ] Mettre à jour CI/CD si nécessaire

---

## 🎯 Ordre d'Exécution Recommandé

### Jour 1 : Phase 0 (Pré-requis)
```bash
# 1. Chercher/remplacer dans tous les scripts
find scripts -name "*.ts" -exec sed -i 's/SUPABASE_SECRET_KEY/SUPABASE_SERVICE_ROLE_KEY/g' {} \;

# 2. Nettoyer .env.local (manuellement, supprimer ligne 43)

# 3. Supprimer hasEnvVars (manuellement dans 5 fichiers)
```

### Jour 2 : Phase 1 + 2
```bash
# 1. Installer T3 Env
pnpm add @t3-oss/env-nextjs

# 2. Créer lib/env.ts
cp .github/prompts/plan-feat-t3-env.prompt/t3_env_config.ts lib/env.ts

# 3. Migrer les core files un par un, tester après chaque migration
pnpm dev  # Vérifier que l'app démarre
```

### Jour 3 : Phase 3 + 4
```bash
# Migrer email system et DAL files
# Tester après chaque fichier
```

### Jour 4 : Phase 5 + 6 + 7
```bash
# Migrer scripts et API routes
# Tests finaux
pnpm build
pnpm tsx scripts/test-env-validation.ts
```

---

## 🚨 Points d'Attention

1. **Variables dupliquées** : `NEXT_PUBLIC_SUPABASE_URL` apparaît dans `server` ET `client` car elle est utilisée des deux côtés

2. **Transform boolean** : `EMAIL_DEV_REDIRECT` utilise `.transform()` pour convertir `"true"/"false"` en boolean

3. **Optional variables** : Les vars de dev/test sont marquées `.optional()` pour ne pas bloquer la prod

4. **CI/CD** : Ajouter `SKIP_ENV_VALIDATION=true` dans CI uniquement si nécessaire

5. **Architecture Supabase** : GARDER la séparation entre `server.ts`, `admin.ts`, `client.ts` et `middleware.ts`

6. **Interface InvitationEmail** : Les props sont `{ email, role, displayName?, invitationUrl }` (pas `invitedUserEmail`, `companyName`, etc.)

---

## 📁 Fichiers de Référence

| Fichier | Description |
|---------|-------------|
| `t3_env_config.ts` | Configuration complète `lib/env.ts` |
| `t3_env_readme.md` | Guide utilisateur + architecture Supabase |
| `site_config_migrated.ts` | Migration `lib/site-config.ts` |
| `resend_migrated.ts` | Migration `lib/resend.ts` |
| `supabase_files_migrated.ts` | Migration des 4 fichiers Supabase |
| `email_actions_migrated.ts` | Migration `lib/email/actions.ts` |
| `test_env_validation.ts` | Script de test validation |
| `env_example_updated.sh` | Template `.env.example` mis à jour |
