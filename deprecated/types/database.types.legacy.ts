export interface Database {
  public: {
    Tables: {
      abonnes_newsletter: {
        Row: {
          id: number;
          email: string;
          subscribed: boolean;
          subscribed_at: string | null;
          unsubscribed_at: string | null;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          email: string;
          subscribed?: boolean;
          subscribed_at?: string | null;
          unsubscribed_at?: string | null;
            metadata?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          email?: string;
          subscribed?: boolean;
          subscribed_at?: string | null;
          unsubscribed_at?: string | null;
            metadata?: Record<string, unknown> | null;
          created_at?: string;
        };
      };
      messages_contact: {
        Row: {
          id: number;
          firstname: string | null;
          lastname: string | null;
          email: string;
          phone: string | null;
          reason: string;
          message: string;
          consent: boolean;
          consent_at: string | null;
          status: string;
          processed: boolean;
          processed_at: string | null;
          spam_score: number | null;
            metadata: Record<string, unknown> | null;
          contact_presse_id: number | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          firstname?: string | null;
          lastname?: string | null;
          email: string;
          phone?: string | null;
          reason: string;
          message: string;
          consent?: boolean;
          consent_at?: string | null;
          status?: string;
          processed?: boolean;
          processed_at?: string | null;
          spam_score?: number | null;
            metadata?: Record<string, unknown> | null;
          contact_presse_id?: number | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          firstname?: string | null;
          lastname?: string | null;
          email?: string;
          phone?: string | null;
          reason?: string;
          message?: string;
          consent?: boolean;
          consent_at?: string | null;
          status?: string;
          processed?: boolean;
          processed_at?: string | null;
          spam_score?: number | null;
            metadata?: Record<string, unknown> | null;
          contact_presse_id?: number | null;
          created_at?: string;
        };
      };
    };
  };
}
