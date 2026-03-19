/**
 * Factory for `media_tags` and `media_folders` tables (editorial — editor-accessible).
 * Uses service_role client to bypass RLS regardless of the test role.
 */
import { supabaseAdmin } from '../helpers/db';

const TEST_PREFIX = '[TEST]';

export const MediaTagFactory = {
    async cleanup(): Promise<void> {
        const { error } = await supabaseAdmin
            .from('media_tags')
            .delete()
            .like('name', `${TEST_PREFIX}%`);

        if (error) {
            throw new Error(
                `MediaTagFactory.cleanup failed: ${error.message}`,
            );
        }
    },
};

export const MediaFolderFactory = {
    async cleanup(): Promise<void> {
        const { error } = await supabaseAdmin
            .from('media_folders')
            .delete()
            .like('name', `${TEST_PREFIX}%`);

        if (error) {
            throw new Error(
                `MediaFolderFactory.cleanup failed: ${error.message}`,
            );
        }
    },
};
