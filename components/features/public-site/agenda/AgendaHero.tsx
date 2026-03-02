/**
 * @file AgendaHero
 * @description Hero section for the agenda page (compound component).
 * Pure presentational — no hooks, no context dependency.
 */

export function AgendaHero(): React.JSX.Element {
    return (
        <section className="py-16 hero-gradient" aria-labelledby="agenda-heading">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1
                    id="agenda-heading"
                    className="text-4xl md:text-5xl lg:text-6xl text-white font-bold mb-6 animate-fade-in-up"
                >
                    Agenda
                </h1>
                <p
                    className="text-lg md:text-xl lg:text-2xl text-white/80 opacity-90 animate-fade-in"
                    style={{ animationDelay: "0.2s" }}
                >
                    Retrouvez-nous sur scène
                </p>
            </div>
        </section>
    );
}
