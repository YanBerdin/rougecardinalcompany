import Image from "next/image";
import type { MediaItemExtendedDTO } from "@/lib/schemas/media";

interface MediaPreviewProps {
    media: MediaItemExtendedDTO;
    publicUrl: string | null;
}

export function MediaPreview({ media, publicUrl }: MediaPreviewProps) {
    return (
        <div className="aspect-video rounded-md overflow-hidden bg-muted relative">
            {publicUrl ? (
                <Image
                    src={publicUrl}
                    alt={media.alt_text ?? media.filename ?? "Media preview"}
                    fill
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
