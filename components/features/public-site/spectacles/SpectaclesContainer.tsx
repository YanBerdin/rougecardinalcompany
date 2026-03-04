import { SpectaclesView } from "./SpectaclesView";
import { fetchAllSpectacles, fetchTicketUrlsForSpectacles } from "@/lib/dal/spectacles";

const MAX_CURRENT_SHOWS = 6;

export async function SpectaclesContainer() {
  const spectacles = await fetchAllSpectacles();

  const currentFiltered = spectacles
    .filter((s) => s.public && s.status !== "archived")
    .slice(0, MAX_CURRENT_SHOWS);

  // Batch-fetch ticket URLs for current shows (avoids N+1)
  const currentIds = currentFiltered.map((s) => s.id);
  const ticketUrls = await fetchTicketUrlsForSpectacles(currentIds);

  const currentShows = currentFiltered.map((s) => ({
      id: s.id,
      title: s.title,
      slug: s.slug ?? undefined,
      description: s.short_description ?? "",
      genre: s.genre ?? "—",
      duration_minutes:
        s.duration_minutes != null ? `${s.duration_minutes} min` : "—",
      cast: s.casting ?? 0,
      premiere: s.premiere ?? "",
      image: s.image_url ?? "/opengraph-image.png",
      status: s.status ?? "—",
      awards: s.awards ?? [],
      ticketUrl: ticketUrls.get(s.id) ?? null,
    }));

  // Archived shows: all shows with 'archived' status (regardless of public flag)
  const archivedShows = spectacles
    .filter((s) => s.status === "archived")
    .map((s) => ({
      id: s.id,
      title: s.title,
      slug: s.slug ?? undefined,
      description: s.short_description ?? "",
      genre: s.genre ?? "—",
      premiere: s.premiere ?? undefined,
      image: s.image_url ?? "/opengraph-image.png",
      awards: s.awards ?? [],
    }));

  return (
    <SpectaclesView
      currentShows={currentShows}
      archivedShows={archivedShows}
    />
  );
}
