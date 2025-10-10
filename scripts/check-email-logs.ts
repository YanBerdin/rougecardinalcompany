// scripts/check-email-logs.ts
// Check email delivery logs in Supabase database

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load environment variables from .env.local
function loadEnv() {
  try {
    const envPath = resolve('.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    const envVars: Record<string, string> = {};

    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (value) {
          envVars[key.trim()] = value.replace(/^["']|["']$/g, ''); // Remove quotes
        }
      }
    });

    return envVars;
  } catch (error) {
    console.log('⚠️  Could not load .env.local file');
    return {};
  }
}

async function checkEmailLogs() {
  console.log('📊 Checking email delivery logs...\n');

  // Load environment variables
  const envVars = loadEnv();

  // Check environment variables
  const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing Supabase environment variables');
    console.log('   Make sure your .env.local file has:');
    console.log('   NEXT_PUBLIC_SUPABASE_URL=...');
    console.log('   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=...');
    console.log('\n   💡 You can find these values in your Supabase dashboard:');
    console.log('   https://supabase.com/dashboard/project/yvtrlvmbofklefxcxrzv/settings/api');
    return;
  }

  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check newsletter subscriptions
    console.log('📰 Checking newsletter subscriptions...');
    const { data: newsletterData, error: newsletterError } = await supabase
      .from('abonnes_newsletter')
      .select('email, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (newsletterError) {
      console.log('❌ Newsletter query failed:', newsletterError.message);
    } else {
      console.log('✅ Newsletter subscriptions (last 5):');
      if (newsletterData && newsletterData.length > 0) {
        newsletterData.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.email} - ${new Date(item.created_at).toLocaleString()}`);
        });
      } else {
        console.log('   No newsletter subscriptions found');
      }
    }

    // Check contact messages
    console.log('\n📬 Checking contact messages...');
    const { data: contactData, error: contactError } = await supabase
      .from('messages_contact')
      .select('firstname, lastname, email, reason, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (contactError) {
      console.log('❌ Contact query failed:', contactError.message);
    } else {
      console.log('✅ Contact messages (last 5):');
      if (contactData && contactData.length > 0) {
        contactData.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.name} <${item.email}> - "${item.subject}" - ${new Date(item.created_at).toLocaleString()}`);
        });
      } else {
        console.log('   No contact messages found');
      }
    }

    console.log('\n🎉 Database check completed!');

  } catch (error) {
    console.error('❌ Database check failed:', error);
  }
}

// Run the check
checkEmailLogs();