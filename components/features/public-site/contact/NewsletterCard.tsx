"use client";

import { CheckCircle, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNewsletterSubscribe } from "@/lib/hooks/useNewsletterSubscribe";

const NEWSLETTER_SOURCE = "contact";

export function NewsletterCard(): React.JSX.Element {
  const {
    email,
    isSubscribed,
    isLoading,
    errorMessage,
    handleEmailChange,
    handleSubmit,
  } = useNewsletterSubscribe({ source: NEWSLETTER_SOURCE });

  if (isSubscribed) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-green-700" role="status">
            <CheckCircle className="h-5 w-5" aria-hidden="true" />
            <p className="font-medium">Merci pour votre inscription !</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Newsletter</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Recevez nos actualités et programmation
        </p>
        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          <label htmlFor="newsletter-email-contact" className="sr-only">
            Adresse email pour la newsletter
          </label>
          <Input
            id="newsletter-email-contact"
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={handleEmailChange}
            aria-required="true"
            aria-invalid={errorMessage ? "true" : undefined}
            aria-describedby={errorMessage ? "newsletter-error-contact" : undefined}
            autoComplete="email"
          />
          {errorMessage && (
            <p
              id="newsletter-error-contact"
              className="text-sm text-destructive"
              role="alert"
            >
              {errorMessage}
            </p>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            <Send className="h-4 w-4 mr-2" aria-hidden="true" />
            {isLoading ? "Inscription…" : "S'inscrire"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
