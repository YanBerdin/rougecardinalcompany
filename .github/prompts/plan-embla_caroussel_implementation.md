# Embla Carousel Implementation - Spectacles Gallery

**Date:** 2026-02-20 (v2) — **Audit implémentation :** 2026-02 (v3)
**Status:** ✅ IMPLÉMENTÉ — Audit de conformité réalisé post-implémentation
**Database Table:** `spectacles_medias` (existante, colonne `type` = `'gallery'`)

---

## 📋 Résumé

Ajout d'un carousel Embla pour afficher les images de type `gallery` associées à chaque spectacle via la table de jonction `spectacles_medias`. Le carousel s'insère comme une **nouvelle section** dans le composant existant `SpectacleDetailView` (379 lignes), sans remplacer la structure actuelle (info bar, affiche, synopsis, photos paysage, awards, CTAs).

---

## ⚠️ Divergences corrigées (v1 → v2)

| # | Problème dans le plan v1 | Correction v2 |
| --- | --- | --- |
| 1 | Colonne `type` ignorée dans le schéma SQL | Ajout du filtre `type = 'gallery'` à toutes les requêtes |
| 2 | Types TS générés obsolètes (manque `type`) | Pré-requis : `supabase gen types typescript` avant implémentation |
| 3 | Modification de `fetchSpectacleBySlug` | Création d'une fonction séparée `fetchSpectacleGalleryPhotos()` (pattern existant landscape) |
| 4 | Remplacement complet de `SpectacleDetailView` | Le carousel est une **section ajoutée**, pas un remplacement |
| 5 | Helper `buildMediaUrl` utilise `process.env` | Utiliser T3 Env (`env.NEXT_PUBLIC_SUPABASE_URL`) — cohérent avec le pattern inline existant |
| 6 | Pas de vue SQL pour gallery | Création de `spectacles_gallery_photos_public` (miroir du pattern landscape) |
| 7 | Pas d'admin pour images gallery | Phase 5 : extension `SpectaclePhotoManager` ou composant dédié |
| 8 | Pas de schéma Zod pour gallery photos | Nouveaux schémas `GalleryPhotoDTOSchema` + `AddGalleryPhotoInputSchema` |
| 9 | Keyboard handler global (`window`) | Scope au conteneur carousel uniquement (évite conflits avec d'autres composants) |

---

## 🗂️ Database Schema (Existant — AUCUNE migration de table)

### Table: `spectacles_medias` (complète)

**Fichier:** `supabase/schemas/11_tables_relations.sql`

```sql
-- ✅ TABLE EXISTANTE — 3 types: poster, landscape, gallery
create table public.spectacles_medias (
  spectacle_id bigint not null references public.spectacles(id) on delete cascade,
  media_id     bigint not null references public.medias(id) on delete cascade,
  ordre        smallint default 0,
  type         text not null default 'gallery',
  primary key (spectacle_id, media_id),
  unique (spectacle_id, type, ordre),
  check (type in ('poster', 'landscape', 'gallery')),
  check (case when type = 'landscape' then ordre in (0, 1) else true end)
);
```

**Points clés :**

- La colonne `type` détermine l'usage : `poster` (affiche), `landscape` (max 2, intercalées dans le texte), `gallery` (carousel illimité)
- La contrainte `unique (spectacle_id, type, ordre)` empêche les doublons d'ordre par type
- La contrainte `check` limite landscape à 2 slots (0, 1) mais laisse gallery libre
- RLS déjà configurée (SELECT public, INSERT/UPDATE/DELETE admin)

### ⚠️ Pré-requis : Régénérer les types TypeScript

Les types dans `lib/database.types.ts` **ne contiennent pas la colonne `type`**. Avant toute implémentation :

```bash
pnpm dlx supabase gen types typescript --linked > lib/database.types.ts
```

---

## � Divergences réalité vs plan (v3 — post-implémentation)

Audit réalisé après implémentation complète. Voici les écarts entre le plan v2 et le code effectivement livré :

| # | Section | Plan v2 | Réalité implémentée |
| --- | --- | --- | --- |
| D1 | Phase 2.4 | `addSpectacleGalleryPhoto(spectacleId: bigint, mediaId: bigint, ordre: number)` | **`(spectacleId: number, mediaId: number, ordre: number)`** — Supabase client accepte `number` directement |
| D2 | Phase 2.4 | `deleteSpectacleGalleryPhoto(spectacleId: bigint, mediaId: bigint)` | **`(spectacleId: string, mediaId: string)`** — conversion interne via `Number()` (cohérent avec landscape `deleteSpectaclePhoto`) |
| D3 | Phase 3.1 | Counter X/Y prévu | **Non implémenté** — jugé superflu dans l'UI finale |
| D4 | Phase 3.1 | Largeur slide non spécifiée | **`flex-[0_0_72%]`** — réglage fin UX post-test |
| D5 | Phase 3.1 | Scale tween non prévu | **Scale tween Embla ajouté** (`TWEEN_FACTOR_BASE = 0.28`) — effet profondeur sur slides latéraux |
| D6 | Phase 3.2 | `<h2>Galerie</h2>` affiché | **Heading commenté** : `{/* <h2>Galerie</h2> */}` — décision design, la section se fond dans la page |
| D7 | Architecture | "Fichiers modifiés (5)" | **6 fichiers modifiés** — `actions.ts` manquait dans le décompte |
| D8 | Slot SQL | Slot 42 réservé à `42_views_spectacle_gallery.sql` | **Conflit de nommage** : `42_rpc_audit_logs.sql` et `42_views_spectacle_gallery.sql` coexistent tous les deux au slot 42 dans le repo (migration appliquée, conflit cosmétique sans impact runtime) |

---

## �📦 Phase 0 : Pré-requis

### 0.1 Régénérer les types TypeScript

```bash
pnpm dlx supabase gen types typescript --linked > lib/database.types.ts
```

Vérifier que `spectacles_medias.Row` contient bien `type: string`.

### 0.2 Installer Embla Carousel

```bash
pnpm add embla-carousel-react embla-carousel-autoplay
```

**Dépendances :**

- `embla-carousel-react@^8.5.1`
- `embla-carousel-autoplay@^8.5.1`

**Temps estimé :** 10 minutes

---

## 🗄️ Phase 1 : Vue SQL pour gallery photos publiques

### 1.1 Créer la vue déclarative

**Fichier:** `supabase/schemas/42_views_spectacle_gallery.sql` (nouveau)

```sql
-- Vues pour les photos gallery des spectacles
-- Ordre: 42 - Dépend des tables spectacles, medias, spectacles_medias

-- ===== VUE PUBLIQUE =====

drop view if exists public.spectacles_gallery_photos_public cascade;
create or replace view public.spectacles_gallery_photos_public
with (security_invoker=on) as
select
  sm.spectacle_id,
  sm.media_id,
  sm.ordre,
  m.storage_path,
  m.alt_text
from public.spectacles_medias sm
inner join public.medias m on sm.media_id = m.id
inner join public.spectacles s on sm.spectacle_id = s.id
where sm.type = 'gallery'
  and s.public = true
order by sm.spectacle_id, sm.ordre asc;

comment on view public.spectacles_gallery_photos_public is
  'Photos galerie des spectacles publics (type gallery, ordonnées par ordre croissant)';

-- ===== VUE ADMIN =====

drop view if exists public.spectacles_gallery_photos_admin cascade;
create or replace view public.spectacles_gallery_photos_admin
with (security_invoker=on) as
select
  sm.spectacle_id,
  sm.media_id,
  sm.ordre,
  sm.type,
  m.storage_path,
  m.alt_text,
  m.mime,
  m.created_at
from public.spectacles_medias sm
inner join public.medias m on sm.media_id = m.id
where sm.type = 'gallery'
order by sm.spectacle_id, sm.ordre asc;

comment on view public.spectacles_gallery_photos_admin is
  'Vue admin pour gestion photos galerie spectacles (inclut métadonnées media)';

-- ===== GRANTS =====
-- Les GRANT sur spectacles_medias, medias et spectacles existent déjà (41_views)
```

### 1.2 Générer la migration

```bash
pnpm dlx supabase stop
pnpm dlx supabase db diff -f add_gallery_photos_views
pnpm dlx supabase start
```

**Temps estimé :** 20 minutes

---

## 🔧 Phase 2 : DAL & Schémas

### 2.1 Helper media URL centralisé

**Fichier:** `lib/dal/helpers/media-url.ts` (nouveau)

- Fonction synchrone `buildMediaPublicUrl(storagePath: string | null): string | null`
- Utilise `env.NEXT_PUBLIC_SUPABASE_URL` (T3 Env) — pas `process.env` directement
- Nettoie les leading slashes
- Exporter depuis `lib/dal/helpers/index.ts`

**Refactoring optionnel (scope séparé) :** Remplacer les 5 implémentations inline dupliquées :

- `components/features/public-site/spectacles/SpectacleDetailView.tsx` L32
- `components/features/admin/spectacles/SpectaclePhotoManager.tsx` L43
- `lib/dal/media.ts` L331 (version async, garder comme alternative)
- `lib/dal/home-partners.ts` L21 (utilise `process.env` direct — non conforme T3 Env)
- `lib/dal/admin-partners.ts` L16 (idem)

### 2.2 Schémas Zod pour gallery photos

**Fichier:** `lib/schemas/spectacles.ts` (étendre, à la suite des schémas landscape existants)

```typescript
// SPECTACLE GALLERY PHOTOS SCHEMAS
// =============================================================================

/**
 * DTO Schema for gallery photos (returned by DAL via view)
 */
export const GalleryPhotoDTOSchema = z.object({
  spectacle_id: z.coerce.bigint(),
  media_id: z.coerce.bigint(),
  ordre: z.number().int().min(0),  // pas de max contrairement à landscape
  storage_path: z.string(),
  alt_text: z.string().nullable(),
});

export type GalleryPhotoDTO = z.infer<typeof GalleryPhotoDTOSchema>;

/**
 * Transport Schema for Client Components (bigint→string)
 */
export interface GalleryPhotoTransport {
  spectacle_id: string;
  media_id: string;
  ordre: number;
  storage_path: string;
  alt_text: string | null;
}

/**
 * UI Input Schema for gallery photo actions
 */
export const AddGalleryPhotoInputSchema = z.object({
  spectacle_id: z.number().int().positive(),
  media_id: z.number().int().positive(),
  ordre: z.number().int().min(0),
  type: z.literal("gallery"),
});

export type AddGalleryPhotoInput = z.infer<typeof AddGalleryPhotoInputSchema>;
```

### 2.3 Fonction DAL dédiée

**Fichier:** `lib/dal/spectacle-photos.ts` (étendre — ajouter des fonctions gallery)

Créer une nouvelle fonction `fetchSpectacleGalleryPhotos(spectacleId: bigint)` qui :

- Requête la vue `spectacles_gallery_photos_public`
- Valide avec `GalleryPhotoDTOSchema.safeParse()`
- Retourne `GalleryPhotoDTO[]` (array vide si erreur — graceful degradation)
- Wrappée avec `cache()` pour déduplication intra-request

**Pattern identique** à `fetchSpectacleLandscapePhotos` existante (L35-60 du même fichier).

**NE PAS modifier `fetchSpectacleBySlug`** — le pattern du projet est de faire des appels parallèles séparés dans la page Server Component.

### 2.4 Fonctions DAL admin (CRUD gallery)

**Fichier:** `lib/dal/spectacle-photos.ts` (étendre)

- `fetchSpectacleGalleryPhotosAdmin(spectacleId: bigint)` — vue admin
- `addSpectacleGalleryPhoto(spectacleId: number, mediaId: number, ordre: number)` — insert `type: 'gallery'` ⚠️ **Implémenté avec `number` (pas `bigint`) — Supabase client l'accepte directement (voir D1)**
- `deleteSpectacleGalleryPhoto(spectacleId: string, mediaId: string)` — delete avec filtre `type: 'gallery'`, conversion `Number()` interne ⚠️ **Implémenté avec `string` (voir D2)**
- `reorderSpectacleGalleryPhotos(spectacleId: bigint, orderedMediaIds: bigint[])` — réordonnancement ✅ Conforme

**Temps estimé :** 1 heure

---

## 🎨 Phase 3 : Composant Carousel (Client Component)

### 3.1 `SpectacleCarousel.tsx`

**Fichier:** `components/features/public-site/spectacles/SpectacleCarousel.tsx` (nouveau)

**Props :**

```typescript
interface SpectacleCarouselProps {
  images: Array<{ url: string; alt: string | null }>;
  title: string;
  autoplayDelay?: number;  // default 5000
}
```

**Comportement :**

- **0 images** → ne rend rien (pas de placeholder — la section n'apparaît tout simplement pas)
- **1 image** → affichage simple sans UI carousel (pas de flèches, dots, counter)
- **2+ images** → carousel Embla complet

**Fonctionnalités :**

- Navigation flèches (Prev/Next), visibles au hover, 44×44px min (WCAG target size) ✅
- Dots indicateurs cliquables (44×44px hitbox) ✅
- ~~Counter X/Y~~ **Non implémenté** — supprimé (voir D3)
- Autoplay avec arrêt à l'interaction ✅
- Swipe tactile (mobile) ✅
- Keyboard : ArrowLeft/ArrowRight **scoped au conteneur** (pas `window`) ✅
- `role="region"` + `aria-roledescription="carousel"` sur le conteneur ✅
- Chaque slide : `role="group"` + `aria-roledescription="slide"` + `aria-label` ✅
- `prefers-reduced-motion` : désactive autoplay ET transitions ✅
- Next.js `Image` : `priority` pour slide 1, `lazy` pour les suivantes ✅
- Aspect ratio `16/9` (photos gallery horizontales, pas portrait comme l'affiche) ✅
- **Scale tween Embla (ajout non prévu)** : `TWEEN_FACTOR_BASE = 0.28` — l'image centrale est à pleine taille, les latérales réduites proportionnellement (voir D5)
- **Largeur slide** : `flex-[0_0_72%]` — les slides voisins sont partiellement visibles (voir D4)

**Temps estimé :** 1h30

### 3.2 Intégration dans `SpectacleDetailView.tsx`

**Fichier:** `components/features/public-site/spectacles/SpectacleDetailView.tsx` (modifier)

**Stratégie : AJOUT d'une section, pas remplacement.**

Ajouter une nouvelle section "Galerie" **après** le bloc awards et **avant** les CTAs finaux, dans la colonne synopsis (col-span-3). Le carousel ne s'affiche que si `galleryPhotos.length > 0`.

> ⚠️ **Implémenté :** Le heading h2 "Galerie" est **commenté** dans le code livré : `{/* <h2 className="text-2xl font-bold mb-4">Galerie</h2> */}` — décision design post-implémentation (voir D6).

**Nouvelle prop :**

```typescript
interface SpectacleDetailViewProps {
  spectacle: SpectacleDb;                   // inchangé
  landscapePhotos?: SpectaclePhotoDTO[];    // inchangé
  galleryPhotos?: GalleryPhotoDTO[];        // ✅ NOUVEAU
  venue?: { nom: string; ville: string | null } | null;  // inchangé
}
```

**Placement dans le layout existant :**

```bash
Colonne synopsis (md:col-span-3)
├── CTAs (Réserver, Agenda, Retour)
├── h1 Titre
├── short_description
├── LandscapePhoto 1
├── description (paragraph 1)
├── paragraph_2
├── LandscapePhoto 2
├── paragraph_3
├── CTAs (Réserver, Agenda, Retour)
├── Awards Widget
├── ✅ NOUVEAU: Galerie Carousel (si galleryPhotos.length > 0)
│   ├── h2 "Galerie"
│   └── <SpectacleCarousel />
```

**Construction des URLs :** Réutiliser `getMediaPublicUrl()` existant (inline L32) pour mapper `storage_path` → URL complète avant de passer au carousel.

**Temps estimé :** 30 minutes

### 3.3 Mise à jour de la page Server Component

**Fichier:** `app/(marketing)/spectacles/[slug]/page.tsx` (modifier)

Ajouter `fetchSpectacleGalleryPhotos` dans le `Promise.all` existant :

```typescript
// Fetch landscape photos, gallery photos and venue in parallel
const [landscapePhotos, galleryPhotos, venue] = await Promise.all([
  fetchSpectacleLandscapePhotos(BigInt(spectacle.id)),
  fetchSpectacleGalleryPhotos(BigInt(spectacle.id)),
  fetchSpectacleNextVenue(spectacle.id),
]);

return (
  <SpectacleDetailView
    spectacle={spectacle}
    landscapePhotos={landscapePhotos}
    galleryPhotos={galleryPhotos}
    venue={venue}
  />
);
```

**Temps estimé :** 10 minutes

---

## 🎨 Phase 4 : CSS

### 4.1 Styles Embla (optionnel)

Le composant utilise des classes Tailwind inline (pas de classes `.embla__*`). Ajouter uniquement dans `app/globals.css` le support `prefers-reduced-motion` si non couvert par Tailwind :

```css
/* Embla Carousel — reduced motion */
@media (prefers-reduced-motion: reduce) {
  [aria-roledescription="carousel"] img {
    transition: none !important;
  }
}
```

> ✅ **Statut Phase 4 :** Le CSS spécifique carousel n'a pas été ajouté dans `globals.css`. Le composant gère `prefers-reduced-motion` directement en JavaScript (`window.matchMedia`). De plus, `globals.css` contient déjà `* { animation-duration: 0.01ms !important }` dans son bloc `prefers-reduced-motion` générique, qui couvre les animations CSS résiduelles. **Phase 4 considérée couverte.**

**Temps estimé :** 5 minutes

---

## 🛠️ Phase 5 : Admin Gallery Management

### 5.1 Nouveau composant ou extension

**Option A (recommandée) :** Créer `SpectacleGalleryManager.tsx` séparé

- Pattern identique à `SpectaclePhotoManager.tsx` (276 lignes)
- Mais sans limite de 2 slots — liste dynamique avec ajout/suppression/réordonnancement
- Réutilise `MediaLibraryPicker` et `MediaUploadDialog` existants
- Utilise `@dnd-kit` pour le drag & drop (déjà installé dans le projet)

**Option B :** Étendre `SpectaclePhotoManager.tsx` avec un onglet/section "Gallery"

- Risque de dépasser 300 lignes → nécessite split

### 5.2 Server Actions admin

**Fichier:** `app/(admin)/admin/spectacles/actions.ts` (étendre)

Ajouter :

- `addGalleryPhotoAction(input: unknown): Promise<ActionResult>`
- `deleteGalleryPhotoAction(spectacleId: string, mediaId: string): Promise<ActionResult>`
- `reorderGalleryPhotosAction(spectacleId: string, orderedMediaIds: string[]): Promise<ActionResult>`

Pattern identique aux actions landscape existantes (`addPhotoAction`, `deletePhotoAction`).

### 5.3 API Route admin (pour fetch client-side)

**Fichier:** `app/api/admin/spectacles/[id]/gallery-photos/route.ts` (nouveau)

Un GET endpoint pour que le `SpectacleGalleryManager` (Client Component) puisse charger les photos gallery. Pattern identique à l'API route landscape existante.

---

## 🧪 Phase 6 : Tests & Vérification

### 6.1 Checklist manuelle

**Public :**

- [ ] 0 images gallery → section "Galerie" masquée
- [ ] 1 image gallery → affichage simple sans flèches/dots
- [ ] 3+ images → carousel complet avec navigation
- [ ] Keyboard : ArrowLeft/Right dans le carousel (sans affecter le reste de la page)
- [ ] Swipe tactile sur mobile
- [ ] Autoplay fonctionne puis s'arrête à l'interaction
- [ ] Photos landscape toujours intercalées dans le texte (pas de régression)
- [ ] Affiche (image_url) toujours dans la colonne gauche (pas de régression)

**Admin :**

- [ ] Ajout d'images gallery via MediaLibraryPicker
- [ ] Suppression d'images gallery
- [ ] Réordonnancement par drag & drop
- [ ] Les photos landscape existantes ne sont pas affectées

**Accessibilité :**

- [ ] Screen reader annonce "carousel" et "slide X sur Y"
- [ ] Boutons 44×44px minimum
- [ ] `prefers-reduced-motion` désactive les animations
- [ ] Contraste des overlays suffisant (dots, counter, boutons)

### 6.2 Requête SQL de vérification

```sql
-- Vérifier les photos gallery d'un spectacle
select
  s.slug,
  s.title,
  sm.type,
  sm.ordre,
  m.storage_path,
  m.alt_text
from public.spectacles s
join public.spectacles_medias sm on sm.spectacle_id = s.id
join public.medias m on sm.media_id = m.id
where sm.type = 'gallery'
order by s.slug, sm.ordre;
```

### 6.3 Build & lint

```bash
pnpm lint
pnpm build
```

**Temps estimé :** 1 heure

---

## 📊 Estimation totale

| Phase | Durée | Description |
| ------- | ------- | ------------- |
| Phase 0 | 10 min | Pré-requis (types TS + install Embla) |
| Phase 1 | 20 min | Vue SQL gallery + migration |
| Phase 2 | 1h | DAL + Schémas Zod + helper URL |
| Phase 3 | 2h10 | Carousel + intégration SpectacleDetailView + page |
| Phase 4 | 5 min | CSS reduced motion |
| Phase 5 | 2h | Admin gallery management |
| Phase 6 | 1h | Tests & vérification |
| **Total** | **~6h30** | |

---

## 🏗️ Architecture : fichiers créés / modifiés

### Fichiers créés (6)

| Fichier | Description |
| --------- | ------------- |
| `supabase/schemas/42_views_spectacle_gallery.sql` | Vues SQL public + admin |
| `supabase/migrations/YYYYMMDDHHMMSS_add_gallery_photos_views.sql` | Migration auto-générée |
| `lib/dal/helpers/media-url.ts` | Helper URL centralisé (T3 Env) |
| `components/features/public-site/spectacles/SpectacleCarousel.tsx` | Composant carousel |
| `components/features/admin/spectacles/SpectacleGalleryManager.tsx` | Admin gallery UI |
| `app/api/admin/spectacles/[id]/gallery-photos/route.ts` | API route admin gallery |

### Fichiers modifiés (6) ⚠️ **Le plan disait 5 — actions.ts manquait dans le décompte (voir D7)**

| Fichier | Modification |
| --------- | ------------- |
| `lib/dal/helpers/index.ts` | Export `buildMediaPublicUrl` ✅ |
| `lib/schemas/spectacles.ts` | Ajout `GalleryPhotoDTOSchema`, `GalleryPhotoTransport`, `AddGalleryPhotoInputSchema` ✅ |
| `lib/dal/spectacle-photos.ts` | Ajout `fetchSpectacleGalleryPhotos`, `addSpectacleGalleryPhoto`, etc. ✅ |
| `components/features/public-site/spectacles/SpectacleDetailView.tsx` | Ajout section Galerie ✅ |
| `app/(marketing)/spectacles/[slug]/page.tsx` | Ajout fetch gallery dans Promise.all ✅ |
| `app/(admin)/admin/spectacles/actions.ts` | Ajout gallery Server Actions ✅ |

---

## 📝 Décisions d'architecture

| Décision | Choix | Raison |
| ---------- | ------- | -------- |
| Modifier `fetchSpectacleBySlug` ? | **NON** | Le pattern existant sépare les fetches (parallel dans la page). Modifier casserait tous les appelants. |
| Vue SQL ou join direct ? | **Vue SQL** | Cohérence avec le pattern landscape (`spectacles_landscape_photos_public`). Plus propre et réutilisable. |
| Remplacer `SpectacleDetailView` ? | **NON** | Le composant actuel (379 lignes) a un layout riche. Le carousel est une section ajoutée. |
| Aspect ratio carousel ? | **16/9** | Les photos gallery sont horizontales (contrairement à l'affiche en 2/3 portrait). |
| Autoplay ? | **Oui, avec stop** | Standard UX, mais désactivé en `prefers-reduced-motion` (WCAG). |
| Scope keyboard events ? | **Conteneur** | Évite les conflits avec d'autres composants/navigation. |
| Admin : composant séparé ou extension ? | **Composant séparé** | `SpectaclePhotoManager` est déjà 276 lignes. Le fusionner dépasserait 300 lignes (Clean Code). |
| Helper media URL : sync ou async ? | **Sync** | 4/5 implémentations existantes sont sync. La version async de `lib/dal/media.ts` reste disponible. |

---

## 🔗 Références projet

| Fichier | Rôle |
| --------- | ------ |
| `supabase/schemas/11_tables_relations.sql` | Table `spectacles_medias` (schema source of truth) |
| `supabase/schemas/41_views_spectacle_photos.sql` | Vues landscape (pattern à suivre) |
| `lib/dal/spectacle-photos.ts` | DAL landscape (pattern à reproduire) |
| `lib/schemas/spectacles.ts` | Schémas Zod existants (landscape + gallery) |
| `components/features/public-site/spectacles/SpectacleDetailView.tsx` | Composant à étendre |
| `components/features/admin/spectacles/SpectaclePhotoManager.tsx` | Admin landscape (pattern) |
| `app/(marketing)/spectacles/[slug]/page.tsx` | Page Server Component |

### Documentation externe

- [Embla Carousel Documentation](https://www.embla-carousel.com/)
- [Next.js Image Component](https://nextjs.org/docs/app/api-reference/components/image)
- [WCAG 2.1 Carousel Pattern](https://www.w3.org/WAI/tutorials/carousels/)

---

**Mis à jour :** 2026-02-20 (v2) → 2026-02 (v3 — audit post-implémentation)
**Statut :** ✅ IMPLÉMENTÉ — Toutes les phases livrées (voir divergences D1–D8)
