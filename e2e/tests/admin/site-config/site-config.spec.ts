/**
 * ADM-CONFIG — Tests E2E : Configuration d'affichage des sections (Site Config)
 *
 * Couverture : ADM-CONFIG-001 à ADM-CONFIG-013
 * Production data : utilise les toggles réels (pas de factory)
 * Pattern : sauvegarde l'état initial, modifie, vérifie, restaure
 */
import { test, expect } from './site-config.fixtures';
import { HeroSlideFactory } from '@/e2e/factories';
import { supabaseAdmin } from '@/e2e/helpers/db';

// Sélecteurs DOM stable pour les sections publiques
const PUBLIC_SECTIONS = {
    'display_toggle_home_hero': {
        page: '/',
        selector: '[data-testid="home-hero"]',
    },
    'display_toggle_home_spectacles': {
        page: '/',
        selector: 'section[aria-labelledby="shows-heading"]',
    },
    'display_toggle_home_about': {
        page: '/',
        selector: 'section[aria-labelledby="about-heading"]',
    },
    'display_toggle_home_newsletter': {
        page: '/',
        selector: 'section[aria-labelledby="newsletter-heading"]',
    },
    'display_toggle_home_a_la_une': {
        page: '/',
        selector: 'section[aria-labelledby="news-heading"]',
    },
    'display_toggle_media_kit': {
        page: '/presse',
        selector: 'section[aria-label="Kit Média"]',
    },
    'display_toggle_presse_articles': {
        page: '/presse',
        selector: 'section[aria-label="Communiqués de presse"]',
    },
    'display_toggle_agenda_newsletter': {
        page: '/agenda',
        selector: 'section[aria-labelledby="newsletter-heading"]',
    },
} as const;

