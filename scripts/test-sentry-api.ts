/**
 * Test Sentry API Integration
 * Run: pnpm exec tsx scripts/test-sentry-api.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

const SENTRY_API_BASE = "https://sentry.io/api/0";

async function testSentryAPI() {
  const sentryOrg = process.env.SENTRY_ORG;
  const sentryProject = process.env.SENTRY_PROJECT;
  const sentryToken = process.env.SENTRY_AUTH_TOKEN;

  console.log("\n🔍 Sentry API Configuration Check\n");
  console.log("SENTRY_ORG:", sentryOrg ? `✅ ${sentryOrg}` : "❌ Missing");
  console.log("SENTRY_PROJECT:", sentryProject ? `✅ ${sentryProject}` : "❌ Missing");
  console.log("SENTRY_AUTH_TOKEN:", sentryToken ? `✅ ${sentryToken.slice(0, 20)}...` : "❌ Missing");

  if (!sentryOrg || !sentryProject || !sentryToken) {
    console.error("\n❌ Configuration incomplète. Vérifiez .env.local");
    process.exit(1);
  }

  console.log("\n📡 Testing Sentry API Connection...\n");

  try {
    // Test 1: Get project info
    const projectUrl = `${SENTRY_API_BASE}/projects/${sentryOrg}/${sentryProject}/`;
    console.log("→ GET", projectUrl);
    
    const projectRes = await fetch(projectUrl, {
      headers: {
        Authorization: `Bearer ${sentryToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!projectRes.ok) {
      const errorText = await projectRes.text();
      console.error(`❌ Project API error (${projectRes.status}):`, errorText);
      process.exit(1);
    }

    const project = await projectRes.json();
    console.log("✅ Project found:", project.name);
    console.log("   Platform:", project.platform);
    console.log("   Status:", project.status);

    // Test 2: Get issues
    const issuesUrl = `${SENTRY_API_BASE}/projects/${sentryOrg}/${sentryProject}/issues/?query=is:unresolved&statsPeriod=14d`;
    console.log("\n→ GET issues (unresolved, last 14 days)");
    
    const issuesRes = await fetch(issuesUrl, {
      headers: {
        Authorization: `Bearer ${sentryToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!issuesRes.ok) {
      const errorText = await issuesRes.text();
      console.error(`❌ Issues API error (${issuesRes.status}):`, errorText);
      process.exit(1);
    }

    const issues = await issuesRes.json();
    console.log(`✅ Found ${issues.length} unresolved issues\n`);

    // Count by level
    const levelCounts: Record<string, number> = {};
    for (const issue of issues) {
      const level = issue.level || "unknown";
      levelCounts[level] = (levelCounts[level] || 0) + 1;
    }

    console.log("📊 Issues by level:");
    for (const [level, count] of Object.entries(levelCounts)) {
      const icon = level === "error" ? "🔴" : level === "warning" ? "🟡" : "🔵";
      console.log(`   ${icon} ${level}: ${count}`);
    }

    // Show first 5 issues
    if (issues.length > 0) {
      console.log("\n📋 Recent issues (top 5):");
      for (const issue of issues.slice(0, 5)) {
        console.log(`   [${issue.level}] ${issue.title.slice(0, 60)}...`);
        console.log(`         Last seen: ${issue.lastSeen}`);
      }
    }

    console.log("\n✅ Sentry API integration working correctly!\n");

  } catch (error) {
    console.error("\n❌ Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

testSentryAPI();
