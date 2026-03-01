import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/is-admin";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchSpectacleById } from "@/lib/dal/spectacles";
import { fetchSpectacleLandscapePhotosAdmin } from "@/lib/dal/spectacle-photos";
import { translateStatus } from "@/lib/i18n/status";
import { formatSpectacleDetailDate } from "@/lib/tables/spectacle-table-helpers";
import { buildMediaPublicUrl } from "@/lib/dal/helpers/media-url";
import Image from "next/image";
import { SpectacleGalleryManager } from "@/components/features/admin/spectacles/SpectacleGalleryManager";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function SpectacleDetailPage({ params }: Props) {
  await requireAdmin();

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

  // Fetch landscape photos
  const landscapePhotos = await fetchSpectacleLandscapePhotosAdmin(BigInt(spectacleId));

  return (
    <div className="space-y-6 bg-card p-8">
      <div className="flex max-sm:flex-col items-start justify-between gap-6">
        <div className="flex flex-col items-start gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">{spectacle.title}</h1>
          <p className="text-muted-foreground mt-1">Slug : {spectacle.slug}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href="/admin/spectacles">
            <Button variant="outline" size="default" className="gap-2" title="Retour">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
          </Link>
          <Link href={`/admin/spectacles/${spectacle.id}/edit`}>
            <Button variant="default" size="default" className="gap-2" title="Éditer">
              <Pencil className="h-4 w-4" />
              Éditer
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Status and Visibility */}
        <div className="flex gap-2">
          <Badge variant={spectacle.public ? "default" : "secondary"}>
            {spectacle.public ? "Public" : "Privé"}
          </Badge>
          {spectacle.status && (
            <Badge variant="outline" className="py-1 px-3">{translateStatus(spectacle.status)}</Badge>
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

        {/* Paragraph 2 */}
        {spectacle.paragraph_2 && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Paragraphe supplémentaire 1</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {spectacle.paragraph_2}
            </p>
          </div>
        )}

        {/* Paragraph 3 */}
        {spectacle.paragraph_3 && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Paragraphe supplémentaire 2</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {spectacle.paragraph_3}
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
              <p>{formatSpectacleDetailDate(spectacle.premiere)}</p>
            </div>
          )}
        </div>

        {/* Image */}
        {spectacle.image_url && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Image</h2>
            <Image
              width={150}
              height={300}
              src={spectacle.image_url}
              alt={spectacle.title}
              className="rounded-lg w-full max-w-sm mx-auto sm:max-w-md md:max-w-md lg:max-w-lg object-cover aspect-[3/4]"
              style={{ height: "auto" }}
              sizes="(max-width: 640px) 100vw, 400px"
              priority
            />
          </div>
        )}

        {/* Landscape Photos */}
        {landscapePhotos.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Photos paysage (paragraphe 2/3)</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {landscapePhotos.map((photo) => {
                const imageUrl = buildMediaPublicUrl(photo.storage_path) ?? "";
                return (
                  <div key={photo.media_id.toString()} className="space-y-2">
                    <div className="relative aspect-[16/9] rounded-lg overflow-hidden shadow-lg w-full">
                      <Image
                        src={imageUrl}
                        alt={photo.alt_text ?? `Photo paysage ${photo.ordre + 1}`}
                        fill
                        className="object-cover w-full h-auto"
                        sizes="(max-width: 640px) 100vw, 600px"
                        style={{ borderRadius: '0.75rem' }}
                      />
                    </div>
                    <p className="text-sm md:text-md text-muted-foreground">
                      Photo {photo.ordre + 1}
                      {photo.alt_text && ` - ${photo.alt_text}`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Gallery Photos Manager */}
        <div id="gallery">
          <h2 className="text-lg font-semibold mb-2">Galerie photos (carrousel)</h2>
          <SpectacleGalleryManager spectacleId={spectacleId} />
        </div>

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
          <h3 className="font-medium text-sm md:text-md text-muted-foreground mb-2">
            Métadonnées
          </h3>
          <div className="text-sm md:text-md text-muted-foreground space-y-1">
            <p>Créé le : {formatSpectacleDetailDate(spectacle.created_at)}</p>
            <p>Mis à jour le : {formatSpectacleDetailDate(spectacle.updated_at)}</p>
            {spectacle.created_by && (
              <p>ID créateur : {spectacle.created_by}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