test.describe('ADM-CONFIG — Configuration site : affichage des sections', () => {

    test('ADM-CONFIG-001 — 10 toggles affichés en 4 groupes de sections', async ({ siteConfigPage }) => {
        await siteConfigPage.expectLoaded();

        // Groupe 1 : Page d'Accueil (6 toggles)
        const homeGroup = siteConfigPage.getSectionLocator("Page d'Accueil");
        await expect(homeGroup).toBeVisible();
        const homeToggles = homeGroup.locator('[role="switch"]');
        await expect(homeToggles).toHaveCount(6);

        // Groupe 2 : Page Presse (2 toggles)
        const presseGroup = siteConfigPage.getSectionLocator('Page Presse');
        await expect(presseGroup).toBeVisible();
        const presseToggles = presseGroup.locator('[role="switch"]');
        await expect(presseToggles).toHaveCount(2);

        // Groupe 3 : Page Agenda (1 toggle)
        const agendaGroup = siteConfigPage.getSectionLocator('Page Agenda');
        await expect(agendaGroup).toBeVisible();
        const agendaToggles = agendaGroup.locator('[role="switch"]');
        await expect(agendaToggles).toHaveCount(1);

        // Groupe 4 : Page Contact (1 toggle)
        const contactGroup = siteConfigPage.getSectionLocator('Page Contact');
        await expect(contactGroup).toBeVisible();
        const contactToggles = contactGroup.locator('[role="switch"]');
        await expect(contactToggles).toHaveCount(1);
    });

    test('ADM-CONFIG-002 — Désactiver le toggle Hero Banner → section absente sur /', async ({ page, siteConfigPage }) => {
        await siteConfigPage.expectLoaded();
        const key = 'display_toggle_home_hero';

        // Sauvegarder l'état initial
        const wasEnabled = await siteConfigPage.isToggleEnabled(key);

        try {
            // S'assurer que le toggle est activé avant de désactiver
            if (!wasEnabled) {
                await siteConfigPage.clickToggle(key);
                await siteConfigPage.expectToastVisible('Configuration mise à jour');
                await page.waitForTimeout(200);
            }

            // Désactiver le toggle Hero Banner
            await siteConfigPage.clickToggle(key);
            await siteConfigPage.expectToastVisible('Configuration mise à jour');
            await page.waitForTimeout(200);

            // Vérifier que la section hero est absente sur la page publique
            await page.goto('/');
            await page.waitForLoadState('load');
            await expect(page.locator(PUBLIC_SECTIONS[key].selector)).not.toBeVisible();
        } finally {
            // Restaurer l'état initial
            await siteConfigPage.goto();
            await siteConfigPage.expectLoaded();
            const currentState = await siteConfigPage.isToggleEnabled(key);
            if (currentState !== wasEnabled) {
                await siteConfigPage.clickToggle(key);
                await siteConfigPage.expectToastVisible('Configuration mise à jour');
            }
        }
    });

    test('ADM-CONFIG-003 — Réactiver le toggle Hero Banner → section réapparaît sur /', async ({ page, siteConfigPage }) => {
        await siteConfigPage.expectLoaded();
        const key = 'display_toggle_home_hero';

        // Seed: ensure at least one active slide exists so HeroView renders
        // (HeroView returns null when slides array is empty, regardless of toggle state)
        const seededSlide = await HeroSlideFactory.create({ active: true, position: 0 });

        // S'assurer que le toggle est désactivé pour tester la réactivation
        const wasEnabled = await siteConfigPage.isToggleEnabled(key);

        try {
            if (wasEnabled) {
                await siteConfigPage.clickToggle(key);
                await siteConfigPage.expectToastVisible('Configuration mise à jour');
                await page.waitForTimeout(200);
            }

            // Réactiver le toggle
            await siteConfigPage.clickToggle(key);
            await siteConfigPage.expectToastVisible('Configuration mise à jour');

            //? ❌Laisser le temps à l'action serveur de compléter (revalidatePath + DB commit)
            // Identique au waitForTimeout(200) utilisé après le step "disable".
            //?❌await page.waitForTimeout(300);

            // Forcer une navigation fraîche sans perdre la session (ne pas clear cookies)
            //? ❌force-dynamic garantit un rendu serveur frais sans cache ISR.
            // Cache-bust via query param.
            await page.goto(`/?_t=${Date.now()}`, { waitUntil: 'domcontentloaded' });
            //? ❌Vérifier qu'on est bien sur la page publique (pas de redirect admin)
            //? ❌await expect(page).toHaveURL(/\/$|\/\?/, { timeout: 10_000 });
            await page.waitForLoadState('networkidle');
            const hero = page.locator(PUBLIC_SECTIONS[key].selector);
            await expect(hero).toHaveCount(1, { timeout: 30_000 }); //?❌15_000
            await expect(hero).toBeVisible({ timeout: 30_000 }); //?❌15_000
        } finally {
            // Restaurer l'état initial du toggle
            await siteConfigPage.goto();
            await siteConfigPage.expectLoaded();
            const currentState = await siteConfigPage.isToggleEnabled(key);
            if (currentState !== wasEnabled) {
                await siteConfigPage.clickToggle(key);
                await siteConfigPage.expectToastVisible('Configuration mise à jour');
            }
            // Supprimer le slide de test
            await supabaseAdmin.from('home_hero_slides').delete().eq('id', seededSlide.id);
        }
    });

    test('ADM-CONFIG-004 — Toggle Spectacles à la une → masque/affiche section sur /', async ({ page, siteConfigPage }) => {
        await siteConfigPage.expectLoaded();
        const key = 'display_toggle_home_spectacles';
        const wasEnabled = await siteConfigPage.isToggleEnabled(key);

        try {
            // Tester l'état désactivé
            if (wasEnabled) {
                await siteConfigPage.clickToggle(key);
                await siteConfigPage.expectToastVisible('Configuration mise à jour');
                await page.waitForTimeout(200);
            }

            await page.goto('/');
            await page.waitForLoadState('load');
            await expect(page.locator(PUBLIC_SECTIONS[key].selector)).not.toBeVisible();
        } finally {
            await siteConfigPage.goto();
            await siteConfigPage.expectLoaded();
            const currentState = await siteConfigPage.isToggleEnabled(key);
            if (currentState !== wasEnabled) {
                await siteConfigPage.clickToggle(key);
                await siteConfigPage.expectToastVisible('Configuration mise à jour');
            }
        }
    });

    test('ADM-CONFIG-005 — Toggle À propos → masque section chiffres sur /', async ({ page, siteConfigPage }) => {
        await siteConfigPage.expectLoaded();
        const key = 'display_toggle_home_about';
        const wasEnabled = await siteConfigPage.isToggleEnabled(key);

        try {
            if (wasEnabled) {
                await siteConfigPage.clickToggle(key);
                await siteConfigPage.expectToastVisible('Configuration mise à jour');
                await page.waitForTimeout(200);
            }

            await page.goto('/');
            await page.waitForLoadState('load');
            await expect(page.locator(PUBLIC_SECTIONS[key].selector)).not.toBeVisible();
        } finally {
            await siteConfigPage.goto();
            await siteConfigPage.expectLoaded();
            const currentState = await siteConfigPage.isToggleEnabled(key);
            if (currentState !== wasEnabled) {
                await siteConfigPage.clickToggle(key);
                await siteConfigPage.expectToastVisible('Configuration mise à jour');
            }
        }
    });

    test('ADM-CONFIG-006 — Toggle Partenaires → masque section partenaires sur /', async ({ page, siteConfigPage }) => {
        await siteConfigPage.expectLoaded();
        const key = 'display_toggle_home_partners';
        const wasEnabled = await siteConfigPage.isToggleEnabled(key);

        try {
            if (wasEnabled) {
                await siteConfigPage.clickToggle(key);
                await siteConfigPage.expectToastVisible('Configuration mise à jour');
                await page.waitForTimeout(200);
            }

            await page.goto('/');
            await page.waitForLoadState('load');
            // Partners sans aria-label spécifique : vérifier absence du heading "Nos Partenaires"
            await expect(
                page.getByRole('heading', { name: /partenaires/i })
            ).not.toBeVisible();
        } finally {
            await siteConfigPage.goto();
            await siteConfigPage.expectLoaded();
            const currentState = await siteConfigPage.isToggleEnabled(key);
            if (currentState !== wasEnabled) {
                await siteConfigPage.clickToggle(key);
                await siteConfigPage.expectToastVisible('Configuration mise à jour');
            }
        }
    });

    test('ADM-CONFIG-007 — Toggle Actualités → masque section news sur /', async ({ page, siteConfigPage }) => {
        await siteConfigPage.expectLoaded();
        const key = 'display_toggle_home_a_la_une';
        const wasEnabled = await siteConfigPage.isToggleEnabled(key);

        try {
            if (wasEnabled) {
                await siteConfigPage.clickToggle(key);
                await siteConfigPage.expectToastVisible('Configuration mise à jour');
                await page.waitForTimeout(200);
            }

            await page.goto('/');
            await page.waitForLoadState('load');
            await expect(page.locator(PUBLIC_SECTIONS[key].selector)).not.toBeVisible();
        } finally {
            await siteConfigPage.goto();
            await siteConfigPage.expectLoaded();
            const currentState = await siteConfigPage.isToggleEnabled(key);
            if (currentState !== wasEnabled) {
                await siteConfigPage.clickToggle(key);
                await siteConfigPage.expectToastVisible('Configuration mise à jour');
            }
        }
    });

    test('ADM-CONFIG-008 — Toggle Newsletter (accueil) → masque formulaire sur /', async ({ page, siteConfigPage }) => {
        await siteConfigPage.expectLoaded();
        const key = 'display_toggle_home_newsletter';
        const wasEnabled = await siteConfigPage.isToggleEnabled(key);

        try {
            if (wasEnabled) {
                await siteConfigPage.clickToggle(key);
                await siteConfigPage.expectToastVisible('Configuration mise à jour');
                await page.waitForTimeout(200);
            }

            await page.goto('/');
            await page.waitForLoadState('load');
            await expect(page.locator(PUBLIC_SECTIONS[key].selector)).not.toBeVisible();
        } finally {
            await siteConfigPage.goto();
            await siteConfigPage.expectLoaded();
            const currentState = await siteConfigPage.isToggleEnabled(key);
            if (currentState !== wasEnabled) {
                await siteConfigPage.clickToggle(key);
                await siteConfigPage.expectToastVisible('Configuration mise à jour');
            }
        }
    });

    test('ADM-CONFIG-009 — Toggle Kit Média → masque section Kit Média sur /presse', async ({ page, siteConfigPage }) => {
        await siteConfigPage.expectLoaded();
        const key = 'display_toggle_media_kit';
        const wasEnabled = await siteConfigPage.isToggleEnabled(key);

        try {
            if (wasEnabled) {
                await siteConfigPage.clickToggle(key);
                await siteConfigPage.expectToastVisible('Configuration mise à jour');
                await page.waitForTimeout(200);
            }

            await page.goto('/presse');
            await page.waitForLoadState('load');
            await expect(page.locator(PUBLIC_SECTIONS[key].selector)).not.toBeVisible();
        } finally {
            await siteConfigPage.goto();
            await siteConfigPage.expectLoaded();
            const currentState = await siteConfigPage.isToggleEnabled(key);
            if (currentState !== wasEnabled) {
                await siteConfigPage.clickToggle(key);
                await siteConfigPage.expectToastVisible('Configuration mise à jour');
            }
        }
    });

    test('ADM-CONFIG-010 — Toggle Communiqués de Presse → masque section sur /presse', async ({ page, siteConfigPage }) => {
        await siteConfigPage.expectLoaded();
        const key = 'display_toggle_presse_articles';
        const wasEnabled = await siteConfigPage.isToggleEnabled(key);

        try {
            if (wasEnabled) {
                await siteConfigPage.clickToggle(key);
                await siteConfigPage.expectToastVisible('Configuration mise à jour');
                await page.waitForTimeout(200);
            }

            await page.goto('/presse');
            await page.waitForLoadState('load');
            await expect(page.locator(PUBLIC_SECTIONS[key].selector)).not.toBeVisible();
        } finally {
            await siteConfigPage.goto();
            await siteConfigPage.expectLoaded();
            const currentState = await siteConfigPage.isToggleEnabled(key);
            if (currentState !== wasEnabled) {
                await siteConfigPage.clickToggle(key);
                await siteConfigPage.expectToastVisible('Configuration mise à jour');
            }
        }
    });

    test('ADM-CONFIG-011 — Toggle Newsletter Agenda → masque newsletter sur /agenda', async ({ page, siteConfigPage }) => {
        await siteConfigPage.expectLoaded();
        const key = 'display_toggle_agenda_newsletter';
        const wasEnabled = await siteConfigPage.isToggleEnabled(key);

        try {
            if (wasEnabled) {
                await siteConfigPage.clickToggle(key);
                await siteConfigPage.expectToastVisible('Configuration mise à jour');
                await page.waitForTimeout(200);
            }

            await page.goto('/agenda');
            await page.waitForLoadState('load');
            await expect(page.locator(PUBLIC_SECTIONS[key].selector)).not.toBeVisible();
        } finally {
            await siteConfigPage.goto();
            await siteConfigPage.expectLoaded();
            const currentState = await siteConfigPage.isToggleEnabled(key);
            if (currentState !== wasEnabled) {
                await siteConfigPage.clickToggle(key);
                await siteConfigPage.expectToastVisible('Configuration mise à jour');
            }
        }
    });

    test('ADM-CONFIG-012 — Toggle Newsletter Contact → masque newsletter sur /contact', async ({ page, siteConfigPage }) => {
        await siteConfigPage.expectLoaded();
        const key = 'display_toggle_contact_newsletter';
        const wasEnabled = await siteConfigPage.isToggleEnabled(key);

        try {
            if (wasEnabled) {
                await siteConfigPage.clickToggle(key);
                await siteConfigPage.expectToastVisible('Configuration mise à jour');
                await page.waitForTimeout(200);
            }

            await page.goto('/contact', { timeout: 60_000 });
            await page.waitForLoadState('load', { timeout: 60_000 });
            // Contact newsletter identifiée par l'input email dédié
            await expect(
                page.locator('#newsletter-email-contact')
            ).not.toBeVisible();
        } finally {
            await siteConfigPage.goto();
            await siteConfigPage.expectLoaded();
            const currentState = await siteConfigPage.isToggleEnabled(key);
            if (currentState !== wasEnabled) {
                await siteConfigPage.clickToggle(key);
                await siteConfigPage.expectToastVisible('Configuration mise à jour');
            }
        }
    });

    test('ADM-CONFIG-013 — Persistance : état du toggle conservé après rechargement', async ({ page, siteConfigPage }) => {
        await siteConfigPage.expectLoaded();
        const key = 'display_toggle_home_a_la_une';

        // Lire l'état initial
        const initialState = await siteConfigPage.isToggleEnabled(key);

        try {
            // Modifier le toggle
            await siteConfigPage.clickToggle(key);
            await siteConfigPage.expectToastVisible('Configuration mise à jour');

            const newState = !initialState;

            // Recharger la page admin site-config
            await siteConfigPage.goto();
            await siteConfigPage.expectLoaded();

            // Vérifier que l'état est persisté
            await siteConfigPage.expectToggleState(key, newState);
        } finally {
            // Restaurer l'état initial
            await siteConfigPage.goto();
            await siteConfigPage.expectLoaded();
            const currentState = await siteConfigPage.isToggleEnabled(key);
            if (currentState !== initialState) {
                await siteConfigPage.clickToggle(key);
                await siteConfigPage.expectToastVisible('Configuration mise à jour');
            }
        }
    });
});
