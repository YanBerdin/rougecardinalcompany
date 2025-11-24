import AdminSpectaclesSkeleton from "@/components/skeletons/AdminSpectaclesSkeleton";

export default function Loading() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Gestion des spectacles</h2>
                <p className="text-muted-foreground mt-2">Chargement…</p>
            </div>
            <AdminSpectaclesSkeleton />
        </div>
    );
}
