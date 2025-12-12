# Server Actions Library

**Location**: `lib/actions/`  
**Purpose**: Reusable, generic Server Actions for common operations  
**Architecture**: Action-based pattern with standardized return types

---

## 📁 Structure

```bash
lib/actions/
├── types.ts              # ActionResult<T> and related types
├── media-actions.ts      # Media upload/delete operations
├── index.ts              # Barrel exports
└── README.md             # This file
```

---

## 🎯 Design Principles

### 1. Generic & Reusable

Actions in this directory are **entity-agnostic** and can be used across multiple features.

**Example**:

```typescript
// ✅ Good - Generic
uploadMediaImage(formData, folder)  // Works for team, spectacles, press, etc.

// ❌ Bad - Entity-specific
uploadTeamMemberPhoto(formData)     // Only works for team members
```

### 2. Type-Safe Results

All actions return `ActionResult<T>` for consistent error handling.

**Pattern**:

```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

**Benefits**:

- ✅ Exhaustive type checking
- ✅ No try-catch boilerplate
- ✅ Clear success/failure paths

### 3. Server-Only

All actions are marked with `"use server"` directive.

**Security**:

- 🔒 Never expose database credentials to client
- 🔒 Enforce authentication/authorization server-side
- 🔒 Validate all inputs with Zod schemas

---

## 📘 API Reference

### Media Actions

#### `uploadMediaImage(formData, folder?)`

Uploads an image to Supabase Storage and creates a media record.

**Signature**:

```typescript
function uploadMediaImage(
  formData: FormData,
  folder?: string
): Promise<MediaUploadResult>
```

**Parameters**:

- `formData` - FormData object with `file` field
- `folder` - Optional storage folder (default: "team")
  - Examples: `"team"`, `"spectacles"`, `"press"`

**Returns**: `MediaUploadResult`

```typescript
{ success: true; data: { mediaId: number; publicUrl: string; storagePath: string } }
| { success: false; error: string }
```

**Validation**:

- File size: Max 5MB
- MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/avif`
- Authentication: Requires admin role

**Example**:

```typescript
import { uploadMediaImage } from "@/lib/actions";

const formData = new FormData();
formData.append("file", file);

const result = await uploadMediaImage(formData, "spectacles");

if (result.success) {
  console.log(`Uploaded: ${result.data.publicUrl}`);
  // Save result.data.mediaId to database
} else {
  console.error(`Error: ${result.error}`);
}
```

---

#### `deleteMediaImage(mediaId)`

Deletes a media file from Storage and removes the database record.

**Signature**:

```typescript
function deleteMediaImage(
  mediaId: number
): Promise<ActionResult<{ mediaId: number; publicUrl: string; storagePath: string }>>
```

**Parameters**:

- `mediaId` - ID from `medias` table

**Returns**: `ActionResult` with deleted media info

**Authentication**: Requires admin role

**Example**:

```typescript
import { deleteMediaImage } from "@/lib/actions";

const result = await deleteMediaImage(123);

if (result.success) {
  console.log(`Deleted: ${result.data.storagePath}`);
} else {
  console.error(`Error: ${result.error}`);
}
```

---

## 🔧 Type Utilities

### `isActionSuccess<T>(result)`

Type guard to narrow `ActionResult<T>` to success branch.

**Example**:

```typescript
import { uploadMediaImage, isActionSuccess } from "@/lib/actions";

const result = await uploadMediaImage(formData);

if (isActionSuccess(result)) {
  // TypeScript knows result.data exists
  return result.data.publicUrl;
} else {
  // TypeScript knows result.error exists
  throw new Error(result.error);
}
```

### `isActionError<T>(result)`

Type guard to narrow `ActionResult<T>` to error branch.

---

## 🚀 Usage Patterns

### Pattern 1: Form Submission

**Scenario**: Upload image from React Hook Form

```typescript
"use client";
import { uploadMediaImage } from "@/lib/actions";
import { toast } from "sonner";

export function MyForm() {
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (data: FormData) => {
    setUploading(true);
    
    const result = await uploadMediaImage(data, "spectacles");
    
    if (result.success) {
      toast.success("Image uploaded");
      form.setValue("image_url", result.data.publicUrl);
    } else {
      toast.error("Upload failed", { description: result.error });
    }
    
    setUploading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
    </form>
  );
}
```

---

### Pattern 2: Server-Side Integration

**Scenario**: Upload during entity creation

```typescript
"use server";
import { uploadMediaImage } from "@/lib/actions";
import { createSpectacle } from "@/lib/dal/spectacles";

export async function createSpectacleWithImage(
  formData: FormData,
  spectacleData: CreateSpectacleInput
) {
  // Upload image first
  const uploadResult = await uploadMediaImage(formData, "spectacles");
  
  if (!uploadResult.success) {
    return { success: false, error: uploadResult.error };
  }

  // Create spectacle with image URL
  const spectacle = await createSpectacle({
    ...spectacleData,
    image_url: uploadResult.data.publicUrl,
  });

  return spectacle;
}
```

