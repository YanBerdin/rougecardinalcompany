import type { ReactElement } from "react";
import { Quote } from "lucide-react";
import type { SectionRendererProps } from "./types";

export function SectionQuote({ section }: SectionRendererProps): ReactElement | null {
    if (!section.quote) return null;
    return (
        <section id={section.kind} aria-label="Citation de la compagnie" className="pt-0 -mt-12 bg-chart-7">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-card rounded-2xl p-8">
                    <div className="flex items-start gap-3 sm:gap-4">
                        <Quote className="h-5 w-5 sm:h-7 sm:w-7 text-gold flex-shrink-0 mt-1" aria-hidden="true" />
                        <div className="flex-1 min-w-0">
                            <blockquote className="text-lg xl:text-xl italic text-muted-foreground mb-4">
                                {section.quote.text}
                            </blockquote>
                            {section.quote.author && (
                                <cite className="text-gold font-semibold">{section.quote.author}</cite>
                            )}
                        </div>
                        <Quote className="h-5 w-5 sm:h-7 sm:w-7 text-gold flex-shrink-0 mt-1 scale-x-[-1]" aria-hidden="true" />
                    </div>
                </div>
                <div className="w-full h-24 bg-chart-7" aria-hidden="true" />
            </div>
        </section>
    );
}
