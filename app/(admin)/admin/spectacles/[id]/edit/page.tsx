import { redirect, notFound } from "next/navigation";
import { createClient } from "@/supabase/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SpectacleForm from "@/components/features/admin/spectacles/SpectacleForm";
import { fetchSpectacleById } from "@/lib/dal/spectacles";

interface Props {
  params: {
    id: string;
  };
}

export default async function EditSpectaclePage({ params }: Props) {
  const supabase = await createClient();

  // Check admin authentication
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims || data.claims.user_metadata.role !== "admin") {
    redirect("/auth/login");
  }

  // Parse and validate ID
  const spectacleId = parseInt(params.id, 10);
  if (isNaN(spectacleId) || spectacleId <= 0) {
    notFound();
  }

  // Fetch spectacle
  const spectacle = await fetchSpectacleById(spectacleId);
  if (!spectacle) {
    notFound();
  }

  // Map database status to form status
  const statusMap: Record<string, "draft" | "published" | "archived"> = {
    projet: "draft",
    en_cours: "published",
    termine: "archived",
  };

  // Transform database data to form values
  const defaultValues = {
    title: spectacle.title,
    slug: spectacle.slug || undefined,
    status: spectacle.status ? statusMap[spectacle.status] : undefined,
    description: spectacle.description || undefined,
    short_description: spectacle.short_description || undefined,
    genre: spectacle.genre || undefined,
    duration_minutes: spectacle.duration_minutes || undefined,
    casting: spectacle.casting || undefined,
    premiere: spectacle.premiere || undefined,
    image_url: spectacle.image_url || undefined,
    public: spectacle.public,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/spectacles/${spectacle.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Éditer : {spectacle.title}</h1>
          <p className="text-muted-foreground mt-2">
            Modifiez les informations du spectacle
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <SpectacleForm defaultValues={defaultValues} spectacleId={spectacle.id} />
      </div>
    </div>
  );
}
