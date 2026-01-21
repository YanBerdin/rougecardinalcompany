"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Eye, Send } from "lucide-react";
import { deletePressReleaseAction, publishPressReleaseAction, unpublishPressReleaseAction } from "@/app/(admin)/admin/presse/actions";
import type { PressReleasesViewProps } from "./types";

export function PressReleasesView({ initialReleases }: PressReleasesViewProps) {
    const router = useRouter();
    const [releases, setReleases] = useState(initialReleases);

    // ✅ CRITICAL: Sync local state when props change (after router.refresh())
    useEffect(() => {
        setReleases(initialReleases);
    }, [initialReleases]);

    const handleDelete = useCallback(
        async (id: string) => {
            if (!confirm("Supprimer ce communiqué de presse ?")) return;

            try {
                const result = await deletePressReleaseAction(id);

                if (!result.success) {
                    throw new Error(result.error);
                }

                toast.success("Communiqué supprimé");
                router.refresh();
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Erreur");
            }
        },
        [router]
    );

    const handlePublish = useCallback(
        async (id: string, isPublic: boolean) => {
            try {
                const action = isPublic ? unpublishPressReleaseAction : publishPressReleaseAction;
                const result = await action(id);

                if (!result.success) {
                    throw new Error(result.error);
                }

                toast.success(isPublic ? "Communiqué dépublié" : "Communiqué publié");
                router.refresh();
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Erreur");
            }
        },
        [router]
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">{releases.length} communiqué(s)</p>
                <Link href="/admin/presse/communiques/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Nouveau communiqué
                    </Button>
                </Link>
            </div>

            <div className="space-y-4">
                {releases.map((release) => (
                    <Card key={release.id}>
                        <CardContent className="flex items-center justify-between p-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold truncate">{release.title}</h3>
                                    <Badge variant={release.public ? "default" : "secondary"}>
                                        {release.public ? "Publié" : "Draft"}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(release.date_publication).toLocaleDateString("fr-FR")}
                                </p>
                                {release.spectacle_titre && (
                                    <p className="text-xs text-muted-foreground">
                                        Spectacle: {release.spectacle_titre}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Link href={`/admin/presse/communiques/${release.id}/preview`}>
                                    <Button variant="ghost" size="icon">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handlePublish(release.id, release.public)}
                                    title={release.public ? "Dépublier" : "Publier"}
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                                <Link href={`/admin/presse/communiques/${release.id}/edit`}>
                                    <Button variant="ghost" size="icon">
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(release.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
