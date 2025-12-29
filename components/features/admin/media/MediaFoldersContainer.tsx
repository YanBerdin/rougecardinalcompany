/**
 * @file Media Folders Container (Server Component)
 * @description Fetches folders data and passes to View component
 */
import { listMediaFoldersAction } from "@/lib/actions/media-folders-actions";
import { MediaFoldersView } from "./MediaFoldersView";

export async function MediaFoldersContainer() {
    const result = await listMediaFoldersAction();

    if (!result.success) {
        return (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
                <p className="text-destructive">Erreur: {result.error}</p>
            </div>
        );
    }

    return <MediaFoldersView initialFolders={result.data} />;
}
