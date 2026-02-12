# Plan : Intégration Media Library dans TASK024 Gestion Presse

**Objectif** : Migrer les formulaires de gestion presse (communiqués/articles) vers `ImageFieldGroup` avec Media Library, en réutilisant `og_image_media_id` existant pour les articles et en ajoutant `image_media_id` pour les communiqués.

**Scope** : 4 formulaires (2 communiqués + 2 articles), 2 schemas Zod, 2 modules DAL, 2 migrations DB

> **✅ IMPLÉMENTÉ (Jan 22, 2026)** : Phase 6 complète - Media Library Integration for Press module.

---

## ✅ Statut d'implémentation (Phase 6 - Jan 22, 2026)

### Database
- ✅ `articles_presse` : Colonnes `image_url` et `og_image_media_id` ajoutées
- ✅ `communiques_presse` : Colonne `image_media_id` ajoutée
- ✅ Index `idx_communiques_presse_image_media_id` créé
- ✅ `communiques_presse_dashboard` : Converti de VIEW à FUNCTION SECURITY DEFINER
- ✅ Schémas déclaratifs mis à jour : `08_table_articles_presse.sql`, `08b_communiques_presse.sql`, `41_views_communiques.sql`

### Forms
- ✅ `ArticleNewForm.tsx` : FormProvider + ImageFieldGroup ajoutés
- ✅ `ArticleEditForm.tsx` : FormProvider + ImageFieldGroup ajoutés
- ✅ `PressReleaseNewForm.tsx` : FormProvider + ImageFieldGroup ajoutés
- ✅ `PressReleaseEditForm.tsx` : FormProvider + ImageFieldGroup ajoutés
- ✅ `lib/utils/press-utils.ts` : Utilitaires de nettoyage form data (cleanPressReleaseFormData, cleanArticleFormData)

### Schemas Zod
- ✅ `lib/schemas/press-release.ts` : `image_media_id` ajouté (bigint server / number UI)
- ✅ `lib/schemas/press-article.ts` : `image_url` + `og_image_media_id` ajoutés

### DAL
- ✅ `lib/dal/admin-press-releases.ts` : Champ `image_media_id` ajouté aux queries/mutations
- ✅ `lib/dal/admin-press-articles.ts` : Champs `image_url` + `og_image_media_id` ajoutés

### Security
- ✅ `communiques_presse_dashboard()` : SECURITY DEFINER + check explicite `is_admin()`
- ✅ Non-admins reçoivent `permission denied` au lieu d'un array vide
- ✅ 8/8 tests de sécurité passent (`pnpm test:views:auth:local`)

### Migrations
- ✅ `20260121231253_add_press_media_library_integration.sql`
- ✅ `20260122000000_fix_communiques_presse_dashboard_security.sql`

---

> **⚠️ NOTE IMPORTANTE (Jan 21, 2026)** : Les schemas actuels ont été corrigés pour transformer les empty strings en `null` dans les champs optionnels. Lors de l'implémentation de Media Library, **conserver ces transformations** pour éviter les erreurs de validation Zod. Voir corrections détaillées dans `plan-TASK024-pressManagement.prompt.md` section "Corrections Validation Zod".

---

## Analyse de l'existant

### Database Schema

**Articles (`articles_presse`)** :
- ✅ `og_image_media_id bigint references medias(id)` — Existe déjà (SEO metadata)
- ✅ Index FK existant : `idx_articles_presse_og_image_media_id`
- ❌ Pas de `image_url` pour fallback externe
- ❌ Pas exposé dans schemas/forms actuels

**Communiqués (`communiques_presse`)** :
- ✅ `image_url text` — URL externe uniquement
- ❌ Pas de `image_media_id` pour Media Library
- ❌ Pas d'index FK (colonne à créer)

### Forms actuels

**4 formulaires** utilisent `Input` basique pour images :
1. `PressReleaseNewForm.tsx` — `image_url` (URL externe)
2. `PressReleaseEditForm.tsx` — `image_url` (URL externe)
3. `ArticleNewForm.tsx` — Pas de champ image du tout
4. `ArticleEditForm.tsx` — Pas de champ image du tout

### Schemas Zod actuels (post-corrections Jan 21, 2026)

**PressRelease** (`lib/schemas/press-release.ts`) :
```typescript
// Server — AVEC transformations empty string → null
slug: z.string().max(255).optional().nullable().transform(val => val === "" ? null : val)
description: z.string().optional().nullable().transform(val => val === "" ? null : val)
image_url: z.string().url("URL invalide").optional().nullable().or(z.literal("")).transform(val => val === "" ? null : val)

// Form — ACCEPTE empty strings
image_url: z.string().url("URL invalide").optional().or(z.literal(""))
```

**Article** (`lib/schemas/press-article.ts`) :
```typescript
// Server — AVEC transformations empty string → null
slug: z.string().max(255).optional().nullable().transform(val => val === "" ? null : val)
author: z.string().max(100).optional().nullable().transform(val => val === "" ? null : val)
source_url: z.string().url("URL invalide").optional().nullable().or(z.literal("")).transform(val => val === "" ? null : val)

// Form — ACCEPTE empty strings
source_url: z.string().url("URL invalide").optional().or(z.literal(""))
```

---

## Architecture proposée

### 1. Database Schema Extension

#### Communiqués (1 nouvelle colonne)

```sql
-- supabase/schemas/17_presse.sql

-- Table communiques_presse : ajouter image_media_id
alter table public.communiques_presse
  add column if not exists image_media_id bigint
  references public.medias(id) on delete set null;
```

```sql
-- supabase/schemas/40_indexes.sql

-- Index pour performance JOIN sur image_media_id
create index if not exists idx_communiques_presse_image_media_id 
  on public.communiques_presse(image_media_id);
```

#### Articles (exposition colonne existante)

Aucune migration nécessaire — `og_image_media_id` existe déjà.

**Optionnel** : Ajouter `image_url` pour fallback externe :

```sql
-- supabase/schemas/08c_articles_presse.sql

alter table public.articles_presse
  add column if not exists image_url text;
```

---

### 2. Schemas Zod Updates

#### Press Release (`lib/schemas/press-release.ts`)

