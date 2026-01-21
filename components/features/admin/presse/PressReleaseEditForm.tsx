"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { updatePressReleaseAction } from "@/app/(admin)/admin/presse/actions";
import { fetchSpectaclesForSelect, fetchEvenementsForSelect } from "@/lib/dal/admin-press-releases";
import { PressReleaseFormSchema, type PressReleaseFormValues, type PressReleaseDTO } from "@/lib/schemas/press-release";
import type { SelectOptionDTO } from "@/lib/schemas/press-release";

interface PressReleaseEditFormProps {
    release: PressReleaseDTO;
}

export function PressReleaseEditForm({ release }: PressReleaseEditFormProps) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [spectacles, setSpectacles] = useState<SelectOptionDTO[]>([]);
    const [evenements, setEvenements] = useState<SelectOptionDTO[]>([]);

    const form = useForm<PressReleaseFormValues>({
        resolver: zodResolver(PressReleaseFormSchema),
        defaultValues: {
            title: release.title,
            slug: release.slug ?? "",
            description: release.description ?? "",
            date_publication: release.date_publication.split("T")[0],
            image_url: release.image_url ?? "",
            spectacle_id: release.spectacle_id ?? undefined,
            evenement_id: release.evenement_id ?? undefined,
            public: release.public,
            ordre_affichage: release.ordre_affichage,
        },
    });

    useEffect(() => {
        async function loadOptions() {
            const [spectaclesRes, evenementsRes] = await Promise.all([
                fetchSpectaclesForSelect(),
                fetchEvenementsForSelect(),
            ]);
            if (spectaclesRes.success) setSpectacles(spectaclesRes.data);
            if (evenementsRes.success) setEvenements(evenementsRes.data);
        }
        loadOptions();
    }, []);

    const onSubmit = async (data: PressReleaseFormValues) => {
        setIsPending(true);

        try {
            const result = await updatePressReleaseAction(String(release.id), data);

            if (!result.success) {
                throw new Error(result.error);
            }

            toast.success("Communiqué mis à jour");
            router.push("/admin/presse");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erreur");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Informations générales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="title">Titre *</Label>
                        <Input
                            id="title"
                            {...form.register("title")}
                            disabled={isPending}
                        />
                        {form.formState.errors.title && (
                            <p className="text-red-600 text-sm mt-1">
                                {form.formState.errors.title.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="slug">Slug</Label>
                        <Input
                            id="slug"
                            {...form.register("slug")}
                            disabled={isPending}
                        />
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            {...form.register("description")}
                            disabled={isPending}
                            rows={6}
                        />
                    </div>

                    <div>
                        <Label htmlFor="date_publication">Date de publication *</Label>
                        <Input
                            id="date_publication"
                            type="date"
                            {...form.register("date_publication")}
                            disabled={isPending}
                        />
                    </div>

                    <div>
                        <Label htmlFor="image_url">URL image externe</Label>
                        <Input
                            id="image_url"
                            type="url"
                            {...form.register("image_url")}
                            disabled={isPending}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Liaisons contextuelles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="spectacle_id">Spectacle associé</Label>
                        <Select
                            defaultValue={release.spectacle_id ? String(release.spectacle_id) : undefined}
                            onValueChange={(value) => form.setValue("spectacle_id", value ? Number(value) : undefined)}
                            disabled={isPending}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un spectacle (optionnel)" />
                            </SelectTrigger>
                            <SelectContent>
                                {spectacles.map((s) => (
                                    <SelectItem key={s.id} value={String(s.id)}>
                                        {s.titre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="evenement_id">Événement associé</Label>
                        <Select
                            defaultValue={release.evenement_id ? String(release.evenement_id) : undefined}
                            onValueChange={(value) => form.setValue("evenement_id", value ? Number(value) : undefined)}
                            disabled={isPending}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un événement (optionnel)" />
                            </SelectTrigger>
                            <SelectContent>
                                {evenements.map((e) => (
                                    <SelectItem key={e.id} value={String(e.id)}>
                                        {e.titre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Publication</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="public"
                            checked={form.watch("public")}
                            onCheckedChange={(checked) => form.setValue("public", checked)}
                            disabled={isPending}
                        />
                        <Label htmlFor="public">Publier</Label>
                    </div>
                </CardContent>
            </Card>

            <div className="flex gap-2 justify-end">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isPending}
                >
                    Annuler
                </Button>
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Mise à jour..." : "Mettre à jour"}
                </Button>
            </div>
        </form>
    );
}
