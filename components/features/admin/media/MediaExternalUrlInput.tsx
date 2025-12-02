"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ExternalLink, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import type { MediaExternalUrlInputProps } from "./types";

type ValidationStatus = "idle" | "validating" | "valid" | "invalid";

/**
 * MediaExternalUrlInput - External URL mode for media picker
 * Allows entering an external image URL with validation
 */
export function MediaExternalUrlInput({
    value,
    onChange,
    placeholder = "https://example.com/image.jpg",
    label = "URL externe de l'image",
    description,
}: MediaExternalUrlInputProps) {
    const [validationStatus, setValidationStatus] = useState<ValidationStatus>("idle");
    const [previewError, setPreviewError] = useState(false);

    const validateUrl = async (url: string) => {
        if (!url.trim()) {
            setValidationStatus("idle");
            return;
        }

        // Basic URL format validation
        try {
            const parsed = new URL(url);
            if (!["http:", "https:"].includes(parsed.protocol)) {
                setValidationStatus("invalid");
                return;
            }
        } catch {
            setValidationStatus("invalid");
            return;
        }

        setValidationStatus("validating");
        setPreviewError(false);

        // Check if URL is accessible (via image load test)
        try {
            const img = document.createElement("img");

            await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new Error("Image failed to load"));
                img.src = url;

                // Timeout after 5 seconds
                setTimeout(() => reject(new Error("Timeout")), 5000);
            });

            setValidationStatus("valid");
        } catch {
            setValidationStatus("invalid");
            setPreviewError(true);
        }
    };

    const handleChange = (newValue: string) => {
        onChange(newValue);
        setValidationStatus("idle");
        setPreviewError(false);
    };

    const handleBlur = () => {
        validateUrl(value);
    };

    const handleValidateClick = () => {
        validateUrl(value);
    };

    const StatusIcon = () => {
        switch (validationStatus) {
            case "validating":
                return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
            case "valid":
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case "invalid":
                return <AlertCircle className="h-4 w-4 text-destructive" />;
            default:
                return <ExternalLink className="h-4 w-4 text-muted-foreground" />;
        }
    };

    return (
        <div className="space-y-3">
            <div className="space-y-2">
                <Label htmlFor="external-url">{label}</Label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Input
                            id="external-url"
                            type="url"
                            value={value}
                            onChange={(e) => handleChange(e.target.value)}
                            onBlur={handleBlur}
                            placeholder={placeholder}
                            className="pr-10"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <StatusIcon />
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleValidateClick}
                        disabled={!value.trim() || validationStatus === "validating"}
                    >
                        Vérifier
                    </Button>
                </div>
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
                {validationStatus === "invalid" && (
                    <p className="text-sm text-destructive">
                        {previewError
                            ? "L'URL n'est pas accessible ou n'est pas une image valide"
                            : "Format d'URL invalide (doit commencer par http:// ou https://)"}
                    </p>
                )}
            </div>

            {/* Preview */}
            {value && validationStatus === "valid" && (
                <div className="relative w-full h-32 bg-muted rounded-lg overflow-hidden border">
                    <Image
                        src={value}
                        alt="Preview"
                        fill
                        className="object-contain"
                        onError={() => {
                            setPreviewError(true);
                            setValidationStatus("invalid");
                        }}
                    />
                </div>
            )}
        </div>
    );
}

export default MediaExternalUrlInput;
