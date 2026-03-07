"use client";

import Image from "next/image";
import { Loader2, XCircle, AlertCircle, CheckCircle2 } from "lucide-react";
import { FormDescription } from "@/components/ui/form";
import { useImageFieldContext } from "./ImageFieldContext";

const PLACEHOLDER_IMAGE_DATA_URI =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='80' viewBox='0 0 128 80'%3E%3Crect fill='%23f3f4f6' width='128' height='80'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='system-ui' font-size='12'%3EImage%3C/text%3E%3C/svg%3E";

export function ImageFieldPreview() {
    const { state, meta } = useImageFieldContext();
    const {
        imageUrl,
        altText,
        isValidating,
        validationError,
        validationSuccess,
        imageError,
    } = state;
    const { description } = meta;

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const target = e.currentTarget;
        target.src = PLACEHOLDER_IMAGE_DATA_URI;
        target.onerror = null;
    };

    return (
        <>
            {/* Image preview */}
            {imageUrl && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 border rounded-lg bg-muted/50">
                    <div className="relative h-50 max-w-44 rounded overflow-hidden shrink-0 bg-muted">
                        {isValidating ? (
                            <div
                                className="h-full w-full flex items-center justify-center"
                                role="status"
                                aria-label="Validation de l'image en cours"
                            >
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
                            </div>
                        ) : validationSuccess ? (
                            <Image
                                src={imageUrl}
                                alt={altText ?? "Aperçu de l'image"}
                                className="h-full w-full object-cover"
                                width={450}
                                height={300}
                                onError={handleImageError}
                            />
                        ) : validationError ? (
                            <div className="h-full w-full flex flex-col items-center justify-center gap-1 p-2">
                                <XCircle className="h-6 w-6 text-destructive" aria-hidden="true" />
                                <span className="text-xs text-center text-destructive">Non autorisée</span>
                            </div>
                        ) : (
                            <div className="h-full w-full flex flex-col items-center justify-center gap-1 p-2">
                                <AlertCircle className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                                <span className="text-xs text-center text-muted-foreground">En attente</span>
                            </div>
                        )}
                    </div>
                    <div
                        className="flex-1 min-w-0 text-sm text-muted-foreground break-all"
                        aria-label={`URL de l'image : ${imageUrl}`}
                    >
                        {imageUrl}
                    </div>
                </div>
            )}

            {/* Validation feedback */}
            <div aria-live="polite" aria-atomic="true">
                {validationError && (
                    <p className="text-sm text-destructive flex items-center gap-1" role="alert">
                        <XCircle className="h-4 w-4" aria-hidden="true" />
                        {validationError}
                    </p>
                )}
                {validationSuccess && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        Image valide : {validationSuccess}
                    </p>
                )}
            </div>

            {imageError && (
                <p className="text-sm font-medium text-destructive" role="alert">
                    {imageError.message as string}
                </p>
            )}
            {description && <FormDescription>{description}</FormDescription>}
        </>
    );
}
