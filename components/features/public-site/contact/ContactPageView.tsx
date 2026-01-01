"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  Clock,
  Users,
  Calendar,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactSkeleton } from "@/components/skeletons/contact-skeleton";
import { useNewsletterSubscribe } from "@/lib/hooks/useNewsletterSubscribe";
import { submitContactAction } from "./actions";
import type { ContactFormData, ContactReason } from "./contact-types";

const CONTACT_REASONS: ContactReason[] = [
  { value: "booking", label: "Réservation / Billetterie" },
  { value: "partenariat", label: "Partenariat / Mécénat" },
  { value: "presse", label: "Demande presse" },
  { value: "education", label: "Action culturelle / Éducation" },
  { value: "technique", label: "Question technique" },
  { value: "autre", label: "Autre" },
];

interface ContactPageViewProps {
  showNewsletter?: boolean;
}

export function ContactPageView({ showNewsletter = true }: ContactPageViewProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "", // TODO redundant with reason
    reason: "",
    message: "",
    consent: false,
  });

  const {
    email: newsletterEmail,
    isSubscribed: isNewsletterSubscribed,
    isLoading: isNewsletterLoading,
    errorMessage: newsletterError,
    handleEmailChange: onNewsletterEmailChange,
    handleSubmit: onNewsletterSubmit,
  } = useNewsletterSubscribe({ source: "contact" });

  useEffect(() => {
    const t = setTimeout(() => setIsInitialLoading(false), 600); // artificial delay (TODO: remove)
    return () => clearTimeout(t);
  }, []);

  const onInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const onResetForm = () => {
    setIsSubmitted(false);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      subject: "",
      reason: "",
      message: "",
      consent: false,
    });
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const fd = new FormData();
      fd.set("firstName", formData.firstName);
      fd.set("lastName", formData.lastName);
      fd.set("email", formData.email);
      fd.set("phone", formData.phone);
      fd.set("reason", formData.reason || "autre");
      fd.set("message", formData.message);
      fd.set("consent", String(formData.consent));

      const res = await submitContactAction(fd);
      if (res?.ok) {
        setIsSubmitted(true);
      } else {
        console.error("Form submission error", res);
      }
    } catch (err) {
      console.error("Unexpected error submitting contact form", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitialLoading) {
    return <ContactSkeleton />;
  }

  if (isSubmitted) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Message Envoyé !</h1>
            <p className="text-xl text-muted-foreground mb-6">
              Merci pour votre message. Nous vous répondrons dans les plus brefs
              délais.
            </p>
            <p className="text-muted-foreground mb-8">
              Un accusé de réception a été envoyé à votre adresse email.
            </p>
            <Button onClick={onResetForm}>Envoyer un autre message</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="py-20 hero-gradient text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
            Contact
          </h1>
          <p
            className="text-xl md:text-2xl opacity-90 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            Échangeons autour de nos projets
          </p>
        </div>
      </section>

      <div className="py-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Formulaire de contact */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Écrivez-nous</CardTitle>
                  <p className="text-muted-foreground">
                    Remplissez ce formulaire et nous vous répondrons rapidement.
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={onFormSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="firstName"
                          className="block text-sm font-medium mb-2"
                        >
                          Prénom *
                        </Label>
                        <Input
                          id="firstName"
                          required
                          value={formData.firstName}
                          onChange={(e) =>
                            onInputChange("firstName", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="lastName"
                          className="block text-sm font-medium mb-2"
                        >
                          Nom *
                        </Label>
                        <Input
                          id="lastName"
                          required
                          value={formData.lastName}
                          onChange={(e) =>
                            onInputChange("lastName", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="email"
                          className="block text-sm font-medium mb-2"
                        >
                          Email *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) =>
                            onInputChange("email", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="phone"
                          className="block text-sm font-medium mb-2"
                        >
                          Téléphone
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            onInputChange("phone", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label
                        htmlFor="reason"
                        className="block text-sm font-medium mb-2"
                      >
                        Motif de votre demande *
                      </Label>
                      <Select
                        value={formData.reason}
                        onValueChange={(value) =>
                          onInputChange("reason", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un motif" />
                        </SelectTrigger>
                        <SelectContent>
                          {CONTACT_REASONS.map((reason) => (
                            <SelectItem key={reason.value} value={reason.value}>
                              {reason.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label
                        htmlFor="message"
                        className="block text-sm font-medium mb-2"
                      >
                        Message *
                      </Label>
                      <Textarea
                        id="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={(e) =>
                          onInputChange("message", e.target.value)
                        }
                        placeholder="Décrivez votre demande en détail..."
                      />
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="consent"
                        checked={formData.consent}
                        onCheckedChange={(checked) =>
                          onInputChange("consent", checked as boolean)
                        }
                      />
                      <Label
                        htmlFor="consent"
                        className="text-sm text-muted-foreground leading-relaxed"
                      >
                        J&apos;accepte que mes données personnelles soient traitées
                        pour répondre à ma demande. Conformément au RGPD, vous
                        disposez d&apos;un droit d&apos;accès, de rectification et de
                        suppression de vos données.
                      </Label>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={
                        isLoading || isNewsletterLoading || !formData.consent
                      }
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Envoyer le message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Informations de contact */}
            <div className="space-y-8">
              {/* Coordonnées */}
              <Card>
                <CardHeader>
                  <CardTitle>Nos Coordonnées</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Email</p>
                      <Link
                        href="mailto:contact@rouge-cardinal.fr"
                        className="text-muted-foreground hover:text-primary"
                      >
                        contact@rouge-cardinal.fr
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Téléphone</p>
                      <Link
                        href="tel:+33123456789"
                        className="text-muted-foreground hover:text-primary"
                      >
                        +33 1 23 45 67 89
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Adresse</p>
                      <p className="text-muted-foreground">
                        12 Rue de la République
                        <br />
                        75011 Paris, France
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Horaires */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    Horaires
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Lundi - Vendredi</span>
                      <span className="text-muted-foreground">9h - 18h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Samedi</span>
                      <span className="text-muted-foreground">10h - 16h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dimanche</span>
                      <span className="text-muted-foreground">Fermé</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contacts spécialisés */}
              <Card>
                <CardHeader>
                  <CardTitle>Contacts Spécialisés</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Users className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Presse & Médias</p>
                      <Link
                        href="mailto:presse@rouge-cardinal.fr"
                        className="text-muted-foreground hover:text-primary text-sm"
                      >
                        presse@rouge-cardinal.fr
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Billetterie</p>
                      <Link
                        href="mailto:billetterie@rouge-cardinal.fr"
                        className="text-muted-foreground hover:text-primary text-sm"
                      >
                        billetterie@rouge-cardinal.fr
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Newsletter */}
              {showNewsletter && (
              <Card id="newsletter">
                <CardHeader>
                  <CardTitle>Newsletter</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Restez informé de nos actualités
                  </p>
                </CardHeader>
                <CardContent>
                  {isNewsletterSubscribed ? (
                    <div className="text-center py-4">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        Merci ! Vous êtes inscrit à notre newsletter.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={onNewsletterSubmit} className="space-y-3">
                      <Input
                        type="email"
                        placeholder="Votre email"
                        value={newsletterEmail}
                        onChange={onNewsletterEmailChange}
                        required
                      />
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? "Inscription..." : "S'abonner"}
                      </Button>
                      {newsletterError && (
                        <p className="text-sm text-red-600">
                          {newsletterError}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Pas de spam. Désinscription facile.
                      </p>
                    </form>
                  )}
                </CardContent>
              </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
