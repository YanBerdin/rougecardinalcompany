## Plan : Admin Compagnie — CRUD page /compagnie

> **Audit conformité** : Vérifié vs instructions projet (DAL SOLID, Clean Code, CRUD Server Actions, BigInt Three-Layer, TypeScript Strict, WCAG 2.2 AA).
> **Patterns de référence** : `lib/dal/admin-partners.ts`, `lib/schemas/partners.ts`, `app/(admin)/admin/presse/page.tsx`, `app/(admin)/admin/presse/press-articles-actions.ts`, `components/features/admin/presse/PressReleasesContainer.tsx`.

Page unique tabulée à `/admin/compagnie` (pattern `app/(admin)/admin/presse/page.tsx`) avec 3 onglets pour gérer `compagnie_values`, `compagnie_stats` et `compagnie_presentation_sections`. Chaque onglet encapsule un Container Server + View Client + Form Client suivant le pattern de `components/features/admin/presse/`. Le DAL existant est public-only — les DAL admin avec `requireAdmin()` sont à créer. Les 3 tables ont déjà le RLS configuré pour l'admin (vérifié dans `supabase/schemas/07b_table_compagnie_content.sql` et `07c_table_compagnie_presentation.sql`).

**Steps**

### Étape 1 — Schemas admin (`lib/schemas/compagnie-admin.ts`)

Créer un fichier de schémas dédié admin avec la séparation Server / UI / DTO (pattern `lib/schemas/partners.ts`) :

**1a. CompagnieValue (table `compagnie_values`)** :

```typescript
// Server Schema — bigint IDs, utilisé dans DAL
export const CompagnieValueInputSchema = z.object({
  key: z.string().min(1).max(80),
  title: z.string().min(1, "Le titre est requis").max(80),
  description: z.string().min(1, "La description est requise"),
  position: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});
export type CompagnieValueInput = z.infer<typeof CompagnieValueInputSchema>;

// UI Schema — sans key (auto-généré par generateSlug(title) dans le DAL)
export const CompagnieValueFormSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(80),
  description: z.string().min(1, "La description est requise"),
  position: z.number().int().min(0),
  active: z.boolean(),
});
export type CompagnieValueFormValues = z.infer<typeof CompagnieValueFormSchema>;

// DTO — number IDs pour sérialisation JSON
export interface CompagnieValueDTO {
  id: number;
  key: string;
  title: string;
  description: string;
  position: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}
```

**1b. CompagnieStat (table `compagnie_stats`)** — même structure :

```typescript
export const CompagnieStatInputSchema = z.object({
  key: z.string().min(1).max(80),
  label: z.string().min(1, "Le label est requis").max(80),
  value: z.string().min(1, "La valeur est requise").max(20), // souplesse "15+", "8"
  position: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});
export type CompagnieStatInput = z.infer<typeof CompagnieStatInputSchema>;

export const CompagnieStatFormSchema = z.object({
  label: z.string().min(1, "Le label est requis").max(80),
  value: z.string().min(1, "La valeur est requise").max(20),
  position: z.number().int().min(0),
  active: z.boolean(),
});
export type CompagnieStatFormValues = z.infer<typeof CompagnieStatFormSchema>;

export interface CompagnieStatDTO {
  id: number;
  key: string;
  label: string;
  value: string;
  position: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}
```

**1c. PresentationSection (table `compagnie_presentation_sections`)** :

