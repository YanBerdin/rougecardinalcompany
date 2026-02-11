# Mapping Documentation: TeamMember (Database → View)

**Date:** 17 octobre 2025  
**Feature:** Public-site Compagnie page  
**Files involved:**

- `lib/dal/compagnie.ts` - Data Access Layer (fetches from DB)
- `components/features/public-site/compagnie/CompagnieContainer.tsx` - Data mapping
- `components/features/public-site/compagnie/types.ts` - Zod schema
- `components/features/public-site/compagnie/CompagnieView.tsx` - UI rendering

---

## 📊 Field Mapping Table

| Database Field (`TeamMemberRecord`) | View Field (`TeamMember`) | Mapping Logic | Notes |
|-------------------------------------|---------------------------|---------------|-------|
| `id: number` | ❌ Not exposed | Omitted | ID not needed in public view |
| `name: string` | `name: string` | Direct mapping | Required field, always present |
| `role: string \| null` | `role: string \| null` | **Preserve null** | Optional, nullable in view |
| `description: string \| null` | `description: string \| null` | **Preserve null** | Optional, nullable in view |
| `image_url: string \| null` | `image: string` | **Virtual field mapping** | See details below |
| `photo_media_id: number \| null` | `image: string` | **Virtual field mapping** | See details below |
| `ordre: number` | ❌ Not exposed | Omitted | Used for sorting in DAL query |
| `active: boolean` | ❌ Not exposed | Omitted | Filtered in DAL query (active=true) |
| `created_at: string` | ❌ Not exposed | Omitted | Metadata not needed in view |
| `updated_at: string` | ❌ Not exposed | Omitted | Metadata not needed in view |

---

## 🔄 Virtual Field: `image`

The `image` field in the view schema is **VIRTUAL** - it doesn't exist in the database. It's constructed from two possible sources:

### Mapping Logic (Current Implementation)

```typescript
// In CompagnieContainer.tsx
team.map((m) => ({
  name: m.name,
  role: m.role, // Preserve null
  description: m.description, // Preserve null
  // Virtual field: maps from image_url (external) or photo_media_id (Media Library)
  // TODO TASK022: Implement photo_media_id → medias table lookup when Media Library is used
  image: m.image_url ?? "/logo-florian.png",
}))
```

### Current Behavior

| Scenario | Database State | View Result | Explanation |
|----------|----------------|-------------|-------------|
| **External URL** | `image_url: "https://..."`, `photo_media_id: null` | `image: "https://..."` | Uses external URL directly |
| **No image** | `image_url: null`, `photo_media_id: null` | `image: "/logo-florian.png"` | Falls back to default placeholder |
| **Media Library (TODO)** | `image_url: null`, `photo_media_id: 42` | `image: "/logo-florian.png"` | ⚠️ **NOT YET IMPLEMENTED** - should lookup medias table |

### Future Implementation (TASK022)

When implementing the admin interface, the mapping should be enhanced to support `photo_media_id`:

```typescript
// Enhanced mapping (to implement in TASK022)
const getTeamMemberImage = async (member: TeamMemberRecord): Promise<string> => {
  // Priority 1: Media Library (preferred)
  if (member.photo_media_id) {
    const media = await fetchMediaById(member.photo_media_id);
    if (media?.url) return media.url;
  }
  
  // Priority 2: External URL (legacy)
  if (member.image_url) {
    return member.image_url;
  }
  
  // Priority 3: Fallback placeholder
  return "/logo-florian.png";
};

// Usage
team: await Promise.all(team.map(async (m) => ({
  name: m.name,
  role: m.role,
  description: m.description,
  image: await getTeamMemberImage(m),
})))
```

---

## 🚨 Important: Null Handling

### ✅ CORRECT: Preserve null values

```typescript
// ✅ GOOD: Preserves type safety and null semantics
{
  role: m.role, // string | null
  description: m.description, // string | null
}
```

**Benefits:**

