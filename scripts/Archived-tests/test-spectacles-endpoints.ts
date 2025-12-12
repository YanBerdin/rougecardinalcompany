#!/usr/bin/env tsx
/**
 * Test script for Spectacles API endpoints
 * 
 * Prerequisites:
 * 1. Start dev server: pnpm dev
 * 2. Log in as admin user
 * 3. Copy auth cookies to this script
 * 
 * Usage:
 * pnpm exec tsx scripts/test-spectacles-endpoints.ts
 * 
 * Tests:
 * - GET  /api/admin/spectacles (list all)
 * - POST /api/admin/spectacles (create)
 * - GET  /api/admin/spectacles/[id] (get by id)
 * - PATCH /api/admin/spectacles/[id] (update)
 * - DELETE /api/admin/spectacles/[id] (delete)
 */

const SPECTACLES_API_BASE_URL = "http://localhost:3000";

// Helper: Make authenticated API request
async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const url = `${SPECTACLES_API_BASE_URL}${endpoint}`;
  
  console.log(`\n🌐 ${options.method || "GET"} ${endpoint}`);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const responseData = await response.json();
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log(`📦 Response:`, JSON.stringify(responseData, null, 2));
    
    return { response, data: responseData };
  } catch (error) {
    console.error(`❌ Request failed:`, error);
    throw error;
  }
}

// Test scenario
async function runTests() {
  console.log("🧪 Testing Spectacles API Endpoints\n");
  console.log("=" .repeat(60));

  let createdSpectacleId: number | null = null;

  try {
    // Test 1: GET all spectacles
    console.log("\n📋 Test 1: GET all spectacles");
    console.log("-".repeat(60));
    await apiRequest("/api/admin/spectacles");

    // Test 2: GET all spectacles with includePrivate
    console.log("\n📋 Test 2: GET all spectacles (includePrivate=true)");
    console.log("-".repeat(60));
    await apiRequest("/api/admin/spectacles?includePrivate=true");

    // Test 3: POST create spectacle
    console.log("\n✏️  Test 3: POST create new spectacle");
    console.log("-".repeat(60));
    const createPayload = {
      title: "Test Spectacle API",
      description: "Created by API test script",
      genre: "Comédie",
      duration_minutes: 90,
      public: false,
    };
    
    const createResult = await apiRequest("/api/admin/spectacles", {
      method: "POST",
      body: JSON.stringify(createPayload),
    });

    if (createResult.data.success && createResult.data.data?.id) {
      createdSpectacleId = Number(createResult.data.data.id);
      console.log(`✅ Created spectacle with ID: ${createdSpectacleId}`);
    }

    // Test 4: GET spectacle by ID
    if (createdSpectacleId) {
      console.log("\n🔍 Test 4: GET spectacle by ID");
      console.log("-".repeat(60));
      await apiRequest(`/api/admin/spectacles/${createdSpectacleId}`);
    }

    // Test 5: PATCH update spectacle
    if (createdSpectacleId) {
      console.log("\n✏️  Test 5: PATCH update spectacle");
      console.log("-".repeat(60));
      const updatePayload = {
        title: "Test Spectacle API (Updated)",
        description: "Updated by API test script",
        public: true,
      };
      
      await apiRequest(`/api/admin/spectacles/${createdSpectacleId}`, {
        method: "PATCH",
        body: JSON.stringify(updatePayload),
      });
    }

    // Test 6: GET updated spectacle
    if (createdSpectacleId) {
      console.log("\n🔍 Test 6: GET updated spectacle");
      console.log("-".repeat(60));
      await apiRequest(`/api/admin/spectacles/${createdSpectacleId}`);
    }

    // Test 7: DELETE spectacle
    if (createdSpectacleId) {
      console.log("\n🗑️  Test 7: DELETE spectacle");
      console.log("-".repeat(60));
      await apiRequest(`/api/admin/spectacles/${createdSpectacleId}`, {
        method: "DELETE",
      });
      
      console.log(`✅ Deleted spectacle with ID: ${createdSpectacleId}`);
    }

    // Test 8: Verify deletion (should return 404)
    if (createdSpectacleId) {
      console.log("\n🔍 Test 8: GET deleted spectacle (should fail)");
      console.log("-".repeat(60));
      await apiRequest(`/api/admin/spectacles/${createdSpectacleId}`);
    }

    // Error case tests
    console.log("\n🚨 Test 9: Invalid ID format");
    console.log("-".repeat(60));
    await apiRequest("/api/admin/spectacles/invalid-id");

    console.log("\n🚨 Test 10: Non-existent ID");
    console.log("-".repeat(60));
    await apiRequest("/api/admin/spectacles/999999");

    console.log("\n🚨 Test 11: Invalid create payload");
    console.log("-".repeat(60));
    await apiRequest("/api/admin/spectacles", {
      method: "POST",
      body: JSON.stringify({ title: "" }), // Empty title (invalid)
    });

    console.log("\n✅ All tests completed!");
    console.log("=" .repeat(60));

  } catch (error) {
    console.error("\n❌ Test suite failed:", error);
    process.exit(1);
  }
}

// Run tests
console.log("⚠️  WARNING: This script requires:\n");
console.log("1. Dev server running (pnpm dev)");
console.log("2. Admin authentication");
console.log("3. Valid auth cookies\n");
console.log("For full testing, manually log in as admin first.\n");
console.log("=" .repeat(60));

runTests();
