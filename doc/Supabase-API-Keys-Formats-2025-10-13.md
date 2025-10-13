# Supabase API Keys - Formats et Configuration

**Date** : 13 octobre 2025  
**Project** : Rouge Cardinal Company  
**Status** : ✅ Configuration Validée

---

## 🔑 Formats de Clés Supabase

Supabase utilise **deux formats de clés** selon la configuration du projet :

### Format 1 : JWT (JSON Web Token) - Format Legacy/Standard

**Anon Key** :

```bash
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2dHJsdm1ib2ZrbGVmeGN4cnp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTc2MzQyMzQsImV4cCI6MjAxMzIxMDIzNH0...
```

**Service Role Key** :

```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2dHJsdm1ib2ZrbGVmeGN4cnp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5NzYzNDIzNCwiZXhwIjoyMDEzMjEwMjM0fQ...
```

**Caractéristiques** :

- ✅ Format JWT standard
- ✅ Commence par `eyJ...`
- ✅ Contient les informations encodées (project ref, role, expiration)
- ✅ Plus long (~250+ caractères)

### Format 2 : Simplified Keys (Nouveau Format)

**Publishable Key** :

```bash
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=sb_publishable_NvunyYVmTz1wymZW4-lgOQ_J4KCNqQb
```

**Secret Key** :

```bash
SUPABASE_SECRET_KEY=sb_secret_SZA6wkY0dcsDrHaNyW4wCg_caG3YPPQ
```

**Caractéristiques** :

- ✅ Format simplifié et lisible
- ✅ Commence par `sb_publishable_` ou `sb_secret_`
- ✅ Plus court (~50-60 caractères)
- ✅ Nouveau standard Supabase (2024+)

---

## 🎯 Configuration Actuelle (Rouge Cardinal Company)

### Fichier .env.local

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://yvtrlvmbofklefxcxrzv.supabase.co

# Public Key (Frontend)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=sb_publishable_NvunyYVmTz1wymZW4-lgOQ_J4KCNqQb

# Admin Key (Scripts/Backend) - Format simplifié
SUPABASE_SECRET_KEY=sb_secret_SZA6wkY0dcsDrHaNyW4wCg_caG3YPPQ
```

**Format Utilisé** : ✅ Simplified Keys (Format 2)

---

## 🔄 Support des Deux Formats

Le script `check-email-logs.ts` supporte **automatiquement les deux formats** :

```typescript
// Support both naming conventions
const supabaseKey =
  envVars.SUPABASE_SERVICE_ROLE_KEY || // JWT format (legacy)
  envVars.SUPABASE_SECRET_KEY || // Simplified format (new)
  envVars.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY; // Fallback anon key
```

**Variables d'environnement acceptées** :

| Variable                                       | Format            | Usage           | RLS       |
| ---------------------------------------------- | ----------------- | --------------- | --------- |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` | JWT ou Simplified | Frontend        | ✅ Actif  |
| `SUPABASE_SERVICE_ROLE_KEY`                    | JWT               | Backend/Scripts | ❌ Bypass |
| `SUPABASE_SECRET_KEY`                          | Simplified        | Backend/Scripts | ❌ Bypass |

---

## 🔐 Différences de Sécurité

### Format JWT

**Avantages** :

- ✅ Information self-contained (project, role, expiration)
- ✅ Peut être vérifié sans appel API
- ✅ Standard JWT reconnu

**Inconvénients** :

- ⚠️ Plus long (difficile à copier/coller)
- ⚠️ Contient des métadonnées visibles (base64 decode)

### Format Simplified

**Avantages** :

- ✅ Plus court et lisible
- ✅ Plus facile à gérer
- ✅ Pas de métadonnées exposées

**Inconvénients** :

- ⚠️ Doit être validé par l'API Supabase
- ⚠️ Format propriétaire Supabase

---

## 📋 Migration Entre Formats

### De JWT vers Simplified (Recommandé)

Si vous avez des clés JWT et souhaitez migrer :