```typescript
// ============================================================
// SERVER SCHEMAS (avec bigint pour DAL/Database)
// ============================================================

export const PressReleaseInputSchema = z.object({
  // ... existing fields ...
  image_url: z.string().url("URL invalide").optional().nullable()
    .or(z.literal(""))
    .transform(val => val === "" ? null : val), // ✅ CONSERVER transformation
  image_media_id: z.coerce.bigint().optional().nullable(), // NOUVEAU
});

// ============================================================
// UI SCHEMAS (avec number pour JSON serialization)
// ============================================================

export const PressReleaseFormSchema = z.object({
  // ... existing fields ...
  image_url: z.string().url("URL invalide").optional().or(z.literal("")), // ✅ ACCEPTE empty string
  image_media_id: z.number().int().positive().optional().nullable(), // NOUVEAU
});

// ============================================================
// TYPES
// ============================================================

export type PressReleaseInput = z.infer<typeof PressReleaseInputSchema>;
export type PressReleaseFormValues = z.infer<typeof PressReleaseFormSchema>;

export interface PressReleaseDTO {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  date_publication: string;
  image_url: string | null;
  image_media_id: string | null; // NOUVEAU (bigint → string pour JSON)
  spectacle_id: string | null;
  evenement_id: string | null;
  public: boolean;
  ordre_affichage: number;
  file_size_bytes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
```

#### Press Article (`lib/schemas/press-article.ts`)

```typescript
// ============================================================
// SERVER SCHEMAS (avec bigint pour DAL/Database)
// ============================================================

export const ArticleInputSchema = z.object({
  // ... existing fields ...
  image_url: z.string().url("URL invalide").optional().nullable()
    .or(z.literal(""))
    .transform(val => val === "" ? null : val), // NOUVEAU — ✅ AVEC transformation
  og_image_media_id: z.coerce.bigint().optional().nullable(), // EXPOSÉ (existant DB)
});

// ============================================================
// UI SCHEMAS (avec number pour JSON serialization)
// ============================================================

export const ArticleFormSchema = z.object({
  // ... existing fields ...
  image_url: z.string().url("URL invalide").optional().or(z.literal("")), // NOUVEAU — ✅ ACCEPTE empty string
  og_image_media_id: z.number().int().positive().optional().nullable(), // EXPOSÉ
});

// ============================================================
// TYPES
// ============================================================

export type ArticleInput = z.infer<typeof ArticleInputSchema>;
export type ArticleFormValues = z.infer<typeof ArticleFormSchema>;

export interface ArticleDTO {
  id: string;
  title: string;
  author: string | null;
  type: ArticleType;
  slug: string;
  chapo: string | null;
  excerpt: string | null;
  source_publication: string | null;
  source_url: string | null;
  published_at: string | null;
  image_url: string | null; // NOUVEAU
  og_image_media_id: string | null; // NOUVEAU (bigint → string pour JSON)
  created_at: string;
  updated_at: string;
}
```

---

### 3. DAL Updates

#### Press Releases (`lib/dal/admin-press-releases.ts`)

```typescript
// Ajouter image_media_id au SELECT
export async function fetchAllPressReleasesAdmin(): Promise<DALResult<PressReleaseDTO[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("communiques_presse")
    .select(`
      id, title, slug, description, date_publication,
      image_url, image_media_id,  // AJOUT image_media_id
      spectacle_id, evenement_id, public, ordre_affichage,
      file_size_bytes, created_by, created_at, updated_at
    `)
    .order("ordre_affichage", { ascending: true })
    .order("date_publication", { ascending: false });

  if (error) {
    return { success: false, error: `[ERR_PRESS_RELEASE_001] ${error.message}` };
  }

  return {
    success: true,
    data: data.map((row) => ({
      ...row,
      id: String(row.id),
      image_media_id: row.image_media_id ? String(row.image_media_id) : null, // CONVERSION
      spectacle_id: row.spectacle_id ? String(row.spectacle_id) : null,
      evenement_id: row.evenement_id ? String(row.evenement_id) : null,
      file_size_bytes: row.file_size_bytes ? String(row.file_size_bytes) : null,
      created_by: row.created_by ?? null,
    })),
  };
}

// Gérer image_media_id dans create/update
export async function createPressRelease(
  input: PressReleaseInput
): Promise<DALResult<PressReleaseDTO>> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("communiques_presse")
    .insert({
      title: input.title,
      slug: input.slug,
      description: input.description,
      date_publication: input.date_publication,
      image_url: input.image_url,
      image_media_id: input.image_media_id, // AJOUT
      spectacle_id: input.spectacle_id,
      evenement_id: input.evenement_id,
      public: input.public ?? false,
      ordre_affichage: input.ordre_affichage ?? 0,
      created_by: (await supabase.auth.getUser()).data.user?.id,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: `[ERR_PRESS_RELEASE_002] ${error.message}` };
  }

  return {
    success: true,
    data: {
      ...data,
      id: String(data.id),
      image_media_id: data.image_media_id ? String(data.image_media_id) : null, // CONVERSION
      spectacle_id: data.spectacle_id ? String(data.spectacle_id) : null,
      evenement_id: data.evenement_id ? String(data.evenement_id) : null,
      file_size_bytes: data.file_size_bytes ? String(data.file_size_bytes) : null,
      created_by: data.created_by ?? null,
    },
  };
}

// Update avec gestion image_media_id
export async function updatePressRelease(
  id: bigint,
  input: Partial<PressReleaseInput>
): Promise<DALResult<PressReleaseDTO>> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("communiques_presse")
    .update({
      title: input.title,
      slug: input.slug,
      description: input.description,
      date_publication: input.date_publication,
      image_url: input.image_url,
      image_media_id: input.image_media_id, // GÉRÉ
      spectacle_id: input.spectacle_id,
      evenement_id: input.evenement_id,
      public: input.public,
      ordre_affichage: input.ordre_affichage,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { success: false, error: `[ERR_PRESS_RELEASE_003] ${error.message}` };
  }

  return {
    success: true,
    data: {
      ...data,
      id: String(data.id),
      image_media_id: data.image_media_id ? String(data.image_media_id) : null, // CONVERSION
      spectacle_id: data.spectacle_id ? String(data.spectacle_id) : null,
      evenement_id: data.evenement_id ? String(data.evenement_id) : null,
      file_size_bytes: data.file_size_bytes ? String(data.file_size_bytes) : null,
      created_by: data.created_by ?? null,
    },
  };
}
```

