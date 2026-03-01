"use client";

import { UseFormReturn } from "react-hook-form";
import { ImageFieldGroup } from "@/components/features/admin/media";
import { SpectaclePhotoManager } from "./SpectaclePhotoManager";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { SpectacleFormValues } from "@/lib/forms/spectacle-form-helpers";
import type { SpectacleFormImageSectionProps } from "./types";

export function SpectacleFormImageSection({
    form,
    isPublic,
    spectacleId,
    onValidationChange,
}: SpectacleFormImageSectionProps) {
    return (
        <>
            {/* Image URL with validation state tracking */}
            <ImageFieldGroup
                form={form}
                imageUrlField="image_url"
                label={`Image du spectacle${isPublic ? " *" : ""}`}
                showMediaLibrary={true}
                showUpload={true}
                uploadFolder="spectacles"
                showAltText={false}
                description={
                    isPublic
                        ? "⚠️ Image OBLIGATOIRE et doit être validée. Cliquez sur « Vérifier » avant d'enregistrer."
                        : "⚠️ Toute URL doit être validée avant enregistrement. ⚠️ Laissez vide ou cliquez sur « Vérifier »."
                }
                onValidationChange={onValidationChange}
            />

            {/* Photos paysage (2 max) - Only for existing spectacles */}
            {spectacleId ? (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Label>Photos du spectacle (2 maximum)</Label>
                        <Badge variant="secondary">Optionnel</Badge>
                    </div>
                    <SpectaclePhotoManager spectacleId={spectacleId} />
                </div>
            ) : (
                <Alert>
                    <AlertDescription>
                        Enregistrez d&apos;abord ce spectacle pour ajouter des photos
                        paysage.
                    </AlertDescription>
                </Alert>
            )}
        </>
    );
}
