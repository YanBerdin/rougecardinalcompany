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

// Note: ContactInfo and view prop interface removed; the view owns its internal state.
