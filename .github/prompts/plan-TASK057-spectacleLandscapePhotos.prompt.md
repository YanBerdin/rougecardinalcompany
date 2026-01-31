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
**Exemple**: `20260131140000_add_landscape_photos_to_spectacles.sql`

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

**Vue publique** (`supabase/schemas/20_views.sql`):
```sql
CREATE OR REPLACE VIEW public.spectacles_landscape_photos_public AS
SELECT 
  sm.spectacle_id,
  sm.media_id,
  sm.ordre,
  m.url,
  m.alt_text
FROM public.spectacles_medias sm
INNER JOIN public.media m ON sm.media_id = m.id
INNER JOIN public.spectacles s ON sm.spectacle_id = s.id
WHERE sm.type = 'landscape'
  AND s.public = true
ORDER BY sm.ordre ASC;
```

**Vue admin** (`supabase/schemas/25_views_admin.sql`):
```sql
CREATE OR REPLACE VIEW public.spectacles_landscape_photos_admin AS
SELECT 
  sm.spectacle_id,
  sm.media_id,
  sm.ordre,
  sm.type,
  m.url,
  m.alt_text,
  m.created_at
FROM public.spectacles_medias sm
INNER JOIN public.media m ON sm.media_id = m.id
WHERE sm.type = 'landscape'
ORDER BY sm.spectacle_id, sm.ordre ASC;
```

**RLS Policies** (explicites):

```sql
-- Policy 1: Public read for landscape photos of public spectacles
create policy "Anyone can view landscape photos of public spectacles"
on spectacles_medias
for select
to anon, authenticated
using (
  type = 'landscape'
  and exists (
    select 1 from spectacles s
    where s.id = spectacles_medias.spectacle_id
    and s.public = true
  )
);

-- Policy 2: Admin insert landscape photos
create policy "Admins can insert landscape photos"
on spectacles_medias
for insert
to authenticated
using ( (select public.is_admin()) )
with check (
  (select public.is_admin())
  and type = 'landscape'
  and ordre in (0, 1)
);

-- Policy 3: Admin update landscape photos
create policy "Admins can update landscape photos"
on spectacles_medias
for update
to authenticated
using (
  (select public.is_admin())
  and type = 'landscape'
)
with check (
  (select public.is_admin())
  and type = 'landscape'
  and ordre in (0, 1)
);

-- Policy 4: Admin delete landscape photos
create policy "Admins can delete landscape photos"
on spectacles_medias
for delete
to authenticated
using (
  (select public.is_admin())
  and type = 'landscape'
);
```

**GRANT Statements** (vues SECURITY INVOKER nécessitent accès tables base):

```sql
-- Grant read access aux tables utilisées par les vues
grant select on spectacles_medias to anon, authenticated;
grant select on media to anon, authenticated;
grant select on spectacles to anon, authenticated;
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

export async function swapPhotoOrder(
  spectacleId: number
): Promise<DALResult<SpectaclePhotoDTO[]>> {
  // Admin only, swap 0↔1 via UPDATE avec CASE
}
```

**Pattern DAL SOLID** (aligné sur `spectacles.ts`):
- ✅ **READ**: `cache()` wrapper, return `Promise<T[]>` ou `Promise<T | null>`, graceful `[]`/`null` on error
- ✅ **MUTATIONS**: `requireAdmin()`, return `DALResult<T>` avec status codes
- ✅ Single Responsibility: 1 fichier = gestion photos spectacles uniquement
- ✅ Dependency Inversion: NO `revalidatePath()`, NO email, uniquement Supabase + auth
- ✅ Functions < 30 lignes, helpers @internal si nécessaire
- ✅ Imports autorisés UNIQUEMENT: `server-only`, `@/supabase/*`, `@/lib/auth/*`, `zod`
- ❌ Imports INTERDITS: `next/cache`, `@/lib/email/*`, `@/lib/sms/*`

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
// DTO (retourné par DAL)
export const SpectaclePhotoDTO = z.object({
  spectacle_id: z.coerce.bigint(),
  media_id: z.coerce.bigint(),
  ordre: z.number().int().min(0).max(1),
  url: z.string().url(),
  alt_text: z.string().nullable(),
});
export type SpectaclePhotoDTO = z.infer<typeof SpectaclePhotoDTO>;

// Server Input (bigint pour DB)
export const AddPhotoInputSchema = z.object({
  spectacle_id: z.coerce.bigint(),
  media_id: z.coerce.bigint(),
  ordre: z.number().int().min(0).max(1),
  type: z.literal('landscape'),
});
export type AddPhotoInput = z.infer<typeof AddPhotoInputSchema>;

// UI Form Values (number pour formulaires)
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

