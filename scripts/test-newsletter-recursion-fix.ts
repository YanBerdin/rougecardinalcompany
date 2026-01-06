/**
 * Test hotfix: newsletter infinite recursion fix
 * Tests that the policy no longer causes recursion
 */
import 'dotenv/config';
import { createClient } from "../supabase/server";

async function testNewsletterPolicy() {
  console.log("🧪 Testing newsletter policy hotfix...\n");

  const supabase = await createClient();

  // Test 1: Valid email should work
  console.log("Test 1: Valid email insertion");
  const testEmail = `test-${Date.now()}@example.com`;
  
  const { data, error } = await supabase
    .from("abonnes_newsletter")
    .insert({ email: testEmail })
    .select()
    .single();

  if (error) {
    console.error("❌ Test 1 FAILED:", error.message);
    console.error("Error code:", error.code);
    console.error("Details:", error.details);
    return;
  }

  console.log("✅ Test 1 PASSED: Email inserted successfully");
  console.log("Inserted:", data);

  // Test 2: Duplicate should be blocked
  console.log("\nTest 2: Duplicate email (should be blocked)");
  
  const { data: duplicateData, error: duplicateError } = await supabase
    .from("abonnes_newsletter")
    .insert({ email: testEmail })
    .select()
    .single();

  if (!duplicateError) {
    console.error("❌ Test 2 FAILED: Duplicate was NOT blocked!");
    return;
  }

  console.log("✅ Test 2 PASSED: Duplicate correctly blocked");
  console.log("Error code:", duplicateError.code);
  console.log("Error message:", duplicateError.message);

  // Cleanup
  console.log("\nCleaning up test data...");
  await supabase.from("abonnes_newsletter").delete().eq("email", testEmail);

  console.log("\n✅ All tests PASSED - No infinite recursion detected!");
}

testNewsletterPolicy().catch(console.error);
