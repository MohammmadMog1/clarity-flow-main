// Hand-maintained to mirror supabase/migrations/*.sql (no live DB codegen in this environment).
// Keep in sync whenever a migration changes table shape.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          role: "user" | "admin";
          status: "active" | "suspended";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: "user" | "admin";
          status?: "active" | "suspended";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: "user" | "admin";
          status?: "active" | "suspended";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          body: string;
          level: "info" | "success" | "warning";
          created_by: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          body: string;
          level?: "info" | "success" | "warning";
          created_by?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          body?: string;
          level?: "info" | "success" | "warning";
          created_by?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      announcement_reads: {
        Row: {
          announcement_id: string;
          user_id: string;
          read_at: string;
        };
        Insert: {
          announcement_id: string;
          user_id: string;
          read_at?: string;
        };
        Update: {
          announcement_id?: string;
          user_id?: string;
          read_at?: string;
        };
        Relationships: [];
      };
      app_settings: {
        Row: {
          user_id: string;
          weekly_goal: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          weekly_goal?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          weekly_goal?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          color: string;
          created_at: string;
          icon: string;
          id: string;
          name: string;
          user_id: string;
        };
        Insert: {
          color: string;
          created_at?: string;
          icon: string;
          id: string;
          name: string;
          user_id: string;
        };
        Update: {
          color?: string;
          created_at?: string;
          icon?: string;
          id?: string;
          name?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      daily_reviews: {
        Row: {
          completed_task_ids: Json;
          date: string;
          notes: string;
          productivity: number;
          rating: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          completed_task_ids?: Json;
          date: string;
          notes?: string;
          productivity?: number;
          rating?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          completed_task_ids?: Json;
          date?: string;
          notes?: string;
          productivity?: number;
          rating?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      monthly_goals: {
        Row: {
          category_id: string | null;
          created_at: string;
          done: boolean;
          id: string;
          month: string;
          progress: number;
          title: string;
          user_id: string;
        };
        Insert: {
          category_id?: string | null;
          created_at?: string;
          done?: boolean;
          id: string;
          month: string;
          progress?: number;
          title: string;
          user_id: string;
        };
        Update: {
          category_id?: string | null;
          created_at?: string;
          done?: boolean;
          id?: string;
          month?: string;
          progress?: number;
          title?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          category_id: string;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
          description: string | null;
          difficulty: string;
          due_date: string | null;
          estimated_minutes: number;
          focus: boolean;
          id: string;
          notes: string | null;
          order: number;
          planned_date: string | null;
          priority: string;
          subtasks: Json;
          title: string;
          user_id: string;
        };
        Insert: {
          category_id: string;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          description?: string | null;
          difficulty?: string;
          due_date?: string | null;
          estimated_minutes?: number;
          focus?: boolean;
          id: string;
          notes?: string | null;
          order?: number;
          planned_date?: string | null;
          priority?: string;
          subtasks?: Json;
          title: string;
          user_id: string;
        };
        Update: {
          category_id?: string;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          description?: string | null;
          difficulty?: string;
          due_date?: string | null;
          estimated_minutes?: number;
          focus?: boolean;
          id?: string;
          notes?: string | null;
          order?: number;
          planned_date?: string | null;
          priority?: string;
          subtasks?: Json;
          title?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_active: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
