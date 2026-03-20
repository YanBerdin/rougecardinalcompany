/**
 * Factory for `compagnie_stats` table (admin-only).
 * Uses service_role client to bypass RLS regardless of the test role.
 *
 * Fields: key (unique text), label, value, position, active
 */
import { supabaseAdmin } from '../helpers/db';
import type { Database } from '@/lib/database.types';

type CompagnieStatInsert = Database['public']['Tables']['compagnie_stats']['Insert'];
type CompagnieStatRow = Database['public']['Tables']['compagnie_stats']['Row'];

const TEST_PREFIX = '[TEST]';

const DEFAULT_VALUES: Omit<CompagnieStatInsert, 'key' | 'label' | 'value'> = {
    position: 99,
    active: true,
};

let counter = 0;

function nextId(): number {
    counter += 1;
    return counter;
}

export const CompagnieStatFactory = {
    /**
     * Build insert payload without persisting.
     */
    build(overrides: Partial<CompagnieStatInsert> = {}): CompagnieStatInsert {
        const seq = `${Date.now()}_${nextId()}`;
        return {
            ...DEFAULT_VALUES,
            key: `test_stat_${seq}`,
            label: `${TEST_PREFIX} Statistique ${seq}`,
            value: '42+',
            ...overrides,
        };
    },

    /**
     * Insert a single stat and return the created row.
     */
    async create(overrides: Partial<CompagnieStatInsert> = {}): Promise<CompagnieStatRow> {
        const payload = CompagnieStatFactory.build(overrides);
        const { data, error } = await supabaseAdmin
            .from('compagnie_stats')
            .insert(payload)
            .select()
            .single();

        if (error) throw new Error(`CompagnieStatFactory.create failed: ${error.message}`);
        return data;
    },

    /**
     * Insert multiple stats.
     */
    async createMany(
        count: number,
        overrides: Partial<CompagnieStatInsert> = {},
    ): Promise<CompagnieStatRow[]> {
        const payloads = Array.from({ length: count }, () =>
            CompagnieStatFactory.build(overrides),
        );
        const { data, error } = await supabaseAdmin
            .from('compagnie_stats')
            .insert(payloads)
            .select();

        if (error) throw new Error(`CompagnieStatFactory.createMany failed: ${error.message}`);
        return data;
    },

    /**
     * Delete all test stats (label LIKE '[TEST]%').
     */
    async cleanup(): Promise<void> {
        const { error } = await supabaseAdmin
            .from('compagnie_stats')
            .delete()
            .like('label', `${TEST_PREFIX}%`);

        if (error) throw new Error(`CompagnieStatFactory.cleanup failed: ${error.message}`);
    },
};
