"use server";

import 'server-only';
import { createClient } from '@/supabase/server';

export type CompanyStatRecord = {
  id: number;
  key: string;
  label: string;
  value: string;
  position: number;
  active: boolean;
};

export async function fetchCompanyStats() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('compagnie_stats')
    .select('id, key, label, value, position, active')
    .eq('active', true)
    .order('position', { ascending: true });

  if (error) {
    console.error('fetchCompanyStats error', error);
    return [] as CompanyStatRecord[];
  }

  return data ?? [];
}
