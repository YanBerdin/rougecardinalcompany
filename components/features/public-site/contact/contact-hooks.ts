"use client";

import { useState } from 'react';
import { ContactFormData, ContactReason } from './contact-types';

export const contactReasons: ContactReason[] = [
  { value: "booking", label: "Réservation / Billetterie" },
  { value: "partnership", label: "Partenariat / Mécénat" },
  { value: "press", label: "Demande presse" },
  { value: "educational", label: "Action culturelle / Éducation" },
  { value: "technical", label: "Question technique" },
  { value: "other", label: "Autre" }
];

import { useEffect } from 'react';
import { useNewsletterSubscription } from '@/lib/hooks/useNewsletterSubscribe';

// supabase/schemas/10_tables_system.sql
// table public.abonnes_newsletter
export function useContact() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  // Newsletter (mutualisé via hook partagé)
  const {
    email: newsletterEmail,
    isSubscribed: isNewsletterSubscribed,
    isLoading: isNewsletterLoading,
    errorMessage: newsletterError,
    handleEmailChange: handleNewsletterEmailChange,
    handleSubmit: handleNewsletterSubmit,
  } = useNewsletterSubscription({ source: 'contact' });
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '', //TODO redondant avec reason
    reason: '',
    message: '',
    consent: false
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simuler un appel API (skeleton testing)
      await new Promise(resolve => setTimeout(resolve, 1500)); //TODO: remove

      // Envoyer les données à une API (Supabase, etc.)
      setIsSubmitted(true);
    } catch (error) {
      console.error("Erreur lors de l'envoi du formulaire", error);
    } finally {
      setIsLoading(false);
    }
  };

  // NB: on conserve `handleNewsletterSubmit` et `handleNewsletterEmailChange` exposés via le hook partagé

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // handlers newsletter déjà fournis via useNewsletterSubscription

  const resetForm = () => {
    setIsSubmitted(false);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      subject: '', //TODO redondant avec reason
      reason: '',
      message: '',
      consent: false
    });
  };

  return {
    isSubmitted,
    isLoading: isLoading || isNewsletterLoading,
    isInitialLoading,
    newsletterEmail,
    isNewsletterSubscribed,
    newsletterError,
    formData,
    contactReasons,
    handleSubmit,
    handleNewsletterSubmit,
    handleInputChange,
    handleNewsletterEmailChange,
    resetForm
  };
}
