import { test, expect } from './audit-logs.fixtures';

test.describe("ADM-AUDIT — Logs d'audit : consultation et filtrage", () => {
    test.describe.configure({ retries: 2 });

    test.beforeEach(async ({ page }) => {
        // Assure une largeur desktop pour que la table (hidden sm:block) soit visible
        await page.setViewportSize({ width: 1280, height: 800 });
    });

    // ADM-AUDIT-001 P0
    test('ADM-AUDIT-001 — Table chargée avec colonnes principales', async ({ auditLogsPage }) => {
        await auditLogsPage.expectLoaded();
        await auditLogsPage.expectColumnHeaders();
    });

    // ADM-AUDIT-002 P0
    test('ADM-AUDIT-002 — Au moins une entrée de log affichée', async ({ auditLogsPage }) => {
        await auditLogsPage.expectLoaded();
        // nth(1) : première ligne de données (nth(0) est le header)
        await expect(auditLogsPage.logsTable.getByRole('row').nth(1)).toBeVisible();
    });

    // ADM-AUDIT-003 P1
    test('ADM-AUDIT-003 — Filtre par action : sélectionner INSERT', async ({ auditLogsPage, page }) => {
        await auditLogsPage.expectLoaded();

        // Ouvrir le Select Action (premier combobox de la grille de filtres)
        const actionCombo = page.getByRole('combobox').first();
        await actionCombo.click();

        // Attendre que le dropdown (portal Radix) soit visible avant de chercher les options
        const listbox = page.getByRole('listbox');
        await expect(listbox).toBeVisible({ timeout: 10_000 });

        // Sélectionner INSERT dans la liste déroulante
        await listbox.getByRole('option', { name: 'INSERT' }).click();

        // Le trigger du Select doit refléter le choix
        await expect(actionCombo).toContainText('INSERT');
    });

    // ADM-AUDIT-004 P1
    test("ADM-AUDIT-004 — Filtre par table : liste d'options disponibles", async ({ auditLogsPage, page }) => {
        await auditLogsPage.expectLoaded();

        // Ouvrir le Select Table (deuxième combobox)
        await page.getByRole('combobox').nth(1).click();

        // Attendre que le dropdown (portal Radix) soit visible avant de chercher les options
        const tableListbox = page.getByRole('listbox');
        await expect(tableListbox).toBeVisible({ timeout: 10_000 });
        await expect(tableListbox.getByRole('option', { name: 'Toutes les tables' })).toBeVisible();

        // Fermer sans sélectionner
        await page.keyboard.press('Escape');
        await expect(auditLogsPage.logsTable).toBeVisible();
    });

    // ADM-AUDIT-005 P1
    test('ADM-AUDIT-005 — Recherche textuelle dans les logs', async ({ auditLogsPage }) => {
        await auditLogsPage.expectLoaded();

        // Saisir un terme de recherche
        await auditLogsPage.searchLogs('partners');

        // La table reste visible (résultats filtrés ou état vide)
        await expect(auditLogsPage.logsTable).toBeVisible();
    });

    // ADM-AUDIT-006 P1
    test('ADM-AUDIT-006 — Filtre par période de dates', async ({ auditLogsPage, page }) => {
        await auditLogsPage.expectLoaded();

        // 1. Ouvrir le DateRangePicker
        const trigger = page.getByRole('button').filter({ hasText: 'Sélectionner une période' });
        await trigger.click();

        // 2. Attendre l'affichage du calendrier (react-day-picker, 2 mois, locale=fr)
        const firstGrid = page.locator('[role="grid"]').first();
        await expect(firstGrid).toBeVisible({ timeout: 15_000 });

        // 3. Sélectionner une plage : jours 10 → 20 du 1er mois affiché
        //    Les boutons de jours ont pour texte leur numéro seul (ex: "10", "20")
        //    On évite les jours 1-5 qui peuvent apparaître en spillover du mois suivant
        await firstGrid.locator('button').filter({ hasText: /^10$/ }).click();
        await firstGrid.locator('button').filter({ hasText: /^20$/ }).click();

        // 4. Fermer le popover
        await page.keyboard.press('Escape');

        // 5. Le déclencheur a changé de texte — "Sélectionner une période" n'est plus affiché
        await expect(
            page.getByRole('button').filter({ hasText: 'Sélectionner une période' }),
        ).not.toBeVisible({ timeout: 3_000 });

        // 6. La table reste visible (données filtrées ou état vide selon les logs existants)
        await expect(auditLogsPage.logsTable).toBeVisible();
    });

    // ADM-AUDIT-007 P1
    test('ADM-AUDIT-007 — Tri par date', async ({ auditLogsPage, page }) => {
        await auditLogsPage.expectLoaded();

        // Le SortableHeader rend un <Button variant="ghost"> avec le label comme nom accessible
        const dateSortBtn = auditLogsPage.logsTable.getByRole('button', { name: 'Date' });
        await dateSortBtn.click();

        // Le bouton et les données doivent rester visibles après le tri
        await expect(dateSortBtn).toBeVisible();
        await expect(auditLogsPage.logsTable.getByRole('row').nth(1)).toBeVisible();
    });

    // ADM-AUDIT-008 P2
    test("ADM-AUDIT-008 — Tri par type d'action", async ({ auditLogsPage, page }) => {
        await auditLogsPage.expectLoaded();

        const actionSortBtn = auditLogsPage.logsTable.getByRole('button', { name: 'Action' });
        await actionSortBtn.click();

        await expect(actionSortBtn).toBeVisible();
        await expect(auditLogsPage.logsTable.getByRole('row').nth(1)).toBeVisible();
    });

    // ADM-AUDIT-009 P1
    test('ADM-AUDIT-009 — Export CSV déclenche un téléchargement', async ({ auditLogsPage }) => {
        await auditLogsPage.expectLoaded();

        // Filtrer par action UPDATE pour limiter le volume de données exportées
        // et éviter un timeout du Server Action paginé.
        await auditLogsPage.selectActionFilter('UPDATE');

        await auditLogsPage.clickExport();
        await auditLogsPage.expectExportToast();
    });

    // ADM-AUDIT-010 P2 — enveloppé dans un describe pour activer 1 retry sur le statement_timeout
    // Postgres intermittent : après l'export d'ADM-AUDIT-009, la BDD peut être sous charge
    // lors du chargement initial de la fixture, causant un échec. Un retry suffit à récupérer.
    test.describe('ADM-AUDIT-010', () => {
        test.describe.configure({ retries: 1 });

        test('ADM-AUDIT-010 — Rafraîchir recharge la table', async ({ auditLogsPage }) => {
            await auditLogsPage.expectLoaded();

            await auditLogsPage.clickRefresh();
            await auditLogsPage.expectLoaded();

            // Timeout étendu : rechargement post-refresh peut être lent selon la charge BDD
            await expect(auditLogsPage.logsTable.getByRole('row').nth(1)).toBeVisible({ timeout: 15_000 });
        });
    });

    // ADM-AUDIT-011 P1
    test('ADM-AUDIT-011 — Log visible après navigation dans une section admin', async ({ auditLogsPage, page }) => {
        // Naviguer vers une section admin (génère potentiellement des logs de lecture)
        await page.goto('/admin/partners');
        await page.waitForLoadState('load');
        await page.waitForTimeout(500);

        // Revenir aux audit logs
        await auditLogsPage.goto();
        await auditLogsPage.expectLoaded();

        // Au moins une entrée de log doit être visible
        // Timeout étendu : double navigation (fixture→partners→audit-logs) ralentit le chargement des données
        await expect(auditLogsPage.logsTable.getByRole('row').nth(1)).toBeVisible({ timeout: 15_000 });
    });
});
