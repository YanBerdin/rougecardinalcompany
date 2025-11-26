"use client";
import { useState, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { uploadTeamMemberPhoto } from "@/app/(admin)/admin/team/actions";
import { Loader2, Upload } from "lucide-react";
import Image from "next/image";
import type { MediaUploadDialogProps } from "@/lib/types/media";
import {
    ALLOWED_IMAGE_MIME_TYPES,
    MAX_UPLOAD_SIZE_BYTES,
    isAllowedImageMimeType,
} from "@/lib/types/media";

/**
 * MediaUploadDialog - Upload mode for media picker
 * Allows uploading images to Supabase storage
 * Based on components/features/admin/team/MediaPickerDialog.tsx
 */
export function MediaUploadDialog({
    open,
    onClose,
    onSelect,
}: MediaUploadDialogProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation: File size
        if (file.size > MAX_UPLOAD_SIZE_BYTES) {
            toast.error("Fichier trop volumineux", {
                description: "L'image ne doit pas dépasser 5MB",
            });
            return;
        }

        // Validation: MIME type
        if (!isAllowedImageMimeType(file.type)) {
            toast.error("Format non supporté", {
                description: "Formats acceptés : JPEG, PNG, WebP, AVIF",
            });
            return;
        }

        setSelectedFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error("Aucun fichier sélectionné", {
                description: "Veuillez choisir une image",
            });
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", selectedFile);

            const result = await uploadTeamMemberPhoto(formData);

            if (result.success) {
                toast.success("Image téléversée", {
                    description: "L'image a été uploadée avec succès",
                });
                onSelect({
                    id: result.data.mediaId,
                    url: result.data.publicUrl,
                });
                handleClose();
            } else {
                toast.error("Erreur de téléversement", {
                    description: result.error || "Une erreur est survenue",
                });
            }
        } catch (error) {
            console.error("[MediaUploadDialog] Upload error:", error);
            toast.error("Erreur", {
                description: "Impossible de téléverser l'image",
            });
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        setPreview(null);
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        onClose();
    };

    const acceptFormats = ALLOWED_IMAGE_MIME_TYPES.join(",");

    return (
        <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Téléverser une image</DialogTitle>
                    <DialogDescription>
                        Formats acceptés : JPEG, PNG, WebP, AVIF (max 5MB)
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* File input */}
                    <div className="space-y-2">
                        <Label htmlFor="media-upload">Sélectionner une image</Label>
                        <Input
                            id="media-upload"
                            ref={fileInputRef}
                            type="file"
                            accept={acceptFormats}
                            onChange={handleFileChange}
                            disabled={uploading}
                        />
                    </div>

                    {/* Preview */}
                    {preview && (
                        <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden">
                            <Image
                                src={preview}
                                alt="Preview"
                                fill
                                className="object-contain"
                            />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 justify-end">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            disabled={uploading}
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleUpload}
                            disabled={!selectedFile || uploading}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Téléversement...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Téléverser
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default MediaUploadDialog;
