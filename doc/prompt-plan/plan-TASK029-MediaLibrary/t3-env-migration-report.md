# T3 Env Migration Report - Phase Media Library

**Date** : 28 décembre 2025  
**Scope** : Conformité T3 Env pour fichiers liés à la Media Library  
**Status** : ✅ Complete

---

## 📋 Objectif

Migrer tous les accès `process.env.XXX` vers l'objet `env` de T3 Env pour garantir :

- ✅ Validation runtime des variables d'environnement
- ✅ Type safety avec autocomplete TypeScript
- ✅ Séparation claire client/server
- ✅ Détection précoce des erreurs de configuration

---

## ✅ Fichiers migrés (7 fichiers)

### 1. Production Code (HAUTE priorité)

#### `lib/utils/validate-image-url.ts` ✅

**Changements** :

- Ajout : `import { env } from "@/lib/env";`
- Remplacé : `process.env.NEXT_PUBLIC_SUPABASE_URL` → `env.NEXT_PUBLIC_SUPABASE_URL`
- Remplacé : `process.env.NODE_ENV` → `env.NODE_ENV` (2 occurrences)
- Supprimé : Commentaires `//TODO: Check T3Env compliance`

**Impact** : Validation d'URL SSRF-safe pour uploads media

---

### 2. Scripts de développement (MOYENNE priorité)

#### `scripts/check-storage-buckets.ts` ✅

**Changements** :

- Ajout : `import { env } from "../lib/env";`
- Remplacé : `process.env.NEXT_PUBLIC_SUPABASE_URL!` → `env.NEXT_PUBLIC_SUPABASE_URL`
- Remplacé : `process.env.SUPABASE_SECRET_KEY!` → `env.SUPABASE_SECRET_KEY`
- Supprimé : Assertions non-null (`!`)

**Impact** : Diagnostic Storage buckets Supabase

#### `scripts/check-storage-paths.ts` ✅

**Changements** :

- Ajout : `import { env } from "../lib/env";`
- Remplacé : `process.env.NEXT_PUBLIC_SUPABASE_URL!` → `env.NEXT_PUBLIC_SUPABASE_URL`
- Remplacé : `process.env.SUPABASE_SECRET_KEY!` → `env.SUPABASE_SECRET_KEY`
- Supprimé : Commentaires `//TODO: Check T3Env compliance`

**Impact** : Vérification storage_path dans table medias

#### `scripts/test-dashboard-stats.ts` ✅

**Changements** :

- Ajout : `import { env } from "../lib/env";`
- Remplacé : Toutes les références `process.env.XXX`
- Supprimé : Vérification manuelle `if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY)` (T3 Env valide automatiquement)

**Impact** : Tests statistiques dashboard admin

#### `scripts/test-views-security-invoker.ts` ✅

**Changements** :

- Ajout : `import { env } from '../lib/env';`
- Remplacé : `process.env.NEXT_PUBLIC_SUPABASE_URL!` → `env.NEXT_PUBLIC_SUPABASE_URL`
- Remplacé : `process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!` → `env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`

**Impact** : Tests RLS sur vues SECURITY INVOKER

#### `scripts/Test_fetchMediaArticles/check-chapo-excerpt.ts` ✅

**Changements** :

- Ajout : `import { env } from "../../lib/env";`
- Remplacé : Toutes les références `process.env.XXX`

**Impact** : Vérification colonnes chapo/excerpt articles presse

#### `scripts/Test_fetchMediaArticles/test-rls-articles.ts` ✅

**Changements** :

- Ajout : `import { env } from "../../lib/env";`
- Remplacé : Toutes les références `process.env.XXX`
- Supprimé : Vérification manuelle `if (!supabaseUrl || !anonKey)`

**Impact** : Tests RLS sur articles_presse

---

## 🔍 Fichiers analysés mais OK

### `lib/utils.ts` ✅

**Status** : Déjà commenté, pas de changement nécessaire

```typescript
//This check can be removed, it is just for tutorial purposes
/**
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;
*/
```

**Raison** : Code tutorial déjà désactivé

---

## ⚠️ Fichiers non migrés (hors scope Phase Media)

Les fichiers suivants contiennent encore `process.env` mais sont **hors scope** de cette phase :

- `scripts/test-all-dal-functions.ts`
- `scripts/check-extension.ts`
- `scripts/test-webhooks.ts`
- `scripts/test-team-server-actions.ts`
- `scripts/check-email-logs.ts`
- `scripts/check-migration-applied.ts`
- `scripts/test-spectacles-crud.ts`
- `scripts/set-admin-role.ts`
- `scripts/Archived-tests/*`

**Recommandation** : Migrer lors de Phase T3 Env dédiée (Phase 5 du plan original)

---

## ✅ Validation

### Tests de compilation

```bash
pnpm tsc --noEmit
# ✅ SUCCESS - Aucune erreur TypeScript
```

### Pattern de migration vérifié

```typescript
// ❌ AVANT (non conforme)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const isDev = process.env.NODE_ENV === "development"; //TODO: Check T3Env compliance

// ✅ APRÈS (conforme T3 Env)
import { env } from "@/lib/env";
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const isDev = env.NODE_ENV === "development";
```

### Bénéfices obtenus

1. **Type Safety** : Autocomplete IDE + erreurs de compilation
2. **Validation Runtime** : App refuse de démarrer si variables manquantes
3. **Code Cleanup** : Suppression de vérifications manuelles redondantes
4. **Conformité Guide** : Respect strict de `t3_env_guide.md`

---

## 📊 Statistiques

| Métrique | Valeur |
| ---------- | -------- |
| Fichiers migrés | 7 |
| Lignes modifiées | ~35 |
| Occurrences `process.env` supprimées | ~18 |
| Tests passés | ✅ TypeScript compilation |
| Breaking changes | 0 (migration transparente) |

---

## 🎯 Checklist Phase Complete

- [x] Identifier tous les `process.env` dans fichiers liés Media Library
- [x] Ajouter `import { env } from "@/lib/env";` dans chaque fichier
- [x] Remplacer `process.env.XXX` par `env.XXX`
- [x] Supprimer commentaires `//TODO: Check T3Env compliance`
- [x] Supprimer vérifications manuelles redondantes
- [x] Supprimer assertions non-null (`!`)
- [x] Tester compilation TypeScript
- [x] Créer rapport de migration

---

## 📝 Notes pour futures migrations

### Pattern scripts avec dotenv

Les scripts qui utilisent `dotenv.config()` doivent importer `env` **après** la configuration :

```typescript
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// ✅ Import env APRÈS dotenv.config()
import { env } from "../lib/env";
```

### Gestion des erreurs T3 Env

Si un script affiche `❌ Invalid environment variables`, c'est que :

1. `.env.local` n'est pas chargé avant l'import de `env`
2. Une variable requise est manquante dans `.env.local`

**Solution** : Vérifier l'ordre des imports et la présence des variables.

---

## 🔗 Références

- Guide T3 Env : `.github/prompts/plan-feat-t3-env.prompt/t3_env_guide.md`
- Implémentation : `lib/env.ts`
- Plan migration complet : `.github/prompts/plan-feat-t3-env.prompt/`
- Memory Bank : `memory-bank/systemPatterns.md` (section T3 Env)

---

**Prochaines étapes** : Commit des changements avec Phase 2 Media Library