```typescript
const SECTION_KINDS = ["hero", "history", "quote", "values", "team", "mission", "custom"] as const;

export const PresentationSectionInputSchema = z.object({
  slug: z.string().min(1).max(80),
  kind: z.enum(SECTION_KINDS),
  title: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  content: z.array(z.string()).optional().nullable(),
  quote_text: z.string().optional().nullable(),
  quote_author: z.string().optional().nullable(),
  image_url: addImageUrlValidation(z.string().url()).optional().nullable().or(z.literal("")),
  image_media_id: z.coerce.bigint().optional().nullable(),
  position: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});
export type PresentationSectionInput = z.infer<typeof PresentationSectionInputSchema>;

export const PresentationSectionFormSchema = z.object({
  slug: z.string().min(1).max(80),
  kind: z.enum(SECTION_KINDS),
  title: z.string().optional().or(z.literal("")),
  subtitle: z.string().optional().or(z.literal("")),
  content: z.array(z.string()).optional(),
  quote_text: z.string().optional().or(z.literal("")),
  quote_author: z.string().optional().or(z.literal("")),
  image_url: z.string().url().optional().or(z.literal("")),
  image_media_id: z.number().int().positive().optional().nullable(), // number, pas bigint
  position: z.number().int().min(0),
  active: z.boolean(),
});
export type PresentationSectionFormValues = z.infer<typeof PresentationSectionFormSchema>;

export interface PresentationSectionDTO {
  id: number;
  slug: string;
  kind: typeof SECTION_KINDS[number];
  title: string | null;
  subtitle: string | null;
  content: string[] | null;
  quote_text: string | null;
  quote_author: string | null;
  image_url: string | null;
  image_media_id: number | null;
  position: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}
```

**1d. Reorder Schemas** (pattern `ReorderPartnersSchema` dans `partners.ts`) :

```typescript
export const ReorderCompagnieValuesSchema = z.object({
  items: z.array(z.object({
    id: z.coerce.bigint(),
    position: z.number().int().min(0),
  })),
});
export type ReorderCompagnieValuesInput = z.infer<typeof ReorderCompagnieValuesSchema>;

// Idem pour Stats et PresentationSections
export const ReorderCompagnieStatsSchema = z.object({ /* même structure */ });
export const ReorderPresentationSectionsSchema = z.object({ /* même structure */ });
```

**Imports requis** : `import { z } from "zod"`, `import { addImageUrlValidation } from "@/lib/utils/image-validation-refinements"`.

**Export** : `SECTION_KINDS` en tant que constante nommée pour réutilisation dans les forms.

---

### Étape 2 — DAL admin (3 fichiers dans `lib/dal/`)

Pattern de référence : `lib/dal/admin-partners.ts` (259 lignes, SOLID complet).

**Squelette commun** (chaque fichier) :

```typescript
"use server";
import "server-only";
import { cache } from "react";
import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";
import { type DALResult, dalSuccess, dalError } from "@/lib/dal/helpers";
```

**2a.** `lib/dal/admin-compagnie-values.ts` (~120 lignes estimées) :

```
// ─── Types ─────────────────
interface RawValueRow { id: unknown; key: string; title: string; description: string; position: number; active: boolean; created_at: string; updated_at: string; }

// ─── Constants ─────────────
const VALUE_SELECT_FIELDS = "id, key, title, description, position, active, created_at, updated_at";

// ─── Private helpers ───────
function mapToCompagnieValueDTO(raw: RawValueRow): CompagnieValueDTO
  → retourne { ...raw, id: Number(raw.id) }

async function getNextPosition(supabase, table: "compagnie_values"): Promise<number>
  → SELECT position ORDER BY position DESC LIMIT 1, return +1

// ─── Exports ───────────────
export const fetchAllCompagnieValuesAdmin = cache(async (): Promise<DALResult<CompagnieValueDTO[]>>)
  → requireAdmin() → SELECT VALUE_SELECT_FIELDS sans filtre active, ORDER BY position
  → dalError("[ERR_COMPAGNIE_V01]") | dalSuccess(data.map(mapToCompagnieValueDTO))

export async function createCompagnieValue(input: CompagnieValueInput): Promise<DALResult<CompagnieValueDTO>>
  → requireAdmin() → CompagnieValueInputSchema.parseAsync(input)
  → auto-calcul position via getNextPosition() si non fourni
  → auto-génération key via generateSlug(input.title) si key absent
  → INSERT .select(VALUE_SELECT_FIELDS).single()
  → dalError("[ERR_COMPAGNIE_V02]") | dalSuccess(mapToCompagnieValueDTO(data))

export async function updateCompagnieValue(id: bigint, input: Partial<CompagnieValueInput>): Promise<DALResult<CompagnieValueDTO>>
  → requireAdmin() → CompagnieValueInputSchema.partial().parseAsync(input)
  → UPDATE .eq("id", id.toString()).select(VALUE_SELECT_FIELDS).single()
  → dalError("[ERR_COMPAGNIE_V03]") | dalSuccess(mapToCompagnieValueDTO(data))

export async function deleteCompagnieValue(id: bigint): Promise<DALResult<void>>
  → requireAdmin() → DELETE .eq("id", id.toString())
  → dalError("[ERR_COMPAGNIE_V04]") | dalSuccess(undefined)

export async function reorderCompagnieValues(input: ReorderCompagnieValuesInput): Promise<DALResult<void>>
  → requireAdmin() → Promise.all(input.items.map(update position))
  → dalError("[ERR_COMPAGNIE_V05]") | dalSuccess(undefined)
```

