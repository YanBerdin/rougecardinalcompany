"use client";

import { useState, useEffect } from "react";
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
import { ImageIcon, Loader2, CheckCircle2, XCircle, Library, Link2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { MediaLibraryPicker, type MediaSelectResult } from "@/components/features/admin/media";
import { useImageValidation } from "@/lib/hooks/useImageValidation";

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
    /**
     * Callback appelé quand l'état de validation change.
     * Permet au formulaire parent de savoir si l'image est validée.
     */
    onValidationChange?: (isValid: boolean | null) => void;
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
    onValidationChange,
}: ImageFieldGroupProps<TForm>) {
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
    const {
        isValidating,
        validationError,
        validationSuccess,
        handleValidateUrl,
        resetValidation,
    } = useImageValidation();

    const imageUrl = form.watch(imageUrlField) as string | undefined;
    const altText = altTextField ? (form.watch(altTextField) as string | undefined) : undefined;
    const imageError = form.formState.errors[imageUrlField];

    // Notifier le parent de l'état de validation
    useEffect(() => {
        if (!onValidationChange) return;
        
        if (validationSuccess) {
            onValidationChange(true);
        } else if (validationError) {
            onValidationChange(false);
        } else if (!imageUrl) {
            onValidationChange(null);
        }
    }, [validationSuccess, validationError, imageUrl, onValidationChange]);

    const handleMediaSelect = (result: MediaSelectResult) => {
        if (result.error) {
            toast.error("Erreur média", { description: result.error });
            onValidationChange?.(false);
            return;
        }

        if (imageMediaIdField) {
            form.setValue(imageMediaIdField, Number(result.id) as PathValue<TForm, Path<TForm>>);
        }
        form.setValue(imageUrlField, result.url as PathValue<TForm, Path<TForm>>);
        resetValidation();
        // ✅ Image de la médiathèque = déjà validée
        onValidationChange?.(true);
        setIsMediaPickerOpen(false);
    };

    const handleUrlChange = (url: string) => {
        form.setValue(imageUrlField, url as PathValue<TForm, Path<TForm>>);
        if (imageMediaIdField) {
            form.setValue(imageMediaIdField, undefined as PathValue<TForm, Path<TForm>>);
        }
        resetValidation();
        // ⚠️ URL changée = nécessite re-validation
        onValidationChange?.(null);
    };

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
                                        <span>Ou saisir une URL d'image directe</span>
                                    </div>
                                    <div className="rounded-md bg-blue-50 border border-blue-200 p-2 mb-2">
                                        <p className="text-xs text-blue-800">
                                            <strong>💡 Astuce :</strong> L'URL doit pointer vers le fichier image (.jpg, .png, etc.), pas vers une page web.
                                            {' '}<strong>Unsplash :</strong> Clic droit sur l'image → "Copier l'adresse de l'image"
                                        </p>
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
                                            onClick={() => handleValidateUrl(imageUrl ?? "")}
                                        >
                                            {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Vérifier"}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {imageUrl && !validationSuccess && (
                                <div className="flex items-center gap-2 p-3 border rounded-lg bg-yellow-50 border-yellow-200">
                                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                                    <div className="flex-1 text-sm text-yellow-800">
                                        <p className="font-medium">URL non validée</p>
                                        <p className="text-xs truncate">{imageUrl}</p>
                                    </div>
                                    <p className="text-xs text-yellow-600 font-medium">
                                        Cliquez sur "Vérifier"
                                    </p>
                                </div>
                            )}

                            {imageUrl && validationSuccess && (
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
