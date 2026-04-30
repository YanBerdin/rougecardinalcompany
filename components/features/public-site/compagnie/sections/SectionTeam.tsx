import type { ReactElement } from "react";
import type { SectionRendererProps } from "./types";
import { TeamMemberCard } from "./TeamMemberCard";

export function SectionTeam({ section, team = [] }: SectionRendererProps): ReactElement {
    const headingId = `heading-${section.kind}`;
    return (
        <section id={section.kind} aria-labelledby={headingId} className="max-sm:py-12 py-24 bg-background">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-4 lg:px-4">
                <div className="text-center max-sm:mb-8 mb-16">
                    {section.title && <h2 id={headingId} className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{section.title}</h2>}
                    {section.subtitle && <p className="text-base md:text-lg lg:text-lg text-muted-foreground max-w-2xl mx-auto">{section.subtitle}</p>}
                </div>
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-16">
                    {team.map((member, index) => (
                        <TeamMemberCard key={index} member={member} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}
