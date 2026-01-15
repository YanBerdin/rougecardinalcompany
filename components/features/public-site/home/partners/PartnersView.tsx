"use client";

import { LogoCloud } from "@/components/LogoCloud";
import type { PartnersViewProps } from "./types";
import { PartnersSkeleton } from "@/components/skeletons/partners-skeleton";
import { LogoCloudModel } from "@/components/LogoCloudModel/LogoCloud";

function ThankYouMessage() {
    return (
        <div className="text-center px-4 pb-16 md:pb-20">
            <div className="relative hero-gradient rounded-3xl p-8 md:p-10 max-w-4xl mx-auto shadow-xl overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-2xl md:text-3xl font-extrabold mb-4 md:mb-6 text-white">
                        Un Grand Merci
                    </h3>
                    <p className="text-base md:text-lg text-white/90 leading-relaxed max-w-3xl mx-auto">
                        Grâce au soutien de nos partenaires, nous pouvons
                        continuer à créer, innover et partager notre passion
                        pour les arts de la scène.
                    </p>
                    <div className="mt-6 md:mt-8 flex justify-center">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-0.5 bg-white/30 rounded-full" />
                            <div className="w-2 h-2 bg-white/30 rounded-full" />
                            <div className="w-12 h-0.5 bg-white/30 rounded-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function PartnersView({ partners, isLoading }: PartnersViewProps) {
    if (isLoading) {
        return <PartnersSkeleton />;
    }

    const showTwoRows = partners.length >= 6;

    return (
        <section className="relative overflow-hidden bg-background">
            <LogoCloud
                partners={partners}
                title="Nos Partenaires"
                subtitle="Ils nous accompagnent et soutiennent notre démarche artistique"
                speed="normal"
                pauseOnHover={true}
                linkable={true}
                twoRows={showTwoRows}
            />
            <LogoCloudModel />
            <ThankYouMessage />
        </section>
    );
}

