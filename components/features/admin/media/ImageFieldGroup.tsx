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
import {
    ImageIcon,
    Loader2,
    CheckCircle2,
    XCircle,
    Library,
    Link2,
    X,
    Upload,
} from "lucide-react";
import { toast } from "sonner";
import {
    MediaLibraryPicker,
    MediaUploadDialog,
    type MediaSelectResult,
} from "@/components/features/admin/media";
import { validateImageUrl } from "@/lib/utils/validate-image-url";

const IMAGE_ALT_MAX_LENGTH = 125;

const PLACEHOLDER_IMAGE_DATA_URI =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='80' viewBox='0 0 128 80'%3E%3Crect fill='%23f3f4f6' width='128' height='80'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='system-ui' font-size='12'%3EImage%3C/text%3E%3C/svg%3E";

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
    showUpload?: boolean;
    uploadFolder?: string;
    description?: string;
    onValidationChange?: (isValid: boolean | null) => void; // NEW: Callback for validation state
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
    showUpload = false,
    uploadFolder = "team",
    description,
    onValidationChange, // NEW: Callback prop
}: ImageFieldGroupProps<TForm>) {
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [validationSuccess, setValidationSuccess] = useState<string | null>(
        null
    );

    const imageUrl = form.watch(imageUrlField) as string | undefined;
    const altText = altTextField
        ? (form.watch(altTextField) as string | undefined)
        : undefined;
    const imageError = form.formState.errors[imageUrlField];

    const handleMediaSelect = (result: MediaSelectResult) => {
        if (result.error) {
            toast.error("Erreur média", { description: result.error });
            return;
        }

        if (imageMediaIdField) {
            form.setValue(
                imageMediaIdField,
                Number(result.id) as PathValue<TForm, Path<TForm>>
            );
        }
        form.setValue(imageUrlField, result.url as PathValue<TForm, Path<TForm>>);
        setValidationError(null);
        setValidationSuccess(null);

        // Notify parent that image from library is considered valid
        onValidationChange?.(true);

        setIsMediaPickerOpen(false);
    };

    const handleUploadSelect = (result: MediaSelectResult) => {
        if (result.error) {
            toast.error("Erreur de téléversement", { description: result.error });
            return;
        }

        if (imageMediaIdField) {
            form.setValue(
                imageMediaIdField,
                Number(result.id) as PathValue<TForm, Path<TForm>>
            );
        }
        form.setValue(imageUrlField, result.url as PathValue<TForm, Path<TForm>>);
        setValidationError(null);
        setValidationSuccess(null);

        // Notify parent that uploaded image is valid
        onValidationChange?.(true);

        setIsUploadOpen(false);
    };

    const handleUrlChange = (url: string) => {
        form.setValue(imageUrlField, url as PathValue<TForm, Path<TForm>>);
        if (imageMediaIdField) {
            form.setValue(
                imageMediaIdField,
                undefined as PathValue<TForm, Path<TForm>>
            );
        }
        setValidationError(null);
        setValidationSuccess(null);

        // Reset validation state when URL changes
        onValidationChange?.(null);
    };

    const handleClearUrl = () => {
        handleUrlChange("");
        if (imageMediaIdField) {
            form.setValue(
                imageMediaIdField,
                undefined as PathValue<TForm, Path<TForm>>
            );
        }

        // Notify parent that validation state is reset
        onValidationChange?.(null);
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

                // Notify parent of validation failure
                onValidationChange?.(false);
            } else {
                const successMsg = `${result.mime}${result.size ? ` (${Math.round(result.size / 1024)}KB)` : ""}`;
                setValidationSuccess(successMsg);
                toast.success("Image valide", { description: successMsg });

                // Notify parent of validation success
                onValidationChange?.(true);
            }
        } catch (error: unknown) {
            const errorMsg =
                error instanceof Error ? error.message : "Erreur de validation";
            setValidationError(errorMsg);
            toast.error("Erreur", { description: errorMsg });

            // Notify parent of validation error
            onValidationChange?.(false);
        } finally {
            setIsValidating(false);
        }
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
                        <FormLabel>
                            {label}{" "}
                            {required && <span className="text-destructive">*</span>}
                        </FormLabel>

                        <div className="space-y-3">
                            {/* Action buttons row */}
                            <div className="flex flex-wrap gap-2">
                                {showMediaLibrary && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsMediaPickerOpen(true)}
                                    >
                                        <Library className="h-4 w-4 mr-2" />
                                        Médiathèque
                                    </Button>
                                )}

                                {showUpload && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsUploadOpen(true)}
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Téléverser
                                    </Button>
                                )}
                            </div>

                            {/* External URL input */}
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
                                        {imageUrl && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleClearUrl}
                                                title="Effacer l'URL"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={!imageUrl || isValidating}
                                            onClick={handleValidateUrl}
                                        >
                                            {isValidating ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                "Vérifier"
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Image preview */}
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
                            <FormLabel>
                                {altTextLabel}{" "}
                                {required && <span className="text-destructive">*</span>}
                            </FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    value={(field.value as string) ?? ""}
                                    maxLength={IMAGE_ALT_MAX_LENGTH}
                                    placeholder="Décrivez l'image pour l'accessibilité"
                                />
                            </FormControl>
                            <FormDescription>
                                {((field.value as string) ?? "").length}/{IMAGE_ALT_MAX_LENGTH}{" "}
                                caractères
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

            {showUpload && (
                <MediaUploadDialog
                    open={isUploadOpen}
                    onClose={() => setIsUploadOpen(false)}
                    onSelect={handleUploadSelect}
                    uploadFolder={uploadFolder}
                />
            )}
        </>
    );
}
