/**
 * @file AccreditationSection — Demande d'accréditation presse pour les spectacles
 */
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AccreditationSection() {
  return (
    <section
      aria-label="Demande d'accréditation"
      className="py-24 hero-gradient"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-4xl font-semibold font-sans mb-6 text-white animate-fade-in-up">
          Demande d&apos;Accréditation
        </h2>
        <p className="text-lg md:text-xl lg:text-2xl text-white/80 mb-8">
          Journalistes et critiques, demandez votre accréditation pour nos
          spectacles
        </p>
        <div className="text-md md:text-lg lg:text-xl space-y-4 text-white/80 mb-8">
          <p>
            Pour toute demande d&apos;accréditation, merci d&apos;envoyer un
            email à
            <strong className="text-white"> presse@rouge-cardinal.fr</strong>{" "}
            en précisant :
          </p>
          <ul className="list-disc list-inside text-left max-w-md mx-auto space-y-2">
            <li>Votre nom et média</li>
            <li>Le spectacle qui vous intéresse</li>
            <li>La date souhaitée</li>
            <li>Votre carte de presse</li>
          </ul>
        </div>
        <Button
          variant="outline"
          size="lg"
          className="bg-white/30 border-white/50 text-white backdrop-blur-md hover:bg-sidebar-primary-foreground hover:text-primary transition-all duration-300 shadow-lg border"
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
