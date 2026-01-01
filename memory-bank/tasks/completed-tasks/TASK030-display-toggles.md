# \[TASK030] - Display Toggles

**Status:** ✅ **Completed**
**Added:** 2025-10-16  
**Updated:** 2026-01-01
**Completed:** 2026-01-01

## Original Request

Implement display toggles to control visibility of newsletter, partners, and featured content sections across public site pages.

## Thought Process

Toggles are configuration stored in DB and read by public pages; ensure fast reads and immediate effect. Provide admin toggles and audit logging.

## Implementation Summary

**Phases Completed:** 1-11

- **Phases 1-10:** Epic-aligned toggles (Home, Agenda, Contact, Newsletter, Partners)
- **Phase 11:** Presse toggles fix (split into Media Kit + Press Releases)

**Final State:**

- **Total Toggles:** 10 (across 5 categories)
- **Database:** `configurations_site` table with RLS policies
- **Admin UI:** Display Toggles management interface
- **Public Pages:** Conditional rendering based on toggle state

### Toggles by Category

| Category | Toggles | Count |
| ---------- | --------- | ------- |
| `home_display` | hero, about, spectacles, a_la_une, partners, newsletter | 6 |
| `agenda_display` | newsletter | 1 |
| `contact_display` | newsletter | 1 |
| `presse_display` | media_kit, presse_articles | 2 |
| **TOTAL** | | **10** |

## Implementation Details

### Database Schema

**Table:** `public.configurations_site`

```sql
create table public.configurations_site (
  id bigint generated always as identity primary key,
  key text unique not null,
  value jsonb not null,
  description text,
  category text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

**RLS Policies:**

- Public: Read-only access to published toggles
- Admin: Full CRUD access via `is_admin()` check

### Key Migrations

1. **20260101160100** - Initial seed (9 toggles)
2. **20260101170000** - Cleanup compagnie + add Epic toggles
3. **20260101180000** - Fix cleanup verification
4. **20260101220000** - **Phase 11: Split presse toggle into 2 independent toggles**

### Phase 11: Presse Toggles Fix (2026-01-01)

**Problem Identified:**

- Only 1 presse toggle existed (`display_toggle_presse_articles`)
- This toggle controlled Media Kit section (wrong naming)
- Missing separate toggle for Press Releases section
- Legacy keys were different than expected:
  - `public:presse:media_kit_enabled` (not transformed)
  - `public:presse:communiques_enabled` (not transformed)

**Solution Applied:**

**Migration 20260101220000:**

```sql
-- Transform legacy key for Media Kit
do $$
begin
  if exists (select 1 from public.configurations_site where key = 'public:presse:media_kit_enabled') then
    update public.configurations_site 
    set key = 'display_toggle_media_kit',
        description = 'Afficher la section Kit Média'
    where key = 'public:presse:media_kit_enabled';
  end if;
end $$;

-- Transform legacy key for Press Releases
do $$
begin
  if exists (select 1 from public.configurations_site where key = 'public:presse:communiques_enabled') then
    update public.configurations_site 
    set key = 'display_toggle_presse_articles',
        description = 'Afficher la section Communiqués de Presse'
    where key = 'public:presse:communiques_enabled';
  end if;
end $$;
```

**Component Changes:**

1. **PresseServerGate.tsx** - Dual independent toggle fetches:

```typescript
const mediaKitToggle = await fetchDisplayToggle("display_toggle_media_kit");
const pressReleasesToggle = await fetchDisplayToggle("display_toggle_presse_articles");

const showMediaKit = mediaKitToggle.success && mediaKitToggle.data?.value?.enabled !== false;
const showPressReleases = pressReleasesToggle.success && pressReleasesToggle.data?.value?.enabled !== false;
```

2. **PresseView.tsx** - Conditional section rendering:

```typescript
{pressReleases.length > 0 && (
  <section>
    <h2>Communiqués de Presse</h2>
    {/* content */}
  </section>
)}

