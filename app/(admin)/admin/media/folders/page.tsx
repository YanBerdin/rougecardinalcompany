/**
 * @file Media Folders Management Page
 * @description Admin page for managing media folders (CRUD)
 */
import { Suspense } from "react";
import { MediaFoldersContainer } from "@/components/features/admin/media/MediaFoldersContainer";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
    title: "Dossiers Media | Admin",
    description: "Gestion des dossiers pour organiser les médias",
};

// Force dynamic rendering for Supabase SSR cookies
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function MediaFoldersPage() {
    return (
        <div className="container mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Dossiers Media</h1>
                <p className="text-muted-foreground mt-2">
                    Gérez les dossiers pour organiser vos médias
                </p>
            </div>

            <Suspense fallback={<MediaFoldersSkeleton />}>
                <MediaFoldersContainer />
            </Suspense>
        </div>
    );
}

function MediaFoldersSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    );
}
