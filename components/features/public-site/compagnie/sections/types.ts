import type { PresentationSection } from "@/lib/dal/compagnie-presentation";
import type { Value, TeamMember } from "@/lib/schemas/compagnie";

/**
 * Unified props for all section renderer components.
 * Values and team are optional — only needed for the sections that use them.
 */
export interface SectionRendererProps {
    section: PresentationSection;
    values?: Value[];
    team?: TeamMember[];
}
