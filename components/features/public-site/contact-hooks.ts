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

export function useContact() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isNewsletterSubscribed, setIsNewsletterSubscribed] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    reason: '',
    message: '',
    consent: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Dans un cas réel, on enverrait les données à une API (Supabase, etc.)
      setIsSubmitted(true);
    } catch (error) {
      console.error("Erreur lors de l'envoi du formulaire", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dans un cas réel, on enverrait les données à une API
      setIsNewsletterSubscribed(true);
      setNewsletterEmail('');
    } catch (error) {
      console.error("Erreur lors de l'inscription à la newsletter", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNewsletterEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewsletterEmail(e.target.value);
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      subject: '',
      reason: '',
      message: '',
      consent: false
    });
  };

  return {
    isSubmitted,
    isLoading,
    newsletterEmail,
    isNewsletterSubscribed,
    formData,
    contactReasons,
    handleSubmit,
    handleNewsletterSubmit,
    handleInputChange,
    handleNewsletterEmailChange,
    resetForm
  };
}
