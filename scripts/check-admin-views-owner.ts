/**
 * Check Admin Views Owner Script
 * 
 * Validates that all admin views are owned by the dedicated admin_views_owner role.
 * This ensures proper isolation from Supabase DEFAULT PRIVILEGES.
 * 
 * Expected Ownership:
 * - All *_admin views → admin_views_owner
 * - All *_dashboard views → admin_views_owner
 * 
 * Usage: pnpm exec tsx scripts/check-admin-views-owner.ts
 */
//!Error: This module cannot be imported from a Client Component module. It should only be used from a Server Component.
import 'dotenv/config';

import { createClient } from "@supabase/supabase-js";
import { env } from "../lib/env";

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SECRET_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

interface ViewOwnership {
  schemaname: string;
  viewname: string;
  viewowner: string;
}

async function checkAdminViewsOwner() {
  console.log("🔍 Checking admin views ownership...\n");

  // Query to fetch all views in public schema
  const { data: views, error } = await supabase.rpc("get_view_owners");

  if (error) {
    // Fallback: query pg_views directly
    const { data: fallbackViews, error: fallbackError } = await supabase
      .from("pg_views")
      .select("schemaname, viewname, viewowner")
      .eq("schemaname", "public")
      .or("viewname.like.*_admin,viewname.like.*_dashboard");

    if (fallbackError) {
      console.error("❌ Failed to fetch views:", fallbackError.message);
      process.exit(1);
    }

    return fallbackViews as ViewOwnership[];
  }

  return views as ViewOwnership[];
}

async function validateOwnership() {
  const views = await checkAdminViewsOwner();

  const expectedViews = [
    "communiques_presse_dashboard",
    "membres_equipe_admin",
    "compagnie_presentation_sections_admin",
    "partners_admin",
    "content_versions_detailed",
    "messages_contact_admin",
    "analytics_summary",
  ];

  let allValid = true;
  const results: Array<{ view: string; status: string; owner: string }> = [];

  for (const expectedView of expectedViews) {
    const found = views?.find((v) => v.viewname === expectedView);

    if (!found) {
      results.push({
        view: expectedView,
        status: "❌ NOT FOUND",
        owner: "N/A",
      });
      allValid = false;
    } else if (found.viewowner !== "admin_views_owner") {
      results.push({
        view: expectedView,
        status: "❌ WRONG OWNER",
        owner: found.viewowner,
      });
      allValid = false;
    } else {
      results.push({
        view: expectedView,
        status: "✅ VALID",
        owner: found.viewowner,
      });
    }
  }

  // Display results
  console.log("┌─────────────────────────────────────────────────────────┐");
  console.log("│              Admin Views Ownership Report               │");
  console.log("├─────────────────────────────────────────────────────────┤");

  for (const result of results) {
    const viewPadded = result.view.padEnd(40);
    const ownerInfo = result.owner.padEnd(20);
    console.log(`│ ${viewPadded} ${result.status} (${ownerInfo}) │`);
  }

  console.log("└─────────────────────────────────────────────────────────┘\n");

  if (allValid) {
    console.log("✅ All admin views have correct ownership (admin_views_owner)");
    console.log("✅ Security hardening validated successfully\n");
    process.exit(0);
  } else {
    console.error("❌ Some admin views have incorrect ownership");
    console.error("❌ Run migration: 20260105120000_admin_views_security_hardening.sql\n");
    process.exit(1);
  }
}

// Execute validation
validateOwnership().catch((error) => {
  console.error("❌ Validation failed:", error.message);
  process.exit(1);
});
