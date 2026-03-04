import type { ReactElement } from "react";
import type { SectionRendererProps } from "./types";

export function SectionMission({ section }: SectionRendererProps): ReactElement {
    const headingId = `heading-${section.kind}`;
    return (
        <section id={section.kind} aria-labelledby={headingId} className="py-24 hero-gradient">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {section.title && (
                    <h2 id={headingId} className="text-3xl md:text-4xl lg:text-5xl font-bold font-sans mb-6 text-white">
                        {section.title}
                    </h2>
                )}
                {section.content?.[0] && (
                    <p className="text-xl md:text-2xl lg:text-2xl text-white/80 mb-8 leading-relaxed">
                        {section.content[0]}
                    </p>
                )}
                {section.content?.[1] && (
                    <p className="text-lg md:text-xl lg:text-xl text-white/80 leading-relaxed">
                        {section.content[1]}
                    </p>
                )}
            </div>
        </section>
    );
}
