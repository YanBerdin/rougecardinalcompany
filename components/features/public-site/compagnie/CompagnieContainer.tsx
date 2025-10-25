import { CompagnieView } from "./CompagnieView";
import { fetchCompagnieValues, fetchTeamMembers } from "@/lib/dal/compagnie";
import { fetchCompagniePresentationSections } from "@/lib/dal/compagnie-presentation";

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
      values={values.map((v) => ({
        title: v.title,
        description: v.description,
      }))}
      team={team.map((m) => ({
        name: m.name,
        role: m.role, // Preserve null for proper typing
        description: m.description, // Preserve null for proper typing
        // Virtual field: maps from image_url (external) or photo_media_id (Media Library)
        // TODO TASK022: Implement photo_media_id → medias table lookup when Media Library is used
        image: m.image_url ?? "/logo-florian.png",
      }))}
      loading={false}
    />
  );
}
