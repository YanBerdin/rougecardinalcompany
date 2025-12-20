import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

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

async function deleteUser() {
  const userId = 'a21311a0-7300-4602-98ef-4baa11154ab7'
  
  console.log('Deleting user:', userId)
  
  const { error } = await adminClient.auth.admin.deleteUser(userId)
  
  if (error) {
    console.error('❌ Error deleting user:', error)
    process.exit(1)
  }
  
  console.log('✅ User deleted successfully')
}

deleteUser()
