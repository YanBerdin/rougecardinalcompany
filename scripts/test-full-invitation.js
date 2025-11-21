import dotenv from 'dotenv'

// Load .env.local first, then .env as fallback
dotenv.config({ path: '.env.local' })
dotenv.config()

// Import the inviteUser function
import { inviteUser } from '../lib/dal/admin-users.ts'

async function testInvitation() {
  console.log('Testing invitation flow...')
  
  const result = await inviteUser({
    email: 'yan.in.perso@gmail.com',
    role: 'admin',
    displayName: 'Yan Admin Test',
    redirectTo: 'http://localhost:3000/auth/callback'
  })
  
  if (result.success) {
    console.log('✅ Invitation successful!')
    console.log('User created:', result.user)
  } else {
    console.error('❌ Invitation failed:', result.error)
    if (result.status) {
      console.error('Status code:', result.status)
    }
    if (result.details) {
      console.error('Details:', result.details)
    }
    process.exit(1)
  }
}

testInvitation()
