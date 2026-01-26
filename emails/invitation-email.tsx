import { SITE_CONFIG } from "@/lib/site-config";
import { Preview, Text, Button } from "@react-email/components";
import { EmailLayout } from "./utils/email-layout";
import { EmailSection, EmailText, EmailLink } from "./utils/components.utils";

interface InvitationEmailProps {
  email: string;
  role: string;
  displayName?: string;
  invitationUrl: string;
}

const roleLabels: Record<string, string> = {
  user: "Utilisateur",
  editor: "Éditeur",
  admin: "Administrateur",
};

export default function InvitationEmail({
  email,
  role,
  displayName,
  invitationUrl,
}: InvitationEmailProps) {
  const roleLabel = roleLabels[role] || role;

  return (
    <EmailLayout>
      <Preview>
        Vous avez été invité(e) à rejoindre {SITE_CONFIG.SEO.TITLE}
      </Preview>

      <EmailSection>
        <EmailText>
          Bonjour{displayName ? ` ${displayName}` : ""},
        </EmailText>
        <EmailText>
          Vous avez été invité(e) à rejoindre la plateforme{" "}
          <strong>{SITE_CONFIG.SEO.TITLE}</strong> en tant que{" "}
          <strong>{roleLabel}</strong>.
        </EmailText>
        <EmailText>
          Pour activer votre compte et définir votre mot de passe, cliquez sur
          le bouton ci-dessous :
        </EmailText>
      </EmailSection>

      <EmailSection>
        <Button
          href={invitationUrl}
          style={{
            backgroundColor: "#4F46E5",
            color: "#f7f7f7",
            padding: "12px 24px",
            borderRadius: "6px",
            textDecoration: "none",
            fontWeight: "600",
            display: "inline-block",
          }}
        >
          Activer mon compte
        </Button>
      </EmailSection>

      <EmailSection>
        <Text className="text-sm text-gray-600">
          Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre
          navigateur :
        </Text>
        <EmailLink href={invitationUrl} className="text-sm break-all">
          {invitationUrl}
        </EmailLink>
      </EmailSection>

      <EmailSection>
        <Text className="text-sm text-gray-500">
          Votre adresse email : <strong>{email}</strong>
        </Text>
        <Text className="text-sm text-gray-500">
          ⚠️ Ce lien est valide pendant 24 heures. Après expiration, vous
          devrez demander une nouvelle invitation.
        </Text>
      </EmailSection>

      <EmailSection>
        <Text className="text-sm text-gray-500">
          Si vous n&apos;avez pas demandé cette invitation, vous pouvez ignorer
          cet email en toute sécurité.
        </Text>
      </EmailSection>

      <EmailSection>
        <EmailText>
          À bientôt,
          <br />
          L&apos;équipe {SITE_CONFIG.SEO.TITLE}
        </EmailText>
      </EmailSection>
    </EmailLayout>
  );
}
