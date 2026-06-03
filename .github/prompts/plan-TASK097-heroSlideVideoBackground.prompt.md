# Plan: Hero Slide Video Background (TASK097)

## TL;DR

Ajouter un champ `video_url` (text, nullable) à la table `home_hero_slides` pour permettre l'utilisation d'une vidéo de fond éditable depuis le backoffice. Le frontend public est déjà prêt (`HeroSlideBackground.tsx` rend `<video>` quand `slide.video` est défini, sinon `<Image>`). Il reste à propager le champ dans : DB → schémas Zod → DAL admin (auto via `select *`) → DAL public (mapping explicite + champ `video`) → hooks form → UI form admin → preview admin.

## Steps

### Phase 1 — Base de données (déclaratif + migration)
1. **Modifier** `supabase/schemas/07d_table_home_hero.sql` : ajouter colonne `video_url text` (nullable) après `alt_text` + `comment on column`. Documenter que le champ accepte chemin relatif (`/hero-theatre-loop.mp4`) ou URL absolue.
2. **Créer** migration `supabase/migrations/20260603120000_add_video_url_to_home_hero_slides.sql` avec `alter table public.home_hero_slides add column if not exists video_url text;` + commentaire. Pas de RLS à ajuster (la colonne hérite des policies existantes).

### Phase 2 — Schémas Zod (parallèle phase 1)
3. **Modifier** `lib/schemas/home-content.ts` :
   - `HeroSlideInputSchema` (server) : ajouter `video_url: relativeOrAbsoluteUrl.optional().or(z.literal(""))`.
   - `HeroSlideFormSchema` (UI) : ajouter `video_url: relativeOrAbsoluteUrl.optional().or(z.literal(""))`.
   - `HeroSlideDTO` interface : ajouter `video_url: string | null`.

### Phase 3 — DAL (dépend de phase 1+2)
4. **Pas de changement** sur `lib/dal/admin-home-hero.ts` : utilise `select("*")` et `insert({ ...validated })` → propagation auto.
5. **Modifier** `lib/dal/home-hero.ts` (DAL public, select explicite) :
   - Type `SupabaseHeroRow` : ajouter `video_url: string | null`.
   - Type `HomeHeroSlideRecord` : ajouter `video_url: string | null`.
   - Liste `select(...)` dans `fetchActiveHomeHeroSlides` : ajouter `video_url`.
   - Mapping dans `filterActiveSlides` : ajouter `video_url: row.video_url ?? null`.

### Phase 4 — Adaptateur public DAL→Component (dépend phase 3)
6. **Modifier** `components/features/public-site/home/hero/HeroContainer.tsx` : ajouter `video: r.video_url ?? undefined` dans le mapping `records.map(...)` qui produit `HeroSlide[]`. Le type `HeroSlide.video?: string` existe déjà et `HeroSlideBackground` rend déjà `<video>` quand défini.

