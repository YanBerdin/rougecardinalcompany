"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Check, ChevronsUpDown, Plus, CheckCircle2, XCircle, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import {
  submitSpectacleToApi,
  handleSpectacleApiError,
  getSpectacleSuccessMessage,
} from "@/lib/api/spectacles-helpers";
import {
  spectacleFormSchema,
  type SpectacleFormValues,
  cleanSpectacleFormData,
  normalizeGenre,
  formatDateForInput,
} from "@/lib/forms/spectacle-form-helpers";
import { validateImageUrl } from "@/lib/utils/validate-image-url";
//import { z } from "zod";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SpectacleFormProps {
  defaultValues?: Partial<SpectacleFormValues>;
  spectacleId?: number;
  onSuccess?: () => void;
  existingGenres?: string[];
}

// ==========================================================================
// Main Component (<30 lines)
// ==========================================================================

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
  const [isValidatingImage, setIsValidatingImage] = useState(false);
  const [imageValidationError, setImageValidationError] = useState<string | null>(null);
  const [imageValidationSuccess, setImageValidationSuccess] = useState<string | null>(null);
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

  async function onSubmit(data: SpectacleFormValues) {
    setIsSubmitting(true);

    try {
      const cleanData = cleanSpectacleFormData(data);
      const response = await submitSpectacleToApi(cleanData, spectacleId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Échec de la sauvegarde");
      }

      await response.json();

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
      toast.error("Erreur", { description: handleSpectacleApiError(error) });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                <Input placeholder="⚠️ Laissez vide pour génération automatique" {...field} />
              </FormControl>
              <FormDescription>
                Laissez vide pour génération automatique depuis le titre
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status and Genre row */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Statut</FormLabel>
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
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="genre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Genre</FormLabel>
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
                        variant="outline"
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
                              className={`mr-2 h-4 w-4 ${field.value === genre ? "opacity-100" : "opacity-0"
                                }`}
                            />
                            {genre}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuItem
                          onClick={() => {
                            field.onChange(""); // Reset pour afficher le placeholder
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
              <FormLabel>Description courte</FormLabel>
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
              <FormLabel>Description complète</FormLabel>
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
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="duration_minutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durée (minutes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
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
              <FormLabel>Date de première</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image URL */}
        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image du spectacle</FormLabel>
              <FormControl>
                <div className="space-y-3">
                  {/* Aperçu de l'image */}
                  {field.value && imageValidationSuccess && (
                    <div className="relative w-48 h-32 rounded-lg overflow-hidden border bg-muted">
                      <Image
                        src={field.value}
                        alt="Aperçu du spectacle"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => {
                          field.onChange("");
                          setImageValidationError(null);
                          setImageValidationSuccess(null);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  {/* Champ URL + bouton vérifier */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        className="pl-9"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setImageValidationError(null);
                          setImageValidationSuccess(null);
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!field.value || isValidatingImage}
                      onClick={async () => {
                        if (!field.value) return;
                        setIsValidatingImage(true);
                        setImageValidationError(null);
                        setImageValidationSuccess(null);
                        try {
                          const result = await validateImageUrl(field.value);
                          if (!result.valid) {
                            setImageValidationError(result.error || "Image invalide");
                            toast.error("Image invalide", {
                              description: result.error || "Vérifiez l'URL",
                            });
                          } else {
                            const successMsg = `${result.mime}${result.size ? ` (${Math.round(result.size / 1024)}KB)` : ""}`;
                            setImageValidationSuccess(successMsg);
                            toast.success("✅ Image valide", {
                              description: successMsg,
                            });
                          }
                        } catch (err) {
                          const errorMsg = err instanceof Error ? err.message : "Erreur de validation";
                          setImageValidationError(errorMsg);
                          toast.error("Erreur", { description: errorMsg });
                        } finally {
                          setIsValidatingImage(false);
                        }
                      }}
                    >
                      {isValidatingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Vérifier"
                      )}
                    </Button>
                  </div>
                </div>
              </FormControl>
              {imageValidationError && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  {imageValidationError}
                </p>
              )}
              {imageValidationSuccess && !field.value && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Image valide : {imageValidationSuccess}
                </p>
              )}
              <FormDescription>
                Formats acceptés : JPEG, PNG, WebP, SVG, GIF. Cliquez sur &quot;Vérifier&quot; pour valider et afficher l&apos;aperçu.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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
                  Ce spectacle sera affiché sur le site public
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
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
