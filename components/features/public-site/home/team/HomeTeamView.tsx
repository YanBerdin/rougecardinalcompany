import type { ReactElement } from "react";
import { TeamMemberCard } from "@/components/features/public-site/compagnie/sections/TeamMemberCard";
import type { HomeTeamViewProps } from "./types";

const SECTION_HEADING_ID = "home-team-heading";

export function HomeTeamView({ members }: HomeTeamViewProps): ReactElement {
    return (
        <section
            id="equipe"
            aria-labelledby={SECTION_HEADING_ID}
            className="max-sm:py-12 py-24 bg-chart-background"
        >
            <div className="max-w-screen-xl mx-auto px-4 sm:px-4 lg:px-4">
                <div className="text-center max-sm:mb-8 mb-16">
                    <h2
                        id={SECTION_HEADING_ID}
                        className="text-3xl md:text-4xl lg:text-5xl font-bold font-sans mb-4"
                    >
                        Notre équipe
                    </h2>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                        Les artistes et collaborateurs qui donnent vie à Rouge Cardinal
                    </p>
                </div>
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-16">
                    {members.map((member, index) => (
                        <TeamMemberCard key={index} member={member} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}
