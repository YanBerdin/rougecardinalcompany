"use server";

import 'server-only';
import { createClient } from '@/supabase/server';

export type PartnerRecord = {
  id: number;
  name: string;
  description: string | null;
  website_url: string | null;
  logo_url: string | null;
  is_active: boolean;
  display_order: number;
};

export async function fetchActivePartners(limit = 12) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('partners')
    .select('id, name, description, website_url, logo_url, is_active, display_order')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('fetchActivePartners error', error);
    return [] as PartnerRecord[];
  }

  return data ?? [];
}
