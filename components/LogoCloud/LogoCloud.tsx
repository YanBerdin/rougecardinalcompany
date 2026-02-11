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
            height={partner.height || 55}
            className="w-auto h-10 md:h-12 lg:h-14 object-contain rounded-sm"
            loading="lazy"
        />
    );

    //px-2 py-2 mx-0 md:px-2 md:py-4 md:mx-3 min-w-[100px] lg:min-w-[120px] h-14 xl:h-16
    const cardClasses =
        "flex items-center justify-center px-0 py-0 mx-0 md:mx-3 bg-card/40 backdrop-blur-sm min-w-[50px] lg:min-w-[60px] h-12 xl:h-14 hover:bg-card transition-all duration-500 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative group rounded-md";

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
    // title = "Nos Partenaires",
    // subtitle = "Ils nous font confiance pour créer des expériences théâtrales mémorables.",
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

    // Désactiver le défilement si trop peu de logos (moins de 6)
    const shouldScroll = partners.length >= 6;

    return (
        <section className={`py-4 md:py-6 lg:py-6 overflow-hidden relative ${className}`}>

            {/*<div className="max-w-7xl mx-auto px-6 text-center mb-16 md:mb-24 relative">
                <div className="flex flex-col items-center gap-4 mb-2">
                    <span className="h-px w-12 bg-primary/40 block" />
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground uppercase">
                        {title}
                    </h2>
                </div>
                {subtitle && (
                    <p className="text-base md:text-lg text-muted-foreground/80 max-w-2xl mx-auto font-light italic leading-relaxed">
                        {subtitle}
                    </p>
                )}
            </div>
*/}
            <div className="max-w-7xl mx-auto px-6 text-center mb-4">

                <p className="text-sm lg:text-md xl:text-lg text-chart-6/70 max-w-2xl mx-auto">
                    Nos soutiens et partenaires institutionnels nous accompagnent.
                </p>
            </div>
            {shouldScroll ? (
                /* Mode défilement : pour 6+ logos */
                <div
                    className="relative marquee-container before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-40 before:bg-gradient-to-r before:from-black/30 before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-40 after:bg-gradient-to-l after:from-black/30 after:to-transparent"
                    onMouseEnter={() => pauseOnHover && setIsPaused(true)}
                    onMouseLeave={() => pauseOnHover && setIsPaused(false)}
                    style={{
                        ["--animation-duration" as string]: animationDuration,
                        ["--reverse-animation-duration" as string]: reverseAnimationDuration,
                        ["--animation-state" as string]: isPaused ? "paused" : "running",
                    }}
                >
                    {/* Row 1 */}
                    <div className="flex overflow-hidden mb-8">
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
            ) : (
                /* Mode statique centré : pour moins de 6 logos */
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex  items-center justify-center max-sm:gap-2 sm:gap-4 md:gap-12">
                        {partners.map((partner, idx) => (
                            <LogoCard
                                key={`static-${partner.id || idx}`}
                                partner={partner}
                                linkable={linkable}
                                index={idx}
                            />
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
