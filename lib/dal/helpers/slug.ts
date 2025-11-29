/**
 * Slug generation utilities for DAL functions
 * @module lib/dal/helpers/slug
 */

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Generate URL-friendly slug from title
 *
 * Converts to lowercase, removes diacritics, removes special characters,
 * and replaces spaces with hyphens.
 *
 * @param title - Title to convert
 * @returns URL-friendly slug
 *
 * @example
 * generateSlug("Hamlet: La Tragédie") // "hamlet-la-tragedie"
 * generateSlug("L'Été Meurtrier") // "lete-meurtrier"
 */
export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
        .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
        .trim()
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-"); // Remove duplicate hyphens
}

/**
 * Generate unique slug by checking existing slugs in a table
 *
 * If the base slug already exists, appends -2, -3, etc. until unique.
 *
 * @param supabase - Supabase client instance
 * @param tableName - Table to check for existing slugs
 * @param baseSlug - Initial slug to check
 * @returns Unique slug for the table
 *
 * @example
 * await generateUniqueSlug(supabase, "spectacles", "hamlet") // "hamlet" or "hamlet-2"
 */
export async function generateUniqueSlug(
    supabase: SupabaseClient,
    tableName: string,
    baseSlug: string
): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const { data: existing } = await supabase
            .from(tableName)
            .select("id")
            .eq("slug", slug)
            .maybeSingle();

        if (!existing) return slug;

        counter += 1;
        slug = `${baseSlug}-${counter}`;
    }
}
