"use server";

import 'server-only';
import { createClient } from '@/supabase/server';

export type CompagnieValueRecord = {
  id: number;
  key: string;
  title: string;
  description: string;
  position: number;
  active: boolean;
};

export type TeamMemberRecord = {
  id: number;
  name: string;
  role: string | null;
  description: string | null;
  image_url: string | null;
  photo_media_id: number | null;
  ordre: number;
  active: boolean;
};

export async function fetchCompagnieValues(limit = 12) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('compagnie_values')
    .select('id, key, title, description, position, active')
    .eq('active', true)
    .order('position', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('fetchCompagnieValues error', error);
    return [] as CompagnieValueRecord[];
  }

  return data ?? [];
}

export async function fetchTeamMembers(limit = 12) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('membres_equipe')
    .select('id, name, role, description, image_url, photo_media_id, ordre, active')
    .eq('active', true)
    .order('ordre', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('fetchTeamMembers error', error);
    return [] as TeamMemberRecord[];
  }

  return data ?? [];
}
