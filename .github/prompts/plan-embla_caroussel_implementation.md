# Embla Carousel Implementation - Spectacles Multi-Image Gallery

**Date:** 2026-01-31  
**Status:** READY FOR IMPLEMENTATION  
**Database Table:** `spectacles_medias` (existing, no migration needed)

---

## 📋 Summary

Implementation of Embla Carousel for displaying multiple images per spectacle using the **existing** `spectacles_medias` junction table. This document supersedes the original implementation plan which incorrectly referenced a non-existent `spectacles_media` table.

**Key Updates:**
- ✅ Uses existing `spectacles_medias` table (confirmed via TypeScript types)
- ✅ No SQL migration required
- ✅ Table already has `ordre` column for image ordering
- ✅ RLS policies already configured

---

## 🗂️ Database Schema (Existing)

### Table: `spectacles_medias`

**Location:** Already defined in `supabase/schemas/11_tables_relations.sql`

```sql
-- ✅ EXISTING TABLE - NO CHANGES NEEDED
create table public.spectacles_medias (
  spectacle_id bigint not null references public.spectacles(id) on delete cascade,
  media_id bigint not null references public.medias(id) on delete cascade,
  ordre smallint default 0,
  primary key (spectacle_id, media_id)
);
```

### TypeScript Types (Confirmed)

```typescript
// ✅ ALREADY GENERATED in lib/database.types.ts
spectacles_medias: {
  Row: {
    media_id: number
    ordre: number | null
    spectacle_id: number
  }
  Insert: {
    media_id: number
    ordre?: number | null
    spectacle_id: number
  }
  Update: {
    media_id?: number
    ordre?: number | null
    spectacle_id?: number
  }
  Relationships: [
    {
      foreignKeyName: "spectacles_medias_media_id_fkey"
      columns: ["media_id"]
      isOneToOne: false
      referencedRelation: "medias"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "spectacles_medias_spectacle_id_fkey"
      columns: ["spectacle_id"]
      isOneToOne: false
      referencedRelation: "spectacles"
      referencedColumns: ["id"]
    },
  ]
}
```

### RLS Policies (Existing)

**File:** `supabase/schemas/11_tables_relations.sql`

```sql
-- ✅ EXISTING POLICIES - NO CHANGES NEEDED
alter table public.spectacles_medias enable row level security;

create policy "Spectacle media relations are viewable by everyone"
on public.spectacles_medias for select
to anon, authenticated
using ( true );

-- Admin policies for INSERT/UPDATE/DELETE already defined
```

---

## 📦 Phase 1: Installation & Dependencies

### 1.1 Install Embla Carousel

```bash
pnpm add embla-carousel-react embla-carousel-autoplay
```

**Dependencies:**
- `embla-carousel-react@^8.5.1`
- `embla-carousel-autoplay@^8.5.1`

**Estimated time:** 5 minutes

---

## 🔧 Phase 2: DAL Extensions

### 2.1 Media URL Helper

**File:** `lib/dal/helpers/media-url.ts` (new file)

```typescript
/**
 * Build public URL for media storage path
 * @param storagePath - Relative path in medias bucket (e.g., "spectacles/image.jpg")
 * @returns Full public URL or null if path is null/empty
 */
export function buildMediaUrl(storagePath: string | null): string | null {
  if (!storagePath) return null;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    console.warn('[buildMediaUrl] NEXT_PUBLIC_SUPABASE_URL not defined');
    return null;
  }
  
  // Remove leading slash if present
  const cleanPath = storagePath.startsWith('/') 
    ? storagePath.slice(1) 
    : storagePath;
  
  return `${supabaseUrl}/storage/v1/object/public/medias/${cleanPath}`;
}
```

**Estimated time:** 15 minutes

### 2.2 Update SpectacleDetailDTO

**File:** `lib/types/spectacle.ts`

```typescript
// ✅ ADD THIS TYPE
export interface SpectacleImage {
  id: number;
  url: string;
  alt: string | null;
  ordre: number;
}

// ✅ UPDATE EXISTING DTO
export interface SpectacleDetailDTO {
  // ... existing fields
  image_url: string | null;
  
  // ✅ NEW: Multiple images from spectacles_medias
  images: SpectacleImage[];
}
```

**Estimated time:** 10 minutes

### 2.3 Extend fetchSpectacleBySlug

**File:** `lib/dal/spectacles.ts`

