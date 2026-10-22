export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      goal_roadmaps: {
        Row: {
          goal_id: string;
          roadmap_id: string;
        };
        ComputedFields: never;
        Insert: {
          goal_id: string;
          roadmap_id: string;
        };
        Update: {
          goal_id?: string;
          roadmap_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "goal_roadmaps_goal_id_fkey";
            columns: ["goal_id"];
            isOneToOne: false;
            referencedRelation: "learning_goals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "goal_roadmaps_roadmap_id_fkey";
            columns: ["roadmap_id"];
            isOneToOne: false;
            referencedRelation: "roadmaps";
            referencedColumns: ["id"];
          },
        ];
      };
      learning_activities: {
        Row: {
          entity_id: string | null;
          id: string;
          metadata: Json | null;
          occurred_at: string;
          type: Database["public"]["Enums"]["ActivityType"];
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          entity_id?: string | null;
          id: string;
          metadata?: Json | null;
          occurred_at?: string;
          type: Database["public"]["Enums"]["ActivityType"];
          user_id: string;
        };
        Update: {
          entity_id?: string | null;
          id?: string;
          metadata?: Json | null;
          occurred_at?: string;
          type?: Database["public"]["Enums"]["ActivityType"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "learning_activities_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      learning_goals: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          priority: number;
          status: Database["public"]["Enums"]["GoalStatus"];
          target_date: string | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          description?: string | null;
          id: string;
          priority?: number;
          status?: Database["public"]["Enums"]["GoalStatus"];
          target_date?: string | null;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          priority?: number;
          status?: Database["public"]["Enums"]["GoalStatus"];
          target_date?: string | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "learning_goals_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      notes: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          resource_id: string | null;
          step_id: string | null;
          tags: string[];
          title: string;
          updated_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          content: string;
          created_at?: string;
          id: string;
          resource_id?: string | null;
          step_id?: string | null;
          tags?: string[];
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          resource_id?: string | null;
          step_id?: string | null;
          tags?: string[];
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notes_resource_id_fkey";
            columns: ["resource_id"];
            isOneToOne: false;
            referencedRelation: "resources";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notes_step_id_fkey";
            columns: ["step_id"];
            isOneToOne: false;
            referencedRelation: "roadmap_steps";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      resources: {
        Row: {
          author: string | null;
          category: string | null;
          created_at: string;
          description: string | null;
          file_path: string | null;
          goal_id: string | null;
          id: string;
          is_archived: boolean;
          title: string;
          type: Database["public"]["Enums"]["ResourceType"];
          updated_at: string;
          url: string | null;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          author?: string | null;
          category?: string | null;
          created_at?: string;
          description?: string | null;
          file_path?: string | null;
          goal_id?: string | null;
          id: string;
          is_archived?: boolean;
          title: string;
          type: Database["public"]["Enums"]["ResourceType"];
          updated_at?: string;
          url?: string | null;
          user_id: string;
        };
        Update: {
          author?: string | null;
          category?: string | null;
          created_at?: string;
          description?: string | null;
          file_path?: string | null;
          goal_id?: string | null;
          id?: string;
          is_archived?: boolean;
          title?: string;
          type?: Database["public"]["Enums"]["ResourceType"];
          updated_at?: string;
          url?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "resources_goal_id_fkey";
            columns: ["goal_id"];
            isOneToOne: false;
            referencedRelation: "learning_goals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "resources_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      roadmap_steps: {
        Row: {
          completed_at: string | null;
          created_at: string;
          description: string | null;
          id: string;
          order: number;
          roadmap_id: string;
          status: Database["public"]["Enums"]["RoadmapStepStatus"];
          title: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          description?: string | null;
          id: string;
          order: number;
          roadmap_id: string;
          status?: Database["public"]["Enums"]["RoadmapStepStatus"];
          title: string;
          updated_at?: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          order?: number;
          roadmap_id?: string;
          status?: Database["public"]["Enums"]["RoadmapStepStatus"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "roadmap_steps_roadmap_id_fkey";
            columns: ["roadmap_id"];
            isOneToOne: false;
            referencedRelation: "roadmaps";
            referencedColumns: ["id"];
          },
        ];
      };
      roadmaps: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          progress_percent: number;
          title: string;
          updated_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          description?: string | null;
          id: string;
          progress_percent?: number;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          progress_percent?: number;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "roadmaps_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      step_resources: {
        Row: {
          resource_id: string;
          step_id: string;
        };
        ComputedFields: never;
        Insert: {
          resource_id: string;
          step_id: string;
        };
        Update: {
          resource_id?: string;
          step_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "step_resources_resource_id_fkey";
            columns: ["resource_id"];
            isOneToOne: false;
            referencedRelation: "resources";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "step_resources_step_id_fkey";
            columns: ["step_id"];
            isOneToOne: false;
            referencedRelation: "roadmap_steps";
            referencedColumns: ["id"];
          },
        ];
      };
      summaries: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          key_points: string[];
          model: string | null;
          resource_id: string | null;
          updated_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          content: string;
          created_at?: string;
          id: string;
          key_points?: string[];
          model?: string | null;
          resource_id?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          key_points?: string[];
          model?: string | null;
          resource_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "summaries_resource_id_fkey";
            columns: ["resource_id"];
            isOneToOne: false;
            referencedRelation: "resources";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "summaries_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          created_at: string;
          email: string | null;
          id: string;
          name: string | null;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          email?: string | null;
          id: string;
          name?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          id?: string;
          name?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_roadmap_step: {
        Args: {
          p_roadmap_id: string;
          p_title: string;
          p_description: string | null;
          p_order: number | null;
        };
        Returns: Json;
      };
      reorder_roadmap_steps: {
        Args: {
          p_roadmap_id: string;
          p_steps: Json;
        };
        Returns: void;
      };
      delete_and_reorder_roadmap_step: {
        Args: {
          p_roadmap_id: string;
          p_step_id: string;
        };
        Returns: void;
      };
    };
    Enums: {
      ActivityType:
        | "GOAL_CREATED"
        | "GOAL_UPDATED"
        | "STEP_COMPLETED"
        | "RESOURCE_ADDED"
        | "NOTE_CREATED"
        | "SUMMARY_GENERATED"
        | "STUDY_SESSION";
      GoalStatus: "ACTIVE" | "COMPLETED" | "ARCHIVED";
      ResourceType: "PDF" | "VIDEO" | "WEBSITE" | "BOOK" | "COURSE";
      RoadmapStepStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      ActivityType: [
        "GOAL_CREATED",
        "GOAL_UPDATED",
        "STEP_COMPLETED",
        "RESOURCE_ADDED",
        "NOTE_CREATED",
        "SUMMARY_GENERATED",
        "STUDY_SESSION",
      ],
      GoalStatus: ["ACTIVE", "COMPLETED", "ARCHIVED"],
      ResourceType: ["PDF", "VIDEO", "WEBSITE", "BOOK", "COURSE"],
      RoadmapStepStatus: ["PENDING", "IN_PROGRESS", "COMPLETED"],
    },
  },
} as const;
