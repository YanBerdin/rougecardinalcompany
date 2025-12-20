"use server";

import { createClient } from "@/supabase/server";
import { resend } from "@/lib/resend";
import { env } from "@/lib/env";
import { SITE_CONFIG, WEBSITE_URL } from "@/lib/site-config";
import NewsletterConfirmation from "@/emails/newsletter-confirmation";
import ContactMessageNotification from "@/emails/contact-message-notification";
import InvitationEmail from "@/emails/invitation-email";
import type { ResendParamsTypeWithConditionalFrom } from "./types";

export const sendEmail = async (
  ...params: ResendParamsTypeWithConditionalFrom
) => {
  const emailTo = params[0].to;
  const emailFrom = params[0].from || SITE_CONFIG.EMAIL.FROM;

  try {
    const result = await resend.emails.send({
      ...params[0],
      from: emailFrom,
      to: Array.isArray(emailTo) ? emailTo : [emailTo],
    });

    if (result.error) {
      console.error("[Email] Send error:", result.error);
      throw new Error(`Failed to send email: ${result.error.message}`);
    }

    console.log("[Email] Sent successfully:", result.data?.id);
    return result;
  } catch (error) {
    console.error("[Email] Send failed:", error);
    throw error;
  }
};

export async function sendNewsletterConfirmation(email: string) {
  await sendEmail({
    to: email,
    subject: `Bienvenue dans la newsletter de ${SITE_CONFIG.MAKER.NAME}`,
    react: NewsletterConfirmation({ email }),
  });
}

export async function sendContactNotification(params: {
  name: string;
  email: string;
  subject?: string;
  message: string;
  phone?: string;
  reason?: string;
}) {
  await sendEmail({
    to: SITE_CONFIG.EMAIL.CONTACT,
    subject: `Nouveau message de contact: ${params.subject || params.reason}`,
    react: ContactMessageNotification(params),
  });
}

/**
 * Sends invitation email with dev redirect support.
 * In development, emails can be redirected to a test address.
 */
export async function sendInvitationEmail(params: {
  email: string;
  firstName: string;
  inviteLink: string;
  expiresAt: string;
}) {
  // Dev redirect logic using T3 Env
  const devRedirectEnabled = env.EMAIL_DEV_REDIRECT;
  const recipientEmail = devRedirectEnabled
    ? env.EMAIL_DEV_REDIRECT_TO ?? params.email
    : params.email;

  if (devRedirectEnabled && env.EMAIL_DEV_REDIRECT_TO) {
    console.log(
      `[Email] DEV MODE: Redirecting invitation from ${params.email} to ${env.EMAIL_DEV_REDIRECT_TO}`
    );
  }

  await sendEmail({
    to: recipientEmail,
    subject: `Invitation à rejoindre ${SITE_CONFIG.MAKER.NAME}`,
    react: InvitationEmail({
      firstName: params.firstName,
      inviteLink: params.inviteLink,
      expiresAt: params.expiresAt,
      // Keep original email in template for debugging
      recipientEmail: params.email,
    }),
  });
}
