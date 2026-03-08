import Image from "next/image";
import type { ReactElement } from "react";
import type { SectionRendererProps } from "./types";
import { ANIMATION_DELAY_STEP } from "../constants";

export function SectionTeam({ section, team = [] }: SectionRendererProps): ReactElement {
    const headingId = `heading-${section.kind}`;
    return (
        <section id={section.kind} aria-labelledby={headingId} className="py-24 bg-chart-7">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-4 lg:px-4">
                <div className="text-center mb-16">
                    {section.title && <h2 id={headingId} className="text-3xl md:text-4xl lg:text-5xl font-bold font-sans mb-4">{section.title}</h2>}
                    {section.subtitle && <p className="text-lg md:text-xl lg:text-xl text-muted-foreground max-w-2xl mx-auto">{section.subtitle}</p>}
                </div>
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-16">
                    {team.map((member, index) => (
                        <div key={index} className="flex flex-col items-center text-center animate-fade-in-up group w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.333%-1.5rem)] lg:w-[calc(25%-1.5rem)] xl:w-[calc(19%-1.5rem)]" style={{ animationDelay: `${index * ANIMATION_DELAY_STEP}s` }}>
                            <div className="relative mb-6">
                                <div className="w-32 h-32 rounded-full ring-4 ring-gold group-hover:ring-primary transition-all duration-500 p-1.5 overflow-hidden flex items-center justify-center">
                                        <Image src={member.image} alt={member.name} width={128} height={128} className="w-full h-full rounded-full object-cover" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold tracking-tight">{member.name}</h3>
                                {member.role && <p className="text-gold text-sm font-semibold uppercase tracking-widest">{member.role}</p>}
                                {member.description && <p className="text-muted-foreground text-sm leading-relaxed max-w-[200px] mt-3 mx-auto">{member.description}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
