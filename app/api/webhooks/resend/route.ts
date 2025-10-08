import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { z } from "zod";

const ResendWebhookSchema = z.object({
  type: z.string(),
  created_at: z.string(),
  data: z.any(),
});

export async function POST(req: NextRequest) {
  console.log("[Resend Webhook] Received request");

  const body = await req.json();

  let event;
  try {
    event = ResendWebhookSchema.parse(body);
    console.log(`[Resend Webhook] Event: ${event.type}`);
  } catch (error) {
    console.error("[Resend Webhook] Parse error", error);
    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  }

  const supabase = await createClient();

  switch (event.type) {
    case "email.complained":
      if (event.data.to) {
        await supabase
          .from('abonnes_newsletter')
          .update({
            subscribed: false,
            unsubscribed_at: new Date().toISOString(),
            metadata: { unsubscribe_reason: 'spam_complaint' }
          })
          .eq('email', event.data.to);
      }
      break;

    case "email.bounced":
      if (event.data.bounce_type === 'hard' && event.data.to) {
        await supabase
          .from('abonnes_newsletter')
          .update({
            subscribed: false,
            unsubscribed_at: new Date().toISOString(),
            metadata: { unsubscribe_reason: 'hard_bounce' }
          })
          .eq('email', event.data.to);
      }
      break;

    case "email.delivered":
    case "email.sent":
    case "email.opened":
    case "email.clicked":
      console.info(`[Resend Webhook] ${event.type}:`, event.data.id);
      break;

    default:
      console.debug(`[Resend Webhook] Unhandled: ${event.type}`);
  }

  return NextResponse.json({ ok: true });
}