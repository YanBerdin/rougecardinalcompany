import {
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FooterConfigDTO } from "@/lib/schemas/footer-config";

interface ContactInfoSidebarProps {
  contactInfo: FooterConfigDTO["contact"];
  children?: React.ReactNode;
}

export function ContactInfoSidebar({
  contactInfo,
  children,
}: ContactInfoSidebarProps): React.JSX.Element {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Nos Coordonnées</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Mail className="size-5 text-chart-2 mt-1" aria-hidden="true" />
            <div>
              <p className="font-medium">Email</p>
              <Link
                href={`mailto:${contactInfo.email}`}
                className="text-muted-foreground hover:text-chart-2"
                aria-label={`Envoyer un email à ${contactInfo.email}`}
              >
                {contactInfo.email}
              </Link>
            </div>
          </div>

          {contactInfo.phone && (
            <div className="flex items-start space-x-3">
              <Phone className="size-5 text-chart-2 mt-1" aria-hidden="true" />
              <div>
                <p className="font-medium">Téléphone</p>
                <Link
                  href={`tel:${contactInfo.phone}`}
                  className="text-muted-foreground hover:text-chart-2"
                  aria-label={`Appeler le ${contactInfo.phone}`}
                >
                  {contactInfo.phone}
                </Link>
              </div>
            </div>
          )}

          <div className="flex items-start space-x-3">
            <MapPin className="size-5 shrink-0 text-chart-2 mt-1" aria-hidden="true" />
            <div>
              <p className="font-medium">Adresse</p>
              <p className="text-muted-foreground">{contactInfo.address}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {children}
    </div>
  );
}
