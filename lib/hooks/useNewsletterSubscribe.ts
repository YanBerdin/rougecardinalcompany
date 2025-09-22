"use client";

import { useState } from 'react';

interface UseNewsletterSubscriptionOptions {
  source?: string;
}

export function useNewsletterSubscription(options: UseNewsletterSubscriptionOptions = {}) {
  const { source = 'home' } = options;

  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, consent: true, source })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Subscription failed');
      }

      const data = await res.json();
      if (data?.status === 'subscribed' || data?.status === 'already_subscribed') {
        setIsSubscribed(true);
        setEmail('');
      } else {
        setErrorMessage('Une erreur est survenue. Veuillez réessayer.');
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription à la newsletter", error);
      setErrorMessage("Impossible d'inscrire cet email pour le moment.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    isSubscribed,
    isLoading,
    isInitialLoading,
    errorMessage,
    handleEmailChange,
    handleSubmit,
  };
}
