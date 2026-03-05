"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import type { FieldValues, Path, PathValue } from "react-hook-form";
import { UseFormReturn } from "react-hook-form";
import {
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { toast } from "sonner";
import { validateImageUrl } from "@/lib/utils/validate-image-url";
import { URL_VALIDATION_DEBOUNCE_MS } from "../constants";
import { MediaLibraryPicker } from "../MediaLibraryPicker";
import { MediaUploadDialog } from "../MediaUploadDialog";
import type { MediaSelectResult } from "../types";
import { ImageFieldContext } from "./ImageFieldContext";
import type { ImageFieldContextValue } from "./ImageFieldContext";

interface ImageFieldProviderProps<TForm extends FieldValues> {
    form: UseFormReturn<TForm>;
    imageUrlField: Path<TForm>;
    imageMediaIdField?: Path<TForm>;
    altTextField?: Path<TForm>;
    label?: string;
    altTextLabel?: string;
    required?: boolean;
    showMediaLibrary?: boolean;
    showUpload?: boolean;
    uploadFolder?: string;
    description?: string;
    onValidationChange?: (isValid: boolean | null) => void;
    children: React.ReactNode;
}

export function ImageFieldProvider<TForm extends FieldValues>({
    form,
    imageUrlField,
    imageMediaIdField,
    altTextField,
    label = "Image",
    altTextLabel = "Alt Text (Accessibilité)",
    required = false,
    showMediaLibrary = true,
    showUpload = false,
    uploadFolder = "team",
    description,
    onValidationChange,
    children,
}: ImageFieldProviderProps<TForm>) {
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [validationSuccess, setValidationSuccess] = useState<string | null>(null);

    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastValidatedUrlRef = useRef<string | null>(null);
    const imageUrlRef = useRef<string | undefined>(undefined);
    const onValidationChangeRef = useRef(onValidationChange);

    const imageUrl = form.watch(imageUrlField) as string | undefined;
    const altText = altTextField ? (form.watch(altTextField) as string | undefined) : undefined;
    const imageError = form.formState.errors[imageUrlField];

    // Keep refs in sync on every render
    imageUrlRef.current = imageUrl;
    onValidationChangeRef.current = onValidationChange;

    const handleValidateUrl = useCallback(async () => {
        const currentUrl = imageUrlRef.current;
        if (!currentUrl) return;
        if (currentUrl === lastValidatedUrlRef.current) return;

        setIsValidating(true);
        setValidationError(null);
        setValidationSuccess(null);

        try {
            const result = await validateImageUrl(currentUrl);

            if (!result.valid) {
                const errorMessage = result.error ?? "Image invalide";
                setValidationError(errorMessage);
                lastValidatedUrlRef.current = null;
                onValidationChangeRef.current?.(false);
            } else {
                const successMsg = `${result.mime}${result.size ? ` (${Math.round(result.size / 1024)}KB)` : ""}`;
                setValidationSuccess(successMsg);
                lastValidatedUrlRef.current = currentUrl;
                onValidationChangeRef.current?.(true);
            }
        } catch (error: unknown) {
            const errorMsg = error instanceof Error ? error.message : "Erreur de validation";
            setValidationError(errorMsg);
            lastValidatedUrlRef.current = null;
            onValidationChangeRef.current?.(false);
        } finally {
            setIsValidating(false);
        }
    }, []);

    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        if (!imageUrl || imageUrl.trim() === "" || imageUrl === lastValidatedUrlRef.current) {
            return;
        }

        setValidationError(null);
        setValidationSuccess(null);
        onValidationChangeRef.current?.(null);

        debounceTimerRef.current = setTimeout(() => {
            handleValidateUrl();
        }, URL_VALIDATION_DEBOUNCE_MS);

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [imageUrl, handleValidateUrl]);

    const handleMediaSelect = useCallback((result: MediaSelectResult) => {
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
        onValidationChangeRef.current?.(true);
        setIsMediaPickerOpen(false);
    }, [form, imageUrlField, imageMediaIdField]);

    const handleUploadSelect = useCallback((result: MediaSelectResult) => {
        if (result.error) {
            toast.error("Erreur de téléversement", { description: result.error });
            return;
        }
        if (imageMediaIdField) {
            form.setValue(imageMediaIdField, Number(result.id) as PathValue<TForm, Path<TForm>>);
        }
        form.setValue(imageUrlField, result.url as PathValue<TForm, Path<TForm>>);
        setValidationError(null);
        setValidationSuccess(null);
        onValidationChangeRef.current?.(true);
        setIsUploadOpen(false);
    }, [form, imageUrlField, imageMediaIdField]);

    const handleUrlChange = useCallback((url: string) => {
        form.setValue(imageUrlField, url as PathValue<TForm, Path<TForm>>);
        if (imageMediaIdField) {
            form.setValue(imageMediaIdField, undefined as PathValue<TForm, Path<TForm>>);
        }
        setValidationError(null);
        setValidationSuccess(null);
        lastValidatedUrlRef.current = null;
        onValidationChangeRef.current?.(null);
    }, [form, imageUrlField, imageMediaIdField]);

    const handleClearUrl = useCallback(() => {
        handleUrlChange("");
        if (imageMediaIdField) {
            form.setValue(imageMediaIdField, undefined as PathValue<TForm, Path<TForm>>);
        }
        lastValidatedUrlRef.current = null;
        onValidationChangeRef.current?.(null);
    }, [handleUrlChange, form, imageMediaIdField]);

    const contextValue = useMemo<ImageFieldContextValue>(() => ({
        state: {
            imageUrl,
            altText,
            isValidating,
            isMediaPickerOpen,
            isUploadOpen,
            validationError,
            validationSuccess,
            imageError: imageError as any,
        },
        actions: {
            handleUrlChange,
            handleClearUrl,
            handleMediaSelect,
            handleUploadSelect,
            setIsMediaPickerOpen,
            setIsUploadOpen,
        },
        meta: {
            form: form as any,
            imageUrlField: imageUrlField as string,
            altTextField: altTextField as string | undefined,
            altTextLabel,
            label,
            required,
            uploadFolder,
            description,
        },
    }), [
        imageUrl, altText, isValidating, isMediaPickerOpen, isUploadOpen,
        validationError, validationSuccess, imageError,
        handleUrlChange, handleClearUrl, handleMediaSelect, handleUploadSelect,
        form, imageUrlField, altTextField, altTextLabel, label, required, uploadFolder, description,
    ]);

    return (
        <>
            <FormField
                control={form.control}
                name={imageUrlField}
                render={() => (
                    <FormItem>
                        <FormLabel>
                            {label}{" "}
                            {required && <span className="text-destructive" aria-hidden="true">*</span>}
                            {required && <span className="sr-only">(requis)</span>}
                        </FormLabel>
                        <div className="space-y-3">
                            <ImageFieldContext value={contextValue}>
                                {children}
                            </ImageFieldContext>
                        </div>
                    </FormItem>
                )}
            />

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
