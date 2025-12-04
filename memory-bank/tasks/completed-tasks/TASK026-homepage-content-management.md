# `TASK026` - Homepage Content Management

**Status:** Completed  
**Added:** 2025-10-16  
**Updated:** 2025-12-04  
**Completed:** 2025-11-23  
**Refined:** 2025-11-27 (Clean Code & TypeScript Conformity)  
**API Cleanup:** 2025-12-04 (API Routes → Server Actions migration)

## Original Request

Implement complete admin interface for managing homepage content: Hero Slides (CRUD + reorder), About Section (single record editor), and News Highlights (featured flag). Follow TASK021 pattern: DAL → API Routes → Admin UI.

## Implementation Summary

✅ **Complete** - All 14 groups implemented and tested:

### Backend Infrastructure (Groups 1-7)

- Database RPC function for atomic reordering (with SECURITY DEFINER)
- Zod validation schemas with business rule refinements
- Image URL validation helper (MIME type check, 5s timeout)
- Hero slides DAL: fetchAll, fetchById, create, update, delete, reorder (6 functions)
- About content DAL: fetchActive, update (2 functions)
- ~~API routes: 6 hero endpoints + 2 about endpoints~~ → **Server Actions** (déc. 2025)

### UI Components (Groups 8-10)

- Loading skeletons with Suspense boundaries
- HeroSlidesContainer (server) → HeroSlidesView (client with DnD Kit)
- HeroSlideForm: React Hook Form + Zod + MediaPickerDialog
- HeroSlidePreview: Inline slide preview
- AboutContentContainer (server) → AboutContentForm (client)
- Admin page routes with metadata

### Polish & Deployment (Groups 11-14)

- Sidebar navigation updates ("Accueil" section)
- Error boundary for graceful error handling
- Debounce hook for form optimization
- API integration test script with npm command

## Progress Tracking

**Completion: 100%** - All 24 subtasks completed

| Group | Description | Files | Status |
|-------|-------------|-------|--------|
| 1 | Database schema + RPC | 1 | ✅ Complete |
| 2 | Zod validation schemas | 1 | ✅ Complete |
| 3 | Image URL validation | 1 | ✅ Complete |
| 4 | Hero DAL (6 functions) | 1 | ✅ Complete |
| 5 | About DAL (2 functions) | 1 | ✅ Complete |
| 6 | ~~Hero API routes~~ → Server Actions | 3→1 | 🗑️ Déprécié (déc. 2025) |
| 7 | ~~About API routes~~ → Server Actions | 2→1 | 🗑️ Déprécié (déc. 2025) |
| 8 | Loading skeletons | 2 | ✅ Complete |
| 9 | Hero admin UI + page | 5 | ✅ Complete |
| 10 | About admin UI + page | 3 | ✅ Complete |
| 11 | Sidebar navigation | 1 updated | ✅ Complete |
| 12 | Error handling + hooks | 2 | ✅ Complete |
| 13 | Test scripts | 1 + npm script | ✅ Complete |
| 14 | Documentation | Task file | ✅ Complete |

## Key Achievements

### Architecture Excellence

- Server/Client component split (Suspense boundaries, skeleton loading)
- Complete DAL pattern with error codes [ERR_HERO_001-006], [ERR_ABOUT_001-002]
- Zod validation at multiple layers (schema, API, form)
- Atomic database operations (RPC with advisory lock)

### User Experience

- DnD Kit drag-drop with keyboard accessibility
- Optimistic UI updates with error rollback
- Character counters for accessibility
- Max 10 slides enforced (database trigger + UI validation)
- Toast notifications for all actions

### Security & Performance

- requireAdmin() guards on all mutations
- Server-only DAL with "use server" + "server-only" directives
- RLS policies on all affected tables
- Automatic revalidatePath() after mutations
- Image URL validation before storage

### Design Quality

- shadcn/ui components via MCP
- rouge-cardinal-frontend-skill directives applied
- Production-grade error boundaries
- Responsive design across all viewports

## Files Created/Modified

**Backend** (10 new files + 2 action files):

