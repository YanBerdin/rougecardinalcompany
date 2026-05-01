/**
 * @file AccreditationSection — Demande d'accréditation presse pour les spectacles
 */
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AccreditationSection() {
  return (
    <section
      aria-label="Demande d'accréditation"
      className="py-16 hero-gradient"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white/90 animate-fade-in-up">
          Vous êtes journaliste ?
        </h2>
        <p className="text-base lg:text-lg text-white/70 mb-8">
          Téléchargez notre dossier de presse ou contactez directement notre attaché·e de presse pour toute demande d&apos;accréditation ou d&apos;interview.
        </p>

        <Button
          variant="outline"
          size="default"
          className="bg-white/30 border-white/50 text-white backdrop-blur-md hover:bg-white/90 hover:text-primary transition-all duration-300 shadow-lg border"
          asChild
        >
          <Link href="/contact" aria-label="Faire une demande d'accréditation presse">
            Nous contacter
          </Link>
        </Button>
      </div>
    </section>
  );
}
