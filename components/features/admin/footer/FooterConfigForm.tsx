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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateFooterConfigAction } from "@/lib/actions/footer-config-actions";
import {
    FooterConfigFormSchema,
    type FooterConfigFormValues,
} from "@/lib/schemas/footer-config";
import type { FooterConfigFormProps } from "./types";

export function FooterConfigForm({ initialConfig }: FooterConfigFormProps) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    const form = useForm<FooterConfigFormValues>({
        resolver: zodResolver(FooterConfigFormSchema),
        defaultValues: {
            description: initialConfig.description ?? "",
            contact: {
                email: initialConfig.contact?.email ?? "",
                phone: initialConfig.contact?.phone ?? "",
                address: initialConfig.contact?.address ?? "",
            },
            socialLinks: {
                facebook: initialConfig.socialLinks?.facebook ?? "",
                instagram: initialConfig.socialLinks?.instagram ?? "",
                twitter: initialConfig.socialLinks?.twitter ?? "",
            },
        },
    });

    const onSubmit = async (data: FooterConfigFormValues) => {
        setIsPending(true);
        try {
            const result = await updateFooterConfigAction(data);
            if (!result.success) {
                throw new Error(result.error);
            }
            toast.success("Footer mis à jour");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erreur");
        } finally {
            setIsPending(false);
        }
    };

    const descriptionValue = form.watch("description") ?? "";

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="description">
                            Description de la compagnie *
                        </Label>
                        <Textarea
                            id="description"
                            rows={4}
                            maxLength={500}
                            aria-describedby={
                                form.formState.errors.description ? "description-error" : undefined
                            }
                            {...form.register("description")}
                            disabled={isPending}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            {descriptionValue.length} / 500 caractères
                        </p>
                        {form.formState.errors.description && (
                            <p
                                id="description-error"
                                role="alert"
                                className="text-red-600 text-sm mt-1"
                            >
                                {form.formState.errors.description.message}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="contact-email">Email *</Label>
                        <Input
                            id="contact-email"
                            type="email"
                            aria-describedby={
                                form.formState.errors.contact?.email ? "contact-email-error" : undefined
                            }
                            {...form.register("contact.email")}
                            disabled={isPending}
                        />
                        {form.formState.errors.contact?.email && (
                            <p
                                id="contact-email-error"
                                role="alert"
                                className="text-red-600 text-sm mt-1"
                            >
                                {form.formState.errors.contact.email.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="contact-phone">Téléphone *</Label>
                        <Input
                            id="contact-phone"
                            type="tel"
                            aria-describedby={
                                form.formState.errors.contact?.phone ? "contact-phone-error" : undefined
                            }
                            {...form.register("contact.phone")}
                            disabled={isPending}
                        />
                        {form.formState.errors.contact?.phone && (
                            <p
                                id="contact-phone-error"
                                role="alert"
                                className="text-red-600 text-sm mt-1"
                            >
                                {form.formState.errors.contact.phone.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="contact-address">Adresse *</Label>
                        <Input
                            id="contact-address"
                            aria-describedby={
                                form.formState.errors.contact?.address ? "contact-address-error" : undefined
                            }
                            {...form.register("contact.address")}
                            disabled={isPending}
                        />
                        {form.formState.errors.contact?.address && (
                            <p
                                id="contact-address-error"
                                role="alert"
                                className="text-red-600 text-sm mt-1"
                            >
                                {form.formState.errors.contact.address.message}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Réseaux sociaux</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-xs text-muted-foreground">
                        Laissez vide pour masquer le bouton correspondant dans le footer.
                    </p>

                    <div>
                        <Label htmlFor="social-facebook">Facebook</Label>
                        <Input
                            id="social-facebook"
                            type="url"
                            placeholder="https://www.facebook.com/..."
                            aria-describedby={
                                form.formState.errors.socialLinks?.facebook ? "social-facebook-error" : undefined
                            }
                            {...form.register("socialLinks.facebook")}
                            disabled={isPending}
                        />
                        {form.formState.errors.socialLinks?.facebook && (
                            <p
                                id="social-facebook-error"
                                role="alert"
                                className="text-red-600 text-sm mt-1"
                            >
                                {form.formState.errors.socialLinks.facebook.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="social-instagram">Instagram</Label>
                        <Input
                            id="social-instagram"
                            type="url"
                            placeholder="https://www.instagram.com/..."
                            aria-describedby={
                                form.formState.errors.socialLinks?.instagram ? "social-instagram-error" : undefined
                            }
                            {...form.register("socialLinks.instagram")}
                            disabled={isPending}
                        />
                        {form.formState.errors.socialLinks?.instagram && (
                            <p
                                id="social-instagram-error"
                                role="alert"
                                className="text-red-600 text-sm mt-1"
                            >
                                {form.formState.errors.socialLinks.instagram.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="social-twitter">Twitter / X</Label>
                        <Input
                            id="social-twitter"
                            type="url"
                            placeholder="https://twitter.com/..."
                            aria-describedby={
                                form.formState.errors.socialLinks?.twitter ? "social-twitter-error" : undefined
                            }
                            {...form.register("socialLinks.twitter")}
                            disabled={isPending}
                        />
                        {form.formState.errors.socialLinks?.twitter && (
                            <p
                                id="social-twitter-error"
                                role="alert"
                                className="text-red-600 text-sm mt-1"
                            >
                                {form.formState.errors.socialLinks.twitter.message}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="flex gap-2 justify-end">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    disabled={isPending}
                >
                    Réinitialiser
                </Button>
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Enregistrement..." : "Enregistrer"}
                </Button>
            </div>
        </form>
    );
}
