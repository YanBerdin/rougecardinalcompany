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
import { ImageFieldGroup } from "@/components/features/admin/media";
import { AboutContentFormSchema, type AboutContentFormValues, type AboutContentDTO } from "@/lib/schemas/home-content";
import { updateAboutContentAction } from "@/app/(admin)/admin/home/about/home-about-actions";

interface AboutContentFormProps {
    content: AboutContentDTO;
}

export function AboutContentForm({ content }: AboutContentFormProps) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    const form = useForm<AboutContentFormValues>({
        resolver: zodResolver(AboutContentFormSchema),
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

    const onSubmit = async (data: AboutContentFormValues) => {
        setIsPending(true);

        try {
            const result = await updateAboutContentAction(String(content.id), data);

            if (!result.success) {
                toast.error(result.error || "Failed to update content");
                return;
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

                                {/* Image section - Using ImageFieldGroup */}
                                <ImageFieldGroup
                                    form={form}
                                    imageUrlField="image_url"
                                    imageMediaIdField="image_media_id"
                                    altTextField="alt_text"
                                    label="Section Image"
                                    showUpload={true}
                                    uploadFolder="home-about"
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
        </>
    );
}

