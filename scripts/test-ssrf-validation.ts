/**
 * SSRF Validation Test Script
 * 
 * Purpose: Document and test SSRF (Server-Side Request Forgery) protection
 * in the image URL validation system.
 * 
 * This script tests the validateImageUrl() Server Action against various
 * attack vectors to ensure proper protection.
 * 
 * Run with: pnpm exec tsx scripts/test-ssrf-validation.ts
 */

import { validateImageUrl } from "../lib/utils/validate-image-url";

interface TestCase {
    url: string;
    description: string;
    expectedBlocked: boolean;
}

const SSRF_TEST_CASES: TestCase[] = [
    // ============================================
    // INTERNAL NETWORK ATTACKS (should be BLOCKED)
    // ============================================
    {
        url: "http://127.0.0.1/admin",
        description: "Loopback IPv4",
        expectedBlocked: true,
    },
    {
        url: "http://localhost/internal-api",
        description: "Localhost hostname",
        expectedBlocked: true,
    },
    {
        url: "http://10.0.0.1/secrets",
        description: "Private network (10.x.x.x)",
        expectedBlocked: true,
    },
    {
        url: "http://172.16.0.1/internal",
        description: "Private network (172.16.x.x)",
        expectedBlocked: true,
    },
    {
        url: "http://192.168.1.1/router",
        description: "Private network (192.168.x.x)",
        expectedBlocked: true,
    },
    {
        url: "http://169.254.169.254/latest/meta-data/",
        description: "AWS metadata endpoint",
        expectedBlocked: true,
    },
    {
        url: "http://[::1]/admin",
        description: "IPv6 loopback",
        expectedBlocked: true,
    },

    // ============================================
    // PROTOCOL ATTACKS (should be BLOCKED)
    // ============================================
    {
        url: "file:///etc/passwd",
        description: "File protocol",
        expectedBlocked: true,
    },
    {
        url: "ftp://internal.server/data",
        description: "FTP protocol",
        expectedBlocked: true,
    },
    {
        url: "gopher://localhost:25/_",
        description: "Gopher protocol",
        expectedBlocked: true,
    },

    // ============================================
    // HOSTNAME BYPASS ATTEMPTS (should be BLOCKED)
    // ============================================
    {
        url: "http://evil.com#@trusted.supabase.co/image.jpg",
        description: "Fragment bypass attempt",
        expectedBlocked: true,
    },
    {
        url: "http://trusted.supabase.co@evil.com/image.jpg",
        description: "Username bypass attempt",
        expectedBlocked: true,
    },
    {
        url: "http://127.0.0.1.evil.com/image.jpg",
        description: "Lookalike domain",
        expectedBlocked: true,
    },

    // ============================================
    // DNS REBINDING ATTEMPTS (should be BLOCKED)
    // ============================================
    {
        url: "http://0.0.0.0/image.jpg",
        description: "0.0.0.0 address",
        expectedBlocked: true,
    },
    {
        url: "http://0177.0.0.1/image.jpg",
        description: "Octal IP notation",
        expectedBlocked: true,
    },
    {
        url: "http://2130706433/image.jpg",
        description: "Decimal IP (127.0.0.1)",
        expectedBlocked: true,
    },

    // ============================================
    // LEGITIMATE URLS (should be ALLOWED)
    // ============================================
    // Note: These tests verify hostname allowlist logic.
    // Actual fetch may fail if the resource doesn't exist, but hostname should be allowed.
    // The test passes if the error is NOT about hostname/protocol blocking.
];

/**
 * Test cases for hostname allowlist (no network required)
 * These verify that legitimate hostnames pass the allowlist check
 */
const ALLOWLIST_TEST_CASES: TestCase[] = [
    {
        url: "https://abc123xyz.supabase.co/storage/v1/object/public/images/photo.jpg",
        description: "Supabase Storage URL pattern (*.supabase.co)",
        expectedBlocked: false,
    },
    {
        url: "https://images.unsplash.com/photo-123456789",
        description: "Unsplash images domain",
        expectedBlocked: false,
    },
    {
        url: "https://unsplash.com/fr/photos/test-123",
        description: "Unsplash main domain",
        expectedBlocked: false,
    },
    {
        url: "https://images.pexels.com/photos/123/image.jpg",
        description: "Pexels images domain",
        expectedBlocked: false,
    },
    {
        url: "https://dummyimage.com/600x400/000/fff",
        description: "Dummy image generator",
        expectedBlocked: false,
    },
    {
        url: "https://raw.githubusercontent.com/user/repo/main/image.png",
        description: "GitHub raw content",
        expectedBlocked: false,
    },
    {
        url: "https://media.licdn.com/dms/image/test.jpg",
        description: "LinkedIn media",
        expectedBlocked: false,
    },
];

