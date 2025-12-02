"use server";

import "server-only";
import { createClient } from "@/supabase/server";
import { type DALResult } from "@/lib/dal/helpers";

// =============================================================================
// TYPES
// =============================================================================

export type CompanyStatRecord = {
  id: number;
  key: string;
  label: string;
  value: string;
  position: number;
  active: boolean;
};

export type HomeAboutContentDTO = {
  title: string;
  intro1: string;
  intro2: string;
  imageUrl: string;
  missionTitle: string;
  missionText: string;
};

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_ABOUT: HomeAboutContentDTO = {
  title: "La Passion du Théâtre depuis 2008",
  intro1:
    "Née de la rencontre de professionnels passionnés, la compagnie Rouge-Cardinal s'attache à créer des spectacles qui interrogent notre époque tout en célébrant la beauté de l'art théâtral.",
  intro2:
    "Notre démarche artistique privilégie l'humain, l'émotion authentique et la recherche constante d'une vérité scénique qui touche et transforme.",
  imageUrl:
    "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800",
  missionTitle: "Notre Mission",
  missionText:
    "Créer des spectacles qui émeuvent, questionnent et rassemblent les publics autour de l'art vivant.",
};

// =============================================================================
// FETCH COMPANY STATS
// =============================================================================

export async function fetchCompanyStats(): Promise<DALResult<CompanyStatRecord[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("compagnie_stats")
    .select("id, key, label, value, position, active")
    .eq("active", true)
    .order("position", { ascending: true });

  if (error) {
    console.error("[ERR_HOME_ABOUT_001] fetchCompanyStats:", error.message);
    return { success: false, error: `[ERR_HOME_ABOUT_001] ${error.message}` };
  }

  return { success: true, data: data ?? [] };
}

// =============================================================================
// HELPERS
// =============================================================================

function resolvePublicUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  storagePath?: string | null
): string | null {
  if (!storagePath) return null;
  const firstSlash = storagePath.indexOf("/");
  if (firstSlash <= 0 || firstSlash === storagePath.length - 1) return null;
  const bucket = storagePath.slice(0, firstSlash);
  const key = storagePath.slice(firstSlash + 1);
  try {
    const { data } = supabase.storage.from(bucket).getPublicUrl(key);
    return data?.publicUrl ?? null;
  } catch {
    return null;
  }
}

// =============================================================================
// FETCH HOME ABOUT CONTENT
// =============================================================================

export async function fetchHomeAboutContent(): Promise<DALResult<HomeAboutContentDTO>> {
  const supabase = await createClient();

  const { data: aboutRow, error: aboutErr } = await supabase
    .from("home_about_content")
    .select(
      "title,intro1,intro2,image_url,image_media_id,mission_title,mission_text"
    )
    .eq("active", true)
    .order("position", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (aboutErr) {
    console.error("[ERR_HOME_ABOUT_002] fetchHomeAboutContent:", aboutErr.message);
    return { success: false, error: `[ERR_HOME_ABOUT_002] ${aboutErr.message}` };
  }

  if (!aboutRow) {
    return { success: true, data: DEFAULT_ABOUT };
  }

  let mediaPublicUrl: string | null = null;
  if (aboutRow.image_media_id) {
    const { data: mediaRow } = await supabase
      .from("medias")
      .select("storage_path")
      .eq("id", aboutRow.image_media_id)
      .maybeSingle();
    mediaPublicUrl = resolvePublicUrl(supabase, mediaRow?.storage_path);
  }

  return {
    success: true,
    data: {
      title: aboutRow.title ?? DEFAULT_ABOUT.title,
      intro1: aboutRow.intro1 ?? DEFAULT_ABOUT.intro1,
      intro2: aboutRow.intro2 ?? DEFAULT_ABOUT.intro2,
      imageUrl: mediaPublicUrl || aboutRow.image_url || DEFAULT_ABOUT.imageUrl,
      missionTitle: aboutRow.mission_title ?? DEFAULT_ABOUT.missionTitle,
      missionText: aboutRow.mission_text ?? DEFAULT_ABOUT.missionText,
    },
  };
}