#### Press Articles (`lib/dal/admin-press-articles.ts`)

```typescript
// Ajouter og_image_media_id + image_url au SELECT
export async function fetchAllArticlesAdmin(): Promise<DALResult<ArticleDTO[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles_presse")
    .select(`
      id, title, author, type, slug, chapo, excerpt,
      source_publication, source_url, published_at,
      image_url, og_image_media_id,  // AJOUT
      created_at, updated_at
    `)
    .order("published_at", { ascending: false, nullsFirst: false });

  if (error) {
    return { success: false, error: `[ERR_ARTICLE_001] ${error.message}` };
  }

  return {
    success: true,
    data: data.map((row) => ({
      ...row,
      id: String(row.id),
      og_image_media_id: row.og_image_media_id ? String(row.og_image_media_id) : null, // CONVERSION
    })),
  };
}

// Gérer og_image_media_id + image_url dans create/update
export async function createArticle(
  input: ArticleInput
): Promise<DALResult<ArticleDTO>> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles_presse")
    .insert({
      title: input.title,
      author: input.author,
      type: input.type,
      slug: input.slug,
      chapo: input.chapo,
      excerpt: input.excerpt,
      source_publication: input.source_publication,
      source_url: input.source_url,
      published_at: input.published_at,
      image_url: input.image_url, // AJOUT
      og_image_media_id: input.og_image_media_id, // AJOUT
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: `[ERR_ARTICLE_002] ${error.message}` };
  }

  return {
    success: true,
    data: {
      ...data,
      id: String(data.id),
      og_image_media_id: data.og_image_media_id ? String(data.og_image_media_id) : null, // CONVERSION
    },
  };
}
```

---

## UX Patterns à Réutiliser (SpectacleForm.tsx)

### Pattern 1 : Validation d'Image Progressive

**Source** : `components/features/admin/spectacles/SpectacleForm.tsx` (lignes 73-76, 126-143)

```typescript
// État de validation tri-state
const [isImageValidated, setIsImageValidated] = useState<boolean | null>(
  defaultValues?.image_url ? true : null
);
// null = non testée, true = valide, false = invalide

// Validation avant soumission
async function onSubmit(data: FormValues) {
  // CRITICAL: Image URL validation (if provided, must be validated)
  if (data.image_url && data.image_url !== "") {
    if (isImageValidated !== true) {
      toast.error("Image non validée", {
        description: "Veuillez vérifier que l'URL de l'image est accessible.",
      });
      return;
    }
  }

  // CRITICAL: Public items require validated image
  if (data.public && (!data.image_url || data.image_url === "")) {
    toast.error("Image requise", {
      description: "Un élément visible publiquement doit avoir une image validée.",
    });
    return;
  }
  
  // ... suite du submit
}
```

**Application aux formulaires presse** :
- ✅ `PressReleaseNewForm` : Appliquer validation si `public = true`
- ✅ `PressReleaseEditForm` : Appliquer validation si `public = true`
- ⚠️ `ArticleNewForm` : Pas de champ `public`, validation optionnelle
- ⚠️ `ArticleEditForm` : Pas de champ `public`, validation optionnelle

**Bénéfices** :
- Prévient la publication d'éléments sans image
- Feedback immédiat sur la validité de l'URL
- Cohérence UX avec spectacles

---

### Pattern 2 : Warning Progressif (Public + Champs Manquants)

**Source** : `components/features/admin/spectacles/SpectacleForm.tsx` (lignes 101-125)

```typescript
const isPublic = form.watch("public");
const imageUrl = form.watch("image_url");
const [showPublicWarning, setShowPublicWarning] = useState(false);

// Show progressive validation warning when public=true
useEffect(() => {
  if (isPublic) {
    const requiredFieldMissing = 
      !imageUrl || 
      isImageValidated !== true ||
      // ... autres champs requis
      
    setShowPublicWarning(requiredFieldMissing);
  } else {
    setShowPublicWarning(false);
  }
}, [isPublic, imageUrl, isImageValidated, /* ... autres dépendances */]);

// Dans le JSX
{showPublicWarning && (
  <Alert variant="warning">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Publication incomplète</AlertTitle>
    <AlertDescription>
      Certains champs requis sont manquants pour la publication publique.
      L'élément sera sauvegardé mais non visible publiquement.
    </AlertDescription>
  </Alert>
)}
```

**Application aux formulaires presse** :

**PressRelease (a un champ `public`)** :
- ✅ Surveiller `public`, `title`, `description`, `date_publication`, `image_url/image_media_id`
- ✅ Afficher warning si `public=true` mais champs manquants
- ✅ Message : "Le communiqué sera sauvegardé mais non visible publiquement"

**Article (pas de champ `public`)** :
- ❌ Pattern non applicable (pas de publication publique)
- ✅ Possible : Warning si `image_url` + `og_image_media_id` vides (SEO)

**Bénéfices** :
- Guidance utilisateur en temps réel
- Évite frustration (sauvegarde réussit mais élément invisible)
- Transparence sur l'état de publication

---

### Pattern 3 : ImageFieldGroup avec Validation Callback

**Proposition** : Étendre `ImageFieldGroup` avec callback `onImageValidated`

```typescript
// Dans PressReleaseNewForm.tsx
const [isImageValidated, setIsImageValidated] = useState<boolean | null>(null);

<ImageFieldGroup
  form={form}
  imageUrlField="image_url"
  imageMediaIdField="image_media_id"
  label="Image du communiqué"
  showUpload={true}
  uploadFolder="presse"
  description="Image principale (recommandé : 1200x630px)"
  onImageValidated={(isValid) => setIsImageValidated(isValid)} // NOUVEAU
/>

// Puis utiliser isImageValidated dans onSubmit comme SpectacleForm
```

**Modifications nécessaires dans `ImageFieldGroup`** :
- Ajouter prop optionnelle : `onImageValidated?: (isValid: boolean | null) => void`
- Appeler callback après validation URL externe
- Appeler callback après upload réussi (toujours `true`)
- Appeler callback si URL vidée (`null`)

---

### Pattern 4 : Nettoyage de Données Avant Soumission

