#!/usr/bin/env tsx
/**
 * Check RLS policies on critical tables
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "http://127.0.0.1:54321";
const SERVICE_ROLE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

async function main() {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    console.log("Checking RLS policies on critical tables...\n");

    const { data, error } = await supabase.rpc("exec_sql", {
        query: `
      SELECT 
        tablename,
        policyname,
        cmd,
        qual,
        with_check
      FROM pg_policies 
      WHERE tablename IN ('messages_contact', 'analytics_events', 'abonnes_newsletter', 'logs_audit')
      ORDER BY tablename, policyname;
    `,
    });

    if (error) {
        console.error("❌ Error:", error);
        // Try direct query instead
        const { data: policies, error: directError } = await supabase
            .from("pg_policies")
            .select("tablename, policyname, cmd, qual, with_check")
            .in("tablename", [
                "messages_contact",
                "analytics_events",
                "abonnes_newsletter",
                "logs_audit",
            ])
            .order("tablename")
            .order("policyname");

        if (directError) {
            console.error("❌ Direct query error:", directError);
            process.exit(1);
        }

        console.log("Policies found:");
        console.table(policies);
    } else {
        console.log("Policies found:");
        console.table(data);
    }
}

main();
