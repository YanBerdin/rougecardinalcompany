import { Eye } from "lucide-react";
import { formatFileSize } from "@/lib/utils/format";
import type { MediaItemExtendedDTO } from "@/lib/schemas/media";

interface MediaFileInfoProps {
    media: MediaItemExtendedDTO;
}

export function MediaFileInfo({ media }: MediaFileInfoProps) {
    const fileSize = media.size_bytes != null
        ? formatFileSize(media.size_bytes)
        : "N/A";

    return (
        <div className="space-y-2">
            <div>
                <p className="text-sm font-medium">Nom du fichier</p>
                <p className="text-sm text-muted-foreground break-all">{media.filename}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <p className="text-sm font-medium">Type</p>
                    <p className="text-sm text-muted-foreground">{media.mime}</p>
                </div>
                <div>
                    <p className="text-sm font-medium">Taille</p>
                    <p className="text-sm text-muted-foreground">{fileSize}</p>
                </div>
            </div>

            {media.is_used_public && (
                <div className="rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 p-3">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-medium">
                        <Eye className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                        <span className="text-sm">Utilisé sur le site public</span>
                    </div>
                    {media.usage_locations && media.usage_locations.length > 0 && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 ml-6">
                            Emplacements : {media.usage_locations.join(", ")}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
