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

    // DEBUG: Log the raw data to understand what we're working with
    //TODO: remove in production
    /*
    console.log('=== DEBUG SPECTACLES CONTAINER ===');
    console.log('Total spectacles fetched:', spectacles.length);
    console.log('All spectacles status/public:', spectacles.map(s => ({
        title: s.title,
        status: s.status,
        public: s.public
    })));
    */

    // Improved logic: separate current shows from archives based on status
    // Current shows: public status and not archived
    const currentShows = spectacles
        .filter((s) => s.public && s.status !== 'archive')
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

    // Archived shows: all shows with 'archive' status (regardless of public flag)
    const archivedShows = spectacles
        .filter((s) => s.status === 'archive')
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

    // DEBUG: Log the filtered results
    /*
    console.log('Current shows count:', currentShows.length);
    console.log('Archived shows count:', archivedShows.length);
    console.log('Archived shows details:', archivedShows.map(s => ({ title: s.title, id: s.id })));
    console.log('=== END DEBUG ===');
    */

    return (
        <SpectaclesView
            currentShows={currentShows}
            archivedShows={archivedShows}
            loading={false}
        />
    );
}
