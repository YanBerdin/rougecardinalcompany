"use server";
import "server-only";

import { cache } from "react";
import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";
import { dalSuccess, dalError, type DALResult } from "@/lib/dal/helpers";
import { type ArticleDTO, type ArticleInput } from "@/lib/schemas/press-article";

/**
 * Fetch all articles (admin view)
 */
export const fetchAllArticlesAdmin = cache(
    async (): Promise<DALResult<ArticleDTO[]>> => {
    await requireAdmin();

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("articles_presse")
        .select(
            `
      id,
      title,
      author,
      type,
      slug,
      chapo,
      excerpt,
      source_publication,
      source_url,
      published_at,
      image_url,
      og_image_media_id,
      created_at,
      updated_at
    `
        )
        .order("published_at", { ascending: false, nullsFirst: false });

    if (error) {
        return dalError(`[ERR_ARTICLE_010] ${error.message}`);
    }

    const articles: ArticleDTO[] = (data ?? []).map((article) => ({
        id: Number(article.id),
        title: article.title,
        author: article.author,
        type: article.type,
        slug: article.slug,
        chapo: article.chapo,
        excerpt: article.excerpt,
        source_publication: article.source_publication,
        source_url: article.source_url,
        published_at: article.published_at,
        image_url: article.image_url,
        og_image_media_id: article.og_image_media_id ? Number(article.og_image_media_id) : null,
        created_at: article.created_at,
        updated_at: article.updated_at,
    }));

    return dalSuccess(articles);
    }
);

/**
 * Fetch single article by ID
 */
export const fetchArticleById = cache(
    async (id: bigint): Promise<DALResult<ArticleDTO | null>> => {
    await requireAdmin();

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("articles_presse")
        .select(
            `
      id,
      title,
      author,
      type,
      slug,
      chapo,
      excerpt,
      source_publication,
      source_url,
      published_at,
      image_url,
      og_image_media_id,
      created_at,
      updated_at
    `
        )
        .eq("id", id.toString())
        .single();

    if (error) {
        if (error.code === "PGRST116") {
            return dalSuccess(null);
        }
        return dalError(`[ERR_ARTICLE_011] ${error.message}`);
    }

    const article: ArticleDTO = {
        id: Number(data.id),
        title: data.title,
        author: data.author,
        type: data.type,
        slug: data.slug,
        chapo: data.chapo,
        excerpt: data.excerpt,
        source_publication: data.source_publication,
        source_url: data.source_url,
        published_at: data.published_at,
        image_url: data.image_url,
        og_image_media_id: data.og_image_media_id ? Number(data.og_image_media_id) : null,
        created_at: data.created_at,
        updated_at: data.updated_at,
    };

    return dalSuccess(article);
    }
);

/**
 * Create new article
 */
export async function createArticle(
    input: ArticleInput
): Promise<DALResult<ArticleDTO>> {
    await requireAdmin();

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("articles_presse")
        .insert({
            title: input.title,
            author: input.author,
            type: input.type,
            slug: input.slug,
            chapo: input.chapo,
            excerpt: input.excerpt,
            source_publication: input.source_publication,
            source_url: input.source_url,
            published_at: input.published_at,
            image_url: input.image_url,
            og_image_media_id: input.og_image_media_id?.toString(),
        })
        .select()
        .single();

    if (error) {
        return dalError(`[ERR_ARTICLE_001] ${error.message}`);
    }

    if (!data) {
        return dalError("[ERR_ARTICLE_001] Failed to create article");
    }

    return dalSuccess(data);
}

/**
 * Update article
 */
export async function updateArticle(
    id: bigint,
    input: Partial<ArticleInput>
): Promise<DALResult<ArticleDTO>> {
    await requireAdmin();

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("articles_presse")
        .update({
            title: input.title,
            author: input.author,
            type: input.type,
            slug: input.slug,
            chapo: input.chapo,
            excerpt: input.excerpt,
            source_publication: input.source_publication,
            source_url: input.source_url,
            published_at: input.published_at,
            image_url: input.image_url,
            og_image_media_id: input.og_image_media_id?.toString(),
        })
        .eq("id", id.toString())
        .select()
        .single();

    if (error) {
        return dalError(`[ERR_ARTICLE_002] ${error.message}`);
    }

    if (!data) {
        return dalError("[ERR_ARTICLE_002] Failed to update article");
    }

    return dalSuccess(data);
}

/**
 * Delete article
 */
export async function deleteArticle(id: bigint): Promise<DALResult<null>> {
    await requireAdmin();

    const supabase = await createClient();
    const { error } = await supabase
        .from("articles_presse")
        .delete()
        .eq("id", id.toString());

    if (error) {
        return dalError(`[ERR_ARTICLE_003] ${error.message}`);
    }

    return dalSuccess(null);
}
