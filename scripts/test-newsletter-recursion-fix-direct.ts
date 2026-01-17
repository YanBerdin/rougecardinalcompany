/**
 * Test hotfix: newsletter infinite recursion fix
 * Direct Supabase test without env validation
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

async function testNewsletterPolicy() {
  console.log("🧪 Testing newsletter policy hotfix...\n");

  // Direct Supabase client for testing
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY! // Service role to bypass RLS for cleanup
  );

  // Test 1: Valid email should work
  console.log("Test 1: Valid email insertion (as anon)");
  const testEmail = `test-${Date.now()}@example.com`;
  
  // Create anon client for real test
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
  );
  
  const { data, error } = await anonClient
    .from("abonnes_newsletter")
    .insert({ email: testEmail })
    .select()
    .single();

  if (error) {
    console.error("❌ Test 1 FAILED:", error.message);
    console.error("Error code:", error.code);
    console.error("Details:", error.details);
    
    // Cleanup even on error
    await supabase.from("abonnes_newsletter").delete().eq("email", testEmail);
    process.exit(1);
  }

  console.log("✅ Test 1 PASSED: Email inserted successfully");
  console.log("Inserted ID:", data.id);

  // Test 2: Duplicate should be blocked
  console.log("\nTest 2: Duplicate email (should be blocked)");
  
  const { data: duplicateData, error: duplicateError } = await anonClient
    .from("abonnes_newsletter")
    .insert({ email: testEmail })
    .select()
    .single();

  if (!duplicateError) {
    console.error("❌ Test 2 FAILED: Duplicate was NOT blocked!");
    await supabase.from("abonnes_newsletter").delete().eq("email", testEmail);
    process.exit(1);
  }

  console.log("✅ Test 2 PASSED: Duplicate correctly blocked");
  console.log("Error code:", duplicateError.code);

  // Cleanup
  console.log("\nCleaning up test data...");
  await supabase.from("abonnes_newsletter").delete().eq("email", testEmail);

  console.log("\n✅ All tests PASSED - No infinite recursion detected!");
}

testNewsletterPolicy().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
