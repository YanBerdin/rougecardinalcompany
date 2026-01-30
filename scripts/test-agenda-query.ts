#!/usr/bin/env tsx
/**
 * Test Agenda Query - Debug script for evenements table joins
 * 
 * Usage: pnpm exec tsx scripts/test-agenda-query.ts
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !secretKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SECRET_KEY');
  process.exit(1);
}

async function testQuery() {
  const supabase = createClient(supabaseUrl!, secretKey!);

  // Test 1: Basic query on evenements
  console.log('\n=== Test 1: Simple evenements query ===');
  const { data: events, error: e1 } = await supabase
    .from('evenements')
    .select('*');
  console.log('Events count:', events?.length);
  console.log('Error:', e1?.message);
  if (events && events.length > 0) {
    console.log('First event:', JSON.stringify(events[0], null, 2));
  }

  // Test 2: Query with lieux join
  console.log('\n=== Test 2: With lieux join ===');
  const { data: eventsWithLieux, error: e2 } = await supabase
    .from('evenements')
    .select(`
      id,
      spectacle_id,
      lieu_id,
      date_debut,
      spectacles (title),
      lieux (nom, ville)
    `);
  console.log('Events with lieux count:', eventsWithLieux?.length);
  console.log('Error:', e2?.message);
  if (eventsWithLieux && eventsWithLieux.length > 0) {
    console.log('First event with lieux:', JSON.stringify(eventsWithLieux[0], null, 2));
  }
}

testQuery().catch(console.error);
