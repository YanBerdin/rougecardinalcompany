# Plan d'Implémentation T3 Env pour Rouge Cardinal Company

## 📋 Vue d'Ensemble

### Contexte

Le projet utilise actuellement des variables d'environnement avec des accès directs `process.env.*` et une validation manuelle (`hasEnvVars`). T3 Env apportera:

✅ **Validation runtime** avec Zod  
✅ **Type-safety** TypeScript complète  
✅ **Séparation client/server** sécurisée  
✅ **Détection précoce** des erreurs de configuration  
✅ **DX améliorée** (autocomplete, erreurs claires)

### Décisions Architecturales

#### 1. Variables MCP/CI-CD ✅

```typescript
// Variables optionnelles pour tooling externe
SUPABASE_PROJECT_REF: z.string().optional(),
SUPABASE_ACCESS_TOKEN: z.string().optional(),
GITHUB_TOKEN: z.string().optional(),
CONTEXT7_API_KEY: z.string().optional()
```

**Justification**:

- Ne sont PAS nécessaires au runtime Next.js
- Utilisées uniquement par MCP Supabase et GitHub Actions
- Marquées `.optional()` pour ne pas bloquer le démarrage

#### 2. Séparation Server/Admin Clients ✅

**GARDER** la structure actuelle:

```typescript
supabase/
├── server.ts    // User-scoped operations (authenticated/anon)
└── admin.ts     // Service-role operations (elevated privileges)
```

**Justifications**:

- ✅ **Sécurité**: Admin operations explicites et tracées
- ✅ **Audit**: Facile d'identifier les appels privilégiés
- ✅ **SOLID**: Une responsabilité par fichier
- ✅ **Clarté**: Import montre le niveau de privilège

#### 3. hasEnvVars Check ✅

**SUPPRIMER** de:

- `supabase/middleware.ts` (lines 10-15)
- `lib/utils.ts` (export `hasEnvVars`)

**Justification**: T3 Env gère la validation au démarrage, checks manuels redondants

---

## 🎯 Phase 1: Setup Initial

### 1.1 Installation

```bash
pnpm add @t3-oss/env-nextjs zod
```

### 1.2 Créer lib/env.ts### 1.3 Script de test de validation---

## 🎯 Phase 2: Migration Core Files

### 2.1 lib/site-config.ts

### 2.2 lib/resend.ts

### 2.3 supabase/server.ts

### 2.4 supabase/client.ts

### 2.5 supabase/admin.ts

### 2.6 supabase/middleware.ts---

## 🎯 Phase 3: Email System Migration

### 3.1 lib/email/actions.ts---

## 📚 Documentation Guide---

## 📋 Phase 4-7 Implementation Strategy

Pour les phases restantes (DAL, Scripts, API Routes, Tests), voici le plan d'action:

### Phase 4: DAL Files (17 fichiers)

**Pattern de migration standardisé:**

```typescript
// Avant
import { createClient } from "@/supabase/server";

export async function fetchData() {
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;  // ❌
  // ...
}

// Après
import { createClient } from "@/supabase/server";
import { env } from "@/lib/env";

export async function fetchData() {
  const supabase = await createClient();
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;  // ✅
  // ...
}
```

**Fichiers à migrer** (ordre de priorité):

1. `lib/dal/admin-users.ts` (utilise EMAIL_DEV_REDIRECT)
2. `lib/dal/admin-home-*.ts`
3. Tous les autres DAL files

### Phase 5: Scripts

**Fichiers à migrer**:

- `scripts/create-admin-user.ts`
- `scripts/seed-admin.ts`
- `scripts/test-*.ts` (déjà créé le nouveau `test-env-validation.ts`)

**Pattern de migration**:

```typescript
// Avant
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Après
import { env } from "../lib/env";
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
```

### Phase 6: API Routes (minimal)

**Fichiers à migrer**:

- `app/api/admin/media/search/route.ts`
- `app/api/contact/route.ts`
- `app/api/newsletter/route.ts`

**Pattern**:

```typescript
// app/api/newsletter/route.ts
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  // env.NEXT_PUBLIC_SITE_URL au lieu de process.env...
}
```

### Phase 7: Tests & CI

**Checklist finale**:

1. ✅ Exécuter `pnpm tsx scripts/test-env-validation.ts`
2. ✅ Vérifier build: `pnpm build`
3. ✅ Vérifier TypeScript: `pnpm tsc --noEmit`
4. ✅ Mettre à jour `.env.example` si nécessaire
5. ✅ Tester en local (dev + build)
6. ✅ Documenter dans memory-bank
7. ✅ CI/CD: ajouter step validation si nécessaire

---

## 🎯 Prochaines Actions Recommandées

### Actions Immédiates

1. **Créer les fichiers de Phase 1**:
   - `lib/env.ts`
   - `scripts/test-env-validation.ts`
   - `docs/T3_ENV_GUIDE.md`

2. **Installer dépendances**:

   ```bash
   pnpm add @t3-oss/env-nextjs zod
   ```

3. **Tester la validation**:

   ```bash
   pnpm tsx scripts/test-env-validation.ts
   ```

### Actions Phase 2

4. **Migrer core files** (utiliser les artifacts créés):
   - `lib/site-config.ts`
   - `lib/resend.ts`
   - `supabase/server.ts`
   - `supabase/client.ts`
   - `supabase/admin.ts`
   - `supabase/middleware.ts`

5. **Supprimer `hasEnvVars`**:
   - Dans `lib/utils.ts` (retirer export)
   - Dans `supabase/middleware.ts` (retirer check lines 10-15)

6. **Tester compilation**:

   ```bash
   pnpm tsc --noEmit
   pnpm build
   ```

### Actions Phase 3+

7. **Migrer email system**:
   - `lib/email/actions.ts`

8. **Migrer DAL files progressivement** (17 fichiers)

9. **Migrer scripts** (create-admin, seed-admin, test-*)

10. **Migrer API routes** (3 fichiers)

### Validation Finale

11. **Tests complets**:

    ```bash
    pnpm tsx scripts/test-env-validation.ts
    pnpm build
    pnpm dev  # Vérifier démarrage
    ```

12. **Documentation**:
    - Mettre à jour `.env.example`
    - Ajouter entry dans `memory-bank/systemPatterns.md`
    - Mettre à jour `memory-bank/activeContext.md`

---

## 📝 Résumé du Plan

✅ **Phase 1**: Setup complet (`lib/env.ts`, script test, docs)  
✅ **Phase 2**: Core files (6 fichiers)  
✅ **Phase 3**: Email system  
⏳ **Phase 4**: DAL files (17 fichiers)  
⏳ **Phase 5**: Scripts  
⏳ **Phase 6**: API Routes (3 fichiers)  
⏳ **Phase 7**: Tests & CI

**Bénéfices attendus**:

- ✅ Type-safety complète
- ✅ Validation runtime
- ✅ Meilleure DX (autocomplete)
- ✅ Détection précoce des erreurs
- ✅ Code plus maintenable

**Risques identifiés**:

- ⚠️ Breaking changes si env vars mal configurées
- ⚠️ Nécessite tests approfondis après migration

**Mitigation**:

- ✅ Script de validation automatisé
- ✅ Documentation complète
- ✅ Migration progressive par phases
- ✅ Tests à chaque phase