**Source** : `components/features/admin/spectacles/SpectacleForm.tsx` (ligne 157)

```typescript
async function onSubmit(data: FormValues) {
  // ... validations ...
  
  const cleanData = cleanSpectacleFormData(data) as CreateSpectacleInput;
  
  const result = spectacleId
    ? await updateSpectacleAction({ id: spectacleId, ...cleanData })
    : await createSpectacleAction(cleanData);
}
```

**Fonction `cleanSpectacleFormData`** (à créer similaire pour presse) :
```typescript
// lib/utils/press-release-form-utils.ts
export function cleanPressReleaseFormData(
  data: PressReleaseFormValues
): Omit<PressReleaseFormValues, "image_media_id"> & { image_media_id?: bigint } {
  return {
    ...data,
    // Convertir number → bigint pour Server Action
    image_media_id: data.image_media_id ? BigInt(data.image_media_id) : undefined,
    spectacle_id: data.spectacle_id ? BigInt(data.spectacle_id) : undefined,
    evenement_id: data.evenement_id ? BigInt(data.evenement_id) : undefined,
  };
}
```

**Application** :
- ✅ `PressReleaseNewForm` : Nettoyer avant `createPressReleaseAction`
- ✅ `PressReleaseEditForm` : Nettoyer avant `updatePressReleaseAction`
- ✅ `ArticleNewForm` : Nettoyer `og_image_media_id` (number → bigint)
- ✅ `ArticleEditForm` : Nettoyer `og_image_media_id` (number → bigint)

**Bénéfices** :
- Type safety entre form (number) et action (bigint)
- Centralisation logique de transformation
- Évite duplication code de conversion

---

### Pattern 5 : Success Message Contextualisé

**Source** : `components/features/admin/spectacles/SpectacleForm.tsx` (lignes 173-180)

```typescript
const successAction = isEditing ? "Spectacle mis à jour" : "Spectacle créé";
toast.success(
  successAction,
  getSpectacleSuccessMessage(isEditing, data.title)
);

// Fonction helper
function getSpectacleSuccessMessage(isEditing: boolean, title: string) {
  return {
    description: isEditing 
      ? `Les modifications de "${title}" ont été enregistrées.`
      : `"${title}" a été créé avec succès.`
  };
}
```

**Application aux formulaires presse** :

