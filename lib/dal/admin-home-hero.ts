"use server";
import "server-only";
import { createClient } from "@/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { HeroSlideInput, HeroSlideDTO, ReorderInput } from "@/lib/schemas/home-content";
import { HeroSlideInputSchema, ReorderInputSchema } from "@/lib/schemas/home-content";
import { requireAdmin } from "@/lib/auth/is-admin";
import { type DALResult, generateSlug } from "@/lib/dal/helpers";

// =============================================================================
// Helpers (domain-specific)
// =============================================================================

/**
 * Generate unique slug by checking existing slugs and adding suffix if needed
 */
async function generateUniqueSlug(
    supabase: SupabaseClient,
    baseSlug: string
): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const { data: existing } = await supabase
            .from("home_hero_slides")
            .select("id")
            .eq("slug", slug)
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
 * Generate unique slug excluding a specific ID (for updates)
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

// =============================================================================
// DAL Functions
// =============================================================================

/**
 * Fetch all hero slides (admin view, includes inactive)
 * @returns Array of hero slides ordered by position
 */
export async function fetchAllHeroSlides(): Promise<DALResult<HeroSlideDTO[]>> {
    try {
        await requireAdmin();

        const supabase = await createClient();
        const { data, error } = await supabase
            .from("home_hero_slides")
            .select("*")
            .order("position", { ascending: true });

        if (error) {
            console.error("[DAL] fetchAllHeroSlides error:", error);
            return {
                success: false,
                error: `[ERR_HERO_001] Failed to fetch hero slides: ${error.message}`,
            };
        }

        return { success: true, data: data ?? [] };
    } catch (err: unknown) {
        console.error("[DAL] fetchAllHeroSlides unexpected error:", err);
        return {
            success: false,
            error:
                err instanceof Error ? err.message : "[ERR_HERO_002] Unknown error",
        };
    }
}

/**
 * Fetch single hero slide by ID
 * @param id - Hero slide ID
 * @returns Hero slide or null if not found
 */
export async function fetchHeroSlideById(
    id: bigint
): Promise<DALResult<HeroSlideDTO | null>> {
    try {
        await requireAdmin();

        const supabase = await createClient();
        const { data, error } = await supabase
            .from("home_hero_slides")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return { success: true, data: null };
            }
            console.error("[DAL] fetchHeroSlideById error:", error);
            return {
                success: false,
                error: `[ERR_HERO_003] Failed to fetch hero slide: ${error.message}`,
            };
        }

        return { success: true, data };
    } catch (err: unknown) {
        console.error("[DAL] fetchHeroSlideById unexpected error:", err);
        return {
            success: false,
            error:
                err instanceof Error ? err.message : "[ERR_HERO_004] Unknown error",
        };
    }
}

/**
 * Create new hero slide
 * @param input - Hero slide data
 * @returns Created hero slide
 */
export async function createHeroSlide(
    input: HeroSlideInput
): Promise<DALResult<HeroSlideDTO>> {
    try {
        await requireAdmin();

        const validated = HeroSlideInputSchema.parse(input);

        const supabase = await createClient();

        const baseSlug = validated.slug || generateSlug(validated.title);
        const slug = await generateUniqueSlug(supabase, baseSlug);

        const { data, error } = await supabase
            .from("home_hero_slides")
            .insert({ ...validated, slug })
            .select()
            .single();

        if (error) {
            console.error("[DAL] createHeroSlide error:", error);
            return {
                success: false,
                error: `[ERR_HERO_005] Failed to create hero slide: ${error.message}`,
            };
        }

        return { success: true, data };
    } catch (err: unknown) {
        console.error("[DAL] createHeroSlide unexpected error:", err);
        return {
            success: false,
            error:
                err instanceof Error ? err.message : "[ERR_HERO_006] Unknown error",
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

        if (validated.title && !validated.slug) {
            const { data: currentSlide } = await supabase
                .from("home_hero_slides")
                .select("slug")
                .eq("id", id)
                .single();

            if (currentSlide) {
                const baseSlug = generateSlug(validated.title);
                if (baseSlug !== currentSlide.slug) {
                    const uniqueSlug = await generateUniqueSlugExcluding(
                        supabase,
                        baseSlug,
                        id
                    );
                    updateData = { ...updateData, slug: uniqueSlug };
                }
            }
        } else if (validated.slug) {
            const uniqueSlug = await generateUniqueSlugExcluding(
                supabase,
                validated.slug,
                id
            );
            updateData = { ...updateData, slug: uniqueSlug };
        }

        const { data, error } = await supabase
            .from("home_hero_slides")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("[DAL] updateHeroSlide error:", error);
            return {
                success: false,
                error: `[ERR_HERO_007] Failed to update hero slide: ${error.message}`,
            };
        }

        return { success: true, data };
    } catch (err: unknown) {
        console.error("[DAL] updateHeroSlide unexpected error:", err);
        return {
            success: false,
            error:
                err instanceof Error ? err.message : "[ERR_HERO_008] Unknown error",
        };
    }
}

/**
 * Hard delete hero slide
 * @param id - Hero slide ID
 * @returns Success status
 */
export async function deleteHeroSlide(id: bigint): Promise<DALResult<null>> {
    try {
        await requireAdmin();

        const supabase = await createClient();

        const { error } = await supabase
            .from("home_hero_slides")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("[DAL] deleteHeroSlide error:", error);
            return {
                success: false,
                error: `[ERR_HERO_009] Failed to delete hero slide: ${error.message}`,
            };
        }

        return { success: true, data: null };
    } catch (err: unknown) {
        console.error("[DAL] deleteHeroSlide unexpected error:", err);
        return {
            success: false,
            error:
                err instanceof Error ? err.message : "[ERR_HERO_010] Unknown error",
        };
    }
}

/**
 * Reorder hero slides via database RPC
 * @param order - Array of {id, position} objects
 * @returns Success status
 */
export async function reorderHeroSlides(
    order: ReorderInput
): Promise<DALResult<null>> {
    try {
        await requireAdmin();

        const validated = ReorderInputSchema.parse(order);

        // Convert bigint to number for JSON serialization (Supabase RPC)
        const orderData = validated.map((item) => ({
            id: Number(item.id),
            position: item.position,
        }));

        const supabase = await createClient();
        const { error } = await supabase.rpc("reorder_hero_slides", {
            order_data: orderData,
        });

        if (error) {
            console.error("[DAL] reorderHeroSlides error:", error);
            return {
                success: false,
                error: `[ERR_HERO_011] Failed to reorder hero slides: ${error.message}`,
            };
        }

        return { success: true, data: null };
    } catch (err: unknown) {
        console.error("[DAL] reorderHeroSlides unexpected error:", err);
        return {
            success: false,
            error:
                err instanceof Error ? err.message : "[ERR_HERO_012] Unknown error",
        };
    }
}
