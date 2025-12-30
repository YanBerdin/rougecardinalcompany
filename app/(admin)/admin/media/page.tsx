/**
 * @file Media Library Management Page
 * @description Admin page for managing media library (main index)
 */
import { Suspense } from "react";
import Link from "next/link";
import { Folder, Tag, Images } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchMediaStats } from "@/lib/dal/media";

export const metadata = {
    title: "Médiathèque | Admin",
    description: "Gestion de la médiathèque",
};

// Force dynamic rendering for Supabase SSR cookies
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function MediaLibraryPage() {
    return (
        <div className="container mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Médiathèque</h1>
                <p className="text-muted-foreground mt-2">
                    Gérez vos médias, tags et dossiers
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Link href="/admin/media/library">
                    <Card className="hover:bg-accent transition-colors cursor-pointer">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Images className="h-6 w-6 text-primary" />
                                <CardTitle>Bibliothèque</CardTitle>
                            </div>
                            <CardDescription>
                                Parcourir et gérer tous les médias
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Upload, recherche, filtrage et organisation des fichiers
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/media/tags">
                    <Card className="hover:bg-accent transition-colors cursor-pointer">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Tag className="h-6 w-6 text-primary" />
                                <CardTitle>Tags</CardTitle>
                            </div>
                            <CardDescription>
                                Organiser par catégories
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Créer et gérer les tags pour catégoriser vos médias
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/media/folders">
                    <Card className="hover:bg-accent transition-colors cursor-pointer">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Folder className="h-6 w-6 text-primary" />
                                <CardTitle>Dossiers</CardTitle>
                            </div>
                            <CardDescription>
                                Structure hiérarchique
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Créer et gérer des dossiers pour organiser vos médias
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <Suspense fallback={<MediaStatsSkeleton />}>
                <MediaStatsSection />
            </Suspense>
        </div>
    );
}

async function MediaStatsSection() {
    const result = await fetchMediaStats();
    
    const stats = result.success
        ? result.data
        : { totalMedia: 0, totalTags: 0, totalFolders: 0, storageUsed: "Erreur" };

    return (
        <div className="mt-8 grid gap-4 md:grid-cols-4">
            <Card>
                <CardHeader className="pb-2">
                    <CardDescription>Total Médias</CardDescription>
                    <CardTitle className="text-3xl">{stats.totalMedia}</CardTitle>
                </CardHeader>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardDescription>Tags</CardDescription>
                    <CardTitle className="text-3xl">{stats.totalTags}</CardTitle>
                </CardHeader>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardDescription>Dossiers</CardDescription>
                    <CardTitle className="text-3xl">{stats.totalFolders}</CardTitle>
                </CardHeader>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardDescription>Stockage</CardDescription>
                    <CardTitle className="text-3xl">{stats.storageUsed}</CardTitle>
                </CardHeader>
            </Card>
        </div>
    );
}

function MediaStatsSkeleton() {
    return (
        <div className="mt-8 grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
            ))}
        </div>
    );
}
