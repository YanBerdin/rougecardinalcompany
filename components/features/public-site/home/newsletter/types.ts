export interface NewsletterFormProps {
  email: string;
  isLoading: boolean;
  isSubscribed: boolean;
  errorMessage?: string | null;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export interface NewsletterViewProps {
  isSubscribed: boolean;
  isInitialLoading: boolean;
  email: string;
  isLoading: boolean;
  errorMessage?: string | null;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  children?: React.ReactNode;
}
