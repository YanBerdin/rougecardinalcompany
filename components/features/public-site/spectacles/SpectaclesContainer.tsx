import { SpectaclesView } from './SpectaclesView';
import { fetchAllSpectacles } from '@/lib/dal/spectacles';

/**
 * Server Container for Spectacles page
 * - Fetches data via server-only DAL (Supabase)
 * - Adds a tiny artificial delay to visualize skeletons (TODO: remove)
 * - Maps DB data to the presentational view props
 */
export async function SpectaclesContainer() {
    // TODO: remove artificial delay used for skeleton validation
    await new Promise((r) => setTimeout(r, 1200));

    const spectacles = await fetchAllSpectacles();

    // Improved logic: separate current shows from archives based on dates and status
    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    // Current shows: public and recent (within the last 3 months) or without premiere date
    const currentShows = spectacles
        .filter((s) => s.public)
        .filter((s) => {
            if (!s.premiere) return true; // If no date, consider as current
            const premiereDate = new Date(s.premiere);
            return premiereDate >= threeMonthsAgo;
        })
        .slice(0, 6)
        .map((s) => ({
            id: s.id,
            title: s.title,
            slug: s.slug ?? undefined,
            description: s.short_description ?? '',
            genre: s.genre ?? '—',
            duration_minutes: s.duration_minutes != null ? `${s.duration_minutes} min` : '—',
            cast: s.casting ?? 0,
            premiere: s.premiere ?? '',
            public: s.public,
            created_at: s.premiere ?? '',
            updated_at: s.premiere ?? '',
            image: s.image_url ?? '/opengraph-image.png',
            status: s.status ?? '—',
            awards: s.awards ?? [],
        }));

    // Archived shows: all public shows older than 3 months or non-public shows
    const archivedShows = spectacles
        .filter((s) => {
            if (!s.public) return true; // Include non-public shows (true archives)
            if (!s.premiere) return false; // If no date and public, don't archive
            const premiereDate = new Date(s.premiere);
            return premiereDate < threeMonthsAgo; // Shows older than 3 months
        })
        .map((s) => ({
            id: s.id,
            title: s.title,
            slug: s.slug ?? undefined,
            description: s.short_description ?? '',
            genre: s.genre ?? '—',
            premiere: s.premiere ?? undefined,
            image: s.image_url ?? '/opengraph-image.png',
            awards: s.awards ?? [],
        }));

    return (
        <SpectaclesView
            currentShows={currentShows}
            archivedShows={archivedShows}
            loading={false}
        />
    );
}
