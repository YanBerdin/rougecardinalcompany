// scripts/test-webhooks.ts
// Test and validate Resend webhook configuration

import { readFileSync } from "fs";
import { resolve } from "path";

// Load environment variables from .env.local
function loadEnv() {
  try {
    const envPath = resolve(".env.local");
    const envContent = readFileSync(envPath, "utf-8");
    const envVars: Record<string, string> = {};

    envContent.split("\n").forEach((line) => {
      const [key, ...valueParts] = line.split("=");
      if (key && valueParts.length > 0) {
        const value = valueParts.join("=").trim();
        if (value) {
          envVars[key.trim()] = value.replace(/^["']|["']$/g, ""); // Remove quotes
        }
      }
    });

    return envVars;
  } catch (error) {
    console.log("⚠️  Could not load .env.local file, error:", error);
    return {};
  }
}

async function testWebhookConfiguration() {
  console.log("🔗 Testing Resend Webhook Integration...\n");

  // Load environment variables
  const envVars = loadEnv();
  const resendApiKey = envVars.RESEND_API_KEY || process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.log("❌ Missing RESEND_API_KEY environment variable");
    console.log("   Make sure your .env.local file has: RESEND_API_KEY=...");
    return;
  }

  try {
    // Check webhook configuration via Resend API
    console.log("🔍 Checking webhook configuration...");

    const response = await fetch("https://api.resend.com/webhooks", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const webhooks = await response.json();
      console.log("✅ Webhook configuration retrieved");

      if (webhooks && webhooks.length > 0) {
        console.log(`📋 Found ${webhooks.length} webhook(s):`);
        type WebhookInfo = { url?: string; events?: string[] };
        webhooks.forEach((webhook: WebhookInfo, index: number) => {
          console.log(
            `   ${index + 1}. ${webhook.url ?? "<no url>"} (${(webhook.events || []).join(", ") || "no events"})`
          );
        });
      } else {
        console.log("⚠️  No webhooks configured");
        console.log("   Configure webhooks at: https://resend.com/webhooks");
      }
    } else {
      console.log("❌ Failed to retrieve webhook configuration");
      console.log("   Status:", response.status);
      console.log("   Error:", await response.text());
    }

    // Instructions for manual testing
    console.log("\n🧪 Manual webhook testing:");
    console.log("1. Go to https://resend.com/webhooks");
    console.log("2. Create a webhook pointing to your endpoint:");
    console.log("   https://yourdomain.com/api/webhooks/resend");
    console.log("3. Select events: email.delivered, email.bounced, etc.");
    console.log("4. Send a test email to trigger the webhook");
    console.log("5. Check your application logs for webhook reception");
  } catch (error) {
    console.error("❌ Webhook test failed:", error);
    console.log("\n💡 Make sure your RESEND_API_KEY is valid");
  }
}

// Run the test
testWebhookConfiguration();
