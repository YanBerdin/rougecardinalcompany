"use server";
import "server-only";
import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";
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
 * Create new hero slide
 * @param input - Hero slide data
 * @returns Created hero slide
 */
export async function createHeroSlide(input: HeroSlideInput): Promise<DALResult<HeroSlideDTO>> {
    try {
        await requireAdmin();

        const validated = HeroSlideInputSchema.parse(input);

        const supabase = await createClient();
        const { data, error } = await supabase
            .from("home_hero_slides")
            .insert(validated)
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
        const { data, error } = await supabase
            .from("home_hero_slides")
            .update({ ...validated, updated_at: new Date().toISOString() })
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
 * Soft delete hero slide (set active=false)
 * @param id - Hero slide ID
 * @returns Success status
 */
export async function deleteHeroSlide(id: bigint): Promise<DALResult<null>> {
    try {
        await requireAdmin();

        const supabase = await createClient();
        const { error } = await supabase
            .from("home_hero_slides")
            .update({ active: false, updated_at: new Date().toISOString() })
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
