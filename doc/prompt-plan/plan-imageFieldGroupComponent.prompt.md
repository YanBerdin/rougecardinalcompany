# Plan : Composant `ImageFieldGroup` réutilisable

## Objectif

Créer un composant générique qui encapsule `MediaLibraryPicker` + `MediaExternalUrlInput` + `validateImageUrl` pour éviter la duplication de code entre les formulaires admin.

## Analyse actuelle

| Formulaire | MediaLibraryPicker | validateImageUrl | MediaExternalUrlInput |
|------------|-------------------|------------------|----------------------|
| `SpectacleForm.tsx` | ❌ Non | ✅ Oui | ❌ Non (URL directe) |
| `TeamMemberForm.tsx` | ❌ Non | ❌ Non | ❌ Non (URL directe) |
| `HeroSlideForm.tsx` | ✅ Oui | ❌ Non | ✅ Oui (fallback) |
| `AboutContentForm.tsx` | ✅ Oui | ❌ Non | ✅ Oui (fallback) |

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

interface ImageFieldGroupProps<TForm extends FieldValues> {
    form: UseFormReturn<TForm>;
    imageUrlField: Path<TForm>;
    imageMediaIdField?: Path<TForm>;
    altTextField?: Path<TForm>;
    label?: string;
    altTextLabel?: string;
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

    const handleMediaSelect = (result: MediaSelectResult) => {
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
                setValidationError(result.error ?? "Image invalide");
                toast.error("Image invalide", {
                    description: result.error ?? "Vérifiez l'URL",
                });
            } else {
                const successMsg = `${result.mime}${result.size ? ` (${Math.round(result.size / 1024)}KB)` : ""}`;
                setValidationSuccess(successMsg);
                toast.success("Image valide", { description: successMsg });
            }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : "Erreur de validation";
            setValidationError(errorMsg);
            toast.error("Erreur", { description: errorMsg });
        } finally {
            setIsValidating(false);
        }
    };

    return (
        <>
            <FormField
                control={form.control}
                name={imageUrlField}
                render={() => (
                    <FormItem>
                        <FormLabel>{label} {required && "*"}</FormLabel>

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
                                    <Image
                                        src={imageUrl}
                                        alt={altText ?? "Preview"}
                                        className="h-20 w-32 object-cover rounded"
                                        width={128}
                                        height={80}
                                    />
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
                            <FormLabel>{altTextLabel} {required && "*"}</FormLabel>
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

## Export dans index.ts

Ajouter dans `components/features/admin/media/index.ts` :

```tsx
export { ImageFieldGroup } from "./ImageFieldGroup";
```

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

### SpectacleForm.tsx

```tsx
import { ImageFieldGroup } from "@/components/features/admin/media";

// Dans le form :
<ImageFieldGroup
    form={form}
    imageUrlField="affiche_url"
    label="Affiche du spectacle"
    showMediaLibrary={true}  // Ajouter la médiathèque
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

## Avantages

1. **DRY** : Un seul composant pour tous les formulaires
2. **Validation SSRF** : `validateImageUrl` intégré pour toutes les URLs externes
3. **UX cohérente** : Même interface partout (médiathèque + URL + validation + preview)
4. **Flexible** : Props pour activer/désactiver chaque fonctionnalité
5. **Type-safe** : Générique TypeScript pour typage des champs

## Étapes d'implémentation

1. [ ] Créer `ImageFieldGroup.tsx`
2. [ ] Exporter dans `index.ts`
3. [ ] Refactoriser `HeroSlideForm` (supprimer `HeroSlideImageSection`)
4. [ ] Refactoriser `TeamMemberForm`
5. [ ] Refactoriser `SpectacleForm`
6. [ ] Refactoriser `AboutContentForm`
7. [ ] Supprimer fichiers obsolètes (`HeroSlideImageSection.tsx`, `MediaExternalUrlInput.tsx` si plus utilisé)
8. [ ] Tests manuels de chaque formulaire
9. [ ] Commit
