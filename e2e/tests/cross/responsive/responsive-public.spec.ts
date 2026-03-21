// spec: specs/PLAN_DE_TEST_COMPLET.md — Section 21.1 Responsive (public)
// Cas couverts : CROSS-RESP-001, CROSS-RESP-002, CROSS-RESP-004

import { test, expect } from './responsive-public.fixtures';

const MOBILE = { width: 375, height: 812 } as const;
const TABLET = { width: 768, height: 1024 } as const;

test.describe('Responsive — Site public', () => {
    // CROSS-RESP-001 — Accueil mobile 375px
    test('CROSS-RESP-001 — Accueil mobile 375px : pas de débordement, menu hamburger visible', async ({
        page,
    }) => {
        await page.setViewportSize(MOBILE);
        await page.goto('/', { waitUntil: 'networkidle' });

        // 1. Pas de débordement horizontal (tolérance 1px pour marges)
        // Retry pour laisser le layout se stabiliser (animations marquee, fonts, images)
        await expect(async () => {
            const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
            expect(scrollWidth).toBeLessThanOrEqual(MOBILE.width + 1);
        }).toPass({ timeout: 5_000 });

        // 2. Le menu hamburger (dans div.md:hidden) est visible
        const mobileMenuButton = page
            .locator('header [class*="md:hidden"]')
            .getByRole('button')
            .first();
        await expect(mobileMenuButton).toBeVisible();

        // 3. Après clic, le menu mobile s'ouvre et les liens sont accessibles
        await mobileMenuButton.click();
        await expect(page.getByRole('link', { name: 'Accueil' }).first()).toBeVisible();
        // .first() évite le strict mode (le lien existe aussi dans le footer)
        await expect(page.getByRole('link', { name: 'La Compagnie' }).first()).toBeVisible();
    });

    // CROSS-RESP-002 — Accueil tablette 768px
    test('CROSS-RESP-002 — Accueil tablette 768px : mise en page correcte', async ({
        page,
    }) => {
        await page.setViewportSize(TABLET);
        await page.goto('/', { waitUntil: 'domcontentloaded' });

        // 1. La page charge sans débordement horizontal
        const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
        expect(scrollWidth).toBeLessThanOrEqual(TABLET.width + 1);

        // 2. Le header est visible
        await expect(page.getByRole('banner')).toBeVisible();

        // 3. Le contenu principal est visible
        await expect(page.locator('#main-content')).toBeVisible();
    });

    // CROSS-RESP-004 — Formulaire contact mobile
    test('CROSS-RESP-004 — Formulaire contact mobile 375px : tous les champs accessibles', async ({
        page,
    }) => {
        await page.setViewportSize(MOBILE);
        await page.goto('/contact', { waitUntil: 'domcontentloaded' });

        // 1. Le titre de la page est visible
        await expect(page.getByRole('heading', { name: 'Contact', level: 1 })).toBeVisible();

        // 2. Chaque champ de formulaire est accessible (visible et interactable)
        await expect(page.locator('#firstName')).toBeVisible();
        await expect(page.locator('#lastName')).toBeVisible();
        await expect(page.locator('#email')).toBeVisible();
        await expect(page.locator('#message')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Envoyer le message' })).toBeVisible();

        // 3. Pas de débordement horizontal
        const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
        expect(scrollWidth).toBeLessThanOrEqual(MOBILE.width + 1);
    });
});
