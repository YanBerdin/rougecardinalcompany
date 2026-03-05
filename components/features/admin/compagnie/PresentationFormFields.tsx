"use client";

import { useFormContext } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ContentArrayField } from "./ContentArrayField";
import { ImageField } from "@/components/features/admin/media";
import type { PresentationSectionFormValues } from "@/lib/schemas/compagnie-admin";

const SHOW_TITLE = ["hero", "history", "values", "team", "mission", "custom"];
const SHOW_SUBTITLE = ["hero", "values", "team", "custom"];
const SHOW_CONTENT = ["history", "mission", "custom"];
const SHOW_QUOTE = ["quote", "custom"];
const SHOW_QUOTE_AUTHOR = ["quote", "custom"];
const SHOW_IMAGE_URL = ["history", "custom"];

export function PresentationFormFields() {
    const form = useFormContext<PresentationSectionFormValues>();
    const kind = form.watch("kind");

    return (
        <div className="space-y-4">
            {SHOW_TITLE.includes(kind) && (
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Titre</FormLabel>
                            <FormControl>
                                <Input placeholder="Titre de la section" {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            {SHOW_SUBTITLE.includes(kind) && (
                <FormField
                    control={form.control}
                    name="subtitle"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Sous-titre</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Sous-titre optionnel"
                                    {...field}
                                    value={field.value ?? ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            {SHOW_CONTENT.includes(kind) && (
                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                            <ContentArrayField
                                label="Contenu (paragraphes)"
                                value={field.value ?? []}
                                onChange={field.onChange}
                                placeholder="Saisir un paragraphe..."
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            {SHOW_QUOTE.includes(kind) && (
                <FormField
                    control={form.control}
                    name="quote_text"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Citation</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Texte de la citation..."
                                    rows={3}
                                    {...field}
                                    value={field.value ?? ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            {SHOW_QUOTE_AUTHOR.includes(kind) && (
                <FormField
                    control={form.control}
                    name="quote_author"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Auteur de la citation</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Nom de l'auteur"
                                    {...field}
                                    value={field.value ?? ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            {SHOW_IMAGE_URL.includes(kind) && (
                <ImageField.Provider
                    form={form}
                    imageUrlField="image_url"
                    imageMediaIdField="image_media_id"
                    altTextField="alt_text"
                    uploadFolder="about"
                    label="Image de section"
                    description="Sélectionnez une image depuis la médiathèque"
                >
                    <ImageField.SourceActions />
                    <ImageField.Preview />
                    <ImageField.AltText />
                </ImageField.Provider>
            )}
        </div>
    );
}
