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
  public: {
    Tables: {
      agent_coaching_stats: {
        Row: {
          agent_id: string
          avg_call_duration: number | null
          avg_sentiment_score: number | null
          coaching_score: number | null
          conversion_rate: number | null
          created_at: string
          id: string
          keywords_handled: number | null
          period_end: string
          period_start: string
          talk_tracks_used: number | null
          total_calls: number | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          avg_call_duration?: number | null
          avg_sentiment_score?: number | null
          coaching_score?: number | null
          conversion_rate?: number | null
          created_at?: string
          id?: string
          keywords_handled?: number | null
          period_end: string
          period_start: string
          talk_tracks_used?: number | null
          total_calls?: number | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          avg_call_duration?: number | null
          avg_sentiment_score?: number | null
          coaching_score?: number | null
          conversion_rate?: number | null
          created_at?: string
          id?: string
          keywords_handled?: number | null
          period_end?: string
          period_start?: string
          talk_tracks_used?: number | null
          total_calls?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      call_coaching_events: {
        Row: {
          agent_action: string | null
          call_id: string
          created_at: string
          event_type: string
          id: string
          keyword_detected: string | null
          prompt_shown: string | null
          talk_track_id: string | null
          timestamp: string | null
        }
        Insert: {
          agent_action?: string | null
          call_id: string
          created_at?: string
          event_type: string
          id?: string
          keyword_detected?: string | null
          prompt_shown?: string | null
          talk_track_id?: string | null
          timestamp?: string | null
        }
        Update: {
          agent_action?: string | null
          call_id?: string
          created_at?: string
          event_type?: string
          id?: string
          keyword_detected?: string | null
          prompt_shown?: string | null
          talk_track_id?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_coaching_events_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
        ]
      }
      calls: {
        Row: {
          agent_id: string | null
          call_type: string | null
          coaching_prompts_shown: string[] | null
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          detected_keywords: string[] | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          notes: string | null
          outcome: Database["public"]["Enums"]["call_outcome"] | null
          sentiment_score: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["call_status"] | null
          talk_tracks_used: string[] | null
          transcript: string | null
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          call_type?: string | null
          coaching_prompts_shown?: string[] | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          detected_keywords?: string[] | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          outcome?: Database["public"]["Enums"]["call_outcome"] | null
          sentiment_score?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["call_status"] | null
          talk_tracks_used?: string[] | null
          transcript?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          call_type?: string | null
          coaching_prompts_shown?: string[] | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          detected_keywords?: string[] | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          outcome?: Database["public"]["Enums"]["call_outcome"] | null
          sentiment_score?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["call_status"] | null
          talk_tracks_used?: string[] | null
          transcript?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      conversation_memberships: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_memberships_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_group: boolean | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_group?: boolean | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_group?: boolean | null
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          sender_id: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          sender_id?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          sender_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          is_online: boolean | null
          last_seen: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id: string
          is_online?: boolean | null
          last_seen?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          is_online?: boolean | null
          last_seen?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      read_receipts: {
        Row: {
          id: string
          message_id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          message_id: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          message_id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "read_receipts_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_conversation_creator: { Args: { conv_id: string }; Returns: boolean }
      is_conversation_member: { Args: { conv_id: string }; Returns: boolean }
    }
    Enums: {
      call_outcome:
        | "booked"
        | "follow_up"
        | "lost"
        | "no_answer"
        | "callback_scheduled"
      call_status: "active" | "completed" | "missed" | "transferred"
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
    Enums: {
      call_outcome: [
        "booked",
        "follow_up",
        "lost",
        "no_answer",
        "callback_scheduled",
      ],
      call_status: ["active", "completed", "missed", "transferred"],
    },
  },
} as const
