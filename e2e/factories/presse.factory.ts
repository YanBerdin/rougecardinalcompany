/**
 * Factory for `communiques_presse` table (editorial — editor-accessible).
 * Uses service_role client to bypass RLS regardless of the test role.
 */
import { supabaseAdmin } from '../helpers/db';
import type { Database } from '@/lib/database.types';

type CommuniqueInsert =
    Database['public']['Tables']['communiques_presse']['Insert'];
type CommuniqueRow =
    Database['public']['Tables']['communiques_presse']['Row'];

const TEST_PREFIX = '[TEST]';

const DEFAULT_VALUES: Omit<CommuniqueInsert, 'title' | 'date_publication'> = {
    description: `${TEST_PREFIX} Contenu du communiqué`,
    public: false,
    ordre_affichage: 0,
};

let counter = 0;

function nextId(): number {
    counter += 1;
    return counter;
}

function todayISO(): string {
    return new Date().toISOString().split('T')[0];
}

export const PressReleaseFactory = {
    build(
        overrides: Partial<CommuniqueInsert> = {},
    ): CommuniqueInsert {
        const seq = `${Date.now()}_${nextId()}`;
        return {
            ...DEFAULT_VALUES,
            title: `${TEST_PREFIX} Communiqué ${seq}`,
            slug: `test-communique-${seq}`,
            date_publication: todayISO(),
            ...overrides,
        } as CommuniqueInsert;
    },

    async create(
        overrides: Partial<CommuniqueInsert> = {},
    ): Promise<CommuniqueRow> {
        const payload = PressReleaseFactory.build(overrides);
        const { data, error } = await supabaseAdmin
            .from('communiques_presse')
            .insert(payload)
            .select()
            .single();

        if (error) {
            throw new Error(
                `PressReleaseFactory.create failed: ${error.message}`,
            );
        }
        return data;
    },

    async createMany(
        count: number,
        overrides: Partial<CommuniqueInsert> = {},
    ): Promise<CommuniqueRow[]> {
        const payloads = Array.from({ length: count }, () =>
            PressReleaseFactory.build(overrides),
        );
        const { data, error } = await supabaseAdmin
            .from('communiques_presse')
            .insert(payloads)
            .select();

        if (error) {
            throw new Error(
                `PressReleaseFactory.createMany failed: ${error.message}`,
            );
        }
        return data;
    },

    async cleanup(): Promise<void> {
        const { error } = await supabaseAdmin
            .from('communiques_presse')
            .delete()
            .like('title', `${TEST_PREFIX}%`);

        if (error) {
            throw new Error(
                `PressReleaseFactory.cleanup failed: ${error.message}`,
            );
        }
    },
};
