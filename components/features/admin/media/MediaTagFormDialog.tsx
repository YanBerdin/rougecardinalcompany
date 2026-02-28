/**
 * @file MediaTagFormDialog - Create/edit dialog for media tags
 * @description Separated from MediaTagsView for SRP compliance
 */
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { MediaTagDTO } from "@/lib/schemas/media";
import {
    createMediaTagAction,
    updateMediaTagAction,
} from "@/lib/actions/media-tags-actions";

export interface MediaTagFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    tag: MediaTagDTO | null;
    isSubmitting: boolean;
    setIsSubmitting: (value: boolean) => void;
}

export function MediaTagFormDialog({
    open,
    onClose,
    onSuccess,
    tag,
    isSubmitting,
    setIsSubmitting,
}: MediaTagFormDialogProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [color, setColor] = useState("");

    useEffect(() => {
        if (tag) {
            setName(tag.name);
            setDescription(tag.description || "");
            setColor(tag.color || "");
        } else {
            setName("");
            setDescription("");
            setColor("");
        }
    }, [tag]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const input = {
                name,
                description: description || null,
                color: color || null,
            };

            const result = tag
                ? await updateMediaTagAction(tag.id, input)
                : await createMediaTagAction(input);

            if (!result.success) {
                throw new Error(result.error);
            }

            toast.success(tag ? "Tag mis à jour" : "Tag créé");
            onSuccess();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erreur");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{tag ? "Modifier le tag" : "Créer un tag"}</DialogTitle>
                        <DialogDescription>
                            Les tags permettent de catégoriser vos médias
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="tag-name">Nom *</Label>
                            <Input
                                id="tag-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                aria-required="true"
                                maxLength={50}
                                placeholder="Ex: Spectacles, Presse"
                            />
                        </div>

                        <div>
                            <Label htmlFor="tag-description">Description</Label>
                            <Textarea
                                id="tag-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                maxLength={200}
                                placeholder="Description optionnelle"
                                rows={3}
                            />
                        </div>

                        <div>
                            <Label htmlFor="tag-color">Couleur</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="tag-color"
                                    type="color"
                                    value={color || "#000000"}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="w-20"
                                />
                                <Input
                                    type="text"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    placeholder="#000000"
                                    pattern="^#[0-9A-Fa-f]{6}$"
                                    className="flex-1 font-mono"
                                    aria-label="Code hexadécimal de la couleur"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Enregistrement..." : tag ? "Mettre à jour" : "Créer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
