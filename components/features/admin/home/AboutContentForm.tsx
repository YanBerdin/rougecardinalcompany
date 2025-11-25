"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { MediaPickerDialog } from "@/components/features/admin/media/MediaPickerDialog";
import { AboutContentInputSchema, type AboutContentDTO } from "@/lib/schemas/home-content";

interface AboutContentFormProps {
    content: AboutContentDTO;
}

export function AboutContentForm({ content }: AboutContentFormProps) {
    const router = useRouter();
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const form = useForm({
        resolver: zodResolver(AboutContentInputSchema),
        defaultValues: {
            title: content.title,
            intro1: content.intro1,
            intro2: content.intro2,
            mission_title: content.mission_title,
            mission_text: content.mission_text,
            image_url: content.image_url ?? "",
            image_media_id: content.image_media_id,
            alt_text: content.alt_text ?? "",
        },
    });

    const onSubmit = async (data: any) => {
        setIsPending(true);

        try {
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

    const handleMediaSelect = (media: { id: bigint; url: string }) => {
        form.setValue("image_media_id", media.id);
        form.setValue("image_url", media.url);
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
                                    <div className="flex gap-4">
                                        {form.watch("image_url") && (
                                            <img
                                                src={form.watch("image_url") || ""}
                                                alt="Preview"
                                                className="h-32 w-48 object-cover rounded"
                                            />
                                        )}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsMediaPickerOpen(true)}
                                        >
                                            Select Image
                                        </Button>
                                    </div>
                                </div>

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

            <MediaPickerDialog
                open={isMediaPickerOpen}
                onClose={() => setIsMediaPickerOpen(false)}
                onSelect={handleMediaSelect}
            />
        </>
    );
}

