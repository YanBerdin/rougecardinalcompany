"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType } from "embla-carousel";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CarouselImage {
    url: string;
    alt: string | null;
}

interface SpectacleCarouselProps {
    images: CarouselImage[];
    title: string;
    autoplayDelay?: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_AUTOPLAY_DELAY = 5000;

// ---------------------------------------------------------------------------
// Scale tween constants (from Embla "Scale" example)
// ---------------------------------------------------------------------------

const TWEEN_FACTOR_BASE = 0.40; // Base factor for scaling effect (0.40 = max 40% size reduction for non-focused slides)
const NAV_BUTTON_CLASS =
    "flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

function numberWithinRange(n: number, min: number, max: number): number {
    return Math.min(Math.max(n, min), max);
}

// Internal Embla engine subset — used only for the scale tween
interface EmblaEngineInternal {
    options: { loop: boolean };
    slideLooper: {
        loopPoints: Array<{ index: number; target: () => number }>;
    };
    scrollSnapList: Array<{ snaps: number[] }>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Embla-based image carousel for spectacle gallery.
 *
 * - 0 images → renders nothing
 * - 1 image  → simple display without carousel controls
 * - 2+ images → full carousel with arrows, dots, counter
 *
 * Built with accessibility in mind (WCAG 2.2 AA), but further
 * testing with assistive technologies is recommended.
 */
export function SpectacleCarousel({
    images,
    title,
    autoplayDelay = DEFAULT_AUTOPLAY_DELAY,
}: SpectacleCarouselProps): React.ReactNode {
    if (images.length === 0) return null;

    if (images.length === 1) {
        return <SingleImage image={images[0]} title={title} />;
    }

    return (
        <MultiImageCarousel
            images={images}
            title={title}
            autoplayDelay={autoplayDelay}
        />
    );
}

// ---------------------------------------------------------------------------
// SingleImage (1 photo — no carousel UI)
// ---------------------------------------------------------------------------

function SingleImage({
    image,
    title,
}: {
    image: CarouselImage;
    title: string;
}): React.ReactNode {
    return (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
            <Image
                src={image.url}
                alt={image.alt ?? `Photo de ${title}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 66vw"
                priority
            />
        </div>
    );
}

// ---------------------------------------------------------------------------
// MultiImageCarousel (2+ photos — Embla Scale tween)
// ---------------------------------------------------------------------------

function MultiImageCarousel({
    images,
    title,
    autoplayDelay,
}: {
    images: CarouselImage[];
    title: string;
    autoplayDelay: number;
}): React.ReactNode {
    const prefersReducedMotion = usePrefersReducedMotion();

    const autoplayPlugin = useRef(
        Autoplay({
            delay: autoplayDelay,
            stopOnInteraction: true,
            active: !prefersReducedMotion,
        }),
    );

    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true, align: "center", skipSnaps: false },
        [autoplayPlugin.current],
    );

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

    // Scale tween refs
    const tweenFactor = useRef(0);
    const tweenNodes = useRef<HTMLElement[]>([]);

    // ---------- Scale tween callbacks ----------

    const setTweenNodes = useCallback((api: EmblaCarouselType): void => {
        tweenNodes.current = api.slideNodes().map((slideNode: HTMLElement) => {
            return slideNode.querySelector("[data-embla-tween]") as HTMLElement;
        });
    }, []);

    const setTweenFactor = useCallback((api: EmblaCarouselType): void => {
        tweenFactor.current = TWEEN_FACTOR_BASE * api.scrollSnapList().length;
    }, []);

    const tweenScale = useCallback(
        (api: EmblaCarouselType, evt?: string): void => {
            const engine = api.internalEngine() as unknown as EmblaEngineInternal;
            const scrollProgress = api.scrollProgress();
            const slidesInView = api.slidesInView();
            const isScrollEvent = evt === "scroll";

            api.scrollSnapList().forEach((scrollSnap: number, snapIndex: number) => {
                let diffToTarget = scrollSnap - scrollProgress;
                const slideIndexes =
                    engine.scrollSnapList[snapIndex]?.snaps ?? [snapIndex];

                slideIndexes.forEach((slideIndex: number) => {
                    if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

                    if (engine.options.loop) {
                        engine.slideLooper.loopPoints.forEach((loopItem) => {
                            const target = loopItem.target();
                            if (slideIndex === loopItem.index && target !== 0) {
                                const sign = Math.sign(target);
                                if (sign === -1)
                                    diffToTarget = scrollSnap - (1 + scrollProgress);
                                if (sign === 1)
                                    diffToTarget = scrollSnap + (1 - scrollProgress);
                            }
                        });
                    }

                    const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor.current);
                    const scale = numberWithinRange(tweenValue, 0, 1).toString();
                    const node = tweenNodes.current[slideIndex];
                    if (node) node.style.transform = `scale(${scale})`;
                });
            });
        },
        [],
    );

    // ---------- Dot / select sync ----------

    const onSelect = useCallback((api: EmblaCarouselType): void => {
        setSelectedIndex(api.selectedScrollSnap());
    }, []);

    const onInit = useCallback((api: EmblaCarouselType): void => {
        setScrollSnaps(api.scrollSnapList());
    }, []);

    // ---------- Effects ----------

    useEffect(() => {
        if (!emblaApi) return;

        onInit(emblaApi);
        onSelect(emblaApi);
        setTweenNodes(emblaApi);
        setTweenFactor(emblaApi);
        tweenScale(emblaApi);

        emblaApi
            .on("reInit", onInit)
            .on("reInit", onSelect)
            .on("select", onSelect)
            .on("reInit", setTweenNodes)
            .on("reInit", setTweenFactor)
            .on("reInit", tweenScale)
            .on("scroll", tweenScale)
            .on("slideFocus", tweenScale);

        return () => {
            emblaApi
                .off("reInit", onInit)
                .off("reInit", onSelect)
                .off("select", onSelect)
                .off("reInit", setTweenNodes)
                .off("reInit", setTweenFactor)
                .off("reInit", tweenScale)
                .off("scroll", tweenScale)
                .off("slideFocus", tweenScale);
        };
    }, [emblaApi, onInit, onSelect, setTweenNodes, setTweenFactor, tweenScale]);

    useEffect(() => {
        if (prefersReducedMotion) {
            autoplayPlugin.current.stop();
            tweenNodes.current.forEach((node) => {
                if (node) node.style.transform = "";
            });
        }
    }, [prefersReducedMotion]);

    // ---------- Scroll helpers ----------

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
    const scrollTo = useCallback(
        (index: number) => emblaApi?.scrollTo(index),
        [emblaApi],
    );

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent) => {
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                scrollPrev();
            } else if (event.key === "ArrowRight") {
                event.preventDefault();
                scrollNext();
            }
        },
        [scrollPrev, scrollNext],
    );

    return (
        <section
            role="region"
            aria-roledescription="carousel"
            aria-label={`Galerie photos : ${title}`}
            className="focus-within:outline-none"
            onKeyDown={handleKeyDown}
            tabIndex={0}
        >
            {/* Outer clip wrapper — overflow-hidden here lets adjacent slides peek in */}
            <div className="overflow-hidden">
                {/* Embla viewport — no overflow restriction so neighbors are visible */}
                <div ref={emblaRef}>
                {/* Track: negative margin compensates the per-slide gap */}
                <div className="flex -ml-3 touch-pan-y">
                    {images.map((image, index) => (
                        <div
                            key={image.url}
                            role="group"
                            aria-roledescription="slide"
                            aria-label={`Slide ${index + 1} sur ${images.length}`}
                            className="min-w-0 max-sm:flex-[0_0_90%] flex-[0_0_62%] pl-0"
                        >
                            {/* data-embla-tween: receives the scale() transform */}
                            <div
                                data-embla-tween
                                className="relative aspect-video overflow-hidden rounded-2xl will-change-transform"
                            >
                                <Image
                                    src={image.url}
                                    alt={image.alt ?? `Photo ${index + 1} de ${title}`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 90vw, 60vw"
                                    priority={index === 0}
                                    loading={index === 0 ? "eager" : "lazy"}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                </div>
            </div>

            {/* Controls row — arrows (left), dots (right) */}
            <div className="mt-4 flex items-center justify-between px-1">
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={scrollPrev}
                        aria-label="Image précédente"
                        className={NAV_BUTTON_CLASS}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        type="button"
                        onClick={scrollNext}
                        aria-label="Image suivante"
                        className={NAV_BUTTON_CLASS}
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>

                <div
                    role="tablist"
                    aria-label="Sélectionner une slide"
                    className="flex items-center gap-1"
                >
                    {scrollSnaps.map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            role="tab"
                            aria-selected={index === selectedIndex}
                            aria-label={`Aller à la slide ${index + 1}`}
                            aria-current={index === selectedIndex ? "true" : undefined}
                            onClick={() => scrollTo(index)}
                            className="flex h-11 w-11 items-center justify-center"
                        >
                            <span
                                className={`block h-2.5 w-2.5 rounded-full transition-colors duration-200 ${index === selectedIndex
                                        ? "bg-foreground"
                                        : "border border-foreground/40 bg-transparent hover:border-foreground/70"
                                    }`}
                            />
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ---------------------------------------------------------------------------
// Hook: prefers-reduced-motion
// ---------------------------------------------------------------------------

function usePrefersReducedMotion(): boolean {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
        if (typeof window === "undefined") return false;
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    });

    useEffect(() => {
        const mediaQuery = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        );

        const handler = (event: MediaQueryListEvent): void => {
            setPrefersReducedMotion(event.matches);
        };

        mediaQuery.addEventListener("change", handler);
        return () => mediaQuery.removeEventListener("change", handler);
    }, []);

    return prefersReducedMotion;
}
