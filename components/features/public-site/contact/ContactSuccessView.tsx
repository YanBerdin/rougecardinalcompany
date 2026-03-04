"use client";

import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContactSuccessViewProps {
  onReset: () => void;
}

export function ContactSuccessView({ onReset }: ContactSuccessViewProps): React.JSX.Element {
  return (
    <div className="pt-16 min-h-screen flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in" role="status">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" aria-hidden="true" />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-sans mb-4">
            Message Envoyé !
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-6">
            Merci pour votre message. Nous vous répondrons dans les plus brefs
            délais.
          </p>
          <p className="text-md md:text-lg lg:text-xl text-muted-foreground mb-8">
            Un accusé de réception a été envoyé à votre adresse email.
          </p>
          <Button onClick={onReset}>Envoyer un autre message</Button>
        </div>
      </div>
    </div>
  );
}
