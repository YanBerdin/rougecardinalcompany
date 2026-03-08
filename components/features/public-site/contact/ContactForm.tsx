"use client";

import { useState, useCallback } from "react";
import { Send } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { submitContactAction } from "./actions";
import type { ContactFormData, ContactReasonOption } from "./contact-types";

const CONTACT_REASONS: ContactReasonOption[] = [
  { value: "booking", label: "Réservation / Billetterie" },
  { value: "partenariat", label: "Partenariat / Mécénat" },
  { value: "presse", label: "Demande presse" },
  { value: "education", label: "Action culturelle / Éducation" },
  { value: "technique", label: "Question technique" },
  { value: "autre", label: "Autre" },
];

const INITIAL_FORM_DATA: ContactFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  reason: "",
  message: "",
  consent: false,
};

interface ContactFormProps {
  onSuccess: () => void;
}

export function ContactForm({ onSuccess }: ContactFormProps): React.JSX.Element {
  const [formData, setFormData] = useState<ContactFormData>(INITIAL_FORM_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateField = useCallback(
    <TField extends keyof ContactFormData>(
      field: TField,
      value: ContactFormData[TField],
    ): void => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrorMessage(null);
    },
    [],
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent): Promise<void> => {
      event.preventDefault();

      if (!formData.consent) {
        setErrorMessage("Veuillez accepter les conditions pour envoyer votre message.");
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const fd = new FormData();
        fd.set("firstName", formData.firstName);
        fd.set("lastName", formData.lastName);
        fd.set("email", formData.email);
        fd.set("phone", formData.phone);
        fd.set("reason", formData.reason || "autre");
        fd.set("message", formData.message);
        fd.set("consent", String(formData.consent));

        const result = await submitContactAction(fd);
        if (result.success) {
          setFormData(INITIAL_FORM_DATA);
          onSuccess();
        } else {
          setErrorMessage(result.error);
        }
      } catch {
        setErrorMessage("Une erreur inattendue est survenue. Réessayez plus tard.");
      } finally {
        setIsLoading(false);
      }
    },
    [formData, onSuccess],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl">Écrivez-nous</CardTitle>
        <p className="text-muted-foreground">
          Remplissez ce formulaire et nous vous répondrons rapidement.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {errorMessage && (
            <div role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="block text-sm font-medium mb-2">
                Prénom <span aria-hidden="true">*</span>
              </Label>
              <Input
                id="firstName"
                required
                aria-required="true"
                value={formData.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="block text-sm font-medium mb-2">
                Nom <span aria-hidden="true">*</span>
              </Label>
              <Input
                id="lastName"
                required
                aria-required="true"
                value={formData.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email" className="block text-sm font-medium mb-2">
                Email <span aria-hidden="true">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                required
                aria-required="true"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone" className="block text-sm font-medium mb-2">
                Téléphone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="reason" className="block text-sm font-medium mb-2">
              Motif de votre demande <span aria-hidden="true">*</span>
            </Label>
            <Select
              value={formData.reason}
              onValueChange={(value) => updateField("reason", value as ContactFormData["reason"])}
            >
              <SelectTrigger id="reason" aria-required="true">
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
            <Label htmlFor="message" className="block text-sm font-medium mb-2">
              Message <span aria-hidden="true">*</span>
            </Label>
            <Textarea
              id="message"
              required
              aria-required="true"
              rows={6}
              value={formData.message}
              onChange={(e) => updateField("message", e.target.value)}
              placeholder="Décrivez votre demande en détail..."
            />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="consent"
              aria-required="true"
              checked={formData.consent}
              onCheckedChange={(checked) =>
                updateField("consent", checked === true)
              }
            />
            <Label
              htmlFor="consent"
              className="text-sm text-muted-foreground leading-relaxed"
            >
              J&apos;accepte que mes données personnelles soient traitées
              pour répondre à ma demande. Conformément au RGPD, vous
              disposez d&apos;un droit d&apos;accès, de rectification et de
              suppression de vos données. <span aria-hidden="true">*</span>
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !formData.consent}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <div
                  className="w-4 h-4 border-2 border-border border-t-transparent rounded-full animate-spin mr-2"
                  role="img"
                  aria-label="Chargement en cours"
                />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" aria-hidden="true" />
                Envoyer le message
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
