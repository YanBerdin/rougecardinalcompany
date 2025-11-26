"use server";
import "server-only";
import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { HeroSlideInput, HeroSlideDTO, ReorderInput } from "@/lib/schemas/home-content";
import { HeroSlideInputSchema, ReorderInputSchema } from "@/lib/schemas/home-content";
import { requireAdmin } from "@/lib/auth/is-admin";

export interface DALResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Fetch all hero slides (admin view, includes inactive)
 * @returns Array of hero slides ordered by position
 */
export async function fetchAllHeroSlides(): Promise<HeroSlideDTO[]> {
    await requireAdmin();

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("home_hero_slides")
        .select("*")
        .order("position", { ascending: true });

    if (error) throw new Error(`[ERR_HERO_001] Failed to fetch hero slides: ${error.message}`);
    return data ?? [];
}


/**
 * Fetch single hero slide by ID
 * @param id - Hero slide ID
 * @returns Hero slide or null if not found
 */
export async function fetchHeroSlideById(id: bigint): Promise<HeroSlideDTO | null> {
    await requireAdmin();

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("home_hero_slides")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        if (error.code === "PGRST116") return null;
        throw new Error(`[ERR_HERO_002] Failed to fetch hero slide: ${error.message}`);
    }

    return data;
}

/**
 * Generate URL-friendly slug from title
 */
function generateSlug(title: string): string {
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
 * Generate unique slug by checking existing slugs and adding suffix if needed
 * ✅ CORRECTION: Type SupabaseClient au lieu de any
 */
async function generateUniqueSlug(supabase: SupabaseClient, baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    // Check if slug exists
    while (true) {
        const { data: existing } = await supabase
            .from("home_hero_slides")
            .select("id")
            .eq("slug", slug)
            .maybeSingle();

        if (!existing) {
            return slug;
        }

        // Slug exists, try with suffix
        slug = `${baseSlug}-${counter}`;
        counter++;

        // Safety limit
        if (counter > 100) {
            throw new Error("Unable to generate unique slug");
        }
    }
}

/**
 * Generate unique slug excluding a specific ID (for updates)
 * ✅ CORRECTION: Type SupabaseClient au lieu de any
 */
async function generateUniqueSlugExcluding(
    supabase: SupabaseClient,
    baseSlug: string,
    excludeId: bigint
): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const { data: existing } = await supabase
            .from("home_hero_slides")
            .select("id")
            .eq("slug", slug)
            .neq("id", excludeId)
            .maybeSingle();

        if (!existing) {
            return slug;
        }

        slug = `${baseSlug}-${counter}`;
        counter++;

        if (counter > 100) {
            throw new Error("Unable to generate unique slug");
        }
    }
}


/**
 * Create new hero slide
 * @param input - Hero slide data
 * @returns Created hero slide
 */
export async function createHeroSlide(input: HeroSlideInput): Promise<DALResult<HeroSlideDTO>> {
    try {
        await requireAdmin();

        const validated = HeroSlideInputSchema.parse(input);

        const supabase = await createClient();

        // Generate unique slug
        const baseSlug = validated.slug || generateSlug(validated.title);
        const slug = await generateUniqueSlug(supabase, baseSlug);

        const { data, error } = await supabase
            .from("home_hero_slides")
            .insert({ ...validated, slug })
            .select()
            .single();

        if (error) {
            console.error("[DAL] Failed to create hero slide:", error);
            return {
                success: false,
                error: `[ERR_HERO_003] Failed to create hero slide: ${error.message}`,
            };
        }

        revalidatePath("/admin/home/hero");
        revalidatePath("/");

        return { success: true, data };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Update existing hero slide
 * @param id - Hero slide ID
 * @param input - Partial hero slide data
 * @returns Updated hero slide
 */
export async function updateHeroSlide(
    id: bigint,
    input: Partial<HeroSlideInput>
): Promise<DALResult<HeroSlideDTO>> {
    try {
        await requireAdmin();

        const validated = HeroSlideInputSchema.partial().parse(input);

        const supabase = await createClient();

        let updateData = { ...validated, updated_at: new Date().toISOString() };

        // ✅ OPTIMISATION: Ne fetch que si nécessaire
        if (validated.title && !validated.slug) {
            // On a besoin du slug actuel pour savoir s'il faut le régénérer
            const { data: currentSlide } = await supabase
                .from("home_hero_slides")
                .select("slug")
                .eq("id", id)
                .single();

            if (currentSlide) {
                const baseSlug = generateSlug(validated.title);
                if (baseSlug !== currentSlide.slug) {
                    const uniqueSlug = await generateUniqueSlugExcluding(supabase, baseSlug, id);
                    updateData = { ...updateData, slug: uniqueSlug };
                }
            }
        } else if (validated.slug) {
            // Vérifier l'unicité du slug fourni
            const uniqueSlug = await generateUniqueSlugExcluding(supabase, validated.slug, id);
            updateData = { ...updateData, slug: uniqueSlug };
        }

        const { data, error } = await supabase
            .from("home_hero_slides")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("[DAL] Failed to update hero slide:", error);
            return {
                success: false,
                error: `[ERR_HERO_004] Failed to update hero slide: ${error.message}`,
            };
        }

        revalidatePath("/admin/home/hero");
        revalidatePath("/");

        return { success: true, data };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Hard delete hero slide
 * Use hard delete to avoid RLS update restrictions on certain admin roles.
 * If you prefer soft-delete semantics, ensure RLS policies allow admins to update the
 * `active` column (e.g., USING (select public.is_admin()) or similar).
 *
 * @param id - Hero slide ID
 * @returns Success status
 */
export async function deleteHeroSlide(id: bigint): Promise<DALResult<null>> {
    try {
        await requireAdmin();

        const supabase = await createClient();

        // hard delete
        const { error } = await supabase
            .from("home_hero_slides")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("[DAL] Failed to delete hero slide:", error);
            return {
                success: false,
                error: `[ERR_HERO_005] Failed to delete hero slide: ${error.message}`,
            };
        }

        revalidatePath("/admin/home/hero");
        revalidatePath("/");

        return { success: true, data: null };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}



/**
* Reorder hero slides via database RPC
* @param order - Array of {id, position} objects
* @returns Success status
*/
export async function reorderHeroSlides(order: ReorderInput): Promise<DALResult<null>> {
    try {
        await requireAdmin();

        const validated = ReorderInputSchema.parse(order);

        const supabase = await createClient();
        const { error } = await supabase.rpc("reorder_hero_slides", {
            order_data: validated,
        });

        if (error) {
            console.error("[DAL] Failed to reorder hero slides:", error);
            return {
                success: false,
                error: `[ERR_HERO_006] Failed to reorder hero slides: ${error.message}`,
            };
        }

        revalidatePath("/admin/home/hero");
        revalidatePath("/");

        return { success: true, data: null };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
