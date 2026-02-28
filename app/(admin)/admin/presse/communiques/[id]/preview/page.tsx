import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchPressReleaseById } from "@/lib/dal/admin-press-releases";
import { formatDateFr } from "@/lib/dal/helpers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, ExternalLink } from "lucide-react";

export const metadata = {
    title: "Prévisualisation communiqué | Admin",
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function PressReleasePreviewPage({ params }: PageProps) {
    const { id } = await params;
    const result = await fetchPressReleaseById(BigInt(id));

    if (!result.success || !result.data) {
        notFound();
    }

    const release = result.data;

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            {/* Header with back button */}
            <div className="flex items-center gap-4 mb-6">
                <Link href="/admin/presse">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">Prévisualisation</h1>
                    <p className="text-muted-foreground">
                        Aperçu du communiqué tel qu&apos;il apparaîtra publiquement
                    </p>
                </div>
                <Link href={`/admin/presse/communiques/${id}/edit`}>
                    <Button variant="outline">Modifier</Button>
                </Link>
            </div>

            {/* Status badges */}
            <div className="flex gap-2 mb-6">
                <Badge variant={release.public ? "default" : "secondary"}>
                    {release.public ? "Publié" : "Brouillon"}
                </Badge>
                {release.spectacle_titre && (
                    <Badge variant="outline">Spectacle: {release.spectacle_titre}</Badge>
                )}
                {release.evenement_titre && (
                    <Badge variant="outline">Événement: {release.evenement_titre}</Badge>
                )}
            </div>

            {/* Main content card */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-2xl">{release.title}</CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDateFr(release.date_publication)}</span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Image */}
                    {release.image_url && (
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={release.image_url}
                                alt={release.title}
                                className="object-cover w-full h-full"
                            />
                        </div>
                    )}

                    {/* Description */}
                    {release.description && (
                        <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-primary">
                            <p className="text-lg italic">{release.description}</p>
                        </div>
                    )}

                    {/* Slug info */}
                    {release.slug && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <ExternalLink className="h-4 w-4" />
                            <span>Slug: {release.slug}</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Metadata card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Métadonnées</CardTitle>
                </CardHeader>
                <CardContent>
                    <dl className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <dt className="text-muted-foreground">ID</dt>
                            <dd className="font-mono">{release.id}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Ordre d&apos;affichage</dt>
                            <dd>{release.ordre_affichage ?? "Non défini"}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Créé le</dt>
                            <dd>{formatDateFr(release.created_at)}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Modifié le</dt>
                            <dd>{formatDateFr(release.updated_at)}</dd>
                        </div>
                    </dl>
                </CardContent>
            </Card>
        </div>
    );
}
