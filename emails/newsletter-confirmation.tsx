import { SITE_CONFIG } from "@/lib/site-config";
import { Preview, Text } from "@react-email/components";
import { EmailLayout } from "./utils/email-layout";
import { EmailSection, EmailText } from "./utils/components.utils";

export default function NewsletterConfirmation({ email }: { email: string }) {
  return (
    <EmailLayout>
      <Preview>Merci de vous être inscrit(e) à notre newsletter !</Preview>
      <EmailSection>
        <EmailText>Bonjour,</EmailText>
        <EmailText>
          Merci de vous être inscrit(e) à notre newsletter avec l'email{" "}
          <strong>{email}</strong>.
        </EmailText>
        <EmailText>
          Vous recevrez désormais nos actualités et informations sur nos
          spectacles directement dans votre boîte mail.
        </EmailText>
      </EmailSection>
      <Text className="text-lg leading-6">
        Merci de votre confiance,
        <br />- L'équipe {SITE_CONFIG.SEO.TITLE}
      </Text>
    </EmailLayout>
  );
}
