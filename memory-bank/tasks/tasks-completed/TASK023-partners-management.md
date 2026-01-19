# TASK023 - Partners Management

**Status:** Completed  
**Added:** 2025-10-16  
**Updated:** 2026-01-19  
**Completed:** 2026-01-19

## Original Request

Provide CRUD for partners with logos and display order so marketing can manage partner lists.

## Thought Process

Partners need logo uploads and a display-order field. Reuse Media Library for logos and provide drag-and-drop sorting in the admin UI.

## Implementation Summary

### Database & Schemas

- ✅ Migration `20260118234945_add_partners_media_folder.sql` - Dossier média `partners`
- ✅ Schémas Zod: `PartnerInputSchema` (server), `PartnerFormSchema` (UI), `ReorderPartnersSchema`
- ✅ DTO avec conversion `bigint` → `number` pour JSON serialization

### DAL (Data Access Layer)

- ✅ `lib/dal/admin-partners.ts` - CRUD admin (fetchAll, fetchById, create, update, delete, reorder)
- ✅ `lib/dal/home-partners.ts` - Lecture publique avec media join
- ✅ Pattern `buildMediaUrl()` pour logo depuis Media Library avec fallback `logo_url`

### Server Actions

- ✅ `app/(admin)/admin/partners/actions.ts` - Validation Zod + DAL + revalidatePath

### UI Admin

- ✅ Page liste: `/admin/partners` avec drag-and-drop (@dnd-kit/core)
- ✅ Pages new/edit: `/admin/partners/new`, `/admin/partners/[id]/edit`
- ✅ Formulaire avec `ImageFieldGroup` (Media Library integration)
- ✅ Sidebar admin: lien Partners avec icône `Handshake`

### Dashboard & Tests

- ✅ Dashboard stats: `partnersCount` ajouté
- ✅ Scripts de test mis à jour: `test-dashboard-stats.ts`, `test-all-dal-functions.ts`, `check-cloud-data.ts`

### Analytics

- ✅ Automatiquement tracké via pathname `/admin/partners`

## Progress Log

### 2026-01-19

- ✅ Migration `partners` media folder appliquée local + remote
- ✅ Dashboard stats avec Partners (5 cards)
- ✅ Scripts de test mis à jour
- ✅ Task completed and committed

### 2026-01-18

- ✅ BigInt serialization fixes (DTO number conversion)
- ✅ Logo display from Media Library (admin + public)
- ✅ Column name fixes (`is_active`, `storage_path`)

### 2025-10-16

- Task created from Milestone 2.

## shadcn / TweakCN checklist

- [x] Discover components with shadcn MCP: Image, Grid, DraggableList
- [x] Use `get-component-demo` for drag-and-drop and image usage
- [x] Ensure Media Library integration for logos and thumbnails
- [x] Apply TweakCN theme and verify logo scaling and grid behavior
- [x] Mobile responsiveness for partner lists and reordering UI
