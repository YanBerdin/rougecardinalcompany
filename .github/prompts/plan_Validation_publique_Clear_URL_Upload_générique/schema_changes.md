# Schema Changes: Status Field Normalization

**Date**: December 2025
**Version**: 1.5.0  
**Impact**: ✅ Breaking change (validation only)

---

## 📋 Overview

Normalized spectacle `status` values to use consistent English terms without underscores.

### Before (v1.4)

```typescript
status: z.enum([
  "draft", "published", "archived",  // English
  "brouillon", "actuellement", "archive"  // French aliases
])
```

### After (v1.5)

```typescript
status: z.enum(["draft", "published", "archived"])  // English only
```

---

## 🎯 Rationale

### Problem

1. **Inconsistent naming**: Mix of English and French terms
2. **Maintenance burden**: Two parallel naming conventions
3. **UI complexity**: Translation layer needed everywhere
4. **Database confusion**: Which values are canonical?

### Solution

**Canonical status values** (English only):

- `"draft"` - Work in progress, not published
- `"published"` - Currently active/running
- `"archived"` - Completed, historical

**UI translations** (handled by components):

- `"draft"` → "Brouillon"
- `"published"` → "Actuellement"
- `"archived"` → "Archive"

---

## 🔄 Migration Path

### Database Migration

**Step 1**: No database migration needed!

The database column `spectacles.status` is `text` (not enum), so existing values remain untouched.

**Existing data**:

```sql
SELECT DISTINCT status FROM spectacles;
-- Results might include: "draft", "brouillon", "en cours", "actuellement", etc.
```

**Action**: None required (old values still work)

---

### Code Migration

**Step 2**: Update Zod schemas

**File**: `lib/schemas/spectacles.ts`

**Before**:

```typescript
status: z.enum([
  "draft", "published", "archived",
  "brouillon", "actuellement", "archive"
])
```

**After**:

```typescript
status: z.enum(["draft", "published", "archived"])
```

**Impact**: ✅ Validation rejects old French aliases for new records

---

**Step 3**: Update form helpers

**File**: `lib/forms/spectacle-form-helpers.ts`

**Before**:

```typescript
status: z.enum([
  "draft", "published", "archived",
  "brouillon", "actuellement", "archive"
]).optional()
```

**After**:

```typescript
status: z.enum(["draft", "published", "archived"]).optional().default("draft")
```

**Impact**: ✅ Forms always submit English values

---

### UI Migration

**Step 4**: Add translation helper

**File**: `lib/tables/spectacle-table-helpers.ts`

**New function**:

```typescript
/**
 * Translates status to French for UI display
 */
export function translateStatus(status: string): string {
  const translations: Record<string, string> = {
    draft: "Brouillon",
    published: "Actuellement",
    archived: "Archive",
    // Legacy aliases (for backward compat)
    brouillon: "Brouillon",
    actuellement: "Actuellement",
    archive: "Archive",
    "en cours": "Actuellement",
  };

  return translations[status] ?? status;
}
```

**Usage**:

```tsx
<TableCell>
  {translateStatus(spectacle.status)}
</TableCell>
```

---

## 📊 Impact Analysis

### Existing Records

**Query**: Check current status distribution

```sql
SELECT status, COUNT(*) as count
FROM spectacles
GROUP BY status
ORDER BY count DESC;
```

**Example results**:

```bash
status          | count
----------------|------
draft           | 15
brouillon       | 3    ← Will still work (backward compat)
published       | 8
actuellement    | 2    ← Will still work
archived        | 5
```

**Impact**: ✅ No data loss, all existing records remain valid

---

### New Records

**Validation behavior**:

```typescript
// ❌ This will fail validation (French alias rejected)
await createSpectacle({ title: "Test", status: "brouillon" });
// Error: Invalid enum value. Expected 'draft' | 'published' | 'archived'

// ✅ This will succeed
await createSpectacle({ title: "Test", status: "draft" });
```

**UI behavior**:

