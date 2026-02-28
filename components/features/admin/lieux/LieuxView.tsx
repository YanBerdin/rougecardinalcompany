"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { deleteLieuAction } from "@/app/(admin)/admin/lieux/actions";
import type { LieuClientDTO } from "@/lib/schemas/admin-lieux";
import { LieuxTable } from "./LieuxTable";
import { sortLieux, getNextSortState } from "@/lib/tables/lieu-table-helpers";
import type { LieuSortField, LieuSortState } from "@/lib/tables/lieu-table-helpers";

interface LieuxViewProps {
    initialLieux: LieuClientDTO[];
}

export function LieuxView({ initialLieux }: LieuxViewProps) {
    const router = useRouter();
    const [lieux, setLieux] = useState(initialLieux);
    const [sortState, setSortState] = useState<LieuSortState | null>(null);

    // ✅ CRITIQUE : Sync local state when props change (after router.refresh())
    useEffect(() => {
        setLieux(initialLieux);
    }, [initialLieux]);

    // Sort lieux based on current sort state
    const sortedLieux = useMemo(() => {
        if (!sortState) return lieux;
        return sortLieux(lieux, sortState);
    }, [lieux, sortState]);

    const handleSort = useCallback((field: LieuSortField) => {
        setSortState((currentSort) => getNextSortState(currentSort, field));
    }, []);

    // ✅ DELETE : Appel direct Server Action + router.refresh()
    const handleDelete = useCallback(
        async (id: number) => {
            if (!confirm("Supprimer ce lieu ? Cette action est irréversible.")) {
                return;
            }

            try {
                const result = await deleteLieuAction(String(id));

                if (!result.success) {
                    throw new Error(result.error);
                }

                toast.success("Lieu supprimé");
                router.refresh(); // ✅ Déclenche re-fetch Server Component
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Erreur");
            }
        },
        [router]
    );

    // ✅ EDIT : Naviguer vers page dédiée
    const handleEdit = useCallback(
        (id: number) => {
            router.push(`/admin/lieux/${id}/edit`);
        },
        [router]
    );

    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center justify-between mb-6 lg:mb-12">
                <h1 className="text-3xl md:text-4xl font-bold">Lieux</h1>
                <Button onClick={() => router.push("/admin/lieux/new")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nouveau Lieu
                </Button>
            </div>

            {lieux.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <p>Aucun lieu enregistré</p>
                    <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => router.push("/admin/lieux/new")}
                    >
                        Créer le premier lieu
                    </Button>
                </div>
            ) : (
                <LieuxTable
                    lieux={sortedLieux}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    sortState={sortState}
                    onSort={handleSort}
                />
            )}
        </div>
    );
}
