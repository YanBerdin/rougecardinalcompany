"use client";

import { UseFormReturn } from "react-hook-form";
import Image from "next/image";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MediaExternalUrlInput, type MediaSelectResult } from "@/components/features/admin/media";
import type { HeroSlideFormValues } from "@/lib/schemas/home-content";

interface HeroSlideImageSectionProps {
    form: UseFormReturn<HeroSlideFormValues>;
    onOpenMediaPicker: () => void;
}

export function HeroSlideImageSection({ form, onOpenMediaPicker }: HeroSlideImageSectionProps) {
    const watchAltText = form.watch("alt_text") ?? "";
    const imageUrl = form.watch("image_url");
    const altText = form.watch("alt_text");
    const imageError = form.formState.errors.image_url;

    return (
        <>
            <FormField
                control={form.control}
                name="image_url"
                render={() => (
                    <FormItem>
                        <FormLabel>Image *</FormLabel>
                        <div className="flex gap-2 items-center">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onOpenMediaPicker}
                            >
                                Sélectionner depuis la médiathèque
                            </Button>
                            {imageUrl ? (
                                <Image
                                    src={String(imageUrl)}
                                    alt={String(altText ?? "Preview")}
                                    className="h-20 w-32 object-cover rounded"
                                    width={128}
                                    height={80}
                                />
                            ) : null}
                        </div>
                        {imageError && (
                            <p className="text-sm font-medium text-destructive">
                                {imageError.message}
                            </p>
                        )}
                    </FormItem>
                )}
            />

            <MediaExternalUrlInput
                value={String(form.watch("image_url") ?? "")}
                onChange={(url) => form.setValue("image_url", url)}
                label="URL externe (optionnel)"
                description="Utilisé si aucune image n'est sélectionnée depuis la médiathèque"
            />

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
        </>
    );
}

export function handleMediaSelection(
    form: UseFormReturn<HeroSlideFormValues>,
    result: MediaSelectResult
) {
    form.setValue("image_media_id", Number(result.id));
    form.setValue("image_url", result.url);
}
