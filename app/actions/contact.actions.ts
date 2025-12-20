"use server";

import "server-only";
import { handleContactSubmission } from "@/lib/actions/contact-server";
import type { ActionResult } from "@/lib/actions/types";

type ContactActionResult = ActionResult<{ status: "sent"; warning?: string }>;

export async function submitContactAction(
    formData: FormData
): Promise<ContactActionResult> {
    const input = {
        name: formData.get("name"),
        email: formData.get("email"),
        subject: formData.get("subject"),
        message: formData.get("message"),
        phone: formData.get("phone") || undefined,
        reason: formData.get("reason") || undefined,
        consent: formData.get("consent") === "true",
    };

    return handleContactSubmission(input);
}
