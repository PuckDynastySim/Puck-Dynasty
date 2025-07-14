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
      arena_infrastructure: {
        Row: {
          arena_quality_rating: number | null
          concession_stands: number | null
          created_at: string
          id: string
          league_id: string
          luxury_boxes: number | null
          medical_facilities_level: number | null
          seating_capacity: number | null
          team_id: string
          training_facilities_level: number | null
          updated_at: string
        }
        Insert: {
          arena_quality_rating?: number | null
          concession_stands?: number | null
          created_at?: string
          id?: string
          league_id: string
          luxury_boxes?: number | null
          medical_facilities_level?: number | null
          seating_capacity?: number | null
          team_id: string
          training_facilities_level?: number | null
          updated_at?: string
        }
        Update: {
          arena_quality_rating?: number | null
          concession_stands?: number | null
          created_at?: string
          id?: string
          league_id?: string
          luxury_boxes?: number | null
          medical_facilities_level?: number | null
          seating_capacity?: number | null
          team_id?: string
          training_facilities_level?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      career_milestones: {
        Row: {
          created_at: string
          description: string | null
          game_id: string | null
          id: string
          milestone_date: string
          milestone_type: string
          milestone_value: number | null
          player_id: string
          season_year: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          game_id?: string | null
          id?: string
          milestone_date?: string
          milestone_type: string
          milestone_value?: number | null
          player_id: string
          season_year?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          game_id?: string | null
          id?: string
          milestone_date?: string
          milestone_type?: string
          milestone_value?: number | null
          player_id?: string
          season_year?: number
        }
        Relationships: [
          {
            foreignKeyName: "career_milestones_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "career_milestones_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
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
      draft_history: {
        Row: {
          created_at: string
          draft_position: string
          draft_round: number
          draft_year: number
          id: string
          league_id: string
          overall_pick: number
          pick_number: number
          player_development_rating: number | null
          player_id: string
          team_id: string
        }
        Insert: {
          created_at?: string
          draft_position: string
          draft_round: number
          draft_year: number
          id?: string
          league_id: string
          overall_pick: number
          pick_number: number
          player_development_rating?: number | null
          player_id: string
          team_id: string
        }
        Update: {
          created_at?: string
          draft_position?: string
          draft_round?: number
          draft_year?: number
          id?: string
          league_id?: string
          overall_pick?: number
          pick_number?: number
          player_development_rating?: number | null
          player_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "draft_history_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draft_history_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draft_history_team_id_fkey"
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
      game_revenue: {
        Row: {
          attendance: number | null
          concession_revenue: number | null
          created_at: string
          game_id: string
          id: string
          luxury_boxes_sold: number | null
          team_id: string
          tickets_sold_lower: number | null
          tickets_sold_premium: number | null
          tickets_sold_upper: number | null
          total_ticket_revenue: number | null
        }
        Insert: {
          attendance?: number | null
          concession_revenue?: number | null
          created_at?: string
          game_id: string
          id?: string
          luxury_boxes_sold?: number | null
          team_id: string
          tickets_sold_lower?: number | null
          tickets_sold_premium?: number | null
          tickets_sold_upper?: number | null
          total_ticket_revenue?: number | null
        }
        Update: {
          attendance?: number | null
          concession_revenue?: number | null
          created_at?: string
          game_id?: string
          id?: string
          luxury_boxes_sold?: number | null
          team_id?: string
          tickets_sold_lower?: number | null
          tickets_sold_premium?: number | null
          tickets_sold_upper?: number | null
          total_ticket_revenue?: number | null
        }
        Relationships: []
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
      goalie_game_stats: {
        Row: {
          created_at: string
          game_id: string
          goals_against: number
          goals_against_average: number
          ice_time_seconds: number
          id: string
          league_id: string
          loss: boolean
          overtime_loss: boolean
          player_id: string
          save_percentage: number | null
          saves: number
          shots_faced: number
          shutout: boolean
          team_id: string
          updated_at: string
          win: boolean
        }
        Insert: {
          created_at?: string
          game_id: string
          goals_against?: number
          goals_against_average?: number
          ice_time_seconds?: number
          id?: string
          league_id: string
          loss?: boolean
          overtime_loss?: boolean
          player_id: string
          save_percentage?: number | null
          saves?: number
          shots_faced?: number
          shutout?: boolean
          team_id: string
          updated_at?: string
          win?: boolean
        }
        Update: {
          created_at?: string
          game_id?: string
          goals_against?: number
          goals_against_average?: number
          ice_time_seconds?: number
          id?: string
          league_id?: string
          loss?: boolean
          overtime_loss?: boolean
          player_id?: string
          save_percentage?: number | null
          saves?: number
          shots_faced?: number
          shutout?: boolean
          team_id?: string
          updated_at?: string
          win?: boolean
        }
        Relationships: []
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
      player_awards: {
        Row: {
          award_type: string
          created_at: string
          id: string
          league_id: string
          player_id: string
          season_year: number
          stats_snapshot: Json | null
          team_id: string
          voting_points: number | null
        }
        Insert: {
          award_type: string
          created_at?: string
          id?: string
          league_id: string
          player_id: string
          season_year?: number
          stats_snapshot?: Json | null
          team_id: string
          voting_points?: number | null
        }
        Update: {
          award_type?: string
          created_at?: string
          id?: string
          league_id?: string
          player_id?: string
          season_year?: number
          stats_snapshot?: Json | null
          team_id?: string
          voting_points?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "player_awards_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_awards_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_awards_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
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
      player_game_stats: {
        Row: {
          assists: number
          blocked_shots: number
          created_at: string
          faceoff_losses: number
          faceoff_wins: number
          game_id: string
          game_winner: boolean
          giveaways: number
          goals: number
          hits: number
          ice_time_seconds: number
          id: string
          league_id: string
          penalty_minutes: number
          player_id: string
          plus_minus: number
          points: number | null
          powerplay_assists: number
          powerplay_goals: number
          shorthanded_assists: number
          shorthanded_goals: number
          shots: number
          takeaways: number
          team_id: string
          updated_at: string
        }
        Insert: {
          assists?: number
          blocked_shots?: number
          created_at?: string
          faceoff_losses?: number
          faceoff_wins?: number
          game_id: string
          game_winner?: boolean
          giveaways?: number
          goals?: number
          hits?: number
          ice_time_seconds?: number
          id?: string
          league_id: string
          penalty_minutes?: number
          player_id: string
          plus_minus?: number
          points?: number | null
          powerplay_assists?: number
          powerplay_goals?: number
          shorthanded_assists?: number
          shorthanded_goals?: number
          shots?: number
          takeaways?: number
          team_id: string
          updated_at?: string
        }
        Update: {
          assists?: number
          blocked_shots?: number
          created_at?: string
          faceoff_losses?: number
          faceoff_wins?: number
          game_id?: string
          game_winner?: boolean
          giveaways?: number
          goals?: number
          hits?: number
          ice_time_seconds?: number
          id?: string
          league_id?: string
          penalty_minutes?: number
          player_id?: string
          plus_minus?: number
          points?: number | null
          powerplay_assists?: number
          powerplay_goals?: number
          shorthanded_assists?: number
          shorthanded_goals?: number
          shots?: number
          takeaways?: number
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
      player_season_stats: {
        Row: {
          assists: number
          average_ice_time_seconds: number
          blocked_shots: number
          created_at: string
          faceoff_losses: number
          faceoff_percentage: number | null
          faceoff_wins: number
          game_winners: number
          games_played: number
          giveaways: number
          goals: number
          hits: number
          id: string
          is_archived: boolean | null
          league_id: string
          penalty_minutes: number
          player_id: string
          plus_minus: number
          points: number | null
          powerplay_assists: number
          powerplay_goals: number
          powerplay_points: number | null
          season_year: number
          shooting_percentage: number | null
          shorthanded_assists: number
          shorthanded_goals: number
          shots: number
          takeaways: number
          team_id: string
          updated_at: string
        }
        Insert: {
          assists?: number
          average_ice_time_seconds?: number
          blocked_shots?: number
          created_at?: string
          faceoff_losses?: number
          faceoff_percentage?: number | null
          faceoff_wins?: number
          game_winners?: number
          games_played?: number
          giveaways?: number
          goals?: number
          hits?: number
          id?: string
          is_archived?: boolean | null
          league_id: string
          penalty_minutes?: number
          player_id: string
          plus_minus?: number
          points?: number | null
          powerplay_assists?: number
          powerplay_goals?: number
          powerplay_points?: number | null
          season_year?: number
          shooting_percentage?: number | null
          shorthanded_assists?: number
          shorthanded_goals?: number
          shots?: number
          takeaways?: number
          team_id: string
          updated_at?: string
        }
        Update: {
          assists?: number
          average_ice_time_seconds?: number
          blocked_shots?: number
          created_at?: string
          faceoff_losses?: number
          faceoff_percentage?: number | null
          faceoff_wins?: number
          game_winners?: number
          games_played?: number
          giveaways?: number
          goals?: number
          hits?: number
          id?: string
          is_archived?: boolean | null
          league_id?: string
          penalty_minutes?: number
          player_id?: string
          plus_minus?: number
          points?: number | null
          powerplay_assists?: number
          powerplay_goals?: number
          powerplay_points?: number | null
          season_year?: number
          shooting_percentage?: number | null
          shorthanded_assists?: number
          shorthanded_goals?: number
          shots?: number
          takeaways?: number
          team_id?: string
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
      power_rankings: {
        Row: {
          created_at: string
          id: string
          league_id: string
          previous_ranking: number | null
          ranking: number
          ranking_reason: string | null
          rating_score: number
          season_year: number
          team_id: string
          trend: string
          week_number: number
        }
        Insert: {
          created_at?: string
          id?: string
          league_id: string
          previous_ranking?: number | null
          ranking: number
          ranking_reason?: string | null
          rating_score?: number
          season_year?: number
          team_id: string
          trend?: string
          week_number: number
        }
        Update: {
          created_at?: string
          id?: string
          league_id?: string
          previous_ranking?: number | null
          ranking?: number
          ranking_reason?: string | null
          rating_score?: number
          season_year?: number
          team_id?: string
          trend?: string
          week_number?: number
        }
        Relationships: []
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
      season_archives: {
        Row: {
          archived_at: string
          champion_team_id: string | null
          created_at: string
          end_date: string | null
          id: string
          league_id: string
          season_year: number
          start_date: string | null
          status: string
          total_games_played: number | null
          total_players: number | null
        }
        Insert: {
          archived_at?: string
          champion_team_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          league_id: string
          season_year: number
          start_date?: string | null
          status?: string
          total_games_played?: number | null
          total_players?: number | null
        }
        Update: {
          archived_at?: string
          champion_team_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          league_id?: string
          season_year?: number
          start_date?: string | null
          status?: string
          total_games_played?: number | null
          total_players?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "season_archives_champion_team_id_fkey"
            columns: ["champion_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "season_archives_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      season_champions: {
        Row: {
          champion_team_id: string
          championship_date: string | null
          created_at: string
          id: string
          league_id: string
          playoff_series_length: number | null
          runner_up_team_id: string | null
          season_year: number
        }
        Insert: {
          champion_team_id: string
          championship_date?: string | null
          created_at?: string
          id?: string
          league_id: string
          playoff_series_length?: number | null
          runner_up_team_id?: string | null
          season_year?: number
        }
        Update: {
          champion_team_id?: string
          championship_date?: string | null
          created_at?: string
          id?: string
          league_id?: string
          playoff_series_length?: number | null
          runner_up_team_id?: string | null
          season_year?: number
        }
        Relationships: [
          {
            foreignKeyName: "season_champions_champion_team_id_fkey"
            columns: ["champion_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "season_champions_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "season_champions_runner_up_team_id_fkey"
            columns: ["runner_up_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_finances: {
        Row: {
          arena_expenses: number | null
          budget: number | null
          concession_revenue: number | null
          created_at: string
          expenses_total: number | null
          id: string
          league_id: string
          revenue_total: number | null
          season_year: number
          sponsorship_revenue: number | null
          team_id: string
          ticket_revenue: number | null
          training_expenses: number | null
          updated_at: string
        }
        Insert: {
          arena_expenses?: number | null
          budget?: number | null
          concession_revenue?: number | null
          created_at?: string
          expenses_total?: number | null
          id?: string
          league_id: string
          revenue_total?: number | null
          season_year?: number
          sponsorship_revenue?: number | null
          team_id: string
          ticket_revenue?: number | null
          training_expenses?: number | null
          updated_at?: string
        }
        Update: {
          arena_expenses?: number | null
          budget?: number | null
          concession_revenue?: number | null
          created_at?: string
          expenses_total?: number | null
          id?: string
          league_id?: string
          revenue_total?: number | null
          season_year?: number
          sponsorship_revenue?: number | null
          team_id?: string
          ticket_revenue?: number | null
          training_expenses?: number | null
          updated_at?: string
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
      team_standings: {
        Row: {
          created_at: string
          eliminated_round: string | null
          faceoff_losses: number
          faceoff_wins: number
          final_ranking: number | null
          games_played: number | null
          goal_differential: number | null
          goals_against: number
          goals_for: number
          id: string
          is_archived: boolean | null
          league_id: string
          losses: number
          overtime_losses: number
          penalty_kill_goals_against: number
          penalty_kill_opportunities: number
          playoff_position: number | null
          points: number | null
          powerplay_goals: number
          powerplay_opportunities: number
          season_year: number
          shots_against: number
          shots_for: number
          team_id: string
          updated_at: string
          wins: number
        }
        Insert: {
          created_at?: string
          eliminated_round?: string | null
          faceoff_losses?: number
          faceoff_wins?: number
          final_ranking?: number | null
          games_played?: number | null
          goal_differential?: number | null
          goals_against?: number
          goals_for?: number
          id?: string
          is_archived?: boolean | null
          league_id: string
          losses?: number
          overtime_losses?: number
          penalty_kill_goals_against?: number
          penalty_kill_opportunities?: number
          playoff_position?: number | null
          points?: number | null
          powerplay_goals?: number
          powerplay_opportunities?: number
          season_year?: number
          shots_against?: number
          shots_for?: number
          team_id: string
          updated_at?: string
          wins?: number
        }
        Update: {
          created_at?: string
          eliminated_round?: string | null
          faceoff_losses?: number
          faceoff_wins?: number
          final_ranking?: number | null
          games_played?: number | null
          goal_differential?: number | null
          goals_against?: number
          goals_for?: number
          id?: string
          is_archived?: boolean | null
          league_id?: string
          losses?: number
          overtime_losses?: number
          penalty_kill_goals_against?: number
          penalty_kill_opportunities?: number
          playoff_position?: number | null
          points?: number | null
          powerplay_goals?: number
          powerplay_opportunities?: number
          season_year?: number
          shots_against?: number
          shots_for?: number
          team_id?: string
          updated_at?: string
          wins?: number
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
          is_ai_controlled: boolean
          league_id: string
          name: string
          parent_team_id: string | null
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
          is_ai_controlled?: boolean
          league_id: string
          name: string
          parent_team_id?: string | null
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
          is_ai_controlled?: boolean
          league_id?: string
          name?: string
          parent_team_id?: string | null
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
          {
            foreignKeyName: "teams_parent_team_id_fkey"
            columns: ["parent_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_pricing: {
        Row: {
          created_at: string
          id: string
          league_id: string
          lower_bowl_price: number | null
          luxury_box_price: number | null
          premium_price: number | null
          season_year: number
          team_id: string
          updated_at: string
          upper_bowl_price: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          league_id: string
          lower_bowl_price?: number | null
          luxury_box_price?: number | null
          premium_price?: number | null
          season_year?: number
          team_id: string
          updated_at?: string
          upper_bowl_price?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          league_id?: string
          lower_bowl_price?: number | null
          luxury_box_price?: number | null
          premium_price?: number | null
          season_year?: number
          team_id?: string
          updated_at?: string
          upper_bowl_price?: number | null
        }
        Relationships: []
      }
      trade_block: {
        Row: {
          asking_price: string | null
          available_until: string | null
          created_at: string
          id: string
          league_id: string
          notes: string | null
          player_id: string
          priority: string
          status: string
          team_id: string
          trade_interest: string | null
          updated_at: string
        }
        Insert: {
          asking_price?: string | null
          available_until?: string | null
          created_at?: string
          id?: string
          league_id: string
          notes?: string | null
          player_id: string
          priority?: string
          status?: string
          team_id: string
          trade_interest?: string | null
          updated_at?: string
        }
        Update: {
          asking_price?: string | null
          available_until?: string | null
          created_at?: string
          id?: string
          league_id?: string
          notes?: string | null
          player_id?: string
          priority?: string
          status?: string
          team_id?: string
          trade_interest?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      training_programs: {
        Row: {
          active: boolean | null
          annual_cost: number
          created_at: string
          effectiveness_bonus: number | null
          id: string
          investment_level: number | null
          league_id: string
          program_type: string
          team_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          annual_cost: number
          created_at?: string
          effectiveness_bonus?: number | null
          id?: string
          investment_level?: number | null
          league_id: string
          program_type: string
          team_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          annual_cost?: number
          created_at?: string
          effectiveness_bonus?: number | null
          id?: string
          investment_level?: number | null
          league_id?: string
          program_type?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: []
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
      waiver_wire: {
        Row: {
          claim_deadline: string
          claimed_at: string | null
          claimed_by_team_id: string | null
          created_at: string
          id: string
          league_id: string
          placed_by_team_id: string | null
          player_id: string
          reason: string | null
          status: string
          updated_at: string
          waiver_priority: number
        }
        Insert: {
          claim_deadline: string
          claimed_at?: string | null
          claimed_by_team_id?: string | null
          created_at?: string
          id?: string
          league_id: string
          placed_by_team_id?: string | null
          player_id: string
          reason?: string | null
          status?: string
          updated_at?: string
          waiver_priority?: number
        }
        Update: {
          claim_deadline?: string
          claimed_at?: string | null
          claimed_by_team_id?: string | null
          created_at?: string
          id?: string
          league_id?: string
          placed_by_team_id?: string | null
          player_id?: string
          reason?: string | null
          status?: string
          updated_at?: string
          waiver_priority?: number
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
      get_organization_teams: {
        Args: { _team_id: string }
        Returns: {
          team_id: string
          team_name: string
          league_type: Database["public"]["Enums"]["league_type"]
          is_parent: boolean
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_draft_eligible: {
        Args: { _player_age: number }
        Returns: boolean
      }
      validate_player_league_age: {
        Args: {
          _player_age: number
          _league_type: Database["public"]["Enums"]["league_type"]
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
