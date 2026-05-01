/**
 * @file AccreditationSection — Demande d'accréditation presse pour les spectacles
 */
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AccreditationSection() {
  return (
    <section
      aria-label="Demande d'accréditation"
      className="max-sm:py-12 py-24 hero-gradient"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-6 text-white/90 animate-fade-in-up">
          Demande d&apos;Accréditation
        </h2>
        <p className="text-base md:text-lg lg:text-xl text-white/70 mb-8">
          Journalistes et critiques, demandez votre accréditation pour nos
          spectacles
        </p>
        <div className="text-sm md:text-lg lg:text-xl space-y-4 text-white/80 mb-8 text-left">
          <p>
            Pour toute demande d&apos;accréditation, merci d&apos;envoyer un
            email à
            <strong className="text-white"> presse@rouge-cardinal.fr</strong>{" "}
            en précisant :
          </p>
          <ul className="list-disc list-inside text-left text-sm md:text-md max-w-md mx-auto space-y-2 ml-6">
            <li>Votre nom et média</li>
            <li>Le spectacle qui vous intéresse</li>
            <li>La date souhaitée</li>
            <li>Votre carte de presse</li>
          </ul>
        </div>
        <Button
          variant="outline"
          size="default"
          className="bg-white/30 border-white/50 text-white backdrop-blur-md hover:bg-white/90 hover:text-primary transition-all duration-300 shadow-lg border"
          asChild
        >
          <Link href="/contact" aria-label="Faire une demande d'accréditation presse">
            Faire une demande
          </Link>
        </Button>
      </div>
    </section>
  );
}
