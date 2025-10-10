import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/supabase/server';
import { sendNewsletterConfirmation } from '@/lib/email/actions';

const NewsletterBodySchema = z.object({
  email: z.string().email(),
  consent: z.boolean().optional().default(true),
  source: z.string().min(1).max(64).optional().default('home'),
});

type NewsletterBody = z.infer<typeof NewsletterBodySchema>;

// supabase/schemas/10_tables_system.sql
// table public.abonnes_newsletter
export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = NewsletterBodySchema.safeParse(json);
    if (!body.success) {
      return NextResponse.json({ error: 'Invalid payload', details: body.error.flatten() }, { status: 400 });
    }
  const { email, consent, source } = body.data as NewsletterBody;

    const supabase = await createClient();

    // RGPD Compliance: Use INSERT instead of UPSERT to avoid exposing emails via RLS SELECT policy
    // Don't use .select() to avoid RLS blocking the read after insert
    // Handle duplicate emails gracefully (error code 23505 = unique_violation)
    const { error } = await supabase
      .from('abonnes_newsletter')
      .insert({
        email,
        metadata: { consent: Boolean(consent), source }
      });

    // Error code 23505 = unique_violation (duplicate email) - this is OK, user is already subscribed
    if (error && error.code !== '23505') {
      console.error('Newsletter subscribe error', error);
      return NextResponse.json({ error: 'Subscription failed' }, { status: 500 });
    }

    // Envoi email de confirmation via Resend
    let emailSent = true;
    try {
      await sendNewsletterConfirmation(email);
    } catch (emailError) {
      console.error('Newsletter confirmation email failed:', emailError);
      emailSent = false;
      // Ne pas échouer la souscription si l'email échoue (inscription en base réussie)
    }

    // Idempotent success (new or existing)
    return NextResponse.json({ 
      status: 'subscribed',
      ...(emailSent ? {} : { warning: 'Confirmation email could not be sent' })
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
}