**2b.** `lib/dal/admin-compagnie-stats.ts` (~120 lignes) — même 6 fonctions pour `compagnie_stats` :

```
// Codes erreur : [ERR_COMPAGNIE_S01] à [ERR_COMPAGNIE_S05]
// Fonctions : fetchAllCompagnieStatsAdmin, createCompagnieStat, updateCompagnieStat, deleteCompagnieStat, reorderCompagnieStats
// Helper : mapToCompagnieStatDTO
// Constante : STAT_SELECT_FIELDS = "id, key, label, value, position, active, created_at, updated_at"
```

**2c.** `lib/dal/admin-compagnie-presentation.ts` (~150 lignes, plus complexe — media join) :

```
// ─── Types ─────────────────
type RawMediaData = { storage_path: string } | { storage_path: string }[] | null;
interface RawPresentationRow { id: unknown; slug: string; kind: string; ... ; image_media_id: unknown; media: RawMediaData; ... }

// ─── Constants ─────────────
const SECTION_SELECT_FIELDS = `id, slug, kind, title, subtitle, content, quote_text, quote_author, image_url, image_media_id, position, active, created_at, updated_at, media:image_media_id ( storage_path )`;

// ─── Private helpers ───────
function mapToPresentationSectionDTO(raw: RawPresentationRow): PresentationSectionDTO
  → id: Number(raw.id), image_media_id: Number(raw.image_media_id) ou null
  → image_url: buildMediaPublicUrl(storagePath) ?? raw.image_url ?? null

// ─── Exports ───────────────
export const fetchAllPresentationSectionsAdmin = cache(async (): Promise<DALResult<PresentationSectionDTO[]>>)
  → requireAdmin() → SELECT SECTION_SELECT_FIELDS ORDER BY position
  → dalError("[ERR_COMPAGNIE_P01]") | dalSuccess(mapToPresentationSectionDTO each)

export async function createPresentationSection(input: PresentationSectionInput): ...
  → PresentationSectionInputSchema.parseAsync(input) → INSERT
  → dalError("[ERR_COMPAGNIE_P02]") | dalSuccess(...)

export async function updatePresentationSection(id: bigint, input: Partial<PresentationSectionInput>): ...
  → dalError("[ERR_COMPAGNIE_P03]") | dalSuccess(...)

export async function deletePresentationSection(id: bigint): ...
  → dalError("[ERR_COMPAGNIE_P04]") | dalSuccess(undefined)

export async function reorderPresentationSections(input: ReorderPresentationSectionsInput): ...
  → dalError("[ERR_COMPAGNIE_P05]") | dalSuccess(undefined)
```

**Règles DAL à respecter** (checklist `dal-solid-principles.instructions.md`) :
- ✅ `"use server"` + `import "server-only"` en tête de chaque fichier
- ✅ `requireAdmin()` au début de chaque fonction
- ✅ `dalSuccess()` / `dalError()` — jamais de `{ success: false, error: ... }` brut
- ✅ `cache()` sur toutes les fonctions de lecture (fetch)
- ✅ Codes erreur `[ERR_COMPAGNIE_Vxx]`, `[ERR_COMPAGNIE_Sxx]`, `[ERR_COMPAGNIE_Pxx]`
- ✅ `.parseAsync()` pour validation (pas `.parse()`)
- ✅ Fonctions < 30 lignes
- ✅ `mapToDTO()` helper privé avec `Number()` pour bigint→number
- ✅ Constante `SELECT_FIELDS` nommée
- ✅ `buildMediaPublicUrl()` pour résolution image media (présentation only)
- ✅ `getNextPosition()` helper pour auto-incrémentation à la création

---