```tsx
// Forms always send English values
<Select value={status} onChange={setStatus}>
  <SelectItem value="draft">Brouillon</SelectItem>        {/* Sends "draft" */}
  <SelectItem value="published">Actuellement</SelectItem>  {/* Sends "published" */}
  <SelectItem value="archived">Archive</SelectItem>        {/* Sends "archived" */}
</Select>
```

---

## ✅ Backward Compatibility

### Reading (SELECT)

**Status**: ✅ Full backward compatibility

All existing status values continue to work:

- Database queries unchanged
- UI displays all status values correctly (via `translateStatus()`)
- Filters work with old and new values

---

### Writing (INSERT/UPDATE)

**Status**: ⚠️ Validation enforced for new operations

**For new records**:

- ✅ Must use English values (`"draft"`, `"published"`, `"archived"`)
- ❌ French aliases rejected by Zod validation

**For existing records**:

- ✅ Can still be updated (database allows any text)
- ⚠️ Form will convert to English on save

---

## 🧹 Cleanup Task (Optional)

To fully standardize the database (recommended but not required):

**SQL Migration**:

```sql
-- Normalize existing French values to English
UPDATE spectacles
SET status = CASE
  WHEN status IN ('brouillon') THEN 'draft'
  WHEN status IN ('actuellement', 'en cours', 'a l''affiche') THEN 'published'
  WHEN status IN ('archive', 'terminé') THEN 'archived'
  ELSE status  -- Keep unknown values unchanged
END
WHERE status NOT IN ('draft', 'published', 'archived');

-- Verify
SELECT DISTINCT status FROM spectacles;
-- Expected: draft, published, archived
```

**Timing**: Can be done anytime (low risk)

---

## 🐛 Known Issues

### Issue 1: Legacy status in public pages

**Symptom**: Old spectacles show untranslated status

**Cause**: Missing `translateStatus()` call in public components

**Fix**:

```typescript
// Before
<span>{spectacle.status}</span>  // Shows "brouillon"

// After
<span>{translateStatus(spectacle.status)}</span>  // Shows "Brouillon"
```

---

### Issue 2: Filter not working for old values

**Symptom**: Filtering by "published" doesn't show "actuellement" records

**Cause**: Filter uses English value, doesn't account for aliases

**Fix**: Use SQL `IN` clause

```sql
-- Before
WHERE status = 'published'

-- After
WHERE status IN ('published', 'actuellement', 'en cours', 'a l''affiche')
```

---

## 📝 Checklist

### Pre-Deployment

- [x] Update Zod schemas (`lib/schemas/spectacles.ts`)
- [x] Update form schemas (`lib/forms/spectacle-form-helpers.ts`)
- [x] Add `translateStatus()` helper
- [x] Update UI components to use translation
- [x] Test form submission (validates English only)
- [x] Test existing record display (all values show correctly)

### Post-Deployment (Optional)

- [ ] Run data cleanup SQL (normalize old values)
- [ ] Verify no untranslated status in public pages
- [ ] Update documentation
- [ ] Remove legacy translation logic (v2.0)

---

## 🚀 Future Improvements (v2.0)

1. **Database enum constraint**: Enforce valid statuses at DB level

   ```sql
   ALTER TABLE spectacles
   ADD CONSTRAINT status_check
   CHECK (status IN ('draft', 'published', 'archived'));
   ```

2. **Remove translation layer**: All records use English values
   - Deprecate `translateStatus()` function
   - Update public pages to use raw status

3. **Add status workflow**: State machine for transitions
   - `draft` → `published`
   - `published` → `archived`
   - Block invalid transitions

---

## 📚 References

- [Spectacle Schema](../lib/schemas/spectacles.ts)
- [Form Helpers](../lib/forms/spectacle-form-helpers.ts)
- [Table Helpers](../lib/tables/spectacle-table-helpers.ts)
- [Zod Enums](https://zod.dev/?id=zod-enums)

---

**Questions?** Contact the engineering team or check the #schema-changes Slack channel.
