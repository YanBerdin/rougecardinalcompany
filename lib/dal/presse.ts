"use server";

import "server-only";
import { createClient } from "@/supabase/server";
import { type DALResult, bytesToHuman } from "@/lib/dal/helpers";

interface PressRelease {
  id: number;
  title: string;
  description: string;
  date: string; // ISO string yyyy-mm-dd
  fileUrl: string; // fallback '#'
  fileSize: string; // ex: '312 KB' ou '—'
}

interface MediaArticle {
  id: number;
  title: string;
  author: string;
  type: "Article" | "Critique" | "Interview" | "Portrait";
  chapo: string;
  excerpt: string;
  source_publication: string;
  source_url: string;
  published_at: string; // ISO string
}

interface MediaKitItemDTO {
  type: string; // ex: "Logo", "Photo", "Dossier de presse", "PDF"
  description: string;
  fileSize: string;
  fileUrl: string;
}

interface MediaMetadata {
  type?: string;
  title?: string;
  external_url?: string;
  [key: string]: string | number | boolean | undefined;
}

type SupabaseMediaRow = {
  storage_path: string;
  filename?: string | null;
  mime?: string | null;
  size_bytes?: number | null;
  alt_text?: string | null;
  metadata?: MediaMetadata | null;
};

// Type global CommuniquePresse
type CommuniquePresseRow = Pick<
  CommuniquePresse,
  | "id"
  | "title"
  | "description"
  | "date_publication"
  | "image_url"
  | "ordre_affichage"
  | "public"
  | "file_size_bytes"
>;

// Type global ArticlePresse
type ArticlePresseRow = Pick<
  ArticlePresse,
  | "id"
  | "title"
  | "author"
  | "type"
  | "chapo"
  | "excerpt"
  | "source_publication"
  | "source_url"
  | "published_at"
>;

// =============================================================================
// Helpers (domain-specific mappers)
// =============================================================================

function coerceArticleType(
  v: string | null
): "Article" | "Critique" | "Interview" | "Portrait" {
  const raw = String(v ?? "").trim().toLowerCase();
  if (raw === "critique") return "Critique";
  if (raw === "entretien" || raw === "interview") return "Interview";
  if (raw === "portrait") return "Portrait";
  return "Article";
}

function getMediaType(metadata: MediaMetadata | null): string {
  if (metadata?.type === "logo") return "Logo";
  if (metadata?.type === "icon") return "Icône";
  if (metadata?.type === "photo") return "Photo";
  if (metadata?.type === "press_kit") return "Dossier de presse";
  if (metadata?.type === "technical_sheet") return "Fiche technique";
  if (metadata?.type === "image") return metadata?.title || "Image";
  return "Document";
}

function mapPressReleaseRow(row: CommuniquePresseRow): PressRelease {
  return {
    id: Number(row.id),
    title: String(row.title),
    description: String(row.description ?? ""),
    date: String(row.date_publication),
    fileUrl:
      typeof row.image_url === "string" && row.image_url.length > 0
        ? row.image_url
        : "#",
    fileSize: bytesToHuman(row.file_size_bytes ?? null),
  };
}

function mapMediaArticleRow(row: ArticlePresseRow): MediaArticle {
  return {
    id: Number(row.id),
    title: String(row.title ?? ""),
    author: String(row.author ?? ""),
    type: coerceArticleType(row.type),
    chapo: String(row.chapo ?? ""),
    excerpt: String(row.excerpt ?? ""),
    source_publication: String(row.source_publication ?? ""),
    source_url: String(row.source_url ?? ""),
    published_at: String(row.published_at ?? ""),
  };
}

function mapMediaKitRow(row: SupabaseMediaRow): MediaKitItemDTO {
  const metadata = row.metadata as MediaMetadata | null;
  const externalUrl = metadata?.external_url;
  const fileUrl = externalUrl
    ? String(externalUrl)
    : `/storage/v1/object/public/${row.storage_path}`;

  return {
    type: getMediaType(metadata),
    description: String(row.alt_text ?? row.filename ?? ""),
    fileSize: bytesToHuman(row.size_bytes),
    fileUrl,
  };
}

// =============================================================================
// DAL Functions
// =============================================================================

/**
 * Fetch public press releases
 * @param limit Optional limit on results
 * @returns Press releases ordered by publication date
 */
export async function fetchPressReleases(
  limit?: number
): Promise<DALResult<PressRelease[]>> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("communiques_presse")
      .select(
        "id, title, description, date_publication, image_url, ordre_affichage, public, file_size_bytes"
      )
      .eq("public", true)
      .order("date_publication", { ascending: false });

    if (typeof limit === "number") {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[DAL] fetchPressReleases error:", error);
      return {
        success: false,
        error: `[ERR_PRESSE_001] Failed to fetch press releases: ${error.message}`,
      };
    }

    const releases = (data ?? []).map(mapPressReleaseRow);
    return { success: true, data: releases };
  } catch (err: unknown) {
    console.error("[DAL] fetchPressReleases unexpected error:", err);
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "[ERR_PRESSE_002] Unknown error",
    };
  }
}

/**
 * Fetch media articles from public view
 * @param limit Optional limit on results
 * @returns Media articles ordered by publication date
 */
export async function fetchMediaArticles(
  limit?: number
): Promise<DALResult<MediaArticle[]>> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("articles_presse_public")
      .select(
        "id, title, author, type, chapo, excerpt, source_publication, source_url, published_at"
      )
      .order("published_at", { ascending: false, nullsFirst: false });

    if (typeof limit === "number") {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[DAL] fetchMediaArticles error:", error);
      return {
        success: false,
        error: `[ERR_PRESSE_003] Failed to fetch media articles: ${error.message}`,
      };
    }

    const articles = (data ?? []).map(mapMediaArticleRow);
    return { success: true, data: articles };
  } catch (err: unknown) {
    console.error("[DAL] fetchMediaArticles unexpected error:", err);
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "[ERR_PRESSE_004] Unknown error",
    };
  }
}

/**
 * Fetch media kit items (logos, photos, press kits)
 * @param limit Optional limit on results
 * @returns Media kit items ordered by storage path
 */
export async function fetchMediaKit(
  limit?: number
): Promise<DALResult<MediaKitItemDTO[]>> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("medias")
      .select("storage_path, filename, mime, size_bytes, alt_text, metadata")
      .or(
        "storage_path.like.press-kit/%,storage_path.like.photos/%,storage_path.like.dossiers/%"
      )
      .order("storage_path", { ascending: true });

    if (typeof limit === "number") {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[DAL] fetchMediaKit error:", error);
      return {
        success: false,
        error: `[ERR_PRESSE_005] Failed to fetch media kit: ${error.message}`,
      };
    }

    const items = (data ?? []).map(mapMediaKitRow);
    return { success: true, data: items };
  } catch (err: unknown) {
    console.error("[DAL] fetchMediaKit unexpected error:", err);
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "[ERR_PRESSE_006] Unknown error",
    };
  }
}
