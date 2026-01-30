#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.SUPABASE_LOCAL_URL!,
    process.env.SUPABASE_LOCAL_SERVICE_KEY!
);

const { data, error } = await supabase.storage.listBuckets();

if (error) {
    console.error('Error:', error);
} else {
    console.log('Buckets disponibles:', data?.map(b => b.name).join(', ') || 'aucun');
}
