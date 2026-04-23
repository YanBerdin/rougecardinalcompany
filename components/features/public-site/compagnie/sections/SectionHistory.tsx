import Image from "next/image";
import type { ReactElement } from "react";
import type { SectionRendererProps } from "./types";

export function SectionHistory({ section }: SectionRendererProps): ReactElement {
    const headingId = `heading-${section.kind}`;
    return (
        <section id={section.kind} aria-labelledby={headingId} className="max-sm:py-12 py-24 bg-chart-7/60">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
                    <div className="animate-fade-in-up">
                        {section.title && (
                            <h2 id={headingId} className="text-3xl md:text-4xl lg:text-5xl font-bold font-sans mb-6">
                                {section.title}
                            </h2>
                        )}
                        {section.content?.map((p: string, i: number) => (
                            <p key={i} className={`text-md md:text-lg xl:text-xl text-muted-foreground ${i < (section.content?.length ?? 0) - 1 ? "mb-4" : ""} leading-relaxed`}>
                                {p}
                            </p>
                        ))}
                    </div>
                    {section.image && (
                        <div className="animate-fade-in max-md:p-2">
                            <Image src={section.image} alt={section.title ?? "Histoire de la compagnie Rouge-Cardinal"} width={800} height={500} className="aspect-[8/5] w-full rounded-2xl object-cover shadow-2xl" />
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
