"use client";

import { useState, useEffect, useRef } from "react";
import { URL_VALIDATION_DEBOUNCE_MS } from "./constants";
import { UseFormReturn, FieldValues, Path, PathValue, FieldError } from "react-hook-form";
import {
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { toast } from "sonner";
import {
    MediaLibraryPicker,
    MediaUploadDialog,
    type MediaSelectResult,
} from "@/components/features/admin/media";
import { validateImageUrl } from "@/lib/utils/validate-image-url";
import { ImageSourceActions } from "./image-field/ImageSourceActions";
import { ImagePreviewSection } from "./image-field/ImagePreviewSection";
import { ImageAltTextField } from "./image-field/ImageAltTextField";

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

        // Debounce validation
        debounceTimerRef.current = setTimeout(() => {
            handleValidateUrl();
        }, URL_VALIDATION_DEBOUNCE_MS);

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
                            <ImageSourceActions
                                imageUrl={imageUrl}
                                isValidating={isValidating}
                                showUpload={showUpload}
                                showMediaLibrary={showMediaLibrary}
                                showExternalUrl={showExternalUrl}
                                onUploadClick={() => setIsUploadOpen(true)}
                                onLibraryClick={() => setIsMediaPickerOpen(true)}
                                onUrlChange={handleUrlChange}
                                onClearUrl={handleClearUrl}
                            />
                            <ImagePreviewSection
                                imageUrl={imageUrl}
                                altText={altText}
                                isValidating={isValidating}
                                validationError={validationError}
                                validationSuccess={validationSuccess}
                                imageError={imageError as FieldError | undefined}
                                description={description}
                            />
                        </div>
                    </FormItem>
                )}
            />

            {showAltText && altTextField && (
                <ImageAltTextField
                    form={form}
                    altTextField={altTextField}
                    altTextLabel={altTextLabel}
                    required={required}
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

