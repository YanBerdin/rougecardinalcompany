/**
 * @file HeroSection — Bandeau héroïque de la page Presse et médias
 */
export function HeroSection() {
  return (
    <section aria-label="Presse et médias" className="py-8 md:py-16 hero-gradient">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold animate-fade-in-up text-white">
          La presse en parle
        </h1>
        {/*<p
          className="mt-6 max-sm:text-base lg:text-xl opacity-90 animate-fade-in text-white/80"
          style={{ animationDelay: "0.2s" }}
        >
          Contact, revue de presse et ressources pour les médias
        </p>*/}

      </div>
    </section>
  );
}
