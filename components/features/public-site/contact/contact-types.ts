export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  // subject: string; // TODO redundant with reason
  reason: string;
  message: string;
  consent: boolean;
}
//? TODO redundant with reason ? 
// //TODO: redundant with ContactFormData --- IGNORE ---
export interface ContactReason {
  value: string;
  label: string;
}

// Note: ContactInfo and view prop interface removed; the view owns its internal state.
