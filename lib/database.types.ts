export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      abonnes_newsletter: {
        Row: {
          created_at: string
          email: string
          id: number
          metadata: Json | null
          subscribed: boolean | null
          subscribed_at: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: never
          metadata?: Json | null
          subscribed?: boolean | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: never
          metadata?: Json | null
          subscribed?: boolean | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          entity_id: number | null
          entity_type: string | null
          event_type: string
          id: number
          ip_address: string | null
          metadata: Json | null
          pathname: string | null
          search_query: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          entity_id?: number | null
          entity_type?: string | null
          event_type: string
          id?: never
          ip_address?: string | null
          metadata?: Json | null
          pathname?: string | null
          search_query?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: number | null
          entity_type?: string | null
          event_type?: string
          id?: never
          ip_address?: string | null
          metadata?: Json | null
          pathname?: string | null
          search_query?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      articles_categories: {
        Row: {
          article_id: number
          category_id: number
        }
        Insert: {
          article_id: number
          category_id: number
        }
        Update: {
          article_id?: number
          category_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "articles_categories_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles_presse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_categories_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles_presse_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      articles_medias: {
        Row: {
          article_id: number
          media_id: number
          ordre: number | null
        }
        Insert: {
          article_id: number
          media_id: number
          ordre?: number | null
        }
        Update: {
          article_id?: number
          media_id?: number
          ordre?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_medias_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles_presse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_medias_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles_presse_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_medias_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "medias"
            referencedColumns: ["id"]
          },
        ]
      }
      articles_presse: {
        Row: {
          author: string | null
          canonical_url: string | null
          chapo: string | null
          created_at: string
          excerpt: string | null
          id: number
          image_url: string | null
          keywords: string[] | null
          meta_description: string | null
          meta_title: string | null
          og_image_media_id: number | null
          published_at: string | null
          schema_type: string | null
          search_vector: unknown
          slug: string | null
          source_publication: string | null
          source_url: string | null
          title: string
          type: string | null
          updated_at: string
        }
        Insert: {
          author?: string | null
          canonical_url?: string | null
          chapo?: string | null
          created_at?: string
          excerpt?: string | null
          id?: never
          image_url?: string | null
          keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          og_image_media_id?: number | null
          published_at?: string | null
          schema_type?: string | null
          search_vector?: unknown
          slug?: string | null
          source_publication?: string | null
          source_url?: string | null
          title: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          author?: string | null
          canonical_url?: string | null
          chapo?: string | null
          created_at?: string
          excerpt?: string | null
          id?: never
          image_url?: string | null
          keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          og_image_media_id?: number | null
          published_at?: string | null
          schema_type?: string | null
          search_vector?: unknown
          slug?: string | null
          source_publication?: string | null
          source_url?: string | null
          title?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_presse_og_image_media_id_fkey"
            columns: ["og_image_media_id"]
            isOneToOne: false
            referencedRelation: "medias"
            referencedColumns: ["id"]
          },
        ]
      }
      articles_tags: {
        Row: {
          article_id: number
          tag_id: number
        }
        Insert: {
          article_id: number
          tag_id: number
        }
        Update: {
          article_id?: number
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "articles_tags_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles_presse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_tags_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles_presse_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "popular_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          display_order: number
          icon: string | null
          id: number
          is_active: boolean
          name: string
          parent_id: number | null
          slug: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: never
          is_active?: boolean
          name: string
          parent_id?: number | null
          slug: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: never
          is_active?: boolean
          name?: string
          parent_id?: number | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      communiques_categories: {
        Row: {
          category_id: number
          communique_id: number
        }
        Insert: {
          category_id: number
          communique_id: number
        }
        Update: {
          category_id?: number
          communique_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "communiques_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communiques_categories_communique_id_fkey"
            columns: ["communique_id"]
            isOneToOne: false
            referencedRelation: "communiques_presse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communiques_categories_communique_id_fkey"
            columns: ["communique_id"]
            isOneToOne: false
            referencedRelation: "communiques_presse_public"
            referencedColumns: ["id"]
          },
        ]
      }
      communiques_medias: {
        Row: {
          communique_id: number
          media_id: number
          ordre: number | null
        }
        Insert: {
          communique_id: number
          media_id: number
          ordre?: number | null
        }
        Update: {
          communique_id?: number
          media_id?: number
          ordre?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "communiques_medias_communique_id_fkey"
            columns: ["communique_id"]
            isOneToOne: false
            referencedRelation: "communiques_presse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communiques_medias_communique_id_fkey"
            columns: ["communique_id"]
            isOneToOne: false
            referencedRelation: "communiques_presse_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communiques_medias_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "medias"
            referencedColumns: ["id"]
          },
        ]
      }
      communiques_presse: {
        Row: {
          created_at: string
          created_by: string | null
          date_publication: string
          description: string | null
          evenement_id: number | null
          file_size_bytes: number | null
          id: number
          image_media_id: number | null
          image_url: string | null
          ordre_affichage: number | null
          public: boolean | null
          slug: string | null
          spectacle_id: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          date_publication: string
          description?: string | null
          evenement_id?: number | null
          file_size_bytes?: number | null
          id?: never
          image_media_id?: number | null
          image_url?: string | null
          ordre_affichage?: number | null
          public?: boolean | null
          slug?: string | null
          spectacle_id?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          date_publication?: string
          description?: string | null
          evenement_id?: number | null
          file_size_bytes?: number | null
          id?: never
          image_media_id?: number | null
          image_url?: string | null
          ordre_affichage?: number | null
          public?: boolean | null
          slug?: string | null
          spectacle_id?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "communiques_presse_evenement_id_fkey"
            columns: ["evenement_id"]
            isOneToOne: false
            referencedRelation: "evenements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communiques_presse_image_media_id_fkey"
            columns: ["image_media_id"]
            isOneToOne: false
            referencedRelation: "medias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communiques_presse_spectacle_id_fkey"
            columns: ["spectacle_id"]
            isOneToOne: false
            referencedRelation: "spectacles"
            referencedColumns: ["id"]
          },
        ]
      }
      communiques_tags: {
        Row: {
          communique_id: number
          tag_id: number
        }
        Insert: {
          communique_id: number
          tag_id: number
        }
        Update: {
          communique_id?: number
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "communiques_tags_communique_id_fkey"
            columns: ["communique_id"]
            isOneToOne: false
            referencedRelation: "communiques_presse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communiques_tags_communique_id_fkey"
            columns: ["communique_id"]
            isOneToOne: false
            referencedRelation: "communiques_presse_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communiques_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "popular_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communiques_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      compagnie_presentation_sections: {
        Row: {
          active: boolean
          content: string[] | null
          created_at: string
          id: number
          image_media_id: number | null
          image_url: string | null
          kind: string
          position: number
          quote_author: string | null
          quote_text: string | null
          slug: string
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          content?: string[] | null
          created_at?: string
          id?: never
          image_media_id?: number | null
          image_url?: string | null
          kind: string
          position?: number
          quote_author?: string | null
          quote_text?: string | null
          slug: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          content?: string[] | null
          created_at?: string
          id?: never
          image_media_id?: number | null
          image_url?: string | null
          kind?: string
          position?: number
          quote_author?: string | null
          quote_text?: string | null
          slug?: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compagnie_presentation_sections_image_media_id_fkey"
            columns: ["image_media_id"]
            isOneToOne: false
            referencedRelation: "medias"
            referencedColumns: ["id"]
          },
        ]
      }
      compagnie_stats: {
        Row: {
          active: boolean
          created_at: string
          id: number
          key: string
          label: string
          position: number
          updated_at: string
          value: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: never
          key: string
          label: string
          position?: number
          updated_at?: string
          value: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: never
          key?: string
          label?: string
          position?: number
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      compagnie_values: {
        Row: {
          active: boolean
          created_at: string
          description: string
          id: number
          key: string
          position: number
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description: string
          id?: never
          key: string
          position?: number
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string
          id?: never
          key?: string
          position?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      configurations_site: {
        Row: {
          category: string | null
          description: string | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          category?: string | null
          description?: string | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          category?: string | null
          description?: string | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      contacts_presse: {
        Row: {
          actif: boolean | null
          adresse: string | null
          created_at: string
          created_by: string | null
          derniere_interaction: string | null
          email: string
          fonction: string | null
          id: number
          media: string
          nom: string
          notes: string | null
          prenom: string | null
          specialites: string[] | null
          telephone: string | null
          updated_at: string
          ville: string | null
        }
        Insert: {
          actif?: boolean | null
          adresse?: string | null
          created_at?: string
          created_by?: string | null
          derniere_interaction?: string | null
          email: string
          fonction?: string | null
          id?: never
          media: string
          nom: string
          notes?: string | null
          prenom?: string | null
          specialites?: string[] | null
          telephone?: string | null
          updated_at?: string
          ville?: string | null
        }
        Update: {
          actif?: boolean | null
          adresse?: string | null
          created_at?: string
          created_by?: string | null
          derniere_interaction?: string | null
          email?: string
          fonction?: string | null
          id?: never
          media?: string
          nom?: string
          notes?: string | null
          prenom?: string | null
          specialites?: string[] | null
          telephone?: string | null
          updated_at?: string
          ville?: string | null
        }
        Relationships: []
      }
      content_versions: {
        Row: {
          change_summary: string | null
          change_type: string
          content_snapshot: Json
          created_at: string
          created_by: string | null
          entity_id: number
          entity_type: string
          id: number
          version_number: number
        }
        Insert: {
          change_summary?: string | null
          change_type: string
          content_snapshot: Json
          created_at?: string
          created_by?: string | null
          entity_id: number
          entity_type: string
          id?: never
          version_number: number
        }
        Update: {
          change_summary?: string | null
          change_type?: string
          content_snapshot?: Json
          created_at?: string
          created_by?: string | null
          entity_id?: number
          entity_type?: string
          id?: never
          version_number?: number
        }
        Relationships: []
      }
      data_retention_audit: {
        Row: {
          error_message: string | null
          executed_at: string
          execution_time_ms: number | null
          id: number
          metadata: Json | null
          rows_deleted: number
          status: string
          table_name: string
        }
        Insert: {
          error_message?: string | null
          executed_at?: string
          execution_time_ms?: number | null
          id?: never
          metadata?: Json | null
          rows_deleted?: number
          status: string
          table_name: string
        }
        Update: {
          error_message?: string | null
          executed_at?: string
          execution_time_ms?: number | null
          id?: never
          metadata?: Json | null
          rows_deleted?: number
          status?: string
          table_name?: string
        }
        Relationships: []
      }
      data_retention_config: {
        Row: {
          created_at: string
          date_column: string
          description: string | null
          enabled: boolean
          id: number
          last_run_at: string | null
          retention_days: number
          table_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_column: string
          description?: string | null
          enabled?: boolean
          id?: never
          last_run_at?: string | null
          retention_days: number
          table_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_column?: string
          description?: string | null
          enabled?: boolean
          id?: never
          last_run_at?: string | null
          retention_days?: number
          table_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      evenements: {
        Row: {
          capacity: number | null
          created_at: string
          date_debut: string
          date_fin: string | null
          end_time: string | null
          id: number
          image_url: string | null
          lieu_id: number | null
          metadata: Json | null
          parent_event_id: number | null
          price_cents: number | null
          recurrence_end_date: string | null
          recurrence_rule: string | null
          spectacle_id: number
          start_time: string | null
          status: string | null
          ticket_url: string | null
          type_array: string[] | null
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          date_debut: string
          date_fin?: string | null
          end_time?: string | null
          id?: never
          image_url?: string | null
          lieu_id?: number | null
          metadata?: Json | null
          parent_event_id?: number | null
          price_cents?: number | null
          recurrence_end_date?: string | null
          recurrence_rule?: string | null
          spectacle_id: number
          start_time?: string | null
          status?: string | null
          ticket_url?: string | null
          type_array?: string[] | null
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          created_at?: string
          date_debut?: string
          date_fin?: string | null
          end_time?: string | null
          id?: never
          image_url?: string | null
          lieu_id?: number | null
          metadata?: Json | null
          parent_event_id?: number | null
          price_cents?: number | null
          recurrence_end_date?: string | null
          recurrence_rule?: string | null
          spectacle_id?: number
          start_time?: string | null
          status?: string | null
          ticket_url?: string | null
          type_array?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "evenements_lieu_id_fkey"
            columns: ["lieu_id"]
            isOneToOne: false
            referencedRelation: "lieux"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evenements_parent_event_id_fkey"
            columns: ["parent_event_id"]
            isOneToOne: false
            referencedRelation: "evenements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evenements_spectacle_id_fkey"
            columns: ["spectacle_id"]
            isOneToOne: false
            referencedRelation: "spectacles"
            referencedColumns: ["id"]
          },
        ]
      }
      home_about_content: {
        Row: {
          active: boolean
          alt_text: string | null
          created_at: string
          id: number
          image_media_id: number | null
          image_url: string | null
          intro1: string
          intro2: string
          mission_text: string
          mission_title: string
          position: number
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          alt_text?: string | null
          created_at?: string
          id?: never
          image_media_id?: number | null
          image_url?: string | null
          intro1: string
          intro2: string
          mission_text: string
          mission_title: string
          position?: number
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          alt_text?: string | null
          created_at?: string
          id?: never
          image_media_id?: number | null
          image_url?: string | null
          intro1?: string
          intro2?: string
          mission_text?: string
          mission_title?: string
          position?: number
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "home_about_content_image_media_id_fkey"
            columns: ["image_media_id"]
            isOneToOne: false
            referencedRelation: "medias"
            referencedColumns: ["id"]
          },
        ]
      }
      home_hero_slides: {
        Row: {
          active: boolean
          alt_text: string
          created_at: string
          cta_primary_enabled: boolean
          cta_primary_label: string | null
          cta_primary_url: string | null
          cta_secondary_enabled: boolean
          cta_secondary_label: string | null
          cta_secondary_url: string | null
          description: string | null
          ends_at: string | null
          id: number
          image_media_id: number | null
          image_url: string | null
          position: number
          slug: string
          starts_at: string | null
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          alt_text?: string
          created_at?: string
          cta_primary_enabled?: boolean
          cta_primary_label?: string | null
          cta_primary_url?: string | null
          cta_secondary_enabled?: boolean
          cta_secondary_label?: string | null
          cta_secondary_url?: string | null
          description?: string | null
          ends_at?: string | null
          id?: never
          image_media_id?: number | null
          image_url?: string | null
          position?: number
          slug: string
          starts_at?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          alt_text?: string
          created_at?: string
          cta_primary_enabled?: boolean
          cta_primary_label?: string | null
          cta_primary_url?: string | null
          cta_secondary_enabled?: boolean
          cta_secondary_label?: string | null
          cta_secondary_url?: string | null
          description?: string | null
          ends_at?: string | null
          id?: never
          image_media_id?: number | null
          image_url?: string | null
          position?: number
          slug?: string
          starts_at?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "home_hero_slides_image_media_id_fkey"
            columns: ["image_media_id"]
            isOneToOne: false
            referencedRelation: "medias"
            referencedColumns: ["id"]
          },
        ]
      }
      lieux: {
        Row: {
          adresse: string | null
          capacite: number | null
          code_postal: string | null
          created_at: string
          id: number
          latitude: number | null
          longitude: number | null
          metadata: Json | null
          nom: string
          pays: string | null
          updated_at: string
          ville: string | null
        }
        Insert: {
          adresse?: string | null
          capacite?: number | null
          code_postal?: string | null
          created_at?: string
          id?: never
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          nom: string
          pays?: string | null
          updated_at?: string
          ville?: string | null
        }
        Update: {
          adresse?: string | null
          capacite?: number | null
          code_postal?: string | null
          created_at?: string
          id?: never
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          nom?: string
          pays?: string | null
          updated_at?: string
          ville?: string | null
        }
        Relationships: []
      }
      logs_audit: {
        Row: {
          action: string
          created_at: string
          expires_at: string | null
          id: number
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          expires_at?: string | null
          id?: number
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          expires_at?: string | null
          id?: number
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      media_folders: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
          parent_id: number | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: never
          name: string
          parent_id?: number | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: never
          name?: string
          parent_id?: number | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "media_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      media_item_tags: {
        Row: {
          created_at: string
          media_id: number
          tag_id: number
        }
        Insert: {
          created_at?: string
          media_id: number
          tag_id: number
        }
        Update: {
          created_at?: string
          media_id?: number
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "media_item_tags_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "medias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_item_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "media_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      media_tags: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: number
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: never
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: never
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      medias: {
        Row: {
          alt_text: string | null
          created_at: string
          file_hash: string | null
          filename: string | null
          folder_id: number | null
          id: number
          metadata: Json | null
          mime: string | null
          size_bytes: number | null
          storage_path: string
          thumbnail_path: string | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          file_hash?: string | null
          filename?: string | null
          folder_id?: number | null
          id?: never
          metadata?: Json | null
          mime?: string | null
          size_bytes?: number | null
          storage_path: string
          thumbnail_path?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          file_hash?: string | null
          filename?: string | null
          folder_id?: number | null
          id?: never
          metadata?: Json | null
          mime?: string | null
          size_bytes?: number | null
          storage_path?: string
          thumbnail_path?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medias_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "media_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      membres_equipe: {
        Row: {
          active: boolean | null
          created_at: string
          description: string | null
          id: number
          image_url: string | null
          name: string
          ordre: number | null
          photo_media_id: number | null
          role: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          id?: never
          image_url?: string | null
          name: string
          ordre?: number | null
          photo_media_id?: number | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          id?: never
          image_url?: string | null
          name?: string
          ordre?: number | null
          photo_media_id?: number | null
          role?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "membres_equipe_photo_media_id_fkey"
            columns: ["photo_media_id"]
            isOneToOne: false
            referencedRelation: "medias"
            referencedColumns: ["id"]
          },
        ]
      }
      messages_contact: {
        Row: {
          consent: boolean | null
          consent_at: string | null
          contact_presse_id: number | null
          created_at: string
          email: string
          firstname: string | null
          id: number
          lastname: string | null
          message: string
          metadata: Json | null
          phone: string | null
          processed: boolean | null
          processed_at: string | null
          reason: string
          spam_score: number | null
          status: string
        }
        Insert: {
          consent?: boolean | null
          consent_at?: string | null
          contact_presse_id?: number | null
          created_at?: string
          email: string
          firstname?: string | null
          id?: never
          lastname?: string | null
          message: string
          metadata?: Json | null
          phone?: string | null
          processed?: boolean | null
          processed_at?: string | null
          reason: string
          spam_score?: number | null
          status?: string
        }
        Update: {
          consent?: boolean | null
          consent_at?: string | null
          contact_presse_id?: number | null
          created_at?: string
          email?: string
          firstname?: string | null
          id?: never
          lastname?: string | null
          message?: string
          metadata?: Json | null
          phone?: string | null
          processed?: boolean | null
          processed_at?: string | null
          reason?: string
          spam_score?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_contact_contact_presse_id_fkey"
            columns: ["contact_presse_id"]
            isOneToOne: false
            referencedRelation: "contacts_presse"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          display_order: number
          id: number
          is_active: boolean
          logo_media_id: number | null
          logo_url: string | null
          name: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          id?: never
          is_active?: boolean
          logo_media_id?: number | null
          logo_url?: string | null
          name: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          id?: never
          is_active?: boolean
          logo_media_id?: number | null
          logo_url?: string | null
          name?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partners_logo_media_id_fkey"
            columns: ["logo_media_id"]
            isOneToOne: false
            referencedRelation: "medias"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_invitations: {
        Row: {
          attempts: number | null
          created_at: string | null
          email: string
          id: string
          invitation_url: string
          last_error: string | null
          max_attempts: number | null
          metadata: Json | null
          next_retry_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          email: string
          id?: string
          invitation_url: string
          last_error?: string | null
          max_attempts?: number | null
          metadata?: Json | null
          next_retry_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          email?: string
          id?: string
          invitation_url?: string
          last_error?: string | null
          max_attempts?: number | null
          metadata?: Json | null
          next_retry_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_media_id: number | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: number
          metadata: Json | null
          role: string | null
          slug: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_media_id?: number | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: never
          metadata?: Json | null
          role?: string | null
          slug?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_media_id?: number | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: never
          metadata?: Json | null
          role?: string | null
          slug?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      seo_redirects: {
        Row: {
          created_at: string
          created_by: string | null
          hit_count: number
          id: number
          is_active: boolean
          last_hit_at: string | null
          new_path: string
          old_path: string
          redirect_type: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          hit_count?: number
          id?: never
          is_active?: boolean
          last_hit_at?: string | null
          new_path: string
          old_path: string
          redirect_type?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          hit_count?: number
          id?: never
          is_active?: boolean
          last_hit_at?: string | null
          new_path?: string
          old_path?: string
          redirect_type?: number
          updated_at?: string
        }
        Relationships: []
      }
      sitemap_entries: {
        Row: {
          change_frequency: string | null
          created_at: string
          entity_id: number | null
          entity_type: string | null
          id: number
          is_indexed: boolean
          last_modified: string
          priority: number | null
          updated_at: string
          url: string
        }
        Insert: {
          change_frequency?: string | null
          created_at?: string
          entity_id?: number | null
          entity_type?: string | null
          id?: never
          is_indexed?: boolean
          last_modified?: string
          priority?: number | null
          updated_at?: string
          url: string
        }
        Update: {
          change_frequency?: string | null
          created_at?: string
          entity_id?: number | null
          entity_type?: string | null
          id?: never
          is_indexed?: boolean
          last_modified?: string
          priority?: number | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      spectacles: {
        Row: {
          awards: string[] | null
          canonical_url: string | null
          casting: number | null
          created_at: string
          created_by: string | null
          description: string | null
          duration_minutes: number | null
          genre: string | null
          id: number
          image_url: string | null
          meta_description: string | null
          meta_title: string | null
          og_image_media_id: number | null
          paragraph_2: string | null
          paragraph_3: string | null
          premiere: string | null
          public: boolean | null
          schema_type: string | null
          search_vector: unknown
          short_description: string | null
          slug: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          awards?: string[] | null
          canonical_url?: string | null
          casting?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          genre?: string | null
          id?: never
          image_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          og_image_media_id?: number | null
          paragraph_2?: string | null
          paragraph_3?: string | null
          premiere?: string | null
          public?: boolean | null
          schema_type?: string | null
          search_vector?: unknown
          short_description?: string | null
          slug?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          awards?: string[] | null
          canonical_url?: string | null
          casting?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          genre?: string | null
          id?: never
          image_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          og_image_media_id?: number | null
          paragraph_2?: string | null
          paragraph_3?: string | null
          premiere?: string | null
          public?: boolean | null
          schema_type?: string | null
          search_vector?: unknown
          short_description?: string | null
          slug?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "spectacles_og_image_media_id_fkey"
            columns: ["og_image_media_id"]
            isOneToOne: false
            referencedRelation: "medias"
            referencedColumns: ["id"]
          },
        ]
      }
      spectacles_categories: {
        Row: {
          category_id: number
          spectacle_id: number
        }
        Insert: {
          category_id: number
          spectacle_id: number
        }
        Update: {
          category_id?: number
          spectacle_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "spectacles_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spectacles_categories_spectacle_id_fkey"
            columns: ["spectacle_id"]
            isOneToOne: false
            referencedRelation: "spectacles"
            referencedColumns: ["id"]
          },
        ]
      }
      spectacles_medias: {
        Row: {
          media_id: number
          ordre: number | null
          spectacle_id: number
          type: string
        }
        Insert: {
          media_id: number
          ordre?: number | null
          spectacle_id: number
          type?: string
        }
        Update: {
          media_id?: number
          ordre?: number | null
          spectacle_id?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "spectacles_medias_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "medias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spectacles_medias_spectacle_id_fkey"
            columns: ["spectacle_id"]
            isOneToOne: false
            referencedRelation: "spectacles"
            referencedColumns: ["id"]
          },
        ]
      }
      spectacles_membres_equipe: {
        Row: {
          membre_id: number
          role: string | null
          spectacle_id: number
        }
        Insert: {
          membre_id: number
          role?: string | null
          spectacle_id: number
        }
        Update: {
          membre_id?: number
          role?: string | null
          spectacle_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "spectacles_membres_equipe_membre_id_fkey"
            columns: ["membre_id"]
            isOneToOne: false
            referencedRelation: "membres_equipe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spectacles_membres_equipe_membre_id_fkey"
            columns: ["membre_id"]
            isOneToOne: false
            referencedRelation: "membres_equipe_admin"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spectacles_membres_equipe_spectacle_id_fkey"
            columns: ["spectacle_id"]
            isOneToOne: false
            referencedRelation: "spectacles"
            referencedColumns: ["id"]
          },
        ]
      }
      spectacles_tags: {
        Row: {
          spectacle_id: number
          tag_id: number
        }
        Insert: {
          spectacle_id: number
          tag_id: number
        }
        Update: {
          spectacle_id?: number
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "spectacles_tags_spectacle_id_fkey"
            columns: ["spectacle_id"]
            isOneToOne: false
            referencedRelation: "spectacles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spectacles_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "popular_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spectacles_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: number
          is_featured: boolean
          name: string
          slug: string
          updated_at: string
          usage_count: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: never
          is_featured?: boolean
          name: string
          slug: string
          updated_at?: string
          usage_count?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: never
          is_featured?: boolean
          name?: string
          slug?: string
          updated_at?: string
          usage_count?: number
        }
        Relationships: []
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          id: string
          invited_by: string
          role: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          id?: string
          invited_by: string
          role: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          id?: string
          invited_by?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      analytics_summary: {
        Row: {
          entity_type: string | null
          event_date: string | null
          event_type: string | null
          total_events: number | null
          unique_sessions: number | null
          unique_users: number | null
        }
        Relationships: []
      }
      analytics_summary_90d: {
        Row: {
          entity_type: string | null
          event_date: string | null
          event_type: string | null
          total_events: number | null
          unique_sessions: number | null
          unique_users: number | null
        }
        Relationships: []
      }
      articles_presse_public: {
        Row: {
          author: string | null
          chapo: string | null
          created_at: string | null
          excerpt: string | null
          id: number | null
          published_at: string | null
          slug: string | null
          source_publication: string | null
          source_url: string | null
          title: string | null
          type: string | null
        }
        Insert: {
          author?: string | null
          chapo?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: number | null
          published_at?: string | null
          slug?: string | null
          source_publication?: string | null
          source_url?: string | null
          title?: string | null
          type?: string | null
        }
        Update: {
          author?: string | null
          chapo?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: number | null
          published_at?: string | null
          slug?: string | null
          source_publication?: string | null
          source_url?: string | null
          title?: string | null
          type?: string | null
        }
        Relationships: []
      }
      categories_hierarchy: {
        Row: {
          full_path: string | null
          id: number | null
          level: number | null
          name: string | null
          parent_id: number | null
          path: number[] | null
          slug: string | null
        }
        Relationships: []
      }
      communiques_presse_public: {
        Row: {
          categories: string[] | null
          date_publication: string | null
          description: string | null
          evenement_date: string | null
          evenement_id: number | null
          file_size_bytes: number | null
          file_size_display: string | null
          file_url: string | null
          id: number | null
          image_file_url: string | null
          image_filename: string | null
          image_ordre: number | null
          image_path: string | null
          image_url: string | null
          lieu_nom: string | null
          ordre_affichage: number | null
          pdf_filename: string | null
          pdf_path: string | null
          slug: string | null
          spectacle_id: number | null
          spectacle_titre: string | null
          tags: string[] | null
          title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communiques_presse_evenement_id_fkey"
            columns: ["evenement_id"]
            isOneToOne: false
            referencedRelation: "evenements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communiques_presse_spectacle_id_fkey"
            columns: ["spectacle_id"]
            isOneToOne: false
            referencedRelation: "spectacles"
            referencedColumns: ["id"]
          },
        ]
      }
      compagnie_presentation_sections_admin: {
        Row: {
          active: boolean | null
          content: string[] | null
          created_at: string | null
          id: number | null
          image_media_id: number | null
          image_url: string | null
          kind: string | null
          last_change_type: string | null
          last_version_created_at: string | null
          last_version_number: number | null
          position: number | null
          quote_author: string | null
          quote_text: string | null
          slug: string | null
          subtitle: string | null
          title: string | null
          total_versions: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compagnie_presentation_sections_image_media_id_fkey"
            columns: ["image_media_id"]
            isOneToOne: false
            referencedRelation: "medias"
            referencedColumns: ["id"]
          },
        ]
      }
      content_versions_detailed: {
        Row: {
          change_summary: string | null
          change_type: string | null
          created_at: string | null
          created_by_id: string | null
          created_by_name: string | null
          entity_id: number | null
          entity_type: string | null
          id: number | null
          snapshot_size: number | null
          version_number: number | null
        }
        Relationships: []
      }
      data_retention_monitoring: {
        Row: {
          config_created_at: string | null
          config_updated_at: string | null
          date_column: string | null
          description: string | null
          enabled: boolean | null
          health_status: string | null
          id: number | null
          last_deleted_count: number | null
          last_error: string | null
          last_execution: string | null
          last_execution_ms: number | null
          last_metadata: Json | null
          last_run_at: string | null
          last_status: string | null
          next_run_estimated: string | null
          retention_days: number | null
          table_name: string | null
        }
        Relationships: []
      }
      data_retention_recent_audit: {
        Row: {
          error_message: string | null
          executed_at: string | null
          execution_time_ms: number | null
          id: number | null
          metadata: Json | null
          rows_deleted: number | null
          status: string | null
          table_name: string | null
          time_ago: string | null
        }
        Relationships: []
      }
      data_retention_stats: {
        Row: {
          avg_execution_ms: number | null
          executions_24h: number | null
          executions_30d: number | null
          executions_7d: number | null
          last_executed_at: string | null
          max_execution_ms: number | null
          rows_deleted_24h: number | null
          rows_deleted_30d: number | null
          rows_deleted_7d: number | null
          success_rate_pct: number | null
          table_name: string | null
        }
        Relationships: []
      }
      membres_equipe_admin: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          id: number | null
          image_url: string | null
          last_change_type: string | null
          last_version_created_at: string | null
          last_version_number: number | null
          name: string | null
          ordre: number | null
          photo_media_id: number | null
          role: string | null
          total_versions: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "membres_equipe_photo_media_id_fkey"
            columns: ["photo_media_id"]
            isOneToOne: false
            referencedRelation: "medias"
            referencedColumns: ["id"]
          },
        ]
      }
      messages_contact_admin: {
        Row: {
          age: unknown
          consent: boolean | null
          consent_at: string | null
          contact_presse_email: string | null
          contact_presse_id: number | null
          contact_presse_nom: string | null
          created_at: string | null
          email: string | null
          firstname: string | null
          full_name: string | null
          id: number | null
          lastname: string | null
          message: string | null
          metadata: Json | null
          phone: string | null
          processed: boolean | null
          processed_at: string | null
          processing_latency: unknown
          reason: string | null
          spam_score: number | null
          status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_contact_contact_presse_id_fkey"
            columns: ["contact_presse_id"]
            isOneToOne: false
            referencedRelation: "contacts_presse"
            referencedColumns: ["id"]
          },
        ]
      }
      partners_admin: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          display_order: number | null
          id: number | null
          is_active: boolean | null
          last_change_type: string | null
          last_version_created_at: string | null
          last_version_number: number | null
          logo_media_id: number | null
          logo_url: string | null
          name: string | null
          updated_at: string | null
          website_url: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partners_logo_media_id_fkey"
            columns: ["logo_media_id"]
            isOneToOne: false
            referencedRelation: "medias"
            referencedColumns: ["id"]
          },
        ]
      }
      popular_tags: {
        Row: {
          created_at: string | null
          id: number | null
          is_featured: boolean | null
          name: string | null
          slug: string | null
          usage_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: number | null
          is_featured?: boolean | null
          name?: string | null
          slug?: string | null
          usage_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: number | null
          is_featured?: boolean | null
          name?: string | null
          slug?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      spectacles_landscape_photos_admin: {
        Row: {
          alt_text: string | null
          created_at: string | null
          media_id: number | null
          mime: string | null
          ordre: number | null
          spectacle_id: number | null
          storage_path: string | null
          type: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spectacles_medias_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "medias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spectacles_medias_spectacle_id_fkey"
            columns: ["spectacle_id"]
            isOneToOne: false
            referencedRelation: "spectacles"
            referencedColumns: ["id"]
          },
        ]
      }
      spectacles_landscape_photos_public: {
        Row: {
          alt_text: string | null
          media_id: number | null
          ordre: number | null
          spectacle_id: number | null
          storage_path: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spectacles_medias_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "medias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spectacles_medias_spectacle_id_fkey"
            columns: ["spectacle_id"]
            isOneToOne: false
            referencedRelation: "spectacles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      check_retention_health: {
        Args: never
        Returns: {
          issue: string
          severity: string
          table_name: string
        }[]
      }
      cleanup_expired_audit_logs: { Args: never; Returns: number }
      cleanup_expired_data: { Args: { p_table_name: string }; Returns: Json }
      cleanup_old_contact_messages: { Args: never; Returns: Json }
      cleanup_unsubscribed_newsletter: { Args: never; Returns: Json }
      communiques_presse_dashboard: {
        Args: never
        Returns: {
          created_at: string
          createur: string
          date_publication: string
          description: string
          evenement_date: string
          id: number
          image_filename: string
          image_url: string
          nb_categories: number
          nb_tags: number
          ordre_affichage: number
          pdf_filename: string
          pdf_size_kb: number
          public: boolean
          slug: string
          spectacle_titre: string
          title: string
          updated_at: string
        }[]
      }
      create_content_version: {
        Args: {
          p_change_summary?: string
          p_change_type?: string
          p_content_snapshot: Json
          p_entity_id: number
          p_entity_type: string
        }
        Returns: number
      }
      extract_folder_from_path: {
        Args: { storage_path: string }
        Returns: string
      }
      generate_slug: { Args: { input_text: string }; Returns: string }
      get_audit_logs_with_email: {
        Args: {
          p_action?: string
          p_date_from?: string
          p_date_to?: string
          p_limit?: number
          p_page?: number
          p_search?: string
          p_table_name?: string
          p_user_id?: string
        }
        Returns: {
          action: string
          created_at: string
          expires_at: string
          id: number
          ip_address: unknown
          new_values: Json
          old_values: Json
          record_id: string
          table_name: string
          total_count: number
          user_agent: string
          user_email: string
          user_id: string
        }[]
      }
      get_current_timestamp: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      reorder_hero_slides: { Args: { order_data: Json }; Returns: undefined }
      reorder_team_members: { Args: { items: Json }; Returns: undefined }
      restore_content_version: {
        Args: { p_change_summary?: string; p_version_id: number }
        Returns: boolean
      }
      to_tsvector_french: { Args: { "": string }; Returns: unknown }
      track_analytics_event: {
        Args: { p_event_type: string; p_metadata?: Json }
        Returns: number
      }
      validate_communique_creation: {
        Args: { p_communique_id: number }
        Returns: boolean
      }
      validate_rrule: { Args: { rule: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
