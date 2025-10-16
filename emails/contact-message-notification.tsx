// import { SITE_CONFIG } from "@/lib/site-config";
import { Preview, Text } from "@react-email/components";
import { EmailLayout } from "./utils/email-layout";
import { EmailSection, EmailText } from "./utils/components.utils";

interface ContactMessageNotificationProps {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  reason?: string;
}

export default function ContactMessageNotification({
  name,
  email,
  subject,
  message,
  phone,
  reason,
}: ContactMessageNotificationProps) {
  return (
    <EmailLayout>
      <Preview>Nouveau message de contact de {name}</Preview>
      <EmailSection>
        <EmailText>Nouveau message de contact reçu :</EmailText>
        <div
          style={{
            background: "#f6f6f6",
            padding: "20px",
            borderRadius: "8px",
            margin: "20px 0",
          }}
        >
          <Text className="text-base">
            <strong>Nom :</strong> {name}
          </Text>
          <Text className="text-base">
            <strong>Email :</strong> {email}
          </Text>
          {phone && (
            <Text className="text-base">
              <strong>Téléphone :</strong> {phone}
            </Text>
          )}
          {reason && (
            <Text className="text-base">
              <strong>Motif :</strong> {reason}
            </Text>
          )}
          <Text className="text-base">
            <strong>Sujet :</strong> {subject}
          </Text>
          <div style={{ marginTop: "15px" }}>
            <Text className="text-base">
              <strong>Message :</strong>
            </Text>
            <Text className="text-base" style={{ whiteSpace: "pre-wrap" }}>
              {message}
            </Text>
          </div>
        </div>
      </EmailSection>
    </EmailLayout>
  );
}
