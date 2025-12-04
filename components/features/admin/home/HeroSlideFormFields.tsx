"use client";

import { UseFormReturn } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { HeroSlideFormValues } from "@/lib/schemas/home-content";

interface HeroSlideFormFieldsProps {
    form: UseFormReturn<HeroSlideFormValues>;
}

export function HeroSlideFormFields({ form }: HeroSlideFormFieldsProps) {
    const watchSubtitle = form.watch("subtitle") ?? "";
    const watchDescription = form.watch("description") ?? "";

    return (
        <>
            <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                            <Input {...field} maxLength={80} placeholder="Main headline" />
                        </FormControl>
                        <FormDescription>
                            {field.value.length}/80 characters
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Subtitle</FormLabel>
                        <FormControl>
                            <Input {...field} maxLength={150} placeholder="Supporting text" />
                        </FormControl>
                        <FormDescription>
                            {watchSubtitle.length}/150 characters
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                            <Textarea {...field} maxLength={500} rows={3} />
                        </FormControl>
                        <FormDescription>
                            {watchDescription.length}/500 characters
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    );
}

interface HeroSlideCtaFieldsProps {
    form: UseFormReturn<HeroSlideFormValues>;
}

export function HeroSlideCtaFields({ form }: HeroSlideCtaFieldsProps) {
    const showCta = form.watch("show_cta");

    return (
        <div className="space-y-4">
            {/* Toggle to enable/disable CTA */}
            <FormField
                control={form.control}
                name="show_cta"
                render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">Afficher un Call-to-Action</FormLabel>
                            <div className="text-sm text-muted-foreground">
                                Ajouter un bouton d&apos;appel à l&apos;action sur ce slide
                            </div>
                        </div>
                        <FormControl>
                            <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                    </FormItem>
                )}
            />

            {/* CTA fields - only shown when toggle is enabled */}
            {showCta && (
                <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-primary/20">
                    <FormField
                        control={form.control}
                        name="cta_label"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>CTA Label *</FormLabel>
                                <FormControl>
                                    <Input {...field} maxLength={50} placeholder="En savoir plus" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="cta_url"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>CTA URL *</FormLabel>
                                <FormControl>
                                    <Input {...field} type="url" placeholder="https://..." />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            )}
        </div>
    );
}

interface HeroSlideActiveToggleProps {
    form: UseFormReturn<HeroSlideFormValues>;
}

export function HeroSlideActiveToggle({ form }: HeroSlideActiveToggleProps) {
    return (
        <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <div className="text-sm text-muted-foreground">
                            Display this slide on the homepage
                        </div>
                    </div>
                    <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                </FormItem>
            )}
        />
    );
}
