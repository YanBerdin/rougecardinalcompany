import type { ReactElement } from "react";
import { Quote } from "lucide-react";
import type { SectionRendererProps } from "./types";

export function SectionQuote({ section }: SectionRendererProps): ReactElement | null {
    if (!section.quote) return null;
    return (
        <section id={section.kind} aria-label="Citation de la compagnie" className="pt-0 -mt-12 bg-chart-7">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-card rounded-2xl p-8">
                    <div className="flex items-start space-x-4">
                        <Quote className="h-8 w-8 text-primary flex-shrink-0 mt-1" aria-hidden="true" />
                        <div>
                            <blockquote className="text-lg xl:text-xl italic text-muted-foreground mb-4">
                                {section.quote.text}
                            </blockquote>
                            {section.quote.author && (
                                <cite className="text-primary font-semibold">{section.quote.author}</cite>
                            )}
                        </div>
                    </div>
                    <div className="w-full h-24 bg-chart-7" aria-hidden="true" />
                </div>
            </div>
        </section>
    );
}
