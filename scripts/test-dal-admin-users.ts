#!/usr/bin/env tsx
/**
 * Test des fonctions DAL admin-users.ts
 * 
 * ⚠️  Ce script nécessite SUPABASE_SECRET_KEY (service role) pour bypasser RLS
 * 
 * Usage:
 *   pnpm exec tsx scripts/test-dal-admin-users.ts
 * 
 * Tests effectués:
 *   1. listAllUsers() - Lecture de tous les utilisateurs
 *   2. inviteUserWithoutEmail() - Création d'un utilisateur (sans email)
 *   3. updateUserRole() - Mise à jour du rôle
 *   4. deleteUser() - Suppression de l'utilisateur créé
 */

import * as dotenv from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("❌ Variables d'environnement manquantes:");
    console.error("   - NEXT_PUBLIC_SUPABASE_URL");
    console.error("   - SUPABASE_SECRET_KEY");
    process.exit(1);
}

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
});

interface TestResult {
    name: string;
    success: boolean;
    duration: number;
    error?: string;
    data?: unknown;
}

const results: TestResult[] = [];

async function runTest<T>(
    name: string,
    testFn: () => Promise<T>
): Promise<T | null> {
    const start = Date.now();
    try {
        const result = await testFn();
        const duration = Date.now() - start;
        results.push({ name, success: true, duration, data: result });
        console.log(`✅ ${name} (${duration}ms)`);
        return result;
    } catch (error) {
        const duration = Date.now() - start;
        const errorMsg = error instanceof Error ? error.message : String(error);
        results.push({ name, success: false, duration, error: errorMsg });
        console.log(`❌ ${name} (${duration}ms)`);
        console.log(`   Erreur: ${errorMsg}`);
        return null;
    }
}

async function testListAllUsers(): Promise<number> {
    const { data, error } = await adminClient.auth.admin.listUsers();

    if (error) throw new Error(error.message);

    console.log(`   → ${data.users.length} utilisateur(s) trouvé(s)`);
    return data.users.length;
}

async function testInviteUserWithoutEmail(): Promise<string> {
    const testEmail = `dal-test-${Date.now()}@example.com`;
    const testRole = "user";
    const testDisplayName = "DAL Test User";

    // 1. Générer le lien d'invitation (crée l'utilisateur dans auth.users)
    const { data: linkData, error: linkError } =
        await adminClient.auth.admin.generateLink({
            type: "invite",
            email: testEmail,
            options: {
                data: { role: testRole, display_name: testDisplayName },
            },
        });

    if (linkError) throw new Error(`generateLink failed: ${linkError.message}`);

    // 2. Attendre que l'utilisateur soit créé
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 3. Récupérer l'utilisateur créé
    const { data: userData, error: userError } =
        await adminClient.auth.admin.getUserById(linkData.user.id);

    if (userError) throw new Error(`getUserById failed: ${userError.message}`);

    // 4. Créer ou mettre à jour le profil (upsert avec onConflict)
    const { error: profileError } = await adminClient
        .from("profiles")
        .upsert(
            {
                user_id: userData.user.id,
                role: testRole,
                display_name: testDisplayName,
            },
            {
                onConflict: "user_id",
                ignoreDuplicates: false,
            }
        );

    if (profileError)
        throw new Error(`Profile creation failed: ${profileError.message}`);

    console.log(`   → Utilisateur créé: ${testEmail}`);
    console.log(`   → User ID: ${userData.user.id}`);

    return userData.user.id;
}

async function testUpdateUserRole(userId: string): Promise<void> {
    const newRole = "editor";

    // 1. Mettre à jour les métadonnées auth
    const { error: authError } = await adminClient.auth.admin.updateUserById(
        userId,
        {
            app_metadata: { role: newRole },
            user_metadata: { role: newRole },
        }
    );

    if (authError) throw new Error(`updateUserById failed: ${authError.message}`);

    // 2. Mettre à jour le profil
    const { error: profileError } = await adminClient
        .from("profiles")
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq("user_id", userId);

    if (profileError)
        throw new Error(`Profile update failed: ${profileError.message}`);

    console.log(`   → Rôle mis à jour: user → ${newRole}`);
}

async function testDeleteUser(userId: string): Promise<void> {
    const { error } = await adminClient.auth.admin.deleteUser(userId);

    if (error) throw new Error(`deleteUser failed: ${error.message}`);

    console.log(`   → Utilisateur supprimé: ${userId}`);
}

async function testFindUserByEmail(): Promise<void> {
    // Chercher un utilisateur existant
    const { data, error } = await adminClient.auth.admin.listUsers({
        perPage: 1,
    });

    if (error) throw new Error(`listUsers failed: ${error.message}`);

    if (data.users.length > 0) {
        const user = data.users[0];
        console.log(`   → Utilisateur trouvé: ${user.email}`);
    } else {
        console.log(`   → Aucun utilisateur existant`);
    }
}

async function main() {
    console.log("═══════════════════════════════════════════════════════════");
    console.log("🧪 Test des fonctions DAL admin-users.ts");
    console.log("═══════════════════════════════════════════════════════════\n");

    // Test 1: Lister les utilisateurs
    await runTest("listAllUsers", testListAllUsers);

    // Test 2: Trouver un utilisateur par email
    await runTest("findUserByEmail", testFindUserByEmail);

    // Test 3: Créer un utilisateur (sans email)
    const userId = await runTest("inviteUserWithoutEmail", testInviteUserWithoutEmail);

    if (userId) {
        // Test 4: Mettre à jour le rôle
        await runTest("updateUserRole", () => testUpdateUserRole(userId));

        // Test 5: Supprimer l'utilisateur
        await runTest("deleteUser", () => testDeleteUser(userId));
    }

    // Résumé
    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("📊 Résumé des tests");
    console.log("═══════════════════════════════════════════════════════════");

    const passed = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

    console.log(`Total: ${results.length} test(s)`);
    console.log(`✅ Réussis: ${passed}`);
    console.log(`❌ Échoués: ${failed}`);
    console.log(`⏱️  Durée totale: ${totalDuration}ms`);

    if (failed > 0) {
        console.log("\nTests en échec:");
        results
            .filter((r) => !r.success)
            .forEach((r) => console.log(`   - ${r.name}: ${r.error}`));
        process.exit(1);
    }

    console.log("\n🎉 Tous les tests DAL admin-users passent !");
}

main().catch((error) => {
    console.error("💥 Erreur fatale:", error);
    process.exit(1);
});
