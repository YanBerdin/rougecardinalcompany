"use server";

import 'server-only';
import { createClient } from '@/lib/supabase/server';

export type HomeHeroSlideRecord = {
  title: string;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
  position: number;
};

export async function fetchActiveHomeHeroSlides() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('home_hero_slides')
    .select('title, subtitle, description, image_url, cta_label, cta_url, position, active, starts_at, ends_at')
    .order('position', { ascending: true });

  if (error) {
    console.error('fetchActiveHomeHeroSlides error', error);
    return [] as HomeHeroSlideRecord[];
  }
  const now = new Date();
  const filtered = (data ?? []).filter((r: any) => {
    if (r.active === false) return false;
    const startsOk = !r.starts_at || new Date(r.starts_at) <= now;
    const endsOk = !r.ends_at || new Date(r.ends_at) >= now;
    return startsOk && endsOk;
  });
  return filtered as HomeHeroSlideRecord[];
}
