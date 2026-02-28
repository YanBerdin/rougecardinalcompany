"use client";

import { Upload, Library, Link2, ImageIcon, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ImageSourceActionsProps {
    imageUrl: string | undefined;
    isValidating: boolean;
    showUpload?: boolean;
    showMediaLibrary?: boolean;
    showExternalUrl?: boolean;
    onUploadClick: () => void;
    onLibraryClick: () => void;
    onUrlChange: (url: string) => void;
    onClearUrl: () => void;
}

export function ImageSourceActions({
    imageUrl,
    isValidating,
    showUpload = false,
    showMediaLibrary = true,
    showExternalUrl = true,
    onUploadClick,
    onLibraryClick,
    onUrlChange,
    onClearUrl,
}: ImageSourceActionsProps) {
    return (
        <div className="space-y-3">
            {/* Action buttons row */}
            <div className="flex flex-wrap gap-2">
                {showUpload && (
                    <Button type="button" variant="outline" onClick={onUploadClick}>
                        <Upload className="h-4 w-4 mr-2" />
                        Téléverser
                    </Button>
                )}
                {showMediaLibrary && (
                    <Button type="button" variant="secondary" onClick={onLibraryClick}>
                        <Library className="h-4 w-4 mr-2" />
                        Médiathèque
                    </Button>
                )}
            </div>

            {/* External URL input */}
            {showExternalUrl && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link2 className="h-4 w-4 shrink-0" />
                        <span>Ou saisir une URL externe</span>
                    </div>
                    <div className="flex flex-col-2 sm:flex-row gap-2">
                        <div className="relative flex-1 min-w-0">
                            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="url"
                                placeholder="https://example.com/image.jpg"
                                className="pl-9 w-full"
                                value={imageUrl ?? ""}
                                onChange={(e) => onUrlChange(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 shrink-0">
                            {imageUrl && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={onClearUrl}
                                    title="Effacer l'URL"
                                    className="shrink-0"
                                >
                                    <X />
                                </Button>
                            )}
                            {isValidating && (
                                <div className="flex items-center gap-2 px-3 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="hidden sm:inline">Vérification...</span>
                                </div>
                            )}
                        </div>
                    </div>
                    {imageUrl && !isValidating && (
                        <p className="text-xs text-muted-foreground">
                            💡 L&apos;URL sera validée automatiquement
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
