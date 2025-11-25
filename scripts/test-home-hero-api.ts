import "dotenv/config";

const API_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:3000";
const ADMIN_TOKEN = process.env.ADMIN_TEST_TOKEN;

interface TestResult {
    name: string;
    passed: boolean;
    error?: string;
}

const results: TestResult[] = [];

async function testFetchAllSlides() {
    try {
        const response = await fetch(`${API_BASE}/api/admin/home/hero`, {
            headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

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
        const response = await fetch(`${API_BASE}/api/admin/home/hero`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${ADMIN_TOKEN}`,
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

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

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
