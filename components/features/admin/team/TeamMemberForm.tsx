"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { ImageIcon, Upload } from "lucide-react";

import {
  TeamMemberFormSchema,
  type TeamMemberFormValues,
  type TeamMemberDb,
} from "@/lib/schemas/team";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  MediaUploadDialog,
  MediaExternalUrlInput,
  type MediaSelectResult,
} from "@/components/features/admin/media";

interface TeamMemberFormProps {
  member?: TeamMemberDb | null;
  onSubmit: (data: TeamMemberFormValues) => Promise<void>;
  onCancel?: () => void;
}

export function TeamMemberForm({
  member,
  onSubmit,
  onCancel,
}: TeamMemberFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(TeamMemberFormSchema),
    defaultValues: {
      name: member?.name ?? "",
      role: member?.role ?? "",
      description: member?.description ?? "",
      image_url: member?.image_url ?? "",
      photo_media_id: member?.photo_media_id ?? null,
      ordre: member?.ordre ?? null,
      active: member?.active ?? true,
    },
  });

  const handleFormSubmit = async (data: TeamMemberFormValues) => {
    setIsPending(true);
    try {
      await onSubmit(data);
    } finally {
      setIsPending(false);
    }
  };

  const handlePhotoSelect = (result: MediaSelectResult) => {
    form.setValue("photo_media_id", result.id);
    form.setValue("image_url", result.url);
  };

  const handleRemovePhoto = () => {
    form.setValue("image_url", "");
    form.setValue("photo_media_id", null);
  };

  const currentPhotoUrl = form.watch("image_url");
  const currentName = form.watch("name");

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nom du membre" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rôle</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Ex: Acteur, Metteur en scène..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Biographie, parcours..."
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Photo section */}
          <div>
            <label className="block text-sm font-medium mb-2">Photo</label>

            {currentPhotoUrl ? (
              <div className="space-y-2">
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                  <Image
                    src={currentPhotoUrl}
                    alt={currentName || "Photo du membre"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleRemovePhoto}
                  >
                    Supprimer
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMediaPicker(true)}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Changer
                  </Button>

                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowMediaPicker(true)}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Ajouter une photo
              </Button>
            )}
          </div>

          {/* URL externe (fallback) */}
          <FormField
            control={form.control}
            name="image_url"
            render={({ field }) => (
              <MediaExternalUrlInput
                value={field.value ?? ""}
                onChange={field.onChange}
                label="URL externe (optionnel)"
                description="Utilisé si aucune photo n'est téléversée"
              />
            )}
          />

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={onCancel}
              disabled={isPending}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </Form>

      <MediaUploadDialog
        open={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handlePhotoSelect}
      />
    </>
  );
}

export default TeamMemberForm;
