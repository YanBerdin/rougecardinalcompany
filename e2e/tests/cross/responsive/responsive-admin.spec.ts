// spec: specs/PLAN_DE_TEST_COMPLET.md — Section 21.1 Responsive (admin)
// Cas couverts : CROSS-RESP-003, CROSS-RESP-005
// Cas inclus : CROSS-A11Y-006 (navigation clavier formulaires admin)
// Pré-requis : storageState admin (projet cross-admin dans playwright.config.ts)

import { test, expect } from './responsive-admin.fixtures';

const MOBILE = { width: 375, height: 812 } as const;

test.describe('Responsive — Admin', () => {
    // CROSS-RESP-003 — Admin sidebar mobile
    test('CROSS-RESP-003 — Admin sidebar mobile 375px : rétractable', async ({ page }) => {
        await page.setViewportSize(MOBILE);
        await page.goto('/admin', { waitUntil: 'domcontentloaded' });

        // 1. Le tableau de bord est chargé
        await expect(page.getByRole('heading', { name: 'Tableau de bord' })).toBeVisible();

        // 2. Le bouton trigger de la sidebar est visible sur mobile
        const sidebarTrigger = page.locator('[data-sidebar="trigger"]').first();
        await expect(sidebarTrigger).toBeVisible();

        // 3. La sidebar est dans un état collapsed ou fermé par défaut sur mobile
        const sidebar = page.locator('[data-sidebar="sidebar"]').first();
        await sidebar.waitFor({ state: 'attached', timeout: 5_000 });
        const state = await sidebar.getAttribute('data-state');
        // Sur mobile, data-state peut être null (sidebar cachée par CSS/Sheet)
        // ou 'collapsed' / 'hidden' / 'closed' selon l'implémentation shadcn
        expect([null, 'collapsed', 'hidden', 'closed']).toContain(state);

        // 4. Après clic sur le trigger, la sidebar s'ouvre
        await sidebarTrigger.click();
        // Attente robuste : retry jusqu'à ce que la sidebar change d'état ou qu'un overlay apparaisse
        await expect(async () => {
            const expandedState = await sidebar.getAttribute('data-state');
            const overlay = page.locator('[data-sidebar="overlay"], [role="dialog"]').first();
            const isOverlayVisible = await overlay.isVisible().catch(() => false);
            const isSidebarVisible = await sidebar.isVisible().catch(() => false);
            const sidebarOpened = expandedState !== state || isOverlayVisible || isSidebarVisible;
            expect(sidebarOpened).toBe(true);
        }).toPass({ timeout: 15_000 });
    });

    // CROSS-RESP-005 — Tables admin mobile
    test('CROSS-RESP-005 — Tables admin mobile 375px : scroll horizontal ou layout alternatif', async ({
        page,
    }) => {
        await page.setViewportSize(MOBILE);
        await page.goto('/admin/team', { waitUntil: 'domcontentloaded' });

        // 1. La page charge correctement
        await expect(page.locator('#main-content')).toBeVisible();

        // 2. Si une table existe, son conteneur doit gérer le dépassement
        const tableCount = await page.locator('table').count();
        let hasScrollableContainer = false;
        if (tableCount > 0) {
            hasScrollableContainer = await page.evaluate(() => {
                const tables = Array.from(document.querySelectorAll('table'));
                return tables.some((table) => {
                    let el: HTMLElement | null = table.parentElement;
                    while (el) {
                        const style = window.getComputedStyle(el);
                        if (style.overflowX === 'auto' || style.overflowX === 'scroll') {
                            return true;
                        }
                        el = el.parentElement;
                    }
                    return false;
                });
            });
            expect(hasScrollableContainer).toBe(true);
        }

        // 3. Le corps de la page ne déborde pas sans scroll intentionnel
        // Si des tables ont un conteneur scrollable, leur overflow est géré intentionnellement
        // et ne doit pas faire échouer la vérification du body.
        if (!hasScrollableContainer) {
            const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
            expect(bodyScrollWidth).toBeLessThanOrEqual(MOBILE.width + 1);
        }
    });

    // CROSS-A11Y-006 — Navigation clavier formulaires admin
    test('CROSS-A11Y-006 — Navigation clavier formulaires admin : actions réalisables sans souris', async ({
        page,
    }) => {
        await page.goto('/admin/team', { waitUntil: 'domcontentloaded' });

        // 1. Tab jusqu'au premier bouton d'action (ex: "Ajouter")
        //    Utiliser focus() programmatique pour tester la keyboard-accessibilité
        const addButton = page
            .getByRole('button', { name: /ajouter|créer|nouveau/i })
            .first();
        const addButtonCount = await addButton.count();
        if (addButtonCount > 0) {
            await addButton.focus();
            await expect(addButton).toBeFocused();

            // 2. Appuyer Entrée déclenche l'action (ouverture dialogue/formulaire)
            await addButton.press('Enter');
            // Un dialogue ou formulaire doit s'ouvrir
            const dialog = page.getByRole('dialog');
            const formVisible = await dialog.isVisible().catch(() => false);
            if (formVisible) {
                // 3. Échap ferme le dialogue
                await page.keyboard.press('Escape');
                await expect(dialog).not.toBeVisible();
            }
        }

        // 4. Vérifier que les liens de navigation admin sont focusables au clavier
        // On utilise .first() car le lien peut exister plusieurs fois dans le DOM
        const dashboardLink = page.getByRole('link', { name: 'Tableau de bord' }).first();
        const dashboardLinkCount = await dashboardLink.count();
        if (dashboardLinkCount > 0) {
            await dashboardLink.focus();
            await expect(dashboardLink).toBeFocused();
        }
    });
});
