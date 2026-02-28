"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { MediaItemExtendedDTO } from "@/lib/schemas/media";

interface MediaCardThumbnailProps {
    media: MediaItemExtendedDTO;
    isVisible: boolean;
    isSelected?: boolean;
    selectionMode?: boolean;
}

export function MediaCardThumbnail({
    media,
    isVisible,
    isSelected,
    selectionMode,
}: MediaCardThumbnailProps) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const isImage = media.mime?.startsWith("image/") ?? false;
    const thumbnailPath = media.thumbnail_path;

    const originalUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/medias/${media.storage_path}`;
    const imageUrl = thumbnailPath
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/medias/${thumbnailPath}`
        : originalUrl;

    return (
        <>
            {/* Selection Checkbox */}
            {selectionMode && (
                <div className="absolute top-2 right-2 z-10">
                    <div
                        className={cn(
                            "h-6 w-6 rounded-full border-2 flex items-center justify-center",
                            "transition-all duration-150 ease-in-out",
                            isSelected && "scale-110",
                            isSelected
                                ? "bg-primary border-primary"
                                : "bg-background/80 border-muted-foreground/50"
                        )}
                        role="checkbox"
                        aria-checked={isSelected}
                    >
                        {isSelected && (
                            <svg
                                className="h-4 w-4 text-primary-foreground animate-in fade-in duration-150"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                aria-hidden="true"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        )}
                    </div>
                </div>
            )}

            {/* Thumbnail optimization badge */}
            {thumbnailPath && (
                <div className="absolute top-2 left-2 z-10">
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/80 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
                        <svg
                            className="h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                        Optimized
                    </span>
                </div>
            )}

            {/* Image Container */}
            <div className="aspect-square overflow-hidden bg-muted relative">
                {isImage ? (
                    <>
                        {/* Loading skeleton */}
                        {!imageLoaded && !imageError && isVisible && (
                            <div
                                className="absolute inset-0 animate-pulse bg-muted"
                                role="status"
                                aria-label="Chargement de l'image"
                            />
                        )}

                        {/* Lazy loaded image */}
                        {isVisible && !imageError && (
                            <Image
                                src={imageUrl}
                                alt={media.alt_text ?? media.filename ?? ""}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className={cn(
                                    "object-cover transition-all duration-300",
                                    imageLoaded
                                        ? "opacity-100 group-hover:scale-105"
                                        : "opacity-0"
                                )}
                                loading="lazy"
                                onLoad={() => setImageLoaded(true)}
                                onError={() => {
                                    setImageError(true);
                                    if (thumbnailPath) {
                                        console.warn(
                                            `[MediaCard] Thumbnail failed for ${media.filename}, falling back to original`
                                        );
                                    }
                                }}
                            />
                        )}

                        {/* Error fallback */}
                        {imageError && (
                            <div
                                className="flex h-full w-full items-center justify-center text-muted-foreground"
                                role="img"
                                aria-label="Erreur de chargement d'image"
                            >
                                <svg
                                    className="h-12 w-12"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                        )}
                    </>
                ) : (
                    <div
                        className="flex h-full items-center justify-center"
                        role="img"
                        aria-label={`Fichier ${media.mime?.split("/")[0] ?? "inconnu"}`}
                    >
                        <p className="text-sm text-muted-foreground">
                            {media.mime?.split("/")[0] ?? "fichier"}
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}
