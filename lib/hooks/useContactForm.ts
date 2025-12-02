"use client";

import { useState } from "react";
import type { ContactEmailInput } from "@/lib/schemas/contact";

// Alias for backward compatibility
type ContactMessage = ContactEmailInput;

interface UseContactFormReturn {
  formData: Partial<ContactMessage>;
  isSubmitting: boolean;
  isSubmitted: boolean;
  errorMessage: string | null;
  updateField: (field: keyof ContactMessage, value: string | boolean) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  reset: () => void;
}

export function useContactForm(): UseContactFormReturn {
  const [formData, setFormData] = useState<Partial<ContactMessage>>({
    name: "",
    email: "",
    subject: "",
    message: "",
    phone: "",
    reason: "",
    consent: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateField = (
    field: keyof ContactMessage,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (
      !formData.name?.trim() ||
      !formData.email?.trim() ||
      !formData.subject?.trim() ||
      !formData.message?.trim()
    ) {
      setErrorMessage("Tous les champs obligatoires doivent être remplis");
      return;
    }

    if (!formData.consent) {
      setErrorMessage("Vous devez accepter les conditions");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'envoi");
      }

      if (data.success) {
        setIsSubmitted(true);
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
          phone: "",
          reason: "",
          consent: false,
        });
      }
    } catch (error) {
      console.error("Contact form error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Erreur lors de l'envoi"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
      phone: "",
      reason: "",
      consent: false,
    });
    setIsSubmitting(false);
    setIsSubmitted(false);
    setErrorMessage(null);
  };

  return {
    formData,
    isSubmitting,
    isSubmitted,
    errorMessage,
    updateField,
    handleSubmit,
    reset,
  };
}
