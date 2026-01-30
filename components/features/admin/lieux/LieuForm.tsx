"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { LieuFormFields } from "./LieuFormFields";
import {
    createLieuAction,
    updateLieuAction,
} from "@/app/(admin)/admin/lieux/actions";
import {
    LieuFormSchema,
    type LieuFormValues,
    type LieuClientDTO,
} from "@/lib/schemas/admin-lieux";

interface LieuFormProps {
    lieu?: LieuClientDTO;
}

export function LieuForm({ lieu }: LieuFormProps) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    const form = useForm<LieuFormValues>({
        resolver: zodResolver(LieuFormSchema),
        defaultValues: lieu
            ? {
                nom: lieu.nom,
                adresse: lieu.adresse ?? undefined,
                ville: lieu.ville ?? undefined,
                code_postal: lieu.code_postal ?? undefined,
                pays: lieu.pays,
                latitude: lieu.latitude ?? undefined,
                longitude: lieu.longitude ?? undefined,
                capacite: lieu.capacite ?? undefined,
            }
            : {
                nom: "",
                pays: "France",
                adresse: undefined,
                ville: undefined,
                code_postal: undefined,
                latitude: undefined,
                longitude: undefined,
                capacite: undefined,
            },
    });

    const onSubmit = async (data: LieuFormValues) => {
        setIsPending(true);

        try {
            const result = lieu
                ? await updateLieuAction(String(lieu.id), data)
                : await createLieuAction(data);

            if (!result.success) {
                throw new Error(result.error);
            }

            toast.success(lieu ? "Lieu mis à jour" : "Lieu créé");
            router.push("/admin/lieux");
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
                <LieuFormFields form={form} />

                <div className="flex gap-4">
                    <Button type="submit" disabled={isPending}>
                        {isPending
                            ? "Enregistrement..."
                            : lieu
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
