import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load .env.local first, then .env as fallback
dotenv.config({ path: '.env.local' })
dotenv.config()

async function testCompleteInvitationFlow() {
  console.log("🧪 Testing complete invitation flow with browser simulation...");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    console.error("❌ Missing Supabase environment variables");
    return;
  }

  // Step 1: Generate invitation link
  console.log("1. Generating invitation link...");
  const adminClient = createClient(supabaseUrl, process.env.SUPABASE_SECRET_KEY || '', {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/setup-account`;

  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: "invite",
    email: "complete-test-" + Date.now() + "@example.com",
    options: {
      redirectTo: redirectUrl,
      data: { role: "user", display_name: "Complete Test User" },
    },
  });

  if (linkError) {
    console.error("❌ Generate link failed:", linkError);
    return;
  }

  const invitationUrl = linkData.properties.action_link;
  console.log("✅ Invitation URL generated");

  // Step 2: Simulate browser opening the invitation link
  console.log("2. Simulating browser opening invitation link...");

  // Create a client that simulates a browser (with localStorage)
  const browserClient = createClient(supabaseUrl, anonKey, {
    auth: {
      persistSession: true,
      storage: {
        getItem: (key) => localStorage.getItem(key),
        setItem: (key, value) => localStorage.setItem(key, value),
        removeItem: (key) => localStorage.removeItem(key),
      }
    }
  });

  // Extract token from URL
  const url = new URL(invitationUrl);
  const token = url.searchParams.get('token');

  // Simulate what Supabase does: verify the token and establish session
  const { data: sessionData, error: verifyError } = await browserClient.auth.verifyOtp({
    token_hash: token,
    type: 'invite',
  });

  if (verifyError) {
    console.error("❌ Token verification failed:", verifyError);
    return;
  }

  console.log("✅ Session established in browser client");
  console.log("User:", sessionData.user?.email);

  // Step 3: Simulate accessing the setup page
  console.log("3. Simulating access to setup page...");

  // In a real browser, the page would:
  // 1. Load the setup-account page
  // 2. The page would check for existing auth
  // 3. Since we have a session, it should show the form

  const { data: { user }, error: getUserError } = await browserClient.auth.getUser();

  if (getUserError) {
    console.error("❌ getUser failed:", getUserError);
    return;
  }

  console.log("✅ User authenticated on setup page:", user?.email);

  // Step 4: Simulate password update
  console.log("4. Simulating password setup...");

  const { error: updateError } = await browserClient.auth.updateUser({
    password: "newpassword123"
  });

  if (updateError) {
    console.error("❌ Password update failed:", updateError);
    return;
  }

  console.log("✅ Password updated successfully");

  // Step 5: Verify final state
  console.log("5. Verifying final authentication state...");

  const { data: finalUser, error: finalError } = await browserClient.auth.getUser();

  if (finalError) {
    console.error("❌ Final user check failed:", finalError);
    return;
  }

  console.log("✅ Final user state:", finalUser.user?.email);
  console.log("🎉 Complete invitation flow test PASSED!");
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

testCompleteInvitationFlow().catch(console.error);