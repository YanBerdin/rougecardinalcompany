// app/api/test-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  sendNewsletterConfirmation,
  sendContactNotification,
} from "@/lib/email/actions";

export async function POST(request: NextRequest) {
  try {
    const { type, email, contactData } = await request.json();

    console.log(`[Test Email] Received test request: ${type}`);

    switch (type) {
      case "newsletter":
        if (!email) {
          return NextResponse.json(
            { error: "Email is required for newsletter test" },
            { status: 400 }
          );
        }

        await sendNewsletterConfirmation(email);
        return NextResponse.json({
          success: true,
          message: `Newsletter confirmation sent to ${email}`,
          type: "newsletter",
        });

      case "contact":
        if (!contactData) {
          return NextResponse.json(
            { error: "Contact data is required for contact test" },
            { status: 400 }
          );
        }

        await sendContactNotification(contactData);
        return NextResponse.json({
          success: true,
          message: "Contact notification sent",
          type: "contact",
        });

      default:
        return NextResponse.json(
          { error: 'Invalid test type. Use "newsletter" or "contact"' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[Test Email] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to send test email",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Email Test Endpoint",
    usage: {
      newsletter: 'POST { "type": "newsletter", "email": "test@example.com" }',
      contact:
        'POST { "type": "contact", "contactData": { "name": "...", "email": "...", "subject": "...", "message": "..." } }',
    },
  });
}
