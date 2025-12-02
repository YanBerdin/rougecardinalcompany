import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load .env.local first, then .env as fallback
dotenv.config({ path: '.env.local' })
dotenv.config()

async function testInvitationRedirect() {
  console.log("🧪 Testing invitation redirect flow...");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    console.error("❌ Missing Supabase environment variables");
    return;
  }

  // Generate invitation link
  const adminClient = createClient(supabaseUrl, process.env.SUPABASE_SECRET_KEY || '', {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/setup-account`;

  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: "invite",
    email: "redirect-test-" + Date.now() + "@example.com",
    options: {
      redirectTo: redirectUrl,
      data: { role: "user", display_name: "Redirect Test User" },
    },
  });

  if (linkError) {
    console.error("❌ Generate link failed:", linkError);
    return;
  }

  const invitationUrl = linkData.properties.action_link;
  console.log("Invitation URL:", invitationUrl);

  // Simulate browser clicking the link (with cookie jar)
  console.log("🔍 Simulating browser redirect...");

  try {
    // First, visit the Supabase verify URL
    const response = await fetch(invitationUrl, {
      redirect: 'manual', // Don't follow redirects automatically
      headers: {
        'User-Agent': 'Mozilla/5.0 (Test Browser)',
      }
    });

    console.log("Initial response status:", response.status);
    console.log("Location header:", response.headers.get('location'));
    console.log("Set-Cookie headers:", response.headers.get('set-cookie'));

    // If it's a redirect, follow it
    if (response.status >= 300 && response.status < 400) {
      const redirectLocation = response.headers.get('location');
      if (redirectLocation) {
        console.log("Following redirect to:", redirectLocation);

        // Extract cookies from the response
        const cookies = response.headers.get('set-cookie');
        console.log("Cookies from Supabase:", cookies);

        // Follow the redirect to our app
        const redirectResponse = await fetch(redirectLocation, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Test Browser)',
            'Cookie': cookies || '',
          }
        });

        console.log("Redirect response status:", redirectResponse.status);
        console.log("Final URL:", redirectResponse.url);
        console.log("Response cookies:", redirectResponse.headers.get('set-cookie'));
      }
    }

  } catch (error) {
    console.error("❌ Redirect simulation failed:", error);
  }
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

testInvitationRedirect().catch(console.error);