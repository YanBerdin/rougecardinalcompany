/**
 * @file AgendaHero
 * @description Hero section for the agenda page (compound component).
 * Pure presentational — no hooks, no context dependency.
 */

export function AgendaHero(): React.JSX.Element {
    return (
        <section className="py-6 md:py-12 hero-gradient" aria-labelledby="agenda-heading">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1
                    id="agenda-heading"
                    className="text-3xl md:text-4xl lg:text-5xl text-white font-bold motion-safe:animate-fade-in-up mb-4"
                >
                    Agenda
                </h1>
                <p
                    className="text-base md:text-lg text-white/80 opacity-90 motion-safe:animate-fade-in"
                    style={{ animationDelay: "0.2s" }}
                >
                    Retrouvez-nous sur scène
                </p>
            </div>
        </section>
    );
}
