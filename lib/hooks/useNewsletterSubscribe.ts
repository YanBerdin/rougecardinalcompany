"use client";

import { useState } from "react";

interface UseNewsletterSubscriptionReturn {
  email: string;
  isSubscribed: boolean;
  isLoading: boolean;
  isInitialLoading: boolean;
  errorMessage: string | null;
  handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  reset: () => void;
}

export function useNewsletterSubscribe({
  source = "website",
}: { source?: string } = {}): UseNewsletterSubscriptionReturn {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!email.trim()) {
      setErrorMessage("L'email est requis");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), consent: true, source }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'inscription");
      }

      if (data.status === "subscribed") {
        setIsSubscribed(true);
        setEmail("");
      }
    } catch (error) {
      console.error("Newsletter error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Erreur lors de l'inscription"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setEmail("");
    setIsSubscribed(false);
    setIsLoading(false);
    setErrorMessage(null);
  };

  return {
    email,
    isSubscribed,
    isLoading,
    isInitialLoading,
    errorMessage,
    handleEmailChange,
    handleSubmit,
    reset,
  };
}
