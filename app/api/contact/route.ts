import { NextRequest, NextResponse } from "next/server";
import { ContactMessageSchema } from "@/lib/email/schemas";
import { sendContactNotification } from "@/lib/email/actions";
import {
  createContactMessage,
  type ContactMessageInput,
} from "@/lib/dal/contact";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = ContactMessageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validation.error.issues },
        { status: 400 }
      );
    }

    const contactData = validation.data;

    // Mapper le schéma API vers le schéma DAL
    // API: name (string unique) → DAL: firstName + lastName
    const nameParts = contactData.name.trim().split(" ");
    const firstName = nameParts[0] || contactData.name;
    const lastName = nameParts.slice(1).join(" ") || contactData.name;

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

    return NextResponse.json({
      status: "sent",
      message: "Message envoyé",
      ...(emailSent ? {} : { warning: "Notification email could not be sent" }),
    });
  } catch (error) {
    console.error("[Contact API] Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
