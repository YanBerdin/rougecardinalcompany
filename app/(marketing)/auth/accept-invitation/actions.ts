"use server";

import "server-only";

import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { isSafeInvitationUrl } from "@/lib/utils/validate-invitation-url";

const INVALID_INVITATION_PATH = "/auth/accept-invitation";

function getInvitationUrl(formData: FormData): string | null {
    const invitationUrl = formData.get("invitationUrl");
    return typeof invitationUrl === "string" ? invitationUrl : null;
}

/**
 * Revalidates the invitation URL at the server boundary before redirecting.
 */
export async function continueInvitationAction(formData: FormData): Promise<never> {
    const invitationUrl = getInvitationUrl(formData);
    const siteOrigin = new URL(env.NEXT_PUBLIC_SITE_URL).origin;

    if (
        !invitationUrl ||
        !isSafeInvitationUrl(invitationUrl, env.NEXT_PUBLIC_SUPABASE_URL, siteOrigin)
    ) {
        redirect(INVALID_INVITATION_PATH);
    }

    redirect(invitationUrl);
}