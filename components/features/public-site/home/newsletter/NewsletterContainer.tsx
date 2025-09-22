import { NewsletterSettings, fetchNewsletterSettings } from '@/lib/dal/home-newsletter';
import { NewsletterClientContainer } from './NewsletterClientContainer';

export async function NewsletterContainer() {
    // TODO: remove - artificial delay to visualize Suspense skeletons
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const settings: NewsletterSettings = await fetchNewsletterSettings();
    if (!settings.enabled) return null;

    return <NewsletterClientContainer />;
}

