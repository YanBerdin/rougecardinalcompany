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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form } from "@/components/ui/form";
import { AlertTriangle } from "lucide-react";
import { ImageFieldGroup } from "@/components/features/admin/media";
import { cleanPressReleaseFormData, getPressReleaseSuccessMessage } from "@/lib/utils/press-utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { updatePressReleaseAction } from "@/app/(admin)/admin/presse/press-releases-actions";
import { PressReleaseFormSchema, type PressReleaseFormValues, type PressReleaseDTO } from "@/lib/schemas/press-release";
import type { SelectOptionDTO } from "@/lib/schemas/press-release";

interface PressReleaseEditFormProps {
    release: PressReleaseDTO;
    spectacles?: SelectOptionDTO[];
    evenements?: SelectOptionDTO[];
}

export function PressReleaseEditForm({ release, spectacles = [], evenements = [] }: PressReleaseEditFormProps) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    const form = useForm<PressReleaseFormValues>({
        resolver: zodResolver(PressReleaseFormSchema),
        defaultValues: {
            title: release.title,
            slug: release.slug ?? "",
            description: release.description ?? "",
            date_publication: release.date_publication.split("T")[0],
            image_url: release.image_url ?? "",
            image_media_id: release.image_media_id ?? undefined,
            spectacle_id: release.spectacle_id ?? undefined,
            evenement_id: release.evenement_id ?? undefined,
            public: release.public,
            ordre_affichage: release.ordre_affichage,
        },
    });

    // Pattern 1: Image validation state (initialized from existing data)
    const [isImageValidated, setIsImageValidated] = useState<boolean | null>(
        release.image_url || release.image_media_id ? true : null
    );

    // Pattern 2: Progressive warning state
    const [showPublicWarning, setShowPublicWarning] = useState(false);

    // Pattern 2: Progressive validation logic
    useEffect(() => {
        const subscription = form.watch((value) => {
            const { public: isPublic, image_url, image_media_id } = value;

            if (isPublic && !image_url && !image_media_id && isImageValidated !== true) {
                setShowPublicWarning(true);
            } else {
                setShowPublicWarning(false);
            }
        });
        return () => subscription.unsubscribe();
    }, [form, isImageValidated]);

    const onSubmit = async (data: PressReleaseFormValues) => {
        // Pattern 1: Image validation gate
        if (isImageValidated !== true && (data.image_url || data.image_media_id)) {
            toast.error("Veuillez attendre la validation de l'image");
            return;
        }

        // Pattern 1: Public releases require image
        if (data.public && !data.image_url && !data.image_media_id) {
            toast.error("Les communiqués publics nécessitent une image");
            return;
        }

        setIsPending(true);

        try {
            // Pattern 4: Clean form data (number → bigint conversions)
            const cleanedData = cleanPressReleaseFormData(data);
            const result = await updatePressReleaseAction(String(release.id), cleanedData);

            if (!result.success) {
                throw new Error(result.error);
            }

            // Pattern 5: Contextualized success message
            toast.success("Communiqué mis à jour", getPressReleaseSuccessMessage(true, data.title));
            router.push("/admin/presse");
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
                {/* Pattern 2: Progressive validation warning */}
            {showPublicWarning && (
                <Alert className="border-yellow-500 bg-yellow-50 text-yellow-900 dark:bg-yellow-900/10 dark:text-yellow-500">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        Les communiqués publics nécessitent une image.
                    </AlertDescription>
                </Alert>
            )}

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
                            placeholder="⚠️ Laissez vide pour génération automatique ⚠️"
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

                    {/* Pattern 3: ImageFieldGroup with validation callback */}
                    <ImageFieldGroup
                        form={form}
                        imageUrlField="image_url"
                        imageMediaIdField="image_media_id"
                        uploadFolder="presse"
                        showUpload={true}
                        onValidationChange={(isValid) => setIsImageValidated(isValid)}
                    />
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
        </Form>
    );
}
