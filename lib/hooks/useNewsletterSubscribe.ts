"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

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
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!email.trim()) {
      setErrorMessage("L'email est requis");
      toast.error("Email requis", {
        description: "Veuillez saisir une adresse email valide.",
      });
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

      if (!isMountedRef.current) return;

      if (data.data?.status === "subscribed") {
        setIsSubscribed(true);
        setEmail("");
        
        // Vérifier si l'email de confirmation a échoué
        if (data.data.warning) {
          toast.warning("Inscription enregistrée", {
            description: "Votre inscription a été enregistrée, mais l'email de confirmation n'a pas pu être envoyé. Vous recevrez nos actualités dès que notre système sera configuré.",
            duration: 7000,
          });
        } else {
          toast.success("Inscription réussie !", {
            description: "Vous recevrez bientôt nos actualités et invitations privilégiées.",
            duration: 5000,
          });
        }
      }
    } catch (error) {
      console.error("Newsletter error:", error);
      const errorMsg = error instanceof Error ? error.message : "Erreur lors de l'inscription";
      
      if (!isMountedRef.current) return;
      
      setErrorMessage(errorMsg);
      toast.error("Échec de l'inscription", {
        description: errorMsg,
        duration: 5000,
      });
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const reset = () => {
    setEmail("");
    setIsSubscribed(false);
    setIsLoading(false);
    setIsInitialLoading(false);
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
