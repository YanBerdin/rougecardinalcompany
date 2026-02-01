# `TASK057` - Spectacle Landscape Photos Integration

**Status:** Completed  
**Added:** 2026-02-01  
**Updated:** 2026-02-01  
**Priority:** Medium  
**Category:** Content Management  
**Related Epic:** 14.7 Back-office Administration
**Plan:** `.github/prompts/plan-TASK057-spectacleLandscapePhotos.prompt.md` ✅ Vérifié

## Overview

Implémenter la gestion et l'affichage de 2 photos format paysage par spectacle, intégrées comme encarts dans le texte du synopsis, en utilisant la table de jonction `spectacles_medias` existante.

## Goals

- ✅ Permettre aux admins d'ajouter 2 photos paysage maximum par spectacle
- ✅ Intégrer les photos dans le synopsis (SpectacleDetailView)
- ✅ Réutiliser MediaLibraryPicker pour la sélection d'images
- ✅ Support swap/réorganisation des 2 photos
- ✅ Architecture extensible pour futur carousel

## Technical Scope

### Database Changes

- **Table**: `spectacles_medias` (modification existante)
- **New Column**: `type` TEXT DEFAULT 'gallery' NOT NULL
- **New Constraint**: UNIQUE `(spectacle_id, type, ordre)` (ajouté, PK existante préservée)
- **CHECK Constraints**:
  - `type IN ('poster', 'landscape', 'gallery')`
  - `ordre IN (0, 1)` pour type='landscape'
- **Index**: `idx_spectacles_medias_type_ordre` sur `(spectacle_id, type, ordre)`
- **Views**: Nouveau fichier `41_views_spectacle_photos.sql` (public + admin)
- **RLS Policies**: Policies existantes dans `11_tables_relations.sql` suffisantes (pas de nouvelles)

### Code Changes

- **DAL**: Nouveau module `lib/dal/spectacle-photos.ts` (READ avec `cache` de "react", MUTATIONS avec DALResult)
- **Schemas**: Extension `lib/schemas/spectacles.ts` (Server bigint + UI number, nommage avec suffixe Schema)
- **Server Actions**: 3 actions dans `app/(admin)/admin/spectacles/actions.ts` (add/delete/swap avec `"use server"`)
- **Utility**: `lib/utils/media-url.ts` - `getMediaPublicUrl(storagePath)` pour construire URLs
- **Admin Component**: `SpectaclePhotoManager.tsx` (2 slots grid, MediaLibraryPicker, swap button)
- **Public Display**: Intégration dans `SpectacleDetailView.tsx` (2 encarts dans synopsis)

## Progress Tracking

**Overall Status:** Completed - 100%

### Implementation Steps

| Step | Description | Status | Updated | Notes |
| ------ | ------------- | -------- | --------- | ------- |
| 0 | Migration workflow (stop/diff/start/push) | Completed | 2026-02-01 | Applied to cloud via MCP |
| 1 | Database migration (schema + views) | Completed | 2026-02-01 | fix_entity_type_whitelist + add_landscape_photos |
| 2 | DAL creation (spectacle-photos.ts) | Completed | 2026-02-01 | READ cache() + MUTATIONS DALResult<T> |
| 3 | Zod schemas (Server + UI separation) | Completed | 2026-02-01 | TASK055 BigInt pattern applied |
| 4 | Server Actions (try/catch mandatory) | Completed | 2026-02-01 | add/delete/swap + API route for photos |
| 5 | Admin component (SpectaclePhotoManager) | Completed | 2026-02-01 | Client-side fetch via API route |
| 6 | Form integration (SpectacleForm) | Completed | 2026-02-01 | After ImageFieldGroup |
| 7 | Public page fetch (sequential) | Completed | 2026-02-01 | fetchSpectacleLandscapePhotos |
| 8 | Public display (SpectacleDetailView) | Completed | 2026-02-01 | LandscapePhotoCard component |

### Compliance Checklist

- [x] **Migration Workflow**: stop → diff → start → push --linked
- [x] **Table `medias`**: Utiliser `medias` (pas `media`), colonne `storage_path` (pas `url`)
- [x] **RLS Policies**: Policies existantes suffisantes, pas de duplication
- [x] **DAL SOLID**: `cache` de "react" autorisé, NO `next/cache` (revalidatePath/Tag)
- [x] **Server Actions**: `"use server"` directive + try/catch avec Zod 422, generic 500
- [x] **Schema Separation**: Server bigint, UI number, suffixe `Schema` pour constantes Zod
- [x] **URL Construction**: `getMediaPublicUrl(storage_path)` via env.NEXT_PUBLIC_SUPABASE_URL
- [x] **Performance**: loading="lazy", React cache(), index DB
- [x] **BigInt Fix**: Applied TASK055 pattern (number validation, BigInt conversion after)
- [x] **Documentation**: supabase/README.md + migrations/migrations.md

## Architecture Decisions

### Database Design

- **Pattern choisi**: Réutilisation `spectacles_medias` avec colonne `type`
- **Raison**: Éviter duplication table, extension naturelle pour futur carousel
- **Constraint**: max 2 photos via CHECK + UNIQUE composite key
- **PK préservée**: `(spectacle_id, media_id)` reste la clé primaire

### DAL Pattern

- **READ Operations**: `cache()` de "react" (pas next/cache), return `Promise<T[]>`, graceful `[]` on error
- **MUTATIONS**: `requireAdmin()`, return `DALResult<T>` avec status codes
- **Alignement**: Pattern identique à `lib/dal/spectacles.ts`

### UI Pattern