export async function swapPhotosAction(spectacleId: string): Promise<ActionResult> {
  try {
    const result = await swapPhotoOrder(BigInt(spectacleId));
    
    if (!result.success) {
      return { success: false, error: result.error, status: result.status };
    }
    
    revalidatePath('/admin/spectacles');
    revalidatePath(`/spectacles/[slug]`, 'page');
    
    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
      status: 500,
    };
  }
}
```

### 5. Implémenter SpectaclePhotoManager (Admin)

**Fichier**: `components/features/admin/spectacles/SpectaclePhotoManager.tsx`

**Structure**:
- Client Component (`"use client"`)
- Props: `spectacleId: number`, `initialPhotos?: SpectaclePhotoDTO[]`
- État: `photos`, `isPending`, `selectedSlot` (0 ou 1)
- UI: 2 slots côte-à-côte (grid 2 colonnes), chaque slot:
  - Preview image si présente (aspect 16:9, max-h-40)
  - Bouton "Choisir" → ouvre `MediaLibraryPicker`
  - Bouton "Upload" → ouvre `MediaUploadDialog`
  - Bouton "Supprimer" si photo présente
- Bouton global "Inverser l'ordre ⇄" si 2 photos présentes
- Toast notifications pour feedback utilisateur
- `useEffect` pour sync `photos` avec `initialPhotos` (pattern CRUD standard)

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
function LandscapePhotoCard({ photo }: { photo: SpectaclePhotoDTO }) {
  return (
    <div className="relative aspect-[16/9] rounded-lg overflow-hidden shadow-lg my-6 group">
      <Image
        src={photo.url}
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
- ✅ Bouton swap simple (pas de drag-and-drop complexe)
- ✅ Disabled state pendant `isPending`

### Fallback
- ✅ Graceful si `landscapePhotos` undefined/empty (pas d'affichage)
- ✅ Pas de crash si erreur DAL (return `[]` par défaut)
- ✅ Alt text fallback: `"Photo du spectacle"`

## Migration & Rollback

**Migration forward**:
```sql
-- Ajouter colonnes
ALTER TABLE spectacles_medias ADD COLUMN type text DEFAULT 'gallery';
ALTER TABLE spectacles_medias DROP CONSTRAINT spectacles_medias_pkey;
ALTER TABLE spectacles_medias ADD PRIMARY KEY (spectacle_id, media_id, type);
ALTER TABLE spectacles_medias ADD CONSTRAINT check_landscape_ordre CHECK (...);
```

**Rollback**:
```sql
-- Supprimer colonnes
ALTER TABLE spectacles_medias DROP CONSTRAINT check_landscape_ordre;
ALTER TABLE spectacles_medias DROP COLUMN type;
-- Restaurer ancienne PK...
```

## Tests suggérés

- [ ] Admin peut ajouter 2 photos landscape max
- [ ] Admin ne peut pas ajouter 3ème photo (constraint violation)
- [ ] Bouton swap inverse correctement ordre 0↔1
- [ ] Photos s'affichent correctement sur page publique
- [ ] Suppression photo fonctionne + revalidate
- [ ] Fallback graceful si aucune photo
- [ ] Performance: fetch parallèle < 500ms
- [ ] RLS: anon ne peut pas modifier `spectacles_medias`

## Documentation post-déploiement

### `supabase/README.md`

Ajouter dans "Mises à jour récentes (janvier 2026)":

```markdown
- **FEAT: Photos Paysage Spectacles (31 jan. 2026)** : Système de gestion de 2 photos paysage par spectacle.
  - **Migration** : `20260131140000_add_landscape_photos_to_spectacles.sql`
  - **Modifications** :
    - Ajout colonne `type` dans `spectacles_medias` (valeurs: 'poster', 'landscape', 'gallery')
    - Modification contrainte UNIQUE: `(spectacle_id, type, ordre)` au lieu de `(spectacle_id, media_id)`
    - CHECK constraints: type IN ('poster', 'landscape', 'gallery'), ordre landscape IN (0, 1)
    - Index: `idx_spectacles_medias_type_ordre` sur `(spectacle_id, type, ordre)`
    - Vues publique + admin pour photos landscape
    - 4 RLS policies + GRANT statements
  - **DAL** : Nouveau module `lib/dal/spectacle-photos.ts` (READ avec cache, MUTATIONS avec DALResult)
  - **Admin UI** : Composant `SpectaclePhotoManager` avec double choix (bibliothèque + upload) + swap
  - **Public UI** : Photos intégrées dans synopsis (`SpectacleDetailView`)
  - **Validation** : Tests locaux + cloud, TypeScript 0 erreurs
```

### `supabase/migrations/migrations.md`

Ajouter nouvelle entrée:

```markdown
| 2026-01-31 14:00:00 | add_landscape_photos_to_spectacles | Système photos paysage spectacles (colonne type, constraints, vues, RLS) | ✅ Applied | Cloud + Local | Workflow declarative schema |
```

### `memory-bank/tasks/TASK057-spectacle-landscape-photos.md`

mettre à jour l'état de progression dans la section "Implementation Steps" au fur et à mesure de l'avancement des étapes.

### `.github/prompts/plan-TASK057-spectacleLandscapePhotos.prompt.md`
mettre à jour l'état de progression de ce plan détaillé en fonction des modifications apportées au code une fois l'implémentation accomplie.

## Résumé technique

**Database**: Contraintes doubles (`CHECK` + `UNIQUE`) pour garantie stricte max 2 photos  
**Migration**: Workflow declarative schema (stop → diff → start → push --linked), format `YYYYMMDDHHmmss_*.sql`  
**Déploiement Cloud**: `pnpm dlx supabase db push --linked` après validation locale  
**Documentation**: Mise à jour `supabase/README.md` + `supabase/migrations/migrations.md` post-déploiement  
**RLS**: 4 policies séparées (select/insert/update/delete) + GRANT sur tables base  
**Admin UX**: Double choix (bibliothèque + upload) + bouton swap simple  
**Performance**: `loading="lazy"` pour photos below-fold, fetch séquentiel optimisé, React cache, index DB  
**Fallback**: Graceful degradation si `landscape_photos` vide ou erreur DAL  
**Security**: `requireAdmin()` dans DAL, RLS policies explicites, validation Zod stricte, try/catch Server Actions  
**DAL SOLID**: Imports restreints (NO `next/cache`, NO email), helpers @internal si > 30 lignes
