import type { ComponentType, ReactElement } from "react";
import { CompagnieSkeleton } from "@/components/skeletons/compagnie-skeleton";
import type { CompagnieViewProps } from "./types";
import {
  SectionHero,
  SectionHistory,
  SectionQuote,
  SectionValues,
  SectionTeam,
  SectionMission,
  type SectionRendererProps,
} from "./sections";

const SECTION_RENDERERS: Record<string, ComponentType<SectionRendererProps>> = {
  hero: SectionHero,
  history: SectionHistory,
  quote: SectionQuote,
  values: SectionValues,
  team: SectionTeam,
  mission: SectionMission,
};

export function CompagnieView({
  sections,
  values,
  team,
  loading = false,
}: CompagnieViewProps): ReactElement {
  if (loading) {
    return <CompagnieSkeleton />;
  }

  return (
    <div className=" max-sm:pt-12 pt-16">
      {sections.map((section) => {
        const Renderer = SECTION_RENDERERS[section.kind];
        if (!Renderer) return null;
        return (
          <Renderer
            key={section.id}
            section={section}
            values={values}
            team={team}
          />
        );
      })}
    </div>
  );
} 
