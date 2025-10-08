import { NextRequest, NextResponse } from "next/server";
import { ContactMessageSchema } from "@/lib/email/schemas";
import { sendContactNotification } from "@/lib/email/actions";
// TODO: Réutiliser la DAL contact existante : lib/dal/contact.ts

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = ContactMessageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.issues },
        { status: 400 }
      );
    }

    const contactData = validation.data;

    // TODO: Intégrer avec la DAL contact existante (lib/dal/contact.ts)
    // au lieu de dupliquer la logique Supabase
    // Exemple d'intégration :
    // const { createContactMessage } = await import('@/lib/dal/contact');
    // const savedMessage = await createContactMessage(contactData);

    // Envoi de notification email via Resend
    await sendContactNotification({
      name: contactData.name,
      email: contactData.email,
      subject: contactData.subject,
      message: contactData.message,
      phone: contactData.phone,
      reason: contactData.reason,
    });

    return NextResponse.json({ status: 'sent', message: 'Message envoyé' });

  } catch (error) {
    console.error('[Contact API] Error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}