/**
 * Factory for `lieux` table (editorial — editor-accessible).
 * Uses service_role client to bypass RLS regardless of the test role.
 */
import { supabaseAdmin } from '../helpers/db';
import type { Database } from '@/lib/database.types';

type LieuInsert = Database['public']['Tables']['lieux']['Insert'];
type LieuRow = Database['public']['Tables']['lieux']['Row'];

const TEST_PREFIX = '[TEST]';

const DEFAULT_VALUES: Omit<LieuInsert, 'nom'> = {
    adresse: '1 Rue du Théâtre',
    ville: 'Paris',
    code_postal: '75015',
    pays: 'France',
};

let counter = 0;

function nextId(): number {
    counter += 1;
    return counter;
}

export const LieuFactory = {
    /**
     * Build insert payload without persisting.
     */
    build(overrides: Partial<LieuInsert> = {}): LieuInsert {
        const seq = `${Date.now()}_${nextId()}`;
        return {
            ...DEFAULT_VALUES,
            nom: `${TEST_PREFIX} Lieu ${seq}`,
            ...overrides,
        };
    },

    /**
     * Insert a single lieu and return the created row.
     */
    async create(overrides: Partial<LieuInsert> = {}): Promise<LieuRow> {
        const payload = LieuFactory.build(overrides);
        const { data, error } = await supabaseAdmin
            .from('lieux')
            .insert(payload)
            .select()
            .single();

        if (error) throw new Error(`LieuFactory.create failed: ${error.message}`);
        return data;
    },

    /**
     * Insert multiple lieux.
     */
    async createMany(
        count: number,
        overrides: Partial<LieuInsert> = {},
    ): Promise<LieuRow[]> {
        const payloads = Array.from({ length: count }, () =>
            LieuFactory.build(overrides),
        );
        const { data, error } = await supabaseAdmin
            .from('lieux')
            .insert(payloads)
            .select();

        if (error) throw new Error(`LieuFactory.createMany failed: ${error.message}`);
        return data;
    },

    /**
     * Delete all rows with the [TEST] prefix in `nom`.
     */
    async cleanup(): Promise<void> {
        const { error } = await supabaseAdmin
            .from('lieux')
            .delete()
            .like('nom', `${TEST_PREFIX}%`);

        if (error) throw new Error(`LieuFactory.cleanup failed: ${error.message}`);
    },
};
