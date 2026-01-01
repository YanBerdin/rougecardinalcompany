"use client";

import { useMemo, useState } from "react";
import { useNewsletterSubscribe } from "@/lib/hooks/useNewsletterSubscribe";
import { AgendaView } from "./AgendaView";
import type { Event, EventType } from "./types";

type Props = {
  events: Event[];
  eventTypes: EventType[];
  showNewsletterSection?: boolean;
};

export default function AgendaClientContainer({ events, eventTypes, showNewsletterSection = false }: Props) {
  const [filterType, setFilterType] = useState<string>("all");

  const {
    email,
    isSubscribed,
    isLoading: newsletterLoading,
    errorMessage,
    handleEmailChange,
    handleSubmit,
  } = useNewsletterSubscribe({ source: "agenda" });

  const filteredEvents = useMemo(() => {
    if (filterType === "all") return events;
    return events.filter((e) => e.type === filterType);
  }, [events, filterType]);

  const generateCalendarFile = (event: Event) => {
    const startDate = new Date(`${event.date}T${event.time.replace("h", ":")}`);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    const formatDate = (date: Date) =>
      date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Rouge-Cardinal//FR",
      "BEGIN:VEVENT",
      `UID:${event.id}@rouge-cardinal.fr`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.title} - Compagnie Rouge-Cardinal`,
      `LOCATION:${event.venue}, ${event.address}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${event.title.replace(/\s+/g, "-")}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <AgendaView
      events={filteredEvents}
      eventTypes={eventTypes}
      filterType={filterType}
      setFilterType={setFilterType}
      generateCalendarFile={generateCalendarFile}
      loading={false}
      showNewsletterSection={showNewsletterSection}
      newsletterEmail={email}
      newsletterIsSubscribed={isSubscribed}
      newsletterIsLoading={newsletterLoading}
      newsletterErrorMessage={errorMessage}
      onNewsletterEmailChange={handleEmailChange}
      onNewsletterSubmit={handleSubmit}
    />
  );
}
