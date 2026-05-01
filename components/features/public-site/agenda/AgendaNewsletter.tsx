"use client";

/**
 * @file AgendaNewsletter
 * @description Newsletter CTA compound component for agenda page.
 * Uses useNewsletterSubscribe hook directly (self-contained state).
 */

import { CheckCircle } from "lucide-react";
import {
    NewsletterForm,
    NewsletterProvider,
    useNewsletterContext,
} from "@/components/features/public-site/home/newsletter";

// ============================================================================
// Internal Sub-Components (not exported)
// ============================================================================

function NewsletterHeading(): React.JSX.Element {
    return (
        <div className="flex gap-6 mx-auto">
            <div className="flex flex-col items-center lg:items-start">
                <p className="text-md lg:text-lg text-white/80">
                    Newsletter
                </p>
                <h2
                    id="newsletter-heading"
                    className="text-3xl md:text-4xl lg:text-5xl font-semibold  text-white leading-tight"
                >
                    Restez dans les coulisses
                </h2>
                <div className="h-px w-24 xl:w-72 bg-white/40 my-6" aria-hidden="true" />
            </div>
        </div>
    );
}

function SubscribedConfirmation(): React.JSX.Element {
    return (
        <div className="motion-safe:animate-fade-in text-center lg:text-left">
            <CheckCircle
                className="h-16 w-16 text-white mx-auto lg:mx-0 mb-6"
                aria-hidden="true"
            />
            <h2 className="text-3xl md:text-4xl font-bold font-sans text-white mb-4">
                Merci pour votre inscription !
            </h2>
            <p className="text-base md:text-lg text-white/90">
                Vous recevrez bientôt nos actualités et nos invitations privilégiées.
            </p>
        </div>
    );
}

function AgendaSubscribeSection(): React.JSX.Element {
    const { errorMessage } = useNewsletterContext();
    return (
        <div className="motion-safe:animate-fade-in-up">
            {errorMessage && (
                <p className="text-red-200 text-sm mb-4" role="alert">
                    {errorMessage}
                </p>
            )}
            <NewsletterForm />
            <p className="text-white/70 text-sm mt-4">
                Nous respectons votre vie privée. Désinscription en 1 clic.
            </p>
        </div>
    );
}

// ============================================================================
// Exported Compound Component
// ============================================================================

function AgendaNewsletterInner(): React.JSX.Element {
    const { isSubscribed } = useNewsletterContext();
    return (
        <section className="py-16 hero-gradient" aria-labelledby="newsletter-heading">
            <div className="max-w-6xl mx-auto grid grid-cols-1 gap-x-8 lg:gap-y-6 lg:grid-cols-[3fr_2fr] px-4">
                <NewsletterHeading />
                <div className="flex mx-auto items-start text-center lg:text-left lg:mt-4">
                    {isSubscribed ? (
                        <SubscribedConfirmation />
                    ) : (
                        <AgendaSubscribeSection />
                    )}
                </div>
            </div>
        </section>
    );
}

export function AgendaNewsletter(): React.JSX.Element {
    return (
        <NewsletterProvider source="agenda">
            <AgendaNewsletterInner />
        </NewsletterProvider>
    );
}
