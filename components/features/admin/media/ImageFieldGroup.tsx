"use client";

import { useState, useEffect, useRef } from "react";
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
    AlertCircle,
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
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastValidatedUrlRef = useRef<string | null>(null);

    const imageUrl = form.watch(imageUrlField) as string | undefined;
    const altText = altTextField
        ? (form.watch(altTextField) as string | undefined)
        : undefined;
    const imageError = form.formState.errors[imageUrlField];

    // Auto-validate external URLs with debounce
    useEffect(() => {
        // Clear previous timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Skip validation if:
        // - No URL
        // - URL is empty
        // - URL was already validated
        if (!imageUrl || imageUrl.trim() === "" || imageUrl === lastValidatedUrlRef.current) {
            return;
        }

        // Reset validation state when URL changes
        setValidationError(null);
        setValidationSuccess(null);
        onValidationChange?.(null);

        // Debounce validation (1 second after user stops typing)
        debounceTimerRef.current = setTimeout(() => {
            handleValidateUrl();
        }, 1000);

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [imageUrl]); // Only depend on imageUrl

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
        lastValidatedUrlRef.current = null; // Reset validated URL

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
        lastValidatedUrlRef.current = null; // Reset validated URL

        // Notify parent that validation state is reset
        onValidationChange?.(null);
    };

    const handleValidateUrl = async () => {
        if (!imageUrl) return;

        // Skip if already validated
        if (imageUrl === lastValidatedUrlRef.current) {
            return;
        }

        setIsValidating(true);
        setValidationError(null);
        setValidationSuccess(null);

        try {
            const result = await validateImageUrl(imageUrl);

            if (!result.valid) {
                const errorMessage = result.error ?? "Image invalide";
                setValidationError(errorMessage);
                lastValidatedUrlRef.current = null; // Reset on error
                
                // Notify parent of validation failure
                onValidationChange?.(false);
            } else {
                const successMsg = `${result.mime}${result.size ? ` (${Math.round(result.size / 1024)}KB)` : ""}`;
                setValidationSuccess(successMsg);
                lastValidatedUrlRef.current = imageUrl; // Mark as validated

                // Notify parent of validation success
                onValidationChange?.(true);
            }
        } catch (error: unknown) {
            const errorMsg =
                error instanceof Error ? error.message : "Erreur de validation";
            setValidationError(errorMsg);
            lastValidatedUrlRef.current = null; // Reset on error

            // Notify parent of validation error
            onValidationChange?.(false);
        } finally {
            setIsValidating(false);
        }
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const target = e.currentTarget;
        target.src = PLACEHOLDER_IMAGE_DATA_URI;
        target.onerror = null; // Prevent infinite loop if placeholder fails
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
                                        <Link2 className="h-4 w-4 shrink-0" />
                                        <span>Ou saisir une URL externe</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <div className="relative flex-1 min-w-0">
                                            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="url"
                                                placeholder="https://example.com/image.jpg"
                                                className="pl-9 w-full"
                                                value={imageUrl ?? ""}
                                                onChange={(e) => handleUrlChange(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            {imageUrl && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleClearUrl}
                                                    title="Effacer l'URL"
                                                    className="shrink-0"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {isValidating && (
                                                <div className="flex items-center gap-2 px-3 text-sm text-muted-foreground">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    <span className="hidden sm:inline">Vérification...</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {imageUrl && !isValidating && (
                                        <p className="text-xs text-muted-foreground">
                                            💡 L&apos;URL sera validée automatiquement
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Image preview - only show validated images */}
                            {imageUrl && (
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 border rounded-lg bg-muted/50">
                                    <div className="relative h-20 w-32 rounded overflow-hidden shrink-0 bg-muted">
                                        {isValidating ? (
                                            <div className="h-full w-full flex items-center justify-center">
                                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                            </div>
                                        ) : validationSuccess ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img
                                                src={imageUrl}
                                                alt={altText ?? "Preview"}
                                                className="h-full w-full object-cover"
                                                onError={handleImageError}
                                            />
                                        ) : validationError ? (
                                            <div className="h-full w-full flex flex-col items-center justify-center gap-1 p-2">
                                                <XCircle className="h-6 w-6 text-destructive" />
                                                <span className="text-xs text-center text-destructive">Non autorisée</span>
                                            </div>
                                        ) : (
                                            <div className="h-full w-full flex flex-col items-center justify-center gap-1 p-2">
                                                <AlertCircle className="h-6 w-6 text-muted-foreground" />
                                                <span className="text-xs text-center text-muted-foreground">En attente</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 text-sm text-muted-foreground break-all">
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
