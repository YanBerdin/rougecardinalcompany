"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  TeamMemberFormSchema,
  type TeamMemberFormValues,
} from "@/lib/schemas/team";
import type { TeamMemberFormProps } from "./types";
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
import { ImageFieldGroup } from "@/components/features/admin/media";

export function TeamMemberForm({
  member,
  onSubmit,
  onCancel,
}: TeamMemberFormProps) {
  const [isPending, setIsPending] = useState(false);

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

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="space-y-4 sm:space-y-5"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">Nom *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Nom du membre"
                    aria-required="true"
                    className="h-10 sm:h-11 text-base"
                  />
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
                <FormLabel className="text-sm sm:text-base">Rôle</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Ex: Acteur, Metteur en scène..."
                    className="h-10 sm:h-11 text-base"
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
                <FormLabel className="text-sm sm:text-base">Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Biographie, parcours..."
                    rows={4}
                    className="text-base min-h-[100px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Photo section - Using ImageFieldGroup */}
          <ImageFieldGroup
            form={form}
            imageUrlField="image_url"
            imageMediaIdField="photo_media_id"
            label="Photo du membre"
            showAltText={false}
            showUpload={true}
            uploadFolder="team"
          />

          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-2 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={onCancel}
              disabled={isPending}
              className="w-full sm:w-auto h-11 sm:h-10 text-base sm:text-sm"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
              className="w-full sm:w-auto h-11 sm:h-10 text-base sm:text-sm"
            >
              {isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
