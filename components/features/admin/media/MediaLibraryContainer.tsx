/**
 * @file MediaLibraryContainer (Server Component)
 * @description Fetches media items with tags and folders for the library view
 */
import { listMediaItemsAction } from "@/lib/actions/media-actions";
import { listMediaTagsAction } from "@/lib/actions/media-tags-actions";
import { listMediaFoldersAction } from "@/lib/actions/media-folders-actions";
import { MediaLibraryViewClient } from "./MediaLibraryViewClient";

export async function MediaLibraryContainer() {
    const [mediaResult, tagsResult, foldersResult] = await Promise.all([
        listMediaItemsAction(),
        listMediaTagsAction(),
        listMediaFoldersAction(),
    ]);

    if (!mediaResult.success) {
        return (
            <div className="p-8 text-center">
                <p className="text-destructive">
                    Erreur: {mediaResult.error}
                </p>
            </div>
        );
    }

    if (!tagsResult.success) {
        return (
            <div className="p-8 text-center">
                <p className="text-destructive">
                    Erreur tags: {tagsResult.error}
                </p>
            </div>
        );
    }

    if (!foldersResult.success) {
        return (
            <div className="p-8 text-center">
                <p className="text-destructive">
                    Erreur dossiers: {foldersResult.error}
                </p>
            </div>
        );
    }

    return (
        <MediaLibraryViewClient
            initialMedia={mediaResult.data ?? []}
            availableTags={tagsResult.data ?? []}
            availableFolders={foldersResult.data ?? []}
        />
    );
}
