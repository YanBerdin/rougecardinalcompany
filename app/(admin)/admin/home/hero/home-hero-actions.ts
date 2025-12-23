"use server";
import "server-only";

import { revalidatePath } from "next/cache";
import type { HeroSlideInput, ReorderInput } from "@/lib/schemas/home-content";
import { HeroSlideInputSchema, ReorderInputSchema } from "@/lib/schemas/home-content";
import {
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  reorderHeroSlides,
} from "@/lib/dal/admin-home-hero";
import { validateImageUrl } from "@/lib/utils/validate-image-url";

export type ActionResult<T = unknown> = { success: true; data?: T } | { success: false; error: string };

export async function createHeroSlideAction(input: unknown): Promise<ActionResult> {
  try {
    const validated = HeroSlideInputSchema.parse(input);
    
    // Validate external image URL if provided
    if (validated.image_url) {
      const urlValidation = await validateImageUrl(validated.image_url);
      if (!urlValidation.valid) {
        return {
          success: false,
          error: urlValidation.error || "URL d'image invalide ou non autorisée",
        };
      }
    }
    
    const result = await createHeroSlide(validated as HeroSlideInput);

    if (!result.success) return { success: false, error: result.error ?? "create failed" };

    // revalidate pages so server components reflect change immediately
    revalidatePath("/admin/home/hero");
    revalidatePath("/");

    // Don't return data with bigint - client will refresh to get updated list
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function updateHeroSlideAction(id: string | number, input: unknown): Promise<ActionResult> {
  try {
    const slideId = typeof id === "string" ? Number(id) : Number(id);
    const validated = HeroSlideInputSchema.partial().parse(input);
    
    // Validate external image URL if provided
    if (validated.image_url) {
      const urlValidation = await validateImageUrl(validated.image_url);
      if (!urlValidation.valid) {
        return {
          success: false,
          error: urlValidation.error || "URL d'image invalide ou non autorisée",
        };
      }
    }
    
    const result = await updateHeroSlide(slideId, validated as Partial<HeroSlideInput>);

    if (!result.success) return { success: false, error: result.error ?? "update failed" };

    revalidatePath("/admin/home/hero");
    revalidatePath("/");

    // Don't return data with bigint - client will refresh to get updated list
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function deleteHeroSlideAction(id: string | number): Promise<ActionResult<null>> {
  try {
    const slideId = typeof id === "string" ? Number(id) : Number(id);
    const result = await deleteHeroSlide(slideId);
    if (!result.success) return { success: false, error: result.error ?? "delete failed" };

    revalidatePath("/admin/home/hero");
    revalidatePath("/");

    return { success: true, data: null };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function reorderHeroSlidesAction(order: unknown): Promise<ActionResult<null>> {
  try {
    const validated = ReorderInputSchema.parse(order);
    const result = await reorderHeroSlides(validated as ReorderInput);

    if (!result.success) return { success: false, error: result.error ?? "reorder failed" };

    revalidatePath("/admin/home/hero");
    revalidatePath("/");

    return { success: true, data: null };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
