"use server";

import 'server-only';
import { z } from 'zod';
import { createClient } from '@/supabase/server';

export type NewsletterSettings = {
  enabled: boolean;
  title?: string | null;
  subtitle?: string | null;
};

const NewsletterSettingsSchema = z.object({
  enabled: z.boolean().default(true),
  title: z.string().nullable().optional(),
  subtitle: z.string().nullable().optional(),
});

// Lecture des réglages depuis configurations_site (clé: 'public:home:newsletter')
export async function fetchNewsletterSettings(): Promise<NewsletterSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('configurations_site')
    .select('value')
    .eq('key', 'public:home:newsletter')
    .maybeSingle();

  if (error) {
    console.error('fetchNewsletterSettings error', error);
    return { enabled: true };
  }

  const parsed = NewsletterSettingsSchema.safeParse(data?.value ?? {});
  if (!parsed.success) {
    return { enabled: true };
  }
  return parsed.data;
}
