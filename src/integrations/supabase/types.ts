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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          created_at: string
          customer_id: string
          end_date: string | null
          id: string
          monthly_rate_pence: number
          start_date: string
          status: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          end_date?: string | null
          id?: string
          monthly_rate_pence: number
          start_date: string
          status?: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          end_date?: string | null
          id?: string
          monthly_rate_pence?: number
          start_date?: string
          status?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      facilities: {
        Row: {
          address: string
          created_at: string
          description: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          postcode: string
          provider_id: string
          subdomain: string | null
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          postcode: string
          provider_id: string
          subdomain?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          postcode?: string
          provider_id?: string
          subdomain?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "facilities_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      facilities_public_marketing: {
        Row: {
          address: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          postcode: string
          updated_at: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          description?: string | null
          id: string
          name: string
          postcode: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          postcode?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      integrations: {
        Row: {
          api_key_encrypted: string | null
          created_at: string
          id: string
          last_tested_at: string | null
          provider_id: string
          service_id: string
          service_name: string
          settings: Json | null
          status: string
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          api_key_encrypted?: string | null
          created_at?: string
          id?: string
          last_tested_at?: string | null
          provider_id: string
          service_id: string
          service_name: string
          settings?: Json | null
          status?: string
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          api_key_encrypted?: string | null
          created_at?: string
          id?: string
          last_tested_at?: string | null
          provider_id?: string
          service_id?: string
          service_name?: string
          settings?: Json | null
          status?: string
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integrations_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_pence: number
          booking_id: string
          created_at: string
          id: string
          payment_date: string
          payment_method: string | null
          status: string
          stripe_payment_id: string | null
        }
        Insert: {
          amount_pence: number
          booking_id: string
          created_at?: string
          id?: string
          payment_date?: string
          payment_method?: string | null
          status?: string
          stripe_payment_id?: string | null
        }
        Update: {
          amount_pence?: number
          booking_id?: string
          created_at?: string
          id?: string
          payment_date?: string
          payment_method?: string | null
          status?: string
          stripe_payment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          facility_id: string | null
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          facility_id?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          facility_id?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          attempts: number | null
          created_at: string | null
          id: string
          operation: string
          user_id: string
          window_start: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          id?: string
          operation: string
          user_id: string
          window_start?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          id?: string
          operation?: string
          user_id?: string
          window_start?: string | null
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      units: {
        Row: {
          created_at: string
          facility_id: string
          features: string[] | null
          floor_level: number | null
          height_metres: number | null
          id: string
          length_metres: number | null
          monthly_price_pence: number
          size_category: string
          status: string
          unit_number: string
          updated_at: string
          width_metres: number | null
        }
        Insert: {
          created_at?: string
          facility_id: string
          features?: string[] | null
          floor_level?: number | null
          height_metres?: number | null
          id?: string
          length_metres?: number | null
          monthly_price_pence: number
          size_category: string
          status?: string
          unit_number: string
          updated_at?: string
          width_metres?: number | null
        }
        Update: {
          created_at?: string
          facility_id?: string
          features?: string[] | null
          floor_level?: number | null
          height_metres?: number | null
          id?: string
          length_metres?: number | null
          monthly_price_pence?: number
          size_category?: string
          status?: string
          unit_number?: string
          updated_at?: string
          width_metres?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "units_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      facilities_public: {
        Row: {
          address: string | null
          created_at: string | null
          description: string | null
          id: string | null
          name: string | null
          postcode: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
          postcode?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
          postcode?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      facilities_safe_public: {
        Row: {
          address: string | null
          created_at: string | null
          description: string | null
          id: string | null
          name: string | null
          postcode: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
          postcode?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
          postcode?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      units_public_discovery: {
        Row: {
          available_count: number | null
          facility_id: string | null
          max_price_pence: number | null
          min_price_pence: number | null
          size_category: string | null
        }
        Relationships: [
          {
            foreignKeyName: "units_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      check_rate_limit_enhanced: {
        Args: {
          max_attempts?: number
          operation_type: string
          window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_old_rate_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_monthly_payments: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_current_user_provider_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role_safe: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_facility_by_subdomain: {
        Args: { subdomain_input: string }
        Returns: string
      }
      get_user_role_enhanced: {
        Args: { user_uuid?: string }
        Returns: string
      }
      log_sensitive_access: {
        Args: {
          action_type: string
          details?: Json
          record_id?: string
          table_name: string
        }
        Returns: undefined
      }
      update_payment_statuses: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      user_has_active_booking_in_facility: {
        Args: { facility_uuid: string }
        Returns: boolean
      }
      validate_integration_access: {
        Args: { integration_uuid: string }
        Returns: boolean
      }
      validate_user_facility_access: {
        Args: { facility_uuid: string }
        Returns: boolean
      }
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
