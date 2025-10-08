// scripts/test-email-integration.ts
// Test email integration by calling the API endpoint

async function testEmailIntegration() {
  console.log('🧪 Testing Resend Email Integration...\n');

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  try {
    // Test 1: Newsletter subscription
    console.log('📧 Testing newsletter subscription...');
    const newsletterResponse = await fetch(`${baseUrl}/api/test-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'newsletter',
        email: 'test@example.com'
      })
    });

    if (newsletterResponse.ok) {
      console.log('✅ Newsletter test: PASSED');
      const result = await newsletterResponse.json();
      console.log('   Response:', result);
    } else {
      console.log('❌ Newsletter test: FAILED');
      console.log('   Status:', newsletterResponse.status);
      console.log('   Error:', await newsletterResponse.text());
    }

    // Test 2: Contact form
    console.log('\n📝 Testing contact form...');
    const contactResponse = await fetch(`${baseUrl}/api/test-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'contact',
        contactData: {
          name: 'Test User',
          email: 'test@example.com',
          subject: 'Test Subject',
          message: 'This is a test message from the integration test.'
        }
      })
    });

    if (contactResponse.ok) {
      console.log('✅ Contact test: PASSED');
      const result = await contactResponse.json();
      console.log('   Response:', result);
    } else {
      console.log('❌ Contact test: FAILED');
      console.log('   Status:', contactResponse.status);
      console.log('   Error:', await contactResponse.text());
    }

    console.log('\n🎉 Email integration tests completed!');
    console.log('💡 Check your email inbox and Supabase database for results.');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    console.log('\n💡 Make sure the Next.js server is running: pnpm dev');
  }
}

// Run the test
testEmailIntegration();