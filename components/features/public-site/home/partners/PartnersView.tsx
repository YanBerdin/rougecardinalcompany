"use client";

import { LogoCloud } from "@/components/LogoCloud";
import type { PartnersViewProps } from "./types";
import { PartnersSkeleton } from "@/components/skeletons/partners-skeleton";
// import { LogoCloudModel } from "@/components/LogoCloudModel/LogoCloudModel";
/*
function ThankYouMessage() {
    return (
        <div className="text-center px-4 pb-20 md:pb-28">
            <div className="relative group max-w-4xl mx-auto">
*/
{/* Elegant Decorative Shadow Frame */ }
/*
                <div className="absolute inset-0 border border-[var(--primary)] opacity-20 translate-x-4 translate-y-4 rounded-3xl -z-10 transition-transform duration-700 ease-out group-hover:translate-x-0 group-hover:translate-y-0" />

                <div className="relative hero-gradient rounded-3xl p-10 md:p-16 shadow-2xl overflow-hidden border border-white/10 backdrop-blur-sm">
*/
{/* Subtle Textural Overlay */ }
/*
                    <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] mix-blend-overlay" />

                    <div className="relative z-10 flex flex-col items-center">
                        <span className="text-white/60 uppercase tracking-[0.4em] text-[10px] md:text-xs font-semibold mb-6">
                            Reconnaissance
                        </span>

                        <h3 className="text-3xl md:text-4xl font-serif italic mb-6 text-white tracking-tight drop-shadow-md">
                            Un Grand Merci
                        </h3>
*/
{/* Theatrical Divider */ }
/*
                        <div className="flex items-center gap-5 mb-8">
                            <div className="w-12 md:w-20 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-white/60" />
                            <div className="rotate-45 w-2 h-2 border border-white/50" />
                            <div className="w-12 md:w-20 h-[1px] bg-gradient-to-l from-transparent via-white/40 to-white/60" />
                        </div>

                        <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl font-light italic">
                            &ldquo;Grâce au soutien précieux de nos partenaires, nous cultivons
                            l&apos;excellence pour continuer à créer, innover et partager
                            l&apos;émotion pure des arts de la scène.&rdquo;
                        </p>

                        <div className="mt-12 flex flex-col items-center">
                            <div className="w-px h-16 bg-gradient-to-b from-white/30 to-transparent" />
                        </div>
                    </div>
*/
{/* Corner Ornaments */ }
/*
                    <div className="absolute top-6 left-6 w-8 h-8 border-t border-l border-white/20 rounded-tl-lg" />
                    <div className="absolute bottom-6 right-6 w-8 h-8 border-b border-r border-white/20 rounded-br-lg" />
                </div>
            </div>
        </div>
    );
}
*/
export function PartnersView({ partners, isLoading }: PartnersViewProps) {
    if (isLoading) {
        return <PartnersSkeleton />;
    }

    const showTwoRows = partners.length >= 6;

    return (
        <section className="relative z-10 overflow-hidden py-12 md:py-8 lg:py-12">
            <LogoCloud
                partners={partners}
                title="Nos Partenaires"
                subtitle="Ils nous accompagnent et soutiennent notre démarche artistique"
                speed="normal"
                pauseOnHover={true}
                linkable={true}
                twoRows={showTwoRows}
            />
            { /*<LogoCloudModel />*/}
            { /*<ThankYouMessage />*/}
        </section>
    );
}

