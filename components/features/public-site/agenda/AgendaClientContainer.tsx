"use client";

/**
 * @file AgendaClientContainer
 * @description Composition root for the agenda feature.
 * Wraps compound components with AgendaProvider.
 */

import { AgendaProvider } from "./AgendaContext";
import { AgendaHero } from "./AgendaHero";
import { AgendaFilters } from "./AgendaFilters";
import { AgendaEventList } from "./AgendaEventList";
import { AgendaNewsletter } from "./AgendaNewsletter";
import type { AgendaClientContainerProps } from "./types";

export default function AgendaClientContainer({
  events,
  eventTypes,
  showNewsletterSection = false,
}: AgendaClientContainerProps): React.JSX.Element {
  return (
    <AgendaProvider events={events} eventTypes={eventTypes}>
      <div className="pt-16">
        <AgendaHero />
        <section className="py-16 bg-chart-7">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <AgendaFilters />
            <AgendaEventList />
          </div>
        </section>
        <div className="w-full h-16 bg-chart-7" aria-hidden="true" />
        {showNewsletterSection && <AgendaNewsletter />}
        <div className="w-full h-32 bg-chart-7" aria-hidden="true" />
      </div>
    </AgendaProvider>
  );
}
