"use server";
import "server-only";

import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";
import { type DALResult } from "@/lib/dal/helpers";
import { type ArticleDTO, type ArticleInput } from "@/lib/schemas/press-article";

/**
 * Fetch all articles (admin view)
 */
export async function fetchAllArticlesAdmin(): Promise<DALResult<ArticleDTO[]>> {
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
      created_at,
      updated_at
    `
        )
        .order("published_at", { ascending: false, nullsFirst: false });

    if (error) {
        return { success: false, error: error.message };
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
        created_at: article.created_at,
        updated_at: article.updated_at,
    }));

    return { success: true, data: articles };
}

/**
 * Fetch single article by ID
 */
export async function fetchArticleById(
    id: bigint
): Promise<DALResult<ArticleDTO | null>> {
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
      created_at,
      updated_at
    `
        )
        .eq("id", id.toString())
        .single();

    if (error) {
        if (error.code === "PGRST116") {
            return { success: true, data: null };
        }
        return { success: false, error: error.message };
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
        created_at: data.created_at,
        updated_at: data.updated_at,
    };

    return { success: true, data: article };
}

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
        })
        .select()
        .single();

    if (error) {
        return { success: false, error: `[ERR_ARTICLE_001] ${error.message}` };
    }

    if (!data) {
        return { success: false, error: "[ERR_ARTICLE_001] Failed to create article" };
    }

    return { success: true, data };
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
        })
        .eq("id", id.toString())
        .select()
        .single();

    if (error) {
        return { success: false, error: `[ERR_ARTICLE_002] ${error.message}` };
    }

    if (!data) {
        return { success: false, error: "[ERR_ARTICLE_002] Failed to update article" };
    }

    return { success: true, data };
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
        return { success: false, error: `[ERR_ARTICLE_003] ${error.message}` };
    }

    return { success: true, data: null };
}
