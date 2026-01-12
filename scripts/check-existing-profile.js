import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'


// '1616b6fc-95b4-4931-b7e1-e9717def4164' //TODO Replace with the user ID you want to check

// Load .env.local first, then .env as fallback
dotenv.config({ path: '.env.local' })
dotenv.config()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SECRET_KEY

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
  const userId = '1616b6fc-95b4-4931-b7e1-e9717def4164' //TODO Replace with the user ID you want to check
  
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
