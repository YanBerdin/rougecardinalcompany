/**
 * Test script for rate limiting functionality
 * Run with: pnpm exec tsx scripts/test-rate-limit.ts
 */

import { checkRateLimit, recordRequest, resetRateLimit } from "../lib/utils/rate-limit";

console.log("🧪 Test du système de rate limiting\n");

const userId = "test-user-123";
const maxRequests = 10;
const windowMs = 60 * 1000; // 1 minute

// Test 1: Vérifier que les 10 premiers uploads passent
console.log("Test 1: 10 uploads successifs");
console.log("─────────────────────────────");

for (let i = 1; i <= 10; i++) {
    const result = recordRequest(userId, maxRequests, windowMs);
    console.log(`Upload ${i}/10: ${result.success ? '✅ OK' : '❌ BLOQUÉ'} (remaining: ${result.remaining})`);
    
    if (!result.success) {
        console.error(`❌ Upload ${i} devrait passer mais a été bloqué!`);
        process.exit(1);
    }
}

console.log("✅ Test 1 passé: 10 uploads autorisés\n");

// Test 2: Vérifier que le 11ème upload est bloqué
console.log("Test 2: 11ème upload (devrait être bloqué)");
console.log("──────────────────────────────────────────");

const blockedResult = recordRequest(userId, maxRequests, windowMs);
console.log(`Upload 11/10: ${blockedResult.success ? '❌ PASSÉ (erreur!)' : '✅ BLOQUÉ'}`);

if (blockedResult.success) {
    console.error("❌ Upload 11 devrait être bloqué mais a passé!");
    process.exit(1);
}

console.log(`Reset prévu à: ${blockedResult.resetAt.toLocaleTimeString('fr-FR')}`);
console.log("✅ Test 2 passé: Upload 11 bloqué\n");

// Test 3: Vérifier checkRateLimit (sans enregistrer)
console.log("Test 3: Vérification sans enregistrement");
console.log("─────────────────────────────────────────");

const checkResult = checkRateLimit(userId, maxRequests, windowMs);
console.log(`Autorisé: ${checkResult.allowed ? '❌ OUI (erreur!)' : '✅ NON'}`);
console.log(`Remaining: ${checkResult.remaining}`);

if (checkResult.allowed) {
    console.error("❌ checkRateLimit devrait retourner false après 10 uploads!");
    process.exit(1);
}

console.log("✅ Test 3 passé: Check sans enregistrement correct\n");

// Test 4: Reset et réessayer
console.log("Test 4: Reset rate limit");
console.log("────────────────────────");

resetRateLimit(userId);
const afterResetResult = recordRequest(userId, maxRequests, windowMs);

console.log(`Après reset: ${afterResetResult.success ? '✅ OK' : '❌ BLOQUÉ'}`);
console.log(`Remaining: ${afterResetResult.remaining}`);

if (!afterResetResult.success) {
    console.error("❌ Après reset, l'upload devrait passer!");
    process.exit(1);
}

console.log("✅ Test 4 passé: Reset fonctionnel\n");

// Test 5: Multiple utilisateurs indépendants
console.log("Test 5: Isolation par utilisateur");
console.log("──────────────────────────────");

const user2 = "test-user-456";
const user2Result = recordRequest(user2, maxRequests, windowMs);

console.log(`User 2 upload: ${user2Result.success ? '✅ OK' : '❌ BLOQUÉ'}`);
console.log(`User 2 remaining: ${user2Result.remaining}`);

if (!user2Result.success) {
    console.error("❌ User 2 devrait pouvoir uploader (isolation)!");
    process.exit(1);
}

console.log("✅ Test 5 passé: Isolation utilisateurs OK\n");

// Résumé
console.log("═══════════════════════════════════════");
console.log("✅ Tous les tests passés!");
console.log("═══════════════════════════════════════");
console.log("\nConfiguration:");
console.log(`  - Limite: ${maxRequests} uploads par ${windowMs / 1000}s`);
console.log(`  - Window: ${windowMs / 1000}s (${windowMs / 60000} minute)`);
console.log("\nFonctionnalités validées:");
console.log("  ✅ Rate limiting fonctionnel");
console.log("  ✅ Blocage après limite atteinte");
console.log("  ✅ Check sans enregistrement");
console.log("  ✅ Reset manuel");
console.log("  ✅ Isolation par utilisateur");
console.log("\n💡 Le rate limiting est prêt pour la production!");
console.log("   (Remplacer Map en mémoire par Redis en production)\n");
