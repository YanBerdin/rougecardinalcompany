"use server";

import "server-only";
import {
    ContactEmailSchema,
    type ContactMessageInput,
} from "@/lib/schemas/contact";
import { sendContactNotification } from "@/lib/email/actions";
import { createContactMessage } from "@/lib/dal/contact";
import { parseFullName } from "@/lib/api/helpers";
import type { ActionResult } from "@/lib/actions/types";

type ContactSubmissionResult = ActionResult<{
    status: "sent";
    warning?: string;
}>;

export async function handleContactSubmission(
    input: unknown
): Promise<ContactSubmissionResult> {
    const validation = ContactEmailSchema.safeParse(input);

    if (!validation.success) {
        const firstIssue = validation.error.issues[0];
        return {
            success: false,
            error: firstIssue?.message ?? "Validation failed",
        };
    }

    const contactData = validation.data;
    const { firstName, lastName } = parseFullName(contactData.name);

    const dalInput: ContactMessageInput = {
        firstName,
        lastName,
        email: contactData.email,
        phone: contactData.phone || null,
        reason: (contactData.reason as ContactMessageInput["reason"]) || "autre",
        message: `[${contactData.subject}]\n\n${contactData.message}`,
        consent: contactData.consent,
    };

    const dalResult = await createContactMessage(dalInput);
    if (!dalResult.success) {
        console.error("[Contact] Database error:", dalResult.error);
    }

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
        console.error("[Contact] Email notification failed:", emailError);
        emailSent = false;
    }

    return {
        success: true,
        data: {
            status: "sent",
            ...(emailSent ? {} : { warning: "Notification email could not be sent" }),
        },
    };
}
