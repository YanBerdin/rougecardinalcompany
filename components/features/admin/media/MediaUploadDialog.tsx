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
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { uploadMediaImage } from "@/lib/actions";
import type { MediaUploadResult } from "@/lib/actions";
import { Loader2, Upload, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import type { MediaUploadDialogProps } from "./types";
import {
    ALLOWED_IMAGE_MIME_TYPES,
    MAX_UPLOAD_SIZE_BYTES,
    isAllowedImageMimeType,
} from "./types";
import { computeFileHash, type HashProgress } from "@/lib/utils/file-hash";

type UploadPhase = "idle" | "hashing" | "uploading";

/**
 * MediaUploadDialog - Upload mode for media picker
 * 
 * ENHANCEMENTS:
 * - Accepts custom uploadAction prop
 * - Default to generic uploadMediaImage from @/lib/actions
 * - Supports configurable upload folder
 * 
 * @example
 * ```tsx
 * // Default usage (team photos)
 * <MediaUploadDialog
 *   open={isOpen}
 *   onClose={handleClose}
 *   onSelect={handleSelect}
 * />
 * 
 * // Custom folder (spectacles)
 * <MediaUploadDialog
 *   open={isOpen}
 *   onClose={handleClose}
 *   onSelect={handleSelect}
 *   uploadFolder="spectacles"
 * />
 * 
 * // Custom upload action
 * <MediaUploadDialog
 *   open={isOpen}
 *   onClose={handleClose}
 *   onSelect={handleSelect}
 *   uploadAction={customUploadFunction}
 * />
 * ```
 */
export function MediaUploadDialog({
    open,
    onClose,
    onSelect,
    uploadFolder = "team",
    uploadAction,
}: MediaUploadDialogProps & {
    uploadFolder?: string;
    uploadAction?: (formData: FormData) => Promise<MediaUploadResult>;
}) {
    const [phase, setPhase] = useState<UploadPhase>("idle");
    const [hashProgress, setHashProgress] = useState(0);
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Use custom upload action or default to generic uploadMediaImage
    const performUpload = uploadAction || ((formData: FormData) => uploadMediaImage(formData, uploadFolder));

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

        try {
            // Phase 1: Hash computation
            setPhase("hashing");
            setHashProgress(0);

            const handleHashProgress = (progress: HashProgress) => {
                setHashProgress(progress.percent);
            };

            const fileHash = await computeFileHash(
                selectedFile,
                selectedFile.size > 2 * 1024 * 1024 ? handleHashProgress : undefined
            );

            // Phase 2: Upload
            setPhase("uploading");

            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("fileHash", fileHash);

            const result = await performUpload(formData);

            if (result.success) {
                if (result.data.isDuplicate) {
                    toast.success("Image déjà présente", {
                        description: "L'image existe déjà, elle a été réutilisée",
                        icon: <CheckCircle2 className="h-5 w-5" />,
                    });
                } else {
                    toast.success("Image téléversée", {
                        description: "L'image a été uploadée avec succès",
                    });
                }
                onSelect({
                    id: result.data.mediaId,
                    url: result.data.publicUrl,
                });
                // Delay close to allow toast to display
                setTimeout(() => handleClose(), 100);
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
            setPhase("idle");
            setHashProgress(0);
        }
    };

    const handleClose = () => {
        setPreview(null);
        setSelectedFile(null);
        setPhase("idle");
        setHashProgress(0);
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
                            disabled={phase !== "idle"}
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

                    {/* Progress indicator */}
                    {phase === "hashing" && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Calcul de l'empreinte...</span>
                                <span>{hashProgress}%</span>
                            </div>
                            <Progress value={hashProgress} />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 justify-end">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            disabled={phase !== "idle"}
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleUpload}
                            disabled={!selectedFile || phase !== "idle"}
                        >
                            {phase === "hashing" ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Calcul empreinte...
                                </>
                            ) : phase === "uploading" ? (
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
