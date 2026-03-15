/**
 * Factory for `spectacles` table (editorial — editor-accessible).
 * Uses service_role client to bypass RLS regardless of the test role.
 */
import { supabaseAdmin } from '../helpers/db';
import type { Database } from '@/lib/database.types';

type SpectacleInsert = Database['public']['Tables']['spectacles']['Insert'];
type SpectacleRow = Database['public']['Tables']['spectacles']['Row'];

const TEST_PREFIX = '[TEST]';

const DEFAULT_VALUES: Omit<SpectacleInsert, 'title'> = {
    status: 'draft',
    description: `${TEST_PREFIX} Description de test`,
    short_description: `${TEST_PREFIX} Résumé court`,
    genre: 'Théâtre',
    duration_minutes: 90,
    public: false,
};

let counter = 0;

function nextId(): number {
    counter += 1;
    return counter;
}

export const SpectacleFactory = {
    /**
     * Build insert payload without persisting.
     */
    build(overrides: Partial<SpectacleInsert> = {}): SpectacleInsert {
        const seq = `${Date.now()}_${nextId()}`;
        return {
            ...DEFAULT_VALUES,
            title: `${TEST_PREFIX} Spectacle ${seq}`,
            slug: `test-spectacle-${seq}`,
            ...overrides,
        };
    },

    /**
     * Insert a single spectacle and return the created row.
     */
    async create(overrides: Partial<SpectacleInsert> = {}): Promise<SpectacleRow> {
        const payload = SpectacleFactory.build(overrides);
        const { data, error } = await supabaseAdmin
            .from('spectacles')
            .insert(payload)
            .select()
            .single();

        if (error) throw new Error(`SpectacleFactory.create failed: ${error.message}`);
        return data;
    },

    /**
     * Insert multiple spectacles.
     */
    async createMany(
        count: number,
        overrides: Partial<SpectacleInsert> = {},
    ): Promise<SpectacleRow[]> {
        const payloads = Array.from({ length: count }, () =>
            SpectacleFactory.build(overrides),
        );
        const { data, error } = await supabaseAdmin
            .from('spectacles')
            .insert(payloads)
            .select();

        if (error) throw new Error(`SpectacleFactory.createMany failed: ${error.message}`);
        return data;
    },

    /**
     * Delete all rows with the [TEST] prefix in `title`.
     */
    async cleanup(): Promise<void> {
        const { error } = await supabaseAdmin
            .from('spectacles')
            .delete()
            .like('title', `${TEST_PREFIX}%`);

        if (error) throw new Error(`SpectacleFactory.cleanup failed: ${error.message}`);
    },
};
