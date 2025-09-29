import { PresseView } from "./PresseView";
import type { MediaKitItem } from "./types";
import { fetchMediaArticles, fetchPressReleases, fetchMediaKit } from "@/lib/dal/presse";

export default async function PresseServerGate() {
  // Délai artificiel pour tester le skeleton // TODO: remove
  await new Promise((r) => setTimeout(r, 800));

  const [pressReleases, mediaArticles, mediaKitRows] = await Promise.all([
    fetchPressReleases(),
    fetchMediaArticles(),
    fetchMediaKit(),
  ]);

  // Map DTO -> MediaKitItem pour l'UI (icône optionnelle)
  const mediaKit: MediaKitItem[] = mediaKitRows.map((r) => ({
    type: r.type,
    description: r.description,
    fileSize: r.fileSize,
    fileUrl: r.fileUrl,
  }));

  return (
    <PresseView
      pressReleases={pressReleases}
      mediaArticles={mediaArticles}
      mediaKit={mediaKit}
    />
  );
}
