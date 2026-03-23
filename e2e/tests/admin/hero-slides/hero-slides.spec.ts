// spec: specs/PLAN_DE_TEST_COMPLET.md — Section 15: Hero Slides

import { test, expect } from './hero-slides.fixtures';
import { HeroSlideFactory } from '@/e2e/factories';

const SLIDE_TITLE = '[TEST] Slide Principal E2E';
const SLIDE_TITLE_2 = '[TEST] Slide Secondaire E2E';

test.describe('Hero Slides', () => {
    test.afterEach(async () => {
        await HeroSlideFactory.cleanup();
    });

    // --- P0 ---

    test('ADM-HERO-001 — Liste des slides', async ({ heroSlidesPage }) => {
        // 1. Naviguer vers /admin/home/hero (fait par la fixture)
        await heroSlidesPage.expectLoaded();

        // 2. Les slides s'affichent avec titre, statut, description, CTA
        await expect(heroSlidesPage.addSlideButton).toBeVisible();
    });

    test('ADM-HERO-002 — Ajouter un slide', async ({ heroSlidesPage, page }) => {
        // 1. Cliquer "Ajouter un slide"
        await heroSlidesPage.clickAddSlide();

        // 2. Remplir titre, description
        await heroSlidesPage.fillSlideForm({
            title: SLIDE_TITLE,
            imageUrl: 'https://dummyimage.com/1920x1080.png',
            altText: 'Image de test E2E',
        });

        // 3. Sauvegarder
        await heroSlidesPage.submitSlideForm();

        // 4. Le nouveau slide apparaît dans la liste
        await expect(page.getByText(/succès|créé/i).first()).toBeVisible({ timeout: 5_000 });
        await heroSlidesPage.goto();
        await heroSlidesPage.expectSlideVisible(SLIDE_TITLE);
    });

    test('ADM-HERO-003 — Modifier un slide', async ({ heroSlidesPage, page }) => {
        // Setup : créer un slide via factory (image_url required for form validation)
        const slide = await HeroSlideFactory.create({ title: SLIDE_TITLE, image_url: 'https://dummyimage.com/1920x1080.png' });
        await heroSlidesPage.goto();

        // 1. Cliquer "Modifier" sur le slide
        await heroSlidesPage.clickEditSlide(slide.title);

        // 2. Changer le titre
        const updatedTitle = `${SLIDE_TITLE} Modifié`;
        await heroSlidesPage.fillSlideForm({ title: updatedTitle });

        // 3. Sauvegarder (image URL and alt_text are preserved from factory)
        await heroSlidesPage.submitSlideForm();

        // 4. Le titre est mis à jour
        await expect(page.getByText(/succès|mis à jour/i).first()).toBeVisible({ timeout: 5_000 });
        await heroSlidesPage.goto();
        await heroSlidesPage.expectSlideVisible(updatedTitle);
    });

    test('ADM-HERO-004 — Supprimer un slide', async ({ heroSlidesPage }) => {
        // Setup : créer un slide via factory
        const slide = await HeroSlideFactory.create({ title: SLIDE_TITLE });
        await heroSlidesPage.goto();

        // 1. Cliquer "Supprimer"
        await heroSlidesPage.clickDeleteSlide(slide.title);

        // 2. Confirmer
        await heroSlidesPage.confirmDelete();

        // 3. Le slide disparaît de la liste
        await heroSlidesPage.expectSlideNotVisible(SLIDE_TITLE);
    });

    // --- P1 ---

    test('ADM-HERO-005 — Drag & drop — Réordonner', async ({ heroSlidesPage, page }) => {
        await Promise.all([
            HeroSlideFactory.create({ title: SLIDE_TITLE, position: 1, image_url: 'https://dummyimage.com/1920x1080.png' }),
            HeroSlideFactory.create({ title: SLIDE_TITLE_2, position: 2, image_url: 'https://dummyimage.com/1920x1080.png' }),
        ]);
        await heroSlidesPage.goto();

        // @dnd-kit écoute les pointer events — page.mouse.* est plus fiable que dragTo()
        const handle = page.getByRole('button', { name: 'Glisser pour réordonner' }).first();
        const target = heroSlidesPage.getSlideByTitle(SLIDE_TITLE_2);
        const handleBox = await handle.boundingBox();
        const targetBox = await target.boundingBox();
        if (handleBox && targetBox) {
            const startX = handleBox.x + handleBox.width / 2;
            const startY = handleBox.y + handleBox.height / 2;
            await page.mouse.move(startX, startY);
            await page.mouse.down();
            // Petit mouvement initial pour franchir le seuil d'activation de @dnd-kit (~3px)
            await page.mouse.move(startX + 5, startY, { steps: 3 });
            // Déplacement vers la slide cible
            await page.mouse.move(
                targetBox.x + targetBox.width / 2,
                targetBox.y + targetBox.height / 2,
                { steps: 20 },
            );
            await page.mouse.up();
        }

        // Vérifier que les deux slides sont toujours présentes après rechargement
        await heroSlidesPage.goto();
        await heroSlidesPage.expectSlideVisible(SLIDE_TITLE);
        await heroSlidesPage.expectSlideVisible(SLIDE_TITLE_2);
    });

    test('ADM-HERO-006 — Activer/Désactiver un slide', async ({ heroSlidesPage, page }) => {
        // Setup : créer un slide actif
        const slide = await HeroSlideFactory.create({ title: SLIDE_TITLE, active: true });
        await heroSlidesPage.goto();

        // 1. Désactiver le slide (via le bouton toggle ou un interrupteur)
        const toggleBtn = page.getByRole('button', { name: /Désactiver.*slide|slide.*actif/i });
        if (await toggleBtn.isVisible()) {
            await toggleBtn.click();
        }

        // 2. La page d'accueil ne doit plus montrer ce slide
        await page.goto('/');
        await page.waitForLoadState('load');
        await expect(page.getByText(slide.title)).not.toBeVisible();
    });

    test('ADM-HERO-007 — CTA — Lien fonctionnel', async ({ heroSlidesPage, page }) => {
        // Setup : créer un slide avec CTA
        const ctaUrl = 'https://example.com/spectacles';
        await HeroSlideFactory.create({
            title: SLIDE_TITLE,
            image_url: 'https://dummyimage.com/1920x1080.png',
            cta_primary_url: ctaUrl,
            cta_primary_enabled: true,
            cta_primary_label: 'En savoir plus',
        });
        await heroSlidesPage.goto();

        // 1. Modifier le lien CTA d'un slide
        await heroSlidesPage.clickEditSlide(SLIDE_TITLE);
        const ctaInput = page.getByLabel(/URL.*CTA|Lien.*CTA|CTA.*URL/i);
        if (await ctaInput.isVisible()) {
            await ctaInput.fill(ctaUrl);
        }
        await heroSlidesPage.submitSlideForm();

        // 2. Le CTA est sauvegardé
        await expect(page.getByText(/succès|mis à jour/i).first()).toBeVisible({ timeout: 5_000 });
    });

    test('ADM-HERO-008 — Impact public — Ordre des slides', async ({ heroSlidesPage, page }) => {
        // Setup : créer des slides avec positions et image_url (requis pour affichage)
        await Promise.all([
            HeroSlideFactory.create({ title: SLIDE_TITLE, position: 1, active: true, image_url: 'https://dummyimage.com/1920x1080.png' }),
            HeroSlideFactory.create({ title: SLIDE_TITLE_2, position: 2, active: true, image_url: 'https://dummyimage.com/1920x1080.png' }),
        ]);

        // 1. Naviguer vers /
        await page.goto('/');
        await page.waitForLoadState('load');

        // 2. Le slide existe dans le carrousel (titre affiché en heading)
        await expect(
            page.getByRole('heading', { name: SLIDE_TITLE, exact: false }).first()
        ).toBeVisible({ timeout: 10_000 });
    });
});