### Phase 5 — Hooks et form admin (dépend phase 2)
7. **Modifier** `lib/hooks/useHeroSlideForm.ts` : ajouter `video_url: ""` dans `DEFAULT_FORM_VALUES`.
8. **Modifier** `lib/hooks/useHeroSlideFormSync.ts` : ajouter `video_url: slide.video_url ?? ""` dans `mapSlideToFormValues`.
9. **Modifier** `components/features/admin/home/HeroSlideFormFields.tsx` : ajouter un nouveau composant `VideoUrlField` (sur le modèle de `SubtitleField`) avec `Input type="url"`, label « URL vidéo (optionnel) », `FormDescription` explicative (« Si renseigné, la vidéo remplace l'image de fond. Chemin relatif `/video.mp4` ou URL absolue. »), et l'inclure dans le fragment retourné par `HeroSlideFormFields`.
10. **Aucun changement** sur `HeroSlideForm.tsx` : `HeroSlideFormFields` est déjà composé dedans, le champ apparaîtra automatiquement.

### Phase 6 — Preview admin (parallèle phase 5)
11. **Modifier** `components/features/admin/home/HeroSlidePreview.tsx` : ajouter un `<Badge variant="secondary">` ou icône avec libellé « Vidéo » si `slide.video_url` est non-null/non-vide, à côté du badge `Active/Inactive`.

### Phase 7 — Pas de changement
12. **Aucun changement** sur `components/features/admin/home/HeroSlidesView.tsx` : passe `HeroSlideDTO` tel quel.
13. **Aucun changement** sur `app/(admin)/admin/home/hero/home-hero-actions.ts` : les Server Actions délèguent au DAL admin qui gère `*`.

## Relevant files

- [supabase/schemas/07d_table_home_hero.sql](../../supabase/schemas/07d_table_home_hero.sql) — ajouter colonne `video_url text` + commentaire.
- `supabase/migrations/20260603120000_add_video_url_to_home_hero_slides.sql` (à créer) — `alter table … add column if not exists video_url text`.
- [lib/schemas/home-content.ts](../../lib/schemas/home-content.ts) — `HeroSlideInputSchema`, `HeroSlideFormSchema`, `HeroSlideDTO`. Réutiliser `relativeOrAbsoluteUrl` déjà défini dans le fichier.
- [lib/dal/home-hero.ts](../../lib/dal/home-hero.ts) — `SupabaseHeroRow`, `HomeHeroSlideRecord`, `fetchActiveHomeHeroSlides` (select string), `filterActiveSlides` (mapping).
- [lib/dal/admin-home-hero.ts](../../lib/dal/admin-home-hero.ts) — aucun changement (auto via `select *`).
- [components/features/public-site/home/hero/HeroContainer.tsx](../../components/features/public-site/home/hero/HeroContainer.tsx) — mapping `r.video_url → video` dans `records.map(...)`.
- [components/features/public-site/home/hero/types.ts](../../components/features/public-site/home/hero/types.ts) — déjà OK (`video?: string`).
- [components/features/public-site/home/hero/HeroSlideBackground.tsx](../../components/features/public-site/home/hero/HeroSlideBackground.tsx) — déjà OK (rend `<video>`).
- [lib/hooks/useHeroSlideForm.ts](../../lib/hooks/useHeroSlideForm.ts) — `DEFAULT_FORM_VALUES`.
- [lib/hooks/useHeroSlideFormSync.ts](../../lib/hooks/useHeroSlideFormSync.ts) — `mapSlideToFormValues`.
- [components/features/admin/home/HeroSlideFormFields.tsx](../../components/features/admin/home/HeroSlideFormFields.tsx) — ajouter `VideoUrlField` sub-component.
- [components/features/admin/home/HeroSlidePreview.tsx](../../components/features/admin/home/HeroSlidePreview.tsx) — badge vidéo conditionnel.

## Verification

1. **Schéma & migration** : `supabase db diff` doit être vide après application de la migration ; `supabase db reset` puis vérifier que la colonne existe (`\d public.home_hero_slides`).
2. **Type-check & lint** : `pnpm lint` et `pnpm tsc --noEmit` (ou build) sans erreur, en particulier pour les champs ajoutés au DTO et au mapping `HomeHeroSlideRecord → HeroSlide`.
3. **Test manuel admin (création)** : `/admin/home/hero` → créer un slide avec `video_url=/hero-theatre-loop.mp4` (fichier déjà présent dans `public/`) → vérifier toast succès → ouvrir la page d'accueil et constater la lecture vidéo en boucle muette.
4. **Test manuel admin (édition)** : éditer un slide existant, vider le champ vidéo, sauvegarder → vérifier que l'image reprend.
5. **Test manuel admin (preview)** : vérifier qu'un slide avec vidéo affiche un badge « Vidéo » dans la grille admin.
6. **Régression image-only** : un slide sans `video_url` doit continuer à afficher l'image (non-régression de `HeroSlideBackground`).
7. **Régression DAL public** : `scripts/test-all-dal-functions.ts` doit passer pour `fetchActiveHomeHeroSlides`.

## Decisions

- **Type colonne** : `text` nullable (pas de contrainte de longueur, cohérent avec `image_url`).
- **Pas de `video_media_id`** : MVP en URL libre (relative ou absolue). Pas d'intégration MediaLibrary pour la vidéo dans cette itération.
- **Validation Zod** : `relativeOrAbsoluteUrl.optional().or(z.literal(""))` — accepte chemin relatif (`/x.mp4`), URL absolue (`https://…/x.mp4`), ou vide.
- **Format/extension** : pas de validation MIME côté Zod (le navigateur gérera ; admin responsable).
- **Pas de modification de `HeroSlide.video?: string`** côté types public : déjà présent.
- **Hors scope** :
  - Upload vidéo via media library (à prévoir en phase ultérieure).
  - Génération de thumbnail pour preview admin.
  - Optimisation/transcoding serveur.
  - Champ `video_alt` ou `poster` (image de fallback explicite).

## Further Considerations

✅ **Décidé :**
1. `video_url` conservé dans `HomeHeroSlideRecord` (cohérent avec `image_url`), mapping `video: r.video_url ?? undefined` dans `HeroContainer.tsx`.
2. Pas de validation d'extension — `relativeOrAbsoluteUrl.optional().or(z.literal(""))` uniquement.
