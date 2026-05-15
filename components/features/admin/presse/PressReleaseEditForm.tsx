"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form } from "@/components/ui/form";
import { AlertTriangle } from "lucide-react";
import { AutoSaveIndicator } from "@/components/features/admin/presse/AutoSaveIndicator";
import { PressReleaseFormFields } from "@/components/features/admin/presse/PressReleaseFormFields";
import { cleanPressReleaseFormData, getPressReleaseSuccessMessage } from "@/lib/utils/press-utils";
import {
    createPressReleaseAction,
    updatePressReleaseAction,
} from "@/app/(admin)/admin/presse/press-releases-actions";
import {
    usePressReleaseAutosave,
    type PressReleaseAutoSavePayload,
    type PressReleaseAutoSaveUpdatePayload,
} from "@/lib/hooks/use-press-release-autosave";
import { PressReleaseFormSchema, type PressReleaseFormValues, type PressReleaseDTO } from "@/lib/schemas/press-release";
import type { SelectOptionDTO } from "@/lib/schemas/press-release";

const AUTO_SAVE_TRIGGER_FIELDS: Array<keyof PressReleaseFormValues> = ["title", "description"];

interface PressReleaseEditFormProps {
    release: PressReleaseDTO;
    spectacles?: SelectOptionDTO[];
    evenements?: SelectOptionDTO[];
}

export function PressReleaseEditForm({ release, spectacles = [], evenements = [] }: PressReleaseEditFormProps) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const isAutoSaveEnabled = !release.public && !isPending;

    const form = useForm<PressReleaseFormValues>({
        resolver: zodResolver(PressReleaseFormSchema),
        defaultValues: {
            title: release.title,
            slug: release.slug ?? "",
            description: release.description ?? "",
            date_publication: release.date_publication.split("T")[0],
            image_url: release.image_url ?? "",
            image_media_id: release.image_media_id ?? undefined,
            spectacle_id: release.spectacle_id ?? undefined,
            evenement_id: release.evenement_id ?? undefined,
            public: release.public,
            ordre_affichage: release.ordre_affichage,
        },
    });

    // Pattern 1: Image validation state (initialized from existing data)
    const [isImageValidated, setIsImageValidated] = useState<boolean | null>(
        release.image_url || release.image_media_id ? true : null
    );

    // Pattern 2: Progressive warning state
    const [showPublicWarning, setShowPublicWarning] = useState(false);

    const handleAutoCreate = useCallback(async (payload: PressReleaseAutoSavePayload) => {
        return createPressReleaseAction(payload);
    }, []);

    const handleAutoUpdate = useCallback(
        async (id: string, payload: PressReleaseAutoSaveUpdatePayload) => {
            return updatePressReleaseAction(id, payload);
        },
        []
    );

    const autoSave = usePressReleaseAutosave({
        form,
        enabled: isAutoSaveEnabled,
        initialDraftId: String(release.id),
        triggerFields: AUTO_SAVE_TRIGGER_FIELDS,
        debounceMs: 2000,
        intervalMs: 30000,
        onCreate: handleAutoCreate,
        onUpdate: handleAutoUpdate,
        buildDraftPayload: cleanPressReleaseFormData,
    });

    // Pattern 2: Progressive validation logic
    useEffect(() => {
        const subscription = form.watch((value) => {
            const { public: isPublic, image_url, image_media_id } = value;

            if (isPublic && !image_url && !image_media_id && isImageValidated !== true) {
                setShowPublicWarning(true);
            } else {
                setShowPublicWarning(false);
            }
        });
        return () => subscription.unsubscribe();
    }, [form, isImageValidated]);

    const onSubmit = async (data: PressReleaseFormValues) => {
        // Pattern 1: Image validation gate
        if (isImageValidated !== true && (data.image_url || data.image_media_id)) {
            toast.error("Veuillez attendre la validation de l'image");
            return;
        }

        // Pattern 1: Public releases require image
        if (data.public && !data.image_url && !data.image_media_id) {
            toast.error("Les communiqués publics nécessitent une image");
            return;
        }

        setIsPending(true);

        try {
            // Pattern 4: Clean form data (number → bigint conversions)
            const cleanedData = cleanPressReleaseFormData(data);
            const result = await updatePressReleaseAction(String(release.id), cleanedData);

            if (!result.success) {
                throw new Error(result.error);
            }

            // Pattern 5: Contextualized success message
            toast.success("Communiqué mis à jour", getPressReleaseSuccessMessage(true, data.title));
            router.push("/admin/presse");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erreur");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {release.public && (
                    <Alert className="border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-900/10 dark:text-blue-300">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            Article publié - sauvegarde manuelle requise.
                        </AlertDescription>
                    </Alert>
                )}

                {isAutoSaveEnabled && (
                    <AutoSaveIndicator
                        status={autoSave.status}
                        lastSavedAt={autoSave.lastSavedAt}
                        errorMessage={autoSave.errorMessage}
                    />
                )}

                {/* Pattern 2: Progressive validation warning */}
                {showPublicWarning && (
                    <Alert className="border-yellow-500 bg-yellow-50 text-yellow-900 dark:bg-yellow-900/10 dark:text-yellow-500">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            Les communiqués publics nécessitent une image.
                        </AlertDescription>
                    </Alert>
                )}

                <PressReleaseFormFields
                    form={form}
                    isPending={isPending}
                    spectacles={spectacles}
                    evenements={evenements}
                    publishLabel="Publier"
                    initialSpectacleId={release.spectacle_id}
                    initialEvenementId={release.evenement_id}
                    onImageValidationChange={setIsImageValidated}
                />

                <div className="flex gap-2 justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isPending || autoSave.isSaving}
                    >
                        Annuler
                    </Button>
                    <Button type="submit" disabled={isPending || autoSave.isSaving}>
                        {isPending ? "Mise à jour..." : "Mettre à jour"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
