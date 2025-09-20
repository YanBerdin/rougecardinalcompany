import { fetchCompanyStats } from '@/lib/dal/about';
import { AboutView } from './AboutView';
import type { StatItem, AboutContent } from './types';
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

    // Mock de contenu À propos (à remplacer par DAL)
    const content: AboutContent = {
        title: 'La Passion du Théâtre depuis 2008',
        intro1:
            "Née de la rencontre de professionnels passionnés, la compagnie Rouge-Cardinal s'attache à créer des spectacles qui interrogent notre époque tout en célébrant la beauté de l'art théâtral.",
        intro2:
            "Notre démarche artistique privilégie l'humain, l'émotion authentique et la recherche constante d'une vérité scénique qui touche et transforme.",
        imageUrl:
            'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
        missionTitle: 'Notre Mission',
        missionText:
            "Créer des spectacles qui émeuvent, questionnent et rassemblent les publics autour de l'art vivant.",
    };

    return <AboutView stats={stats} content={content} />;
}
