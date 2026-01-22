#!/usr/bin/env tsx
/**
 * Check RLS policies on critical tables
 */

import { createClient } from "@supabase/supabase-js";
import { getLocalCredentials, validateLocalOnly } from "./utils/supabase-local-credentials";

async function main() {
    const { url, serviceKey } = getLocalCredentials({ silent: true });
    validateLocalOnly(url);
    
    const supabase = createClient(url, serviceKey);

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
