/**
 * @file Media Tags Container (Server Component)
 * @description Fetches tags data and passes to View component
 */
import { listMediaTagsAction } from "@/lib/actions/media-tags-actions";
import { MediaTagsView } from "./MediaTagsView";

export async function MediaTagsContainer() {
    const result = await listMediaTagsAction();

    if (!result.success) {
        return (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
                <p className="text-destructive">Erreur: {result.error}</p>
            </div>
        );
    }

    return <MediaTagsView initialTags={result.data} />;
}
