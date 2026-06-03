# TASK097 — Hero Slide Video Background

**Status:** Completed ✅  
**Added:** 2026-06-03  
**Updated:** 2026-06-03

## Original Request

Ajouter un champ `video_url` (text, nullable) à la table `home_hero_slides` pour permettre l'utilisation d'une vidéo de fond éditable depuis le backoffice. Le frontend public était déjà prêt (`HeroSlideBackground.tsx` rend `<video>` quand `slide.video` est défini, sinon `<Image>`). Il restait à propager le champ dans : DB → schémas Zod → DAL public → hooks form → UI form admin → preview admin.

## Thought Process

- `HeroSlideBackground.tsx` supportait déjà `video?: string` côté public — il suffisait de câbler la source de données de bout en bout.
- Décision de ne **pas** intégrer la MediaLibrary pour les vidéos dans ce MVP (URL libre : chemin relatif ou URL absolue).
- Validation Zod : `relativeOrAbsoluteUrl.optional().or(z.literal(""))` — même pattern que `image_url`.
- Le DAL admin (`admin-home-hero.ts`) utilise `select("*")` → propagation automatique, aucun changement nécessaire.
- Le champ `.refine()` existant dans les deux schémas (image requise si pas de vidéo) a été mis à jour pour accepter la vidéo comme alternative à l'image.

## Implementation Plan

- [x] Phase 1 — DB : schéma déclaratif + migration SQL
- [x] Phase 2 — Schémas Zod : `HeroSlideInputSchema`, `HeroSlideFormSchema`, `HeroSlideDTO`
- [x] Phase 3 — DAL public : `SupabaseHeroRow`, `HomeHeroSlideRecord`, select explicite, mapping
- [x] Phase 4 — `HeroContainer.tsx` : mapping `video_url → video`
- [x] Phase 5 — Hooks + form admin : `DEFAULT_FORM_VALUES`, `mapSlideToFormValues`, `VideoUrlField`
- [x] Phase 6 — Preview admin : badge « Vidéo » conditionnel
- [x] Phase 7 — Vérification type-check + lint

## Livrables

| Fichier | Action | Détail |
| --------- | -------- | -------- |
| `supabase/schemas/07d_table_home_hero.sql` | Modifié | Colonne `video_url text` nullable + commentaire après `alt_text` |
| `supabase/migrations/20260603120000_add_video_url_to_home_hero_slides.sql` | Créé | `ALTER TABLE … ADD COLUMN IF NOT EXISTS video_url text` |
| `lib/schemas/home-content.ts` | Modifié | `video_url` dans `HeroSlideInputSchema` + `HeroSlideFormSchema` + `HeroSlideDTO`. `.refine()` updated (image OU vidéo requis) |
| `lib/dal/home-hero.ts` | Modifié | `SupabaseHeroRow.video_url`, `HomeHeroSlideRecord.video_url`, select string, mapping |
| `components/features/public-site/home/hero/HeroContainer.tsx` | Modifié | `video: r.video_url ?? undefined` dans `records.map(...)` |
| `lib/hooks/useHeroSlideForm.ts` | Modifié | `video_url: ""` dans `DEFAULT_FORM_VALUES` |
| `lib/hooks/useHeroSlideFormSync.ts` | Modifié | `video_url: slide.video_url ?? ""` dans `mapSlideToFormValues` |
| `components/features/admin/home/HeroSlideFormFields.tsx` | Modifié | Sous-composant `VideoUrlField` (Input `type="url"`, label, description) inclus dans le fragment |
| `components/features/admin/home/HeroSlidePreview.tsx` | Modifié | `<Badge variant="secondary">Vidéo</Badge>` si `slide.video_url` est non-vide |

## Décisions

- **Type colonne** : `text` nullable (cohérent avec `image_url`).
- **Pas de `video_media_id`** : MVP URL libre. L'intégration MediaLibrary vidéo est hors scope.
- **Validation Zod** : `relativeOrAbsoluteUrl.optional().or(z.literal(""))` — chemin relatif, URL absolue, ou vide.
- **Pas de validation MIME** côté Zod : l'admin est responsable du format.
- **Hors scope** : upload vidéo via media library, génération thumbnail, poster/fallback explicite, transcoding serveur.

## Hors Scope (suite possible)

- `video_alt` / `poster` (image de fallback pendant chargement vidéo)
- Upload vidéo via MediaLibraryPicker
- Validation d'extension côté Zod (`.mp4`, `.webm`, etc.)

## Progress Log

### 2026-06-03

- Phase 1 : `supabase/schemas/07d_table_home_hero.sql` modifié + migration `20260603120000_add_video_url_to_home_hero_slides.sql` créée.
- Phase 2 : `HeroSlideInputSchema` et `HeroSlideFormSchema` mis à jour (`video_url`), `.refine()` adapté, `HeroSlideDTO.video_url: string | null` ajouté.
- Phase 3 : `lib/dal/home-hero.ts` — `SupabaseHeroRow`, `HomeHeroSlideRecord`, select string, mapping mis à jour.
- Phase 4 : `HeroContainer.tsx` — `video: r.video_url ?? undefined`.
- Phase 5 : `useHeroSlideForm.ts` (`video_url: ""`), `useHeroSlideFormSync.ts` (`video_url: slide.video_url ?? ""`), `HeroSlideFormFields.tsx` (`VideoUrlField`).
- Phase 6 : `HeroSlidePreview.tsx` — badge conditionnel « Vidéo ».
- Vérification TypeScript : aucune erreur de type.
