import { NextRequest } from "next/server";
import { ContactMessageSchema } from "@/lib/email/schemas";
import { sendContactNotification } from "@/lib/email/actions";
import {
  createContactMessage,
  type ContactMessageInput,
} from "@/lib/dal/contact";
import { parseFullName, HttpStatus, ApiResponse } from "@/lib/api/helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = ContactMessageSchema.safeParse(body);

    if (!validation.success) {
      return ApiResponse.validationError(validation.error.issues);
    }

    const contactData = validation.data;

    // Mapper le schéma API vers le schéma DAL
    // API: name (string unique) → DAL: firstName + lastName
    const { firstName, lastName } = parseFullName(contactData.name);

    const dalInput: ContactMessageInput = {
      firstName,
      lastName,
      email: contactData.email,
      phone: contactData.phone || null,
      reason: (contactData.reason as ContactMessageInput["reason"]) || "autre",
      message: `[${contactData.subject}]\n\n${contactData.message}`, // Inclure le sujet dans le message
      consent: contactData.consent,
    };

    // RGPD Compliance: Persist to database using DAL (INSERT sans SELECT)
    // Seuls les admins peuvent lire les données personnelles via RLS
    try {
      await createContactMessage(dalInput);
    } catch (dbError) {
      console.error("[Contact API] Database error:", dbError);
      // Ne pas bloquer l'envoi d'email si la BDD échoue
    }

    // Envoi de notification email via Resend
    let emailSent = true;
    try {
      await sendContactNotification({
        name: contactData.name,
        email: contactData.email,
        subject: contactData.subject,
        message: contactData.message,
        phone: contactData.phone,
        reason: contactData.reason,
      });
    } catch (emailError) {
      console.error("[Contact API] Email notification failed:", emailError);
      emailSent = false;
      // Ne pas échouer la soumission si l'email échoue
    }

    return ApiResponse.success(
      {
        status: "sent",
        message: "Message envoyé",
        ...(emailSent ? {} : { warning: "Notification email could not be sent" }),
      },
      HttpStatus.OK
    );
  } catch (error) {
    console.error("[Contact API] Error:", error);
    return ApiResponse.error("Erreur serveur", HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
