import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AboutProps } from "./types";

export function AboutContent({ stats, content }: AboutProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Colonne texte */}
            <div className="animate-fade-in-up">
                <h2 id="about-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                    {content.title}
                </h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                    {content.intro1}
                </p>
                <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                    {content.intro2}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10 border-t border-border pt-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className="text-4xl lg:text-5xl font-bold text-primary mb-1 leading-none">{stat.value}</div>
                            <div className="text-sm text-muted-foreground uppercase tracking-wide">{stat.label}</div>
                        </div>
                    ))}
                </div>

                <Button size="lg" asChild className="cta-blur-button">
                    <Link href="/compagnie">
                        <ArrowRight className="h-5 w-5" aria-hidden="true" />
                        Découvrir notre histoire
                    </Link>
                </Button>
            </div>

            {/* Colonne image */}
            <div className="relative animate-fade-in">
                <div className="relative aspect-[4/5] rounded-2xl shadow-2xl overflow-hidden">
                    <Image
                        src={content.imageUrl}
                        alt={content.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" aria-hidden="true" />
                </div>

                <div className="absolute -bottom-6 -left-6 bg-background p-5 rounded-2xl shadow-xl border max-w-xs">
                    <h3 className="font-bold font-sans mb-2 text-card-foreground text-base">{content.missionTitle}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{content.missionText}</p>
                </div>
            </div>
        </div>
    );
}
