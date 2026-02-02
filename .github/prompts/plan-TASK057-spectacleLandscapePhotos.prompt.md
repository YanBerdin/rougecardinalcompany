# Plan: Ajout de 2 photos paysage intégrées au synopsis

Implémenter la gestion et l'affichage de 2 photos format paysage par spectacle, intégrées comme encarts dans le texte du synopsis, en utilisant la table de jonction `spectacles_medias` existante. L'affiche actuelle (`image_url`) reste inchangée.

## Contexte architectural

**Table existante**: `spectacles_medias` (jonction avec `ordre smallint`, primary key composite `(spectacle_id, media_id)`)  
**Pattern existant**: Similaire à `communiques_medias` (ordre -1 pour PDF principal, 0+ pour images)  
**Page spectacle**: `app/(marketing)/spectacles/[slug]/page.tsx` (Server Component) → `SpectacleDetailView` (Client Component)  
**Pas de Container intermédiaire**: Fetch direct dans la page, contrairement au pattern `SpectaclesContainer`

## Étapes d'implémentation

### 0. Workflow migration (OBLIGATOIRE)

**CRITIQUE**: Respecter le workflow Declarative Schema

```bash
# 1. Modifier le fichier schema
# Éditer: supabase/schemas/11_tables_relations.sql

# 2. ARRÊTER la DB locale (OBLIGATOIRE avant diff)
pnpm dlx supabase stop

# 3. Générer migration via diff
pnpm dlx supabase db diff -f add_landscape_photos_to_spectacles

# 4. Vérifier migration générée
cat supabase/migrations/*_add_landscape_photos_to_spectacles.sql

# 5. Démarrer DB et tester localement
pnpm dlx supabase start

# 6. Appliquer migration sur DB cloud (production)
pnpm dlx supabase db push --linked

# 7. Mettre à jour documentation
# Éditer: supabase/README.md (section "Mises à jour récentes")
# Éditer: supabase/migrations/migrations.md (nouvelle entrée)
```

**Format migration**: `YYYYMMDDHHmmss_add_landscape_photos_to_spectacles.sql`  
**Exemple**: `20260201140000_add_landscape_photos_to_spectacles.sql`

**Documentation requise**:
- `supabase/README.md`: Ajouter entrée dans "Mises à jour récentes (janvier 2026)" avec date, migration, changements clés
- `supabase/migrations/migrations.md`: Nouvelle ligne avec timestamp, description, statut, notes

### 1. Migration base de données

**Fichier source**: `supabase/schemas/11_tables_relations.sql` (modifier ici)  
**Fichier généré**: `supabase/migrations/YYYYMMDDHHmmss_add_landscape_photos_to_spectacles.sql` (via diff)

**Modifications**:
- Ajouter colonne `type` (text default `'gallery'`) dans `spectacles_medias` 
- Modifier constraint UNIQUE: `(spectacle_id, type, ordre)` au lieu de `(spectacle_id, media_id)` pour permettre plusieurs photos mais contrôler par type+ordre
- Ajouter `CHECK (type IN ('poster', 'landscape', 'gallery'))`
- Ajouter `CHECK (CASE WHEN type = 'landscape' THEN ordre IN (0, 1) ELSE true END)` pour limiter landscape à 2 photos
- Créer index `CREATE INDEX idx_spectacles_medias_type_ordre ON spectacles_medias(spectacle_id, type, ordre)`

**Vue publique** (`supabase/schemas/41_views_spectacle_photos.sql`):
```sql
-- Vue publique pour photos paysage des spectacles publics
-- SECURITY INVOKER: nécessite GRANT sur tables de base
CREATE OR REPLACE VIEW public.spectacles_landscape_photos_public AS
SELECT 
  sm.spectacle_id,
  sm.media_id,
  sm.ordre,
  m.storage_path,
  m.alt_text
FROM public.spectacles_medias sm
INNER JOIN public.medias m ON sm.media_id = m.id
INNER JOIN public.spectacles s ON sm.spectacle_id = s.id
WHERE sm.type = 'landscape'
  AND s.public = true
ORDER BY sm.spectacle_id, sm.ordre ASC;

COMMENT ON VIEW public.spectacles_landscape_photos_public IS 
  'Photos paysage des spectacles publics (max 2 par spectacle, ordonnées)';
```

