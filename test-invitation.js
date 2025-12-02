/**
 * Test d'invitation utilisateur via l'API Route
 * 
 * ⚠️  Ce fichier est déprécié - utiliser scripts/test-full-invitation.js
 * 
 * Usage: node test-invitation.js
 */

const API_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function testInvitation() {
  console.log('🧪 Testing invitation via API Route...');
  console.log(`   Target: ${API_URL}/api/admin/invite-user`);
  console.log('');

  const testEmail = `test-${Date.now()}@example.com`;

  try {
    const response = await fetch(`${API_URL}/api/admin/invite-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        role: 'user',
        displayName: 'Test User',
      }),
    });

    const result = await response.json();
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, result);
    
    if (response.ok && result.success) {
      console.log('');
      console.log('✅ Invitation successful!');
      if (result.data?.warning) {
        console.log(`⚠️  Warning: ${result.data.warning}`);
      }
    } else {
      console.log('');
      console.error('❌ Invitation failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    console.error('   Make sure the dev server is running: pnpm dev');
  }
}

testInvitation();