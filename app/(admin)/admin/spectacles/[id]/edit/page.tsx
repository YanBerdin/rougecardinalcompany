import { redirect, notFound } from "next/navigation";
import { createClient } from "@/supabase/server";
import { ArrowLeft, Images } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SpectacleForm from "@/components/features/admin/spectacles/SpectacleForm";
import { fetchSpectacleById, fetchDistinctGenres } from "@/lib/dal/spectacles";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditSpectaclePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // Check admin authentication
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims || data.claims.user_metadata.role !== "admin") {
    redirect("/auth/login");
  }

  // Parse and validate ID
  const spectacleId = parseInt(id, 10);
  if (isNaN(spectacleId) || spectacleId <= 0) {
    notFound();
  }

  // Fetch spectacle and existing genres in parallel
  const [spectacle, existingGenres] = await Promise.all([
    fetchSpectacleById(spectacleId),
    fetchDistinctGenres(),
  ]);

  if (!spectacle) {
    notFound();
  }

  // Transform database data to form values
  const defaultValues = {
    title: spectacle.title,
    slug: spectacle.slug || undefined,
    status: spectacle.status as "draft" | "published" | "archived" | undefined,
    description: spectacle.description || undefined,
    paragraph_2: spectacle.paragraph_2 || undefined,
    paragraph_3: spectacle.paragraph_3 || undefined,
    short_description: spectacle.short_description || undefined,
    genre: spectacle.genre || undefined,
    duration_minutes: spectacle.duration_minutes || undefined,
    casting: spectacle.casting || undefined,
    premiere: spectacle.premiere || undefined,
    image_url: spectacle.image_url || undefined,
    public: spectacle.public,
  };

  return (
    <div className="space-y-6 lg:ml-16">
      <div className="flex max-sm:flex-col items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Éditer : {spectacle.title}</h1>
          <p className="text-muted-foreground mt-2">
            Modifiez les informations du spectacle
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href={`/admin/spectacles/${spectacle.id}#gallery`}>
            <Button variant="default" size="default"
              title="Gérer la galerie de photos du spectacle">
              <Images className="h-4 w-4" />
              Galerie
            </Button>
          </Link>
          <Link href={`/admin/spectacles/${spectacle.id}`}>
            <Button variant="outline" size="default">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-2xl">
        <SpectacleForm
          defaultValues={defaultValues}
          spectacleId={spectacle.id}
          existingGenres={existingGenres}
        />
      </div>
    </div>
  );
}
