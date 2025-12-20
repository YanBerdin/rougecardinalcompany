"use server";

import { resend } from "@/lib/resend";
import { SITE_CONFIG } from "@/lib/site-config";
import { env } from "@/lib/env";
import NewsletterConfirmation from "@/emails/newsletter-confirmation";
import ContactMessageNotification from "@/emails/contact-message-notification";
import InvitationEmail from "@/emails/invitation-email";
import type { ResendParamsTypeWithConditionalFrom } from "@/lib/email/types";

export const sendEmail = async (
  ...params: ResendParamsTypeWithConditionalFrom
) => {
  const emailTo = params[0].to;
  const emailSubject = params[0].subject; //TODO: subject column required ?

  console.log(`[Email] Sending to ${emailTo}: ${emailSubject}`);

  if (env.NODE_ENV === "development") {
    params[0].subject = `[DEV] ${params[0].subject}`;
  }

  const emailParams = {
    from: params[0].from ?? SITE_CONFIG.EMAIL.FROM,
    to: params[0].to,
    subject: params[0].subject,
    react: params[0].react,
    ...(params[0].cc && { cc: params[0].cc }),
    ...(params[0].bcc && { bcc: params[0].bcc }),
    ...(params[0].replyTo && { replyTo: params[0].replyTo }),
    ...(params[0].text && { text: params[0].text }),
    ...(params[0].html && { html: params[0].html }),
    ...(params[0].attachments && { attachments: params[0].attachments }),
    ...(params[0].tags && { tags: params[0].tags }),
  };

  const result = await resend.emails.send(emailParams, params[1]);

  if (result.error) {
    console.error(`[Email] Failed:`, result.error);
    throw new Error(`Failed to send email: ${result.error.message}`);
  }

  console.log(`[Email] Sent successfully: ${result.data?.id}`);
  return result;
};

export async function sendNewsletterConfirmation(email: string) {
  await sendEmail({
    to: email,
    subject: `Confirmation d'inscription à notre newsletter`,
    react: NewsletterConfirmation({ email }),
  });
}

export async function sendContactNotification(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  reason?: string;
}) {
  await sendEmail({
    to: SITE_CONFIG.EMAIL.CONTACT,
    subject: `Nouveau contact : ${params.subject}`,
    react: ContactMessageNotification(params),
  });
}

export async function sendInvitationEmail(params: {
  email: string;
  role: string;
  displayName?: string;
  invitationUrl: string;
}): Promise<void> {
  // Dev-only redirect: enabled only when EMAIL_DEV_REDIRECT is 'true'.
  // This avoids accidental permanent overrides and respects TypeScript/clean-code rules.
  const devRedirectEnabled =
    env.NODE_ENV === "development" && env.EMAIL_DEV_REDIRECT;

  const recipientEmail = devRedirectEnabled
    ? env.EMAIL_DEV_REDIRECT_TO ?? "yandevformation@gmail.com"
    : params.email;

  console.log(
    `[Email] ${devRedirectEnabled ? `DEV MODE - Redirecting from ${params.email} to ${recipientEmail}` : `Sending to ${recipientEmail}`}`
  );

  await sendEmail({
    to: recipientEmail,
    subject: `Invitation à rejoindre ${SITE_CONFIG.SEO.TITLE}`,
    react: InvitationEmail({
      email: params.email, // Garde l'email original dans le template
      role: params.role,
      displayName: params.displayName,
      invitationUrl: params.invitationUrl,
    }),
  });
}
