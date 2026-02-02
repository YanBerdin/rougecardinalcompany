import { redirect, notFound } from "next/navigation";
import { createClient } from "@/supabase/server";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchSpectacleById } from "@/lib/dal/spectacles";
import { translateStatus } from "@/lib/i18n/status";
import Image from "next/image";
//TODO: ajouter landscape-photos dans cette vue
// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function SpectacleDetailPage({ params }: Props) {
  const supabase = await createClient();

  // Check admin authentication
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims || data.claims.user_metadata.role !== "admin") {
    redirect("/auth/login");
  }

  // Parse and validate ID
  const { id } = await params;
  const spectacleId = parseInt(id, 10);
  if (isNaN(spectacleId) || spectacleId <= 0) {
    notFound();
  }

  // Fetch spectacle
  const spectacle = await fetchSpectacleById(spectacleId);
  if (!spectacle) {
    notFound();
  }

  function formatDate(dateString: string | null): string {
    if (!dateString) return "Non définie";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Date invalide";
    }
  }

  function getStatusLabel(status: string | null): string {
    // delegate to central helper (handles null/legacy tokens)
    return translateStatus(status);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/spectacles">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{spectacle.title}</h1>
            <p className="text-muted-foreground mt-1">{spectacle.slug}</p>
          </div>
        </div>
        <Link href={`/admin/spectacles/${spectacle.id}/edit`}>
          <Button>
            <Pencil className="h-4 w-4 mr-2" />
            Éditer
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {/* Status and Visibility */}
        <div className="flex gap-2">
          <Badge variant={spectacle.public ? "default" : "secondary"}>
            {spectacle.public ? "Public" : "Privé"}
          </Badge>
          {spectacle.status && (
            <Badge variant="outline">{getStatusLabel(spectacle.status)}</Badge>
          )}
        </div>

        {/* Short Description */}
        {spectacle.short_description && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Résumé</h2>
            <p className="text-muted-foreground">
              {spectacle.short_description}
            </p>
          </div>
        )}

        {/* Full Description */}
        {spectacle.description && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {spectacle.description}
            </p>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {spectacle.genre && (
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">
                Genre
              </h3>
              <p>{spectacle.genre}</p>
            </div>
          )}

          {spectacle.duration_minutes && (
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">
                Durée
              </h3>
              <p>{spectacle.duration_minutes} minutes</p>
            </div>
          )}

          {spectacle.casting && (
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">
                Nombre d&apos;interprètes
              </h3>
              <p>{spectacle.casting}</p>
            </div>
          )}

          {spectacle.premiere && (
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">
                Date de première
              </h3>
              <p>{formatDate(spectacle.premiere)}</p>
            </div>
          )}
        </div>

        {/* Image */}
        {spectacle.image_url && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Image</h2>
            <Image
              width={400}
              height={300}
              src={spectacle.image_url}
              alt={spectacle.title}
              className="rounded-lg max-w-md"
            />
          </div>
        )}

        {/* Awards */}
        {spectacle.awards && spectacle.awards.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Prix et distinctions</h2>
            <ul className="list-disc list-inside space-y-1">
              {spectacle.awards.map((award, index) => (
                <li key={index} className="text-muted-foreground">
                  {award}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Metadata */}
        <div className="pt-4 border-t">
          <h3 className="font-medium text-sm text-muted-foreground mb-2">
            Métadonnées
          </h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Créé le : {formatDate(spectacle.created_at)}</p>
            <p>Mis à jour le : {formatDate(spectacle.updated_at)}</p>
            {spectacle.created_by && (
              <p>ID créateur : {spectacle.created_by}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
