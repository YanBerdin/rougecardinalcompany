/**
 * @file Media Tags Management Page
 * @description Admin page for managing media tags (CRUD)
 */
import { Suspense } from "react";
import { MediaTagsContainer } from "@/components/features/admin/media/MediaTagsContainer";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
    title: "Tags Media | Admin",
    description: "Gestion des tags pour organiser les médias",
};

// Force dynamic rendering for Supabase SSR cookies
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function MediaTagsPage() {
    return (
        <div className="container mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Tags Media</h1>
                <p className="text-muted-foreground mt-2">
                    Gérez les tags pour catégoriser vos médias
                </p>
            </div>

            <Suspense fallback={<MediaTagsSkeleton />}>
                <MediaTagsContainer />
            </Suspense>
        </div>
    );
}

function MediaTagsSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    );
}
