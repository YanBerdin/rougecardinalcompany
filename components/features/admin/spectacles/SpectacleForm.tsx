"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
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
} from "@/lib/forms/spectacle-form-helpers";
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
import { Check, ChevronsUpDown, Plus } from "lucide-react";

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
      premiere: defaultValues?.premiere ?? "",
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
                <Input placeholder="hamlet" {...field} />
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
                        placeholder="Nouveau genre..."
                        value={field.value}
                        onChange={(e) => {
                          const normalized = normalizeGenre(e.target.value);
                          field.onChange(normalized);
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
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
                              className={`mr-2 h-4 w-4 ${
                                field.value === genre ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            {genre}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuItem
                          onClick={() => {
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
              <FormLabel>URL de l&apos;image</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  {...field}
                />
              </FormControl>
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