### Étape 3 — Server Actions (3 fichiers colocalisés dans `app/(admin)/admin/compagnie/`)

**CORRECTION vs plan initial** : Splitter en **3 fichiers** (pas 1 unique) pour respecter la limite 300 lignes.
Pattern de référence : `app/(admin)/admin/presse/press-articles-actions.ts` (3 fichiers séparés dans le même dossier).

**Squelette commun** (chaque fichier) :

```typescript
"use server";
import "server-only";
import { revalidatePath } from "next/cache";
import { type ActionResult } from "@/lib/actions/types";
```

**3a.** `app/(admin)/admin/compagnie/compagnie-values-actions.ts` (~100 lignes) :

```typescript
import { CompagnieValueInputSchema, type CompagnieValueInput } from "@/lib/schemas/compagnie-admin";
import { createCompagnieValue, updateCompagnieValue, deleteCompagnieValue, reorderCompagnieValues } from "@/lib/dal/admin-compagnie-values";
import { generateSlug } from "@/lib/dal/helpers";

export async function createCompagnieValueAction(input: unknown): Promise<ActionResult> {
  try {
    // 1. Valider avec schéma UI (sans key), puis construire l'input Server avec key = generateSlug(title)
    const form = await CompagnieValueFormSchema.parseAsync(input);
    const serverInput: CompagnieValueInput = { ...form, key: generateSlug(form.title) };
    // 2. Appel DAL
    const result = await createCompagnieValue(serverInput);
    if (!result.success) return { success: false, error: result.error };
    // 3. Revalidation
    revalidatePath("/admin/compagnie");
    revalidatePath("/compagnie");
    return { success: true }; // ✅ Pas de data (BigInt Three-Layer)
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function updateCompagnieValueAction(id: string, input: unknown): Promise<ActionResult> {
  try {
    const validated = await CompagnieValueInputSchema.partial().parseAsync(input);
    const result = await updateCompagnieValue(BigInt(id), validated); // BigInt conversion
    if (!result.success) return { success: false, error: result.error };
    revalidatePath("/admin/compagnie");
    revalidatePath("/compagnie");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function deleteCompagnieValueAction(id: string): Promise<ActionResult> {
  try {
    const result = await deleteCompagnieValue(BigInt(id));
    if (!result.success) return { success: false, error: result.error };
    revalidatePath("/admin/compagnie");
    revalidatePath("/compagnie");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function reorderCompagnieValuesAction(input: unknown): Promise<ActionResult> {
  try {
    const validated = await ReorderCompagnieValuesSchema.parseAsync(input);
    const result = await reorderCompagnieValues(validated);
    if (!result.success) return { success: false, error: result.error };
    revalidatePath("/admin/compagnie");
    revalidatePath("/compagnie");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
```

**3b.** `app/(admin)/admin/compagnie/compagnie-stats-actions.ts` (~100 lignes) — même structure, 4 actions.

**3c.** `app/(admin)/admin/compagnie/compagnie-presentation-actions.ts` (~100 lignes) — même structure, 4 actions.

**Règles Server Actions à respecter** :
- ✅ `"use server"` + `import "server-only"` en tête
- ✅ `ActionResult` (void, sans `data`) — règle BigInt Three-Layer
- ✅ `.parseAsync()` pour validation Zod
- ✅ `BigInt(id)` pour conversion string→bigint avant appel DAL
- ✅ `revalidatePath("/admin/compagnie")` + `revalidatePath("/compagnie")` sur succès
- ✅ try/catch avec `error instanceof Error ? error.message : "Unknown error"`
- ✅ Chaque fichier < 300 lignes

---

### Étape 4 — Composants UI (`components/features/admin/compagnie/`)

Structure des fichiers (< 300 lignes chacun, clean code) :

**4a. Onglet Valeurs** (pattern `PressReleasesContainer.tsx` + `PressReleasesView.tsx`) :

- `ValuesContainer.tsx` (~30 lignes) — **Server Component** :
  - Import `fetchAllCompagnieValuesAdmin` depuis DAL
  - Appelle le DAL, gère l'erreur avec `<div className="text-red-600">`
  - **Conversion bigint→string** dans le Container (pattern `PressReleasesContainer.tsx`) :
    ```typescript
    const valuesForClient = result.data.map((v) => ({
      ...v,
      id: String(v.id), // ← OBLIGATOIRE pour Client Component
    }));
    return <ValuesView initialValues={valuesForClient} />;
    ```
  - Note : les ValuesDTO utilisent déjà `id: number` grâce à `mapToDTO()`, donc la conversion String est pour le transport JSON vers le client

