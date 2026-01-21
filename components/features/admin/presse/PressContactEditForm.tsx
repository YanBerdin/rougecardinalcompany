"use client";

import { useState } from "react";
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
import { updatePressContactAction } from "@/app/(admin)/admin/presse/actions";
import { PressContactFormSchema, type PressContactFormValues, type PressContactDTO } from "@/lib/schemas/press-contact";

interface PressContactEditFormProps {
    contact: PressContactDTO;
}

export function PressContactEditForm({ contact }: PressContactEditFormProps) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    const form = useForm<PressContactFormValues>({
        resolver: zodResolver(PressContactFormSchema),
        defaultValues: {
            nom: contact.nom ?? "",
            prenom: contact.prenom ?? "",
            email: contact.email ?? "",
            telephone: contact.telephone ?? "",
            media: contact.media ?? "",
            fonction: contact.fonction ?? "",
            specialites: contact.specialites ?? [],
            notes: contact.notes ?? "",
            actif: contact.actif ?? true,
        },
    });

    const onSubmit = async (data: PressContactFormValues) => {
        setIsPending(true);

        try {
            const result = await updatePressContactAction(String(contact.id), data);

            if (!result.success) {
                throw new Error(result.error);
            }

            toast.success("Contact mis à jour");
            router.push("/admin/presse");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erreur");
        } finally {
            setIsPending(false);
        }
    };

    const handleTagsChange = (value: string) => {
        const tags = value.split(",").map((tag) => tag.trim()).filter(Boolean);
        form.setValue("specialites", tags);
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Informations personnelles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="prenom">Prénom *</Label>
                            <Input
                                id="prenom"
                                {...form.register("prenom")}
                                disabled={isPending}
                            />
                            {form.formState.errors.prenom && (
                                <p className="text-red-600 text-sm mt-1">
                                    {form.formState.errors.prenom.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="nom">Nom *</Label>
                            <Input
                                id="nom"
                                {...form.register("nom")}
                                disabled={isPending}
                            />
                            {form.formState.errors.nom && (
                                <p className="text-red-600 text-sm mt-1">
                                    {form.formState.errors.nom.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            {...form.register("email")}
                            disabled={isPending}
                        />
                        {form.formState.errors.email && (
                            <p className="text-red-600 text-sm mt-1">
                                {form.formState.errors.email.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="telephone">Téléphone</Label>
                        <Input
                            id="telephone"
                            {...form.register("telephone")}
                            disabled={isPending}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Informations professionnelles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="media">Média / Organisation *</Label>
                        <Input
                            id="media"
                            {...form.register("media")}
                            disabled={isPending}
                        />
                    </div>

                    <div>
                        <Label htmlFor="fonction">Fonction</Label>
                        <Input
                            id="fonction"
                            {...form.register("fonction")}
                        />
                    </div>

                    <div>
                        <Label htmlFor="specialites">Spécialités (séparées par des virgules)</Label>
                        <Input
                            id="specialites"
                            placeholder="Théâtre, Danse, Critique culturelle"
                            defaultValue={contact.specialites?.join(", ") ?? ""}
                            onChange={(e) => handleTagsChange(e.target.value)}
                            disabled={isPending}
                        />
                    </div>

                    <div>
                        <Label htmlFor="notes">Notes internes</Label>
                        <Textarea
                            id="notes"
                            {...form.register("notes")}
                            disabled={isPending}
                            rows={4}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Statut</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="actif"
                            checked={form.watch("actif")}
                            onCheckedChange={(checked) => form.setValue("actif", checked)}
                            disabled={isPending}
                        />
                        <Label htmlFor="actif">Contact actif</Label>
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