```typescript
// lib/utils/press-messages.ts
export function getPressReleaseSuccessMessage(isEditing: boolean, title: string) {
  return {
    description: isEditing
      ? `Les modifications du communiqué "${title}" ont été enregistrées.`
      : `Le communiqué "${title}" a été créé avec succès.`,
  };
}

export function getArticleSuccessMessage(isEditing: boolean, title: string) {
  return {
    description: isEditing
      ? `L'article "${title}" a été mis à jour.`
      : `L'article "${title}" a été créé avec succès.`,
  };
}
```

**Bénéfices** :
- Messages personnalisés avec titre de l'élément
- Cohérence UX (toast success similaire aux spectacles)
- Feedback clair à l'utilisateur

---

### Résumé : Patterns UX à Implémenter

| Pattern | PressRelease New/Edit | Article New/Edit | Priorité |
|---------|----------------------|------------------|----------|
| **1. Validation Image Progressive** | ✅ Si `public=true` | ⚠️ Optionnel | 🔴 Haute |
| **2. Warning Progressif** | ✅ Si `public=true` | ❌ N/A | 🟡 Moyenne |
| **3. ImageFieldGroup Callback** | ✅ Avec callback | ✅ Avec callback | 🔴 Haute |
| **4. Clean Form Data** | ✅ bigint conversion | ✅ bigint conversion | 🔴 Haute |
| **5. Success Message** | ✅ Contextualisé | ✅ Contextualisé | 🟢 Faible |

---

### 4. Forms Migration

#### Press Release Forms

**PressReleaseNewForm.tsx** :

```tsx
"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageFieldGroup } from "@/components/features/admin/media";
import { Alert, AlertCircle, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { PressReleaseFormSchema, type PressReleaseFormValues } from "@/lib/schemas/press-release";
import { createPressReleaseAction } from "@/app/(admin)/admin/presse/actions";
import { cleanPressReleaseFormData, getPressReleaseSuccessMessage } from "@/lib/utils/press-utils";

export function PressReleaseNewForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  
  // Pattern 1: Validation d'image progressive
  const [isImageValidated, setIsImageValidated] = useState<boolean | null>(null);
  
  const form = useForm<PressReleaseFormValues>({
    resolver: zodResolver(PressReleaseFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      date_publication: new Date().toISOString().split("T")[0],
      image_url: "",
      image_media_id: undefined, // NOUVEAU
      public: false,
      ordre_affichage: 0,
    },
  });

  // Pattern 2: Warning progressif
  const isPublic = form.watch("public");
  const imageUrl = form.watch("image_url");
  const imageMediaId = form.watch("image_media_id");
  const [showPublicWarning, setShowPublicWarning] = useState(false);

  useEffect(() => {
    if (isPublic) {
      const title = form.getValues("title");
      const description = form.getValues("description");
      const datePublication = form.getValues("date_publication");
      
      const hasImage = imageUrl || imageMediaId;
      const isIncomplete = 
        !title || 
        !description || 
        !datePublication ||
        !hasImage ||
        (imageUrl && isImageValidated !== true);

      setShowPublicWarning(isIncomplete);
    } else {
      setShowPublicWarning(false);
    }
  }, [
    isPublic, 
    imageUrl, 
    imageMediaId, 
    isImageValidated,
    form.watch("title"),
    form.watch("description"),
    form.watch("date_publication"),
  ]);

  const onSubmit = async (data: PressReleaseFormValues) => {
    // Pattern 1: Validation image critique
    if (data.image_url && data.image_url !== "") {
      if (isImageValidated !== true) {
        toast.error("Image non validée", {
          description: "Veuillez vérifier que l'URL de l'image est accessible.",
        });
        return;
      }
    }

    if (data.public && !data.image_url && !data.image_media_id) {
      toast.error("Image requise", {
        description: "Un communiqué visible publiquement doit avoir une image.",
      });
      return;
    }

    setIsPending(true);

    try {
      // Pattern 4: Nettoyage données
      const cleanData = cleanPressReleaseFormData(data);
      const result = await createPressReleaseAction(cleanData);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Pattern 5: Success message contextualisé
      toast.success("Communiqué créé", getPressReleaseSuccessMessage(false, data.title));
      
      form.reset();
      router.push("/admin/presse");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Pattern 2: Warning progressif */}
      {showPublicWarning && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Publication incomplète</AlertTitle>
          <AlertDescription>
            Certains champs requis sont manquants. Le communiqué sera sauvegardé 
            mais non visible publiquement.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ... champs title, slug, description, date_publication ... */}

          {/* Pattern 3: ImageFieldGroup avec callback validation */}
          <ImageFieldGroup
            form={form}
            imageUrlField="image_url"
            imageMediaIdField="image_media_id"
            label="Image du communiqué"
            showUpload={true}
            uploadFolder="presse"
            description="Image principale affichée dans le kit média (recommandé : 1200x630px)"
            onImageValidated={(isValid) => setIsImageValidated(isValid)}
          />
        </CardContent>
      </Card>

      {/* ... autres cards ... */}

      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Création..." : "Créer"}
        </Button>
      </div>
    </form>
  );
}
```

**PressReleaseEditForm.tsx** :

```tsx
"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageFieldGroup } from "@/components/features/admin/media";
import { Alert, AlertCircle, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { PressReleaseFormSchema, type PressReleaseFormValues, type PressReleaseDTO } from "@/lib/schemas/press-release";
import { updatePressReleaseAction } from "@/app/(admin)/admin/presse/actions";
import { cleanPressReleaseFormData, getPressReleaseSuccessMessage } from "@/lib/utils/press-utils";

interface PressReleaseEditFormProps {
  release: PressReleaseDTO;
}

export function PressReleaseEditForm({ release }: PressReleaseEditFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  
  // Pattern 1: Validation d'image progressive (pré-rempli si image existante)
  const [isImageValidated, setIsImageValidated] = useState<boolean | null>(
    release.image_url || release.image_media_id ? true : null
  );
  
  const form = useForm<PressReleaseFormValues>({
    resolver: zodResolver(PressReleaseFormSchema),
    defaultValues: {
      title: release.title,
      slug: release.slug ?? "",
      description: release.description ?? "",
      date_publication: release.date_publication.split("T")[0],
      image_url: release.image_url ?? "",
      // CONVERSION bigint string → number pour form
      image_media_id: release.image_media_id ? Number(release.image_media_id) : undefined,
      spectacle_id: release.spectacle_id ? Number(release.spectacle_id) : undefined,
      evenement_id: release.evenement_id ? Number(release.evenement_id) : undefined,
      public: release.public,
      ordre_affichage: release.ordre_affichage,
    },
  });

  // Pattern 2: Warning progressif
  const isPublic = form.watch("public");
  const imageUrl = form.watch("image_url");
  const imageMediaId = form.watch("image_media_id");
  const [showPublicWarning, setShowPublicWarning] = useState(false);

  useEffect(() => {
    if (isPublic) {
      const title = form.getValues("title");
      const description = form.getValues("description");
      const datePublication = form.getValues("date_publication");
      
      const hasImage = imageUrl || imageMediaId;
      const isIncomplete = 
        !title || 
        !description || 
        !datePublication ||
        !hasImage ||
        (imageUrl && isImageValidated !== true);

      setShowPublicWarning(isIncomplete);
    } else {
      setShowPublicWarning(false);
    }
  }, [
    isPublic, 
    imageUrl, 
    imageMediaId, 
    isImageValidated,
    form.watch("title"),
    form.watch("description"),
    form.watch("date_publication"),
  ]);

  const onSubmit = async (data: PressReleaseFormValues) => {
    // Pattern 1: Validation image critique
    if (data.image_url && data.image_url !== "") {
      if (isImageValidated !== true) {
        toast.error("Image non validée", {
          description: "Veuillez vérifier que l'URL de l'image est accessible.",
        });
        return;
      }
    }

    if (data.public && !data.image_url && !data.image_media_id) {
      toast.error("Image requise", {
        description: "Un communiqué visible publiquement doit avoir une image.",
      });
      return;
    }

    setIsPending(true);

    try {
      // Pattern 4: Nettoyage données
      const cleanData = cleanPressReleaseFormData(data);
      const result = await updatePressReleaseAction(String(release.id), cleanData);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Pattern 5: Success message contextualisé
      toast.success("Communiqué mis à jour", getPressReleaseSuccessMessage(true, data.title));
      
      router.push("/admin/presse");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Pattern 2: Warning progressif */}
      {showPublicWarning && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Publication incomplète</AlertTitle>
          <AlertDescription>
            Certains champs requis sont manquants. Le communiqué sera sauvegardé 
            mais non visible publiquement.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ... champs title, slug, description, date_publication ... */}

          {/* Pattern 3: ImageFieldGroup avec callback validation */}
          <ImageFieldGroup
            form={form}
            imageUrlField="image_url"
            imageMediaIdField="image_media_id"
            label="Image du communiqué"
            showUpload={true}
            uploadFolder="presse"
            description="Image principale affichée dans le kit média (recommandé : 1200x630px)"
            onImageValidated={(isValid) => setIsImageValidated(isValid)}
          />
        </CardContent>
      </Card>

      {/* ... autres cards ... */}

      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Mise à jour..." : "Mettre à jour"}
        </Button>
      </div>
    </form>
  );
}
```

---

#### Press Article Forms

**ArticleNewForm.tsx** :

```tsx
"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageFieldGroup } from "@/components/features/admin/media";
import { ArticleFormSchema, type ArticleFormValues } from "@/lib/schemas/press-article";
import { createArticleAction } from "@/app/(admin)/admin/presse/actions";
import { cleanArticleFormData, getArticleSuccessMessage } from "@/lib/utils/press-utils";

export function ArticleNewForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  
  // Pattern 1: Validation d'image (optionnelle pour articles)
  const [isImageValidated, setIsImageValidated] = useState<boolean | null>(null);
  
  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(ArticleFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      source_publication: "",
      author: "",
      published_at: new Date().toISOString().split("T")[0],
      source_url: "",
      type: "Article",
      chapo: "",
      excerpt: "",
      image_url: "", // NOUVEAU
      og_image_media_id: undefined, // NOUVEAU
    },
  });

  const onSubmit = async (data: ArticleFormValues) => {
    // Pattern 1: Validation image (si fournie, doit être valide)
    if (data.image_url && data.image_url !== "") {
      if (isImageValidated !== true) {
        toast.error("Image non validée", {
          description: "Veuillez vérifier que l'URL de l'image est accessible.",
        });
        return;
      }
    }

    setIsPending(true);

    try {
      // Pattern 4: Nettoyage données
      const cleanData = cleanArticleFormData(data);
      const result = await createArticleAction(cleanData);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Pattern 5: Success message contextualisé
      toast.success("Article créé", getArticleSuccessMessage(false, data.title));
      
      router.push("/admin/presse");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations de l'article</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ... champs title, slug, type, source_publication, author, published_at, source_url ... */}

          {/* Pattern 3: ImageFieldGroup avec callback validation */}
          <ImageFieldGroup
            form={form}
            imageUrlField="image_url"
            imageMediaIdField="og_image_media_id"
            label="Image de l'article"
            showUpload={true}
            uploadFolder="presse"
            description="Image principale pour SEO et partage social (recommandé : 1200x630px)"
            onImageValidated={(isValid) => setIsImageValidated(isValid)}
          />

          {/* ... champs chapo, excerpt ... */}
        </CardContent>
      </Card>

      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Création..." : "Créer"}
        </Button>
      </div>
    </form>
  );
}
```

**ArticleEditForm.tsx** :

```tsx
"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageFieldGroup } from "@/components/features/admin/media";
import { ArticleFormSchema, type ArticleFormValues, type ArticleDTO } from "@/lib/schemas/press-article";
import { updateArticleAction } from "@/app/(admin)/admin/presse/actions";
import { cleanArticleFormData, getArticleSuccessMessage } from "@/lib/utils/press-utils";

