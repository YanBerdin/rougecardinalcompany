import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load .env.local first, then .env as fallback
dotenv.config({ path: '.env.local' })
dotenv.config()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error('Missing required env variables')
}

// Create admin client (bypasses auth but NOT RLS)
const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testProfileInsertion() {
  const userId = '42c0c6e0-7866-480a-bb22-7fe0ae3a49f6'
  console.log('Testing profile insertion with admin client...')
  console.log('User ID:', userId)
  
  // Try to insert profile
  const { data, error } = await adminClient
    .from('profiles')
    .insert({
      user_id: userId,
      role: 'admin',
      display_name: 'Test Admin User'
    })
    .select()
  
  if (error) {
    console.error('❌ Error inserting profile:', error)
    process.exit(1)
  }
  
  console.log('✅ Profile inserted successfully:', data)
  
  // Verify profile exists
  const { data: profile, error: fetchError } = await adminClient
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (fetchError) {
    console.error('❌ Error fetching profile:', fetchError)
    process.exit(1)
  }
  
  console.log('✅ Profile verification:', profile)
}

testProfileInsertion()
