import type { ReactElement } from "react";
import type { SectionRendererProps } from "./types";

export function SectionMission({ section }: SectionRendererProps): ReactElement {
    const headingId = `heading-${section.kind}`;
    return (
        <section id={section.kind} aria-labelledby={headingId} className="max-sm:py-12 py-20 hero-gradient">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {section.title && (
                    <h2 id={headingId} className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white/90">
                        {section.title}
                    </h2>
                )}
                {section.content?.[0] && (
                    <p className="max-sm:text-left text-base xl:text-xl text-white/80 mb-8 leading-relaxed">
                        {section.content[0]}
                    </p>
                )}
                {section.content?.[1] && (
                    <p className="max-sm:text-left text-base xl:text-lg text-white/80 leading-relaxed">
                        {section.content[1]}
                    </p>
                )}
            </div>
        </section>
    );
}
