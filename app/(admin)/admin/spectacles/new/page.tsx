import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SpectacleForm from "@/components/features/admin/spectacles/SpectacleForm";
import { fetchDistinctGenres } from "@/lib/dal/spectacles";

export default async function NewSpectaclePage() {
  const supabase = await createClient();

  // Check admin authentication
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims || data.claims.user_metadata.role !== "admin") {
    redirect("/auth/login");
  }

  // Load existing genres for the form
  const existingGenres = await fetchDistinctGenres();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/spectacles">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Nouveau spectacle</h1>
          <p className="text-muted-foreground mt-2">
            Ajoutez un nouveau spectacle au répertoire de la compagnie
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <SpectacleForm existingGenres={existingGenres} />
      </div>
    </div>
  );
}
