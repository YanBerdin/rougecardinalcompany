# Cheatsheet: Validation Publique + Upload Générique

## **⚡ Commandes et patterns les plus utilisés**

---

## 🚀 Upload d'images

### Pattern de base

```typescript
import { uploadMediaImage } from "@/lib/actions";

const formData = new FormData();
formData.append("file", file);

const result = await uploadMediaImage(formData, "spectacles");

if (result.success) {
  console.log(result.data.publicUrl);  // URL publique
  console.log(result.data.mediaId);     // ID en base
} else {
  console.error(result.error);          // Message d'erreur
}
```

### Dossiers disponibles

```typescript
await uploadMediaImage(formData, "team");        // Photos équipe
await uploadMediaImage(formData, "spectacles");  // Images spectacles
await uploadMediaImage(formData, "press");       // Communiqués presse
```

---

## ✅ Type guards

### Vérifier le succès

```typescript
import { isActionSuccess } from "@/lib/actions";

if (isActionSuccess(result)) {
  // TypeScript sait que result.data existe
  return result.data.publicUrl;
}
```

### Vérifier l'erreur

```typescript
import { isActionError } from "@/lib/actions";

if (isActionError(result)) {
  // TypeScript sait que result.error existe
  toast.error(result.error);
}
```

---

## 📝 SpectacleForm patterns

### État validation image

```typescript
const [isImageValidated, setIsImageValidated] = useState<boolean | null>(
  defaultValues?.image_url ? true : null
);

// null  = pas encore testée
// true  = validée avec succès
// false = invalide
```

### Vérification avant soumission

```typescript
async function onSubmit(data: SpectacleFormValues) {
  // ✅ CRITICAL: Vérifier validation image
  if (data.image_url && isImageValidated !== true) {
    toast.error("Image non validée");
    return;
  }

  // ✅ CRITICAL: Image obligatoire si public
  if (data.public && !data.image_url) {
    toast.error("Image requise");
    return;
  }

  // ... rest of submit logic
}
```

---

## 🎨 ImageFieldGroup usage

### Configuration minimale

```tsx
<ImageFieldGroup
  form={form}
  imageUrlField="image_url"
  label="Image"
/>
```

### Configuration complète

```tsx
<ImageFieldGroup
  form={form}
  imageUrlField="image_url"
  imageMediaIdField="image_media_id"
  altTextField="image_alt"
  label="Image du spectacle"
  altTextLabel="Description image"
  required={isPublic}                    // Dynamique
  showMediaLibrary={true}
  showUpload={true}                      // Upload direct
  uploadFolder="spectacles"              // Dossier cible
  showExternalUrl={true}
  showAltText={true}
  description="Formats: JPEG, PNG, WebP, AVIF"
  onValidationChange={setIsImageValidated}  // Callback état
/>
```

---

## 🔍 Validation Zod

### superRefine pour validation conditionnelle

```typescript
export const myFormSchema = z
  .object({
    title: z.string().min(1),
    public: z.boolean(),
    image_url: z.string().url().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.public) {
      // Image requise si public
      if (!data.image_url) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["image_url"],
          message: "Image requise pour publication",
        });
      }
    }
  });
```

---

## 🎯 React Hook Form watch

### Watch champ unique

```typescript
const isPublic = form.watch("public");

// Usage dans JSX
{isPublic && <Alert>Champs requis...</Alert>}
```

### Watch plusieurs champs

```typescript
useEffect(() => {
  const subscription = form.watch((value, { name, type }) => {
    console.log(value, name, type);
  });
  return () => subscription.unsubscribe();
}, [form.watch]);
```

---

## 💾 Supabase Storage

### Vérifier fichiers dans bucket

```sql
SELECT name, metadata 
FROM storage.objects 
WHERE bucket_id = 'medias' 
  AND name LIKE 'spectacles/%'
LIMIT 10;
```

### Vérifier records en base

