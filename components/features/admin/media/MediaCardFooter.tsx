import { Folder, Eye } from "lucide-react";
import { formatFileSize } from "@/lib/utils/format";
import { MAX_VISIBLE_TAGS } from "./constants";
import type { MediaItemExtendedDTO } from "@/lib/schemas/media";

interface MediaCardFooterProps {
    media: MediaItemExtendedDTO;
}

export function MediaCardFooter({ media }: MediaCardFooterProps) {
    return (
        <div className="p-3">
            <p className="truncate text-sm font-medium">{media.filename}</p>
            <p className="text-xs text-muted-foreground">
                {media.size_bytes !== null
                    ? formatFileSize(media.size_bytes)
                    : "Taille inconnue"}
            </p>

            {/* Tags */}
            {media.tags.length > 0 && (
                <div
                    className="mt-2 flex flex-wrap gap-1 justify-end"
                    role="list"
                    aria-label="Tags du média"
                >
                    {media.tags.slice(0, MAX_VISIBLE_TAGS).map((tag) => (
                        <span
                            key={tag.id}
                            className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs"
                            role="listitem"
                        >
                            <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: tag.color ?? undefined }}
                                aria-hidden="true"
                            />
                            {tag.name}
                        </span>
                    ))}
                    {media.tags.length > MAX_VISIBLE_TAGS && (
                        <span
                            className="text-xs text-muted-foreground"
                            aria-label={`${media.tags.length - MAX_VISIBLE_TAGS} tags supplémentaires`}
                        >
                            +{media.tags.length - MAX_VISIBLE_TAGS}
                        </span>
                    )}
                </div>
            )}

            {/* Folder & Usage Info */}
            <div className="mt-2 flex flex-col gap-1">
                <div
                    className="flex items-center gap-1.5 text-sm text-muted-foreground"
                    title={media.folder?.name ?? "Uploads génériques"}
                >
                    <Folder className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                    <span className="truncate">
                        {media.folder?.name ?? "Uploads génériques"}
                    </span>
                </div>

                {media.is_used_public && (
                    <div
                        className="flex items-center gap-1.5 text-md font-bold text-emerald-600 dark:text-emerald-400 justify-end"
                        title={`Utilisé dans: ${media.usage_locations?.join(", ") ?? ""}`}
                    >
                        <Eye className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                        <span className="truncate">Utilisé sur le site</span>
                    </div>
                )}
            </div>
        </div>
    );
}
