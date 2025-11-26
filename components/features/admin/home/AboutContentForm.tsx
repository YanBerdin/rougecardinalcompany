"use client";

import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { AboutContentInput } from "@/lib/schemas/home-content";
// UI form uses number for media id to keep JSON payloads simple; server will coerce to bigint
type AboutFormValues = Omit<AboutContentInput, "image_media_id"> & { image_media_id?: number | undefined };
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import { toast } from "sonner";
import { MediaLibraryPicker, MediaExternalUrlInput, type MediaSelectResult } from "@/components/features/admin/media";
import { AboutContentInputSchema, type AboutContentDTO } from "@/lib/schemas/home-content";

interface AboutContentFormProps {
    content: AboutContentDTO;
}

export function AboutContentForm({ content }: AboutContentFormProps) {
    const router = useRouter();
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const form = useForm<AboutFormValues>({
        // cast resolver to local UI shape; Zod on server will coerce number -> bigint
        resolver: zodResolver(AboutContentInputSchema) as unknown as Resolver<AboutFormValues>,
        defaultValues: {
            title: content.title,
            intro1: content.intro1,
            intro2: content.intro2,
            mission_title: content.mission_title,
            mission_text: content.mission_text,
            image_url: content.image_url ?? "",
            image_media_id: content.image_media_id !== null ? Number(content.image_media_id) : undefined,
            alt_text: content.alt_text ?? "",
        },
    });

    const onSubmit = async (data: AboutFormValues) => {
        setIsPending(true);

        try {
            // send numeric id; server Zod schema will coerce to bigint
            const response = await fetch(`/api/admin/home/about/${content.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to update content");
            }

            toast.success("About content updated successfully");
            router.refresh();
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to update content"
            );
        } finally {
            setIsPending(false);
        }
    };

    const handleMediaSelect = (result: MediaSelectResult) => {
        // store as number in the UI; backend will coerce
        form.setValue("image_media_id", Number(result.id));
        form.setValue("image_url", result.url);
        setIsMediaPickerOpen(false);
    };

    const watchIntro1 = form.watch("intro1") ?? "";
    const watchIntro2 = form.watch("intro2") ?? "";
    const watchMissionText = form.watch("mission_text") ?? "";

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">About Section Content</h2>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Edit About Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Section Title *</FormLabel>
                                            <FormControl>
                                                <Input {...field} maxLength={80} placeholder="About Rouge Cardinal" />
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
                                    name="intro1"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Introduction Paragraph 1 *</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} maxLength={1000} rows={4} />
                                            </FormControl>
                                            <FormDescription>
                                                {watchIntro1.length}/1000 characters
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="intro2"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Introduction Paragraph 2 *</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} maxLength={1000} rows={4} />
                                            </FormControl>
                                            <FormDescription>
                                                {watchIntro2.length}/1000 characters
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="mission_title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mission Section Title *</FormLabel>
                                            <FormControl>
                                                <Input {...field} maxLength={80} placeholder="Our Mission" />
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
                                    name="mission_text"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mission Text *</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} maxLength={4000} rows={8} />
                                            </FormControl>
                                            <FormDescription>
                                                {watchMissionText.length}/4000 characters
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-2">
                                    <FormLabel>Section Image</FormLabel>
                                    <div className="flex gap-4 items-center">
                                        {form.watch("image_url") && (
                                            <Image
                                                src={String(form.watch("image_url") || "")}
                                                alt={String(form.watch("image_url") || "Preview")}
                                                className="h-32 w-48 object-cover rounded"
                                                width={192}
                                                height={128}
                                            />
                                        )}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsMediaPickerOpen(true)}
                                        >
                                            Sélectionner depuis la médiathèque
                                        </Button>
                                    </div>
                                </div>

                                {/* URL externe (fallback) */}
                                <MediaExternalUrlInput
                                    value={form.watch("image_url") ?? ""}
                                    onChange={(url) => form.setValue("image_url", url)}
                                    label="URL externe (optionnel)"
                                    description="Utilisé si aucune image n'est sélectionnée depuis la médiathèque"
                                />

                                <FormField
                                    control={form.control}
                                    name="alt_text"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Image Alt Text (Accessibility)</FormLabel>
                                            <FormControl>
                                                <Input {...field} maxLength={125} placeholder="Describe the image" />
                                            </FormControl>
                                            <FormDescription>
                                                {(field.value || "").length}/125 characters
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.back()}
                                        disabled={isPending}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isPending}>
                                        {isPending ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>

            <MediaLibraryPicker
                open={isMediaPickerOpen}
                onClose={() => setIsMediaPickerOpen(false)}
                onSelect={handleMediaSelect}
            />
        </>
    );
}

