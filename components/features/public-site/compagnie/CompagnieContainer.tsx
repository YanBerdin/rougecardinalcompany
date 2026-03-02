import type { ReactElement } from "react";
import { CompagnieView } from "./CompagnieView";
import { fetchCompagnieValues, fetchTeamMembers } from "@/lib/dal/compagnie";
import { fetchCompagniePresentationSections } from "@/lib/dal/compagnie-presentation";
import { DEFAULT_ITEMS_LIMIT, FALLBACK_MEMBER_IMAGE } from "./constants";

export async function CompagnieContainer(): Promise<ReactElement> {
  const [sectionsResult, valuesResult, teamResult] = await Promise.all([
    fetchCompagniePresentationSections(),
    fetchCompagnieValues(DEFAULT_ITEMS_LIMIT),
    fetchTeamMembers(DEFAULT_ITEMS_LIMIT),
  ]);

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
        image: m.image_url ?? FALLBACK_MEMBER_IMAGE,
      }))}
      loading={false}
    />
  );
}
