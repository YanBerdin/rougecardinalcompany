import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load .env.local first, then .env as fallback
dotenv.config({ path: '.env.local' })
dotenv.config()

async function testLocalInvitationFlow() {
  console.log("🧪 Testing local invitation flow simulation...");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    console.error("❌ Missing Supabase environment variables");
    return;
  }

  // Create client that persists session (like a browser would)
  const client = createClient(supabaseUrl, anonKey, {
    auth: {
      persistSession: true,
      storage: localStorage
    }
  });

  // Simulate the invitation flow
  console.log("1. Generating invitation link...");

  const adminClient = createClient(supabaseUrl, process.env.SUPABASE_SECRET_KEY || '', {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/setup-account`;

  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: "invite",
    email: "local-test-" + Date.now() + "@example.com",
    options: {
      redirectTo: redirectUrl,
      data: { role: "user", display_name: "Local Test User" },
    },
  });

  if (linkError) {
    console.error("❌ Generate link failed:", linkError);
    return;
  }

  const invitationUrl = linkData.properties.action_link;
  console.log("✅ Invitation URL:", invitationUrl);

  // Extract token
  const url = new URL(invitationUrl);
  const token = url.searchParams.get('token');

  console.log("2. Simulating user clicking link and verifying token...");

  // This simulates what Supabase does when processing the invitation
  const { data, error } = await client.auth.verifyOtp({
    token_hash: token,
    type: 'invite',
  });

  if (error) {
    console.error("❌ Token verification failed:", error);
    return;
  }

  console.log("✅ Token verified, session established");
  console.log("User:", data.user?.email);

  // Now test if we can access the user like the page would
  console.log("3. Testing getUser() like the setup page does...");

  const { data: userData, error: userError } = await client.auth.getUser();

  if (userError) {
    console.error("❌ getUser failed:", userError);
  } else {
    console.log("✅ getUser successful:", userData.user?.email);
    console.log("User ID:", userData.user?.id);
  }

  // Check session
  const { data: sessionData } = await client.auth.getSession();
  console.log("Session present:", !!sessionData.session);

  return {
    user: data.user,
    session: data.session
  };
}

// Mock localStorage for Node.js
const localStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value;
  },
  removeItem(key) {
    delete this.data[key];
  }
};

global.localStorage = localStorage;

testLocalInvitationFlow().catch(console.error);