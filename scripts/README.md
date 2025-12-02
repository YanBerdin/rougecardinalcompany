# Scripts d'Administration

Ce dossier contient des scripts d'administration pour gérer et surveiller l'application Rouge Cardinal Company.

## 📋 Liste des Scripts

### 🧪 Tests API

#### test-active-endpoint.ts (TypeScript) ✅ RECOMMANDÉ

**Description** : Script TypeScript complet avec 17 tests automatisés pour l'endpoint `/api/admin/team/[id]/active`.

**✅ Production-ready** : Tous les tests passent (17/17) avec authentification admin.

**Utilisation** :

```bash
# Sans authentification (teste la protection auth)
pnpm exec tsx scripts/test-active-endpoint.ts

# Avec authentification (teste tous les cas)
pnpm exec tsx scripts/test-active-endpoint.ts --cookie "sb-xxx-auth-token=your-token"
```

#### test-team-active-dal.ts (TypeScript)

**Description** : Tests DAL directs (Data Access Layer) pour le toggle active/inactive des membres d'équipe. Utilise le service role key pour accéder directement à la base de données, contournant l'authentification Next.js.

**Utilisation** :

```bash
pnpm exec tsx scripts/test-team-active-dal.ts
```

**Tests couverts (5 tests)** :

| Test | Description | Durée |
|------|-------------|-------|
| Test 1 | Set to active (true) | ~350ms |
| Test 2 | Set to inactive (false) | ~190ms |
| Test 3 | Toggle back to active | ~170ms |
| Test 4 | Idempotence check | ~160ms |
| Test 5 | Invalid ID handling | ~160ms |

**Avantages** :

- ✅ Pas besoin de cookie admin (utilise service role key)
- ✅ Tests rapides (~1 seconde total)
- ✅ Validation directe de la logique DAL
- ✅ Indépendent de l'authentification Next.js

**Configuration Requise** :

```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Comment obtenir le cookie d'authentification** :

1. Se connecter sur http://localhost:3000 avec un compte admin
2. Ouvrir les DevTools (F12) → Application → Cookies → http://localhost:3000
3. Copier la valeur du cookie `sb-yvtrlvmbofklefxcxrzv-auth-token`
4. Utiliser dans le script : `--cookie "sb-yvtrlvmbofklefxcxrzv-auth-token=VALEUR_COPIEE"`

**Tests couverts (17 tests)** :

| Type | Tests | Status Attendu |
|------|-------|----------------|
| **Valeurs valides** | Boolean `true`/`false` | 200 OK |
| | String `"true"`/`"false"` | 200 OK |
| | Number `0`/`1` | 200 OK |
| **Valeurs invalides** | String `"maybe"` | 422 Validation Error |
| | Number `2`, `-1` | 422 Validation Error |
| | `null`, array, object | 422 Validation Error |
| | Champ manquant | 422 Validation Error |
| **IDs invalides** | Non-numeric `"abc"` | 400 Bad Request |
| | Négatif `-1` | 400 Bad Request |
| | Zéro `0` | 400 Bad Request |
| | Décimal `1.5` | 400 Bad Request |
| **Sécurité** | Sans cookie | 403 Forbidden |

**Résumé automatique** :

```
================================================
Test Summary
================================================
Total: 17
Passed: 17
Failed: 0
```

**✅ STATUT VALIDÉ** : Tous les tests passent avec authentification admin (--cookie flag).

**Dernier test** : 13 novembre 2025 - Succès complet (17/17) avec cookie admin extrait du navigateur.

#### test-active-endpoint.sh (Bash)

**Description** : Script bash léger pour tester rapidement l'endpoint.

**Utilisation** :

```bash
# Sans authentification
./scripts/test-active-endpoint.sh

# Avec authentification
./scripts/test-active-endpoint.sh "sb-xxx-auth-token=your-token-here"
```

**Tests couverts (14 tests)** :

- ✅ Cas valides : Boolean, String, Number
- ❌ Cas invalides : Valeurs incorrectes, champ manquant, ID invalide
- 🔒 Sécurité : Vérification protection auth

#### quick-test-active.sh (Interactif)

**Description** : Script interactif qui guide l'utilisateur pas à pas.

**Utilisation** :

```bash
./scripts/quick-test-active.sh
```

**Fonctionnalités** :

- ✅ Vérifie si le serveur dev tourne
- ✅ Affiche les instructions pour obtenir le cookie
- ✅ Demande le cookie de manière interactive
- ✅ Lance les tests automatiquement

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
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Troubleshooting** : Voir [scripts-troubleshooting.md](../doc/scripts-troubleshooting.md)

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
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

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

## 🔐 Sécurité

### Service Role Key

La clé `SUPABASE_SERVICE_ROLE_KEY` donne un **accès administrateur complet** :

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

**Guide complet** : [scripts-troubleshooting.md](../doc/scripts-troubleshooting.md) (section "Legacy API keys")

### "No contact messages found" avec des données dans la table

**Cause** : RLS activé, clé anon utilisée au lieu de service_role

**Solution** : Voir [scripts-troubleshooting.md](../doc/scripts-troubleshooting.md)

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

- [scripts-troubleshooting.md](../doc/scripts-troubleshooting.md) - Guide de dépannage détaillé
- [Code-Cleanup-Auth-Session-2025-10-13.md](../doc/Code-Cleanup-Auth-Session-2025-10-13.md) - Session de nettoyage et optimisation
- [Architecture-Update-Auth-Cleanup-2025-10-13.md](../doc/Architecture-Update-Auth-Cleanup-2025-10-13.md) - Mise à jour de l'architecture

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
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Bypasses RLS
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

## 📝 Changelog

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

---

**Dernière mise à jour** : 13 novembre 2025  
**Mainteneur** : YanBerdin  
**Contact** : yandevformation@gmail.com
