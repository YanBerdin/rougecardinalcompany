# Scripts d'Administration

Ce dossier contient des scripts d'administration pour gérer et surveiller l'application Rouge Cardinal Company.

## 📋 Liste des Scripts

### 🧪 Tests DAL (Data Access Layer)

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

### 🔐 Administration & Sécurité

#### check-admin-status.ts

**Description** : Vérifie le statut admin d'un utilisateur et affiche les métadonnées complètes.

**Utilisation** :

```bash
# Vérifier tous les utilisateurs
pnpm exec tsx scripts/check-admin-status.ts

# Vérifier un utilisateur spécifique
pnpm exec tsx scripts/check-admin-status.ts yandevformation@gmail.com
```

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

```
📧 User: yandevformation@gmail.com
   ID: 4ea792b9-4cd9-4363-98aa-641fad96ee16
   ✅ Email Confirmed: Yes
   📋 app_metadata: {"provider":"email","providers":["email"],"role":"admin"}
   📋 user_metadata: {"email":"yandevformation@gmail.com","role":"admin"}
   ✅ Admin in app_metadata: Yes
```

#### set-admin-role.ts

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

#### test-cookie-security.ts ✅ RECOMMANDÉ

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

#### test-env-validation.ts

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

**Dernière mise à jour** : 3 janvier 2026  
**Mainteneur** : YanBerdin  
**Contact** : yandevformation@gmail.com
