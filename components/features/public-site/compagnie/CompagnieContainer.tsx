import { CompagnieView } from "./CompagnieView";
import { fetchCompagnieValues, fetchTeamMembers } from "@/lib/dal/compagnie";
import { fetchCompagniePresentationSections } from "@/lib/dal/compagnie-presentation";

export async function CompagnieContainer() {
  const [sectionsResult, valuesResult, teamResult] = await Promise.all([
    fetchCompagniePresentationSections(),
    fetchCompagnieValues(12),
    fetchTeamMembers(12),
  ]);

  // Handle errors gracefully with fallback empty arrays
  const sections = sectionsResult.success ? sectionsResult.data : [];
  const values = valuesResult.success ? valuesResult.data : [];
  const team = teamResult.success ? teamResult.data : [];

  return (
    <CompagnieView
      sections={sections}
      values={values.map((v) => ({
        title: v.title,
        description: v.description,
      }))}
      team={team.map((m) => ({
        name: m.name,
        role: m.role,
        description: m.description,
        image: m.image_url ?? "/logo-florian.png",
      }))}
      loading={false}
    />
  );
}
