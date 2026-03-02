import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CalendarX,
  Clock,
  ExternalLink,
  MapPin,
  Pencil,
  Tag,
  Ticket,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getEventStatusBadge } from "@/lib/tables/event-table-helpers";
import type { EventClientDTO } from "@/lib/types/admin-agenda-client";

// ============================================================================
// Helpers
// ============================================================================

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(time: string | null): string | null {
  if (!time) return null;
  return time.slice(0, 5);
}

function formatPrice(priceCents: number | null): string | null {
  if (priceCents === null) return null;
  if (priceCents === 0) return "Gratuit";
  return (priceCents / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

// ============================================================================
// Sub-components
// ============================================================================

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-muted-foreground shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
          {label}
        </p>
        <div className="text-sm font-medium mt-0.5 break-words">{value}</div>
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <section aria-labelledby={`section-${title}`}>
      <h2
        id={`section-${title}`}
        className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4"
      >
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

// ============================================================================
// Main Component
// ============================================================================

interface EventDetailProps {
  event: EventClientDTO;
}

export function EventDetail({ event }: EventDetailProps) {
  const formattedDateDebut = formatDate(event.date_debut);
  const formattedDateFin = event.date_fin ? formatDate(event.date_fin) : null;
  const formattedStartTime = formatTime(event.start_time);
  const formattedEndTime = formatTime(event.end_time);
  const formattedPrice = formatPrice(event.price_cents);

  const metaDateCreated = new Date(event.created_at).toLocaleString("fr-FR");
  const metaDateUpdated = new Date(event.updated_at).toLocaleString("fr-FR");

  return (
    <div className="container max-w-5xl max-sm:p-2 p-8 lg:p-16 space-y-8 bg-card">
      {/* ── Header ── */}
      <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-8">
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link href="/admin/agenda">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Retour à la liste
            </Link>
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold leading-tight">
            {event.spectacle_titre ?? "Événement"}
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            {getEventStatusBadge(event.status)}
          </div>
        </div>

        <Button asChild className="shrink-0">
          <Link href={`/admin/agenda/${event.id}/edit`}>
            <Pencil className="h-4 w-4 mr-2" />
            Modifier
          </Link>
        </Button>
      </div>

      <Separator />

      {/* ── Details Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Dates & Horaires */}
        <Section title="Dates & Horaires">
          <InfoRow
            icon={<Calendar className="h-4 w-4" />}
            label="Date de début"
            value={
              <>
                <span className="capitalize">{formattedDateDebut}</span>
                {formattedStartTime && (
                  <span className="text-muted-foreground ml-2">
                    à {formattedStartTime}
                  </span>
                )}
              </>
            }
          />
          {(formattedDateFin || formattedEndTime) && (
            <InfoRow
              icon={<CalendarX className="h-4 w-4" />}
              label="Date de fin"
              value={
                <>
                  {formattedDateFin && (
                    <span className="capitalize">{formattedDateFin}</span>
                  )}
                  {formattedEndTime && (
                    <span className="text-muted-foreground ml-2">
                      à {formattedEndTime}
                    </span>
                  )}
                </>
              }
            />
          )}
          {!formattedDateFin && formattedEndTime && (
            <InfoRow
              icon={<Clock className="h-4 w-4" />}
              label="Heure de fin"
              value={formattedEndTime}
            />
          )}
        </Section>

        {/* Lieu */}
        <Section title="Lieu">
          <InfoRow
            icon={<MapPin className="h-4 w-4" />}
            label="Salle"
            value={
              event.lieu_nom ? (
                <>
                  {event.lieu_nom}
                  {event.lieu_ville && (
                    <span className="text-muted-foreground ml-1">
                      · {event.lieu_ville}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground italic">Non renseigné</span>
              )
            }
          />
        </Section>

        {/* Billetterie */}
        <Section title="Billetterie">
          {formattedPrice !== null && (
            <InfoRow
              icon={<Ticket className="h-4 w-4" />}
              label="Tarif"
              value={formattedPrice}
            />
          )}
          {event.capacity !== null && (
            <InfoRow
              icon={<Users className="h-4 w-4" />}
              label="Capacité"
              value={`${event.capacity} places`}
            />
          )}
          {event.ticket_url && (
            <InfoRow
              icon={<ExternalLink className="h-4 w-4" />}
              label="Lien billetterie"
              value={
                <a
                  href={event.ticket_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-primary break-all"
                >
                  {event.ticket_url}
                </a>
              }
            />
          )}
          {formattedPrice === null && event.capacity === null && !event.ticket_url && (
            <p className="text-sm text-muted-foreground italic">
              Aucune information de billetterie.
            </p>
          )}
        </Section>

        {/* Métadonnées */}
        <Section title="Métadonnées">
          <InfoRow
            icon={<Tag className="h-4 w-4" />}
            label="Identifiant"
            value={
              <Badge variant="outline" className="font-mono text-xs">
                #{event.id}
              </Badge>
            }
          />
          <InfoRow
            icon={<Clock className="h-4 w-4" />}
            label="Créé le"
            value={metaDateCreated}
          />
          <InfoRow
            icon={<Clock className="h-4 w-4" />}
            label="Modifié le"
            value={metaDateUpdated}
          />
        </Section>
      </div>
    </div>
  );
}
