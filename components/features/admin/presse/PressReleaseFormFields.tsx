"use client";

import type { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ImageField } from "@/components/features/admin/media";
import type {
    PressReleaseFormValues,
    SelectOptionDTO,
} from "@/lib/schemas/press-release";

interface PressReleaseFormFieldsProps {
    form: UseFormReturn<PressReleaseFormValues>;
    isPending: boolean;
    spectacles: SelectOptionDTO[];
    evenements: SelectOptionDTO[];
    publishLabel: string;
    onImageValidationChange: (isValid: boolean | null) => void;
    initialSpectacleId?: number | null;
    initialEvenementId?: number | null;
    imageLabel?: string;
    imageDescription?: string;
}

export function PressReleaseFormFields({
    form,
    isPending,
    spectacles,
    evenements,
    publishLabel,
    onImageValidationChange,
    initialSpectacleId,
    initialEvenementId,
    imageLabel,
    imageDescription,
}: PressReleaseFormFieldsProps) {
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Informations générales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="title">Titre *</Label>
                        <Input
                            id="title"
                            aria-describedby={form.formState.errors.title ? "title-error" : undefined}
                            {...form.register("title")}
                            disabled={isPending}
                        />
                        {form.formState.errors.title && (
                            <p id="title-error" role="alert" className="text-red-600 text-sm mt-1">
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

                    <ImageField.Provider
                        form={form}
                        imageUrlField="image_url"
                        imageMediaIdField="image_media_id"
                        uploadFolder="presse"
                        showUpload={true}
                        label={imageLabel}
                        description={imageDescription}
                        onValidationChange={onImageValidationChange}
                    >
                        <ImageField.SourceActions showUpload={true} />
                        <ImageField.Preview />
                    </ImageField.Provider>
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
                            defaultValue={initialSpectacleId ? String(initialSpectacleId) : undefined}
                            onValueChange={(value) => form.setValue("spectacle_id", value ? Number(value) : undefined)}
                            disabled={isPending}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un spectacle (optionnel)" />
                            </SelectTrigger>
                            <SelectContent>
                                {spectacles.map((spectacle) => (
                                    <SelectItem key={spectacle.id} value={String(spectacle.id)}>
                                        {spectacle.titre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="evenement_id">Événement associé</Label>
                        <Select
                            defaultValue={initialEvenementId ? String(initialEvenementId) : undefined}
                            onValueChange={(value) => form.setValue("evenement_id", value ? Number(value) : undefined)}
                            disabled={isPending}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un événement (optionnel)" />
                            </SelectTrigger>
                            <SelectContent>
                                {evenements.map((evenement) => (
                                    <SelectItem key={evenement.id} value={String(evenement.id)}>
                                        {evenement.titre}
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
                        <Label htmlFor="public">{publishLabel}</Label>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
