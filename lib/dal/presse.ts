"use server";

import "server-only";
import { createClient } from "@/supabase/server";

// Types alignés sur components/features/public-site/presse/types.ts
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
  excerpt: string;
  source_publication: string;
  source_url: string;
  published_at: string; // ISO string
}

function bytesToHuman(size: number | null | undefined): string {
  if (size == null || Number.isNaN(size)) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"] as const;
  let s = size;
  let i = 0;
  while (s >= 1024 && i < units.length - 1) {
    s /= 1024;
    i += 1;
  }
  return `${s % 1 === 0 ? s.toFixed(0) : s.toFixed(1)} ${units[i]}`;
}

export async function fetchPressReleases(
  limit?: number
): Promise<PressRelease[]> {
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
    console.error("fetchPressReleases error", error);
    return [];
  }

  return (data ?? []).map((row: CommuniquePresseRow) => ({
    id: Number(row.id),
    title: String(row.title),
    description: String(row.description ?? ""),
    date: String(row.date_publication),
    // Pas encore de fichier PDF stocké en BDD: on utilise un placeholder
    fileUrl:
      typeof row.image_url === "string" && row.image_url.length > 0
        ? row.image_url
        : "#",
    fileSize: bytesToHuman(row.file_size_bytes ?? null),
  }));
}

export async function fetchMediaArticles(
  limit?: number
): Promise<MediaArticle[]> {
  const supabase = await createClient();

  let query = supabase
    .from("articles_presse")
    .select(
      "id, title, author, type, excerpt, source_publication, source_url, published_at"
    )
    .order("published_at", { ascending: false, nullsFirst: false });

  if (typeof limit === "number") {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error("fetchMediaArticles error", error);
    return [];
  }

  function coerceArticleType(
    v: string | null
  ): "Article" | "Critique" | "Interview" | "Portrait" {
    const allowed = ["Article", "Critique", "Interview", "Portrait"] as const;
    const s = String(v ?? "Article");
    return (allowed as readonly string[]).includes(s)
      ? (s as "Article" | "Critique" | "Interview" | "Portrait")
      : "Article";
  }

  return (data ?? []).map((row: ArticlePresseRow) => ({
    id: Number(row.id),
    title: String(row.title ?? ""),
    author: String(row.author ?? ""),
    type: coerceArticleType(row.type),
    excerpt: String(row.excerpt ?? ""),
    source_publication: String(row.source_publication ?? ""),
    source_url: String(row.source_url ?? ""),
    published_at: String(row.published_at ?? ""),
  }));
}

// Media kit récupère directement les médias (logos, photos, dossiers PDF)
interface MediaKitItemDTO {
  type: string; // ex: "Logo", "Photo", "Dossier de presse"
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

// Utilisation du type global Media avec metadata typée
type MediaRow = Pick<
  Media,
  "storage_path" | "filename" | "mime" | "size_bytes" | "alt_text"
> & {
  metadata: MediaMetadata | null;
};

// Utilisation du type global CommuniquePresse
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

// Utilisation du type global ArticlePresse
type ArticlePresseRow = Pick<
  ArticlePresse,
  | "id"
  | "title"
  | "author"
  | "type"
  | "excerpt"
  | "source_publication"
  | "source_url"
  | "published_at"
>;

function getMediaType(metadata: MediaMetadata | null): string {
  if (metadata?.type === "logo") return "Logo";
  if (metadata?.type === "icon") return "Icône";
  if (metadata?.type === "photo") return "Photo";
  if (metadata?.type === "press_kit") return "Dossier de presse";
  if (metadata?.type === "technical_sheet") return "Fiche technique";
  if (metadata?.type === "image") return metadata?.title || "Image";
  return "Document";
}

export async function fetchMediaKit(
  limit?: number
): Promise<MediaKitItemDTO[]> {
  const supabase = await createClient();

  // Récupère les médias du kit presse : logos, photos, dossiers PDF
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
    console.error("fetchMediaKit error", error);
    return [];
  }

  return (data ?? []).map((row) => {
    // Cast metadata de Json vers MediaMetadata
    const metadata = row.metadata as MediaMetadata | null;
    
    // Prioriser l'URL externe si disponible dans metadata
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
  });
}
