# Plan : Migrer TeamMemberForm vers pages dédiées (Pattern CRUD complet)

Migration complète du formulaire inline vers des pages dédiées `/new` et `/[id]/edit`, avec schéma Zod UI, fetch via DAL en Server Component, et remplacement des `fetch()` par Server Actions dans le container.

## Audit Step 0 : État des lieux avant migration

L'objectif de cette étape est d'auditer l'état actuel du code pour identifier les éléments existants et ceux à créer/modifier avant de commencer la migration.

### 🎯 Résumé Audit — Validations complétées ✅

| Point vérifié | Résultat | Détail |
|---------------|----------|--------|
| `TeamMemberFormSchema` | ✅ **CRÉÉ** | `lib/schemas/team.ts` ligne 78+ |
| `fetchTeamMemberById` return type | ✅ `TeamRow \| null` | Pas `DALResult` → OK pour `notFound()` |
| `TeamMemberForm.tsx` longueur | ✅ **164 lignes** | < 300L → Pas de split nécessaire |
| Server Actions nécessaires | ✅ Toutes existent | `createTeamMember`, `updateTeamMember`, `setTeamMemberActiveAction`, `hardDeleteTeamMemberAction` |
| DB type `photo_media_id` | ✅ `number` | Pas de conversion bigint requise |

---

## 📊 1. Audit Schemas (`lib/schemas/team.ts`)

### ✅ Schemas existants

| Schema | Type | Usage | Statut |
|--------|------|-------|--------|
| `TeamMemberDbSchema` | Database | Type validation | ✅ Existe |
| `CreateTeamMemberInputSchema` | Server | Insert operations | ✅ Existe |
| `UpdateTeamMemberInputSchema` | Server | Update operations | ✅ Existe |
| `ReorderTeamMembersInputSchema` | Server | Reorder RPC | ✅ Existe |
| `SetActiveBodySchema` | API Route | Toggle active | ✅ Existe |
| `TeamMemberFormSchema` | UI Form | react-hook-form | ✅ **CRÉÉ** |

### ~~❌ Schemas manquants (CRITICAL)~~ → ✅ RÉSOLU

**`TeamMemberFormSchema`** — ✅ **CRÉÉ** dans `lib/schemas/team.ts`

```typescript
// AJOUTÉ dans lib/schemas/team.ts (ligne 78+)

// =============================================================================
// UI FORM SCHEMA (for react-hook-form + Next.js forms)
// =============================================================================

/**
 * UI schema for TeamMemberForm component
 * Uses number (not bigint) for JSON serialization compatibility
 */
export const TeamMemberFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(200, "200 caractères maximum"),
  role: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  image_url: z.string().url("URL invalide").optional().nullable().or(z.literal("")),
  photo_media_id: z.number().int().positive().optional().nullable(),
  ordre: z.number().int().optional().nullable(),
  active: z.boolean().optional(),
});

export type TeamMemberFormValues = z.infer<typeof TeamMemberFormSchema>;
```

**Différence clé avec `CreateTeamMemberInputSchema`** :
- ✅ `photo_media_id: z.number()` (UI/Form) — JSON serializable
- ❌ `photo_media_id: z.number()` (Server) — Same for this schema, but conversion needed if DB uses bigint

**Note** : Vérifier si `membres_equipe.photo_media_id` est `bigint` ou `integer` dans `database.types.ts`.

```typescript
// Extrait de database.types.ts ligne ~1180
membres_equipe: {
  Row: {
    photo_media_id: number | null  // ← C'est un number, pas bigint
  }
}
```

✅ **Bonne nouvelle** : `photo_media_id` est déjà `number` en DB, donc pas de conversion bigint nécessaire. Le `TeamMemberFormSchema` peut utiliser `z.number()` directement.

---

## 📋 2. Audit Server Actions (`app/(admin)/admin/team/actions.ts`)

### ✅ Server Actions existantes

| Action | Type | Ligne | Statut |
|--------|------|-------|--------|
| `createTeamMember` | Create | 43 | ✅ Existe |
| `updateTeamMember` | Update | 62 | ✅ Existe |
| `reorderTeamMembersAction` | Reorder | 94 | ✅ Existe |
| `setTeamMemberActiveAction` | Toggle | 113 | ✅ Existe |
| `hardDeleteTeamMemberAction` | Delete | 138 | ✅ Existe |
| `uploadTeamMemberPhoto` | Upload | 160 | ✅ Existe |

