/**
 * @file HeroSection — Bandeau héroïque de la page Espace Média
 */
export function HeroSection() {
  return (
    <section aria-label="Espace Média" className="py-16 hero-gradient">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl lg:text-6xl font-bold mb-6 animate-fade-in-up text-white">
          Espace Média
        </h1>
        <p
          className="text-lg md:text-xl lg:text-2xl opacity-90 animate-fade-in text-white/80"
          style={{ animationDelay: "0.2s" }}
        >
          Ressources et actualités pour les médias
        </p>
      </div>
    </section>
  );
}