interface ArticleEditFormProps {
  article: ArticleDTO;
}

export function ArticleEditForm({ article }: ArticleEditFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  
  // Pattern 1: Validation d'image (pré-rempli si image existante)
  const [isImageValidated, setIsImageValidated] = useState<boolean | null>(
    article.image_url || article.og_image_media_id ? true : null
  );
  
  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(ArticleFormSchema),
    defaultValues: {
      title: article.title,
      slug: article.slug ?? "",
      source_publication: article.source_publication ?? "",
      author: article.author ?? "",
      published_at: article.published_at?.split("T")[0] ?? "",
      source_url: article.source_url ?? "",
      type: (article.type as ArticleFormValues["type"]) ?? undefined,
      chapo: article.chapo ?? "",
      excerpt: article.excerpt ?? "",
      image_url: article.image_url ?? "", // NOUVEAU
      og_image_media_id: article.og_image_media_id ? Number(article.og_image_media_id) : undefined, // NOUVEAU
    },
  });

  const onSubmit = async (data: ArticleFormValues) => {
    // Pattern 1: Validation image (si fournie, doit être valide)
    if (data.image_url && data.image_url !== "") {
      if (isImageValidated !== true) {
        toast.error("Image non validée", {
          description: "Veuillez vérifier que l'URL de l'image est accessible.",
        });
        return;
      }
    }

    setIsPending(true);

    try {
      // Pattern 4: Nettoyage données
      const cleanData = cleanArticleFormData(data);
      const result = await updateArticleAction(String(article.id), cleanData);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Pattern 5: Success message contextualisé
      toast.success("Article mis à jour", getArticleSuccessMessage(true, data.title));
      
      router.push("/admin/presse");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations de l'article</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ... champs title, slug, type, source_publication, author, published_at, source_url ... */}

          {/* Pattern 3: ImageFieldGroup avec callback validation */}
          <ImageFieldGroup
            form={form}
            imageUrlField="image_url"
            imageMediaIdField="og_image_media_id"
            label="Image de l'article"
            showUpload={true}
            uploadFolder="presse"
            description="Image principale pour SEO et partage social (recommandé : 1200x630px)"
            onImageValidated={(isValid) => setIsImageValidated(isValid)}
          />

          {/* ... champs chapo, excerpt ... */}
        </CardContent>
      </Card>

      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Mise à jour..." : "Mettre à jour"}
        </Button>
      </div>
    </form>
  );
}
```

---

### Résumé : Application des Patterns UX

Les 4 formulaires de presse réutilisent les patterns éprouvés de `SpectacleForm.tsx` :

| Formulaire | Pattern 1 | Pattern 2 | Pattern 3 | Pattern 4 | Pattern 5 |
|------------|-----------|-----------|-----------|-----------|-----------|
| **PressReleaseNewForm** | ✅ Critique si `public=true` | ✅ Warning progressif | ✅ Callback validation | ✅ Clean data | ✅ Message contextualisé |
| **PressReleaseEditForm** | ✅ Critique si `public=true` | ✅ Warning progressif | ✅ Callback validation | ✅ Clean data | ✅ Message contextualisé |
| **ArticleNewForm** | ✅ Optionnel (SEO) | ❌ N/A (pas de `public`) | ✅ Callback validation | ✅ Clean data | ✅ Message contextualisé |
| **ArticleEditForm** | ✅ Optionnel (SEO) | ❌ N/A (pas de `public`) | ✅ Callback validation | ✅ Clean data | ✅ Message contextualisé |

**Bénéfices de la réutilisation** :
- ✅ **Cohérence UX** — Expérience utilisateur identique entre spectacles et presse
- ✅ **Validation robuste** — Tri-state (`null`/`true`/`false`) + contrôles critiques
- ✅ **Feedback temps réel** — Warnings progressifs sur champs manquants
- ✅ **Type safety** — Utilitaires centralisés pour conversions bigint/number
- ✅ **Maintenance facilitée** — Patterns documentés et testés

---

---

### 5. Server Actions Updates

**`app/(admin)/admin/presse/actions.ts`** : Aucun changement nécessaire — les Server Actions valident déjà avec les schemas mis à jour et appellent le DAL.

---

## Folder Structure Media Library

### Utiliser dossier `presse` existant

**Configuration** (`media_folders` table) :

```sql
-- Vérifier que le dossier existe
select id, name, slug, description from public.media_folders where slug = 'presse';
-- Si absent, créer :
insert into public.media_folders (name, slug, description, position)
values ('Presse', 'presse', 'Communiqués, articles et kit média', 6);
```

**Usage dans forms** : `uploadFolder="presse"` pour les 4 formulaires.

**Organisation suggérée** (via tags) :
- Tag `communique` pour images de communiqués
- Tag `article` pour images d'articles
- Tag `kit-media` pour logos, photos officielles

---

## Migration Steps

### Phase 1 : Database Schema (CRITIQUE)

1. **Mettre à jour schema déclaratif** :
```bash
   # Éditer supabase/schemas/17_presse.sql
   # Ajouter colonne image_media_id + index
   
   # Optionnel : Éditer supabase/schemas/08c_articles_presse.sql
   # Ajouter colonne image_url
   ```

2. **Générer migration** :
```bash
   pnpm dlx supabase stop
   pnpm dlx supabase db diff -f add_press_image_media_id
   ```

3. **Vérifier migration générée** :
   - Vérifier `ALTER TABLE communiques_presse ADD COLUMN image_media_id`
   - Vérifier `CREATE INDEX idx_communiques_presse_image_media_id`
   - Optionnel : `ALTER TABLE articles_presse ADD COLUMN image_url`

4. **Appliquer migration** :
```bash
   pnpm dlx supabase start  # Local
   pnpm dlx supabase db push  # Production (après tests)
   ```

---

### Phase 2 : Schemas Zod (REQUIS)

1. **Mettre à jour `lib/schemas/press-release.ts`** :
   - Ajouter `image_media_id` dans `PressReleaseInputSchema` (bigint)
   - Ajouter `image_media_id` dans `PressReleaseFormSchema` (number)
   - Ajouter `image_media_id: string | null` dans `PressReleaseDTO`

2. **Mettre à jour `lib/schemas/press-article.ts`** :
   - Ajouter `image_url` dans `ArticleInputSchema`
   - Ajouter `og_image_media_id` dans `ArticleInputSchema` (bigint)
   - Ajouter les 2 champs dans `ArticleFormSchema` (number)
   - Ajouter les 2 champs dans `ArticleDTO`

---

### Phase 3 : DAL Updates (REQUIS)

1. **Mettre à jour `lib/dal/admin-press-releases.ts`** :
   - Ajouter `image_media_id` dans tous les SELECT queries
   - Ajouter conversion `String(row.image_media_id)` dans mapping DTO
   - Gérer `image_media_id` dans `createPressRelease()` et `updatePressRelease()`

2. **Mettre à jour `lib/dal/admin-press-articles.ts`** :
   - Ajouter `image_url, og_image_media_id` dans SELECT queries
   - Ajouter conversion `String(row.og_image_media_id)` dans mapping DTO
   - Gérer les 2 champs dans `createArticle()` et `updateArticle()`

---

### Phase 4 : Forms Migration (REQUIS)

1. **PressReleaseNewForm.tsx** :
   - Import `ImageFieldGroup` depuis `@/components/features/admin/media`
   - Remplacer `Input` pour `image_url` par `ImageFieldGroup`
   - Ajouter `defaultValues.image_media_id = undefined`
   - Props : `uploadFolder="presse"`, `imageMediaIdField="image_media_id"`

2. **PressReleaseEditForm.tsx** :
   - Même pattern
   - Mapper `image_media_id` depuis props (conversion `Number()`)

3. **ArticleNewForm.tsx** :
   - Ajouter `ImageFieldGroup` (n'existe pas actuellement)
   - `imageMediaIdField="og_image_media_id"`
   - `label="Image de l'article (Open Graph)"`

4. **ArticleEditForm.tsx** :
   - Même pattern
   - Mapper `og_image_media_id` depuis props

---

### Phase 5 : Testing & Validation (CRITIQUE)

1. **Tests créations** :
   - Créer communiqué avec upload via Media Library
   - Créer communiqué avec URL externe
   - Créer article avec upload
   - Créer article avec URL externe

2. **Tests éditions** :
   - Éditer communiqué : remplacer URL externe par upload
   - Éditer article : remplacer upload par URL externe
   - Vérifier preview images dans formulaires

3. **Tests suppression** :
   - Supprimer communiqué avec `image_media_id` : doit être `SET NULL` (pas CASCADE)
   - Vérifier que le media reste dans `medias` table

4. **Tests validation SSRF** :
   - Entrer URL externe invalide : doit rejeter (ex: `http://localhost:3000`)
   - Entrer URL externe valide : doit accepter (ex: `https://example.com/image.jpg`)
   - Vérifier que `validateImageUrl` (de TASK029) protège contre SSRF

