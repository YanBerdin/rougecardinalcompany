"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { EventFormFields } from "./EventFormFields";
import { SpectacleSelect } from "./SpectacleSelect";
import { LieuSelect } from "./LieuSelect";
import {
    createEventAction,
    updateEventAction,
} from "@/app/(admin)/admin/agenda/actions-client";
import { EventFormSchema, type EventFormValues } from "@/lib/schemas/admin-agenda-ui";
import type {
    EventClientDTO,
    SpectacleClientDTO,
    LieuClientDTO,
} from "@/lib/types/admin-agenda-client";

interface EventFormProps {
    event?: EventClientDTO;
    spectacles: SpectacleClientDTO[];
    lieux: LieuClientDTO[];
}

export function EventForm({ event, spectacles, lieux }: EventFormProps) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    // ✅ Extraire TOUTES les valeurs primitives avant toute closure
    const eventIdForAction = event?.id ?? null;
    const isEditMode = !!event;

    // Préparer defaultValues complètement séparés de l'objet event
    const initialValues: EventFormValues = event
        ? {
            spectacle_id: Number(event.spectacle_id), // Force conversion
            date_debut: event.date_debut.slice(0, 16),
            start_time: event.start_time.slice(0, 5),
            status: event.status,
            lieu_id: event.lieu_id !== null ? Number(event.lieu_id) : null, // Force conversion
            date_fin: event.date_fin ? event.date_fin.slice(0, 16) : undefined,
            end_time: event.end_time?.slice(0, 5) ?? undefined,
            ticket_url: event.ticket_url ?? undefined,
            capacity: event.capacity ?? undefined,
            price_cents: event.price_cents ?? undefined,
        }
        : {
            spectacle_id: 0,
            date_debut: "",
            start_time: "",
            status: "scheduled",
            lieu_id: null,
            date_fin: undefined,
            end_time: undefined,
            ticket_url: undefined,
            capacity: undefined,
            price_cents: undefined,
        };

    const form = useForm<EventFormValues>({
        resolver: zodResolver(EventFormSchema),
        defaultValues: initialValues,
    });

    const onSubmit = async (data: EventFormValues) => {
        setIsPending(true);

        try {
            // ✅ Envoyer les données brutes au format UI
            // La Server Action convertira vers le format serveur
            const result = isEditMode && eventIdForAction !== null
                ? await updateEventAction(String(eventIdForAction), data)
                : await createEventAction(data);

            if (!result.success) {
                throw new Error(result.error);
            }

            toast.success(isEditMode ? "Événement mis à jour" : "Événement créé");
            router.push("/admin/agenda");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erreur");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <SpectacleSelect form={form} spectacles={spectacles} />

                <LieuSelect form={form} lieux={lieux} />

                <EventFormFields form={form} />

                <div className="flex gap-2">
                    <Button type="button" variant="secondary" onClick={() => router.back()}>
                        Annuler
                    </Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending
                            ? "Enregistrement..."
                            : isEditMode
                                ? "Mettre à jour"
                                : "Créer"}
                    </Button>

                </div>
            </form>
        </Form>
    );
}
