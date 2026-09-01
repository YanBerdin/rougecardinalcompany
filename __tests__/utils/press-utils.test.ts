import { describe, expect, it } from "vitest";

import type { ArticleFormValues } from "@/lib/schemas/press-article";
import type { PressReleaseFormValues } from "@/lib/schemas/press-release";
import {
    cleanArticleFormData,
    cleanPressReleaseFormData,
    getArticleSuccessMessage,
    getPressReleaseSuccessMessage,
} from "@/lib/utils/press-utils";

describe("cleanPressReleaseFormData", () => {
    it("converts numeric relation ids to bigint", () => {
        const cleaned = cleanPressReleaseFormData({
            title: "Communiqué",
            image_media_id: 12,
            spectacle_id: 34,
            evenement_id: 56,
        } as PressReleaseFormValues);

        expect(cleaned.image_media_id).toBe(BigInt(12));
        expect(cleaned.spectacle_id).toBe(BigInt(34));
        expect(cleaned.evenement_id).toBe(BigInt(56));
    });

    it("maps missing or zero relation ids to undefined", () => {
        const cleaned = cleanPressReleaseFormData({
            title: "Communiqué",
            image_media_id: 0,
        } as PressReleaseFormValues);

        expect(cleaned.image_media_id).toBeUndefined();
        expect(cleaned.spectacle_id).toBeUndefined();
        expect(cleaned.evenement_id).toBeUndefined();
    });

    it("preserves the other fields untouched", () => {
        const cleaned = cleanPressReleaseFormData({
            title: "Communiqué",
            description: "Résumé",
        } as PressReleaseFormValues);

        expect(cleaned.title).toBe("Communiqué");
        expect(cleaned).toMatchObject({ description: "Résumé" });
    });
});

describe("cleanArticleFormData", () => {
    it("converts og_image_media_id to bigint", () => {
        const cleaned = cleanArticleFormData({
            title: "Article",
            og_image_media_id: 7,
        } as ArticleFormValues);

        expect(cleaned.og_image_media_id).toBe(BigInt(7));
    });

    it("maps a missing og_image_media_id to undefined", () => {
        const cleaned = cleanArticleFormData({
            title: "Article",
        } as ArticleFormValues);

        expect(cleaned.og_image_media_id).toBeUndefined();
    });
});

describe("success messages", () => {
    it("distinguishes creation from edition for press releases", () => {
        expect(getPressReleaseSuccessMessage(false, "Titre").description).toContain(
            "créé"
        );
        expect(getPressReleaseSuccessMessage(true, "Titre").description).toContain(
            "enregistrées"
        );
    });

    it("distinguishes creation from edition for articles", () => {
        expect(getArticleSuccessMessage(false, "Titre").description).toContain(
            "créé"
        );
        expect(getArticleSuccessMessage(true, "Titre").description).toContain(
            "mis à jour"
        );
    });

    it("includes the title in the message", () => {
        expect(getArticleSuccessMessage(true, "Mon article").description).toContain(
            "Mon article"
        );
    });
});
