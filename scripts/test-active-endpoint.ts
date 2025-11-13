/**
 * TypeScript test script for /api/admin/team/[id]/active endpoint
 *
 * Usage:
 *   pnpm exec tsx scripts/test-active-endpoint.ts
 *   pnpm exec tsx scripts/test-active-endpoint.ts --cookie "sb-xxx-auth-token=your-token"
 */

const BASE_URL = "http://localhost:3000";
const ENDPOINT = "/api/admin/team";

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

interface TestCase {
  name: string;
  teamId: string;
  body: unknown;
  expectedStatus: number;
  expectedSuccess?: boolean;
}

interface TestResult {
  name: string;
  passed: boolean;
  status: number;
  expectedStatus: number;
  response: unknown;
}

// Get auth cookie from command line arguments
const args = process.argv.slice(2);
const cookieIndex = args.indexOf("--cookie");
const authCookie = cookieIndex !== -1 ? args[cookieIndex + 1] : undefined;

if (!authCookie) {
  console.log(
    `${colors.yellow}⚠️  No auth cookie provided. Testing without authentication.${colors.reset}`
  );
  console.log(
    `${colors.yellow}Usage: pnpm exec tsx scripts/test-active-endpoint.ts --cookie "sb-xxx-auth-token=your-token"${colors.reset}\n`
  );
}

async function testRequest(testCase: TestCase): Promise<TestResult> {
  const url = `${BASE_URL}${ENDPOINT}/${testCase.teamId}/active`;

  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (authCookie) {
      headers.Cookie = authCookie;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(testCase.body),
    });

    const responseData = await response.json();

    return {
      name: testCase.name,
      passed: response.status === testCase.expectedStatus,
      status: response.status,
      expectedStatus: testCase.expectedStatus,
      response: responseData,
    };
  } catch (error) {
    return {
      name: testCase.name,
      passed: false,
      status: 0,
      expectedStatus: testCase.expectedStatus,
      response: {
        error: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

async function runTests() {
  console.log(
    `${colors.blue}================================================${colors.reset}`
  );
  console.log(
    `${colors.blue}Testing /api/admin/team/[id]/active endpoint${colors.reset}`
  );
  console.log(
    `${colors.blue}================================================${colors.reset}\n`
  );

  const testCases: TestCase[] = [
    // Valid inputs
    {
      name: "Boolean natif (true)",
      teamId: "1",
      body: { active: true },
      expectedStatus: 200,
      expectedSuccess: true,
    },
    {
      name: "Boolean natif (false)",
      teamId: "1",
      body: { active: false },
      expectedStatus: 200,
      expectedSuccess: true,
    },
    {
      name: 'String "true"',
      teamId: "1",
      body: { active: "true" },
      expectedStatus: 200,
      expectedSuccess: true,
    },
    {
      name: 'String "false"',
      teamId: "1",
      body: { active: "false" },
      expectedStatus: 200,
      expectedSuccess: true,
    },
    {
      name: "Number 1 (active)",
      teamId: "1",
      body: { active: 1 },
      expectedStatus: 200,
      expectedSuccess: true,
    },
    {
      name: "Number 0 (inactive)",
      teamId: "1",
      body: { active: 0 },
      expectedStatus: 200,
      expectedSuccess: true,
    },

    // Invalid inputs
    {
      name: 'Invalid value (string "maybe")',
      teamId: "1",
      body: { active: "maybe" },
      expectedStatus: 422,
      expectedSuccess: false,
    },
    {
      name: "Invalid value (number 2)",
      teamId: "1",
      body: { active: 2 },
      expectedStatus: 422,
      expectedSuccess: false,
    },
    {
      name: "Invalid value (number -1)",
      teamId: "1",
      body: { active: -1 },
      expectedStatus: 422,
      expectedSuccess: false,
    },
    {
      name: "Missing active field",
      teamId: "1",
      body: {},
      expectedStatus: 422,
      expectedSuccess: false,
    },
    {
      name: "Null value",
      teamId: "1",
      body: { active: null },
      expectedStatus: 422,
      expectedSuccess: false,
    },
    {
      name: "Array value",
      teamId: "1",
      body: { active: [true] },
      expectedStatus: 422,
      expectedSuccess: false,
    },
    {
      name: "Object value",
      teamId: "1",
      body: { active: { value: true } },
      expectedStatus: 422,
      expectedSuccess: false,
    },

    // Invalid IDs
    {
      name: "Invalid ID (non-numeric)",
      teamId: "abc",
      body: { active: true },
      expectedStatus: 400,
      expectedSuccess: false,
    },
    {
      name: "Invalid ID (negative)",
      teamId: "-1",
      body: { active: true },
      expectedStatus: 400,
      expectedSuccess: false,
    },
    {
      name: "Invalid ID (zero)",
      teamId: "0",
      body: { active: true },
      expectedStatus: 400,
      expectedSuccess: false,
    },
    {
      name: "Invalid ID (decimal)",
      teamId: "1.5",
      body: { active: true },
      expectedStatus: 400,
      expectedSuccess: false,
    },
  ];

  const results: TestResult[] = [];

  for (const testCase of testCases) {
    console.log(`${colors.yellow}🧪 Test: ${testCase.name}${colors.reset}`);
    console.log(`   Request: POST ${ENDPOINT}/${testCase.teamId}/active`);
    console.log(`   Body: ${JSON.stringify(testCase.body)}`);

    const result = await testRequest(testCase);
    results.push(result);

    console.log(`   Status: ${result.status}`);
    console.log(`   Response: ${JSON.stringify(result.response)}`);

    if (result.passed) {
      console.log(`${colors.green}✅ PASS${colors.reset}\n`);
    } else {
      console.log(
        `${colors.red}❌ FAIL - Expected status ${result.expectedStatus}, got ${result.status}${colors.reset}\n`
      );
    }
  }

  // Test authentication protection if cookie was provided
  if (authCookie) {
    console.log(
      `${colors.yellow}🔒 Testing authentication protection...${colors.reset}`
    );

    const authTestUrl = `${BASE_URL}${ENDPOINT}/1/active`;
    const authTestResponse = await fetch(authTestUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: true }),
    });

    const authTestData = await authTestResponse.json();

    console.log(`   Request: POST ${ENDPOINT}/1/active (without cookie)`);
    console.log(`   Status: ${authTestResponse.status}`);
    console.log(`   Response: ${JSON.stringify(authTestData)}`);

    if (authTestResponse.status === 403) {
      console.log(
        `${colors.green}✅ PASS - Auth protection working${colors.reset}\n`
      );
    } else {
      console.log(
        `${colors.red}❌ FAIL - Expected status 403, got ${authTestResponse.status}${colors.reset}\n`
      );
    }
  }

  // Summary
  console.log(
    `${colors.blue}================================================${colors.reset}`
  );
  console.log(`${colors.blue}Test Summary${colors.reset}`);
  console.log(
    `${colors.blue}================================================${colors.reset}`
  );

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;

  console.log(`Total: ${total}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);

  if (failed > 0) {
    console.log(`\n${colors.red}Failed tests:${colors.reset}`);
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(
          `  - ${r.name} (expected ${r.expectedStatus}, got ${r.status})`
        );
      });
  }

  console.log();

  // Exit with error code if tests failed
  if (failed > 0) {
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  console.error(`${colors.red}Error running tests:${colors.reset}`, error);
  process.exit(1);
});
