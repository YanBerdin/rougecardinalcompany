import type { ContactReason } from "@/lib/schemas/contact";

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  reason: ContactReason | "";
  message: string;
  consent: boolean;
}

export interface ContactReasonOption {
  value: ContactReason;
  label: string;
}
