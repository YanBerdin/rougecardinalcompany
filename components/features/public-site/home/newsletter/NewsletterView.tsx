"use client";

import { Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NewsletterSkeleton } from "@/components/skeletons/newsletter-skeleton";
import { NewsletterFormProps, NewsletterViewProps } from "./types";

export function NewsletterForm({
  email,
  isLoading,
  onEmailChange,
  onSubmit,
}: NewsletterFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
      <label htmlFor="email-address" className="sr-only">
        Adresse email
      </label>
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50 pointer-events-none" />
        <Input
          id="email-address"
          name="email"
          type="email"
          required
          placeholder="Votre email"
          autoComplete="email"
          value={email}
          onChange={onEmailChange}
          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white transition-all duration-200"
        />
      </div>
      <Button
        type="submit"
        variant="outline"
        size="lg"
        disabled={isLoading}
        className="bg-chart-6 border-white/30 hover:text-white hover:backdrop-blur-md hover:bg-white/30 text-red-800 hover:scale-95 active:scale-100 transition-all duration-200 shadow-lg whitespace-nowrap disabled:opacity-50 disabled:hover:scale-90"
      >
        {isLoading ? "Inscription..." : "S'inscrire"}
      </Button>
    </form>
  );
}

// Confirmation d'inscription
function SubscriptionSuccess() {
  return (
    <div className="animate-fade-in text-center lg:text-left">
      <CheckCircle className="h-16 w-16 text-white mx-auto lg:mx-0 mb-6" />
      <h2 className="text-3xl font-bold text-white mb-4">
        Merci pour votre inscription !
      </h2>
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
        {/* Colonne gauche */}
        <dl className="flex gap-6 mx-auto">
          <div className="flex flex-col items-center lg:items-start">
            <p className="text-md md:text-lg lg:text-xl text-white/80 ">
              Dernier acte : Newsletter
            </p>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white leading-tight">
              Restez dans les coulisses
            </h3>
            <div className="h-px w-24 xl:w-72 bg-white/40 my-6"></div>
          </div>
        </dl>

        {/* Colonne droite */}
        <div className="flex mx-auto items-start text-center lg:text-left lg:mt-4">
          {isSubscribed ? (
            <SubscriptionSuccess />
          ) : (
            <div className="animate-fade-in-up">

              {errorMessage && (
                <p className="text-red-200 text-sm mb-4">{errorMessage}</p>
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
