"use client";

import Image from "next/image";
import { useMediaDetailsContext } from "../MediaDetailsContext";

export function MediaPreview() {
    const { state, meta } = useMediaDetailsContext();
    const { publicUrl } = state;
    const { media } = meta;

    return (
        <div className="h-40 sm:aspect-video sm:h-auto rounded-md overflow-hidden bg-muted relative">
            {publicUrl ? (
                <Image
                    src={publicUrl}
                    alt={media.alt_text ?? media.filename ?? "Media preview"}
                    fill
                    loading="eager"
                    className="object-contain"
                />
            ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p className="text-sm">Chargement de l&apos;aperçu...</p>
                </div>
            )}
        </div>
    );
}