5. **Tests affichage public** :
   - Page `/presse` : vérifier images communiqués affichées
   - Preview communiqué : vérifier image affichée

---

## Labels UI Sémantiques

### Communiqués (affichage principal)

```tsx
<ImageFieldGroup
  label="Image du communiqué"
  description="Image principale affichée dans le kit média (recommandé : 1200x630px)"
/>
```

### Articles (SEO Open Graph)

```tsx
<ImageFieldGroup
  label="Image de l'article (Open Graph)"
  description="Image pour partage social et SEO (recommandé : 1200x630px)"
/>
```

**Clarification** :
- `image_media_id` (communiqués) = Image affichée sur site + kit média
- `og_image_media_id` (articles) = Image SEO pour partage social (Twitter, Facebook, etc.)

---

## Questions de conception

### 1. Articles : `image_url` nécessaire ?

**Recommandation** : OUI

- **Fallback** : Si `og_image_media_id` est null, utiliser `image_url` pour URL externe
- **Flexibilité** : Permet d'utiliser images hébergées chez médias partenaires
- **Migration** : Facilite l'import d'articles existants avec URLs externes

### 2. Contacts presse : ajouter photos ?

**Recommandation** : PHASE 2 (optionnel)

- Pas dans spec TASK024 originale
- Utile pour annuaire presse interne
- Nécessiterait : `photo_url` + `photo_media_id` + migration

### 3. Alt text pour accessibilité ?

**Recommandation** : OPTIONNEL (TASK029 gère déjà)

- Table `medias` a colonne `metadata` (JSONB) pour alt text
- `ImageFieldGroup` peut afficher alt text si géré dans metadata
- Pas besoin de colonne séparée dans `communiques_presse`/`articles_presse`

