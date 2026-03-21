// spec: specs/PLAN_DE_TEST_COMPLET.md — Section 21.2 Accessibilité WCAG 2.2
// Cas couverts : CROSS-A11Y-001, 002, 003, 004, 005, 007
// Pré-requis : @axe-core/playwright installé

import AxeBuilder from '@axe-core/playwright';
import { test, expect } from './accessibility.fixtures';

const PUBLIC_URL = '/';
const CONTACT_URL = '/contact';

// Liens de navigation attendus dans le header public
const HEADER_NAV_LINKS = [
    'Accueil',
    'La Compagnie',
    'Spectacles',
    'Agenda',
    'Presse',
    'Contact',
] as const;

// Champs du formulaire de contact et leurs labels associés
// Note: les textes correspondent exactement au rendu HTML (ex: 'Email' et non 'E-mail')
const CONTACT_FORM_FIELDS: Array<{ id: string; label: string }> = [
    { id: 'firstName', label: 'Prénom' },
    { id: 'lastName', label: 'Nom' },
    { id: 'email', label: 'Email' },
    { id: 'message', label: 'Message' },
];

test.describe('Accessibilité WCAG 2.2 — Site public', () => {
    // CROSS-A11Y-001 — Skip link
    test('CROSS-A11Y-001 — Skip link : visible au focus et fonctionnel', async ({ page }) => {
        await page.goto(PUBLIC_URL, { waitUntil: 'domcontentloaded' });

        // 1. Premier Tab : le skip link doit apparaître (sr-only → visible au focus)
        await page.keyboard.press('Tab');
        const skipLink = page.getByRole('link', { name: 'Aller au contenu principal' });
        await expect(skipLink).toBeVisible();

        // 2. Activer le skip link via Entrée
        await page.keyboard.press('Enter');

        // 3. L'élément ciblé (#main-content) doit être dans le viewport
        const mainContent = page.locator('#main-content');
        await expect(mainContent).toBeInViewport();
    });

    // CROSS-A11Y-002 — Navigation clavier header
    test('CROSS-A11Y-002 — Navigation clavier header : tous les liens sont focusables', async ({
        page,
    }) => {
        await page.goto(PUBLIC_URL, { waitUntil: 'domcontentloaded' });

        // Vérifier que chaque lien de navigation peut recevoir le focus programmatiquement
        for (const linkName of HEADER_NAV_LINKS) {
            const link = page.getByRole('link', { name: linkName }).first();
            const count = await link.count();
            if (count === 0) continue; // Skip si lien absent (optionnel)

            await link.focus();
            await expect(link).toBeFocused();
        }
    });

    // CROSS-A11Y-003 — Labels formulaire de contact
    test('CROSS-A11Y-003 — Formulaire contact : labels associés programmatiquement à chaque champ', async ({
        page,
    }) => {
        await page.goto(CONTACT_URL, { waitUntil: 'domcontentloaded' });

        for (const { id, label } of CONTACT_FORM_FIELDS) {
            // 1. Le champ input existe
            const field = page.locator(`#${id}`);
            await expect(field).toBeVisible();

            // 2. Un label associé est visible (via for=id ou encapsulation)
            const associatedLabel = page.locator(`label[for="${id}"]`);
            await expect(associatedLabel).toBeVisible();

            // 3. Le texte du label correspond au champ
            await expect(associatedLabel).toContainText(label);
        }
    });

    // CROSS-A11Y-004 — Contraste des textes (WCAG AA color-contrast)
    // Wraps axe in toPass() retry because CSS custom properties may not be
    // fully resolved on the first paint, causing transient computed-color mismatches.
    test('CROSS-A11Y-004 — Contraste des textes : conforme WCAG 2.2 AA sur la page d\'accueil', async ({
        page,
    }) => {
        await page.goto(PUBLIC_URL, { waitUntil: 'networkidle' });

        await expect(async () => {
            const results = await new AxeBuilder({ page })
                .withRules(['color-contrast'])
                .analyze();

            expect(
                results.violations.length + results.passes.length,
                'axe-core color-contrast analysis did not run'
            ).toBeGreaterThan(0);

            const details = results.violations
                .flatMap((v) =>
                    v.nodes.map(
                        (n) =>
                            `${v.id}: ${n.html}\n  → ${n.any?.map((c) => c.message).join('; ')}\n  target: ${n.target.join(', ')}`
                    )
                )
                .join('\n\n');
            expect(
                results.violations.length,
                `Violations de contraste WCAG AA :\n${details}`
            ).toBe(0);
        }).toPass({ timeout: 10_000 });
    });

    // CROSS-A11Y-005 — Alt text images
    test('CROSS-A11Y-005 — Alt text images : toutes les images ont un texte alternatif', async ({
        page,
    }) => {
        await page.goto(PUBLIC_URL, { waitUntil: 'networkidle' });

        const results = await new AxeBuilder({ page })
            .withRules(['image-alt'])
            .analyze();

        expect(
            results.violations,
            `Images sans alt text : ${results.violations.map((v) => v.description).join(', ')}`
        ).toHaveLength(0);
    });

    // CROSS-A11Y-007 — Aria-live pour les notifications toasts
    test('CROSS-A11Y-007 — Aria-live : région de notification présente dans le DOM', async ({
        page,
    }) => {
        await page.goto(PUBLIC_URL, { waitUntil: 'domcontentloaded' });

        // Sonner injecte un <ol aria-live="polite"> ou région aria-live équivalente
        // Vérifier que la région aria-live est attachée au DOM (pas forcément visible)
        const ariaLiveRegion = page.locator('[aria-live]').first();
        await expect(ariaLiveRegion).toBeAttached({ timeout: 5_000 });

        // Vérifier que la valeur est "polite" ou "assertive" (non "off")
        const liveValue = await ariaLiveRegion.getAttribute('aria-live');
        expect(['polite', 'assertive']).toContain(liveValue);
    });
});
