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

export default function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo et Description */}
          <div className="col-span-1 lg:col-span-2">
            <Link href="/" className="logo-container mb-4">
              <Image
                src="/logo-florian.png"
                alt="Rouge-Cardinal Logo"
                width={32}
                height={32}
                className="h-8 w-auto object-contain"
              />
              <span className="logo-text">Rouge-Cardinal</span>
            </Link>
            <p className="text-muted-foreground mb-4 max-w-md">
              Compagnie de théâtre passionnée par les arts de la scène, nous
              créons et produisons des spectacles qui touchent et interrogent
              notre époque.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link
                  href="#"
                  aria-label="Facebook"
                  className="hover:text-primary"
                  title="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link
                  href="#"
                  aria-label="Instagram"
                  className="hover:text-primary"
                  title="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="#" aria-label="Twitter" className="hover:text-primary" title="Twitter">
                  <Twitter className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold mb-4 text-primary">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/compagnie"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  La Compagnie
                </Link>
              </li>
              <li>
                <Link
                  href="/spectacles"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Spectacles
                </Link>
              </li>
              <li>
                <Link
                  href="/agenda"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Agenda
                </Link>
              </li>
              <li>
                <Link
                  href="/presse"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Presse
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-primary">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span>contact@rouge-cardinal.fr</span>
              </li>
              <li className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span>+33 1 23 45 67 89</span>
              </li>
              <li className="flex items-start space-x-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-1 text-primary" />
                <span>75011 Paris, France</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} Rouge-Cardinal. Tous droits
              réservés.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link
                href="/mentions-legales"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Mentions légales
              </Link>
              <Link
                href="/politique-confidentialite"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Politique de confidentialité
              </Link>
              <Link
                href="/cookies"
                className="text-muted-foreground hover:text-primary transition-colors"
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
