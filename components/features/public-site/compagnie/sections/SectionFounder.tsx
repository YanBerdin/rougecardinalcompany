import Image from "next/image";
import type { ReactElement } from "react";

const FOUNDER_NAME = "Florian Chaillot";
const FOUNDER_ROLE = "Metteur en scène & Fondateur";
const FOUNDER_IMAGE_SRC = "https://yvtrlvmbofklefxcxrzv.supabase.co/storage/v1/object/public/medias/team/1776350784063-IMG_3043---retouch-.jpg";

const FOUNDER_BIO: readonly string[] = [
    "Titulaire d'un double master de littérature et de philosophie à la Sorbonne et à la Sorbonne-nouvelle, Florian se destine à la création théâtrale. En tant que metteur en scène, il adapte d'abord le drame indien Sacountala qui connaît une reconnaissance universitaire puis La Farce de Maître Pathelin.",
    "Comme dramaturge, il travaille notamment en 2022 auprès de Lilo Baur pour sa mise en scène de L'Avare à la Comédie-Française et avec Emmanuel Besnault en 2024 pour l'adaptation du Grand Meaulnes à la scène. En 2023 il assiste Sophie Bricaire pour sa mise en scène du gala de l'Opéra de Lorraine à Nancy.",
    "Il est également guide conférencier et régisseur spécialisé dans le surtitrage à la Comédie-Française, afin de permettre à un public malvoyant et malentendant d'assister à des représentations.",
    "Il est également photographe et, en 2025, il expose pour la première fois ses photos à Paris.",
];

type Milestone = { readonly year: string; readonly label: string };

const MILESTONES: readonly Milestone[] = [
    { year: "2022", label: "L'Avare - Comédie-Française" },
    { year: "2023", label: "Gala de l'Opéra de Lorraine" },
    { year: "2024", label: "Le Grand Meaulnes - scène" },
    { year: "2025", label: "Exposition photo - Paris" },
];

export function SectionFounder(): ReactElement {
    return (
        <section
            id="founder"
            aria-labelledby="heading-founder"
            className="py-24 max-sm:py-12 bg-chart-7 overflow-hidden relative"
        >
            <div
                className="absolute inset-0 opacity-5 pointer-events-none mix-blend-overlay"
                aria-hidden="true"
            />
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-12 xl:gap-20 items-start">
                    {/* Portrait + milestones — colonne gauche, masquée sur mobile */}
                    <div className="hidden lg:flex flex-col items-start gap-6">
                        <FounderPortrait />
                        <FounderMilestones />
                    </div>
                    {/* Bio + milestones mobile */}
                    <div className="flex flex-col gap-6">
                        <FounderBio />
                        <div className="lg:hidden">
                            <FounderMilestones />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function FounderPortrait(): ReactElement {
    return (
        <div className="relative w-[280px] sm:w-[320px] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl mt-6">
            <Image
                src={FOUNDER_IMAGE_SRC}
                alt={`Portrait de ${FOUNDER_NAME}, fondateur de la Compagnie Rouge Cardinal`}
                fill
                className="object-cover object-top brightness-[0.85] contrast-[1.1]"
                sizes="(max-width: 640px) 280px, (max-width: 1024px) 320px, 400px"
            />
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)",
                }}
                aria-hidden="true"
            />
            <div
                className="absolute inset-x-0 bottom-0 h-1/4 pointer-events-none"
                style={{
                    background: "linear-gradient(to bottom, transparent, #1C1C1C)",
                }}
                aria-hidden="true"
            />
        </div>
    );
}

function FounderMilestones(): ReactElement {
    return (
        <ul
            className="flex flex-col gap-2 w-full max-w-[320px] lg:max-w-none"
            aria-label="Dates clés"
        >
            {MILESTONES.map(({ year, label }) => (
                <li key={year} className="flex items-center gap-3">
                    <span className="text-gold-text font-bold text-sm tabular-nums w-10 shrink-0">
                        {year}
                    </span>
                    <span className="w-px h-4 bg-white/20 shrink-0" aria-hidden="true" />
                    <span className="text-muted-foreground text-sm">{label}</span>
                </li>
            ))}
        </ul>
    );
}

function FounderBio(): ReactElement {
    return (
        <div className="flex flex-col gap-6">
            <header>
                <p className="text-gold-text text-sm font-semibold tracking-[0.2em] uppercase mb-3">
                    Direction artistique
                </p>
                <h2
                    id="heading-founder"
                    className="text-4xl md:text-5xl lg:text-6xl font-bold text-card-foreground leading-tight [font-family:var(--font-playfair)]"
                >
                    {FOUNDER_NAME}
                </h2>
                <p className="text-muted-foreground mt-2 font-light text-xs md:text-base">{FOUNDER_ROLE}</p>
            </header>
            <div className="flex items-center gap-3" aria-hidden="true">
                <span className="h-px w-12 bg-gold-text" />
                <span className="h-px flex-1 bg-white/10" />
            </div>
            <div className="space-y-5">
                {FOUNDER_BIO.map((paragraph, index) => (
                    <p
                        key={index}
                        className="text-card-secondary text-sm md:text-base lg:text-lg leading-relaxed"
                    >
                        {paragraph}
                    </p>
                ))}
            </div>
        </div>
    );
}