- Type safety maintained (`TeamMemberSchema` expects `string | null`)
- UI can conditionally render fields
- Semantic meaning preserved (missing vs empty string)

### ❌ INCORRECT: Force null to empty string

```typescript
// ❌ BAD: Loses null information
{
  role: m.role ?? "", // Forces null → ""
  description: m.description ?? "", // Forces null → ""
}
```

**Problems:**

- Loses distinction between "not set" (null) and "explicitly empty" ("")
- Forces UI to always render fields (even if empty)
- Breaks type expectations

---

## 🎨 UI Rendering (CompagnieView.tsx)

The view component handles nullable fields gracefully:

```tsx
<CardContent className="p-6">
  <h3 className="text-xl font-semibold mb-2">
    {member.name} {/* Always present */}
  </h3>
  {member.role && ( // Conditional rendering if not null
    <p className="text-primary font-medium mb-3">
      {member.role}
    </p>
  )}
  {member.description && ( // Conditional rendering if not null
    <p className="text-muted-foreground text-sm leading-relaxed">
      {member.description}
    </p>
  )}
</CardContent>
```

**Result:**

- If `role` is `null`: role paragraph is not rendered
- If `description` is `null`: description paragraph is not rendered
- Clean UI without empty placeholders

---

## 📝 Type Definitions

### Database Layer (`lib/dal/compagnie.ts`)

```typescript
export type TeamMemberRecord = {
  id: number;
  name: string;
  role: string | null;
  description: string | null;
  image_url: string | null;
  photo_media_id: number | null;
  ordre: number;
  active: boolean;
};
```

### View Layer (`components/features/public-site/compagnie/types.ts`)

```typescript
// Simplified schema for PUBLIC view
// Note: This is intentionally different from Database schema
export const TeamMemberSchema = z.object({
  name: z.string(),
  role: z.string().nullable(), // Aligned with DB
  description: z.string().nullable(), // Aligned with DB
  image: z.string(), // Virtual field (mapped from image_url or photo_media_id)
});

export type TeamMember = z.infer<typeof TeamMemberSchema>;
```

**Key differences:**

- View schema has **4 fields** (simplified for display)
- Database has **11 fields** (complete table representation)
- View omits: `id`, `ordre`, `active`, `created_at`, `updated_at`
- View adds: `image` (virtual, computed from `image_url` or `photo_media_id`)

---

## 🔍 Coherence Verification

### Type Alignment

| Aspect | Status | Details |
|--------|--------|---------|
| **Nullability** | ✅ Aligned | `role` and `description` are nullable in both DB and view |
| **Field types** | ✅ Aligned | All common fields use same types (string, number, boolean) |
| **Virtual field** | ✅ Documented | `image` mapping clearly documented with TODO for Media Library |
| **Omitted fields** | ✅ Intentional | ID, metadata, and filtering fields intentionally excluded from public view |

### TypeScript Validation

All type checks pass:

```bash
$ pnpm tsc --noEmit
# ✅ No errors
```

---

## 📋 Maintenance Checklist

When modifying the team member data flow:

- [ ] Update `TeamMemberRecord` type if database schema changes
- [ ] Update `TeamMemberSchema` if view requirements change
- [ ] Update mapping in `CompagnieContainer.tsx` to match types
- [ ] Update `CompagnieView.tsx` UI if new fields are added
- [ ] Run TypeScript check: `pnpm tsc --noEmit`
- [ ] Test with null values in database
- [ ] Document any new virtual fields or mapping logic
- [ ] Update this MAPPING.md file with changes

---

## 🚀 Related Tasks

- **TASK022**: Admin interface for team management
  - Will create separate admin schema in `lib/schemas/team.ts`
  - Will implement `photo_media_id` → Media Library lookup
  - Will add full CRUD operations with all database fields
  - See: `doc-perso/Appliquer-instructions-plan/TASK022-team-management-instructions.md`

---

**Last Updated:** 17 octobre 2025  
**Status:** ✅ Production-ready with documented TODO for Media Library enhancement