- `ValuesView.tsx` (~200 lignes) — **Client** `"use client"` :
  - `useState(initialValues)` + `useEffect(() => setValues(initialValues), [initialValues])` — sync props/state CRITIQUE
  - Handlers CRUD : `handleCreate`, `handleEdit`, `handleDelete` — appellent Server Actions directement
  - `router.refresh()` après succès (déclenche re-fetch Server Component)
  - `handleEdit` utilise données locales (pas de fetch supplémentaire)
  - Dialog form : ouvre `ValueForm` dans un `<Dialog>`
  - Tableau ou grille de cartes avec : titre, description (tronquée), position, toggle active, boutons edit/delete
  - Bouton "Ajouter une valeur" en haut

- `ValueForm.tsx` (~150 lignes) — **Client** :
  - `useForm<CompagnieValueFormValues>` + `zodResolver(CompagnieValueFormSchema)` — pas de cast `as unknown as Resolver<>`
  - Dialog modal avec champs : title (Input), description (Textarea), position (Input type number), active (Switch/Toggle)
  - Le `key` n'apparaît PAS dans le formulaire — il est déduit du titre dans l'action
  - `isPending` state + disable bouton submit
  - `onSuccess()` callback → parent ferme dialog + `router.refresh()`
  - `form.reset()` après succès
  - `defaultValues` depuis `item` prop (map DTO→form values)

**4b. Onglet Chiffres clés** (même pattern) :

- `StatsContainer.tsx` (~30 lignes) — même pattern
- `StatsView.tsx` (~200 lignes) — Client View : liste + CRUD handlers
- `StatForm.tsx` (~130 lignes) — Client Form : champs label (Input), value (Input, string libre "15+"), position (Input number), active (Switch)

**4c. Onglet Sections Présentation** (plus complexe — content text[] + image + kind-dependent fields) :

- `PresentationContainer.tsx` (~30 lignes) — Server Component, même pattern

- `PresentationView.tsx` (~200 lignes) — Client View :
  - Liste des sections avec badge `kind` (utiliser `<Badge variant="outline">`)
  - CRUD handlers identiques
  - Affiche titre, kind, position, statut active
  - Boutons edit/delete par section

- `PresentationForm.tsx` (~250 lignes) — Client Form :
  - `useForm<PresentationSectionFormValues>` + `zodResolver(PresentationSectionFormSchema)`
  - Conditional fields selon `kind` :
    - `hero` / `mission` / `history` : title, subtitle, content[] (via ContentArrayField), image (via MediaLibraryPicker)
    - `quote` : quote_text (Textarea), quote_author (Input)
    - `values` / `team` : title, subtitle seulement (info "données gérées dans d'autres onglets")
    - `custom` : tous les champs
  - Le `slug` est auto-généré depuis title (via `generateSlug`) ou éditable en mode avancé
  - Si > 250 lignes → splitter :

- `PresentationFormFields.tsx` (~100 lignes) — Sous-composant : champs communs (kind `<Select>`, title, subtitle, position, active)

- `ContentArrayField.tsx` (~80 lignes) — **Nouveau composant** :
  - Édition de `text[]` avec liste de `<Textarea>` + boutons Ajouter/Supprimer paragraphe
  - Pattern custom (pas de `useFieldArray` — react-hook-form `setValue` direct)
  - **Accessibilité WCAG 2.2** :
    - Chaque textarea : `<label htmlFor={`paragraph-${index}`}>Paragraphe {index + 1}</label>`
    - Bouton supprimer : `aria-label={`Supprimer le paragraphe ${index + 1}`}`
    - Bouton ajouter : texte explicite "Ajouter un paragraphe"
    - Focus management : après ajout, focus sur le nouveau textarea
  - Props : `value: string[]`, `onChange: (value: string[]) => void`, `label?: string`

