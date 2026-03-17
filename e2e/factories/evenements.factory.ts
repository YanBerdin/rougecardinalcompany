/**
 * Factory for `evenements` table (editorial — editor-accessible).
 * Uses service_role client to bypass RLS regardless of the test role.
 *
 * FK constraints:
 *   - spectacle_id (required) → spectacles.id
 *   - lieu_id (optional)      → lieux.id
 */
import { supabaseAdmin } from '../helpers/db';
import { SpectacleFactory } from './spectacles.factory';
import { LieuFactory } from './lieux.factory';
import type { Database } from '@/lib/database.types';

type EvenementInsert = Database['public']['Tables']['evenements']['Insert'];
type EvenementRow = Database['public']['Tables']['evenements']['Row'];
type SpectacleRow = Database['public']['Tables']['spectacles']['Row'];
type LieuRow = Database['public']['Tables']['lieux']['Row'];

const TEST_PREFIX = '[TEST]';

let counter = 0;

function nextId(): number {
    counter += 1;
    return counter;
}

function futureDate(daysOffset: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0];
}

export interface EvenementWithDeps {
    evenement: EvenementRow;
    spectacle: SpectacleRow;
    lieu: LieuRow | null;
}

export const EvenementFactory = {
    /**
     * Build insert payload without persisting.
     * Requires `spectacle_id` — either pass it or use `createWithDependencies()`.
     */
    build(overrides: Partial<EvenementInsert> & Pick<EvenementInsert, 'spectacle_id'>): EvenementInsert {
        const seq = nextId();
        return {
            date_debut: futureDate(seq),
            status: 'planifie',
            ...overrides,
        };
    },

    /**
     * Insert a single evenement (spectacle_id must be provided).
     */
    async create(overrides: Partial<EvenementInsert> & Pick<EvenementInsert, 'spectacle_id'>): Promise<EvenementRow> {
        const payload = EvenementFactory.build(overrides);
        const { data, error } = await supabaseAdmin
            .from('evenements')
            .insert(payload)
            .select()
            .single();

        if (error) throw new Error(`EvenementFactory.create failed: ${error.message}`);
        return data;
    },

    /**
     * Create an evenement with auto-generated spectacle (and optional lieu).
     */
    async createWithDependencies(
        overrides: Partial<EvenementInsert> = {},
        options: { withLieu?: boolean } = {},
    ): Promise<EvenementWithDeps> {
        const spectacle = await SpectacleFactory.create();
        const lieu = options.withLieu ? await LieuFactory.create() : null;

        const evenement = await EvenementFactory.create({
            spectacle_id: spectacle.id,
            lieu_id: lieu?.id ?? null,
            ...overrides,
        });

        return { evenement, spectacle, lieu };
    },

    /**
     * Insert multiple evenements for the same spectacle.
     */
    async createMany(
        count: number,
        overrides: Partial<EvenementInsert> & Pick<EvenementInsert, 'spectacle_id'>,
    ): Promise<EvenementRow[]> {
        const payloads = Array.from({ length: count }, () =>
            EvenementFactory.build(overrides),
        );
        const { data, error } = await supabaseAdmin
            .from('evenements')
            .insert(payloads)
            .select();

        if (error) throw new Error(`EvenementFactory.createMany failed: ${error.message}`);
        return data;
    },

    /**
     * Delete all [TEST] evenements then cascade to [TEST] spectacles and lieux.
     */
    async cleanup(): Promise<void> {
        const { error } = await supabaseAdmin
            .from('evenements')
            .delete()
            .not('spectacle_id', 'is', null);

        if (error) {
            const { error: fallback } = await supabaseAdmin
                .from('evenements')
                .delete()
                .gte('id', 0);
            if (fallback) throw new Error(`EvenementFactory.cleanup failed: ${fallback.message}`);
        }

        await SpectacleFactory.cleanup();
        await LieuFactory.cleanup();
    },

    /**
     * Delete only evenements linked to test spectacles (selective cleanup).
     */
    async cleanupEventsOnly(): Promise<void> {
        const { data: testSpectacles } = await supabaseAdmin
            .from('spectacles')
            .select('id')
            .like('title', `${TEST_PREFIX}%`);

        if (!testSpectacles?.length) return;

        const ids = testSpectacles.map((s) => s.id);
        const { error } = await supabaseAdmin
            .from('evenements')
            .delete()
            .in('spectacle_id', ids);

        if (error) throw new Error(`EvenementFactory.cleanupEventsOnly failed: ${error.message}`);
    },
};
