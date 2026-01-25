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
} from "@/app/(admin)/admin/agenda/actions";
import {
    EventFormSchema,
    type EventFormValues,
    type EventDTO,
    type LieuDTO,
} from "@/lib/schemas/admin-agenda";
import type { SpectacleSummary } from "@/lib/schemas/spectacles";

interface EventFormProps {
  event?: EventDTO;
  spectacles: SpectacleSummary[];
  lieux: LieuDTO[];
}

export function EventForm({ event, spectacles, lieux }: EventFormProps) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    const form = useForm<EventFormValues>({
        resolver: zodResolver(EventFormSchema),
        defaultValues: event
            ? {
                spectacle_id: Number(event.spectacle_id),
                date_debut: event.date_debut,
                start_time: event.start_time.slice(0, 5), // HH:MM:SS → HH:MM
                status: event.status,
                tags: event.tags,
                lieu_id: event.lieu_id ? Number(event.lieu_id) : null,
                date_fin: event.date_fin ?? undefined,
                end_time: event.end_time?.slice(0, 5) ?? undefined,
                notes: event.notes ?? undefined,
                ticket_url: event.ticket_url ?? undefined,
                capacity: event.capacity ?? undefined,
                price_cents: event.price_cents ?? undefined,
            }
            : {
                spectacle_id: 0,
                date_debut: "",
                start_time: "",
                status: "scheduled",
                tags: [],
                lieu_id: null,
                date_fin: undefined,
                end_time: undefined,
                notes: undefined,
                ticket_url: undefined,
                capacity: undefined,
                price_cents: undefined,
            },
    });

    const onSubmit = async (data: EventFormValues) => {
        setIsPending(true);

        try {
            // Convertir time HH:MM → HH:MM:SS pour le serveur
            const serverData = {
                ...data,
                start_time: `${data.start_time}:00`,
                end_time: data.end_time ? `${data.end_time}:00` : undefined,
            };

            const result = event
                ? await updateEventAction(String(event.id), serverData)
                : await createEventAction(serverData);

            if (!result.success) {
                throw new Error(result.error);
            }

            toast.success(event ? "Événement mis à jour" : "Événement créé");
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

                <div className="flex gap-4">
                    <Button type="submit" disabled={isPending}>
                        {isPending
                            ? "Enregistrement..."
                            : event
                                ? "Mettre à jour"
                                : "Créer"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Annuler
                    </Button>
                </div>
            </form>
        </Form>
    );
}
