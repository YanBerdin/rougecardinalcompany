"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
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

// Form schema matching CreateSpectacleSchema
const spectacleFormSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(255),
  slug: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  description: z.string().optional(),
  short_description: z.string().max(500).optional(),
  genre: z.string().max(100).optional(),
  duration_minutes: z.coerce.number().int().positive().optional(),
  casting: z.coerce.number().int().positive().optional(),
  premiere: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal("")),
  public: z.boolean().optional(),
});

type SpectacleFormValues = z.infer<typeof spectacleFormSchema>;

interface Props {
  defaultValues?: Partial<SpectacleFormValues>;
  spectacleId?: number;
  onSuccess?: () => void;
}

export default function SpectacleForm({
  defaultValues,
  spectacleId,
  onSuccess,
}: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      // Clean empty strings to undefined and convert string numbers to actual numbers
      const cleanData: Record<string, unknown> = {};
      
      for (const [key, value] of Object.entries(data)) {
        // Skip undefined values
        if (value === undefined) {
          continue;
        }
        
        // Convert empty strings to undefined
        if (value === "" || value === null) {
          cleanData[key] = undefined;
        } 
        // Convert number fields from string to number
        else if (key === "duration_minutes" || key === "casting") {
          const numValue = typeof value === "string" ? parseInt(value, 10) : value;
          cleanData[key] = !isNaN(numValue as number) && numValue !== 0 ? numValue : undefined;
        } 
        // Convert date to ISO datetime (YYYY-MM-DD -> YYYY-MM-DDTHH:MM:SS.sssZ)
        else if (key === "premiere" && typeof value === "string") {
          cleanData[key] = new Date(value).toISOString();
        }
        // Convert slug to lowercase and replace spaces with dashes (required by API schema)
        else if (key === "slug" && typeof value === "string") {
          cleanData[key] = value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        }
        // Keep all other values as-is (including booleans, non-empty strings, etc.)
        else {
          cleanData[key] = value;
        }
      }
      // Log data for debugging
      console.log("Form data before cleaning:", data); //TODO: remove
      console.log("Clean data being sent to API:", cleanData); //TODO: Remove

      const endpoint = isEditing
        ? `/api/admin/spectacles/${spectacleId}`
        : `/api/admin/spectacles`;
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Échec de la sauvegarde");
      }

      await response.json(); // Consume response

      toast.success(isEditing ? "Spectacle mis à jour" : "Spectacle créé", {
        description: `"${data.title}" a été ${
          isEditing ? "mis à jour" : "créé"
        } avec succès.`,
      });

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
                    <SelectItem value="published">Publié</SelectItem>
                    <SelectItem value="archived">Archivé</SelectItem>
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
                  <Input placeholder="Tragédie, Comédie..." {...field} />
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
                    value={typeof field.value === 'number' ? field.value : ""}
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
                    value={typeof field.value === 'number' ? field.value : ""}
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
