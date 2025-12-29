/**
 * @file Media Library Page
 * @description Main media management page with upload, filters, and grid view
 */
import { Suspense } from "react";
import { MediaLibraryContainer } from "@/components/features/admin/media/MediaLibraryContainer";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
    title: "Bibliothèque Médias | Admin",
    description: "Gérer les médias, upload, filtres et organisation",
};

// Force dynamic rendering for Supabase SSR cookies
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function MediaLibraryPage() {
    return (
        <div className="container mx-auto py-8">
            <Suspense fallback={<MediaLibrarySkeleton />}>
                <MediaLibraryContainer />
            </Suspense>
        </div>
    );
}

function MediaLibrarySkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-64 w-full" />
                ))}
            </div>
        </div>
    );
}
