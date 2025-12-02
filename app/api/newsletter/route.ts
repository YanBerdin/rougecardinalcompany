import { z } from "zod";
import { createClient } from "@/supabase/server";
import { sendNewsletterConfirmation } from "@/lib/email/actions";
import { HttpStatus, ApiResponse, isUniqueViolation } from "@/lib/api/helpers";

const NewsletterBodySchema = z.object({
  email: z.string().email(),
  consent: z.boolean().optional().default(true),
  source: z.string().min(1).max(64).optional().default("home"),
});

type NewsletterBody = z.infer<typeof NewsletterBodySchema>;

// supabase/schemas/10_tables_system.sql
// table public.abonnes_newsletter
/**
 * Handles newsletter subscription requests.
 *
 * Expects a JSON body with the following structure:
 * {
 *   email: string (valid email address),
 *   consent: boolean (optional, defaults to true),
 *   source: string (optional, max length 64, defaults to "home")
 * }
 *
 */
export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = NewsletterBodySchema.safeParse(json);
    if (!body.success) {
      return ApiResponse.validationError(body.error.issues);
    }
    const { email, consent, source } = body.data as NewsletterBody;

    const supabase = await createClient();

    // RGPD Compliance: Use INSERT instead of UPSERT to avoid exposing emails via RLS SELECT policy
    // Don't use .select() to avoid RLS blocking the read after insert
    // Handle duplicate emails gracefully (unique_violation)
    const { error } = await supabase.from("abonnes_newsletter").insert({
      email,
      metadata: { consent: Boolean(consent), source },
    });

    // Unique violation (duplicate email) is OK - user is already subscribed
    if (error && !isUniqueViolation(error)) {
      console.error("Newsletter subscribe error", error);
      return ApiResponse.error(
        "Subscription failed",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    // Envoi email de confirmation via Resend
    let emailSent = true;
    try {
      await sendNewsletterConfirmation(email);
    } catch (emailError) {
      console.error("Newsletter confirmation email failed:", emailError);
      emailSent = false;
      // Ne pas échouer la souscription si l'email échoue (inscription en base réussie)
    }

    // Idempotent success (new or existing)
    return ApiResponse.success(
      {
        status: "subscribed",
        ...(emailSent
          ? {}
          : { warning: "Confirmation email could not be sent" }),
      },
      HttpStatus.OK
    );
  } catch {
    return ApiResponse.error("Invalid JSON body", HttpStatus.BAD_REQUEST);
  }
}
