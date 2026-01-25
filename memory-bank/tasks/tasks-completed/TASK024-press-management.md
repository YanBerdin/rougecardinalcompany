# TASK024 - Press Management

**Status:** ✅ Completed  
**Added:** 2025-10-16  
**Updated:** 2026-01-21  
**Completed:** 2026-01-21

## Original Request

Implement CRUD for press releases and press contacts so the press kit remains up-to-date.

## Thought Process

Press items may include attachments (PDFs) and rich text. Ensure storage handling and sanitize uploads. Provide preview and publish controls.

## Implementation Summary

### Modules Implemented (3)

1. **Communiqués de presse** (Press Releases) - CRUD + publish/unpublish + preview
2. **Articles de presse** (Press Articles) - CRUD + type enum
3. **Contacts presse** (Press Contacts) - CRUD + toggle active (admin-only)

### Files Created (31 total)

| Category | Files | Description |
|----------|-------|-------------|
| Schemas | 3 | `press-release.ts`, `press-article.ts`, `press-contact.ts` |
| DAL | 3 | `admin-press-releases.ts`, `admin-press-articles.ts`, `admin-press-contacts.ts` |
| Actions | 1 | `app/(admin)/admin/presse/actions.ts` (11 actions) |
| Routes | 10 | Main page + CRUD routes for 3 modules + preview |
| Components | 13 | Containers, Views, Forms for each module |
| Migration | 1 | PDF support for medias bucket |

### Key Features

- ✅ CRUD complet pour 3 entités
- ✅ Workflow brouillon/publié (is_public boolean)
- ✅ Preview page pour communiqués
- ✅ Relations optionnelles spectacle/événement
- ✅ Toggle active/inactive pour contacts
- ✅ Tags spécialités (array) pour contacts
- ✅ Type enum pour articles (Article/Critique/Interview/Portrait)

## Progress Log

### 2025-10-16

- Task file generated from epic.

### 2026-01-21 (Implementation)

- ✅ Created 3 Zod schemas (Server + UI separation for bigint/number)
- ✅ Created 3 DAL modules (21 functions total)
- ✅ Created Server Actions file (11 actions)
- ✅ Created admin routes with Tabs navigation
- ✅ Created 13 UI components (Container/View/Form pattern)
- ✅ Added PDF support migration for medias bucket
- ✅ Added sidebar navigation link (Newspaper icon)

### 2026-01-21 (Corrections Session)

- ✅ Fixed PressContact column names (French: `media`, `specialites`, `actif`, `derniere_interaction`)
- ✅ Fixed Preview page property names (`title` not `titre`, `description` not `extrait`)
- ✅ TypeScript validation: 0 errors
- ✅ Browser test: Preview page displays correctly

### 2026-01-21 (Validation Fixes)

- ✅ Fixed PressReleaseInputSchema: empty string → null transforms for `slug`, `description`, `image_url`
- ✅ Fixed ArticleInputSchema: empty string → null transforms for `slug`, `author`, `chapo`, `excerpt`, `source_publication`, `source_url`
- ✅ Fixed `set_slug_if_empty()` trigger: added support for `communiques_presse` table
- ✅ Generated migration `20260121205257_fix_communiques_slug_trigger.sql`
- ✅ Applied migration to local database (`db reset`)
- ✅ Applied migration to remote database (`db push`)
- ✅ Verified TypeScript compilation: 0 errors

## Documentation

- **Summary**: `doc/TASK024-press-management-summary.md`
- **Plan**: `.github/prompts/plan-TASK024-pressManagement.prompt.md`

## shadcn / TweakCN checklist

- [x] Use shadcn components: Card, Badge, Button, Input, Textarea, Select, Switch, Tabs
- [x] Verify that previews use consistent styling
- [x] Apply TweakCN theme
- [x] Accessibility: proper labels, keyboard navigation
