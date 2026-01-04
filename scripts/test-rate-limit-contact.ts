/**
 * Test script for contact form rate limiting
 * Run with: pnpm exec tsx scripts/test-rate-limit-contact.ts
 * 
 * ⚠️ IMPORTANT: Start dev server first with: pnpm dev
 */

const API_URL = "http://localhost:3000/api/contact";

async function testContactRateLimit() {
    console.log("🧪 Test Rate Limiting - Contact Form\n");
    console.log(`Testing endpoint: ${API_URL}\n`);

    const basePayload = {
        name: "Test User",
        email: "test-rate-limit-contact@example.com",
        phone: "+33612345678",
        reason: "booking",
        subject: "Test Rate Limiting",
        message: "Test message for rate limiting validation",
        consent: true,
    };

    // Test 1: 5 requêtes successives (doivent passer)
    console.log("Test 1: 5 requêtes autorisées");
    for (let i = 1; i <= 5; i++) {
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "X-Forwarded-For": "192.168.1.100", // Simule IP consistente
                },
                body: JSON.stringify(basePayload),
            });
            const result = await response.json();
            const success = result.success === true || result.data?.status === "sent";
            console.log(`Requête ${i}/5: ${success ? '✅ OK' : '❌ BLOQUÉ'} (${response.status})`);
            
            if (!success && i <= 5) {
                console.error(`❌ Échec inattendu: ${result.error}`);
                process.exit(1);
            }
        } catch (error) {
            console.error(`❌ Requête ${i}/5 failed:`, error instanceof Error ? error.message : error);
            process.exit(1);
        }
        await new Promise(resolve => setTimeout(resolve, 100)); // Petit délai entre requêtes
    }

    // Test 2: 6ème requête (doit être bloquée)
    console.log("\nTest 2: 6ème requête (devrait être bloquée)");
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "X-Forwarded-For": "192.168.1.100",
            },
            body: JSON.stringify(basePayload),
        });
        const result = await response.json();
        
        if (result.success === true || result.data?.status === "sent") {
            console.error("❌ La 6ème requête a passé (erreur!)");
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

testContactRateLimit().catch((error) => {
    console.error("\n❌ Test suite failed:", error);
    process.exit(1);
});