- `types.ts` (~40 lignes) — Props interfaces colocalisées :
  ```typescript
  export interface ValuesViewProps { initialValues: (CompagnieValueDTO & { id: string })[]; }
  export interface StatsViewProps { initialStates: (CompagnieStatDTO & { id: string })[]; }
  export interface PresentationViewProps { initialSections: (PresentationSectionDTO & { id: string })[]; }
  export interface ValueFormProps { open: boolean; onClose: () => void; onSuccess: () => void; item?: CompagnieValueDTO | null; }
  // etc.
  ```

- `index.ts` — barrel exports

---

### Étape 5 — Page admin et route

`app/(admin)/admin/compagnie/page.tsx` (~65 lignes) :

```typescript
import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ValuesContainer } from "@/components/features/admin/compagnie/ValuesContainer";
import { StatsContainer } from "@/components/features/admin/compagnie/StatsContainer";
import { PresentationContainer } from "@/components/features/admin/compagnie/PresentationContainer";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Gestion Compagnie | Admin",
  description: "Gestion des valeurs, chiffres clés et sections de présentation",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function CompagniePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Gestion Compagnie</h1>
      <Tabs defaultValue="values" className="w-full">
        {/* ✅ Classes responsive identiques à presse/page.tsx */}
        <TabsList className="flex flex-col sm:grid sm:grid-cols-3 w-full h-auto gap-1 sm:gap-0">
          <TabsTrigger value="values" className="hover:text-popover-foreground hover:bg-card w-full justify-center text-sm py-2.5">
            Valeurs
          </TabsTrigger>
          <TabsTrigger value="stats" className="hover:text-popover-foreground hover:bg-card w-full justify-center text-sm py-2.5">
            Chiffres clés
          </TabsTrigger>
          <TabsTrigger value="presentation" className="hover:text-popover-foreground hover:bg-card w-full justify-center text-sm py-2.5">
            Présentation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="values" className="mt-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <ValuesContainer />
          </Suspense>
        </TabsContent>
        <TabsContent value="stats" className="mt-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <StatsContainer />
          </Suspense>
        </TabsContent>
        <TabsContent value="presentation" className="mt-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <PresentationContainer />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }, (_, i) => (
        <Skeleton key={`skeleton-${i}`} className="h-20 w-full" />
      ))}
    </div>
  );
}
```

---

### Étape 6 — Sidebar navigation

Modifier `components/admin/AdminSidebar.tsx` :

1. Importer `Building2` depuis `lucide-react`
2. Ajouter dans le groupe `contentItems` : `{ title: "Compagnie", href: "/admin/compagnie", icon: Building2 }`
3. Position recommandée : après "Presse" et avant "Médiathèque"

**Note** : "La compagnie Section" existe déjà dans `homepageItems` (lien vers `/admin/home/about`). C'est un concept différent — "La compagnie Section" gère uniquement le bloc About de la page d'accueil, tandis que "/admin/compagnie" gère les 3 tables de contenu compagnie. Le nommage "Compagnie" dans `contentItems` est cohérent avec "Spectacles", "Presse" etc.

---

### Étape 7 — Skeletons

Utiliser le pattern inline `LoadingSkeleton` directement dans `page.tsx` (pattern `presse/page.tsx`) — pas besoin d'un fichier skeleton séparé car chaque `TabsContent` utilise le même composant. Si des squelettes spécialisés deviennent nécessaires ultérieurement (ex: grille de cartes), créer `components/skeletons/CompagnieSkeleton.tsx` avec :
- `ValuesListSkeleton` — grille de Cards placeholder
- `StatsListSkeleton` — idem
- `PresentationListSkeleton` — liste de cartes avec badge placeholder

---

### Étape 8 — Script de test DAL

Créer `scripts/test-admin-compagnie.ts` (pattern `scripts/test-admin-partners.ts`) :

- Utilise `dotenv/config` pour charger les variables d'env (pas T3 Env dans les scripts)
- Utilise `createClient` avec `SUPABASE_SERVICE_ROLE_KEY` pour bypasser RLS/requireAdmin
- Teste les 3 DAL admin (values, stats, presentation)
- Pour chaque entité : fetch all → create → update → delete → fetch all (vérifier le retour)
- Vérifie les codes erreur et les types DTO
- Affichage résultats avec `console.log` formaté (✅/❌)
- Commande : `pnpm exec tsx scripts/test-admin-compagnie.ts`
- Ajouter à `package.json` : `"test:compagnie": "tsx scripts/test-admin-compagnie.ts"`

