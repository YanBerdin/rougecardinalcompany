"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { ImageFieldGroup } from "@/components/features/admin/media/ImageFieldGroup";
import { PartnerFormSchema, type PartnerFormValues } from "@/lib/schemas/partners";
import {
    createPartnerAction,
    updatePartnerAction,
} from "@/app/(admin)/admin/partners/actions";
import { ArrowLeft, Save } from "lucide-react";
import type { PartnerFormProps } from "./types";

export function PartnerForm({ partner }: PartnerFormProps) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    const form = useForm<PartnerFormValues>({
        resolver: zodResolver(PartnerFormSchema),
        defaultValues: partner
            ? {
                name: partner.name,
                website_url: partner.website_url ?? "",
                logo_url: partner.logo_url ?? "",
                logo_media_id: partner.logo_media_id !== null ? Number(partner.logo_media_id) : undefined,
                display_order: partner.display_order,
                active: partner.active,
            }
            : {
                name: "",
                website_url: "",
                logo_url: "",
                logo_media_id: undefined,
                display_order: 0,
                active: true,
            },
    });

    const onSubmit = async (data: PartnerFormValues) => {
        setIsPending(true);

        try {
            // Convert empty string to null for optional URL
            const submitData = {
                ...data,
                website_url: data.website_url || null,
            };

            const result = partner
                ? await updatePartnerAction(String(partner.id), submitData)
                : await createPartnerAction(submitData);

            if (!result.success) {
                throw new Error(result.error);
            }

            toast.success(partner ? "Partenaire mis à jour" : "Partenaire créé");
            router.push("/admin/partners");
            router.refresh();
        } catch (error) {
            toast.error("Erreur", {
                description: error instanceof Error ? error.message : "Erreur inconnue",
            });
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardContent className="pt-6 space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nom du partenaire *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ex: Théâtre National"
                                            {...field}
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="website_url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Site web</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="url"
                                            placeholder="https://exemple.com"
                                            {...field}
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        URL du site web du partenaire (optionnel)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <ImageFieldGroup
                            form={form}
                            imageUrlField="logo_url"
                            imageMediaIdField="logo_media_id"
                            label="Logo"
                            description="Logo du partenaire (format carré recommandé)"
                            showAltText={false}
                            showMediaLibrary={true}
                            showExternalUrl={false}
                            showUpload={true}
                            uploadFolder="partners"
                        />

                        <FormField
                            control={form.control}
                            name="active"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Actif</FormLabel>
                                        <FormDescription>
                                            Le partenaire sera visible sur le site public
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <div className="flex items-center gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={isPending}
                        onClick={() => router.push("/admin/partners")}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour
                    </Button>
                    <Button type="submit" disabled={isPending}>
                        <Save className="mr-2 h-4 w-4" />
                        {isPending ? "Enregistrement..." : partner ? "Mettre à jour" : "Créer"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
