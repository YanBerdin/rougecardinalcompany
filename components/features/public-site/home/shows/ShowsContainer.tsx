import { fetchFeaturedShows } from '@/lib/dal/shows';
import { ShowsView } from './ShowsView';
import type { Show } from './types';

export async function ShowsContainer() {
    // TODO: remove - artificial delay to visualize Suspense skeletons
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const records = await fetchFeaturedShows(3);
    const shows: Show[] = (records ?? []).map(r => ({
        id: r.id,
        title: r.title,
        short_description: r.short_description ?? '',
        image: r.image_url ?? '',
        slug: r.slug ?? String(r.id),
        dates: r.dates ?? [],
    }));
    return <ShowsView shows={shows} />;
}
