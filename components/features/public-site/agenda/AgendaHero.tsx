/**
 * @file AgendaHero
 * @description Hero section for the agenda page (compound component).
 * Pure presentational — no hooks, no context dependency.
 */

export function AgendaHero(): React.JSX.Element {
    return (
        <section className="py-8 md:py-16 hero-gradient" aria-labelledby="agenda-heading">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1
                    id="agenda-heading"
                    className="text-4xl md:text-5xl lg:text-7xl text-chart-6 font-semibold leading-none tracking-tight motion-safe:animate-fade-in-up"
                >
                    Evénements
                </h1>

                {/*<p
                    className="text-xs md:text-base text-white/80 motion-safe:animate-fade-in"
                    style={{ animationDelay: "0.2s" }}
                >
                    Retrouvez ici toutes les dates des prochains spectacles et événements.
                </p>*/}
                
            </div>
        </section>
    );
}