**Vue admin** (`supabase/schemas/41_views_spectacle_photos.sql`):
```sql
-- Vue admin pour gestion photos paysage (toutes, avec métadonnées)
-- SECURITY INVOKER: accès limité par RLS sur tables de base
CREATE OR REPLACE VIEW public.spectacles_landscape_photos_admin AS
SELECT 
  sm.spectacle_id,
  sm.media_id,
  sm.ordre,
  sm.type,
  m.storage_path,
  m.alt_text,
  m.mime,
  m.created_at
FROM public.spectacles_medias sm
INNER JOIN public.medias m ON sm.media_id = m.id
WHERE sm.type = 'landscape'
ORDER BY sm.spectacle_id, sm.ordre ASC;

COMMENT ON VIEW public.spectacles_landscape_photos_admin IS 
  'Vue admin pour gestion photos paysage spectacles (inclut métadonnées media)';
```

**RLS Policies** (NOTE: Les policies génériques existantes dans `11_tables_relations.sql` couvrent déjà insert/update/delete pour admin. Seule une policy SELECT spécifique pour type='landscape' des spectacles publics peut être utile si on veut restreindre l'accès):

```sql
-- NOTE: Les policies admin existantes dans 11_tables_relations.sql
-- couvrent déjà les opérations CRUD pour spectacles_medias.
-- Pas besoin de créer de nouvelles policies spécifiques au type 'landscape'.
-- 
-- Policies existantes (ne pas dupliquer) :
-- - "Spectacle media relations are viewable by everyone" (SELECT anon, authenticated)
-- - "Admins can insert spectacle media relations" (INSERT authenticated is_admin)
-- - "Admins can update spectacle media relations" (UPDATE authenticated is_admin)  
-- - "Admins can delete spectacle media relations" (DELETE authenticated is_admin)
--
-- Les CHECK constraints sur la table garantissent les règles métier
-- (type IN ('poster','landscape','gallery'), ordre 0-1 pour landscape).
```

**GRANT Statements** (vues SECURITY INVOKER nécessitent accès tables base):

```sql
-- Grant read access aux tables utilisées par les vues
-- NOTE: Ces GRANT existent probablement déjà dans d'autres fichiers schema.
-- Vérifier avant d'ajouter pour éviter les doublons.
grant select on public.spectacles_medias to anon, authenticated;
grant select on public.medias to anon, authenticated;
grant select on public.spectacles to anon, authenticated;
```

### 2. Créer le DAL photos spectacles

**Fichier**: `lib/dal/spectacle-photos.ts`

**Exports**:

**READ Operations** (wrapped avec `cache()`, return direct):
```typescript
export const fetchSpectacleLandscapePhotos = cache(
  async (spectacleId: number): Promise<SpectaclePhotoDTO[]> => {
    // Public access, ORDER BY ordre ASC
    // Return [] on error (pattern: fetchAllSpectacles)
  }
);

export const fetchSpectacleLandscapePhotosAdmin = cache(
  async (spectacleId: number): Promise<SpectaclePhotoDTO[]> => {
    // Admin access with metadata (requireAdmin)
    // Return [] on error
  }
);
```

**MUTATIONS** (return `DALResult<T>`):
```typescript
export async function addSpectaclePhoto(
  spectacleId: number,
  mediaId: number,
  ordre: number
): Promise<DALResult<SpectaclePhotoDTO>> {
  // Admin only (requireAdmin)
  // Return { success: boolean, data?, error?, status? }
}

export async function deleteSpectaclePhoto(
  spectacleId: number,
  mediaId: number
): Promise<DALResult<null>> {
  // Admin only (requireAdmin)
}

// ❌ SUPPRIMÉ: swapPhotoOrder - Incompatible avec CHECK constraint ordre IN (0, 1)
// La fonction swap nécessitait une valeur temporaire (-1) impossible avec cette contrainte
```

**Pattern DAL SOLID** (aligné sur `spectacles.ts`):
- ✅ **READ**: `cache()` de "react" (PAS de next/cache), return `Promise<T[]>` ou `Promise<T | null>`, graceful `[]`/`null` on error
- ✅ **MUTATIONS**: `requireAdmin()`, return `DALResult<T>` avec status codes
- ✅ Single Responsibility: 1 fichier = gestion photos spectacles uniquement
- ✅ Dependency Inversion: NO `revalidatePath()`, NO email, uniquement Supabase + auth
- ✅ Functions < 30 lignes, helpers @internal si nécessaire
- ✅ Imports autorisés UNIQUEMENT: `server-only`, `cache` de `"react"`, `@/supabase/*`, `@/lib/auth/*`, `zod`, `@/lib/dal/helpers`
- ❌ Imports INTERDITS: `next/cache` (revalidatePath/revalidateTag), `@/lib/email/*`, `@/lib/sms/*`

**Helpers recommandés** (si fonctions > 30 lignes):
```typescript
// @internal helpers
async function validatePhotoConstraints(
  spectacleId: number,
  ordre: number
): Promise<boolean> {
  // Vérifier qu'il n'y a pas déjà 2 photos landscape
}

async function performPhotoInsert(
  supabase: SupabaseClient,
  input: AddPhotoInput
): Promise<DALResult<SpectaclePhotoDTO>> {
  // Logique insert isolée
}
```

### 3. Étendre schémas Zod spectacles

**Fichier**: `lib/schemas/spectacles.ts`

**Ajouts**:
```typescript
// DTO Schema (retourné par DAL)
export const SpectaclePhotoDTOSchema = z.object({
  spectacle_id: z.coerce.bigint(),
  media_id: z.coerce.bigint(),
  ordre: z.number().int().min(0).max(1),
  storage_path: z.string(), // Chemin relatif dans le bucket
  alt_text: z.string().nullable(),
});
export type SpectaclePhotoDTO = z.infer<typeof SpectaclePhotoDTOSchema>;

// Server Input Schema (bigint pour DB)
export const AddPhotoInputSchema = z.object({
  spectacle_id: z.coerce.bigint(),
  media_id: z.coerce.bigint(),
  ordre: z.number().int().min(0).max(1),
  type: z.literal('landscape'),
});
export type AddPhotoInput = z.infer<typeof AddPhotoInputSchema>;

// UI Form Schema (number pour formulaires)
export const PhotoFormSchema = z.object({
  media_id: z.number().int().positive(),
  ordre: z.number().int().min(0).max(1),
});
export type PhotoFormValues = z.infer<typeof PhotoFormSchema>;
```

**Note**: PAS besoin d'étendre `SpectacleDb` — les photos seront passées comme prop séparée au composant

### 4. Implémenter Server Actions photos

**Fichier**: `app/(admin)/admin/spectacles/actions.ts` (ajouter aux actions existantes)

**Actions** (avec try/catch OBLIGATOIRE):
```typescript
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  addSpectaclePhoto,
  deleteSpectaclePhoto,
  swapPhotoOrder,
} from "@/lib/dal/spectacle-photos";
import { AddPhotoInputSchema } from "@/lib/schemas/spectacles";
import type { ActionResult } from "@/lib/actions/types";

export async function addPhotoAction(input: unknown): Promise<ActionResult> {
  try {
    const validated = AddPhotoInputSchema.parse(input);
    const result = await addSpectaclePhoto(
      validated.spectacle_id,
      validated.media_id,
      validated.ordre
    );
    
    if (!result.success) {
      return { success: false, error: result.error, status: result.status };
    }
    
    revalidatePath('/admin/spectacles'); // ✅ UNIQUEMENT ICI
    revalidatePath(`/spectacles/[slug]`, 'page');
    
    return { success: true, data: result.data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation échouée",
        status: 422,
        details: error.issues,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
      status: 500,
    };
  }
}

export async function deletePhotoAction(
  spectacleId: string,
  mediaId: string
): Promise<ActionResult> {
  try {
    const result = await deleteSpectaclePhoto(BigInt(spectacleId), BigInt(mediaId));
    
    if (!result.success) {
      return { success: false, error: result.error, status: result.status };
    }
    
    revalidatePath('/admin/spectacles');
    revalidatePath(`/spectacles/[slug]`, 'page');
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
      status: 500,
    };
  }
}

// ❌ SUPPRIMÉ: swapPhotosAction - Incompatible avec CHECK constraint ordre IN (0, 1)
// Migration 20260202004924_drop_swap_spectacle_photo_order.sql appliquée
```

### 4.5. API Route pour fetch admin photos (BigInt → string conversion)

**Fichier**: `app/api/spectacles/[id]/photos/route.ts`

**Pattern**: GET endpoint pour éviter la sérialisation BigInt dans Server Components

**Raison d'être**:
- Server Actions ne peuvent pas retourner `bigint` (erreur "Cannot serialize BigInt")
- SpectaclePhotoManager est un Client Component qui doit fetch les photos
- API Route convertit `bigint` → `string` pour JSON serialization

**Structure**:
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Fetch via DAL (retourne bigint)
    const photos = await fetchSpectacleLandscapePhotosAdmin(Number(id));
    
    // Convertir bigint → string pour JSON
    const serialized = photos.map(photo => ({
      ...photo,
      spectacle_id: photo.spectacle_id.toString(),
      media_id: photo.media_id.toString(),
    }));
    
    return NextResponse.json({ data: serialized });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

**Conversion Types**:
```typescript
// Type retourné par API (string IDs)
export type SerializedSpectaclePhoto = Omit<SpectaclePhotoDTO, 'spectacle_id' | 'media_id'> & {
  spectacle_id: string;
  media_id: string;
};
```

### 5. Implémenter SpectaclePhotoManager (Admin)

**Fichier**: `components/features/admin/spectacles/SpectaclePhotoManager.tsx`

**Pattern**: Client Component avec **client-side fetch via API Route** (évite BigInt serialization)

**Structure**:
- Client Component (`"use client"`)
- Props: `spectacleId: number`
- État: `photos: SerializedSpectaclePhoto[]`, `isPending`, `isLoading`, `selectedSlot` (0 ou 1)
- **Fetch initial**: `useEffect` avec `fetch('/api/spectacles/${spectacleId}/photos')`
- UI: 2 slots côte-à-côte (grid 2 colonnes), chaque slot:
  - Preview image si présente (aspect 16:9, max-h-40)
  - Bouton "Choisir" → ouvre `MediaLibraryPicker`
  - Bouton "Upload" → ouvre `MediaUploadDialog`
  - Bouton "Supprimer" si photo présente
- ❌ PAS de bouton swap (supprimé - incompatible avec CHECK constraint)
- Toast notifications pour feedback utilisateur
- **Refresh**: Appel API après add/delete pour re-fetch état actuel

**Pattern BigInt**:
```typescript
'use client';

import { useEffect, useState } from 'react';
import type { SerializedSpectaclePhoto } from '@/app/api/spectacles/[id]/photos/route';

interface Props {
  spectacleId: number;
}

export function SpectaclePhotoManager({ spectacleId }: Props) {
  const [photos, setPhotos] = useState<SerializedSpectaclePhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Client-side fetch via API Route (évite BigInt serialization)
  useEffect(() => {
    async function loadPhotos() {
      const res = await fetch(`/api/spectacles/${spectacleId}/photos`);
      const { data } = await res.json();
      setPhotos(data);
      setIsLoading(false);
    }
    loadPhotos();
  }, [spectacleId]);
  
  // ... reste de la logique
}
```

### 6. Intégrer dans SpectacleForm

**Fichier**: `components/features/admin/spectacles/SpectacleForm.tsx`

**Position**: Après `<ImageFieldGroup>` (ligne ~470), avant checkbox `public`

**Code**:
```tsx
{/* Photos paysage (2 max) */}
{spectacleId ? (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <Label>Photos du spectacle (2 maximum)</Label>
      <Badge variant="secondary">Optionnel</Badge>
    </div>
    <SpectaclePhotoManager spectacleId={spectacleId} />
  </div>
) : (
  <Alert variant="default">
    <AlertDescription>
      Enregistrez d'abord ce spectacle pour ajouter des photos paysage.
    </AlertDescription>
  </Alert>
)}
```

### 7. Fetcher photos dans page spectacle

**Fichier**: `app/(marketing)/spectacles/[slug]/page.tsx`

**Modifications**:
```typescript
export default async function SpectacleDetailPage({ params }: SpectacleDetailPageProps) {
  const { slug } = await params;
  
  // Fetch spectacle first (need ID for photos)
  const spectacle = await fetchSpectacleBySlug(slug);
  if (!spectacle) notFound();

  // Then fetch photos (parallel not possible since we need spectacle.id)
  const landscapePhotos = await fetchSpectacleLandscapePhotos(spectacle.id);

  return <SpectacleDetailView spectacle={spectacle} landscapePhotos={landscapePhotos} />;
}
```

**Justification**: Pattern align on `spectacles.ts` where `fetchSpectacleLandscapePhotos` returns `Promise<SpectaclePhotoDTO[]>` (empty array on error), not `DALResult<T>`. Sequential fetch is required since we need `spectacle.id` from first query.

### 8. Intégrer photos dans SpectacleDetailView

**Fichier**: `components/features/public-site/spectacles/SpectacleDetailView.tsx`

**Modifications**:

1. **Interface props**:
```typescript
interface SpectacleDetailViewProps {
  spectacle: SpectacleDb;
  landscapePhotos?: SpectaclePhotoDTO[]; // ✅ Ajout
}
```

2. **Composant inline `LandscapePhotoCard`** (avant return):
```typescript
import { env } from "@/lib/env";

// Helper pour construire l'URL publique depuis storage_path
// Note: La fonction getPublicUrl existe dans lib/dal/media.ts mais est interne.
// On utilise la construction directe d'URL Supabase ici (pattern léger côté client).
function getMediaPublicUrl(storagePath: string): string {
  return `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/medias/${storagePath}`;
}

function LandscapePhotoCard({ photo }: { photo: SpectaclePhotoDTO }) {
  const imageUrl = getMediaPublicUrl(photo.storage_path);
  
  return (
    <div className="relative aspect-[16/9] rounded-lg overflow-hidden shadow-lg my-6 group">
      <Image
        src={imageUrl}
        alt={photo.alt_text || "Photo du spectacle"}
        fill
        loading="lazy"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 768px) 90vw, 40vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
```

**Alternative** : Créer `lib/utils/media-url.ts` (fonction utilitaire exportée réutilisable) :
```typescript
import { env } from "@/lib/env";

/**
 * Construit l'URL publique d'un média depuis son storage_path
 * @param storagePath - Chemin relatif dans le bucket (ex: "spectacles/photo.jpg")
 * @returns URL publique complète
 * @example getMediaPublicUrl("team/123-photo.jpg") 
 *   // => "https://xxx.supabase.co/storage/v1/object/public/medias/team/123-photo.jpg"
 */
export function getMediaPublicUrl(storagePath: string): string {
  return `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/medias/${storagePath}`;
}
```

3. **Insertion Photo 1** (ligne ~127, après `short_description`):
```tsx
{spectacle.short_description && (
  <p className="text-xl md:text-2xl italic leading-relaxed opacity-90 animate-fade-in max-w-3xl mx-auto"
     style={{ animationDelay: "0.2s" }}>
    {spectacle.short_description}
  </p>
)}

{/* Photo 1 - après short_description */}
{landscapePhotos && landscapePhotos[0] && (
  <LandscapePhotoCard photo={landscapePhotos[0]} />
)}

<div className="prose prose-lg max-w-none text-foreground/90 leading-relaxed">
  {/* ... description ... */}
</div>
```

4. **Insertion Photo 2** (ligne ~136, après `description`, avant CTA):
```tsx
<div className="prose prose-lg max-w-none text-foreground/90 leading-relaxed">
  <p className="text-lg whitespace-pre-line first-letter:text-7xl ...">
    {spectacle.description || spectacle.short_description}
  </p>
</div>

{/* Photo 2 - après description */}
{landscapePhotos && landscapePhotos[1] && (
  <LandscapePhotoCard photo={landscapePhotos[1]} />
)}

{/* Call to Actions */}
<div className="flex flex-col gap-4 pt-6">
  {/* ... CTA buttons ... */}
</div>
```

## Points d'attention

### Performance
- ✅ `loading="lazy"` pour les 2 photos (below-fold probable)
- ✅ Fetch séquentiel optimisé (besoin de `spectacle.id` avant fetch photos)
- ✅ React `cache()` sur `fetchSpectacleLandscapePhotos` (DAL) pour deduplication
- ✅ Index DB sur `(spectacle_id, type, ordre)` pour query rapide
- ✅ Vue publique pré-filtrée (pas de filtrage côté app)

### Sécurité
- ✅ `requireAdmin()` dans toutes les fonctions admin du DAL
- ✅ RLS sur `spectacles_medias` (policies existantes)
- ✅ Validation Zod stricte (ordre 0-1, type='landscape')
- ✅ CHECK constraints DB pour double protection

### UX Admin
- ✅ Toast notifications (succès/erreur)
- ✅ Preview images avec alt text affiché
- ✅ Double choix (bibliothèque + upload direct)
- ❌ Pas de swap (supprimé - incompatible avec CHECK constraint ordre IN (0, 1))
- ✅ Disabled state pendant `isPending`

### Fallback
- ✅ Graceful si `landscapePhotos` undefined/empty (pas d'affichage)
- ✅ Pas de crash si erreur DAL (return `[]` par défaut)
- ✅ Alt text fallback: `"Photo du spectacle"`

## Migration & Rollback

**Migration forward** (ordre important pour éviter erreurs sur données existantes):
```sql
-- 1. Ajouter colonne type avec default (safe pour données existantes)
ALTER TABLE public.spectacles_medias 
  ADD COLUMN IF NOT EXISTS type text DEFAULT 'gallery';

-- 2. Mettre à jour les lignes existantes pour avoir type NOT NULL
UPDATE public.spectacles_medias SET type = 'gallery' WHERE type IS NULL;

-- 3. Ajouter contrainte NOT NULL après update
ALTER TABLE public.spectacles_medias 
  ALTER COLUMN type SET NOT NULL;

-- 4. Ajouter CHECK constraint pour types valides
ALTER TABLE public.spectacles_medias
  ADD CONSTRAINT check_spectacles_medias_type 
  CHECK (type IN ('poster', 'landscape', 'gallery'));

-- 5. Ajouter CHECK constraint pour ordre landscape (0 ou 1 max)
ALTER TABLE public.spectacles_medias
  ADD CONSTRAINT check_landscape_ordre 
  CHECK (CASE WHEN type = 'landscape' THEN ordre IN (0, 1) ELSE true END);

-- 6. Ajouter contrainte UNIQUE pour éviter doublons type+ordre par spectacle
ALTER TABLE public.spectacles_medias
  ADD CONSTRAINT unique_spectacle_type_ordre 
  UNIQUE (spectacle_id, type, ordre);

-- 7. Créer index pour performance
CREATE INDEX IF NOT EXISTS idx_spectacles_medias_type_ordre 
  ON public.spectacles_medias(spectacle_id, type, ordre);

-- 8. Commentaire table
COMMENT ON COLUMN public.spectacles_medias.type IS 
  'Type de media: poster (affiche), landscape (photos synopsis), gallery (autres)';
```

**Rollback** (en cas de problème):
```sql
-- Supprimer dans l'ordre inverse
DROP INDEX IF EXISTS idx_spectacles_medias_type_ordre;
ALTER TABLE public.spectacles_medias DROP CONSTRAINT IF EXISTS unique_spectacle_type_ordre;
ALTER TABLE public.spectacles_medias DROP CONSTRAINT IF EXISTS check_landscape_ordre;
ALTER TABLE public.spectacles_medias DROP CONSTRAINT IF EXISTS check_spectacles_medias_type;
ALTER TABLE public.spectacles_medias DROP COLUMN IF EXISTS type;
-- Note: Les données existantes restent intactes, PK originale préservée
```

## Tests suggérés

- [ ] Admin peut ajouter 2 photos landscape max
- [ ] Admin ne peut pas ajouter 3ème photo (constraint violation)
- ❌ ~~Bouton swap inverse correctement ordre 0↔1~~ (fonctionnalité supprimée)
- [ ] Photos s'affichent correctement sur page publique
- [ ] Suppression photo fonctionne + revalidate
- [ ] Fallback graceful si aucune photo
- [ ] Performance: fetch séquentiel < 500ms (pas parallèle - besoin spectacle.id)
- [ ] RLS: anon ne peut pas modifier `spectacles_medias`

## Documentation post-déploiement

### `supabase/README.md`

Ajouter dans "Mises à jour récentes (février 2026)":

```markdown
- **FEAT: Photos Paysage Spectacles - TASK057 (1-2 fév. 2026)** : Système de gestion de 2 photos paysage par spectacle.
  - **Migrations** (appliquées via MCP Supabase):
    - `20260201093000_fix_entity_type_whitelist.sql` — Whitelist 'spectacle_photo' dans entity_type_enum
    - `20260201135511_add_landscape_photos_to_spectacles.sql` — Colonne type, constraints, vues
    - `20260202004924_drop_swap_spectacle_photo_order.sql` — Suppression fonction swap
    - `20260202010000_fix_views_security_invoker.sql` — Fix SECURITY DEFINER → SECURITY INVOKER
  - **Modifications** :
    - Ajout colonne `type` dans `spectacles_medias` (valeurs: 'poster', 'landscape', 'gallery')
    - Modification contrainte UNIQUE: `(spectacle_id, type, ordre)` au lieu de `(spectacle_id, media_id)`
    - CHECK constraints: type IN ('poster', 'landscape', 'gallery'), ordre landscape IN (0, 1)
    - Index: `idx_spectacles_medias_type_ordre` sur `(spectacle_id, type, ordre)`
    - Vues publique + admin pour photos landscape (fichier `41_views_spectacle_photos.sql`)
    - Policies RLS existantes suffisantes (pas de nouvelles policies)
  - **Code Changes**:
    - DAL: `lib/dal/spectacle-photos.ts` (READ avec cache, MUTATIONS avec DALResult)
    - Schemas: `SpectaclePhotoDTO`, `AddPhotoInputSchema` (number, pas bigint)
    - Server Actions: add/delete photos dans `spectacles/actions.ts` (swap supprimé)
    - **API Route**: `/api/spectacles/[id]/photos` (bigint→string conversion pour JSON)
    - Admin: `SpectaclePhotoManager` avec **client-side fetch via API**
    - Public: `LandscapePhotoCard` dans `SpectacleDetailView`
    - Utils: `lib/utils/media-url.ts` (getMediaPublicUrl helper)
  - **BigInt Serialization Fix** (TASK055 pattern):
    - `AddPhotoInputSchema` utilise `z.number()` au lieu de `z.coerce.bigint()`
    - Server Action convertit en BigInt APRÈS validation Zod
    - DAL reçoit bigint directement, pas de re-validation
    - API Route convertit bigint→string pour éviter erreur "Cannot serialize BigInt"
  - **Admin UI**: `SpectaclePhotoManager` fetch client-side via API + MediaLibraryPicker
  - **Public UI**: Photos intégrées dans synopsis (`SpectacleDetailView`)
  - **Validation**: TypeScript 0 erreurs, tests manuels OK, cloud déployé via MCP
```

### `supabase/migrations/migrations.md`

Ajouter nouvelles entrées:

```markdown
| 2026-02-01 09:30:00 | fix_entity_type_whitelist | Ajout 'spectacle_photo' dans whitelist entity_type | ✅ Applied | Cloud + Local | Declarative schema |
| 2026-02-01 13:55:11 | add_landscape_photos_to_spectacles | Système photos paysage spectacles (colonne type, constraints, vues) | ✅ Applied | Cloud + Local | Declarative schema |
| 2026-02-02 00:49:24 | drop_swap_spectacle_photo_order | Suppression fonction swap (incompatible CHECK constraint) | ✅ Applied | Cloud + Local | Refactor |
| 2026-02-02 01:00:00 | fix_views_security_invoker | Fix 4 vues SECURITY DEFINER → SECURITY INVOKER (RLS bypass) | ✅ Applied | Cloud + Local | Security Fix |
```

### `supabase/schemas/README.md`

### `memory-bank/tasks/TASK057-spectacle-landscape-photos.md`

mettre à jour l'état de progression dans la section "Implementation Steps" au fur et à mesure de l'avancement des étapes.

### `.github/prompts/plan-TASK057-spectacleLandscapePhotos.prompt.md`
mettre à jour l'état de progression de ce plan détaillé en fonction des modifications apportées au code une fois l'implémentation accomplie.

### mettre à jour l'état de progression dans :

- _index.md
- _preview_backoffice_tasks.md
- supabase/README.md

## Problèmes rencontrés et solutions

### 1. Erreur "Cannot serialize BigInt" (2 fév. 2026)

**Problème**: Server Actions retournaient des objets avec `bigint`, non sérialisables en JSON.

**Tentatives de fix**:
- Tentative 1: Conversion `.map()` des IDs → Échoue (duplicate key violation)
- Tentative 2: Refactor `swapPhotoOrder` SQL avec valeur temporaire → Échoue (CHECK constraint violation)
- Tentative 3: Modification CHECK constraint → Jugé trop risqué

**Solution finale**: 
- ❌ Suppression complète de la fonctionnalité swap
- ✅ Application du pattern TASK055 BigInt sur add/delete actions:
  - Validation Zod avec `z.number().int().positive()` (UI)
  - Conversion `BigInt()` APRÈS validation (Server)
  - Pas de sérialisation BigInt dans retours Server Actions

**Migrations**:
- `20260202004924_drop_swap_spectacle_photo_order.sql` (suppression fonction SQL)

**Code supprimé**:
- `swapPhotoOrder()` dans DAL
- `swapPhotosAction()` dans Server Actions
- Bouton "Inverser" dans SpectaclePhotoManager UI

---

### 2. Vues SECURITY DEFINER → RLS Bypass (2 fév. 2026)

**Problème**: Migration `20260202004924_drop_swap_spectacle_photo_order.sql` a recréé 4 vues **SANS** la clause `security_invoker = true`, permettant de contourner les RLS policies.

**Cause**: Bug migra (outil de diff Supabase) - ne préserve pas `with (security_invoker = true)` lors de recréation vues.

**Détection**: Supabase Advisors (4 ERROR advisories).

**Solution**:
- Migration `20260202010000_fix_views_security_invoker.sql`
- Ajout explicite `with (security_invoker = true)` aux 4 vues:
  - `articles_presse_public`
  - `communiques_presse_public`
  - `spectacles_landscape_photos_public`
  - `spectacles_landscape_photos_admin`

**Validation**:
- ✅ Supabase Advisors: 4 ERROR → 0 ERROR
- ✅ Tests RLS: 6/6 tests passent (`scripts/test-views-security-invoker.ts`)
- ✅ Schémas déclaratifs déjà corrects (pas de modification nécessaire)

**Leçon**: Toujours inspecter migrations générées par `supabase db diff` pour vérifier préservation clauses critiques.

---

## Résumé technique

**Database**: Contraintes doubles (`CHECK` + `UNIQUE`) pour garantie stricte max 2 photos  
**Migration**: Workflow declarative schema (stop → diff → start → push --linked), format `YYYYMMDDHHmmss_*.sql`  
**Migrations réelles**: 4 migrations appliquées via MCP (fix_entity_type_whitelist, add_landscape_photos, drop_swap, fix_views_security_invoker)  
**Déploiement Cloud**: Migrations appliquées via MCP Supabase (`db push --linked`)  
**Documentation**: `supabase/README.md` + `migrations/migrations.md` + `TASK057-spectacle-landscape-photos.md` + `_index.md` + `_preview_backoffice_tasks.md`  
**RLS**: Policies existantes dans `11_tables_relations.sql` suffisantes (pas de nouvelles policies nécessaires)  
**Vues**: Nouveau fichier `41_views_spectacle_photos.sql` avec vues public + admin + SECURITY INVOKER enforced  
**API Route**: `/api/spectacles/[id]/photos` pour conversion bigint→string (évite serialization error)  
**Admin UX**: SpectaclePhotoManager avec **client-side fetch via API** + MediaLibraryPicker - ❌ swap supprimé  
**Performance**: `loading="lazy"` pour photos below-fold, fetch séquentiel optimisé, React cache, index DB  
**Fallback**: Graceful degradation si `landscape_photos` vide ou erreur DAL  
**Security**: `requireAdmin()` dans DAL, CHECK constraints DB, validation Zod stricte, try/catch Server Actions, SECURITY INVOKER vues  
**BigInt Pattern**: TASK055 appliqué (validation `z.number()`, conversion `BigInt()` après, API Route serialize bigint→string)  
**DAL SOLID**: Imports restreints (`cache` de "react" autorisé, NO `next/cache`), helpers @internal si > 30 lignes  
**URL Media**: `getMediaPublicUrl(storage_path)` via `lib/utils/media-url.ts` (pas de colonne `url` dans table `medias`)
