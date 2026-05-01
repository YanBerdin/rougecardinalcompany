"use server";
import "server-only";
import { cache } from "react";
import { createClient } from "@/supabase/server";
import {
  EventSchema,
  type Event as AgendaEvent,
  type EventType as EventTypeOption,
} from "@/lib/schemas/agenda";
import {
  type DALResult,
  buildMediaPublicUrl,
  formatTime,
  toISODateString,
} from "@/lib/dal/helpers";

// ============================================================================
// Internal Types (Supabase response shape)
// ============================================================================

type SupabaseEventRow = {
  id: number;
  date_debut: string;
  date_fin?: string | null;
  start_time?: string | null;
  status?: string | null;
  ticket_url?: string | null;
  image_url?: string | null;
  genres?: string[] | null;
  spectacles?: {
    title?: string | null;
    slug?: string | null;
    image_url?: string | null;
    genre?: string | null;
    status?: string | null;
    public?: boolean | null;
    spectacles_medias?: Array<{
      type?: string | null;
      medias?: { storage_path?: string | null } | null;
    }> | null;
  } | null;
  lieux?: {
    nom?: string | null;
    adresse?: string | null;
    ville?: string | null;
    code_postal?: string | null;
  } | null;
};

// ============================================================================
// Helper Functions (domain-specific)
// ============================================================================

/**
 * Build address string from lieu parts
 */
function buildAddress(lieu?: SupabaseEventRow["lieux"]): string {
  if (!lieu) return "";
  const { adresse, code_postal, ville } = lieu;
  const cityPart = [code_postal, ville].filter(Boolean).join(" ");
  return [adresse, cityPart].filter(Boolean).join(", ");
}

/**
 * Map Supabase row to AgendaEvent with Zod validation
 */
function mapRowToEventDTO(row: SupabaseEventRow): AgendaEvent {
  const dateDebut = new Date(row.date_debut);

  const rawEvent = {
    id: row.id,
    title: row.spectacles?.title ?? "Événement",
    spectacleSlug: row.spectacles?.slug ?? null,
    date: toISODateString(dateDebut),
    time: formatTime(dateDebut, row.start_time),
    venue: row.lieux?.nom ?? "Lieu à venir",
    address: buildAddress(row.lieux),
    genres: row.genres ?? [],
    genre: row.spectacles?.genre ?? null,
    status: row.status ?? "programmé",
    ticketUrl: row.ticket_url ?? null,
    image: (() => {
      const poster = row.spectacles?.spectacles_medias?.find(
        (sm) => sm.type === "poster"
      );
      if (poster?.medias?.storage_path) {
        return (
          buildMediaPublicUrl(poster.medias.storage_path) ??
          row.spectacles?.image_url ??
          "/logo-florian.png"
        );
      }
      return row.spectacles?.image_url ?? "/logo-florian.png";
    })(),
  };

  // Validate with Zod schema
  return EventSchema.parse(rawEvent);
}

// ============================================================================
// DAL Functions
// ============================================================================

/**
 * Fetch upcoming events from agenda
 *
 * Wrapped with React cache() for intra-request deduplication.
 *
 * @param limit - Maximum number of events to return (default: 10)
 * @returns DALResult with array of AgendaEvent
 */
