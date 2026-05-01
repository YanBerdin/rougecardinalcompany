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
                <h2 id="about-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                    {content.title}
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed">
                    {content.intro1}
                </p>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                    {content.intro2}
                </p>

                <div className="grid grid-cols-3 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-3">
                                <stat.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                            </div>
                            <div className="text-2xl font-semibold text-primary mb-1">{stat.value}</div>
                            <div className="text-sm text-muted-foreground">{stat.label}</div>
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" aria-hidden="true" />
                </div>

                <div className="absolute -bottom-6 -left-6 bg-background p-4 rounded-xl shadow-lg border max-w-xs">
                    <h3 className="font-semibold font-sans mb-2 text-card-foreground">{content.missionTitle}</h3>
                    <p className="text-sm text-muted-foreground">{content.missionText}</p>
                </div>
            </div>
        </div>
    );
}
