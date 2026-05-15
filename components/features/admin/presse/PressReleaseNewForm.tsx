"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Form } from "@/components/ui/form";
import { AlertCircle } from "lucide-react";
import { AutoSaveIndicator } from "@/components/features/admin/presse/AutoSaveIndicator";
import { PressReleaseFormFields } from "@/components/features/admin/presse/PressReleaseFormFields";
import {
    createPressReleaseAction,
    updatePressReleaseAction,
} from "@/app/(admin)/admin/presse/press-releases-actions";
import {
    usePressReleaseAutosave,
    type PressReleaseAutoSavePayload,
    type PressReleaseAutoSaveUpdatePayload,
} from "@/lib/hooks/use-press-release-autosave";
import { PressReleaseFormSchema, type PressReleaseFormValues } from "@/lib/schemas/press-release";
import { cleanPressReleaseFormData, getPressReleaseSuccessMessage } from "@/lib/utils/press-utils";
import type { SelectOptionDTO } from "@/lib/schemas/press-release";

interface PressReleaseNewFormProps {
    spectacles?: SelectOptionDTO[];
    evenements?: SelectOptionDTO[];
}

const AUTO_SAVE_TRIGGER_FIELDS: Array<keyof PressReleaseFormValues> = ["title", "description"];

function hasUnvalidatedExternalImage(
    data: PressReleaseFormValues,
    isImageValidated: boolean | null
): boolean {
    return Boolean(data.image_url && data.image_url !== "" && isImageValidated !== true);
}

function requiresImageForPublicRelease(data: PressReleaseFormValues): boolean {
    return Boolean(data.public && !data.image_url && !data.image_media_id);
}

function getSubmitButtonLabel(
    isPending: boolean,
    isPublic: boolean,
    hasSavedDraft: boolean
): string {
    if (isPending) {
        return hasSavedDraft ? "Enregistrement..." : "Création...";
    }

    if (!hasSavedDraft) {
        return isPublic ? "Créer et publier" : "Créer";
    }

    return isPublic ? "Publier" : "Enregistrer le brouillon";
}

export function PressReleaseNewForm({
    spectacles = [],
    evenements = [],
}: PressReleaseNewFormProps) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [isImageValidated, setIsImageValidated] = useState<boolean | null>(null);
    const [savedDraftId, setSavedDraftId] = useState<string | null>(null);

    const form = useForm<PressReleaseFormValues>({
        resolver: zodResolver(PressReleaseFormSchema),
        defaultValues: {
            title: "",
            slug: "",
            description: "",
            date_publication: new Date().toISOString().split("T")[0],
            image_url: "",
            image_media_id: undefined,
            public: false,
            ordre_affichage: 0,
        },
    });

    // Warning progressif
    const isPublic = form.watch("public");
    const imageUrl = form.watch("image_url");
    const imageMediaId = form.watch("image_media_id");
    const watchedTitle = form.watch("title");
    const watchedDescription = form.watch("description");
    const watchedDatePublication = form.watch("date_publication");
    const [showPublicWarning, setShowPublicWarning] = useState(false);
    const hasSavedDraft = Boolean(savedDraftId);

    const handleAutoCreate = useCallback(async (payload: PressReleaseAutoSavePayload) => {
        const result = await createPressReleaseAction(payload);
        if (result.success) {
            setSavedDraftId(result.data.id);
        }
        return result;
    }, []);

    const handleAutoUpdate = useCallback(
        async (id: string, payload: PressReleaseAutoSaveUpdatePayload) => {
            return updatePressReleaseAction(id, payload);
        },
        []
    );

    const autoSave = usePressReleaseAutosave({
        form,
        enabled: !isPending,
        initialDraftId: savedDraftId,
        triggerFields: AUTO_SAVE_TRIGGER_FIELDS,
        debounceMs: 2000,
        intervalMs: 30000,
        onCreate: handleAutoCreate,
        onUpdate: handleAutoUpdate,
        buildDraftPayload: cleanPressReleaseFormData,
    });

    useEffect(() => {
        if (!autoSave.draftId || autoSave.draftId === savedDraftId) {
            return;
        }
        setSavedDraftId(autoSave.draftId);
    }, [autoSave.draftId, savedDraftId]);

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (!autoSave.isSaving) {
                return;
            }

            event.preventDefault();
            event.returnValue = "";
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [autoSave.isSaving]);

    useEffect(() => {
        if (isPublic) {
            const hasImage = imageUrl || imageMediaId;
            const isIncomplete =
                !watchedTitle ||
                !watchedDescription ||
                !watchedDatePublication ||
                !hasImage ||
                (imageUrl && isImageValidated !== true);

            setShowPublicWarning(Boolean(isIncomplete));
        } else {
            setShowPublicWarning(false);
        }
    }, [
        isPublic,
        imageUrl,
        imageMediaId,
        isImageValidated,
        watchedTitle,
        watchedDescription,
        watchedDatePublication,
    ]);

    const onSubmit = async (data: PressReleaseFormValues) => {
        if (hasUnvalidatedExternalImage(data, isImageValidated)) {
            toast.error("Image non validée", {
                description: "Veuillez vérifier que l'URL de l'image est accessible.",
            });
            return;
        }

        if (requiresImageForPublicRelease(data)) {
            toast.error("Image requise", {
                description: "Un communiqué visible publiquement doit avoir une image.",
            });
            return;
        }

        setIsPending(true);

        try {
            const cleanData = cleanPressReleaseFormData(data);
            const result = savedDraftId
                ? await updatePressReleaseAction(savedDraftId, cleanData)
                : await createPressReleaseAction(cleanData);

            if (!result.success) {
                throw new Error(result.error);
            }

            toast.success(
                savedDraftId ? "Communiqué mis à jour" : "Communiqué créé",
                getPressReleaseSuccessMessage(Boolean(savedDraftId), data.title)
            );
            form.reset();
            setSavedDraftId(null);
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
                {/* Warning progressif */}
                {showPublicWarning && (
                    <Alert className="border-yellow-500 bg-yellow-50 text-yellow-900 dark:bg-yellow-900/10 dark:text-yellow-500">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Publication incomplète</AlertTitle>
                        <AlertDescription>
                            Certains champs requis sont manquants pour la publication publique.
                            Le communiqué sera sauvegardé mais non visible publiquement.
                        </AlertDescription>
                    </Alert>
                )}

                <AutoSaveIndicator
                    status={autoSave.status}
                    lastSavedAt={autoSave.lastSavedAt}
                    errorMessage={autoSave.errorMessage}
                />

                <PressReleaseFormFields
                    form={form}
                    isPending={isPending}
                    spectacles={spectacles}
                    evenements={evenements}
                    publishLabel="Publier immédiatement"
                    imageLabel="Image du communiqué"
                    imageDescription="Image principale affichée dans le kit média (recommandé : 1200x630px)"
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
                        {getSubmitButtonLabel(isPending, isPublic, hasSavedDraft)}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
