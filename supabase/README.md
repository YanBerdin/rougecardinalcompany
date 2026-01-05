# Supabase Clients

Ce dossier contient les clients Supabase pour différents contextes d'exécution.

## Fichiers

### `server.ts`

Client Supabase **standard** pour Server Components, API Routes et Server Actions.

- Utilise `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` (clé anon)
- Respecte les Row Level Security (RLS) policies
- Utilise le contexte d'authentification de l'utilisateur connecté

**Usage :**

```typescript
import { createClient } from "@/supabase/server";

export async function MyServerComponent() {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*");
  return <div>{/* ... */}</div>;
}
```

### `admin.ts`

Client Supabase **admin** avec privilèges élevés (service-role).

- Utilise `SUPABASE_SECRET_KEY` (**ne JAMAIS committer cette clé !**)
- **Bypass les RLS policies** — accès complet à toutes les données
- Utilisé uniquement pour opérations admin critiques :
  - Invitation utilisateurs (`auth.admin.generateLink`, `auth.admin.createUser`)
  - Modification de rôles (`auth.admin.updateUserById`)
  - Suppression utilisateurs RGPD (`auth.admin.deleteUser`)

**⚠️ SÉCURITÉ CRITIQUE :**

1. **Ne jamais exposer ce client côté client** (toujours `import "server-only"`)
2. **Toujours vérifier l'autorisation admin** avant d'utiliser ce client
3. **Logger toutes les actions admin** pour audit
4. **Valider toutes les entrées** avec Zod avant les opérations

**Usage :**

```typescript
import { createAdminClient } from "@/supabase/admin";
import { requireAdmin } from "@/lib/auth/guards";

export async function inviteUser(email: string) {
  await requireAdmin();

  const supabase = await createAdminClient();
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "invite",
    email,
  });

  if (error) throw error;
  return data;
}
```

## Variables d'environnement

Assurez-vous que votre `.env.local` contient :

```bash
# Standard (toujours requis)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJxxx...

# Admin (requis pour opérations admin uniquement)
SUPABASE_SECRET_KEY=eyJxxx...  # ⚠️ NE JAMAIS COMMITTER

# Email (requis pour invitations)
RESEND_API_KEY=re_xxx...

# Site URL (requis pour liens d'invitation)
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # ou https://votre-domaine.com
```

## Obtenir les clés

### Service Role Key

1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. **Settings → API**
4. Copiez la **Service Role Key** (section "Project API keys")
5. Ajoutez-la à `.env.local` (ne **JAMAIS** committer ce fichier)

### Resend API Key

1. Créez un compte sur [Resend](https://resend.com)
2. Créez une API Key
3. Ajoutez-la à `.env.local`

## Rotation des clés

En cas de compromission de `SUPABASE_SECRET_KEY` :

1. Générez une nouvelle clé via Supabase Dashboard (Settings → API → "Rotate service role key")
2. Mettez à jour `.env.local` localement
3. Mettez à jour les secrets dans votre environnement de production (Vercel/Netlify/etc.)
4. Supprimez l'ancienne clé du dashboard

## Best Practices

### ✅ BON

```typescript
"use server";
import "server-only";
import { createAdminClient } from "@/supabase/admin";
import { requireAdmin } from "@/lib/auth/guards";

export async function adminOperation() {
  await requireAdmin();
  const supabase = await createAdminClient();
}
```

### ❌ MAUVAIS

```typescript
// ❌ Pas de vérification admin
const supabase = await createAdminClient();

// ❌ Exposé côté client
export function ClientComponent() {
  const supabase = createAdminClient(); // DANGER !
}

// ❌ Service key hardcodée
const supabase = createClient(url, "hardcoded-service-key");
```

## Architecture recommandée

```bash
supabase/
  server.ts      # Client standard (RLS-aware)
  admin.ts       # Client admin (bypass RLS) ← VOUS ÊTES ICI
  middleware.ts  # Client pour middleware (auth refresh)
  README.md      # Cette documentation

lib/
  dal/
    admin-users.ts  # DAL utilisant createAdminClient()
```

Toute logique admin doit passer par le Data Access Layer (`lib/dal/*`) qui utilise `createAdminClient()` de façon sécurisée.
