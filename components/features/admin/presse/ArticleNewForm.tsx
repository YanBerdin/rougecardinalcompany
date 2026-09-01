"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { ImageField } from "@/components/features/admin/media";
import { AutoSaveIndicator } from "@/components/features/admin/shared/AutoSaveIndicator";
import { cleanArticleFormData, getArticleSuccessMessage } from "@/lib/utils/press-utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    createArticleAction,
    updateArticleAction,
} from "@/app/(admin)/admin/presse/press-articles-actions";
import { ArticleFormSchema, type ArticleFormValues } from "@/lib/schemas/press-article";
import { useFormAutosave } from "@/lib/hooks/use-form-autosave";

const AUTO_SAVE_TRIGGER_FIELDS: Array<Path<ArticleFormValues>> = [
    "title",
    "chapo",
    "excerpt",
    "author",
    "source_publication",
];
const DRAFT_TITLE_FALLBACK = "(Sans titre)";

type ArticleAutoSavePayload = ReturnType<typeof cleanArticleFormData>;
type ArticleAutoSaveUpdatePayload = Partial<ArticleAutoSavePayload>;

export function ArticleNewForm() {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [savedDraftId, setSavedDraftId] = useState<string | null>(null);

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

    const handleAutoCreate = useCallback(async (payload: ArticleAutoSavePayload) => {
        const result = await createArticleAction(payload);
        if (result.success) {
            setSavedDraftId(result.data.id);
        }
        return result;
    }, []);

    const handleAutoUpdate = useCallback(
        async (id: string, payload: ArticleAutoSaveUpdatePayload) => {
            return updateArticleAction(id, payload);
        },
        []
    );

    const transformCreatePayload = useCallback(
        (payload: ArticleAutoSavePayload): ArticleAutoSavePayload => ({
            ...payload,
            title: payload.title?.trim() ? payload.title : DRAFT_TITLE_FALLBACK,
        }),
        []
    );

    const transformUpdatePayload = useCallback(
        (payload: ArticleAutoSavePayload): ArticleAutoSaveUpdatePayload => {
            const { title, ...rest } = payload;
            const trimmedTitle = title?.trim();
            return trimmedTitle ? { ...rest, title } : rest;
        },
        []
    );

    const autoSave = useFormAutosave<
        ArticleFormValues,
        ArticleAutoSavePayload,
        ArticleAutoSaveUpdatePayload
    >({
        form,
        enabled: !isPending,
        initialDraftId: savedDraftId,
        triggerFields: AUTO_SAVE_TRIGGER_FIELDS,
        onCreate: handleAutoCreate,
        onUpdate: handleAutoUpdate,
        buildDraftPayload: cleanArticleFormData,
        transformCreatePayload,
        transformUpdatePayload,
    });

    useEffect(() => {
        if (!autoSave.draftId || autoSave.draftId === savedDraftId) {
            return;
        }
        setSavedDraftId(autoSave.draftId);
    }, [autoSave.draftId, savedDraftId]);

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (!autoSave.isSaving) {
                return;
            }
            event.preventDefault();
            event.returnValue = "";
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [autoSave.isSaving]);

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
            const result = savedDraftId
                ? await updateArticleAction(savedDraftId, cleanedData)
                : await createArticleAction(cleanedData);

            if (!result.success) {
                throw new Error(result.error);
            }

            // Pattern 5: Contextualized success message
            const successMessage = getArticleSuccessMessage(Boolean(savedDraftId), data.title);
            toast.success(savedDraftId ? "Article mis à jour" : "Article créé", successMessage);
            setSavedDraftId(null);
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
                <AutoSaveIndicator
                    status={autoSave.status}
                    lastSavedAt={autoSave.lastSavedAt}
                    errorMessage={autoSave.errorMessage}
                />
                <Card>
                    <CardHeader>
                        <CardTitle>Informations de l&apos;article</CardTitle>
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
                            <Textarea
                                id="excerpt"
                                {...form.register("excerpt")}
                                disabled={isPending}
                                rows={4}
                            />
                        </div>

                        {/* Pattern 3: ImageField for Open Graph image */}
                        <ImageField.Provider
                            form={form}
                            imageUrlField="image_url"
                            imageMediaIdField="og_image_media_id"
                            label="Image de l'article (Open Graph)"
                            showUpload={true}
                            uploadFolder="presse"
                            onValidationChange={(isValid) => setIsImageValidated(isValid)}
                        >
                            <ImageField.SourceActions showUpload={true} />
                            <ImageField.Preview />
                            <ImageField.AltText />
                        </ImageField.Provider>
                    </CardContent>
                </Card>

                <div className="flex gap-2 justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isPending || autoSave.isSaving}
                    >
                        Annuler
                    </Button>
                    <Button type="submit" disabled={isPending || autoSave.isSaving}>
                        {isPending
                            ? savedDraftId
                                ? "Enregistrement..."
                                : "Création..."
                            : savedDraftId
                                ? "Enregistrer"
                                : "Créer"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
