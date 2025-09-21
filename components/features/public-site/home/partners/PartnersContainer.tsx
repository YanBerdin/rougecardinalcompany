import { fetchActivePartners } from '@/lib/dal/home-partners';
import { PartnersView } from './PartnersView';
import type { Partner } from './types';

export async function PartnersContainer() {
    // TODO: remove - artificial delay to visualize Suspense skeletons
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const records = await fetchActivePartners(12);
    const partners: Partner[] = (records ?? []).map(r => ({
        id: r.id,
        name: r.name,
        type: '',
        description: r.description ?? '',
        logo: r.logo_url ?? '',
        website: r.website_url ?? '#',
    }));
    return <PartnersView partners={partners} isLoading={false} />;
}
