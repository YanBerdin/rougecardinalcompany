/**
 * Test d'invitation utilisateur via l'API Route
 * 
 * ⚠️  ATTENTION: Cette route nécessite une authentification admin (cookie)
 * 
 * Pour tester sans authentification, utiliser:
 *   pnpm exec tsx scripts/test-dal-admin-users.ts
 * 
 * Pour tester avec authentification:
 *   1. Se connecter en tant qu'admin sur http://localhost:3000/admin
 *   2. Copier le cookie d'authentification depuis les DevTools
 *   3. Exécuter: AUTH_COOKIE="sb-xxx=..." node scripts/test-full-invitation.js
 * 
 * Usage: 
 *   node scripts/test-full-invitation.js                    # Sans auth (403 attendu)
 *   AUTH_COOKIE="..." node scripts/test-full-invitation.js  # Avec auth
 */
import dotenv from 'dotenv'

// Load .env.local first, then .env as fallback
dotenv.config({ path: '.env.local' })
dotenv.config()

const API_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const AUTH_COOKIE = process.env.AUTH_COOKIE || ''

async function testInvitation() {
  console.log('🧪 Testing invitation flow via API Route...')
  console.log(`   API URL: ${API_URL}/api/admin/invite-user`)
  console.log(`   Auth: ${AUTH_COOKIE ? '✅ Cookie provided' : '❌ No cookie (403 expected)'}`)
  console.log('')
  
  if (!AUTH_COOKIE) {
    console.log('⚠️  Aucun cookie d\'authentification fourni.')
    console.log('   L\'API va retourner 403 Forbidden (comportement attendu).')
    console.log('')
    console.log('   Pour tester les fonctions DAL directement (sans HTTP):')
    console.log('   pnpm exec tsx scripts/test-dal-admin-users.ts')
    console.log('')
  }
  
  const testEmail = `test-${Date.now()}@example.com`
  
  try {
    const headers = {
      'Content-Type': 'application/json',
    }
    
    if (AUTH_COOKIE) {
      headers['Cookie'] = AUTH_COOKIE
    }
    
    const response = await fetch(`${API_URL}/api/admin/invite-user`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: testEmail,
        role: 'user',
        displayName: 'Test User',
      }),
    })

    const result = await response.json()
    
    console.log(`   Status: ${response.status}`)
    console.log(`   Response:`, JSON.stringify(result, null, 2))
    
    // 403 sans cookie est le comportement attendu
    if (response.status === 403 && !AUTH_COOKIE) {
      console.log('')
      console.log('✅ Test réussi: Protection auth fonctionne (403 Forbidden)')
      console.log('')
      console.log('Pour tester l\'invitation complète, utilisez:')
      console.log('  pnpm exec tsx scripts/test-dal-admin-users.ts')
      process.exit(0)
    }
    
    if (response.ok && result.success) {
      console.log('')
      console.log('✅ Invitation successful!')
      console.log(`   User ID: ${result.data?.userId}`)
      if (result.data?.warning) {
        console.log(`   ⚠️  Warning: ${result.data.warning}`)
      }
    } else {
      console.log('')
      console.error('❌ Invitation failed:', result.error)
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message)
    console.error('   Make sure the dev server is running: pnpm dev')
    process.exit(1)
  }
}

testInvitation()
