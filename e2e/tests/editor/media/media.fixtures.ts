import { test as base } from '@playwright/test';
import {
    AdminMediaPage,
    AdminMediaLibraryPage,
    AdminMediaTagsPage,
    AdminMediaFoldersPage,
} from '@/e2e/pages/admin/media.page';

interface MediaFixtures {
    mediaHub: AdminMediaPage;
    mediaLibrary: AdminMediaLibraryPage;
    mediaTags: AdminMediaTagsPage;
    mediaFolders: AdminMediaFoldersPage;
}

export const test = base.extend<MediaFixtures>({
    mediaHub: async ({ page }, use) => {
        const mediaHub = new AdminMediaPage(page);
        await mediaHub.goto();
        // eslint-disable-next-line react-hooks/rules-of-hooks
        await use(mediaHub);
    },
    mediaLibrary: async ({ page }, use) => {
        const lib = new AdminMediaLibraryPage(page);
        await lib.goto();
        // eslint-disable-next-line react-hooks/rules-of-hooks
        await use(lib);
    },
    mediaTags: async ({ page }, use) => {
        const tags = new AdminMediaTagsPage(page);
        await tags.goto();
        // eslint-disable-next-line react-hooks/rules-of-hooks
        await use(tags);
    },
    mediaFolders: async ({ page }, use) => {
        const folders = new AdminMediaFoldersPage(page);
        await folders.goto();
        // eslint-disable-next-line react-hooks/rules-of-hooks
        await use(folders);
    },
});

export { expect } from '@playwright/test';
