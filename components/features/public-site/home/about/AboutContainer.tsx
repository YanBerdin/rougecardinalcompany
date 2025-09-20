import { fetchCompanyStats } from '@/lib/dal/about';
import { AboutView } from './AboutView';
import type { StatItem } from './types';
import { Users, Heart, Award } from 'lucide-react';

const iconByKey: Record<string, React.ElementType> = {
    annees_experience: Users,
    spectacles_crees: Heart,
    prix_obtenus: Award,
};

export async function AboutContainer() {
    // TODO: remove - artificial delay to visualize Suspense skeletons
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const records = await fetchCompanyStats();
    const stats: StatItem[] = (records ?? []).map(r => ({
        icon: iconByKey[r.key] ?? Users,
        value: r.value,
        label: r.label,
    }));
    return <AboutView stats={stats} />;
}
