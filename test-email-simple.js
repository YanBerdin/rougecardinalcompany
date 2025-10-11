// test-email-simple.js
const fetch = require("node-fetch");

async function testNewsletter() {
  try {
    console.log("🧪 Testing newsletter email...");

    const response = await fetch("http://localhost:3000/api/test-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "newsletter",
        email: "yandevformation@gmail.com",
      }),
    });

    const result = await response.json();
    console.log("📧 Response:", result);

    if (response.ok) {
      console.log("✅ Newsletter test successful!");
    } else {
      console.log("❌ Newsletter test failed:", result.error);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function testContact() {
  try {
    console.log("🧪 Testing contact email...");

    const response = await fetch("http://localhost:3000/api/test-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "contact",
        contactData: {
          name: "Test User",
          email: "yandevformation@gmail.com",
          subject: "Test Subject",
          message: "This is a test message from the integration test.",
        },
      }),
    });

    const result = await response.json();
    console.log("📧 Response:", result);

    if (response.ok) {
      console.log("✅ Contact test successful!");
    } else {
      console.log("❌ Contact test failed:", result.error);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function runTests() {
  console.log("🚀 Starting Resend integration tests...\n");

  await testNewsletter();
  console.log("");
  await testContact();

  console.log("\n🎉 Tests completed!");
  console.log(
    "📬 Check your email inbox and Resend dashboard for the test emails."
  );
}

// Run tests
runTests();
