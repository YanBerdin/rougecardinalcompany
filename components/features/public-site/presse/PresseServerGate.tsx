import { PresseView } from "./PresseView";
import type { MediaKitItem } from "./types";
import {
  fetchMediaArticles,
  fetchPressReleases,
  fetchMediaKit,
} from "@/lib/dal/presse";
import { fetchDisplayToggle } from "@/lib/dal/site-config";

/**
 * ✅ Server Component optimized for streaming
 * Fetches all data in parallel for optimal performance
 */
export default async function PresseServerGate() {
  // ✅ Check display toggles
  const [mediaKitToggleResult, pressReleasesToggleResult] = await Promise.all([
    fetchDisplayToggle("display_toggle_media_kit"),
    fetchDisplayToggle("display_toggle_presse_articles"),
  ]);

  const showMediaKit =
    mediaKitToggleResult.success &&
    mediaKitToggleResult.data?.value.enabled !== false;

  const showPressReleases =
    pressReleasesToggleResult.success &&
    pressReleasesToggleResult.data?.value.enabled !== false;

  const maxPressReleases = pressReleasesToggleResult.success
    ? pressReleasesToggleResult.data?.value.max_items ?? 12
    : 12;

  // ✅ Fetch all data in parallel - fast!
  const [pressReleasesResult, mediaArticlesResult, mediaKitResult] =
    await Promise.all([
      showPressReleases
        ? fetchPressReleases(maxPressReleases)
        : Promise.resolve({ success: true, data: [] }),
      fetchMediaArticles(),
      showMediaKit
        ? fetchMediaKit()
        : Promise.resolve({ success: true, data: [] }),
    ]);

  // Handle errors gracefully with fallback empty arrays
  const pressReleases = pressReleasesResult.success
    ? pressReleasesResult.data
    : [];
  const mediaArticles = mediaArticlesResult.success
    ? mediaArticlesResult.data
    : [];
  const mediaKitRows = mediaKitResult.success ? mediaKitResult.data : [];

  // Map DTO → MediaKitItem pour l'UI
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
