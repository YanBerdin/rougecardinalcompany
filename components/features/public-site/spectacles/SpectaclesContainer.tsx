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

    // Simple split current vs archived based on premiere date (example logic)
    const now = new Date();
    const currentShows = spectacles
        .filter((s) => s.public)
        .filter((s) => (s.premiere ? new Date(s.premiere) <= now : true))
        .slice(0, 6)
        .map((s) => ({
            id: s.id,
            title: s.title,
            slug: s.slug ?? undefined,
            description: s.short_description ?? '',
            genre: 'Création', // TODO: map real genre when available in schema
            duration_minutes: '—', // TODO: map real duration when available in schema
            cast: 0, // TODO: map real cast size when available
            premiere: s.premiere ?? '',
            public: s.public,
            created_at: s.premiere ?? '',
            updated_at: s.premiere ?? '',
            image: s.image_url ?? '/opengraph-image.png',
            status: 'En tournée', // TODO: map real status when available
            awards: [], // TODO: join awards when available
        }));

    const archivedShows = spectacles
        .filter((s) => !s.public)
        .slice(0, 9)
        .map((s) => ({
            id: s.id,
            title: s.title,
            slug: s.slug ?? undefined,
            description: s.short_description ?? '',
            genre: 'Création',
            premiere: s.premiere ?? undefined,
            image: s.image_url ?? '/opengraph-image.png',
            awards: [],
        }));

    return (
        <SpectaclesView
            currentShows={currentShows}
            archivedShows={archivedShows}
            loading={false}
        />
    );
}
