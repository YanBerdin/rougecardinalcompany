"use server";

import { revalidatePath } from "next/cache";
import {
    PressReleaseInputSchema,
    PublishPressReleaseSchema,
    type PressReleaseInput,
} from "@/lib/schemas/press-release";
import {
    ArticleInputSchema,
    type ArticleInput,
} from "@/lib/schemas/press-article";
import {
    PressContactInputSchema,
    TogglePressContactActiveSchema,
    type PressContactInput,
} from "@/lib/schemas/press-contact";
import {
    createPressRelease,
    updatePressRelease,
    deletePressRelease,
    publishPressRelease,
    unpublishPressRelease,
} from "@/lib/dal/admin-press-releases";
import {
    createArticle,
    updateArticle,
    deleteArticle,
} from "@/lib/dal/admin-press-articles";
import {
    createPressContact,
    updatePressContact,
    deletePressContact,
    togglePressContactActive,
} from "@/lib/dal/admin-press-contacts";

export type ActionResult<T = unknown> =
    | { success: true; data?: T }
    | { success: false; error: string };

// =============================================================================
// PRESS RELEASES ACTIONS
// =============================================================================

/**
 * CREATE press release action
 */
export async function createPressReleaseAction(
    input: unknown
): Promise<ActionResult> {
    try {
        const validated: PressReleaseInput = await PressReleaseInputSchema.parseAsync(input);
        const result = await createPressRelease(validated);

        if (!result.success) {
            return { success: false, error: result.error ?? "Create failed" };
        }

        revalidatePath("/admin/presse");
        revalidatePath("/presse"); // Public page

        return { success: true, data: result.data };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * UPDATE press release action
 */
export async function updatePressReleaseAction(
    id: string,
    input: unknown
): Promise<ActionResult> {
    try {
        const validated = await PressReleaseInputSchema.partial().parseAsync(input);
        const result = await updatePressRelease(BigInt(id), validated);

        if (!result.success) {
            return { success: false, error: result.error ?? "Update failed" };
        }

        revalidatePath("/admin/presse");
        revalidatePath("/presse");

        return { success: true, data: result.data };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * DELETE press release action
 */
export async function deletePressReleaseAction(
    id: string
): Promise<ActionResult> {
    try {
        const result = await deletePressRelease(BigInt(id));

        if (!result.success) {
            return { success: false, error: result.error ?? "Delete failed" };
        }

        revalidatePath("/admin/presse");
        revalidatePath("/presse");

        return { success: true };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * PUBLISH press release action
 */
export async function publishPressReleaseAction(
    id: string
): Promise<ActionResult> {
    try {
        const validated = PublishPressReleaseSchema.parse({
            id: BigInt(id),
            public: true,
        });
        const result = await publishPressRelease(validated.id);

        if (!result.success) {
            return { success: false, error: result.error ?? "Publish failed" };
        }

        revalidatePath("/admin/presse");
        revalidatePath("/presse");

        return { success: true, data: result.data };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * UNPUBLISH press release action
 */
export async function unpublishPressReleaseAction(
    id: string
): Promise<ActionResult> {
    try {
        const validated = PublishPressReleaseSchema.parse({
            id: BigInt(id),
            public: false,
        });
        const result = await unpublishPressRelease(validated.id);

        if (!result.success) {
            return { success: false, error: result.error ?? "Unpublish failed" };
        }

        revalidatePath("/admin/presse");
        revalidatePath("/presse");

        return { success: true, data: result.data };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

// =============================================================================
// ARTICLES ACTIONS
// =============================================================================

/**
 * CREATE article action
 */
export async function createArticleAction(
    input: unknown
): Promise<ActionResult> {
    try {
        const validated: ArticleInput = await ArticleInputSchema.parseAsync(input);
        const result = await createArticle(validated);

        if (!result.success) {
            return { success: false, error: result.error ?? "Create failed" };
        }

        revalidatePath("/admin/presse");
        revalidatePath("/presse");

        return { success: true, data: result.data };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * UPDATE article action
 */
export async function updateArticleAction(
    id: string,
    input: unknown
): Promise<ActionResult> {
    try {
        const validated = await ArticleInputSchema.partial().parseAsync(input);
        const result = await updateArticle(BigInt(id), validated);

        if (!result.success) {
            return { success: false, error: result.error ?? "Update failed" };
        }

        revalidatePath("/admin/presse");
        revalidatePath("/presse");

        return { success: true, data: result.data };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * DELETE article action
 */
export async function deleteArticleAction(id: string): Promise<ActionResult> {
    try {
        const result = await deleteArticle(BigInt(id));

        if (!result.success) {
            return { success: false, error: result.error ?? "Delete failed" };
        }

        revalidatePath("/admin/presse");
        revalidatePath("/presse");

        return { success: true };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

// =============================================================================
// PRESS CONTACTS ACTIONS
// =============================================================================

/**
 * CREATE press contact action
 */
export async function createPressContactAction(
    input: unknown
): Promise<ActionResult> {
    try {
        const validated: PressContactInput = PressContactInputSchema.parse(input);
        const result = await createPressContact(validated);

        if (!result.success) {
            return { success: false, error: result.error ?? "Create failed" };
        }

        revalidatePath("/admin/presse");

        return { success: true, data: result.data };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * UPDATE press contact action
 */
export async function updatePressContactAction(
    id: string,
    input: unknown
): Promise<ActionResult> {
    try {
        const validated = PressContactInputSchema.partial().parse(input);
        const result = await updatePressContact(BigInt(id), validated);

        if (!result.success) {
            return { success: false, error: result.error ?? "Update failed" };
        }

        revalidatePath("/admin/presse");

        return { success: true, data: result.data };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * DELETE press contact action
 */
export async function deletePressContactAction(
    id: string
): Promise<ActionResult> {
    try {
        const result = await deletePressContact(BigInt(id));

        if (!result.success) {
            return { success: false, error: result.error ?? "Delete failed" };
        }

        revalidatePath("/admin/presse");

        return { success: true };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * TOGGLE press contact active status action
 */
export async function togglePressContactActiveAction(
    id: string,
    actif: boolean
): Promise<ActionResult> {
    try {
        const validated = TogglePressContactActiveSchema.parse({
            id: BigInt(id),
            actif,
        });
        const result = await togglePressContactActive(validated.id, validated.actif);

        if (!result.success) {
            return { success: false, error: result.error ?? "Toggle failed" };
        }

        revalidatePath("/admin/presse");

        return { success: true, data: result.data };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
