"use client";

import { CalendarIcon } from "lucide-react";
import { AgendaProvider } from "./AgendaContext";
import { AgendaHero } from "./AgendaHero";
import { AgendaFilters } from "./AgendaFilters";
import { AgendaEventList } from "./AgendaEventList";
import { AgendaNewsletter } from "./AgendaNewsletter";
import { CalendarView } from "./calendar";
import type { AgendaClientContainerProps } from "./types";

export default function AgendaClientContainer({
  events,
  eventTypes,
  showNewsletterSection = false,
  calendarEvents = [],
}: AgendaClientContainerProps): React.JSX.Element {
  return (
    <AgendaProvider events={events} eventTypes={eventTypes} calendarEvents={calendarEvents}>
      <div className="max-sm:pt-12 pt-16">
        <AgendaHero />
        <section className="py-8 md:py-12 bg-chart-7" data-testid="agenda-event-list">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[300px_1fr] gap-10 items-start">

              {/* Sidebar */}
              <aside className="space-y-5">
                <div className="rounded-sm border border-border bg-card p-4">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <CalendarIcon className="size-4 text-gold" aria-hidden="true" />
                    <h2 className="font-semibold text-base">Calendrier</h2>
                  </div>
                  <CalendarView />
                </div>
                <div className="rounded-sm border border-border bg-card p-4">
                  <AgendaFilters />
                </div>
              </aside>

              {/* Liste événements */}
              <div>
                <AgendaEventList />
              </div>

            </div>
          </div>
        </section>
        <div className="w-full h-16 bg-chart-7" aria-hidden="true" />
        {showNewsletterSection && <AgendaNewsletter />}
        <div className="w-full h-24 bg-chart-7" aria-hidden="true" />
      </div>
    </AgendaProvider>
  );
}
