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

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkProfile() {
  const userId = '42c0c6e0-7866-480a-bb22-7fe0ae3a49f6'
  
  console.log('Checking profile for user:', userId)
  
  const { data: profile, error } = await adminClient
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  
  if (error) {
    console.error('❌ Error fetching profile:', error)
    process.exit(1)
  }
  
  if (!profile) {
    console.log('⚠️  No profile found')
  } else {
    console.log('✅ Profile found:', profile)
  }
}

checkProfile()
