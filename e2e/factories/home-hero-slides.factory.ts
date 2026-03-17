/**
 * Factory for `home_hero_slides` table (admin-only).
 * Uses service_role client to bypass RLS regardless of the test role.
 *
 * Note: This table is admin-only in the UI, but the factory uses
 * service_role so it works even if the test runs as an editor.
 */
import { supabaseAdmin } from '../helpers/db';
import type { Database } from '@/lib/database.types';

type HeroSlideInsert = Database['public']['Tables']['home_hero_slides']['Insert'];
type HeroSlideRow = Database['public']['Tables']['home_hero_slides']['Row'];

const TEST_PREFIX = '[TEST]';

const DEFAULT_VALUES: Omit<HeroSlideInsert, 'slug' | 'title'> = {
  subtitle: `${TEST_PREFIX} Sous-titre`,
  description: `${TEST_PREFIX} Description du slide`,
  active: false,
  position: 99,
  alt_text: 'Image de test',
  cta_primary_enabled: false,
  cta_secondary_enabled: false,
};

let counter = 0;

function nextId(): number {
  counter += 1;
  return counter;
}

export const HeroSlideFactory = {
  /**
   * Build insert payload without persisting.
   */
  build(overrides: Partial<HeroSlideInsert> = {}): HeroSlideInsert {
    const seq = `${Date.now()}_${nextId()}`;
    return {
      ...DEFAULT_VALUES,
      title: `${TEST_PREFIX} Hero Slide ${seq}`,
      slug: `test-hero-slide-${seq}`,
      ...overrides,
    };
  },

  /**
   * Insert a single hero slide and return the created row.
   */
  async create(overrides: Partial<HeroSlideInsert> = {}): Promise<HeroSlideRow> {
    const payload = HeroSlideFactory.build(overrides);
    const { data, error } = await supabaseAdmin
      .from('home_hero_slides')
      .insert(payload)
      .select()
      .single();

    if (error) throw new Error(`HeroSlideFactory.create failed: ${error.message}`);
    return data;
  },

  /**
   * Insert multiple hero slides.
   */
  async createMany(
    count: number,
    overrides: Partial<HeroSlideInsert> = {},
  ): Promise<HeroSlideRow[]> {
    const payloads = Array.from({ length: count }, () =>
      HeroSlideFactory.build(overrides),
    );
    const { data, error } = await supabaseAdmin
      .from('home_hero_slides')
      .insert(payloads)
      .select();

    if (error) throw new Error(`HeroSlideFactory.createMany failed: ${error.message}`);
    return data;
  },

  /**
   * Delete all rows with the [TEST] prefix in `title`.
   */
  async cleanup(): Promise<void> {
    const { error } = await supabaseAdmin
      .from('home_hero_slides')
      .delete()
      .like('title', `${TEST_PREFIX}%`);

    if (error) throw new Error(`HeroSlideFactory.cleanup failed: ${error.message}`);
  },
};
