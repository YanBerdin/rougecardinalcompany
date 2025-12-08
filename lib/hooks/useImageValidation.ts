"use client";

import { useState } from "react";
import { validateImageUrl } from "@/lib/utils/validate-image-url";
import { toast } from "sonner";

interface UseImageValidationReturn {
    isValidating: boolean;
    validationError: string | null;
    validationSuccess: string | null;
    handleValidateUrl: (imageUrl: string) => Promise<void>;
    resetValidation: () => void;
}

export function useImageValidation(): UseImageValidationReturn {
    const [isValidating, setIsValidating] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [validationSuccess, setValidationSuccess] = useState<string | null>(null);

    const handleValidateUrl = async (imageUrl: string) => {
        if (!imageUrl) return;

        setIsValidating(true);
        setValidationError(null);
        setValidationSuccess(null);

        try {
            const result = await validateImageUrl(imageUrl);

            if (!result.valid) {
                let errorMessage = result.error ?? "Image invalide";

                // Détection spécifique pour URLs de pages web
                if (errorMessage.includes("text/html")) {
                    errorMessage = "Cette URL pointe vers une page web, pas vers une image. Utilisez 'Copier l'adresse de l'image' (clic droit sur l'image).";
                }

                setValidationError(errorMessage);
                toast.error("Image invalide", { description: errorMessage });
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

    const resetValidation = () => {
        setValidationError(null);
        setValidationSuccess(null);
    };

    return {
        isValidating,
        validationError,
        validationSuccess,
        handleValidateUrl,
        resetValidation,
    };
}