- supabase/schemas/63b_reorder_hero_slides.sql
- lib/schemas/home-content.ts (+ UI schemas added 2025-11-27)
- lib/utils/validate-image-url.ts
- lib/dal/admin-home-hero.ts
- lib/dal/admin-home-about.ts (revalidatePath removed 2025-11-27)
- lib/actions/home-about-actions.ts (NEW 2025-11-27)
- app/(admin)/admin/home/hero/actions.ts (NEW déc. 2025)
- ~~app/api/admin/home/hero/*~~ (3 route files) → SUPPRIMÉES (déc. 2025)
- ~~app/api/admin/home/about/*~~ (DELETED 2025-11-27 — migrated to Server Actions)

**UI** (11 new files + 2 sub-components):

- components/skeletons/* (2 skeleton files)
- components/features/admin/home/* (7 component files)
- components/features/admin/home/HeroSlideFormFields.tsx (NEW 2025-11-27)
- components/features/admin/home/HeroSlideImageSection.tsx (NEW 2025-11-27)
- app/(admin)/admin/home/* (2 page files)

**Infrastructure** (3 modified/new files):

- lib/hooks/use-debounce.ts
- ~~scripts/test-home-hero-api.ts~~ → archivé dans `doc-perso/scripts-archived/` (déc. 2025)
- components/admin/AdminSidebar.tsx (updated)
- package.json (updated)

## Testing

✅ Manual testing checklist (from TASK026 instructions Group 11):

- [x] Create new slide with all fields
- [x] Create slide with only required fields
- [x] Upload image from media library
- [x] Edit existing slide
- [x] Drag-drop reorder slides
- [x] Delete slide (soft delete)
- [x] Verify max 10 active slides enforced
- [x] Test form validation
- [x] Test character limits on all fields
- [x] Verify revalidation after mutations

**~~API Testing~~** (Obsolète — API Routes supprimées):

- ~~Run: `pnpm test:hero-api`~~ — Script archivé
- Tests passés via Server Actions (déc. 2025)

## Progress Log

### 2025-11-12

**Completion Session**:

- ✅ Groups 1-7: Backend infrastructure (10 files)
  - Database RPC with SECURITY DEFINER rationale header
  - 8 DAL functions with error codes
  - 9 API route handlers
  
- ✅ Groups 8-10: React UI components (15 files)
  - DnD Kit drag-drop with optimistic updates
  - Form components with character counters
  - Loading skeletons with Suspense
  - Admin page routes
  
- ✅ Groups 11-13: Polish & deployment (6 files)
  - Sidebar navigation integration
  - Error boundary + debounce hook
  - API test script with npm command

**Validations**:

- All TypeScript strict mode compliance
- Zod validation at API boundaries
- Error handling with structured error codes
- RLS policies on all operations
- Accessibility features (alt text, character counters, keyboard nav)

**Key Design Decisions**:

1. DnD Kit over alternatives: Better TS support, smaller bundle, active maintenance
2. Optimistic UI with rollback: Better perceived performance
3. Character counters: Real-time accessibility feedback
4. Dual validation (DB trigger + UI): Defense in depth

## Next Iterations (Future)

Optional enhancements per Group 14:

- Scheduled publishing (publish_at, unpublish_at)
- Content versioning with rollback
- Analytics integration (click tracking)
- A/B testing for slide variants
- Multi-language support (i18n)
- Image optimization (WebP, responsive sizes)
- Video background support
- Keyboard shortcuts for power users

---

## Post-Completion Refinement: Clean Code & TypeScript Conformity

**Date:** 2025-11-27  
**Plan:** `.github/prompts/plan-cleanCodeTypeScriptConformity.prompt.md`  
**Commit:** `8aaefe1`

### Overview

Applied Clean Code & TypeScript conformity plan to align About Content CRUD with established patterns and ensure code maintainability.

### Changes Applied (8 Steps)

| Step | Description | Status |
|------|-------------|--------|
| 1 | Create `lib/actions/home-about-actions.ts` Server Actions | ✅ |
| 2 | Remove `revalidatePath()` from DAL `admin-home-about.ts` | ✅ |
| 3 | Add UI schemas to `lib/schemas/home-content.ts` | ✅ |
| 4 | Update `AboutContentForm.tsx` to use Server Actions | ✅ |
| 5 | Delete obsolete API routes (`about/route.ts`, `about/[id]/route.ts`) | ✅ |
| 6 | Split `HeroSlideForm.tsx` into sub-components (<300 lines) | ✅ |
| 7 | TypeScript compilation validation | ✅ |
| 8 | Update plan status | ✅ |

### New Files Created

```
lib/actions/home-about-actions.ts        # Server Actions (create, update, delete)
components/features/admin/home/
├── HeroSlideFormFields.tsx              # Text fields sub-component (143 lines)
└── HeroSlideImageSection.tsx            # Image picker sub-component (85 lines)
```

### Files Modified

```
lib/dal/admin-home-about.ts              # Removed revalidatePath() (DAL-only)
lib/schemas/home-content.ts              # Added UI schemas (number vs bigint)
components/features/admin/home/
├── AboutContentForm.tsx                 # fetch→Server Action migration
└── HeroSlideForm.tsx                    # 316→200 lines (sub-components)
```

### Files Deleted

```
app/api/admin/home/about/route.ts        # Obsolete GET/POST
app/api/admin/home/about/[id]/route.ts   # Obsolete PATCH/DELETE
```

### Key Pattern Applied: UI Schemas

Solved BigInt JSON serialization issue by creating separate Zod schemas:

```typescript
// Server schema (DAL/DB) — uses bigint
export const HomeAboutContentInputSchema = z.object({
  image_media_id: z.coerce.bigint().optional(),
});

// UI schema (Forms) — uses number  
export const HomeAboutContentFormSchema = z.object({
  image_media_id: z.number().int().positive().optional(),
});
```

### Component Split Pattern

Applied <300 lines rule to `HeroSlideForm.tsx`:

| Component | Lines | Responsibility |
|-----------|-------|----------------|
| `HeroSlideForm.tsx` | 200 | Main dialog + form orchestration |
| `HeroSlideFormFields.tsx` | 143 | Title, subtitle, description, CTA, toggle |
| `HeroSlideImageSection.tsx` | 85 | Media picker, preview, alt text |

### Documentation Updated

- `.github/instructions/crud-server-actions-pattern.instructions.md` v1.0 → v1.1
  - Added UI schemas pattern documentation
  - Added component split rules (<300 lines)
  - Added errors 5-6 (type casting, obsolete API routes)
  - Extended checklist with new validations

### Validation

- ✅ TypeScript: `npx tsc --noEmit` — 0 errors
- ✅ All Server Actions use `"use server"` + `import "server-only"`
- ✅ All `revalidatePath()` calls in Server Actions only
- ✅ All forms use UI schemas (no type casting)

## Related Resources

- `.github/instructions/TASK026-homepage-content-management.instructions.md` - Full specifications
- `.github/instructions/nextjs-supabase-auth-2025.instructions.md` - Auth patterns
- `.github/copilot-instructions.md` - Architecture guidelines
- DnD Kit: https://docs.dndkit.com/
- React Hook Form: https://react-hook-form.com/
- Zod: https://zod.dev/
