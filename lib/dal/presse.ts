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

export async function fetchPressReleases(limit?: number): Promise<PressRelease[]> {
  const supabase = await createClient();

  let query = supabase
    .from("communiques_presse")
    .select(
      "id, title, description, date_publication, image_url, ordre_affichage, public, file_size_bytes",
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

  return (data ?? []).map((row: any) => ({
    id: Number(row.id),
    title: String(row.title),
    description: String(row.description ?? ""),
    date: String(row.date_publication),
    // Pas encore de fichier PDF stocké en BDD: on utilise un placeholder
    fileUrl: typeof row.image_url === "string" && row.image_url.length > 0 ? row.image_url : "#",
    fileSize: bytesToHuman(row.file_size_bytes ?? null),
  }));
}

export async function fetchMediaArticles(limit?: number): Promise<MediaArticle[]> {
  const supabase = await createClient();

  let query = supabase
    .from("articles_presse")
    .select(
      "id, title, author, type, excerpt, source_publication, source_url, published_at",
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

  function coerceArticleType(v: unknown): "Article" | "Critique" | "Interview" | "Portrait" {
    const allowed = ["Article", "Critique", "Interview", "Portrait"] as const;
    const s = String(v ?? "Article");
    return (allowed as readonly string[]).includes(s) ? (s as any) : "Article";
  }

  return (data ?? []).map((row: any) => ({
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

// Media kit minimal basé sur les communiqués publics (PDF principal)
interface MediaKitItemDTO {
  type: string; // ex: "Dossier de presse"
  description: string;
  fileSize: string;
  fileUrl: string;
}

export async function fetchMediaKit(limit?: number): Promise<MediaKitItemDTO[]> {
  const supabase = await createClient();

  let query = supabase
    .from("communiques_presse_public")
    .select("title, description, file_url, file_size_display, ordre_affichage, date_publication")
    .order("ordre_affichage", { ascending: true })
    .order("date_publication", { ascending: false });

  if (typeof limit === "number") {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error("fetchMediaKit error", error);
    return [];
  }

  return (data ?? []).map((row: any) => ({
    type: "Dossier de presse",
    description: String(row.description ?? row.title ?? ""),
    fileSize: String(row.file_size_display ?? "—"),
    fileUrl: String(row.file_url ?? "#"),
  }));
}
