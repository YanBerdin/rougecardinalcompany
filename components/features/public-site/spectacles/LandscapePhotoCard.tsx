import React from "react";
import Image from "next/image";
import { buildMediaPublicUrl } from "@/lib/dal/helpers";
import type { SpectaclePhotoDTO } from "@/lib/schemas/spectacles";

interface LandscapePhotoCardProps {
    photo: SpectaclePhotoDTO;
}

/**
 * Carte photo en format paysage (16/9) avec effet zoom au survol.
 * Utilisée pour illustrer le détail d'un spectacle.
 */
export function LandscapePhotoCard({ photo }: LandscapePhotoCardProps): React.ReactNode {
    const imageUrl = buildMediaPublicUrl(photo.storage_path) ?? "";

    return (
        <div className="relative aspect-[16/9] rounded-lg overflow-hidden shadow-lg my-6 group">
            <Image
                src={imageUrl}
                alt={photo.alt_text ?? "Photo du spectacle"}
                fill
                loading="lazy"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 600px) 70vw, 40vw"
            />
            <div
                className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                aria-hidden="true"
            />
        </div>
    );
}
