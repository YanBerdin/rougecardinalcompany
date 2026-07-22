import type { ReactElement } from "react";
import { Quote } from "lucide-react";
import type { SectionRendererProps } from "./types";

export function SectionQuote({ section }: SectionRendererProps): ReactElement | null {
    if (!section.quote) return null;
    return (
        <section id={section.kind} aria-label="Citation de la compagnie" className="pb-24 xl:pb-32 bg-chart-7">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-card rounded-2xl p-8">
                    <div className="flex items-start gap-3 sm:gap-4">
                        <Quote className="size-5 sm:size-7 text-gold flex-shrink-0 mt-1 scale-x-[-1]" aria-hidden="true" />
                        <div className="flex-1 min-w-0">
                            <blockquote className="text-base lg:text-lg xl:text-xl italic text-muted-foreground mb-4">
                                {section.quote.text}
                            </blockquote>
                            {section.quote.author && (
                                <cite className="text-gold font-semibold max-sm:text-sm md:text-base lg:text-lg xl:text-xl">{section.quote.author}</cite>
                            )}
                        </div>
                        <Quote className="size-5 sm:size-7 text-gold flex-shrink-0 mt-1" aria-hidden="true" />
                    </div>
                </div>
            </div>
        </section>
    );
}
