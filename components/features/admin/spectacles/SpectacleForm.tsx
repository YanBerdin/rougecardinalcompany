"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2, Check, ChevronsUpDown, Plus, AlertCircle } from "lucide-react";
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
  normalizeGenre,
  formatDateForInput,
  getSpectacleSuccessMessage,
} from "@/lib/forms/spectacle-form-helpers";
import { ImageFieldGroup } from "@/components/features/admin/media";
import { SpectaclePhotoManager } from "./SpectaclePhotoManager";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SpectacleFormProps {
  defaultValues?: Partial<SpectacleFormValues>;
  spectacleId?: number;
  onSuccess?: () => void;
  existingGenres?: string[];
}

export default function SpectacleForm({
  defaultValues,
  spectacleId,
  onSuccess,
  existingGenres = [],
}: SpectacleFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingNewGenre, setIsCreatingNewGenre] = useState(false);
  const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);

  // Image validation state (null = untested, true = valid, false = invalid)
  const [isImageValidated, setIsImageValidated] = useState<boolean | null>(
    defaultValues?.image_url ? true : null
  );

  const isEditing = !!spectacleId;

  const form = useForm({
    resolver: zodResolver(spectacleFormSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      slug: defaultValues?.slug ?? "",
      status: defaultValues?.status ?? "draft",
      description: defaultValues?.description ?? "",
      short_description: defaultValues?.short_description ?? "",
      genre: defaultValues?.genre ?? "",
      duration_minutes: defaultValues?.duration_minutes ?? "",
      casting: defaultValues?.casting ?? "",
      premiere: formatDateForInput(defaultValues?.premiere),
      image_url: defaultValues?.image_url ?? "",
      public: defaultValues?.public ?? false,
    },
  });

  // Watch public checkbox and form values for dynamic validation feedback
  const isPublic = form.watch("public");
  const currentStatus = form.watch("status");
  const imageUrl = form.watch("image_url");
  const [showPublicWarning, setShowPublicWarning] = useState(false);

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
    form.watch("genre"),
    form.watch("premiere"),
    form.watch("short_description"),
    form.watch("description"),
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
      const cleanData = cleanSpectacleFormData(data) as CreateSpectacleInput;

      const result = spectacleId
        ? await updateSpectacleAction({
          id: spectacleId,
          ...cleanData,
        } as UpdateSpectacleInput)
        : await createSpectacleAction(cleanData);

      if (!result.success) {
        toast.error(result.error || "Échec de l'enregistrement du spectacle");
        return;
      }

      const successAction = isEditing
        ? "Spectacle mis à jour"
        : "Spectacle créé";
      toast.success(
        successAction,
        getSpectacleSuccessMessage(isEditing, data.title)
      );

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/spectacles");
        router.refresh();
      }
    } catch (error) {
      console.error("Submit error:", error);
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

        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre *</FormLabel>
              <FormControl>
                <Input placeholder="Hamlet" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Slug */}
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input
                  placeholder="⚠️ Laissez vide pour génération automatique"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Laissez vide pour génération automatique depuis le titre
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status and Genre row */}
        <div className="grid grid-cols-2 gap-4 items-start">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Statut{" "}
                  {isPublic && <span className="text-destructive">*</span>}
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="published">Actuellement</SelectItem>
                    <SelectItem value="archived">Archive</SelectItem>
                  </SelectContent>
                </Select>
                {isPublic && field.value === "draft" && (
                  <FormDescription className="text-destructive">
                    Un spectacle public ne peut pas être en brouillon
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="genre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Genre{" "}
                  {isPublic && <span className="text-destructive">*</span>}
                </FormLabel>
                <FormControl>
                  {isCreatingNewGenre ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nouveau genre de spectacle..."
                        value={field.value}
                        onChange={(e) => {
                          const normalized = normalizeGenre(e.target.value);
                          field.onChange(normalized);
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        autoFocus
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setIsCreatingNewGenre(false);
                          if (!field.value?.trim()) {
                            field.onChange("");
                          }
                        }}
                      >
                        Annuler
                      </Button>
                    </div>
                  ) : (
                    <DropdownMenu
                      open={genreDropdownOpen}
                      onOpenChange={setGenreDropdownOpen}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={genreDropdownOpen}
                          className="w-full justify-between"
                        >
                          {field.value || "Sélectionner un genre..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full min-w-[200px] p-0">
                        {existingGenres.map((genre) => (
                          <DropdownMenuItem
                            key={genre}
                            onClick={() => {
                              field.onChange(genre);
                              setGenreDropdownOpen(false);
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${field.value === genre
                                  ? "opacity-100"
                                  : "opacity-0"
                                }`}
                            />
                            {genre}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuItem
                          onClick={() => {
                            field.onChange("");
                            setIsCreatingNewGenre(true);
                            setGenreDropdownOpen(false);
                          }}
                          className="border-t"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Créer un nouveau genre
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Short Description */}
        <FormField
          control={form.control}
          name="short_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Description courte{" "}
                {isPublic && <span className="text-destructive">*</span>}
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Un résumé bref pour les listes..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>Maximum 500 caractères</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Full Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Description complète{" "}
                {isPublic && <span className="text-destructive">*</span>}
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Description détaillée du spectacle..."
                  className="resize-none min-h-32"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Duration and Casting row */}
        <div className="grid grid-cols-2 gap-4 items-start">
          <FormField
            control={form.control}
            name="duration_minutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durée (minutes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="90"
                    value={typeof field.value === "number" ? field.value : ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseInt(e.target.value) : ""
                      )
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="casting"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre d&apos;interprètes</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="5"
                    value={typeof field.value === "number" ? field.value : ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseInt(e.target.value) : ""
                      )
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Premiere Date */}
        <FormField
          control={form.control}
          name="premiere"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Date de première{" "}
                {isPublic && <span className="text-destructive">*</span>}
              </FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
              : "⚠️ Toute URL doit être validée avant enregistrement. Laissez vide ou cliquez sur « Vérifier »."
          }
          onValidationChange={setIsImageValidated}
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
              Enregistrez d&apos;abord ce spectacle pour ajouter des photos paysage.
            </AlertDescription>
          </Alert>
        )}

        {/* Public Checkbox */}
        <FormField
          control={form.control}
          name="public"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Visible publiquement</FormLabel>
                <FormDescription>
                  {field.value
                    ? "⚠️ Ce spectacle sera affiché sur le site public. Une image validée est obligatoire."
                    : "Ce spectacle sera affiché sur le site public (nécessite les champs marqués *)"}
                </FormDescription>
              </div>
            </FormItem>
          )}
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
