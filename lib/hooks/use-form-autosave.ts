"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import type { ActionResult } from "@/lib/actions/types";

/**
 * Auto-save state machine status.
 */
export type FormAutoSaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

/**
 * Options for the generic auto-save hook.
 *
 * @template TFormValues - The react-hook-form values shape
 * @template TPayload - Payload shape passed to `onCreate`
 * @template TUpdatePayload - Payload shape passed to `onUpdate` (usually partial)
 */
export interface UseFormAutosaveOptions<
    TFormValues extends FieldValues,
    TPayload,
    TUpdatePayload,
> {
    form: UseFormReturn<TFormValues>;
    enabled: boolean;
    initialDraftId?: string | null;
    triggerFields: Array<Path<TFormValues>>;
    debounceMs?: number;
    intervalMs?: number;
    onCreate: (payload: TPayload) => Promise<ActionResult<{ id: string }>>;
    onUpdate: (id: string, payload: TUpdatePayload) => Promise<ActionResult>;
    buildDraftPayload: (values: TFormValues) => TPayload;
    /**
     * Optional transform applied to the create payload before sending it to
     * `onCreate`. Use this to force draft-specific overrides (e.g. `public: false`,
     * placeholder title).
     */
    transformCreatePayload?: (payload: TPayload) => TPayload;
    /**
     * Optional transform applied to the update payload before sending it to
     * `onUpdate`. Use this to omit empty required fields so the partial update
     * preserves the existing DB value (e.g. drop empty title).
     */
    transformUpdatePayload?: (payload: TPayload) => TUpdatePayload;
}

export interface UseFormAutosaveReturn {
    status: FormAutoSaveStatus;
    lastSavedAt: Date | null;
    errorMessage: string | null;
    draftId: string | null;
    isSaving: boolean;
}

/**
 * Generic auto-save hook for react-hook-form.
 *
 * Behavior:
 * - State machine: `idle | dirty | saving | saved | error`
 * - Debounces saves on watched field changes (`debounceMs`, default 2000ms)
 * - Heartbeat retry on dirty/error every `intervalMs` (default 30000ms)
 * - Concurrency guard via `isSavingRef` / `hasQueuedSaveRef`
 * - Cleans timers on unmount
 *
 * Wire `beforeunload` in the consuming component using `isSaving` to warn
 * users when a save is in flight.
 */
export function useFormAutosave<
    TFormValues extends FieldValues,
    TPayload,
    TUpdatePayload = Partial<TPayload>,
>({
    form,
    enabled,
    initialDraftId = null,
    triggerFields,
    debounceMs = 2000,
    intervalMs = 30000,
    onCreate,
    onUpdate,
    buildDraftPayload,
    transformCreatePayload,
    transformUpdatePayload,
}: UseFormAutosaveOptions<TFormValues, TPayload, TUpdatePayload>): UseFormAutosaveReturn {
    const [status, setStatus] = useState<FormAutoSaveStatus>("idle");
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [draftId, setDraftId] = useState<string | null>(initialDraftId);

    const draftIdRef = useRef<string | null>(initialDraftId);
    const statusRef = useRef<FormAutoSaveStatus>("idle");
    const triggerFieldsRef = useRef<Array<Path<TFormValues>>>(triggerFields);
    const isMountedRef = useRef(true);
    const isSavingRef = useRef(false);
    const hasQueuedSaveRef = useRef(false);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Keep latest callbacks in refs to avoid recreating saveDraft on every render.
    const onCreateRef = useRef(onCreate);
    const onUpdateRef = useRef(onUpdate);
    const buildDraftPayloadRef = useRef(buildDraftPayload);
    const transformCreatePayloadRef = useRef(transformCreatePayload);
    const transformUpdatePayloadRef = useRef(transformUpdatePayload);

    useEffect(() => {
        onCreateRef.current = onCreate;
        onUpdateRef.current = onUpdate;
        buildDraftPayloadRef.current = buildDraftPayload;
        transformCreatePayloadRef.current = transformCreatePayload;
        transformUpdatePayloadRef.current = transformUpdatePayload;
    }, [onCreate, onUpdate, buildDraftPayload, transformCreatePayload, transformUpdatePayload]);

    const updateStatus = useCallback((nextStatus: FormAutoSaveStatus) => {
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

    const hasDraftContent = useCallback((values: TFormValues): boolean => {
        return triggerFieldsRef.current.some((fieldName) => {
            const fieldValue = values[fieldName];
            if (typeof fieldValue === "string") {
                return fieldValue.trim().length > 0;
            }
            return fieldValue !== null && fieldValue !== undefined;
        });
    }, []);

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
            const basePayload = buildDraftPayloadRef.current(values);
            const currentDraftId = draftIdRef.current;

            if (!currentDraftId) {
                const createPayload = transformCreatePayloadRef.current
                    ? transformCreatePayloadRef.current(basePayload)
                    : basePayload;
                const createResult = await onCreateRef.current(createPayload);
                if (!createResult.success) {
                    throw new Error(createResult.error);
                }

                const createdDraftId = createResult.data.id;
                draftIdRef.current = createdDraftId;
                if (isMountedRef.current) {
                    setDraftId(createdDraftId);
                }
            } else {
                const updatePayload = transformUpdatePayloadRef.current
                    ? transformUpdatePayloadRef.current(basePayload)
                    : (basePayload as unknown as TUpdatePayload);
                const updateResult = await onUpdateRef.current(currentDraftId, updatePayload);
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
    }, [enabled, form, hasDraftContent, updateStatus]);

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
            if (!triggerFieldsRef.current.includes(name as Path<TFormValues>)) {
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
