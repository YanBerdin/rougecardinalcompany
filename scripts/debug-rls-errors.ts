#!/usr/bin/env tsx
/**
 * Debug: Test exact Supabase error response for RLS violations
 */
import { createClient } from "@supabase/supabase-js";
import { getLocalCredentials, validateLocalOnly } from "./utils/supabase-local-credentials";

const { url, publishableKey } = getLocalCredentials({ silent: true });
validateLocalOnly(url);

const client = createClient(url, publishableKey);

async function main() {
    console.log("Testing RLS policy error responses...\n");

    // Test 1: Contact with consent=false
    console.log("Test 1: INSERT messages_contact with consent=false");
    const result1 = await client.from("messages_contact").insert({
        firstname: "Test",
        lastname: "User",
        email: "test@example.com",
        reason: "booking",
        message: "Test message with sufficient length for validation",
        consent: false,
    });

    console.log("Response:", JSON.stringify(result1, null, 2));
    console.log("Error code:", result1.error?.code);
    console.log("Error message:", result1.error?.message);
    console.log("Error details:", result1.error?.details);
    console.log("Error hint:", result1.error?.hint);
    console.log("");

    // Test 2: Analytics with invalid event_type
    console.log("Test 2: INSERT analytics_events with invalid event_type");
    const result2 = await client.from("analytics_events").insert({
        event_type: "INVALID_TYPE",
        entity_type: "spectacle",
        entity_id: 1,
    });

    console.log("Response:", JSON.stringify(result2, null, 2));
    console.log("Error code:", result2.error?.code);
    console.log("Error message:", result2.error?.message);
    console.log("");

    // Test 3: Valid contact (should succeed)
    console.log("Test 3: INSERT messages_contact with valid data (should succeed)");
    const result3 = await client.from("messages_contact").insert({
        firstname: "Test",
        lastname: "User",
        email: "valid-test-" + Date.now() + "@example.com",
        reason: "booking",
        message: "Test message with sufficient length for validation",
        consent: true,
    });

    console.log("Response:", JSON.stringify(result3, null, 2));
    console.log("Success:", !result3.error);
}

main().catch(console.error);