```typescript
import { buildMediaUrl } from './helpers/media-url';

export async function fetchSpectacleBySlug(
  slug: string
): Promise<SpectacleDetailDTO | null> {
  const supabase = await createClient();
  
  // ✅ ADD JOIN with spectacles_medias and medias
  const { data, error } = await supabase
    .from('spectacles')
    .select(`
      *,
      spectacles_medias (
        ordre,
        medias (
          id,
          storage_path,
          alt_text
        )
      )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  
  if (error || !data) {
    console.error('[fetchSpectacleBySlug] Error:', error);
    return null;
  }
  
  // ✅ MAP spectacles_medias to SpectacleImage[]
  const images: SpectacleImage[] = (data.spectacles_medias || [])
    .map((sm: any) => {
      const media = sm.medias;
      if (!media) return null;
      
      return {
        id: media.id,
        url: buildMediaUrl(media.storage_path) || '',
        alt: media.alt_text,
        ordre: sm.ordre ?? 0,
      };
    })
    .filter((img): img is SpectacleImage => img !== null && img.url !== '')
    .sort((a, b) => a.ordre - b.ordre);
  
  return {
    ...data,
    images,
  };
}
```

**Key Points:**
- ✅ Uses existing `spectacles_medias` table
- ✅ Joins with `medias` to get `storage_path` and `alt_text`
- ✅ Sorts by `ordre` column (ascending)
- ✅ Filters out images with invalid URLs
- ✅ Preserves existing `image_url` field for fallback

**Estimated time:** 30 minutes

---

## 🎨 Phase 3: UI Components

### 3.1 SpectacleCarousel Component

**File:** `components/features/public-site/spectacles/SpectacleCarousel.tsx`

```typescript
'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpectacleImage {
  id: number;
  url: string;
  alt: string | null;
  ordre: number;
}

interface SpectacleCarouselProps {
  images: SpectacleImage[];
  title: string;
  autoplayDelay?: number;
}

export function SpectacleCarousel({
  images,
  title,
  autoplayDelay = 5000,
}: SpectacleCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'center' },
    [Autoplay({ delay: autoplayDelay, stopOnInteraction: true })]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // ✅ KEYBOARD NAVIGATION
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        scrollNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrollPrev, scrollNext]);

  // ✅ HANDLE 0 IMAGES
  if (images.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg bg-muted">
        <p className="text-muted-foreground">Aucune image disponible</p>
      </div>
    );
  }

  // ✅ HANDLE 1 IMAGE (no carousel)
  if (images.length === 1) {
    return (
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg">
        <Image
          src={images[0].url}
          alt={images[0].alt || title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          priority
        />
      </div>
    );
  }

  // ✅ CAROUSEL FOR 2+ IMAGES
  return (
    <div className="group relative" role="region" aria-roledescription="carousel">
      {/* Embla Container */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="min-w-0 flex-[0_0_100%]"
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} sur ${images.length}`}
            >
              <div className="relative aspect-[2/3] w-full">
                <Image
                  src={image.url}
                  alt={image.alt || `${title} - Image ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  priority={index === 0}
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        aria-label="Image précédente"
        className={cn(
          'absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 p-2 opacity-0 shadow-lg backdrop-blur-sm transition-opacity hover:bg-background group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30',
          'focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        )}
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={scrollNext}
        disabled={!canScrollNext}
        aria-label="Image suivante"
        className={cn(
          'absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 p-2 opacity-0 shadow-lg backdrop-blur-sm transition-opacity hover:bg-background group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30',
          'focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        )}
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots Indicators */}
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            aria-label={`Aller à l'image ${index + 1}`}
            className={cn(
              'h-2 w-2 rounded-full transition-all',
              selectedIndex === index
                ? 'w-4 bg-primary'
                : 'bg-background/50 hover:bg-background/80'
            )}
          />
        ))}
      </div>

      {/* Counter */}
      <div className="absolute right-4 top-4 z-10 rounded-full bg-background/80 px-3 py-1 text-sm backdrop-blur-sm">
        {selectedIndex + 1} / {images.length}
      </div>
    </div>
  );
}
```

**Features:**
- ✅ Keyboard navigation (ArrowLeft/ArrowRight)
- ✅ Swipe gestures (mobile)
- ✅ Autoplay with stop on interaction
- ✅ Prev/Next buttons (visible on hover)
- ✅ Dot indicators
- ✅ Image counter (X/Y)
- ✅ Accessibility (ARIA labels, roles)
- ✅ Single image handling (no carousel UI)
- ✅ Zero images handling (placeholder)
- ✅ Next.js Image optimization (priority for first, lazy for rest)

**Estimated time:** 1.5 hours

### 3.2 Update SpectacleDetailView

**File:** `components/features/public-site/spectacles/SpectacleDetailView.tsx`

```typescript
import { SpectacleCarousel } from './SpectacleCarousel';
import type { SpectacleDetailDTO } from '@/lib/types/spectacle';

