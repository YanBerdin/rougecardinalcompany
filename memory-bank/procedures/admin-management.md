# Gestion des Administrateurs

## Après un reset de la base de données

Après avoir exécuté `pnpm db:reset`, la base de données est vide et il n'y a plus d'administrateur. Voici comment recréer un admin :

### Option 1 : Script automatique (Recommandé)

```bash
# Créer un administrateur par défaut
pnpm db:seed-admin
```

**Configuration :**

- Email par défaut : `admin@rougecardinal.com` (configurable via `DEFAULT_ADMIN_EMAIL`)
- Mot de passe par défaut : `Admin123!` (configurable via `DEFAULT_ADMIN_PASSWORD`)

### Option 2 : Via l'interface Supabase

1. Aller dans [Supabase Dashboard](https://supabase.com/dashboard) → Authentication → Users
2. Cliquer sur "Add user"
3. Remplir :
   - **Email** : votre email admin
   - **Password** : un mot de passe sécurisé
   - **Auto-confirm user** : ✅ coché
4. Créer l'utilisateur
5. Modifier ses métadonnées pour ajouter le rôle admin :
   - Dans l'onglet "Raw app meta data", ajouter : `{"role": "admin"}`
   - Dans l'onglet "Raw user meta data", ajouter : `{"role": "admin"}`

### Option 3 : Via API (programmatique)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(URL, SERVICE_ROLE_KEY);

// Créer l'utilisateur
const { data, error } = await supabase.auth.admin.createUser({
  email: 'admin@example.com',
  password: 'secure-password',
  email_confirm: true,
  app_metadata: { role: 'admin' },
  user_metadata: { role: 'admin' }
});
```

## Inviter de nouveaux administrateurs

Une fois connecté en tant qu'admin, vous pouvez inviter de nouveaux utilisateurs via l'interface admin :

1. Aller dans `/admin/users`
2. Cliquer sur "Inviter un utilisateur"
3. Remplir le formulaire avec :
   - Email de l'utilisateur
   - Rôle : `admin` pour un administrateur
   - Nom d'affichage

L'utilisateur recevra un email d'invitation et pourra se connecter avec le lien fourni.

## Variables d'environnement

Pour personnaliser l'admin par défaut, ajoutez dans `.env.local` :

```bash
DEFAULT_ADMIN_EMAIL=mon-admin@domain.com
DEFAULT_ADMIN_PASSWORD=MonMotDePasse123!
```

## Scripts disponibles

- `pnpm db:seed-admin` : Créer un admin par défaut après reset
- `pnpm db:init-admin` : Script alternatif d'initialisation admin (legacy)
- `pnpm db:reset` : Reset complet de la BDD + seeding automatique
