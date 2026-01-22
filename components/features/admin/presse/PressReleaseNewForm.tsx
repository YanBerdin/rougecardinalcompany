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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Form } from "@/components/ui/form";
import { AlertCircle } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ImageFieldGroup } from "@/components/features/admin/media";
import { createPressReleaseAction } from "@/app/(admin)/admin/presse/actions";
import { fetchSpectaclesForSelect, fetchEvenementsForSelect } from "@/lib/dal/admin-press-releases";
import { PressReleaseFormSchema, type PressReleaseFormValues } from "@/lib/schemas/press-release";
import { cleanPressReleaseFormData, getPressReleaseSuccessMessage } from "@/lib/utils/press-utils";
import type { SelectOptionDTO } from "@/lib/schemas/press-release";

export function PressReleaseNewForm() {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [spectacles, setSpectacles] = useState<SelectOptionDTO[]>([]);
    const [evenements, setEvenements] = useState<SelectOptionDTO[]>([]);
    const [isImageValidated, setIsImageValidated] = useState<boolean | null>(null);

    const form = useForm<PressReleaseFormValues>({
        resolver: zodResolver(PressReleaseFormSchema),
        defaultValues: {
            title: "",
            slug: "",
            description: "",
            date_publication: new Date().toISOString().split("T")[0],
            image_url: "",
            image_media_id: undefined,
            public: false,
            ordre_affichage: 0,
        },
    });

    // Warning progressif
    const isPublic = form.watch("public");
    const imageUrl = form.watch("image_url");
    const imageMediaId = form.watch("image_media_id");
    const [showPublicWarning, setShowPublicWarning] = useState(false);

    useEffect(() => {
        if (isPublic) {
            const title = form.getValues("title");
            const description = form.getValues("description");
            const datePublication = form.getValues("date_publication");

            const hasImage = imageUrl || imageMediaId;
            const isIncomplete =
                !title ||
                !description ||
                !datePublication ||
                !hasImage ||
                (imageUrl && isImageValidated !== true);

            setShowPublicWarning(Boolean(isIncomplete));
        } else {
            setShowPublicWarning(false);
        }
    }, [
        isPublic,
        imageUrl,
        imageMediaId,
        isImageValidated,
        form.watch("title"),
        form.watch("description"),
        form.watch("date_publication"),
    ]);

    // Load dropdowns
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
        // Validation critique : image doit être validée si URL externe fournie
        if (data.image_url && data.image_url !== "") {
            if (isImageValidated !== true) {
                toast.error("Image non validée", {
                    description: "Veuillez vérifier que l'URL de l'image est accessible.",
                });
                return;
            }
        }

        // Validation critique : publication publique nécessite une image
        if (data.public && !data.image_url && !data.image_media_id) {
            toast.error("Image requise", {
                description: "Un communiqué visible publiquement doit avoir une image.",
            });
            return;
        }

        setIsPending(true);

        try {
            const cleanData = cleanPressReleaseFormData(data);
            const result = await createPressReleaseAction(cleanData);

            if (!result.success) {
                throw new Error(result.error);
            }

            toast.success("Communiqué créé", getPressReleaseSuccessMessage(false, data.title));
            form.reset();
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
                {/* Warning progressif */}
            {showPublicWarning && (
                <Alert className="border-yellow-500 bg-yellow-50 text-yellow-900 dark:bg-yellow-900/10 dark:text-yellow-500">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Publication incomplète</AlertTitle>
                    <AlertDescription>
                        Certains champs requis sont manquants pour la publication publique.
                        Le communiqué sera sauvegardé mais non visible publiquement.
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
                            placeholder="url-friendly-identifier"
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

                    {/* Image avec ImageFieldGroup */}
                    <ImageFieldGroup
                        form={form}
                        imageUrlField="image_url"
                        imageMediaIdField="image_media_id"
                        label="Image du communiqué"
                        showUpload={true}
                        uploadFolder="presse"
                        description="Image principale affichée dans le kit média (recommandé : 1200x630px)"
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
                        <Label htmlFor="public">Publier immédiatement</Label>
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
                    {isPending ? "Création..." : "Créer"}
                </Button>
            </div>
            </form>
        </Form>
    );
}
