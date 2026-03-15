/**
 * Factory for `partners` table (admin-only).
 * Uses service_role client to bypass RLS regardless of the test role.
 *
 * Note: This table is admin-only in the UI, but the factory uses
 * service_role so it works even if the test runs as an editor.
 */
import { supabaseAdmin } from '../helpers/db';
import type { Database } from '@/lib/database.types';

type PartnerInsert = Database['public']['Tables']['partners']['Insert'];
type PartnerRow = Database['public']['Tables']['partners']['Row'];

const TEST_PREFIX = '[TEST]';

const DEFAULT_VALUES: Omit<PartnerInsert, 'name'> = {
    description: `${TEST_PREFIX} Partenaire de test`,
    website_url: 'https://example.com',
    is_active: true,
    display_order: 0,
};

let counter = 0;

function nextId(): number {
    counter += 1;
    return counter;
}

export const PartnerFactory = {
    /**
     * Build insert payload without persisting.
     */
    build(overrides: Partial<PartnerInsert> = {}): PartnerInsert {
        const seq = `${Date.now()}_${nextId()}`;
        return {
            ...DEFAULT_VALUES,
            name: `${TEST_PREFIX} Partenaire ${seq}`,
            ...overrides,
        };
    },

    /**
     * Insert a single partner and return the created row.
     */
    async create(overrides: Partial<PartnerInsert> = {}): Promise<PartnerRow> {
        const payload = PartnerFactory.build(overrides);
        const { data, error } = await supabaseAdmin
            .from('partners')
            .insert(payload)
            .select()
            .single();

        if (error) throw new Error(`PartnerFactory.create failed: ${error.message}`);
        return data;
    },

    /**
     * Insert multiple partners.
     */
    async createMany(
        count: number,
        overrides: Partial<PartnerInsert> = {},
    ): Promise<PartnerRow[]> {
        const payloads = Array.from({ length: count }, () =>
            PartnerFactory.build(overrides),
        );
        const { data, error } = await supabaseAdmin
            .from('partners')
            .insert(payloads)
            .select();

        if (error) throw new Error(`PartnerFactory.createMany failed: ${error.message}`);
        return data;
    },

    /**
     * Delete all rows with the [TEST] prefix in `name`.
     */
    async cleanup(): Promise<void> {
        const { error } = await supabaseAdmin
            .from('partners')
            .delete()
            .like('name', `${TEST_PREFIX}%`);

        if (error) throw new Error(`PartnerFactory.cleanup failed: ${error.message}`);
    },
};
