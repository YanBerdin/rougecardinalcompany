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
2. **Toujours vérifier l'autorisation** avant d'utiliser ce client (admin-only pour le client admin)
3. **Logger toutes les actions admin** pour audit
4. **Valider toutes les entrées** avec Zod avant les opérations

**Usage :**

```typescript
import { createAdminClient } from "@/supabase/admin";
import { requireAdminOnly } from "@/lib/auth/roles";

export async function inviteUser(email: string) {
  await requireAdminOnly();

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

En cas de compromission (Leaked) de `SUPABASE_SECRET_KEY` :

1. Générez une nouvelle clé via Supabase Dashboard (Settings → API → "Rotate service role key")
2. Mettez à jour `.env.local` localement
3. Mettez à jour les secrets dans votre environnement de production (Vercel/Netlify/etc.)
4. Supprimez l'ancienne clé du dashboard

## 📋 Mises à jour récentes (février 2026)

### TASK057 - Photos Paysage Spectacles (1 fév. 2026)

Système de gestion de 2 photos paysage par spectacle intégrées dans le synopsis.

**Migrations appliquées**:

- `20260201093000_fix_entity_type_whitelist.sql`
- `20260201100000_add_landscape_photos_to_spectacles.sql`

**Modifications base de données**:

- Colonne `type` dans `spectacles_medias` (valeurs: 'poster', 'landscape', 'gallery')
- CHECK constraints: type valide + ordre 0/1 pour landscape
- Contrainte UNIQUE: `(spectacle_id, type, ordre)`
- Index: `idx_spectacles_medias_type_ordre`
- Vues: `spectacles_landscape_photos_public` + `spectacles_landscape_photos_admin`

**Code ajouté**:

- DAL: `lib/dal/spectacle-photos.ts` (READ avec cache, MUTATIONS avec DALResult)
- Schemas: Extension `lib/schemas/spectacles.ts` (SpectaclePhotoDTO, AddPhotoInputSchema)
- Server Actions: add/delete/swap dans `app/(admin)/admin/spectacles/actions.ts`
- API Route: `/api/spectacles/[id]/photos` (conversion bigint→string)
- Admin: `SpectaclePhotoManager` avec MediaLibraryPicker
- Public: `LandscapePhotoCard` dans `SpectacleDetailView`

**Pattern appliqué**: TASK055 BigInt Serialization (validation number, conversion BigInt après)

## Best Practices

### ✅ BON

```typescript
"use server";
import "server-only";
import { createAdminClient } from "@/supabase/admin";
import { requireAdminOnly } from "@/lib/auth/roles";

export async function adminOperation() {
  await requireAdminOnly();
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

## Backup & Recovery (TASK050)

### Stratégie de sauvegarde automatisée

Le projet implémente une stratégie de backup multi-niveaux :

1. **Content Versioning** (existant) : Triggers sur tables métier pour versioning granulaire
2. **Weekly Backups** (TASK050) : Dumps PostgreSQL hebdomadaires via GitHub Actions

### Configuration des backups hebdomadaires

**Stockage** : Bucket Supabase Storage `backups` (privé, service_role uniquement)  
**Fréquence** : Dimanche 3h00 UTC (hebdomadaire)  
**Rétention** : 4 derniers dumps (4 semaines)  
**Format** : `pg_dump --format=custom` compressé en gzip

**Fichiers impliqués** :

- `.github/workflows/backup-database.yml` — Workflow GitHub Actions
- `scripts/backup-database.ts` — Script d'export et upload
- `supabase/schemas/02c_storage_buckets.sql` — Bucket `backups` avec RLS policies
- `memory-bank/tasks/TASK050_RUNBOOK_PITR_restore.md` — Runbook de restauration

### Exécution manuelle

```bash
# Local (nécessite pg_dump v16+)
pnpm exec tsx scripts/backup-database.ts

# Via GitHub Actions UI
# Actions → Weekly Database Backup → Run workflow
```

### Restauration d'un backup

```bash
# 1. Lister les backups disponibles
supabase storage list backups

# 2. Télécharger un dump spécifique
supabase storage download backups/backup-YYYYMMDD-HHMMSS.dump.gz

# 3. Décompresser
gunzip backup-YYYYMMDD-HHMMSS.dump.gz

# 4. Restaurer sur environnement local/staging
supabase start  # Local
pg_restore --verbose --clean --no-owner \
  --dbname="postgresql://postgres:postgres@localhost:54322/postgres" \
  backup-YYYYMMDD-HHMMSS.dump

# 5. Valider les données critiques
psql "postgresql://postgres:postgres@localhost:54322/postgres" -c "
  select 'spectacles', count(*) from public.spectacles;
  select 'membres_equipe', count(*) from public.membres_equipe;
  select 'medias', count(*) from public.medias;
"
```

**⚠️ Avertissement** : Ne jamais restaurer directement en production sans test préalable en staging.

### Secrets GitHub requis

Pour que le workflow fonctionne, configurer ces secrets dans Settings → Secrets :

| Secret | Description |
| -------- | ------------- |
| `SUPABASE_DB_URL` | `postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres` |
| `SUPABASE_SECRET_KEY` | Clé service-role |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` | Clé publishable |

### Monitoring

- **GitHub Actions** : [Actions tab](https://github.com/yandevpro/rougecardinalcompany/actions/workflows/backup-database.yml)
- **Notifications** : Email automatique aux admins GitHub en cas d'échec
- **Durée typique** : 5-10 minutes par backup

### Documentation complète

Voir le runbook complet : `memory-bank/tasks/TASK050_RUNBOOK_PITR_restore.md`