---

### Étape 9 — Vérification manuelle navigateur

Parcours de validation :
1. Naviguer vers `/admin/compagnie` — vérifier que les 3 onglets s'affichent
2. **Onglet Valeurs** : créer, modifier, supprimer une valeur. Vérifier que `/compagnie` met à jour
3. **Onglet Stats** : créer, modifier, supprimer un stat. Vérifier sur `/compagnie`
4. **Onglet Présentation** : modifier le hero (title/subtitle), modifier une section history (content[]), tester kind=quote (quote_text/author), ajouter une section custom avec image (via `MediaLibraryPicker`)
5. Tester le toggle `active` — vérifier que la section disparaît du public
6. Tester la position — vérifier l'ordre sur `/compagnie`
7. Vérifier l'accessibilité clavier : navigation tabs, focus trap dans les dialogs, labels des champs, `ContentArrayField` (ajout/suppression paragraphes au clavier)

---

**Vérification**

1. `pnpm exec tsx scripts/test-admin-compagnie.ts` — toutes les opérations CRUD passent
2. `pnpm build` — pas d'erreur TypeScript
3. `pnpm lint` — pas de warnings
4. Navigation manuelle `/admin/compagnie` — les 3 onglets fonctionnent
5. Mutations → `router.refresh()` → données fraîches visibles immédiatement
6. `/compagnie` public reflète les changements admin
7. `types.ts` vérifié — aucun type `any`, aucun cast `as unknown as Resolver<>`

---

**Decisions**

- **Page unique tabulée** (choix utilisateur) plutôt que sous-routes séparées — évite la multiplication de routes et centralise la gestion
- **Champ position numérique** dans le form — pas de DnD, simplicité
- **`ContentArrayField` custom** pour `text[]` — multi-textareas dynamique car le pattern comma-separated existant ne convient pas aux paragraphes longs
- **3 fichiers d'actions** (pas 1 unique) — `compagnie-values-actions.ts`, `compagnie-stats-actions.ts`, `compagnie-presentation-actions.ts` — respect de la limite 300 lignes (12 actions dans un seul fichier dépasserait)
- **3 DAL séparés** plutôt qu'un seul — respect du SRP (1 fichier = 1 table)
- **Schémas dans un seul fichier** `compagnie-admin.ts` — les 3 entités sont liées à la même feature admin (fichier ~200 lignes, sous la limite)
- **Sidebar dans `contentItems`** — cohérent avec la position de "Spectacles", "Presse" etc. (distinct de "La compagnie Section" dans `homepageItems`)
- **`LoadingSkeleton` inline** dans `page.tsx` — pattern identique à `presse/page.tsx`
- **`buildMediaPublicUrl()`** pour résolution images media dans le DAL présentation — cohérent avec `admin-partners.ts`

---

**Corrections appliquées suite à l'audit de conformité** :

| # | Gravité | Correction |
|---|---------|------------|
| 1 | CRITIQUE | Split actions en 3 fichiers (pas 1 unique → dépassement 300 lignes) |
| 2 | CRITIQUE | Ajout `cache()` explicite sur toutes les fonctions fetch DAL |
| 3 | CRITIQUE | Utilisation `dalSuccess()`/`dalError()` au lieu d'objets bruts |
| 4 | HAUTE | Ajout fonctions reorder dans Étape 2 (manquaient au DAL) |
| 5 | HAUTE | Ajout `buildMediaPublicUrl()` pour présentation |
| 6 | HAUTE | Ajout constantes `SELECT_FIELDS` dans chaque DAL |
| 7 | HAUTE | Ajout `getNextPosition()` helper dans DAL |
| 8 | HAUTE | Ajout conversion bigint→string dans Container |
| 9 | MOYENNE | Ajout `ReorderSchemas` dans le fichier schemas |
| 10 | MOYENNE | Classes responsive TabsList dans page.tsx |
| 11 | BASSE | Clarification sidebar "Compagnie" vs "La compagnie Section" |
