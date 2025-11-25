"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MediaPickerDialog } from "@/components/features/admin/media/MediaPickerDialog";
import type { HeroSlideDTO } from "@/lib/schemas/home-content";

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
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: slide?.title || "",
        subtitle: slide?.subtitle || "",
        description: slide?.description || "",
        image_url: slide?.image_url || "",
        image_media_id: slide?.image_media_id?.toString() || "",
        cta_label: slide?.cta_label || "",
        cta_url: slide?.cta_url || "",
        alt_text: slide?.alt_text || "",
        active: slide?.active ?? true,
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
            const url = slide
                ? `/api/admin/home/hero/${slide.id}`
                : "/api/admin/home/hero";
            const method = slide ? "PATCH" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to save slide");
            }

            toast.success(slide ? "Slide updated" : "Slide created");
            setFormData({
                title: "",
                subtitle: "",
                description: "",
                image_url: "",
                image_media_id: "",
                cta_label: "",
                cta_url: "",
                alt_text: "",
                active: true,
            });
            onSuccess();
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to save slide"
            );
        } finally {
            setIsPending(false);
        }
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {slide ? "Edit Hero Slide" : "Add Hero Slide"}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="title">Title *</Label>
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
                                placeholder="Main headline"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="subtitle">Subtitle</Label>
                            <Input
                                id="subtitle"
                                value={formData.subtitle}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        subtitle: e.target.value.slice(0, 150),
                                    }))
                                }
                                maxLength={150}
                                placeholder="Supporting text"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                {formData.subtitle.length}/150 characters
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        description: e.target.value.slice(0, 500),
                                    }))
                                }
                                maxLength={500}
                                rows={3}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                {formData.description.length}/500 characters
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>Image *</Label>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsMediaPickerOpen(true)}
                                >
                                    Select from Media Library
                                </Button>
                                {formData.image_url && (
                                    <img
                                        src={formData.image_url}
                                        alt="Preview"
                                        className="h-20 w-32 object-cover rounded"
                                    />
                                )}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="alt_text">Alt Text * (Accessibility)</Label>
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
                                required
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                {formData.alt_text.length}/125 characters
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="cta_label">CTA Label</Label>
                                <Input
                                    id="cta_label"
                                    value={formData.cta_label}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            cta_label: e.target.value.slice(0, 50),
                                        }))
                                    }
                                    maxLength={50}
                                    placeholder="Learn More"
                                />
                            </div>

                            <div>
                                <Label htmlFor="cta_url">CTA URL</Label>
                                <Input
                                    id="cta_url"
                                    type="url"
                                    value={formData.cta_url}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            cta_url: e.target.value,
                                        }))
                                    }
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label className="text-base">Active</Label>
                                <div className="text-sm text-muted-foreground">
                                    Display this slide on the homepage
                                </div>
                            </div>
                            <Switch
                                checked={formData.active}
                                onCheckedChange={(checked) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        active: checked,
                                    }))
                                }
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Saving..." : slide ? "Update" : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
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
