import dotenv from 'dotenv'// Load .env.local first, then .env as fallback
dotenv.config({ path: '.env.local' })
dotenv.config()

// Prefer the site/dev server URL for calling local Next.js admin API routes.
// Fallback to NEXT_PUBLIC_SUPABASE_URL only if site URL is not set (legacy).
const API_BASE = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:3000";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

// Helper to build headers supporting two admin token formats:
// - cookie string: e.g. "sb-...-auth-token=base64:..." -> sent as `Cookie` header
// - bearer token: simple JWT -> sent as `Authorization: Bearer <token>`
function buildAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    if (!ADMIN_TOKEN) return headers;

    // If token contains an equal sign, treat it as a cookie key=value string
    if (ADMIN_TOKEN.includes("=")) {
        // Some CI/envs may pass multiple cookies separated by ';', preserve as-is
        headers["Cookie"] = ADMIN_TOKEN;
    } else {
        // Otherwise treat as bearer token
        headers["Authorization"] = `Bearer ${ADMIN_TOKEN}`;
    }

    return headers;
}

// Guard: if API_BASE looks like a postgres connection string, warn and exit early
if (API_BASE.startsWith("postgres://") || API_BASE.startsWith("postgresql://")) {
    console.error("\n[ERROR] NEXT_PUBLIC_SUPABASE_URL appears to be a Postgres connection string.\nPlease set NEXT_PUBLIC_SUPABASE_URL to your frontend/API base (e.g. http://localhost:3000) and not the DB URL.\n");
    process.exit(2);
}

interface TestResult {
    name: string;
    passed: boolean;
    error?: string;
}

const results: TestResult[] = [];

async function testFetchAllSlides() {
    try {
        const headers = buildAuthHeaders();

        // Diagnostic info (do not log secret values). We show which header type will be used.
        console.log("[DEBUG] API_BASE:", API_BASE);
        console.log("[DEBUG] Sending as Cookie:", !!headers["Cookie"], " Authorization:", !!headers["Authorization"]);

        if (Object.keys(headers).length === 0) {
            throw new Error('Missing ADMIN_TOKEN environment variable');
        }

        const response = await fetch(`${API_BASE}/api/admin/home/hero`, {
            headers,
        });

        if (!response.ok) {
            const text = await response.text().catch(() => "");
            throw new Error(`HTTP ${response.status} - ${text}`);
        }

        const data = await response.json();
        results.push({
            name: "Fetch all hero slides",
            passed: Array.isArray(data.slides),
        });
    } catch (error) {
        results.push({
            name: "Fetch all hero slides",
            passed: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
}

async function testCreateSlide() {
    try {
        const headers = buildAuthHeaders();

        console.log("[DEBUG] API_BASE:", API_BASE);
        console.log("[DEBUG] Sending as Cookie:", !!headers["Cookie"], " Authorization:", !!headers["Authorization"]);

        if (Object.keys(headers).length === 0) {
            throw new Error('Missing ADMIN_TOKEN environment variable');
        }

        const response = await fetch(`${API_BASE}/api/admin/home/hero`, {
            method: "POST",
            headers: {
                ...headers,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title: "Test Slide",
                subtitle: "Test subtitle",
                image_url: "https://example.com/image.jpg",
                alt_text: "Test image",
                active: false,
            }),
        });

        if (!response.ok) {
            const text = await response.text().catch(() => "");
            throw new Error(`HTTP ${response.status} - ${text}`);
        }

        const data = await response.json();
        results.push({
            name: "Create hero slide",
            passed: !!data.slide?.id,
        });

        return data.slide?.id;
    } catch (error) {
        results.push({
            name: "Create hero slide",
            passed: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
}

async function testDeleteSlide(id: string) {
    try {
        const response = await fetch(`${API_BASE}/api/admin/home/hero/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        results.push({
            name: "Delete hero slide",
            passed: true,
        });
    } catch (error) {
        results.push({
            name: "Delete hero slide",
            passed: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
}

async function runTests() {
    console.log("🧪 Running Hero Slides API Tests...\n");

    await testFetchAllSlides();
    const createdId = await testCreateSlide();

    if (createdId) {
        await testDeleteSlide(createdId);
    }

    console.log("\n📊 Test Results:");
    console.log("═".repeat(50));

    results.forEach((result) => {
        const icon = result.passed ? "✅" : "❌";
        console.log(`${icon} ${result.name}`);
        if (result.error) {
            console.log(`   Error: ${result.error}`);
        }
    });

    const passed = results.filter((r) => r.passed).length;
    const total = results.length;

    console.log("═".repeat(50));
    console.log(`\n${passed}/${total} tests passed`);

    process.exit(passed === total ? 0 : 1);
}

runTests();
