"use client";

import { useState, useEffect } from 'react';

export function useNewsletter() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => { //TODO: remove 
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simuler un appel API pour l'inscription à la newsletter
      await new Promise(resolve => setTimeout(resolve, 1000)); //TODO: remove
      
      // Dans un cas réel, nous enverrions les données à Supabase ou une autre API
      setIsSubscribed(true);
      setEmail('');
    } catch (error) {
      console.error("Erreur lors de l'inscription à la newsletter", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    isSubscribed,
    isLoading,
    isInitialLoading,
    handleEmailChange,
    handleSubmit
  };
}
