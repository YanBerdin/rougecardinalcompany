"use server";
import "server-only";
import { cache } from "react";
import { createClient } from "@/supabase/server";
import {
  EventSchema,
  type Event as AgendaEvent,
  type EventType as EventTypeOption,
} from "@/components/features/public-site/agenda/types";
import {
  type DALResult,
  formatTime,
  toISODateString,
} from "@/lib/dal/helpers";

// NOTE: Types AgendaEvent and EventTypeOption should be imported directly 
// from '@/components/features/public-site/agenda/types' or '@/lib/schemas/agenda'
// Server files cannot re-export types in Next.js 16

// ============================================================================
// Internal Types (Supabase response shape)
// ============================================================================

type SupabaseEventRow = {
  id: number;
  date_debut: string;
  start_time?: string | null;
  status?: string | null;
  ticket_url?: string | null;
  image_url?: string | null;
  type_array?: string[] | null;
  spectacles?: { title?: string | null; image_url?: string | null } | null;
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
    date: toISODateString(dateDebut),
    time: formatTime(dateDebut, row.start_time),
    venue: row.lieux?.nom ?? "Lieu à venir",
    address: buildAddress(row.lieux),
    type: row.type_array?.[0] ?? "Spectacle",
    status: row.status ?? "programmé",
    ticketUrl: row.ticket_url ?? null,
    image:
      row.image_url ||
      row.spectacles?.image_url ||
      "/opengraph-image.png",
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

      const { data, error } = await supabase
        .from("evenements")
        .select(
          `id, date_debut, start_time, status, ticket_url, image_url, type_array,
         spectacles (title, image_url),
         lieux (nom, adresse, ville, code_postal)`
        )
        .gte("date_debut", new Date().toISOString())
        .order("date_debut", { ascending: true })
        .limit(limit);

      if (error) {
        console.error("[DAL] fetchUpcomingEvents error:", error);
        return {
          success: false,
          error: `[ERR_AGENDA_001] Failed to fetch events: ${error.message}`,
        };
      }

      const events = (data ?? []).map((row) =>
        mapRowToEventDTO(row as SupabaseEventRow)
      );

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
        .select("type_array")
        .not("type_array", "is", null)
        .limit(200);

      if (error) {
        console.error("[DAL] fetchEventTypes error:", error);
        return {
          success: false,
          error: `[ERR_AGENDA_003] Failed to fetch event types: ${error.message}`,
        };
      }

      // Extract unique types from arrays
      const typeSet = new Set<string>();
      for (const row of data ?? []) {
        for (const t of row.type_array ?? []) {
          typeSet.add(t);
        }
      }

      const values = Array.from(typeSet);
      const baseTypes =
        values.length > 0
          ? values
          : ["Spectacle", "Première", "Rencontre", "Atelier"];

      const options: EventTypeOption[] = [
        { value: "all", label: "Tous les événements" },
        ...baseTypes.map((v) => ({
          value: v,
          label: v + (v.endsWith("s") ? "" : "s"),
        })),
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
