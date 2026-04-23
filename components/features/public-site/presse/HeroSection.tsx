/**
 * @file HeroSection — Bandeau héroïque de la page Espace Média
 */
export function HeroSection() {
  return (
    <section aria-label="Espace Média" className="max-sm:py-8 py-10 hero-gradient">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold animate-fade-in-up text-white">
          Espace Média
        </h1>
        {/*        <p
          className="max-sm:text-base md:text-xl lg:text-2xl opacity-90 animate-fade-in text-white/80"
          style={{ animationDelay: "0.2s" }}
        >
          Ressources et actualités pour les médias
        </p>
        */}
      </div>
    </section>
  );
}
