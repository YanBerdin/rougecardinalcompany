# Migration Guide: Public Validation + Generic Upload

**Date**: December 2025  
**Version**: 1.5.0 → 2.0.0  
**Status**: ✅ Implemented, 🔄 Backward Compatible

---

## 📋 Overview

This migration introduces:

1. **Generic media upload actions** - Reusable across all entities
2. **Enhanced public validation** - Dynamic field requirements for spectacles
3. **Improved UX** - Clear URL button, upload integration, visual feedback

---

## 🆕 New Features

### 1. Generic Media Upload (`lib/actions/media-actions.ts`)

**Before** (entity-specific):

```typescript
// app/(admin)/admin/team/actions.ts
export async function uploadTeamMemberPhoto(formData: FormData) {
  // Hard-coded for team photos only
  const storagePath = `team/${timestamp}-${filename}`;
}
```

**After** (generic, reusable):

```typescript
// lib/actions/media-actions.ts
export async function uploadMediaImage(
  formData: FormData,
  folder: string = "team"
) {
  // Configurable for any entity
  const storagePath = `${folder}/${timestamp}-${filename}`;
}
```

**Usage Examples**:

```typescript
// Team photos
await uploadMediaImage(formData, "team");

// Spectacle images
await uploadMediaImage(formData, "spectacles");

// Press releases
await uploadMediaImage(formData, "press");
```

---

### 2. Public Spectacle Validation

**Dynamic Field Requirements**:

When `public: true`, the following fields become **required**:

- ✅ `status` must be `"published"` or `"archived"` (not `"draft"`)
- ✅ `genre` - Must be non-empty
- ✅ `premiere` - Date required
- ✅ `short_description` - Brief summary required
- ✅ `description` - Full description required
- ✅ `image_url` - Image required

**Visual Feedback**:

```typescript
// SpectacleForm.tsx
const isPublic = form.watch("public");

// Show warning if incomplete
{showPublicWarning && (
  <Alert variant="destructive">
    Un spectacle public nécessite : statut publié/archivé, genre, 
    date de première, descriptions courte et complète, et une image.
  </Alert>
)}
```

**Zod Validation**:

```typescript
// lib/forms/spectacle-form-helpers.ts
spectacleFormSchema.superRefine((data, ctx) => {
  if (data.public === true) {
    if (data.status === "draft") {
      ctx.addIssue({
        path: ["status"],
        message: "Un spectacle public ne peut pas être en brouillon",
      });
    }
    // ... more validation
  }
});
```

---

### 3. Enhanced ImageFieldGroup

**New Props**:

- `showUpload` - Enable upload button
- `uploadFolder` - Configure storage folder (default: "team")

**New Features**:

- ✨ **Clear URL button** - X icon to reset image URL
- ✨ **Upload integration** - Direct upload from form
- ✨ **Dynamic required indicators** - Asterisks based on `required` prop

**Usage**:

```tsx
<ImageFieldGroup
  form={form}
  imageUrlField="image_url"
  label="Image du spectacle"
  required={isPublic}  // Dynamic based on public checkbox
  showMediaLibrary={true}
  showUpload={true}  // NEW: Enable upload
  uploadFolder="spectacles"  // NEW: Custom folder
  showAltText={false}
/>
```

---

## 📦 Migration Steps

### Step 1: Update imports (if using uploadTeamMemberPhoto)

**Old**:

```typescript
import { uploadTeamMemberPhoto } from "@/app/(admin)/admin/team/actions";

const result = await uploadTeamMemberPhoto(formData);
```

**New**:

```typescript
import { uploadMediaImage } from "@/lib/actions";

const result = await uploadMediaImage(formData, "team");
```

### Step 2: Update SpectacleForm components

No action needed - forms automatically show dynamic validation.

**Optional**: Review custom forms to ensure they leverage the new features:

- Use `showUpload={true}` for direct uploads
- Use `required={isPublic}` for dynamic indicators

### Step 3: Update MediaUploadDialog (custom implementations)

If you have custom upload dialogs, update to accept `uploadFolder`:

```tsx
<MediaUploadDialog
  open={isOpen}
  onClose={handleClose}
  onSelect={handleSelect}
  uploadFolder="spectacles"  // NEW
/>
```

---

## 🔄 Backward Compatibility

### Deprecated Re-exports

To maintain compatibility, `uploadTeamMemberPhoto` is re-exported:

```typescript
// app/(admin)/admin/team/actions.ts
/**
 * @deprecated Use uploadMediaImage from @/lib/actions instead
 * Will be removed in v2.0
 */
export { uploadMediaImage as uploadTeamMemberPhoto } from "@/lib/actions";
```

**Timeline**:

- **v1.5.0** (current): Both APIs work, deprecation warning in JSDoc
- **v2.0.0** (future): Remove `uploadTeamMemberPhoto` re-export

---

## ✅ Testing Checklist

### Team Management (Backward Compatibility)

- [ ] Create team member with photo upload
- [ ] Edit existing member photo
- [ ] Verify photos appear in `/compagnie`
- [ ] Check no console errors/warnings

### Spectacle Management (New Features)

- [ ] Create draft spectacle (incomplete data allowed)
- [ ] Try setting public=true with incomplete data (validation error)
- [ ] Complete all required fields and set public=true (success)
- [ ] Upload spectacle image (direct upload)
- [ ] Select image from media library
- [ ] Enter external image URL
- [ ] Clear image URL with X button
- [ ] Verify dynamic asterisks appear when public=true

### Media Upload

- [ ] Upload to `team` folder (default)
- [ ] Upload to `spectacles` folder
- [ ] Verify files stored in correct Supabase folders
- [ ] Verify database records created in `medias` table
- [ ] Test file size validation (max 5MB)
- [ ] Test MIME type validation (JPEG, PNG, WebP, AVIF)

---

## 🐛 Known Issues

None currently. Report issues at: [project-issues-url]

---

## 📚 Related Documentation

- [Actions Architecture](./lib/actions/README.md)
- [Form Validation Guide](./lib/forms/README.md)
- [Media Management](./components/features/admin/media/README.md)
- [Spectacle Schema](./lib/schemas/spectacles.ts)

---

## 🚀 Future Enhancements (v2.1+)

### Planned

- [ ] Batch media upload
- [ ] Image cropping/resizing in browser
- [ ] Drag-and-drop file upload
- [ ] Media library search improvements
- [ ] CDN integration for image optimization

### Under Consideration

- [ ] Video upload support
- [ ] Audio file support
- [ ] Document upload (PDF, Word)
- [ ] Media versioning/history

---

## 💡 Best Practices

### 1. Always use folder parameter

```typescript
// ❌ Bad (relies on default)
await uploadMediaImage(formData);

// ✅ Good (explicit intent)
await uploadMediaImage(formData, "team");
```

### 2. Handle errors properly

```typescript
const result = await uploadMediaImage(formData, "spectacles");

if (!result.success) {
  toast.error("Upload failed", { description: result.error });
  return;
}

// Use result.data.publicUrl
```

### 3. Use type guards

```typescript
import { isActionSuccess } from "@/lib/actions";

const result = await uploadMediaImage(formData, "team");

if (isActionSuccess(result)) {
  // TypeScript knows result.data exists
  console.log(result.data.publicUrl);
}
```

---

## 🔗 References

- [Zod superRefine docs](https://zod.dev/?id=superrefine)
- [React Hook Form watch](https://react-hook-form.com/docs/useform/watch)
- [Supabase Storage](https://supabase.com/docs/guides/storage)

---

**Questions?** Contact the development team or check [FAQ](./FAQ.md).
