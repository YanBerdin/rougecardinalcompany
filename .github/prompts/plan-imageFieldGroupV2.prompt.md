# Plan : Composant `ImageFieldGroup` réutilisable (v2)

## Objectif

Créer un composant générique qui encapsule `MediaLibraryPicker` + `validateImageUrl` + alt text pour éviter la duplication de code entre les formulaires admin.

## Analyse actuelle

| Formulaire | MediaLibraryPicker | validateImageUrl | Alt Text |
|------------|-------------------|------------------|----------|
| `SpectacleForm.tsx` | ❌ Non | ✅ Oui | ❌ Non |
| `TeamMemberForm.tsx` | ❌ Non | ❌ Non | ❌ Non |
| `HeroSlideForm.tsx` | ✅ Oui | ❌ Non | ✅ Oui |
| `AboutContentForm.tsx` | ✅ Oui | ❌ Non | ✅ Oui |

**Problèmes identifiés** :
- `SpectacleForm` : vulnérabilité SSRF potentielle (URL directe sans validation complète)
- `TeamMemberForm` : aucune validation SSRF
- Duplication de code entre les 4 formulaires
- UX incohérente (certains ont médiathèque, d'autres non)

---

## Pré-requis : Étendre `MediaSelectResult`

### `components/features/admin/media/types.ts`

Ajouter la propriété `error` optionnelle au schéma :

```typescript
export const MediaSelectResultSchema = z.object({
    id: z.number().int().positive(),
    url: z.string().url(),
    error: z.string().optional(),  // ← AJOUT
});

export type MediaSelectResult = z.infer<typeof MediaSelectResultSchema>;
```

---

## Fichier à créer

### `components/features/admin/media/ImageFieldGroup.tsx`

```tsx
"use client";

import { useState } from "react";
import { UseFormReturn, FieldValues, Path, PathValue } from "react-hook-form";
import Image from "next/image";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageIcon, Loader2, CheckCircle2, XCircle, Library, Link2 } from "lucide-react";
import { toast } from "sonner";
import { MediaLibraryPicker, type MediaSelectResult } from "@/components/features/admin/media";
import { validateImageUrl } from "@/lib/utils/validate-image-url";

const IMAGE_ALT_MAX_LENGTH = 125;

// SVG placeholder inline (évite dépendance fichier externe)
const PLACEHOLDER_IMAGE_DATA_URI = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='80' viewBox='0 0 128 80'%3E%3Crect fill='%23f3f4f6' width='128' height='80'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='system-ui' font-size='12'%3EImage%3C/text%3E%3C/svg%3E";

interface ImageFieldGroupProps<TForm extends FieldValues> {
    form: UseFormReturn<TForm>;
    imageUrlField: Path<TForm>;
    imageMediaIdField?: Path<TForm>;
    altTextField?: Path<TForm>;
    label?: string;
    altTextLabel?: string;
    /**
     * Affichage visuel uniquement (*).
     * La validation obligatoire doit être gérée dans le schéma Zod du formulaire parent.
     */
    required?: boolean;
    showAltText?: boolean;
    showMediaLibrary?: boolean;
    showExternalUrl?: boolean;
    description?: string;
}

export function ImageFieldGroup<TForm extends FieldValues>({
    form,
    imageUrlField,
    imageMediaIdField,
    altTextField,
    label = "Image",
    altTextLabel = "Alt Text (Accessibilité)",
    required = false,
    showAltText = true,
    showMediaLibrary = true,
    showExternalUrl = true,
    description,
}: ImageFieldGroupProps<TForm>) {
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [validationSuccess, setValidationSuccess] = useState<string | null>(null);

    const imageUrl = form.watch(imageUrlField) as string | undefined;
    const altText = altTextField ? (form.watch(altTextField) as string | undefined) : undefined;
    const imageError = form.formState.errors[imageUrlField];

    // ✅ AMÉLIORATION 1: Gestion des erreurs upload Storage
    const handleMediaSelect = (result: MediaSelectResult) => {
        if (result.error) {
            toast.error("Erreur média", { description: result.error });
            return;
        }

        if (imageMediaIdField) {
            form.setValue(imageMediaIdField, Number(result.id) as PathValue<TForm, Path<TForm>>);
        }
        form.setValue(imageUrlField, result.url as PathValue<TForm, Path<TForm>>);
        setValidationError(null);
        setValidationSuccess(null);
        setIsMediaPickerOpen(false);
    };

    const handleUrlChange = (url: string) => {
        form.setValue(imageUrlField, url as PathValue<TForm, Path<TForm>>);
        if (imageMediaIdField) {
            form.setValue(imageMediaIdField, undefined as PathValue<TForm, Path<TForm>>);
        }
        setValidationError(null);
        setValidationSuccess(null);
    };

    const handleValidateUrl = async () => {
        if (!imageUrl) return;

        setIsValidating(true);
        setValidationError(null);
        setValidationSuccess(null);

        try {
            const result = await validateImageUrl(imageUrl);

            if (!result.valid) {
                const errorMessage = result.error ?? "Image invalide";
                setValidationError(errorMessage);
                toast.error("Image invalide", {
                    description: errorMessage,
                });
            } else {
                const successMsg = `${result.mime}${result.size ? ` (${Math.round(result.size / 1024)}KB)` : ""}`;
                setValidationSuccess(successMsg);
                toast.success("Image valide", { description: successMsg });
            }
        } catch (error: unknown) {
            const errorMsg = error instanceof Error ? error.message : "Erreur de validation";
            setValidationError(errorMsg);
            toast.error("Erreur", { description: errorMsg });
        } finally {
            setIsValidating(false);
        }
    };

    // ✅ AMÉLIORATION 3: Preview image avec fallback
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = PLACEHOLDER_IMAGE_DATA_URI;
    };

    return (
        <>
            <FormField
                control={form.control}
                name={imageUrlField}
                render={() => (
                    <FormItem>
                        <FormLabel>{label} {required && <span className="text-destructive">*</span>}</FormLabel>

                        <div className="space-y-3">
                            {showMediaLibrary && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsMediaPickerOpen(true)}
                                >
                                    <Library className="h-4 w-4 mr-2" />
                                    Sélectionner depuis la médiathèque
                                </Button>
                            )}

                            {showExternalUrl && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Link2 className="h-4 w-4" />
                                        <span>Ou saisir une URL externe</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="url"
                                                placeholder="https://example.com/image.jpg"
                                                className="pl-9"
                                                value={imageUrl ?? ""}
                                                onChange={(e) => handleUrlChange(e.target.value)}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={!imageUrl || isValidating}
                                            onClick={handleValidateUrl}
                                        >
                                            {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Vérifier"}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {imageUrl && (
                                <div className="flex items-center gap-4 p-3 border rounded-lg bg-muted/50">
                                    <div className="relative h-20 w-32 rounded overflow-hidden">
                                        <Image
                                            src={imageUrl}
                                            alt={altText ?? "Preview"}
                                            className="object-cover"
                                            fill
                                            sizes="128px"
                                            onError={handleImageError}
                                        />
                                    </div>
                                    <div className="flex-1 text-sm text-muted-foreground truncate">
                                        {imageUrl}
                                    </div>
                                </div>
                            )}
                        </div>

                        {validationError && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                                <XCircle className="h-4 w-4" />
                                {validationError}
                            </p>
                        )}

                        {validationSuccess && (
                            <p className="text-sm text-green-600 flex items-center gap-1">
                                <CheckCircle2 className="h-4 w-4" />
                                Image valide : {validationSuccess}
                            </p>
                        )}

                        {imageError && (
                            <p className="text-sm font-medium text-destructive">
                                {imageError.message as string}
                            </p>
                        )}

                        {description && <FormDescription>{description}</FormDescription>}
                    </FormItem>
                )}
            />

            {showAltText && altTextField && (
                <FormField
                    control={form.control}
                    name={altTextField}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{altTextLabel} {required && <span className="text-destructive">*</span>}</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    value={(field.value as string) ?? ""}
                                    maxLength={IMAGE_ALT_MAX_LENGTH}
                                    placeholder="Décrivez l'image pour l'accessibilité"
                                />
                            </FormControl>
                            <FormDescription>
                                {((field.value as string) ?? "").length}/{IMAGE_ALT_MAX_LENGTH} caractères
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            {showMediaLibrary && (
                <MediaLibraryPicker
                    open={isMediaPickerOpen}
                    onClose={() => setIsMediaPickerOpen(false)}
                    onSelect={handleMediaSelect}
                />
            )}
        </>
    );
}
```

---

## Export dans index.ts

Ajouter dans `components/features/admin/media/index.ts` :

```tsx
export { ImageFieldGroup } from "./ImageFieldGroup";
```

---

## Utilisation dans les formulaires

### HeroSlideForm.tsx

Remplacer `HeroSlideImageSection` par :

```tsx
import { ImageFieldGroup } from "@/components/features/admin/media";

// Dans le form :
<ImageFieldGroup
    form={form}
    imageUrlField="image_url"
    imageMediaIdField="image_media_id"
    altTextField="alt_text"
    label="Image"
    required
/>
```

### TeamMemberForm.tsx

```tsx
import { ImageFieldGroup } from "@/components/features/admin/media";

// Dans le form :
<ImageFieldGroup
    form={form}
    imageUrlField="photo_url"
    label="Photo du membre"
    showAltText={false}
/>
```

### SpectacleForm.tsx (🔴 Corrige vulnérabilité SSRF)

```tsx
import { ImageFieldGroup } from "@/components/features/admin/media";

// Dans le form :
<ImageFieldGroup
    form={form}
    imageUrlField="affiche_url"
    label="Affiche du spectacle"
    showMediaLibrary={true}
/>
```

### AboutContentForm.tsx

```tsx
import { ImageFieldGroup } from "@/components/features/admin/media";

// Dans le form :
<ImageFieldGroup
    form={form}
    imageUrlField="image_url"
    imageMediaIdField="image_media_id"
    altTextField="alt_text"
    label="Image de section"
/>
```

---

## Avantages

1. **DRY** : Un seul composant pour tous les formulaires
2. **Validation SSRF** : `validateImageUrl` intégré pour toutes les URLs externes
3. **UX cohérente** : Même interface partout (médiathèque + URL + validation + preview)
4. **Flexible** : Props pour activer/désactiver chaque fonctionnalité
5. **Type-safe** : Générique TypeScript pour typage des champs
6. **Robuste** : Gestion d'erreur upload + fallback image preview

---

## Améliorations intégrées (v2)

| # | Amélioration | Statut |
|---|--------------|--------|
| 1 | Gestion erreurs upload Storage (`result.error` check) | ✅ Intégré |
| 2 | Required validation = Zod dans schemas parents (Option A) | ✅ JSDoc ajouté |
| 3 | Preview image avec fallback `onError` | ✅ Intégré |
| 4 | TypeScript strict (suppression assertions dangereuses) | ✅ Intégré |

---

## Étapes d'implémentation

| Step | Action | Priorité |
|------|--------|----------|
| 1 | Étendre `MediaSelectResult` avec `error?: string` | 🔴 Haute |
| 2 | Créer `ImageFieldGroup.tsx` | 🔴 Haute |
| 3 | Exporter dans `index.ts` | |
| 4 | Refactoriser `HeroSlideForm` + test manuel complet | |
| 5 | Refactoriser `SpectacleForm` + **test SSRF payloads** | 🔴 Haute |
| 6 | Refactoriser `TeamMemberForm` | |
| 7 | Refactoriser `AboutContentForm` | |
| 8 | Supprimer `HeroSlideImageSection.tsx` | |
| 9 | Documentation (`systemPatterns.md`) | |
| 10 | Commit structuré | |

---

## Tests manuels SSRF (Step 5)

Après refactoring de `SpectacleForm`, tester ces payloads dans le champ URL :

```bash
# Doit être REJETÉ :
http://localhost:3000/api/secret
http://127.0.0.1/admin
http://169.254.169.254/latest/meta-data/
file:///etc/passwd

# Doit être ACCEPTÉ :
https://your-project.supabase.co/storage/v1/object/public/images/test.jpg
```

---

## Documentation à mettre à jour (Step 9)

1. `memory-bank/systemPatterns.md` — Ajouter pattern `ImageFieldGroup`
2. `.github/instructions/crud-server-actions-pattern.instructions.md` — Section Form Components
