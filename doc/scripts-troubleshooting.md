# Scripts Troubleshooting Guide

## 🚨 URGENT: "Legacy API keys are disabled"

### Problème

Le script affiche :

```bash
❌ Newsletter query failed: Legacy API keys are disabled
❌ Contact query failed: Legacy API keys are disabled
```

### Cause

Vos clés API Supabase sont **obsolètes** (legacy). Supabase a migré vers un nouveau système de clés et les anciennes ont été désactivées pour des raisons de sécurité.

### Solution Rapide (5 minutes)

#### Étape 1 : Générer de Nouvelles Clés

1. Allez sur votre dashboard Supabase :

   ```bash
   https://supabase.com/dashboard/project/yvtrlvmbofklefxcxrzv/settings/api
   ```

2. Dans la section **Project API keys** :
   - Cliquez sur **"Generate new anon key"** (clé publique)
   - Cliquez sur **"Generate new service_role key"** (clé admin)
   - **Important** : Les anciennes clés seront automatiquement invalidées

3. Copiez les **nouvelles clés** générées

#### Étape 2 : Mettre à Jour .env.local

Remplacez les anciennes clés dans votre fichier `.env.local` :

```bash
# Supabase - NOUVELLES CLÉS (générées après octobre 2024)
NEXT_PUBLIC_SUPABASE_URL=https://yvtrlvmbofklefxcxrzv.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.nouvelle_cle_anon...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.nouvelle_cle_service_role...
```

#### Étape 3 : Redémarrer l'Application

```bash
# Arrêter le serveur de dev (Ctrl+C)
# Puis relancer
pnpm dev

# Tester les scripts
pnpm exec tsx scripts/check-email-logs.ts
```

### Vérification

Après la mise à jour, vous devriez voir :

```bash
✅ Using service_role key (admin access, bypasses RLS)

📰 Checking newsletter subscriptions...
✅ Newsletter subscriptions (last 5):
   1. email@example.com - 13/10/2025 18:30:00
   ...

📬 Checking contact messages...
✅ Contact messages (last 5):
   1. John Doe <john@example.com> - "booking" - 13/10/2025 18:30:00
   ...
```

### Migration Automatique (si besoin)

Si votre application ne démarre pas après le changement de clés, vérifiez :

1. **Middleware** : `middleware.ts` utilise-t-il les bonnes variables d'environnement ?
2. **Client Supabase** : `lib/supabase/server.ts` et `lib/supabase/client.ts` utilisent les bonnes clés ?
3. **Cache** : Videz le cache Next.js : `rm -rf .next`

### Plus d'Informations

- [Supabase API Keys Documentation](https://supabase.com/docs/guides/api#api-url-and-keys)
- [Migration Guide - Legacy Keys](https://supabase.com/docs/guides/platform/migrate-to-new-api-keys)

---

## check-email-logs.ts - "No contact messages found"

### Problème

Le script `check-email-logs.ts` affiche "No contact messages found" même si la table `messages_contact` contient des données.

### Cause

La table `messages_contact` a **Row Level Security (RLS)** activée avec une politique qui n'autorise que les **admins authentifiés** à lire les données :

```sql
-- Policy dans 10_tables_system.sql
create policy "Admins can view contact messages"
on public.messages_contact
for select
to authenticated
using ( (select public.is_admin()) );
```

Le script utilise par défaut la clé **anon** (publique) qui est soumise aux politiques RLS et ne peut donc pas accéder aux données protégées.

### Solution

Utiliser la clé **service_role** qui bypass les politiques RLS pour les scripts d'administration.

#### Étape 1 : Obtenir la Clé Service Role

1. Allez sur votre dashboard Supabase :

   ```bash
   https://supabase.com/dashboard/project/yvtrlvmbofklefxcxrzv/settings/api
   ```

2. Dans la section **Project API keys**, copiez la clé **service_role** (pas la clé anon !)
   - ⚠️ **ATTENTION** : Cette clé donne un accès admin complet, ne la commitez JAMAIS

#### Étape 2 : Ajouter la Clé à .env.local

Ajoutez cette ligne à votre fichier `.env.local` :

```bash
# Service Role Key - Admin access (bypasses RLS)
# ⚠️ NEVER commit this key to version control
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...votre_clé_ici
```

#### Étape 3 : Relancer le Script

```bash
pnpm exec tsx scripts/check-email-logs.ts
```

Vous devriez maintenant voir :

```bash
✅ Using service_role key (admin access, bypasses RLS)

📬 Checking contact messages...
✅ Contact messages (last 5):
   1. John Doe <john@example.com> - "booking" - 13/10/2025 18:30:00
   2. Jane Smith <jane@example.com> - "presse" - 13/10/2025 17:15:00
   ...
```

### Pourquoi Cette Architecture ?

#### Sécurité par Design

1. **RLS Protection** : Les données sensibles (nom, prénom, email, téléphone) ne sont jamais exposées publiquement
2. **Anon Key (Public)** : Utilisée par le frontend, limitée par RLS
3. **Service Role Key (Admin)** : Réservée aux scripts backend/admin, bypass RLS

#### Pattern Recommandé

```typescript
// Frontend (app/) - Utilise anon key
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY! // ✅ Public, limité par RLS
);

// Scripts Admin (scripts/) - Utilise service_role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ✅ Admin, bypass RLS
);
```

### Vérification .env.local

Votre fichier `.env.local` devrait contenir :

```bash
# Public Keys (safe to use in frontend)
NEXT_PUBLIC_SUPABASE_URL=https://yvtrlvmbofklefxcxrzv.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Admin Keys (NEVER commit, backend/scripts only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Other services
RESEND_API_KEY=re_...
```

### Sécurité : Ne Jamais Commiter la Service Role Key

La clé service_role donne un **accès administrateur complet** à votre base de données :

- ✅ Bypass toutes les politiques RLS
- ✅ Lecture/écriture sur toutes les tables
- ✅ Exécution de fonctions privilégiées

**Protection** :

1. ✅ `.env.local` est dans `.gitignore`
2. ✅ Ne jamais copier cette clé dans le code source
3. ✅ Ne jamais l'exposer au frontend
4. ✅ L'utiliser uniquement dans des scripts backend/admin

### Alternatives pour l'Accès Admin

Si vous ne voulez pas utiliser la service_role key, vous pouvez aussi :

#### **Option B : Authentification Admin dans le Script**

```typescript
// Se connecter avec un compte admin
const { data, error } = await supabase.auth.signInWithPassword({
  email: "admin@rougecardinal.fr",
  password: "admin_password",
});

// Maintenant les requêtes utiliseront la session admin
// et passeront la vérification is_admin()
```

Cette approche est moins pratique pour les scripts mais plus sécurisée si vous partagez le code.

---

## Autres Tables avec RLS

Les tables suivantes ont également des politiques RLS restrictives :

- `messages_contact` - Admin uniquement en lecture
- `abonnes_newsletter` - Admin uniquement en lecture
- `contacts_presse` - Admin uniquement

Pour tous les scripts admin, utilisez la clé service_role.

---

**Dernière mise à jour** : 13 octobre 2025  
**Référence** : Code-Cleanup-Auth-Session-2025-10-13.md