interface SpectacleDetailViewProps {
  spectacle: SpectacleDetailDTO;
}

export function SpectacleDetailView({ spectacle }: SpectacleDetailViewProps) {
  // ✅ FALLBACK LOGIC: images[] → image_url → empty
  const carouselImages = spectacle.images.length > 0
    ? spectacle.images
    : spectacle.image_url
    ? [
        {
          id: 0,
          url: spectacle.image_url,
          alt: spectacle.title,
          ordre: 0,
        },
      ]
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Text Section */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold">{spectacle.title}</h1>
          
          {spectacle.short_description && (
            <p className="text-xl text-muted-foreground">
              {spectacle.short_description}
            </p>
          )}

          {spectacle.description && (
            <div className="prose prose-lg max-w-none">
              {spectacle.description}
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-sm">
            {spectacle.genre && (
              <div>
                <span className="font-semibold">Genre:</span> {spectacle.genre}
              </div>
            )}
            {spectacle.duration_minutes && (
              <div>
                <span className="font-semibold">Durée:</span>{' '}
                {spectacle.duration_minutes} min
              </div>
            )}
            {spectacle.casting && (
              <div>
                <span className="font-semibold">Casting:</span>{' '}
                {spectacle.casting} personnes
              </div>
            )}
          </div>
        </div>

        {/* ✅ CAROUSEL SECTION - Below main section on mobile, right side on desktop */}
        <div className="order-first lg:order-last">
          <SpectacleCarousel
            images={carouselImages}
            title={spectacle.title}
            autoplayDelay={5000}
          />
        </div>
      </div>
    </div>
  );
}
```

**Layout:**
- ✅ **Mobile (< 1024px):** Carousel ABOVE text section (`order-first`)
- ✅ **Desktop (≥ 1024px):** Carousel RIGHT of text section (`lg:order-last`)
- ✅ **Fallback chain:** `images[]` → `image_url` → empty array

**Estimated time:** 30 minutes

---

## 🎨 Phase 4: CSS Styles

### 4.1 Embla Carousel Styles

**File:** `app/globals.css` (append)

```css
/* ============================================
   EMBLA CAROUSEL - Spectacles Gallery
   ============================================ */

.embla {
  overflow: hidden;
}

.embla__container {
  display: flex;
}

.embla__slide {
  flex: 0 0 100%;
  min-width: 0;
}

/* Smooth image transitions */
.embla__slide img {
  transition: transform 0.2s ease-in-out;
}

.embla__slide:hover img {
  transform: scale(1.02);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .embla__slide img {
    transition: none;
  }
  
  .embla__slide:hover img {
    transform: none;
  }
}
```

**Estimated time:** 15 minutes

---

## 🧪 Phase 5: Testing

### 5.1 Manual Test Checklist

**Test Scenarios:**

- [ ] **0 images:** Placeholder "Aucune image disponible" displayed
- [ ] **1 image:** Single image shown without carousel UI
- [ ] **3+ images:** Full carousel with navigation
- [ ] **Keyboard navigation:** ArrowLeft/ArrowRight work
- [ ] **Buttons:** Prev/Next buttons visible on hover
- [ ] **Dots:** Click dots to jump to image
- [ ] **Autoplay:** Slides change every 5 seconds
- [ ] **Autoplay stop:** Stops after user interaction
- [ ] **Responsive:** Layout works on mobile/tablet/desktop
- [ ] **Image loading:** First image priority, others lazy
- [ ] **Accessibility:** Screen reader announces current slide
- [ ] **Fallback:** Legacy `image_url` used if no `spectacles_medias`

### 5.2 Database Verification

```sql
-- ✅ Verify spectacles_medias data
SELECT 
  s.id,
  s.slug,
  s.title,
  COUNT(sm.media_id) as image_count,
  ARRAY_AGG(m.storage_path ORDER BY sm.ordre) as image_paths
FROM spectacles s
LEFT JOIN spectacles_medias sm ON sm.spectacle_id = s.id
LEFT JOIN medias m ON m.id = sm.media_id
WHERE s.slug = 'le-petit-prince'  -- Replace with your test spectacle
GROUP BY s.id, s.slug, s.title;
```

**Expected output:**
```
id | slug           | title         | image_count | image_paths
---+----------------+---------------+-------------+---------------------------
42 | le-petit-prince| Le Petit Prince| 3          | {spectacles/img1.jpg, ...}
```

**Estimated time:** 1 hour

---

## 📊 Summary

### Time Estimation

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 1: Installation | 5 min | ⏳ Pending |
| Phase 2: DAL Extensions | 55 min | ⏳ Pending |
| Phase 3: UI Components | 2 hours | ⏳ Pending |
| Phase 4: CSS Styles | 15 min | ⏳ Pending |
| Phase 5: Testing | 1 hour | ⏳ Pending |
| **Total** | **~4 hours** | |

### Architecture Benefits

**✅ No Database Migration Required**
- Uses existing `spectacles_medias` table
- RLS policies already configured
- TypeScript types already generated

**✅ Backward Compatible**
- Preserves existing `spectacle.image_url` field
- Fallback chain: `images[]` → `image_url` → placeholder
- Existing spectacles without `spectacles_medias` continue to work

**✅ Performance Optimized**
- Next.js Image component (automatic optimization)
- Priority loading for first image
- Lazy loading for subsequent images
- Responsive `sizes` attribute

**✅ Accessibility First**
- Keyboard navigation (ArrowLeft/Right)
- ARIA labels and roles
- Screen reader support
- Reduced motion support

**✅ User Experience**
- Autoplay with stop on interaction
- Swipe gestures (mobile)
- Hover-to-show buttons (desktop)
- Visual indicators (dots + counter)

---

## 🚀 Deployment Checklist

### Before Deployment

- [ ] Verify `spectacles_medias` table exists in production
- [ ] Confirm RLS policies are active
- [ ] Test with real production data
- [ ] Validate TypeScript compilation (`pnpm tsc --noEmit`)
- [ ] Run build (`pnpm build`)

### After Deployment

- [ ] Monitor image loading performance
- [ ] Verify autoplay works correctly
- [ ] Test keyboard navigation on production
- [ ] Check mobile swipe gestures
- [ ] Validate accessibility with screen reader
- [ ] Confirm fallback to `image_url` works

---

## 📝 Migration from Legacy `image_url`

If you want to migrate existing spectacles from single `image_url` to multi-image `spectacles_medias`:

### Step 1: Create Media Records

```sql
-- Insert existing image_url as media record
INSERT INTO medias (storage_path, filename, mime, alt_text, created_at)
SELECT 
  'spectacles/' || slug || '.jpg',  -- Adjust based on actual storage
  title || '.jpg',
  'image/jpeg',
  title,
  NOW()
FROM spectacles
WHERE image_url IS NOT NULL
  AND image_url != ''
  AND NOT EXISTS (
    SELECT 1 FROM spectacles_medias sm WHERE sm.spectacle_id = spectacles.id
  );
```

### Step 2: Link to Spectacles

```sql
-- Create spectacles_medias entries
INSERT INTO spectacles_medias (spectacle_id, media_id, ordre)
SELECT 
  s.id,
  m.id,
  0  -- First image
FROM spectacles s
JOIN medias m ON m.alt_text = s.title  -- Adjust join condition
WHERE s.image_url IS NOT NULL
  AND s.image_url != ''
  AND NOT EXISTS (
    SELECT 1 FROM spectacles_medias sm WHERE sm.spectacle_id = s.id
  );
```

**⚠️ Note:** Adjust SQL based on your actual storage paths and linking logic.

---

## 🔗 References

### Documentation
- [Embla Carousel Documentation](https://www.embla-carousel.com/)
- [Next.js Image Component](https://nextjs.org/docs/app/api-reference/components/image)
- [WCAG 2.1 Carousel Guidelines](https://www.w3.org/WAI/tutorials/carousels/)

### Project Files
- Database Schema: `supabase/schemas/11_tables_relations.sql`
- TypeScript Types: `lib/database.types.ts`
- Existing Component: `components/features/public-site/spectacles/SpectacleDetailView.tsx`

---

**Last Updated:** 2026-01-31  
**Author:** AI Assistant  
**Status:** Ready for Implementation ✅
