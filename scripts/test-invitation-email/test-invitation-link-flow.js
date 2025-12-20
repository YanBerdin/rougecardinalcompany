import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load .env.local first, then .env as fallback
dotenv.config({ path: '.env.local' })
dotenv.config()

async function testInvitationLinkFlow() {
  console.log("🧪 Testing complete invitation link flow...");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    console.error("❌ Missing Supabase environment variables");
    return;
  }

  // Create regular client (not admin)
  const client = createClient(supabaseUrl, anonKey);

  // Generate invitation link (using admin client)
  const adminClient = createClient(supabaseUrl, process.env.SUPABASE_SECRET_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/setup-account`;

  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: "invite",
    email: "test-invite-" + Date.now() + "@example.com",
    options: {
      redirectTo: redirectUrl,
      data: { role: "user", display_name: "Test User" },
    },
  });

  if (linkError) {
    console.error("❌ Generate link failed:", linkError);
    return;
  }

  console.log("✅ Invitation link generated");
  const invitationUrl = linkData.properties.action_link;
  console.log("URL:", invitationUrl);

  // Extract token and type from URL
  const url = new URL(invitationUrl);
  const token = url.searchParams.get('token');
  const type = url.searchParams.get('type');

  console.log("Token:", token?.substring(0, 20) + "...");
  console.log("Type:", type);

  // Simulate what happens when user clicks the link
  // This should establish a session
  console.log("🔍 Simulating user clicking invitation link...");

  const { data, error } = await client.auth.verifyOtp({
    token_hash: token,
    type: 'invite',
  });

  if (error) {
    console.error("❌ Session establishment failed:", error);
    return;
  }

  console.log("✅ Session established successfully");
  console.log("User:", data.user?.email);
  console.log("Session:", data.session ? "Present" : "Missing");

  // Check if we can get the user
  const { data: { user }, error: userError } = await client.auth.getUser();

  if (userError) {
    console.error("❌ getUser failed:", userError);
  } else {
    console.log("✅ getUser successful:", user?.email);
  }
}

testInvitationLinkFlow().catch(console.error);