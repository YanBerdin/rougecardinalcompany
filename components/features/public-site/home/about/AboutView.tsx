import { AboutProps } from "./types";
import { AboutContent } from "./AboutContent";

export function AboutView({ stats, content }: AboutProps) {
  return (
    <section className="py-24 bg-chart-7" aria-labelledby="about-heading">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <AboutContent stats={stats} content={content} />
      </div>
    </section>
  );
}
