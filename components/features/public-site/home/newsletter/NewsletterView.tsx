"use client";

import { Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NewsletterSkeleton } from "@/components/skeletons/newsletter-skeleton";
import { NewsletterFormProps, NewsletterViewProps } from "./types";

// Composant de formulaire d'inscription
export function NewsletterForm({
  email,
  isLoading,
  errorMessage,
  onEmailChange,
  onSubmit,
}: NewsletterFormProps) {
  return (
    <form onSubmit={onSubmit} className="max-w-md mx-auto">
      <div className="flex gap-3">
        <Input
          type="email"
          placeholder="Votre email pour ne rien manquer"
          value={email}
          onChange={onEmailChange}
          required
          className="bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:bg-white/20"
        />
        <Button
          type="submit"
          variant="outline"
          disabled={isLoading}
          className="bg-white/30 border-white/30 text-white backdrop-blur-md hover:bg-white hover:text-black transition-all duration-300 shadow-lg whitespace-nowrap"
        >
          {isLoading ? "Inscription..." : "S'inscrire"}
        </Button>
      </div>
      {errorMessage && (
        <p className="text-red-200 text-sm mt-3">{errorMessage}</p>
      )}
      <p className="text-white/70 text-sm mt-4">
        Nous respectons votre vie privée. Pas de spam, désinscription en 1 clic.
      </p>
    </form>
  );
}

// Composant de confirmation d'inscription
function SubscriptionSuccess() {
  return (
    <div className="animate-fade-in">
      <CheckCircle className="h-16 w-16 text-white mx-auto mb-6" />
      <h2 className="text-3xl font-bold text-white mb-4">
        Merci pour votre inscription !
      </h2>
      <p className="text-xl text-white/90">
        Vous recevrez bientôt nos actualités et nos invitations privilégiées.
      </p>
    </div>
  );
}

// Composant principal Newsletter (Dumb)
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
    <section className="py-20 hero-gradient">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {isSubscribed ? (
          <SubscriptionSuccess />
        ) : (
          <div className="animate-fade-in-up">
            <Mail className="h-12 w-12 text-white mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Restez Informé
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Inscrivez-vous à notre newsletter pour recevoir nos actualités,
              invitations aux premières et offres exclusives.
            </p>
            {errorMessage && (
              <p className="text-red-200 text-sm mb-4">{errorMessage}</p>
            )}
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