```sql
SELECT id, storage_path, filename, mime, size_bytes
FROM medias
WHERE storage_path LIKE 'spectacles/%'
ORDER BY created_at DESC
LIMIT 10;
```

### Construire URL publique

```typescript
const { data: { publicUrl } } = supabase.storage
  .from('medias')
  .getPublicUrl('spectacles/1234567890-hamlet.jpg');
```

---

## 🐛 Debug common issues

### Upload échoue silencieusement

```typescript
// Ajouter logs détaillés
const result = await uploadMediaImage(formData, "spectacles");
console.log('[Upload Debug]', {
  success: result.success,
  error: result.error,
  data: result.success ? result.data : null,
});
```

### État validation pas à jour

```typescript
// Vérifier que callback est appelé
<ImageFieldGroup
  onValidationChange={(isValid) => {
    console.log('[Validation]', isValid);  // Debug
    setIsImageValidated(isValid);
  }}
/>
```

### Alerte ne disparaît pas

```typescript
// Vérifier dependencies useEffect
useEffect(() => {
  // ... logic
}, [
  isPublic,              // ✅ Inclure
  imageUrl,              // ✅ Inclure
  isImageValidated,      // ✅ Inclure
  form.watch("genre"),   // ✅ Inclure tous les champs validés
]);
```

---

## 📦 Structure fichiers

### Imports courants

```typescript
// Actions
import { uploadMediaImage, deleteMediaImage } from "@/lib/actions";
import type { ActionResult, MediaUploadResult } from "@/lib/actions";

// Components
import { ImageFieldGroup } from "@/components/features/admin/media";

// Helpers
import { 
  spectacleFormSchema,
  cleanSpectacleFormData,
  normalizeGenre,
  formatDateForInput,
} from "@/lib/forms/spectacle-form-helpers";

// UI
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
```

---

## 🧪 Tests rapides

### Test upload fonctionnel

```typescript
const testUpload = async () => {
  const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
  const formData = new FormData();
  formData.append("file", file);

  const result = await uploadMediaImage(formData, "test");
  console.assert(result.success, "Upload should succeed");
};
```

### Test validation Zod

```typescript
const testValidation = () => {
  const result = spectacleFormSchema.safeParse({
    title: "Test",
    public: true,
    // Missing image_url
  });
  
  console.assert(!result.success, "Should fail validation");
  console.log(result.error?.issues); // Voir erreurs
};
```

---

## 🎨 Tailwind classes utiles

### Astérisque requis

```tsx
<FormLabel>
  Titre <span className="text-destructive">*</span>
</FormLabel>
```

### Alerte rouge

```tsx
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertDescription>Message...</AlertDescription>
</Alert>
```

### Bouton chargement

```tsx
<Button disabled={isSubmitting}>
  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  Submit
</Button>
```

---

## 🔗 Liens rapides

- **Actions**: [lib/actions/actions_readme.md](../../../lib/actions/actions_readme.md)
- **Tests**: [test_validation.md](./test_validation.md)
- **Migration**: [migration_docs.md](./migration_docs.md)
- **Quick Start**: [quick_start.md](./quick_start.md)

---

## 💡 Tips & Tricks

### Always validate images

```typescript
// ❌ Bad
if (imageUrl) { ... }

// ✅ Good
if (imageUrl && isImageValidated === true) { ... }
```

### Use type guards

```typescript
// ❌ Bad
if (result.success) {
  console.log(result.data!.publicUrl);  // Non-null assertion
}

// ✅ Good
if (isActionSuccess(result)) {
  console.log(result.data.publicUrl);   // Type-safe
}
```

### Folder naming

```typescript
// ✅ Consistent naming
"team"        // Not "teams" or "team-photos"
"spectacles"  // Not "shows" or "spectacle"
"press"       // Not "presse" or "press-releases"
```

---

**⭐ Astuce**: Gardez ce cheatsheet ouvert pendant le dev !