interface TestResult {
    testCase: TestCase;
    result: Awaited<ReturnType<typeof validateImageUrl>>;
    passed: boolean;
    error?: string;
}

async function runTest(testCase: TestCase): Promise<TestResult> {
    try {
        const result = await validateImageUrl(testCase.url);
        const blocked = !result.valid;
        const passed = blocked === testCase.expectedBlocked;

        return {
            testCase,
            result,
            passed,
            error: passed ? undefined : `Expected ${testCase.expectedBlocked ? "blocked" : "allowed"}, got ${blocked ? "blocked" : "allowed"}`,
        };
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        return {
            testCase,
            result: { valid: false, error: errorMessage },
            passed: testCase.expectedBlocked,
            error: testCase.expectedBlocked ? undefined : `Unexpected error: ${errorMessage}`,
        };
    }
}

/**
 * For allowlist tests, we check if the error is about network/resource (allowed hostname)
 * vs about security blocking (hostname not allowed)
 */
function isSecurityBlockError(error: string | undefined): boolean {
    if (!error) return false;
    const securityPatterns = [
        "Invalid protocol",
        "Hostname not allowed",
        "blocked",
        "private IP",
        "internal",
    ];
    return securityPatterns.some(pattern =>
        error.toLowerCase().includes(pattern.toLowerCase())
    );
}

async function runAllowlistTest(testCase: TestCase): Promise<TestResult> {
    try {
        const result = await validateImageUrl(testCase.url);

        if (result.valid) {
            return {
                testCase,
                result,
                passed: true,
            };
        }

        const isSecurityBlock = isSecurityBlockError(result.error);
        const passed = !isSecurityBlock;

        return {
            testCase,
            result,
            passed,
            error: passed
                ? undefined
                : `Hostname should be allowed but was blocked: ${result.error}`,
        };
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        const isSecurityBlock = isSecurityBlockError(errorMessage);

        return {
            testCase,
            result: { valid: false, error: errorMessage },
            passed: !isSecurityBlock,
            error: isSecurityBlock
                ? `Hostname should be allowed but was blocked: ${errorMessage}`
                : undefined,
        };
    }
}

async function runAllTests(): Promise<void> {
    console.log("🔒 SSRF Validation Test Suite\n");
    console.log("=".repeat(60));

    let passedCount = 0;
    let failedCount = 0;

    console.log("\n📛 SECURITY BLOCKING TESTS (should be BLOCKED)\n");

    for (const testCase of SSRF_TEST_CASES) {
        const result = await runTest(testCase);

        const statusIcon = result.passed ? "✅" : "❌";
        const expectedStatus = testCase.expectedBlocked ? "BLOCKED" : "ALLOWED";

        console.log(`${statusIcon} ${testCase.description}`);
        console.log(`   URL: ${testCase.url}`);
        console.log(`   Expected: ${expectedStatus}`);
        console.log(`   Result: ${result.result.valid ? "ALLOWED" : "BLOCKED"}`);

        if (result.result.error) {
            console.log(`   Error: ${result.result.error}`);
        }

        if (result.passed) {
            passedCount++;
        } else {
            failedCount++;
            console.log(`   ⚠️ FAILED: ${result.error}`);
        }
    }

    console.log("\n" + "-".repeat(60));
    console.log("\n✅ ALLOWLIST TESTS (hostname should be allowed)\n");

    for (const testCase of ALLOWLIST_TEST_CASES) {
        const result = await runAllowlistTest(testCase);

        const statusIcon = result.passed ? "✅" : "❌";

        console.log(`${statusIcon} ${testCase.description}`);
        console.log(`   URL: ${testCase.url}`);
        console.log(`   Result: ${result.result.valid ? "VALID" : "INVALID"}`);

        if (result.result.error) {
            console.log(`   Note: ${result.result.error}`);
        }

        if (result.passed) {
            passedCount++;
            if (!result.result.valid) {
                console.log(`   ℹ️ Hostname allowed, resource may not exist (expected)`);
            }
        } else {
            failedCount++;
            console.log(`   ⚠️ FAILED: ${result.error}`);
        }
    }

    console.log("\n" + "=".repeat(60));
    const totalTests = SSRF_TEST_CASES.length + ALLOWLIST_TEST_CASES.length;
    console.log(`\n📊 Results: ${passedCount}/${totalTests} tests passed`);

    if (failedCount > 0) {
        console.log(`\n🚨 ${failedCount} tests FAILED!`);
        console.log("   Security vulnerabilities may exist.\n");
        process.exit(1);
    } else {
        console.log("\n✨ All SSRF protection tests passed!\n");
        process.exit(0);
    }
}

runAllTests().catch((err) => {
    console.error("Test suite failed:", err);
    process.exit(1);
});