---

### Pattern 3: Error Handling

**Scenario**: Graceful degradation

```typescript
import { uploadMediaImage, isActionError } from "@/lib/actions";

async function handleUpload(formData: FormData) {
  const result = await uploadMediaImage(formData, "team");

  if (isActionError(result)) {
    // Log error for debugging
    console.error("[Upload Error]", result.error);
    
    // Show user-friendly message
    if (result.error.includes("volumineux")) {
      toast.error("Fichier trop volumineux", {
        description: "Taille maximale : 5MB",
      });
    } else if (result.error.includes("Format")) {
      toast.error("Format non supporté", {
        description: "Formats acceptés : JPEG, PNG, WebP, AVIF",
      });
    } else {
      toast.error("Erreur d'upload", {
        description: "Veuillez réessayer",
      });
    }
    
    return null;
  }

  return result.data.publicUrl;
}
```

---

## 🧪 Testing

### Unit Testing

**Example** (using Vitest):

```typescript
import { describe, it, expect, vi } from 'vitest';
import { uploadMediaImage } from './media-actions';

describe('uploadMediaImage', () => {
  it('rejects files over 5MB', async () => {
    const largeFile = new File([new ArrayBuffer(6_000_000)], 'large.jpg', {
      type: 'image/jpeg',
    });

    const formData = new FormData();
    formData.append('file', largeFile);

    const result = await uploadMediaImage(formData);

    expect(result.success).toBe(false);
    expect(result.error).toContain('volumineux');
  });

  it('accepts valid JPEG files', async () => {
    const validFile = new File([new ArrayBuffer(1_000_000)], 'photo.jpg', {
      type: 'image/jpeg',
    });

    const formData = new FormData();
    formData.append('file', validFile);

    const result = await uploadMediaImage(formData, 'test');

    expect(result.success).toBe(true);
    expect(result.data.publicUrl).toMatch(/^https?:\/\//);
  });
});
```

### Integration Testing

**Example** (using Playwright):

```typescript
test('upload spectacle image', async ({ page }) => {
  await page.goto('/admin/spectacles/new');
  
  // Click upload button
  await page.click('button:has-text("Téléverser")');
  
  // Select file
  await page.setInputFiles('input[type="file"]', './test-image.jpg');
  
  // Wait for upload
  await page.click('button:has-text("Téléverser")');
  await page.waitForSelector('.toast-success');
  
  // Verify image appears in form
  const imagePreview = page.locator('img[alt="Preview"]');
  await expect(imagePreview).toBeVisible();
});
```

---

## 📋 Checklist: Adding New Actions

When adding a new action to this directory:

- [ ] Mark with `"use server"` directive
- [ ] Return `ActionResult<T>` (not `Promise<T>`)
- [ ] Validate inputs with Zod schemas
- [ ] Require authentication/authorization
- [ ] Add JSDoc comments with examples
- [ ] Export from `index.ts`
- [ ] Add usage examples to this README
- [ ] Write unit tests
- [ ] Update CHANGELOG.md

---

## 🐛 Common Issues

### Issue 1: "Cannot read property 'data' of undefined"

**Cause**: Not checking `result.success` before accessing `result.data`

**Solution**:

```typescript
// ❌ Bad
const result = await uploadMediaImage(formData);
console.log(result.data.publicUrl); // Error if result.success = false

// ✅ Good
if (result.success) {
  console.log(result.data.publicUrl);
} else {
  console.error(result.error);
}
```

---

### Issue 2: "Server Action must be async"

**Cause**: Missing `async` keyword

**Solution**:

```typescript
// ❌ Bad
export function myAction() {
  return uploadMediaImage(formData);
}

// ✅ Good
export async function myAction() {
  return await uploadMediaImage(formData);
}
```

---

### Issue 3: "Insufficient permissions"

**Cause**: Action requires admin but user is not admin

**Solution**: Check `requireAdmin()` is called in action:

```typescript
"use server";
import { requireAdmin } from "@/lib/auth/is-admin";

export async function adminOnlyAction() {
  await requireAdmin(); // ✅ Throws if not admin
  // ... rest of logic
}
```

---

## 📚 Related Documentation

- [DAL Layer](../../lib/actions/actions_readme.md) - Database access layer
- [API Helpers](../../lib/api/helpers.ts) - HTTP status codes, error handling
- [Migration Guide](../../supabase/migrations/migrations.md) - v1.5 → v2.0 changes

---

## 🤝 Contributing

Before submitting new actions:

1. Ensure action is **generic** and reusable
2. Follow existing naming conventions (`verb + Entity + Action`)
3. Add comprehensive JSDoc comments
4. Include usage examples in this README
5. Write unit tests (coverage > 80%)
6. Update CHANGELOG.md