### ✅ Toutes les Server Actions nécessaires existent déjà !

**Pattern validation** :
```typescript
// ✅ Correct pattern observé (ligne 113-137)
export async function setTeamMemberActiveAction(
  teamMemberId: number,
  isActiveStatus: boolean
): Promise<ActionResponse<null>> {
  // 1. Validation
  // 2. DAL call
  // 3. revalidatePath("/admin/team")
  // 4. Return ActionResponse
}
```

---

## 📐 3. Audit DAL (`lib/dal/team.ts`)

**Fichier non fourni**, mais basé sur les imports dans `actions.ts` :

### ✅ Fonctions DAL existantes (inférées)

```typescript
// Importées dans actions.ts (ligne 11-16)
import {
  upsertTeamMember,
  reorderTeamMembers,
  fetchTeamMemberById,      // ← CRITICAL pour page edit
  setTeamMemberActive,
  hardDeleteTeamMember,
} from "@/lib/dal/team";
```

| Fonction | Type retour attendu | Usage | Statut |
|----------|-------------------|-------|--------|
| `fetchTeamMemberById(id: number)` | `Promise<TeamRow \| null>` | Edit page | ✅ **VÉRIFIÉ** |
| `upsertTeamMember(input)` | `Promise<DALResult<TeamMemberDb>>` | Create/Update | ✅ Existe |
| `setTeamMemberActive(id, active)` | `Promise<DALResult<null>>` | Toggle | ✅ Existe |
| `hardDeleteTeamMember(id)` | `Promise<DALResult<null>>` | Delete | ✅ Existe |
| `reorderTeamMembers(input)` | `Promise<DALResult<null>>` | Reorder | ✅ Existe |

### ~~⚠️ Vérification nécessaire~~ → ✅ VÉRIFIÉ

**`fetchTeamMemberById` return type** : ✅ **Retourne `TeamRow | null`** (pas `DALResult`)

```typescript
// lib/dal/team.ts ligne 100-125 — VÉRIFIÉ
export async function fetchTeamMemberById(id: number): Promise<TeamRow | null> {
  // ... retourne null si not found
  return parsed.data as TeamRow;
}
```

✅ **Pattern OK pour edit page** :

```typescript
const member = await fetchTeamMemberById(numericId);

if (!member) {
  notFound();  // ← Fonctionne car return null si not found
}

<TeamMemberForm member={member} />
```

---

## 🎨 4. Audit Composant `TeamMemberForm`

### ✅ Longueur mesurée : **164 lignes**

**Résultat** : < 300 lignes → **Pas de split nécessaire**

**Sections identifiées** :
1. Photo picker/preview (~50 lignes)
2. Champs texte (name, role, description) (~40 lignes)
3. URL externe fallback (~15 lignes)
4. Submit buttons (~20 lignes)
5. State management + handlers (~40 lignes)

---

## 🚀 5. Audit Routes Admin

### ✅ Routes existantes

| Route | Fichier | Statut |
|-------|---------|--------|
| `/admin/team` | `app/(admin)/admin/team/page.tsx` | ✅ Existe |
| Loading state | `app/(admin)/admin/team/loading.tsx` | ✅ Existe |

### ❌ Routes manquantes (À créer)

```bash
app/(admin)/admin/team/
├── page.tsx              # ✅ Existe
├── loading.tsx           # ✅ Existe
├── new/
│   ├── page.tsx         # ❌ À créer (Step 2)
│   └── loading.tsx      # ⚠️ Recommandé
└── [id]/
    ├── edit/
    │   ├── page.tsx     # ❌ À créer (Step 3)
    │   └── loading.tsx  # ⚠️ Recommandé
    └── page.tsx         # ⏰ Phase future (détail membre)
```

---

## 🗑️ 6. Audit API Routes (À supprimer après migration)

### ❌ API Routes obsolètes après migration

```bash
app/api/admin/team/
├── [id]/
│   ├── active/route.ts       # ❌ Remplacé par setTeamMemberActiveAction
│   └── hard-delete/route.ts  # ❌ Remplacé par hardDeleteTeamMemberAction
└── route.ts                   # ❌ Remplacé par createTeamMember/updateTeamMember
```