export const fetchUpcomingEvents = cache(
  async (limit = 10): Promise<DALResult<AgendaEvent[]>> => {
    try {
      const supabase = await createClient();

      const today = new Date().toISOString();

      const { data, error } = await supabase
        .from("evenements")
        .select(
          `id, date_debut, date_fin, start_time, status, ticket_url, image_url, genres,
         spectacles (title, slug, image_url, genre, status, public, spectacles_medias (type, medias (storage_path))),
         lieux (nom, adresse, ville, code_postal)`
        )
        .neq("status", "archived")
        // Afficher les événements dont la date de fin est >= aujourd'hui,
        // ou dont la date de début est >= aujourd'hui si date_fin est null.
        .or(`date_fin.gte.${today},and(date_fin.is.null,date_debut.gte.${today})`)
        .order("date_debut", { ascending: true })
        .limit(limit);

      if (error) {
        console.error("[DAL] fetchUpcomingEvents error:", error);
        return {
          success: false,
          error: `[ERR_AGENDA_001] Failed to fetch events: ${error.message}`,
        };
      }

      const events = (data ?? [])
        .filter((row) => {
          const spectacle = (row as SupabaseEventRow).spectacles;
          // Exclude events where spectacle is null (RLS hides private spectacles
          // via LEFT JOIN — null?.public !== false would incorrectly pass),
          // not public, or still in draft status.
          return (
            spectacle?.public === true &&
            spectacle.status !== "draft"
          );
        })
        .map((row) => mapRowToEventDTO(row as SupabaseEventRow));

      return { success: true, data: events };
    } catch (err: unknown) {
      console.error("[DAL] fetchUpcomingEvents exception:", err);
      return {
        success: false,
        error: `[ERR_AGENDA_002] ${err instanceof Error ? err.message : "Unknown error"}`,
      };
    }
  }
);

/**
 * Fetch distinct event types from database
 *
 * Wrapped with React cache() for intra-request deduplication.
 *
 * @returns DALResult with array of EventTypeOption for filters
 */
export const fetchEventTypes = cache(
  async (): Promise<DALResult<EventTypeOption[]>> => {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("evenements")
        .select("genres, spectacles (genre)")
        .neq("status", "archived")
        .limit(200);

      if (error) {
        console.error("[DAL] fetchEventTypes error:", error);
        return {
          success: false,
          error: `[ERR_AGENDA_003] Failed to fetch event types: ${error.message}`,
        };
      }

      // Normalize all genre values to lowercase and deduplicate by that key.
      // This merges e.g. "spectacle" (from evenements.genres) and "Spectacle"
      // (from spectacles.genre) into one option, preventing duplicate labels.
      const seenLower = new Set<string>();
      for (const row of data ?? []) {
        for (const t of row.genres ?? []) {
          seenLower.add(t.toLowerCase());
        }
        const genre = (row.spectacles as { genre?: string | null } | null)?.genre;
        if (genre) seenLower.add(genre.toLowerCase());
      }

      const baseTypes =
        seenLower.size > 0
          ? Array.from(seenLower)
          : ["théâtre", "photographie", "atelier"];

      const capitalizeFirst = (str: string): string =>
        str.charAt(0).toUpperCase() + str.slice(1);

      const options: EventTypeOption[] = [
        { value: "all", label: "Tous les événements" },
        ...baseTypes.map((v) => {
          // v is already lowercase; capitalize only for display
          const capitalized = capitalizeFirst(v);
          return {
            value: v, // lowercase key — matches case-insensitive filter logic
            label: capitalized + (capitalized.endsWith("s") ? "" : "s"),
          };
        }),
      ];

      return { success: true, data: options };
    } catch (err: unknown) {
      console.error("[DAL] fetchEventTypes exception:", err);
      return {
        success: false,
        error: `[ERR_AGENDA_004] ${err instanceof Error ? err.message : "Unknown error"}`,
      };
    }
  }
);

// ============================================================================
// Legacy Exports (backward compatibility)
// ============================================================================

/**
 * @deprecated Use fetchUpcomingEvents() with DALResult instead
 * Kept for backward compatibility with existing components
 */
export async function fetchUpcomingEventsLegacy(
  limit = 10
): Promise<AgendaEvent[]> {
  const result = await fetchUpcomingEvents(limit);
  if (!result.success) {
    console.error("[DAL] fetchUpcomingEventsLegacy error:", result.error);
    return [];
  }
  return result.data ?? [];
}

/**
 * @deprecated Use fetchEventTypes() with DALResult instead
 * Kept for backward compatibility with existing components
 */
export async function fetchEventTypesLegacy(): Promise<EventTypeOption[]> {
  const result = await fetchEventTypes();
  if (!result.success) {
    console.error("[DAL] fetchEventTypesLegacy error:", result.error);
    return [{ value: "all", label: "Tous les événements" }];
  }
  return result.data ?? [];
}
