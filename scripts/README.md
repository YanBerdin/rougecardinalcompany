# Scripts d'Administration

Ce dossier contient des scripts d'administration pour gérer et surveiller l'application Rouge Cardinal Company.

## ⚠️ Convention Variables d'Environnement (T3 Env)

**Les scripts CLI utilisent `process.env` avec `dotenv/config`** — PAS T3 Env.

T3 Env est conçu pour le runtime Next.js (client/server separation, SSR). Les scripts sont exécutés via `tsx` directement, hors du contexte Next.js.

| Contexte | Méthode |
| ---------- | -------- |
| `app/`, `lib/`, `components/` | `import { env } from '@/lib/env'` (T3 Env) |
| `scripts/*.ts` | `import 'dotenv/config'` + `process.env.*` |
| `supabase/functions/` | `Deno.env.get()` |

**Pattern standard dans les scripts** :

```typescript
#!/usr/bin/env tsx
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !secretKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}
```

**Voir aussi** : `.github/prompts/plan-feat-t3-env.prompt/t3_env_guide.md`

## 👤 Admin User Management

### create-admin-user-local.ts (TypeScript) ✅ NOUVEAU (2026-01-22)

**Description**: Crée l'utilisateur admin initial dans la base de données **locale** Supabase. Utilise des variables d'environnement `.env.local` pour sécuriser les credentials.

**Configuration**:

```bash
# 1. Créer le fichier .env.local depuis l'exemple
cp .env.local.example .env.local

# 2. Obtenir le service key local
supabase status | grep "service_role key"

# 3. Éditer .env.local avec les valeurs
# SUPABASE_LOCAL_URL=http://127.0.0.1:54321
# SUPABASE_LOCAL_SERVICE_KEY=<service_key_from_status>
```

**Utilisation**:

```bash
# Démarrer Supabase local d'abord
pnpm dlx supabase start

# Créer l'admin local
pnpm exec tsx scripts/create-admin-user-local.ts
```

**Différences avec create-admin-user.ts**:

| Script | Environnement | URL | Service Key |
| -------- | --------------- | ----- | ------------- |
| `create-admin-user.ts` | **Remote** | `.env` variable | `.env` variable |
| `create-admin-user-local.ts` | **Local** | `.env.local` variable | `.env.local` variable |

**Credentials créés**:

- Email: `yandevformation@gmail.com`
- Password: `AdminRouge2025!`
- Role: `admin`
- Display Name: `Administrateur`

**Studio URL**: http://127.0.0.1:54323/project/default/auth/users

**Pattern upsert**: Utilise `.upsert()` pour éviter les conflits si l'utilisateur existe déjà.

**⚠️ Sécurité**: Les credentials sont stockés dans `.env.local` (gitignored). Voir `.env.local.example` pour la configuration.

**Contexte**: Créé le 2026-01-22 après découverte que le script original créait l'admin sur la base remote au lieu de la base locale. Mis à jour le même jour pour retirer les credentials hardcodés.

---

## 🖼️ Media Library - Thumbnail Tests (Phase 3)

### test-thumbnail-generation.ts ✅ LOCAL

**Description**: Test complet de la génération de thumbnails sur la base de données **locale**. Valide le workflow complet : upload → thumbnail → vérification → cleanup.

**Target**: Base locale Supabase (`http://127.0.0.1:54321`)

**Tests effectués**:

1. **Happy Path**: Génération réussie de thumbnail 300x300
2. **Pattern Warning**: Validation du comportement non-bloquant (upload réussit même si thumbnail échoue)

**Utilisation**:

```bash
# 1. Démarrer Supabase local
pnpm dlx supabase start

# 2. Lancer les tests
pnpm exec tsx scripts/test-thumbnail-generation.ts
```

**Résultats attendus**:

- ✅ Image uploadée (800x600, 3120 bytes)
- ✅ Thumbnail généré (300x300, 809 bytes = 74% réduction)
- ✅ Storage: `uploads/` → `thumbnails/`
- ✅ Database: `thumbnail_path` mis à jour
- ✅ Cleanup automatique

---

### test-thumbnail-direct.ts ✅ LOCAL

**Description**: Test direct des fonctions DAL de génération de thumbnails (bypass HTTP API). Version locale.

**Target**: Base locale Supabase (`http://127.0.0.1:54321`)

**Avantages**:

- Pas besoin d'authentification admin
- Test unitaire des fonctions de génération
- Plus rapide (~2 secondes)

**Utilisation**:

```bash
pnpm dlx supabase start
pnpm exec tsx scripts/test-thumbnail-direct.ts
```

**Workflow testé**:

1. Création image test (sharp)
2. Upload vers Storage local
3. Génération thumbnail directe (DAL)
4. Vérification format JPEG 300x300
5. Vérification database update
6. Cleanup complet

---

### test-thumbnail-generation-remote.ts ⚠️ REMOTE

**Description**: Test complet de la génération de thumbnails sur **Supabase Cloud (production)**.

**Target**: Base remote Supabase (URL depuis `.env.local`)

**⚠️ Sécurité**:

- Validation automatique que l'URL est bien remote (bloque si localhost)
- Affiche `⚠️ REMOTE TESTING MODE`
- Cleanup automatique de toutes les données de test

**Utilisation**:

```bash
pnpm exec tsx scripts/test-thumbnail-generation-remote.ts
```

**Variables requises** (`.env.local`):

- `NEXT_PUBLIC_SUPABASE_URL` (URL cloud)
- `SUPABASE_SECRET_KEY` (clé de service cloud)

**Tests effectués**:

1. Happy Path sur production
2. Pattern Warning sur production
3. Cleanup systématique

---

### test-thumbnail-direct-remote.ts ⚠️ REMOTE

**Description**: Test direct des fonctions DAL sur **Supabase Cloud**. Version remote du test direct.

**Target**: Base remote Supabase (URL depuis `.env.local`)

**Utilisation**:

```bash
pnpm exec tsx scripts/test-thumbnail-direct-remote.ts
```

**Résultats identiques aux tests locaux**:

- Génération thumbnail 300x300 JPEG
- Réduction de taille : 74% (3120 → 809 bytes)
- Upload vers Storage cloud
- Update database cloud
- Vérification complète
- Cleanup systématique

**Date de création**: 2026-01-30

---

### create-admin-user.ts (TypeScript) ✅ OPÉRATIONNEL

**Description**: Crée l'utilisateur admin initial dans la base de données **remote** (production). Utilise les variables d'environnement `.env.local`.

**Utilisation**:

```bash
pnpm exec tsx scripts/create-admin-user.ts
```

**Configuration Requise**:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SECRET_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ Important**: Ce script crée l'utilisateur en **production**. Pour la base locale, utiliser `create-admin-user-local.ts`.

---

### test-views-security-invoker.ts (TypeScript) ✅ NOUVEAU (2026-02-02)

**Description**: Teste la sécurité des vues après correction SECURITY INVOKER. Vérifie que les 4 vues corrigées (articles_presse_public, communiques_presse_public, spectacles_landscape_photos_public/admin) respectent les RLS policies.

**Utilisation**:

```bash
pnpm exec tsx scripts/test-views-security-invoker.ts
```

**Tests couverts (6 vérifications)**:

| Type | Vue | Comportement attendu |
| ------ | ---- | ---------------------- |
| PUBLIC | `articles_presse_public` | ✅ Accessible anon |
| PUBLIC | `communiques_presse_public` | ✅ Accessible anon |
| PUBLIC | `popular_tags` | ✅ Accessible anon |
| PUBLIC | `categories_hierarchy` | ✅ Accessible anon |
| ADMIN | `analytics_summary` | ❌ Denied to anon |
| ADMIN | `analytics_summary_90d` | ❌ Denied to anon |

**Contexte**: Créé suite à la détection par Supabase Security Advisors de 4 vues utilisant SECURITY DEFINER au lieu de SECURITY INVOKER. Migration `20260202010000_fix_views_security_invoker.sql` appliquée pour corriger.

**Validation**: 6/6 tests passent avec SECURITY INVOKER correctement appliqué.

---

## 🩺 Diagnostic Admin (Janvier 2026)

### test-views-security-authenticated.ts (TypeScript) ✅ NOUVEAU (2026-01-22)

**Description**: Teste la sécurité des vues en tant qu'utilisateur authentifié NON-admin. Vérifie que les vues PUBLIC sont accessibles et que les vues ADMIN sont bloquées.

**Utilisation**:

```bash
# DB locale (utilise les clés Supabase locales standard)
pnpm test:views:auth:local

# DB remote (utilise les variables d'environnement .env)
pnpm test:views:auth:remote
```

**Tests couverts (8 vérifications)**:

