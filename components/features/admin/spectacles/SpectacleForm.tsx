"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch, type Path } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  createSpectacleAction,
  updateSpectacleAction,
} from "@/app/(admin)/admin/spectacles/actions";
import {
  spectacleFormSchema,
  type SpectacleFormValues,
  cleanSpectacleFormData,
  formatDateForInput,
} from "@/lib/forms/spectacle-form-helpers";
import { SpectacleFormFields } from "./SpectacleFormFields";
import { SpectacleFormMetadata } from "./SpectacleFormMetadata";
import { SpectacleFormImageSection } from "./SpectacleFormImageSection";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AutoSaveIndicator } from "@/components/features/admin/shared/AutoSaveIndicator";
import { useFormAutosave } from "@/lib/hooks/use-form-autosave";
import type { SpectacleFormProps } from "./types";

const AUTO_SAVE_TRIGGER_FIELDS: Array<Path<SpectacleFormValues>> = [
  "title",
  "short_description",
  "description",
  "genre",
];

const DRAFT_TITLE_FALLBACK = "(Sans titre)";

type SpectacleAutoSavePayload = ReturnType<typeof cleanSpectacleFormData>;
type SpectacleAutoSaveUpdatePayload = Partial<SpectacleAutoSavePayload>;

export default function SpectacleForm({
  defaultValues,
  spectacleId,
  onSuccess,
  existingGenres = [],
}: SpectacleFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedDraftId, setSavedDraftId] = useState<string | null>(
    spectacleId ? String(spectacleId) : null
  );

  // Image validation state (null = untested, true = valid, false = invalid)
  const [isImageValidated, setIsImageValidated] = useState<boolean | null>(
    defaultValues?.image_url ? true : null
  );

  const isEditing = !!spectacleId;

  const form = useForm<SpectacleFormValues>({
    resolver: zodResolver(spectacleFormSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      slug: defaultValues?.slug ?? "",
      status: defaultValues?.status ?? "draft",
      description: defaultValues?.description ?? "",
      paragraph_2: defaultValues?.paragraph_2 ?? "",
      paragraph_3: defaultValues?.paragraph_3 ?? "",
      short_description: defaultValues?.short_description ?? "",
      genre: defaultValues?.genre ?? "",
      duration_minutes: typeof defaultValues?.duration_minutes === "string"
        ? parseInt(defaultValues.duration_minutes, 10) || undefined
        : defaultValues?.duration_minutes ?? undefined,
      casting: typeof defaultValues?.casting === "string"
        ? parseInt(defaultValues.casting, 10) || undefined
        : defaultValues?.casting ?? undefined,
      premiere: formatDateForInput(defaultValues?.premiere),
      image_url: defaultValues?.image_url ?? "",
      public: defaultValues?.public ?? false,
    },
  });

  // Watch public checkbox and form values for dynamic validation feedback
  const isPublic = form.watch("public") ?? false;
  const currentStatus = form.watch("status") ?? "draft";
  const imageUrl = form.watch("image_url");
  const [showPublicWarning, setShowPublicWarning] = useState(false);

  // Watch fields used in the progressive validation useEffect deps
  const [watchedGenre, watchedPremiere, watchedShortDesc, watchedDesc] =
    useWatch({
      control: form.control,
      name: ["genre", "premiere", "short_description", "description"],
    });

  // Show progressive validation warning when public=true
  useEffect(() => {
    if (isPublic) {
      const isIncomplete =
        currentStatus === "draft" ||
        !watchedGenre ||
        !watchedPremiere ||
        !watchedShortDesc ||
        !watchedDesc ||
        !imageUrl ||
        isImageValidated !== true;

      setShowPublicWarning(isIncomplete);
    } else {
      setShowPublicWarning(false);
    }
  }, [
    isPublic,
    currentStatus,
    imageUrl,
    isImageValidated,
    watchedGenre,
    watchedPremiere,
    watchedShortDesc,
    watchedDesc,
  ]);

  const handleAutoCreate = useCallback(
    async (payload: SpectacleAutoSavePayload) => {
      const result = await createSpectacleAction(payload);
      if (!result.success) {
        return result;
      }
      const createdId = result.data?.id;
      if (createdId === undefined || createdId === null) {
        return { success: false as const, error: "Spectacle ID missing in response" };
      }
      return { success: true as const, data: { id: String(createdId) } };
    },
    []
  );

  const handleAutoUpdate = useCallback(
    async (id: string, payload: SpectacleAutoSaveUpdatePayload) => {
      const result = await updateSpectacleAction({
        ...payload,
        id: Number(id),
      });
      return result.success ? { success: true as const } : result;
    },
    []
  );

  const transformCreatePayload = useCallback(
    (payload: SpectacleAutoSavePayload): SpectacleAutoSavePayload => {
      const title = typeof payload.title === "string" ? payload.title.trim() : "";
      if (title.length === 0) {
        return { ...payload, title: DRAFT_TITLE_FALLBACK };
      }
      return payload;
    },
    []
  );

  const transformUpdatePayload = useCallback(
    (payload: SpectacleAutoSaveUpdatePayload): SpectacleAutoSaveUpdatePayload => {
      const trimmedTitle =
        typeof payload.title === "string" ? payload.title.trim() : undefined;
      if (trimmedTitle === undefined || trimmedTitle.length > 0) {
        return payload;
      }
      const { title: _omitted, ...rest } = payload;
      return rest;
    },
    []
  );

  const autoSave = useFormAutosave<
    SpectacleFormValues,
    SpectacleAutoSavePayload,
    SpectacleAutoSaveUpdatePayload
  >({
    form,
    enabled: !isSubmitting,
    initialDraftId: savedDraftId,
    triggerFields: AUTO_SAVE_TRIGGER_FIELDS,
    onCreate: handleAutoCreate,
    onUpdate: handleAutoUpdate,
    buildDraftPayload: cleanSpectacleFormData,
    transformCreatePayload,
    transformUpdatePayload,
  });

  useEffect(() => {
    if (autoSave.draftId && autoSave.draftId !== savedDraftId) {
      setSavedDraftId(autoSave.draftId);
    }
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

  async function onSubmit(data: SpectacleFormValues) {
    // CRITICAL: Image URL validation (if provided, must be validated)
    if (data.image_url && data.image_url !== "") {
      if (isImageValidated !== true) {
        toast.error("Image non validée", {
          description:
            "Cliquez sur 'Vérifier' pour valider l'URL de l'image, ou supprimez-la.",
        });
        return;
      }
    }

    // CRITICAL: Public spectacles require validated image
    if (data.public && (!data.image_url || data.image_url === "")) {
      toast.error("Image requise", {
        description:
          "Un spectacle visible publiquement doit avoir une image validée.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanData = cleanSpectacleFormData(data);

      const result = savedDraftId
        ? await updateSpectacleAction({
          id: Number(savedDraftId),
          ...cleanData,
        })
        : await createSpectacleAction(cleanData);

      if (!result.success) {
        toast.error(result.error || "Échec de l'enregistrement du spectacle");
        return;
      }

      toast.success(
        isEditing || savedDraftId ? "Spectacle mis à jour" : "Spectacle créé",
        {
          description: `« ${data.title} » a été ${isEditing || savedDraftId ? "mis à jour" : "créé"
            } avec succès.`,
        }
      );

      setSavedDraftId(null);

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/spectacles");
        router.refresh();
      }
    } catch (error) {
      toast.error("Erreur", {
        description:
          error instanceof Error
            ? error.message
            : "Impossible de sauvegarder le spectacle",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <AutoSaveIndicator
          status={autoSave.status}
          lastSavedAt={autoSave.lastSavedAt}
          errorMessage={autoSave.errorMessage}
        />

        {/* Progressive validation warning */}
        {showPublicWarning && (
          <Alert className="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>
              Un spectacle public nécessite : statut publié/archivé, genre, date
              de première, descriptions courte et complète, et une image
              validée.
            </AlertDescription>
          </Alert>
        )}

        {/* Text Fields Component */}
        <SpectacleFormFields form={form} isPublic={isPublic} />

        {/* Metadata Component */}
        <SpectacleFormMetadata
          form={form}
          isPublic={isPublic}
          existingGenres={existingGenres}
        />

        {/* Image Section Component */}
        <SpectacleFormImageSection
          form={form}
          isPublic={isPublic}
          spectacleId={spectacleId}
          onValidationChange={setIsImageValidated}
        />

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            disabled={isSubmitting || autoSave.isSaving}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting || autoSave.isSaving}>
            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isEditing || savedDraftId ? "Mettre à jour" : "Créer le spectacle"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
