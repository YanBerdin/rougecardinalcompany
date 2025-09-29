import { CompagnieView } from './CompagnieView';
import { fetchCompagnieValues, fetchTeamMembers } from '@/lib/dal/compagnie';
import { fetchCompagniePresentationSections } from '@/lib/dal/compagnie-presentation';

export async function CompagnieContainer() {
    // TODO: remove artificial delay used for skeleton validation
    await new Promise((r) => setTimeout(r, 1500));

    const [sections, values, team] = await Promise.all([
        fetchCompagniePresentationSections(),
        fetchCompagnieValues(12),
        fetchTeamMembers(12),
    ]);

    return (
        <CompagnieView
            sections={sections}
            values={values.map(v => ({
                title: v.title,
                description: v.description,
            }))}
            team={team.map(m => ({
                name: m.name,
                role: m.role ?? '',
                bio: m.description ?? '',
                image: m.image_url || '/logo-florian.png',
            }))}
            loading={false}
        />
    );
}
