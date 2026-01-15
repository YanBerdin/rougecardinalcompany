"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { LogoCloudProps, Partner } from "./types";

export function LogoCloud({
    partners,
    title = "Nos Partenaires",
    subtitle = "Ils nous font confiance pour créer des expériences théâtrales mémorables.",
    speed = "normal",
    pauseOnHover = true,
    linkable = false,
    className = "",
}: LogoCloudProps) {
    const [isPaused, setIsPaused] = useState(false);
    const scrollerRef = useRef<HTMLDivElement>(null);

    // Dupliquer les logos pour un défilement infini
    const duplicatedPartners = [...partners, ...partners];

    // Vitesses d'animation
    const speedMap = {
        slow: "60s",
        normal: "40s",
        fast: "20s",
    };

    const animationDuration = speedMap[speed];

    useEffect(() => {
        if (scrollerRef.current) {
            const scrollerContent = scrollerRef.current.querySelector(
                "[data-scroller-content]"
            );
            if (scrollerContent) {
                const items = Array.from(scrollerContent.children);
                items.forEach((item) => {
                    const duplicatedItem = item.cloneNode(true);
                    scrollerContent.appendChild(duplicatedItem);
                });
            }
        }
    }, []);

    return (
        <section className={`py-12 md:py-16 lg:py-20 ${className}`}>
            <div className="container mx-auto px-4">
                {/* En-tête */}
                <div className="text-center mb-10 md:mb-14">

                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Conteneur de défilement */}
                <div
                    ref={scrollerRef}
                    className="relative overflow-hidden"
                    onMouseEnter={() => pauseOnHover && setIsPaused(true)}
                    onMouseLeave={() => pauseOnHover && setIsPaused(false)}
                >
                    {/* Gradients de masquage */}
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

                    {/* Bande de défilement */}
                    <div
                        data-scroller-content
                        className="flex gap-8 md:gap-12 lg:gap-16 animate-infinite-scroll"
                        style={{
                            animationDuration,
                            animationPlayState: isPaused ? "paused" : "running",
                        }}
                    >
                        {duplicatedPartners.map((partner, index) => {
                            const content = (
                                <Image
                                    src={partner.logo}
                                    alt={partner.name}
                                    width={partner.width || 150}
                                    height={partner.height || 60}
                                    className="w-auto h-12 md:h-14 lg:h-16 object-contain"
                                    loading="lazy"
                                />
                            );

                            const wrapperClasses =
                                "flex items-center justify-center flex-shrink-0 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300 hover:scale-105 backdrop-blur-sm bg-white/10 dark:bg-black/10 rounded-xl p-4";
                            const wrapperStyle = { minWidth: "150px", maxWidth: "200px" };

                            if (linkable && partner.website) {
                                return (
                                    <Link
                                        key={`${partner.name}-${index}`}
                                        href={partner.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={wrapperClasses}
                                        style={wrapperStyle}
                                        aria-label={`Visiter le site de ${partner.name}`}
                                    >
                                        {content}
                                    </Link>
                                );
                            }

                            return (
                                <div
                                    key={`${partner.name}-${index}`}
                                    className={wrapperClasses}
                                    style={wrapperStyle}
                                >
                                    {content}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
