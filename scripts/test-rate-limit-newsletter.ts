/**
 * Test script for newsletter subscription rate limiting
 * Run with: pnpm exec tsx scripts/test-rate-limit-newsletter.ts
 * 
 * ⚠️ IMPORTANT: Start dev server first with: pnpm dev
 */

const TEST_EMAIL = `test-rate-limit-${Date.now()}@example.com`;
const NEWSLETTER_API_URL = "http://localhost:3000/api/newsletter";

async function testNewsletterRateLimit() {
    console.log("🧪 Test Rate Limiting - Newsletter\n");
    console.log(`Testing endpoint: ${NEWSLETTER_API_URL}\n`);

    const payload = {
        email: TEST_EMAIL,
        consent: true,
        source: "test",
    };

    // Test 1: 3 requêtes autorisées
    console.log("Test 1: 3 requêtes autorisées");
    for (let i = 1; i <= 3; i++) {
        try {
            const response = await fetch(NEWSLETTER_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            const success = result.success === true || result.data?.status === "subscribed";
            console.log(`Requête ${i}/3: ${success ? '✅ OK' : '❌ BLOQUÉ'} (${response.status})`);
            if (!success) {
                console.log(`  Error: ${result.error || JSON.stringify(result)}`);
            }
        } catch (error) {
            console.error(`❌ Requête ${i}/3 failed:`, error instanceof Error ? error.message : error);
        }
        await new Promise(resolve => setTimeout(resolve, 100)); // Petit délai entre requêtes
    }

    // Test 2: 4ème requête bloquée
    console.log("\nTest 2: 4ème requête (devrait être bloquée)");
    try {
        const response = await fetch(NEWSLETTER_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const result = await response.json();

        if (result.success === true || result.data?.status === "subscribed") {
            console.error("❌ La 4ème requête a passé (erreur!)");
            process.exit(1);
        }
        console.log(`✅ Requête bloquée: ${result.error}`);
    } catch (error) {
        console.error("❌ Test failed:", error instanceof Error ? error.message : error);
        process.exit(1);
    }

    console.log("\n✅ Tous les tests passés!");
    console.log("\n💡 Note: Pour réinitialiser le rate-limit, redémarrez le serveur dev");
}

testNewsletterRateLimit().catch((error) => {
    console.error("\n❌ Test suite failed:", error);
    process.exit(1);
});