{mediaKit.length > 0 && (
  <section>
    <h2>Kit Média</h2>
    {/* content */}
  </section>
)}
```

**Utility Scripts Created:**

1. **scripts/check-presse-toggles.ts** - Verification utility:

```bash
pnpm exec tsx scripts/check-presse-toggles.ts
# Output: Lists all presse toggles with status
```

2. **scripts/toggle-presse.ts** - Testing utility:

```bash
# Enable both toggles
pnpm exec tsx scripts/toggle-presse.ts enable-all

# Disable both toggles
pnpm exec tsx scripts/toggle-presse.ts disable-all

# Enable only Media Kit
pnpm exec tsx scripts/toggle-presse.ts enable-media-kit

# Enable only Press Releases
pnpm exec tsx scripts/toggle-presse.ts enable-press-releases
```

## Progress Log

### 2025-10-16

- Task created from Milestone 3
- Initial planning and schema design

### 2026-01-01 (Phases 1-10)

- Epic alignment completed
- 9 toggles created across Home, Agenda, Contact
- Admin UI implemented
- Component integration validated

### 2026-01-01 (Phase 11 - Presse Fix)

- **Issue identified:** Only 1 presse toggle instead of 2
- **Root cause:** Migration 20260101210000 failed (original toggle didn't exist)
- **Migration 20260101220000 created:** Idempotent transformation of legacy keys
- **Component fixes:** PresseServerGate (dual toggles) + PresseView (conditional sections)
- **Scripts created:** check-presse-toggles.ts + toggle-presse.ts
- **Testing completed:** All toggle combinations validated
- **Documentation updated:** plan-task030DisplayTogglesEpicAlignment.prompt.md
- **Commit:** b27059f - "feat(presse): separate Media Kit and Press Releases toggles + hide disabled sections"

## Files Modified/Created (Phase 11)

| File | Type | Description |
| ------ | ------ | ------------- |
| `supabase/migrations/20260101220000_fix_presse_toggles.sql` | NEW | Idempotent toggle transformation |
| `components/features/public-site/presse/PresseServerGate.tsx` | MODIFIED | Dual independent toggle fetches |
| `components/features/public-site/presse/PresseView.tsx` | MODIFIED | Conditional section rendering |
| `scripts/check-presse-toggles.ts` | NEW | Verification utility |
| `scripts/toggle-presse.ts` | NEW | Testing utility (4 modes) |
| `.github/prompts/plan-task030DisplayTogglesEpicAlignment.prompt.md` | MODIFIED | Phase 11 documentation |

## Validation Tests (Phase 11)

```bash
# 1. Check toggle existence (expect 2 presse toggles)
pnpm exec tsx scripts/check-presse-toggles.ts

# 2. Test all disabled (expect 0 sections)
pnpm exec tsx scripts/toggle-presse.ts disable-all
# Visit /presse - should show no content sections

# 3. Test Media Kit only (expect 1 section)
pnpm exec tsx scripts/toggle-presse.ts enable-media-kit
# Visit /presse - should show only Media Kit

# 4. Test Press Releases only (expect 1 section)
pnpm exec tsx scripts/toggle-presse.ts enable-press-releases
# Visit /presse - should show only Communiqués

# 5. Test all enabled (expect 2 sections)
pnpm exec tsx scripts/toggle-presse.ts enable-all
# Visit /presse - should show both sections
```

**Expected State After Tests:**

- Database: 10 toggles total (6 home, 1 agenda, 1 contact, 2 presse)
- Presse page: 5 sections total (intro + 2 toggle-controlled + footer)
- Component: Sections completely hidden when toggles disabled

## Related Issues

- Issue #10 - Display Toggles Implementation (if created)
- TASK014 - Back-office toggles centralisés (related)

## Next Steps (Post-Completion)

- [X] Push feat-display-toggles branch to remote
- [X] Create pull request for review
- [X] Test on staging environment
- [X] Merge to main after approval
- [X] Update memory-bank with final status

## Lessons Learned

1. **Always verify database state before writing migrations** - Don't assume toggle names
2. **Use idempotent logic** - DO blocks with existence checks prevent errors on reapply
3. **Service role key required** - Admin operations blocked by RLS for anon key
4. **Conditional rendering must wrap entire section** - Not just content, but title too
5. **Legacy keys differ from documentation** - Verify actual values in production database
