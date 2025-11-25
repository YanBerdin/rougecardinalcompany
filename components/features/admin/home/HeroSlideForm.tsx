"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { MediaPickerDialog } from "@/components/features/admin/media/MediaPickerDialog";
import { HeroSlideInputSchema, type HeroSlideDTO } from "@/lib/schemas/home-content";

interface HeroSlideFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  slide?: HeroSlideDTO | null;
}

export function HeroSlideForm({
  open,
  onClose,
  onSuccess,
  slide,
}: HeroSlideFormProps) {
  const router = useRouter();
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const form = useForm({
    resolver: zodResolver(HeroSlideInputSchema),
    defaultValues: {
      title: slide?.title ?? "",
      subtitle: slide?.subtitle ?? "",
      description: slide?.description ?? "",
      image_url: slide?.image_url ?? "",
      image_media_id: slide?.image_media_id,
      cta_label: slide?.cta_label ?? "",
      cta_url: slide?.cta_url ?? "",
      alt_text: slide?.alt_text ?? "",
      active: slide?.active ?? true,
      position: slide?.position,
    },
  });

  const onSubmit = async (data: any) => {
    setIsPending(true);

    try {
      const url = slide
        ? `/api/admin/home/hero/${slide.id}`
        : "/api/admin/home/hero";
      const method = slide ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save slide");
      }

      toast.success(slide ? "Slide updated" : "Slide created");
      form.reset();
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save slide");
    } finally {
      setIsPending(false);
    }
  };

  const handleMediaSelect = (media: { id: bigint; url: string }) => {
    form.setValue("image_media_id", media.id);
    form.setValue("image_url", media.url);
    setIsMediaPickerOpen(false);
  };

  const watchSubtitle = form.watch("subtitle") ?? "";
  const watchDescription = form.watch("description") ?? "";
  const watchAltText = form.watch("alt_text") ?? "";

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{slide ? "Edit Hero Slide" : "Add Hero Slide"}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={80} placeholder="Main headline" />
                    </FormControl>
                    <FormDescription>
                      {field.value.length}/80 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtitle</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={150} placeholder="Supporting text" />
                    </FormControl>
                    <FormDescription>
                      {watchSubtitle.length}/150 characters
                    </FormDescription>
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
                      <Textarea {...field} maxLength={500} rows={3} />
                    </FormControl>
                    <FormDescription>
                      {watchDescription.length}/500 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Image *</FormLabel>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsMediaPickerOpen(true)}
                  >
                    Select from Media Library
                  </Button>
                  {form.watch("image_url") && (
                    <img
                      src={form.watch("image_url") || ""}
                      alt="Preview"
                      className="h-20 w-32 object-cover rounded"
                    />
                  )}
                </div>
              </div>

              <FormField
                control={form.control}
                name="alt_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alt Text * (Accessibility)</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={125} placeholder="Describe the image" />
                    </FormControl>
                    <FormDescription>
                      {watchAltText.length}/125 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cta_label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CTA Label</FormLabel>
                      <FormControl>
                        <Input {...field} maxLength={50} placeholder="Learn More" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cta_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CTA URL</FormLabel>
                      <FormControl>
                        <Input {...field} type="url" placeholder="https://..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Display this slide on the homepage
                      </div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : slide ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <MediaPickerDialog
        open={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
      />
    </>
  );
}