| Type | Vue/Fonction | Comportement attendu |
| ------ | ------------- | ---------------------- |
| PUBLIC | `articles_presse_public` | ✅ Accessible |
| PUBLIC | `communiques_presse_public` | ✅ Accessible |
| PUBLIC | `popular_tags` | ✅ Accessible |
| PUBLIC | `categories_hierarchy` | ✅ Accessible |
| ADMIN | `communiques_presse_dashboard()` | ❌ Permission denied |
| ADMIN | `membres_equipe_admin` | ❌ Permission denied |
| ADMIN | `analytics_summary` | ❌ Permission denied |
| ADMIN | (6 autres vues admin) | ❌ Permission denied |

**Note**: Les clés locales sont les clés standard Supabase (identiques pour tous les projets locaux). Pour les obtenir: `pnpm dlx supabase status`.

**Mise à jour 2026-01-22**: Scripts corrigés pour utiliser `.rpc('communiques_presse_dashboard')` au lieu de `.from()` suite à la conversion VIEW → FUNCTION SECURITY DEFINER.

**Contexte**: Créé pour valider TASK024 Phase 6 (Media Library Integration) et la conversion de `communiques_presse_dashboard` en FUNCTION SECURITY DEFINER.

---

### check-admin-status.ts (TypeScript) ✅ RECOMMANDÉ

**Description**: Script de diagnostic pour vérifier l'accès aux vues admin avec SERVICE_ROLE. Teste directement les permissions sur `communiques_presse_dashboard` et `analytics_summary`.

**Utilisation**:

```bash
pnpm check:admin-status
# ou
pnpm exec tsx scripts/check-admin-status.ts
```

**Tests couverts (3 vérifications)**:

| Test | Description |
| ------ | ------------- |
| Test 1 | Accès `communiques_presse_dashboard` via service_role |
| Test 2 | Accès `analytics_summary` via service_role |
| Test 3 | Vérification configuration sécurité (pg_views) |

**Avantages**:

