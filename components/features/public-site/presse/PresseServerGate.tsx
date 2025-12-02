import { PresseView } from "./PresseView";
import type { MediaKitItem } from "./types";
import {
  fetchMediaArticles,
  fetchPressReleases,
  fetchMediaKit,
} from "@/lib/dal/presse";

export default async function PresseServerGate() {
  const [pressReleasesResult, mediaArticlesResult, mediaKitResult] =
    await Promise.all([
      fetchPressReleases(),
      fetchMediaArticles(),
      fetchMediaKit(),
    ]);

  // Handle errors gracefully with fallback empty arrays
  const pressReleases = pressReleasesResult.success
    ? pressReleasesResult.data
    : [];
  const mediaArticles = mediaArticlesResult.success
    ? mediaArticlesResult.data
    : [];
  const mediaKitRows = mediaKitResult.success ? mediaKitResult.data : [];

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