**⚠️ Attention** : Ne supprimer qu'APRÈS validation complète de la migration.

---

## 📦 7. Database Types Validation

### ✅ Type `membres_equipe` validé

```typescript
// Extrait database.types.ts ligne ~1180
membres_equipe: {
  Row: {
    id: number
    name: string
    role: string | null
    description: string | null
    image_url: string | null
    photo_media_id: number | null  // ← number (pas bigint)
    ordre: number | null
    active: boolean | null
    created_at: string
    updated_at: string
  }
}
```

**Conclusion** : Pas de conversion bigint→number nécessaire, utiliser `z.number()` directement dans UI schema.

---

## 🎯 Résumé des Actions Requises

### Step 0.5 : Créations préliminaires

| # | Action | Fichier | Statut | Priorité |
|---|--------|---------|--------|----------|
| 1 | Ajouter `TeamMemberFormSchema` | `lib/schemas/team.ts` | ❌ Critique | P0 |
| 2 | Vérifier `fetchTeamMemberById` return type | `lib/dal/team.ts` | ⚠️ Check | P0 |
| 3 | Estimer longueur `TeamMemberForm.tsx` | Fichier actuel | ⚠️ Audit | P1 |

### Validation Checklist

- [x] ✅ `TeamMemberInputSchema` (Server) existe
- [ ] ❌ `TeamMemberFormSchema` (UI) **MANQUANT** → **À créer**
- [x] ✅ `setTeamMemberActiveAction` existe
- [x] ✅ `hardDeleteTeamMemberAction` existe
- [x] ✅ `fetchTeamMemberById` existe (inféré)
- [ ] ⚠️ Vérifier return type `fetchTeamMemberById` (null vs DALResult)
- [ ] ⚠️ Mesurer longueur `TeamMemberForm.tsx` (split si > 300L)
- [x] ✅ Types DB validés (`photo_media_id: number`)

---

## 🎬 Next Steps (Plan ajusté)

### Step 1 : Créer UI Schema (BLOQUANT)

```typescript
// lib/schemas/team.ts (à ajouter après ligne ~77)

// =============================================================================
// UI FORM SCHEMA
// =============================================================================
export const TeamMemberFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(200, "200 caractères maximum"),
  role: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  image_url: z.string().url("URL invalide").optional().nullable().or(z.literal("")),
  photo_media_id: z.number().int().positive().optional().nullable(),
  ordre: z.number().int().optional().nullable(),
  active: z.boolean().optional(),
});

export type TeamMemberFormValues = z.infer<typeof TeamMemberFormSchema>;
```

### ~~Step 1.5 : Vérifier DAL~~ → ✅ VÉRIFIÉ

`fetchTeamMemberById` retourne `TeamRow | null` (ligne 100 de `lib/dal/team.ts`).

---

## Steps (Plan d'exécution)

1. ~~**Ajouter schéma Zod UI dans `lib/schemas/team.ts`**~~ ✅ **FAIT**
   - `TeamMemberFormSchema` créé avec validation française
   - `TeamMemberFormValues` type exporté
   - `.or(z.literal(""))` ajouté pour `image_url` (champs vides)

2. ~~**Créer page de création** `app/(admin)/admin/team/new/page.tsx`~~ ✅ **FAIT**
   - Page créée avec `dynamic = 'force-dynamic'`, `revalidate = 0`
   - Breadcrumb retour vers `/admin/team`
   - `loading.tsx` créé avec skeleton
   - Wrapper `TeamMemberFormWrapper` créé pour gérer Server Actions + navigation

3. ~~**Créer route dynamique et page d'édition** `app/(admin)/admin/team/[id]/edit/page.tsx`~~ ✅ **FAIT**
   - Page créée avec `dynamic = 'force-dynamic'`, `revalidate = 0`
   - Appel `fetchTeamMemberById(id)` via DAL
   - Gestion `notFound()` si membre inexistant ou ID invalide
   - `loading.tsx` créé avec skeleton
   - Passe `member` au wrapper en mode "edit"

