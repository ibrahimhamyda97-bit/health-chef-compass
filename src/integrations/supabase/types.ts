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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      cake_listings: {
        Row: {
          city: string
          country: string
          created_at: string
          description: string | null
          id: string
          photo_url: string
          price: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          city?: string
          country?: string
          created_at?: string
          description?: string | null
          id?: string
          photo_url: string
          price?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          description?: string | null
          id?: string
          photo_url?: string
          price?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cake_orders: {
        Row: {
          buyer_email: string
          buyer_name: string
          buyer_phone: string | null
          cake_listing_id: string
          created_at: string
          event_date: string | null
          id: string
          message: string | null
          servings: number | null
          status: string
        }
        Insert: {
          buyer_email: string
          buyer_name: string
          buyer_phone?: string | null
          cake_listing_id: string
          created_at?: string
          event_date?: string | null
          id?: string
          message?: string | null
          servings?: number | null
          status?: string
        }
        Update: {
          buyer_email?: string
          buyer_name?: string
          buyer_phone?: string | null
          cake_listing_id?: string
          created_at?: string
          event_date?: string | null
          id?: string
          message?: string | null
          servings?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "cake_orders_cake_listing_id_fkey"
            columns: ["cake_listing_id"]
            isOneToOne: false
            referencedRelation: "cake_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      chef_gallery_comments: {
        Row: {
          content: string
          created_at: string
          display_name: string | null
          id: string
          photo_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          display_name?: string | null
          id?: string
          photo_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          display_name?: string | null
          id?: string
          photo_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chef_gallery_likes: {
        Row: {
          created_at: string
          id: string
          photo_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          photo_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          photo_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chef_gallery_likes_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "chef_gallery_photos"
            referencedColumns: ["id"]
          },
        ]
      }
      chef_gallery_photos: {
        Row: {
          before_photo_url: string | null
          created_at: string
          display_name: string | null
          id: string
          is_challenge: boolean
          photo_url: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          before_photo_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_challenge?: boolean
          photo_url: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          before_photo_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_challenge?: boolean
          photo_url?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      event_cakes: {
        Row: {
          available: boolean
          base_price: number
          created_at: string
          description: string | null
          event_type: string
          id: string
          image_url: string | null
          name: string
          options: Json | null
          servings_max: number | null
          servings_min: number | null
          updated_at: string
        }
        Insert: {
          available?: boolean
          base_price?: number
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          image_url?: string | null
          name: string
          options?: Json | null
          servings_max?: number | null
          servings_min?: number | null
          updated_at?: string
        }
        Update: {
          available?: boolean
          base_price?: number
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          image_url?: string | null
          name?: string
          options?: Json | null
          servings_max?: number | null
          servings_min?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      live_sessions: {
        Row: {
          ended_at: string | null
          host_name: string
          host_user_id: string
          id: string
          is_active: boolean
          started_at: string
          title: string
          viewer_count: number
        }
        Insert: {
          ended_at?: string | null
          host_name: string
          host_user_id: string
          id?: string
          is_active?: boolean
          started_at?: string
          title: string
          viewer_count?: number
        }
        Update: {
          ended_at?: string | null
          host_name?: string
          host_user_id?: string
          id?: string
          is_active?: boolean
          started_at?: string
          title?: string
          viewer_count?: number
        }
        Relationships: []
      }
      monetization_settings: {
        Row: {
          feature_key: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          feature_key?: string | null
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
        }
        Update: {
          feature_key?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      pastry_courses: {
        Row: {
          content: string | null
          created_at: string
          description: string | null
          difficulty: string
          duration: string | null
          id: string
          image_url: string | null
          photos: Json | null
          published: boolean
          steps: Json | null
          title: string
          updated_at: string
          videos: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string
          duration?: string | null
          id?: string
          image_url?: string | null
          photos?: Json | null
          published?: boolean
          steps?: Json | null
          title: string
          updated_at?: string
          videos?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string
          duration?: string | null
          id?: string
          image_url?: string | null
          photos?: Json | null
          published?: boolean
          steps?: Json | null
          title?: string
          updated_at?: string
          videos?: Json | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
