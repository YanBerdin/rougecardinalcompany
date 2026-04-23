import type { ReactElement } from "react";
import type { SectionRendererProps } from "./types";
import { ANIMATION_BASE_DELAY } from "../constants";

export function SectionHero({ section }: SectionRendererProps): ReactElement {
    const headingId = `heading-${section.kind}`;
    return (
        <section id={section.kind} aria-labelledby={headingId} className="max-sm:py-8 py-10 hero-gradient">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {section.title && (
                    <h1 id={headingId} className="text-3xl md:text-4xl lg:text-5xl text-white font-bold mb-6 animate-fade-in-up">
                        {section.title}
                    </h1>
                )}
                {section.subtitle && (
                    <p className="max-sm:text-md text-lg md:text-xl text-white/80 opacity-90 animate-fade-in" style={{ animationDelay: ANIMATION_BASE_DELAY }}>
                        {section.subtitle}
                    </p>
                )}
            </div>
        </section>
    );
}
