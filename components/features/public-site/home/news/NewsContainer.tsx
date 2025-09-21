import { fetchFeaturedPressReleases } from '@/lib/dal/home-news';
import { NewsView } from './NewsView';
import type { NewsItem } from './types';

export async function NewsContainer() {
    // TODO: remove - artificial delay to visualize Suspense skeletons
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const rows = await fetchFeaturedPressReleases(3);

    const news: NewsItem[] = rows.map((r) => ({
        id: r.id,
        title: r.title,
        short_description: r.description ?? '',
        date: r.date_publication,
        image: r.image_url ?? '',
        category: 'Presse',
    }));

    if (news.length === 0) {
        return null;
    }

    return <NewsView news={news} />;
}
