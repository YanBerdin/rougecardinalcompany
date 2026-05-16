"use client";

import { useCallback } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { ActionResult } from "@/lib/actions/types";
import {
    useFormAutosave,
    type FormAutoSaveStatus,
    type UseFormAutosaveReturn,
} from "@/lib/hooks/use-form-autosave";
import type { PressReleaseFormValues } from "@/lib/schemas/press-release";

/**
 * Backwards-compatible alias for the generic auto-save status type.
 *
 * @deprecated Import `FormAutoSaveStatus` from `@/lib/hooks/use-form-autosave` instead.
 */
export type PressReleaseAutoSaveStatus = FormAutoSaveStatus;

export interface PressReleaseAutoSavePayload {
    title: string;
    slug?: string | null;
    description?: string | null;
    date_publication: Date | string;
    image_url?: string | null;
    image_media_id?: bigint;
    spectacle_id?: bigint;
    evenement_id?: bigint;
    public: boolean;
    ordre_affichage: number;
}

export type PressReleaseAutoSaveUpdatePayload = Omit<PressReleaseAutoSavePayload, "title"> & {
    title?: string;
};

interface UsePressReleaseAutosaveOptions {
    form: UseFormReturn<PressReleaseFormValues>;
    enabled: boolean;
    initialDraftId?: string | null;
    triggerFields: Array<keyof PressReleaseFormValues>;
    debounceMs?: number;
    intervalMs?: number;
    onCreate: (payload: PressReleaseAutoSavePayload) => Promise<ActionResult<{ id: string }>>;
    onUpdate: (id: string, payload: PressReleaseAutoSaveUpdatePayload) => Promise<ActionResult>;
    buildDraftPayload: (values: PressReleaseFormValues) => PressReleaseAutoSavePayload;
}

type UsePressReleaseAutosaveReturn = UseFormAutosaveReturn;

const DRAFT_TITLE_FALLBACK = "(Sans titre)";

/**
 * Press-release-specific wrapper around `useFormAutosave`.
 *
 * Adds two domain-specific transforms:
 * - Create: ensures the required `title` is non-empty (falls back to `(Sans titre)`)
 *   and forces `public: false` so auto-saved drafts never go live.
 * - Update: omits an empty `title` so the partial update preserves the existing
 *   DB value, and forces `public: false`.
 */
export function usePressReleaseAutosave({
    form,
    enabled,
    initialDraftId = null,
    triggerFields,
    debounceMs,
    intervalMs,
    onCreate,
    onUpdate,
    buildDraftPayload,
}: UsePressReleaseAutosaveOptions): UsePressReleaseAutosaveReturn {
    const transformCreatePayload = useCallback(
        (payload: PressReleaseAutoSavePayload): PressReleaseAutoSavePayload => ({
            ...payload,
            title: payload.title?.trim() || DRAFT_TITLE_FALLBACK,
            public: false,
        }),
        []
    );

    const transformUpdatePayload = useCallback(
        (payload: PressReleaseAutoSavePayload): PressReleaseAutoSaveUpdatePayload => {
            const { title, ...rest } = payload;
            const titleUpdate = title?.trim() ? { title } : {};
            return { ...rest, ...titleUpdate, public: false };
        },
        []
    );

    return useFormAutosave<
        PressReleaseFormValues,
        PressReleaseAutoSavePayload,
        PressReleaseAutoSaveUpdatePayload
    >({
        form,
        enabled,
        initialDraftId,
        triggerFields,
        debounceMs,
        intervalMs,
        onCreate,
        onUpdate,
        buildDraftPayload,
        transformCreatePayload,
        transformUpdatePayload,
    });
}
