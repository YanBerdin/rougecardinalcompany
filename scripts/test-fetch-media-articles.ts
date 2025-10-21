import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

async function main() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    // Prefer service/secret key if available for full visibility (do not print it)
    const supabaseServiceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

    const supabaseKey = supabaseServiceKey ?? supabaseAnonKey;

    if (!supabaseUrl || !supabaseKey) {
      console.error(
        "Missing Supabase env vars. Please set NEXT_PUBLIC_SUPABASE_URL and a SUPABASE key in .env.local"
      );
      process.exit(1);
    }

    const usingServiceKey = Boolean(supabaseServiceKey);
    console.log("Using service/secret key for test client:", usingServiceKey);
    const testClient = createSupabaseClient(supabaseUrl, supabaseKey);

    const { data, error } = await testClient
      .from("articles_presse")
      .select(
        "id, title, author, type, excerpt, source_publication, source_url, published_at"
      )
      .not("published_at", "is", null)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(10);

    if (error) {
      console.error("Supabase query error:", error);
      process.exit(2);
    }

    console.log(
      `Found ${Array.isArray(data) ? data.length : 0} articles (raw)`
    );
    console.log(JSON.stringify((data || []).slice(0, 5), null, 2));

    // Also query the table without the published_at filter to inspect rows and published_at values
    const { data: rawData, error: rawError } = await testClient
      .from("articles_presse")
      .select("id, title, published_at")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(10);

    if (rawError) {
      console.error("Supabase raw query error:", rawError);
    } else {
      console.log(
        `Found ${Array.isArray(rawData) ? rawData.length : 0} total rows (no published filter)`
      );
      console.log(
        JSON.stringify(
          (rawData || []).map((r) => ({
            id: r.id,
            title: r.title,
            published_at: r.published_at,
          })),
          null,
          2
        )
      );
    }

    // Check other seeded tables to validate connection
    const { data: commData, error: commErr } = await testClient
      .from("communiques_presse")
      .select("id, title, date_publication")
      .limit(5);

    if (commErr) {
      console.error("communiques_presse query error:", commErr);
    } else {
      console.log(
        `communiques_presse rows: ${Array.isArray(commData) ? commData.length : 0}`
      );
      console.log(JSON.stringify(commData || [], null, 2));
    }

    const { data: eventsData, error: eventsErr } = await testClient
      .from("evenements")
      .select("id, spectacle_id, date_debut")
      .limit(5);

    if (eventsErr) {
      console.error("evenements query error:", eventsErr);
    } else {
      console.log(
        `evenements rows: ${Array.isArray(eventsData) ? eventsData.length : 0}`
      );
      console.log(JSON.stringify(eventsData || [], null, 2));
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    process.exit(3);
  }
}

main();
