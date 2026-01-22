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
import { Form } from "@/components/ui/form";
import { ImageFieldGroup } from "@/components/features/admin/media";
import { cleanArticleFormData, getArticleSuccessMessage } from "@/lib/utils/press-utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createArticleAction } from "@/app/(admin)/admin/presse/actions";
import { ArticleFormSchema, type ArticleFormValues } from "@/lib/schemas/press-article";

export function ArticleNewForm() {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    const form = useForm<ArticleFormValues>({
        resolver: zodResolver(ArticleFormSchema),
        defaultValues: {
            title: "",
            slug: "",
            source_publication: "",
            author: "",
            published_at: new Date().toISOString().split("T")[0],
            source_url: "",
            type: "Article",
            chapo: "",
            excerpt: "",
            image_url: "",
            og_image_media_id: undefined,
        },
    });

    // Pattern 1: Image validation state (optional for articles)
    const [isImageValidated, setIsImageValidated] = useState<boolean | null>(null);

    const onSubmit = async (data: ArticleFormValues) => {
        // Pattern 1: Image validation gate (if image provided)
        if (isImageValidated !== true && (data.image_url || data.og_image_media_id)) {
            toast.error("Veuillez attendre la validation de l'image");
            return;
        }

        setIsPending(true);

        try {
            // Pattern 4: Clean form data (number → bigint conversions)
            const cleanedData = cleanArticleFormData(data);
            const result = await createArticleAction(cleanedData);

            if (!result.success) {
                throw new Error(result.error);
            }

            // Pattern 5: Contextualized success message
            const successMessage = getArticleSuccessMessage(false, data.title);
            toast.success("Article créé", successMessage);
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
                <Card>
                <CardHeader>
                    <CardTitle>Informations de l'article</CardTitle>
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
                        <Label htmlFor="type">Type *</Label>
                        <Select
                            defaultValue="Article"
                            onValueChange={(value) => form.setValue("type", value as "Article" | "Critique" | "Interview" | "Portrait")}
                            disabled={isPending}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Article">Article</SelectItem>
                                <SelectItem value="Critique">Critique</SelectItem>
                                <SelectItem value="Interview">Interview</SelectItem>
                                <SelectItem value="Portrait">Portrait</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="source_publication">Nom du média *</Label>
                        <Input
                            id="source_publication"
                            {...form.register("source_publication")}
                            disabled={isPending}
                        />
                    </div>

                    <div>
                        <Label htmlFor="author">Auteur</Label>
                        <Input
                            id="author"
                            {...form.register("author")}
                            disabled={isPending}
                        />
                    </div>

                    <div>
                        <Label htmlFor="published_at">Date de publication *</Label>
                        <Input
                            id="published_at"
                            type="date"
                            {...form.register("published_at")}
                        />
                    </div>

                    <div>
                        <Label htmlFor="source_url">URL source *</Label>
                        <Input
                            id="source_url"
                            type="url"
                            {...form.register("source_url")}
                            disabled={isPending}
                        />
                    </div>

                    <div>
                        <Label htmlFor="chapo">Chapô</Label>
                        <Textarea
                            id="chapo"
                            {...form.register("chapo")}
                            disabled={isPending}
                            rows={4}
                        />
                    </div>

                    <div>
                        <Label htmlFor="excerpt">Extrait</Label>
                        <Input
                            id="excerpt"
                            type="text"
                            {...form.register("excerpt")}
                            disabled={isPending}
                        />
                    </div>

                    {/* Pattern 3: ImageFieldGroup for Open Graph image */}
                    <ImageFieldGroup
                        form={form}
                        imageUrlField="image_url"
                        imageMediaIdField="og_image_media_id"
                        label="Image de l'article (Open Graph)"
                        uploadFolder="presse"
                        onValidationChange={(isValid) => setIsImageValidated(isValid)}
                    />
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
