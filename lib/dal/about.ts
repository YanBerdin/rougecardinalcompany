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

// Contenu "About" de la page d'accueil à partir de public.home_about_content
// 07e_table_home_about.sql

export type HomeAboutContentDTO = {
  title: string;
  intro1: string;
  intro2: string;
  imageUrl: string;
  missionTitle: string;
  missionText: string;
};

const DEFAULT_ABOUT: HomeAboutContentDTO = {
  title: 'La Passion du Théâtre depuis 2008',
  intro1:
    "Née de la rencontre de professionnels passionnés, la compagnie Rouge-Cardinal s'attache à créer des spectacles qui interrogent notre époque tout en célébrant la beauté de l'art théâtral.",
  intro2:
    "Notre démarche artistique privilégie l'humain, l'émotion authentique et la recherche constante d'une vérité scénique qui touche et transforme.",
  imageUrl:
    'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
  missionTitle: 'Notre Mission',
  missionText:
    "Créer des spectacles qui émeuvent, questionnent et rassemblent les publics autour de l'art vivant.",
};

/**
 * Récupère le contenu "About" de la page d'accueil depuis `public.home_about_content` uniquement.
 * Si aucune ligne active n'est trouvée, retourne des valeurs par défaut contrôlées.
 */
export async function fetchHomeAboutContent(): Promise<HomeAboutContentDTO> {
  const supabase = await createClient();

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

  // Table dédiée `home_about_content`
  // 07e_table_home_about.sql
  try {
    const { data: aboutRow, error: aboutErr } = await supabase
      .from('home_about_content')
      .select('title,intro1,intro2,image_url,image_media_id,mission_title,mission_text')
      .eq('active', true)
      .order('position', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (aboutErr) {
      console.warn('fetchHomeAboutContent(home_about_content) error', aboutErr);
    }

    if (aboutRow) {
      let mediaPublicUrl: string | null = null;
      if (aboutRow.image_media_id) {
        const { data: mediaRow, error: mediaErr } = await supabase
          .from('medias')
          .select('storage_path')
          .eq('id', aboutRow.image_media_id)
          .maybeSingle();
        if (mediaErr) {
          console.warn('fetchHomeAboutContent medias error', mediaErr);
        }
        mediaPublicUrl = resolvePublicUrl(mediaRow?.storage_path as string | undefined);
      }

      return {
        title: aboutRow.title ?? DEFAULT_ABOUT.title,
        intro1: aboutRow.intro1 ?? DEFAULT_ABOUT.intro1,
        intro2: aboutRow.intro2 ?? DEFAULT_ABOUT.intro2,
        imageUrl: mediaPublicUrl || aboutRow.image_url || DEFAULT_ABOUT.imageUrl,
        missionTitle: aboutRow.mission_title ?? DEFAULT_ABOUT.missionTitle,
        missionText: aboutRow.mission_text ?? DEFAULT_ABOUT.missionText,
      };
    }
  } catch (e) {
    console.warn('fetchHomeAboutContent(home_about_content) unexpected error', e);
  }

  // Aucune donnée disponible dans `home_about_content`: valeurs par défaut
  return DEFAULT_ABOUT;
}