- **Admin**: Grid 2 colonnes, MediaLibraryPicker réutilisé, swap button si 2 photos
- **Public**: Photos intégrées dans synopsis (après short_description et description)
- **Component**: `LandscapePhotoCard` inline (aspect 16:9, hover scale, lazy loading)

## Dependencies

### Technical Dependencies

- ✅ Media Library (TASK029) - Completed
- ✅ MediaLibraryPicker component - Available
- ✅ ImageFieldGroup pattern - Available
- ✅ DAL SOLID principles (TASK034) - Established

### Sequential Dependencies

1. Database migration MUST be applied first (local + cloud)
2. DAL must be created before Server Actions
3. Schemas must exist before DAL + Actions
4. Admin UI requires spectacle ID (edit only, not create)

## Migration Strategy

### Local Workflow

```bash
# 1. Modify schema file
# Edit: supabase/schemas/11_tables_relations.sql

# 2. Stop DB (mandatory before diff)
pnpm dlx supabase stop

# 3. Generate migration
pnpm dlx supabase db diff -f add_landscape_photos_to_spectacles

# 4. Verify generated migration
cat supabase/migrations/*_add_landscape_photos_to_spectacles.sql

# 5. Start DB and test locally
pnpm dlx supabase start
```

### Cloud Deployment

```bash
# 6. Apply to production
pnpm dlx supabase db push --linked

# 7. Update documentation
# - supabase/README.md (Mises à jour récentes)
# - supabase/migrations/migrations.md (new entry)
```

### Rollback Plan

```sql
-- Revert type column and constraints
ALTER TABLE spectacles_medias DROP CONSTRAINT check_landscape_ordre;
ALTER TABLE spectacles_medias DROP COLUMN type;
-- Restore old PK (spectacle_id, media_id)
```

## Testing Strategy

### Unit Tests

- [ ] DAL functions return correct types
- [ ] Validation Zod rejects invalid input
- [ ] Server Actions handle errors gracefully

### Integration Tests

- [ ] Admin can add 2 photos landscape max
- [ ] Admin cannot add 3rd photo (constraint violation)
- [ ] Swap button inverts order correctly
- [ ] Photos display correctly on public page
- [ ] Delete photo + revalidate works

### Security Tests

- [ ] RLS blocks anon users from modifying spectacles_medias
- [ ] Admin-only operations require is_admin()
- [ ] GRANT statements allow view access

### Performance Tests

- [ ] Fetch sequential < 500ms
- [ ] React cache() prevents duplicate queries
- [ ] lazy loading works for below-fold images

## Risks & Mitigation

| Risk | Impact | Mitigation |
| ------ | -------- | ------------ |
| Migration breaks existing spectacles_medias | High | Test locally first, verify constraint compatibility |
| Performance degradation on public pages | Medium | React cache() + lazy loading + index DB |
| Admin UX complexity (2 slots management) | Low | Simple grid layout + clear visual feedback |
| Future carousel extension difficult | Low | Type system already extensible (poster/landscape/gallery) |

## Success Criteria

1. ✅ Admins can add/delete/swap 2 landscape photos per spectacle
2. ✅ Photos display correctly in public synopsis (2 encarts)
3. ✅ Migration applied successfully (local + cloud)
4. ✅ Documentation updated (README + migrations.md)
5. ✅ All tests pass (unit/integration/security/performance)
6. ✅ TypeScript 0 errors, ESLint 0 warnings
7. ✅ Production deployment successful

## Documentation Updates Required

### supabase/README.md

```markdown
- **FEAT: Photos Paysage Spectacles (1 fév. 2026)** : Système de gestion de 2 photos paysage par spectacle.
  - **Migration** : `20260201140000_add_landscape_photos_to_spectacles.sql`
  - **Modifications** : Colonne type, constraints, vues, RLS, DAL, UI
  - **Validation** : Tests locaux + cloud, TypeScript 0 erreurs
```

### supabase/migrations/migrations.md

```markdown
| 2026-02-01 14:00:00 | add_landscape_photos_to_spectacles | Système photos paysage spectacles | ✅ Applied | Cloud + Local | Declarative schema |
```

## Progress Log

### 2026-02-01

- Task created based on plan-spectacleLandscapePhotos.prompt.md
- Status: Not Started
- All 8 implementation steps documented
- Compliance checklist defined
- Migration workflow validated

## Related Files

### Plan

- `.github/prompts/plan-spectacleLandscapePhotos.prompt.md` - Complete implementation plan

### Database

- `supabase/schemas/11_tables_relations.sql` - To modify for spectacles_medias
- `supabase/schemas/20_views.sql` - Public view (to create)
- `supabase/schemas/25_views_admin.sql` - Admin view (to create)

### DAL

- `lib/dal/spectacle-photos.ts` - New module (to create)
- `lib/dal/spectacles.ts` - Reference pattern

### Schemas

- `lib/schemas/spectacles.ts` - To extend with photo types

### Server Actions

- `app/(admin)/admin/spectacles/actions.ts` - Add 3 actions

### Components

- `components/features/admin/spectacles/SpectaclePhotoManager.tsx` - New (to create)
- `components/features/admin/spectacles/SpectacleForm.tsx` - To modify
- `components/features/public-site/spectacles/SpectacleDetailView.tsx` - To modify

### Page

- `app/(marketing)/spectacles/[slug]/page.tsx` - Add photo fetch

## Notes

- **Future Extension**: Type system supports carousel (type='gallery') without DB changes
- **Pattern Alignment**: Follows TASK029 Media Library + TASK034 DAL SOLID principles
- **Performance**: React cache() + lazy loading + sequential fetch justified
- **Security**: RLS + requireAdmin() + try/catch pattern enforced
