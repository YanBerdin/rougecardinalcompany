import { notFound } from "next/navigation";
import { requireMinRole } from "@/lib/auth/roles";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchAllCompagnieValuesAdmin } from "@/lib/dal/admin-compagnie-values";

export const metadata = {
    title: "Visualiser Valeurs | Admin Compagnie",
    description: "Visualisation des valeurs de la compagnie",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ValuesViewPage() {
    await requireMinRole("editor");

    const result = await fetchAllCompagnieValuesAdmin();
    if (!result.success) notFound();

    const values = result.data;

    return (
        <div className="space-y-6">
            {/* Header with navigation */}
            <div className="flex max-sm:flex-col items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold md:text-3xl">
                        Valeurs de la Compagnie
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {values.length} valeur{values.length !== 1 ? "s" : ""} configurée{values.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <div className="flex w-full items-center gap-2 max-sm:flex-col sm:w-auto sm:shrink-0">
                    <Link href="/admin/compagnie" className="w-full sm:w-auto">
                        <Button variant="outline" size="default" className="w-full gap-2 sm:w-auto">
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            Retour
                        </Button>
                    </Link>
                    <Link href="/admin/compagnie" className="w-full sm:w-auto">
                        <Button variant="default" size="default" className="w-full gap-2 sm:w-auto">
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                            Modifier
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Values list */}
            {values.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                    Aucune valeur configurée.
                </p>
            ) : (
                <div className="space-y-4">
                    {values.map((value) => (
                        <article
                            key={value.id}
                            className="space-y-2 rounded-lg border bg-card p-4 sm:p-6"
                        >
                            {/* Value header */}
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-lg font-semibold">
                                    {value.title}
                                </h2>
                                <Badge variant={value.active ? "default" : "secondary"}>
                                    {value.active ? "Actif" : "Inactif"}
                                </Badge>
                            </div>

                            {/* Description */}
                            {value.description && (
                                <p className="text-sm text-muted-foreground">
                                    {value.description}
                                </p>
                            )}

                            {/* Meta */}
                            <p className="text-xs text-muted-foreground/70">
                                Position : {value.position}
                            </p>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