- ✅ Utilise `SUPABASE_SECRET_KEY` (service_role) pour bypass RLS
- ✅ Teste directement les vues admin (pas d'authentification utilisateur)
- ✅ Confirme que le pattern TASK037 est correctement appliqué
- ✅ Messages clairs et explicites (pg_views = comportement normal)

**Configuration Requise**:

```bash
SUPABASE_SECRET_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Résultat attendu**:

```yml
✅ communiques_presse_dashboard: X ligne(s)
✅ analytics_summary: X ligne(s)
ℹ️  pg_views non accessible via API Supabase (comportement normal)
Accès vues admin: OK ✅
```

**Contexte**: Créé pour valider que les vues admin suivent le pattern TASK037 (SECURITY INVOKER + GRANT service_role only). Les vues admin ne doivent JAMAIS être accessibles via le rôle `authenticated`.

**Voir aussi**: `/admin/debug-auth` page (utilise `createAdminClient()` de la même manière)

---

### check-existing-profile.js (JavaScript)

**Description**: Vérifie qu'un profil utilisateur existe dans la table `profiles` avec le rôle admin.

**Utilisation**:

```bash
pnpm check:admin-profile
# ou
node scripts/check-existing-profile.js
```

**Tests**: Récupère le profil pour un `user_id` spécifique et affiche `display_name`, `role`.

**Avantages**:

- ✅ Utilise service_role pour bypass RLS
- ✅ Confirme que le profil admin existe avant d'autres diagnostics
- ✅ Affiche toutes les colonnes du profil

**Note**: Modifier la variable `userId` dans le script pour tester différents utilisateurs.

---

### diagnose-admin-views.js (JavaScript)

**Description**: Diagnostic rapide des accès admin : profil, fonction RPC `communiques_presse_dashboard`, et vue `analytics_summary`.

**Utilisation**:

```bash
pnpm diagnose:admin-views
# ou
node scripts/diagnose-admin-views.js
```

**Tests couverts (3 vérifications)**:

| Test | Description |
| ------ | ------------- |
| Test 1 | Profil admin en base (`role = 'admin'`) |
| Test 2 | Présence de la fonction RPC `communiques_presse_dashboard` |
| Test 3 | Accessibilité de la vue `analytics_summary` |

**Avantages**:

- ✅ Diagnostic en une commande
- ✅ Distingue absence de fonction (PGRST202) vs refus de permission (attendu)
- ✅ Résultat binaire clair : "Tout est opérationnel" ou liste des problèmes

**Note** : `communiques_presse_dashboard` est une **FUNCTION SECURITY DEFINER** (RPC), pas une vue. Elle refuse l'accès sans JWT admin — comportement attendu avec `service_role` seul.

**Note** : Nécessite uniquement `NEXT_PUBLIC_SUPABASE_URL` et `SUPABASE_SECRET_KEY`.

---

### 🚀 Performance & Optimisation

#### check_unused_indexes.sql (SQL) ✅ NOUVEAU (2026-01-07)

**Description**: Identifie les index inutilisés en production via `pg_stat_user_indexes` pour optimiser l'espace disque et les performances.

**Utilisation**:

```bash
# Sur le cloud Supabase
pnpm dlx supabase db remote shell --linked
# Puis dans psql:
\i scripts/check_unused_indexes.sql

# Ou en une commande:
psql "<PRODUCTION_DB_URL>" -f scripts/check_unused_indexes.sql
```

**Output Attendu**:

| schemaname | tablename | indexname | idx_scan |
| ------------ | ----------- | ----------- | ---------- |
| public | old_table | idx_unused_column | 0 |

**Utilisation des Résultats**:

1. **Validation pré-DROP**: Attendre 7-14 jours après déploiement migration pour statistiques représentatives
2. **Analyse**: `idx_scan = 0` indique index jamais utilisé (candidat à suppression)
3. **Action**: Décommenter les `DROP INDEX` correspondants dans la migration de performance

**Contexte**: Créé suite au rapport Supabase Advisors (2026-01-07) identifiant ~30 index inutilisés. Fait partie de la migration `20260107123000_performance_indexes_rls_policies.sql`.

**Note**: Ne PAS exécuter sur DB locale (pas de statistiques d'usage significatives).

---

### 💾 Backup & Recovery (TASK050)

#### backup-database.ts (TypeScript) ✅ OPÉRATIONNEL

**Description**: Script de sauvegarde automatisée de la base de données. Exécute pg_dump, compresse avec gzip, et upload vers Supabase Storage (bucket `backups`). Inclut rotation automatique des anciens backups (conserve les 4 derniers).

**Utilisation**:

```bash
# Exécution manuelle
pnpm exec tsx scripts/backup-database.ts

# Via GitHub Actions (automatique chaque dimanche à 3h UTC)
# Voir .github/workflows/backup-database.yml
```

**Configuration Requise**:

```bash
# IMPORTANT: Utiliser le connection pooler (port 6543)
SUPABASE_DB_URL=postgresql://postgres.PROJECT_REF:[password]@aws-0-eu-west-3.pooler.supabase.com:6543/postgres
SUPABASE_SECRET_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
```

**Secrets GitHub Actions** (3 requis):

| Secret | Description |
| ------ | ----------- |
| `SUPABASE_DB_URL` | URL connection pooler (port 6543, PAS 5432) |
| `SUPABASE_SECRET_KEY` | Service role key |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |

**Format du backup**:

- Nom: `backup-YYYYMMDD-HHMMSS.dump.gz`
- Format: pg_dump custom + gzip compression (level 9)
- Destination: bucket `backups` (private, service_role only)

**Workflow GitHub Actions**:

- **Fichier**: `.github/workflows/backup-database.yml`
- **Schedule**: Chaque dimanche à 03:00 UTC (`0 3 * * 0`)
- **Trigger manuel**: Possible via Actions UI
- **Rétention**: 4 derniers backups conservés

**Points clés d'implémentation**:

- ✅ Utilise `readFileSync` (Buffer) au lieu de `createReadStream` (Stream) pour compatibilité Node.js 18+
- ✅ Pas de dépendance T3 Env (validation manuelle des env vars)
- ✅ Connection pooler obligatoire pour GitHub Actions (port 6543)

**Restauration**:

Voir le runbook complet: `memory-bank/tasks/TASK050_RUNBOOK_PITR_restore.md`

**Contexte**: Créé pour TASK050 (Database Backup & Recovery Strategy). Première exécution réussie: 2026-01-14.

---

### �️ Thumbnail Management & Diagnostics (TASK029)

#### check-thumbnails-db.ts (TypeScript) ✅ LOCAL

**Description**: Liste tous les médias de la base de données **locale** avec leur statut de thumbnail (✅ avec / ❌ sans). Affiche les statistiques globales et les détails par média.

**Target**: Base locale Supabase (`http://127.0.0.1:54321`)

**Utilisation**:

```bash
# Via npm script (recommandé)
pnpm thumbnails:check

# Ou directement
pnpm exec tsx scripts/check-thumbnails-db.ts
```

**Output attendu**:

```yaml
📊 Media Thumbnails Status (LOCAL DB)
========================================

ID: 15 | 3 - Le drapier.png
Storage: spectacles/1769621372382-3---Le-drapier.png
Thumbnail: ✅ spectacles/1769621372382-3---Le-drapier_thumb.jpg
Created: 2026-01-28 17:29:38

...

📊 Statistics:
Total media: 15
With thumbnails: 7
Without thumbnails: 8
```

**Informations affichées**:

- ID du média
- Nom du fichier
- Chemin Storage
- Status thumbnail (✅ / ❌)
- Date de création
- Statistiques globales

**Contexte**: Créé pour diagnostiquer les thumbnails NULL après TASK029. Utile pour vérifier l'état des thumbnails avant/après régénération.

---

#### check-storage-files.ts (TypeScript) ✅ LOCAL

**Description**: Vérifie si les fichiers référencés dans la base de données existent physiquement dans le Storage Supabase. Teste des chemins spécifiques pour détecter les seed data manquantes.

**Target**: Base locale Supabase + Storage bucket `media`

**Utilisation**:

```bash
# Via npm script (recommandé)
pnpm thumbnails:check-storage

# Ou directement
pnpm exec tsx scripts/check-storage-files.ts
```

**Output attendu**:

```yaml
🔍 Checking Storage Files
========================================

Testing: press-kit/logos/rouge-cardinal-logo-vertical.png
Result: ❌ NOT FOUND

Testing: photos/spectacle-scene-1.jpg
Result: ❌ NOT FOUND

...
```

**Chemins testés** (configurable dans le script):

- `press-kit/logos/` - Logos de presse
- `photos/` - Photos spectacles et équipe
- `uploads/` - Uploads génériques

**Résultat**: Identifie les fichiers manquants (seed data jamais uploadées physiquement).

**Contexte**: Créé pour diagnostiquer pourquoi 4 médias échouaient lors de la régénération de thumbnails. Révélé que les fichiers de seed n'existent pas dans le Storage.

---

#### regenerate-all-thumbnails.ts (TypeScript) ✅ LOCAL ONLY

**Description**: Régénère les thumbnails pour tous les médias de la base de données **locale** qui n'en ont pas. Processus batch avec téléchargement, génération Sharp, upload et mise à jour DB.

**Target**: Base locale Supabase UNIQUEMENT

**Sécurité**: `validateLocalOnly(SUPABASE_URL)` empêche toute exécution sur base remote.

**Utilisation**:

```bash
# Via npm script (recommandé)
pnpm thumbnails:regenerate:local

# Ou directement
pnpm exec tsx scripts/regenerate-all-thumbnails.ts
```

**Variables requises** (`.env.local`):

- `SUPABASE_LOCAL_URL` (http://127.0.0.1:54321)
- `SUPABASE_LOCAL_SERVICE_KEY` (clé service locale)

**Workflow**:

1. ✅ Validation sécurité (reject si remote URL)
2. ✅ Récupère médias sans thumbnails
3. ✅ Pour chaque média JPG/PNG/WebP :
   - Télécharge original depuis Storage
   - Génère thumbnail 300x300 JPEG (Sharp, qualité 80%)
   - Upload thumbnail dans Storage (suffixe `_thumb.jpg`)
   - Met à jour `medias.thumbnail_path`
4. ⏭️ Ignore SVG/PDF/vidéo automatiquement
5. ❌ Rapporte erreurs (fichiers manquants, etc.)

**Output attendu**:

```yaml

🏠 LOCAL DATABASE Thumbnail Regeneration
==========================================

📡 Target: http://127.0.0.1:54321
📊 Found 8 media without thumbnails

Processing rouge-cardinal-logo-horizontal.svg... ⏭️  Skipped (image/svg+xml)
Processing spectacle-scene-1.jpg... ❌ Download failed: {}
Processing logo-florian.png... ✅ uploads/1768237573156-logo-florian_thumb.jpg

📊 Results:
   ✅ Success: 4
   ⏭️  Skipped: 2
   ❌ Errors: 2
```

**Formats supportés**: JPG, PNG, WebP  
**Formats ignorés**: SVG, PDF, vidéo

**Contexte**: Créé pour backfiller les thumbnails des médias uploadés avant l'implémentation du système automatique (TASK029).

---

#### regenerate-all-thumbnails-remote.ts (TypeScript) ⚠️ REMOTE (PRODUCTION)

**Description**: Régénère les thumbnails pour tous les médias de la base de données **REMOTE (production)**. **DRY-RUN par défaut** avec flag `--apply` requis pour modifications réelles.

**Target**: Base remote Supabase (production)

**Sécurité**:

- ✅ Anti-localhost check (rejette si URL contient localhost/127.0.0.1)
- ✅ **DRY-RUN par défaut** : aucune modification sans `--apply`
- ✅ Confirmation 3 secondes avant exécution en mode apply
- ✅ Batch processing : 10 médias à la fois avec délai 1s (rate limiting)

**Utilisation**:

```bash
# Simulation (DRY-RUN, recommandé en premier)
pnpm thumbnails:regenerate:remote
# Ou
pnpm exec tsx scripts/regenerate-all-thumbnails-remote.ts

# Application réelle (après validation dry-run)
pnpm thumbnails:regenerate:remote:apply
# Ou
pnpm exec tsx scripts/regenerate-all-thumbnails-remote.ts --apply
```

**Variables requises** (`.env.local`):

- `NEXT_PUBLIC_SUPABASE_URL` (URL production)
- `SUPABASE_SECRET_KEY` (clé service production)

**Workflow DRY-RUN**:

```yaml
🌍 REMOTE DATABASE Thumbnail Regeneration
==========================================

📡 Target: https://xxx.supabase.co
⚠️  Mode: DRY RUN (simulation only, no changes)
📊 Found 15 media without thumbnails

📦 Batch 1/2
Processing logo.svg... ⏭️  Skipped (image/svg+xml)
Processing photo.jpg... [DRY RUN] uploads/photo_thumb.jpg

📦 Batch 2/2
...

📊 Results:
   ✅ Would generate: 11
   ⏭️  Skipped: 4
   ❌ Errors: 0
```

**Workflow --apply** (production):

```yaml
⚠️  Mode: APPLY (changes WILL be made to production)
   Proceeding in 3 seconds...

Processing photo.jpg... ✅ uploads/1768095683261-photo_thumb.jpg

📊 Results:
   ✅ Success: 11
   ⏭️  Skipped: 4
   ❌ Errors: 0
```

**Résultats réels** (exécution 2026-01-30):

- ✅ 7 thumbnails générés avec succès
- ⏭️ 4 fichiers ignorés (2 SVG + 2 PDF)
- ❌ 4 erreurs (seed data files not found)

**⚠️ IMPORTANT**:

- Toujours exécuter dry-run en premier
- Vérifier les logs avant --apply
- Confirmer que les URLs de production sont correctes
- Ne jamais exécuter sur localhost (protection automatique)

**Contexte**: Créé pour résoudre le problème des 15 médias avec `thumbnail_path = NULL` en production après implémentation TASK029. Voir `doc/THUMBNAIL-GENERATION-DEBUG-AND-FIX.md` pour détails complets.

**Voir aussi**:

- `scripts/README-thumbnails.md` — Documentation complète des 4 scripts
- `doc/thumbnail-flow.md` — Diagramme du flow de génération
- `doc/diagnostic-thumbnails-null.md` — Analyse root cause
- `doc/THUMBNAIL-GENERATION-DEBUG-AND-FIX.md` — Rapport complet debug & fix

---

### �📊 Analytics & Monitoring (TASK031)

#### test-sentry-api.ts (TypeScript) ✅ OPÉRATIONNEL (2026-01-17)

**Description**: Script de test de l'intégration Sentry API pour le dashboard Analytics. Vérifie la connexion, récupère les erreurs non résolues des 14 derniers jours, et affiche les métriques.

**Utilisation**:

```bash
pnpm exec tsx scripts/test-sentry-api.ts
```

**Configuration Requise**:

```bash
# Dans .env.local
SENTRY_ORG=rouge-cardinal-company
SENTRY_PROJECT=javascript-nextjs
SENTRY_AUTH_TOKEN=sntryu_xxxxx...  # API Token (pas Release token!)
```

**Output Attendu**:

```bash
🧪 Test Sentry API Integration
✅ Sentry API Integration Test PASSED

📊 Results:
  - Unresolved issues: 4
  - Time period: 14d
  - Organization: rouge-cardinal-company
  - Project: javascript-nextjs

📋 Issue Titles:
  - [SENTRY-2P] Error: Route "/admin/analytics" used...
  - [SENTRY-2N] FetchError: server error...
```

**Limitations Sentry API**:

| Paramètre | Valeurs autorisées |
| --------- | ------------------ |
| `statsPeriod` | `''` (24h default), `'24h'`, `'14d'` |
| `statsPeriod` | ❌ `'30d'`, `'90d'` non supportés |

**Tokens Sentry** (différence critique):

| Type | Format | Usage |
| ---- | ------ | ----- |
| **Release Token** | `sntrys_eyJ...` | CI/CD upload sourcemaps |
| **API Token** | `sntryu_xxxxx...` | REST API (dashboard) ✅ |

**Scopes API Token requis**: `project:read`, `org:read`, `event:read`

**Contexte**: Créé pour TASK031 (Analytics Dashboard). Le dashboard admin utilise cette API pour afficher les erreurs Sentry en temps réel.

---

### 🧪 Tests DAL (Data Access Layer)

#### test-all-dal-functions-doc.ts (TypeScript) ✅ DOCUMENTATION

**Description** : Script de documentation listant toutes les fonctions DAL wrappées avec React cache(). Ne peut pas exécuter les tests directement (restriction server-only), mais fournit une liste organisée et des approches de test alternatives.

**Utilisation** :

```bash
pnpm exec tsx scripts/test-all-dal-functions.ts
```

**Sortie** :

- Liste des 21 fonctions DAL organisées par 12 fichiers
- Recommandations pour les tests alternatifs :
  - `pnpm exec tsc --noEmit` - Validation TypeScript
  - `pnpm dev` - Tests manuels via serveur de développement
  - Visites de pages - Vérifier la fonctionnalité
  - Monitoring des logs - Détecter les erreurs runtime

**Contexte** : Les modules DAL utilisent le package `server-only` qui empêche l'import direct hors du contexte Next.js. Ce script sert de référence pour le suivi des fonctions optimisées avec React cache().

**Voir aussi** : `.github/prompts/plan-TASK034-performanceOptimization.prompt.md` (Phase 8)

---

#### test-team-server-actions.ts (TypeScript) ✅ RECOMMANDÉ

**Description** : Tests DAL directs pour les opérations team (toggle active, list, fetch). Utilise le service role key pour accéder directement à la base de données.

**Utilisation** :

```bash
pnpm exec tsx scripts/test-team-server-actions.ts
```

**Tests couverts (7 tests)** :

| Test | Description |
| ------ | ------------- |
| Test 1 | Toggle to inactive (false) |
| Test 2 | Toggle to active (true) |
| Test 3 | Idempotence check (set true twice) |
| Test 4 | Restore original state |
| Test 5 | List team members |
| Test 6 | Fetch single member by ID |
| Test 7 | Invalid ID returns null (not error) |

**Avantages** :

- ✅ Pas besoin de cookie admin (utilise service role key)
- ✅ Tests rapides (~1 seconde total)
- ✅ Validation directe de la logique DAL
- ✅ Indépendant de l'authentification Next.js

**Configuration Requise** :

```bash
SUPABASE_SECRET_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### test-team-active-dal.ts (TypeScript)

**Description** : Tests DAL legacy pour le toggle active/inactive. Remplacé par `test-team-server-actions.ts`.

```bash
pnpm exec tsx scripts/test-team-active-dal.ts
```

---

### ⚠️ Scripts Archivés (API Routes supprimées)

Les scripts suivants testaient des API Routes qui ont été supprimées lors de la migration vers Server Actions (décembre 2025). Ils sont archivés dans `scripts/Archived-tests/` :

| Script archivé | API Route supprimée | Remplacement |
| ---------------- | --------------------- | -------------- |
| `test-active-endpoint.ts` | `/api/admin/team/[id]/active` | `test-team-server-actions.ts` |
| `test-active-endpoint-service.ts` | `/api/admin/team/[id]/active` | `test-team-server-actions.ts` |
| `test-active-endpoint.sh` | `/api/admin/team/[id]/active` | `test-team-server-actions.ts` |
| `quick-test-active.sh` | `/api/admin/team/[id]/active` | `test-team-server-actions.ts` |
| `test-spectacles-endpoints.ts` | `/api/admin/spectacles/*` | Server Actions dans `app/(admin)/admin/spectacles/actions.ts` |

**Note** : Les opérations CRUD team/spectacles utilisent maintenant des Server Actions colocalisées dans `app/(admin)/admin/<feature>/actions.ts`.

---

### �️ Tests Rate-Limiting (TASK046)

Ces scripts testent l'implémentation du rate-limiting pour les endpoints publics (Contact Form + Newsletter).

#### test-rate-limit-contact.ts ✅ RECOMMANDÉ

**Description** : Test automatisé du rate-limiting du formulaire de contact (5 req/15min par IP).

**Utilisation** :

```bash
# Démarrer le serveur dev
pnpm dev

# Dans un autre terminal
pnpm exec tsx scripts/test-rate-limit-contact.ts
```

**Tests couverts (2 tests)** :

| Test | Description |
| ------ | ------------- |
| Test 1 | 5 requêtes consécutives (doivent passer) |
| Test 2 | 6ème requête (doit être bloquée avec HTTP 429) |

**Avantages** :

- ✅ HTTP-based testing (fetch contre localhost:3000)
- ✅ Simulation IP via header X-Forwarded-For
- ✅ Validation messages d'erreur user-friendly
- ✅ Tests rapides (~3 secondes total)

**Résultat attendu** :

```yml
✅ Requête 1-5/5: OK (200)
✅ Requête 6/6: BLOQUÉ (429) "Trop de tentatives. Veuillez réessayer dans X minutes."
```

**Note** : Redémarrer le serveur dev pour réinitialiser le rate-limit.

---

#### test-rate-limit-newsletter.ts ✅ RECOMMANDÉ

**Description** : Test automatisé du rate-limiting de l'inscription newsletter (3 req/1h par email).

**Utilisation** :

```bash
# Démarrer le serveur dev
pnpm dev

# Dans un autre terminal
pnpm exec tsx scripts/test-rate-limit-newsletter.ts
```

**Tests couverts (2 tests)** :

| Test | Description |
| ------ | ------------- |
| Test 1 | 3 requêtes consécutives (doivent passer) |
| Test 2 | 4ème requête (doit être bloquée avec HTTP 429) |

**Avantages** :

- ✅ Email unique par test run (Date.now() timestamp)
- ✅ Validation normalisation email (lowercase)
- ✅ Pas de collision rate-limit entre tests
- ✅ Tests rapides (~2 secondes total)

**Résultat attendu** :

```yml
✅ Requête 1-3/3: OK (200)
✅ Requête 4/4: BLOQUÉ (429) "Trop de tentatives d'inscription. Veuillez réessayer dans 60 minutes."
```

**Documentation complète** :

- Architecture : `doc/RATE-LIMITING.md`
- Tests manuels : `doc/RATE-LIMITING-TESTING.md`

#### check-cloud-data.ts ✅ NOUVEAU (2026-01-10)

**Description**: Vérifie l'intégrité des données sur la base de données cloud Supabase après un reset ou une migration critique.

**Utilisation**: `pnpm check:cloud` ou `pnpm exec tsx scripts/check-cloud-data.ts`

**Vérifications**: Admin profile, Spectacles (≥16), Hero Slides (≥2), Partners (≥3), Team Members (≥5)

**Contexte**: Créé suite à un `db reset --linked` accidentel sur production (10 janvier 2026).

## �🔐 Administration & Sécurité

**Utilisation** :

```bash
pnpm exec tsx scripts/test-views-security-authenticated.ts
```

**Tests couverts (13 vues totales)** :

| Catégorie | Nombre | Comportement Attendu |
| --------- | ------ | --------------------- |
| **Vues Admin** | 7 | Erreur 42501 (permission denied) |
| **Vues Publiques** | 4 | Données accessibles |
| **Tables Publiques** | 2 | Filtre `active = true` automatique |

**Assertions Critiques** :

- ✅ Vues admin : erreur PostgreSQL 42501 (pas de tableau vide)
- ✅ Vues publiques : données accessibles
- ❌ Tableaux vides sur vues admin : échec critique (mauvaise configuration)

**Security Vulnerability Detection** :

```typescript
if (!error || error.code !== '42501') {
  throw new Error(`🚨 SECURITY: ${viewName} returned ${data?.length ?? 0} rows instead of error`);
}
```

**Références** :

- Migration : `20260105120000_admin_views_security_hardening.sql`
- Pattern : Role-Based View Ownership Isolation
- Task : TASK037

---

### test-newsletter-recursion-fix-direct.ts (Legacy - voir test-rls-cloud.ts)

**Description** : Test legacy du hotfix newsletter. Remplacé par `test-rls-cloud.ts` qui inclut tous les tests RLS.

---

### test-rls-cloud.ts ✅ RECOMMANDÉ (Migration 20260107130000)

**Description** : Test complet des policies RLS sur Cloud. Inclut les tests newsletter avec le fix final (sans NOT EXISTS).

**Utilisation** :

```bash
pnpm exec tsx scripts/test-rls-cloud.ts
```

**Tests couverts (13 tests)** :

| Catégorie | Tests | Description |
| --------- | ----- | ----------- |
| Newsletter | 4 | Email valide, invalide, vide, duplicate (via UNIQUE) |
| Contact | 5 | RGPD consent, email, message, téléphone, valide |
| Audit Logs | 1 | INSERT direct bloqué |
| Analytics | 3 | Event types whitelist |

**Avantages** :

- ✅ Tests Cloud database (pas local)
- ✅ Valide le fix final récursion infinie (20260107130000)
- ✅ Valide la défense en profondeur (UNIQUE + regex)
- ✅ Tests rapides (~3 secondes)

**Résultat attendu** :

```bash
📊 TEST SUMMARY
============================================================
Total tests: 13
✅ Passed: 13
❌ Failed: 0

🎉 All tests passed!
```

**Migrations testées** :

- `20260107120000_fix_newsletter_remove_duplicate_select_policy.sql` — Remove redundant SELECT
- `20260107130000_fix_newsletter_remove_not_exists_from_policy.sql` — ✅ FINAL FIX

**Note** : Les migrations 20260106* sont superseded mais conservées pour l'historique Cloud.

---

### 🔒 Tests Sécurité RLS (Row Level Security)

#### test-rls-policy-with-check-validation.ts ✅ RECOMMANDÉ (Migration 20260106190617)

**Description** : Test automatisé des corrections RLS pour les 4 tables publiques vulnérables ayant `WITH CHECK (true)`.

**Utilisation** :

```bash
pnpm exec tsx scripts/test-rls-policy-with-check-validation.ts
```

**Tables Testées (4)** :

| Table | Tests | Validation |
| ----- | ----- | ---------- |
| `abonnes_newsletter` | 4 tests | Email regex + anti-duplicate |
| `messages_contact` | 5 tests | RGPD consent + champs requis |
| `logs_audit` | 1 test | INSERT restreint au trigger SECURITY DEFINER |
| `analytics_events` | 3 tests | Event types whitelist (created_at auto) |

**Tests Couverts (13 tests)** :

1. Newsletter email invalide → bloqué (42501/23514)
2. Newsletter email vide → bloqué (42501/23514)
3. Newsletter email valide → accepté
4. Newsletter duplicate case-insensitive → bloqué (42501/23505)
5. Contact sans consent → bloqué (42501/23514)
6. Contact email invalide → bloqué (42501/23514)
7. Contact message < 10 chars → bloqué (42501/23514)
8. Contact téléphone invalide → bloqué (42501/23514)
9. Contact formulaire valide → accepté
10. Audit logs INSERT direct → bloqué (42501)
11. Analytics event type invalide → bloqué (42501/23514)
12. Analytics entity type invalide → bloqué (42501/23514)
13. Analytics event valide → accepté

**Avantages** :

- ✅ Validation défense en profondeur (app + DB)
- ✅ Tests RGPD compliance (consent obligatoire)
- ✅ Tests anti-spam (email regex, duplicates)
- ✅ Tests audit trail integrity (INSERT via trigger uniquement)
- ✅ Tests analytics data quality (types whitelistés)

**Résultat attendu** : 13/13 tests passed

**Références** :

- Migration : `20260106190617_fix_rls_policy_with_check_true_vulnerabilities.sql`
- Plan : `.github/prompts/plan-fix-rls-policy-vulnerabilities.prompt.md`
- Schémas : `10_tables_system.sql`, `02b_functions_core.sql`, `62_rls_advanced_tables.sql`

---

### 📅 Tests Admin Agenda (TASK055)

#### test-admin-agenda-crud.ts ✅ NOUVEAU (2026-01-26)

**Description**: Test complet des opérations CRUD pour les événements et lieux de l'agenda admin. Valide le fix BigInt serialization et l'intégrité des données.

**Utilisation**:

```bash
pnpm exec tsx scripts/test-admin-agenda-crud.ts
pnpm exec tsx scripts/test-agenda-query.ts
```

**Configuration Requise**:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SECRET_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Tests couverts (6 tests)**:

| Test | Description |
| ------ | ------------- |
| Test 1 | Fetch all events (admin) |
| Test 2 | Fetch all lieux |
| Test 3 | Create test event |
| Test 4 | Update test event |
| Test 5 | Delete test event |
| Test 6 | BigInt handling validation |

**Avantages**:

- ✅ Teste le cycle de vie complet CRUD
- ✅ Valide le fix BigInt serialization (aucune erreur attendue)
- ✅ Vérifie l'intégrité des relations spectacles/lieux
- ✅ Cleanup automatique (suppression du test event)
- ✅ Tests rapides (~2-3 secondes)

**Résultat attendu**:

```bash
📊 TEST SUMMARY
============================================================
Total tests: 6
✅ Passed: 6
❌ Failed: 0

🎉 All tests passed!
✅ TASK055 CRUD operations working correctly
✅ BigInt serialization fix validated
```

**Contexte**:

Créé pour valider TASK055 Phase 1 & 2 (Admin Agenda Management). Teste spécifiquement le fix BigInt serialization qui permettait une erreur "Do not know how to serialize a BigInt" lors des updates via Server Actions.

**Pattern testé**:

```bash
Form (number) → Server Action (EventFormSchema) → DAL (bigint) → ActionResult {success only} → router.refresh()
```

**Références**:

- Task: `memory-bank/tasks/TASK055-admin-agenda-management.md`
- Plan: `.github/prompts/plan-TASK055-AdminAgenda.prompt.md`
- Fix détaillé: `.git-commit-bigint-fix.md`

---

### 🤝 Tests Admin Partners (TASK064)

#### test-admin-partners.ts ✅ NOUVEAU (2026-02-28)

**Description**: Validation non-régression du DAL partners après audit fix. Valide l'absence de `process.env` direct, les codes d'erreur `[ERR_PARTNER_NNN]`, et l'intégrité des données.

**Utilisation**:

```bash
pnpm test:partners
# ou
pnpm exec tsx scripts/test-admin-partners.ts
```

**Configuration Requise**:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SECRET_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Tests couverts (6 tests)**:

| Test | Description |
| ------ | ------------- |
| Test 1 | Fetch all partners (admin) |
| Test 2 | Fetch existing partner by ID |
| Test 3 | Fetch non-existent partner (returns null) |
| Test 4 | No direct `process.env` in DAL (uses `buildMediaPublicUrl`) |
| Test 5 | Error codes follow `[ERR_PARTNER_NNN]` format |
| Test 6 | No `Resolver<>` cast in PartnerForm |

**Avantages**:

- ✅ Teste les opérations de lecture DAL (fetchAll, fetchById)
- ✅ Valide la conformité T3 Env (pas de `process.env` direct)
- ✅ Vérifie les codes d'erreur structurés `[ERR_PARTNER_001]` à `[ERR_PARTNER_006]`
- ✅ Confirme la suppression du cast dangereux `as Resolver<>`
- ✅ Tests rapides (~1-2 secondes)

**Résultat attendu**:

```bash
🧪 Admin Partners – Audit Fix Validation
============================================================

✅ All 6 tests passed
```

**Contexte**:

Créé pour valider TASK064 (Admin Partners Audit Fix). Teste les 18 étapes de refactoring du DAL, des Server Actions, des schemas et de l'UI partners.

**Pattern testé**:

```bash
DAL: mapToPartnerDTO() + dalSuccess/dalError + cache() + .parseAsync()
UI: SortablePartnerCard extraction + types.ts colocalisé + Resolver<> supprimé
```

**Références**:

- Task: `memory-bank/tasks/tasks-completed/TASK064-admin-partners-audit-fix.md`
- Plan: `.github/prompts/plan-fix-adminPartnersAudit.prompt.md`

---

#### check-admin-status.ts

**Description** : Vérifie le statut admin d'un utilisateur et affiche les métadonnées complètes.

**Utilisation** :

```bash
# Vérifier tous les utilisateurs
pnpm exec tsx scripts/check-admin-status.ts

# Vérifier un utilisateur spécifique
pnpm exec tsx scripts/check-admin-status.ts yandevformation@gmail.com
```

---

#### check-views-security.ts ✅ TASK037

**Description** : Test de sécurité des vues pour utilisateurs anonymes (validation RLS + SECURITY INVOKER).

**Utilisation** :

```bash
pnpm exec tsx scripts/check-views-security.ts
```

**Tests couverts (13 tests)** :

| Catégorie | Nombre | Comportement Attendu |
| --------- | ------ | --------------------- |
| **Vues Admin** | 7 | Bloquées (erreur 42501) |
| **Vues Publiques** | 4 | Accessibles |
| **Tables Publiques** | 2 | Filtre `active = true` |

**Validation SECURITY INVOKER** :

- ✅ Toutes les vues (13/13) doivent être `security_invoker = true`
- ❌ Aucune vue ne doit avoir `SECURITY DEFINER` (bypass RLS)

**Cas d'usage** :

- Validation post-migration (TASK037)
- CI/CD security gates
- Détection vulnérabilités RLS bypass

**Références** :

- Migration hotfix : `20260105130000_fix_security_definer_views.sql`
- Pattern : SECURITY INVOKER enforcement
- Task : TASK037

**Fonctionnalités** :

- ✅ Liste tous les utilisateurs ou filtre par email
- ✅ Affiche `app_metadata` (contrôlé serveur) et `user_metadata` (éditable client)
- ✅ Vérifie si `role: "admin"` est présent dans `app_metadata`
- ✅ Fournit la commande SQL pour ajouter le rôle admin si nécessaire

**Configuration Requise** :

```bash
SUPABASE_SECRET_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Exemple de sortie** :

```bash
📧 User: yandevformation@gmail.com
   ID: 4ea792b9-4cd9-4363-98aa-641fad96ee16
   ✅ Email Confirmed: Yes
   📋 app_metadata: {"provider":"email","providers":["email"],"role":"admin"}
   📋 user_metadata: {"email":"yandevformation@gmail.com","role":"admin"}
   ✅ Admin in app_metadata: Yes
```

##### ✅ Validation Manuelle (Alternative)

Pour vérifier l'ownership et SECURITY INVOKER des vues admin, exécutez dans Supabase SQL Editor :

```bash
-- Vérification manuelle dans Supabase SQL Editor
SELECT schemaname, viewname, viewowner,
  CASE WHEN c.reloptions::text LIKE '%security_invoker=true%' 
  THEN '✅ SECURITY INVOKER' ELSE '❌ SECURITY DEFINER' END as security_mode
FROM pg_views v
JOIN pg_class c ON c.relname = v.viewname
WHERE v.schemaname = 'public'
AND (v.viewname LIKE '%_admin' OR v.viewname LIKE '%_dashboard')
ORDER BY v.viewname;
```

> [!NOTE]
> Résultat attendu :
> Toutes les vues doivent afficher admin_views_owner + ✅ SECURITY INVOKER

### set-admin-role.ts

**Description** : Ajoute le rôle admin à un utilisateur via l'API Supabase.

**Utilisation** :

```bash
pnpm exec tsx scripts/set-admin-role.ts yandevformation@gmail.com
```

**Fonctionnalités** :

- ✅ Met à jour `app_metadata.role = "admin"` via `auth.admin.updateUserById`
- ✅ Instructions de fallback si la clé secrète n'est pas disponible
- ⚠️ L'utilisateur doit se déconnecter/reconnecter pour obtenir un nouveau JWT avec le rôle

---

### test-audit-logs-cloud.ts ✅ CLOUD

**Description** : Vérifie le déploiement cloud de la migration TASK033 (Audit Logs Viewer). Corrigé le 2026-02-26 — utilise `dotenv/config` au lieu de T3 Env, requête directe sur `logs_audit` au lieu du RPC.

**Utilisation** :

```bash
pnpm test:audit-logs:cloud
# ou
pnpm exec tsx scripts/test-audit-logs-cloud.ts
```

**Tests couverts (3 tests)** :

| Test | Description |
| ------ | ------------- |
| Test 1 | Vérification colonne `expires_at` (~90 jours) |
| Test 2 | Accès direct table `logs_audit` via service role (remplace RPC) |
| Test 3 | Fonction `cleanup_expired_audit_logs()` fonctionnelle |

**Résultats attendus** :

- ✅ `expires_at` présent avec date future
- ✅ `logs_audit` lisible via service role (bypass RLS)
- ✅ Cleanup exécuté sans erreur

**Configuration Requise** :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SECRET_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Pourquoi requête directe et non RPC** : `get_audit_logs_with_email` appelle `(select public.is_admin())` qui lit `auth.uid()`. La service role key bypasse RLS mais ne crée pas de session → `auth.uid()` retourne `null` → accès refusé même avec `SUPABASE_SECRET_KEY`.

---

### test-audit-logs-schema.ts ✅ CLOUD

**Description** : Vérifie le schéma de la table `logs_audit` (colonne `expires_at`, noms de tables, filtres). Script de référence TASK033 — corrigé le 2026-02-26 (T3 Env + RPC).

**Utilisation** :

```bash
pnpm test:audit-logs
# ou
pnpm exec tsx scripts/test-audit-logs-schema.ts
```

**Tests couverts (4 tests)** :

| Test | Description |
| ------ | ------------- |
| Test 1 | Colonne `expires_at` présente et peuplée |
| Test 2 | Accès direct `logs_audit` via service role (600 lignes attendues) |
| Test 3 | Noms de tables distinctes dans les logs (14 tables) |
| Test 4 | Filtre par action `INSERT` fonctionnel |

**Configuration Requise** :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SECRET_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Note** : Utilise `dotenv/config` + `process.env` directement (PAS T3 Env) — convention obligatoire pour tous les scripts CLI.

---

### test-audit-logs.ts ✅ CLOUD

**Description** : Tests d'intégration DAL + CSV export + RLS policies pour l'Audit Logs Viewer (TASK033). Importe directement les fonctions DAL.

**Utilisation** :

```bash
pnpm test:audit-logs:dal
# ou
pnpm exec tsx scripts/test-audit-logs.ts
```

**Tests couverts** :

| Test | Description |
| ------ | ------------- |
| 1 | Schéma DB (`expires_at`, RPC) |
| 2 | `fetchAuditLogs()` — DAL function |
| 3 | `fetchAuditTableNames()` — DAL function |
| 4 | `exportAuditLogsCSV` — Server Action |
| 5 | RLS policies (admin vs anon access) |

**Configuration Requise** :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SECRET_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### check-email-logs.ts

**Description** : Vérifie les logs d'emails et de messages de contact dans la base de données Supabase.

**Utilisation** :

```bash
pnpm exec tsx scripts/check-email-logs.ts
```

**Fonctionnalités** :

- ✅ Affiche les 5 dernières inscriptions à la newsletter
- ✅ Affiche les 5 derniers messages de contact reçus
- ✅ Détecte automatiquement les clés d'environnement disponibles
- ✅ Explique les problèmes RLS si la clé service_role n'est pas configurée

**Configuration Requise** :

```bash
# Minimum (accès limité par RLS)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Recommandé (accès admin complet)
SUPABASE_SECRET_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Troubleshooting** : Voir `doc/rls-policies-troubleshooting.md`

---

### 🔐 Audit de Sécurité (TASK036)

Ces scripts valident la conformité aux standards de sécurité OWASP et aux bonnes pratiques Next.js/Supabase.

#### audit-secrets-management.ts

**Description** : Audit complet de la gestion des secrets et variables d'environnement.

**Utilisation** :

```bash
pnpm exec tsx scripts/audit-secrets-management.ts
```

**Tests couverts (4/4)** :

| Test | Description |
| ------ | ------------- |
| Test 1 | Détection de secrets hardcodés dans le code |
| Test 2 | Validation T3 Env (lib/env.ts) |
| Test 3 | Vérification .gitignore (exclusion .env*) |
| Test 4 | Scan historique Git (pas de secrets commités) |

**Fonctionnalités** :

- ✅ Exclut les templates légitimes (.env.example, .env.*.template)
- ✅ Accepte les patterns .env*.local (équivalent .env.local)
- ✅ Scan récursif du code source
- ✅ Validation Zod des variables d'environnement

**Résultat attendu** : 4/4 tests passed ✅

---

#### audit-cookie-flags.ts

**Description** : Audit statique de la configuration des cookies Supabase (analyse de code).

**Utilisation** :

```bash
pnpm exec tsx scripts/audit-cookie-flags.ts
```

**Tests couverts (4 analyses)** :

| Analyse | Description |
| ------ | ------------- |
| 1 | Validation pattern getAll/setAll dans supabase/server.ts |
| 2 | Détection @supabase/ssr dans proxy.ts |
| 3 | Documentation auth présente |
| 4 | Flags attendus (httpOnly, secure, sameSite) |

**Fonctionnalités** :

- ✅ Vérifie pattern cookies recommandé (getAll/setAll, PAS get/set/remove)
- ✅ Valide usage @supabase/ssr
- ✅ Détecte flags de sécurité manquants
- ⚠️ Analyse statique uniquement (voir test-cookie-security.ts pour tests runtime)

**Note** : Complément avec `test-cookie-security.ts` pour validation complète.

---

### test-cookie-security.ts ✅ RECOMMANDÉ

**Description** : Test d'intégration des cookies avec validation runtime (requiert serveur dev).

**Utilisation** :

```bash
# Démarrer le serveur dev
pnpm dev

# Dans un autre terminal
pnpm exec tsx scripts/test-cookie-security.ts
```

**Tests couverts (3/3)** :

| Test | Description |
| ------ | ------------- |
| Test 1 | Serveur dev actif (http://localhost:3000) |
| Test 2 | Pages publiques sans cookies (pas d'auth requise) |
| Test 3 | Configuration @supabase/ssr validée |

**Fonctionnalités** :

- ✅ Validation runtime des cookies HTTP
- ✅ Inspection réelle des flags de sécurité
- ✅ Instructions manuelles pour DevTools
- ✅ Teste pages publiques (/, /agenda, /spectacles)

**Avantages** :

- 🔍 Détecte problèmes invisibles à l'analyse statique
- 🔍 Valide comportement réel du navigateur
- 🔍 Complémente audit-cookie-flags.ts

**Résultat attendu** : 3/3 tests passed ✅

---

### test-env-validation.ts

**Description** : Validation complète de la configuration T3 Env avec chargement .env.local.

**Utilisation** :

```bash
pnpm exec tsx scripts/test-env-validation.ts
```

**Tests couverts (6/6)** :

| Test | Description |
| ------ | ------------- |
| Test 1 | Chargement dotenv (.env.local puis .env) |
| Test 2 | Variables serveur (6 requises) |
| Test 3 | Variables client (3 requises) |
| Test 4 | Variables optionnelles (email dev) |
| Test 5 | Validation Zod schemas |
| Test 6 | Import lib/env.ts sans erreur |

**Fonctionnalités** :

- ✅ Charge .env.local automatiquement (dotenv)
- ✅ Validation runtime des schémas Zod
- ✅ Détection variables manquantes
- ✅ Test des variables optionnelles (RESEND_EMAIL_DEV_REDIRECT)

**Configuration Requise** : Fichier `.env.local` avec variables Supabase/Resend

**Résultat attendu** : 6/6 tests passed ✅

---

### 📊 Résumé TASK036 Audit de Sécurité

**Documentation complète** : Voir `doc/TASK036-SECURITY-AUDIT-SUMMARY.md`

**Résultats globaux** :

- ✅ OWASP Top 10 : 8/10 contrôles implémentés
- ✅ Production readiness : 85%
- ✅ Security headers : 6/6 configurés (next.config.ts)
- ✅ RLS : 36/36 tables protégées
- ✅ SECURITY INVOKER : 11/11 vues sécurisées

**Commande rapide - Audit complet** :

```bash
# Exécuter les 4 audits en séquence
pnpm exec tsx scripts/audit-secrets-management.ts && \
pnpm exec tsx scripts/audit-cookie-flags.ts && \
pnpm exec tsx scripts/test-env-validation.ts && \
echo "⚠️ Démarrez 'pnpm dev' puis exécutez:" && \
echo "pnpm exec tsx scripts/test-cookie-security.ts"
```

---

## 🔧 Configuration Générale

### Prérequis

1. **Node.js** : v20+ installé
2. **pnpm** : Gestionnaire de paquets
3. **tsx** : Installé automatiquement avec `pnpm install`

### Variables d'Environnement

Créez ou éditez le fichier `.env.local` à la racine du projet :

```bash
# Supabase - Public Keys (frontend)
NEXT_PUBLIC_SUPABASE_URL=https://yvtrlvmbofklefxcxrzv.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase - Admin Key (scripts/backend only)
# ⚠️ NEVER commit this key to version control
SUPABASE_SECRET_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Resend (email service)
RESEND_API_KEY=re_...
RESEND_WEBHOOK_SECRET=whsec_...

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Où trouver les clés Supabase** :

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Settings → API → Project API keys

### Exécution des Scripts

#### **Méthode 1 : Avec tsx (recommandé)**

```bash
pnpm exec tsx scripts/check-email-logs.ts
```

#### **Méthode 2 : Via package.json**

Ajoutez un script dans `package.json` :

```json
{
  "scripts": {
    "check-logs": "tsx scripts/check-email-logs.ts"
  }
}
```

Puis exécutez :

```bash
pnpm run check-logs
```

---

## 🔐 Migrations récentes de sécurité

- `20260103120000_fix_communiques_presse_dashboard_admin_access.sql` — correction urgente : recréation de la vue `communiques_presse_dashboard` avec un garde explicite `where (select public.is_admin()) = true` pour s'assurer que seules les sessions admin peuvent voir les lignes de cette vue.
- `20260103123000_revoke_authenticated_on_communiques_dashboard.sql` — révocation explicite du privilège `select` pour le rôle `authenticated` sur la vue admin afin d'éviter toute ré-exposition par des snapshots historiques.

  Remarques et bonnes pratiques :

- Toujours exécuter les scripts de vérification RLS avant/pour valider une migration de sécurité : `pnpm exec tsx scripts/test-views-security-authenticated.ts` et `pnpm exec tsx scripts/check-views-security.ts`.
- En cas de conflit d'historique de migrations lors d'un `supabase db push`, réparer l'historique distant avant d'appliquer les migrations (voir `migrations.md`).
- Ne pas ajouter de `grant select to authenticated` sur des vues admin ; préférer un filtre `where (select public.is_admin()) = true` dans la définition de la vue.

  ## 📝 Changelog

### Service Role Key

La clé `SUPABASE_SECRET_KEY` donne un **accès administrateur complet** :

- ✅ Bypass toutes les politiques RLS (Row Level Security)
- ✅ Lecture/écriture sur toutes les tables
- ✅ Exécution de fonctions privilégiées
- ✅ Suppression de données

**Règles de sécurité STRICTES** :

1. ⚠️ **JAMAIS** dans le code source
2. ⚠️ **JAMAIS** dans Git (vérifier `.gitignore`)
3. ⚠️ **JAMAIS** exposée au frontend
4. ✅ Seulement dans `.env.local` (backend/scripts)
5. ✅ Seulement pour les scripts admin
6. ✅ Rotation régulière si compromission suspectée

### Anon Key vs Service Role Key

| Clé                  | Usage         | Sécurité | RLS         |
| -------------------- | ------------- | -------- | ----------- |
| **ANON_KEY**         | Frontend      | Publique | ✅ Appliqué |
| **SERVICE_ROLE_KEY** | Scripts Admin | Privée   | ❌ Bypass   |

### Row Level Security (RLS)

Les tables suivantes sont protégées par RLS :

- `messages_contact` - Admin uniquement en lecture
- `abonnes_newsletter` - Admin uniquement en lecture
- `contacts_presse` - Admin uniquement en lecture/écriture

**Pourquoi ?**

- 🛡️ Protection des données personnelles (RGPD)
- 🛡️ Prévention des accès non autorisés
- 🛡️ Séparation des privilèges (public vs admin)

---

## 📊 Monitoring

### Vérifier les Données

```bash
# Newsletter subscriptions
pnpm exec tsx scripts/check-email-logs.ts

# Contact messages (requiert service_role key)
pnpm exec tsx scripts/check-email-logs.ts
```

### Logs Supabase

Pour voir les logs en temps réel dans Supabase :

1. https://supabase.com/dashboard/project/yvtrlvmbofklefxcxrzv/logs/explorer
2. Sélectionner "Database" dans le menu latéral
3. Filtrer par table : `messages_contact`, `abonnes_newsletter`

---

## 🐛 Dépannage

### 🚨 "Legacy API keys are disabled" (URGENT)

**Cause** : Vos clés Supabase sont obsolètes et ont été désactivées

**Solution** :

1. Générer de nouvelles clés : https://supabase.com/dashboard/project/yvtrlvmbofklefxcxrzv/settings/api
2. Cliquer sur "Generate new anon key" et "Generate new service_role key"
3. Mettre à jour `.env.local` avec les nouvelles clés
4. Redémarrer l'application : `pnpm dev`

**Guide complet** : `doc/rls-policies-troubleshooting.md` (section "Legacy API keys")

### "No contact messages found" avec des données dans la table

**Cause** : RLS activé, clé anon utilisée au lieu de service_role

**Solution** : Voir `doc/rls-policies-troubleshooting.md`

### "Missing Supabase environment variables"

**Cause** : Fichier `.env.local` manquant ou incomplet

**Solution** :

1. Copier `.env.example` vers `.env.local` (si disponible)
2. Ajouter les clés depuis le dashboard Supabase
3. Vérifier que le fichier est à la racine du projet

### Import errors avec TypeScript

**Cause** : Types Supabase non générés

**Solution** :

```bash
# Générer les types depuis le schéma
pnpm run types:generate

# Ou manuellement
npx supabase gen types typescript --project-id yvtrlvmbofklefxcxrzv > lib/database.types.ts
```

---

## 📚 Documentation

- `doc/rls-policies-troubleshooting.md` - Guide de dépannage détaillé
- `doc/OWASP-AUDIT-RESULTS.md` - Audit OWASP Top 10 (2021) complet
- `doc/PRODUCTION-READINESS-CHECKLIST.md` - Checklist pré-déploiement (85%)
- `doc/TASK036-SECURITY-AUDIT-SUMMARY.md` - Résumé exécutif audit sécurité
- `doc/Code-Cleanup-Auth-Session-2025-10-13.md` - Session de nettoyage et optimisation
- `doc/Architecture-Update-Auth-Cleanup-2025-10-13.md` - Mise à jour de l'architecture

---

## 🔄 Maintenance

### Ajouter un Nouveau Script

1. Créer le fichier dans `scripts/` avec extension `.ts`
2. Importer les types Supabase si nécessaire
3. Ajouter la documentation dans ce README
4. Tester avec `pnpm exec tsx scripts/votre-script.ts`

### Template de Script Admin

```typescript
// scripts/template-admin.ts
import { createClient } from "@supabase/supabase-js";

async function main() {
  // Use service_role key for admin access
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY! // Bypasses RLS
  );

  // Your admin logic here
  const { data, error } = await supabase.from("your_table").select("*");

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log("Results:", data);
}

main().catch(console.error);
```

---

## 📝 Changelog bis

### 2025-11-13 : Refactoring API Routes + DAL avec HttpStatus Constants

**Modifications Majeures** :

#### Phase 1 : Dashboard Refactoring (COMPLÉTÉ)

- ✅ Phase 1 - Foundation : ErrorBoundary, types Zod, test script (100% pass)
- ✅ Phase 2 - Component Extraction : StatsCard (29L), DAL dashboard.ts (54L), DashboardStatsContainer (45L)
  - admin/page.tsx : 133 → 69 lignes (-48%)
  - Pattern Smart/Dumb components respecté
  - Suspense + ErrorBoundary pour UX optimale
- ✅ Phase 3 - API Routes : Contact + Newsletter refactored
  - parseFullName() helper (plus de parsing manuel)
  - isUniqueViolation() type guard (exit magic string '23505')
  - HttpStatus constants partout (400, 500 → HttpStatus.BAD_REQUEST, etc.)
  - 0 TypeScript errors, code DRY, maintainability++
- ✅ Tests : 4/4 passing (800ms fetch, 524ms validation, 781ms parallel)
- ✅ Success Criteria : 9/9 atteints ✨
- ✅ **Commit créé** : dea0cd9 "feat(admin): Dashboard refactoring complete (3 phases)"

#### Phase 2 : Extension Pattern Helpers aux Autres Routes

- ✅ Refactoring de 5 API routes additionnelles :
  - `/api/debug-auth` : 1 HttpStatus constant
  - `/api/test-email` : 4 HttpStatus constants
  - `/api/admin/team` : 1 HttpStatus constant
  - `/api/webhooks/resend` : 1 HttpStatus constant
  - `/api/admin/team/[id]/hard-delete` : Refactoring complet avec tous les helpers
- ✅ Fix TypeScript error dans `lib/dal/team.ts` :
  - Updated DALError et DalResponse types : `status?: number` → `status?: HttpStatusCode`
  - Replaced 4 magic numbers : 404, 400, 403, 500 → HttpStatus constants
  - 0 TypeScript errors après fixes
- ✅ **Total magic numbers éliminés** : 14 (10 dans routes + 4 dans DAL)

#### Phase 3 : Tests et Validation

- ✅ Refactoring complet de `/api/admin/team/[id]/active` avec validation Zod
- ✅ Ajout de `lib/api/helpers.ts` (HttpStatus constants, ApiResponse, withAdminAuth, parseNumericId)
- ✅ Correction de `lib/auth/is-admin.ts` pour vérifier `app_metadata.role` en priorité
- ✅ Ajout de 3 scripts de test (bash, TypeScript, interactif) avec 17 tests automatisés
- ✅ Ajout de `check-admin-status.ts` et `set-admin-role.ts` pour la gestion des admins
- ✅ Fix du bug des IDs décimaux dans `parseNumericId`
- ✅ Création de `test-team-active-dal.ts` : 5 tests DAL directs (5/5 passed)

**Tests API /active Endpoint** : 17/17 passent (100% de succès avec cookie admin)
**Tests DAL Direct** : 5/5 passent (100% de succès avec service key)

**Impact Total** :

- 6 fichiers API routes refactorés (consistency across codebase)
- lib/dal/team.ts : types sécurisés avec HttpStatusCode
- 14 magic numbers éliminés (type safety)
- 0 TypeScript errors
- Pattern helpers standardisé pour futures routes

### 2026-01-03 : TASK036 Security Audit Completion (35%→100%)

**Audit de Sécurité OWASP Top 10** :

- ✅ **4 scripts d'audit créés** :
  - `audit-secrets-management.ts` - Validation secrets/T3 Env (4/4 tests)
  - `audit-cookie-flags.ts` - Analyse statique cookies (4 checks)
  - `test-cookie-security.ts` - Tests d'intégration cookies (3/3 tests)
  - `test-env-validation.ts` - Validation T3 Env runtime (6/6 tests)

- ✅ **Documentation créée** :
  - `doc/OWASP-AUDIT-RESULTS.md` - Audit complet 8/10 contrôles (588 lignes)
  - `doc/PRODUCTION-READINESS-CHECKLIST.md` - Checklist 85% (661 lignes)
  - `doc/TASK036-SECURITY-AUDIT-SUMMARY.md` - Résumé exécutif (528 lignes)

- ✅ **Security headers ajoutés** (next.config.ts) :
  - Content-Security-Policy (CSP avec Supabase)
  - Strict-Transport-Security (HSTS 2 ans)
  - X-Frame-Options (DENY)
  - X-Content-Type-Options (nosniff)
  - Referrer-Policy (strict-origin-when-cross-origin)
  - Permissions-Policy (restrictive)

**Subtasks complétées** :

- 1.6: Cookie flags (approche duale: statique + intégration)
- 1.7: Documentation OWASP audit
- 1.8: Secrets management (corrections false positives)
- 1.10: Production readiness checklist

**Résultats** :

- Production readiness: 85% ✅
- OWASP compliance: 8/10 contrôles ✅
- RLS: 36/36 tables protégées ✅
- SECURITY INVOKER: 11/11 vues sécurisées ✅

**Next steps** : Backup docs, HTTPS validation, CSP tuning, content seeding

---

## Tests Editor Role — TASK076

Scripts de validation RLS pour le rôle `editor` (modèle `user < editor < admin`).

### `test-editor-access-local.ts`

| Champ | Valeur |
| --- | --- |
| **Description** | Teste le CRUD editor contre Supabase **local** |
| **Commande** | `pnpm test:editor:local` |
| **Prérequis** | Supabase local démarré (`supabase start`) |
| **Variables** | `SUPABASE_LOCAL_URL`, `SUPABASE_LOCAL_PUBLISHABLE_KEY`, `SUPABASE_LOCAL_SERVICE_KEY` (`.env.local`) |

### `test-editor-access-remote.ts`

| Champ | Valeur |
| --- | --- |
| **Description** | Teste le CRUD editor contre Supabase **Cloud** |
| **Commande** | `pnpm test:editor:remote` |
| **Prérequis** | Credentials cloud dans `.env.local` |
| **Variables** | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`, `SUPABASE_SECRET_KEY` |

### Tables testées

| Catégorie | Tables | Ops | Attendu |
| --- | --- | --- | --- |
| **Éditoriales** | `spectacles`, `evenements`, `media`, `lieux`, `articles_presse`, `communiques_presse` | select, insert, update, delete | ✅ Autorisé |
| **Admin-only** | `membres_equipe`, `contacts_presse`, `configurations_site` | select/insert | ❌ Bloqué |

---

**Dernière mise à jour** : 11 mars 2026  
**Mainteneur** : YanBerdin  
**Contact** : yandevformation@gmail.com
