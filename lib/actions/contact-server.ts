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
import { recordRequest } from "@/lib/utils/rate-limit";
import { getClientIP } from "@/lib/utils/get-client-ip";
import { headers } from "next/headers";

type ContactSubmissionResult = ActionResult<{
    status: "sent";
    warning?: string;
}>;

export async function handleContactSubmission(
    input: unknown
): Promise<ContactSubmissionResult> {
    // 1. Rate-limiting AVANT validation
    const headersList = await headers();
    const clientIP = getClientIP(headersList);
    const rateLimitKey = `contact:${clientIP}`;
    
    const rateLimit = recordRequest(
        rateLimitKey,
        5, // max 5 requêtes
        15 * 60 * 1000 // fenêtre de 15 minutes
    );

    if (!rateLimit.success) {
        console.warn(`[Contact] Rate limit exceeded for IP: ${clientIP}`);
        return {
            success: false,
            error: `Trop de tentatives. Veuillez réessayer dans ${Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 60000)} minutes.`,
        };
    }

    // 2. Validation des données
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

    const dalResult = await createContactMessage({
        ...dalInput,
        metadata: {
            ip: clientIP,
            user_agent: headersList.get("user-agent") || "unknown",
            rate_limit_remaining: rateLimit.remaining,
        },
    });
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
