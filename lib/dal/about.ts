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

export type HomeAboutContentDTO = {
  title: string;
  intro1: string;
  intro2: string;
  imageUrl: string;
  missionTitle: string;
  missionText: string;
};

/**
 * Récupère le contenu "About" de la page d'accueil à partir des sections de présentation compagnie.
 * Stratégie: prend la première section active `kind = 'history'` pour le titre + 2 paragraphes,
 * et la première section active `kind = 'mission'` pour le bloc mission. Image: history.image_url ou mission.image_url.
 */
export async function fetchHomeAboutContent(): Promise<HomeAboutContentDTO> {
  const supabase = await createClient();

  const historyPromise = supabase
    .from('compagnie_presentation_sections')
    .select('title, content, image_url, image_media_id')
    .eq('active', true)
    .eq('kind', 'history')
    .order('position', { ascending: true })
    .limit(1)
    .maybeSingle();

  const missionPromise = supabase
    .from('compagnie_presentation_sections')
    .select('title, content, image_url, image_media_id')
    .eq('active', true)
    .eq('kind', 'mission')
    .order('position', { ascending: true })
    .limit(1)
    .maybeSingle();

  const [historyRes, missionRes] = await Promise.all([historyPromise, missionPromise]);

  const history = historyRes.data as { title?: string; content?: string[]; image_url?: string; image_media_id?: number | null } | null;
  const mission = missionRes.data as { title?: string; content?: string[]; image_url?: string; image_media_id?: number | null } | null;

  // Helper: transforme storage_path ("bucket/key") en URL publique via Supabase Storage
  const resolvePublicUrl = (storagePath?: string | null): string | null => {
    if (!storagePath) return null;
    const firstSlash = storagePath.indexOf('/');
    if (firstSlash <= 0 || firstSlash === storagePath.length - 1) return null;
    const bucket = storagePath.slice(0, firstSlash);
    const key = storagePath.slice(firstSlash + 1);
    try {
      const { data } = supabase.storage.from(bucket).getPublicUrl(key);
      return data?.publicUrl ?? null;
    } catch (e) {
      console.warn('resolvePublicUrl error', e);
      return null;
    }
  };

  // Récupère le storage_path du média si présent (history prioritaire, sinon mission)
  let mediaPublicUrl: string | null = null;
  const mediaId = history?.image_media_id || mission?.image_media_id;
  if (mediaId) {
    const { data: mediaRow, error: mediaErr } = await supabase
      .from('medias')
      .select('storage_path')
      .eq('id', mediaId)
      .maybeSingle();
    if (mediaErr) {
      console.warn('fetchHomeAboutContent medias error', mediaErr);
    }
    mediaPublicUrl = resolvePublicUrl(mediaRow?.storage_path as string | undefined);
  }

  return {
    title: history?.title ?? 'La Passion du Théâtre depuis 2008',
    intro1:
      history?.content?.[0] ??
      "Née de la rencontre de professionnels passionnés, la compagnie Rouge-Cardinal s'attache à créer des spectacles qui interrogent notre époque tout en célébrant la beauté de l'art théâtral.",
    intro2:
      history?.content?.[1] ??
      "Notre démarche artistique privilégie l'humain, l'émotion authentique et la recherche constante d'une vérité scénique qui touche et transforme.",
    imageUrl:
      mediaPublicUrl ||
      history?.image_url ||
      mission?.image_url ||
      'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
    missionTitle: mission?.title ?? 'Notre Mission',
    missionText:
      (Array.isArray(mission?.content) && mission?.content?.length ? mission?.content?.[0] : undefined) ??
      "Créer des spectacles qui émeuvent, questionnent et rassemblent les publics autour de l'art vivant.",
  };
}
