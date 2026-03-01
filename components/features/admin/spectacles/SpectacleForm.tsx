"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  createSpectacleAction,
  updateSpectacleAction,
} from "@/app/(admin)/admin/spectacles/actions";
import type {
  CreateSpectacleInput,
  UpdateSpectacleInput,
} from "@/lib/schemas/spectacles";
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
import type { SpectacleFormProps } from "./types";

export default function SpectacleForm({
  defaultValues,
  spectacleId,
  onSuccess,
  existingGenres = [],
}: SpectacleFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const genre = form.getValues("genre");
      const premiere = form.getValues("premiere");
      const shortDesc = form.getValues("short_description");
      const description = form.getValues("description");

      const isIncomplete =
        currentStatus === "draft" ||
        !genre ||
        !premiere ||
        !shortDesc ||
        !description ||
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

      const result = spectacleId
        ? await updateSpectacleAction({
            id: spectacleId,
            ...cleanData,
          })
        : await createSpectacleAction(cleanData);

      if (!result.success) {
        toast.error(result.error || "Échec de l'enregistrement du spectacle");
        return;
      }

      toast.success(
        isEditing ? "Spectacle mis à jour" : "Spectacle créé",
        {
          description: `« ${data.title} » a été ${
            isEditing ? "mis à jour" : "créé"
          } avec succès.`,
        }
      );

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
        {/* Progressive validation warning */}
        {showPublicWarning && (
          <Alert className="destructive">
            <AlertCircle className="h-4 w-4" />
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
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Mettre à jour" : "Créer le spectacle"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
