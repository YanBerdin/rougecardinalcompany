"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MediaPickerDialog } from "@/components/features/admin/media/MediaPickerDialog";
import type { AboutContentDTO } from "@/lib/schemas/home-content";

interface AboutContentFormProps {
    content: AboutContentDTO;
}

export function AboutContentForm({ content }: AboutContentFormProps) {
    const router = useRouter();
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const [formData, setFormData] = useState({
        title: content.title,
        intro1: content.intro1,
        intro2: content.intro2,
        mission_title: content.mission_title,
        mission_text: content.mission_text,
        image_url: content.image_url || "",
        image_media_id: content.image_media_id?.toString() || "",
        alt_text: content.alt_text || "",
    });

    const handleMediaSelect = (media: { id: bigint; url: string }) => {
        setFormData((prev) => ({
            ...prev,
            image_media_id: media.id.toString(),
            image_url: media.url,
        }));
        setIsMediaPickerOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);

        try {
            const response = await fetch(`/api/admin/home/about/${content.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
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
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <Label htmlFor="title">Section Title *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            title: e.target.value.slice(0, 80),
                                        }))
                                    }
                                    maxLength={80}
                                    placeholder="About Rouge Cardinal"
                                    required
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formData.title.length}/80 characters
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="intro1">Introduction Paragraph 1 *</Label>
                                <Textarea
                                    id="intro1"
                                    value={formData.intro1}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            intro1: e.target.value.slice(0, 1000),
                                        }))
                                    }
                                    maxLength={1000}
                                    rows={4}
                                    required
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formData.intro1.length}/1000 characters
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="intro2">Introduction Paragraph 2 *</Label>
                                <Textarea
                                    id="intro2"
                                    value={formData.intro2}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            intro2: e.target.value.slice(0, 1000),
                                        }))
                                    }
                                    maxLength={1000}
                                    rows={4}
                                    required
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formData.intro2.length}/1000 characters
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="mission_title">Mission Section Title *</Label>
                                <Input
                                    id="mission_title"
                                    value={formData.mission_title}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            mission_title: e.target.value.slice(0, 80),
                                        }))
                                    }
                                    maxLength={80}
                                    placeholder="Our Mission"
                                    required
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formData.mission_title.length}/80 characters
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="mission_text">Mission Text *</Label>
                                <Textarea
                                    id="mission_text"
                                    value={formData.mission_text}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            mission_text: e.target.value.slice(0, 4000),
                                        }))
                                    }
                                    maxLength={4000}
                                    rows={8}
                                    required
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formData.mission_text.length}/4000 characters
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Section Image</Label>
                                <div className="flex gap-4">
                                    {formData.image_url && (
                                        <img
                                            src={formData.image_url}
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

                            <div>
                                <Label htmlFor="alt_text">Image Alt Text (Accessibility)</Label>
                                <Input
                                    id="alt_text"
                                    value={formData.alt_text}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            alt_text: e.target.value.slice(0, 125),
                                        }))
                                    }
                                    maxLength={125}
                                    placeholder="Describe the image"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formData.alt_text.length}/125 characters
                                </p>
                            </div>

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

