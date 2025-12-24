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
import { Loader2, Upload, CheckCircle2, Info } from "lucide-react";
import Image from "next/image";
import type { MediaUploadDialogProps } from "./types";
import {
    ALLOWED_IMAGE_MIME_TYPES,
    MAX_UPLOAD_SIZE_BYTES,
    isAllowedImageMimeType,
} from "./types";
import { computeFileHash, type HashProgress } from "@/lib/utils/file-hash";

type UploadPhase = "idle" | "hashing" | "uploading";

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
    const [uploadProgress, setUploadProgress] = useState(0);
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const performUpload = uploadAction || ((formData: FormData) => uploadMediaImage(formData, uploadFolder));

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_UPLOAD_SIZE_BYTES) {
            toast.error("Fichier trop volumineux", {
                description: "L'image ne doit pas dépasser 5MB",
            });
            return;
        }

        if (!isAllowedImageMimeType(file.type)) {
            toast.error("Format non supporté", {
                description: "Formats acceptés : JPEG, PNG, WebP, AVIF",
            });
            return;
        }

        setSelectedFile(file);
        setHashProgress(0);

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
            // Phase 1: Calcul du hash avec progression
            setPhase("hashing");
            setHashProgress(0);

            const fileHash = await computeFileHash(selectedFile, (progress: HashProgress) => {
                setHashProgress(progress.percent);
            });

            console.log("[Upload] Hash complete:", fileHash.substring(0, 16) + "..."); //TODO: remove log in prod

            // Phase 2: Upload via Server Action
            setPhase("uploading");
            setUploadProgress(0);

            console.log("[Upload] Starting upload via Server Action..."); //TODO: remove log in prod

            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("fileHash", fileHash);

            // Simuler une progression visuelle (Server Actions ne supportent pas les events progress)
            const progressSimulation = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 10, 90));
            }, 150);

            const result = await performUpload(formData);

            clearInterval(progressSimulation);
            setUploadProgress(100);

            // Petit délai pour montrer 100%
            await new Promise(resolve => setTimeout(resolve, 300));

            if (result.success) {
                // Vérifier si c'est un doublon
                if (result.data.isDuplicate) {
                    toast.info("Image déjà présente", {
                        description: "Cette image existe déjà dans la médiathèque. Elle a été réutilisée.",
                        icon: <CheckCircle2 className="h-4 w-4 text-blue-500" />,
                        duration: 5000,
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
            setPhase("idle");
            setHashProgress(0);
            setUploadProgress(0);
        }
    };

    const handleClose = () => {
        setPreview(null);
        setSelectedFile(null);
        setPhase("idle");
        setHashProgress(0);
        setUploadProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        onClose();
    };

    const isProcessing = phase !== "idle";
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
                    <div className="space-y-2">
                        <Label htmlFor="media-upload">Sélectionner une image</Label>
                        <Input
                            id="media-upload"
                            ref={fileInputRef}
                            type="file"
                            accept={acceptFormats}
                            onChange={handleFileChange}
                            disabled={isProcessing}
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

                    {/* Progress indicator for hash computation */}
                    {phase === "hashing" && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Info className="h-4 w-4" />
                                <span>Vérification du fichier... {hashProgress}%</span>
                            </div>
                            <Progress value={hashProgress} className="h-2" />
                        </div>
                    )}

                    {/* Upload indicator */}
                    {phase === "uploading" && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Téléversement en cours... {uploadProgress}%</span>
                            </div>
                            <Progress value={uploadProgress} className="h-2" />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 justify-end">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            disabled={isProcessing}
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleUpload}
                            disabled={!selectedFile || isProcessing}
                        >
                            {phase === "hashing" ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Vérification...
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
