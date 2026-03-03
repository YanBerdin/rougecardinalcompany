/** NewsletterForm reads its data from NewsletterContext — no props needed. */
export type NewsletterFormProps = Record<string, never>;

export interface NewsletterViewProps {
  isSubscribed: boolean;
  isInitialLoading: boolean;
  errorMessage: string | null;
  children?: React.ReactNode;
}
