import { createClient } from '@supabase/supabase-js';
import { env } from '../lib/env';

async function testQuery() {
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SECRET_KEY
  );

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
      spectacles (titre),
      lieux (nom, ville)
    `);
  console.log('Events with lieux count:', eventsWithLieux?.length);
  console.log('Error:', e2?.message);
  if (eventsWithLieux && eventsWithLieux.length > 0) {
    console.log('First event with lieux:', JSON.stringify(eventsWithLieux[0], null, 2));
  }
}

testQuery().catch(console.error);
