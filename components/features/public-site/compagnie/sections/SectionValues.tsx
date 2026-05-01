import type { ReactElement } from "react";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { SectionRendererProps } from "./types";
import { ANIMATION_DELAY_STEP } from "../constants";

export function SectionValues({ section, values = [] }: SectionRendererProps): ReactElement {
    const headingId = `heading-${section.kind}`;
    return (
        <section id={section.kind} aria-labelledby={headingId} className="max-sm:py-12 py-24 bg-muted/30">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-sm:mb-8 mb-16">
                    {section.title && <h2 id={headingId} className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4">{section.title}</h2>}
                    {section.subtitle && <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">{section.subtitle}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {values.map((value, index) => (
                        <Card key={index} className="text-center card-hover animate-fade-in-up" style={{ animationDelay: `${index * ANIMATION_DELAY_STEP}s` }}>
                            <CardContent className="p-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-lg mb-4">
                                    <Star className="h-8 w-8 text-primary" aria-hidden="true" />
                                </div>
                                <h3 className="text-2xl font-semibold font-sans mb-3">{value.title}</h3>
                                <p className="text-muted-foreground">{value.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
