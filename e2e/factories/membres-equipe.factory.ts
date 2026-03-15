/**
 * Factory for `membres_equipe` table (admin-only).
 * Uses service_role client to bypass RLS regardless of the test role.
 *
 * Note: This table is admin-only in the UI, but the factory uses
 * service_role so it works even if the test runs as an editor.
 */
import { supabaseAdmin } from '../helpers/db';
import type { Database } from '@/lib/database.types';

type MembreEquipeInsert = Database['public']['Tables']['membres_equipe']['Insert'];
type MembreEquipeRow = Database['public']['Tables']['membres_equipe']['Row'];

const TEST_PREFIX = '[TEST]';

const DEFAULT_VALUES: Omit<MembreEquipeInsert, 'name'> = {
  role: 'Comédien',
  description: `${TEST_PREFIX} Bio de test`,
  active: true,
  ordre: 99,
};

let counter = 0;

function nextId(): number {
  counter += 1;
  return counter;
}

export const MembreEquipeFactory = {
  /**
   * Build insert payload without persisting.
   */
  build(overrides: Partial<MembreEquipeInsert> = {}): MembreEquipeInsert {
    const seq = `${Date.now()}_${nextId()}`;
    return {
      ...DEFAULT_VALUES,
      name: `${TEST_PREFIX} Membre ${seq}`,
      ...overrides,
    };
  },

  /**
   * Insert a single membre_equipe and return the created row.
   */
  async create(overrides: Partial<MembreEquipeInsert> = {}): Promise<MembreEquipeRow> {
    const payload = MembreEquipeFactory.build(overrides);
    const { data, error } = await supabaseAdmin
      .from('membres_equipe')
      .insert(payload)
      .select()
      .single();

    if (error) throw new Error(`MembreEquipeFactory.create failed: ${error.message}`);
    return data;
  },

  /**
   * Insert multiple membres_equipe.
   */
  async createMany(
    count: number,
    overrides: Partial<MembreEquipeInsert> = {},
  ): Promise<MembreEquipeRow[]> {
    const payloads = Array.from({ length: count }, () =>
      MembreEquipeFactory.build(overrides),
    );
    const { data, error } = await supabaseAdmin
      .from('membres_equipe')
      .insert(payloads)
      .select();

    if (error) throw new Error(`MembreEquipeFactory.createMany failed: ${error.message}`);
    return data;
  },

  /**
   * Delete all rows with the [TEST] prefix in `name`.
   */
  async cleanup(): Promise<void> {
    const { error } = await supabaseAdmin
      .from('membres_equipe')
      .delete()
      .like('name', `${TEST_PREFIX}%`);

    if (error) throw new Error(`MembreEquipeFactory.cleanup failed: ${error.message}`);
  },
};
