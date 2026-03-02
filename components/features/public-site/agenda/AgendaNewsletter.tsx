"use client";

/**
 * @file AgendaNewsletter
 * @description Newsletter CTA compound component for agenda page.
 * Uses useNewsletterSubscribe hook directly (self-contained state).
 */

import { CheckCircle } from "lucide-react";
import { useNewsletterSubscribe } from "@/lib/hooks/useNewsletterSubscribe";
import { NewsletterForm } from "@/components/features/public-site/home/newsletter";

// ============================================================================
// Internal Sub-Components (not exported)
// ============================================================================

function NewsletterHeading(): React.JSX.Element {
    return (
        <div className="flex gap-6 mx-auto">
            <div className="flex flex-col items-center lg:items-start">
                <p className="text-md lg:text-lg text-white/80">
                    Dernier acte : Newsletter
                </p>
                <h2
                    id="newsletter-heading"
                    className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white leading-tight"
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
        <div className="animate-fade-in text-center lg:text-left">
            <CheckCircle
                className="h-16 w-16 text-white mx-auto lg:mx-0 mb-6"
                aria-hidden="true"
            />
            <h3 className="text-3xl font-bold text-white mb-4">
                Merci pour votre inscription !
            </h3>
            <p className="text-xl text-white/90">
                Vous recevrez bientôt nos actualités et nos invitations privilégiées.
            </p>
        </div>
    );
}

interface SubscribeFormSectionProps {
    readonly email: string;
    readonly isLoading: boolean;
    readonly errorMessage: string | null;
    readonly onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    readonly onSubmit: (e?: React.FormEvent) => Promise<void>;
}

function SubscribeFormSection({
    email,
    isLoading,
    errorMessage,
    onEmailChange,
    onSubmit,
}: SubscribeFormSectionProps): React.JSX.Element {
    return (
        <div className="animate-fade-in-up">
            {errorMessage && (
                <p className="text-red-200 text-sm mb-4" role="alert">
                    {errorMessage}
                </p>
            )}
            <NewsletterForm
                email={email}
                isLoading={isLoading}
                isSubscribed={false}
                errorMessage={errorMessage}
                onEmailChange={onEmailChange}
                onSubmit={onSubmit}
            />
            <p className="text-white/70 text-sm mt-4">
                Nous respectons votre vie privée. Désinscription en 1 clic.
            </p>
        </div>
    );
}

// ============================================================================
// Exported Compound Component
// ============================================================================

export function AgendaNewsletter(): React.JSX.Element {
    const {
        email,
        isSubscribed,
        isLoading,
        errorMessage,
        handleEmailChange,
        handleSubmit,
    } = useNewsletterSubscribe({ source: "agenda" });

    return (
        <section className="py-16 hero-gradient" aria-labelledby="newsletter-heading">
            <div className="max-w-6xl mx-auto grid grid-cols-1 gap-x-8 lg:gap-y-6 lg:grid-cols-[3fr_2fr] px-4">
                <NewsletterHeading />
                <div className="flex mx-auto items-start text-center lg:text-left lg:mt-4">
                    {isSubscribed ? (
                        <SubscribedConfirmation />
                    ) : (
                        <SubscribeFormSection
                            email={email}
                            isLoading={isLoading}
                            errorMessage={errorMessage}
                            onEmailChange={handleEmailChange}
                            onSubmit={handleSubmit}
                        />
                    )}
                </div>
            </div>
        </section>
    );
}
