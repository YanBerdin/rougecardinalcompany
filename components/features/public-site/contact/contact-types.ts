import { LucideIcon } from 'lucide-react';

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  reason: string;
  message: string;
  consent: boolean;
}

export interface ContactReason {
  value: string;
  label: string;
}

export interface ContactInfo {
  icon: LucideIcon;
  title: string;
  content: React.ReactNode;
}

export interface ContactPageProps {
  isSubmitted: boolean;
  isLoading: boolean;
  isInitialLoading: boolean;
  isNewsletterSubscribed: boolean;
  newsletterEmail: string;
  newsletterError?: string | null;
  formData: ContactFormData;
  contactReasons: ContactReason[];
  onFormSubmit: (e: React.FormEvent) => void;
  onNewsletterSubmit: (e: React.FormEvent) => void;
  onResetForm: () => void;
  onInputChange: (field: string, value: string | boolean) => void;
  onNewsletterEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