---

## Checklist de migration

### Database
- [ ] Ajouter `image_media_id` à `communiques_presse` (schema déclaratif)
- [ ] Ajouter `image_url` à `articles_presse` (optionnel, schema déclaratif)
- [ ] Créer index `idx_communiques_presse_image_media_id`
- [ ] Générer migration via `db diff`
- [ ] Tester migration locale (`db reset`)
- [ ] Vérifier FK constraints (`ON DELETE SET NULL`)

### Schemas Zod
- [ ] `press-release.ts` : Ajouter `image_media_id` (Server + UI + DTO)
- [ ] `press-article.ts` : Ajouter `image_url` + exposer `og_image_media_id` (Server + UI + DTO)
- [ ] Tester compilation TypeScript (`pnpm tsc --noEmit`)

### DAL
- [ ] `admin-press-releases.ts` : SELECT avec `image_media_id`
- [ ] `admin-press-releases.ts` : Conversion bigint → string dans mapping
- [ ] `admin-press-releases.ts` : Gérer `image_media_id` dans create/update
- [ ] `admin-press-articles.ts` : SELECT avec `image_url, og_image_media_id`
- [ ] `admin-press-articles.ts` : Conversion bigint → string
- [ ] `admin-press-articles.ts` : Gérer les 2 champs dans create/update

### Utilitaires (NOUVEAU)
- [ ] Créer `lib/utils/press-utils.ts` avec :
  - [ ] `cleanPressReleaseFormData()` — Conversion number → bigint
  - [ ] `cleanArticleFormData()` — Conversion number → bigint
  - [ ] `getPressReleaseSuccessMessage()` — Messages contextualisés
  - [ ] `getArticleSuccessMessage()` — Messages contextualisés

### ImageFieldGroup Enhancement
- [ ] Ajouter prop optionnelle `onImageValidated?: (isValid: boolean | null) => void`
- [ ] Callback après validation URL externe (success/error)
- [ ] Callback après upload réussi (toujours `true`)
- [ ] Callback si URL vidée (`null`)

### Forms
- [ ] `PressReleaseNewForm.tsx` :
  - [ ] Remplacer Input par `ImageFieldGroup`
  - [ ] Ajouter état `isImageValidated`
  - [ ] Ajouter warning progressif (`showPublicWarning`)
  - [ ] Ajouter validation critique avant submit
  - [ ] Utiliser `cleanPressReleaseFormData()`
  - [ ] Utiliser `getPressReleaseSuccessMessage()`

- [ ] `PressReleaseEditForm.tsx` :
  - [ ] Remplacer Input par `ImageFieldGroup`
  - [ ] Ajouter état `isImageValidated` (pré-rempli si image existe)
  - [ ] Ajouter warning progressif (`showPublicWarning`)
  - [ ] Ajouter validation critique avant submit
  - [ ] Utiliser `cleanPressReleaseFormData()`
  - [ ] Utiliser `getPressReleaseSuccessMessage()`

- [ ] `ArticleNewForm.tsx` :
  - [ ] Ajouter `ImageFieldGroup` (nouveau champ)
  - [ ] Ajouter état `isImageValidated`
  - [ ] Ajouter validation image optionnelle avant submit
  - [ ] Utiliser `cleanArticleFormData()`
  - [ ] Utiliser `getArticleSuccessMessage()`

- [ ] `ArticleEditForm.tsx` :
  - [ ] Ajouter `ImageFieldGroup` (nouveau champ)
  - [ ] Ajouter état `isImageValidated` (pré-rempli si image existe)
  - [ ] Ajouter validation image optionnelle avant submit
  - [ ] Utiliser `cleanArticleFormData()`
  - [ ] Utiliser `getArticleSuccessMessage()`

### Tests
- [ ] Tester uploads via Media Library (4 formulaires)
- [ ] Tester URLs externes (4 formulaires)
- [ ] Tester preview images (4 formulaires)
- [ ] Tester validation image (communiqués public=true)
- [ ] Tester warning progressif (communiqués public=true avec champs manquants)
- [ ] Tester conversion bigint (create/update articles + communiqués)

### Documentation
- [ ] Mettre à jour `TASK024-press-management-summary.md`
- [ ] Mettre à jour `migrations.md`
- [ ] Ajouter entrée dans `memory-bank/tasks/TASK024-press-management.md`

---

## Rollback Plan

Si problèmes après déploiement :

1. **Rollback migration** :
   ```sql
   -- Supprimer colonne communiques_presse
   ALTER TABLE public.communiques_presse DROP COLUMN IF EXISTS image_media_id;
   
   -- Supprimer index
   DROP INDEX IF EXISTS idx_communiques_presse_image_media_id;
   
   -- Optionnel : Supprimer image_url articles
   ALTER TABLE public.articles_presse DROP COLUMN IF EXISTS image_url;
   ```

2. **Rollback code** :
   - Revert schemas Zod
   - Revert DAL SELECT queries
   - Revert forms vers `Input` simple

3. **Vérification** :
   - Site public fonctionne
   - Admin forms fonctionnent (sans Media Library)

---

## Estimation Effort

| Phase | Tâches | Effort | Complexité |
|-------|--------|--------|------------|
| **1. DB Schema** | 1 migration, 2 schemas modifiés | 30 min | Faible |
| **2. Schemas Zod** | 2 fichiers modifiés, ~40 lignes | 20 min | Faible |
| **3. DAL Updates** | 2 fichiers, ~80 lignes | 45 min | Moyenne |
| **4. Forms Migration** | 4 fichiers, ~60 lignes | 60 min | Moyenne |
| **5. Testing** | 10 scénarios tests | 45 min | Moyenne |
| **6. Documentation** | 3 fichiers docs | 20 min | Faible |
| **TOTAL** | 13 fichiers modifiés | **3h30** | **Moyenne** |

---

## Références

- **Guide ImageFieldGroup** : `.github/prompts/plan-imageFieldGroupComponent.prompt.md`
- **TASK024 Summary** : `doc/TASK024-press-management-summary.md`
- **TASK029 Media Library** : `.github/prompts/plan-TASK029-MediaLibrary/`
- **Database Types** : `lib/database.types.ts` (auto-generated)
- **Migrations Log** : `supabase/migrations/migrations.md`
