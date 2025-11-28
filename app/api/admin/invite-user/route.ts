/**
 * @deprecated Préférer utiliser le Server Action inviteUser depuis
 * app/(admin)/admin/users/invite/actions.ts
 *
 * Cette API Route est conservée pour rétrocompatibilité avec des clients externes.
 */
import { NextRequest } from "next/server";
import { inviteUserWithoutEmail } from "@/lib/dal/admin-users";
import { sendInvitationEmail } from "@/lib/email/actions";
import { ApiResponse, HttpStatus, withAdminAuth } from "@/lib/api/helpers";

export async function POST(request: NextRequest) {
  return withAdminAuth(async () => {
    try {
      const body = await request.json();

      // 1. Création utilisateur via DAL
      const result = await inviteUserWithoutEmail(body);

      if (!result.success || !result.data) {
        return ApiResponse.error(
          result.error ?? "Invite failed",
          HttpStatus.BAD_REQUEST
        );
      }

      const { userId, invitationUrl } = result.data;

      // 2. Envoi email (Pattern Warning - ne fait pas échouer l'action)
      let emailSent = true;
      try {
        await sendInvitationEmail({
          email: body.email,
          role: body.role,
          displayName: body.displayName,
          invitationUrl,
        });
      } catch (emailError) {
        console.error("[API] Email send failed:", emailError);
        emailSent = false;
      }

      // 3. Retour avec warning si email échoué
      return ApiResponse.success(
        {
          userId,
          message: emailSent
            ? "Invitation envoyée avec succès"
            : "Utilisateur créé mais l'email n'a pas pu être envoyé",
          ...(emailSent ? {} : { warning: "Email sending failed" }),
        },
        HttpStatus.CREATED
      );
    } catch (error) {
      console.error("[API] Invite user error:", error);
      return ApiResponse.error(
        "Erreur interne du serveur",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  });
}