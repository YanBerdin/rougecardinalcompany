// spec: specs/PLAN_DE_TEST_COMPLET.md — Section 14: Gestion de la Médiathèque
// seed: none (tags/folders created inline, uploads use test asset)

import { test, expect } from './media.fixtures';
import { MediaTagFactory, MediaFolderFactory } from '@/e2e/factories';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_IMAGE_PATH = path.join(
    __dirname,
    '..', '..', '..', 'fixtures', 'assets', 'test-image.png',
);

test.describe('Médiathèque — Hub', () => {
    // --- P0 ---

    test('ADM-MEDIA-001 — Affichage hub avec 3 sections', async ({
        mediaHub,
    }) => {
        // 1. Navigate to /admin/media (done by fixture)
        await mediaHub.expectLoaded();

        // 2. Verify 3 navigation cards
        await mediaHub.expectThreeSections();
    });

    test('ADM-MEDIA-002 — Navigation vers Bibliothèque', async ({
        mediaHub,
        page,
    }) => {
        await mediaHub.expectLoaded();
        await mediaHub.navigateToLibrary();
        await expect(page).toHaveURL(/\/admin\/media\/library/);
    });

    test('ADM-MEDIA-003 — Navigation vers Tags', async ({
        mediaHub,
        page,
    }) => {
        await mediaHub.expectLoaded();
        await mediaHub.navigateToTags();
        await expect(page).toHaveURL(/\/admin\/media\/tags/);
    });

    test('ADM-MEDIA-004 — Navigation vers Dossiers', async ({
        mediaHub,
        page,
    }) => {
        await mediaHub.expectLoaded();
        await mediaHub.navigateToFolders();
        await expect(page).toHaveURL(/\/admin\/media\/folders/);
    });
});

test.describe('Médiathèque — Bibliothèque', () => {
    // --- P0 ---

    test('ADM-MEDIA-005 — Upload une image valide', async ({
        mediaLibrary,
    }) => {
        // 1. Navigate to library (done by fixture)
        await mediaLibrary.expectLoaded();

        // 2. Click upload
        await mediaLibrary.clickUpload();

        // 3. Fill upload dialog with test image
        await mediaLibrary.fillUploadDialog(TEST_IMAGE_PATH);

        // 4. Submit upload
        await mediaLibrary.submitUpload();

        // 5. Verify upload toast
        await mediaLibrary.expectUploadToast();
    });

    test('ADM-MEDIA-006 — Recherche dans la bibliothèque', async ({
        mediaLibrary,
    }) => {
        // 1. Verify the search input is visible
        await mediaLibrary.expectLoaded();
        await expect(mediaLibrary.searchInput).toBeVisible();

        // 2. Type a search query
        await mediaLibrary.search('test');

        // 3. Verify the search filters the results (page does not crash)
        // Results depend on seeded data — just verify no error
        await expect(mediaLibrary.searchInput).toHaveValue('test');
    });
});

test.describe('Médiathèque — Tags', () => {
    // --- P0 ---

    test.afterEach(async () => {
        await MediaTagFactory.cleanup();
    });

    test('ADM-MEDIA-007 — Créer un tag', async ({ mediaTags }) => {
        // 1. Navigate to tags (done by fixture)
        await mediaTags.expectLoaded();

        // 2. Click "Créer un tag"
        await mediaTags.clickCreate();

        // 3. Fill name
        await mediaTags.fillTagForm('[TEST] MonTag');

        // 4. Submit
        await mediaTags.submitTagForm();

        // 5. Verify toast
        await mediaTags.expectTagCreateToast();

        // 6. Verify visible
        await mediaTags.expectTagVisible('[TEST] MonTag');
    });

    test('ADM-MEDIA-008 — Supprimer un tag', async ({
        mediaTags,
        page,
    }) => {
        // 1. Create a tag first
        await mediaTags.expectLoaded();
        await mediaTags.clickCreate();
        await mediaTags.fillTagForm('[TEST] TagSuppr');
        await mediaTags.submitTagForm();
        await mediaTags.expectTagCreateToast();

        // 2. Delete the tag
        await mediaTags.clickDeleteTag('[TEST] TagSuppr');
        await mediaTags.confirmDelete();

        // 3. Verify toast
        await mediaTags.expectTagDeleteToast();

        // 4. Verify the tag is gone
        await expect(page.getByText('[TEST] TagSuppr').first()).toBeHidden();
    });
});

test.describe('Médiathèque — Dossiers', () => {
    // --- P0 ---

    test.afterEach(async () => {
        await MediaFolderFactory.cleanup();
    });

    test('ADM-MEDIA-009 — Créer un dossier', async ({ mediaFolders }) => {
        // 1. Navigate to folders (done by fixture)
        await mediaFolders.expectLoaded();

        // 2. Click "Créer un dossier"
        await mediaFolders.clickCreate();

        // 3. Fill name
        await mediaFolders.fillFolderForm('[TEST] MonDossier');

        // 4. Submit
        await mediaFolders.submitFolderForm();

        // 5. Verify toast
        await mediaFolders.expectFolderCreateToast();

        // 6. Verify visible
        await mediaFolders.expectFolderVisible('[TEST] MonDossier');
    });

    test('ADM-MEDIA-010 — Supprimer un dossier', async ({
        mediaFolders,
        page,
    }) => {
        // 1. Create a folder first
        await mediaFolders.expectLoaded();
        await mediaFolders.clickCreate();
        await mediaFolders.fillFolderForm('[TEST] DossierSuppr');
        await mediaFolders.submitFolderForm();
        await mediaFolders.expectFolderCreateToast();

        // 2. Delete the folder
        await mediaFolders.clickDeleteFolder('[TEST] DossierSuppr');
        await mediaFolders.confirmDelete();

        // 3. Verify toast
        await mediaFolders.expectFolderDeleteToast();

        // 4. Verify the folder is gone
        await expect(page.getByText('[TEST] DossierSuppr').first()).toBeHidden();
    });

    // --- P1 ---

    test('ADM-MEDIA-011 — Modifier un dossier', async ({
        mediaFolders,
    }) => {
        // 1. Create a folder
        await mediaFolders.expectLoaded();
        await mediaFolders.clickCreate();
        await mediaFolders.fillFolderForm('[TEST] DossierEdit');
        await mediaFolders.submitFolderForm();
        await mediaFolders.expectFolderCreateToast();

        // 2. Click edit
        await mediaFolders.clickEditFolder('[TEST] DossierEdit');

        // 3. Change name
        await mediaFolders.fillFolderForm('[TEST] DossierRenommé');

        // 4. Submit
        await mediaFolders.submitFolderForm();

        // 5. Verify updated name
        await mediaFolders.expectFolderVisible('[TEST] DossierRenommé');
    });
});
