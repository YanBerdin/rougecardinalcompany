import 'server-only';
import { createClient } from '@/supabase/server';

export type AgendaEventDTO = {
  id: number;
  title: string;
  date: string; // ISO date string
  time: string; // e.g. 20h30
  venue: string;
  address: string;
  type: string;
  status: string;
  ticketUrl: string | null;
  image: string;
};

function formatTime(date: Date, startTime?: string | null): string {
  if (startTime) {
    // start_time as HH:MM:SS
    const [h, m] = startTime.split(':');
    return `${h}h${m}`;
  }
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}h${m}`;
}

function toISODateString(d: Date): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function fetchUpcomingEvents(limit = 10): Promise<AgendaEventDTO[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('evenements')
    .select(
      `id, date_debut, start_time, status, ticket_url, image_url, type_array,
       spectacles (title, image_url),
       lieux (nom, adresse, ville, code_postal)`
    )
    .gte('date_debut', new Date().toISOString())
    .order('date_debut', { ascending: true })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row: any) => {
    const dateDebut = new Date(row.date_debut);
    const time = formatTime(dateDebut, row.start_time);
    const venue = row.lieux?.nom ?? 'Lieu à venir';
    const addressParts = [row.lieux?.adresse, [row.lieux?.code_postal, row.lieux?.ville].filter(Boolean).join(' ')].filter(Boolean);
    const address = addressParts.join(', ');
    const title = row.spectacles?.title ?? 'Événement';
    const type = Array.isArray(row.type_array) && row.type_array.length > 0 ? row.type_array[0] : 'Spectacle';
    const status = row.status ? row.status : 'programmé';
    const image = row.image_url || row.spectacles?.image_url || '/opengraph-image.png';
    return {
      id: row.id,
      title,
      date: toISODateString(dateDebut),
      time,
      venue,
      address,
      type,
      status,
      ticketUrl: row.ticket_url ?? null,
      image,
    } as AgendaEventDTO;
  });
}

export async function fetchEventTypes(): Promise<{ value: string; label: string }[]> {
  const supabase = await createClient();
  // Aggregate distinct types from type_array; fallback to defaults
  const { data, error } = await supabase
    .from('evenements')
    .select('type_array')
    .not('type_array', 'is', null)
    .limit(200);
  if (error) throw error;

  const set = new Set<string>();
  for (const row of data ?? []) {
    for (const t of row.type_array ?? []) set.add(t);
  }
  const values = Array.from(set);
  const base = values.length > 0 ? values : ['Spectacle', 'Première', 'Rencontre', 'Atelier'];
  return [{ value: 'all', label: 'Tous les événements' }, ...base.map((v) => ({ value: v, label: v + (v.endsWith('s') ? '' : 's') }))];
}
