import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { fetchFooterConfig } from "@/lib/dal/footer-config";
import { FOOTER_DEFAULTS } from "@/lib/schemas/footer-config";

export default async function Footer() {
  const result = await fetchFooterConfig();
  const config = result.success ? result.data : FOOTER_DEFAULTS;
  const { description, contact, socialLinks } = config;

  return (
    <footer className="bg-background border-t">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo et Description */}
          <div className="col-span-1 lg:col-span-2">
            <Link href="/" className="logo-container mb-4">
              <Image
                src="/logo-florian.png"
                alt="Rouge-Cardinal Logo"
                width={32}
                height={32}
                className="h-8 w-auto object-contain rounded-md mb-2"
              />
              <span className="logo-text whitespace-nowrap text-secondary-foreground">Rouge Cardinal</span>
            </Link>
            <p className="text-base text-muted-foreground mb-4 max-w-md">
              {description}
            </p>
            <div className="flex space-x-4">
              {socialLinks.facebook && (
                <Button variant="ghost" size="icon" asChild className="min-h-11 min-w-11">
                  <Link
                    href={socialLinks.facebook}
                    aria-label="Facebook"
                    className="hover:text-chart-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Facebook className="size-6" />
                  </Link>
                </Button>
              )}
              {socialLinks.instagram && (
                <Button variant="ghost" size="icon" asChild className="min-h-11 min-w-11">
                  <Link
                    href={socialLinks.instagram}
                    aria-label="Instagram"
                    className="hover:text-chart-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Instagram className="size-6" />
                  </Link>
                </Button>
              )}
              {socialLinks.twitter && (
                <Button variant="ghost" size="icon" asChild className="min-h-11 min-w-11">
                  <Link
                    href={socialLinks.twitter}
                    aria-label="Twitter"
                    className="hover:text-chart-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Twitter className="size-6" />
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold font-sans mb-4 text-secondary-foreground">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/compagnie"
                  className="text-muted-foreground hover:text-chart-2 transition-colors"
                >
                  La Compagnie
                </Link>
              </li>
              <li>
                <Link
                  href="/spectacles"
                  className="text-muted-foreground hover:text-chart-2 transition-colors"
                >
                  Spectacles
                </Link>
              </li>
              <li>
                <Link
                  href="/agenda"
                  className="text-muted-foreground hover:text-chart-2 transition-colors"
                >
                  Agenda
                </Link>
              </li>
              <li>
                <Link
                  href="/presse"
                  className="text-muted-foreground hover:text-chart-2 transition-colors"
                >
                  Presse
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-chart-2 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold font-sans mb-4 text-secondary-foreground">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4 text-chart-2" aria-hidden="true" />
                <Link
                  href={`mailto:${contact.email}`}
                  className="text-muted-foreground hover:text-chart-2"
                  aria-label={`Envoyer un email à ${contact.email}`}
                >
                  <span>{contact.email}</span>
                </Link>
              </li>
              {contact.phone && (
                <li className="flex items-center space-x-2 text-muted-foreground">
                  <Phone className="h-4 w-4 text-chart-2" aria-hidden="true" />
                  <Link
                    href={`tel:${contact.phone.replace(/\s+/g, "")}`}
                    className="text-muted-foreground hover:text-chart-2"
                    aria-label={`Appeler le ${contact.phone}`}
                  >
                    <span>{contact.phone}</span>
                  </Link>
                </li>
              )}
              <li className="flex items-start space-x-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0 text-chart-2" aria-hidden="true" />
                <span>{contact.address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} Rouge-Cardinal. Tous droits
              réservés.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link
                href="/mentions-legales"
                className="text-muted-foreground hover:text-chart-2 transition-colors"
              >
                Mentions légales
              </Link>
              <Link
                href="/politique-confidentialite"
                className="text-muted-foreground hover:text-chart-2 transition-colors"
              >
                Politique de confidentialité
              </Link>
              <Link
                href="/cookies"
                className="text-muted-foreground hover:text-chart-2 transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
