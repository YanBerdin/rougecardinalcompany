import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load .env.local first, then .env as fallback
dotenv.config({ path: '.env.local' })
dotenv.config()

async function testInvitationFlow() {
  console.log("🧪 Testing invitation flow...");

  // Create admin client directly
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("❌ Missing Supabase environment variables");
    return;
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Test generateLink
  const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/setup-account`;
  console.log("Redirect URL:", redirectUrl);

  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: "invite",
    email: "test-invite-" + Date.now() + "@example.com",
    options: {
      redirectTo: redirectUrl,
      data: {
        role: "user",
        display_name: "Test User",
      },
    },
  });

  if (linkError) {
    console.error("❌ Generate link failed:", linkError);
    return;
  }

  console.log("✅ Link generated successfully");
  console.log("Invitation URL:", linkData.properties.action_link);

  // Extract token from URL for testing
  const url = new URL(linkData.properties.action_link);
  const token = url.searchParams.get('token');
  const type = url.searchParams.get('type');

  console.log("Token:", token ? token.substring(0, 20) + "..." : "none");
  console.log("Type:", type);

  // Test if we can verify the token
  if (token && type === 'invite') {
    console.log("🔍 Testing token verification...");

    const { data, error } = await adminClient.auth.verifyOtp({
      token_hash: token,
      type: 'invite',
    });

    if (error) {
      console.error("❌ Token verification failed:", error);
    } else {
      console.log("✅ Token verification successful");
      console.log("User:", data.user?.email);
    }
  }
}

testInvitationFlow().catch(console.error);