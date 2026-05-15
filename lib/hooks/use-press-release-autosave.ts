"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { ActionResult } from "@/lib/actions/types";
import type { PressReleaseFormValues } from "@/lib/schemas/press-release";

export type PressReleaseAutoSaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

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

interface UsePressReleaseAutosaveReturn {
    status: PressReleaseAutoSaveStatus;
    lastSavedAt: Date | null;
    errorMessage: string | null;
    draftId: string | null;
    isSaving: boolean;
}

export function usePressReleaseAutosave({
    form,
    enabled,
    initialDraftId = null,
    triggerFields,
    debounceMs = 2000,
    intervalMs = 30000,
    onCreate,
    onUpdate,
    buildDraftPayload,
}: UsePressReleaseAutosaveOptions): UsePressReleaseAutosaveReturn {
    const [status, setStatus] = useState<PressReleaseAutoSaveStatus>("idle");
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [draftId, setDraftId] = useState<string | null>(initialDraftId);

    const draftIdRef = useRef<string | null>(initialDraftId);
    const statusRef = useRef<PressReleaseAutoSaveStatus>("idle");
    const triggerFieldsRef = useRef<Array<keyof PressReleaseFormValues>>(triggerFields);
    const isMountedRef = useRef(true);
    const isSavingRef = useRef(false);
    const hasQueuedSaveRef = useRef(false);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const updateStatus = useCallback((nextStatus: PressReleaseAutoSaveStatus) => {
        statusRef.current = nextStatus;
        if (isMountedRef.current) {
            setStatus(nextStatus);
        }
    }, []);

    const clearDebounceTimer = useCallback(() => {
        if (!debounceTimerRef.current) return;
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
    }, []);

    const clearHeartbeatTimer = useCallback(() => {
        if (!heartbeatTimerRef.current) return;
        clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
    }, []);

    const hasDraftContent = useCallback(
        (values: PressReleaseFormValues): boolean => {
            return triggerFieldsRef.current.some((fieldName) => {
                const fieldValue = values[fieldName];
                if (typeof fieldValue === "string") {
                    return fieldValue.trim().length > 0;
                }
                return fieldValue !== null && fieldValue !== undefined;
            });
        },
        []
    );

    const saveDraft = useCallback(async () => {
        if (!enabled) return;

        const values = form.getValues();
        if (!hasDraftContent(values)) {
            setErrorMessage(null);
            updateStatus("idle");
            return;
        }

        if (isSavingRef.current) {
            hasQueuedSaveRef.current = true;
            return;
        }

        isSavingRef.current = true;
        setErrorMessage(null);
        updateStatus("saving");

        try {
            const basePayload = buildDraftPayload(values);
            const currentDraftId = draftIdRef.current;

            if (!currentDraftId) {
                // Create: title required by schema — use placeholder if empty
                const createPayload = {
                    ...basePayload,
                    title: basePayload.title?.trim() || "(Sans titre)",
                    public: false,
                };
                const createResult = await onCreate(createPayload);
                if (!createResult.success) {
                    throw new Error(createResult.error);
                }

                const createdDraftId = createResult.data.id;
                draftIdRef.current = createdDraftId;
                if (isMountedRef.current) {
                    setDraftId(createdDraftId);
                }
            } else {
                // Update: partial schema — omit title if empty to preserve existing DB value
                const { title, ...restPayload } = basePayload;
                const titleUpdate = title?.trim() ? { title } : {};
                const updatePayload = { ...restPayload, ...titleUpdate, public: false };
                const updateResult = await onUpdate(currentDraftId, updatePayload);
                if (!updateResult.success) {
                    throw new Error(updateResult.error);
                }
            }

            if (isMountedRef.current) {
                setLastSavedAt(new Date());
                setErrorMessage(null);
            }
            updateStatus("saved");
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Erreur de sauvegarde";
            if (isMountedRef.current) {
                setErrorMessage(message);
            }
            updateStatus("error");
        } finally {
            isSavingRef.current = false;

            if (hasQueuedSaveRef.current) {
                hasQueuedSaveRef.current = false;
                void saveDraft();
            }
        }
    }, [buildDraftPayload, enabled, form, hasDraftContent, onCreate, onUpdate, updateStatus]);

    const queueDebouncedSave = useCallback(() => {
        if (!enabled) return;

        if (statusRef.current !== "saving") {
            updateStatus("dirty");
        }

        clearDebounceTimer();
        debounceTimerRef.current = setTimeout(() => {
            void saveDraft();
        }, debounceMs);
    }, [clearDebounceTimer, debounceMs, enabled, saveDraft, updateStatus]);

    useEffect(() => {
        triggerFieldsRef.current = triggerFields;
    }, [triggerFields]);

    useEffect(() => {
        draftIdRef.current = initialDraftId;
        setDraftId(initialDraftId);
    }, [initialDraftId]);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (!enabled) {
            clearDebounceTimer();
            clearHeartbeatTimer();
            setErrorMessage(null);
            updateStatus("idle");
            return;
        }

        const subscription = form.watch((_value, { name }) => {
            if (!name) return;
            if (!triggerFieldsRef.current.includes(name as keyof PressReleaseFormValues)) {
                return;
            }

            queueDebouncedSave();
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [clearDebounceTimer, clearHeartbeatTimer, enabled, form, queueDebouncedSave, updateStatus]);

    useEffect(() => {
        if (!enabled) return;

        heartbeatTimerRef.current = setInterval(() => {
            if (statusRef.current === "dirty" || statusRef.current === "error") {
                void saveDraft();
            }
        }, intervalMs);

        return () => {
            clearHeartbeatTimer();
        };
    }, [clearHeartbeatTimer, enabled, intervalMs, saveDraft]);

    useEffect(() => {
        return () => {
            clearDebounceTimer();
            clearHeartbeatTimer();
        };
    }, [clearDebounceTimer, clearHeartbeatTimer]);

    return {
        status,
        lastSavedAt,
        errorMessage,
        draftId,
        isSaving: status === "saving",
    };
}