1. **Dashboard Supabase** :

   ```bash
   https://supabase.com/dashboard/project/yvtrlvmbofklefxcxrzv/settings/api
   ```

2. **Générer les nouvelles clés** :
   - Cliquer sur "Generate new publishable key"
   - Cliquer sur "Generate new secret key"

3. **Mettre à jour .env.local** :

   ```bash
   # AVANT (JWT)
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

   # APRÈS (Simplified)
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=sb_publishable_...
   SUPABASE_SECRET_KEY=sb_secret_...
   ```

4. **Redémarrer** :

   ```bash
   rm -rf .next
   pnpm dev
   ```

### De Simplified vers JWT

Non recommandé, mais possible via le dashboard si besoin.

---

## ✅ Vérification de Configuration

### Test Script Admin

```bash
pnpm exec tsx scripts/check-email-logs.ts
```

**Output Attendu** (Format Simplified) :

```bash
✅ Using service_role key (admin access, bypasses RLS)

📰 Checking newsletter subscriptions...
✅ Newsletter subscriptions (last 5):
   1. newsletter-contact@yan.com - 10/12/2025, 12:03:01 AM
   ...

📬 Checking contact messages...
✅ Contact messages (last 5):
   1. Développeur ljghcjcjhchkv <zobyd@resend.dev> - "partenariat" - 10/10/2025, 10:02:39 PM
   ...

🎉 Database check completed!
```

### Checklist de Vérification

- [x] `NEXT_PUBLIC_SUPABASE_URL` définie
- [x] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` définie (format `sb_publishable_`)
- [x] `SUPABASE_SECRET_KEY` définie (format `sb_secret_`)
- [x] Script `check-email-logs.ts` fonctionne
- [x] Frontend accessible et authentification fonctionnelle
- [x] Données de contact visibles (9 messages confirmés)

---

## 🛠️ Troubleshooting

### "Legacy API keys are disabled"

**Cause** : Anciennes clés JWT désactivées

**Solution** : Générer de nouvelles clés (JWT ou Simplified) depuis le dashboard

### "row-level security policy violation"

**Cause** : Utilisation de la clé publique (`sb_publishable_`) au lieu de la clé secrète

**Solution** :

```bash
# Vérifier que la clé secrète est configurée
SUPABASE_SECRET_KEY=sb_secret_...
# ou
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### "Invalid API key format"

**Cause** : Clé mal copiée ou corrompue

**Solution** : Regénérer les clés depuis le dashboard et copier-coller soigneusement

---

## 📚 Références

### Documentation Officielle

- [Supabase API Keys](https://supabase.com/docs/guides/api#api-url-and-keys)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [JWT Format](https://jwt.io/)

### Documentation Interne

- [scripts-troubleshooting.md](./scripts-troubleshooting.md) - Guide de dépannage complet
- [Fix-Legacy-API-Keys-2025-10-13.md](./Fix-Legacy-API-Keys-2025-10-13.md) - Session de résolution
- [scripts/README.md](../scripts/README.md) - Guide des scripts admin

---

## 🎯 Résumé

### Configuration Actuelle ✅

- **Format** : Simplified Keys (`sb_publishable_` / `sb_secret_`)
- **Status** : Fonctionnel
- **Tests** : Tous passés
- **Données** : Accessibles (newsletter + contact messages)

### Avantages

1. ✅ Format moderne et simplifié
2. ✅ Plus facile à gérer
3. ✅ Compatible avec tous les outils Supabase
4. ✅ Scripts admin fonctionnels
5. ✅ Frontend et authentification opérationnels

### Recommandations

1. ✅ Garder le format Simplified actuel
2. ✅ Ne jamais committer `.env.local` (déjà dans `.gitignore`)
3. ✅ Documenter le format utilisé pour les futurs développeurs
4. ✅ Tester régulièrement les scripts admin

---

**Dernière mise à jour** : 13 octobre 2025  
**Validé par** : yandev  
**Status** : ✅ Configuration Opérationnelle
