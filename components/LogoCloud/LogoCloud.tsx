"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { LogoCloudProps, Partner } from "./types";

interface LogoCardProps {
    partner: Partner;
    linkable: boolean;
    index: number;
}

function LogoCard({ partner, linkable, index }: LogoCardProps) {
    const content = (
        <Image
            src={partner.logo}
            alt={partner.name}
            width={partner.width || 150}
            height={partner.height || 60}
            className="w-auto h-10 md:h-12 lg:h-14 object-contain"
            loading="lazy"
        />
    );

    const cardClasses =
        "flex items-center justify-center px-6 py-4 mx-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50 min-w-[180px] h-20 hover:bg-zinc-800/80 transition-all duration-300 grayscale hover:grayscale-0 opacity-70 hover:opacity-100";

    if (linkable && partner.website) {
        return (
            <Link
                key={`${partner.name}-${index}`}
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className={cardClasses}
                aria-label={`Visiter le site de ${partner.name}`}
            >
                {content}
            </Link>
        );
    }

    return (
        <div key={`${partner.name}-${index}`} className={cardClasses}>
            {content}
        </div>
    );
}

export function LogoCloud({
    partners,
    title = "Nos Partenaires",
    subtitle = "Ils nous font confiance pour créer des expériences théâtrales mémorables.",
    speed = "normal",
    pauseOnHover = true,
    linkable = false,
    twoRows = false,
    className = "",
}: LogoCloudProps) {
    const [isPaused, setIsPaused] = useState(false);

    const speedMap = {
        slow: "60s",
        normal: "40s",
        fast: "20s",
    };

    const animationDuration = speedMap[speed];
    const reverseAnimationDuration = speed === "normal" ? "45s" : animationDuration;

    const row1 = twoRows ? partners.slice(0, Math.ceil(partners.length / 2)) : partners;
    const row2 = twoRows ? partners.slice(Math.ceil(partners.length / 2)) : [];

    return (
        <section className={`py-12 md:py-16 lg:py-20 overflow-hidden ${className}`}>
            <div className="max-w-7xl mx-auto px-6 text-center mb-12 md:mb-16">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
                    {title}
                </h2>
                {subtitle && (
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        {subtitle}
                    </p>
                )}
            </div>

            <div
                className="relative marquee-container"
                onMouseEnter={() => pauseOnHover && setIsPaused(true)}
                onMouseLeave={() => pauseOnHover && setIsPaused(false)}
                style={{
                    ["--animation-duration" as string]: animationDuration,
                    ["--reverse-animation-duration" as string]: reverseAnimationDuration,
                    ["--animation-state" as string]: isPaused ? "paused" : "running",
                }}
            >
                {/* Row 1 */}
                <div className="flex overflow-hidden mb-6">
                    <div className="logo-cloud-track">
                        {row1.map((partner, idx) => (
                            <LogoCard
                                key={`r1-1-${partner.id || idx}`}
                                partner={partner}
                                linkable={linkable}
                                index={idx}
                            />
                        ))}
                        {row1.map((partner, idx) => (
                            <LogoCard
                                key={`r1-2-${partner.id || idx}`}
                                partner={partner}
                                linkable={linkable}
                                index={idx + row1.length}
                            />
                        ))}
                    </div>
                </div>

                {/* Row 2 (only if twoRows is true and we have items) */}
                {twoRows && row2.length > 0 && (
                    <div className="flex overflow-hidden">
                        <div className="logo-cloud-track-reverse">
                            {row2.map((partner, idx) => (
                                <LogoCard
                                    key={`r2-1-${partner.id || idx}`}
                                    partner={partner}
                                    linkable={linkable}
                                    index={idx}
                                />
                            ))}
                            {row2.map((partner, idx) => (
                                <LogoCard
                                    key={`r2-2-${partner.id || idx}`}
                                    partner={partner}
                                    linkable={linkable}
                                    index={idx + row2.length}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
