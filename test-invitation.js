import { inviteUser } from './lib/dal/admin-users.js';

async function testInvitation() {
  console.log('🧪 Testing invitation for yan.in.perso@gmail.com...');

  try {
    const result = await inviteUser('yan.in.perso@gmail.com');
    console.log('✅ Invitation successful:', result);
  } catch (error) {
    console.error('❌ Invitation failed:', error.message);
    console.error('Full error:', error);
  }
}

testInvitation();