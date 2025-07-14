export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      coaches: {
        Row: {
          created_at: string | null
          defense_specialty: number | null
          first_name: string
          id: string
          last_name: string
          league_id: string
          line_management: number | null
          motivation: number | null
          nationality: string | null
          offense_specialty: number | null
          penalty_kill_specialty: number | null
          powerplay_specialty: number | null
          team_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          defense_specialty?: number | null
          first_name: string
          id?: string
          last_name: string
          league_id: string
          line_management?: number | null
          motivation?: number | null
          nationality?: string | null
          offense_specialty?: number | null
          penalty_kill_specialty?: number | null
          powerplay_specialty?: number | null
          team_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          defense_specialty?: number | null
          first_name?: string
          id?: string
          last_name?: string
          league_id?: string
          line_management?: number | null
          motivation?: number | null
          nationality?: string | null
          offense_specialty?: number | null
          penalty_kill_specialty?: number | null
          powerplay_specialty?: number | null
          team_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coaches_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaches_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      game_periods: {
        Row: {
          away_goals: number | null
          away_shots: number | null
          created_at: string | null
          game_id: string
          home_goals: number | null
          home_shots: number | null
          id: string
          period: number
        }
        Insert: {
          away_goals?: number | null
          away_shots?: number | null
          created_at?: string | null
          game_id: string
          home_goals?: number | null
          home_shots?: number | null
          id?: string
          period: number
        }
        Update: {
          away_goals?: number | null
          away_shots?: number | null
          created_at?: string | null
          game_id?: string
          home_goals?: number | null
          home_shots?: number | null
          id?: string
          period?: number
        }
        Relationships: [
          {
            foreignKeyName: "game_periods_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          away_score: number | null
          away_shots: number | null
          away_team_id: string
          created_at: string | null
          game_date: string
          game_time: string | null
          home_score: number | null
          home_shots: number | null
          home_team_id: string
          id: string
          league_id: string
          overtime_winner: string | null
          shootout_winner: string | null
          status: Database["public"]["Enums"]["game_status"] | null
          updated_at: string | null
        }
        Insert: {
          away_score?: number | null
          away_shots?: number | null
          away_team_id: string
          created_at?: string | null
          game_date: string
          game_time?: string | null
          home_score?: number | null
          home_shots?: number | null
          home_team_id: string
          id?: string
          league_id: string
          overtime_winner?: string | null
          shootout_winner?: string | null
          status?: Database["public"]["Enums"]["game_status"] | null
          updated_at?: string | null
        }
        Update: {
          away_score?: number | null
          away_shots?: number | null
          away_team_id?: string
          created_at?: string | null
          game_date?: string
          game_time?: string | null
          home_score?: number | null
          home_shots?: number | null
          home_team_id?: string
          id?: string
          league_id?: string
          overtime_winner?: string | null
          shootout_winner?: string | null
          status?: Database["public"]["Enums"]["game_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "games_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_overtime_winner_fkey"
            columns: ["overtime_winner"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_shootout_winner_fkey"
            columns: ["shootout_winner"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      leagues: {
        Row: {
          commissioner_id: string | null
          created_at: string | null
          games_per_team: number | null
          id: string
          is_active: boolean | null
          league_type: Database["public"]["Enums"]["league_type"]
          max_age: number | null
          min_age: number | null
          name: string
          salary_cap: number | null
          season_start_date: string | null
          updated_at: string | null
        }
        Insert: {
          commissioner_id?: string | null
          created_at?: string | null
          games_per_team?: number | null
          id?: string
          is_active?: boolean | null
          league_type: Database["public"]["Enums"]["league_type"]
          max_age?: number | null
          min_age?: number | null
          name: string
          salary_cap?: number | null
          season_start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          commissioner_id?: string | null
          created_at?: string | null
          games_per_team?: number | null
          id?: string
          is_active?: boolean | null
          league_type?: Database["public"]["Enums"]["league_type"]
          max_age?: number | null
          min_age?: number | null
          name?: string
          salary_cap?: number | null
          season_start_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      player_contracts: {
        Row: {
          contract_length: number
          contract_year: number
          created_at: string
          id: string
          league_id: string
          player_id: string
          salary: number
          signed_date: string
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          contract_length?: number
          contract_year?: number
          created_at?: string
          id?: string
          league_id: string
          player_id: string
          salary?: number
          signed_date?: string
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          contract_length?: number
          contract_year?: number
          created_at?: string
          id?: string
          league_id?: string
          player_id?: string
          salary?: number
          signed_date?: string
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      player_injuries: {
        Row: {
          created_at: string
          expected_return_date: string | null
          id: string
          injury_date: string
          injury_type: string
          is_active: boolean
          player_id: string
          severity: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expected_return_date?: string | null
          id?: string
          injury_date?: string
          injury_type: string
          is_active?: boolean
          player_id: string
          severity?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expected_return_date?: string | null
          id?: string
          injury_date?: string
          injury_type?: string
          is_active?: boolean
          player_id?: string
          severity?: string
          updated_at?: string
        }
        Relationships: []
      }
      players: {
        Row: {
          age: number
          aggressiveness: number | null
          checking: number | null
          created_at: string | null
          defense: number | null
          discipline: number | null
          fatigue: number | null
          fighting: number | null
          first_name: string
          flexibility: number | null
          id: string
          injury_resistance: number | null
          last_name: string
          league_id: string
          movement: number | null
          nationality: string | null
          overall_rating: number | null
          passing: number | null
          player_position: Database["public"]["Enums"]["player_position"]
          poise: number | null
          puck_control: number | null
          rebound_control: number | null
          shooting: number | null
          status: Database["public"]["Enums"]["player_status"] | null
          team_id: string | null
          updated_at: string | null
          vision: number | null
        }
        Insert: {
          age: number
          aggressiveness?: number | null
          checking?: number | null
          created_at?: string | null
          defense?: number | null
          discipline?: number | null
          fatigue?: number | null
          fighting?: number | null
          first_name: string
          flexibility?: number | null
          id?: string
          injury_resistance?: number | null
          last_name: string
          league_id: string
          movement?: number | null
          nationality?: string | null
          overall_rating?: number | null
          passing?: number | null
          player_position: Database["public"]["Enums"]["player_position"]
          poise?: number | null
          puck_control?: number | null
          rebound_control?: number | null
          shooting?: number | null
          status?: Database["public"]["Enums"]["player_status"] | null
          team_id?: string | null
          updated_at?: string | null
          vision?: number | null
        }
        Update: {
          age?: number
          aggressiveness?: number | null
          checking?: number | null
          created_at?: string | null
          defense?: number | null
          discipline?: number | null
          fatigue?: number | null
          fighting?: number | null
          first_name?: string
          flexibility?: number | null
          id?: string
          injury_resistance?: number | null
          last_name?: string
          league_id?: string
          movement?: number | null
          nationality?: string | null
          overall_rating?: number | null
          passing?: number | null
          player_position?: Database["public"]["Enums"]["player_position"]
          poise?: number | null
          puck_control?: number | null
          rebound_control?: number | null
          shooting?: number | null
          status?: Database["public"]["Enums"]["player_status"] | null
          team_id?: string | null
          updated_at?: string | null
          vision?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "players_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      team_lines: {
        Row: {
          created_at: string
          id: string
          league_id: string
          line_order: number
          line_type: string
          player_id: string
          position: string
          team_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          league_id: string
          line_order?: number
          line_type: string
          player_id: string
          position: string
          team_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          league_id?: string
          line_order?: number
          line_type?: string
          player_id?: string
          position?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_strategy: {
        Row: {
          created_at: string
          defensive_pressure: number
          forecheck_intensity: number
          id: string
          league_id: string
          line_matching: boolean
          offensive_style: number
          pk_style: string
          pp_style: string
          pull_goalie_threshold: number
          team_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          defensive_pressure?: number
          forecheck_intensity?: number
          id?: string
          league_id: string
          line_matching?: boolean
          offensive_style?: number
          pk_style?: string
          pp_style?: string
          pull_goalie_threshold?: number
          team_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          defensive_pressure?: number
          forecheck_intensity?: number
          id?: string
          league_id?: string
          line_matching?: boolean
          offensive_style?: number
          pk_style?: string
          pp_style?: string
          pull_goalie_threshold?: number
          team_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          abbreviation: string
          city: string
          conference: string | null
          created_at: string | null
          division: string | null
          gm_user_id: string | null
          id: string
          league_id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          abbreviation: string
          city: string
          conference?: string | null
          created_at?: string | null
          division?: string | null
          gm_user_id?: string | null
          id?: string
          league_id: string
          name: string
          updated_at?: string | null
        }
        Update: {
          abbreviation?: string
          city?: string
          conference?: string | null
          created_at?: string | null
          division?: string | null
          gm_user_id?: string | null
          id?: string
          league_id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_log: {
        Row: {
          created_at: string
          from_team_id: string | null
          id: string
          league_id: string
          player_id: string
          processed_by_user_id: string | null
          processed_date: string
          to_team_id: string | null
          transaction_details: Json | null
          transaction_type: string
        }
        Insert: {
          created_at?: string
          from_team_id?: string | null
          id?: string
          league_id: string
          player_id: string
          processed_by_user_id?: string | null
          processed_date?: string
          to_team_id?: string | null
          transaction_details?: Json | null
          transaction_type: string
        }
        Update: {
          created_at?: string
          from_team_id?: string | null
          id?: string
          league_id?: string
          player_id?: string
          processed_by_user_id?: string | null
          processed_date?: string
          to_team_id?: string | null
          transaction_details?: Json | null
          transaction_type?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_league: {
        Args: { _user_id: string; _league_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "commissioner" | "gm" | "user"
      game_status: "scheduled" | "in_progress" | "completed" | "postponed"
      league_type: "pro" | "farm" | "junior"
      player_position: "C" | "LW" | "RW" | "D" | "G"
      player_status: "active" | "injured" | "suspended" | "retired"
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
      app_role: ["admin", "commissioner", "gm", "user"],
      game_status: ["scheduled", "in_progress", "completed", "postponed"],
      league_type: ["pro", "farm", "junior"],
      player_position: ["C", "LW", "RW", "D", "G"],
      player_status: ["active", "injured", "suspended", "retired"],
    },
  },
} as const