4. ~~**Refactorer `TeamMemberForm`**~~ ✅ **FAIT**
   - Remplacé `useState` par `react-hook-form` + `zodResolver(TeamMemberFormSchema)`
   - Props typées avec `TeamMemberFormValues`
   - Utilise composants `Form`, `FormField`, `FormItem`, `FormLabel`, `FormMessage`
   - `form.watch()` pour réactivité photo/nom
   - `form.setValue()` pour mise à jour photo via MediaUploadDialog
   - Wrapper mis à jour pour utiliser `TeamMemberFormValues`

5. ~~**Simplifier `TeamManagementContainer`**~~ ✅ **FAIT**
   - Bouton "Ajouter" remplacé par `<Link href="/admin/team/new">`
   - `onEditMember` utilise `router.push(/admin/team/${id}/edit)`
   - États `openForm`, `editing`, `openMedia` supprimés
   - Import `TeamMemberForm` et `MediaUploadDialog` supprimés
   - Fonctions `handleCreate`, `handleEditSubmit`, `fetchMembers` supprimées
   - `useEffect` sync ajouté pour `initialMembers`
   - `handleReactivateTeamMember` migré vers `setTeamMemberActiveAction`
   - **Tous les dialogs conservés** (désactivation, réactivation, hard delete)
   - Fichier réduit de 319 → 232 lignes

6. ~~**Migrer `fetch()` vers Server Actions dans `TeamManagementContainer`**~~ ✅ **FAIT**
   - `handleReactivateTeamMember` déjà migré vers `setTeamMemberActiveAction(id, true)`
   - `handleHardDeleteMember` migré vers `hardDeleteTeamMemberAction(id)`
   - Plus aucun `fetch()` dans le container

7. ~~**Supprimer API Routes obsolètes**~~ ✅ **FAIT**
   - `app/api/admin/team/[id]/active/route.ts` → Supprimé
   - `app/api/admin/team/[id]/hard-delete/route.ts` → Supprimé
   - `app/api/admin/team/route.ts` → Supprimé (était utilisé par `fetchMembers()`)
   - Dossier `app/api/admin/team/` entièrement supprimé

---

## ✅ MIGRATION TERMINÉE

Tous les steps ont été complétés avec succès. Le CRUD Team utilise maintenant :
- **Pages dédiées** : `/admin/team/new` et `/admin/team/[id]/edit`
- **Server Actions** : `createTeamMember`, `updateTeamMember`, `setTeamMemberActiveAction`, `hardDeleteTeamMemberAction`
- **react-hook-form + zodResolver** : Validation côté client avec `TeamMemberFormSchema`
- **Pattern CRUD complet** : Conforme à `crud-server-actions-pattern.instructions.md`

---

## Further Considerations

1. **Ajouter page détail `/admin/team/[id]/page.tsx`** ? — Utile pour prévisualiser un membre avant édition. Peut être créée dans une phase ultérieure.

2. **Ajouter `useEffect` sync dans `TeamManagementContainer`** ? — Oui, pattern obligatoire : `useEffect(() => setMembers(initialMembers), [initialMembers])` pour synchroniser après `router.refresh()`.

3. **Créer `loading.tsx` pour les pages `/new` et `/[id]/edit`** ? — Recommandé pour UX cohérente avec skeleton pendant le chargement.

---

## Fichiers concernés

### À créer
- `app/(admin)/admin/team/new/page.tsx`
- `app/(admin)/admin/team/new/loading.tsx` (recommandé)
- `app/(admin)/admin/team/[id]/edit/page.tsx`
- `app/(admin)/admin/team/[id]/edit/loading.tsx` (recommandé)

### À modifier
- ~~`lib/schemas/team.ts`~~ ✅ **FAIT**
- `components/features/admin/team/TeamMemberForm.tsx` — Refactorer avec react-hook-form
- `components/features/admin/team/TeamManagementContainer.tsx` — Simplifier + migrer fetch vers Server Actions

### À supprimer (après migration)
- `app/api/admin/team/[id]/active/route.ts`
- `app/api/admin/team/[id]/hard-delete/route.ts`
- `app/api/admin/team/route.ts` (si non utilisé ailleurs)

---

## Références

- Pattern CRUD : `.github/instructions/crud-server-actions-pattern.instructions.md`
- DAL SOLID : `.github/instructions/dal-solid-principles.instructions.md`
- Server Actions existantes : `app/(admin)/admin/team/actions.ts`
- DAL existant : `lib/dal/team.ts` (`fetchTeamMemberById` retourne `TeamRow | null`)
