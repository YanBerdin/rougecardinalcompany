"use client";

import { CheckCircle } from "lucide-react";
import { NewsletterSkeleton } from "@/components/skeletons/newsletter-skeleton";
import { NewsletterViewProps } from "./types";

// ré-export pour la rétrocompatibilité des imports existants
export { NewsletterForm } from "./NewsletterForm";

function SubscriptionSuccess() {
  return (
    <div className="animate-fade-in text-center lg:text-left">
      <CheckCircle className="h-16 w-16 text-white mx-auto lg:mx-0 mb-6" aria-hidden="true" />
      <h2 className="text-3xl font-semibold font-sans text-white mb-4">Merci pour votre inscription !</h2>
      <p className="text-xl text-white/90">
        Vous recevrez bientôt nos actualités et nos invitations privilégiées.
      </p>
    </div>
  );
}

export function NewsletterView({
  isSubscribed,
  isInitialLoading,
  errorMessage,
  children,
}: NewsletterViewProps) {
  if (isInitialLoading) {
    return <NewsletterSkeleton />;
  }

  return (
    <section className="py-24 hero-gradient">
      <div className="max-w-7xl mx-auto grid grid-cols-1 gap-x-8 lg:gap-y-6 lg:grid-cols-[3fr_2fr] max-sm:px-4">
        <dl className="flex gap-6 mx-auto">
          <div className="flex flex-col items-center lg:items-start">
            <p className="text-md md:text-lg lg:text-xl text-white/80">
              Dernier acte : Newsletter
            </p>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-semibold font-sans text-white leading-tight">
              Restez dans les coulisses
            </h3>
            <div className="h-px w-24 xl:w-72 bg-white/40 my-6" aria-hidden="true" />
          </div>
        </dl>

        <div className="flex mx-auto items-start text-center lg:text-left lg:mt-4">
          {isSubscribed ? (
            <SubscriptionSuccess />
          ) : (
            <div className="animate-fade-in-up">
              {errorMessage && (
                <p className="text-red-200 text-sm mb-4" role="alert">{errorMessage}</p>
              )}
              {children}
              <p className="text-white/70 text-sm mt-4">
                Nous respectons votre vie privée. Désinscription en 1 clic.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
