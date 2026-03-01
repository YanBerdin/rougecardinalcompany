"use client";

import { UseFormReturn } from "react-hook-form";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { SpectacleFormValues } from "@/lib/forms/spectacle-form-helpers";
import type { SpectacleFormFieldsProps } from "./types";

export function SpectacleFormFields({
    form,
    isPublic,
}: SpectacleFormFieldsProps) {
    return (
        <>
            {/* Title */}
            <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Titre *</FormLabel>
                        <FormControl>
                            <Input placeholder="Hamlet" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Slug */}
            <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                            <Input
                                placeholder="⚠️ Laissez vide pour génération automatique ⚠️"
                                {...field}
                            />
                        </FormControl>
                        <FormDescription>
                            ⚠️ Si titre modifié → Vider le champ Slug pour une génération automatique à partir du titre. <br/>⚠️ Sinon, assurez-vous que le slug est unique (lettres, chiffres, tirets, → sans espace).
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Short Description */}
            <FormField
                control={form.control}
                name="short_description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            Description courte{" "}
                            {isPublic && <span className="text-destructive">*</span>}
                        </FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Un résumé bref pour les listes..."
                                className="resize-none"
                                {...field}
                            />
                        </FormControl>
                        <FormDescription>Maximum 500 caractères</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Full Description */}
            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            Description complète{" "}
                            {isPublic && <span className="text-destructive">*</span>}
                        </FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Description détaillée du spectacle..."
                                className="resize-none min-h-32"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Paragraph 2 - Supplémentaire 1 */}
            <FormField
                control={form.control}
                name="paragraph_2"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Paragraphe supplémentaire 1</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Contenu narratif additionnel (affiché après la première photo)..."
                                className="resize-none min-h-32"
                                {...field}
                            />
                        </FormControl>
                        <FormDescription>
                            Optionnel - Aucune limite de caractères
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Paragraph 3 - Supplémentaire 2 */}
            <FormField
                control={form.control}
                name="paragraph_3"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Paragraphe supplémentaire 2</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Contenu narratif additionnel (affiché après la deuxième photo)..."
                                className="resize-none min-h-32"
                                {...field}
                            />
                        </FormControl>
                        <FormDescription>
                            Optionnel - Aucune limite de caractères
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    );
}
